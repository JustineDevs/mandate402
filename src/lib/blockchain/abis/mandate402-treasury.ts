export const mandate402TreasuryAbi = [
  {
    type: "function",
    name: "executeX402Payment",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agent", type: "address" },
      { name: "token", type: "address" },
      { name: "facilitator", type: "address" },
      { name: "tokenAmount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "killSwitches",
    stateMutability: "view",
    inputs: [{ name: "agent", type: "address" }],
    outputs: [{ name: "enabled", type: "bool" }],
  },
  {
    type: "function",
    name: "approvedFacilitators",
    stateMutability: "view",
    inputs: [
      { name: "agent", type: "address" },
      { name: "facilitator", type: "address" },
    ],
    outputs: [{ name: "approved", type: "bool" }],
  },
  {
    type: "function",
    name: "mandates",
    stateMutability: "view",
    inputs: [
      { name: "agent", type: "address" },
      { name: "token", type: "address" },
    ],
    outputs: [
      { name: "maxUsdSpendPerWindow", type: "uint256" },
      { name: "currentWindowUsdSpent", type: "uint256" },
      { name: "windowResetTime", type: "uint256" },
      { name: "windowDuration", type: "uint256" },
      { name: "pythPriceFeedId", type: "bytes32" },
      { name: "isActive", type: "bool" },
    ],
  },
] as const;
