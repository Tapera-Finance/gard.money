import React, { useState, useEffect, useReducer } from "react";
import styled, { css } from "styled-components";
import ExchangeField from "./ExchangeField";
import InputField from "./InputField";
import { mAlgosToAlgos, processSwap } from "./swapHelpers";
import { getGARDInWallet, getWalletInfo } from "../../wallets/wallets";
import swapIcon from "../../assets/icons/swap_icon_v2.png";
import { gardpool, algoGardRatio, getPools } from "../../transactions/swap";
import { gardID } from "../../transactions/ids";
const allpools = await getPools();

// need field, button, helpers

/**
// in Details Container ->


// render
    effects.map((item) => {
        <Effect title={item.title} func={item.func} hasToolTip={item.hasToolTip} />
    })



*/

// decouple amount and name of asset from each other's state, set separately
// -- the initial react dev took a weird hardcoded oop approach, ie assigning directionality
//    and type of input to a single object instead of using pure functions to pass each piece
//    to logic held elsewhere, smh.
// -- react is meant to be written with a functional approach

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

  const [receivedValue, setReceivedValue] = useState(null);
  const [slippageTolerance, setSlippageTolerance] = useState(0.1);
  const assets = ["ALGO", "GARD"];
  const assetIds = [0, gardID];

  const [priceImpact, setPriceImpact] = useState(0);

  useEffect(() => {}, [assetAtotal]);

  const effects = [
    {
      title: "Price Impact",
      func: priceImpact,
      hasToolTip: false,
    },
    {
      title: "Exchange Rate",
      func: priceImpact,
      // func: exchangeRate,
      hasToolTip: false,
    },
    {
      title: "Liquidity Fee",
      func: priceImpact,
      // func: liquidityFee,
      hasToolTip: true,
    },
    {
      title: "Slippage Tolerance",
      func: priceImpact,
      // func: slippageTolerance,
      hasToolTip: true,
    },
    {
      title: "Fee Rate",
      func: priceImpact,
      // func: feeRate,
      hasToolTip: true,
    },
    {
      title: "Minimum Recieved",
      func: priceImpact,
      // func: minimumReceived,
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
    //
  }

  function handleSwapButton() {
    console.log("flip");
    console.log("asset type A", assetAtype);
    console.log("asset type B", assetBtype);
  }

  const leftSelect = document.querySelector("#left-select");
  const rightSelect = document.querySelector("#right-select");

  function handleSelect(e) {
    // console.log("selecting", e.target.value);
    // const leftSelect = document.querySelector("#left-select")
    // const rightSelect = document.querySelector("#right-select")
    setAssetAtype(leftSelect.value);
    setAssetBtype(rightSelect.value);
    // console.log("left select element id", leftSelect.id);
    // console.log("left select element value", leftSelect.value);
    // console.log("right select element id", rightSelect.id);
    // console.log("right select element value", rightSelect.value);
  }

  async function handleInput(e) {
    if (leftSelect.value !== rightSelect.value) {
      // either use pact swap function to set swap effect
      // or use estimateReturn to set the inputs, pact swap
      // to set pact swap anyway async -> front end preview uses
      // local function updated live via interval and query blockchain
      // or
      const assetA = {
        type: assetAtype,
        amount: assetAtotal,
        id: assetAtype === assets[0] ? assetIds[0] : assetIds[1],
      };
      const assetB = {
        type: assetBtype,
        amount: assetBtotal,
        id: assetBtype === assets[1] ? assetIds[1] : assetIds[0],
      };
      const params = {
        swapTo: rightSelect.value === assets[1] ? assets[1] : assets[0],
        slippageTolerance: slippageTolerance,
      };
      // const effect1 = await previewPoolSwap(leftSelect.value, e.target.)
      const effect = await processSwap(assetA, assetB, params);
      setSwapEffect(effect);
    }
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
          onOptionSelect={handleSelect}
          onInputChange={handleInput}
          balances={[balanceX, balanceY]}
          totals={totals}
        ></ExchangeFields>
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
          ids={["right-select", "right-select"]}
          type={right}
          assets={assets}
          onOptionSelect={handleSelect}
          onInputChange={handleInput}
          balances={[balanceX, balanceY]}
          totals={totals}
        ></ExchangeFields>
      </ExchangeBar>
      <DetailsContainer>
        {effects.length > 0
          ? effects.map((item) => {
              <Effect
                title={item.title}
                func={item.func}
                hasToolTip={item.hasToolTip}
              />;
            })
          : null}
        <SlippageField value={slippageTolerance}></SlippageField>
      </DetailsContainer>

      {/* <TestButton onClick={() => {
              console.log("variables", testObj)
            }} >Click me!!</TestButton> */}
    </div>
  );
}

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
  justify-content: space-between;
  width: 80%;
  background: #0d1227;
  opacity: 65%;
`;

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

/**
 * use the strengths of Pact SDK to your advantage here - all the processing logic is there. Make components that represent each individual piece of a swap, do not use transaction object as state as it was done before. Write function to capture current state of all individual components to pass to transaction modal when execute transaction is clicked.
 */

/**
 * Ask about modal or select
 *  * token select - button to trigger modal or conditional rendering span?

token for select - not tied to select

 *
 * for input:
 * style the div where it lives, and make input have as minimal a styling as possible
 * input and div share background color
 * border and container properties live outside input
 *      span below input that shows dollar amount
 *      button on details container that shows exchange rate, calculate reverse onclick
 *
 *
 * for exchange fields:
 * async function call on input, -- regardless -- of which one is called.
 */

/**
 */
