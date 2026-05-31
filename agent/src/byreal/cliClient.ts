import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { ByrealClient } from "./client";
import type { PoolState, PositionState } from "../types";

const run = promisify(execFile);

/// Real ByrealClient: shells out to `byreal-cli ... -o json` (Solana).
///
/// NOTE: this only READS (pools/positions). It never runs `--confirm` mutating
/// commands — execution is built as a dry-run plan and left for you to run
/// manually (see execute/planner.ts and CLAUDE.md §7).
///
/// ⚠️ The exact byreal-cli subcommand shape / JSON schema must be confirmed against
/// `byreal-cli catalog show pools` / `positions` at runtime, then mapped below.
export class CliByrealClient implements ByrealClient {
  constructor(private readonly bin: string = "byreal-cli") {}

  private async json<T>(args: string[]): Promise<T> {
    const { stdout } = await run(this.bin, [...args, "-o", "json"], { maxBuffer: 8 * 1024 * 1024 });
    return JSON.parse(stdout) as T;
  }

  async getPool(poolId: string): Promise<PoolState> {
    // Placeholder mapping — adjust keys to the real `byreal-cli pools <id>` schema.
    const raw = await this.json<Record<string, unknown>>(["pools", poolId]);
    return {
      poolId,
      price: Number(raw.price),
      tvlUsd: Number(raw.tvlUsd ?? raw.tvl),
      volume24hUsd: Number(raw.volume24hUsd ?? raw.volume24h),
      aprPct: Number(raw.aprPct ?? raw.apr),
      volatility24hPct: Number(raw.volatility24hPct ?? raw.volatility ?? 0),
    };
  }

  async getPositions(poolId: string): Promise<PositionState[]> {
    const raw = await this.json<Array<Record<string, unknown>>>(["positions", "list"]);
    return raw
      .map((p) => ({
        positionId: String(p.positionId ?? p.id),
        poolId: String(p.poolId ?? p.pool),
        lowerPrice: Number(p.lowerPrice ?? p.lower),
        upperPrice: Number(p.upperPrice ?? p.upper),
        liquidityUsd: Number(p.liquidityUsd ?? p.liquidity),
        uncollectedFeesUsd: Number(p.uncollectedFeesUsd ?? p.fees ?? 0),
        entryPrice: Number(p.entryPrice ?? p.lowerPrice ?? p.lower),
      }))
      .filter((p) => p.poolId === poolId);
  }
}
