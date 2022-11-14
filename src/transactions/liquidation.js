import { setLoadingStage, getMicroGardBalance, getGardBalance } from "./lib";
import { ids } from "./ids";
import {
  accountInfo,
  getParams,
  sendTxn,
  getWallet,
  getAppByID,
  signGroup,
} from "../wallets/wallets";
import { validatorAddress, cdpGen } from "./contracts";
import { makeUpdateInterestTxn } from "./cdp";
import algosdk from "algosdk";
import {
  updateLiquidationFirestore,
} from "../components/Firebase";


const enc = new TextEncoder();


export async function start_auction(cdp) {
  const infoPromise = accountInfo();
  const paramsPromise = getParams(2000);
  cdp.contract = cdpGen(cdp.creator, cdp.id, cdp.collateralType);
  let params = await paramsPromise;
  const info = await infoPromise;
  const dummyTxn = makeUpdateInterestTxn(info, params)
  params.fee = 0
  let txn = algosdk.makeApplicationCallTxnFromObject({
    from: cdp.contract.address,
    appIndex: ids.app.validator,
    onComplete: 0,
    appArgs: [enc.encode("Auction")],
    accounts: [cdp.contract.address],
    foreignApps: [ids.app.oracle[0], ids.app.sgard_gard, ids.app.dao.interest],
    foreignAssets: [ids.asa.gard],
    suggestedParams: params,
  });
  let txns = [dummyTxn, txn]
  algosdk.assignGroupID(txns);
  const signTxnsPromise = signGroup(info, txns);
  setLoadingStage("Awaiting Signature from Algorand Wallet...");
  let lsig = algosdk.makeLogicSig(cdp.contract.logic, [algosdk.encodeUint64(3)]);
  const stxn1 = algosdk.signLogicSigTransactionObject(txn, lsig);
  const user_signed = await signTxnsPromise;
  setLoadingStage("Starting an auction...");
  console.log(stxn1)
  console.log(user_signed)
  let stxns = [
    user_signed[0].blob,
    stxn1.blob,
  ];
  let response = await sendTxn(
    stxns,
    `Successfully started the auction on ${cdp.owner}'s CDP.`,
    true,
  );
  setLoadingStage(null);
  return response;
  // TODO: ASA version
}

export async function liquidate(cdp) {
  const infoPromise = accountInfo();
  const paramsPromise = getParams(6000);
  cdp.contract = cdpGen(cdp.creator, cdp.id, cdp.collateralType);
  let params = await paramsPromise;
  const info = await infoPromise;
  if ( getGardBalance(info) < cdp.gard_owed + cdp.premium)
  return {
    alert: true,
    text: "You have insufficient GARD to complete the transaction. You need " + 
    (cdp.gard_owed + cdp.premium + 0.001).toFixed(3) + " GARD."
  };

  let txnX = makeUpdateInterestTxn(info, params);
  params.fee = 0
  let txn0 = makeUpdateInterestTxn(info, params)
  params.fee = 0
  // txn 1 application call
  let txn1 = algosdk.makeApplicationCallTxnFromObject({
    from: cdp.address,
    appIndex: ids.app.validator,
    onComplete: 2,
    appArgs: [enc.encode("BID")],
    foreignAssets: [ids.asa.gard],
    accounts: [cdp.address, cdp.creator, "J5SPGAPMHBL6FCUBYQ2AETO76BBF4YEFZJQ6LALPGIIJVIQ4RKO5NVDUGU"], // XXX: IDK what this last address is... 
    foreignApps: [ids.app.oracle[0], ids.app.sgard_gard, ids.app.gard_staking],
    suggestedParams: params,
  });
  // txn 1 debt and fee repayment
  console.log(1000000 * cdp.gard_owed * 1.2)
  let txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: algosdk.getApplicationAddress(ids.app.validator),
    amount: parseInt(1000000 * (cdp.gard_owed + cdp.premium) + 1000), // TODO: More optimal GARD amount needed (it's refunded tho)
    suggestedParams: params,
    assetIndex: ids.asa.gard,
  });
  // txn 2 Receive CDP asset
  let txn3 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: cdp.address,
    to: info.address,
    closeRemainderTo: info.address,
    amount: 0,
    suggestedParams: params,
  });
  let txns = [txnX, txn0, txn1, txn2, txn3];
  algosdk.assignGroupID(txns);

  const signTxnsPromise = signGroup(info, txns);
  setLoadingStage("Awaiting Signature from Algorand Wallet...");
  let lsig = algosdk.makeLogicSig(cdp.contract.logic, [algosdk.encodeUint64(1)]);
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
  // updateLiquidationFirestore(cdp.owner, cdp.id);
  setLoadingStage(null);
  return response;
  // TODO: ASA version
}

/*
export async function liquidate(
  account_id,
  owner_address,
  microDebt,
  microPremium,
) {

  let reserve;
  let treasury;

  // Setting up promises
  setLoadingStage("Loading...");

  const infoPromise = accountInfo();
  const paramsPromise = getParams(0);

  let cdp = cdpGen(owner_address, account_id);

  const info = await infoPromise;
  let params = await paramsPromise;

  const liquid_fee = Math.floor(microPremium / 5);
  const to_user = liquid_fee * 4;
  let gard_bal = getMicroGardBalance(info);

  if (gard_bal == null || gard_bal < microDebt + to_user + liquid_fee) {
    return {
      alert: true,
      text:
        "Insufficient GARD for transaction. Balance: " +
        (gard_bal / 1000000).toFixed(2).toString() +
        "\n" +
        "Required: " +
        ((microDebt + to_user + liquid_fee) / 1000000).toFixed(2).toString(),
    };
  }

  let txn1 = algosdk.makeApplicationCallTxnFromObject({
    from: cdp.address,
    appIndex: ids.app.validator,
    onComplete: 2,
    foreignAssets: [ids.asa.gard],
    suggestedParams: params,
  });
  let txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: cdp.address,
    to: info.address,
    closeRemainderTo: info.address,
    amount: 0,
    suggestedParams: params,
  });
  params.fee = 5000;
  let txn3 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: reserve.address,
    amount: microDebt,
    suggestedParams: params,
    assetIndex: ids.asa.gard,
  });
  params.fee = 0;
  let txn4 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: treasury.address,
    amount: liquid_fee,
    suggestedParams: params,
    assetIndex: ids.asa.gard,
  });
  let txn5 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: owner_address,
    amount: to_user,
    suggestedParams: params,
    assetIndex: ids.asa.gard,
  });
  let txns = [txn1, txn2, txn3, txn4, txn5];
  algosdk.assignGroupID(txns);

  const signTxnsPromise = signGroup(info, txns);
  setLoadingStage("Awaiting Signature from Algorand Wallet...");
  let lsig = algosdk.makeLogicSig(cdp.logic, [algosdk.encodeUint64(1)]);
  const stxn2 = algosdk.signLogicSigTransactionObject(txn2, lsig);
  const stxn1 = algosdk.signLogicSigTransactionObject(txn1, lsig);
  const user_signed = await signTxnsPromise;
  setLoadingStage("Liquidating CDP...");
  let stxns = [
    stxn1.blob,
    stxn2.blob,
    user_signed[2].blob,
    user_signed[3].blob,
    user_signed[4].blob,
  ];
  let response = await sendTxn(
    stxns,
    `Successfully liquidated ${owner_address}'s CDP.`,
    true,
  );
  updateLiquidationFirestore(owner_address, account_id);
  setLoadingStage(null);
  return response;
}
*/
