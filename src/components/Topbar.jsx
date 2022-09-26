import React from "react";
import styled from "styled-components";
import syncIcon from "../assets/icons/sync_icon.png";
import syncIconWhite from "../assets/icons/sync_icon_white.png";
import AccountCard from "./AccountCard";
import WalletConnect from "./WalletConnect";
/**
 * Bar on top of our main content
 * @prop {string} contentName - name of current content, used as title on the top bar
 * @param {{contentName: string}} props
 */

export default function Topbar({ contentName, setMainContent }) {
  return (
    <div >
      <TopBar
        style={{
          backgroundColor: "#172756",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: 36,
          paddingRight: window.innerWidth * 0.077,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            height: "100%",
          }}
        >
          <div style={{ marginRight: 9 }}>
            <TopBarText>{contentName}</TopBarText>
          </div>
          <SimplePressable
            style={{ display: "flex", justifyContent: "center" }}
            onClick={() => window.location.reload()}
          >
            <img src={syncIconWhite} style={{ height: 24 }} alt="sync-white" />
          </SimplePressable>
        </div>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ paddingRight: 20 }}></div>
          <AccountCard />
        </div>
      </TopBar>
    </div>
  );
}

// styled components for topbar
const TopBar = styled.div`
  height: 96px;
  background: #f9fafb;
`;
const TopBarText = styled.text`
  font-weight: 500;
  font-size: 20px;
`;
const SimplePressable = styled.div`
  cursor: pointer;
`;
