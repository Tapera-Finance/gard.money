import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styled, {css} from "styled-components";
import Details from "../components/Details";
import Effect from "../components/Effect";
import LoadingOverlay from "../components/LoadingOverlay";
import Positions from "../components/Positions";
import { CDPsToList, dummyCDPs } from "../components/Positions";
import PrimaryButton from "../components/PrimaryButton";
import RewardNotice from "../components/RewardNotice";
import ToolTip from "../components/ToolTip";
import {
  getWallet,
  getWalletInfo,
  handleTxError,
  updateWalletInfo,
} from "../wallets/wallets";
import { calcRatio, getPrice, openCDP } from "../transactions/cdp";
import { cdpInterest } from "../transactions/lib";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAlert } from "../redux/slices/alertSlice";
import { commitmentPeriodEnd } from "../globals";
import algoLogo from "../assets/icons/algorand_logo_mark_white.png";
import gAlgoLogo from "../assets/icons/galgo-icon.png"
import gardLogo from "../assets/icons/gardlogo_icon_small.png";
import { getAlgoGovAPR } from "../components/Positions";
import Select from "../components/Select";
import { ids } from "../transactions/ids"
import { size, device } from "../styles/global"

export function displayRatio() {
  return calcRatio(algosToMAlgos(getCollateral()), getMinted(), 0, true); // TODO: Need to set the ASA ID Properly
}

export function mAlgosToAlgos(num) {
  return num / 1000000;
}
export function algosToMAlgos(num) {
  return num * 1000000;
}

export function displayLiquidationPrice() {
  return "$" + ((1.15 * getMinted()) / getCollateral()).toFixed(4);
}

export const adjustedMax = () => {
  return mAlgosToAlgos(
    getWalletInfo()["amount"] -
      307000 -
      100000 * (getWalletInfo()["assets"].length + 4) -
      getWalletInfo()["min-balance"],
  ).toFixed(3);
};

export function getMinted() {
  if (
    document.getElementById("minted") == null ||
    isNaN(parseFloat(document.getElementById("minted").value))
  ) {
    return null;
  }
  return parseFloat(document.getElementById("minted").value);
}

export function getCollateral() {
  if (
    document.getElementById("collateral") == null ||
    isNaN(parseFloat(document.getElementById("collateral").value))
  ) {
    return null;
  }
  return parseFloat(document.getElementById("collateral").value);
}

