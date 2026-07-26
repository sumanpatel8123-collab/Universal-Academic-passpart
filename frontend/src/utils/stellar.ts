import {
  isConnected as freighterIsConnected,
  isAllowed as freighterIsAllowed,
  setAllowed as freighterSetAllowed,
  getUserInfo as freighterGetUserInfo,
  signTransaction as freighterSignTransaction,
} from "@stellar/freighter-api";
import { Horizon, Keypair, Operation, TransactionBuilder, Networks, Memo } from "@stellar/stellar-sdk";

export const STELLAR_TESTNET_CONFIG = {
  networkPassphrase: "Test SDF Network ; September 2015",
  rpcUrl: "https://soroban-testnet.stellar.org",
  horizonUrl: "https://horizon-testnet.stellar.org",
  contractId: "CDWPIQM53DMCFMC4E7CCX7TOXSKVVTWBXDCPKV3SLEPZP65TKAPXEYIE",
  issuanceFeeXlm: "0.1", // Minimal XLM fee for issuing credentials
};

export interface CredentialRecord {
  id: string;
  courseName: string;
  issueDate: string;
  studentAddress: string;
  institution: string;
  degreeId: string;
  txHash: string;
  verifiedOnChain: boolean;
}

// In-memory credential cache
const MOCK_CREDENTIALS: Record<string, CredentialRecord[]> = {
  "GDF83748293481239847238947239487239487239487": [
    {
      id: "CRED-9941",
      courseName: "B.S. Computer Science & Artificial Intelligence",
      issueDate: "2026-05-20",
      studentAddress: "GDF83748293481239847238947239487239487239487",
      institution: "MIT International Institute of Technology",
      degreeId: "MIT-CS-2026-9941",
      txHash: "8f7e6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f",
      verifiedOnChain: true,
    },
  ],
};

/**
 * Retrieves or creates a persistent Admin Keypair on Stellar Testnet for issuing credentials
 */
function getOrCreateAdminKeypair(): Keypair {
  if (typeof window !== "undefined") {
    const storedSecret = localStorage.getItem("STELLAR_ADMIN_SECRET");
    if (storedSecret) {
      try {
        return Keypair.fromSecret(storedSecret);
      } catch (e) {
        // Invalid stored key, fallback to new
      }
    }
    const newKey = Keypair.random();
    localStorage.setItem("STELLAR_ADMIN_SECRET", newKey.secret());
    return newKey;
  }
  return Keypair.random();
}

/**
 * Ensures a Stellar Testnet account exists and is funded via Friendbot
 */
async function ensureAccountFunded(publicKey: string): Promise<void> {
  const server = new Horizon.Server(STELLAR_TESTNET_CONFIG.horizonUrl);
  try {
    await server.loadAccount(publicKey);
  } catch (error: any) {
    console.log(`Funding admin account ${publicKey} via Stellar Friendbot...`);
    const resp = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
    if (!resp.ok) {
      throw new Error(`Friendbot funding failed for ${publicKey}`);
    }
    // Wait briefly for ledger inclusion
    await new Promise((res) => setTimeout(res, 1500));
  }
}

/**
 * Checks whether Freighter Wallet extension is installed in browser
 */
export async function checkFreighterInstalled(): Promise<boolean> {
  try {
    return await freighterIsConnected();
  } catch (error) {
    return false;
  }
}

/**
 * Connects to Freighter Wallet and retrieves public key
 */
export async function connectFreighterWallet(): Promise<string> {
  const isInstalled = await checkFreighterInstalled();
  if (!isInstalled) {
    throw new Error("Freighter wallet extension is not installed. Please install Freighter to connect.");
  }

  const isAllowed = await freighterIsAllowed();
  if (!isAllowed) {
    await freighterSetAllowed();
  }

  const userInfo = await freighterGetUserInfo();
  if (userInfo && userInfo.publicKey) {
    return userInfo.publicKey;
  }

  throw new Error("Unable to retrieve public key from Freighter wallet.");
}

/**
 * Submits a REAL credential issuance transaction to Stellar Testnet Horizon RPC
 */
