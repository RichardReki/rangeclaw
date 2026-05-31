import { useMemo, useState } from "react";
import { useRegistry } from "./useRegistry";
import { SummaryBar } from "./components/SummaryBar";
import { Controls } from "./components/Controls";
import { DecisionLog } from "./components/DecisionLog";
import { VerifyModal } from "./components/VerifyModal";
import type { DecisionRow } from "./types";

export default function App() {
  const reg = useRegistry();
  const [agent, setAgent] = useState<number | "all">("all");
  const [pool, setPool] = useState<string | "all">("all");
  const [selected, setSelected] = useState<DecisionRow | null>(null);

  const agents = useMemo(
    () => [...new Set(reg.decisions.map((d) => d.agentId))].sort((a, b) => a - b),
    [reg.decisions],
  );
  const pools = useMemo(() => {
    const m = new Map<string, string>();
    reg.decisions.forEach((d) => m.set(d.poolId, d.poolLabel ?? d.poolId));
    return [...m].map(([id, label]) => ({ id, label }));
  }, [reg.decisions]);

  const filtered = reg.decisions.filter(
    (d) => (agent === "all" || d.agentId === agent) && (pool === "all" || d.poolId === pool),
  );

  return (
    <div className="app">
      <SummaryBar
        mode={reg.mode}
        agentCount={reg.summary.agentCount}
        decisionCount={reg.summary.decisionCount}
        contract={reg.contract}
        onReload={reg.reload}
        loading={reg.loading}
      />

      {reg.mode === "demo" && reg.addrInvalid && (
        <div className="notice error">
          无效的 <code>VITE_REGISTRY_ADDRESS</code>，已回退到 DEMO 示例数据。请检查地址格式。
        </div>
      )}
      {reg.mode === "demo" && !reg.addrInvalid && (
        <div className="notice">
          DEMO 模式：未配置 <code>VITE_REGISTRY_ADDRESS</code>，展示本地示例数据。核验逻辑与链上完全一致。
        </div>
      )}
      {reg.error && <div className="notice error">读链失败：{reg.error}</div>}

      {reg.mode === "live" && reg.summary.decisionCount > reg.decisions.length && (
        <div className="notice">
          仅展示最近 {reg.decisions.length} / {reg.summary.decisionCount} 条决策，筛选范围以此为准。
        </div>
      )}

      <Controls agents={agents} pools={pools} agent={agent} pool={pool} onAgent={setAgent} onPool={setPool} />

      <DecisionLog
        decisions={filtered}
        chainId={reg.chainId}
        contract={reg.contract}
        loading={reg.loading}
        error={reg.error}
        onVerify={setSelected}
      />

      {selected && (
        <VerifyModal row={selected} chainId={reg.chainId} contract={reg.contract} onClose={() => setSelected(null)} />
      )}

      <footer className="foot">RangeClaw · The Turing Test Hackathon 2026 · Track 06 Agentic Economy（Byreal）</footer>
    </div>
  );
}
