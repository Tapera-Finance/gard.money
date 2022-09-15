import React, { useState } from "react";
import styled from "styled-components";
import Effect from "../Effect";
import InputField from "../InputField";
import gardLogo from "../../assets/icons/gardlogo_icon_small.png";
import arrowIcon from "../../assets/icons/icons8-arrow-64.png";
import algoLogo from "../../assets/icons/algorand_logo_mark_black_small.png";


// asset types: 0 === GARD, 1 === ALGO

export default function StakeDetails() {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [assetBType, setAssetBType] = useState(0);
  const [assetAtype, setAssetAType] = useState(0);



  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          height: "20%",
          width: "80%",
          border: "1px solid #80deff",
          background: "#0e1834",
          borderRadius: 10,
          justifySelf: "center",
          marginTop: 25,
        }}
      >
        <div
          style={{
            textAlign: "left",
            fontWeight: "bolder",
            fontSize: 18,
            // background: "#0e1834",
            marginLeft: 12,
            marginBottom: 10,
            height: "22%",
            paddingTop: 25,
          }}
        >
          Staking Pool
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr 2fr 2fr",
            justifyContent: "center",
            background: "#172756",
            height: "18%",
          }}
        >
          <Heading>TVL</Heading>
          <Heading>Type</Heading>
          <Heading>Duration</Heading>
          <Heading>APY</Heading>
          <Heading>Stake Amount</Heading>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr 2fr 2fr",
            justifyContent: "center",
            // background: "#0e1834"
          }}
        >
          <Heading>109,900 ALGO</Heading>
          <div>
            <GardImg src={gardLogo}></GardImg>
            <Arrow src={arrowIcon}></Arrow>
            <GardImg src={gardLogo} onClick={() => console.log("click option gard")}></GardImg>
            {/* <AlgoImg src={algoLogo} /> */}
          </div>
          <Heading>No-Lock</Heading>
          <Heading>.1%</Heading>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <ExchangeInput id="stake-amt" placeholder="0.00" />
            <EffectContainer>
              <Text onClick={() => console.log("Max Stake Amt Triggered")}>
                +MAX
              </Text>
              {/* <hr style={{ border: "dashed 1px" }} /> */}
              <Result>$110.35</Result>
            </EffectContainer>
          </div>
          <Heading>Stake Btn, Unstake Btn</Heading>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto auto auto auto",
            justifyContent: "center",
            // background: "#0e1834"
          }}
        >
          <Effect title="Your Stake" val="12 ALGO" hasToolTip={false} />
          <Effect
            title="Rewards / Day"
            val="0.3% GARD; 0.2% ALGO"
            hasToolTip={false}
          />
          <Effect
            title="Unclaimed"
            val="33.5 ALGO; 110.35 ALGO"
            hasToolTip={false}
          />
          <text style={{ color: "#80edff" }}>Claim Rewards</text>
        </div>
      </div>
    </div>
  );
}
const GardImg = styled.img`
  /* max-width: 100%; */
  height: 25px;
  &:hover {
    /* border: 1px #ffffff; */
    transform: scale(1.2);
    /* border-radius: 10px; */
  }
`;

const AlgoImg = styled.img`
  height: 25px;
  filter: invert();
`

const Arrow = styled.img`
  width: 35px;
`;
const Heading = styled.text`
  font-weight: 500;
  margin: 4px;
`;
// #80deff
// #ff00ff

const ExchangeInput = styled(InputField)`
  width: 4vw;
  height: 4vh;
  border: 1px transparent;
  text-decoration-color: #7c52ff;
  text-decoration-thickness: 2px;
  font-size: 14pt;
  color: #ffffff;
  text-align: center;
  background: #0d122710;
  margin: 10px 10px 10px 10px;

  &:active {
    appearance: none;
  }
  &:focus {
    appearance: none;
  }
`;

const EffectContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
`;

const Text = styled.text`
  font-weight: bold;
  font-size: 12;
  color: #80deff;
  margin: auto;
  color: #80edff;
  text-decoration: dotted underline;
  text-decoration-color: #999696;
`;
const Result = styled.text`
  color: #999696;
`;

const AssetOptions = () => {
  return (
    <div>
      <ul>
      <li></li>
      <GardImg src={gardLogo} />
      <AlgoImg src={algoLogo} />
      </ul>
    </div>
  )
}
