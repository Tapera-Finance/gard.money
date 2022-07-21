import algosdk from "algosdk";
import {
  gardID,
  gainID,
  gardianID,
  pactGARDID,
  pactAlgoGardPoolAddress,
} from "./ids";
import { accountInfo, getParams, sendTxn, signGroup } from "../wallets/wallets";
import { verifyOptIn } from "./cdp";
import { updateDBWebActions } from "../components/Firebase";

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

export function estimateReturn(input, totalX, totalY) {
  let receivedAmount =
    (((1e6 * (input * totalY)) / Math.floor(input * 1e6 + totalX)) * 9900) /
    10000;
  return parseInt(receivedAmount);
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
    gard: gardInPool["asset-holding"].amount,
  };
  // as pools are added, add poolShark calls to get those token totals and pass to corresponding result[asset/asset]
  result = {
    "ALGO/GARD": {
      algo: algoGardPool.algo,
      gard: algoGardPool.gard,
    },
    "GARD/ALGO": {
      algo: algoGardPool.algo,
      gard: algoGardPool.gard,
    }, // same pool as fallback in case targetPool string is reversed
    // as pools are added, add property to result object that matches the format of string returned from SwapContent's targetPool function, this will be used to dynamically key into each pool total
  };
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

const setLoadingStage = (stage) =>
  sessionStorage.setItem("loadingStage", JSON.stringify(stage));

/**
 *
 @function swapAlgoToGard - create and send transaction to swap ALGO for GARD on Pact DEX
  *    @param {amount} {Number} - representing how many microalgo to send
  *    @param {minimum} {Number} - representing minimu microGard to be received for success
  *    @returns {transactionSummary} - returns details of the exchange to allow for execution
 */
export async function swapAlgoToGard(amount, minimum) {
  setLoadingStage("Loading...");

  const infoPromise = accountInfo();
  const paramsPromise = getParams(1500);
  const info = await infoPromise;
  const params = await paramsPromise;
  const f_a = [0, gardID];
  const enc = new TextEncoder();
  const opted = verifyOptIn(info, gardID);

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
  let optTxn = opted
    ? []
    : algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: info.address,
        to: info.address,
        amount: 0,
        suggestedParams: params,
        assetIndex: gardID,
      });
  let txns = optTxn.concat([txn1, txn2]);
  algosdk.assignGroupID(txns);

  setLoadingStage("Awaiting Signature from Algorand Wallet...");

  const signedGroup = await signGroup(info, txns);

  setLoadingStage("Waiting for Confirmation...");

  const stxns = [signedGroup[0].blob, signedGroup[1].blob];

  const response = await sendTxn(
    stxns,
    "Successfully swapped " + amount / 1e6 + " ALGO.",
  );

  setLoadingStage(null);
  updateDBWebActions(8, null, -amount, minimum, 0, 1, 3000);
  return response;
}

/**
 * @function swapGardToAlgo - create and send transaction to swap GARD FOR ALGO on Pact DEX
 *    @param {amount} {number} - representing how many microgard to send
 *    @param {minimum} {number} - representing minimum acceptable microAlgos for swap to succeed
 *    @returns {transactionSummary} - returns details of the exchange to allow for execution
 */
export async function swapGardToAlgo(amount, minimum) {
  setLoadingStage("Loading...");

  const infoPromise = accountInfo();
  const paramsPromise = getParams(1500);
  const info = await infoPromise;
  const params = await paramsPromise;
  const f_a = [0, gardID];
  const enc = new TextEncoder();

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

  setLoadingStage("Awaiting Signature from Algorand Wallet...");
  const signedGroup = await signGroup(info, txns);

  setLoadingStage("Waiting for Confirmation...");

  const stxns = [signedGroup[0].blob, signedGroup[1].blob];

  const response = await sendTxn(
    stxns,
    "Successfully swapped " + amount / 1e6 + " GARD.",
  );

  setLoadingStage(null);
  updateDBWebActions(8, null, minimum, -amount, 0, 1, 3000);
  return response;
}
