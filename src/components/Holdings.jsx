import React, {useState, useEffect} from "react"
import styled from "styled-components"
import PageToggle from "./PageToggle"
import Table from "./Table";
import { formatToDollars } from "../utils";
import { getCDPs, getPrice } from "../transactions/cdp";
import { getWallet, getWalletInfo} from "../wallets/wallets";
import { CDPsToList } from "../pages/BorrowContent";

const WalletTable = styled(Table)`

`
const BorrowTable = styled(Table)`

`
const SubToggle = styled(PageToggle)`
  float: right;
  background: transparent;
  text {
    text-decoration: unset;
  }
`

const price = await getPrice();

function getAssets() {
  var assets = [];
  let x = getWalletInfo()["assets"];
  for (var i = 0, len = x.length; i < len; i++) {
    if ([684649988, 684649672, 692432647].includes(x[i]["asset-id"])) {
      let amnt = (x[i]["amount"] / 10 ** x[i]["decimals"]).toFixed(3);
      assets.push({
        // id: x[i]["asset-id"],
        name: x[i]["name"],
        amount: amnt,
        value: formatToDollars(parseFloat(amnt) * parseFloat(price)),
      });
    }
  }
  if (assets.length == 0) {
    assets = [
      {
        id: "N/A",
        name: "N/A",
        amount: 0,
      },
    ];
  }
  return assets;
}

const assets = getAssets();
const cdps = CDPsToList()

const holdColumns = ["Asset", "Token Amount", "Token Value"];
const borrowColumns = ["Borrow Positions", "Collateral Amount", "Collateral Value", "Debt Amount", "Net Value"];
const tabs = {
    one: <div>stake</div>,
    two: <WalletTable data={assets} title="Positions" columns={holdColumns} />,
    three: <BorrowTable data={cdps} title="Borrow Positions" columns={borrowColumns} />
}

export default function Holdings() {
    const [currentPrice, setPrice] = useState("Loading...");
    const [selectedTab, setSelectedTab] = useState("one")
    useEffect(async () => {
        let price = await getPrice();
        setPrice(price);
      }, []);
    return (
        <div>
            <SubToggle selectedTab={setSelectedTab} tabs={{one: "Stake", two: "Wallet", three: "Borrow"}} />
            {tabs[selectedTab]}
        </div>
    )
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
