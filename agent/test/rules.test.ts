import { describe, it, expect } from "vitest";
import { decideAction } from "../src/decide/rules";
import { computeMetrics, estimateIlPct } from "../src/monitor";
import { DEFAULT_STRATEGY } from "../src/config";
import { Action, type Metrics, type PoolState, type PositionState } from "../src/types";

const pool = (o: Partial<PoolState> = {}): PoolState => ({
  poolId: "p",
  price: 100,
  tvlUsd: 1_000_000,
  volume24hUsd: 500_000,
  aprPct: 30,
  volatility24hPct: 2,
  ...o,
});
const pos = (o: Partial<PositionState> = {}): PositionState => ({
  positionId: "x",
  poolId: "p",
  lowerPrice: 90,
  upperPrice: 110,
  liquidityUsd: 10_000,
  uncollectedFeesUsd: 0,
  entryPrice: 100,
  ...o,
});
const met = (o: Partial<Metrics> = {}): Metrics => ({
  inRange: true,
  rangeUtilization: 0.1,
  uncollectedFeesUsd: 0,
  estimatedIlPct: 0,
  ...o,
});

describe("decideAction", () => {
  it("out of range -> Rebalance with new range", () => {
    const d = decideAction(pool(), pos(), met({ inRange: false }), DEFAULT_STRATEGY);
    expect(d?.action).toBe(Action.Rebalance);
    expect(d?.triggers).toContain("price-out-of-range");
    expect(d?.newRange).toBeDefined();
    expect(d?.claimFeesFirst).toBe(true);
  });

  it("high IL -> DecreaseLiquidity (before fee/edge checks)", () => {
    const d = decideAction(pool(), pos(), met({ estimatedIlPct: 6 }), DEFAULT_STRATEGY);
    expect(d?.action).toBe(Action.DecreaseLiquidity);
  });

  it("near edge -> proactive Rebalance", () => {
    const d = decideAction(pool(), pos(), met({ rangeUtilization: 0.9 }), DEFAULT_STRATEGY);
    expect(d?.action).toBe(Action.Rebalance);
    expect(d?.triggers.some((t) => t.startsWith("range-util"))).toBe(true);
  });

  it("fees over threshold -> ClaimFees", () => {
    const d = decideAction(pool(), pos(), met({ uncollectedFeesUsd: 50 }), DEFAULT_STRATEGY);
    expect(d?.action).toBe(Action.ClaimFees);
  });

  it("calm in-range -> HOLD (null)", () => {
    expect(decideAction(pool(), pos(), met(), DEFAULT_STRATEGY)).toBeNull();
  });

  it("high volatility widens the rebalance range", () => {
    const d = decideAction(pool({ volatility24hPct: 8 }), pos(), met({ inRange: false }), DEFAULT_STRATEGY);
    expect(d?.action).toBe(Action.Rebalance);
    expect(d?.triggers.some((t) => t.startsWith("vol"))).toBe(true);
    // wide width 6% around price 100 -> [94, 106]
    expect(d?.newRange?.lowerPrice).toBeCloseTo(94, 6);
    expect(d?.newRange?.upperPrice).toBeCloseTo(106, 6);
  });
});

describe("computeMetrics", () => {
  it("centred in-range -> util 0", () => {
    const m = computeMetrics(pool({ price: 100 }), pos({ lowerPrice: 90, upperPrice: 110 }));
    expect(m.inRange).toBe(true);
    expect(m.rangeUtilization).toBeCloseTo(0, 6);
  });

  it("out of range -> util 1", () => {
    const m = computeMetrics(pool({ price: 80 }), pos({ lowerPrice: 90, upperPrice: 110 }));
    expect(m.inRange).toBe(false);
    expect(m.rangeUtilization).toBe(1);
  });
});

describe("estimateIlPct", () => {
  it("no move -> 0", () => expect(estimateIlPct(100, 100)).toBeCloseTo(0, 9));
  it("price move -> positive magnitude", () => expect(estimateIlPct(160, 100)).toBeGreaterThan(0));
});
