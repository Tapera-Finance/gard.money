import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setAlert } from "../../redux/slices/alertSlice";
import * as tips from "../../assets/tooltiptext";
import styled from "styled-components";
import ExchangeField from "../ExchangeField";
import ToolTip from "../ToolTip";
import Effect from "../Effect";
import PrimaryButton from "../PrimaryButton";
import LoadingOverlay from "../LoadingOverlay";
import swapIcon from "../../assets/icons/swap_icon_v2.png";
import { getWalletInfo, handleTxError } from "../../wallets/wallets";
import { ids, usdcID } from "../../transactions/ids";
import {
  mAlgosToAlgos,
  previewSwap,
  empty,
  getBalances,
  convertToDollars,
  formatPrice,
  exchangeRatioAssetXtoAssetY,
  formatAmt,
} from "./swapHelpers";
import { gardpool, swap } from "../../transactions/swap";
import { titleToToolTip } from "../../utils";
import { VERSION } from "../../globals";

const initEffectState = {
  primaryAssetPriceAfterSwap: 0.0,
  secondaryAssetPriceAfterSwap: 0.0,
  minimumAmountReceived: 0.0,
  liquidityFee: 0.0,
  exchangeRate: 0.0,
};

const swapEnabled = VERSION === "MAINNET" ? true : false;
// const swapEnabled = true;
console.log("enabled?", swapEnabled)


