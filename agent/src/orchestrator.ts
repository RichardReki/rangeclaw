import type { Hex } from "viem";
import { type Decision, type DecisionContext, type RecordArgs } from "./types";
import type { StrategyConfig } from "./config";
import type { ByrealClient } from "./byreal/client";
import type { Reasoner } from "./decide/llm";
import { Attestor, type AttestMode, type AttestResult } from "./attest/attestor";
import { computeMetrics } from "./monitor";
import { decideAction } from "./decide/rules";
import { buildExecutionPlan, type ExecutionPlan } from "./execute/planner";
import {
  buildCanonicalPayload,
  computeBoundHash,
  computeDecisionHash,
  encodePoolId,
  priceToFixed1e18,
  usdToFixed1e6,
} from "./attest/hash";
import { Action } from "./types";

export interface OrchestratorDeps {
  byreal: ByrealClient;
  reasoner: Reasoner;
  attestor: Attestor;
  strategy: StrategyConfig;
}

export interface RunOptions {
  mode?: AttestMode; // default "prepare" (offline)
  now?: number; // unix seconds (injectable for determinism)
  nonce?: number;
}

export type RunResult =
  | { status: "hold"; reason: string }
  | {
      status: "acted";
      decision: Decision;
      poolIdBytes32: Hex;
      decisionHash: Hex;
      boundHashPreview: Hex;
      recordArgs: RecordArgs;
      executionPlan: ExecutionPlan;
      attestation: AttestResult;
    };

/// One full cycle: Monitor -> Decide -> Reason -> Hash -> Plan -> Attest.
export async function runOnce(
  deps: OrchestratorDeps,
  ctx: DecisionContext,
  opts: RunOptions = {},
): Promise<RunResult> {
  const mode = opts.mode ?? "prepare";
  const now = opts.now ?? Math.floor(Date.now() / 1000);
  const nonce = opts.nonce ?? now;

  // 1. Monitor
  const pool = await deps.byreal.getPool(ctx.poolId);
  const positions = await deps.byreal.getPositions(ctx.poolId);
  const position = positions[0];
  if (!position) return { status: "hold", reason: `no managed position in pool ${ctx.poolId}` };

  const metrics = computeMetrics(pool, position);

  // 2. Decide (deterministic)
  const proposed = decideAction(pool, position, metrics, deps.strategy);
  if (!proposed) {
    return { status: "hold", reason: `in-range, util ${(metrics.rangeUtilization * 100).toFixed(0)}%, no trigger` };
  }

  // 3. Reason (AI narrative; action stays auditable)
  const { reason, confidence } = await deps.reasoner.reason({ pool, position, metrics, proposed });

  const decision: Decision = {
    ...proposed,
    agentId: ctx.agentId,
    poolId: ctx.poolId,
    reason,
    confidence,
    metricsSnapshot: metrics,
    poolSnapshot: pool,
    nonce,
    timestamp: now,
  };

  // 4. Hash (decisionHash commitment + boundHash parity preview)
  const payload = buildCanonicalPayload(decision, ctx);
  const decisionHash = computeDecisionHash(payload);
  const poolIdBytes32 = encodePoolId(ctx.poolId);
  const boundHashPreview = computeBoundHash({
    chainId: ctx.chainId,
    contractAddress: ctx.contractAddress,
    agentId: ctx.agentId,
    action: decision.action,
    poolId: poolIdBytes32,
    decisionHash,
    timestamp: now,
  });

  // 5. Execution plan (dry-run; real confirm is the operator's)
  const executionPlan = buildExecutionPlan(decision, position);

  // 6. Attest
  const claimsFees = decision.action === Action.ClaimFees || decision.claimFeesFirst;
  const recordArgs: RecordArgs = {
    action: decision.action,
    poolId: poolIdBytes32,
    decisionHash,
    priceLower: priceToFixed1e18(decision.newRange?.lowerPrice ?? 0), // 0 = range n/a (contract sentinel)
    priceUpper: priceToFixed1e18(decision.newRange?.upperPrice ?? 0),
    // In prepare/simulate mode the claim is NOT executed (CLAUDE.md §7); this is the
    // at-decision uncollected-fee SNAPSHOT, not a settled amount. Replace with the
    // byreal-cli-reported settled figure in the real send() path.
    feesClaimed: claimsFees ? usdToFixed1e6(metrics.uncollectedFeesUsd) : 0n,
  };
  const attestation = await deps.attestor.attest(recordArgs, mode);

  return {
    status: "acted",
    decision,
    poolIdBytes32,
    decisionHash,
    boundHashPreview,
    recordArgs,
    executionPlan,
    attestation,
  };
}