export default function BorrowContent() {
  const walletAddress = useSelector(state => state.wallet.address);
  const [modalVisible, setModalVisible] = useState(false);
  const [canAnimate, setCanAnimate] = useState(false);
  const [collateralType, setCollateralType] = useState("ALGO");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [balance, setBalance] = useState("...");
  const [price, setPrice] = useState(0);
  const [supplyPrice, setSupplyPrice] = useState(0);
  const [apr, setAPR] = useState(0);
  const [borrowPrice, setBorrowPrice] = useState(0);
  const cdps = CDPsToList();

  //initial code snippets
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(null);
  const [cAlgos, setCollateral] = useState("");
  const [maxCollateral, setMaxCollateral] = useState(0);
  const [mGARD, setGARD] = useState("");
  const [maxGARD, setMaxGARD] = useState(0);
  const [commitChecked, setCommitChecked] = useState(false);
  const [toWallet, setToWallet] = useState(true);
  const [isGAlgo, setIsGAlgo] = useState(false);
  const [createPositionShown, setCreatePositionShown] = useState(false);
  const assets = ["ALGO", "gALGO"];

  const borrowIcon = collateralType === "ALGO" ? algoLogo : gAlgoLogo

  const handleCheckboxChange = () => {
    setCommitChecked(!commitChecked);
  };

  const handleCheckboxChange1 = () => {
    setToWallet(!toWallet);
  };

  const handleSelect = (e) => {
    if (e.target.value === "") {
      return;
    }
    setCollateralType(e.target.value)
    console.log('collat selected',e.target.value);
  }

  useEffect(() => {
    if (cdps == dummyCDPs) {
      setCreatePositionShown(true);
    }
  }, []);

  useEffect(() => {
    collateralType === "gALGO" ? setIsGAlgo(true) : setIsGAlgo(false)
  }, [collateralType])

  useEffect(async () => {
    setPrice(await getPrice());
    await updateWalletInfo();
    getWallet();
    setBalance((getWalletInfo()["amount"] / 1000000).toFixed(3));
    console.log("log wallet", getWalletInfo())
    setMaxCollateral(adjustedMax());
  }, []);

  useEffect(() => {
    let walletInfo = getWalletInfo() && getWalletInfo()["assets"].length > 0 ? getWalletInfo()["assets"] : null
    if (isGAlgo) {
      let max = (
        walletInfo &&
        walletInfo.filter((i) => i["asset-id"] === ids.asa.galgo).length > 0
          ? walletInfo.filter((i) => i["asset-id"] === ids.asa.galgo)[0][
              "amount"
            ] / 1000000
          : 0
      ); // hardcoded asa for now, should filter based on generic selected asset
      setMaxCollateral((Math.trunc(max*1000)/1000).toFixed(3));
    } else {
      setBalance((getWalletInfo()["amount"] / 1000000).toFixed(3));
      setMaxCollateral(adjustedMax());
    }
  }, [isGAlgo])

  useEffect(() => {
    setSupplyPrice(price);
  }, [price]);

  useEffect(async () => {
    setAPR(await getAlgoGovAPR())
}, []);

  useEffect(() => {
    if (!walletAddress) navigate("/");
  }, [walletAddress]);

  const handleSupplyChange = async (event) => {
    setCollateral(event.target.value === "" ? "" : Number(event.target.value));
    if (typeof Number(event.target.value) === "number" && mGARD === "") {
      setGARD(1)
    }
    let max =
      Math.trunc(
        (100 *
          ((algosToMAlgos(price) * algosToMAlgos(Number(event.target.value))) /
            1000000)) /
          1.4 /
          1000000,
      ) / 100;
    setMaxGARD(max);

    if (mGARD > max) {
      setGARD(max < 1 ? 1 : max);
    }
  };

  const handleMaxCollateral = () => {
    setCollateral(Number((maxCollateral)).toFixed(3)); // lower submittable max to prevent wallet balance error
    let max =
      Math.trunc(
        (100 *
          ((algosToMAlgos(price) * algosToMAlgos(maxCollateral)) / 1000000)) /
          1.4 /
          1000000,
      ) / 100;
    setMaxGARD(max);
    if (mGARD > max) {
      setGARD(max < 1 ? 1 : max);
    }
    // console.log("collateral", cAlgos);
  };

  const handleBorrowChange = (event) => {
    setGARD(
      event.target.value === ""
        ? ""
        : Number(event.target.value) < 1
        ? 1
        : Number(event.target.value),
    );
    let max = isGAlgo
      ? (getWalletInfo() && getWalletInfo()["assets"].length > 0
          ? getWalletInfo()["assets"].filter(
              (i) => i["asset-id"] === ids.asa.galgo,
            )[0]["amount"] / 1000000
          : 0
        ).toFixed(3)
      : mAlgosToAlgos(
          getWalletInfo()["amount"] -
            307000 -
            100000 * (getWalletInfo()["assets"].length + 4) -
            getWalletInfo()["min-balance"],
        ).toFixed(3);
    setMaxCollateral(max);
    if (isNaN(cAlgos)) {
      console.log("heyy");
      return;
    }
    console.log("logging max gard", maxGARD)
    if (cAlgos > max) {
      // setCollateral(max);
    }
  };

  const handleMaxBorrow = () => {
    setGARD((maxGARD).toFixed(3));
    let max = isGAlgo
      ? (getWalletInfo() && getWalletInfo()["assets"].length > 0
          ? getWalletInfo()["assets"].filter(
              (i) => i["asset-id"] === ids.asa.galgo,
            )[0]["amount"] / 1000000
          : 0
        ).toFixed(3)
      : mAlgosToAlgos(
          getWalletInfo()["amount"] -
            307000 -
            100000 * (getWalletInfo()["assets"].length + 4) -
            getWalletInfo()["min-balance"],
        ).toFixed(3);
    setMaxCollateral(max);
    if (isNaN(cAlgos)) {
      console.log("heyy");
      return;
    }
    if (cAlgos > max) {
      setCollateral(max);
    }
    // console.log("gard", mGARD);
  };

  var sessionStorageSetHandler = function (e) {
    setLoadingText(JSON.parse(e.value));
  };
  document.addEventListener("itemInserted", sessionStorageSetHandler, false);
  var details = [
    {
      title: "Total Supplied (Asset)",
      val: `${cAlgos === "" ? "..." : cAlgos}`,
      hasToolTip: true,
    },
    {
      title: "Total Supplied ($)",
      val: `${cAlgos === "" ? "..." : `$${(cAlgos * supplyPrice).toFixed(2)}`}`,
      hasToolTip: true,
    },
    {
      title: "GARD Borrow APR",
      val: `${cdpInterest*100}%`,
      hasToolTip: true,
    },
    {
      title: "Borrow Utilization",
      val: `${
        cAlgos === "" || maxGARD === ""
          ? "..."
          : ((100 * mGARD) / maxGARD).toFixed(2)
      }%`,
      hasToolTip: true,
    },
    {
      title: "Liquidation Price",
      val: `${
        getMinted() == null || getCollateral() == null
          ? "..."
          : displayLiquidationPrice()
      }`,
      hasToolTip: true,
    },
    {
      title: "Bonus Supply Rewards",
      val: 0,
      hasToolTip: true,
    },
    {
      title: "ALGO Governance APR",
      val: `${apr}%`,
      hasToolTip: true,
    },
    {
      title: "Collateralization Ratio",
      val: `${
        getMinted() == null || getCollateral() == null ? "..." : displayRatio()
      }`,
      hasToolTip: true,
    },
  ];

  var supplyDetails = [
    {
      title: "Supply Limit",
      val: `${maxCollateral} ${collateralType}`,
      hasToolTip: true,
    },
  ];
  var borrowDetails = [
    {
      title: "Borrow Limit",
      val: `${maxGARD} GARD`,
      hasToolTip: true,
    },
  ];
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
      <Banner>
        <div
          style={{
            justifyContent: "center",
            textAlign: "left",
            alignItems: "center",
            color: "#172756",
          }}
        >
          <div style={{ fontSize: "10pt" }}>Missing your CDP? </div>
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
            <div
              style={{ color: "#172756", fontSize: "10pt", textAlign: "left" }}
            >
              Make sure to migrate from V1 to V2
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
          <V1Link
            onClick={() => {
              window.open("https://www.v1.gard.money/");
            }}
          >
            V1 Site
          </V1Link>
        </div>
      </Banner>
      {/*
      <Banner>
        <div
          style={{
            justifyContent: "center",
            textAlign: "left",
            alignItems: "center",
            color: "#172756",
          }}
        >
          <div style={{ fontSize: "10pt" }}>Algorand Governance Enrollment</div>
          <div style={{ fontSize: "8pt" }}>Now - October 21, 2022 EOD</div>
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
              7M Algo bonus rewards when participating via DeFi protocols
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
          <Link>Open CDP to Participate</Link>
        </div>
      </Banner>
        */}
      {createPositionShown ? (
        <div>
          <Container>
            <SubContainer>
              <Background>
                <Title>
                  Supply{" "}
                  <ExchangeSelect
                    options={assets}
                    value={collateralType}
                    callback={handleSelect}
                  />
                  {/* ALGO */}
                  <AlgoImg src={borrowIcon} isGAlgo={!isGAlgo} />
                </Title>
                <InputContainer>
                  <div style={{ display: "flex" }}>
                    <Input
                      autoComplete="off"
                      display="none"
                      placeholder={"enter amount"}
                      type="number"
                      min="0.00"
                      id="collateral"
                      value={cAlgos}
                      onChange={handleSupplyChange}
                    />
                    <MaxButton onClick={handleMaxCollateral}>
                      <ToolTip
                        toolTip={"+MAX"}
                        toolTipText={"Click to lend maximum amount"}
                      />
                    </MaxButton>
                  </div>
                  <Valuation>
                    $Value: $
                    {cAlgos === "..." ? 0.0 : (cAlgos * supplyPrice).toFixed(2)}
                  </Valuation>
                  <SupplyInputDetails>
                    {supplyDetails.length && supplyDetails.length > 0
                      ? supplyDetails.map((d) => {
                          return (
                            <Item key={d.title}>
                              <Effect
                                title={d.title}
                                val={d.val}
                                hasToolTip={d.hasToolTip}
                                rewards={d.rewards}
                              ></Effect>
                            </Item>
                          );
                        })
                      : null}
                    <label
                      style={{
                        display: "flex",
                        alignContent: "flex-start",
                      }}
                    >

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "flex-start",
                          }}
                        >
                          <InputTitle>{isGAlgo || Date.now() > commitmentPeriodEnd? "" : "Commit to governance"}</InputTitle>
                          <CommitBox
                            type={isGAlgo || Date.now() > commitmentPeriodEnd  ? "hidden" : "checkbox"}
                            onChange={handleCheckboxChange}
                          />
                        </div>

                    </label>
                  </SupplyInputDetails>
                </InputContainer>
              </Background>
            </SubContainer>

            <SubContainer>
              <Background>
                <BorrowTitle>
                  Borrow GARD <GardImg src={gardLogo} />
                </BorrowTitle>

                <InputContainer>
                  <div style={{ display: "flex" }}>
                    <Input
                      autoComplete="off"
                      placeholder={"enter amount"}
                      type="number"
                      min="1.00"
                      id="minted"
                      value={mGARD}
                      size="small"
                      onChange={handleBorrowChange}
                    />
                    <MaxButton onClick={handleMaxBorrow}>
                      <ToolTip
                        toolTip={"+MAX"}
                        toolTipText={"Click to borrow maximum amount"}
                      />
                    </MaxButton>
                  </div>
                  <Valuation>$Value: ${mGARD === "" ? 0 : mGARD}</Valuation>
                  <BorrowInputDetails>
                    {borrowDetails.length && borrowDetails.length > 0
                      ? borrowDetails.map((d) => {
                          return (
                            <Item key={d.title}>
                              <Effect
                                title={d.title}
                                val={d.val}
                                hasToolTip={d.hasToolTip}
                                rewards={d.rewards}
                              ></Effect>
                            </Item>
                          );
                        })
                      : null}
                  </BorrowInputDetails>
                </InputContainer>
              </Background>
            </SubContainer>
          </Container>
          <PrimaryButton
            blue={true}
            positioned={true}
            text="Create CDP"
            disabled={cAlgos == "" || mGARD == ""}
            onClick={async () => {
              setLoading(true);
              try {
                let res;
                if (collateralType == 'ALGO') {
                  res = await openCDP(
                    getCollateral(),
                    getMinted(),
                    0,
                    commitChecked,
                    toWallet,
                  )
                } else {
                  res = await openCDP(
                    getCollateral(),
                    getMinted(),
                    ids.asa.galgo,
                  )
                }
                if (res.alert) {
                  setCreatePositionShown(false);
                  dispatch(setAlert(res.text));
                }
              } catch (e) {
                handleTxError(e, "Error minting CDP");
              }
              setLoading(false);
            }}
          />
          <Details className={"borrow"} details={details} />
        </div>
      ) : (
        <></>
      )}
      {cdps == dummyCDPs ? (
        <></>
      ) : (
        <div>
          <PrimaryButton
            text={createPositionShown ? "Exit" : "Create New Position"}
            blue={true}
            positioned={createPositionShown}
            onClick={() => {
              setCreatePositionShown(!createPositionShown);
            }}
          />
          <Positions maxSupply={maxCollateral} maxGARD={maxGARD} />
        </div>
      )}
    </div>
  );
}

