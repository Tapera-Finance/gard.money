import algosdk from "algosdk";
import { ids } from "./ids";
import { setLoadingStage, microGARD, getMicroGardBalance, getAppField, cdpInterest, getLocalAppField, getGardianBalance } from "./lib"
import { accountInfo, getParams, signGroup, sendTxn, updateWalletInfo } from "../wallets/wallets";

const enc = new TextEncoder();
let stakingRevenuePercent = .8 // TODO: Get this dynamically off the chain

export async function getAccruedRewards(pool, app_id=ids.app.gard_staking) {
  const phrase = app_id = ids.app.gard_staking ? " GARD Staked" : " GARDIAN Staked"
  const staked = getLocalAppField(app_id, pool + phrase)
  const initialReturn = getLocalAppField(app_id, pool + " Initial Return Rate")
  if (staked === undefined || initialReturn === undefined) {
    return 0
  }
  const currentReturn = await getAppField(app_id, pool + " Return Rate")
  return (staked * currentReturn) / initialReturn - staked
}

export async function getStakingAPY(pool) {
  // TODO: In the future this will need to be more granular
  const expectedBonus = 1000 * 52 * 1000000
  const nltvlpromise = getAppField(ids.app.gard_staking, pool)
  const gardIssued = await getAppField(ids.app.validator, "GARD_ISSUED")
  return 100 * (stakingRevenuePercent * cdpInterest * gardIssued + expectedBonus) / (await nltvlpromise)
}

function isOptedIn(appID, info) {
  for (var i = 0; i < info["apps-local-state"].length; i++) {
    if (info["apps-local-state"][i]["id"] == appID) {
      return true;
    }
  }
  return false
}

export async function stake(pool, gardAmount) {
  setLoadingStage("Loading...");

  let infoPromise = accountInfo();
  let microGARDAmount = microGARD(gardAmount);

  let params = await getParams(1000);
  let info = await infoPromise;
  
  const gard_bal = getMicroGardBalance(info)
  if (gard_bal == null || gard_bal < microGARDAmount) {
    return {
      alert: true,
      text:
        "Insufficient GARD for transaction. Balance: " +
        (gard_bal / 1000000).toFixed(2).toString() +
        "\n" +
        "Required: " +
        (microGARDAmount / 1000000).toFixed(2).toString(),
    };
  }
  
  let txns = [];
  
  const optedIn = isOptedIn(ids.app.gard_staking, info);
  if (!optedIn) {
    // opt in txn
    let txnOptIn = algosdk.makeApplicationOptInTxnFromObject({
      from: info.address,
      suggestedParams: params,
      appIndex: ids.app.gard_staking,
    });
    txns.push(txnOptIn)
  }
  // txn 0 - app call
  let txn0 = algosdk.makeApplicationCallTxnFromObject({
    from: info.address,
    appIndex: ids.app.gard_staking,
    onComplete: 0,
    appArgs: [enc.encode("enter_" + pool + "_pool")],
    accounts: [],
    foreignApps: [ids.app.dummy],
    foreignAssets: [ids.asa.gard],
    suggestedParams: params,
  });
  txns.push(txn0)
  // txn 1 - entrance transfer
  let txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: algosdk.getApplicationAddress(ids.app.gard_staking),
    amount: microGARDAmount,
    suggestedParams: params,
    assetIndex: ids.asa.gard,
  });
  txns.push(txn1)
  let txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: algosdk.getApplicationAddress(ids.app.gard_staking),
    amount: 1000,
    suggestedParams: params,
  });
  txns.push(txn2)
  
  algosdk.assignGroupID(txns);
  
  setLoadingStage("Awaiting Signature from Algorand Wallet...");
  const signedGroup = await signGroup(info, txns);

  setLoadingStage("Confirming Transaction...");

  let stxns = [signedGroup[0].blob, signedGroup[1].blob, signedGroup[2].blob];
  if (signedGroup.length == 4) {
    stxns.push(signedGroup[3].blob)
  }

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
  let params = await getParams(3000);
  let info = await infoPromise;
  
  
  // txn 0 - app call
  let txn0 = algosdk.makeApplicationCallTxnFromObject({
    from: info.address,
    appIndex: ids.app.gard_staking,
    onComplete: 0,
    appArgs: [enc.encode("exit_" + pool + "_pool"), algosdk.encodeUint64(microGARDAmount)],
    accounts: [],
    foreignApps: [ids.app.dummy],
    foreignAssets: [ids.asa.gard], // XXX: When we do NLL, this will have to change
    suggestedParams: params,
  });
  // txn 1 - useless transaction, required for structure
  params.fee = 1000
  let txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: algosdk.getApplicationAddress(ids.app.gard_staking),
    amount: 0,
    suggestedParams: params,
  });
  // txn 2 - extra opcode budget
  let txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: algosdk.getApplicationAddress(ids.app.gard_staking),
    amount: 1000,
    suggestedParams: params,
  });

  let txns = [txn0, txn1, txn2];
  algosdk.assignGroupID(txns);
  
  setLoadingStage("Awaiting Signature from Algorand Wallet...");
  const signedGroup = await signGroup(info, txns);

  setLoadingStage("Confirming Transaction...");

  let stxns = [signedGroup[0].blob, signedGroup[1].blob, signedGroup[2].blob];

  let response = await sendTxn(
    stxns,
    "Successfully unstaked " + gardAmount + " GARD.", // TODO: if unstaking all, display that amount
  );
  setLoadingStage(null);

  return response;
}

