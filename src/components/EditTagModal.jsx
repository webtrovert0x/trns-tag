import React, { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { X, Edit3, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CONTRACT_ADDRESS, CONTRACT_ABI, CATEGORIES } from '../config/contractConfig';

export function EditTagModal({ isOpen, tagId, tagData, onClose, onUpdated }) {
  const [category, setCategory] = useState(1);
  const [customName, setCustomName] = useState('');
  const [projectRef, setProjectRef] = useState('');
  const [memo, setMemo] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [formError, setFormError] = useState('');

  const { data: writeHash, isPending: isWritePending, writeContract, error: writeError, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: writeHash,
  });

  useEffect(() => {
    if (tagData) {
      setCategory(Number(tagData.category) || 1);
      setCustomName(tagData.customCategoryName || '');
      setProjectRef(tagData.projectOrInvoiceRef || '');
      setMemo(tagData.memo || '');
      setChangeReason('');
      setFormError('');
      reset();
    }
  }, [tagData]);

  if (!isOpen || !tagData) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!changeReason.trim()) {
      setFormError('Audit reason is required when modifying a transaction annotation.');
      return;
    }

    if (category === 7 && !customName.trim()) {
      setFormError('Please specify the custom category name.');
      return;
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'updateTag',
        args: [
          BigInt(tagId),
          category,
          category === 7 ? customName.trim() : '',
          projectRef.trim(),
          memo.trim(),
          changeReason.trim(),
        ],
      });
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const handleDone = () => {
    if (onUpdated) onUpdated();
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Edit3 size={20} color="var(--yellow-primary)" />
            Update Annotation — Tag #{tagId}
          </div>
          <button type="button" className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {isConfirmed ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <CheckCircle2 size={44} color="var(--yellow-primary)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
              Annotation Updated Successfully!
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              A new audit entry has been recorded in the permanent history log.
            </p>
            <button type="button" className="btn-yellow" onClick={handleDone}>
              Close & Refresh
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                <span>Category</span>
              </label>
              <div className="category-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))' }}>
                {CATEGORIES.filter((c) => c.id > 0).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`category-chip ${category === cat.id ? 'selected' : ''}`}
                    onClick={() => setCategory(cat.id)}
                    style={{ padding: '8px 10px' }}
                  >
                    <span className="category-chip-title" style={{ color: cat.color, fontSize: '12px' }}>
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {category === 7 && (
              <div className="form-group">
                <label className="form-label" htmlFor="editCustomName">
                  <span>Custom Category Name</span>
                </label>
                <input
                  id="editCustomName"
                  type="text"
                  className="form-input"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="editProjectRef">
                <span>Invoice / Project Ref</span>
              </label>
              <input
                id="editProjectRef"
                type="text"
                className="form-input font-mono"
                value={projectRef}
                onChange={(e) => setProjectRef(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="editMemo">
                <span>Memo / Description</span>
              </label>
              <textarea
                id="editMemo"
                className="form-textarea"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="changeReasonInput">
                <span>Reason for Modification * (Required for Audit Trail)</span>
                <span className="form-hint">e.g. Corrected invoice number, updated milestone link</span>
              </label>
              <input
                id="changeReasonInput"
                type="text"
                className="form-input"
                placeholder="State why this annotation is being updated"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
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
                className="btn-yellow"
                disabled={isWritePending || isConfirming}
              >
                {isWritePending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Confirming...
                  </>
                ) : isConfirming ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Updating on Bohr...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
