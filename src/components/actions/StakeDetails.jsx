import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setAlert } from "../../redux/slices/alertSlice";
import styled, { css } from "styled-components";
import Effect from "../Effect";
import InputField from "../InputField";
import { ids } from "../../transactions/ids";
import { getAppField, getGardBalance, getLocalAppField, getGardianBalance } from "../../transactions/lib";
import {
  getWallet,
  getWalletInfo,
  updateWalletInfo,
} from "../../wallets/wallets";
import gardLogo from "../../assets/icons/gardlogo_icon_small.png";
import gardianLogo from "../../assets/icons/gard-logo-white-square.png"
import arrowIcon from "../../assets/icons/icons8-arrow-64.png";
import algoLogo from "../../assets/icons/algorand_logo_mark_black_small.png";
import PrimaryButton from "../PrimaryButton";
import { formatToDollars } from "../../utils";
import { stake, unstake, getStakingAPY, getAccruedRewards, GardianStake, GardianUnstake, getAccruedGardianRewards,  } from "../../transactions/stake"
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
export function getNLStake(app_id=ids.app.gard_staking) {
  const phrase = app_id == ids.app.gard_staking ? "NL GARD Staked" : "NL GARDIAN Staked"
  const res = getLocalAppField(app_id, phrase)
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
  const [stake2Amount, setStake2Amount] = useState(null);
  const [maxStake, setMaxStake] = useState(0);
  const [maxGARDIANStake, setMaxGardianStake] = useState(0);
  const [noLock, setNoLock] = useState(0);
  const [noLockGardian, setNoLockGardian] = useState(0);
  const [accruedGardian, setAccruedGardian] = useState(0)
  const dispatch = useDispatch();
  const [NL_TVL, setNLTVL] = useState("...")
  const [GARDIAN_TVL, setGARDIANTVL] = useState("0")
  const [NLAPY, setNLAPY] = useState(0)
  const [NLGARDIANAPY, setNLGARDIANAPY] = useState(0);
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

  const handleStake2 = async () => {
    if (stake2Amount === null || !(stake2Amount > 0)) return;
    setLoading(true)
    try {
      const res = await GardianStake("NL", parseInt(stake2Amount))
      if (res.alert) {
        dispatch(setAlert(res.text));
      }
    } catch (e) {
      alert("Error attempting to stake GARDIAN: " + e)
      console.log(e)
    }
    setLoading(false)
  }

  const handleUnstake2 = async () => {
    if (stake2Amount === null || !(stake2Amount > 0)) return;
    setLoading(true)
    try {
      const res = await GardianUnstake("NL", parseInt(stake2Amount))
      if (res.alert) {
        dispatch(setAlert(res.text));
      }
    } catch (e) {
      alert("Error attempting to unstake: " + e)
      console.log(e)
    }
    setLoading(false)
  }

  const handleInput2 = (e) => {
    setStake2Amount(e.target.value);
  }

  useEffect(async () => {
    const infoPromise = updateWalletInfo();
    const TVLPromise = getAppField(ids.app.gard_staking, "NL")
    const gardianTVLPromise = getAppField(ids.app.gardian_staking, "NL")
    const APYPromise = getStakingAPY("NL")
    const accruePromise = getAccruedRewards("NL")
    const accruedGardianPromise = getAccruedRewards("NL", ids.app.gardian_staking)
    await infoPromise
    const info = getWalletInfo()
    setNoLock(getNLStake())
    setNoLockGardian(getNLStake(ids.app.gardian_staking))
    setMaxStake(getGardBalance(info));
    setMaxGardianStake(getGardianBalance(info))
    setNLAPY((await APYPromise))
    setNLTVL(((await TVLPromise) / 1000000).toLocaleString())
    setGARDIANTVL((await gardianTVLPromise))
    setAccrued((await accruePromise) / 1000000)
    setAccruedGardian(await accruedGardianPromise)
    console.log(GARDIAN_TVL)
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
                1k - 2k GARD being paid out WEEKLY for users staking GARD!
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
        <Container style={{ maxWidth: `${mobile ? "95%" : ""}` }}>
          <FirstRow>{"Staking Pools (Auto-Compounding)"}</FirstRow>
          <StakeTitle>
              <Heading>No-Lock GARD</Heading>
              {mobile ? <></> : <Heading>You have {Math.trunc(maxStake*Math.pow(10, 2))/Math.pow(10, 2)} GARD</Heading>}
          </StakeTitle>
          <SecondThirdCondensed mobile={mobile}>
            <SecondRow mobile={mobile}>
              <Heading>TVL</Heading>
              <Heading>Type</Heading>
              <Heading>Duration</Heading>
              <Heading>APR</Heading>
              {mobile ? <Heading>GARD Balance</Heading> : <></>}
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
              <Heading>{`${NLAPY.toFixed(2)}%`}</Heading>
              {mobile ? <Heading>{maxStake.toFixed(2)} GARD</Heading> : <></>}
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
                </StakeBox>
              )}
            </ThirdRow>
          </SecondThirdCondensed>
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
              </StakeBox>
              ) : (
                <></>
              )}
              <StakeBtn mobile={mobile} text="Stake" blue={true} onClick={handleStake} />
              <UnstakeBtn mobile={mobile} text="Unstake" blue={true} onClick={handleUnstake} />
            </div>
          </FourthRow>
          <StakeTitle mobile={mobile}>
              <Heading>No-Lock GARDIAN</Heading>
              {mobile ? <></> : <Heading>You have {maxGARDIANStake} GARDIAN</Heading>}
          </StakeTitle>
          <SecondThirdCondensed mobile={mobile}>
            <SecondRow mobile={mobile}>
              <Heading>TVL</Heading>
              <Heading>Type</Heading>
              <Heading>Duration</Heading>
              <Heading>APR</Heading>
              {mobile ? <Heading>GARDIAN Balance</Heading> : <></>}
              {/* {isMobile ? (<></>) : (<StakeHeading>Stake Amount</StakeHeading>)} */}
              <StakeHeading style={{visibility: `${isMobile() ? "hidden" : "visible"}`}} >Stake Amount</StakeHeading>
            </SecondRow>
            <ThirdRow mobile={mobile}>
              <Heading>{`${GARDIAN_TVL.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`}</Heading>
              <TypeCont>
                <Img src={gardianLogo}></Img>
                <Arrow src={arrowIcon}></Arrow>
                <GardImg src={gardianLogo}></GardImg>
                <AssetOptions
                  open={optionsOpen}
                  setAsset={setAssetType}
                  setOpen={setOptionsOpen}
                />
              </TypeCont>
              <Heading>No-Lock</Heading>
              <Heading>{`${(100*(100 * 1000000/GARDIAN_TVL)).toFixed(2)}%`}</Heading>
              {mobile ? <Heading>{maxGARDIANStake} GARDIAN</Heading> : <></>}
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
                    value={stake2Amount}
                    callback={handleInput2}
                  />
                  <EffectContainer>
                  </EffectContainer>
                </StakeBox>
              )}
            </ThirdRow>
          </SecondThirdCondensed>
          <FourthRow mobile={mobile}>
          <Effect
              title="Your Stake"
              val={`${(noLockGardian + accruedGardian)} GARDIAN`}
              hasToolTip={true}
            />
            <Effect
              title="Est. Rewards / Day"
              val={`${(((100 * 1000000/GARDIAN_TVL) * (noLockGardian + accruedGardian)) /
              365
              ).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} GARDIAN`}
              hasToolTip={true}
            />
            <Effect
              title="New Rewards"
              val={accruedGardian}
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
                  value={stake2Amount}
                  callback={handleInput2}
                />
                <EffectContainer>
                </EffectContainer>
              </StakeBox>
              ) : (
                <></>
              )}
              <StakeBtn mobile={mobile} text="Stake" blue={true} onClick={handleStake2} />
              <UnstakeBtn mobile={mobile} text="Unstake" blue={true} onClick={handleUnstake2} />
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
  margin-right: 9px;
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
  width: 90%;
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
  height: 100%;
  border: 1px solid white;
  background: #0e1834;
  border-radius: 10px;
  justify-self: center;
  margin-top: 25px;
  margin-bottom: 100px;
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
  margin-top: 9px;
  justify-content: center;
  align-content: center;
  background: #172756;
  padding-right: 22px;
  padding-left: 22px;
  height: 44px;
  @media (${device.tablet}) {
    width: 40%;
    height: 18%;
    padding: 22px;
    grid-template-rows: repeat(4, 40px [col-start]);
  }
  ${(props) => props.mobile && css`
    width: 40%;
    height: 18%;
    padding: 22px;
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, 40px [col-start]);
  `}