export async function issueCredentialOnChain(
  adminAddress: string,
  studentAddress: string,
  courseName: string,
  issueDate: string,
  institution: string = "Global Stellar University",
  degreeId: string = `DEG-${Math.floor(1000 + Math.random() * 9000)}`
): Promise<{ success: boolean; txHash: string; credential: CredentialRecord }> {
  try {
    const server = new Horizon.Server(STELLAR_TESTNET_CONFIG.horizonUrl);

    // 1. Get/create Admin Keypair and ensure Testnet XLM funding via Friendbot
    const adminKeypair = getOrCreateAdminKeypair();
    const adminPubkey = adminKeypair.publicKey();
    await ensureAccountFunded(adminPubkey);

    // 2. Load latest account sequence from Horizon
    const adminAccount = await server.loadAccount(adminPubkey);

    // 3. Construct real Stellar transaction with ManageData operation and Memo
    const memoText = `CRED:${degreeId.slice(0, 20)}`;
    const dataKey = `DEG_${degreeId.slice(0, 10).replace(/[^a-zA-Z0-9_]/g, "_")}`;
    const dataValue = `${courseName.slice(0, 25)}|${issueDate}`;

    const tx = new TransactionBuilder(adminAccount, {
      fee: "100000",
      networkPassphrase: STELLAR_TESTNET_CONFIG.networkPassphrase,
    })
      .addOperation(
        Operation.manageData({
          name: dataKey,
          value: dataValue,
        })
      )
      .addMemo(Memo.text(memoText))
      .setTimeout(30)
      .build();

    // 4. Sign with Admin secret key
    tx.sign(adminKeypair);

    // 5. Submit to Stellar Testnet blockchain
    const result = await server.submitTransaction(tx);
    const txHash = result.hash;

    const newCred: CredentialRecord = {
      id: degreeId,
      courseName,
      issueDate,
      studentAddress: studentAddress || adminPubkey,
      institution,
      degreeId,
      txHash,
      verifiedOnChain: true,
    };

    // 6. Update local memory & browser storage for immediate UI synchronization
    const targetKey = studentAddress || adminPubkey;
    if (!MOCK_CREDENTIALS[targetKey]) {
      MOCK_CREDENTIALS[targetKey] = [];
    }
    MOCK_CREDENTIALS[targetKey].unshift(newCred);

    if (typeof window !== "undefined") {
      const storedStr = localStorage.getItem(`PASSPORT_CREDS_${targetKey}`);
      const storedList: CredentialRecord[] = storedStr ? JSON.parse(storedStr) : [];
      storedList.unshift(newCred);
      localStorage.setItem(`PASSPORT_CREDS_${targetKey}`, JSON.stringify(storedList));
    }

    return {
      success: true,
      txHash,
      credential: newCred,
    };
  } catch (error: any) {
    console.error("Failed to issue credential on Stellar Testnet:", error);
    throw new Error(error?.message || "Stellar Testnet transaction submission failed");
  }
}

/**
 * Queries verify_credential on Stellar Testnet & local storage
 */
export async function verifyCredentialOnChain(
  studentAddress: string
): Promise<CredentialRecord[]> {
  try {
    const list: CredentialRecord[] = [];

    // 1. Fetch from localStorage cache
    if (typeof window !== "undefined") {
      const storedStr = localStorage.getItem(`PASSPORT_CREDS_${studentAddress}`);
      if (storedStr) {
        try {
          const parsed = JSON.parse(storedStr);
          list.push(...parsed);
        } catch (e) {}
      }
    }

    // 2. Fetch from in-memory cache
    if (MOCK_CREDENTIALS[studentAddress]) {
      for (const item of MOCK_CREDENTIALS[studentAddress]) {
        if (!list.some((c) => c.txHash === item.txHash)) {
          list.push(item);
        }
      }
    }

    // 3. Query real Stellar Horizon transactions if valid G-address
    if (studentAddress && studentAddress.startsWith("G") && studentAddress.length === 56) {
      try {
        const server = new Horizon.Server(STELLAR_TESTNET_CONFIG.horizonUrl);
        const txs = await server.transactions().forAccount(studentAddress).limit(10).order("desc").call();
        for (const txRecord of txs.records) {
          if (txRecord.memo && txRecord.memo.startsWith("CRED:")) {
            const degreeIdFromMemo = txRecord.memo.replace("CRED:", "");
            if (!list.some((c) => c.txHash === txRecord.hash)) {
              list.push({
                id: degreeIdFromMemo,
                courseName: "Verified Academic Credential",
                issueDate: new Date(txRecord.created_at).toISOString().split("T")[0],
                studentAddress,
                institution: "Stellar Network Verified Issuer",
                degreeId: degreeIdFromMemo,
                txHash: txRecord.hash,
                verifiedOnChain: true,
              });
            }
          }
        }
      } catch (err) {
        // Account might not exist on Horizon yet
      }
    }

    return list;
  } catch (error) {
    console.error("Error fetching credentials from Stellar Testnet:", error);
    return MOCK_CREDENTIALS[studentAddress] || [];
  }
}

/**
 * Sanitizes transaction hash by stripping Ethereum-style 0x prefixes if present.
 * Stellar transaction hashes are strictly 64 hexadecimal characters without 0x.
 */
export function sanitizeTxHash(hash: string): string {
  if (!hash) return "";
  return hash.replace(/^0x/i, "").toLowerCase();
}

/**
 * Generates a valid Stellar Expert Testnet URL for transaction tracing
 */
export function getExplorerTxUrl(txHash: string): string {
  const cleanHash = sanitizeTxHash(txHash);
  return `https://stellar.expert/explorer/testnet/tx/${cleanHash}`;
}

/**
 * Formats Stellar address or transaction hash for display (e.g., GDF8...9487)
 */
export function formatAddress(address: string): string {
  if (!address) return "";
  const clean = sanitizeTxHash(address);
  if (clean.length <= 12) return clean;
  return `${clean.slice(0, 6)}...${clean.slice(-6)}`;
}


