import { describe, it, expect } from "vitest";
import { isHex, type Address, type Hex } from "viem";
import {
  canonicalize,
  computeBoundHash,
  computeDecisionHash,
  encodePoolId,
  priceToFixed1e18,
  usdToFixed1e6,
} from "../src/attest/hash";
import { Action } from "../src/types";

describe("canonicalize", () => {
  it("is key-order independent", () => {
    expect(canonicalize({ a: 1, b: 2 })).toBe(canonicalize({ b: 2, a: 1 }));
  });
  it("sorts nested keys deterministically", () => {
    expect(canonicalize({ z: { b: 1, a: 2 }, a: 3 })).toBe('{"a":3,"z":{"a":2,"b":1}}');
  });
});

describe("fixed point", () => {
  it("price -> 1e18", () => expect(priceToFixed1e18(1.5)).toBe(1_500_000_000_000_000_000n));
  it("usd -> 1e6", () => expect(usdToFixed1e6(41.3)).toBe(41_300_000n));
  it("non-positive -> 0", () => {
    expect(priceToFixed1e18(0)).toBe(0n);
    expect(usdToFixed1e6(-1)).toBe(0n);
  });
});

describe("computeDecisionHash", () => {
  it("is deterministic and 32 bytes", () => {
    const p = { agentId: 1, poolId: "x", action: "Rebalance" };
    const h = computeDecisionHash(p);
    expect(h).toBe(computeDecisionHash({ ...p }));
    expect(isHex(h)).toBe(true);
    expect(h.length).toBe(66);
  });
  it("changes when payload changes", () => {
    expect(computeDecisionHash({ a: 1 })).not.toBe(computeDecisionHash({ a: 2 }));
  });
});

describe("computeBoundHash (contract parity)", () => {
  const base = {
    chainId: 5003,
    contractAddress: ("0x" + "00".repeat(19) + "01") as Address,
    agentId: 1,
    action: Action.Rebalance,
    poolId: encodePoolId("poolA"),
    decisionHash: ("0x" + "ab".repeat(32)) as Hex,
    timestamp: 1_750_000_000,
  };

  it("is deterministic and a 32-byte hex", () => {
    const h = computeBoundHash(base);
    expect(h).toBe(computeBoundHash({ ...base }));
    expect(isHex(h)).toBe(true);
    expect(h.length).toBe(66);
  });

  it("binds agentId (replay across agents is detectable)", () => {
    expect(computeBoundHash(base)).not.toBe(computeBoundHash({ ...base, agentId: 2 }));
  });

  it("binds poolId (replay across pools is detectable)", () => {
    expect(computeBoundHash(base)).not.toBe(computeBoundHash({ ...base, poolId: encodePoolId("poolB") }));
  });

  it("binds action and timestamp", () => {
    expect(computeBoundHash(base)).not.toBe(computeBoundHash({ ...base, action: Action.Close }));
    expect(computeBoundHash(base)).not.toBe(computeBoundHash({ ...base, timestamp: 1_750_000_001 }));
  });
});
