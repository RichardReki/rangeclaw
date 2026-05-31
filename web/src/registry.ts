import type { Address, PublicClient } from "viem";
import { lpAgentRegistryAbi } from "./abi";
import type { DecisionRow } from "./types";

export interface Summary {
  agentCount: number;
  decisionCount: number;
}

export async function fetchSummary(client: PublicClient, address: Address): Promise<Summary> {
  const [agentCount, decisionCount] = await Promise.all([
    client.readContract({ address, abi: lpAgentRegistryAbi, functionName: "agentCount" }),
    client.readContract({ address, abi: lpAgentRegistryAbi, functionName: "decisionCount" }),
  ]);
  return { agentCount: Number(agentCount), decisionCount: Number(decisionCount) };
}

interface RawDecision {
  agentId: bigint;
  action: number;
  poolId: `0x${string}`;
  decisionHash: `0x${string}`;
  boundHash: `0x${string}`;
  priceLower: bigint;
  priceUpper: bigint;
  feesClaimed: bigint;
  timestamp: bigint;
}

export async function fetchDecisions(
  client: PublicClient,
  address: Address,
  offset: number,
  limit: number,
): Promise<DecisionRow[]> {
  if (limit <= 0) return [];
  const page = (await client.readContract({
    address,
    abi: lpAgentRegistryAbi,
    functionName: "getDecisions",
    args: [BigInt(offset), BigInt(limit)],
  })) as unknown as readonly RawDecision[];
  return page.map((d, i) => ({
    decisionId: offset + i,
    agentId: Number(d.agentId),
    action: Number(d.action),
    poolId: d.poolId,
    decisionHash: d.decisionHash,
    boundHash: d.boundHash,
    priceLower: d.priceLower,
    priceUpper: d.priceUpper,
    feesClaimed: d.feesClaimed,
    timestamp: Number(d.timestamp),
  }));
}
