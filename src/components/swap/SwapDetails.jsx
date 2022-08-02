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
  return price
}

const algoPrice = await getPrice().then(val => val.toFixed(5))
const prices = {algo: gardpool.calculator.primaryAssetPrice, gard: gardpool.calculator.secondaryAssetPrice}
const defaultPool = "ALGO/GARD";
const pools = [defaultPool];
const slippageTolerance = 0.005;

export default function SwapDetails() {
  const [totals, setTotals] = useState(null);
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

  const [gardPool, setGardPool] = useState(gardpool);

  const [swapEffect, setSwapEffect] = useState(null);
  const [leftSelectVal, setLeftSelectVal] = useState("ALGO");
  const [rightSelectVal, setRightSelectVal] = useState("GARD");
  const [leftInputAmt, setLeftInputAmt] = useState(0)
  const [rightInputAmt, setRightInputAmt] = useState(0);

  const [rightDollars, setRightDollars] = useState(0);
  const [leftDollars, setLeftDollars] = useState(0);

  const [receivedValue, setReceivedValue] = useState(null);
  const assets = ["ALGO", "GARD"];
  const assetIds = [0, gardID];

  const [priceImpact, setPriceImpact] = useState(0);
  const [liquidityFee, setLiquidityFee] = useState(0);
  const [exchangeRate, setExchangeRate] = useState();
  const [slippageTolerance, setSlippageTolerance] = useState(0.1);
  const [feeRate, setFeeRate] = useState(0);
  const [minimumReceived, setMinimumReceived] = useState(0);


  function convertToDollars(amt, idx) {
    let result = formatToDollars(amt * prices[idx])
    console.log("result in convert func", result)
    return result
  }

  useEffect(() => {
    let dollars = convertToDollars(leftInputAmt, leftSelectVal.toLowerCase())
    setLeftDollars(dollars)
  }, [leftInputAmt])

  useEffect(() => {
    let dollars = convertToDollars(rightInputAmt, rightSelectVal.toLowerCase())
    setRightDollars(dollars)
  }, [rightInputAmt])

  useEffect(() => {

  }, [leftSelectVal])

  useEffect(() => {

  }, [rightSelectVal])

  useEffect(() => {}, [assetAtotal]);

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

  function handleSwap(e) {
    const leftSelect = document.querySelector("#left-select");
    const rightSelect = document.querySelector("#right-select");
    setAssetAtype(leftSelect.value);
    setAssetBtype(rightSelect.value);
  }

  function handleSwapButton() {
    console.log("flip");
    console.log("asset type A", assetAtype);
    console.log("asset type B", assetBtype);
    setRight(left);
    setLeft(right);
  }



  function handleSelect(e) {
    if (e.target.id === "left-select") {
      setLeftSelectVal(e.target.value)
    }
    if (e.target.id === "right-select") {
      setRightSelectVal(e.target.value)
    }
  }

  async function handleInput(e) {
    if (e.target.id === "left-input") {
      setLeftInputAmt(e.target.value)
    }
    if (e.target.id === "right-input") {
      setRightInputAmt(e.target.value)
    }
    // let res = convertToDollars(rightInputAmt)
    // console.log(res);
    // if (leftSelect.value !== rightSelect.value) {
    //   // either use pact swap function to set swap effect
    //   // or use estimateReturn to set the inputs, pact swap
    //   // to set pact swap anyway async -> front end preview uses
    //   // local function updated live via interval and query blockchain
    //   // or
    //   const assetA = {
    //     type: assetAtype,
    //     amount: assetAtotal,
    //     id: assetAtype === assets[0] ? assetIds[0] : assetIds[1],
    //   };
    //   const assetB = {
    //     type: assetBtype,
    //     amount: assetBtotal,
    //     id: assetBtype === assets[1] ? assetIds[1] : assetIds[0],
    //   };
    //   const params = {
    //     swapTo: rightSelect.value === assets[1] ? assets[1] : assets[0],
    //     slippageTolerance: slippageTolerance,
    //   };
    //   // const effect1 = await previewPoolSwap(leftSelect.value, e.target.)
    //   const effect = await processSwap(assetA, assetB, params);
    //   setSwapEffect(effect);
    // }

  }

  // state update of estimated return
  // wallet info effect

  useEffect(() => {
    let balX = mAlgosToAlgos(getWalletInfo().amount);
    let balY = mAlgosToAlgos(getGARDInWallet());
    setBalanceX(balX);
    setBalanceY(balY);
  }, []);

  const testObj = {
    algoGardRatio: algoToGardRatio,
    totals: totals,
    balanceX: balanceX,
    balanceY: balanceY,
    assets: assets,
    allpools: allpools,
    gardpool: gardpool,
  };

  return (
    <div>
      <div></div>
      <ExchangeBar>
        <ExchangeFields
          ids={["left-select", "left-input"]}
          type={left}
          assets={assets}
          effect={{title: "$Value: ", val: leftDollars}}
          onOptionSelect={handleSelect}
          onInputChange={handleInput}
          balances={[balanceX, balanceY]}
          totals={totals}
        >

        </ExchangeFields>
        {/* <TestInput
                  onChange={handleSwap}
                ></TestInput> */}
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
          effect={{title: "$Value: ", val: rightDollars}}
          onOptionSelect={handleSelect}
          onInputChange={handleInput}
          balances={[balanceX, balanceY]}
          totals={totals}
        >
        </ExchangeFields>
      </ExchangeBar>
      <DetailsContainer>
        <Details>
        {effects.length > 0
          ? effects.map((item, idx) => {
              return(<Effect
                title={item.title}
                key={idx}
                val={item.val}
                hasToolTip={item.hasToolTip}
              />);
            })
          : null}
          </Details>
        {/* <SlippageField value={slippageTolerance}></SlippageField> */}
      </DetailsContainer>

    </div>
  );
}

const InputTitle= styled.text`

`

const TestInput = styled.input`
  appearance: none;
  background: #0d1227;
  text-decoration: underline;
  color: #999696;
  width: 16vw;
  height: 6vh;
  border: 1px transparent;
  opacity: 65%;
`;

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
`

const TestButton = styled.button`
  appearance: none;
  background: fuchsia;
  border: linear-gradient(
      217deg,
      rgba(255, 0, 0, 0.8),
      rgba(255, 0, 0, 0) 70.71%
    ),
    linear-gradient(127deg, rgba(0, 255, 0, 0.8), rgba(0, 255, 0, 0) 70.71%),
    linear-gradient(336deg, #392fff, rgba(0, 0, 255, 0) 70.71%);
  color: #2fe7ff;
  text-decoration: dashed;
  animation-duration: 2s;
  animation-name: bounce;

  @keyframes bounce {
    from {
      margin-left: 100%;
      width: 300%;
    }
    to {
      margin-left: 0%;
      width: 100%;
    }
  }
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
  /* background-color: #019fff;

    padding: 8px 18px;
    display: flex;
    justify-content: center;
    align-items: center; */
  cursor: pointer;
  /* border-radius: 30px; */
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
