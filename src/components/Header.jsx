import React, { useState, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { Tag, ShieldCheck, ExternalLink, Settings, Wallet, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';
import { CONTRACT_ADDRESS, formatAddress } from '../config/contractConfig';
import { BotChainLogo } from './EcosystemFooter';

export function Header({ onOpenSettings, onOpenWhitepaper }) {
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();
  const [blockNumber, setBlockNumber] = useState(null);

  // Fetch current block from BotChain RPC
  useEffect(() => {
    let isMounted = true;
    async function fetchBlock() {
      try {
        const res = await fetch('https://rpc.botchain.ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_blockNumber',
            params: [],
          }),
        });
        const data = await res.json();
        if (isMounted && data.result) {
          setBlockNumber(parseInt(data.result, 16));
        }
      } catch (err) {
        console.warn('RPC block poll error:', err);
      }
    }

    fetchBlock();
    const interval = setInterval(fetchBlock, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="header-wrapper">
      <div className="header-inner">
        <div className="brand-section">
          <div className="brand-icon">
            <Tag size={22} />
          </div>
          <div className="brand-info">
            <h1>
              BOT Transaction Tagger
              <span style={{ fontSize: '11px', background: 'var(--yellow-subtle)', color: 'var(--yellow-light)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-accent)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <BotChainLogo size={13} />
                BOT CHAIN 677
              </span>
            </h1>
            <p className="brand-subtitle">
              Public On-Chain Transaction Annotations, Accounting & Audit Registry
            </p>
          </div>
        </div>

        <div className="header-actions">
          {/* Whitepaper Button */}
          <button
            type="button"
            className="btn-secondary"
            onClick={onOpenWhitepaper}
            style={{ padding: '8px 12px', fontSize: '12px' }}
            title="Read Technical Whitepaper"
          >
            <BookOpen size={14} color="var(--yellow-primary)" />
            Whitepaper
          </button>

          {/* Live RPC Status */}
          <div className="network-badge" title="Connected to BotChain Mainnet RPC (Chain ID 677)">
            <span className="pulse-dot"></span>
            <span>BotChain Mainnet</span>
            {blockNumber && (
              <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                #{blockNumber.toLocaleString()}
              </span>
            )}
          </div>

          {/* Contract Status Indicator */}
          <button
            type="button"
            className="btn-secondary"
            onClick={onOpenSettings}
            style={{ padding: '8px 12px', fontSize: '12px' }}
            title="Contract configuration"
          >
            <Settings size={15} />
            {CONTRACT_ADDRESS ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4ade80' }}>
                <CheckCircle2 size={13} />
                Contract: {formatAddress(CONTRACT_ADDRESS)}
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--yellow-primary)' }}>
                <AlertCircle size={13} />
                Set Contract
              </span>
            )}
          </button>

          {/* Wallet Connect */}
          {isConnected ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => open()}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}
              >
                <Wallet size={15} color="var(--yellow-primary)" />
                {formatAddress(address)}
              </button>
              <button
                type="button"
                className="btn-danger-soft"
                onClick={() => disconnect()}
                style={{ padding: '8px 10px', fontSize: '12px' }}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn-yellow"
              onClick={() => open()}
            >
              <Wallet size={16} />
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
