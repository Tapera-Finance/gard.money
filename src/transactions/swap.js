import algosdk from "algosdk";
import {
  gardID,
  gainID,
  gardianID,
  pactGARDID,
  pactAlgoGardPoolAddress,
} from "./ids";
import { accountInfo, getParams, sendTxn, signGroup, algodClient,  handleTxError } from "../wallets/wallets";
import { verifyOptIn } from "./cdp";
import { updateDBWebActions } from "../components/Firebase";
import { VERSION } from "../globals";


import pactsdk from "@pactfi/pactsdk";
import { mAlgosToAlgos, mGardToGard } from "../components/swap/swapHelpers";

export const pactClient = new pactsdk.PactClient(algodClient);
// console.log("pact client from swap.js",pactClient)

// export const AGpool = await pactClient.fetchPoolsByAssets(algo, gard);

export const gardpool = await pactClient.fetchPoolById(pactGARDID)

export async function previewPoolSwap(pool, assetDeposited, amount, slippagePct, swapForExact) {
  // console.log(pool, assetDeposited, amount, slippagePct , swapForExact)

  // const obj = {
  //   pool: pool, assetDeposited: assetDeposited, amount: amount, slippagePct: slippagePct , swapForExact: swapForExact
  // }
  // for (let key in obj) {
  //   console.log(key, obj[key]);
  // }
  await pool.updateState()
  console.log(pool.state)
  const swap = gardpool.prepareSwap({
    assetDeposited: assetDeposited,
    amount: amount,
    slippagePct: 1,
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

export async function executePactSwap(assetA, assetB, params) {
  let poolToUse;

  if (assetA.id === 0 && assetB.id === gardID || assetA.id === gardID && assetB.id === 0) {
    poolToUse = gardpool
  }

  const { swapTo, slippageTolerance } = params;

  const assetAfromPool = await pactClient.fetchAsset(assetA.id)
  const assetBfromPool = await pactClient.fetchAsset(assetB.id)

  const fromAsset = swapTo.type === assetA.type ? assetBfromPool : assetAfromPool;
  const fromAmount = swapTo.type === assetA.type ? assetB.amount : assetA.amount;


  const pactResult = previewPoolSwap(
    gardpool,
    fromAsset,
    parseFloat(fromAmount),
    5,
    true,
  );

  return {
    pactResult: pactResult
  }
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


export async function swap(assetA, assetB, params) {
  const infoPromise = accountInfo();
  const info = await infoPromise;
  let poolToUse;

  if (assetA.id === 0 && assetB.id === gardID || assetA.id === gardID && assetB.id === 0) {
    poolToUse = gardpool
  }

  const { swapTo, slippageTolerance } = params;

  const assetAfromPool = poolToUse.primaryAsset
  const assetBfromPool = poolToUse.secondaryAsset

  const fromAsset = swapTo.type === assetA.type ? assetBfromPool : assetAfromPool;
  const fromAmount = swapTo.type === assetA.type ? parseInt(assetB.amount) : parseInt(assetA.amount);

  let payload;
  try {
    if (VERSION !== "MAINNET") {
      throw new Error("Unable to swap on TESTNET")
    }
    if (fromAsset.name === assetA.type && swapTo.type === assetB.type) {
      payload = await swapAlgoToGard(fromAmount, // refactor this to not call hardcoded txn fn
        parseInt(
          1e6 *
            parseFloat(assetB.amount.split()[0]) *
            (1 - slippageTolerance),
        ),
        )
    } else if (fromAsset.name === assetB.type && swapTo.type === assetA.type) {
      await swapGardToAlgo(fromAmount, // refactor this to not call hardcoded txn fn
        parseInt(
          1e6 *
            parseFloat(assetA.amount.split()[0]) *
            (1 - slippageTolerance),
        ),
        )
    }
    // if (payload.alert) {
    //   return payload.text
    // }
    return
  } catch (e) {
    handleTxError(e, "Error exchanging assets")
  }
}


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
