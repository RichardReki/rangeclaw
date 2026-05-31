import {
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  http,
  type Address,
  type Chain,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { lpAgentRegistryAbi } from "./abi";
import type { RecordArgs } from "../types";

export type AttestMode = "prepare" | "simulate" | "send";

export interface PreparedTx {
  to: Address;
  data: Hex;
  functionName: "recordDecision";
  args: readonly [number, Hex, Hex, bigint, bigint, bigint];
}

export interface AttestResult {
  mode: AttestMode;
  prepared: PreparedTx;
  simulatedDecisionId?: bigint;
  txHash?: Hex;
}

export interface AttestorOptions {
  contract: Address;
  chain: Chain;
  rpcUrl?: string;
  operator?: Address; // public address; needed only for `simulate`
}

function toArgs(a: RecordArgs): PreparedTx["args"] {
  return [a.action, a.poolId, a.decisionHash, a.priceLower, a.priceUpper, a.feesClaimed];
}

export class Attestor {
  constructor(private readonly opts: AttestorOptions) {}

  /// Offline: just ABI-encode the calldata. No network, no keys. (Default path.)
  prepare(a: RecordArgs): PreparedTx {
    return {
      to: this.opts.contract,
      data: encodeFunctionData({ abi: lpAgentRegistryAbi, functionName: "recordDecision", args: toArgs(a) }),
      functionName: "recordDecision",
      args: toArgs(a),
    };
  }

  /// Read-only on-chain simulation. Needs an RPC + a public operator address.
  /// Does NOT sign or broadcast — no private key involved.
  async simulate(a: RecordArgs): Promise<bigint> {
    if (!this.opts.rpcUrl) throw new Error("simulate requires rpcUrl");
    if (!this.opts.operator) throw new Error("simulate requires operator address");
    const pc = createPublicClient({ chain: this.opts.chain, transport: http(this.opts.rpcUrl) });
    const { result } = await pc.simulateContract({
      address: this.opts.contract,
      abi: lpAgentRegistryAbi,
      functionName: "recordDecision",
      args: toArgs(a),
      account: this.opts.operator,
    });
    return result as bigint;
  }

  /// Broadcast the attestation. DISABLED unless the operator explicitly opts in.
  ///
  /// ⚠️ Guarded by ENABLE_ONCHAIN_WRITE=true + AGENT_PRIVATE_KEY (you set both).
  /// recordDecision only writes attestation data (no funds move) but still costs gas.
  /// Per CLAUDE.md §7, enabling/using a real key is the project author's action.
  async send(a: RecordArgs): Promise<Hex> {
    if (process.env.ENABLE_ONCHAIN_WRITE !== "true") {
      throw new Error("on-chain write disabled — set ENABLE_ONCHAIN_WRITE=true to allow recordDecision broadcast");
    }
    const pk = process.env.AGENT_PRIVATE_KEY;
    if (!pk) throw new Error("AGENT_PRIVATE_KEY not set");
    if (!this.opts.rpcUrl) throw new Error("send requires rpcUrl");
    const account = privateKeyToAccount(pk as Hex);
    const wc = createWalletClient({ account, chain: this.opts.chain, transport: http(this.opts.rpcUrl) });
    return wc.writeContract({
      address: this.opts.contract,
      abi: lpAgentRegistryAbi,
      functionName: "recordDecision",
      args: toArgs(a),
    });
  }

  async attest(a: RecordArgs, mode: AttestMode = "prepare"): Promise<AttestResult> {
    const prepared = this.prepare(a);
    if (mode === "prepare") return { mode, prepared };
    if (mode === "simulate") return { mode, prepared, simulatedDecisionId: await this.simulate(a) };
    return { mode, prepared, txHash: await this.send(a) };
  }
}
