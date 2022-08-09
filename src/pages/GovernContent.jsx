import React from "react";
import Details from "../components/Details";
import RewardNotice from "../components/RewardNotice";

export default function Govern() {
    var details = [
        {
            title: "Governors",
            val: `123,400 Governors`,
            hasToolTip: true,
        },
        {
            title: "Governance APY",
            val: `${0.03}% per transaction`,
            hasToolTip: true,
        },
        {
            title: "Enrollment Countdown",
            val: `${0.00}%`,
            hasToolTip: true,
        },
        {
            title: "Governance Rewards",
            val: `${0.00}%`,
            hasToolTip: true,
        },
    ]
    return <div>
            <RewardNotice 
            program={"Governance Rewards"} 
            timespan={"Now - October 22, 2022"}
            estimatedRewards={"12% - 33% APR Rewards"}
            action={"Borrow ALGO to Claim Rewards"}
            />
            <Details details={details} governPage={true}/>
        </div>
        
}