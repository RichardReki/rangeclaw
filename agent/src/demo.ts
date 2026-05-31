import "dotenv/config";
import { type DecisionContext } from "./types";
import { loadRuntime, loadStrategy, mantleSepolia } from "./config";
import { MockByrealClient } from "./byreal/mockClient";
import { MockReasoner } from "./decide/llm";
import { Attestor } from "./attest/attestor";
import { runOnce } from "./orchestrator";
import { Action } from "./types";

/// Fully offline end-to-end demo: Monitor -> Decide -> Hash -> Attest(prepare).
/// No Solana, no wallet, no API key required. Run: `npm run demo`.
async function main() {
  const runtime = loadRuntime();
  const strategy = loadStrategy();

  const ctx: DecisionContext = {
    chainId: runtime.chainId,
    contractAddress: runtime.contractAddress,
    agentId: runtime.agentId,
    poolId: runtime.poolId,
  };

  const deps = {
    byreal: MockByrealClient.withDefault(runtime.poolId),
    reasoner: new MockReasoner(),
    attestor: new Attestor({
      contract: runtime.contractAddress,
      chain: mantleSepolia(runtime.rpcUrl),
      rpcUrl: runtime.rpcUrl,
      operator: runtime.operator,
    }),
    strategy,
  };

  // Fixed timestamp for a reproducible decisionHash in the demo.
  const result = await runOnce(deps, ctx, { mode: "prepare", now: 1_750_000_000, nonce: 1 });

  console.log("\n=== RangeClaw agent — single cycle (offline demo) ===\n");
  console.log(`pool:        ${ctx.poolId}`);
  console.log(`agentId:     ${ctx.agentId}   chainId: ${ctx.chainId}   registry: ${ctx.contractAddress}`);

  if (result.status === "hold") {
    console.log(`\nDECISION: HOLD — ${result.reason}\n`);
    return;
  }

  const d = result.decision;
  console.log(`\nDECISION: ${Action[d.action]}  (confidence ${d.confidence})`);
  console.log(`triggers:    ${d.triggers.join(", ")}`);
  console.log(`reason:      ${d.reason}`);
  if (d.newRange) {
    console.log(`new range:   [${d.newRange.lowerPrice.toFixed(4)}, ${d.newRange.upperPrice.toFixed(4)}]`);
  }

  console.log("\n--- on-chain attestation (LPAgentRegistry.recordDecision) ---");
  console.log(`poolId(b32): ${result.poolIdBytes32}`);
  console.log(`decisionHash: ${result.decisionHash}`);
  console.log(`boundHash*:   ${result.boundHashPreview}   (*preview; contract derives the canonical one)`);
  console.log(`recordArgs:   action=${result.recordArgs.action} priceLower=${result.recordArgs.priceLower} ` +
    `priceUpper=${result.recordArgs.priceUpper} feesClaimed=${result.recordArgs.feesClaimed}`);
  console.log(`calldata:     ${result.attestation.prepared.data.slice(0, 74)}…`);
  console.log(`attest mode:  ${result.attestation.mode} (no broadcast)`);

  console.log("\n--- execution plan (Byreal CLI, dry-run) ---");
  result.executionPlan.dryRun.forEach((c) => console.log(`  $ ${c}`));
  console.log("\n  ↑ real execution: drop --dry-run / add --confirm and run manually (CLAUDE.md §7)\n");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
