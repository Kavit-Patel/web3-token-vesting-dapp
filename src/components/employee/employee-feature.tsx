"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "../solana/solana-provider";
import { EmployeeUi } from "./employee-ui";
import { useCommonProgram } from "../common/common-data-access";
import { usePathname } from "next/navigation";

export default function EmployeeFeature() {
  const { publicKey } = useWallet();

  return publicKey ? (
    <div>
      <EmployeeUi publicKey={publicKey} />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
