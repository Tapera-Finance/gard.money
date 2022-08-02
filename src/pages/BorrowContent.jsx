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

export default function BorrowContent(){
    return <div>
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#80deff",
            borderRadius: 10,
            color: "#172756",
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 20,
            paddingRight: 20,
        }}>
            <div>
                <div>Governance Rewards</div>
                <div>Now - October 22, 2022</div>
            </div>
            <div>
                12% - 33% APR Rewards
            </div>
            <div>
                Borrow ALGO to Claim Rewards
            </div>
        </div>
        <div style={{
            display: "flex",
            flexDirection: "column",
        }}>
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 50%)",
            }}>
                <div>Supply ALGO</div>
                <div>Borrow GARD</div>
            </div>
            <div style={{
            background: "rgba(13, 18, 39, .75)",
            paddingTop: 30,
            paddingBottom: 30,
            borderRadius: 10
             }}>
                <div style={{display: "grid", gridTemplateColumns:"repeat(4, 20%)", rowGap: 30, justifyContent: "center"}}>
                    <div style={{display: "flex", flexDirection: "column"}}>
                        <div>Collateral</div>
                        <div>0.05%</div>
                    </div>
                    <div style={{display: "flex", flexDirection: "column"}}>
                        <div>Recieved DAI</div>
                        <div>0.00%</div>
                    </div>
                    <div style={{display: "flex", flexDirection: "column"}}>
                        <div>Liquidation Price</div>
                        <div>0.00%</div>
                    </div>
                    <div style={{display: "flex", flexDirection: "column"}}>
                        <div>Received DAI</div>
                        <div>0.00%</div>
                    </div>
                    <div style={{display: "flex", flexDirection: "column"}}>
                        <div>ETH exposure</div>
                        <div>0.05%</div>
                    </div>
                    <div style={{display: "flex", flexDirection: "column"}}>
                        <div>Stability Fee</div>
                        <div>0.00%</div>
                    </div>
                    <div style={{display: "flex", flexDirection: "column"}}>
                        <div>Liquidation ratio</div>
                        <div>0.00%</div>
                    </div>
                    <div style={{display: "flex", flexDirection: "column"}}>
                        <div>DAI avaible from ETH</div>
                        <div>0.00%</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}
