import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { useCommonProgram } from "../common/common-data-access";

export function useEmployee(walletKey: PublicKey) {
  const { cluster, program } = useCommonProgram();

  const calculateClaimableTokens = (
    startTime: number,
    endTime: number,
    cliffTime: number,
    totalAmount: number,
    totalWithdrawn: number,
    currentTime: number
  ): number => {
    if (currentTime < cliffTime) {
      return 0;
    }

    const elapsedTime = Math.min(currentTime, endTime) - startTime;
    const vestingDuration = endTime - startTime;

    if (vestingDuration <= 0) {
      throw new Error(
        "Invalid vesting schedule: endTime must be greater than startTime."
      );
    }

    const vestableAmount = (totalAmount * elapsedTime) / vestingDuration;
    const claimableTokens = Math.max(0, vestableAmount - totalWithdrawn);

    return claimableTokens;
  };

  const employeeAccounts = useQuery({
    queryKey: ["employeeTokenVestingAccounts", "all", { cluster }],
    queryFn: async () => {
      const queryResponse = await program.account.employeeAccount.all([
        {
          memcmp: {
            offset: 8,
            bytes: walletKey.toBase58(),
          },
        },
      ]);
      const vestingAccKeys = queryResponse.map(
        (acc) => acc.account.vestingAccount
      );
      const relatedVestingAccounts = await Promise.all(
        vestingAccKeys.map((va) => program.account.vestingAccount.fetch(va))
      );

      const data = queryResponse.map((empAcc, index) => {
        const vestingDetail = relatedVestingAccounts[index];
        return {
          pda: empAcc.publicKey.toString(),
          beneficiary: empAcc.account.beneficiary.toString(),
          startTime: empAcc.account.startTime.toNumber(),
          endTime: empAcc.account.endTime.toNumber(),
          totalAmount: empAcc.account.totalAmount.toNumber(),
          totalWithdrawn: empAcc.account.totalWithdrawn.toNumber(),
          cliffTime: empAcc.account.cliffTime.toNumber(),
          vestingAccount: empAcc.account.vestingAccount.toString(),
          companyName: vestingDetail.companyName,
          treasuryTokenAccount: vestingDetail.treasuryTokenAccount.toString(),
          token: vestingDetail.mint.toString(),
        };
      });
      return data;
    },
  });

  return { employeeAccounts, calculateClaimableTokens };
}
