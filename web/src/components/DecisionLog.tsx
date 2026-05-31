import type { Address } from "viem";
import type { DecisionRow } from "../types";
import { actionLabel, fmtPrice, fmtTime, fmtUsd, shortHex } from "../format";
import { verifyBoundHash } from "../verify";

interface Props {
  decisions: DecisionRow[];
  chainId: number;
  contract: Address;
  loading: boolean;
  error?: string;
  onVerify: (r: DecisionRow) => void;
}

export function DecisionLog({ decisions, chainId, contract, loading, error, onVerify }: Props) {
  if (error) return null; // App renders the error banner; avoid a misleading "empty" state
  if (loading) return <div className="empty">加载中…</div>;
  if (decisions.length === 0) return <div className="empty">暂无决策记录</div>;

  return (
    <div className="log">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>时间</th>
            <th>Agent</th>
            <th>动作</th>
            <th>池</th>
            <th>新区间</th>
            <th>手续费</th>
            <th>decisionHash</th>
            <th>真伪</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {decisions.map((d) => {
            const b = verifyBoundHash(d, chainId, contract);
            const range =
              d.priceLower === 0n && d.priceUpper === 0n
                ? "—"
                : `[${fmtPrice(d.priceLower)}, ${fmtPrice(d.priceUpper)}]`;
            return (
              <tr key={d.decisionId}>
                <td>{d.decisionId}</td>
                <td className="mono dim">{fmtTime(d.timestamp)}</td>
                <td>#{d.agentId}</td>
                <td>
                  <span className={`act act-${d.action}`}>{actionLabel(d.action)}</span>
                </td>
                <td>{d.poolLabel ?? shortHex(d.poolId)}</td>
                <td className="mono">{range}</td>
                <td className="mono">{fmtUsd(d.feesClaimed)}</td>
                <td className="mono dim">{shortHex(d.decisionHash)}</td>
                <td>
                  <span className={`pill ${b.ok ? "ok" : "bad"}`}>{b.ok ? "✓ bound" : "✗"}</span>
                </td>
                <td>
                  <button className="link" onClick={() => onVerify(d)}>
                    核验
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
