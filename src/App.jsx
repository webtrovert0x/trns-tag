import React, { useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './config/wagmi';
import { Header } from './components/Header';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { TagTransactionForm } from './components/TagTransactionForm';
import { TransactionExplorer } from './components/TransactionExplorer';
import { MyTagsView } from './components/MyTagsView';
import { RecentActivityView } from './components/RecentActivityView';
import { ContractSettingsModal } from './components/ContractSettingsModal';
import { AuditHistoryModal } from './components/AuditHistoryModal';
import { EditTagModal } from './components/EditTagModal';
import { RevokeTagModal } from './components/RevokeTagModal';
import { WhitepaperModal } from './components/WhitepaperModal';
import { EcosystemFooter } from './components/EcosystemFooter';
import { Tag, Search, UserCheck, Activity, ExternalLink, ShieldCheck, BookOpen } from 'lucide-react';
import { CONTRACT_ADDRESS } from './config/contractConfig';

const queryClient = new QueryClient();

function MainApp() {
  const [activeTab, setActiveTab] = useState('tag'); // 'tag' | 'search' | 'my-tags' | 'recent'
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWhitepaperOpen, setIsWhitepaperOpen] = useState(false);
  const [activeContractAddress, setActiveContractAddress] = useState(CONTRACT_ADDRESS);

  // Modal states for history, edit, revoke
  const [historyModal, setHistoryModal] = useState({ isOpen: false, tagId: null, tagData: null });
  const [editModal, setEditModal] = useState({ isOpen: false, tagId: null, tagData: null });
  const [revokeModal, setRevokeModal] = useState({ isOpen: false, tagId: null, tagData: null });

  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleOpenHistory = (tagId, tagData) => {
    setHistoryModal({ isOpen: true, tagId, tagData });
  };

  const handleOpenEdit = (tagId, tagData) => {
    setEditModal({ isOpen: true, tagId, tagData });
  };

  const handleOpenRevoke = (tagId, tagData) => {
    setRevokeModal({ isOpen: true, tagId, tagData });
  };

  const handleInspectInExplorer = (txHash) => {
    setActiveTab('search');
    // Allow slight render tick then simulate search or set query
    setTimeout(() => {
      const searchInput = document.querySelector('.search-input');
      if (searchInput) {
        searchInput.value = txHash;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        const form = searchInput.closest('form');
        if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }, 100);
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenWhitepaper={() => setIsWhitepaperOpen(true)}
      />

      {/* Main Workspace */}
      <main className="main-content">
        {/* Prominent Legal / Accounting Disclaimer */}
        <DisclaimerBanner />

        {/* Navigation Tabs */}
        <nav className="tabs-nav" aria-label="Transaction Tagger Views">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'tag' ? 'active' : ''}`}
            onClick={() => setActiveTab('tag')}
          >
            <Tag size={16} />
            Tag Transaction
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <Search size={16} />
            Search & Explorer
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'my-tags' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-tags')}
          >
            <UserCheck size={16} />
            My Annotations
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'recent' ? 'active' : ''}`}
            onClick={() => setActiveTab('recent')}
          >
            <Activity size={16} />
            Live Activity Feed
          </button>
        </nav>

        {/* Tab Views */}
        {activeTab === 'tag' && (
          <TagTransactionForm
            onTagSuccess={triggerRefresh}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {activeTab === 'search' && (
          <TransactionExplorer
            onSelectHistory={handleOpenHistory}
            onSelectEdit={handleOpenEdit}
            onSelectRevoke={handleOpenRevoke}
            onOpenTagTab={() => setActiveTab('tag')}
          />
        )}

        {activeTab === 'my-tags' && (
          <MyTagsView
            onSelectHistory={handleOpenHistory}
            onSelectEdit={handleOpenEdit}
            onSelectRevoke={handleOpenRevoke}
            onOpenTagTab={() => setActiveTab('tag')}
            refreshTrigger={refreshKey}
          />
        )}

        {activeTab === 'recent' && (
          <RecentActivityView
            onSelectHistory={handleOpenHistory}
            onOpenTagTab={() => setActiveTab('tag')}
            onSearchTx={handleInspectInExplorer}
            refreshTrigger={refreshKey}
          />
        )}
      </main>

      {/* BOT Chain Ecosystem Showcase & Footer */}
      <EcosystemFooter
        onOpenWhitepaper={() => setIsWhitepaperOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Modals */}
      <WhitepaperModal
        isOpen={isWhitepaperOpen}
        onClose={() => setIsWhitepaperOpen(false)}
      />

      <ContractSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onAddressUpdate={(newAddr) => setActiveContractAddress(newAddr)}
      />

      <AuditHistoryModal
        isOpen={historyModal.isOpen}
        tagId={historyModal.tagId}
        tagData={historyModal.tagData}
        onClose={() => setHistoryModal({ isOpen: false, tagId: null, tagData: null })}
      />

      <EditTagModal
        isOpen={editModal.isOpen}
        tagId={editModal.tagId}
        tagData={editModal.tagData}
        onClose={() => setEditModal({ isOpen: false, tagId: null, tagData: null })}
        onUpdated={triggerRefresh}
      />

      <RevokeTagModal
        isOpen={revokeModal.isOpen}
        tagId={revokeModal.tagId}
        tagData={revokeModal.tagData}
        onClose={() => setRevokeModal({ isOpen: false, tagId: null, tagData: null })}
        onRevoked={triggerRefresh}
      />
    </div>
  );
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MainApp />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
