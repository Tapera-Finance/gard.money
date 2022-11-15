import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import { formatToDollars } from "../utils";
import Modal from "../components/Modal";
import PrimaryButton from "../components/PrimaryButton";
import RadioButtonSet from "../components/RadioButtonSet";
import Table from "../components/Table";
import LoadingOverlay from "../components/LoadingOverlay";
import TransactionSummary from "../components/TransactionSummary";
import LiveAuctions from "../components/LiveAuctions";
import PageToggle from "../components/PageToggle";
import {
  getChainData,
  getCurrentAlgoUsd,
} from "../prices/prices";
import { accountInfo } from "../wallets/wallets";
import { ids } from "../transactions/ids";
import { start_auction, liquidate } from "../transactions/liquidation";
import { getAllCDPs } from "../transactions/cdp";
import { setAlert } from "../redux/slices/alertSlice";

let chainDataResponse;
let cdp_data_promise = loadDefaulted();
let curr_price = await getCurrentAlgoUsd();
let cdp_data = await cdp_data_promise;

async function loadDefaulted() {
  const allCDPs = await getAllCDPs();
  return allCDPs.filter(cdp => (cdp.ratio <= 115 || cdp.activeAuction) && cdp.collateralID == 0)
}

/**
 * Content for the Auctions option on the Drawer
 */
export default function AuctionsContent() {
  const walletAddress = useSelector(state => state.wallet.address);
  const [selected, setSelected] = useState(OPTIONS.LIVE_AUCTIONS);
  const [selectedTab, setSelectedTab] = useState("one")
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [transInfo, setTransInfo] = useState([]);
  const [transCDP, setTransCDP] = useState(null);
  const [transType, setTransType] = useState(null);
  const [canAnimate, setCanAnimate] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!walletAddress) navigate("/");
  }, [walletAddress]);

  useEffect(async () => {
    curr_price = await getCurrentAlgoUsd();
    cdp_data = await loadDefaulted();
  }, []);
  var sessionStorageSetHandler = function (e) {
    setLoadingText(JSON.parse(e.value));
  };
  document.addEventListener("itemInserted", sessionStorageSetHandler, false);

  let defaulted = cdp_data.map((cdp) => {
    return {
      collateralAvailable: cdp.collateralAmount,
      premium: cdp.premium,
      debt: cdp.gard_owed,
      marketDiscount: cdp.activeAuction ? (curr_price*cdp.collateralAmount - (cdp.gard_owed*1e6 + cdp.premium))/(curr_price*cdp.collateralAmount) : 
      (curr_price*cdp.collateralAmount - (cdp.gard_owed*1e6))/(curr_price*cdp.collateralAmount),
      owner: cdp.owner,
      id: cdp.id,
      collateralType: cdp.collateralID == 0 ? "ALGO": "galgo",
      cdp: cdp
    };
  });
  let liveAuctions = defaulted.map((value, index) => {
    return {
      collateralAvailable: value.collateralAvailable / 1000000,
      collateralType: value.collateralType,
      costInGard: (value.debt + value.premium).toFixed(2),
      marketDiscount: value.cdp.activeAuction ? (100*value.marketDiscount).toFixed(2) + "%" : "Max " + (100*value.marketDiscount).toFixed(2) + "%",
      action: value.cdp.activeAuction ? (
        <PrimaryButton
          text={"Purchase"}
          onClick={() => {
            setTransInfo([
              {
                title: value.collateralType + " for Purchase",
                value: value.collateralAvailable  / 1000000,
              },
              {
                title: "Cost in Gard",
                value: (value.debt + value.premium).toFixed(3),
              },
              {
                title: "Current Market Discount",
                value: (100*value.marketDiscount).toFixed(2) + "%",
              },
            ]);
            setTransCDP(value.cdp);
            setTransType("liquidate");
            setCanAnimate(true);
            setModalVisible(true);
          }}
        />
      ) : (
        <PrimaryButton
          text={"Start auction"}
          onClick={() => {
            setTransInfo([
              {
                title: value.collateralType + " for Purchase",
                value: value.collateralAvailable  / 1000000,
              },
              {
                title: "Cost in Gard",
                value: (value.debt + value.premium).toFixed(3),
              },
              {
                title: "Maximum Market Discount",
                value: (100*value.marketDiscount).toFixed(2) + "%",
              },
            ]);
            setTransCDP(value.cdp);
            setTransType("auction");
            setCanAnimate(true);
            setModalVisible(true);
          }}
        />
      ),
    };
  });
  if (defaulted.length == 0) {
    liveAuctions = dummyLiveAuctions;
  }
  const tabs = {
    one: <LiveAuctions OPTIONS={OPTIONS} open_defaulted={defaulted} selected={selected} liveAuctions={liveAuctions} dummyBids={dummyBids} dummyMarketHistory={dummyMarketHistory} dummyLiveAuctions={dummyLiveAuctions} />
  }
  return (
    <div>
      {loading ? <LoadingOverlay text={loadingText} close={setLoading(false)} /> : <></>}
      <div style={{marginBottom: 20}}>

      <PageToggle selectedTab={setSelectedTab} tabs={{one: "Live Auctions"}} />
      </div>
      {tabs[selectedTab]}
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
      >
        {selected === OPTIONS.LIVE_AUCTIONS ? (
          <TransactionSummary
            specifics={transInfo}
            transactionFunc={async () => {
              setCanAnimate(true);
              setModalVisible(false);
              setLoading(true);
              try {
                let res = transType == "liquidate" ? await liquidate(transCDP) : await start_auction(transCDP);
                if (res.alert) {
                  dispatch(setAlert(res.text));
                }
              } catch (e) {
                console.log(e)
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
const AuctionsDiv = styled.div`
  background-color:#0f1733;
  border-radius: 10px;
`

const AuctionsTable = styled(Table)`
  tr {
    background-color: #172756;
    border-top: 3px solid #0f1733;
    border-bottom: 3px solid #0f1733;
    border-radius: 10px;
  }
`

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
  color: white;
`;

// dummy info for our 3 tables
const dummyLiveAuctions = [
  {
    collateralAvailable: "N/A",
    debt: 0,
    premium: 0,
    marketDiscount: "x",
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
