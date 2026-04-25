import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadTestnet } from "viem/chains";

const CONTRACT_ABI = [
  {
    name: "storeEvidence",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "evidenceHash", type: "bytes32" },
      { name: "timestamp", type: "uint256" },
    ],
    outputs: [],
  },
];

/**
 * Almacena el hash de evidencia en el smart contract de Monad Testnet.
 *
 * @param {string} hexHash - Hash SHA-256 como string hex de 64 caracteres (sin 0x)
 * @param {number} timestamp - Unix timestamp en milisegundos
 * @returns {Promise<string>} txHash de la transacción (0x + 64 hex chars)
 */
export async function storeEvidenceOnChain(hexHash, timestamp) {
  const account = privateKeyToAccount(process.env.PRIVATE_KEY);

  const walletClient = createWalletClient({
    account,
    chain: monadTestnet, // importado de viem/chains — NO definir cadena personalizada
    transport: http(process.env.MONAD_RPC_URL),
  });

  // SHA-256 produce 32 bytes = 64 hex chars → encaja perfecto en bytes32
  const bytes32Hash = `0x${hexHash}`;

  const txHash = await walletClient.writeContract({
    address: process.env.CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "storeEvidence",
    args: [bytes32Hash, BigInt(timestamp)],
  });

  return txHash;
}
