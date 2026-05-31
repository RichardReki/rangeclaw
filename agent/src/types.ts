import type { Address, Hex } from "viem";

/// On-chain Action enum — MUST match LPAgentRegistry.Action order exactly.
export enum Action {
  Open = 0,
  IncreaseLiquidity = 1,
  DecreaseLiquidity = 2,
  Rebalance = 3,
  ClaimFees = 4,
  Close = 5,
}

export interface PoolState {
  poolId: string; // Byreal (Solana) pool address, base58
  price: number; // current price of base in quote
  tvlUsd: number;
  volume24hUsd: number;
  aprPct: number;
  volatility24hPct: number;
}

export interface PositionState {
  positionId: string;
  poolId: string;
  lowerPrice: number;
  upperPrice: number;
  liquidityUsd: number;
  uncollectedFeesUsd: number;
  entryPrice: number; // price at open, for IL estimate
}

export interface Metrics {
  inRange: boolean;
  rangeUtilization: number; // 0 (centred) .. 1 (at edge / out of range)
  uncollectedFeesUsd: number;
  estimatedIlPct: number; // magnitude, %
}

export interface PriceRange {
  lowerPrice: number;
  upperPrice: number;
}

/// Output of the deterministic rule engine.
export interface ProposedAction {
  action: Action;
  claimFeesFirst: boolean;
  triggers: string[];
  newRange?: PriceRange;
}

/// Full decision: rule output + reasoning + snapshots, ready to hash & attest.
export interface Decision extends ProposedAction {
  agentId: number;
  poolId: string;
  reason: string;
  confidence: number;
  metricsSnapshot: Metrics;
  poolSnapshot: PoolState;
  nonce: number;
  timestamp: number; // unix seconds
}

/// Context that binds a decision to a specific chain/contract/agent (mirrors the
/// fields the contract folds into boundHash, and that the canonical JSON embeds).
export interface DecisionContext {
  chainId: number;
  contractAddress: Address;
  agentId: number;
  poolId: string;
}

/// Arguments passed to LPAgentRegistry.recordDecision.
export interface RecordArgs {
  action: Action;
  poolId: Hex; // bytes32
  decisionHash: Hex; // bytes32
  priceLower: bigint; // int256, 1e18 fixed-point
  priceUpper: bigint; // int256, 1e18 fixed-point
  feesClaimed: bigint; // uint256, 1e6 fixed-point (USDC-style)
}
