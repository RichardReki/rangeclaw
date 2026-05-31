/// Read-side ABI for LPAgentRegistry. Keep in sync with contracts/src/LPAgentRegistry.sol
/// and agent/src/attest/abi.ts.
export const lpAgentRegistryAbi = [
  {
    type: "function",
    name: "agentCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "decisionCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "agents",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "operator", type: "address" },
      { name: "metadataURI", type: "string" },
      { name: "registeredAt", type: "uint64" },
      { name: "active", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "getDecisions",
    stateMutability: "view",
    inputs: [
      { name: "offset", type: "uint256" },
      { name: "limit", type: "uint256" },
    ],
    outputs: [
      {
        name: "page",
        type: "tuple[]",
        components: [
          { name: "agentId", type: "uint256" },
          { name: "action", type: "uint8" },
          { name: "poolId", type: "bytes32" },
          { name: "decisionHash", type: "bytes32" },
          { name: "boundHash", type: "bytes32" },
          { name: "priceLower", type: "int256" },
          { name: "priceUpper", type: "int256" },
          { name: "feesClaimed", type: "uint256" },
          { name: "timestamp", type: "uint64" },
        ],
      },
    ],
  },
] as const;
