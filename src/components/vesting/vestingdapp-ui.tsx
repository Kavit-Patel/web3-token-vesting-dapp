"use client";

import { PublicKey } from "@solana/web3.js";
import { useEffect, useMemo, useState } from "react";
import {
  useCommonProgram,
  useTokenAccounts,
} from "../common/common-data-access";
import {
  useVesting,
  useVestingdappProgramAccount,
} from "./vestingdapp-data-access";
import { BN } from "bn.js";
import Loader from "../common/common-loader";
import Link from "next/link";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
export function VestingdappCreate() {
  const { createVestingAccount } = useVesting();
  const { tokenAccounts } = useTokenAccounts();
  const [companyName, setCompanyName] = useState<string>("");
  const [tokenAmountTobeVested, setTokenAmountTobeVested] =
    useState<string>("");
  const [mint, setMint] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const handleMintSelect = (selectedMint: string) => {
    setMint(selectedMint);
    setShowDropdown(false);
  };

  useEffect(() => {
    const hideDropDown = () => {
      setShowDropdown(false);
    };
    const handleClick = () => {
      hideDropDown();
    };

    showDropdown && window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [document.activeElement]);
  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <input
        type="text"
        placeholder="Enter Company Name"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
      />
      <input
        type="text"
        placeholder="Token Amount tobe vested"
        value={tokenAmountTobeVested}
        onChange={(e) => setTokenAmountTobeVested(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
      />

      <div className="relative">
        <input
          type="text"
          placeholder="Enter Mint Address"
          value={mint}
          onChange={(e) => setMint(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onClick={(e) => {
            e.stopPropagation();
            setShowDropdown(true);
          }}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
        />
        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-300 rounded-md shadow-lg flex flex-col max-h-96 overflow-y-auto">
            {tokenAccounts.map((account, index) => (
              <div
                key={index}
                className=" py-2 hover:bg-gray-900 cursor-pointer"
                onClick={() => handleMintSelect(account.mintAddress)}
              >
                <div className="font-medium">{account.mintAddress}</div>
                <div className="text-sm text-gray-500">
                  Token Amount: {account.tokenAmount}
                </div>
              </div>
            ))}
            <Link
              className="w-full py-2 text-center font-semibold border border-gray-500 rounded-md transition-all hover:bg-gray-700 active:scale-95 md:text-xl"
              href="/createMint"
            >
              + Create New Token Program
            </Link>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        className="btn btn-xs lg:btn-md btn-primary w-full"
        onClick={() =>
          createVestingAccount.mutateAsync({
            companyName,
            tokenAmountTobeVested: new BN(
              parseInt(tokenAmountTobeVested) * 10 ** 9
            ),
            mint,
          })
        }
        disabled={createVestingAccount.isPending || !mint || !companyName}
      >
        {createVestingAccount.isPending ? (
          <Loader width={40} height={40} color="gray-900" />
        ) : (
          "Create"
        )}
      </button>
    </div>
  );
}

export function VestingdappList() {
  const { getProgramAccount, walletPublicKey } = useCommonProgram();
  const { vestingAccounts } = useVesting();
  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center mt-24">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }
  return (
    <div className="flex justify-center flex-col gap-4 mt-14">
      <Link
        href="/createVesting"
        className="mb-8 w-full text-center font-semibold border border-gray-500 rounded-md px-4 py-2 transition-all hover:bg-gray-700 active:scale-95 md:text-xl"
      >
        Create New Vesting Program
      </Link>
      <h2 className="w-full text-center text-lg">Vesting Program List</h2>
      <div className={"space-y-6"}>
        {vestingAccounts.isLoading ? (
          <span className="loading loading-spinner loading-lg"></span>
        ) : vestingAccounts.data?.find(
            (ele) =>
              ele.account.owner.toBase58() === walletPublicKey?.toBase58()
          ) ? (
          <div className="flex p-2 gap-4 flex-col overflow-y-auto h-[calc(100vh-320px)]">
            <PerfectScrollbar>
              {vestingAccounts.data?.map((account) => (
                <VestingdappCard
                  key={account.publicKey.toString()}
                  account={account.publicKey}
                />
              ))}
            </PerfectScrollbar>
          </div>
        ) : (
          <div className="text-center">
            <h2 className={"text-2xl"}>No Vesting Account</h2>
            No vesting account found. Create one above to get started.
          </div>
        )}
      </div>
    </div>
  );
}

function VestingdappCard({ account }: { account: PublicKey }) {
  const { walletPublicKey } = useCommonProgram();
  const { vestingAccountQuery } = useVestingdappProgramAccount({
    account,
  });
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [cliffTime, setCliffTime] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [beneficiary, setBeneficiary] = useState("");
  const [vestingAccount, setVestingAccount] = useState(account.toBase58());

  const companyName = useMemo(
    () => vestingAccountQuery.data?.companyName ?? 0,
    [vestingAccountQuery.data?.companyName]
  );
  return vestingAccountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content ">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          <div className="flex flex-col">
            <h2
              className="card-title justify-center text-3xl cursor-pointer"
              onClick={() => vestingAccountQuery.refetch()}
            >
              {companyName}
            </h2>
            <span className="text-xs text-gray-500">{account.toBase58()}</span>
          </div>
          <div className="flex justify-center flex-col gap-4">
            <div className=" flex flex-col md:flex-row justify-center gap-4">
              <input
                type="text"
                placeholder="Start Time"
                value={startTime || ""}
                onChange={(e) => setStartTime(parseInt(e.target.value))}
                className="input input-bordered w-full max-w-xs"
              />
              <input
                type="text"
                placeholder="End Time"
                value={endTime || ""}
                onChange={(e) => setEndTime(parseInt(e.target.value))}
                className="input input-bordered w-full max-w-xs"
              />
              <input
                type="text"
                placeholder="Cliff Time"
                value={cliffTime || ""}
                onChange={(e) => setCliffTime(parseInt(e.target.value))}
                className="input input-bordered w-full max-w-xs"
              />
            </div>
            <div className=" flex flex-col md:flex-row justify-center gap-4">
              <input
                type="text"
                placeholder="Total Allocation"
                value={totalAmount || ""}
                onChange={(e) => setTotalAmount(parseInt(e.target.value))}
                className="input input-bordered w-full max-w-xs"
              />
              <input
                type="text"
                placeholder="Beneficiary"
                value={beneficiary || ""}
                onChange={(e) => setBeneficiary(e.target.value)}
                className="input input-bordered w-full max-w-xs"
              />
              <input
                type="text"
                title={`Vesting Account for company  ${companyName}`}
                value={vestingAccount}
                disabled={!!account}
                onChange={(e) => setVestingAccount(e.target.value)}
                className="input input-bordered w-full max-w-xs "
              />
            </div>
            <div className="flex-grow flex justify-center">
              <button className="w-full md:w-[50%] btn btn-xs lg:btn-md btn-outline flex">
                Create Employee Vesting Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
