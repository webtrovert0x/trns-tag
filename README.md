# BOT Transaction Tagger

A decentralized, searchable public transaction annotation and audit registry built for **DAOs, accountants, developers, and businesses** on the **Bohr Network (Chain ID: 968)**.

> **LEGAL & AUDITING NOTICE & DISCLAIMER**  
> *Tags are public annotations and subjective metadata, NOT cryptographic proof that a payment was legitimate, approved, or correctly categorized.*

---

## 🚀 Live Bohr Testnet Deployment

- **Contract Name**: [`TransactionTagRegistry.sol`](./contracts/TransactionTagRegistry.sol)
- **Verified Contract Address**: [`0x75749a555f5314423e262139df363d08d86296d7`](https://scan.bohr.life/address/0x75749a555f5314423e262139df363d08d86296d7)
- **Deployment Transaction**: [`0x31f6613a5a7c2d81cb1fefc9d6fa0c48b5c86c6dd26b57491f9fbc24283046ee`](https://scan.bohr.life/tx/0x31f6613a5a7c2d81cb1fefc9d6fa0c48b5c86c6dd26b57491f9fbc24283046ee)
- **Verification Status**: ✅ Verified on BohrScan (`v0.8.28+commit.7893614a`)
- **Chain ID**: `968`
- **RPC URL**: `https://rpc.bohr.life`
- **Native Token**: `BOT`
- **Block Explorer**: [https://scan.bohr.life/](https://scan.bohr.life/)

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
   - 100% live on-chain reads and writes via Wagmi v2, Viem, and Reown AppKit directly to Bohr Testnet.

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
VITE_CONTRACT_ADDRESS=0x2d028ab03477acc07322d49e9c4bfd058644ba0e
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