const Link = styled.text`
  text-decoration: none;
  font-weight: 400;
  font-size: 10pt;
  color: #172756;
  text-align: left;
`;

const V1Link = styled.text`
  text-decoration: none;
  font-weight: 500;
  color: #172756;
  margin-right: 12px;
  &:hover {
    color: #03a0ff;
    cursor: pointer;
  }
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
  margin-bottom: 20px;
`;

const BorrowRewardNotice = styled(RewardNotice)`
  font-size: 10pt;
  text {
    font-size: 8pt;
  }
`;

const AlgoImg = styled.img`
  /* filter: invert(); */
  height: 75px;
  width: 75px;
  right: --4px;
  position: relative;
  ${(props) => !props.isGAlgo &&
    css`
      height: 50px;
      width: 50px;
      margin-left: 8px;
      margin-top: 12.5px;
      margin-bottom: 12.5px;
    `
  }
`;

const gAlgoImg = styled.img`
  height: 30px;
  width: 30px;
  position: relative;
`

const GardImg = styled.img`
  height: 50px;
  margin: 2px 18px 2px 14px;
  position: relative;
  top: -2px;
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 49%);
  column-gap: 2%;
  @media (${device.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const SubContainer = styled.div`
  position: relative;
`;
const Background = styled.div`
  /* margin-top: 0px; */
  background: #1b2d65;
  border-radius: 10px;
