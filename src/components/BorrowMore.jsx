import React from "react";
import ManageCDP from "./ManageCDP";
import Details from "./Details";

export default function BorrowMore({cdp, price, setCurrentCDP, details}) {
    return <div>
        <div style={{marginTop: 30}}>
            <ManageCDP cdp={cdp} price={price} setCurrentCDP={setCurrentCDP}/>
        </div>
        <div style={{position:"relative", top:-65}}>
            <Details details={details}/>
        </div>
    </div>
}
    