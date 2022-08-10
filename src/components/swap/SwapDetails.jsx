import React, { useState, useEffect, useReducer } from "react";
import styled, { css } from "styled-components";
import ExchangeField from "../ExchangeField";
import InputField from "../InputField";
import { mAlgosToAlgos, algosTomAlgos, previewSwap } from "./swapHelpers";
import {
  getGARDInWallet,
  getWalletInfo,
  handleTxError,
} from "../../wallets/wallets";
import { formatToDollars } from "../../utils";
import swapIcon from "../../assets/icons/swap_icon_v2.png";
import {
  gardpool,
  algoGardRatio,
  swap,
  exchangeRatioAssetXtoAssetY,
  swapAlgoToGard,
  swapGardToAlgo,
} from "../../transactions/swap";
import Effect from "../Effect";
import TransactionSummary from "../TransactionSummary";
import PrimaryButton from "../PrimaryButton";
import Modal from "../Modal";
import LoadingOverlay from "../LoadingOverlay";
import { gardID, pactGARDID } from "../../transactions/ids";
import { getPrice } from "../../transactions/cdp";
import pactsdk from "@pactfi/pactsdk";
import { useDispatch } from "react-redux";
import { setAlert } from "../../redux/slices/alertSlice";
/**
 * local utils
 */
async function price() {
  let price = await getPrice();
  return price;
}

const algoPrice = await getPrice().then((val) => val.toFixed(5));
const prices = {
  algo: gardpool.calculator.primaryAssetPrice,
  gard: gardpool.calculator.secondaryAssetPrice,
};
const defaultPool = "ALGO/GARD";
const pools = [defaultPool];
const slippageTolerance = 0.005;
const initEffectState = {
  primaryAssetPriceAfterSwap: 0.0,
  secondaryAssetPriceAfterSwap: 0.0,
  minimumAmountReceived: 0.0,
  liquidityFee: 0.0,
  exchangeRate: 0.0,
};

