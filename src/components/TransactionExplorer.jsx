import React, { useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { Search, ExternalLink, History, Edit3, Trash2, Tag as TagIcon, Calendar, User, FileText, CheckCircle2, AlertTriangle, Copy, Check } from 'lucide-react';
import { CONTRACT_ADDRESS, CONTRACT_ABI, getCategoryById, formatAddress, formatTxHash, formatDate } from '../config/contractConfig';

export function TransactionExplorer({ onSelectHistory, onSelectEdit, onSelectRevoke, onOpenTagTab }) {
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searchType, setSearchType] = useState('tx'); // 'tx' or 'tagger'
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    if (!CONTRACT_ADDRESS) {
      setSearchError('Contract address is not set. Please deploy or configure the contract.');
      return;
    }

    setSearchError('');
    setIsSearching(true);
    setSearched(true);
    setResults([]);

    try {
      if (query.startsWith('0x') && query.length === 66) {
        // Query by TxHash
        setSearchType('tx');
        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getTagsByTx',
          args: [query],
        });
        setResults(data || []);
      } else if (query.startsWith('0x') && query.length === 42) {
        // Query by Tagger Address
        setSearchType('tagger');
        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getTagsByTagger',
          args: [query],
        });
        setResults(data || []);
      } else {
        // Query all latest tags and filter by projectOrInvoiceRef or customCategoryName client-side
        setSearchType('ref');
        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getLatestTags',
          args: [50n],
        });
        const filtered = (data || []).filter(
          (t) =>
            t.projectOrInvoiceRef?.toLowerCase().includes(query.toLowerCase()) ||
            t.memo?.toLowerCase().includes(query.toLowerCase()) ||
            t.customCategoryName?.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setSearchError('Failed to query contract: ' + (err.shortMessage || err.message));
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="card-panel">
      <div className="card-header">
        <h2 className="card-title">
          <Search size={20} color="var(--yellow-primary)" />
          Search Public Transaction Annotations
        </h2>
        <p className="card-desc">
          Search on-chain records by Transaction Hash (66-char hex), Tagger Address (42-char hex), or Invoice/Project Reference.
        </p>
      </div>

      <form onSubmit={handleSearch} className="search-box-container">
        <div className="search-input-wrap">
          <Search size={18} className="search-input-icon" />
          <input
            type="text"
            className="form-input search-input font-mono"
            placeholder="Search by 0x... Tx Hash, 0x... Tagger Address, or INV-..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="btn-yellow"
          disabled={isSearching || !searchQuery.trim()}
          style={{ whiteSpace: 'nowrap' }}
        >
          {isSearching ? 'Searching BotChain...' : 'Search Registry'}
        </button>
      </form>

      {searchError && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: '20px', color: '#fca5a5', fontSize: '13px' }}>
          {searchError}
        </div>
      )}

      {/* Results Section */}
      {searched && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>
              Found {results.length} annotation{results.length === 1 ? '' : 's'} on-chain
            </span>
          </div>

          {results.length === 0 ? (
            <div className="empty-state">
              <TagIcon className="empty-state-icon" />
              <h3 className="empty-state-title">No Annotations Found</h3>
              <p className="empty-state-desc">
                No tags recorded on BotChain Mainnet match this transaction or address query yet.
              </p>
              {onOpenTagTab && (
                <button
                  type="button"
                  className="btn-yellow"
                  onClick={onOpenTagTab}
                  style={{ marginTop: '16px' }}
                >
                  Tag this Transaction Now
                </button>
              )}
            </div>
          ) : (
            results.map((tag) => {
              const cat = getCategoryById(tag.category);
              const isTaggerOwner = address && tag.tagger && address.toLowerCase() === tag.tagger.toLowerCase();
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
                        <span className="status-badge revoked">Revoked / Retracted</span>
                      ) : (
                        <span className="status-badge active">Active Annotation</span>
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

                      {isTaggerOwner && !tag.isRevoked && (
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
                          href={`https://scan.botchain.ai/tx/${tag.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--yellow-light)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}
                        >
                          {formatTxHash(tag.txHash)}
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopy(`tx-${tagIdNum}`, tag.txHash)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                          {copiedId === `tx-${tagIdNum}` ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
                        </button>
                        <a href={`https://scan.botchain.ai/tx/${tag.txHash}`} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>

                    <div>
                      <div className="data-item-label">Tagger / Author</div>
                      <div className="data-item-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <a
                          href={`https://scan.botchain.ai/address/${tag.tagger}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--text-main)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}
                        >
                          {formatAddress(tag.tagger)}
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopy(`tagger-${tagIdNum}`, tag.tagger)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                          {copiedId === `tagger-${tagIdNum}` ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
                        </button>
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
                        Accounting Context / Memo:
                      </div>
                      {tag.memo}
                    </div>
                  )}

                  <div className="tag-card-footer">
                    <div className="time-author">
                      <Calendar size={13} />
                      <span>Tagged {formatDate(tag.createdAt)}</span>
                      {Number(tag.updatedAt) > Number(tag.createdAt) && (
                        <span>• Updated {formatDate(tag.updatedAt)}</span>
                      )}
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
      )}
    </div>
  );
}
