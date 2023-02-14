import React, { useState, useEffect } from "react";
import styled, { css } from "styled-components";
import syncIcon from "../assets/icons/sync_icon.png";
import syncIconWhite from "../assets/icons/sync_icon_white.png";
import AccountCard from "./AccountCard";
import {size, device} from "../styles/global";
import { isMobile } from "../utils";
/**
 * Bar on top of our main content
 * @prop {string} contentName - name of current content, used as title on the top bar
 * @param {{contentName: string}} props
 */

export default function TopBar({ contentName }) {
  const [mobile, setMobile] = useState(isMobile());
  const accountPage = contentName == "Account";
  useEffect(() => {
    setMobile(isMobile());
  }, []);

  return (
      <TopBarDiv id="TopBar" mobile={mobile} accountPage={accountPage}>
        {mobile ? <></> : <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            height: "100%",
            justifyContent: "flex-end",
            marginLeft: "5%",
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
        <AccountCard contentName={contentName}/>
      </TopBarDiv>
  );
}

// styled components for topbar



const TopBarDiv = styled.div`
  background: #172756;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 2%;
  margin-bottom: 2.5%;
  ${(props) => props.mobile && css`
    flex-direction: column;
    padding: 0px;
  `}
  ${(props) => !props.mobile && css`
    width: 100%;
  `}
`;
const TopBarText = styled.text`
  font-weight: 500;
  font-size: 20px;
`;
const SimplePressable = styled.div`
  cursor: pointer;
`;
