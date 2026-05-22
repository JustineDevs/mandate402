export const mandateRegistryAbi = [
  {
    type: "function",
    name: "issueMandate",
    stateMutability: "nonpayable",
    inputs: [
      { name: "mandateId", type: "bytes32" },
      { name: "specHash", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "revokeMandate",
    stateMutability: "nonpayable",
    inputs: [
      { name: "mandateId", type: "bytes32" },
      { name: "revokeRef", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getMandate",
    stateMutability: "view",
    inputs: [{ name: "mandateId", type: "bytes32" }],
    outputs: [
      {
        type: "tuple",
        name: "",
        components: [
          { name: "specHash", type: "bytes32" },
          { name: "revokeRef", type: "bytes32" },
          { name: "issuer", type: "address" },
          { name: "revoker", type: "address" },
          { name: "issuedAt", type: "uint64" },
          { name: "revokedAt", type: "uint64" },
          { name: "status", type: "uint8" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "statusOf",
    stateMutability: "view",
    inputs: [{ name: "mandateId", type: "bytes32" }],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    type: "function",
    name: "isActive",
    stateMutability: "view",
    inputs: [{ name: "mandateId", type: "bytes32" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;
