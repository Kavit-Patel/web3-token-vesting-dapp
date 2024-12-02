"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

import {
  getDapptokenvestingProgram,
  getDapptokenvestingProgramId,
} from "@project/anchor";
import { Cluster } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useCluster } from "../cluster/cluster-data-access";
import { useAnchorProvider } from "../solana/solana-provider";
import toast from "react-hot-toast";
import { ITokenAccount } from "./common-types";

export function useCommonProgram() {
  const { publicKey: walletPublicKey } = useWallet();
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getDapptokenvestingProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = getDapptokenvestingProgram(provider);

  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  return {
    cluster,
    program,
    programId,
    getProgramAccount,
    walletPublicKey,
  };
}

export function useTokenAccounts() {
  const { connection } = useConnection();
  const [tokenAccounts, setTokenAccounts] = useState<ITokenAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { publicKey } = useWallet();

  useEffect(() => {
    if (!publicKey) {
      setTokenAccounts([]);
      toast.error("Connect Wallet first!");
      return;
    }

    const fetchTokenAccounts = async () => {
      setLoading(true);
      setError(null);

      try {
        const ownerPublicKey = new PublicKey(publicKey);
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
        const errMsg = err instanceof Error ? err.message : "Error";
        setError(errMsg);
        toast.error("Error fetching token accounts: " + errMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenAccounts();
  }, [publicKey, connection]);

  return { tokenAccounts, loading, error };
}
