/// Minimal ABI for LPAgentRegistry — the subset the agent + dashboard use.
/// Keep in sync with contracts/src/LPAgentRegistry.sol.
export const lpAgentRegistryAbi = [
  {
    type: "function",
    name: "recordDecision",
    stateMutability: "nonpayable",
    inputs: [
      { name: "action", type: "uint8" },
      { name: "poolId", type: "bytes32" },
      { name: "decisionHash", type: "bytes32" },
      { name: "priceLower", type: "int256" },
      { name: "priceUpper", type: "int256" },
      { name: "feesClaimed", type: "uint256" },
    ],
    outputs: [{ name: "decisionId", type: "uint256" }],
  },
  {
    type: "function",
    name: "agentIdByOperator",
    stateMutability: "view",
    inputs: [{ name: "operator", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
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
  {
    type: "event",
    name: "DecisionRecorded",
    inputs: [
      { name: "decisionId", type: "uint256", indexed: true },
      { name: "agentId", type: "uint256", indexed: true },
      { name: "poolId", type: "bytes32", indexed: true },
      { name: "action", type: "uint8", indexed: false },
      { name: "decisionHash", type: "bytes32", indexed: false },
      { name: "boundHash", type: "bytes32", indexed: false },
      { name: "timestamp", type: "uint64", indexed: false },
    ],
  },
] as const;
