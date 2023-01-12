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
import Holdings from "../components/Holdings";
import algoLogo from "../assets/icons/algorand_logo_mark_black_small.png";
import gardLogo from "../assets/icons/gardlogo_icon_small.png";
import { getAlgoGovAPR } from "../components/Positions";
import { device } from "../styles/global";
import { eligible } from "../assets/eligible_referrers";
import PrimaryButton from "../components/PrimaryButton";

const tabs = {
  one: <Holdings />,
  two: <TransactionHistory />,
};

function RefButton({navFunc}){
  if (getWallet().address in eligible){
    return <PrimaryButton 
    text={"View Referrals"}
    blue={true}
    onClick={navFunc}></PrimaryButton>
  }
  return <></>
}

/**
 * Content for the wallet navigation option
 */
export default function AccountContent() {
  const walletAddress = useSelector((state) => state.wallet.address);
  const navigate = useNavigate();
  const [acctInfo, setAcctInfo] = useState(null);
  const [balance, setBalance] = useState("...");
  const [rewards, setRewards] = useState(0);
  const [selectedTab, setSelectedTab] = useState("one");
  const [currentPrice, setPrice] = useState("Loading...");

  const prices = {
    algo: currentPrice,
  };

  const convertToDollars = (amt, idx) => formatToDollars(amt * prices[idx]);

  useEffect(async () => {
    let apr = await getAlgoGovAPR();
    let price = await getPrice();
    // setAPR(apr);
    setPrice(price);
  }, []);
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
    // setPendingRewards(
    //   (getWalletInfo()["pending-rewards"] / 1000000).toFixed(3),
    // );
  }, []);
  useEffect(() => {
    if (!walletAddress) navigate("/");
  }, [walletAddress]);

  // const algoLink = `https://algoexplorer.io/address/${getWallet().address}`;

  if (!walletAddress) return <div></div>;
  return (
    <AcctPgCont>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-evenly",
          alignContent: "center",
        }}
      >
      </div>
      <AccountContainer>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Label>Wallet</Label>
            <br></br>
            <div style={{display: "flex", alignItems: "start"}}>
              <AccountNumber>
                {getWallet() == null
                  ? "N/A"
                  : getWallet().address.slice(0, 10) + "..."}
              </AccountNumber>
              <AccountButton
                onClick={() => navigator.clipboard.writeText(getWallet().address)}
              >
                <img src={copyIconDark} />
              </AccountButton>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Label>Total Balance</Label>
            <br></br>
            <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
            >
              <AccountInfoData>
                {getWallet() == null ? "N/A" : `${balance} ALGO`}
              </AccountInfoData>
              <Dollars>{convertToDollars(balance, "algo")}</Dollars>
            </div>
          </div>
        </div>
      </AccountContainer>
      <div
        style={{
          marginBottom: 8,
        }}
      >
        <AcctPageToggle
          selectedTab={setSelectedTab}
          tabs={{ one: "Holdings", two: "Transactions" }}
          style={{
            marginBottom: 12
          }}
          pageHeader={false}
        />
        {tabs[selectedTab]}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-evenly",
          alignContent: "center",  
          marginBottom: "36px",
        }}
      >
      <RefButton navFunc={() => navigate(`/referrals`)}/>
      </div>
    </AcctPgCont>
  );
}

// syled components for our wallet content

const AcctPgCont = styled.div`
  /* max-width: 90vw; */
  width: 95%;
  margin: auto;
`

const AcctPageToggle = styled(PageToggle)`
  @media (${device.tablet}) {
    max-width: fit-content;
  }
`

const AccountContainer = styled.div`
  background: rgba(13, 18, 39, 0.75);
  border: 1px solid white;
  padding: 5vw 4vw;
  margin-top: 36px;
  margin-bottom: 56px;
  border-radius: 10px;
  @media (${device.mobileL}) {
    max-width: 90vw;
  }
  @media (${device.tablet}) {
    max-width: 90vw;
  }
`;
const AccountTitle = styled.text`
  font-weight: 500;
  font-size: 30px;
`;

const Label = styled.label`
  font-size: 20px;
  color: #ffffff;
  text-decoration: underline;
  margin-bottom: -15px;
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
  font-weight: bold;
  font-size: 16px;
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
`;

const Dollars = styled.text`
  font-weight: normal;
  font-size: 16px;
`;


