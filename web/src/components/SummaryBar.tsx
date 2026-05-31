import type { Address } from "viem";
import type { Mode } from "../types";
import { shortHex } from "../format";
import { explorerTxBase } from "../chain";

interface Props {
  mode: Mode;
  agentCount: number;
  decisionCount: number;
  contract: Address;
  onReload: () => void;
  loading: boolean;
}

export function SummaryBar({ mode, agentCount, decisionCount, contract, onReload, loading }: Props) {
  return (
    <header className="summary">
      <div className="brand">
        <span className="logo">◆</span>
        <div>
          <h1>RangeClaw</h1>
          <p>可验证 AI 做市决策日志 · Mantle</p>
        </div>
      </div>
      <div className="stats">
        <div className="stat">
          <span className="num">{agentCount}</span>
          <span className="lbl">Agents</span>
        </div>
        <div className="stat">
          <span className="num">{decisionCount}</span>
          <span className="lbl">Decisions</span>
        </div>
        <span className={`badge ${mode}`}>{mode === "live" ? "LIVE" : "DEMO"}</span>
      </div>
      <div className="meta">
        <a className="addr" href={`${explorerTxBase()}/address/${contract}`} target="_blank" rel="noreferrer">
          {shortHex(contract, 8)}
        </a>
        <button onClick={onReload} disabled={loading}>
          {loading ? "…" : "刷新"}
        </button>
      </div>
    </header>
  );
}
