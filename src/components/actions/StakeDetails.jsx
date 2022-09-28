import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import styled from "styled-components";
import Effect from "../Effect";
import InputField from "../InputField";
import {
  getWallet,
  getWalletInfo,
  updateWalletInfo,
} from "../../wallets/wallets";
import { getPrice } from "../../transactions/cdp.js";
import gardLogo from "../../assets/icons/gardlogo_icon_small.png";
import arrowIcon from "../../assets/icons/icons8-arrow-64.png";
import algoLogo from "../../assets/icons/algorand_logo_mark_black_small.png";
import PrimaryButton from "../PrimaryButton";
import { formatToDollars } from "../../utils";
import { stake, unstake } from "../../transactions/stake"

// asset types: 0 === GARD, 1 === ALGO

function mAlgosToAlgos(num) {
  return num / 1000000;
}
function algosToMAlgos(num) {
  return num * 1000000;
}

export default function StakeDetails() {
  const walletAddress = useSelector((state) => state.wallet.address);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(null);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [assetType, setAssetType] = useState(0);
  const [stakeAmount, setStakeAmount] = useState("");
  const [maxStake, setMaxStake] = useState(0);
  const [price, setPrice] = useState(0);

  const [balance, setBalance] = useState("...");
  const navigate = useNavigate();

  const handleInput = (e) => {
    setStakeAmount(e.target.value === "" ? "" : Number(e.target.value));
  }

  const handleMaxStake = () => {
    setMaxStake(maxStake);
    let max = balance
    setStakeAmount(max)
    console.log("stake", stakeAmount);
  };

  const handleStake = async () => {
    console.log(`action to stake ${stakeAmount}`)
    setLoading(true)
    try {
      await stake("NL", stakeAmount)
      setLoading(false)
    } catch (e) {
      alert("Error attempting to stake: " + e)
      console.log(e)
    }
  }

  useEffect(async () => {
    setPrice(await getPrice());
    await updateWalletInfo();
    getWallet();
    setBalance((getWalletInfo()["amount"] / 1000000).toFixed(3));
    setMaxStake(
      mAlgosToAlgos(
        getWalletInfo()["amount"] -
          307000 -
          100000 * (getWalletInfo()["assets"].length + 4),
      ).toFixed(3),
    );
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
      <Container>
        <FirstRow>Staking Pool</FirstRow>
        <SecondRow>
          <Heading>TVL</Heading>
          <Heading>Type</Heading>
          <Heading>Duration</Heading>
          <Heading>APY</Heading>
          <Heading>Stake Amount</Heading>
        </SecondRow>
        <ThirdRow>
          <Heading>109,900 ALGO</Heading>
          <div>
            <Img src={gardLogo}></Img>
            <Arrow src={arrowIcon}></Arrow>
            <GardImg src={gardLogo}></GardImg>
            <AssetOptions
              open={optionsOpen}
              setAsset={setAssetType}
              setOpen={setOptionsOpen}
            />
          </div>
          <Heading>No-Lock</Heading>
          <Heading>.1%</Heading>
          <StakeBox>
            <StakeInput
              id="stake-amt"
              placeholder="0.00"
              type="number"
              value={stakeAmount}
              callback={handleInput}
            />
            <EffectContainer>
              <MaxBtn onClick={handleMaxStake}>
                +MAX
              </MaxBtn>
              <Result>{formatToDollars(balance * price)}</Result>
            </EffectContainer>
          </StakeBox>
        </ThirdRow>
        <FourthRow>
          <Effect title="Your Stake" val={`${stakeAmount} ALGO`} hasToolTip={false} />
          <Effect
            title="Rewards / Day"
            val="..."
            hasToolTip={false}
          />
          <Effect
            title="Rewards Accrued"
            val="..."
            hasToolTip={false}
          />
          <PrimaryButton text="Stake" onClick={handleStake} />
        </FourthRow>
      </Container>
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

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 20%;
  width: 100%;
  border: 1px solid #80deff;
  background: #0e1834;
  border-radius: 10px;
  justify-self: center;
  margin-top: 25px;
`;

const FirstRow = styled.div`
  text-align: left;
  font-weight: bolder;
  font-size: 22;
  margin-left: 12px;
  margin-bottom: 10px;
  height: 22%;
  padding-top: 25px;
`;
const SecondRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  justify-content: center;
  background: #172756;
  height: 18%;
  // margin: 22
  padding: 22px;
`;
const ThirdRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  justify-content: center;
  margin: 22px;
`;
const StakeBox = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`;
const FourthRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  justify-content: center;
  margin: 10px;
`

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

const StakeInput = styled(InputField)`
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

const MaxBtn = styled.text`
  font-weight: bold;
  font-size: 12;
  color: #80deff;
  margin: auto;
  color: #80edff;
  text-decoration: dotted underline;
  text-decoration-color: #999696;
  &:hover {
    transform: scale(1.1)
  }
`

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
