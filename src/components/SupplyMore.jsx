import React from "react";
import SupplyCDP from "./SupplyCDP";
import Details from "./Details";

export default function SupplyMore({ collateral, minted, cdp, price, setCurrentCDP, details, apr}) {
    return <div>
        <div style={{marginTop: 30}}>
            <SupplyCDP collateral={collateral} minted={minted}  cdp={cdp} price={price} setCurrentCDP={setCurrentCDP} apr={apr}/>
        </div>
        <div style={{position:"relative", top:-65}}>
            <Details details={details}/>
        </div>
    </div>
}