`;
const Title = styled.div`
  display: flex;
  justify-content: center;
  font-size: 14pt;
  align-items: center;
  text-align: center;
  padding: 20px 0px 20px;
`;

const BorrowTitle = styled.div`
  display: flex;
  justify-content: center;
  font-size: 14pt;
  align-items: center;
  text-align: center;
  padding: 20px 0px 20px;
  margin-bottom: 9px;
  padding-top: 31px;
`;

const InputContainer = styled.div`
  background: rgba(13, 18, 39, 0.75);
  border-radius: 10px;
  border: 1px solid white;
`;

const SupplyInputDetails = styled.div`
  // display: grid;
  grid-template-columns: repeat(1, 40%);
  row-gap: 30px;
  justify-content: center;
  padding: 30px 0px 30px;
  border-radius: 10px;
`;

const BorrowInputDetails = styled.div`
display: grid;
  grid-template-columns: repeat(1, 40%);
  row-gap: 30px;
  justify-content: center;
  padding: 30px 0px 30px;
  border-radius: 10px;
`

const Item = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 14px;
`;
const MaxButton = styled.button`
  color: #01d1ff;
  background: none;
  border: none;
  margin-top: 50px;
  cursor: pointer;
  font-size: 12px;
`;
const Valuation = styled.div`
  margin-left: 25px;
  margin-top: 3px;
  font-size: 12px;
  color: #999696;
`;
const Input = styled.input`
  padding-top: 35px;
  border-radius: 0;
  height: 30px;
  width: 80%;
  color: white;
  text-decoration: none;
  border: none;
  border-bottom: 2px solid #01d1ff;
  opacity: 100%;
  font-size: 20px;
  background: none;
  margin-left: 25px;
  &:focus {
    outline-width: 0;
  }
`;

