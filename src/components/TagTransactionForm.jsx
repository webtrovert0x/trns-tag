import React, { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { Tag as TagIcon, Send, CheckCircle2, AlertCircle, ExternalLink, Loader2, Sparkles, FileText, FolderKanban } from 'lucide-react';
import { CONTRACT_ADDRESS, CONTRACT_ABI, CATEGORIES } from '../config/contractConfig';

export function TagTransactionForm({ onTagSuccess, onOpenSettings }) {
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();

  const [txHash, setTxHash] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(1); // Default to SALARY
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [projectOrInvoiceRef, setProjectOrInvoiceRef] = useState('');
  const [memo, setMemo] = useState('');
  const [validationError, setValidationError] = useState('');

  const { data: writeHash, isPending: isWritePending, writeContract, error: writeError, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: writeHash,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!CONTRACT_ADDRESS) {
      setValidationError('Smart contract is not configured yet. Please deploy or set the contract address.');
      return;
    }

    const cleanHash = txHash.trim();
    // Validate bytes32 hash (0x + 64 hex characters)
    if (!/^0x[a-fA-F0-9]{64}$/.test(cleanHash)) {
      setValidationError('Invalid Transaction Hash. Must be a 66-character hex string starting with 0x.');
      return;
    }

    if (!memo.trim() && !projectOrInvoiceRef.trim()) {
      setValidationError('Please provide at least a Memo or an Invoice/Project reference.');
      return;
    }

    if (selectedCategoryId === 7 && !customCategoryName.trim()) {
      setValidationError('Please enter a name for your Custom tag category.');
      return;
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'tagTransaction',
        args: [
          cleanHash,
          selectedCategoryId,
          selectedCategoryId === 7 ? customCategoryName.trim() : '',
          projectOrInvoiceRef.trim(),
          memo.trim(),
        ],
      });
    } catch (err) {
      console.error('Submission error:', err);
    }
  };

  const handleResetForm = () => {
    setTxHash('');
    setProjectOrInvoiceRef('');
    setMemo('');
    setCustomCategoryName('');
    reset();
    if (onTagSuccess) onTagSuccess();
  };

  return (
    <div className="card-panel">
      <div className="card-header">
        <h2 className="card-title">
          <TagIcon size={20} color="var(--yellow-primary)" />
          Tag & Annotate a Blockchain Transaction
        </h2>
        <p className="card-desc">
          Add public accounting notes, project budget attribution, or invoice links directly on BotChain Mainnet.
        </p>
      </div>

      {!CONTRACT_ADDRESS && (
        <div style={{ background: 'rgba(234, 179, 8, 0.12)', border: '1px solid rgba(234, 179, 8, 0.3)', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} color="var(--yellow-primary)" />
            <span style={{ fontSize: '13px', color: '#fef08a' }}>
              Contract not deployed or configured yet.
            </span>
          </div>
          <button type="button" className="btn-yellow" onClick={onOpenSettings} style={{ padding: '6px 14px', fontSize: '12px' }}>
            Set Contract Address
          </button>
        </div>
      )}

      {isConfirmed ? (
        <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-md)', padding: '24px', textAlign: 'center' }}>
          <CheckCircle2 size={42} color="var(--yellow-primary)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>
            Transaction Successfully Tagged!
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Your annotation has been permanently recorded on BotChain Mainnet.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <a
              href={`https://scan.botchain.ai/tx/${writeHash}`}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
              style={{ fontSize: '13px' }}
            >
              View on BotChainScan <ExternalLink size={14} />
            </a>
            <button
              type="button"
              className="btn-yellow"
              onClick={handleResetForm}
              style={{ fontSize: '13px' }}
            >
              Tag Another Transaction
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Target Transaction Hash */}
          <div className="form-group">
            <label className="form-label" htmlFor="txHashInput">
              <span>Target Transaction Hash (0x...) *</span>
              <span className="form-hint">EVM Transaction Hash on BotChain (66-character hex)</span>
            </label>
            <input
              id="txHashInput"
              type="text"
              className="form-input font-mono"
              placeholder="0x4a9b...72e1"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              required
            />
          </div>

          {/* Category Picker */}
          <div className="form-group">
            <label className="form-label">
              <span>Annotation Category *</span>
              <span className="form-hint">Select financial purpose</span>
            </label>
            <div className="category-grid">
              {CATEGORIES.filter(c => c.id > 0).map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`category-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    style={isSelected ? { borderColor: cat.color } : {}}
                  >
                    <span className="category-chip-title" style={{ color: cat.color }}>
                      {cat.label}
                    </span>
                    <span className="category-chip-desc">{cat.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Category input if CUSTOM is selected */}
          {selectedCategoryId === 7 && (
            <div className="form-group">
              <label className="form-label" htmlFor="customCategoryName">
                <span>Custom Category Name *</span>
              </label>
              <input
                id="customCategoryName"
                type="text"
                className="form-input"
                placeholder="e.g. Legal Retainer, Bounty, Staking Reward"
                value={customCategoryName}
                onChange={(e) => setCustomCategoryName(e.target.value)}
                required
              />
            </div>
          )}

          {/* Invoice or Project Link */}
          <div className="form-group">
            <label className="form-label" htmlFor="projectRefInput">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={15} color="var(--yellow-primary)" />
                Invoice ID, PO #, or Project Reference
              </span>
              <span className="form-hint">e.g. INV-2026-042, MILESTONE-3, PROJ-DAO</span>
            </label>
            <input
              id="projectRefInput"
              type="text"
              className="form-input font-mono"
              placeholder="e.g. INV-2026-0089 or DAO-TREASURY-Q3"
              value={projectOrInvoiceRef}
              onChange={(e) => setProjectOrInvoiceRef(e.target.value)}
            />
          </div>

          {/* Annotation Memo */}
          <div className="form-group">
            <label className="form-label" htmlFor="memoInput">
              <span>Annotation Memo / Accounting Context *</span>
              <span className="form-hint">Description, milestone details, or IPFS document hash</span>
            </label>
            <textarea
              id="memoInput"
              className="form-textarea"
              placeholder="e.g. Core developer quarterly payroll compensation. Approved in snapshot vote #42. Receipt: ipfs://Qm..."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              required
            />
          </div>

          {/* Validation or Contract Error */}
          {(validationError || writeError) && (
            <div style={{ background: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={18} color="#ef4444" />
              <span style={{ fontSize: '13px', color: '#fca5a5' }}>
                {validationError || (writeError && (writeError.shortMessage || writeError.message))}
              </span>
            </div>
          )}

          {/* Submit Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            {!isConnected ? (
              <button
                type="button"
                className="btn-yellow"
                onClick={() => open()}
                style={{ width: '100%' }}
              >
                Connect Wallet to Tag Transaction
              </button>
            ) : (
              <button
                type="submit"
                className="btn-yellow"
                disabled={isWritePending || isConfirming}
                style={{ minWidth: '180px' }}
              >
                {isWritePending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Confirming in Wallet...
                  </>
                ) : isConfirming ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Recording on BotChain...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Tag On-Chain
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
