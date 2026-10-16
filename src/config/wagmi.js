import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { http } from 'wagmi';
import { bohrTestnet } from './bohrChain';

// Reown AppKit Project ID
export const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || '3a8170812b534d0ff9d794f168fa7d63';

// Setup Wagmi adapter with Bohr Testnet
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [bohrTestnet],
  transports: {
    [bohrTestnet.id]: http('https://rpc.bohr.life'),
  },
});

// Create Reown AppKit modal instance
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [bohrTestnet],
  defaultNetwork: bohrTestnet,
  projectId,
  metadata: {
    name: 'BOT Transaction Tagger',
    description: 'Searchable public tags and annotations on Bohr Network',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://scan.bohr.life',
    icons: ['https://scan.bohr.life/favicon.ico'],
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
