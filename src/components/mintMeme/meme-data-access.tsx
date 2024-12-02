"use client";

import {
  useConnection,
  WalletContextState,
} from "@solana/wallet-adapter-react";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ITokenAccount } from "./types";
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

export const createMintAndTokenAccount = async (
  connection: Connection,
  walletAdapter: WalletContextState,
  tokenAmount: string | number | bigint | boolean
) => {
  try {
    if (!walletAdapter || !walletAdapter.connected) {
      throw new Error("Wallet not connected. Please connect your wallet.");
    }

    const walletPublicKey = walletAdapter.publicKey;
    if (!walletPublicKey) {
      toast.error("Connect Wallet first !");
      return;
    }
    const mint = Keypair.generate();
    const associatedTokenAccount = await getAssociatedTokenAddress(
      mint.publicKey,
      walletPublicKey
    );

    const { blockhash } = await connection.getLatestBlockhash();
    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: walletPublicKey,
    });

    const mintRent = await connection.getMinimumBalanceForRentExemption(
      MINT_SIZE
    );

    const decimals = 9;
    const mintAmount = BigInt(tokenAmount) * BigInt(10 ** decimals);

    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: walletPublicKey,
        newAccountPubkey: mint.publicKey,
        lamports: mintRent,
        space: MINT_SIZE,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(
        mint.publicKey,
        decimals,
        walletPublicKey,
        walletPublicKey
      ),
      createAssociatedTokenAccountInstruction(
        walletPublicKey,
        associatedTokenAccount,
        walletPublicKey,
        mint.publicKey
      ),
      createMintToInstruction(
        mint.publicKey,
        associatedTokenAccount,
        walletPublicKey,
        mintAmount
      )
    );

    transaction.partialSign(mint);
    const signature = await walletAdapter.sendTransaction(
      transaction,
      connection,
      {
        skipPreflight: false,
      }
    );
    toast.success("Token Created Successfully !" + signature);
    return { signature, mint: mint.publicKey, associatedTokenAccount };
  } catch (error) {
    console.error("Error creating mint token:", error);
    throw error;
  }
};

export function useTokenAccounts(currentWallet: PublicKey) {
  const { connection } = useConnection();
  const [tokenAccounts, setTokenAccounts] = useState<ITokenAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const walletAddress = new PublicKey(currentWallet);
  useEffect(() => {
    if (!walletAddress) {
      setTokenAccounts([]);
      return;
    }
    const fetchTokenAccounts = async () => {
      setLoading(true);
      setError(null);

      try {
        const ownerPublicKey = walletAddress;
        const tokenAccountsResponse =
          await connection.getParsedTokenAccountsByOwner(ownerPublicKey, {
            programId: new PublicKey(
              "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
            ),
          });

        const accounts = tokenAccountsResponse.value.map((accountInfo) => {
          const accountData = accountInfo.account.data.parsed.info;
          return {
            mintAddress: accountData.mint,
            tokenAccount: accountInfo.pubkey.toString(),
            tokenAmount: accountData.tokenAmount.uiAmount,
          };
        });

        setTokenAccounts(accounts);
      } catch (err) {
        console.error("Error fetching token accounts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenAccounts();
  }, [walletAddress]);

  return { tokenAccounts, loading, error };
}
