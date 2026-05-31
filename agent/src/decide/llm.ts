import { Action, type Metrics, type PoolState, type PositionState, type ProposedAction } from "../types";

export interface ReasonInput {
  pool: PoolState;
  position: PositionState;
  metrics: Metrics;
  proposed: ProposedAction;
}

export interface ReasonOutput {
  reason: string;
  confidence: number; // 0..1
}

export interface Reasoner {
  reason(input: ReasonInput): Promise<ReasonOutput>;
}

function heuristicConfidence(proposed: ProposedAction): number {
  if (proposed.triggers.includes("price-out-of-range")) return 0.85;
  if (proposed.action === Action.DecreaseLiquidity) return 0.8;
  return 0.7;
}

/// Deterministic, key-free reasoner. Default everywhere so the pipeline runs offline.
export class MockReasoner implements Reasoner {
  async reason({ proposed, metrics, pool }: ReasonInput): Promise<ReasonOutput> {
    const range = proposed.newRange
      ? `；建议新区间 [${proposed.newRange.lowerPrice.toFixed(4)}, ${proposed.newRange.upperPrice.toFixed(4)}]`
      : "";
    const reason =
      `动作=${Action[proposed.action]}；触发：${proposed.triggers.join(", ")}。` +
      `现价 ${pool.price}，区间利用率 ${(metrics.rangeUtilization * 100).toFixed(0)}%，` +
      `未领手续费 $${metrics.uncollectedFeesUsd.toFixed(2)}，估计 IL ${metrics.estimatedIlPct.toFixed(2)}%` +
      range +
      "。";
    return { reason, confidence: heuristicConfidence(proposed) };
  }
}

/// Optional real-Claude reasoner. Produces the human narrative only; the ACTION
/// itself comes from the deterministic rule engine (auditable). Falls back to the
/// mock on any error (missing key, network, etc.) so the pipeline never breaks.
export class AnthropicReasoner implements Reasoner {
  constructor(
    private readonly model: string = "claude-opus-4-8",
    private readonly fallback: Reasoner = new MockReasoner(),
  ) {}

  async reason(input: ReasonInput): Promise<ReasonOutput> {
    try {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const client = new Anthropic(); // reads ANTHROPIC_API_KEY
      const msg = await client.messages.create({
        model: this.model,
        max_tokens: 300,
        system:
          "你是链上 CLMM 集中流动性做市的风控助手。用简体中文 2-3 句话解释这次调仓决策的理由，" +
          "聚焦风险与依据。只能基于给定数据，不要编造数字。",
        messages: [{ role: "user", content: JSON.stringify(input) }],
      });
      const text = msg.content
        .filter((b): b is { type: "text"; text: string } => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      if (!text) return this.fallback.reason(input);
      return { reason: text, confidence: heuristicConfidence(input.proposed) };
    } catch {
      return this.fallback.reason(input);
    }
  }
}
