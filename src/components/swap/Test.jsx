import React, { useState, useEffect } from "react";
import styled, { css } from "styled-components";
import PageToggle from "./PageToggle";
import SwapDetails from "./SwapDetails";
import PoolDetails from "../pool/PoolDetails";
// import { previewPoolSwap } from "./pactClient";
import { getTotals } from "./swapHelpers";
import { Container } from "@mui/material";

export default function Test() {

  const Tabs = {
    swap: <SwapDetails />,
    pool: <PoolDetails />,
  };
  const [selectedTab, setSelectedTab] = useState("swap");
  return (
    <div>
      <Container>
        <PageToggle selectedTab={setSelectedTab} />
        {Tabs[selectedTab]}
      </Container>
    </div>
  );
}
