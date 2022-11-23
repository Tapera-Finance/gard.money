import React, { useState, useEffect } from "react";
import styled from "styled-components";
import PageToggle from "./PageToggle";
import Table from "./Table";
import { formatToDollars } from "../utils";
import { getPrice } from "../transactions/cdp";
import { getWallet, getWalletInfo } from "../wallets/wallets";
import { CDPsToList } from "./Positions";
import { ids } from "../transactions/ids"
import { device } from "../styles/global";
import { isMobile } from "../utils";



const price = await getPrice();

function getAssets() {
  var assets = [];
  let x = getWalletInfo()["assets"];
  for (var i = 0, len = x.length; i < len; i++) {
    if ([ids.asa.gard, ids.asa.gain, ids.asa.gardian, ids.asa.galgo].includes(x[i]["asset-id"])) {
      let amnt = (x[i]["amount"] / 10 ** x[i]["decimals"]).toFixed(3);
      let token_price = x[i]["asset-id"] == ids.asa.gard ? 1 : 0;
      assets.push({
        name: x[i]["name"],
        amount: amnt,
        value: parseFloat(amnt) * token_price,
      });
    }
  }
  if (assets.length == 0) {
    assets = [
      {
        id: "N/A",
        name: "N/A",
        amount: 0,
        value: 0,
      },
    ];
  }
  return assets;
}

const accumulateTotal = (arr, prop) => {
  return arr.reduce((acc, curr) => {
    return acc + parseFloat(curr[prop]);
  }, 0);
};

let algo_price = await getPrice();

export default function Holdings() {
  const [walletTotal, setWalletTotal] = useState(0);
  const [borrowTotal, setBorrowTotal] = useState(0);

  const cdps = CDPsToList();
  const cdpData = cdps.map((cdp, i) => {
    console.log(cdp)
    return {
      id: i + 1,
      liquidationPrice: cdp.liquidationPrice,
      collateral: formatToDollars((algo_price*cdp.collateral).toString(), true),
      debt: formatToDollars(cdp.debt.toString(), true),
      net: formatToDollars((algo_price*cdp.collateral) - (cdp.debt), true),
    }
  })

  const holdColumns = ["Asset", "Token Amount", "Token Value"];
  const borrowColumns = [
    "Borrow Positions",
    "Liquidation Price",
    "Collateral Value",
    "Debt Amount",
    "Net Value"
  ];

  useEffect(() => {
    let walletSum = accumulateTotal(getAssets(), "value");
    let netBorrowSum = accumulateTotal(cdps, "collateral");
    let netBorrowDebt = accumulateTotal(cdps, "debt");
    setWalletTotal(walletSum);
    setBorrowTotal(((netBorrowSum*algo_price) - netBorrowDebt) / 1e6);
  }, []);

  const [currentPrice, setPrice] = useState("Loading...");
  const [selectedTab, setSelectedTab] = useState("one");

  const tabs = {
    // one: <div>stake</div>,
    one: (
      <div style={{marginTop: 20}}>
      <TableHeading>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ marginLeft: 25, marginRight: 8 }}>
            <Title>Wallet {`(${formatToDollars(walletTotal.toString())} Total Value)`}</Title>
          </div>
          <CountContainer>
            <CountText>LP Tokens excluded</CountText>
          </CountContainer>
        </div>
        <div style={{ marginRight: 20 }}>
          <SubToggle
            selectedTab={setSelectedTab}
            tabs={{
              // one: "Stake",
              one: "Wallet",
              two: "Borrows",
            }}
          />
        </div>
      </TableHeading>
          <HoldTable
          data={getAssets().map((x) => {
            let temp = x;
            temp.value = formatToDollars(x["value"]);
            return temp;
          })}
          columns={holdColumns}
        />
      </div>
    ),
    two: (
      <div style={{marginTop: 20}}>
      <TableHeading
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ marginLeft: 25, marginRight: 8 }}>
            <Title>Borrow Positions {`(${formatToDollars(borrowTotal.toString())} Total Value)`}</Title>
          </div>
          <CountContainer>
            <CountText>{`${cdpData.length} Borrow Positions`}</CountText>
          </CountContainer>
        </div>
        <div style={{ marginRight: 20 }}>
          <SubToggle
            selectedTab={setSelectedTab}
            tabs={{
              // one: "Stake",
              one: "Wallet",
              two: "Borrows",
            }}
          />
        </div>
      </TableHeading>
      <BorrowTable
        data={cdpData}
        columns={borrowColumns}
      />
      </div>
    ),
  };


  useEffect(async () => {
    let price = await getPrice();
    setPrice(price);
  }, []);
  return (
    <div>
      {tabs[selectedTab]}
    </div>
  );
}

// dummy data for the assets table
var dummyAssets =
  getWallet() == null
    ? [
        {
          id: "N/A",
          name: "N/A",
          amount: 0,
        },
      ]
    : getAssets();

const Title = styled.text`
  font-weight: 500;
  font-size: 18px;
`;

const CountContainer = styled.div`
  background: #172756;
  border-radius: 16px;
  padding: 2px 8px;
  height: ${`${isMobile() ? "min-content" : "unset"}`};
  align-self: ${`${isMobile() ? "center" : "unset"}`};
  /* height: 20px; */
`;

const CountText = styled.text`
  font-weight: 500;
  font-size: 12px;
  color: white;
`;

const SubToggle = styled(PageToggle)`
  float: right;
  background: transparent;
  margin-bottom: 6px;
  text {
    text-decoration: unset;
  }
  @media (${device.tablet}) {
    flex-direction: column;
    transform: scale(0.9);
  }
  @media (${device.mobileL}) {
    flex-direction: column;
    transform: scale(0.8);

  }
`;

const HoldTable = styled(Table)`
  @media (${device.tablet}) {
    transform: scale(0.9);
    margin-top: -18px;
  }
  @media (${device.mobileL}) {
    transform: scale(0.9), translateX(-30px);
    margin-top: -18px;

  }
`

const BorrowTable = styled(Table)`
  @media (${device.tablet}) {
    transform: scale(0.9);
    margin-top: -18px;
  }
  @media (${device.mobileL}) {
    transform: scale(0.9), translateX(-30px);
    margin-top: -18px;
    overflow-x: auto;
  }
`

const TableHeading = styled.div`
  border-top-right-radius: 10px;
  border-top-left-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #0E1834;
  border: 1px solid white;
  border-bottom: none;
  @media (${device.tablet}) {
    transform: scale(0.9);
  }
`
