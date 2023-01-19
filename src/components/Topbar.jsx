import React, { useState, useEffect } from "react";
import styled, { css } from "styled-components";
import syncIcon from "../assets/icons/sync_icon.png";
import syncIconWhite from "../assets/icons/sync_icon_white.png";
import AccountCard from "./AccountCard";
import WalletConnect from "./WalletConnect";
import {size, device} from "../styles/global";
import { isMobile } from "../utils";
/**
 * Bar on top of our main content
 * @prop {string} contentName - name of current content, used as title on the top bar
 * @param {{contentName: string}} props
 */

export default function Topbar({ contentName }) {
  const [mobile, setMobile] = useState(isMobile());
  const accountPage = contentName == "Account"
  useEffect(() => {
    setMobile(isMobile())
  }, [])

  return (
    <div style={{display: "flex", justifyContent: `${mobile ? "center" : ""}`}}>
      <TopBar mobile={mobile} accountPage={accountPage}>
        {mobile ? <></> : <div
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
        </div>}
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div>
          <AccountCard contentName={contentName}/>
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
  padding-right: ${window.innerWidth * 0.057}px;

  ${(props) => props.mobile && css`
    flex-direction: column;
    padding: 0px;
    height: 50px;
    align-items: center;
    margin-top: 10px;
  `}
  ${(props) => props.mobile && props.accountPage && css`
    height: 60px;
  `}
  @media (min-width: ${size.tablet}) {
    width: 100%;
    margin-left: 2.88vw;
  }
  @media (${device.tablet}) {
    width: 100%;
  }
`;
const TopBarText = styled.text`
  font-weight: 500;
  font-size: 20px;
  @media (${device.tablet}) {
    margin: 4px 0px 12px 0px;
  }
`;
const SimplePressable = styled.div`
  cursor: pointer;
`;
