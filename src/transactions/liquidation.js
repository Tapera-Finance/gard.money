import { setLoadingStage, getGardBalance } from "./lib";
import { ids } from "./ids";
import {
  accountInfo,
  getParams,
  sendTxn,
  signGroup,
} from "../wallets/wallets";
import { cdpGen } from "./contracts";
import { makeUpdateInterestTxn } from "./cdp";
import algosdk from "algosdk";


const enc = new TextEncoder();


function makeDummyXferTxn(userInfo, params, id=ids.asa.galgo) {
  return algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: userInfo.address,
    to: userInfo.address,
    amount: 0, 
    suggestedParams: params,
    assetIndex: id,
  });
}

export async function start_auction(cdp) {
  setLoadingStage("Starting an auction...");
  const infoPromise = accountInfo();
  const paramsPromise = getParams(2000);
  cdp.contract = cdpGen(cdp.creator, cdp.id, cdp.collateralID);
  let params = await paramsPromise;
  const info = await infoPromise;
  const firstDummyTxn = cdp.collateralID != 0 ? makeDummyXferTxn(info, params, cdp.collateralID) : null;
  const dummyTxn = makeUpdateInterestTxn(info, params);
  params.fee = 0;
  let foreignApps = [ids.app.oracle[0], ids.app.sgard_gard, ids.app.dao.interest];
  let foreignAssets = [ids.asa.gard];
  let lsigNum = 3;
  if (cdp.collateralID != 0) {
    foreignApps.push(ids.app.oracle[cdp.collateralID]);
    foreignAssets.push(cdp.collateralID);
    lsigNum = 2;
  }
  let txn = algosdk.makeApplicationCallTxnFromObject({
    from: cdp.contract.address,
    appIndex: ids.app.validator,
    onComplete: 0,
    appArgs: [enc.encode("Auction")],
    accounts: [cdp.contract.address],
    foreignApps: foreignApps,
    foreignAssets: foreignAssets,
    suggestedParams: params,
  });
  let txns = firstDummyTxn === null ? [dummyTxn, txn] : [firstDummyTxn, dummyTxn, txn];
  algosdk.assignGroupID(txns);
  setLoadingStage("Awaiting Signature from Algorand Wallet...");
  const signTxnsPromise = signGroup(info, txns);
  let lsig = algosdk.makeLogicSig(cdp.contract.logic, [algosdk.encodeUint64(lsigNum)]);
  const stxn1 = algosdk.signLogicSigTransactionObject(txn, lsig);
  const user_signed = await signTxnsPromise;
  console.log(stxn1);
  console.log(user_signed);
  let stxns = firstDummyTxn === null ? [
    user_signed[0].blob,
    stxn1.blob,
  ] : [
    user_signed[0].blob,
    user_signed[1].blob,
    stxn1.blob,
  ];
  let response = await sendTxn(
    stxns,
    `Successfully started the auction on ${cdp.owner}'s CDP.`,
    true,
  );
  setLoadingStage(null);
  return response;
}

export async function liquidate(cdp) {
  const infoPromise = accountInfo();
  const paramsPromise = getParams(6000);
  cdp.contract = cdpGen(cdp.creator, cdp.id, cdp.collateralID);
  let params = await paramsPromise;
  const info = await infoPromise;
  if ( getGardBalance(info) < cdp.gard_owed + cdp.premium)
  return {
    alert: true,
    text: "You have insufficient GARD to complete the transaction. You need " + 
    (cdp.gard_owed + cdp.premium + 0.001).toFixed(3) + " GARD."
  };

  const lsigNum = cdp.collateralID == 0 ? 1 : 0;
  let txnX = makeUpdateInterestTxn(info, params);
  params.fee = 0;
  let txn0 = makeUpdateInterestTxn(info, params); // These first 2 transactions are for opcode budget
  params.fee = 0;
  // txn 1 application call
  let txn1 = algosdk.makeApplicationCallTxnFromObject({
    from: cdp.address,
    appIndex: ids.app.validator,
    onComplete: 2,
    appArgs: [enc.encode("BID")],
    foreignAssets: [ids.asa.gard],
    accounts: [cdp.address, cdp.creator, "J5SPGAPMHBL6FCUBYQ2AETO76BBF4YEFZJQ6LALPGIIJVIQ4RKO5NVDUGU"], // last address is the revenue splitter excess paid goes there
    foreignApps: [ids.app.oracle[0], ids.app.sgard_gard, ids.app.gard_staking],
    suggestedParams: params,
  });
  // txn 1 debt and fee repayment
  let txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: algosdk.getApplicationAddress(ids.app.validator),
    amount: parseInt(1000000 * (cdp.gard_owed + cdp.premium) + 1000), 
    suggestedParams: params,
    assetIndex: ids.asa.gard,
  });
  // txn 2 Receive CDP asset
  let txn3 = lsigNum == 1 ? algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: cdp.address,
    to: info.address,
    closeRemainderTo: info.address,
    amount: 0,
    suggestedParams: params,
  }) : algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: cdp.address,
    to: info.address,
    amount: 0, 
    closeRemainderTo: info.address,
    suggestedParams: params,
    assetIndex: cdp.collateralID,
  });
  let txns = [txnX, txn0, txn1, txn2, txn3];
  algosdk.assignGroupID(txns);

  const signTxnsPromise = signGroup(info, txns);
  setLoadingStage("Awaiting Signature from Algorand Wallet...");
  let lsig = algosdk.makeLogicSig(cdp.contract.logic, [algosdk.encodeUint64(lsigNum)]);
  const stxn1 = algosdk.signLogicSigTransactionObject(txn1, lsig);
  const stxn3 = algosdk.signLogicSigTransactionObject(txn3, lsig);
  const user_signed = await signTxnsPromise;
  setLoadingStage("Liquidating CDP...");
  let stxns = [
    user_signed[0].blob,
    user_signed[1].blob,
    stxn1.blob,
    user_signed[3].blob,
    stxn3.blob,
  ];
  let response = await sendTxn(
    stxns,
    `Successfully liquidated ${cdp.owner}'s CDP.`,
    true,
  );
  setLoadingStage(null);
  return response;

}

