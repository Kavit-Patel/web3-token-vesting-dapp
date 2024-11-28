// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import DapptokenvestingIDL from '../target/idl/dapptokenvesting.json'
import type { Dapptokenvesting } from '../target/types/dapptokenvesting'

// Re-export the generated IDL and type
export { Dapptokenvesting, DapptokenvestingIDL }

// The programId is imported from the program IDL.
export const DAPPTOKENVESTING_PROGRAM_ID = new PublicKey(DapptokenvestingIDL.address)

// This is a helper function to get the Dapptokenvesting Anchor program.
export function getDapptokenvestingProgram(provider: AnchorProvider) {
  return new Program(DapptokenvestingIDL as Dapptokenvesting, provider)
}

// This is a helper function to get the program ID for the Dapptokenvesting program depending on the cluster.
export function getDapptokenvestingProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Dapptokenvesting program on devnet and testnet.
      return new PublicKey('CounNZdmsQmWh7uVngV9FXW2dZ6zAgbJyYsvBpqbykg')
    case 'mainnet-beta':
    default:
      return DAPPTOKENVESTING_PROGRAM_ID
  }
}
