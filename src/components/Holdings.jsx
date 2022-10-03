import React, { useState, useEffect } from "react";
import styled from "styled-components";
import PageToggle from "./PageToggle";
import Table from "./Table";
import { formatToDollars } from "../utils";
import { getCDPs, getPrice } from "../transactions/cdp";
import { getWallet, getWalletInfo } from "../wallets/wallets";
import { CDPsToList } from "../pages/BorrowContent";

const WalletTable = styled(Table)`
  margin-top: 12px;
`;
const BorrowTable = styled(Table)`
  margin-top: 12px;
`;
const SubToggle = styled(PageToggle)`
  float: right;
  background: transparent;
  margin-bottom: 6px;
  text {
    text-decoration: unset;
  }
`;

const price = await getPrice();

function getAssets() {
  var assets = [];
  let x = getWalletInfo()["assets"];
  for (var i = 0, len = x.length; i < len; i++) {
    if ([684649988, 684649672, 692432647].includes(x[i]["asset-id"])) {
      let amnt = (x[i]["amount"] / 10 ** x[i]["decimals"]).toFixed(3);
      let token_price = x[i]["asset-id"] == 684649988 ? 1 : 0;
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

  const assets = getAssets();
  const cdps = CDPsToList();
  const cdpData = cdps.map((cdp, i) => {
    console.log(cdp)
    return {
      id: i + 1,
      liquidationPrice: cdp.liquidationPrice,
      collateral: formatToDollars((algo_price*cdp.collateral).toString(), true),
      debt: formatToDollars(cdp.debt.toString(), true),
      committed: cdp.committed
    }
  })

  const holdColumns = ["Asset", "Token Amount", "Token Value"];
  const borrowColumns = [
    "Borrow Positions",
    "Liquidation Price",
    "Collateral Value",
    "Debt Amount",
    "Committed",
  ];

  useEffect(() => {
    let walletSum = accumulateTotal(assets, "value");
    let netBorrowSum = accumulateTotal(cdps, "collateral");
    let netBorrowDebt = accumulateTotal(cdps, "debt");
    setWalletTotal(walletSum);
    setBorrowTotal(((netBorrowSum*algo_price) - netBorrowDebt) / 1e6);
  }, []);

  const tabs = {
    // one: <div>stake</div>,
    one: (
      <WalletTable
        data={getAssets().map((x) => {
          let temp = x;
          temp.value = formatToDollars(x["value"]);
          return temp;
        })}
        title="Wallet"
        subtitle={`(${formatToDollars(walletTotal.toString())} Total Value)`}
        countSubtitle={"LP Tokens excluded"}
        columns={holdColumns}
      />
    ),
    two: (
      <BorrowTable
        data={cdpData}
        title="Borrow Positions"
        subtitle={`(${formatToDollars(borrowTotal.toString())}) Total Value`}
        columns={borrowColumns}
      />
    ),
  };

  const [currentPrice, setPrice] = useState("Loading...");
  const [selectedTab, setSelectedTab] = useState("one");
  useEffect(async () => {
    let price = await getPrice();
    setPrice(price);
  }, []);
  return (
    <div>
      <SubToggle
        selectedTab={setSelectedTab}
        tabs={{
          // one: "Stake",
          one: "Wallet",
          two: "Borrows",
        }}
      />
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
