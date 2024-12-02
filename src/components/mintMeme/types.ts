import BN from "bn.js";

export interface ICreateVesting {
  companyName: string;
  mint: string;
}
export interface ICreateEmployee {
  startTime: BN;
  endTime: BN;
  totalAmount: BN;
  cliffTime: BN;
  beneficiary: BN;
}
export interface ITokenAccount {
  mintAddress: string;
  tokenAccount: string;
  tokenAmount: number;
}
