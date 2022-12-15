import React from "react";
import { eligible } from "../assets/eligible_referrers";
import { getWallet } from "../wallets/wallets";
import ReferralBasicInfo from "../components/ReferralBasicInfo";

export default function ReferralContent() {

  return (
    getWallet().address in eligible ? 
    <div>
        <ReferralBasicInfo refIDs={eligible[getWallet().address]}></ReferralBasicInfo>
    </div>
    : <></>

  );
}
