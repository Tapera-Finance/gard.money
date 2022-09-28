import React, { useEffect, useState} from "react";
import styled from "styled-components";
import Details from "../components/Details";
import Effect from "../components/Effect";
import LoadingOverlay from "../components/LoadingOverlay";
import Positions from "../components/Positions";
import PrimaryButton from "../components/PrimaryButton";
import RewardNotice from "../components/RewardNotice";
import ToolTip from "../components/ToolTip";
import {
  getWallet,
  getWalletInfo,
  handleTxError,
  updateWalletInfo,
} from "../wallets/wallets";
import { calcRatio, getCDPs, getPrice, openCDP } from "../transactions/cdp.js";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAlert } from "../redux/slices/alertSlice";
import { commitmentPeriodEnd } from "../globals";
import algoLogo from "../assets/icons/algorand_logo_mark_black_small.png";
import gardLogo from "../assets/icons/gardlogo_icon_small.png";


function displayRatio() {
  return calcRatio(algosToMAlgos(getCollateral()), getMinted(), true);
}

function mAlgosToAlgos(num) {
  return num / 1000000;
}
function algosToMAlgos(num) {
  return num * 1000000;
}

function displayLiquidationPrice() {
  return "$" + ((1.15 * getMinted()) / getCollateral()).toFixed(4);
}

function getMinted() {
  if (
    document.getElementById("minted") == null ||
    isNaN(parseFloat(document.getElementById("minted").value))
  ) {
    return null;
  }
  return parseFloat(document.getElementById("minted").value);
}

function getCollateral() {
  if (
    document.getElementById("collateral") == null ||
    isNaN(parseFloat(document.getElementById("collateral").value))
  ) {
    return null;
  }
  return parseFloat(document.getElementById("collateral").value);
}

