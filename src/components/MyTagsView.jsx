import React, { useEffect, useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { Tag as TagIcon, History, Edit3, Trash2, ExternalLink, Calendar, Loader2, Copy, Check } from 'lucide-react';
import { CONTRACT_ADDRESS, CONTRACT_ABI, getCategoryById, formatTxHash, formatDate } from '../config/contractConfig';

export function MyTagsView({ onSelectHistory, onSelectEdit, onSelectRevoke, onOpenTagTab, refreshTrigger }) {
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  const publicClient = usePublicClient();

  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const fetchMyTags = async () => {
    if (!isConnected || !address || !CONTRACT_ADDRESS) return;
    setLoading(true);
    setError('');
    try {
      const data = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getTagsByTagger',
        args: [address],
      });
      // Sort newest first
      const sorted = [...(data || [])].sort((a, b) => Number(b.id) - Number(a.id));
      setTags(sorted);
    } catch (err) {
      console.error('Failed to load my tags:', err);
      setError(err.shortMessage || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTags();
  }, [address, isConnected, refreshTrigger, publicClient]);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isConnected) {
    return (
      <div className="card-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <TagIcon size={44} color="var(--yellow-primary)" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
          Connect Wallet to View Your Annotations
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px' }}>
          Manage your submitted transaction tags, view their live status, edit details, or retract annotations.
        </p>
        <button type="button" className="btn-yellow" onClick={() => open()}>
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="card-panel">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 className="card-title">
            <TagIcon size={20} color="var(--yellow-primary)" />
            My Transaction Annotations
          </h2>
          <p className="card-desc">
            All transaction tags and accounting metadata authored by {address}
          </p>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={fetchMyTags}
          disabled={loading}
          style={{ fontSize: '12px', padding: '6px 12px' }}
        >
          {loading ? 'Refreshing...' : 'Refresh On-Chain'}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
          <Loader2 size={28} className="animate-spin" style={{ margin: '0 auto 10px', color: 'var(--yellow-primary)' }} />
          <div>Loading your annotations from Bohr Testnet...</div>
        </div>
      ) : error ? (
        <div style={{ background: 'var(--danger-bg)', padding: '12px', borderRadius: 'var(--radius-md)', color: '#fca5a5', fontSize: '13px' }}>
          {error}
        </div>
      ) : tags.length === 0 ? (
        <div className="empty-state">
          <TagIcon className="empty-state-icon" />
          <h3 className="empty-state-title">No Annotations Created Yet</h3>
          <p className="empty-state-desc">
            You have not tagged any blockchain transactions from this wallet address yet.
          </p>
          <button
            type="button"
            className="btn-yellow"
            onClick={onOpenTagTab}
            style={{ marginTop: '16px' }}
          >
            Create Your First Tag
          </button>
        </div>
      ) : (
        tags.map((tag) => {
          const cat = getCategoryById(tag.category);
          const tagIdNum = Number(tag.id);

          return (
            <div key={tagIdNum} className={`tag-card ${tag.isRevoked ? 'is-revoked' : ''}`}>
              <div className="tag-card-header">
                <div className="tag-badges-row">
                  <span
                    className="category-tag-badge"
                    style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.color}40` }}
                  >
                    <TagIcon size={12} />
                    {cat.key === 'CUSTOM' && tag.customCategoryName ? tag.customCategoryName : cat.label}
                  </span>

                  {tag.isRevoked ? (
                    <span className="status-badge revoked">Revoked</span>
                  ) : (
                    <span className="status-badge active">Active</span>
                  )}

                  <span className="version-badge">v{Number(tag.version)}</span>
                </div>

                <div className="tag-actions-row">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => onSelectHistory(tagIdNum, tag)}
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    <History size={13} />
                    Audit Log
                  </button>

                  {!tag.isRevoked && (
                    <>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => onSelectEdit(tagIdNum, tag)}
                        style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--yellow-light)' }}
                      >
                        <Edit3 size={13} />
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-danger-soft"
                        onClick={() => onSelectRevoke(tagIdNum, tag)}
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        <Trash2 size={13} />
                        Revoke
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="tag-card-body">
                <div>
                  <div className="data-item-label">Target Transaction Hash</div>
                  <div className="data-item-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <a
                      href={`https://scan.bohr.life/tx/${tag.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--yellow-light)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}
                    >
                      {formatTxHash(tag.txHash)}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy(`my-tx-${tagIdNum}`, tag.txHash)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {copiedId === `my-tx-${tagIdNum}` ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
                    </button>
                    <a href={`https://scan.bohr.life/tx/${tag.txHash}`} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                {tag.projectOrInvoiceRef && (
                  <div>
                    <div className="data-item-label">Invoice / Project Ref</div>
                    <div className="data-item-value" style={{ fontFamily: 'var(--font-mono)', color: 'var(--yellow-light)' }}>
                      {tag.projectOrInvoiceRef}
                    </div>
                  </div>
                )}
              </div>

              {tag.memo && (
                <div className="memo-box">
                  <div style={{ fontSize: '11px', color: 'var(--yellow-light)', fontWeight: '600', marginBottom: '4px' }}>
                    Accounting Memo:
                  </div>
                  {tag.memo}
                </div>
              )}

              <div className="tag-card-footer">
                <div className="time-author">
                  <Calendar size={13} />
                  <span>Created {formatDate(tag.createdAt)}</span>
                  {Number(tag.updatedAt) > Number(tag.createdAt) && (
                    <span>• Updated {formatDate(tag.updatedAt)}</span>
                  )}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>
                  Tag #{tagIdNum}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
