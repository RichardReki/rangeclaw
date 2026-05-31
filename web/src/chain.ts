import { createPublicClient, defineChain, http, type Chain, type PublicClient } from "viem";

/// Mantle Sepolia (chainId 5003). Keep in sync with agent/src/config.ts.
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

export function makePublicClient(rpcUrl?: string): PublicClient {
  return createPublicClient({ chain: mantleSepolia(rpcUrl), transport: http(rpcUrl) });
}

export function explorerTxBase(): string {
  return "https://explorer.sepolia.mantle.xyz";
}
