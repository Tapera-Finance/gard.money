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
import { getNLStake } from "./actions/StakeDetails";
import { getAccruedRewards } from "../transactions/stake";
import { algo } from "crypto-js";

function getAssets(alg_price) {
  var assets = [];
  let x = getWalletInfo()["assets"];
  for (var i = 0, len = x.length; i < len; i++) {
    if ([ids.asa.gard, ids.asa.gain, ids.asa.gardian, ids.asa.galgo].includes(x[i]["asset-id"])) {
      let amnt = (x[i]["amount"] / 10 ** x[i]["decimals"]);
      let token_price = x[i]["asset-id"] == ids.asa.gard ? 1 : 0;
      token_price = x[i]["asset-id"] == ids.asa.galgo ? (0.98*alg_price) : token_price;
      assets.push({
        name: x[i]["name"],
        amount: amnt,
        value: parseFloat(amnt * token_price).toFixed(3),
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
const user_assets = getAssets(algo_price);
let transformed_assets = getAssets(algo_price).map((x) => {
  let temp = x;
  temp.value = formatToDollars(x["value"]);
  return temp;
}); // For some reason using user_assets here instead if another getAssets call breaks things, TODO optimize
const walletTotal = accumulateTotal(user_assets, "value");

export default function Holdings() {
  const [borrowTotal, setBorrowTotal] = useState("0");
  const [stakeTotal, setStakeTotal] = useState("0");

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
  const stakeColumns = [
    "Pool Type",
    "Token",
    "Stake Value"
  ];

  useEffect(() => {
    let netBorrowSum = accumulateTotal(cdps, "collateral");
    let netBorrowDebt = accumulateTotal(cdps, "debt");
    setBorrowTotal(((netBorrowSum*algo_price) - netBorrowDebt) / 1e6);
  }, []);

  useEffect(async () => {
    let accruePromise = getAccruedRewards("NL")
    let noLock = getNLStake()
    setStakeTotal((noLock / 1000000 + parseFloat((await accruePromise) / 1000000)).toString())
  }, []);

  const [currentPrice, setPrice] = useState("Loading...");
  const [selectedTab, setSelectedTab] = useState("one");

  const tabs = {
    // one: <div>stake</div>,
    one: (
      <div style={{marginTop: 20}}>
      <TableHeading>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
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
              one: "Wallet",
              two: "Borrows",
              three: "Stakes",
            }}
          />
        </div>
      </TableHeading>
          <HoldTable
          data={transformed_assets}
          columns={holdColumns}
        />
      </div>
    ),
    two: (
      <div style={{marginTop: 20}}>
      <TableHeading
      >
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
          <div style={{ marginLeft: 25, marginRight: 8 }}>
            <Title>Borrow Positions {`(${formatToDollars(borrowTotal.toString())} Total Value)`}</Title>
          </div>
          <CountContainer>
            <CountText>{(cdpData.length).toString() + ' Position'}{cdpData.length != 1 ? 's' : ''}</CountText>
          </CountContainer>
        </div>
        <div style={{ marginRight: 20 }}>
          <SubToggle
            selectedTab={setSelectedTab}
            tabs={{
              one: "Wallet",
              two: "Borrows",
              three: "Stakes",
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
    three: (
      <div style={{marginTop: 20}}>
      <TableHeading>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
          <div style={{ marginLeft: 25, marginRight: 8 }}>
            <Title>Stake Positions {`(${formatToDollars((stakeTotal).toString())} Total Value)`}</Title>
          </div>
          <CountContainer>
            <CountText>GARD pools only</CountText>
          </CountContainer>
        </div>
        <div style={{ marginRight: 20 }}>
          <SubToggle
            selectedTab={setSelectedTab}
            tabs={{
              one: "Wallet",
              two: "Borrows",
              three: "Stakes",
            }}
          />
        </div>
      </TableHeading>
          <HoldTable
          data={[
              {
                "Pool Type": "No-Lock",
                "Token": "GARD",
                "Stake Value": formatToDollars(stakeTotal)
              }]
          }
          columns={stakeColumns}
        />
      </div>
    ),
  };

  return (
    <div>
      {tabs[selectedTab]}
    </div>
  );
}

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
  height: 70px;
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
