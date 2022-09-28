import algosdk from "algosdk";
import { setLoadingStage, microGARD, idToAddress } from "./lib"
import { accountInfo } from "../wallets/wallets";

export async function stake(pool, gardAmount) {
  setLoadingStage("Loading...");

  let infoPromise = accountInfo();
  let microGARDAmount = microGARD(gardAmount);

  let params = await getParams(1000);
  let info = await infoPromise;
  
  // txn 0 - app call
  params.fee = 0
  let txn1 = algosdk.makeApplicationCallTxnFromObject({
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
  let txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: idToAddress(ids.app.gard_staking),
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

export async function unstake(pool, amount) {
  // TODO
}
