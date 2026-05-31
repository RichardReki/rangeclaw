import { encodeAbiParameters, keccak256, toHex, type Address, type Hex } from "viem";

// =========================================================================== //
//  ⚠️ KEEP BYTE-FOR-BYTE IN SYNC with agent/src/attest/hash.ts and the         //
//     boundHash derivation in contracts/src/LPAgentRegistry.sol.               //
//     If these drift, on-chain verification will silently fail.                //
// =========================================================================== //

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

export function computeDecisionHash(payload: unknown): Hex {
  return keccak256(toHex(canonicalize(payload)));
}

export function encodePoolId(poolAddress: string): Hex {
  return keccak256(toHex(poolAddress));
}

export interface BoundHashInput {
  chainId: number | bigint;
  contractAddress: Address;
  agentId: number | bigint;
  action: number;
  poolId: Hex;
  decisionHash: Hex;
  timestamp: number | bigint;
}

export function computeBoundHash(i: BoundHashInput): Hex {
  return keccak256(
    encodeAbiParameters(
      [
        { type: "uint256" },
        { type: "address" },
        { type: "uint256" },
        { type: "uint8" },
        { type: "bytes32" },
        { type: "bytes32" },
        { type: "uint64" },
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

// =========================================================================== //
//  Verification helpers used by the dashboard                                  //
// =========================================================================== //

const eq = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

export interface OnchainRow {
  agentId: number;
  action: number;
  poolId: Hex;
  decisionHash: Hex;
  boundHash: Hex;
  timestamp: number;
}

/// Recompute boundHash purely from the on-chain row (no off-chain data needed).
/// Proves the displayed index fields {agentId, action, poolId, decisionHash, ts}
/// are exactly the ones the contract bound — i.e. the row is authentic and not
/// index-swapped. Always passes for genuine on-chain data.
export function verifyBoundHash(row: OnchainRow, chainId: number, contractAddress: Address): {
  ok: boolean;
  computed: Hex;
} {
  const computed = computeBoundHash({
    chainId,
    contractAddress,
    agentId: row.agentId,
    action: row.action,
    poolId: row.poolId,
    decisionHash: row.decisionHash,
    timestamp: row.timestamp,
  });
  return { ok: eq(computed, row.boundHash), computed };
}

export interface PayloadVerifyResult {
  ok: boolean;
  error?: string;
  computedDecisionHash?: Hex;
  decisionHashMatch?: boolean;
  boundHashMatch?: boolean;
}

/// Full verification: recompute decisionHash from the off-chain canonical JSON and
/// compare to the on-chain decisionHash (proves payload integrity), then recompute
/// boundHash from {on-chain index fields + recomputed decisionHash} and compare to
/// the on-chain boundHash (proves the payload is bound to this exact row).
export function verifyPayload(
  row: OnchainRow,
  canonicalJson: string,
  chainId: number,
  contractAddress: Address,
): PayloadVerifyResult {
  let obj: unknown;
  try {
    obj = JSON.parse(canonicalJson);
  } catch (e) {
    return { ok: false, error: "JSON 解析失败：" + (e as Error).message };
  }
  const computedDecisionHash = computeDecisionHash(obj);
  const decisionHashMatch = eq(computedDecisionHash, row.decisionHash);
  const computedBound = computeBoundHash({
    chainId,
    contractAddress,
    agentId: row.agentId,
    action: row.action,
    poolId: row.poolId,
    decisionHash: computedDecisionHash,
    timestamp: row.timestamp,
  });
  const boundHashMatch = eq(computedBound, row.boundHash);
  return { ok: decisionHashMatch && boundHashMatch, computedDecisionHash, decisionHashMatch, boundHashMatch };
}
