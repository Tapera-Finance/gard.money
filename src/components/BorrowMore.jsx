import React from "react";
import BorrowCDP from "./BorrowCDP";
import Details from "./Details";

export default function BorrowMore({ collateral, minted, cdp, price, setCurrentCDP, maxMint, details, apr}) {
    return <div>
        <div style={{marginTop: 30}}>
            <BorrowCDP collateral={collateral} minted={minted}  cdp={cdp} price={price} setCurrentCDP={setCurrentCDP} maxMint={maxMint} apr={apr}/>
        </div>
        <div style={{position:"relative", top:-65}}>
            <Details details={details}/>
        </div>
    </div>
}
