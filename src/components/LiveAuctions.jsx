import React, { useState, useEffect } from "react";
import styled, { css } from "styled-components";
import Table from "./Table";
import { isMobile } from "../utils";

export default function LiveAuctions({
  OPTIONS,
  open_defaulted,
  selected,
  liveAuctions,
  dummyBids,
  dummyMarketHistory,
  dummyLiveAuctions
}) {
  const [mobile, setMobile] = useState(isMobile());
  useEffect(() => {
    setMobile(isMobile());
  }, []);

  return (
    <div
      style={{
        maxWidth: window.innerWidth - 0.14 * window.innerWidth,
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        margin: "auto",
      }}
    >
      <div
        style={{
          height: 70,
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#0E1834",
          border: "1px solid white",
          borderBottom: "none"
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ marginLeft: 25, marginRight: 8 }}>
            <Title mobile={mobile}>
              {selected === OPTIONS.LIVE_AUCTIONS
                ? "Live Auctions"
                : selected === OPTIONS.BIDS
                ? "Bids"
                : "Auction Marketplace Transaction History"}
            </Title>
          </div>
          <CountContainer>
            <CountText mobile={mobile}>
              {selected === OPTIONS.LIVE_AUCTIONS
                ? `${
                    open_defaulted == dummyLiveAuctions
                      ? 0
                      : open_defaulted.length
                  } ${"Live Auctions"}`
                : selected === OPTIONS.BIDS
                ? `${dummyBids.length} ${"Bids"}`
                : `${dummyMarketHistory.length} ${"Auctions"}`}
            </CountText>
          </CountContainer>
        </div>
      </div>
      <AuctionsDiv>
        <AuctionsTable
          data={
            selected === OPTIONS.LIVE_AUCTIONS
              ? liveAuctions
              : selected === OPTIONS.BIDS
              ? dummyBids
              : dummyMarketHistory
          }
        />
      </AuctionsDiv>
    </div>
  );
}

const AuctionsDiv = styled.div`
  border-radius: 10px;
`;

const AuctionsTable = styled(Table)`
  tr {
    background-color: #172756;
    border-top: 3px solid #0f1733;
    border-bottom: 3px solid #0f1733;
    border-radius: 10px;
    border-top: initial;
    padding: 14px;
  }
`;

const Title = styled.text`
  font-weight: 500;
  font-size: 18px;
  ${(props) => props.mobile && css`
  font-size: 16px;
  `}
`;

const CountContainer = styled.div`
  background: #172756;
  border-radius: 16px;
  padding: 2px 8px;
  height: 20px;
`;

const CountText = styled.text`
  font-weight: 500;
  font-size: 12px;
  color: white;
  ${(props) => props.mobile && css`
  font-size: 10px;
  `}  
`;
