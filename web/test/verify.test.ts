import { describe, it, expect } from "vitest";
import { isHex, type Address, type Hex } from "viem";
import { canonicalize, computeBoundHash, computeDecisionHash, encodePoolId, verifyBoundHash, verifyPayload } from "../src/verify";
import { Action } from "../src/types";

// These checks mirror agent/test/hash.test.ts — the two verify implementations MUST
// produce identical hashes, otherwise on-chain verification breaks.

describe("canonicalize", () => {
  it("is key-order independent", () => {
    expect(canonicalize({ a: 1, b: 2 })).toBe(canonicalize({ b: 2, a: 1 }));
  });
});

describe("boundHash binding", () => {
  const contract = ("0x" + "00".repeat(19) + "01") as Address;
  const base = {
    chainId: 5003,
    contractAddress: contract,
    agentId: 1,
    action: Action.Rebalance,
    poolId: encodePoolId("poolA"),
    decisionHash: ("0x" + "ab".repeat(32)) as Hex,
    timestamp: 1_750_000_000,
  };
  it("is deterministic, 32-byte", () => {
    const h = computeBoundHash(base);
    expect(isHex(h)).toBe(true);
    expect(h.length).toBe(66);
  });
  it("binds agentId and poolId", () => {
    expect(computeBoundHash(base)).not.toBe(computeBoundHash({ ...base, agentId: 2 }));
    expect(computeBoundHash(base)).not.toBe(computeBoundHash({ ...base, poolId: encodePoolId("poolB") }));
  });
});

describe("end-to-end verify", () => {
  const chainId = 5003;
  const contract = "0x5FbDB2315678afecb367f032d93F642f64180aa3" as Address;
  const payload = { schema: "v1", agentId: 1, poolId: "poolA", action: "Rebalance", timestamp: 100 };
  const decisionHash = computeDecisionHash(payload);
  const poolId = encodePoolId("poolA");
  const boundHash = computeBoundHash({ chainId, contractAddress: contract, agentId: 1, action: Action.Rebalance, poolId, decisionHash, timestamp: 100 });
  const row = { agentId: 1, action: Action.Rebalance, poolId, decisionHash, boundHash, timestamp: 100 };

  it("verifyBoundHash passes for authentic row", () => {
    expect(verifyBoundHash(row, chainId, contract).ok).toBe(true);
  });
  it("verifyBoundHash fails if an index field is tampered", () => {
    expect(verifyBoundHash({ ...row, agentId: 2 }, chainId, contract).ok).toBe(false);
  });
  it("verifyPayload matches for the original JSON", () => {
    const r = verifyPayload(row, JSON.stringify(payload), chainId, contract);
    expect(r.decisionHashMatch).toBe(true);
    expect(r.boundHashMatch).toBe(true);
    expect(r.ok).toBe(true);
  });
  it("verifyPayload fails for altered JSON", () => {
    const r = verifyPayload(row, JSON.stringify({ ...payload, agentId: 99 }), chainId, contract);
    expect(r.ok).toBe(false);
  });
  it("verifyPayload reports JSON parse errors", () => {
    expect(verifyPayload(row, "{bad", chainId, contract).ok).toBe(false);
  });
});
