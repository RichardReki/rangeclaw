import { keccak256, toHex, encodeAbiParameters, parseUnits, type Address, type Hex } from "viem";
import { Action, type Decision, type DecisionContext } from "../types";

// --------------------------------------------------------------------------- //
// Canonical JSON                                                              //
// --------------------------------------------------------------------------- //

/// Deterministic stringify: recursively sort object keys so the same logical
/// payload always yields the same bytes (and thus the same decisionHash).
export function canonicalize(value: unknown): string {
  return JSON.stringify(sortDeep(value));
}

function sortDeep(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortDeep);
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return Object.keys(o)
      .sort()
      .reduce<Record<string, unknown>>((acc, k) => {
        acc[k] = sortDeep(o[k]);
        return acc;
      }, {});
  }
  return v;
}

// --------------------------------------------------------------------------- //
// Field encoders (contract-facing)                                            //
// --------------------------------------------------------------------------- //

/// Byreal pool id (Solana base58) -> bytes32. Default: keccak256 of the address
/// string (deterministic, no extra deps). A verifier recomputes the same way.
/// (Alternative: decode the base58 pubkey to its raw 32 bytes — needs a bs58 dep.)
export function encodePoolId(poolAddress: string): Hex {
  return keccak256(toHex(poolAddress));
}

/// Decimal price -> int256 fixed-point at 1e18 (the convention documented on the
/// contract's priceLower/priceUpper fields).
export function priceToFixed1e18(price: number): bigint {
  if (!Number.isFinite(price) || price <= 0) return 0n;
  return parseUnits(price.toFixed(18), 18);
}

/// USD amount -> uint256 fixed-point at 1e6 (USDC-style), for feesClaimed.
export function usdToFixed1e6(usd: number): bigint {
  if (!Number.isFinite(usd) || usd <= 0) return 0n;
  return parseUnits(usd.toFixed(6), 6);
}

// --------------------------------------------------------------------------- //
// decisionHash — commitment to the full off-chain payload                     //
// --------------------------------------------------------------------------- //

/// The canonical payload MUST embed the binding fields {chainId, contractAddress,
/// agentId, poolId, action, nonce, timestamp} so recomputing keccak256 proves all
/// on-chain index fields (see LPAgentRegistry.recordDecision NatSpec).
export function buildCanonicalPayload(decision: Decision, ctx: DecisionContext): Record<string, unknown> {
  return {
    schema: "rangeclaw.decision.v1",
    chainId: ctx.chainId,
    contractAddress: ctx.contractAddress.toLowerCase(),
    agentId: ctx.agentId,
    poolId: decision.poolId,
    action: Action[decision.action],
    actionCode: decision.action,
    nonce: decision.nonce,
    timestamp: decision.timestamp,
    newRange: decision.newRange ?? null,
    triggers: decision.triggers,
    reason: decision.reason,
    confidence: decision.confidence,
    metrics: decision.metricsSnapshot,
    pool: decision.poolSnapshot,
  };
}

export function computeDecisionHash(payload: Record<string, unknown>): Hex {
  return keccak256(toHex(canonicalize(payload)));
}

// --------------------------------------------------------------------------- //
// boundHash — MUST byte-for-byte match LPAgentRegistry.recordDecision          //
//   keccak256(abi.encode(uint256 chainId, address contract, uint256 agentId,   //
//                        uint8 action, bytes32 poolId, bytes32 decisionHash,    //
//                        uint64 timestamp))                                     //
// --------------------------------------------------------------------------- //

export interface BoundHashInput {
  chainId: number | bigint;
  contractAddress: Address;
  agentId: number | bigint;
  action: Action;
  poolId: Hex; // bytes32
  decisionHash: Hex; // bytes32
  timestamp: number | bigint;
}

export function computeBoundHash(i: BoundHashInput): Hex {
  return keccak256(
    encodeAbiParameters(
      [
        { type: "uint256" }, // block.chainid
        { type: "address" }, // address(this)
        { type: "uint256" }, // agentId
        { type: "uint8" }, // action (enum)
        { type: "bytes32" }, // poolId
        { type: "bytes32" }, // decisionHash
        { type: "uint64" }, // timestamp
      ],
      [
        BigInt(i.chainId),
        i.contractAddress,
        BigInt(i.agentId),
        i.action, // uint8 — viem expects a number here (encodes identically to a bigint)
        i.poolId,
        i.decisionHash,
        BigInt(i.timestamp),
      ],
    ),
  );
}