const CommitBox = styled.input`
  display: grid;
  place-content: center;
  &::before {
  content: "";
  width: 0.65em;
  height: 0.65em;
  transform: scale(0);
  transition: 120ms transform ease-in-out;
  box-shadow: inset 1em 1em var(--form-control-color);
}
  border-radius: 6px;
  &:checked {
    color: "#019fff";
  }
`;

const ExchangeSelect = styled(Select)`
  font-size: 14pt;
  margin: 0px 0px 0px 12px;
  border: 1px solid #01d1ff;
  color: white;
  &:hover {
    color: black;
    border: 1px solid #1b2d65;
    background-color: #01d1ff;
  }
`;

//modal stuff
const InputTitle = styled.text`
  font-weight: bold;
  font-size: 16px;
  margin: 0px 4px 0px 2px;
`;
const InputSubtitle = styled.text`
  font-weight: normal;
  font-size: 12px;
  margin: 3px 3px 3px 4px;
`;

function dummyTrans() {
  if (getMinted() == null || getCollateral() == null) {
    return [
      {
        title: "Collateral Staked",
        value: "x Algos",
      },
      {
        title: "GARD to Be Minted",
        value: "Minimum 1 GARD",
      },
      {
        title: "Collateralization Ratio",
        value: "...",
      },
      {
        title: "Liquidation Price (in ALGO/USD)",
        value: "...",
      },
      {
        title: "Transaction Fee",
        value: "...",
      },
    ];
  } else {
    return [
      {
        title: "Collateral Staked",
        value: getCollateral() + " Algos",
      },
      {
        title: "GARD to Be Minted",
        value: getMinted() + " GARD",
      },
      {
        title: "Collateralization Ratio",
        value: displayRatio(),
      },
      {
        title: "Liquidation Price",
        value: displayLiquidationPrice(),
      },
      {
        title: "Transaction Fee",
        value: "TODO: FIXME",
      },
    ];
  }
}

