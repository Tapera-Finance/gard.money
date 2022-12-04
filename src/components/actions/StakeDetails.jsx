import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setAlert } from "../../redux/slices/alertSlice";
import styled, { css } from "styled-components";
import Effect from "../Effect";
import InputField from "../InputField";
import { ids } from "../../transactions/ids";
import { getAppField, getGardBalance, getLocalAppField } from "../../transactions/lib";
import {
  getWallet,
  getWalletInfo,
  updateWalletInfo,
} from "../../wallets/wallets";
import gardLogo from "../../assets/icons/gardlogo_icon_small.png";
import arrowIcon from "../../assets/icons/icons8-arrow-64.png";
import algoLogo from "../../assets/icons/algorand_logo_mark_black_small.png";
import PrimaryButton from "../PrimaryButton";
import { formatToDollars } from "../../utils";
import { stake, unstake, getStakingAPY, getAccruedRewards } from "../../transactions/stake"
import LoadingOverlay from "../LoadingOverlay";
import { size, device } from "../../styles/global"
import { isMobile } from "../../utils"

// asset types: 0 === GARD, 1 === ALGO

function mAlgosToAlgos(num) {
  return num / 1000000;
}
function algosToMAlgos(num) {
  return num * 1000000;
}

// Gets Active wallet Stake in simple no-lock pool
function getNLStake() {
  const res = getLocalAppField(ids.app.gard_staking, "NL GARD Staked")
  if (res === undefined) {
    return 0;
  }
  return res
}

export const checkStaked = async () => {
  const accruePromise = getAccruedRewards("NL")
  const accrued = await accruePromise
  return ((getNLStake()/1000000)+parseFloat(accrued)).toFixed(3) > 0
}

const mobileView = () => {
  return window.innerWidth < parseInt(size.tablet)
}

