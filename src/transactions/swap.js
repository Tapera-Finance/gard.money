import algosdk from "algosdk";
import {
  validatorID,
  gardID,
  gainID,
  gardianID,
  oracleID,
  openFeeID,
  closeFeeID,
  pactGARDID,
  pactAlgoGardPoolAddress,
} from "./ids";
import {
  accountInfo,
  getParams,
  sendTxn,
  getWallet,
  getAppByID,
  signGroup,
} from "../wallets/wallets";
import { getCurrentUnix } from "../prices/prices";
import { VERSION } from "../globals";

const axios = require("axios");

/**
 ********** Swap & Exchange **********
 * Exchange Algos / Gard w/ DEX:
 * todo:
 * - live display exchange rate [ √ ]
 *
 * - code out and verify function to swap:
 *  - algoToGard [ 1 / 2 ]
 *  - gardToAlgo [ 0 / 2 ]
 * - connect to component [ √ ]
 *  - add helpers to component:
 *    - recalculateRatioAtInterval [ ]
 *    - limitUsrMaxInput [ ]
 * - smoke test testnet [ ]
 * - smoke test main [ ]
 * - PR open [ ]
 *
 */

/**
 * Local Helpers
 */

const parseValFromAppState = (appState, idx) =>
  parseFloat(appState[idx]["value"]["uint"]);

/**
 * Global Helpers
 */

export function showMeTheDeets(txn) {
  // console.log("this id", this.id);
  // console.log("this recipient", this.recipient);
  // console.log("this assets", this.assets);
  console.log(
    "printing transaction result invoked by swap function --->>>",
    txn,
  );
}

export function estimateReturn(algo, totalAlgoInPool, totalGardInPool, fee) {
  let receivedAmount =
    ((algo * totalGardInPool) / (totalAlgoInPool + algo)) * (1 - fee); // compare this to what actual transaction returns?
  return receivedAmount;
}

export async function queryAndConvertTotals() {
  let result;
  const algoInPool = await queryObject.getAlgoInPactAlgoGardPool();
  const gardInPool = await queryObject.getGardInPactAlgoGardPool();
  // result = algoInPool.amount / gardInPool["asset-holding"].amount;
  result = {
    algo: algoInPool.amount,
    gard: gardInPool["asset-holding"].amount,
  };
  return result;
}

/**
 * Use to get and set exchange rate, estimate slippage and use in component functions to impose accurate transaction limits
 */

export const queryObject = {
  getGardInPactAlgoGardPool: async () => {
    try {
      const response = await axios.get(
        `https://node.algoexplorerapi.io/v2/accounts/${pactAlgoGardPoolAddress}/assets/${gardID}`,
      );
      return response.data;
    } catch (e) {
      console.log("can't fetch algo/gard pool", e);
    }
  },
  getAlgoInPactAlgoGardPool: async () => {
    try {
      const response = await axios.get(
        `https://node.algoexplorerapi.io/v2/accounts/${pactAlgoGardPoolAddress}`,
      );
      return response.data;
    } catch (e) {
      console.log("can't fetch algo/gard Pact LP info");
    }
  },
};

/*************
 * Pact Swap Controller
 * Instance of SwapController for exchanging assets with Pact
 * @function algoToGard - calculate swap exchange rate from algo to gard
 *    @param {algo} {Float} - representing how many algo to send
 *    @param {lockedInRate} {Float} - representing exchange rate from current pool at time of capture
 *    @returns {transactionSummary} - returns details of the exchange to allow for execution
 *
 * @function gardToAlgo - calculate swap exchange rate from gard to algo
 *    @param {gard} {Float} - representing how many gard to send
 *    @param {lockedInRate} {Float} - representing exchange rate from current pool at time of capture
 *    @returns {transactionSummary} - returns details of the exchange to allow for execution
 *
 * @function queryExchangeRate - query blockchain for Pact's asset pool exchange rate given two assets
 *    @param {asset1} {Object} - name and id of asset1
 *    @param {asset2} {Object} name and id of asset2
 *    @returns {rate} ratio of exchange at the time of query
 *
 * @function execute - build and execute blockchain transaction
 *    @param {type} {String} - type of exchange to execute ex. "algoToGard" || "gardToAlgo"
 *    @param {info} {Object} - account holder information with address and wallet details
 *    @returns {transactionResult} - confirmation of exchange from blockchain
 *
 *************/

export function PactController(assetsToOptInto, fee) {
  this.dexId = "PACT";
  this.address = pactAlgoGardPoolAddress;
  this.appId = pactGARDID;
  this.fee = fee;
  this.assets = assetsToOptInto;
  for (var i = 0; i < assetsToOptInto.length; i++) {
    let asset = assetsToOptInto[i];
    this[`${asset.name}ID`] = asset.id;
  }
  // assetsToOptInto.forEach((asset) => {
  //   this[`${asset.name}ID`] = asset.id;
  // });
}

PactController.prototype.constructor = PactController;

// use pact controller's prototype methods
// to call function that builds and sends txn based on user input [ input, select ]

PactController.prototype = {
  algoToGard: (algo, totalAlgo, totalGard) => {
    console.log("algo to gard!");
    // call swapAlgoToGard (algo, totalAlgo, totalGard, this.fee)
  },
  gardToAlgo: (gard, totalAlgo, totalGard) => {
    console.log("gard to algo!");
    // call swapGardToAlgo (gard, totalAlgo, totalGard, this.fee)
  },
  algoToUSDC: () => {
    //
  },
  USDCToAlgo: () => {
    //
  },
};

// PACT Exchange rate formulas
// rcv = a * B / (A + a)
// rcv_net = rcv * (1 - fee)
// exchange rate ~= lim a -> 0(rcv/a)
// exchange rate = limit of a approaching 0 times received value divided by a

// this should allow us to see an estimated result of this transaction on front end

export async function swapAlgoToGard(algo, totalAlgo, totalGard, fee) {
  const infoPromise = accountInfo();
  const paramsPromise = getParams(0);
  const info = await infoPromise;
  const params = await paramsPromise;

  let totalAlgoInPool = totalAlgo;
  let totalGardInPool = totalGard;

  // console.log("recipient from transactionFunc being called", recipient);

  /**
   * create transaction logic:
   */

  // let txn1 = makePaymentTxnWithSuggestedParams({
  //   from: info.address,
  //   to: recipient,
  //   params: params,
  // });

  // let txn2 = makeApplicationNoOpTxn(
  //   info.address,
  //   params,
  //   pactAlgoGardPoolAddress,
  //   ["SWAP", 38,],
  //   f_a,
  // );

  // let gid = computeGroupID([txn1, txn2]);
  // txn1.group = gid;
  // txn2.group = gid;
  // let stxn1 = txn1.signTxn(key);
  // let stxn2 = txn2.signTxn(key);
  // let txnResult = await sendTxn([stxn1, stxn2]);
  // return showMeTheDeets(txnResult);
}

// removing soon //

// let id = openFeeID;
// if (close) {
//   id = closeFeeID;
// }
// const app = await getAppByID(id);
// // const state = app["params"]["global-state"];
// console.log("app: -> ", app);
// const gardBalance = getGardBalance(info);
// console.log(gardBalance);

// console.log("state: ->", state);

// for (let n = 0; n < state.length; n++) {
// let stateVal = _parseValFromAppState(state, n);
// console.log(`state val at index ${n}`, stateVal);
// }
// let phrase = "";
// let f_a = [0, 31566704];
