import { defineChain } from 'viem';

export const botchainMainnet = defineChain({
  id: 677,
  name: 'BotChain Mainnet',
  nativeCurrency: {
    name: 'BOT',
    symbol: 'BOT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.botchain.ai'],
    },
    public: {
      http: ['https://rpc.botchain.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BotChainScan',
      url: 'https://scan.botchain.ai',
    },
  },
  testnet: false,
});
