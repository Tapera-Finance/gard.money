import algosdk from "algosdk";
import { ids } from "./ids";
import { setLoadingStage, microGARD } from "./lib"
import { accountInfo, getParams, signGroup, sendTxn } from "../wallets/wallets";

const enc = new TextEncoder();

export async function stake(pool, gardAmount) {
  setLoadingStage("Loading...");

  let infoPromise = accountInfo();
  let microGARDAmount = microGARD(gardAmount);

  let params = await getParams(1000);
  let info = await infoPromise;
  
  // txn 0 - app call
  let txn0 = algosdk.makeApplicationCallTxnFromObject({
    from: info.address,
    appIndex: ids.app.gard_staking,
    onComplete: 0,
    appArgs: [enc.encode("enter_" + pool + "_pool")],
    accounts: [],
    foreignApps: [],
    foreignAssets: [ids.asa.gard],
    suggestedParams: params,
  });
  // txn 1 - entrance transfer
  let txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: algosdk.getApplicationAddress(ids.app.gard_staking),
    amount: microGARDAmount,
    suggestedParams: params,
    assetIndex: ids.asa.gard,
  });
  

  let txns = [txn0, txn1];
  algosdk.assignGroupID(txns);
  
  setLoadingStage("Awaiting Signature from Algorand Wallet...");
  const signedGroup = await signGroup(info, txns);

  setLoadingStage("Confirming Transaction...");

  let stxns = [signedGroup[0].blob, signedGroup[1].blob];

  let response = await sendTxn(
    stxns,
    "Successfully staked " + gardAmount + " GARD.",
  );
  setLoadingStage(null);

  return response;
}

export async function unstake(pool, gardAmount) {
  setLoadingStage("Loading...");

  let infoPromise = accountInfo();
  let microGARDAmount = microGARD(gardAmount);

  // XXX: This could be more optimally set -
  //      for locked pools if it's not a valid
  //      withdrawal period, only needs to be 1000
  let params = await getParams(2000);
  let info = await infoPromise;
  
  // txn 0 - app call
  params.fee = 0
  let txn0 = algosdk.makeApplicationCallTxnFromObject({
    from: info.address,
    appIndex: ids.app.gard_staking,
    onComplete: 0,
    appArgs: [enc.encode("exit_" + pool + "_pool"), algosdk.encodeUint64(microGARDAmount)],
    accounts: [],
    foreignApps: [],
    foreignAssets: [ids.asa.gard], // XXX: When we do NLL, this will have to change
    suggestedParams: params,
  });
  

  let txns = [txn0];
  algosdk.assignGroupID(txns);
  
  setLoadingStage("Awaiting Signature from Algorand Wallet...");
  const signedGroup = await signGroup(info, txns);

  setLoadingStage("Confirming Transaction...");

  let stxns = [signedGroup[0].blob];

  let response = await sendTxn(
    stxns,
    "Successfully unstaked " + gardAmount + " GARD.", // TODO: if unstaking all, display that amount
  );
  setLoadingStage(null);

  return response;
}
