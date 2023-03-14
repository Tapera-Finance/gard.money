import algosdk from "algosdk";
import { ids } from "./ids";
import { setLoadingStage, microGARD, getMicroGardBalance, getAppField, cdpInterest, getLocalAppField, getTokenBalance } from "./lib"
import { accountInfo, getParams, signGroup, sendTxn, getAppByID, updateWalletInfo } from "../wallets/wallets";
import { verifyOptIn, createOptInTxn } from "./cdp";

const enc = new TextEncoder();
let stakingRevenuePercent = .8; // TODO: Get this dynamically off the chain

// Use only for pools with same ASA Staked as Paid Out
export async function getAccruedRewards(pool, app_id=ids.app.gard_staking, reward_id=ids.asa.gard, alt_phrase=null) {
  let phrase = app_id === ids.app.gard_staking ? " GARD Staked" : " GARDIAN Staked";
  if (alt_phrase !== null){
    phrase = alt_phrase;
  }
  const staked = getLocalAppField(app_id, pool + phrase);
  const initialReturn = getLocalAppField(app_id, pool + " Initial Return Rate");
  if (staked === undefined || initialReturn === undefined) {
    return 0;
  }
  const app_address = algosdk.getApplicationAddress(app_id)
  const current_assets = (await accountInfo(app_address)).assets
  const current_bal = current_assets.filter( x => x["asset-id"] === reward_id)[0].amount

  const global_state = (await getAppByID(app_id)).params["global-state"] 
  const global_dict = Object.fromEntries(global_state.map(x => {
    let ret_val = x.value.type === 2 ? x.value.uint : x.value.bytes
    return [atob(x.key), ret_val]
  }))

  // This calculation needs to be redone when multiple pools are in use for GARD/GARDIAN staking
  const accuracy = 1e9
  const unclaimed = current_bal - global_dict[pool] === 0 ? global_dict[pool + " Return Rate"] : Math.floor((accuracy + Math.floor((accuracy*(current_bal - global_dict[pool])) / global_dict[pool])) * global_dict[pool + " Return Rate"] / accuracy)
  console.log(unclaimed, app_id)
  const currentReturn = unclaimed;

  // Something is wrong for the asastats pool and IDK why
  const divisor = app_id !== ids.app.partner.asastats ? 1 : 1e6

  return ((staked * currentReturn) / initialReturn - staked)/divisor;
}

export async function getStakingAPY(pool) {
  // TODO: In the future this will need to be more granular
  const expectedBonus = 1000 * 52 * 1000000;
  const nltvlpromise = getAppField(ids.app.gard_staking, pool);
  const gardIssued = await getAppField(ids.app.validator, "GARD_ISSUED");
  return 100 * (stakingRevenuePercent * cdpInterest * gardIssued + expectedBonus) / (await nltvlpromise);
}

function isOptedIn(appID, info) {
  for (var i = 0; i < info["apps-local-state"].length; i++) {
    if (info["apps-local-state"][i]["id"] == appID) {
      return true;
    }
  }
  return false;
}

