import React, { useState, useEffect, useReducer } from "react";
import styled, { css } from "styled-components";
import { Container } from "@mui/system";
import ExchangeField from "./ExchangeField";
import InputField from "./InputField";
import {
    mAlgosToAlgos,
    mGardToGard,
    exchangeRatioAssetXtoAssetY,
    targetPool,
    getTotals,
    calcTransResult,
    processSwap
} from "./swapHelpers"
import {
    getGARDInWallet,
    getWalletInfo
  } from "../../wallets/wallets";
import swapIcon from "../../assets/icons/swap_icon_v2.png";
import { gardpool, algoGardRatio, getPools } from "../../transactions/swap";
const allpools = await getPools();
// need field, button, helpers
const defaultPool = "ALGO/GARD";

export default function SwapDetails() {
  const [totals, setTotals] = useState(null);
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(1);
  const [algoToGardRatio, setAlgoToGardRatio] = useState("Loading...");
  const [loadingText, setLoadingText] = useState(null);
  const [balanceX, setBalanceX] = useState("...");
  const [balanceY, setBalanceY] = useState("...");

  const [assetAtype, setAssetAtype] = useState(null);
  const [assetBtype, setAssetBtype] = useState(null);

  const [gardPool, setGardPool] = useState(gardpool)
  const [receivedValue, setReceivedValue] = useState(null);
  const [slippageTolerance, setSlippageTolerance] = useState(0.10);
  const assets = ["ALGO", "GARD"];


  useEffect(async () => {
    let ratio = await algoGardRatio();
    if (algoToGardRatio !== "Loading..." ) {
      setTimeout(() => {
        setAlgoToGardRatio(ratio)
      },180000)
    } else if (ratio) {
      setAlgoToGardRatio(ratio)
    }
  }, [algoToGardRatio]);

  function handleSwap(e) {
    console.log(e.target.value)
  }

  function handleSwapButton() {
    console.log("flip")
    console.log("asset type A", assetAtype);
    console.log("asset type B", assetBtype);
  }

  function handleSelect(e) {
    // console.log("selecting", e.target.value);
    const leftSelect = document.querySelector("#left-select")
    const rightSelect = document.querySelector("#right-select")
    setAssetAtype(leftSelect.value);
    setAssetBtype(rightSelect.value);
    // console.log("left select element id", leftSelect.id);
    // console.log("left select element value", leftSelect.value);
    // console.log("right select element id", rightSelect.id);
    // console.log("right select element value", rightSelect.value);

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
    gardpool: gardpool
  }

    return(
        <div><div>

            </div>
            <ExchangeBar>
                <ExchangeFields
                    ids={["left-select", "right-select"]}
                    type={left}

                    assets={assets}
                    onOptionSelect={handleSelect}
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

                <SwapButton
                  onClick={handleSwapButton}
                  src={swapIcon}
                />

            </div>
                <ExchangeFields
                    ids={["left-select", "right-select"]}
                    type={right}
                    assets={assets}
                    onOptionSelect={handleSelect}
                    balances={[balanceX, balanceY]}
                    totals={totals}
                ></ExchangeFields>
            </ExchangeBar>
              <DetailsContainer>
                <SlippageField value={slippageTolerance} ></SlippageField>
              </DetailsContainer>

            {/* <TestButton onClick={() => {
              console.log("variables", testObj)
            }} >Click me!!</TestButton> */}
        </div>
    )
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
`

const SlippageField = styled(InputField)`
  appearance: none;
  background: #0d1227;
  width: 16vw;
  height: 6vh;
  border-radius: 8px;
  border: 1px transparent;
  opacity: 65%;
  text-decoration: underline;
`

const DetailsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 2;
  justify-content: space-between;
  width: 80%;
  background: #0d1227;
  opacity: 65%;
`

const TestButton = styled.button`
  appearance: none;
  background: fuchsia;
  border: linear-gradient(217deg, rgba(255,0,0,.8), rgba(255,0,0,0) 70.71%),
          linear-gradient(127deg, rgba(0,255,0,.8), rgba(0,255,0,0) 70.71%),
          linear-gradient(336deg, #392fff, rgba(0,0,255,0) 70.71%);
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
`

const ExchangeBar = styled.div`
    display: flex;
    flex-direction: row;
    flex: 3;
    justify-content: space-between;

`

const ExchangeFields = styled(ExchangeField)`
  width: 40%;
  background: #0d1227;
`


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
`

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
