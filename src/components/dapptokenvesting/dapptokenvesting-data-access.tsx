'use client'

import {getDapptokenvestingProgram, getDapptokenvestingProgramId} from '@project/anchor'
import {useConnection} from '@solana/wallet-adapter-react'
import {Cluster, Keypair, PublicKey} from '@solana/web3.js'
import {useMutation, useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'
import toast from 'react-hot-toast'
import {useCluster} from '../cluster/cluster-data-access'
import {useAnchorProvider} from '../solana/solana-provider'
import {useTransactionToast} from '../ui/ui-layout'

export function useDapptokenvestingProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getDapptokenvestingProgramId(cluster.network as Cluster), [cluster])
  const program = getDapptokenvestingProgram(provider)

  const accounts = useQuery({
    queryKey: ['dapptokenvesting', 'all', { cluster }],
    queryFn: () => program.account.dapptokenvesting.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['dapptokenvesting', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ dapptokenvesting: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useDapptokenvestingProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useDapptokenvestingProgram()

  const accountQuery = useQuery({
    queryKey: ['dapptokenvesting', 'fetch', { cluster, account }],
    queryFn: () => program.account.dapptokenvesting.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['dapptokenvesting', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ dapptokenvesting: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['dapptokenvesting', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ dapptokenvesting: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['dapptokenvesting', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ dapptokenvesting: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['dapptokenvesting', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ dapptokenvesting: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
