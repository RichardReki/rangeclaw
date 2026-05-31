import { useCallback, useEffect, useState } from "react";
import { isAddress, type Address } from "viem";
import { makePublicClient } from "./chain";
import { fetchDecisions, fetchSummary } from "./registry";
import { MOCK_CHAIN_ID, MOCK_CONTRACT, MOCK_DECISIONS } from "./mockData";
import type { DecisionRow, Mode } from "./types";

const ZERO = "0x0000000000000000000000000000000000000000";

export interface RegistryState {
  mode: Mode;
  loading: boolean;
  error?: string;
  addrInvalid: boolean;
  chainId: number;
  contract: Address;
  summary: { agentCount: number; decisionCount: number };
  decisions: DecisionRow[]; // newest first
}

export function useRegistry() {
  const envAddr = import.meta.env.VITE_REGISTRY_ADDRESS;
  const rpcUrl = import.meta.env.VITE_RPC_URL;
  const envChain = Number(import.meta.env.VITE_CHAIN_ID || "5003");
  const hasAddr = !!envAddr && envAddr.toLowerCase() !== ZERO;
  const addrInvalid = hasAddr && !isAddress(envAddr);
  const live = hasAddr && isAddress(envAddr);

  const [state, setState] = useState<RegistryState>({
    mode: live ? "live" : "demo",
    loading: true,
    addrInvalid,
    chainId: live ? envChain : MOCK_CHAIN_ID,
    contract: live ? (envAddr as Address) : MOCK_CONTRACT,
    summary: { agentCount: 0, decisionCount: 0 },
    decisions: [],
  });

  const load = useCallback(async () => {
    if (!live) {
      const agents = new Set(MOCK_DECISIONS.map((d) => d.agentId));
      setState((s) => ({
        ...s,
        loading: false,
        mode: "demo",
        summary: { agentCount: agents.size, decisionCount: MOCK_DECISIONS.length },
        decisions: [...MOCK_DECISIONS].reverse(),
      }));
      return;
    }
    try {
      setState((s) => ({ ...s, loading: true, error: undefined }));
      const client = makePublicClient(rpcUrl);
      const address = envAddr as Address;
      const summary = await fetchSummary(client, address);
      const limit = Math.min(summary.decisionCount, 100);
      const start = Math.max(0, summary.decisionCount - limit);
      const decisions = await fetchDecisions(client, address, start, limit);
      setState((s) => ({ ...s, loading: false, mode: "live", summary, decisions: decisions.reverse() }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: (e as Error).message }));
    }
  }, [live, envAddr, rpcUrl]);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...state, reload: load };
}
