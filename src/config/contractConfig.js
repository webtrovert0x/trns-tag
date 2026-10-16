import contractArtifact from '../contracts/TransactionTagRegistry.json';
import deployedInfo from './contract.json' with { type: 'json' };

// Priority:
// 1. Explicit VITE_CONTRACT_ADDRESS in .env
// 2. Automatically generated contract.json from `npm run deploy`
// 3. LocalStorage override if user manually pasted a contract address in UI
const localAddress = typeof window !== 'undefined' ? localStorage.getItem('bot_tagger_contract_override') : null;

export const CONTRACT_ADDRESS = (
  localAddress ||
  import.meta.env.VITE_CONTRACT_ADDRESS ||
  (deployedInfo && deployedInfo.contractAddress) ||
  ''
).trim();

export const CONTRACT_ABI = contractArtifact.abi;

export const CATEGORIES = [
  { id: 0, key: 'UNCATEGORIZED', label: 'Uncategorized', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', desc: 'General or unclassified' },
  { id: 1, key: 'SALARY', label: 'Salary / Payroll', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', desc: 'Contributor compensation & payroll' },
  { id: 2, key: 'GRANT', label: 'Grant', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', desc: 'Ecosystem grant or retroactive funding' },
  { id: 3, key: 'DONATION', label: 'Donation', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)', desc: 'Charitable gift, tip, or sponsorship' },
  { id: 4, key: 'REFUND', label: 'Refund', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', desc: 'Reversal or overpayment return' },
  { id: 5, key: 'INVOICE', label: 'Invoice', color: '#facc15', bg: 'rgba(250, 204, 21, 0.15)', desc: 'Vendor payment or B2B settlement' },
  { id: 6, key: 'PROJECT', label: 'Project Budget', color: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.15)', desc: 'Milestone or project budget allocation' },
  { id: 7, key: 'CUSTOM', label: 'Custom Tag', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', desc: 'User-specified category' },
];

export const ACTION_TYPES = ['Created', 'Updated', 'Revoked'];

export function getCategoryById(id) {
  const numId = Number(id);
  return CATEGORIES.find(c => c.id === numId) || CATEGORIES[0];
}

export function formatAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function formatTxHash(hash) {
  if (!hash) return '';
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

export function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  const num = Number(timestamp);
  if (num === 0) return 'N/A';
  return new Date(num * 1000).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
