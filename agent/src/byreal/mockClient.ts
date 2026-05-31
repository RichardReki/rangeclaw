import type { ByrealClient } from "./client";
import type { PoolState, PositionState } from "../types";

export interface MockScenario {
  pool: PoolState;
  positions: PositionState[];
}

/// Default fixture: price has drifted BELOW the position's range — a classic
/// out-of-range case that should trigger a Rebalance in the demo.
export function defaultScenario(poolId: string): MockScenario {
  return {
    pool: {
      poolId,
      price: 142.5,
      tvlUsd: 3_200_000,
      volume24hUsd: 880_000,
      aprPct: 34.2,
      volatility24hPct: 4.2,
    },
    positions: [
      {
        positionId: "pos-001",
        poolId,
        lowerPrice: 150.0, // current 142.5 is below -> out of range
        upperPrice: 170.0,
        liquidityUsd: 12_500,
        uncollectedFeesUsd: 41.3,
        entryPrice: 160.0,
      },
    ],
  };
}

/// Offline ByrealClient backed by a fixed scenario. Lets the whole
/// Monitor -> Decide -> Hash -> Attest pipeline run with no Solana / network.
export class MockByrealClient implements ByrealClient {
  constructor(private readonly scenario: MockScenario) {}

  static withDefault(poolId: string): MockByrealClient {
    return new MockByrealClient(defaultScenario(poolId));
  }

  async getPool(poolId: string): Promise<PoolState> {
    return { ...this.scenario.pool, poolId };
  }

  async getPositions(poolId: string): Promise<PositionState[]> {
    return this.scenario.positions.filter((p) => p.poolId === poolId);
  }
}
