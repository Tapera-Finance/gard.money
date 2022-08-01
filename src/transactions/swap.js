import algosdk from "algosdk";
import {
  gardID,
  gainID,
  gardianID,
  pactGARDID,
  pactAlgoGardPoolAddress,
} from "./ids";
import { accountInfo, getParams, sendTxn, signGroup, algodClient } from "../wallets/wallets";
import { verifyOptIn } from "./cdp";
import { updateDBWebActions } from "../components/Firebase";



import pactsdk from "@pactfi/pactsdk";
import { mAlgosToAlgos, mGardToGard } from "../components/swap/swapHelpers";

export const pactClient = new pactsdk.PactClient(algodClient);

// export const AGpool = await pactClient.fetchPoolsByAssets(algo, gard);

export const gardpool = await pactClient.fetchPoolById(pactGARDID)

export async function previewPoolSwap(pool, assetDeposited, amount, slippagePct, swapForExact) {
    const swap = pool.prepareSwap({
        assetDeposited: assetDeposited,
        amount: amount,
        slippagePct: slippagePct,
        swapForExact: swapForExact
    })
    return swap.effect
}

export async function getPools() {
    return await pactClient.listPools()
}




export const exchangeRatioAssetXtoAssetY = (assetX, assetY) => {
  return parseFloat(assetX / assetY).toFixed(4);
};

export const algoGardRatio = async () => exchangeRatioAssetXtoAssetY(mAlgosToAlgos(gardpool.calculator.primaryAssetPrice), mGardToGard(gardpool.calculator.secondaryAssetPrice))

/**
 ********** Swap & Exchange **********
 */



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
