"use client";

import { PublicKey } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useCluster } from "../cluster/cluster-data-access";
import { useTransactionToast } from "../ui/ui-layout";
import { ICreateVesting } from "./vesting-types";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useCommonProgram } from "../common/common-data-access";
import { useRouter } from "next/navigation";

export function useVesting() {
  const router = useRouter();
  const { cluster, program } = useCommonProgram();
  const transactionToast = useTransactionToast();

  const vestingAccounts = useQuery({
    queryKey: ["vestingdapp", "all", { cluster }],
    queryFn: () => program.account.vestingAccount.all(),
  });

  const createVestingAccount = useMutation<string, Error, ICreateVesting>({
    mutationKey: ["vestingdapp", "create", { cluster }],
    mutationFn: ({ companyName, tokenAmountTobeVested, mint }) =>
      program.methods
        .createVestingAccount(companyName, tokenAmountTobeVested)
        .accounts({ mint: new PublicKey(mint), tokenProgram: TOKEN_PROGRAM_ID })
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
      router.push("/dapptokenvesting");
      return vestingAccounts.refetch();
    },
    onError: () => {
      toast.error("Failed to create vesting account");
      router.push("/createVesting");
    },
  });

  return {
    createVestingAccount,
    vestingAccounts,
  };
}
export function useVestingdappProgramAccount({
  account,
}: {
  account: PublicKey;
}) {
  const { cluster } = useCluster();
  const { program } = useCommonProgram();

  const vestingAccountQuery = useQuery({
    queryKey: ["vestingAccount", "fetch", { cluster, account }],
    queryFn: () => program.account.vestingAccount.fetch(account),
  });

  return {
    vestingAccountQuery,
  };
}
