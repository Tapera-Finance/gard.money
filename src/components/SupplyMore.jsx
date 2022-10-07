import React, {useState} from "react";
import SupplyCDP from "./SupplyCDP";
import Details from "./Details";
import { mAlgosToAlgos, algosToMAlgos} from "../pages/BorrowContent"
import { calcRatio } from "../transactions/cdp";

export default function SupplyMore({ supplyPrice, cAsset, collateral, minted, cdp, price, setCurrentCDP, maxSupply, manageUpdate, details, apr}) {
    const [utilization, setUtilization] = useState(null)
    let supplyDetails = [
        {
          title: "Total Supplied (Asset)",
          val: `${mAlgosToAlgos(cdp.collateral + (cAsset !== "" ? cAsset : 0)).toFixed(2)}`,
          hasToolTip: true,
        },
        {
          title: "Total Supplied ($)",
          val: `$${((Number(mAlgosToAlgos(cdp.collateral + (cAsset !== "" ? cAsset : 0 )) * supplyPrice))).toFixed(2)}`,
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
          val: `$${cAsset == null || cAsset == "" ? "..." : ((1.15 * mAlgosToAlgos(cdp.debt)) / (mAlgosToAlgos(cdp.collateral) + cAsset)).toFixed(4)}`,
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
          val: "TBD",
          val: !cAsset ? "..." : calcRatio((algosToMAlgos(cAsset) + cdp.collateral), cdp.debt, true),
          hasToolTip: true,
        },
      ]
    // TODO: combine SupplyCDP & BorrowCDP
    return <div>
        <div style={{marginTop: 30}}>
            <SupplyCDP collateral={collateral} minted={minted}  cdp={cdp} price={price} setCurrentCDP={setCurrentCDP} maxSupply={maxSupply} manageUpdate={manageUpdate} apr={apr} setUtilization={setUtilization}/>
        </div>
        <div style={{position:"relative", top:-65}}>
            <Details details={supplyDetails}/>
        </div>
    </div>
}

