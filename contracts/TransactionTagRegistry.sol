// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TransactionTagRegistry
 * @dev Public registry for adding searchable, auditable annotations and tags to blockchain transactions.
 * Designed for DAOs, accountants, developers, and businesses on Bohr Network (Chain ID 968).
 *
 * NOTE & DISCLAIMER:
 * Tags are annotations and subjective metadata, NOT cryptographic proof that a payment
 * was legitimate, approved, or correctly categorized.
 */
contract TransactionTagRegistry {
    // Public notice disclaimer stored permanently on-chain
    string public constant DISCLAIMER = 
        "Tags are annotations, not proof that a payment was legitimate or correctly categorized.";

    enum Category {
        UNCATEGORIZED, // 0
        SALARY,        // 1 - Contributor compensation, payroll
        GRANT,         // 2 - Ecosystem grants, research, public goods
        DONATION,      // 3 - Charitable gifts, tips, sponsorships
        REFUND,        // 4 - Reversals, overpayment returns
        INVOICE,       // 5 - Vendor billing, contractor invoices
        PROJECT,       // 6 - Project-specific budget allocation
        CUSTOM         // 7 - User-defined tag
    }

    enum ActionType {
        CREATED,
        UPDATED,
        REVOKED
    }

    struct TagHistoryEntry {
        Category category;
        string projectOrInvoiceRef;
        string memo;
        uint64 timestamp;
        ActionType action;
        string changeReason;
    }

    struct Tag {
        uint256 id;
        bytes32 txHash;
        address tagger;
        Category category;
        string customCategoryName; // Optional string if Category == CUSTOM
        string projectOrInvoiceRef; // Invoice ID, PO number, or project code
        string memo;                // Context, description, or IPFS link
        uint64 createdAt;
        uint64 updatedAt;
        uint32 version;
        bool isRevoked;
    }

    // Incremental tag ID
    uint256 public nextTagId = 1;

    // Mapping from tagId => Tag
    mapping(uint256 => Tag) public tags;

    // Mapping from txHash => array of tag IDs attached to it
    mapping(bytes32 => uint256[]) private _txToTagIds;

    // Mapping from tagger address => array of tag IDs authored
    mapping(address => uint256[]) private _taggerToTagIds;

    // Mapping from tagId => array of revision history entries
    mapping(uint256 => TagHistoryEntry[]) private _tagHistories;

    // Array of all distinct transaction hashes that have been tagged
    bytes32[] public allTaggedTxHashes;
    mapping(bytes32 => bool) private _isTxKnown;

    // Total active tags counter
    uint256 public totalActiveTags;

    // Events for real-time frontend indexing and block explorers
    event TransactionTagged(
        uint256 indexed tagId,
        bytes32 indexed txHash,
        address indexed tagger,
        Category category,
        string projectOrInvoiceRef,
        string memo
    );

    event TagUpdated(
        uint256 indexed tagId,
        bytes32 indexed txHash,
        Category newCategory,
        string newProjectOrInvoiceRef,
        string newMemo,
        uint32 version,
        string changeReason
    );

    event TagRevoked(
        uint256 indexed tagId,
        bytes32 indexed txHash,
        address indexed tagger,
        string reason
    );

    modifier onlyTagger(uint256 tagId) {
        require(tags[tagId].id != 0, "Tag does not exist");
        require(tags[tagId].tagger == msg.sender, "Caller is not tag author");
        _;
    }

    /**
     * @notice Add a public tag and annotation to a transaction
     * @param txHash Target transaction hash (0x...)
     * @param category Classification enum
     * @param customCategoryName Name if category is CUSTOM
     * @param projectOrInvoiceRef Invoice ID, project reference, or purchase order
     * @param memo Note, accounting memo, or IPFS CID
     * @return tagId The assigned unique tag identifier
     */
    function tagTransaction(
        bytes32 txHash,
        Category category,
        string calldata customCategoryName,
        string calldata projectOrInvoiceRef,
        string calldata memo
    ) external returns (uint256 tagId) {
        require(txHash != bytes32(0), "Invalid txHash");
        require(bytes(memo).length > 0 || bytes(projectOrInvoiceRef).length > 0, "Annotation details required");

        tagId = nextTagId++;
        uint64 currentTime = uint64(block.timestamp);

        Tag storage newTag = tags[tagId];
        newTag.id = tagId;
        newTag.txHash = txHash;
        newTag.tagger = msg.sender;
        newTag.category = category;
        newTag.customCategoryName = customCategoryName;
        newTag.projectOrInvoiceRef = projectOrInvoiceRef;
        newTag.memo = memo;
        newTag.createdAt = currentTime;
        newTag.updatedAt = currentTime;
        newTag.version = 1;
        newTag.isRevoked = false;

        _txToTagIds[txHash].push(tagId);
        _taggerToTagIds[msg.sender].push(tagId);

        if (!_isTxKnown[txHash]) {
            _isTxKnown[txHash] = true;
            allTaggedTxHashes.push(txHash);
        }

        totalActiveTags++;

        // Initial history entry
        _tagHistories[tagId].push(TagHistoryEntry({
            category: category,
            projectOrInvoiceRef: projectOrInvoiceRef,
            memo: memo,
            timestamp: currentTime,
            action: ActionType.CREATED,
            changeReason: "Initial tag creation"
        }));

        emit TransactionTagged(tagId, txHash, msg.sender, category, projectOrInvoiceRef, memo);
    }

    /**
     * @notice Update an existing tag annotation
     * @param tagId ID of the tag to edit
     * @param newCategory Updated classification
     * @param newCustomCategoryName Updated custom name if category == CUSTOM
     * @param newProjectOrInvoiceRef Updated invoice/project reference
     * @param newMemo Updated memo
     * @param changeReason Reason for audit history
     */
    function updateTag(
        uint256 tagId,
        Category newCategory,
        string calldata newCustomCategoryName,
        string calldata newProjectOrInvoiceRef,
        string calldata newMemo,
        string calldata changeReason
    ) external onlyTagger(tagId) {
        Tag storage tag = tags[tagId];
        require(!tag.isRevoked, "Cannot update a revoked tag");

        tag.category = newCategory;
        tag.customCategoryName = newCustomCategoryName;
        tag.projectOrInvoiceRef = newProjectOrInvoiceRef;
        tag.memo = newMemo;
        tag.updatedAt = uint64(block.timestamp);
        tag.version++;

        _tagHistories[tagId].push(TagHistoryEntry({
            category: newCategory,
            projectOrInvoiceRef: newProjectOrInvoiceRef,
            memo: newMemo,
            timestamp: uint64(block.timestamp),
            action: ActionType.UPDATED,
            changeReason: changeReason
        }));

        emit TagUpdated(tagId, tag.txHash, newCategory, newProjectOrInvoiceRef, newMemo, tag.version, changeReason);
    }

    /**
     * @notice Revoke/retract an annotation
     * @param tagId ID of the tag to revoke
     * @param reason Audit reason for revocation
     */
    function revokeTag(uint256 tagId, string calldata reason) external onlyTagger(tagId) {
        Tag storage tag = tags[tagId];
        require(!tag.isRevoked, "Tag already revoked");

        tag.isRevoked = true;
        tag.updatedAt = uint64(block.timestamp);
        tag.version++;
        if (totalActiveTags > 0) {
            totalActiveTags--;
        }

        _tagHistories[tagId].push(TagHistoryEntry({
            category: tag.category,
            projectOrInvoiceRef: tag.projectOrInvoiceRef,
            memo: tag.memo,
            timestamp: uint64(block.timestamp),
            action: ActionType.REVOKED,
            changeReason: reason
        }));

        emit TagRevoked(tagId, tag.txHash, msg.sender, reason);
    }

    /**
     * @notice Get all tags associated with a specific transaction hash
     */
    function getTagsByTx(bytes32 txHash) external view returns (Tag[] memory) {
        uint256[] memory ids = _txToTagIds[txHash];
        Tag[] memory result = new Tag[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = tags[ids[i]];
        }
        return result;
    }

    /**
     * @notice Get all tags created by a specific user or organization
     */
    function getTagsByTagger(address tagger) external view returns (Tag[] memory) {
        uint256[] memory ids = _taggerToTagIds[tagger];
        Tag[] memory result = new Tag[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = tags[ids[i]];
        }
        return result;
    }

    /**
     * @notice Get full change history for a given tag ID
     */
    function getTagHistory(uint256 tagId) external view returns (TagHistoryEntry[] memory) {
        require(tags[tagId].id != 0, "Tag does not exist");
        return _tagHistories[tagId];
    }

    /**
     * @notice Get the total count of distinct tagged transactions
     */
    function getTaggedTxCount() external view returns (uint256) {
        return allTaggedTxHashes.length;
    }

    /**
     * @notice Paginated retrieval of tagged transactions
     */
    function getTaggedTxHashes(uint256 offset, uint256 limit) external view returns (bytes32[] memory) {
        uint256 total = allTaggedTxHashes.length;
        if (offset >= total) {
            return new bytes32[](0);
        }

        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }

        uint256 count = end - offset;
        bytes32[] memory slice = new bytes32[](count);
        for (uint256 i = 0; i < count; i++) {
            slice[i] = allTaggedTxHashes[offset + i];
        }
        return slice;
    }

    /**
     * @notice Batch fetch tags for multiple transactions
     */
    function getLatestTags(uint256 limit) external view returns (Tag[] memory) {
        uint256 total = nextTagId - 1;
        if (total == 0) {
            return new Tag[](0);
        }

        uint256 fetchCount = limit > total ? total : limit;
        Tag[] memory result = new Tag[](fetchCount);

        for (uint256 i = 0; i < fetchCount; i++) {
            result[i] = tags[total - i];
        }

        return result;
    }
}