`;
const StakeTitle = styled.div`
  display: flex;
  margin-top: 9px;
  justify-content: space-between;
  align-items: center;
  align-content: center;
  background: #172756;
  padding-right: 22px;
  padding-left: 22px;
  height: 44px;
`;
const ThirdRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  justify-content: center;
  margin: 22px 22px 4px 22px;
  @media (${device.tablet}) {
    width: 40%;
    margin: 9px 0px 0px 0px;
    height: 18%;
    padding: 22px;
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, 40px [col-start]);
  }
  ${(props) => props.mobile && css`
    width: 40%;
    margin: 9px 0px 0px 0px;
    height: 18%;
    padding: 22px;
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, 40px [col-start]);
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
  flex-direction: row;
  align-items: center;
  position: relative;
  left: -13px;
  top: -5px;
  @media (${device.tablet}) {
    flex-direction: column;
    /* visibility: hidden; */
  }
`;
const FourthRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  justify-content: center;
  margin: 10px;
  @media (${device.tablet}) {
    display: flex;
    flex-direction: column-reverse;
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
  width: max-content;
  @media (${device.tablet}) {
    margin: 4px;
  }
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
  width: ${`${globalMobile? "52vw" : "8.75vw"};`};
  height: 25px;
  border: 1px transparent;
  text-decoration-color: #7c52ff;
  text-decoration-thickness: 1px;
  font-size: 16px;
  color: #ffffff;
  text-align: center;
  background: #0d122710;
  align-self: start;
  ${(props) => props.mobile && css`
    align-self: center;
  `}

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
  position: relative;
  bottom: -8px;
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
  font-size: 12px;
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
  margin-top: 1px;
  color: #999696;
  font-size: 12px;
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
