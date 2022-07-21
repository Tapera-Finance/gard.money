import React, { useState, useEffect, useContext } from "react";
import styled, { css } from "styled-components";
import { formatToDollars } from "../utils";
import Modal from "./Modal";
import PrimaryButton from "./PrimaryButton";
import RadioButtonSet from "./RadioButtonSet";
import Table from "./Table";
import LoadingOverlay from "./LoadingOverlay";
import TransactionSummary from "./TransactionSummary";
import {
  getChainData,
  getCurrentAlgoUsd,
  getCurrentUnix,
} from "../prices/prices";
import { accountInfo } from "../wallets/wallets";
import { validatorID } from "../transactions/ids";
import { liquidate } from "../transactions/cdp";
import { useDispatch } from "react-redux";
import { setAlert } from "../redux/slices/alertSlice";
import { ThemeContext } from "../contexts/ThemeContext";

let chainDataResponse;
let cdp_data_promise = loadDefaulted();
let curr_price = await getCurrentAlgoUsd();
let cdp_data = await cdp_data_promise;

async function loadDefaulted() {
  const chainDataPromise = getChainData();
  const timePromise = getCurrentUnix();
  chainDataResponse = await chainDataPromise;
  let curr_time = await timePromise;
  let result = [];
  const EncodedDebt = "R0FSRF9ERUJU";
  const EncodedTime = "VU5JWF9TVEFSVA==";
  const purchasedCDP = {
    amount: 0,
    cost: 0,
    premium: 0,
  };
  let auction_start;
  let num_defaulted = chainDataResponse["defaulted-cdps"].length;
  let info_array = [];
  let max_results = 100;
  let count = 0;
  for (let i = 0; i < num_defaulted; i++) {
    let debt = 0;
    if (i % 20 == 0) {
      for (let j = i; j < Math.min(num_defaulted, i + 20); j++) {
        info_array.push(accountInfo(chainDataResponse["defaulted-cdps"][j][0]));
      }
    }
    let cdpinfo = await info_array[i];
    if (!cdpinfo.hasOwnProperty("apps-local-state") || cdpinfo.amount == 0) {
      result.push(purchasedCDP);
      continue;
    }
    for (let k = 0; k < cdpinfo["apps-local-state"].length; k++) {
      if (cdpinfo["apps-local-state"][k].id == validatorID) {
        const validatorInfo = cdpinfo["apps-local-state"][k];
        if (validatorInfo.hasOwnProperty("key-value")) {
          // This if statement checks for borked CDPs (first tx = good, second = bad)

          for (let n = 0; n < validatorInfo["key-value"].length; n++) {
            if (validatorInfo["key-value"][n]["key"] == EncodedDebt) {
              debt = validatorInfo["key-value"][n]["value"]["uint"];
            }
            if (validatorInfo["key-value"][n]["key"] == EncodedTime) {
              auction_start = validatorInfo["key-value"][n]["value"]["uint"];
            }
          }
        }
      }
    }
    if (debt == 0) {
      result.push(purchasedCDP);
      continue;
    }
    result.push({
      amount: cdpinfo.amount / 1000000,
      cost: debt / 1000000,
      premium: Math.max(
        (Math.floor((debt * 23) / 20) -
          Math.floor((debt * (curr_time - auction_start)) / 24000) -
          debt) /
          1000000,
        0,
      ),
    });
    count += 1;
    if (count == max_results) {
      break;
    }
  }
  return result;
}

/**
 * Content for the Auctions option on the Drawer
 */
