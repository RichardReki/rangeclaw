import { useMemo, useState } from "react";
import type { Address } from "viem";
import type { DecisionRow } from "../types";
import { actionLabel, fmtPrice, fmtTime, fmtUsd } from "../format";
import { verifyBoundHash, verifyPayload, type PayloadVerifyResult } from "../verify";

interface Props {
  row: DecisionRow;
  chainId: number;
  contract: Address;
  onClose: () => void;
}

export function VerifyModal({ row, chainId, contract, onClose }: Props) {
  const [json, setJson] = useState(row.canonicalPayload ?? "");
  const [res, setRes] = useState<PayloadVerifyResult | null>(null);
  const [copied, setCopied] = useState(false);
  const bound = useMemo(() => verifyBoundHash(row, chainId, contract), [row, chainId, contract]);

  const range =
    row.priceLower === 0n && row.priceUpper === 0n ? "—" : `[${fmtPrice(row.priceLower)}, ${fmtPrice(row.priceUpper)}]`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>核验决策 #{row.decisionId}</h2>
          <button className="x" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="kv">
          <Field label="Agent" value={`#${row.agentId}`} />
          <Field label="动作" value={actionLabel(row.action)} />
          <Field label="时间" value={fmtTime(row.timestamp)} />
          <Field label="新区间" value={range} />
          <Field label="手续费" value={fmtUsd(row.feesClaimed)} />
          <Field label="poolId" value={row.poolId} mono />
          <Field label="decisionHash (链上)" value={row.decisionHash} mono />
          <Field label="boundHash (链上)" value={row.boundHash} mono />
        </div>

        <div className={`check ${bound.ok ? "ok" : "bad"}`}>
          {bound.ok ? "✓" : "✗"} <strong>boundHash 自洽</strong>
          ：仅凭链上数据重算，证明本行的 agentId / action / poolId / timestamp / decisionHash 正是合约绑定的那一组（未被张冠李戴）。
        </div>

        <div className="json-head">
          <label className="json-label">链下 canonical JSON（决策全文，可从 agent 输出 / IPFS 获取）</label>
          <button
            className="link"
            onClick={() => {
              void navigator.clipboard?.writeText(json);
              setCopied(true);
            }}
          >
            {copied ? "已复制" : "复制决策 JSON"}
          </button>
        </div>
        <textarea
          className="json"
          value={json}
          onChange={(e) => setJson(e.target.value)}
          rows={10}
          spellCheck={false}
          placeholder="粘贴决策的 canonical JSON…"
        />
        <button className="primary" onClick={() => setRes(verifyPayload(row, json, chainId, contract))}>
          重算 keccak256 并比对
        </button>

        {res && <ResultView row={row} res={res} />}
      </div>
    </div>
  );
}

function ResultView({ row, res }: { row: DecisionRow; res: PayloadVerifyResult }) {
  if (res.error) return <div className="check bad">✗ {res.error}</div>;
  return (
    <div className="result">
      <div className={`check ${res.decisionHashMatch ? "ok" : "bad"}`}>
        {res.decisionHashMatch ? "✓" : "✗"} <strong>decisionHash 匹配</strong>：重算 keccak256(canonical JSON) ={" "}
        {res.decisionHashMatch ? "链上值一致，全文未被篡改" : "与链上不一致"}
      </div>
      <div className={`check ${res.boundHashMatch ? "ok" : "bad"}`}>
        {res.boundHashMatch ? "✓" : "✗"} <strong>boundHash 匹配</strong>：该全文确实绑定到本行索引字段
      </div>
      <div className="hashes">
        <div>
          <span className="dim">computed</span>
          <code>{res.computedDecisionHash}</code>
        </div>
        <div>
          <span className="dim">on-chain&nbsp;</span>
          <code>{row.decisionHash}</code>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="field">
      <span className="k">{label}</span>
      <span className={`v ${mono ? "mono" : ""}`}>{value}</span>
    </div>
  );
}
