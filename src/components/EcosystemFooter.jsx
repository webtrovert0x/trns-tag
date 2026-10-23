import React, { useState } from 'react';
import { ExternalLink, Globe, Compass, ShieldCheck, BookOpen, Settings, Cpu, Radio } from 'lucide-react';
import { CONTRACT_ADDRESS } from '../config/contractConfig';

// Official BOT Chain Logo with SVG vector fallback
export function BotChainLogo({ size = 24, className = '', style = {} }) {
  const [imgError, setImgError] = useState(false);

  if (!imgError) {
    return (
      <img
        src="/botchain_logo.jpeg"
        alt="BOT Chain Logo"
        width={size}
        height={size}
        onError={() => setImgError(true)}
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${Math.max(4, Math.round(size * 0.22))}px`,
          objectFit: 'cover',
          display: 'inline-block',
          verticalAlign: 'middle',
          flexShrink: 0,
          border: '1px solid rgba(253, 224, 71, 0.4)',
          boxShadow: '0 0 10px rgba(253, 224, 71, 0.15)',
          ...style,
        }}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="botchainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
        <linearGradient id="botchainGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde047" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0e1015" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Outer Hexagon */}
      <polygon
        points="20,2 36,11 36,29 20,38 4,29 4,11"
        fill="#181a20"
        stroke="url(#botchainGrad)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Inner Node Circuit */}
      <circle cx="20" cy="14" r="3" fill="#fde047" />
      <circle cx="13" cy="25" r="2.5" fill="#fde047" />
      <circle cx="27" cy="25" r="2.5" fill="#fde047" />
      {/* Connecting Chain Lines */}
      <path
        d="M20 14 L13 25 M20 14 L27 25 M13 25 L27 25"
        stroke="url(#botchainGrad)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Central Core Pulse */}
      <circle cx="20" cy="21" r="1.5" fill="#ffffff" />
    </svg>
  );
}

export function EcosystemFooter({ onOpenWhitepaper, onOpenSettings }) {
  const contractUrl = CONTRACT_ADDRESS
    ? `https://scan.botchain.ai/address/${CONTRACT_ADDRESS}`
    : 'https://scan.botchain.ai';

  return (
    <div className="ecosystem-section-wrapper">
      {/* Ecosystem Showcase Section */}
      <section className="ecosystem-showcase" id="ecosystem" aria-label="BOT Chain Ecosystem">
        <div className="ecosystem-header">
          <div className="ecosystem-badge">
            <BotChainLogo size={18} />
            <span>BOT CHAIN ECOSYSTEM SHOWCASE</span>
            <span className="chain-pill">CHAIN ID: 677</span>
          </div>
          <h2 className="ecosystem-title">
            Built Exclusively on <span className="highlight-text">BOT Chain</span>
          </h2>
          <p className="ecosystem-desc">
            The BOT Transaction Tagger operates directly on the BOT Chain Mainnet. Every annotation, invoice reference, and audit log is permanently anchored on-chain with zero mock data.
          </p>
        </div>

        <div className="ecosystem-cards-grid">
          {/* Card 1: Official Website */}
          <a
            href="https://botchain.ai"
            target="_blank"
            rel="noreferrer"
            className="ecosystem-card"
            id="botchain-website-link"
          >
            <div className="ecosystem-card-header">
              <div className="ecosystem-card-icon">
                <Globe size={22} color="var(--yellow-primary)" />
              </div>
              <span className="card-tag">Official Portal</span>
            </div>
            <div className="ecosystem-card-content">
              <h3>BOT Chain Website</h3>
              <p>
                Explore the AI-powered smart contract platform, developer SDKs, ecosystem grants, and the native <strong>BOT</strong> token.
              </p>
              <div className="card-url-row">
                <span className="card-url" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <BotChainLogo size={15} />
                  https://botchain.ai
                </span>
                <span className="card-action">
                  Visit Website <ExternalLink size={13} />
                </span>
              </div>
            </div>
          </a>

          {/* Card 2: Block Explorer */}
          <a
            href="https://scan.botchain.ai"
            target="_blank"
            rel="noreferrer"
            className="ecosystem-card"
            id="botchain-explorer-link"
          >
            <div className="ecosystem-card-header">
              <div className="ecosystem-card-icon">
                <Compass size={22} color="var(--yellow-primary)" />
              </div>
              <span className="card-tag">Blockscout Explorer</span>
            </div>
            <div className="ecosystem-card-content">
              <h3>BOT Chain Explorer</h3>
              <p>
                Query live blocks, verified contract source code, on-chain tag events, gas metrics, and transaction receipts in real time.
              </p>
              <div className="card-url-row">
                <span className="card-url" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <BotChainLogo size={15} />
                  https://scan.botchain.ai
                </span>
                <span className="card-action">
                  Open Explorer <ExternalLink size={13} />
                </span>
              </div>
            </div>
          </a>

          {/* Card 3: Live Verified Contract */}
          <a
            href={contractUrl}
            target="_blank"
            rel="noreferrer"
            className="ecosystem-card contract-card"
            id="botchain-contract-link"
          >
            <div className="ecosystem-card-header">
              <div className="ecosystem-card-icon">
                <ShieldCheck size={22} color="#4ade80" />
              </div>
              <span className="card-tag live-tag">Verified on 677</span>
            </div>
            <div className="ecosystem-card-content">
              <h3>Verified Smart Contract</h3>
              <p>
                <code style={{ fontSize: '11.5px', color: 'var(--yellow-light)' }}>
                  {CONTRACT_ADDRESS
                    ? `${CONTRACT_ADDRESS.slice(0, 10)}...${CONTRACT_ADDRESS.slice(-8)}`
                    : 'TransactionTagRegistry.sol'}
                </code>
                <br />
                Single-file verified source code with ABI and event indexing active on BOT Chain Mainnet.
              </p>
              <div className="card-url-row">
                <span className="card-url">scan.botchain.ai/address/...</span>
                <span className="card-action">
                  Inspect Contract <ExternalLink size={13} />
                </span>
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* Main Footer */}
      <footer className="app-footer">
        <div className="footer-top-row">
          <div className="footer-brand">
            <BotChainLogo size={28} />
            <div className="footer-brand-text">
              <div className="footer-brand-title">
                <strong>BOT Chain</strong> Ecosystem DApp
              </div>
              <div className="footer-brand-sub">
                BOT Transaction Tagger • Public Accounting & Audit Registry
              </div>
            </div>
          </div>

          <div className="footer-network-pill">
            <Radio size={12} color="#4ade80" className="pulse-indicator" />
            <span>BOT Chain Mainnet (677) Connected</span>
          </div>
        </div>

        {/* Required Showcase & Ecosystem Links */}
        <div className="footer-required-links">
          <div className="required-link-item">
            <BotChainLogo size={20} />
            <span className="link-label">BOT Chain website:</span>
            <a
              href="https://botchain.ai"
              target="_blank"
              rel="noreferrer"
              className="link-anchor"
            >
              
              https://botchain.ai <ExternalLink size={12} />
            </a>
          </div>

          <div className="link-divider">•</div>

          <div className="required-link-item">
            <BotChainLogo size={20} />
            <span className="link-label">BOT Chain explorer:</span>
            <a
              href="https://scan.botchain.ai"
              target="_blank"
              rel="noreferrer"
              className="link-anchor"
            >
             
              https://scan.botchain.ai <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Action & Utility Links */}
        <div className="footer-utility-links">
          <button
            type="button"
            className="footer-btn"
            onClick={onOpenWhitepaper}
          >
            <BookOpen size={13} />
            Technical Whitepaper
          </button>

          <button
            type="button"
            className="footer-btn"
            onClick={onOpenSettings}
          >
            <Settings size={13} />
            Contract Configuration
          </button>
        </div>

        <div className="footer-disclaimer">
          <strong>Protocol Disclaimer:</strong> Tags and annotations are subjective accounting metadata signed by wallet authors, not cryptographic proof that a transfer was approved or legitimate. Fully audited and immutable on BOT Chain.
        </div>
      </footer>
    </div>
  );
}
