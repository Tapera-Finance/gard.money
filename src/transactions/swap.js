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
  algodClient,
  handleTxError,
} from "../wallets/wallets";
import { verifyOptIn } from "./cdp";
import { updateDBWebActions } from "../components/Firebase";
import { VERSION } from "../globals";

import pactsdk from "@pactfi/pactsdk";
import {
  algosTomAlgos,
  mAlgosToAlgos,
  mGardToGard,
} from "../components/swap/swapHelpers";

export const pactClient = new pactsdk.PactClient(algodClient);
export const gardpool = await pactClient.fetchPoolById(pactGARDID);

export async function previewPoolSwap(
  pool,
  assetDeposited,
  amount,
  slippagePct,
  swapForExact,
) {
  await pool.updateState();
  const swap = gardpool.prepareSwap({
    assetDeposited: assetDeposited,
    amount: amount,
    slippagePct: 1,
    swapForExact: swapForExact,
  });

  return swap.effect;
}

export async function getPools() {
  return await pactClient.listPools();
}

export const exchangeRatioAssetXtoAssetY = (assetX, assetY) => {
  return parseFloat(assetX / assetY).toFixed(4);
};

export const algoGardRatio = async () =>
  exchangeRatioAssetXtoAssetY(
    mAlgosToAlgos(gardpool.calculator.primaryAssetPrice),
    mAlgosToAlgos(gardpool.calculator.secondaryAssetPrice),
  );

/**
 ********** Swap & Exchange **********
 */

/**
 * Helpers
 */

export function estimateReturn(input, totalX, totalY) {
  let receivedAmount =
    (((1e6 * (input * totalY)) / Math.floor(input * 1e6 + totalX)) * 9900) /
    10000;
  return parseInt(receivedAmount);
}

const formatAmt = (amt) =>
  typeof amt === "string"
    ? parseInt(algosTomAlgos(parseFloat(amt)))
    : algosTomAlgos(amt);

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

export async function swap(
  assetA,
  assetB,
  fromAmt,
  toAmt,
  swapTo,
  slippagePct,
) {
  const infoPromise = accountInfo();
  const paramsPromise = getParams(1500);
  const info = await infoPromise;
  const params = await paramsPromise;
  const f_a = [0, assetB.id];
  const enc = new TextEncoder();
  let poolToUse;
  if (
    (assetA.id === 0 && assetB.id === gardID) ||
    (assetA.id === gardID && assetB.id === 0)
  ) {
    poolToUse = gardpool;
  }
  const assetAfromPool = poolToUse.primaryAsset;
  const assetBfromPool = poolToUse.secondaryAsset;

  const fromAsset =
    swapTo.type === assetA.type ? assetBfromPool : assetAfromPool;
  const toAsset = swapTo.type === assetA.type ? assetAfromPool : assetBfromPool;

  const formattedAmount = formatAmt(fromAmt);
  const formattedMin = formatAmt(toAmt);
  const minimum = Math.trunc((formattedMin * (1 - slippagePct)) / 1e6);
  const opted = verifyOptIn(info, toAsset.index);

  let txn1 =
    fromAsset.index === 0
      ? algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          from: info.address,
          to: pactAlgoGardPoolAddress,
          amount: formattedAmount,
          suggestedParams: params,
        })
      : algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          from: info.address,
          to: pactAlgoGardPoolAddress,
          amount: formattedAmount,
          suggestedParams: params,
          assetIndex: fromAsset.index,
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
        assetIndex: toAsset.index,
      });

  let txns = !Array.isArray(optTxn)
    ? [txn1, txn2]
    : optTxn.concat([txn1, txn2]);
  algosdk.assignGroupID(txns);

  setLoadingStage("Awaiting Signature from Algorand Wallet...");
  const signedGroup = await signGroup(info, txns);
  setLoadingStage("Waiting for Confirmation...");

  const stxns = [signedGroup[0].blob, signedGroup[1].blob];
  const response = await sendTxn(
    stxns,
    "Successfully swapped " +
      formattedAmount / parseInt(`1e${fromAsset.decimals}`) +
      " " +
      fromAsset.name.toLocaleUpperCase(),
  );

  setLoadingStage(null);
  updateDBWebActions(8, null, minimum, -fromAmt, 0, 1, 3000);
  return response;
}
