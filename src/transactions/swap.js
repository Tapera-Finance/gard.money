import algosdk from "algosdk";
import {
  validatorID,
  gardID,
  gainID,
  gardianID,
  pactGARDID,
  pactAlgoGardPoolAddress,
} from "./ids";
import {
  accountInfo,
  getParams,
  sendTxn,
  getWallet,
  getWalletInfo,
  handleTxError,
  updateWalletInfo,
  getAppByID,
  signGroup,
} from "../wallets/wallets";
import { VERSION } from "../globals";

const axios = require("axios");

/**
 ********** Swap & Exchange **********
 * Exchange Algos / Gard w/ DEX:
 * todo:
 * - live display exchange rate [ √ ]
 *
 * - code out and verify function to swap:
 *  - algoToGard [ 2 / 3 ] - correct values present, 3rd step is send to blockchain
 *  - gardToAlgo [ 2 / 3 ] - same as above
 * - connect to component [ √ ]
 *  - add helpers to component:
 *    - recalculateRatioAtInterval [ ]
 *    - limitUsrMaxInput [ ]
 * - smoke test testnet [ ]
 * - smoke test main [ ]
 * - PR open [ ]
 *
 *
 *
 * need swapping doable --> get input value, perform conversion, populate receive input
 * need wallet info --> get balances, use to limit input
 */

/**
 * Local Helpers
 */

function showMeTheDeets(txn) {
  console.log(
    "printing transaction result invoked by swap function --->>>",
    txn,
  );
}

/**
 * Use to get and set exchange rate, estimate slippage and use in component functions to impose accurate transaction limits
 */

const queryObject = {
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

/**
 * Global Helpers
 */

// TODO: change to x & y

export function estimateReturn(algo, totalAlgoInPool, totalGardInPool, fee) {
  let receivedAmount =
    ((algo * totalGardInPool) / (totalAlgoInPool + algo)) * (1 - fee); // compare this to what actual transaction returns?
  return receivedAmount;
}
/**
 *
 *
 * @function queryAndConvertTotals - query blockchain for Pact's asset pool exchange rate given two assets
 * @returns {Object} algo + gard totals for algo/gard pool
 *
 */
export async function queryAndConvertTotals() {
  let result;
  const algoInPool = await queryObject.getAlgoInPactAlgoGardPool();
  const gardInPool = await queryObject.getGardInPactAlgoGardPool();
  result = {
    algo: algoInPool.amount,
    gard: gardInPool["asset-holding"].amount,
  };
  return result;
}

/**
 *
 @function swapAlgoToGard - calculate swap exchange rate from algo to gard
  *    @param {algo} {Float} - representing how many algo to send
  *    @param {lockedInRate} {Float} - representing exchange rate from current pool at time of capture
  *    @returns {transactionSummary} - returns details of the exchange to allow for execution
 */
export async function swapAlgoToGard(amount, totals, minimum) {
  const infoPromise = accountInfo();
  const paramsPromise = getParams(0);
  const info = await infoPromise;
  const params = await paramsPromise;
  console.log(amount, "is being sent")
  console.log(totals, "<- pool totals")
  console.log(minimum, "minimum")
  const f_a = [0, gardID];
  // // console.log("recipient from transactionFunc being called", recipient);

  // /**
  //  * create transaction logic:
  //  */

  let txn1 = algosdk.makePaymentTxnWithSuggestedParams({
    from: info.address,
    to: pactAlgoGardPoolAddress,
    amount: amount,
    params: params,
  });

  let txn2 = algosdk.makeApplicationNoOpTxn(
    info.address,
    params,
    pactAlgoGardPoolAddress,
    ["SWAP", minimum],
    f_a,
  );

  //
  let txns = [txn1, txn2];
  let gid = algosdk.assignGroupID(txns);
  let sn_txns = await signGroup(info, txns);
  let txnResult = await sendTxn(
    sn_txns,
    `swapped ${amount} Algo to Gard successfully!`,
  );
  return showMeTheDeets(txnResult);
}

/**
 * @function swapGardToAlgo - calculate swap exchange rate from gard to algo
 *    @param {gard} {Float} - representing how many gard to send
 *    @param {lockedInRate} {Float} - representing exchange rate from current pool at time of capture
 *    @returns {transactionSummary} - returns details of the exchange to allow for execution
 */

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
