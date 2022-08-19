import React from "react";
import rewardsIcon from "../assets/icons/rewards_icon.png"

export default function RewardWrapper({text}){
    return <div>
        <div 
        style={{
            height: 17,
            border: "1px solid #80deff", 
            color:"#80deff", 
            textAlign: "right", 
            borderRadius: 10, 
            position:"relative",
            paddingTop: 6,
            paddingBottom: 6,
            paddingLef: 15,
            paddingRight: 10,
            bottom: 5,
            fontSize: 13,
            fontWeight: 600,
            }}>
            {text}
            <span style={{position: "relative", bottom: 30, left: 20}}><img style={{height: "27px"}} src={rewardsIcon}/></span>
        </div>
    </div>
}