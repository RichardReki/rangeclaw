import type { Hex } from "viem";

/// Mirrors LPAgentRegistry.Action (and agent/src/types.ts).
export enum Action {
  Open = 0,
  IncreaseLiquidity = 1,
  DecreaseLiquidity = 2,
  Rebalance = 3,
  ClaimFees = 4,
  Close = 5,
}

export const ACTION_LABELS: Record<number, string> = {
  0: "Open",
  1: "Increase",
  2: "Decrease",
  3: "Rebalance",
  4: "ClaimFees",
  5: "Close",
};

export interface DecisionRow {
  decisionId: number;
  agentId: number;
  action: number;
  poolId: Hex; // bytes32
  decisionHash: Hex;
  boundHash: Hex;
  priceLower: bigint; // int256, 1e18
  priceUpper: bigint; // int256, 1e18
  feesClaimed: bigint; // uint256, 1e6
  timestamp: number; // unix seconds
  // Off-chain extras (present in demo mode / when a payload is supplied):
  canonicalPayload?: string;
  poolLabel?: string;
}

export type Mode = "live" | "demo";
