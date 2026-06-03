import { type DecisionContext } from "./types";
import { loadRuntime, loadStrategy, mantleSepolia } from "./config";
import { MockByrealClient } from "./byreal/mockClient";
import { MockReasoner } from "./decide/llm";
import { Attestor } from "./attest/attestor";
import { runOnce } from "./orchestrator";
import { buildCanonicalPayload, canonicalize } from "./attest/hash";

/// Re-derive the canonical JSON + decisionHash for a recorded decision, given its
/// timestamp/nonce. Read-only (no chain, no key). Used to reproduce the exact JSON
/// behind an on-chain record so the dashboard's decisionHash check can be verified.
///   NOW=<unix> NONCE=<n> REGISTRY_ADDRESS=0x.. npm run recompute
async function main() {
  const now = Number(process.env.NOW ?? "1780497917");
  const nonce = Number(process.env.NONCE ?? String(now));
  const rt = loadRuntime();
  const chain = mantleSepolia(rt.rpcUrl);
  const ctx: DecisionContext = {
    chainId: rt.chainId,
    contractAddress: rt.contractAddress,
    agentId: 1,
    poolId: rt.poolId,
  };
  const deps = {
    byreal: MockByrealClient.withDefault(rt.poolId),
    reasoner: new MockReasoner(),
    attestor: new Attestor({ contract: rt.contractAddress, chain, rpcUrl: rt.rpcUrl }),
    strategy: loadStrategy(),
  };
  const r = await runOnce(deps, ctx, { mode: "prepare", now, nonce });
  if (r.status !== "acted") {
    console.log(`HOLD — ${r.reason}`);
    return;
  }
  const json = canonicalize(buildCanonicalPayload(r.decision, ctx));
  console.log(`now=${now} nonce=${nonce} chainId=${ctx.chainId} contract=${ctx.contractAddress}`);
  console.log(`decisionHash = ${r.decisionHash}`);
  console.log(`bytes        = ${Buffer.byteLength(json, "utf8")}`);
  console.log("--- canonical JSON ---");
  console.log(json);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
