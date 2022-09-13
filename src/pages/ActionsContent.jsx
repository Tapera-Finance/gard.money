import React, { useState } from "react";
import PageToggle from "../components/PageToggle";
import LoadingOverlay from "../components/LoadingOverlay";
import SwapDetails from "../components/swap/SwapDetails";
import PoolDetails from "../components/pool/PoolDetails";
import StakeDetails from "../components/stake/StakeDetails"
/**
 * Components
 * @component SwapContainer
 * container for Swap & Pool, to go on page ActionsContent
 */

export default function ActionsContainer() {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(null);
  const [selectedTab, setSelectedTab] = useState("one");

  const Tabs = {
    one: <SwapDetails />,
    two: <StakeDetails />
    // two: <PoolDetails />,
  };

  const sessionStorageSetHandler = (e) => {
    setLoadingText(JSON.parse(e.value));
  };
  document.addEventListener("itemInserted", sessionStorageSetHandler, false);

  return (
    <div>
      {loading ? <LoadingOverlay text={loadingText} /> : <></>}
      <PageToggle
        selectedTab={setSelectedTab}
        tabs={{
          one: "Swap",
          two: "Stake"
          // three: "Pool"
        }}
      ></PageToggle>
      {Tabs[selectedTab]}
    </div>
  );
}
