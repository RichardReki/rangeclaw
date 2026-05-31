// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {LPAgentRegistry} from "../src/LPAgentRegistry.sol";

contract LPAgentRegistryTest is Test {
    LPAgentRegistry internal reg;

    address internal owner = address(this);
    address internal operator = address(0xA11CE);
    address internal operator2 = address(0xB0B);
    address internal stranger = address(0xBAD);

    bytes32 internal constant POOL = keccak256("SOL/USDC-byreal");
    bytes32 internal constant DHASH = keccak256("decision-payload-v1");

    // Mirrors of the contract events for expectEmit.
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
        LPAgentRegistry.Action action,
        bytes32 decisionHash,
        bytes32 boundHash,
        uint64 timestamp
    );

    function setUp() public {
        reg = new LPAgentRegistry();
    }

    function _expectedBound(uint256 agentId, LPAgentRegistry.Action action, bytes32 poolId, bytes32 dhash, uint64 ts)
        internal
        view
        returns (bytes32)
    {
        return keccak256(abi.encode(block.chainid, address(reg), agentId, action, poolId, dhash, ts));
    }

    // --------------------------- ownership --------------------------- //

    function test_OwnerIsDeployer() public view {
        assertEq(reg.owner(), owner);
        assertEq(reg.nextAgentId(), 1);
        assertEq(reg.agentCount(), 0);
    }

    function test_TransferOwnership() public {
        vm.expectEmit(true, true, false, false);
        emit OwnershipTransferred(owner, operator);
        reg.transferOwnership(operator);
        assertEq(reg.owner(), operator);
    }

    function test_TransferOwnership_RevertZero() public {
        vm.expectRevert(LPAgentRegistry.ZeroAddress.selector);
        reg.transferOwnership(address(0));
    }

    function test_TransferOwnership_RevertNotOwner() public {
        vm.prank(stranger);
        vm.expectRevert(LPAgentRegistry.NotOwner.selector);
        reg.transferOwnership(stranger);
    }

    // --------------------------- register ---------------------------- //

    function test_RegisterAgent() public {
        vm.expectEmit(true, true, false, true);
        emit AgentRegistered(1, operator, "ipfs://meta");
        uint256 id = reg.registerAgent(operator, "ipfs://meta");

        assertEq(id, 1);
        assertEq(reg.agentIdByOperator(operator), 1);
        assertEq(reg.agentCount(), 1);
        (address op, string memory uri,, bool active) = reg.agents(1);
        assertEq(op, operator);
        assertEq(uri, "ipfs://meta");
        assertTrue(active);
        assertEq(reg.nextAgentId(), 2);
    }

    function test_RegisterAgent_RevertNotOwner() public {
        vm.prank(stranger);
        vm.expectRevert(LPAgentRegistry.NotOwner.selector);
        reg.registerAgent(operator, "x");
    }

    function test_RegisterAgent_RevertZeroOperator() public {
        vm.expectRevert(LPAgentRegistry.ZeroAddress.selector);
        reg.registerAgent(address(0), "x");
    }

    function test_RegisterAgent_RevertDuplicateOperator() public {
        reg.registerAgent(operator, "x");
        vm.expectRevert(LPAgentRegistry.OperatorAlreadyRegistered.selector);
        reg.registerAgent(operator, "y");
    }

    // ----------------------- operator rotation ----------------------- //

    function test_UpdateAgentOperator() public {
        reg.registerAgent(operator, "x");

        vm.expectEmit(true, true, true, false);
        emit AgentOperatorUpdated(1, operator, operator2);
        reg.updateAgentOperator(1, operator2);

        assertEq(reg.agentIdByOperator(operator), 0); // old mapping cleared
        assertEq(reg.agentIdByOperator(operator2), 1);
        (address op,,,) = reg.agents(1);
        assertEq(op, operator2);
    }

    function test_UpdateAgentOperator_RevertUnknownAgent() public {
        vm.expectRevert(LPAgentRegistry.UnknownAgent.selector);
        reg.updateAgentOperator(42, operator2);
    }

    function test_UpdateAgentOperator_RevertZero() public {
        reg.registerAgent(operator, "x");
        vm.expectRevert(LPAgentRegistry.ZeroAddress.selector);
        reg.updateAgentOperator(1, address(0));
    }

    function test_UpdateAgentOperator_RevertDuplicate() public {
        reg.registerAgent(operator, "x");
        reg.registerAgent(operator2, "y");
        vm.expectRevert(LPAgentRegistry.OperatorAlreadyRegistered.selector);
        reg.updateAgentOperator(1, operator2);
    }

    function test_UpdateAgentOperator_RevertNotOwner() public {
        reg.registerAgent(operator, "x");
        vm.prank(stranger);
        vm.expectRevert(LPAgentRegistry.NotOwner.selector);
        reg.updateAgentOperator(1, operator2);
    }

    function test_OperatorRotation_OldKeyRevokedNewKeyWorks() public {
        reg.registerAgent(operator, "x");
        vm.prank(operator);
        reg.recordDecision(LPAgentRegistry.Action.Open, POOL, DHASH, 0, 0, 0);

        reg.updateAgentOperator(1, operator2);

        vm.prank(operator);
        vm.expectRevert(LPAgentRegistry.NotAgentOperator.selector);
        reg.recordDecision(LPAgentRegistry.Action.Close, POOL, DHASH, 0, 0, 0);

        vm.prank(operator2);
        uint256 did = reg.recordDecision(LPAgentRegistry.Action.Close, POOL, DHASH, 0, 0, 0);
        assertEq(did, 1);
        assertEq(reg.agentDecisionCount(1), 2); // both records attributed to the same agent
    }

    // --------------------------- metadata ---------------------------- //

    function test_UpdateAgentMetadata() public {
        reg.registerAgent(operator, "x");
        vm.expectEmit(true, false, false, true);
        emit AgentMetadataUpdated(1, "ipfs://new");
        reg.updateAgentMetadata(1, "ipfs://new");
        (, string memory uri,,) = reg.agents(1);
        assertEq(uri, "ipfs://new");
    }

    function test_UpdateAgentMetadata_RevertNotOwner() public {
        reg.registerAgent(operator, "x");
        vm.prank(stranger);
        vm.expectRevert(LPAgentRegistry.NotOwner.selector);
        reg.updateAgentMetadata(1, "y");
    }

    function test_UpdateAgentMetadata_RevertUnknownAgent() public {
        vm.expectRevert(LPAgentRegistry.UnknownAgent.selector);
        reg.updateAgentMetadata(42, "y");
    }

    // ------------------- deactivate / reactivate --------------------- //

    function test_DeactivateBlocksRecording() public {
        reg.registerAgent(operator, "x");
        vm.expectEmit(true, false, false, false);
        emit AgentDeactivated(1);
        reg.deactivateAgent(1);

        vm.prank(operator);
        vm.expectRevert(LPAgentRegistry.AgentNotActive.selector);
        reg.recordDecision(LPAgentRegistry.Action.ClaimFees, POOL, DHASH, 0, 0, 0);
    }

    function test_DeactivateAgent_RevertNotOwner() public {
        reg.registerAgent(operator, "x");
        vm.prank(stranger);
        vm.expectRevert(LPAgentRegistry.NotOwner.selector);
        reg.deactivateAgent(1);
    }

    function test_DeactivateAgent_RevertUnknownAgent() public {
        vm.expectRevert(LPAgentRegistry.UnknownAgent.selector);
        reg.deactivateAgent(42);
    }

    function test_Reactivate() public {
        reg.registerAgent(operator, "x");
        reg.deactivateAgent(1);

        vm.expectEmit(true, false, false, false);
        emit AgentReactivated(1);
        reg.reactivateAgent(1);

        vm.prank(operator);
        uint256 did = reg.recordDecision(LPAgentRegistry.Action.ClaimFees, POOL, DHASH, 0, 0, 0);
        assertEq(did, 0);
    }

    function test_Reactivate_RevertUnknownAgent() public {
        vm.expectRevert(LPAgentRegistry.UnknownAgent.selector);
        reg.reactivateAgent(42);
    }

    function test_Reactivate_RevertNotOwner() public {
        reg.registerAgent(operator, "x");
        reg.deactivateAgent(1);
        vm.prank(stranger);
        vm.expectRevert(LPAgentRegistry.NotOwner.selector);
        reg.reactivateAgent(1);
    }

    /// History must survive (de)activation — the append-only / immutability story.
    function test_DecisionSurvivesDeactivation() public {
        reg.registerAgent(operator, "x");
        vm.prank(operator);
        reg.recordDecision(LPAgentRegistry.Action.Open, POOL, DHASH, 1, 2, 3);

        reg.deactivateAgent(1);

        LPAgentRegistry.Decision memory d = reg.getDecision(0);
        assertEq(d.poolId, POOL);
        assertEq(d.decisionHash, DHASH);
        assertEq(d.feesClaimed, 3);
        assertEq(reg.decisionCount(), 1);
    }

    // ------------------------ recordDecision ------------------------- //

    function test_RecordDecision() public {
        reg.registerAgent(operator, "x");

        uint64 ts = 1_700_000_000;
        vm.warp(ts);
        bytes32 bound = _expectedBound(1, LPAgentRegistry.Action.Rebalance, POOL, DHASH, ts);

        vm.expectEmit(true, true, true, true);
        emit DecisionRecorded(0, 1, POOL, LPAgentRegistry.Action.Rebalance, DHASH, bound, ts);

        vm.prank(operator);
        uint256 did =
            reg.recordDecision(LPAgentRegistry.Action.Rebalance, POOL, DHASH, int256(97e16), int256(103e16), 5e6);

        assertEq(did, 0);
        assertEq(reg.decisionCount(), 1);
        assertEq(reg.agentDecisionCount(1), 1);
        assertEq(reg.agentDecisionIdAt(1, 0), 0);

        LPAgentRegistry.Decision memory d = reg.getDecision(0);
        assertEq(d.agentId, 1);
        assertEq(uint256(d.action), uint256(LPAgentRegistry.Action.Rebalance));
        assertEq(d.poolId, POOL);
        assertEq(d.decisionHash, DHASH);
        assertEq(d.boundHash, bound);
        assertEq(d.priceLower, int256(97e16));
        assertEq(d.priceUpper, int256(103e16));
        assertEq(d.feesClaimed, 5e6);
        assertEq(d.timestamp, ts);
    }

    /// boundHash must bind the index fields: changing the agent/pool changes the hash.
    function test_BoundHashBindsIndexFields() public {
        bytes32 b1 = _expectedBound(1, LPAgentRegistry.Action.Open, POOL, DHASH, 1);
        bytes32 bDiffAgent = _expectedBound(2, LPAgentRegistry.Action.Open, POOL, DHASH, 1);
        bytes32 bDiffPool = _expectedBound(1, LPAgentRegistry.Action.Open, keccak256("other"), DHASH, 1);
        assertTrue(b1 != bDiffAgent);
        assertTrue(b1 != bDiffPool);
    }

    function test_RecordDecision_RevertUnregistered() public {
        vm.prank(stranger);
        vm.expectRevert(LPAgentRegistry.NotAgentOperator.selector);
        reg.recordDecision(LPAgentRegistry.Action.Open, POOL, DHASH, 0, 0, 0);
    }

    function test_RecordDecision_RevertZeroHash() public {
        reg.registerAgent(operator, "x");
        vm.prank(operator);
        vm.expectRevert(LPAgentRegistry.ZeroHash.selector);
        reg.recordDecision(LPAgentRegistry.Action.Open, POOL, bytes32(0), 0, 0, 0);
    }

    function test_RecordDecision_AttributionTwoAgents() public {
        reg.registerAgent(operator, "a");
        reg.registerAgent(operator2, "b");

        vm.prank(operator);
        reg.recordDecision(LPAgentRegistry.Action.Open, POOL, DHASH, 0, 0, 0);
        vm.prank(operator2);
        reg.recordDecision(LPAgentRegistry.Action.Close, POOL, DHASH, 0, 0, 0);
        vm.prank(operator);
        reg.recordDecision(LPAgentRegistry.Action.ClaimFees, POOL, DHASH, 0, 0, 1);

        assertEq(reg.decisionCount(), 3);
        assertEq(reg.agentDecisionCount(1), 2);
        assertEq(reg.agentDecisionCount(2), 1);
        assertEq(reg.agentDecisionIdAt(1, 1), 2); // agent1's 2nd record is global id 2
    }

    function test_GetDecision_RevertOOB() public {
        vm.expectRevert(LPAgentRegistry.IndexOutOfBounds.selector);
        reg.getDecision(0);
    }

    // ------------------- global feed + agentCount -------------------- //

    function test_GlobalFeedAndAgentCount() public {
        reg.registerAgent(operator, "a");
        reg.registerAgent(operator2, "b");
        assertEq(reg.agentCount(), 2);

        vm.prank(operator);
        reg.recordDecision(LPAgentRegistry.Action.Open, POOL, DHASH, 0, 0, 0);
        vm.prank(operator2);
        reg.recordDecision(LPAgentRegistry.Action.Close, POOL, DHASH, 0, 0, 0);
        vm.prank(operator);
        reg.recordDecision(LPAgentRegistry.Action.ClaimFees, POOL, DHASH, 0, 0, 0);

        LPAgentRegistry.Decision[] memory feed = reg.getDecisions(0, 10);
        assertEq(feed.length, 3);
        assertEq(feed[0].agentId, 1);
        assertEq(feed[1].agentId, 2);
        assertEq(feed[2].agentId, 1);

        assertEq(reg.getDecisions(0, 0).length, 0); // limit 0 -> empty
        assertEq(reg.getDecisions(99, 5).length, 0); // offset past end -> empty

        LPAgentRegistry.Decision[] memory tail = reg.getDecisions(2, 100); // clamp near-end
        assertEq(tail.length, 1);
        assertEq(uint256(tail[0].action), uint256(LPAgentRegistry.Action.ClaimFees));
    }

    // --------------------------- pagination -------------------------- //

    function test_Pagination() public {
        reg.registerAgent(operator, "x");
        vm.startPrank(operator);
        for (uint256 i = 0; i < 5; ++i) {
            reg.recordDecision(LPAgentRegistry.Action.Open, POOL, DHASH, 0, 0, i);
        }
        vm.stopPrank();

        LPAgentRegistry.Decision[] memory page = reg.getAgentDecisions(1, 1, 2);
        assertEq(page.length, 2);
        assertEq(page[0].feesClaimed, 1);
        assertEq(page[1].feesClaimed, 2);

        // limit beyond end is clamped
        LPAgentRegistry.Decision[] memory tail = reg.getAgentDecisions(1, 3, 100);
        assertEq(tail.length, 2);
        assertEq(tail[1].feesClaimed, 4);

        // offset past end -> empty
        assertEq(reg.getAgentDecisions(1, 99, 10).length, 0);
        // limit 0 -> empty
        assertEq(reg.getAgentDecisions(1, 0, 0).length, 0);
    }

    /// Near-max limit must clamp, not revert (NatSpec promises clamping).
    function test_GetAgentDecisions_NoOverflowOnMaxLimit() public {
        reg.registerAgent(operator, "x");
        vm.prank(operator);
        reg.recordDecision(LPAgentRegistry.Action.Open, POOL, DHASH, 0, 0, 0);
        LPAgentRegistry.Decision[] memory page = reg.getAgentDecisions(1, 0, type(uint256).max);
        assertEq(page.length, 1);
    }

    // ----------------------- append-only fuzz ------------------------ //

    function testFuzz_RecordMonotonic(uint8 n) public {
        vm.assume(n > 0 && n <= 50);
        reg.registerAgent(operator, "x");
        vm.startPrank(operator);
        for (uint256 i = 0; i < n; ++i) {
            uint256 did = reg.recordDecision(LPAgentRegistry.Action.Rebalance, POOL, DHASH, 0, 0, 0);
            assertEq(did, i); // ids are strictly sequential & append-only
        }
        vm.stopPrank();
        assertEq(reg.decisionCount(), n);
    }
}
