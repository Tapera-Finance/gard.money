import React from "react";
import ManageCDP from "./ManageCDP";
import Details from "./Details";

export default function BorrowMore({ collateral, minted, cdp, price, setCurrentCDP, details, apr}) {
    return <div>
        <div style={{marginTop: 30}}>
            <ManageCDP collateral={collateral} minted={minted} cdp={cdp} price={price} setCurrentCDP={setCurrentCDP} apr={apr} />
        </div>
        <div style={{position:"relative", top:-65}}>
            <Details details={details}/>
        </div>
    </div>
}
