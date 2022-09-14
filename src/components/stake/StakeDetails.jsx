import React, {useState} from "react"
import styled from "styled-components"
import Effect from "../Effect"

export default function StakeDetails() {
    return (
        <div style={{
            display: "flex",
            justifyContent: "center"
        }}>

        <div style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "20%",
            width: "80%",
            border: "1px solid #ff00ff",
            background: "#0e1834",
            borderRadius: 10,
            justifySelf: "center",
            marginTop: 25
        }}>
            <div style={{
                textAlign: "left",
                fontWeight: "bolder",
                fontSize: 18,
                background: "#0e1834",
                marginLeft: 12,
                marginBottom: 10,
                height: "22%",
                paddingTop: 25

            }}>
                Staking Pool
            </div>
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 20%)",
                justifyContent: "center",
                background: "#172756",
                height: "18%"
            }}>
                <Heading>TVL</Heading>
                <Heading>Type</Heading>
                <Heading>Duration</Heading>
                <Heading>APY</Heading>
                <Heading>Stake Amount</Heading>
            </div>
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 20%)",
                justifyContent: "center",
                background: "#0e1834"
            }}>
              <Heading>109,900 ALGO</Heading>
              <Heading>GARD logo</Heading>
              <Heading>No-Lock</Heading>
              <Heading>.1%</Heading>
              <Heading>Input field and button</Heading>
            </div>
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 33%)",
                justifyContent: "center",
                background: "#0e1834"}}>
                    <Effect title="Your Stake" val="12 ALGO" hasToolTip="false"
                    />
                    <Effect title="Rewards / Day" val="0.3% GARD; 0.2% ALGO" hasToolTip="false"
                    />
                    <Effect title="Earned" val="33.5 ALGO; 110.35 ALGO" hasToolTip="false"
                    />
                    <text style={{color: "#80edff"}}>Claim Rewards</text>
            </div>
        </div>
        </div>
    )
}

const Heading = styled.text`
    font-weight: 500;
    margin: 4px;
`
