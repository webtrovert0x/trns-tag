// scripts/deploy.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createWalletClient, createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { defineChain } from 'viem';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define Bohr Network (Chain ID: 968)
export const bohrTestnet = defineChain({
  id: 968,
  name: 'Bohr Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BOT',
    symbol: 'BOT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.bohr.life'],
    },
    public: {
      http: ['https://rpc.bohr.life'],
    },
  },
  blockExplorers: {
    default: { name: 'BohrScan', url: 'https://scan.bohr.life' },
  },
  testnet: true,
});

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('Error: PRIVATE_KEY is not defined in .env');
    console.error('Please create a .env file with: PRIVATE_KEY=0x...');
    process.exit(1);
  }

  const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
  const account = privateKeyToAccount(formattedKey);

  console.log(`Deployer address: ${account.address}`);

  const publicClient = createPublicClient({
    chain: bohrTestnet,
    transport: http('https://rpc.bohr.life'),
  });

  const walletClient = createWalletClient({
    account,
    chain: bohrTestnet,
    transport: http('https://rpc.bohr.life'),
  });

  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`Account balance: ${Number(balance) / 1e18} BOT`);

  const artifactPath = path.resolve(__dirname, '../src/contracts/TransactionTagRegistry.json');
  if (!fs.existsSync(artifactPath)) {
    console.log('Artifact not found, compiling first...');
    const { execSync } = await import('child_process');
    execSync('node scripts/compile.js', { stdio: 'inherit' });
  }

  const { abi, bytecode } = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  console.log('Deploying TransactionTagRegistry to Bohr Testnet (Chain ID 968)...');

  const hash = await walletClient.deployContract({
    abi,
    bytecode: `0x${bytecode}`,
  });

  console.log(`Deployment transaction submitted. Hash: ${hash}`);
  console.log(`Check on explorer: https://scan.bohr.life/tx/${hash}`);
  console.log('Waiting for confirmation...');

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const contractAddress = receipt.contractAddress;

  console.log(`\n🎉 TransactionTagRegistry successfully deployed!`);
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Explorer URL: https://scan.bohr.life/address/${contractAddress}`);

  // Automatically update contract config for the frontend
  const configDir = path.resolve(__dirname, '../src/config');
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(
    path.join(configDir, 'contract.json'),
    JSON.stringify(
      {
        chainId: 968,
        chainName: 'Bohr Testnet',
        rpcUrl: 'https://rpc.bohr.life',
        explorerUrl: 'https://scan.bohr.life',
        contractAddress,
        deployedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );

  console.log(`Updated src/config/contract.json with new contract address.`);
}

main().catch((err) => {
  console.error('Deployment failed:', err);
  process.exit(1);
});