export async function stake(pool, gardAmount) {
  setLoadingStage("Loading...");

  let infoPromise = accountInfo();
  let microGARDAmount = microGARD(gardAmount);

  let params = await getParams(1000);
  let info = await infoPromise;
  
  const gard_bal = getMicroGardBalance(info);
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
    txns.push(txnOptIn);
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
  txns.push(txn0);
  // txn 1 - entrance transfer
  let txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: algosdk.getApplicationAddress(ids.app.gard_staking),
    amount: microGARDAmount,
    suggestedParams: params,
    assetIndex: ids.asa.gard,
  });
  txns.push(txn1);
  let txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: algosdk.getApplicationAddress(ids.app.gard_staking),
    amount: 1000,
    suggestedParams: params,
  });
  txns.push(txn2);
  
  algosdk.assignGroupID(txns);
  
  setLoadingStage("Awaiting Signature from Algorand Wallet...");
  const signedGroup = await signGroup(info, txns);

  setLoadingStage("Confirming Transaction...");

  let stxns = [signedGroup[0].blob, signedGroup[1].blob, signedGroup[2].blob];
  if (signedGroup.length == 4) {
    stxns.push(signedGroup[3].blob);
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
  params.fee = 1000;
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
  console.log(amount, typeof amount);
  let infoPromise = accountInfo();

  let params = await getParams(1000);
  let info = await infoPromise;
  

  const gardian_bal = getTokenBalance(info, ids.asa.gardian)
  if (gardian_bal == 0 || gardian_bal < amount) {
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
    txns.push(txnOptIn);
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
  txns.push(txn0);
  // txn 1 - entrance transfer
  let txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: algosdk.getApplicationAddress(ids.app.gardian_staking),
    amount: amount,
    suggestedParams: params,
    assetIndex: ids.asa.gardian,
  });
  txns.push(txn1);
  let txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: algosdk.getApplicationAddress(ids.app.gardian_staking),
    amount: 1000,
    suggestedParams: params,
  });
  txns.push(txn2);
  
  algosdk.assignGroupID(txns);
  
  setLoadingStage("Awaiting Signature from Algorand Wallet...");
  const signedGroup = await signGroup(info, txns);

  setLoadingStage("Confirming Transaction...");

  let stxns = [signedGroup[0].blob, signedGroup[1].blob, signedGroup[2].blob];
  if (signedGroup.length == 4) {
    stxns.push(signedGroup[3].blob);
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
  console.log(amount, typeof amount);
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
  params.fee = 1000;
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

export async function GlitterStake(amount){
  setLoadingStage("Loading...");
  console.log(amount, typeof amount)
  amount = parseInt(amount * 1e6)
  let infoPromise = accountInfo();

  let params = await getParams(1000);
  let info = await infoPromise;
  
  const glitter_bal = getTokenBalance(info, ids.asa.glitter)
  if (glitter_bal == 0 || glitter_bal < amount) {
    return {
      alert: true,
      text:
        "Insufficient XGLI for transaction. Balance: " +
        (glitter_bal == null ? 0 : glitter_bal).toString() +
        "\n" +
        "Required: " +
        (amount).toString(),
    };
  }
  
  let txns = [];
  let optedIn = isOptedIn(ids.app.glitter.xsol, info);
  if (!optedIn) {
    // opt in txn
    let txnOptIn = algosdk.makeApplicationOptInTxnFromObject({
      from: info.address,
      suggestedParams: params,
      appIndex: ids.app.glitter.xsol,
    });
    txns.push(txnOptIn)
  }
  optedIn = verifyOptIn(info, ids.asa.xsol)
  if (!optedIn) {
    // opt in txn
    let txnOptIn = createOptInTxn(params, info, ids.asa.xsol)
    txns.push(txnOptIn)
  }
  // txn 0 - app call
  params.fee = 3000;
  let txn0 = algosdk.makeApplicationCallTxnFromObject({
    from: info.address,
    appIndex: ids.app.glitter.xsol,
    onComplete: 0,
    appArgs: [enc.encode("enter_NL_pool")],
    accounts: [],
    foreignApps: [ids.app.dummy],
    foreignAssets: [ids.asa.glitter, ids.asa.xsol],
    suggestedParams: params,
  });
  txns.push(txn0)
  // txn 1 - entrance transfer
  params.fee = 1000;
  let txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: algosdk.getApplicationAddress(ids.app.glitter.xsol),
    amount: amount,
    suggestedParams: params,
    assetIndex: ids.asa.glitter,
  });
  txns.push(txn1)
  let txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: algosdk.getApplicationAddress(ids.app.glitter.xsol),
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
  else if (signedGroup.length == 5) {
    stxns.push(signedGroup[3].blob)
    stxns.push(signedGroup[4].blob)
  }

  let response = await sendTxn(
    stxns,
    "Successfully staked " + ((amount/1e6).toFixed(3)) + " XGLI. Any xSol rewards have been deposited into your account.",
  );
  setLoadingStage(null);

  return response;
}

export async function GlitterUnstake(amount){
  setLoadingStage("Loading...");
  console.log(amount, typeof amount)
  amount = parseInt(amount * 1e6)
  let infoPromise = accountInfo();

  // XXX: This could be more optimally set -
  //      for locked pools if it's not a valid
  //      withdrawal period, only needs to be 1000
  let params = await getParams(4000);
  let info = await infoPromise;
  
  // txn 0 - app call
  let txn0 = algosdk.makeApplicationCallTxnFromObject({
    from: info.address,
    appIndex: ids.app.glitter.xsol,
    onComplete: 0,
    appArgs: [enc.encode("exit_NL_pool"), algosdk.encodeUint64(amount)],
    accounts: [],
    foreignApps: [ids.app.dummy],
    foreignAssets: [ids.asa.glitter, ids.asa.xsol], 
    suggestedParams: params,
  });
  // txn 1 - useless transaction, required for structure
  params.fee = 1000
  let txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: algosdk.getApplicationAddress(ids.app.glitter.xsol),
    amount: 0,
    suggestedParams: params,
  });
  // txn 2 - extra opcode budget
  let txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: algosdk.getApplicationAddress(ids.app.glitter.xsol),
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
    "Successfully unstaked " + (amount/1e6).toFixed(3) + " XGLI. Any xSol rewards have been deposited into your account.", 
  );
  setLoadingStage(null);

  return response;
}

