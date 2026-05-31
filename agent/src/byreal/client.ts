import type { PoolState, PositionState } from "../types";

/// Abstraction over the Byreal Skills CLI (`@byreal-io/byreal-cli`, runs on Solana).
/// Implemented by MockByrealClient (offline fixtures) and CliByrealClient (real CLI).
export interface ByrealClient {
  getPool(poolId: string): Promise<PoolState>;
  getPositions(poolId: string): Promise<PositionState[]>;
}
