import { Action, type Decision, type PositionState } from "../types";

export interface ExecutionPlan {
  /// Safe, non-mutating commands the agent may run to validate the plan.
  dryRun: string[];
  /// The real mutating commands — printed for YOU to review and run manually
  /// (drop --dry-run / add --confirm). The agent never runs these. (CLAUDE.md §7)
  manualConfirm: string[];
}

/// Translate a decision into a Byreal CLI command sequence. Commands are illustrative;
/// confirm exact flags via `byreal-cli catalog show positions|swap` at runtime.
export function buildExecutionPlan(decision: Decision, position: PositionState): ExecutionPlan {
  const dryRun: string[] = [];
  const manualConfirm: string[] = [];
  const pos = position.positionId;

  const add = (cmd: string) => {
    dryRun.push(`${cmd} --dry-run`);
    manualConfirm.push(`${cmd} --confirm`);
  };

  if (decision.claimFeesFirst || decision.action === Action.ClaimFees) {
    add(`byreal-cli positions claim ${pos}`);
  }

  switch (decision.action) {
    case Action.Rebalance: {
      add(`byreal-cli positions close ${pos}`);
      add(`byreal-cli swap --auto-swap --pool ${decision.poolId}`);
      if (decision.newRange) {
        add(
          `byreal-cli positions open --pool ${decision.poolId} ` +
            `--lower ${decision.newRange.lowerPrice.toFixed(6)} --upper ${decision.newRange.upperPrice.toFixed(6)}`,
        );
      }
      break;
    }
    case Action.DecreaseLiquidity:
      add(`byreal-cli positions decrease ${pos} --percent 50`);
      break;
    case Action.Close:
      add(`byreal-cli positions close ${pos}`);
      break;
    case Action.IncreaseLiquidity:
      add(`byreal-cli positions increase ${pos}`);
      break;
    case Action.Open:
      if (decision.newRange) {
        add(
          `byreal-cli positions open --pool ${decision.poolId} ` +
            `--lower ${decision.newRange.lowerPrice.toFixed(6)} --upper ${decision.newRange.upperPrice.toFixed(6)}`,
        );
      }
      break;
    case Action.ClaimFees:
      // claim already added above
      break;
  }

  return { dryRun, manualConfirm };
}
