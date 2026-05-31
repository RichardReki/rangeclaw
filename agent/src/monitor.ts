import type { Metrics, PoolState, PositionState } from "./types";

/// Derive the decision-relevant metrics from a pool + position snapshot.
export function computeMetrics(pool: PoolState, position: PositionState): Metrics {
  const { price } = pool;
  const { lowerPrice, upperPrice, entryPrice, uncollectedFeesUsd } = position;

  const inRange = price >= lowerPrice && price <= upperPrice;

  let rangeUtilization: number;
  if (!inRange) {
    rangeUtilization = 1;
  } else {
    const mid = (lowerPrice + upperPrice) / 2;
    const half = (upperPrice - lowerPrice) / 2;
    rangeUtilization = half > 0 ? Math.min(1, Math.abs(price - mid) / half) : 1;
  }

  return {
    inRange,
    rangeUtilization,
    uncollectedFeesUsd,
    estimatedIlPct: estimateIlPct(price, entryPrice),
  };
}

/// Simplified impermanent-loss estimate vs. holding, for a price ratio r = now/entry.
/// IL fraction = 2*sqrt(r)/(1+r) - 1  (<= 0); returned as a positive magnitude in %.
/// This is an approximation (full-range AMM form), adequate for triggering a de-risk.
export function estimateIlPct(priceNow: number, entryPrice: number): number {
  if (entryPrice <= 0 || priceNow <= 0) return 0;
  const r = priceNow / entryPrice;
  const il = (2 * Math.sqrt(r)) / (1 + r) - 1;
  return Math.abs(il) * 100;
}
