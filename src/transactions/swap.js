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

export function estimateReturn(input, totalX, totalY, fee) {
  let receivedAmount =
    ((input * totalY) / (totalX + input)) * (1 - fee); // compare this to what actual transaction returns?
  return parseFloat(receivedAmount.toFixed(3));
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

    // ALGO/GARD pool
      const algoInPool = await queryObject.getAlgoInPactAlgoGardPool();
      const gardInPool = await queryObject.getGardInPactAlgoGardPool();
      const algoGardPool = {
        algo: algoInPool.amount,
        gard: gardInPool["asset-holding"].amount
      }
    // as pools are added, add queryObject calls to get those token totals and pass to corresponding result[asset/asset]
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
 *
 @function swapAlgoToGard - calculate swap exchange rate from algo to gard
  *    @param {algo} {Float} - representing how many algo to send
  *    @param {lockedInRate} {Float} - representing exchange rate from current pool at time of capture
  *    @returns {transactionSummary} - returns details of the exchange to allow for execution
 */
export async function swapAlgoToGard(amount, minimum) {
  
  const infoPromise = accountInfo();
  const paramsPromise = getParams(1500);
  const info = await infoPromise;
  const params = await paramsPromise;
  const f_a = [0, gardID];
  const enc = new TextEncoder();

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

  const stxns = [signedGroup[0].blob, signedGroup[1].blob];

  const response = await sendTxn(stxns, "Successfully swapped " + amount + " tokens.",);

  return showMeTheDeets(response);
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

  const stxns = [signedGroup[0].blob, signedGroup[1].blob];

  const response = await sendTxn(stxns, "Successfully swapped " + amount + " tokens.",);

  return showMeTheDeets(response);
}
