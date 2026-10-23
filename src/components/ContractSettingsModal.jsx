import React, { useState } from 'react';
import { X, ExternalLink, Check, Copy, Terminal, Shield, AlertTriangle } from 'lucide-react';
import { CONTRACT_ADDRESS } from '../config/contractConfig';

export function ContractSettingsModal({ isOpen, onClose, onAddressUpdate }) {
  const [inputAddress, setInputAddress] = useState(CONTRACT_ADDRESS || '');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const cleanAddr = inputAddress.trim();
    if (cleanAddr && !/^0x[a-fA-F0-9]{40}$/.test(cleanAddr)) {
      alert('Please enter a valid EVM contract address (0x followed by 40 hex characters)');
      return;
    }
    localStorage.setItem('bot_tagger_contract_override', cleanAddr);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onAddressUpdate(cleanAddr);
      onClose();
      window.location.reload();
    }, 600);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Terminal size={20} color="var(--yellow-primary)" />
            BotChain Mainnet Contract Configuration
          </div>
          <button type="button" className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            The app interacts directly on-chain with <code style={{ color: 'var(--yellow-light)' }}>TransactionTagRegistry.sol</code> on BotChain Mainnet (Chain ID <strong>677</strong>, RPC <code>https://rpc.botchain.ai</code>).
          </p>

          <form onSubmit={handleSave} className="form-group">
            <label className="form-label">
              <span>Active Contract Address</span>
              {CONTRACT_ADDRESS && (
                <a
                  href={`https://scan.botchain.ai/address/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--yellow-light)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                >
                  View on BotChainScan <ExternalLink size={12} />
                </a>
              )}
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input font-mono"
                placeholder="0x..."
                value={inputAddress}
                onChange={(e) => setInputAddress(e.target.value)}
              />
              <button type="submit" className="btn-yellow" style={{ whiteSpace: 'nowrap' }}>
                {savedSuccess ? <Check size={16} /> : 'Save & Connect'}
              </button>
            </div>
          </form>
        </div>

        {/* Deploy Guide */}
        <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Terminal size={16} color="var(--yellow-primary)" />
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
              How to Deploy to BotChain Mainnet:
            </span>
          </div>

          <ol style={{ fontSize: '12.5px', color: '#cbd5e1', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>
              Add your private key in the project root <code style={{ color: 'var(--yellow-light)', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>.env</code> file:
              <pre style={{ margin: '6px 0', background: 'var(--bg-primary)', padding: '8px', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#fef08a' }}>
                PRIVATE_KEY=your_private_key_here
              </pre>
            </li>
            <li>
              Run the gas-optimized deployment command in terminal:
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <pre style={{ margin: 0, background: 'var(--bg-primary)', padding: '8px 12px', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#fde047', flex: 1 }}>
                  npm run deploy
                </pre>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => handleCopy('npm run deploy')}
                  style={{ padding: '7px 10px', fontSize: '11px' }}
                >
                  {copied ? <Check size={13} color="#4ade80" /> : <Copy size={13} />}
                </button>
              </div>
            </li>
            <li>
              The script will deploy to BotChain Mainnet, print the confirmed contract address, and automatically update the frontend config!
            </li>
          </ol>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
