import React from 'react';
import { X, BookOpen, ExternalLink, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export function WhitepaperModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '850px', maxHeight: '88vh' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <BookOpen size={20} color="var(--yellow-primary)" />
            BOT Transaction Tagger — Technical Whitepaper
          </div>
          <button type="button" className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ fontSize: '13.5px', color: '#cbd5e1', lineHeight: '1.7', overflowY: 'auto', paddingRight: '6px' }}>
          {/* Header Metadata */}
          <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '12.5px' }}>
              <div><strong style={{ color: 'var(--text-main)' }}>Version:</strong> 1.0.0 (October 2026)</div>
              <div><strong style={{ color: 'var(--text-main)' }}>Network:</strong> BotChain Mainnet (Chain ID 677)</div>
              <div><strong style={{ color: 'var(--text-main)' }}>Native Token:</strong> BOT (150M Supply)</div>
              <div>
                <strong style={{ color: 'var(--text-main)' }}>Explorer:</strong>{' '}
                <a
                  href="https://scan.botchain.ai"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--yellow-light)', textDecoration: 'none' }}
                >
                  scan.botchain.ai ↗
                </a>
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: '16px', color: 'var(--yellow-light)', marginTop: '16px', marginBottom: '8px' }}>
            1. Abstract & Executive Summary
          </h3>
          <p>
            Blockchains record immutable balances and cryptographic transfers with mathematical precision, yet they are structurally blind to business context, transactional intent, and accounting classifications. A raw transfer of tokens on-chain cannot distinguish between an executive salary payment, an ecosystem grant, a supplier invoice settlement, or an overpayment refund.
          </p>
          <p style={{ marginTop: '8px' }}>
            The <strong>BOT Transaction Tagger</strong> protocol introduces an open, verifiable, and immutable on-chain annotation layer on BotChain. It decouples execution from subjective contextual classification, enabling DAOs, businesses, developers, and accountants to publicly link transaction hashes to standardized categories, invoice identifiers, and immutable audit logs.
          </p>

          <h3 style={{ fontSize: '16px', color: 'var(--yellow-light)', marginTop: '20px', marginBottom: '8px' }}>
            2. The Core Disclaimer & Trust Boundary
          </h3>
          <div style={{ background: 'rgba(253, 224, 71, 0.08)', borderLeft: '4px solid var(--yellow-primary)', padding: '12px 14px', borderRadius: '4px', margin: '10px 0' }}>
            <strong style={{ color: 'var(--yellow-light)' }}>Permanent Protocol Notice:</strong>
            <p style={{ fontStyle: 'italic', marginTop: '4px', color: '#f1f5f9' }}>
              "Tags are annotations, not proof that a payment was legitimate or correctly categorized."
            </p>
          </div>
          <p>
            Tags represent cryptographically signed declarations of accounting intent, enabling transparent cross-verification against external banking rails, signed contracts, or multi-sig approval logs without asserting false cryptographic proof of real-world fulfillment.
          </p>

          <h3 style={{ fontSize: '16px', color: 'var(--yellow-light)', marginTop: '20px', marginBottom: '8px' }}>
            3. Standardized Financial Categories
          </h3>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li><strong>SALARY:</strong> Contributor payroll, recurring compensation, developer stipends.</li>
            <li><strong>GRANT:</strong> Ecosystem funding, retroactive grants, public goods research.</li>
            <li><strong>DONATION:</strong> Community sponsorships, charitable gifts, tips.</li>
            <li><strong>REFUND:</strong> Reversals, trade overpayments, returned escrow funds.</li>
            <li><strong>INVOICE:</strong> Vendor billing, contractor milestone invoices, B2B settlements.</li>
            <li><strong>PROJECT:</strong> Departmental budget allocations, milestone funding.</li>
            <li><strong>CUSTOM:</strong> User-defined specialized domain tags.</li>
          </ul>

          <h3 style={{ fontSize: '16px', color: 'var(--yellow-light)', marginTop: '20px', marginBottom: '8px' }}>
            4. Immutable Audit Trail & Change Reasons
          </h3>
          <p>
            Traditional databases allow stealthy modifications. The BOT Transaction Registry strictly prohibits silent edits: whenever a tag is modified or retracted, the smart contract appends a permanent entry with the author's stated justification (<code>changeReason</code>), block timestamp, and revision counter (<code>version</code>).
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-light)', gap: '10px' }}>
          <button type="button" className="btn-yellow" onClick={onClose}>
            Close Whitepaper
          </button>
        </div>
      </div>
    </div>
  );
}
