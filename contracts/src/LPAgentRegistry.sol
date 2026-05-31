// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title LPAgentRegistry
/// @author RangeClaw (AI LP 做市管家)
/// @notice Append-only, tamper-evident on-chain record of an AI liquidity-management
///         agent's autonomous decisions.
///
///         IMPORTANT (bridge-not-call): the actual liquidity lives on Byreal, a CLMM
///         DEX on Solana. This Mantle contract does NOT hold positions, custody funds,
///         or call Byreal. It is a verifiable attestation log of WHAT the agent decided
///         and did. The full decision payload is stored off-chain; only its keccak256
///         commitment (`decisionHash`) plus a derived `boundHash` and a few human-readable
///         index fields are stored on-chain, so anyone can verify the agent's behaviour
///         was not altered or replayed after the fact.
contract LPAgentRegistry {
    // --------------------------------------------------------------------- //
    // Types                                                                 //
    // --------------------------------------------------------------------- //

    enum Action {
        Open,
        IncreaseLiquidity,
        DecreaseLiquidity,
        Rebalance,
        ClaimFees,
        Close
    }

    struct Agent {
        address operator; // key that submits records on this agent's behalf
        string metadataURI; // off-chain identity / strategy descriptor
        uint64 registeredAt;
        bool active;
    }

    struct Decision {
        uint256 agentId;
        Action action;
        bytes32 poolId; // Byreal (Solana) pool identifier, encoded/hashed
        bytes32 decisionHash; // keccak256 commitment to the full off-chain decision payload
        bytes32 boundHash; // on-chain binding of {chainId,contract,agentId,action,poolId,decisionHash,ts}
        int256 priceLower; // range lower bound, price of base in quote, fixed-point 1e18; 0 if n/a
        int256 priceUpper; // range upper bound, price of base in quote, fixed-point 1e18; 0 if n/a
        uint256 feesClaimed; // fees claimed by this action (caller-scaled), 0 if n/a
        uint64 timestamp; // block timestamp at record time
    }

    // --------------------------------------------------------------------- //
    // Storage                                                               //
    // --------------------------------------------------------------------- //

    address public owner;
    uint256 public nextAgentId = 1; // agentId 0 is reserved as "unregistered"

    mapping(uint256 => Agent) public agents;
    mapping(address => uint256) public agentIdByOperator; // operator => agentId (0 = none)

    Decision[] private _decisions;
    mapping(uint256 => uint256[]) private _decisionIdsByAgent; // agentId => decisionIds

    // --------------------------------------------------------------------- //
    // Events                                                                //
    // --------------------------------------------------------------------- //

    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);
    event AgentRegistered(uint256 indexed agentId, address indexed operator, string metadataURI);
    event AgentOperatorUpdated(uint256 indexed agentId, address indexed oldOperator, address indexed newOperator);
    event AgentMetadataUpdated(uint256 indexed agentId, string metadataURI);
    event AgentDeactivated(uint256 indexed agentId);
    event AgentReactivated(uint256 indexed agentId);
    event DecisionRecorded(
        uint256 indexed decisionId,
        uint256 indexed agentId,
        bytes32 indexed poolId,
        Action action,
        bytes32 decisionHash,
        bytes32 boundHash,
        uint64 timestamp
    );

    // --------------------------------------------------------------------- //
    // Errors                                                                //
    // --------------------------------------------------------------------- //

    error NotOwner();
    error NotAgentOperator();
    error AgentNotActive();
    error OperatorAlreadyRegistered();
    error ZeroAddress();
    error ZeroHash();
    error UnknownAgent();
    error IndexOutOfBounds();

    // --------------------------------------------------------------------- //
    // Modifiers                                                             //
    // --------------------------------------------------------------------- //

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    // --------------------------------------------------------------------- //
    // Owner / admin                                                         //
    // --------------------------------------------------------------------- //

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        address old = owner;
        owner = newOwner;
        emit OwnershipTransferred(old, newOwner);
    }

    /// @notice Register a new agent identity. Only the owner can onboard agents.
    function registerAgent(address operator, string calldata metadataURI)
        external
        onlyOwner
        returns (uint256 agentId)
    {
        if (operator == address(0)) revert ZeroAddress();
        if (agentIdByOperator[operator] != 0) revert OperatorAlreadyRegistered();

        agentId = nextAgentId++;
        agents[agentId] =
            Agent({operator: operator, metadataURI: metadataURI, registeredAt: uint64(block.timestamp), active: true});
        agentIdByOperator[operator] = agentId;

        emit AgentRegistered(agentId, operator, metadataURI);
    }

    /// @notice Rotate the operator key of an agent (e.g. key compromise).
    function updateAgentOperator(uint256 agentId, address newOperator) external onlyOwner {
        Agent storage a = agents[agentId];
        if (a.operator == address(0)) revert UnknownAgent();
        if (newOperator == address(0)) revert ZeroAddress();
        if (agentIdByOperator[newOperator] != 0) revert OperatorAlreadyRegistered();

        address old = a.operator;
        delete agentIdByOperator[old];
        a.operator = newOperator;
        agentIdByOperator[newOperator] = agentId;

        emit AgentOperatorUpdated(agentId, old, newOperator);
    }

    function updateAgentMetadata(uint256 agentId, string calldata metadataURI) external onlyOwner {
        Agent storage a = agents[agentId];
        if (a.operator == address(0)) revert UnknownAgent();
        a.metadataURI = metadataURI;
        emit AgentMetadataUpdated(agentId, metadataURI);
    }

    function deactivateAgent(uint256 agentId) external onlyOwner {
        Agent storage a = agents[agentId];
        if (a.operator == address(0)) revert UnknownAgent();
        a.active = false;
        emit AgentDeactivated(agentId);
    }

    /// @notice Re-enable a previously deactivated agent. Supports the key-compromise
    ///         recovery flow: deactivate -> rotate operator -> reactivate. History is
    ///         never affected by (de)activation.
    function reactivateAgent(uint256 agentId) external onlyOwner {
        Agent storage a = agents[agentId];
        if (a.operator == address(0)) revert UnknownAgent();
        a.active = true;
        emit AgentReactivated(agentId);
    }

    // --------------------------------------------------------------------- //
    // Agent: record a decision (append-only)                                //
    // --------------------------------------------------------------------- //

    /// @notice Append a decision record. Attributed to the caller's agent via msg.sender.
    /// @dev Append-only: there is intentionally no function to mutate or delete a record.
    ///      `decisionHash` MUST be keccak256 over a canonical JSON that itself embeds
    ///      {chainId, contractAddress, agentId, poolId, action, timestamp/nonce}. The
    ///      contract additionally derives `boundHash` over those exact on-chain fields, so a
    ///      verifier can detect any cross-agent / cross-pool replay or index-field swap.
    ///      Reverts on a zero `decisionHash` so every record carries a real commitment.
    function recordDecision(
        Action action,
        bytes32 poolId,
        bytes32 decisionHash,
        int256 priceLower,
        int256 priceUpper,
        uint256 feesClaimed
    ) external returns (uint256 decisionId) {
        uint256 agentId = agentIdByOperator[msg.sender];
        if (agentId == 0) revert NotAgentOperator();
        if (!agents[agentId].active) revert AgentNotActive();
        if (decisionHash == bytes32(0)) revert ZeroHash();

        uint64 ts = uint64(block.timestamp);
        bytes32 boundHash =
            keccak256(abi.encode(block.chainid, address(this), agentId, action, poolId, decisionHash, ts));

        decisionId = _decisions.length;
        _decisions.push(
            Decision({
                agentId: agentId,
                action: action,
                poolId: poolId,
                decisionHash: decisionHash,
                boundHash: boundHash,
                priceLower: priceLower,
                priceUpper: priceUpper,
                feesClaimed: feesClaimed,
                timestamp: ts
            })
        );
        _decisionIdsByAgent[agentId].push(decisionId);

        emit DecisionRecorded(decisionId, agentId, poolId, action, decisionHash, boundHash, ts);
    }

    // --------------------------------------------------------------------- //
    // Views                                                                 //
    // --------------------------------------------------------------------- //

    /// @notice Number of registered agents (ids are 1..agentCount).
    function agentCount() external view returns (uint256) {
        return nextAgentId - 1;
    }

    function decisionCount() external view returns (uint256) {
        return _decisions.length;
    }

    function getDecision(uint256 decisionId) external view returns (Decision memory) {
        if (decisionId >= _decisions.length) revert IndexOutOfBounds();
        return _decisions[decisionId];
    }

    /// @notice Paginated global decision feed (across all agents). `limit` is clamped to the remainder.
    function getDecisions(uint256 offset, uint256 limit) external view returns (Decision[] memory page) {
        uint256 len = _decisions.length;
        if (offset >= len) {
            return new Decision[](0);
        }
        uint256 remaining = len - offset;
        uint256 count = limit < remaining ? limit : remaining;
        page = new Decision[](count);
        for (uint256 i = 0; i < count; ++i) {
            page[i] = _decisions[offset + i];
        }
    }

    function agentDecisionCount(uint256 agentId) external view returns (uint256) {
        return _decisionIdsByAgent[agentId].length;
    }

    function agentDecisionIdAt(uint256 agentId, uint256 index) external view returns (uint256) {
        uint256[] storage ids = _decisionIdsByAgent[agentId];
        if (index >= ids.length) revert IndexOutOfBounds();
        return ids[index];
    }

    /// @notice Paginated read of one agent's decisions. `limit` is clamped to the remainder.
    function getAgentDecisions(uint256 agentId, uint256 offset, uint256 limit)
        external
        view
        returns (Decision[] memory page)
    {
        uint256[] storage ids = _decisionIdsByAgent[agentId];
        uint256 len = ids.length;
        if (offset >= len) {
            return new Decision[](0);
        }
        uint256 remaining = len - offset;
        uint256 count = limit < remaining ? limit : remaining;
        page = new Decision[](count);
        for (uint256 i = 0; i < count; ++i) {
            page[i] = _decisions[ids[offset + i]];
        }
    }
}
