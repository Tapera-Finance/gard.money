import React from "react";
import styled from "styled-components";
import syncIcon from "../assets/icons/sync_icon.png";
import syncIconWhite from "../assets/icons/sync_icon_white.png";
import AccountCard from "./AccountCard";
import WalletConnect from "./WalletConnect";
import {size, device} from "../styles/global";
/**
 * Bar on top of our main content
 * @prop {string} contentName - name of current content, used as title on the top bar
 * @param {{contentName: string}} props
 */

export default function Topbar({ contentName, setMainContent }) {
  return (
    <div style={{display: "flex"}}>
      <TopBar>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            height: "100%",
            justifyContent: "flex-end"
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
          <div>
          <AccountCard />
          </div>
        </div>
      </TopBar>
    </div>
  );
}

// styled components for topbar



const TopBar = styled.div`
  height: 96px;
  background: #172756;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-left: 36px;
  padding-right: ${window.innerWidth * 0.077}px;
  @media (min-width: ${size.tablet}) {
    width: 50%;
    /* margin-left: 13.88vw; */
  }
  @media (${device.tablet}) {
    width: 100%;
  }
  @media (${device.mobileL}) {
    flex-direction: column;
    align-items: first-baseline;
    margin-left: 25%;
  }
`;
const TopBarText = styled.text`
  font-weight: 500;
  font-size: 20px;
`;
const SimplePressable = styled.div`
  cursor: pointer;
`;
