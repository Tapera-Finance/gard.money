import React, { useState, useEffect, useReducer } from "react";
import styled, { css } from "styled-components";
import ExchangeField from "../ExchangeField";
import InputField from "../InputField";
import { mAlgosToAlgos, algosTomAlgos, processSwap } from "./swapHelpers";
import { getGARDInWallet, getWalletInfo } from "../../wallets/wallets";
import { formatToDollars } from "../../utils";
import swapIcon from "../../assets/icons/swap_icon_v2.png";
import { gardpool, algoGardRatio, getPools } from "../../transactions/swap";
import Effect from "../Effect";
import TransactionSummary from "../TransactionSummary";
import Modal from "../Modal";
import { gardID } from "../../transactions/ids";
import { getPrice } from "../../transactions/cdp";
const allpools = await getPools();

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

export default function SwapDetails() {
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(false);
  const [waitingText, setWaitingText] = useState("fetching...");
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(1);
  const [algoToGardRatio, setAlgoToGardRatio] = useState("Loading...");
  const [loadingText, setLoadingText] = useState(null);
  const [balanceX, setBalanceX] = useState("...");
  const [balanceY, setBalanceY] = useState("...");

  const [assetAtype, setAssetAtype] = useState("ALGO");
  const [assetBtype, setAssetBtype] = useState("GARD");

  const [assetAtotal, setAssetAtotal] = useState(0);
  const [assetBtotal, setAssetBtotal] = useState(0);

  const [assetAid, setAssetAid] = useState(0);
  const [assetBid, setAssetBid] = useState(gardID);

  const [gardPool, setGardPool] = useState(gardpool);

  const [swapEffect, setSwapEffect] = useState(null);
  const [leftSelectVal, setLeftSelectVal] = useState("ALGO");
  const [rightSelectVal, setRightSelectVal] = useState("GARD");
  const [leftInputAmt, setLeftInputAmt] = useState(0);
  const [rightInputAmt, setRightInputAmt] = useState(0);

  const [rightDollars, setRightDollars] = useState(0);
  const [leftDollars, setLeftDollars] = useState(0);

  const assets = ["ALGO", "GARD"];

  const [priceImpact, setPriceImpact] = useState(0);
  const [liquidityFee, setLiquidityFee] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(0);
  const [slippageTolerance, setSlippageTolerance] = useState(0.1);
  const [feeRate, setFeeRate] = useState(0);
  const [minimumReceived, setMinimumReceived] = useState(0);

  const leftSelectEl = document.querySelector("#left-select");
  const rightSelectEl = document.querySelector("#right-select");
  const leftInputField = document.querySelector("#left-input");
  const rightInputField = document.querySelector("#right-input");

  const effects = [
    {
      title: "Price Impact",
      val: priceImpact,
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

  const variableViewer = {
    selects: {
      leftEl: leftSelectEl,
      leftVal: leftSelectVal,
      rightEl: rightSelectEl,
      rightVal: rightSelectVal,
    },
    inputs: {
      leftField: leftInputField,
      leftVal: leftInputAmt,
      rightField: rightInputField,
      rightVal: rightInputAmt,
    },
    appState: {
      assetA: {
        type: assetAtype,
        total: assetAtotal,
        id: assetAid,
      },
      assetB: {
        type: assetBtype,
        total: assetBtotal,
        id: assetBid,
      },
      swapEffect: swapEffect,
      algoToGardRatio: algoToGardRatio,
      pool: gardpool,
    },
  };

  function convertToDollars(amt, idx) {
    let result = formatToDollars(amt * prices[idx]);
    console.log("result in convert func", result);
    return result;
  }
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

  function handleSwapButton() {
    console.log("flip");
    console.log("asset type A", assetAtype);
    console.log("asset type B", assetBtype);
    setRight(left);
    setLeft(right);
  }

  function handleLeftSelect(e) {
    if (e.target.value === "") {
      return;
    }
    setLeftSelectVal(e.target.value);
    setRightSelectVal(leftSelectVal);
  }

  function handleRightSelect(e) {
    if (e.target.value === "") {
      return;
    }
    setRightSelectVal(e.target.value);
    setLeftSelectVal(rightSelectVal);
  }

  async function handleLeftInput(e) {
    if (e.target.value === 0 || e.target.value === "") {
      setRightInputAmt(0);
    }
    let newRight = await processSwap(assetA, assetB, {
      swapTo: rightSelectVal === assetB.type ? assetB : assetA,
    });
    setLoading(true);
    if (newRight.calcResult) {
      setRightInputAmt(parseFloat(newRight.calcResult));
      setSwapEffect(newRight.pactResult);
      setLoading(false);
    }
    console.log("variables: ", variableViewer);
  }

  async function handleRightInput(e) {
    if (e.target.value === 0 || e.target.value === "") {
      setLeftInputAmt(0);
    }
    let newLeft = await processSwap(assetA, assetB, {
      swapTo: leftSelectVal === assetA.type ? assetA : assetB,
    });
    setLoading(true);
    if (newLeft.calcResult) {
      setLeftInputAmt(parseFloat(newLeft.calcResult));
      setSwapEffect(newLeft.pactResult);
      setLoading(false);
    }
    console.log("variables: ", variableViewer);
  }

  useEffect(() => {
    assetA.amount = assetAtotal;
  }, [assetAtotal]);

  useEffect(() => {
    assetB.amount = assetBtotal;
  }, [assetBtotal]);

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

  // set asset amounts to be input amounts

  useEffect(() => {
    if (leftSelectVal === assetAtype) {
      setAssetAtotal(leftInputAmt);
    } else if (leftSelectVal === assetBtype) {
      setAssetBtotal(leftInputAmt);
    }
  }, [leftInputAmt]);

  useEffect(() => {
    if (rightSelectVal === assetAtype) {
      setAssetAtotal(rightInputAmt);
    } else if (rightSelectVal === assetBtype) {
      setAssetBtotal(rightInputAmt);
    }
  }, [rightInputAmt]);

  // preview swap when asset amounts are recorded

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
    // do something with swap effect
  }, [swapEffect]);

  useEffect(() => {
    let balX = mAlgosToAlgos(getWalletInfo().amount);
    let balY = mAlgosToAlgos(getGARDInWallet());
    setBalanceX(balX);
    setBalanceY(balY);
  }, []);

  return (
    <div>
      <div></div>
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
          // balances={[balanceX, balanceY]}
          // totals={totals}
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
          // balances={[balanceX, balanceY]}
          // totals={totals}
        ></ExchangeFields>
      </ExchangeBar>
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
    </div>
  );
}

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

