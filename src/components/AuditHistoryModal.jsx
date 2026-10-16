import React, { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { X, History, Calendar, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { CONTRACT_ADDRESS, CONTRACT_ABI, getCategoryById, formatDate, formatAddress } from '../config/contractConfig';

export function AuditHistoryModal({ isOpen, tagId, tagData, onClose }) {
  const publicClient = usePublicClient();
  const [historyEntries, setHistoryEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !tagId || !CONTRACT_ADDRESS) return;

    let isMounted = true;
    async function loadHistory() {
      setLoading(true);
      setError('');
      try {
        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getTagHistory',
          args: [BigInt(tagId)],
        });
        if (isMounted) {
          setHistoryEntries(data || []);
        }
      } catch (err) {
        console.error('Failed to load tag history:', err);
        if (isMounted) {
          setError(err.shortMessage || err.message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadHistory();
    return () => {
      isMounted = false;
    };
  }, [isOpen, tagId, publicClient]);

  if (!isOpen) return null;

  const actionLabels = ['Created', 'Updated', 'Revoked'];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <History size={20} color="var(--yellow-primary)" />
            Audit History Log — Tag #{tagId}
          </div>
          <button type="button" className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {tagData && (
          <div style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: 'var(--radius-md)', marginBottom: '18px', fontSize: '13px' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>
              Transaction Hash:{' '}
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--yellow-light)' }}>
                {tagData.txHash}
              </span>
            </div>
            <div style={{ color: 'var(--text-muted)' }}>
              Author: <span style={{ fontFamily: 'var(--font-mono)' }}>{formatAddress(tagData.tagger)}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
            <Loader2 size={28} className="animate-spin" style={{ margin: '0 auto 8px', color: 'var(--yellow-primary)' }} />
            <div>Fetching full audit trail from Bohr Testnet...</div>
          </div>
        ) : error ? (
          <div style={{ background: 'var(--danger-bg)', padding: '12px', borderRadius: 'var(--radius-md)', color: '#fca5a5', fontSize: '13px' }}>
            {error}
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Every annotation change is permanently recorded on-chain with timestamps and author change reasons:
            </p>

            <div className="timeline">
              {historyEntries.map((entry, idx) => {
                const cat = getCategoryById(entry.category);
                const action = actionLabels[entry.action] || 'Action';
                const isRevokedAction = entry.action === 2;

                return (
                  <div key={idx} className="timeline-item">
                    <div className={`timeline-node ${isRevokedAction ? 'revoked' : ''}`}></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            className="status-badge"
                            style={isRevokedAction ? { background: 'var(--danger-bg)', color: 'var(--danger)' } : { background: 'var(--yellow-subtle)', color: 'var(--yellow-light)' }}
                          >
                            {action.toUpperCase()}
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: cat.color }}>
                            {cat.label}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                          {formatDate(entry.timestamp)}
                        </span>
                      </div>

                      {entry.projectOrInvoiceRef && (
                        <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--yellow-light)', marginBottom: '6px' }}>
                          Ref: {entry.projectOrInvoiceRef}
                        </div>
                      )}

                      <div style={{ fontSize: '13px', color: '#e2e8f0', background: 'var(--bg-input)', padding: '8px 12px', borderRadius: '6px', marginBottom: '8px' }}>
                        {entry.memo || 'No memo provided'}
                      </div>

                      {entry.changeReason && (
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          <strong>Audit Reason:</strong> "{entry.changeReason}"
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close History
          </button>
        </div>
      </div>
    </div>
  );
}
