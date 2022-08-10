import React, { useState } from "react";
import PageToggle from "./PageToggle";
import LoadingOverlay from "../LoadingOverlay";
import SwapDetails from "./SwapDetails";

/**
 * Components
 * @component SwapContainer
 * container for Swap & Pool, to go on page SwapContent
 */

export default function SwapContainer() {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(null);
  const [selectedTab, setSelectedTab] = useState("swap");

  const Tabs = {
    swap: <SwapDetails />,
    // pool: <PoolDetails />,
  };


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
