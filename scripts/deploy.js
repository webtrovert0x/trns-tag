// scripts/deploy.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createWalletClient, createPublicClient, http, defineChain, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define BotChain Mainnet (Chain ID: 677)
export const botchainMainnet = defineChain({
  id: 677,
  name: 'BotChain Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BOT',
    symbol: 'BOT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.botchain.ai'],
    },
    public: {
      http: ['https://rpc.botchain.ai'],
    },
  },
  blockExplorers: {
    default: { name: 'BotChainScan', url: 'https://scan.botchain.ai' },
  },
  testnet: false,
});

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey || !privateKey.trim()) {
    console.error('Error: PRIVATE_KEY is not defined in .env');
    console.error('Please add your deployment private key to .env: PRIVATE_KEY=0x...');
    process.exit(1);
  }

  const cleanKey = privateKey.trim();
  const formattedKey = cleanKey.startsWith('0x') ? cleanKey : `0x${cleanKey}`;
  const account = privateKeyToAccount(formattedKey);

  console.log(`=======================================================`);
  console.log(`🚀 DEPLOYING TO BOTCHAIN MAINNET (Chain ID: 677)`);
  console.log(`=======================================================`);
  console.log(`Deployer address : ${account.address}`);

  const publicClient = createPublicClient({
    chain: botchainMainnet,
    transport: http('https://rpc.botchain.ai'),
  });

  const walletClient = createWalletClient({
    account,
    chain: botchainMainnet,
    transport: http('https://rpc.botchain.ai'),
  });

  const balance = await publicClient.getBalance({ address: account.address });
  const balanceFormatted = formatEther(balance);
  console.log(`Account balance  : ${balanceFormatted} BOT`);

  const artifactPath = path.resolve(__dirname, '../src/contracts/TransactionTagRegistry.json');
  if (!fs.existsSync(artifactPath)) {
    console.log('Artifact not found, compiling first...');
    const { execSync } = await import('child_process');
    execSync('node scripts/compile.js', { stdio: 'inherit' });
  }

  const { abi, bytecode } = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  // 1. Fetch current gas price from BotChain Mainnet RPC
  const currentGasPrice = await publicClient.getGasPrice();
  const gasPriceGwei = Number(currentGasPrice) / 1e9;
  console.log(`Current Gas Price: ${gasPriceGwei.toFixed(2)} Gwei (${currentGasPrice} wei)`);

  // 2. Gas Estimation to avoid wasting gas
  console.log('Estimating deployment gas...');
  const deployBytecode = `0x${bytecode}`;
  let estimatedGas;
  try {
    estimatedGas = await publicClient.estimateGas({
      account,
      data: deployBytecode,
    });
  } catch (err) {
    console.warn('Estimate gas fallback (using 2,800,000 gas limit)...');
    estimatedGas = 2800000n;
  }

  // Add modest 5% buffer for safety without inflating fees
  const gasLimit = (estimatedGas * 105n) / 100n;
  const estimatedCostWei = gasLimit * currentGasPrice;
  const estimatedCostBOT = formatEther(estimatedCostWei);

  console.log(`Estimated Gas    : ${estimatedGas.toString()} units`);
  console.log(`Gas Limit Set    : ${gasLimit.toString()} units (optimized)`);
  console.log(`Estimated Fee    : ~${estimatedCostBOT} BOT`);

  if (balance < estimatedCostWei) {
    console.error(`\n❌ Insufficient balance!`);
    console.error(`Required: ~${estimatedCostBOT} BOT | Available: ${balanceFormatted} BOT`);
    process.exit(1);
  }

  console.log('\nSubmitting deployment transaction to BotChain Mainnet...');

  const hash = await walletClient.deployContract({
    abi,
    bytecode: deployBytecode,
    gas: gasLimit,
    gasPrice: currentGasPrice,
  });

  console.log(`Transaction sent! Hash: ${hash}`);
  console.log(`Explorer: https://scan.botchain.ai/tx/${hash}`);
  console.log('Waiting for block confirmation on BotChain...');

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const contractAddress = receipt.contractAddress;
  const actualGasUsed = receipt.gasUsed;
  const actualFeeBOT = formatEther(actualGasUsed * currentGasPrice);

  console.log(`\n🎉 TransactionTagRegistry deployed to BotChain Mainnet!`);
  console.log(`Contract Address : ${contractAddress}`);
  console.log(`Actual Gas Used  : ${actualGasUsed.toString()} units`);
  console.log(`Actual Cost Paid : ${actualFeeBOT} BOT`);
  console.log(`Explorer Link    : https://scan.botchain.ai/address/${contractAddress}`);

  // Automatically update contract.json for the frontend
  const configDir = path.resolve(__dirname, '../src/config');
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(
    path.join(configDir, 'contract.json'),
    JSON.stringify(
      {
        chainId: 677,
        chainName: 'BotChain Mainnet',
        rpcUrl: 'https://rpc.botchain.ai',
        explorerUrl: 'https://scan.botchain.ai',
        contractAddress,
        deployedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );

  // Update .env VITE_CONTRACT_ADDRESS
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('VITE_CONTRACT_ADDRESS=')) {
      envContent = envContent.replace(
        /VITE_CONTRACT_ADDRESS=.*/,
        `VITE_CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nVITE_CONTRACT_ADDRESS=${contractAddress}`;
    }
    fs.writeFileSync(envPath, envContent);
  }

  console.log(`\nUpdated src/config/contract.json & .env with new mainnet contract address.`);
}

main().catch((err) => {
  console.error('Deployment failed:', err);
  process.exit(1);
});
