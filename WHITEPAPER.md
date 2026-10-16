# BOT Transaction Tagger
## Technical Whitepaper: A Decentralized Annotation and Public Audit Protocol for On-Chain Financial Operations

**Version:** 1.0.0  
**Published:** October 2026  
**Network:** Bohr Network (Chain ID: 968)  
**Contract Address:** [`0x75749a555f5314423e262139df363d08d86296d7`](https://scan.bohr.life/address/0x75749a555f5314423e262139df363d08d86296d7)  
**Native Currency:** BOT  
**Target Audience:** DAOs, Accountants, Developers, Auditors, and Web3 Businesses  

---

## Abstract

Blockchain ledgers provide cryptographically undeniable proof of asset ownership and transfers, yet they are structurally blind to business context, transactional intent, and accounting classifications. A raw transfer of tokens recorded on-chain cannot distinguish between an executive salary payment, an ecosystem grant, a supplier invoice settlement, or a mistaken transaction refund. Traditional organizations reconcile this gap using centralized, off-chain Enterprise Resource Planning (ERP) databases, re-introducing data silos, counterparty discrepancies, and single points of evidentiary failure.

The **BOT Transaction Tagger** protocol introduces an open, verifiable, and immutable on-chain annotation layer on the Bohr Network. By decoupling execution from subjective contextual classification, the protocol enables DAOs, businesses, developers, and accountants to publicly link transaction hashes to standardized categories, invoice identifiers, and immutable audit logs. Importantly, the protocol enforces strict epistemological separation: **tags are decentralized annotations, not cryptographic proof of transaction legitimacy or fiscal accuracy.** This paper outlines the protocol's architecture, data models, audit history mechanisms, security trade-offs, and deployment on Bohr Testnet.

---

## 1. Introduction & The Semantic Ledger Problem

### 1.1 The Context Gap in Distributed Ledgers
An EVM transaction receipt contains strictly objective technical fields:
$$\text{TxReceipt} = \{\text{blockNumber}, \text{from}, \text{to}, \text{value}, \text{gasUsed}, \text{status}, \text{logs}\}$$

While this information satisfies state-transition consensus, it answers none of the operational questions vital to business governance:
- *Why was this payment initiated?*
- *Which contractual invoice or milestone does this payment settle?*
- *Is this outbound transaction a grant disbursement or contributor payroll?*
- *If a tag was modified three months after disbursement, who amended it and for what reason?*

### 1.2 Limitations of Off-Chain Reconciliation
Historically, crypto organizations attempted to resolve this through centralized SaaS accounting tools. This approach creates four systemic vulnerabilities:
1. **Asymmetric Records**: The sender classifies a transaction as a "Vendor Expense", while the recipient classifies it as "Seed Investment", with no canonical shared registry.
2. **Data Fragility & Loss**: Centralized databases can be modified retroactively without an audit log, or become inaccessible if the software provider discontinues service.
3. **Auditor Friction**: External accounting auditors must manually reconcile proprietary spreadsheets against public block explorer hashes.
4. **Lack of Transparency**: DAO token holders cannot independently verify if treasury disbursements aligned with approved governance milestones.

---

## 2. Protocol Architecture

The BOT Transaction Tagger protocol operates as a modular, permissionless smart contract deployed on Bohr Network: [`TransactionTagRegistry.sol`](./contracts/TransactionTagRegistry.sol).

```
+-----------------------------------------------------------------------+
|                            USER ECOSYSTEM                             |
|    DAO Treasuries   •   Accountants   •   Vendors   •   Auditors      |
+-----------------------------------------------------------------------+
                                   |
                                   v  (EIP-1193 / Web3 RPC)
+-----------------------------------------------------------------------+
|                     APPLICATION & INDEXING LAYER                      |
|      Search & Explorer  •  Activity Stream  •  Audit Timeline         |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                    TRANSACTION TAG REGISTRY (ON-CHAIN)                |
|                    TransactionTagRegistry.sol (BOHR: 968)             |
|                                                                       |
|  [tagTransaction]       [updateTag]             [revokeTag]           |
|         |                     |                       |               |
|         v                     v                       v               |
|  +--------------+     +---------------+       +---------------+       |
|  | Active Tags  |     | Audit History |       | Indexed Event |       |
|  | State (Tag)  |     |  (Log Trail)  |       |     Logs      |       |
|  +--------------+     +---------------+       +---------------+       |
+-----------------------------------------------------------------------+
```

### 2.1 Separation of Concerns
The registry does not intervene in transfer execution or token mechanics. Users do not route funds through an intermediary smart contract. Instead:
1. The transaction executes normally between Alice and Bob.
2. Either participant (or an authorized auditor) references the resulting `bytes32 txHash` and attaches an on-chain annotation record.
3. The annotation is immutably indexed with author attribution (`msg.sender`).

---

## 3. Data Models & Categorization Standards

### 3.1 Standardized Category Taxonomy
To facilitate cross-organization querying and automated accounting exports, the protocol formalizes a universal category enumeration:

| Enum ID | Category Code | Typical Use Case |
|---|---|---|
| `0` | `UNCATEGORIZED` | Fallback or generalized classification |
| `1` | `SALARY` | Core team payroll, contributor compensation, recurring stipends |
| `2` | `GRANT` | Public goods funding, research grants, ecosystem bounties |
| `3` | `DONATION` | Charitable contributions, sponsorships, community tips |
| `4` | `REFUND` | Reversals, overpayment corrections, failed trade reimbursements |
| `5` | `INVOICE` | Commercial vendor billing, contractor milestones, B2B invoices |
| `6` | `PROJECT` | Project budget tracking, sub-DAO allocations |
| `7` | `CUSTOM` | Domain-specific tags (accompanied by `customCategoryName`) |

### 3.2 Tag Data Structure
Each registered tag stores comprehensive business metadata:
```solidity
struct Tag {
    uint256 id;
    bytes32 txHash;
    address tagger;
    Category category;
    string customCategoryName;
    string projectOrInvoiceRef;
    string memo;
    uint64 createdAt;
    uint64 updatedAt;
    uint32 version;
    bool isRevoked;
}
```

- **`projectOrInvoiceRef`**: Compact human-readable reference (e.g. `INV-2026-0891`, `MILESTONE-4`, `PO-8812`).
- **`memo`**: Contextual notes, governance proposal links, or IPFS/Arweave content identifiers (CIDs) pointing to encrypted invoice PDFs or receipts.
- **`version`**: Monotonically incrementing revision counter.

---

## 4. Immutable Revision History & Forensic Audit Trails

In financial accounting, records cannot be silently overwritten. Any adjustment to a previous financial entry must be permanently attributed and explained.

### 4.1 Chronological Revision Tracking
When an existing annotation is modified via `updateTag` or retracted via `revokeTag`, the registry appends an immutable entry to `_tagHistories[tagId]`:

```solidity
struct TagHistoryEntry {
    Category category;
    string projectOrInvoiceRef;
    string memo;
    uint64 timestamp;
    ActionType action;        // CREATED, UPDATED, REVOKED
    string changeReason;      // Mandatory justification
}
```

### 4.2 Non-Destructive Revocation
When a tag is revoked:
- The tag's `isRevoked` boolean is set to `true`.
- The active tag counter is decremented.
- The original record and previous revisions remain permanently readable on-chain.
- Auditors can inspect the full historical evolution of the annotation from creation to revocation, ensuring zero evidentiary tampering.

---

## 5. Security & Epistemological Boundaries

### 5.1 The Core Disclaimer
The smart contract permanently stores and exposes the following public notice:
```solidity
string public constant DISCLAIMER = 
    "Tags are annotations, not proof that a payment was legitimate or correctly categorized.";
```

### 5.2 Subjective Claims vs Objective Truth
- **What on-chain tags prove**: Address `0xAlice` declared that transaction `0x123...` corresponds to `SALARY` for `INV-42` at timestamp `T`.
- **What on-chain tags DO NOT prove**: That the payment was legally legitimate, that the work was performed, or that `0xBob` received the correct contractual sum.

This distinction is fundamental for auditors: tags represent public, cryptographically signed declarations of intent, enabling transparent cross-verification against external contracts, banking rails, or multsig governance approvals.

### 5.3 Author Attribution & Modification Rights
The contract enforces strict authorization:
$$\text{Authorizer}(tagId) \equiv \text{Tag}[tagId].tagger == msg.sender$$

Only the address that originally authored the tag possesses the cryptographic authority to update its fields or mark it as revoked. Any third-party can create an independent, competing tag for the same transaction hash, enabling decentralized counterparty reconciliation (e.g., sender and receiver can each record their own perspective).

---

## 6. Bohr Network (Chain ID 968) Implementation

### 6.1 Network Specifications
- **Network Name**: Bohr Testnet
- **Chain ID**: `968`
- **Native Gas Token**: `BOT` (18 decimals)
- **RPC Endpoint**: `https://rpc.bohr.life`
- **Block Explorer**: [https://scan.bohr.life/](https://scan.bohr.life/)
- **Verified Contract**: [`0x75749a555f5314423e262139df363d08d86296d7`](https://scan.bohr.life/address/0x75749a555f5314423e262139df363d08d86296d7)

### 6.2 Gas Efficiency Optimizations
1. **Packed Struct Storage**: Numerical timestamps (`uint64`), version numbers (`uint32`), and boolean flags are tightly packed within single 256-bit storage slots.
2. **Zero-Cost Public Reads**: All search functions (`getTagsByTx`, `getTagsByTagger`, `getTagHistory`, `getLatestTags`) are pure view functions requiring zero gas when queried via RPC.
3. **Indexed Event Logs**: Crucial search parameters (`tagId`, `txHash`, `tagger`) are marked `indexed`, allowing frontends and indexers to perform sub-second filtering via standard JSON-RPC `eth_getLogs`.

---

## 7. Application Use Cases

### 7.1 DAO Treasuries
DAO governors tag multi-sig disbursements directly with Snapshot or Tally proposal IDs (e.g., `PROP-2026-14`). Token holders can monitor treasury expenditures in real time without waiting for monthly manual PDF reports.

### 7.2 Web3 Accountants & Bookkeepers
Accountants export on-chain tag logs directly into accounting software (e.g., QuickBooks, Xero, Request Finance). Automated parsers map tag categories (`SALARY`, `INVOICE`, `REFUND`) straight to corresponding General Ledger (GL) charts of accounts.

### 7.3 Contractor & Vendor Settlements
Freelancers and vendors link transactions directly to invoice numbers and Arweave/IPFS receipt CIDs, providing instantaneous, immutable proof of billing settlement.

---

## 8. Conclusion

The **BOT Transaction Tagger** bridges the semantic divide between raw cryptographic state transitions and real-world accounting workflows. By anchoring standardized categories, invoice cross-references, and immutable change histories directly onto the Bohr Network, the protocol establishes a public, decentralized foundation for modern digital asset accounting.

---

### Contract Verification & Source Code
The contract source code, deployment artifacts, and ABI are open-source and publicly verified:
- **GitHub Repository**: [https://github.com/webtrovert0x/trns-tag](https://github.com/webtrovert0x/trns-tag)
- **Explorer Verified Contract**: [https://scan.bohr.life/address/0x75749a555f5314423e262139df363d08d86296d7](https://scan.bohr.life/address/0x75749a555f5314423e262139df363d08d86296d7)