export default function SwapDetails() {
  const walletAddress = useSelector(state => state.wallet.address);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(null);

  // input hooks
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(1);

  // account
  const [balanceX, setBalanceX] = useState(getBalances()["algo"]);
  const [balanceY, setBalanceY] = useState(getBalances()["gard"]);

  // assets
  const [algoToGardRatio, setAlgoToGardRatio] = useState("Loading...");
  const [assetAtype, setAssetAtype] = useState("ALGO");
  const [assetBtype, setAssetBtype] = useState("GARD");
  const [assetAtotal, setAssetAtotal] = useState(0);
  const [assetBtotal, setAssetBtotal] = useState(0);
  const [assetAid, setAssetAid] = useState(0);
  const [assetBid, setAssetBid] = useState(ids.asa.gard);
  const [pool, setPool] = useState(gardpool);
  const [swapEffect, setSwapEffect] = useState(initEffectState);

  // effects
  const [rightDollars, setRightDollars] = useState(0);
  const [leftDollars, setLeftDollars] = useState(0);
  const [priceImpactA, setPriceImpactA] = useState(0);
  const [priceImpactB, setPriceImpactB] = useState(0);
  const [liquidityFee, setLiquidityFee] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(pool.state.totalPrimary / pool.state.totalSecondary);
  const [slippageTolerance, setSlippageTolerance] = useState(0.005);
  const [feeRate, setFeeRate] = useState(0.01);
  const [minimumReceived, setMinimumReceived] = useState(0);

  // form control
  const [leftSelectVal, setLeftSelectVal] = useState("ALGO");
  const [rightSelectVal, setRightSelectVal] = useState("GARD");
  const [leftInputAmt, setLeftInputAmt] = useState();
  const [rightInputAmt, setRightInputAmt] = useState();
  const [leftChange, setLeftChange] = useState(false);
  const [rightChange, setRightChange] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [getBal, setGetBal] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const assets = ["ALGO", "GARD"];

  const sessionStorageSetHandler = (e) => {
    setLoadingText(JSON.parse(e.value));
  };
  document.addEventListener("itemInserted", sessionStorageSetHandler, false);

  // console.log("format check", formatPrice(514873518546));

  const assetA = {
    type: assetAtype,
    amount: assetAtotal,
    id: assetAid,
  };
  const assetB = {
    type: assetBtype,
    amount: assetBtotal,
    id: assetBid,
  };

  const effects = [
    // {
    //   title: "Asset A Total",
    //   val: `${assetA.type}: ${formatPrice((pool.state.totalPrimary/1000000).toFixed(0))}`,
    //   hasToolTip: false,
    // },
    // {
    //   title: "Asset B Total",
    //   val: `${assetB.type}: ${formatPrice((pool.state.totalSecondary/1000000).toFixed(0))}`,
    // },
    {
      title: "Price Impact",
      val: `${(priceImpactA * 100).toFixed(4)}%`,
      hasToolTip: true,
    },
    {
      title: "Exchange Rate",
      val: exchangeRate,
      hasToolTip: false,
    },
    {
      title: "Liquidity Fee",
      val: liquidityFee,
      hasToolTip: true,
    },
    {
      title: "Slippage Tolerance",
      val: slippageTolerance,
      hasToolTip: true,
    },
    {
      title: "Fee Rate",
      val: feeRate,
      hasToolTip: false,
    },
    {
      title: "Minimum Recieved",
      val: minimumReceived,
      hasToolTip: false,
    },
  ];

  function localPreviewSwap() {
    let effect = initEffectState;
    let swap;
    let a =
      rightSelectVal === assetA.type ? pool.secondaryAsset : pool.primaryAsset;
    let val =
      rightSelectVal === assetA.type
        ? parseInt(assetB.amount)
        : parseInt(assetA.amount);
    let otherVal =
      leftSelectVal === assetA.type
        ? parseInt(assetB.amount)
        : parseInt(assetA.amount);
    if (typeof val === "number" && val > 0) {
      swap = pool.prepareSwap({
        asset: a,
        amount: val,
        slippagePct: 1,
      });
    } else if (typeof otherVal === "number" && otherVal > 0) {
      swap = pool.prepareSwap({
        asset: a,
        amount: otherVal,
        slippagePct: 1,
      });
    }
    effect = swap ? swap.effect : effect;
    setSwapEffect(effect);
  }

  async function handleSwap() {
    if (formatAmt(leftInputAmt) > formatAmt(balanceX)) {
      dispatch(
        setAlert(`Cannot send more ${leftSelectVal} than available balance`),
      );
      return;
    }
    setLoading(true);
    try {
      let res;
      let swapTo;
      if (leftSelectVal === assetA.type && rightSelectVal === assetB.type) {
        swapTo = assetB;
      } else if (
        leftSelectVal === assetB.type &&
        rightSelectVal === assetA.type
      ) {
        swapTo = assetA;
      }
      res = await swap(
        assetA,
        assetB,
        leftInputAmt,
        rightInputAmt,
        swapTo,
        slippageTolerance,
      );
      if (res.alert) {
        dispatch(setAlert(res.text));
        setLoading(false);
      }
    } catch (e) {
      handleTxError(e, "Error exchanging assets");
    }
    setLoading(false);
    setGetBal(true);
  }

  function handleSwapButton() {
    setLeftSelectVal(rightSelectVal);
    setLeftInputAmt(rightInputAmt);
    setRightSelectVal(leftSelectVal);
    setRightInputAmt(leftInputAmt);
    setBalanceY(balanceX);
    setBalanceX(balanceY);
    localPreviewSwap();
  }

  function handleLeftSelect(e) {
    if (e.target.value === "") {
      return;
    }
    setLeftChange(true);
    setLeftSelectVal(e.target.value);
    setLeftInputAmt(rightInputAmt);
    setRightInputAmt(leftInputAmt);
    setRightSelectVal(leftSelectVal);
    setBalanceX(balanceY);
    setBalanceY(balanceX);
    localPreviewSwap();
  }

  function handleRightSelect(e) {
    if (e.target.value === "") {
      return;
    }
    setRightChange(true);
    setRightSelectVal(e.target.value);
    setLeftInputAmt(leftInputAmt);
    setRightInputAmt(rightInputAmt);
    setLeftSelectVal(rightSelectVal);
    setBalanceX(balanceY);
    setBalanceY(balanceX);
    localPreviewSwap();
  }

  function handleLeftInput(e) {
    e.preventDefault();
    setLeftInputAmt(e.target.value);
    setLeftChange(true);
    if (leftSelectVal === assetAtype) {
      setAssetAtotal(e.target.value);
    } else if (leftSelectVal === assetBtype) {
      setAssetBtotal(e.target.value);
    }
    if (e.target.value === 0 || e.target.value === "") {
      setRightInputAmt("");
      setLeftInputAmt("");
      setDisabled(true);
    }
  }

  function handleRightInput(e) {
    e.preventDefault();
    setRightInputAmt(e.target.value);
    setRightChange(true);
    if (rightSelectVal === assetAtype) {
      setAssetAtotal(e.target.value);
    } else if (rightSelectVal === assetBtype) {
      setAssetBtotal(e.target.value);
    }

    if (e.target.value === 0 || e.target.value === "") {
      setRightInputAmt("");
      setLeftInputAmt("");
      setDisabled(true);
    }
  }

  // set right if left changes
  useEffect(() => {
    setLeftChange(false);
    assetA.amount = assetAtotal;
    assetB.amount = assetBtotal;
    let newRight = previewSwap(assetA, assetB, {
      swapTo: rightSelectVal === assetA.type ? assetA : assetB,
    });
    if (newRight.calcResult) {
      setRightInputAmt(parseFloat(newRight.calcResult));
      localPreviewSwap();
      setLoading(false);
    }
  }, [leftChange]);

  // set left if right changes
  useEffect(() => {
    setRightChange(false);
    assetA.amount = assetAtotal;
    assetB.amount = assetBtotal;
    let newLeft = previewSwap(assetA, assetB, {
      swapTo: rightSelectVal === assetA.type ? assetB : assetA,
    });
    if (newLeft.calcResult) {
      setLeftInputAmt(parseFloat(newLeft.calcResult));
      localPreviewSwap();
      setLoading(false);
    }
  }, [rightChange]);

  // convert to dollars when inputs change
  useEffect(() => {
    let dollars = convertToDollars(leftInputAmt, leftSelectVal.toLowerCase());
    setLeftDollars(dollars);
    if (
      !empty(leftInputAmt) &&
      !empty(rightInputAmt) &&
      !(
        (typeof leftInputAmt === "string"
          ? parseFloat(leftInputAmt).toFixed(2)
          : leftInputAmt) > balanceX
      )
    ) {
      setDisabled(false);
    }
  }, [leftInputAmt]);

  useEffect(() => {
    let dollars = convertToDollars(rightInputAmt, rightSelectVal.toLowerCase());
    setRightDollars(dollars);
    if (!empty(leftInputAmt) && !empty(rightInputAmt)) {
      setDisabled(false);
    }
  }, [rightInputAmt]);

  // set details when swap preview is registered
  useEffect(() => {
    let calculate = swapEffect && swapEffect.amountDeposited > 0 ? true : false;
    setPriceImpactA(
      calculate
        ? (swapEffect.primaryAssetPriceImpactPct * 1e6).toFixed(3)
        : priceImpactA,
    );
    setPriceImpactB(
      calculate
        ? (swapEffect.secondaryAssetPriceImpactPct * 1e6).toFixed(3)
        : priceImpactB,
    );
    setMinimumReceived(calculate ? swapEffect.minimumAmountReceived : 0);
    setLiquidityFee(calculate ? mAlgosToAlgos(swapEffect.fee) : 0);
    setExchangeRate(
      calculate
        ? exchangeRatioAssetXtoAssetY(
            swapEffect.primaryAssetPriceAfterSwap,
            swapEffect.secondaryAssetPriceAfterSwap,
          )
        : 0,
    );
  }, [swapEffect]);

  useEffect(() => {
    if (getWalletInfo()) {
      let balX = getBalances()[leftSelectVal.toLowerCase()];
      let balY = getBalances()[rightSelectVal.toLowerCase()];
      setBalanceX(balX);
      setBalanceY(balY);
    }
  }, [getBal]);

  useEffect(() => {
    let defaultSlip = document.querySelector("#default-slippage");
    if (!empty(defaultSlip)) {
      if (slippageTolerance !== 0.01 && slippageTolerance !== 0.1) {
        defaultSlip ? defaultSlip.focus() : null;
      }
    }
  }, [slippageTolerance]);

  useEffect(() => {
    if (!walletAddress) navigate("/");
  }, [walletAddress]);

  return (
    <div>
        <div>
          {loading ? <LoadingOverlay text={loadingText} /> : <></>}
            {!swapEnabled ? (<div style={{display: "flex", justifyContent: "center", textAlign: "center"}}><TestAlert>Swap only available on Main Net</TestAlert></div>)  : <></>}
          <ExchangeBar>
            <ExchangeFields
              ids={["left-select", "left-input"]}
              type={left}
              assets={assets}
              selectVal={leftSelectVal}
              inputVal={leftInputAmt}
              effect={leftDollars}
              onOptionSelect={handleLeftSelect}
              onInputChange={handleLeftInput}
              balances={{
                assetA: {
                  type: assetAtype,
                  amount: balanceX,
                },
                assetB: {
                  type: assetBtype,
                  amount: balanceY,
                },
              }}
            ></ExchangeFields>
            <div
              style={{
                display: "flex",
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SwapButton onClick={handleSwapButton} src={swapIcon} />
            </div>
            <ExchangeFields
              ids={["right-select", "right-input"]}
              type={right}
              assets={assets}
              selectVal={rightSelectVal}
              inputVal={rightInputAmt}
              effect={rightDollars}
              onOptionSelect={handleRightSelect}
              onInputChange={handleRightInput}
              balances={{
                assetA: {
                  type: assetAtype,
                  amount: balanceX,
                },
                assetB: {
                  type: assetBtype,
                  amount: balanceY,
                },
              }}
            ></ExchangeFields>
          </ExchangeBar>
          <BtnBox>
            <ExchangeButton
              text="Execute Swap"
              onClick={handleSwap}
              blue={true}
              disabled={!swapEnabled ? true : disabled ? true : false}
            ></ExchangeButton>
          </BtnBox>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <DetailsContainer>
              <Details>
                {effects.length > 0
                  ? effects.map((item) => {
                      if (item.title === "Slippage Tolerance") {
                        return (
                          <SlippageEffect key={Math.random()}>
                            <NewToolTip
                              toolTip={item.title}
                              toolTipText={tips[item.title]}
                            ></NewToolTip>
                            <hr style={{ border: "dashed 1px" }} />
                            <EffectContainer>
                              {/* <EffText></EffText> */}
                              {/* <SlippageBtn
                                id="slippage-001"
                                onClick={() => setSlippageTolerance(0.01)}
                              >
                                0.01
                              </SlippageBtn>
                              <SlippageBtn
                                id="default-slippage"
                                onClick={() => setSlippageTolerance(0.05)}
                              >
                                0.05
                              </SlippageBtn>
                              <SlippageBtn
                                id="slippage-010"
                                onClick={() => setSlippageTolerance(0.1)}
                              >
                                0.1
                              </SlippageBtn> */}
                              <Text>{slippageTolerance}</Text>
                            </EffectContainer>
                          </SlippageEffect>
                        );
                      }
                      return (
                        <Effect
                          title={item.title}
                          key={Math.random()}
                          val={item.val}
                          hasToolTip={item.hasToolTip}
                        />
                      );
                    })
                  : null}
              </Details>
            </DetailsContainer>
          </div>
        </div>

      {/* : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              background: "#101836",
              height: 100,
              width: 200,
              marginTop: 50,
              borderRadius: 10,
            }}
          >
            <Text>Swapping not currently available on TestNet</Text>
          </div>
        </div>
      )} */}
    </div>
  );
}

const SlippageEffect = styled.div`
align-self: center;
text-align: center;
`;

const TestAlert = styled.text`
  margin: 4px;
  font-weight: bolder;
  text-align: center;
`

const Text = styled.text`
  margin: 4px;
  font-weight: bolder;
`;

const EffectContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: row;
  align-items: center;
`;

const EffText = styled.text`
  margin: auto;
  color: #ffffff;
`;
const EffResult = styled.text`
  color: #999696;
`;
const SlippageBtn = styled.button`
  appearance: none;
  border: 1px solid #01d1ff;
  background-color: #01d1ff;
  color: black;
  display: flex;
  font-size: smaller;
  max-width: max-content;
  justify-content: center;
  padding: 2px 6px;
  cursor: pointer;
  border-radius: 8px;
  &:focus {
    background-color: #ffffff;
    color: black;
  }
  &:hover {
    background-color: #ffffff;
    color: black;
  }
`;

const NewToolTip = styled(ToolTip)`
  flex-basis: 200px;
  font-weight: bold;
  margin: auto;
  color: #ffffff;
`;

const BtnBox = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const ExchangeButton = styled(PrimaryButton)`
  margin-top: 15px;
`;

const DetailsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 2;
  justify-content: center;
  width: 80%;
  padding: 15px 0px 0px 5px;
  background: #0f1733;
  border-radius: 10px;
  border: 1px solid #80edff;
  margin-top: 10px;
  margin-bottom: 20vh;
`;

const Details = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 50%);
  padding-top: 30;
  padding-bottom: 30;
  border-radius: 10px;
  width: 50%;
  margin: auto;
  justify-content: space-around;
  align-items: flex-start;
`;

const ExchangeBar = styled.div`
  display: flex;
  flex-direction: row;
  flex: 3;
  justify-content: space-between;
  margin: auto;
`;

const ExchangeFields = styled(ExchangeField)`
  width: 40%;
  background: #0d1227;
`;

const SwapButton = styled.img`
  max-width: 75px;
  max-height: 75px;
  cursor: pointer;
  &:hover {
    transform: rotate(180deg);
  }
`;
