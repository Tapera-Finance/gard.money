import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import styled from "styled-components";
import Effect from "../Effect";
import InputField from "../InputField";
import { getWallet, getWalletInfo, updateWalletInfo } from "../../wallets/wallets";
import { getPrice } from "../../transactions/cdp.js";
import gardLogo from "../../assets/icons/gardlogo_icon_small.png";
import arrowIcon from "../../assets/icons/icons8-arrow-64.png";
import algoLogo from "../../assets/icons/algorand_logo_mark_black_small.png";
import PrimaryButton from "../PrimaryButton";
import { formatToDollars } from "../../utils";

// asset types: 0 === GARD, 1 === ALGO

export default function StakeDetails() {
  const walletAddress = useSelector((state) => state.wallet.address);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [assetType, setAssetType] = useState(0);
  const [acctInfo, setAcctInfo] = useState(null);
  const [price, setPrice] = useState(0)
  const el = document.querySelector("#overlay");
  const [balance, setBalance] = useState("...");
  const navigate = useNavigate();

  useEffect(async () => {
    setPrice(await getPrice());
    await updateWalletInfo();
    getWallet();
    setAcctInfo(getWalletInfo());
    setBalance((getWalletInfo()["amount"] / 1000000).toFixed(3));
    // setPendingRewards(
    //   (getWalletInfo()["pending-rewards"] / 1000000).toFixed(3),
    // );
  }, []);
  useEffect(() => {
    if (!walletAddress) navigate("/");
  }, [walletAddress]);

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
          }}
        >
          <Heading>109,900 ALGO</Heading>
          <div>
            <Img src={gardLogo}></Img>
            <Arrow src={arrowIcon}></Arrow>
            <GardImg
                src={gardLogo}
              ></GardImg>
            {/* {assetType === 0 ? (
              <GardImg
                src={gardLogo}
                onClick={() => setOptionsOpen(!optionsOpen)}
              ></GardImg>
            ) : (
              <AlgoImg
                src={algoLogo}
                onClick={() => setOptionsOpen(!optionsOpen)}
              ></AlgoImg>
            )} */}

            <AssetOptions
              open={optionsOpen}
              setAsset={setAssetType}
              setOpen={setOptionsOpen}
            />
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
              <Result>{formatToDollars(balance * price)}</Result>
            </EffectContainer>
          </div>
          <div>
            <PrimaryButton text="Stake" />
          </div>
          {/* <Heading>Stake Btn, Unstake Btn</Heading> */}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto auto auto auto",
            justifyContent: "center",
          }}
        >
          <Effect title="Your Stake" val="12 ALGO" hasToolTip={false} />
          <Effect
            title="Rewards / Day"
            val="0.3% GARD; 0.2% ALGO"
            hasToolTip={false}
          />
          <Effect
            title="Rewards Accrued"
            val="33.5 ALGO; 110.35 ALGO"
            hasToolTip={false}
          />
          <text style={{ color: "#80edff" }}>Claim Rewards</text>
        </div>
      </div>
    </div>
  );
}

const AssetOptions = ({ open, setAsset, setOpen }) => {
  return (
    <div>
      {open ? (
        <Options>
          <Option
            onClick={() => {
              setAsset(0);
              setOpen(!open);
            }}
          >
            <GardImg src={gardLogo} />
          </Option>
          <Option
            onClick={() => {
              setAsset(1);
              setOpen(!open);
            }}
          >
            <AlgoImg src={algoLogo} />
          </Option>
        </Options>
      ) : (
        <></>
      )}
    </div>
  );
};

const Img = styled.img`
  height: 25px;
`;
const GardImg = styled.img`
  height: 25px;
  /* &:hover {
    transform: scale(1.2);
  } */
`;

const AlgoImg = styled.img`
  height: 35px;
  width: 25px;
  filter: invert();
  &:hover {
    transform: scale(1.2);
  }
`;

const Arrow = styled.img`
  width: 35px;
`;
const Heading = styled.text`
  font-weight: 500;
  margin: 4px;
`;

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


const Options = styled.ul`
  background: #172756;
  border-radius: 10px;
  border: 1px solid #ff00ff;
  border-top: none;
  margin: 0 0 0 0;
  padding: 2px 0 2px 8px;
  list-style: none;
  width: 35px;
`;
const Option = styled.li`
  appearance: none;
`;

// #80deff
// #ff00ff
