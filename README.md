# BOT Transaction Tagger

A decentralized, searchable public transaction annotation and audit registry built for **DAOs, accountants, developers, and businesses** on **BotChain Mainnet (Chain ID: 677)**.

> **LEGAL & AUDITING NOTICE & DISCLAIMER**  
> *Tags are public annotations and subjective metadata, NOT cryptographic proof that a payment was legitimate, approved, or correctly categorized.*

---

## 🚀 Live BotChain Mainnet Deployment

- **Contract Name**: [`TransactionTagRegistry.sol`](./contracts/TransactionTagRegistry.sol)
- **Verified Contract Address**: [`0xfa14bde4808aeb8c0c925d7a268882ef1300cbcc`](https://scan.botchain.ai/address/0xfa14bde4808aeb8c0c925d7a268882ef1300cbcc)
- **Deployment Transaction**: [`0x5a1b64449b0f4187fa094663ed70fa680d59e54f7ba2ee972f35a2cfe8e29659`](https://scan.botchain.ai/tx/0x5a1b64449b0f4187fa094663ed70fa680d59e54f7ba2ee972f35a2cfe8e29659)
- **Verification Status**: ✅ Verified on BotChainScan (`v0.8.28+commit.7893614a`)
- **Chain ID**: `677`
- **RPC URL**: `https://rpc.botchain.ai`
- **Native Token**: `BOT` (150 Million Total Supply)
- **Block Explorer**: [https://scan.botchain.ai/](https://scan.botchain.ai/)

---

## ✨ Core Capabilities

1. **Structured Transaction Categorization**:
   - 💼 **Salary / Payroll**: Contributor payouts and recurring compensation.
   - 🎁 **Grant**: Retroactive ecosystem funding, research, and public goods grants.
   - 💖 **Donation**: Tips, charitable contributions, and sponsorships.
   - 🔄 **Refund**: Overpayment reversals and returned balances.
   - 🧾 **Invoice**: Vendor payments and B2B settlements.
   - 📁 **Project Budget**: Milestone attribution and department tracking.
   - ⚙️ **Custom Tags**: User-defined classification.

2. **Invoice & Project Linking**:
   - Attach compact reference codes (e.g. `INV-2026-089`, `DAO-Q3-MILESTONE2`, `PO-4412`).
   - Associate detailed memos or decentralized document URIs (IPFS / Arweave receipt CIDs).

3. **Immutable Audit Trail & Version History**:
   - Every tag revision or retraction stores an entry with the author's stated reason for change (`changeReason`), block timestamp, and action (`CREATED`, `UPDATED`, `REVOKED`).

4. **Zero Mock Data Architecture**:
   - 100% live on-chain reads and writes via Wagmi v2, Viem, and Reown AppKit directly to BotChain Mainnet.

5. **Tailored UI Design**:
   - Sleek grayish-black background (`#0e1015`) with prominent light yellow buttons (`#fde047` / `#fef08a`).

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
The `.env` file contains network settings and the deployed contract address:
```ini
PRIVATE_KEY=your_private_key_here
VITE_REOWN_PROJECT_ID=3a8170812b534d0ff9d794f168fa7d63
VITE_CONTRACT_ADDRESS=0xfa14bde4808aeb8c0c925d7a268882ef1300cbcc
```

### 3. Deploy & Verify Contract
To deploy and automatically verify with your private key in `.env`:
```bash
npm run deploy
npm run verify
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5174](http://localhost:5174) in your browser.
