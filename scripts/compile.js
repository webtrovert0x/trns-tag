// scripts/compile.js
import fs from 'fs';
import path from 'path';
import solc from 'solc';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contractPath = path.resolve(__dirname, '../contracts/TransactionTagRegistry.sol');
const source = fs.readFileSync(contractPath, 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    'TransactionTagRegistry.sol': {
      content: source,
    },
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode'],
      },
    },
  },
};

console.log('Compiling TransactionTagRegistry.sol...');
const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  let hasFatal = false;
  output.errors.forEach((err) => {
    if (err.severity === 'error') {
      console.error(err.formattedMessage);
      hasFatal = true;
    } else {
      console.warn(err.formattedMessage);
    }
  });
  if (hasFatal) {
    process.exit(1);
  }
}

const contract = output.contracts['TransactionTagRegistry.sol']['TransactionTagRegistry'];
const abi = contract.abi;
const bytecode = contract.evm.bytecode.object;

const outDir = path.resolve(__dirname, '../src/contracts');
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(
  path.join(outDir, 'TransactionTagRegistry.json'),
  JSON.stringify({ abi, bytecode }, null, 2)
);

console.log('Compilation successful! Saved ABI and Bytecode to src/contracts/TransactionTagRegistry.json');
