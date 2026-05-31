import { Action, type Metrics, type PoolState, type PositionState, type ProposedAction } from "../types";
import type { StrategyConfig } from "../config";

/// Deterministic trigger engine. Returns a ProposedAction, or null to HOLD.
/// Mirrors architecture.md §3.2. Priority: out-of-range > high-IL > near-edge > fees.
export function decideAction(
  pool: PoolState,
  _position: PositionState,
  metrics: Metrics,
  cfg: StrategyConfig,
): ProposedAction | null {
  const triggers: string[] = [];

  // 1. Price left the range -> rebalance around current price.
  if (!metrics.inRange) {
    triggers.push("price-out-of-range");
    return rebalance(pool, cfg, triggers, widthFor(pool, cfg));
  }

  // 2. Impermanent loss too high -> de-risk by pulling liquidity.
  if (metrics.estimatedIlPct > cfg.maxIlPct) {
    triggers.push(`il>${cfg.maxIlPct}%`);
    return { action: Action.DecreaseLiquidity, claimFeesFirst: true, triggers };
  }

  // 3. Close to a range edge -> proactive rebalance (wider in high vol).
  if (metrics.rangeUtilization > cfg.rebalanceUtil) {
    triggers.push(`range-util>${cfg.rebalanceUtil}`);
    return rebalance(pool, cfg, triggers, widthFor(pool, cfg));
  }

  // 4. Fees worth harvesting -> claim.
  if (metrics.uncollectedFeesUsd > cfg.claimFeesUsd) {
    triggers.push(`fees>$${cfg.claimFeesUsd}`);
    return { action: Action.ClaimFees, claimFeesFirst: false, triggers };
  }

  return null; // HOLD
}

function widthFor(pool: PoolState, cfg: StrategyConfig): number {
  return pool.volatility24hPct > cfg.highVolPct ? cfg.wideRangeWidthPct : cfg.rangeWidthPct;
}

function rebalance(
  pool: PoolState,
  cfg: StrategyConfig,
  triggers: string[],
  widthPct: number,
): ProposedAction {
  if (pool.volatility24hPct > cfg.highVolPct && !triggers.some((t) => t.startsWith("vol"))) {
    triggers.push(`vol>${cfg.highVolPct}%`);
  }
  const w = widthPct / 100;
  return {
    action: Action.Rebalance,
    claimFeesFirst: true,
    triggers,
    newRange: { lowerPrice: pool.price * (1 - w), upperPrice: pool.price * (1 + w) },
  };
}
