// scripts/verify.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contractPath = path.resolve(__dirname, '../contracts/TransactionTagRegistry.sol');
const sourceCode = fs.readFileSync(contractPath, 'utf8');

const contractConfigPath = path.resolve(__dirname, '../src/config/contract.json');
const contractConfig = JSON.parse(fs.readFileSync(contractConfigPath, 'utf8'));
const contractAddress = contractConfig.contractAddress;

const EXPLORER_URL = 'https://scan.botchain.ai';

async function verifyEtherscanApi(compilerVersion) {
  console.log(`\nSubmitting via Etherscan/Blockscout API with version: ${compilerVersion}...`);

  const formData = new URLSearchParams();
  formData.append('module', 'contract');
  formData.append('action', 'verifysourcecode');
  formData.append('contractaddress', contractAddress);
  formData.append('sourceCode', sourceCode);
  formData.append('codeformat', 'solidity-single-file');
  formData.append('contractname', 'TransactionTagRegistry');
  formData.append('compilerversion', compilerVersion);
  formData.append('optimizationUsed', '1');
  formData.append('runs', '200');

  const res = await fetch(`${EXPLORER_URL}/api`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });

  const json = await res.json();
  console.log('API Response:', json);
  return json;
}

async function verifyBlockscoutV2(compilerVersion) {
  console.log(`\nSubmitting via Blockscout v2 API with version: ${compilerVersion}...`);

  const payload = {
    compiler_version: compilerVersion,
    source_code: sourceCode,
    is_optimization_enabled: true,
    optimization_runs: 200,
    contract_name: 'TransactionTagRegistry',
    autodetect_constructor_args: true,
    constructor_arguments: '',
    evm_version: 'default',
    license_type: 'mit',
  };

  const res = await fetch(`${EXPLORER_URL}/api/v2/smart-contracts/${contractAddress}/verification/via/flattened-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log('Blockscout v2 Response:', text);
}

async function checkStatus() {
  const res = await fetch(`${EXPLORER_URL}/api?module=contract&action=getabi&address=${contractAddress}`);
  const json = await res.json();
  return json;
}

async function main() {
  console.log(`=======================================================`);
  console.log(`🔍 VERIFYING ON BOTCHAIN MAINNET EXPLORER`);
  console.log(`=======================================================`);
  console.log(`Target Contract: ${contractAddress}`);

  await verifyEtherscanApi('v0.8.28+commit.7893614a');
  await verifyBlockscoutV2('v0.8.28+commit.7893614a');

  console.log('\nChecking contract status on BotChain Explorer in 10 seconds...');
  await new Promise((r) => setTimeout(r, 10000));

  const status = await checkStatus();
  console.log('\nVerification Status on BotChain Explorer:', status);
}

main().catch(console.error);
