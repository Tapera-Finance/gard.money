import React from "react";
import rewardsIcon from "../assets/icons/rewards_icon.png"

export default function RewardWrapper({text}){
    return <div style={{position: "relative"}}>
        <div 
        style={{
            height: 17,
            border: "1px solid #80deff", 
            maxWidth: 160,
            color:"#80deff", 
            textAlign: "center", 
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
            <span style={{position: "absolute", bottom: ".5rem", right: "-.85rem"}}><img style={{height: "27px"}} src={rewardsIcon}/></span>
        </div>
    </div>
}