export default function SwapDetails() {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalCanAnimate, setModalCanAnimate] = useState(false);

  const [waitingText, setWaitingText] = useState("fetching...");
  const [loadingText, setLoadingText] = useState(null);

  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(1);
  const [algoToGardRatio, setAlgoToGardRatio] = useState("Loading...");
  const [balanceX, setBalanceX] = useState("...");
  const [balanceY, setBalanceY] = useState("...");

  const [assetAtype, setAssetAtype] = useState("ALGO");
  const [assetBtype, setAssetBtype] = useState("GARD");

  const [assetAtotal, setAssetAtotal] = useState(0);
  const [assetBtotal, setAssetBtotal] = useState(0);

  const [assetAid, setAssetAid] = useState(0);
  const [assetBid, setAssetBid] = useState(gardID);
  const [pool, setPool] = useState(gardpool);
  const [swapEffect, setSwapEffect] = useState(initEffectState);

  const [leftSelectVal, setLeftSelectVal] = useState("ALGO");
  const [rightSelectVal, setRightSelectVal] = useState("GARD");
  const [leftInputAmt, setLeftInputAmt] = useState(0);
  const [rightInputAmt, setRightInputAmt] = useState(0);

  const [rightDollars, setRightDollars] = useState(0);
  const [leftDollars, setLeftDollars] = useState(0);
  const [priceImpactA, setPriceImpactA] = useState(0);
  const [priceImpactB, setPriceImpactB] = useState(0);
  const [liquidityFee, setLiquidityFee] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(0);
  const [slippageTolerance, setSlippageTolerance] = useState(0.005);
  const [feeRate, setFeeRate] = useState(0.01);
  const [minimumReceived, setMinimumReceived] = useState(0);

  const [rightChange, setRightChange] = useState(false);
  const [leftChange, setLeftChange] = useState(false);
  const dispatch = useDispatch();

  const assets = ["ALGO", "GARD"];

  const sessionStorageSetHandler = (e) => {
    setLoadingText(JSON.parse(e.value));
  };
  document.addEventListener("itemInserted", sessionStorageSetHandler, false);

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
    {
      title: "Price Impact A",
      val: `${assetA.type} : ${priceImpactA * 100}%`,
      hasToolTip: false,
    },
    {
      title: "Price Impact B",
      val: `${assetB.type} : ${priceImpactB * 100}%`,
      hasToolTip: false,
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
      hasToolTip: true,
    },
    {
      title: "Minimum Recieved",
      val: minimumReceived,
      hasToolTip: false,
    },
  ];

  function convertToDollars(amt, idx) {
    let result = formatToDollars(amt * prices[idx]);
    return result;
  }

  function localPreviewSwap() {
    let effect = initEffectState;
    let a =
      rightSelectVal === assetA.type ? pool.secondaryAsset : pool.primaryAsset;
    console.log("what a is in local preview", a);
    let val =
      rightSelectVal === assetA.type
        ? parseInt(assetB.amount)
        : parseInt(assetA.amount);
    console.log("val is", val);
    if (typeof val === "number" && val > 0) {
      const swap = pool.prepareSwap({
        asset: a,
        amount: val,
        slippagePct: 1,
      });
      effect = swap.effect;
    }
    setSwapEffect(effect);
  }

  function handleSwap() {
    localPreviewSwap();
    setModalCanAnimate(true);
    setModalVisible(true);
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
    // setLoading(true);
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
      swapTo: rightSelectVal === assetB.type ? assetB : assetA,
    });
    // setLoading(true);
    if (newLeft.calcResult) {
      setLeftInputAmt(parseFloat(newLeft.calcResult));
      localPreviewSwap();
      setLoading(false);
    }
  }, [rightChange]);

  useEffect(() => {
    if (!loading) {
      setWaitingText("");
    } else {
      setWaitingText("fetching...");
    }
  }, [loading]);

  // fetch ratio
  useEffect(async () => {
    let ratio = await algoGardRatio();
    if (algoToGardRatio !== "Loading...") {
      setTimeout(() => {
        setAlgoToGardRatio(ratio);
      }, 180000);
    } else if (ratio) {
      setAlgoToGardRatio(ratio);
    }
  }, [algoToGardRatio]);

  // convert to dollars when inputs change
  useEffect(() => {
    let dollars = convertToDollars(leftInputAmt, leftSelectVal.toLowerCase());
    setLeftDollars(dollars);
  }, [leftInputAmt]);

  useEffect(() => {
    let dollars = convertToDollars(rightInputAmt, rightSelectVal.toLowerCase());
    setRightDollars(dollars);
  }, [rightInputAmt]);

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
            pool.primaryAssetPrice,
            pool.secondaryAssetPrice,
          )
        : 0,
    );
  }, [swapEffect]);

  useEffect(() => {
    let balX = getWalletInfo()
      ? mAlgosToAlgos(getWalletInfo().amount).toFixed(2)
      : 0;
    let balY = getWalletInfo()
      ? mAlgosToAlgos(getGARDInWallet()).toFixed(2)
      : 0;
    setBalanceX(balX);
    setBalanceY(balY);
  }, []);

  return (
    <div>
      {loading ? <LoadingOverlay text={loadingText} /> : <></>}
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
        ></ExchangeButton>
      </BtnBox>
      <DetailsContainer>
        <Details>
          {effects.length > 0
            ? effects.map((item, idx) => {
                return (
                  <Effect
                    title={item.title}
                    key={idx}
                    val={item.val}
                    hasToolTip={item.hasToolTip}
                  />
                );
              })
            : null}
        </Details>
      </DetailsContainer>
      <TransactionContainer>
        <Modal
          title="Are you sure you want to proceed?"
          subtitle="Review the details of this transaction to the right and click “Confirm Transaction” to proceed."
          visible={modalVisible}
          animate={modalCanAnimate}
          close={() => setModalVisible(false)}
        >
          <TransactionSummary
            specifics={[
              {
                title: "You are offering ",
                value: `${
                  previewSwap(assetA, assetB, {
                    swapTo: rightSelectVal === assetB.type ? assetA : assetB,
                  }).calcResult
                    ? previewSwap(assetA, assetB, {
                        swapTo:
                          rightSelectVal === assetB.type ? assetA : assetB,
                      }).calcResult
                    : leftInputAmt
                } ${leftSelectVal}`,
                token: `${leftSelectVal}`,
              },
              {
                title: "You are receiving a minimum of ",
                value: `${
                  previewSwap(assetA, assetB, {
                    swapTo: rightSelectVal === assetA.type ? assetA : assetB,
                  }).calcResult
                    ? previewSwap(assetA, assetB, {
                        swapTo:
                          rightSelectVal === assetA.type ? assetA : assetB,
                      }).calcResult
                    : rightInputAmt
                } ${rightSelectVal}`,
                token: `${rightSelectVal}`,
              },
              {
                title: "Transaction Fee",
                value: `${feeRate} Algos`,
              },
            ]}
            transactionFunc={async () => {
              setModalCanAnimate(true);
              setModalVisible(false);
              setLoading(true);
              try {
                let res;
                if (
                  leftSelectVal === assetA.type &&
                  rightSelectVal === assetB.type
                ) {
                  res = await swapAlgoToGard(
                    algosTomAlgos(parseInt(assetA.amount)),
                    parseInt(
                      1e6 *
                        parseFloat(assetB.amount) *
                        (1 - slippageTolerance),
                    ),
                  );
                } else if (
                  leftSelectVal === assetB.type &&
                  rightSelectVal === assetA.type
                ) {
                  res = await swapGardToAlgo(
                    algosTomAlgos(parseInt(assetB.amount)),
                    parseInt(
                      1e6 *
                        parseFloat(assetA.amount) *
                        (1 - slippageTolerance),
                    ),
                  );
                }
                if (res.alert) {
                  dispatch(setAlert(res.text));
                  setLoading(false)
                }
              } catch (e) {
                handleTxError(e, "Error exchanging assets");
              }
              setModalCanAnimate(false)
              setLoading(false)
              // await swap(assetA, assetB, {
              //   swapTo: rightSelectVal === assetA.type ? assetA : assetB,
              //   slippageTolerance: 1,
              // });
              // if (swap) {
              //   setLoading(false);
              // } // uncomment with working asset agnostic swap when ready
            }}
            cancelCallback={() => setModalVisible(false)}
          ></TransactionSummary>
        </Modal>
      </TransactionContainer>
    </div>
  );
}

const TransactionContainer = styled.div``;

const InputTitle = styled.text``;

const SlippageField = styled(InputField)`
  appearance: none;
  background: #0d1227;
  width: 16vw;
  height: 6vh;
  border-radius: 8px;
  border: 1px transparent;
  opacity: 65%;
  text-decoration: underline;
`;

const BtnBox = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const ExchangeButton = styled(PrimaryButton)`
  margin-top: 25px;
  border: 1px transparent;
`;

const DetailsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 2;
  justify-content: center;
  width: 80%;
  height: 30vh;
  background: #0d1227;
  opacity: 65%;
  border-radius: 10px;
  margin: auto;
  margin-top: 30px;
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
