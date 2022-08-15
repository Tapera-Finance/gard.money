import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled, { css, keyframes } from "styled-components";
import copyIconDark from "../assets/icons/copy_icon_dark.png";
import linkIconWhite from "../assets/icons/link_icon_white.png";
import { getWallet, getWalletInfo, updateWalletInfo } from "../wallets/wallets";
import Table from "../components/Table";
import PageToggle from "../components/PageToggle";
import { formatToDollars } from "../utils";
import { getPrice } from "../transactions/cdp";
import TransactionHistory from "../components/TransactionHistory";
import AccountCard from "../components/AccountCard";



function getAssets() {
  var assets = [];
  let x = getWalletInfo()["assets"];
  for (var i = 0, len = x.length; i < len; i++) {
    if ([684649988, 684649672, 692432647].includes(x[i]["asset-id"])) {
      assets.push({
        id: x[i]["asset-id"],
        name: x[i]["name"],
        amount: (x[i]["amount"] / 10 ** x[i]["decimals"]).toFixed(3),
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

const assets = getAssets()

const Holdings = styled(Table)`
  /*  */
`

const tabs = {
  one: <Holdings data={assets} title="Holdings and Positions" />,
  two: <TransactionHistory />,
};

/**
 * Content for the wallet navigation option
 */
export default function AccountContent() {
  const walletAddress = useSelector((state) => state.wallet.address);
  const navigate = useNavigate();
  const [acctInfo, setAcctInfo] = useState(null);
  const [balance, setBalance] = useState("...");
  const [rewards, setRewards] = useState("...");
  const [selectedTab, setSelectedTab] = useState("one");
  const [pendingRewards, setPendingRewards] = useState("...");
  const [currentPrice, setPrice] = useState("Loading...");

  const prices = {
    algo: currentPrice
  }

  const convertToDollars = (amt, idx) =>
  formatToDollars(amt * prices[idx]);

  useEffect(() => {
    const interval = setInterval(() => {
      getPrice().then((val) => {
        const num = val;
        const algoprice = num.toFixed(5);
        setPrice(algoprice);
      });
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(async () => {
    await updateWalletInfo();
    getWallet();
    setAcctInfo(getWalletInfo());
    setBalance((getWalletInfo()["amount"] / 1000000).toFixed(3));
    setRewards((getWalletInfo()["rewards"] / 1000000).toFixed(3));
    setPendingRewards(
      (getWalletInfo()["pending-rewards"] / 1000000).toFixed(3),
    );
  }, []);
  useEffect(() => {
    if (!walletAddress) navigate("/");
  }, [walletAddress]);
  const algoLink = `https://algoexplorer.io/address/${getWallet().address}`;
  let assets = dummyAssets.map((value, index) => {
    return {
      ...value,
      amount: `${value.amount}`,
    };
  });

  if (!walletAddress) return <div></div>;
  return (
    <div>
      <AccountCard />
      <div style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignContent: "center"
      }} >
        <Label>Wallet</Label>
        <Label>Rewards</Label>
        <Label>Total Balance</Label>
      </div>
      <AccountContainer>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >

          <div>

              <AccountNumber>
                {getWallet() == null ? "N/A" : getWallet().address.slice(0, 9) + '...'}
              </AccountNumber>

            <AccountButton
              onClick={() => navigator.clipboard.writeText(getWallet().address)}
            >
              <img src={copyIconDark} />
            </AccountButton>
          </div>
            <div style={{
              display: "flex",
              flexDirection: "column",
              marginBottom: window.innerWidth < 900 ? 5 : 15 }}>
                <AccountInfoData>
                  {getWallet() == null ? "N/A" : `${balance} Algos`}
                </AccountInfoData>
                <Dollars>{convertToDollars(balance, "algo")}</Dollars>
              </div>


        </div>
        <div
          style={{
            display: "flex",
            flexDirection: window.innerWidth < 900 ? "column" : "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >

          {window.innerWidth < 900 ? (
            <LinkButton
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 15,
              }}
              onClick={() => {
                window.open(algoLink);
              }}
            >

              <div style={{ paddingRight: 15 }}>

                <LinkButtonText>
                  View Account on Algo Explorer
                </LinkButtonText>
              </div>
              <div>
                <img src={linkIconWhite} alt="link-icon-white" />
              </div>
            </LinkButton>
          ) : (
            <></>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: window.innerWidth < 900 ? "column" : "row",
              justifyContent: "space-between",
              width: "60%",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: window.innerWidth < 900 ? "row" : "column",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div style={{ marginBottom: window.innerWidth < 900 ? 5 : 15 }}>
                <AccountInfoTitle>Balance</AccountInfoTitle>
              </div>

            </div>
            <div
              style={{
                display: "flex",
                flexDirection: window.innerWidth < 900 ? "row" : "column",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div style={{ marginBottom: window.innerWidth < 900 ? 5 : 15 }}>
                <AccountInfoTitle>Status</AccountInfoTitle>
              </div>
              <div style={{ marginBottom: window.innerWidth < 900 ? 5 : 15 }}>
                <AccountInfoData>
                  {getWallet() == null ? "N/A" : getWalletInfo()["status"]}
                </AccountInfoData>
              </div>
            </div>
          </div>
          {window.innerWidth >= 900 ? (
            <LinkButton
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
              onClick={() => {
                window.open(algoLink);
              }}
            >
              <div style={{ paddingRight: 15 }}>
                <LinkButtonText>
                  View Account on Algo Explorer
                </LinkButtonText>
              </div>
              <div>
                <img src={linkIconWhite} alt="link-icon-white" />
              </div>
            </LinkButton>
          ) : (
            <></>
          )}
        </div>
      </AccountContainer>
      <div
        style={{
          maxWidth: window.innerWidth - 0.14 * window.innerWidth,
          overflow: "auto",
        }}
      >
        <PageToggle selectedTab={setSelectedTab} tabs={{one: "Holdings", two: "Transactions"}} />
        {tabs[selectedTab]}
      </div>
    </div>
  );
}

// syled components for our wallet content

const AccountContainer = styled.div`
  background: rgba(13, 18, 39, .75);
  padding: 5vw 4vw;
  margin-top: 36px;
  margin-bottom: 56px;
  border-radius: 10px;
`
const AccountTitle = styled.text`
  font-weight: 500;
  font-size: 30px;
`;

const Label = styled.label`
  font-size: 22px;
  color: #ffffff;
  margin-left: 15px;
  margin-bottom: -20px;
  /* margin-bottom: */
`;

const CopyButton = styled.button`
  background: transparent;
  border-width: 0;
  cursor: pointer;
`;
const AccountNumber = styled.text`
  font-weight: normal;
  font-size: 16px;
`;

const AccountButton = styled.button`
  background: transparent;
  border-width: 0;
  cursor: pointer;
`;

const AccountInfoTitle = styled.text`
  font-weight: 500;
  font-size: 20px;
`;

const AccountInfoData = styled.text`
  font-weight: normal;
  font-size: 20px;
`;
const LinkButton = styled.button`
  height: 20px;
  border-width: 0;
  background-color: transparent;
  cursor: pointer;
`;

const LinkButtonText = styled.text`
  font-size: 16px;
  font-weight: 500;
  color: #7c52ff;
`

const Dollars = styled.text`
  font-weight: normal;
  font-size: 16px;
`

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
