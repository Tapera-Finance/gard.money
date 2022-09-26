import React, { useContext, useEffect, useState } from "react";
import styled, { css } from "styled-components";
import PageToggle from "../components/PageToggle";
import SystemMetrics from "../components/SystemMetrics"
import YourMetrics from "../components/YourMetrics";

export default function AnalyticsContent() {
  const [selectedTab, setSelectedTab] = useState("one");

  const Tabs = {
    one: <SystemMetrics />,
    // two: <YourMetrics />,
  };
  const tabs = {
    one: "System Metrics",
    // two: "Your Metrics",
  };
  return (
    <div>
      <PageToggle selectedTab={setSelectedTab} tabs={tabs}/>
      {Tabs[selectedTab]}
    </div>

  );
}