// jsx for the transaction container to open on execute

/**
 * <div style={{ marginBottom: 50 }}>
        <TransactionContainer>
          <Modal
            title="Are you sure you want to proceed?"
            subtitle="Review the details of this transaction to the right and click “Confirm Transaction” to proceed."
            visible={modalVisible}
            animate={modalCanAnimate}
            close={() => setModalVisible(false)}
          >
            <TransactionSummary
              specifics={transaction}
              transactionFunc={async () => {
                setModalCanAnimate(true);
                setModalVisible(false);
                setLoading(true);
                try {
                  const amount = parseFloat(transaction[0].value);
                  const formattedAmount = parseInt(1e6 * amount);

                  if (VERSION !== "MAINNET") {
                    throw new Error("Unable to swap on TESTNET");
                  }
                  let res;
                  if (
                    transaction[0].token == "ALGO" &&
                    transaction[1].token == "GARD"
                  ) {
                    res = await swapAlgoToGard(
                      formattedAmount,
                      parseInt(
                        1e6 *
                          parseFloat(transaction[1].value.split()[0]) *
                          (1 - slippageTolerance),
                      ),
                    );
                  } else if (
                    transaction[0].token == "GARD" &&
                    transaction[1].token == "ALGO"
                  ) {
                    res = await swapGardToAlgo(
                      formattedAmount,
                      parseInt(
                        1e6 *
                          parseFloat(transaction[1].value.split()[0]) *
                          (1 - slippageTolerance),
                      ),
                    );
                  }
                  if (res.alert) {
                    dispatch(setAlert(res.text));
                  }
                } catch (e) {
                  handleTxError(e, "Error exchanging assets");
                }
                setModalCanAnimate(false);
                setLoading(false);
              }}
              cancelCallback={() => setModalVisible(false)}
            />
          </Modal>
        </TransactionContainer>
      </div>
      </div>
 */

// code from txn callback (passed to section which became this component)
/**
 * function tnxCb() {
  let keys = target.split("/");
  setModalCanAnimate(true);
  setTransaction([
    {
      title: "You are offering ",
      value: `${transaction.offering.amount}${" " + transaction.offering.from}`,
      token: `${transaction.offering.from}`,
    },
    {
      title: "You are receiving a minimum of ",
      value: `${
        totals
          ? (
              (calcTransResult(
                transaction.offering.amount,
                totals[target][keys[0].toLowerCase()],
                totals[target][keys[1].toLowerCase()],
                transaction,
              ) *
                (1e6 * (1 - slippageTolerance))) /
              1e6
            ).toFixed(6)
          : transaction.converted.amount // not sure if still in use
      } ${transaction.receiving.to}`,
      token: `${transaction.receiving.to}`,
    },
    {
      title: "Transaction Fee",
      value: "0.003 Algos",
    },
  ]);
  setModalVisible(true);
}

 */

/**
 * unused effect hooks
 useEffect(() => {
   if (leftSelectVal === assetAtype) {
     setAssetAtotal(leftInputAmt);
   } else {
     setAssetBtotal(leftSelectVal);
   }
 }, [leftSelectVal]);

 useEffect(() => {
   if (rightSelectVal === assetAtype) {
     setAssetAtotal(rightInputAmt);
   } else {
     setAssetBtotal(rightInputAmt);
   }
 }, [rightSelectVal]);


 test data ->

   const testObj = {
    algoGardRatio: algoToGardRatio,
    totals: totals,
    balanceX: balanceX,
    balanceY: balanceY,
    assets: assets,
    allpools: allpools,
    gardpool: gardpool,
  };
 */
