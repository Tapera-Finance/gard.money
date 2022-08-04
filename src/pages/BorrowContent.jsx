import React, { useEffect, useState, useReducer, useContext } from "react";
import styled, { keyframes, css } from "styled-components";
import Modal from "../components/Modal";
import PrimaryButton from "../components/PrimaryButton";
import TransactionSummary from "../components/TransactionSummary";
import LoadingOverlay from "../components/LoadingOverlay";
import {
  getWallet,
  getWalletInfo,
  handleTxError,
  updateWalletInfo,
} from "../wallets/wallets";
import { calcDevFees, getPrice, calcRatio } from "../transactions/cdp.js";
import { openCDP } from "../transactions/cdp";
import { useAlert } from "../hooks";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAlert } from "../redux/slices/alertSlice";
import { commitmentPeriodEnd } from "../globals";
import CreatePosition from "../components/CreatePosition";
import RewardNotice from "../components/RewardNotice";
import Details from "../components/Details";
import Positions from "../components/Positions";


function displayRatio() {
  return calcRatio(algosToMAlgos(getCollateral()), getMinted(), true);
}

function mAlgosToAlgos(num) {
  return num / 1000000;
}
function algosToMAlgos(num) {
  return num * 1000000;
}

function displayFees() {
  const fees = mAlgosToAlgos(calcDevFees(algosToMAlgos(getMinted())));
  return fees + " Algos";
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
    const [balance, setBalance] = useState("...");
    const [price, setPrice] = useState(0);


    useEffect(async () => {
        setPrice(await getPrice());
        await updateWalletInfo();
        getWallet();
        setBalance((getWalletInfo()["amount"] / 1000000).toFixed(3));
    }, []);

    var details = [
        {
            title: "Collateral",
            val: `${0.00}%`,
            hasToolTip: true,
        },
        {
            title: "Received DAI",
            val: `${0.00}%`,
            hasToolTip: true,
        },
        {
            title: "Liquidation Price",
            val: `${0.00}%`,
            hasToolTip: true,
        },
        {
            title: "Received DAI",
            val: `${0.00}%`,
            hasToolTip: true,
        },
        {
            title: "ETH exposure",
            val: `${0.00}%`,
            hasToolTip: true,
        },
        {
            title: "Stability Fee",
            val: `${0.00}%`,
            hasToolTip: true,
        },
        {
            title: "Liquidation ratio",
            val: `${0.00}%`,
            hasToolTip: true,
        },
        {
            title: "DAI avaible from ETH",
            val: `${0.00}%`,
            hasToolTip: true,
        },
    ]
    return <div>
        <RewardNotice 
        program={"Governance Rewards"} 
        timespan={"Now - October 22, 2022"}
        estimatedRewards={"12% - 33% APR Rewards"}
        action={"Borrow ALGO to Claim Rewards"}
        />
        <CreatePosition 
        balance={balance} 
        price={price}
        />
        <Details className={"borrow"} details={details}/>
        <Positions/>
    </div>
}