import React from "react";
import styled from "styled-components";
import Table from "./Table";

export default function LiveAuctions({
  OPTIONS,
  open_defaulted,
  selected,
  liveAuctions,
  dummyBids,
  dummyMarketHistory,
  dummyLiveAuctions
}) {
  return (
    <div
      style={{
        maxWidth: window.innerWidth - 0.14 * window.innerWidth,
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        border: "1px solid #80edff",
        borderRadius: 10,
        background: "#0f1733",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: 24,
          marginBottom: 19,
          marginTop: 19,
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ marginRight: 8 }}>
            <Title>
              {selected === OPTIONS.LIVE_AUCTIONS
                ? "Live Auctions"
                : selected === OPTIONS.BIDS
                ? "Bids"
                : "Auction Marketplace Transaction History"}
            </Title>
          </div>
          <CountContainer>
            <CountText>
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
  background-color: #0f1733;
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
`;

const CountContainer = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 2px 8px;
`

const CountText = styled.text`
  font-weight: 500;
  font-size: 12px;
  color: #999696;
`
