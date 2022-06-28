import algosdk from "algosdk";
import {
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
  signGroup,
} from "../wallets/wallets";

const axios = require("axios");

/**
 ********** Swap & Exchange **********
 */

/**
 * @interface poolShark (not)
 * @method getGard
 * @returns {Promise} - fetch GARD in Pact Algo/Gard pool
 *
 * @method getAlgo
 * @returns {Promise} - fetch ALGO in Pact Algo/Gard pool
 * Queery object used to get and set exchange rate, used to fetch and pass blockchain data to component
 */

const poolShark = {
  getGard: async () => {
    try {
      const response = await axios.get(
        `https://node.algoexplorerapi.io/v2/accounts/${pactAlgoGardPoolAddress}/assets/${gardID}`,
      );
      return response.data;
    } catch (e) {
      console.log("can't fetch algo/gard pool", e);
    }
  },
  getAlgo: async () => {
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

export function estimateReturn(input, totalX, totalY, fee) {
  let receivedAmount =
    ((input * totalY) / (totalX + input)) * (1 - fee); // compare this to what actual transaction returns?
  return parseFloat(receivedAmount.toFixed(3));
}
/**
 *
 *
 * @function queryAndConvertTotals - queer blockchain data
 * snag Pact's asset pool exchange rate given two assets (ALGO, GARD)
 * @returns {Object} algo + gard totals for algo/gard pool
 *
 */
export async function queryAndConvertTotals() {
  let result;

    // ALGO/GARD pool
      const algoInPool = await poolShark.getAlgo();
      const gardInPool = await poolShark.getGard();
      const algoGardPool = {
        algo: algoInPool.amount,
        gard: gardInPool["asset-holding"].amount
      }
    // as pools are added, add poolShark calls to get those token totals and pass to corresponding result[asset/asset]
      result = {
        "ALGO/GARD": {
          algo: algoGardPool.algo,
          gard: algoGardPool.gard
        },
        "GARD/ALGO" : {
          algo: algoGardPool.algo,
          gard: algoGardPool.gard
        } // same pool as fallback in case targetPool string is reversed
        // as pools are added, add property to result object that matches the format of string returned from SwapContent's targetPool function, this will be used to dynamically key into each pool total
      }
  return result;
}

/**
 * Session Helpers
 */
//initial store
 const originalSetItem = sessionStorage.setItem;

 // def storage setItem method
 sessionStorage.setItem = function (key, value) {
   var event = new Event("itemInserted");

   event.value = value;
   event.key = key;

   document.dispatchEvent(event);

   originalSetItem.apply(this, arguments);
 };

const setLoadingStage = stage => sessionStorage.setItem("loadingStage", JSON.stringify(stage));

/**
 *
 @function swapAlgoToGard - calculate swap exchange rate from algo to gard
  *    @param {amount} {Number} - representing how many algo to send
  *    @param {minimum} {Number} - representing exchange rate from current pool at time of capture
  *    @returns {transactionSummary} - returns details of the exchange to allow for execution
 */
export async function swapAlgoToGard(amount, minimum) {

  const infoPromise = accountInfo();
  const paramsPromise = getParams(1500);
  const info = await infoPromise;
  const params = await paramsPromise;
  const f_a = [0, gardID];
  const enc = new TextEncoder();

  setLoadingStage("Loading...");

  setLoadingStage("Awaiting Signature from Algorand Wallet...");

  let txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: pactAlgoGardPoolAddress,
    amount: amount,
    suggestedParams: params,
  });

  let txn2 = algosdk.makeApplicationCallTxnFromObject({
    from: info.address,
    appIndex: pactGARDID,
    onComplete: 0,
    appArgs: [enc.encode("SWAP"), algosdk.encodeUint64(minimum)],
    foreignAssets: f_a,
    suggestedParams: params,
  });

  let txns = [txn1, txn2];
  algosdk.assignGroupID(txns);

  const signedGroup = await signGroup(info, txns);

  setLoadingStage("Confirming Transaction...");


  const stxns = [signedGroup[0].blob, signedGroup[1].blob];

  const response = await sendTxn(stxns, "Successfully swapped " + amount + " tokens.",);

  setLoadingStage(null);
  return response;
}

/**
 * @function swapGardToAlgo - calculate swap exchange rate from gard to algo
 *    @param {gard} {Float} - representing how many gard to send
 *    @param {lockedInRate} {Float} - representing exchange rate from current pool at time of capture
 *    @returns {transactionSummary} - returns details of the exchange to allow for execution
 */
 export async function swapGardToAlgo(amount, minimum) {

  const infoPromise = accountInfo();
  const paramsPromise = getParams(1500);
  const info = await infoPromise;
  const params = await paramsPromise;
  const f_a = [0, gardID];
  const enc = new TextEncoder();

  setLoadingStage("Loading...");
  setLoadingStage("Awaiting Signature from Algorand Wallet...");

  let txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: pactAlgoGardPoolAddress,
    amount: amount,
    suggestedParams: params,
    assetIndex: gardID,
  });
  let txn2 = algosdk.makeApplicationCallTxnFromObject({
    from: info.address,
    appIndex: pactGARDID,
    onComplete: 0,
    appArgs: [enc.encode("SWAP"), algosdk.encodeUint64(minimum)],
    foreignAssets: f_a,
    suggestedParams: params,
  });

  let txns = [txn1, txn2];
  algosdk.assignGroupID(txns);

  const signedGroup = await signGroup(info, txns);

  setLoadingStage("Swapping assets...")

  const stxns = [signedGroup[0].blob, signedGroup[1].blob];

  const response = await sendTxn(stxns, "Successfully swapped " + (amount/1000) + " tokens.",);

  setLoadingStage(null)
  return response;
}