export async function getGlitterTVL(){
  const amount = await getAppField(ids.app.glitter.xsol, "NL")
  const field2 = await getAppField(ids.app.glitter.xsol, "NL Return Rate")
  return [(amount * 0.00321601 / 1e6).toFixed(2), amount, field2]
}

export async function PartnerStake(amount, stake_id, reward_id, app_id, stake_decimals=6){
  setLoadingStage("Loading...");
  console.log(amount, typeof amount)
  amount = parseInt(amount * (10 ** stake_decimals))
  let infoPromise = accountInfo();

  let params = await getParams(1000);
  let info = await infoPromise;
  
  const glitter_bal = getTokenBalance(info, stake_id)
  if (glitter_bal == 0 || glitter_bal < amount) {
    return {
      alert: true,
      text:
        "Insufficient tokens for transaction. Balance: " +
        (glitter_bal == null ? 0 : glitter_bal).toString() +
        "\n" +
        "Required: " +
        (amount/(10 ** stake_decimals)).toString(),
    };
  }
  
  let txns = [];
  let optedIn = isOptedIn(app_id, info);
  if (!optedIn) {
    // opt in txn
    let txnOptIn = algosdk.makeApplicationOptInTxnFromObject({
      from: info.address,
      suggestedParams: params,
      appIndex: app_id,
    });
    txns.push(txnOptIn)
  }
  optedIn = verifyOptIn(info, reward_id)
  if (!optedIn) {
    // opt in txn
    let txnOptIn = createOptInTxn(params, info, reward_id)
    txns.push(txnOptIn)
  }
  // txn 0 - app call
  params.fee = 3000;
  let txn0 = algosdk.makeApplicationCallTxnFromObject({
    from: info.address,
    appIndex: app_id,
    onComplete: 0,
    appArgs: [enc.encode("enter_NL_pool")],
    accounts: [],
    foreignApps: [ids.app.dummy],
    foreignAssets: [stake_id, reward_id],
    suggestedParams: params,
  });
  txns.push(txn0)
  // txn 1 - entrance transfer
  params.fee = 1000;
  let txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: algosdk.getApplicationAddress(app_id),
    amount: amount,
    suggestedParams: params,
    assetIndex: stake_id,
  });
  txns.push(txn1)
  let txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: algosdk.getApplicationAddress(app_id),
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
  else if (signedGroup.length == 5) {
    stxns.push(signedGroup[3].blob)
    stxns.push(signedGroup[4].blob)
  }

  let response = await sendTxn(
    stxns,
    "Successfully staked " + ((amount/(10 ** stake_decimals)).toFixed(3)) + " tokens.",
  );
  setLoadingStage(null);

  return response;
}

export async function PartnerUnstake(amount, stake_id, reward_id, app_id, stake_decimals=6){
  setLoadingStage("Loading...");
  console.log(amount, typeof amount)
  amount = parseInt(amount * (10 ** stake_decimals))
  let infoPromise = accountInfo();

  // XXX: This could be more optimally set -
  //      for locked pools if it's not a valid
  //      withdrawal period, only needs to be 1000
  let params = await getParams(4000);
  let info = await infoPromise;
  
  // txn 0 - app call
  let txn0 = algosdk.makeApplicationCallTxnFromObject({
    from: info.address,
    appIndex: app_id,
    onComplete: 0,
    appArgs: [enc.encode("exit_NL_pool"), algosdk.encodeUint64(amount)],
    accounts: [],
    foreignApps: [ids.app.dummy],
    foreignAssets: [stake_id, reward_id], 
    suggestedParams: params,
  });
  // txn 1 - useless transaction, required for structure
  params.fee = 1000
  let txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: algosdk.getApplicationAddress(app_id),
    amount: 0,
    suggestedParams: params,
  });
  // txn 2 - extra opcode budget
  let txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: algosdk.getApplicationAddress(app_id),
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
    "Successfully unstaked " + (amount/(10 ** stake_decimals)).toFixed(3) + " tokens.", 
  );
  setLoadingStage(null);

  return response;
}