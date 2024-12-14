import { ProgramAccount } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export interface ITokenAccount {
  mintAddress: string;
  tokenAccount: string;
  tokenAmount: number;
}
export interface IClaimableTokens {
  startTime: number;
  endTime: number;
  cliffTime: number;
  totalAmount: number;
  totalWithdrawn: number;
  currentTime: number;
}
export type EmployeeAccount = ProgramAccount<{
  beneficiary: PublicKey;
  startTime: BN;
  endTime: BN;
  totalAmount: BN;
  totalWithdrawn: BN;
  cliffTime: BN;
  vestingAccount: PublicKey;
  bump: number;
}>;
