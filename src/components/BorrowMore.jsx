import React, {useState} from "react";
import BorrowCDP from "./BorrowCDP";
import Details from "./Details";
import {displayRatio, mAlgosToAlgos, displayLiquidationPrice, getMinted, getCollateral} from "../pages/BorrowContent"
import { calcRatio } from "../transactions/cdp";


export default function BorrowMore({ supplyPrice, collateral, mAsset, minted, cdp, price, setCurrentCDP, maxMint,  manageUpdate, details, apr}) {
    const [utilization, setUtilization] = useState(null)
    // TODO: combine SupplyCDP & BorrowCDP
    let borrowDetails = [
      {
        title: "Total Supplied (Asset)",
        val: `${mAlgosToAlgos(cdp.collateral + (collateral !== "" ? collateral : 0)).toFixed(2)}`,
        hasToolTip: true,
      },
      {
        title: "Total Supplied ($)",
        val: `$${((Number(mAlgosToAlgos(cdp.collateral + (collateral !== "" ? collateral : 0 )) * supplyPrice))).toFixed(2)}`,
        hasToolTip: true,
      },
      {
        title: "Collateral Factor",
        val: `${(100 / 140).toFixed(2)}`,
        hasToolTip: true,
      },
      {
        title: "Borrow Utilization",
        val: `${!utilization ? "..." : utilization}%`,
        hasToolTip: true,
      },
      {
        title: "Liquidation Price",
        val: `$${mAsset == null || mAsset == "" ? ((1.15 * (mAlgosToAlgos(cdp.debt)) / (mAlgosToAlgos(cdp.collateral))).toFixed(4)) : ((1.15 * (mAlgosToAlgos(cdp.debt) + mAsset) / (mAlgosToAlgos(cdp.collateral))).toFixed(4))}`,
        hasToolTip: true,
      },
      {
        title: "Bonus Supply Rewards",
        val: 0,
        hasToolTip: true,
      },
      {
        title: "ALGO Governance APR",
        val: `${apr}%`,
        hasToolTip: true,
      },
      {
        title: "Collateralization Ratio",
        val: `${mAsset == null || mAsset == "" ?  calcRatio(cdp.collateral, cdp.debt, true) : calcRatio(cdp.collateral, cdp.debt + mAsset, true)}`,
        hasToolTip: true,
      },
    ]
    return <div>
        <div style={{marginTop: 30}}>
            <BorrowCDP  minted={minted} cdp={cdp} price={price} setCurrentCDP={setCurrentCDP} maxMint={maxMint} apr={apr} manageUpdate={manageUpdate} setUtilization={setUtilization}/>
        </div>
        <div style={{position:"relative", top:-65}}>
            <Details details={borrowDetails}/>
        </div>
    </div>
}