export default function BorrowContent(){
  const [modalVisible, setModalVisible] = useState(false);
  const [canAnimate, setCanAnimate] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [balance, setBalance] = useState("...");
  const [price, setPrice] = useState(0);
  const [supplyPrice, setSupplyPrice] = useState(0);
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
  const [toWallet, setToWallet] = useState(false);

  const [createPositionShown, setCreatePositionShown] = useState(false)

  const handleCheckboxChange = () => {
    setCommitChecked(!commitChecked);
  };

  const handleCheckboxChange1 = () => {
    setToWallet(!toWallet);
  };

  useEffect(() => {
    if (cdps == dummyCDPs){
      setCreatePositionShown(true)
    }
  }, [])

  useEffect(async () => {
    setPrice(await getPrice());
    await updateWalletInfo();
    getWallet();
    setBalance((getWalletInfo()["amount"] / 1000000).toFixed(3));
    setMaxCollateral(
      mAlgosToAlgos(
        getWalletInfo()["amount"] -
          307000 -
          100000 * (getWalletInfo()["assets"].length + 4),
      ).toFixed(3),
    );
  }, []);

  useEffect(() => {
    setSupplyPrice(price)
  }, [price])


  const handleSupplyChange = (event) => {
    setCollateral(event.target.value === "" ? "" : Number(event.target.value));
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
      setCollateral(maxCollateral)
      let max =
        Math.trunc(
          (100 *
            ((algosToMAlgos(price) * algosToMAlgos(maxCollateral)) /
              1000000)) /
            1.4 /
            1000000,
        ) / 100;
      setMaxGARD(max);
      if (mGARD > max) {
        setGARD(max < 1 ? 1 : max);
      }
      console.log("collateral" ,cAlgos)
    }



  const handleBorrowChange = (event) => {
    setGARD(
      event.target.value === ""
        ? ""
        : Number(event.target.value) < 1
        ? 1
        : Number(event.target.value),
    );
    let max = mAlgosToAlgos(
      getWalletInfo()["amount"] -
        307000 -
        100000 * (getWalletInfo()["assets"].length + 4),
    ).toFixed(3);
    setMaxCollateral(max);
    if (isNaN(cAlgos)) {
      console.log("heyy");
      return;
    }
    if (cAlgos > max) {
      setCollateral(max);
    }
  };

  const handleMaxBorrow = () => {
    setGARD(maxGARD)
    let max = mAlgosToAlgos(
      getWalletInfo()["amount"] -
        307000 -
        100000 * (getWalletInfo()["assets"].length + 4),
    ).toFixed(3);
    setMaxCollateral(max);
    if (isNaN(cAlgos)) {
      console.log("heyy");
      return;
    }
    if (cAlgos > max) {
      setCollateral(max);
    }
    console.log("gard" ,mGARD)
  }

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
      val: `${(100 / 140).toFixed(2)}`,
      hasToolTip: true,
    },
    {
      title: "Borrow Utilization",
      val: `${
        cAlgos === "" || maxGARD === "" ? "..." : (100*mGARD / maxGARD).toFixed(2)
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
    // {
    //   title: "GARD Borrow APR",
    //   val: 0,
    //   hasToolTip: true,
    // },
    {
      title: "Bonus Supply Rewards",
      val: 0,
      hasToolTip: true,
    },
    {
      title: "ALGO Governance APR",
      val: `${34.3}%`,
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
    val: `${maxCollateral} ALGOs`,
    hasToolTip: true,
  },
  {
      title: "Supply Rewards",
      val: `+${0.00}% Algo Rewards`,
      hasToolTip: true,
      rewards: true,
  },];
var borrowDetails = [
  {
    title: "Borrow Limit",
    val: `${maxGARD} GARD`,
    hasToolTip: true,
  },
  {
      title: "Borrow Rewards",
      val: `+${0.02}% Algo Rewards`,
      hasToolTip: true,
      rewards: true,
  },];
    return <div>
        {loading ? <LoadingOverlay text={loadingText}
        close={()=>{
          setLoading(false);
        }} /> : <></>}
        <RewardNotice
        program={"Governance Rewards"}
        timespan={"Now - October 22, 2022"}
        estimatedRewards={"12% - 33% APR Rewards"}
        action={"Borrow ALGO to Claim Rewards"}
        />
        {createPositionShown ? <div><Container>
          <SubContainer>
              <Background>
                  <Title>Supply
                    <AlgoImg src={algoLogo} />
                    ALGO</Title>
                  <InputContainer>
                      <div style={{display: "flex"}}>
                          <Input
                          autoComplete="off"
                          display="none"
                          placeholder={"enter amount"}
                          type='number'
                          min="0.00"
                          id="collateral"
                          value={cAlgos}
                          onChange={handleSupplyChange}
                          />
                          <MaxButton
                          onClick={handleMaxCollateral}>
                              <ToolTip
                              toolTip={"+MAX"}
                              toolTipText={"Click to lend maximum amount"}
                              />
                          </MaxButton>
                      </div>
                      <Valuation>$Value: ${cAlgos === "..." ? 0.00 : (cAlgos * supplyPrice).toFixed(2)}</Valuation>
                      <InputDetails>
                          {supplyDetails.length && supplyDetails.length > 0 ?
                          supplyDetails.map((d) => {
                              return (
                               <Item key={d.title}>
                                      <Effect title={d.title} val={d.val} hasToolTip={d.hasToolTip} rewards={d.rewards}></Effect>
                                  </Item>
                              )
                          })
                          : null
          }
                      </InputDetails>
                  </InputContainer>
              </Background>
              {/* <PrimaryButton positioned={true} blue={true} text="Supply" onClick={()=>{cAlgos !== "" ? setGARD(1): null}}/> */}
          </SubContainer>

          <SubContainer>
              <Background>
                  <Title>Borrow
                    <GardImg src={gardLogo} />
                    GARD</Title>
                  <InputContainer>
                      <div style={{display: "flex"}}>
                          <Input
                          autoComplete="off"
                          placeholder={"enter amount"}
                          type='number'
                          min="1.00"
                          step="1"
                          id="minted"
                          value={mGARD}
                          size="small"
                          onChange={handleBorrowChange}
                          />
                          <MaxButton
                          onClick={handleMaxBorrow}>
                              <ToolTip
                              toolTip={"+MAX"}
                              toolTipText={"Click to borrow maximum amount"}
                              />
                          </MaxButton>
                      </div>
                      <Valuation>$Value: ${mGARD === "" ? 0 : mGARD}</Valuation>
                      <InputDetails>
                          {borrowDetails.length && borrowDetails.length > 0 ?
                          borrowDetails.map((d) => {
                              return (
                                  <Item key={d.title}>
                                      <Effect title={d.title} val={d.val} hasToolTip={d.hasToolTip} rewards={d.rewards}></Effect>
                                  </Item>
                              )
                          })
                          : null
          }
                      </InputDetails>
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
                setLoading(true)
                try {
                  const res = await openCDP(
                    getCollateral(),
                    getMinted(),
                    commitChecked,
                    toWallet,
                  );
                  if (res.alert) {
                    setCreatePositionShown(false)
                    dispatch(setAlert(res.text));
                  }
                } catch (e) {
                  handleTxError(e, "Error minting CDP");
                }
                setLoading(false)
              }}
              />
      <Details className={"borrow"} details={details}/>
      </div> :
      <></> }
      {cdps == dummyCDPs ? <></> :
      <div>
        <PrimaryButton
        text={createPositionShown ? "Exit" : "Create New Position"}
        blue={!createPositionShown}
        positioned={createPositionShown}
        onClick={() => {
          setCreatePositionShown(!createPositionShown)
        }}
        />
        <Positions maxGARD={maxGARD}/>
      </div>}
    </div>
}

const AlgoImg = styled.img`
  filter: invert();
  height: 45px;
  position: relative;
  top: -11px;
`

const GardImg = styled.img`
  height: 40px;
  margin: 2px 14px 2px 14px;
  position: relative;
  top: -8px;
`

const Container = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 49%);
    column-gap: 2%;
`

const SubContainer = styled.div`
    position: relative;

`
const Background = styled.div`
    /* margin-top: 0px; */
    background: #1b2d65;
    border-radius: 10px;

`
const Title = styled.div`
    display: flex;
    justify-content: center;
    text-align: center;
    padding: 20px 0px 20px;
`

const InputContainer = styled.div`
    background: rgba(13, 18, 39, .75);
    border-radius: 10px;
    border: 1px solid white;
`

const InputDetails = styled.div`
display: grid;
grid-template-columns:repeat(2, 40%);
row-gap: 30px;
justify-content: center;
padding: 30px 0px 30px;
border-radius: 10px;
`

const Item = styled.div`
    display: flex;
    flex-direction: column;
    font-size: 14px;
`
const MaxButton = styled.button`
    color: #01d1ff;
    background: none;
    border: none;
    margin-top: 50px;
    cursor: pointer;
    font-size: 12px;
`
const Valuation = styled.div`
    margin-left: 25px;
    margin-top: 3px;
    font-size: 12px;
    color: #999696;
`
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
`

//modal stuff
const InputTitle = styled.text`
  font-weight: bold;
  font-size: 16px;
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

export function CDPsToList() {
  const CDPs = getCDPs();
  let res = [];
  if (getWalletInfo() && CDPs[getWalletInfo().address] != null) {
      const accountCDPs = CDPs[getWalletInfo().address];
      for (const [cdpID, value] of Object.entries(accountCDPs)) {
      if (value["state"] == "open") {
          res.push({
          id: cdpID,
          liquidationPrice: (
              (1.15 * value["debt"]) /
              value["collateral"]
          ).toFixed(4),
          collateral: value["collateral"],
          debt: value["debt"],
          committed: value.hasOwnProperty("committed") ? value["committed"] : 0,
          });
      }
      }
  }
  if (res.length == 0) {
      res = dummyCDPs;
  }
  return res;
}
const dummyCDPs = [
  {
    id: "N/A",
    liquidationPrice: 0,
    collateral: 0,
    debt: 0,
  },
];
