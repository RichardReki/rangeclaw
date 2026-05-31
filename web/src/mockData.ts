import { parseUnits, type Address } from "viem";
import { Action, type DecisionRow } from "./types";
import { computeBoundHash, computeDecisionHash, encodePoolId } from "./verify";

/// DEMO-mode data. Hashes are computed with the SAME functions the agent + contract
/// use, so the "verify" UI shows ✓ even without a live deployment.
export const MOCK_CHAIN_ID = 5003;
export const MOCK_CONTRACT: Address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const f18 = (n: number) => (n > 0 ? parseUnits(n.toFixed(18), 18) : 0n);
const f6 = (n: number) => (n > 0 ? parseUnits(n.toFixed(6), 6) : 0n);

interface BuildInput {
  decisionId: number;
  agentId: number;
  action: Action;
  poolAddr: string;
  poolLabel: string;
  price: number;
  newRange: { lowerPrice: number; upperPrice: number } | null;
  feesUsd: number;
  ts: number;
  reason: string;
  triggers: string[];
  confidence: number;
  metrics: { inRange: boolean; rangeUtilization: number; uncollectedFeesUsd: number; estimatedIlPct: number };
  pool: { tvlUsd: number; volume24hUsd: number; aprPct: number; volatility24hPct: number };
}

function build(i: BuildInput): DecisionRow {
  const poolId = encodePoolId(i.poolAddr);
  const payload = {
    schema: "rangeclaw.decision.v1",
    chainId: MOCK_CHAIN_ID,
    contractAddress: MOCK_CONTRACT.toLowerCase(),
    agentId: i.agentId,
    poolId: i.poolAddr,
    action: Action[i.action],
    actionCode: i.action,
    nonce: i.ts,
    timestamp: i.ts,
    newRange: i.newRange,
    triggers: i.triggers,
    reason: i.reason,
    confidence: i.confidence,
    metrics: i.metrics,
    pool: { poolId: i.poolAddr, price: i.price, ...i.pool },
  };
  const decisionHash = computeDecisionHash(payload);
  const boundHash = computeBoundHash({
    chainId: MOCK_CHAIN_ID,
    contractAddress: MOCK_CONTRACT,
    agentId: i.agentId,
    action: i.action,
    poolId,
    decisionHash,
    timestamp: i.ts,
  });
  return {
    decisionId: i.decisionId,
    agentId: i.agentId,
    action: i.action,
    poolId,
    decisionHash,
    boundHash,
    priceLower: i.newRange ? f18(i.newRange.lowerPrice) : 0n,
    priceUpper: i.newRange ? f18(i.newRange.upperPrice) : 0n,
    feesClaimed: f6(i.feesUsd),
    timestamp: i.ts,
    canonicalPayload: JSON.stringify(payload, null, 2),
    poolLabel: i.poolLabel,
  };
}

const SOL = "By1So1USDC11111111111111111111111111111111";
const ETH = "By1mETHUSDC1111111111111111111111111111111";
const T = 1_748_600_000;

export const MOCK_DECISIONS: DecisionRow[] = [
  build({
    decisionId: 0,
    agentId: 1,
    action: Action.Rebalance,
    poolAddr: SOL,
    poolLabel: "SOL/USDC",
    price: 142.5,
    newRange: { lowerPrice: 138.225, upperPrice: 146.775 },
    feesUsd: 41.3,
    ts: T,
    reason: "现价 142.5 跌破区间下沿 [150,170]，已离场。建议下移区间至 ±3% 并先收手续费。",
    triggers: ["price-out-of-range"],
    confidence: 0.85,
    metrics: { inRange: false, rangeUtilization: 1, uncollectedFeesUsd: 41.3, estimatedIlPct: 1.42 },
    pool: { tvlUsd: 3_200_000, volume24hUsd: 880_000, aprPct: 34.2, volatility24hPct: 4.2 },
  }),
  build({
    decisionId: 1,
    agentId: 2,
    action: Action.Rebalance,
    poolAddr: ETH,
    poolLabel: "mETH/USDC",
    price: 3120,
    newRange: { lowerPrice: 2932.8, upperPrice: 3307.2 },
    feesUsd: 12.0,
    ts: T + 5400,
    reason: "24h 波动率 7.8% 偏高，区间利用率 0.91 接近上沿，扩大区间至 ±6% 降低调仓频率。",
    triggers: ["range-util>0.85", "vol>5%"],
    confidence: 0.7,
    metrics: { inRange: true, rangeUtilization: 0.91, uncollectedFeesUsd: 12.0, estimatedIlPct: 2.1 },
    pool: { tvlUsd: 5_900_000, volume24hUsd: 2_100_000, aprPct: 41.0, volatility24hPct: 7.8 },
  }),
  build({
    decisionId: 2,
    agentId: 1,
    action: Action.ClaimFees,
    poolAddr: SOL,
    poolLabel: "SOL/USDC",
    price: 141.9,
    newRange: null,
    feesUsd: 28.5,
    ts: T + 12_600,
    reason: "仍在区间内，未领手续费 $28.5 超过阈值 $25，建议收取（按决策时未领额快照）。",
    triggers: ["fees>$25"],
    confidence: 0.7,
    metrics: { inRange: true, rangeUtilization: 0.34, uncollectedFeesUsd: 28.5, estimatedIlPct: 0.3 },
    pool: { tvlUsd: 3_180_000, volume24hUsd: 860_000, aprPct: 33.8, volatility24hPct: 4.0 },
  }),
  build({
    decisionId: 3,
    agentId: 1,
    action: Action.DecreaseLiquidity,
    poolAddr: SOL,
    poolLabel: "SOL/USDC",
    price: 128.0,
    newRange: null,
    feesUsd: 0,
    ts: T + 30_000,
    reason: "估计无常损失 6.1% 超过阈值 5%，建议先收手续费并撤出 50% 流动性以降风险。",
    triggers: ["il>5%"],
    confidence: 0.8,
    metrics: { inRange: false, rangeUtilization: 1, uncollectedFeesUsd: 9.2, estimatedIlPct: 6.1 },
    pool: { tvlUsd: 2_950_000, volume24hUsd: 1_240_000, aprPct: 36.5, volatility24hPct: 9.4 },
  }),
  build({
    decisionId: 4,
    agentId: 2,
    action: Action.Rebalance,
    poolAddr: ETH,
    poolLabel: "mETH/USDC",
    price: 3015,
    newRange: { lowerPrice: 2834.1, upperPrice: 3195.9 },
    feesUsd: 33.7,
    ts: T + 41_400,
    reason: "价格回落至 3015，区间利用率 0.88 接近下沿，重置区间居中。",
    triggers: ["range-util>0.85"],
    confidence: 0.7,
    metrics: { inRange: true, rangeUtilization: 0.88, uncollectedFeesUsd: 33.7, estimatedIlPct: 1.8 },
    pool: { tvlUsd: 6_050_000, volume24hUsd: 1_950_000, aprPct: 39.7, volatility24hPct: 5.1 },
  }),
];