export default function AuctionsContent() {
  const [selected, setSelected] = useState(OPTIONS.LIVE_AUCTIONS);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [transInfo, setTransInfo] = useState([]);
  const [transPremium, setTransPremium] = useState([]);
  const [transId, setTransId] = useState([]);
  const [transOwner, setTransOwner] = useState([]);
  const [transDebt, setTransDebt] = useState([]);
  const [canAnimate, setCanAnimate] = useState(false);
  const dispatch = useDispatch();
  const { theme } = useContext(ThemeContext);

  useEffect(async () => {
    curr_price = await getCurrentAlgoUsd();
    cdp_data = await loadDefaulted();
  }, []);
  var sessionStorageSetHandler = function (e) {
    setLoadingText(JSON.parse(e.value));
  };
  document.addEventListener("itemInserted", sessionStorageSetHandler, false);

  let addresses = chainDataResponse["defaulted-cdps"];
  let defaulted = addresses.map((value, idx) => {
    if (cdp_data[idx] === null || cdp_data[idx] === undefined) {
      return {
        algoAvailable: 0,
        premium: 0,
        debt: 0,
        marketDiscount: 0,
        purchased: true,
        owner: value[1],
        id: value[2],
      };
    }
    return {
      algoAvailable: cdp_data[idx].amount,
      premium: cdp_data[idx].premium,
      debt: cdp_data[idx].cost,
      marketDiscount: (
        100 *
        (1 -
          (cdp_data[idx].cost + cdp_data[idx].premium) /
            (cdp_data[idx].amount * curr_price))
      ).toFixed(1),
      purchased: !(cdp_data[idx].cost > 0),
      owner: value[1],
      id: value[2],
    };
  });
  let open_defaulted = [];
  for (let i = 0; i < defaulted.length; i++) {
    if (defaulted[i].algoAvailable != 0) {
      open_defaulted.push(defaulted[i]);
    }
  }
  if (open_defaulted.length == 0) {
    open_defaulted = dummyLiveAuctions;
  }
  let liveAuctions = open_defaulted.map((value, index) => {
    return {
      algoAvailable: value.algoAvailable,
      costInGard: (value.debt + value.premium).toFixed(2),
      marketDiscount: value.marketDiscount + "%",
      action: value.purchased ? (
        <div style={{ paddingLeft: 18 }}>
          <ButtonAlternateText>{"Purchased"}</ButtonAlternateText>
        </div>
      ) : (
        <PrimaryButton
          text={"Purchase"}
          onClick={() => {
            setTransInfo([
              {
                title: "ALGO for Purchase",
                value: value.algoAvailable,
              },
              {
                title: "Cost in Gard",
                value: (value.debt + value.premium).toFixed(3),
              },
              {
                title: "Market Discount",
                value: value.marketDiscount + "%",
              },
            ]);
            setTransId(value.id);
            setTransOwner(value.owner);
            setTransDebt(value.debt);
            setTransPremium(value.premium);
            setCanAnimate(true);
            setModalVisible(true);
          }}
        />
      ),
    };
  });

  return (
    <div>
      {loading ? <LoadingOverlay text={"Liquidating a CDP..."} /> : <></>}
      <div
        style={{
          maxWidth: window.innerWidth - 0.14 * window.innerWidth,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            paddingLeft: 24,
            marginBottom: 19,
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
            <CountContainer darkToggle={theme === "dark"}>
              <CountText darkToggle={theme === "dark"}>
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
          <div style={{ display: "flex", flexDirection: "row" }}>
            <RadioButtonSet
              titles={[
                OPTIONS.LIVE_AUCTIONS,
                OPTIONS.BIDS,
                OPTIONS.MARKET_HISTORY,
              ]}
              selected={selected}
              callback={(selected) => {
                setSelected(selected);
                setCanAnimate(false);
              }}
            />
          </div>
        </div>
        <Table
          data={
            selected === OPTIONS.LIVE_AUCTIONS
              ? liveAuctions
              : selected === OPTIONS.BIDS
              ? dummyBids
              : dummyMarketHistory
          }
        />
      </div>
      {selected === OPTIONS.BIDS ? (
        <PrimaryButton
          text="Create a Bid"
          onClick={() => {
            setCanAnimate(true);
            setModalVisible(true);
          }}
        />
      ) : (
        <></>
      )}
      <Modal
        visible={modalVisible}
        close={() => setModalVisible(false)}
        animate={canAnimate}
        title={
          selected === OPTIONS.LIVE_AUCTIONS
            ? "Are you sure you want to proceed?"
            : "Enter Bid Details"
        }
        subtitle={
          selected === OPTIONS.LIVE_AUCTIONS
            ? "Review the details of this transaction to the right and click “Confirm Transaction” to proceed."
            : "Enter the details for your bid to the right. If the discount trigger you set is reached, the transaction will be executed automatically using the GARD staked. "
        }
        darkToggle={theme === "dark"}
      >
        {selected === OPTIONS.LIVE_AUCTIONS ? (
          <TransactionSummary
            specifics={transInfo}
            transactionFunc={async () => {
              setCanAnimate(true);
              setModalVisible(false);
              setLoading(true);
              try {
                let res = await liquidate(
                  transId,
                  transOwner,
                  parseInt(transDebt * 1000000),
                  parseInt(transPremium * 1000000),
                );
                if (res.alert) {
                  dispatch(setAlert(res.text));
                }
              } catch (e) {
                alert("Liquidation Failed.");
              }
              setCanAnimate(false);
              setLoading(false);
            }}
            cancelCallback={() => setModalVisible(false)}
          />
        ) : (
          <div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ marginBottom: 13 }}>
                <div style={{ marginBottom: 8 }}>
                  <InputTitle>Discount Trigger</InputTitle>
                  <InputMandatory>*</InputMandatory>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Input placeholder="e.g. 5%" />
                </div>
                <div>
                  <InputSubitle>
                    Bid executed if market discount reaches or exceeds this
                    rate.
                  </InputSubitle>
                </div>
              </div>
              <div style={{ marginBottom: 13 }}>
                <div style={{ marginBottom: 8 }}>
                  <InputTitle>GARD Staked</InputTitle>
                  <InputMandatory>*</InputMandatory>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Input placeholder="e.g. 123 GARD" />
                </div>
                <div>
                  <InputSubitle>
                    Number of tokens you are staking for the bid.
                  </InputSubitle>
                </div>
              </div>
              <div style={{ marginBottom: 13 }}>
                <div style={{ marginBottom: 8 }}>
                  <InputTitle>Bid Expiration</InputTitle>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Input placeholder="select date" />
                </div>
                <div>
                  <InputSubitle>
                    Select the date the bid should expire (optional).
                  </InputSubitle>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <PrimaryButton text="Confirm Transaction" />
              <CancelButton
                style={{ marginLeft: 30 }}
                onClick={() => {
                  setModalVisible(false);
                }}
              >
                <CancelButtonText>Cancel</CancelButtonText>
              </CancelButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// styled components
const Title = styled.text`
  font-weight: 500;
  font-size: 18px;
`;

const CountContainer = styled.div`
  background: #f9f5ff;
  border-radius: 16px;
  padding: 2px 8px;
  ${(props) =>
    props.darkToggle &&
    css`
      background: #404040;
    `}
`;

const CountText = styled.text`
  font-weight: 500;
  font-size: 12px;
  color: #6941c6;
  ${(props) =>
    props.darkToggle &&
    css`
      color: white;
    `}
`;
const InactiveRadio = styled.button`
  background-color: transparent;
  padding: 8px 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 6px;
`;

const InactiveRadioText = styled.text`
  color: #98a2b3;
  font-weight: 500;
  font-size: 16px;
`;
const ButtonAlternateText = styled.text`
  font-weight: 500;
  font-size: 14px;
  color: #7f56d9;
`;
const InputTitle = styled.text`
  font-weight: bold;
  font-size: 16px;
`;
const InputSubitle = styled.text`
  font-weight: normal;
  font-size: 12px;
`;
const Input = styled.input`
  width: 80%;
  height: 44px;
  border: 1px solid #dce1e6;
  padding-left: 12px;
`;
const InputMandatory = styled.text`
  font-weight: bold;
  font-size: 16px;
  color: #ff0000;
`;
const CancelButton = styled.button`
  border: 0px;
  background: transparent;
  display: flex;
  align-items: center;
  height: "100%";
  cursor: pointer;
`;
const CancelButtonText = styled.text`
  font-weight: 500;
  font-size: 16px;
`;

// dummy info for our 3 tables
const dummyLiveAuctions = [
  {
    algoAvailable: "N/A",
    debt: 0,
    premium: 0,
    marketDiscount: "x",
    purchased: true,
  },
];

const dummyBids = [
  {
    discountTrigger: "23%",
    gardStaked: 23.33,
  },
  {
    discountTrigger: "23%",
    gardStaked: 23.33,
  },
  {
    discountTrigger: "23%",
    gardStaked: 23.33,
  },
];

const dummyMarketHistory = [
  {
    accountNumber: "123456",
    algoPurchased: "123.45",
    gardPaid: "123.45",
    executed: "Timestamp by Block ID",
  },
  {
    accountNumber: "123456",
    algoPurchased: "123.45",
    gardPaid: "123.45",
    executed: "Timestamp by Block ID",
  },
  {
    accountNumber: "123456",
    algoPurchased: "123.45",
    gardPaid: "123.45",
    executed: "123456",
  },
];

// options for each tab
const OPTIONS = {
  LIVE_AUCTIONS: "Live Auctions",
  // BIDS: 'Bids',
  // MARKET_HISTORY: 'Market History',
};
