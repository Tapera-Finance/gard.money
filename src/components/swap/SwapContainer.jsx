import React, { useState, useEffect } from "react";
import styled, { css } from "styled-components";
import swapIcon from "../../assets/icons/swap_icon_new.png";
import Modal from "../Modal";

import TransactionSummary from "../TransactionSummary";
import PageToggle from "./PageToggle";
import LoadingOverlay from "../LoadingOverlay";
import { setAlert } from "../../redux/slices/alertSlice";
import {
  getGARDInWallet,
  getWalletInfo,
  handleTxError,
} from "../../wallets/wallets";

import { useDispatch } from "react-redux";
import { VERSION } from "../../globals";
import SwapDetails from "./SwapDetails";
import Test from "./Test";
import { Container } from "@mui/system";

/**
 * local utils
 */

const defaultPool = "ALGO/GARD";
const pools = [defaultPool];
const slippageTolerance = 0.005;


//
/**
 * Components
 * @component SwapContainer
 * Main container for Swap feature, to go on page {SwapContent} with PoolContainer
 */

export default function SwapContainer() {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalCanAnimate, setModalCanAnimate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(null);
  const [selectedTab, setSelectedTab] = useState("swap");

  const Tabs = {
    swap: <SwapDetails />,
    pool: <PoolDetails />,
  };

  const dispatch = useDispatch();
  let test = true;

  const sessionStorageSetHandler = (e) => {
    setLoadingText(JSON.parse(e.value));
  };
  document.addEventListener("itemInserted", sessionStorageSetHandler, false);

  return (
    <div>
      {loading ? <LoadingOverlay text={loadingText} /> : <></>}
      <PageToggle selectedTab={setSelectedTab}></PageToggle>
      {Tabs[selectedTab]}
    </div>
  );
}

// Styled Components
const TitleContainer = styled.div`
  background: #0d1227;
  border-radius: 6px;
  flex: 2;
  display: flex;
  flex-direction: row;
`;

const TransactionContainer = styled.div``;

const Image = styled.img`
  background-color: #ffffff;

  padding: 8px 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 6px;
  &:hover {
    background-color: #6941c6;
    border: 1px solid #ffffff;
  }
`;

const ImgText = styled.text`
  color: #ffffff;
  font-weight: 500;
  font-size: 16px;
  ${Image}:hover & {
    color: #ffffff;
  }
`;

/**
 *
 * (1e6 * (1 - slippageTolerance))) /
                            1e6
                          ).toFixed(6)
 *
 */
