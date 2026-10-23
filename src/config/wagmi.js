import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { http } from 'wagmi';
import { botchainMainnet } from './botchain';

// Reown AppKit Project ID
export const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || '3a8170812b534d0ff9d794f168fa7d63';

// Setup Wagmi adapter with BotChain Mainnet (Chain ID 677)
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [botchainMainnet],
  transports: {
    [botchainMainnet.id]: http('https://rpc.botchain.ai'),
  },
});

// Create Reown AppKit modal instance
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [botchainMainnet],
  defaultNetwork: botchainMainnet,
  projectId,
  metadata: {
    name: 'BOT Transaction Tagger',
    description: 'Searchable public tags and annotations on BotChain Mainnet',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://scan.botchain.ai',
    icons: ['https://scan.botchain.ai/favicon.ico'],
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#FACC15',
    '--w3m-color-mix': '#18191F',
    '--w3m-color-mix-strength': 40,
    '--w3m-border-radius-master': '10px',
  },
});

export const config = wagmiAdapter.wagmiConfig;
