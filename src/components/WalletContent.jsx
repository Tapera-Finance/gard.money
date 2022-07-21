import { get } from "jquery";
import React, { useEffect, useState, useContext } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import copyIcon from "../assets/icons/copy_icon.png";
import copyIconDark from "../assets/icons/copy_icon_dark.png";
import copyIconSmall from "../assets/icons/copy_icon_small.png";
import copyIconSmallDark from "../assets/icons/copy_icon_small_dark.png";
import linkIcon from "../assets/icons/link_icon.png";
import linkIconWhite from "../assets/icons/link_icon_white.png";
import { getWallet, getWalletInfo, updateWalletInfo } from "../wallets/wallets";
import Table from "./Table";
import { ThemeContext } from "../contexts/ThemeContext";
import { css } from "styled-components";

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

/**
 * Content for the wallet navigation option
 */
export default function WalletContent() {
  const walletAddress = useSelector((state) => state.wallet.address);
  const navigate = useNavigate();
  const [balance, setBalance] = useState("...");
  const [rewards, setRewards] = useState("...");
  const [pendingRewards, setPendingRewards] = useState("...");
  const { theme } = useContext(ThemeContext);

  useEffect(async () => {
    await updateWalletInfo();
    getWallet();
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
      <AccountContainer darkToggle={theme === "dark"}>
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
            <AccountTitle>Account</AccountTitle>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ marginRight: 20 }}>
              <AccountNumber>
                {getWallet() == null ? "N/A" : getWallet().address}
              </AccountNumber>
            </div>
            <AccountButton
              onClick={() => navigator.clipboard.writeText(getWallet().address)}
            >
              {theme === "light" ? (
                <img src={copyIcon} />
              ) : (
                <img src={copyIconDark} />
              )}
            </AccountButton>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: window.innerWidth < 900 ? "column" : "row",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ marginBottom: window.innerWidth < 900 ? 5 : 15 }}>
              <AccountInfoTitle>Balance</AccountInfoTitle>
            </div>
            <div style={{ marginBottom: window.innerWidth < 900 ? 10 : 0 }}>
              <AccountInfoData>
                {getWallet() == null ? "N/A" : `${balance} Algos`}
              </AccountInfoData>
            </div>
          </div>
          <div>
            <div style={{ marginBottom: window.innerWidth < 900 ? 5 : 15 }}>
              <AccountInfoTitle>Rewards</AccountInfoTitle>
            </div>
            <div style={{ marginBottom: window.innerWidth < 900 ? 10 : 0 }}>
              <AccountInfoData>
                {getWallet() == null ? "N/A" : `${rewards} Algos`}
              </AccountInfoData>
            </div>
          </div>
          <div>
            <div style={{ marginBottom: window.innerWidth < 900 ? 5 : 15 }}>
              <AccountInfoTitle>Pending Rewards</AccountInfoTitle>
            </div>
            <div style={{ marginBottom: window.innerWidth < 900 ? 10 : 0 }}>
              <AccountInfoData>
                {getWallet() == null ? "N/A" : `${pendingRewards} Algos`}
              </AccountInfoData>
            </div>
          </div>
          <div>
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
        <div style={{ display: "flex", flexDirection: "row", marginTop: 20 }}>
          {theme === "light" ? (
            <img src={linkIcon} alt="link-icon" />
          ) : (
            <img src={linkIconWhite} alt="link-icon-white" />
          )}
          <Link
            href={algoLink}
            target="_blank"
            style={{ paddingLeft: 5 }}
            darkToggle={theme === "dark"}
          >
            {" "}
            View Account on Algo Explorer{" "}
          </Link>
        </div>
      </AccountContainer>
      <div
        style={{
          maxWidth: window.innerWidth - 0.14 * window.innerWidth,
          overflow: "auto",
        }}
      >
        <Table data={assets} title="Assets" />
      </div>
    </div>
  );
}

// syled components for our wallet content
const AccountContainer = styled.div`
  background: #f4ebff;
  padding: 5vw 4vw;
  margin-bottom: 56px;
  ${(props) =>
    props.darkToggle &&
    css`
      background: #404040;
    `}
`;
const AccountTitle = styled.text`
  font-weight: 500;
  font-size: 30px;
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
const Link = styled.a`
  text-decoration: none;
  font-weight: 500;
  color: black;
  ${(props) =>
    props.darkToggle &&
    css`
      color: #99b2ff;
    `}
`;

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

/*
{
    id: '123456788',
    name: 'Lorem ipsum',
    amount: 0,
    creator: 'ORAAHFJKLWASASD',
    frozen: false,
  },
  {
    id: '123456788',
    name: 'Lorem ipsum',
    amount: 0,
    creator: 'ORAAHFJKLWASASD',
    frozen: false,
  },
*/
