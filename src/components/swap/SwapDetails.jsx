import React, { useState, useEffect, useReducer } from "react";
import styled, { css } from "styled-components";
import { Container } from "@mui/system";
import ExchangeField from "./ExchangeField";
import {
    mAlgosToAlgos,
    mGardToGard,
    exchangeRatioAssetXtoAssetY,
    targetPool,
    getTotals,
    calcTransResult
} from "./swapHelpers"
import {
    getGARDInWallet,
    getWalletInfo
  } from "../../wallets/wallets";
import swapIcon from "../../assets/icons/swap_icon_new.png";

// need field, button, helpers
const defaultPool = "ALGO/GARD";

export default function SwapDetails({transactionCallback}) {
  const [totals, setTotals] = useState(null);
  const [algoToGardRatio, setAlgoToGardRatio] = useState("Loading...");
  const [loadingText, setLoadingText] = useState(null);
  const [balanceX, setBalanceX] = useState("...");
  const [balanceY, setBalanceY] = useState("...");
  const [receivedValue, setReceivedValue] = useState(null);
  const assets = ["ALGO", "GARD"];


  useEffect(async () => {
    const res = await getTotals();
    if (res) {
      setTotals(res);
    }
  }, [totals]);

  useEffect(async () => {
    let algoGardRatio = exchangeRatioAssetXtoAssetY(
      mAlgosToAlgos(totals["ALGO/GARD" || "GARD/ALGO"].algo),
      mGardToGard(totals["ALGO/GARD" || "GARD/ALGO"].gard),
    );
    if (algoGardRatio) {
      setAlgoToGardRatio(algoGardRatio);
    }
    return () => {
      console.log("unmounting getRatio effect", algoGardRatio);
    };
  }, [algoToGardRatio]);

  const [transaction, reduceTransaction] = useReducer(
    (state, action) => {
      switch (action.type) {
        case "offering-amount":
          return {
            ...state,
            offering: {
              ...state.offering,
              amount: action.value,
            },
          };
        case "offering-from":
          return {
            ...state,
            offering: {
              ...state.offering,
              from: action.value,
            },
          };
        case "receiving-amount":
          return {
            ...state,
            receiving: {
              ...state.receiving,
              amount: action.value,
            },
          };
        case "receiving-to":
          return {
            ...state,
            receiving: {
              ...state.receiving,
              to: action.value,
            },
          };
        case "clear":
          return {
            ...state,
            offering: {
              ...state.offering,
              amount: "",
            },
            receiving: {
              ...state.receiving,
              amount: "",
            },
          };
        case "flip":
          return {
            ...state,
            ...action.value,
          };
        default:
          return {
            ...state,
            defaultPool: defaultPool,
          };
      }
    },
    {
      offering: {
        amount: "",
        from: "ALGO",
      },
      receiving: {
        amount: "",
        to: "GARD",
      },
    },
  );

    // state update of estimated return
    useEffect(() => {
        if (transaction) {
          if (totals) {
            const { offering, receiving } = transaction;
            let res = calcTransResult(
              offering.amount,
              totals[targetPool(offering.from, receiving.to)][
                offering.from.toLowerCase()
              ],
              totals[targetPool(offering.from, receiving.to)][
                receiving.to.toLowerCase()
              ],
              transaction,
            );
            setReceivedValue(res);
          }
        }
        return () => {
          console.log("unmounting get totals effect");
        };
      }, [receivedValue]);

        // wallet info effect
  useEffect(() => {
    let balX = mAlgosToAlgos(getWalletInfo().amount);
    let balY = mAlgosToAlgos(getGARDInWallet());
    setBalanceX(balX);
    setBalanceY(balY);
  }, []);

  const handleSwapButton = (e) => {
    e.preventDefault();
    const swappedObj = {
      offering: {
        from: transaction.receiving.to,
        amount: transaction.receiving.amount,
      },
      receiving: {
        to: transaction.offering.from,
        amount: transaction.offering.amount,
      },
    };
    reduceTransaction({
      type: "flip",
      value: swappedObj,
    });
  };

    return(
        <div><div>
            Swap
            </div>
            <ExchangeBar>
                <ExchangeField
                    type={0}
                    transaction={transaction}
                    assets={assets}
                    transactionCallback={reduceTransaction}
                    balances={[balanceX, balanceY]}
                    totals={totals}
                ></ExchangeField>
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
                <ExchangeField
                    type={1}
                    transaction={transaction}
                    assets={assets}
                    transactionCallback={reduceTransaction}
                    balances={[balanceX, balanceY]}
                    totals={totals}
                ></ExchangeField>
            </ExchangeBar>
        </div>
    )
}

const ExchangeBar = styled.div`
    display: flex;
    flex-direction: row;
    flex: 3;
    justify-content: space-between;
`
const SwapButton = styled.img`
    background-color: #019fff;

    padding: 8px 18px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border-radius: 30px;
    &:hover {
        background-color: #7c52ff;
    }
`
