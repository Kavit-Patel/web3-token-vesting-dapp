import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export interface ICreateVesting {
  companyName: string;
  tokenAmountTobeVested: BN;
  mint: string;
}
export interface IVestingAccount {
  owner: PublicKey;
  mint: PublicKey;
  treasuryTokenAccount: PublicKey;
  companyName: string;
  treasuryBump: number;
  bump: number;
}
