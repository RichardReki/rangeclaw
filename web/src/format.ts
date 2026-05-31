import { formatUnits } from "viem";
import { ACTION_LABELS } from "./types";

export function fmtPrice(v: bigint): string {
  if (v === 0n) return "—";
  return Number(formatUnits(v, 18)).toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export function fmtUsd(v: bigint): string {
  if (v === 0n) return "—";
  return "$" + Number(formatUnits(v, 6)).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function shortHex(h: string, n = 6): string {
  if (h.length <= 2 + n + 4) return h;
  return `${h.slice(0, 2 + n)}…${h.slice(-4)}`;
}

export function fmtTime(ts: number): string {
  return new Date(ts * 1000).toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

export function actionLabel(a: number): string {
  return ACTION_LABELS[a] ?? `#${a}`;
}
