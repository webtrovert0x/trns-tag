import React, { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { X, Trash2, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contractConfig';

export function RevokeTagModal({ isOpen, tagId, tagData, onClose, onRevoked }) {
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');

  const { data: writeHash, isPending: isWritePending, writeContract, error: writeError, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: writeHash,
  });

  if (!isOpen || !tagData) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!reason.trim()) {
      setFormError('Please specify the reason for revoking this annotation.');
      return;
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'revokeTag',
        args: [BigInt(tagId), reason.trim()],
      });
    } catch (err) {
      console.error('Revoke error:', err);
    }
  };

  const handleDone = () => {
    reset();
    if (onRevoked) onRevoked();
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ color: '#f87171' }}>
            <Trash2 size={20} />
            Revoke Annotation — Tag #{tagId}
          </div>
          <button type="button" className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {isConfirmed ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <CheckCircle2 size={44} color="#f87171" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
              Annotation Revoked
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              The tag has been marked as revoked on BotChain Mainnet. The historical record remains visible for accounting audits.
            </p>
            <button type="button" className="btn-yellow" onClick={handleDone}>
              Close & Refresh
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ background: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '18px', fontSize: '13px', color: '#fca5a5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontWeight: '700' }}>
                <AlertTriangle size={16} />
                Confirm Revocation
              </div>
              Revoking marks this annotation as retracted. In accordance with audit standards, the transaction's history is preserved so auditors can see that this tag was originally applied and subsequently revoked.
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="revokeReasonInput">
                <span>Reason for Revocation *</span>
                <span className="form-hint">Required for audit trail</span>
              </label>
              <textarea
                id="revokeReasonInput"
                className="form-textarea"
                placeholder="e.g. Transaction was tagged by mistake; this was a vendor refund rather than payroll."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            {(formError || writeError) && (
              <div style={{ background: 'var(--danger-bg)', padding: '10px 12px', borderRadius: 'var(--radius-md)', color: '#fca5a5', fontSize: '13px', marginBottom: '16px' }}>
                {formError || (writeError && (writeError.shortMessage || writeError.message))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn-danger-soft"
                disabled={isWritePending || isConfirming}
                style={{ background: '#ef4444', color: '#fff', border: 'none' }}
              >
                {isWritePending ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Confirming...
                  </>
                ) : isConfirming ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Revoking on BotChain...
                  </>
                ) : (
                  'Confirm Revocation'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