export async function GardianStake(pool, amount) {
  setLoadingStage("Loading...");
  console.log(amount, typeof amount)
  let infoPromise = accountInfo();

  let params = await getParams(1000);
  let info = await infoPromise;
  
  const gardian_bal = getGardianBalance(info)
  if (gardian_bal == null || gardian_bal < amount) {
    return {
      alert: true,
      text:
        "Insufficient GARDIAN for transaction. Balance: " +
        (gardian_bal).toString() +
        "\n" +
        "Required: " +
        (amount).toString(),
    };
  }
  
  let txns = [];
  
  const optedIn = isOptedIn(ids.app.gardian_staking, info);
  if (!optedIn) {
    // opt in txn
    let txnOptIn = algosdk.makeApplicationOptInTxnFromObject({
      from: info.address,
      suggestedParams: params,
      appIndex: ids.app.gardian_staking,
    });
    txns.push(txnOptIn)
  }
  // txn 0 - app call
  let txn0 = algosdk.makeApplicationCallTxnFromObject({
    from: info.address,
    appIndex: ids.app.gardian_staking,
    onComplete: 0,
    appArgs: [enc.encode("enter_" + pool + "_pool")],
    accounts: [],
    foreignApps: [ids.app.dummy],
    foreignAssets: [ids.asa.gardian],
    suggestedParams: params,
  });
  txns.push(txn0)
  // txn 1 - entrance transfer
  let txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: algosdk.getApplicationAddress(ids.app.gardian_staking),
    amount: amount,
    suggestedParams: params,
    assetIndex: ids.asa.gardian,
  });
  txns.push(txn1)
  let txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: algosdk.getApplicationAddress(ids.app.gardian_staking),
    amount: 1000,
    suggestedParams: params,
  });
  txns.push(txn2)
  
  algosdk.assignGroupID(txns);
  
  setLoadingStage("Awaiting Signature from Algorand Wallet...");
  const signedGroup = await signGroup(info, txns);

  setLoadingStage("Confirming Transaction...");

  let stxns = [signedGroup[0].blob, signedGroup[1].blob, signedGroup[2].blob];
  if (signedGroup.length == 4) {
    stxns.push(signedGroup[3].blob)
  }

  let response = await sendTxn(
    stxns,
    "Successfully staked " + amount + " GARDIAN.",
  );
  setLoadingStage(null);

  return response;
}

export async function GardianUnstake(pool, amount) {
  setLoadingStage("Loading...");
  console.log(amount, typeof amount)
  let infoPromise = accountInfo();

  // XXX: This could be more optimally set -
  //      for locked pools if it's not a valid
  //      withdrawal period, only needs to be 1000
  let params = await getParams(3000);
  let info = await infoPromise;
  
  // txn 0 - app call
  let txn0 = algosdk.makeApplicationCallTxnFromObject({
    from: info.address,
    appIndex: ids.app.gardian_staking,
    onComplete: 0,
    appArgs: [enc.encode("exit_" + pool + "_pool"), algosdk.encodeUint64(amount)],
    accounts: [],
    foreignApps: [ids.app.dummy],
    foreignAssets: [ids.asa.gardian], 
    suggestedParams: params,
  });
  // txn 1 - useless transaction, required for structure
  params.fee = 1000
  let txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: algosdk.getApplicationAddress(ids.app.gardian_staking),
    amount: 0,
    suggestedParams: params,
  });
  // txn 2 - extra opcode budget
  let txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: algosdk.getApplicationAddress(ids.app.gardian_staking),
    amount: 1000,
    suggestedParams: params,
  });

  let txns = [txn0, txn1, txn2];
  algosdk.assignGroupID(txns);
  
  setLoadingStage("Awaiting Signature from Algorand Wallet...");
  const signedGroup = await signGroup(info, txns);

  setLoadingStage("Confirming Transaction...");

  let stxns = [signedGroup[0].blob, signedGroup[1].blob, signedGroup[2].blob];

  let response = await sendTxn(
    stxns,
    "Successfully unstaked " + amount + " GARDIAN.", // TODO: if unstaking all, display that amount
  );
  setLoadingStage(null);

  return response;
}