export default function StakeDetails() {
  const [mobile, setMobile] = useState(isMobile());
  const walletAddress = useSelector((state) => state.wallet.address);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(null);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [assetType, setAssetType] = useState(0);
  const [stakeAmount, setStakeAmount] = useState(null);
  const [maxStake, setMaxStake] = useState(0);
  const [noLock, setNoLock] = useState(0);
  const dispatch = useDispatch();
  const [NL_TVL, setNLTVL] = useState("...")
  const [NLAPY, setNLAPY] = useState(0)
  const [balance, setBalance] = useState("...");
  const [accrued, setAccrued] = useState(0);
  const navigate = useNavigate();

  const handleInput = (e) => {
    setStakeAmount(e.target.value);
  }

  var sessionStorageSetHandler = function (e) {
    setLoadingText(JSON.parse(e.value));
  };
  document.addEventListener("itemInserted", sessionStorageSetHandler, false);

  const handleMaxStake = () => {
    setStakeAmount(maxStake)
  };

  const handleStake = async () => {
    console.log(`action to stake ${stakeAmount}`)
    if (stakeAmount === null || !(stakeAmount > 0)) return;
    setLoading(true)
    try {
      const res = await stake("NL", stakeAmount)
      if (res.alert) {
        dispatch(setAlert(res.text));
      }
    } catch (e) {
      alert("Error attempting to stake: " + e)
      console.log(e)
    }
    setLoading(false)
  }

  const handleUnstake = async () => {
    console.log(`action to unstake ${stakeAmount}`)
    if (stakeAmount === null || !(stakeAmount > 0)) return;
    setLoading(true)
    try {
      const res = await unstake("NL", stakeAmount)
      if (res.alert) {
        dispatch(setAlert(res.text));
      }
    } catch (e) {
      alert("Error attempting to unstake: " + e)
      console.log(e)
    }
    setLoading(false)
  }
  useEffect(async () => {
    const infoPromise = updateWalletInfo();
    const TVLPromise = getAppField(ids.app.gard_staking, "NL")
    const APYPromise = getStakingAPY("NL")
    const accruePromise = getAccruedRewards("NL")
    await infoPromise
    setNoLock(getNLStake())
    setBalance(getGardBalance(getWalletInfo()).toFixed(2));
    setMaxStake(getGardBalance(getWalletInfo()));
    setNLAPY((await APYPromise))
    setNLTVL(((await TVLPromise) / 1000000).toLocaleString())
    setAccrued((await accruePromise) / 1000000)
  }, []);

  useEffect(() => {
    if (!walletAddress) navigate("/");
  }, [walletAddress]);

  useEffect(() => {
    setMobile(isMobile())
  }, [])


  return (
    <div>
      {loading ? (
        <LoadingOverlay
          text={loadingText}
          close={() => {
            setLoading(false);
          }}
        />
      ) : (
        <></>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Banner>
          <div
            style={{
              justifyContent: "center",
              textAlign: "left",
              alignItems: "center",
              color: "#172756",
            }}
          >
            <div style={{ fontSize: "12pt" }}>GARD Staking Rewards!</div>
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
            <div
              style={{
                display: "flex",
                textAlign: "left",
                flexDirection: "column",
              }}
            >
              <div style={{ color: "#172756", fontSize: "10pt" }}>
                5k - 10k GARD being paid out WEEKLY for users staking GARD on V2
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Link>Stake GARD to Earn Rewards</Link>
          </div>
        </Banner>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        ></div>
        <Container style={{ maxWidth: `${mobile ? "90%" : ""}` }}>
          <FirstRow>{"Staking Pool (Auto-Compounding)"}</FirstRow>
          <SecondThirdCondensed mobile={mobile}>
            <SecondRow mobile={mobile}>
              <Heading>TVL</Heading>
              <Heading>Type</Heading>
              <Heading>Duration</Heading>
              <Heading>APR</Heading>
              {/* {isMobile ? (<></>) : (<StakeHeading>Stake Amount</StakeHeading>)} */}
              <StakeHeading style={{visibility: `${isMobile() ? "hidden" : "visible"}`}} >Stake Amount</StakeHeading>
            </SecondRow>
            <ThirdRow mobile={mobile}>
              <Heading>{`$${NL_TVL}`}</Heading>
              <TypeCont>
                <Img src={gardLogo}></Img>
                <Arrow src={arrowIcon}></Arrow>
                <GardImg src={gardLogo}></GardImg>
                <AssetOptions
                  open={optionsOpen}
                  setAsset={setAssetType}
                  setOpen={setOptionsOpen}
                />
              </TypeCont>
              <Heading>No-Lock</Heading>
              <Heading>{`${NLAPY.toFixed(3)}%`}</Heading>
              {mobile || (window.innerWidth < 760) ? (
                <></>
              ) : (
                <StakeBox>

                  <StakeInput
                    id="stake-amt"
                    placeholder="Enter Amount"
                    min="0.0"
                    step=".01"
                    type="number"
                    value={stakeAmount}
                    callback={handleInput}
                  />
                  <EffectContainer>
                    <MaxBtn onClick={handleMaxStake}>+MAX</MaxBtn>
                    <Result>{formatToDollars(balance)}</Result>
                  </EffectContainer>
                </StakeBox>
              )}
            </ThirdRow>
          </SecondThirdCondensed>

          {/* <MobileGrid>
            <MobileStakeBox mobile={mobile}>
              <MobileHeader>Stake Amount:</MobileHeader>
              <MobileStakeContainer>
                <MobileStakeInput
                  id="stake-amt"
                  placeholder="Enter Amount"
                  min="0.0"
                  step=".01"
                  type="number"
                  value={stakeAmount}
                  callback={handleInput}
                />
              </MobileStakeContainer>
            </MobileStakeBox>
            <MobileEffectContainer>
              <MaxBtn onClick={handleMaxStake}>+MAX</MaxBtn>
              <Result>{formatToDollars(balance)}</Result>
            </MobileEffectContainer>
          </MobileGrid>
          <MobileActionBar>
            <MobileStakeBtn text="Stake" blue={true} onClick={handleStake} />
            <MobileUnstakeBtn
              text="Unstake"
              blue={true}
              onClick={handleUnstake}
            />
          </MobileActionBar> */}
          <FourthRow mobile={mobile}>
            <Effect
              title="Your Stake"
              val={`${(noLock / 1000000 + parseFloat(accrued)).toFixed(
                3,
              )} GARD`}
              hasToolTip={true}
            />
            <Effect
              title="Est. Rewards / Day"
              val={`${(
                ((NLAPY / 100) * (noLock / 1000000 + parseFloat(accrued))) /
                365
              ).toFixed(3)} GARD`}
              hasToolTip={true}
            />
            <Effect
              title="New Rewards"
              val={`${parseFloat(accrued).toFixed(4)}`}
              hasToolTip={true}
            />
            <div
              style={{
                display: "flex",
                flexDirection: `${mobile ? "column" : "row"}`,
                margin: 10,
                alignSelf: `${mobile || (window.innerWidth < 760)? "unset" : "baseline"}`,
              }}
            >
              <StakeBtn mobile={mobile} text="Stake" blue={true} onClick={handleStake} />
              <UnstakeBtn mobile={mobile} text="Unstake" blue={true} onClick={handleUnstake} />
              {mobile || (window.innerWidth < 760) ? (
                <StakeBox style={{flexDirection: `${mobile ? "column" : "row"}`}}>
                  {isMobile ? (<StakeHeading mobile={mobile}>Stake Amount</StakeHeading>) : (<></>)}
                <StakeInput
                  mobile={mobile}
                  id="stake-amt"
                  placeholder="Enter Amount"
                  min="0.0"
                  step=".01"
                  type="number"
                  value={stakeAmount}
                  callback={handleInput}
                />
                <EffectContainer>
                  <MaxBtn onClick={handleMaxStake}>+MAX</MaxBtn>
                  <Result>{formatToDollars(balance)}</Result>
                </EffectContainer>
              </StakeBox>
              ) : (
                <></>
              )}
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

// Mobile Components
const MobileGrid = styled.div`
  visibility: hidden;
  height: 0px;
  @media (${device.tablet}) {
    visibility: visible;
    display: grid;
    grid-template-columns: repeat(2, 50%);
    height: 100%;
  }
`

const MobileStakeBox = styled.div`
  visibility: hidden;
  @media (${device.tablet}) {
    visibility: visible;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  /* ${(props) => props.mobile && css`
    visibility: visible;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  `} */

`
const MobileHeader = styled.div`
    visibility: hidden;
  @media (${device.tablet}) {
    visibility: visible;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 18px 0px 6px 0px;;
    text-decoration: dotted underline;

  }
`

const MobileStakeContainer = styled.div`
    visibility: hidden;
    height: 0px;
  @media (${device.tablet}) {
    visibility: visible;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
`

const MobileStakeInput = styled(InputField)`
  visibility: hidden;
  width: 22vw;
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
  @media (${device.tablet}) {
    visibility: visible;
  }
`
const MobileStakeBtn = styled(PrimaryButton)`
  visibility: hidden;
  @media (${device.tablet}) {
    visibility: visible;
  }
`
const MobileUnstakeBtn = styled(PrimaryButton)`
visibility: hidden;
  @media (${device.tablet}) {
    visibility: visible;
  }
`

const MobileActionBar = styled.div`
visibility: hidden;
height: 0px;
  @media (${device.tablet}) {
    visibility: visible;
    display: grid;
    grid-template-columns: repeat(2, 50%);
    height: 100%;
  }
`

// Styled Components

const StakeBtn = styled(PrimaryButton)`
  ${(props) => props.mobile && css`
    margin: 4px;
  `}
  @media (${device.tablet}) {
    /* visibility: hidden; */
  }
`
const UnstakeBtn = styled(PrimaryButton)`
${(props) => props.mobile && css`
    margin: 4px;
  `}
  @media (${device.tablet}) {
    /* visibility: hidden; */
  }
`


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
  width: 100%;
  border: 1px solid white;
  align-content: center;
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
  border: 1px solid white;
  background: #0e1834;
  border-radius: 10px;
  justify-self: center;
  margin-top: 25px;
  @media (${device.tablet}) {
    width: 80vw;
  }
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
  /* background: #172756; */
  height: 18%;
  padding: 22px;
  @media (${device.tablet}) {
    display: flex;
    flex-direction: column;
    width: 40%;
  }
  ${(props) => props.mobile && css`
    /* display: flex; */
    grid-template-columns: unset;
  `}
`;
const ThirdRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  justify-content: center;
  margin: 2px 22px 4px 22px;
  @media (${device.tablet}) {
    display: flex;
    flex-direction: column;
    width: 40%;
    margin-top: 0px;
    margin-bottom: 18px;
  }
  ${(props) => props.mobile && css`
    display: flex;
    flex-direction: column;
    height: 21.052vh;
  `}
`;

const SecondThirdCondensed = styled.div`
  @media (${device.tablet}) {
    display: flex;
    flex-direction: row;
  }
  ${(props) => props.mobile && css`
    display: flex;
    /* grid-template-columns: repeat(2, 49%); */
  `}

`

const TypeCont = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  @media (${device.tablet}) {
    transform: scale(0.8);
    /* margin-top: -8px; */
    justify-content: unset;
    padding-right: 10px;
  }
`

const StakeBox = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: row;
  align-items: center;
  @media (${device.tablet}) {
    flex-direction: column;
    /* visibility: hidden; */
    height: 0px;
  }
`;
const FourthRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  justify-content: center;
  margin: 10px;
  @media (${device.tablet}) {
    display: flex;
    flex-direction: column;
  }
  ${(props) => props.mobile && css`
    display: flex;
    flex-direction: column-reverse;
  `}
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
  width: max-content;
`;
const StakeHeading = styled.text`
${(props) => props.mobile && css`
    margin-top: 18px;
    font-weight: 600px;
  `}
  @media (${device.tablet}) {
    /* visibility: hidden; */
  }
`

const globalMobile = isMobile();

const StakeInput = styled(InputField)`

  width: ${`${globalMobile? "52vw" : "12vw"};`};
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
  @media (${device.tablet}) {
    /* visibility: hidden; */
  }
`;

const EffectContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
`;

const MobileEffectContainer = styled.div`
  visibility: hidden;
  @media (${device.tablet}) {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    align-items: center;
    margin-bottom: 16px;
    visibility: visible;
  }
`

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
  cursor: pointer;
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
