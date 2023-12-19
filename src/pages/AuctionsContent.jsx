import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import PrimaryButton from "../components/PrimaryButton";
import LoadingOverlay from "../components/LoadingOverlay";
import TransactionSummary from "../components/TransactionSummary";
import LiveAuctions from "../components/LiveAuctions";
import {
  getCurrentAlgoUsd,
} from "../prices/prices";
import { start_auction, liquidate } from "../transactions/liquidation";
import { getAllCDPs } from "../transactions/cdp";
import { setAlert } from "../redux/slices/alertSlice";
import { GoHomeIfNoWallet } from "./GovernContent";

let cdp_data_promise = loadDefaulted();
let curr_price = await getCurrentAlgoUsd();
let cdp_data = await cdp_data_promise;

async function loadDefaulted() {
  const allCDPs = await getAllCDPs();
  return allCDPs.filter(cdp => (cdp.ratio <= 145 || cdp.activeAuction));
}

/**
 * Content for the Auctions option on the Drawer
 */
export default function AuctionsContent() {
  const walletAddress = useSelector(state => state.wallet.address);
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

  if (GoHomeIfNoWallet(navigate)){
    return null
  }

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
  let liveAuctions = defaulted.map((value,) => {
    return {
      collateralAvailable: value.collateralAvailable / 1000000,
      collateralType: value.collateralType,
      costInGard: (value.debt + value.premium).toFixed(2),
      marketDiscount: value.cdp.activeAuction ? (100*value.marketDiscount).toFixed(2) + "%" : "Max " + (100*value.marketDiscount).toFixed(2) + "%",
      action: value.cdp.activeAuction ? (
        <PrimaryButton
          text={"Purchase"}
          blue={true}
          left_align={true}
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
  return (
    <div>
      {loading ? <LoadingOverlay text={loadingText} close={setLoading(false)} /> : <></>}
      <LiveAuctions open_defaulted={defaulted} liveAuctions={liveAuctions} dummyBids={dummyBids} dummyMarketHistory={dummyMarketHistory} dummyLiveAuctions={dummyLiveAuctions} />
      <Modal
        visible={modalVisible}
        close={() => setModalVisible(false)}
        animate={canAnimate}
        title={
          "Are you sure you want to proceed?"
        }
        subtitle={
          "Review the details of this transaction to the right and click “Confirm Transaction” to proceed."
        }
      >
        {(
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
                console.log(e);
                alert("Liquidation Failed.");
              }
              setCanAnimate(false);
              setLoading(false);
            }}
            cancelCallback={() => setModalVisible(false)}
          />
        )}
      </Modal>
    </div>
  );
}

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
