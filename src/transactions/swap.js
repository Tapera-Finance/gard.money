import algosdk from "algosdk";
import {
  ids,
  gainID,
  gardianID,
  pactALGOGARDID,
  pactAlgoGardPoolAddress,
} from "./ids";
import {
  accountInfo,
  getParams,
  sendTxn,
  signGroup,
  algodClient,
} from "../wallets/wallets";
import { verifyOptIn } from "./cdp";
import { updateDBWebActions } from "../components/Firebase";
import { VERSION } from "../globals";
import { psToken } from "../wallets/keys";

import pactsdk from "@pactfi/pactsdk";
import { formatAmt, mAlgosToAlgos } from "../components/actions/swapHelpers";

// TODO: ONLY USING MAINNET, FIX THIS
export const pactClient = new pactsdk.PactClient(new algosdk.Algodv2(psToken, "https://mainnet-algorand.api.purestake.io/ps2", ""));
export const gardpool = await pactClient.fetchPoolById(pactALGOGARDID);

export async function previewPoolSwap(
  pool,
  assetDeposited,
  amount,
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
 * @function swap - execute swap on pact.fi with given assets, direction, and slippage
 * @param {Asset} assetA
 * @param {Asset} assetB
 * @param {number | string} fromAmt
 * @param {number | string} toAmt
 * @param {Asset} swapTo
 * @param {number} slippagePct
 * @returns transaction result object
 */

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
    (assetA.id === 0 && assetB.id === ids.asa.gard) ||
    (assetA.id === ids.asa.gard && assetB.id === 0)
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
  const minimum = formatAmt(Math.trunc((formattedMin * (1 - slippagePct)) / 1e6));
  const opted = toAsset.index == 0 ? true : verifyOptIn(info, toAsset.index);

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
    appIndex: pactALGOGARDID,
    onComplete: 0,
    appArgs: [enc.encode("SWAP"), algosdk.encodeUint64(minimum)],
    foreignAssets: f_a,
    suggestedParams: params,
  });
  let optTxn = [algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: info.address,
        to: info.address,
        amount: 0,
        suggestedParams: params,
        assetIndex: toAsset.index,
      })];

  let txns = !opted
    ? optTxn.concat([txn1, txn2])
    : [txn1, txn2];
  algosdk.assignGroupID(txns);

  setLoadingStage("Awaiting Signature from Algorand Wallet...");
  const signedGroup = await signGroup(info, txns);
  setLoadingStage("Waiting for Confirmation...");

  const stxns = [signedGroup[0].blob, signedGroup[1].blob];
  const response = await sendTxn(
    stxns,
    "Successfully swapped " +
      mAlgosToAlgos(formattedAmount / parseInt(`1e${fromAsset.decimals}`)) +
      " " +
      fromAsset.name.toLocaleUpperCase(),
  );

  setLoadingStage(null);

  updateDBWebActions(8, null, minimum, -formattedAmount, 0, 1, 3000);
  return response;
}
