import React from "react";
import styled, {css} from "styled-components";


export default function RewardNotice({program, timespan, estimatedRewards, action}){
    return <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#80deff",
            borderRadius: 10,
            color: "#172756",
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 20,
            paddingRight: 20,
            marginBottom: 20,
        }}>
            <div>
                <div>{program}</div>
                <TimeSpan>{timespan}</TimeSpan>
            </div>
            <b>
                {estimatedRewards}
            </b>
            <div>
                {action}
            </div>
        </div>
}

const TimeSpan = styled.text`
    font-size: 12px;
`