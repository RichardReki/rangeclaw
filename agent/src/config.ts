import { defineChain, type Address, type Chain } from "viem";

export interface StrategyConfig {
  rangeWidthPct: number; // half-width % of a fresh range around current price
  wideRangeWidthPct: number; // wider half-width used in high-volatility regimes
  rebalanceUtil: number; // 0..1 range-utilization that triggers a proactive rebalance
  highVolPct: number; // 24h volatility % considered "high"
  claimFeesUsd: number; // uncollected-fee threshold to trigger a claim
  maxIlPct: number; // estimated-IL % threshold to de-risk
}

export const DEFAULT_STRATEGY: StrategyConfig = {
  rangeWidthPct: 3,
  wideRangeWidthPct: 6,
  rebalanceUtil: 0.85,
  highVolPct: 5,
  claimFeesUsd: 25,
  maxIlPct: 5,
};

function num(v: string | undefined, fallback: number): number {
  if (v === undefined || v.trim() === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function loadStrategy(env: NodeJS.ProcessEnv = process.env): StrategyConfig {
  return {
    rangeWidthPct: num(env.STRAT_RANGE_WIDTH_PCT, DEFAULT_STRATEGY.rangeWidthPct),
    wideRangeWidthPct: num(env.STRAT_WIDE_RANGE_WIDTH_PCT, DEFAULT_STRATEGY.wideRangeWidthPct),
    rebalanceUtil: num(env.STRAT_REBALANCE_UTIL, DEFAULT_STRATEGY.rebalanceUtil),
    highVolPct: num(env.STRAT_HIGH_VOL_PCT, DEFAULT_STRATEGY.highVolPct),
    claimFeesUsd: num(env.STRAT_CLAIM_FEES_USD, DEFAULT_STRATEGY.claimFeesUsd),
    maxIlPct: num(env.STRAT_MAX_IL_PCT, DEFAULT_STRATEGY.maxIlPct),
  };
}

export interface RuntimeConfig {
  chainId: number;
  contractAddress: Address;
  rpcUrl?: string;
  agentId: number;
  operator?: Address;
  poolId: string;
}

const ZERO: Address = "0x0000000000000000000000000000000000000000";

export function loadRuntime(env: NodeJS.ProcessEnv = process.env): RuntimeConfig {
  return {
    chainId: num(env.CHAIN_ID, 5003),
    contractAddress: (env.REGISTRY_ADDRESS as Address) || ZERO,
    rpcUrl: env.MANTLE_SEPOLIA_RPC_URL || undefined,
    agentId: num(env.AGENT_ID, 1),
    operator: (env.OPERATOR_ADDRESS as Address) || undefined,
    poolId: env.BYREAL_POOL_ID || "ByrealMockPoo1So1USDCxxxxxxxxxxxxxxxxxxxxxxxx",
  };
}

/// Mantle Sepolia (chainId 5003). RPC/explorer overridable via env; defaults are the
/// commonly-published endpoints — confirm against https://chainlist.org/chain/5003.
export function mantleSepolia(rpcUrl?: string): Chain {
  return defineChain({
    id: 5003,
    name: "Mantle Sepolia",
    nativeCurrency: { name: "Mantle", symbol: "MNT", decimals: 18 },
    rpcUrls: { default: { http: [rpcUrl || "https://rpc.sepolia.mantle.xyz"] } },
    blockExplorers: {
      default: { name: "Mantle Sepolia Explorer", url: "https://explorer.sepolia.mantle.xyz" },
    },
    testnet: true,
  });
}
