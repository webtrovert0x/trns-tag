import React, { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { Activity, Tag as TagIcon, ExternalLink, History, Loader2, ArrowUpRight, ShieldCheck, Database, Copy, Check } from 'lucide-react';
import { CONTRACT_ADDRESS, CONTRACT_ABI, getCategoryById, formatAddress, formatTxHash, formatDate } from '../config/contractConfig';

export function RecentActivityView({ onSelectHistory, onOpenTagTab, onSearchTx, refreshTrigger }) {
  const publicClient = usePublicClient();
  const [latestTags, setLatestTags] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const fetchActivity = async () => {
    if (!CONTRACT_ADDRESS) return;
    setLoading(true);
    setError('');
    try {
      // 1. Fetch latest tags
      const tags = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getLatestTags',
        args: [25n],
      });

      // 2. Fetch total count of tagged transactions
      const txCount = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getTaggedTxCount',
      });

      // 3. Fetch total active tags
      const activeTags = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'totalActiveTags',
      });

      setLatestTags(tags || []);
      setTotalCount(Number(txCount || 0));
      setActiveCount(Number(activeTags || 0));
    } catch (err) {
      console.error('Failed to load recent activity:', err);
      setError(err.shortMessage || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [refreshTrigger, publicClient]);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div>
      {/* On-Chain Metrics Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div className="card-panel" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <TagIcon size={14} color="var(--yellow-primary)" />
            Total Active Annotations
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--yellow-light)', fontFamily: 'var(--font-mono)' }}>
            {activeCount.toLocaleString()}
          </div>
        </div>

        <div className="card-panel" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Database size={14} color="#38bdf8" />
            Tagged Transactions
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
            {totalCount.toLocaleString()}
          </div>
        </div>

        <div className="card-panel" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <ShieldCheck size={14} color="#4ade80" />
            Network / Layer
          </div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#4ade80', marginTop: '4px' }}>
            Bohr Testnet (BOT)
          </div>
        </div>
      </div>

      <div className="card-panel">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 className="card-title">
              <Activity size={20} color="var(--yellow-primary)" />
              Recent On-Chain Annotations
            </h2>
            <p className="card-desc">
              Live transaction tags recorded on Bohr Testnet by DAOs, accountants, and businesses.
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={fetchActivity}
            disabled={loading}
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            {loading ? 'Refreshing...' : 'Refresh Activity'}
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <Loader2 size={28} className="animate-spin" style={{ margin: '0 auto 10px', color: 'var(--yellow-primary)' }} />
            <div>Reading live transactions from Bohr Testnet...</div>
          </div>
        ) : error ? (
          <div style={{ background: 'var(--danger-bg)', padding: '12px', borderRadius: 'var(--radius-md)', color: '#fca5a5', fontSize: '13px' }}>
            {error}
          </div>
        ) : latestTags.length === 0 ? (
          <div className="empty-state">
            <Activity className="empty-state-icon" />
            <h3 className="empty-state-title">No Transactions Tagged Yet</h3>
            <p className="empty-state-desc">
              Be the first to annotate a transaction on Bohr Testnet. Categorize a salary, grant, donation, invoice, or project budget.
            </p>
            <button
              type="button"
              className="btn-yellow"
              onClick={onOpenTagTab}
              style={{ marginTop: '16px' }}
            >
              Tag a Transaction Now
            </button>
          </div>
        ) : (
          latestTags.map((tag) => {
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
                      Audit History
                    </button>
                    <button
                      type="button"
                      className="btn-yellow"
                      onClick={() => onSearchTx(tag.txHash)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Inspect in Explorer
                      <ArrowUpRight size={13} />
                    </button>
                  </div>
                </div>

                <div className="tag-card-body">
                  <div>
                    <div className="data-item-label">Transaction Hash</div>
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
                        onClick={() => handleCopy(`recent-tx-${tagIdNum}`, tag.txHash)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        {copiedId === `recent-tx-${tagIdNum}` ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
                      </button>
                      <a href={`https://scan.bohr.life/tx/${tag.txHash}`} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>

                  <div>
                    <div className="data-item-label">Tagger / Entity</div>
                    <div className="data-item-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <a
                        href={`https://scan.bohr.life/address/${tag.tagger}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--text-main)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}
                      >
                        {formatAddress(tag.tagger)}
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
                      Annotation Memo:
                    </div>
                    {tag.memo}
                  </div>
                )}

                <div className="tag-card-footer">
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Recorded {formatDate(tag.createdAt)}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>
                    Tag ID #{tagIdNum}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
