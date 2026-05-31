interface Pool {
  id: string;
  label: string;
}

interface Props {
  agents: number[];
  pools: Pool[];
  agent: number | "all";
  pool: string | "all";
  onAgent: (v: number | "all") => void;
  onPool: (v: string | "all") => void;
}

export function Controls({ agents, pools, agent, pool, onAgent, onPool }: Props) {
  return (
    <div className="controls">
      <label>
        Agent
        <select value={String(agent)} onChange={(e) => onAgent(e.target.value === "all" ? "all" : Number(e.target.value))}>
          <option value="all">全部</option>
          {agents.map((a) => (
            <option key={a} value={a}>
              #{a}
            </option>
          ))}
        </select>
      </label>
      <label>
        池
        <select value={pool} onChange={(e) => onPool(e.target.value)}>
          <option value="all">全部</option>
          {pools.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
