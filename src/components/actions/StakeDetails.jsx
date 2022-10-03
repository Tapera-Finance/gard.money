import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import styled from "styled-components";
import Effect from "../Effect";
import InputField from "../InputField";
import { ids } from "../../transactions/ids";
import { getAppField } from "../../transactions/lib";
import {
  getWallet,
  getWalletInfo,
  updateWalletInfo,
} from "../../wallets/wallets";
import { getGardBalance } from "../../transactions/lib.js";
import gardLogo from "../../assets/icons/gardlogo_icon_small.png";
import arrowIcon from "../../assets/icons/icons8-arrow-64.png";
import algoLogo from "../../assets/icons/algorand_logo_mark_black_small.png";
import PrimaryButton from "../PrimaryButton";
import { formatToDollars } from "../../utils";
import { stake, unstake } from "../../transactions/stake"
import LoadingOverlay from "../LoadingOverlay";

// asset types: 0 === GARD, 1 === ALGO

function mAlgosToAlgos(num) {
  return num / 1000000;
}
function algosToMAlgos(num) {
  return num * 1000000;
}

// Gets Active wallet Stake in simple no-lock pool
function getNLStake() {
  const user_info = getWalletInfo();
  const encodedNLStake = "TkwgR0FSRCBTdGFrZWQ=";

  for (let i = 0; i < user_info["apps-local-state"].length; i++) 
  {
    if (user_info["apps-local-state"][i].id == ids.app.gard_staking) {
      const gs_info = user_info["apps-local-state"][i];
        if (gs_info.hasOwnProperty("key-value")) {
          for (let n = 0; n < gs_info["key-value"].length; n++) {
            if (gs_info["key-value"][n]["key"] == encodedNLStake) {
              return gs_info["key-value"][n]["value"]["uint"];
            } 
          }
        }
    }
  }
  return 0;
}

export default function StakeDetails() {
  const walletAddress = useSelector((state) => state.wallet.address);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(null);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [assetType, setAssetType] = useState(0);
  const [stakeAmount, setStakeAmount] = useState("");
  const [maxStake, setMaxStake] = useState(0);
  const [noLock, setNoLock] = useState(0);
  const [NL_TVL, setNLTVL] = useState("...")

  const [balance, setBalance] = useState("...");
  const navigate = useNavigate();

  const handleInput = (e) => {
    setStakeAmount(e.target.value === "" ? "" : Number(e.target.value));
  }

  var sessionStorageSetHandler = function (e) {
    setLoadingText(JSON.parse(e.value));
  };
  document.addEventListener("itemInserted", sessionStorageSetHandler, false);

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

  const handleUnstake = async () => {
    console.log(`action to unstake ${stakeAmount}`)
    setLoading(true)
    try {
      await unstake("NL", stakeAmount)
      setLoading(false)
    } catch (e) {
      alert("Error attempting to stake: " + e)
      console.log(e)
    }
  }

  useEffect(async () => {
    const infoPromise = updateWalletInfo();
    const TVLPromise = getAppField(ids.app.gard_staking, "NL")
    await infoPromise
    setNoLock(getNLStake())
    setBalance(getGardBalance(getWalletInfo()).toFixed(2));
    setMaxStake(getGardBalance(getWalletInfo()).toFixed(2));
    setNLTVL(((await TVLPromise) / 1000000).toFixed(2))
  }, []);

  useEffect(() => {
    if (!walletAddress) navigate("/");
  }, [walletAddress]);


  return (
    <div>
      {loading ? (<LoadingOverlay text={loadingText} close={()=>{setLoading(false);}} />) : <></>}
      <div style={{display: "flex", flexDirection: "column"}} >
      <Banner>
      <div
          style={{
            justifyContent: "center",
            textAlign: "left",
            alignItems: "center",
            color: "#172756",
          }}
        >
          <div style={{ fontSize: "12pt",  }}>GARD Staking Rewards!</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: "center",
            marginLeft: "0px",
          }}
        >
          <div style={{
            display: "flex",
            textAlign: "left",
            flexDirection: "column"
          }}>

          <div style={{ color: "#172756", fontSize: "10pt" }}>Earn protocol rewards boosted by the Algorand Foundation via Aeneas grant!</div>
          </div>
        </div>
        <div style={{display: "flex", alignItems: "center", justifyContent: "flex-end"}}>

        <Link>Stake GARD to Earn Rewards</Link>
        </div>
      </Banner>
    <div
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >

      </div>
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
          <Heading>{`$${NL_TVL}`}</Heading>
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
              min="0"
              step=".01"
              type="number"
              value={stakeAmount}
              callback={handleInput}
            />
            <EffectContainer>
              <MaxBtn onClick={handleMaxStake}>
                +MAX
              </MaxBtn>
              <Result>{formatToDollars(balance)}</Result>
            </EffectContainer>
          </StakeBox>
        </ThirdRow>
        <FourthRow>
          <Effect title="Your Stake" val={`${(noLock/1000000).toFixed(3)} GARD`} hasToolTip={false} />
          <Effect
            title="Rewards / Day"
            val="TBD"
            hasToolTip={false}
          />
          <Effect
            title="Rewards Accrued"
            val="TBD"
            hasToolTip={false}
          />
          <div style={{display: "flex", flexDirection: "row", alignSelf: "baseline"}}>

          <PrimaryButton text="Stake" blue={true} onClick={handleStake} />
          <PrimaryButton text="Unstake" blue={true} onClick={handleUnstake} />
          </div>
        </FourthRow>
      </Container>
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

const Link = styled.text`
  text-decoration: none;
  font-weight: 400;
  font-size: 10pt;
  color: #172756;
  margin-right: 6px;
  /* &:hover {
    color: #03a0ff;
    cursor: pointer;
  } */
`;

const Banner = styled.div`
  display: flex;
  flex-direction: row;
  border-radius: 10px;
  justify-content: space-between;
  text-align: center;
  background: linear-gradient(to right, #80deff 65%, #ffffff);
  padding: 8px 6px 10px 8px;
  margin: 8px;
  margin-bottom: 12px;
`


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
  font-size: 18pt;
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
  margin: 22px 22px 4px 22px;
`;
const StakeBox = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: row;
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
  width: 12vw;
  height: 6vh;
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
