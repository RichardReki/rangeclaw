import "dotenv/config";
import { createPublicClient, createWalletClient, http, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { Action, type DecisionContext } from "./types";
import { loadRuntime, loadStrategy, mantleSepolia } from "./config";
import { MockByrealClient } from "./byreal/mockClient";
import { MockReasoner } from "./decide/llm";
import { Attestor } from "./attest/attestor";
import { runOnce, type RunResult } from "./orchestrator";
import { lpAgentRegistryAbi } from "./attest/abi";
import { buildCanonicalPayload, canonicalize } from "./attest/hash";

const ZERO = "0x0000000000000000000000000000000000000000";
const FIXED = { now: 1_750_000_000, nonce: 1 }; // reproducible decisionHash

/// Records ONE real agent decision on-chain (registerAgent if needed, then recordDecision).
///
/// PREVIEW (no key): prints exactly what WOULD be written — no broadcast.
/// LIVE: set ENABLE_ONCHAIN_WRITE=true + AGENT_PRIVATE_KEY (your burner) to broadcast.
/// Config via agent/.env: REGISTRY_ADDRESS, MANTLE_SEPOLIA_RPC_URL, (BYREAL_POOL_ID).
async function main() {
  const runtime = loadRuntime();
  const strategy = loadStrategy();
  const chain = mantleSepolia(runtime.rpcUrl);

  if (runtime.contractAddress.toLowerCase() === ZERO) {
    throw new Error("REGISTRY_ADDRESS 未设——先在 agent/.env 填部署的合约地址");
  }

  const live = process.env.ENABLE_ONCHAIN_WRITE === "true" && !!process.env.AGENT_PRIVATE_KEY;

  if (!live) {
    const ctx: DecisionContext = {
      chainId: runtime.chainId,
      contractAddress: runtime.contractAddress,
      agentId: 1, // the id the first registered agent will receive
      poolId: runtime.poolId,
    };
    const deps = {
      byreal: MockByrealClient.withDefault(runtime.poolId),
      reasoner: new MockReasoner(),
      attestor: new Attestor({ contract: runtime.contractAddress, chain, rpcUrl: runtime.rpcUrl }),
      strategy,
    };
    const r = await runOnce(deps, ctx, { mode: "prepare", ...FIXED });
    console.log("\n=== PREVIEW（将要写上链的决策，未广播、未用私钥）===");
    report(r, ctx);
    console.log(
      "\n要真正写上链：在 agent/.env 设 ENABLE_ONCHAIN_WRITE=true + AGENT_PRIVATE_KEY=你的burner私钥，再 `npm run record`。",
    );
    return;
  }

  // ---- LIVE ----
  const account = privateKeyToAccount(process.env.AGENT_PRIVATE_KEY as Hex);
  const operator = account.address;
  const pub = createPublicClient({ chain, transport: http(runtime.rpcUrl) });
  const wallet = createWalletClient({ account, chain, transport: http(runtime.rpcUrl) });

  let agentId = Number(
    await pub.readContract({
      address: runtime.contractAddress,
      abi: lpAgentRegistryAbi,
      functionName: "agentIdByOperator",
      args: [operator],
    }),
  );
  if (agentId === 0) {
    console.log(`registerAgent(${operator}) ...`);
    const h = await wallet.writeContract({
      address: runtime.contractAddress,
      abi: lpAgentRegistryAbi,
      functionName: "registerAgent",
      args: [operator, "https://github.com/RichardReki/rangeclaw"],
    });
    await pub.waitForTransactionReceipt({ hash: h });
    agentId = Number(
      await pub.readContract({
        address: runtime.contractAddress,
        abi: lpAgentRegistryAbi,
        functionName: "agentIdByOperator",
        args: [operator],
      }),
    );
    console.log(`  -> agentId=${agentId} (tx ${h})`);
  } else {
    console.log(`already registered: agentId=${agentId}`);
  }

  const ctx: DecisionContext = {
    chainId: runtime.chainId,
    contractAddress: runtime.contractAddress,
    agentId,
    poolId: runtime.poolId,
  };
  const deps = {
    byreal: MockByrealClient.withDefault(runtime.poolId),
    reasoner: new MockReasoner(),
    attestor: new Attestor({ contract: runtime.contractAddress, chain, rpcUrl: runtime.rpcUrl, operator }),
    strategy,
  };
  const r = await runOnce(deps, ctx, { mode: "send", ...FIXED });
  console.log("\n=== 已写上链 ===");
  if (r.status === "acted") console.log(`tx: ${r.attestation.txHash}`);
  report(r, ctx);
  console.log("\n看板 LIVE 模式打开这条记录 → 核验 → 粘下面 canonical JSON → decisionHash ✓ / boundHash ✓");
}

function report(r: RunResult, ctx: DecisionContext) {
  if (r.status !== "acted") {
    console.log(`HOLD — ${r.reason}`);
    return;
  }
  console.log(`action:       ${Action[r.decision.action]}  | pool: ${r.decision.poolId}`);
  console.log(`poolId(b32):  ${r.poolIdBytes32}`);
  console.log(`decisionHash: ${r.decisionHash}`);
  console.log("--- canonical JSON（核验用，复制整段）---");
  console.log(canonicalize(buildCanonicalPayload(r.decision, ctx)));
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
