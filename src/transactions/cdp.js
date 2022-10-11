import algosdk from "algosdk";
import { ids } from "./ids";
import { cdpGen } from "./contracts";
import { setLoadingStage, getMicroGardBalance, microGARD, getAppField, cdpInterest, } from "./lib";
import {
  accountInfo,
  getParams,
  sendTxn,
  getWallet,
  signGroup,
} from "../wallets/wallets";
import {
  updateCommitmentFirestore,
  addCDPToFireStore,
  updateDBWebActions,
  updateLiquidationFirestore,
  addUserToGleam
} from "../components/Firebase";
import { VERSION, MINID, MAXID } from "../globals";

var $ = require("jquery");

const enc = new TextEncoder();
const MINRATIO = 140;
const fundingAmount = 300000;
let currentBigPrice = 816;
let currentDecimals = 3;
export let currentPrice = 0.30; // XXX: This should be kept close to the actual price - it is updated on initialization though

// XXX: All of these assume accountInfo has already been set! We should improve the UX of this after getting core functionality done
// XXX: All of these assume the user signs all transactions, we don't currently catch when a user doesn't do so!

export async function getPrice() {
  // TODO: cache price
  const currentPriceJSON = await $.getJSON(
    "https://storage.googleapis.com/algo-pricing-data-2022/latest_pricing.json",
  );
  currentPrice = currentPriceJSON.float_price;
  currentBigPrice = currentPriceJSON.price;
  currentDecimals = currentPriceJSON.decimals;
  return currentPrice;
}
// We immeadiately update the price in a background thread
getPrice();

export function calcRatio(collateral, minted, string = false) {
  // collateral: Microalgos
  // minted: GARD
  const ratio = (100 * collateral * currentPrice) / minted / 1000000;
  if (string) {
    return ratio.toFixed(0) + "%";
  }
  return ratio;
}

function getCDPState(cdpInfo) {
  let res = {
    state: 'closed',
  }
  if (cdpInfo.amount > 0) {
    res.state = 'opened';
    res.collateral = cdpInfo.amount;
    for (let i = 0; i < cdpInfo["apps-local-state"].length; i++) {
      if (cdpInfo["apps-local-state"][i].id == ids.app.validator) {
        const validatorInfo = cdpInfo["apps-local-state"][i];
        if (validatorInfo.hasOwnProperty("key-value")) {
          // This if statement checks for borked CDPs (first tx = good, second = bad)
          // Improvement: Do something with borked CDP
          for (let n = 0; n < validatorInfo["key-value"].length; n++) {
            if (validatorInfo["key-value"][n]["key"] == btoa("Principal")) {
              res.principal = validatorInfo["key-value"][n]["value"]["uint"];
            } else if (validatorInfo["key-value"][n]["key"] == btoa("SGARD_DEBT")) {
              res.debt = validatorInfo["key-value"][n]["value"]["uint"];
            }
          }
        } else {
          res.state = 'borked';
        }
        break;
      }
    }
  }
  
  return res
}

async function checkChainForCDP(address, id) {
  // This function checks for the existence of a CDP
  // This is done by getting the info, then
  const cdp = cdpGen(address, id);
  const info = await accountInfo(cdp.address);

  const state = getCDPState(info)
  
  if (state.state == 'borked') {
    updateCDP(address, id, state.collateral, 0, "borked");
    return true;
  }
  if (state.state == 'opened') {
    updateCDP(address, id, state.collateral, await sgardToGard(state.principal));
    return true;
  }
  removeCDP(address, id);
  return false;
}

export async function updateCDPs(address) {
  // Checks all CDPs by an address
  const CDPs = getCDPs();
  const accountCDPs = CDPs[address];
  let webcalls = 0;
  // Sets the frequency to double check CDPs
  const mins_to_refresh = 15;
  for (const x of Array(MAXID - MINID)
    .fill()
    .map((_, i) => i + MINID)) {
    if (
      !accountCDPs ||
      !accountCDPs.hasOwnProperty(x) ||
      accountCDPs[x]["checked"] + mins_to_refresh * 60 * 1000 < Date.now()
    ) {
      checkChainForCDP(address, x);
      webcalls += 1;
    }
    if (webcalls % 3 == 0) {
      await new Promise((r) => setTimeout(r, 500));
    }
    if (webcalls % 10 == 0) {
      await new Promise((r) => setTimeout(r, 4000));
    }
  }
}

async function findOpenID(address) {
  let CDPs = getCDPs();
  let accountCDPs = CDPs[address];
  for (const x of Array(MAXID - MINID)
    .fill()
    .map((_, i) => i + MINID)) {
    if (
      !accountCDPs ||
      !accountCDPs.hasOwnProperty(x) ||
      accountCDPs[x]["state"] == "closed"
    ) {
      const used = await checkChainForCDP(address, x);
      if (!used) {
        return x;
      }
    }
  }
  console.error("findOpenID: No open IDs!");
  return null;
}

export function verifyOptIn(info, assetID) {
  for (var i = 0; i < info["assets"].length; i++) {
    if (info["assets"][i]["asset-id"] == assetID) {
      return true;
    }
  }
  return false;
}

export function createOptInTxn(params, info, assetID) {
  params.fee = 1000;
  let txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: info.address,
    amount: 0,
    suggestedParams: params,
    assetIndex: assetID,
  });
  return txn;
}
var originalSetItem = sessionStorage.setItem;

sessionStorage.setItem = function (key, value) {
  var event = new Event("itemInserted");

  event.value = value;
  event.key = key;

  document.dispatchEvent(event);

  originalSetItem.apply(this, arguments);
};

function makeUpdateInterestTxn(userInfo, params) {
  return algosdk.makeApplicationCallTxnFromObject({
    from: userInfo.address,
    appIndex: ids.app.sgard_gard,
    onComplete: 0,
    appArgs: [enc.encode("update")],
    accounts: [],
    foreignApps: [ids.app.sgard_gard, ids.app.dao.interest],
    foreignAssets: [],
    suggestedParams: params,
  });
}

export async function openCDP(openingALGOs, openingGARD, commit, toWallet) {
  if (openingGARD < 1) {
    return {
      alert: true,
      text:
        "Opening GARD needs to be at least 1.\n" +
        "Your opening GARD is is: " +
        openingGARD,
    };
  }

  // Setting up promises
  const infoPromise = accountInfo();
  const paramsPromise = getParams(2000);
  const microOpeningGard = microGARD(openingGARD);

  // XXX: Could add a nice check here to make sure the ratio is acceptable

  const openingMicroALGOs = parseInt(openingALGOs * 1000000);
  const ratio = calcRatio(openingMicroALGOs, openingGARD);
  if (ratio < MINRATIO) {
    return {
      alert: true,
      text:
        "Ratio needs to be above " +
        MINRATIO +
        "%.\n" +
        "Your ratio is: " +
        calcRatio(openingMicroALGOs, openingGARD, true),
    };
  }

  // Part 1: Opting in, creating needed info, etc.
  setLoadingStage("Loading...");

  const info = await infoPromise;
  const accountIDPromise = findOpenID(info.address);

  if (
    307000 +
      openingMicroALGOs +
      100000 * (info["assets"].length + 4) >
    info["amount"]
  ) {
    return {
      alert: true,
      text:
        "Depositing this much collateral will put you below your minimum balance.\n" +
        "Your Maximum deposit is: " +
        (info["amount"] -
          307000 -
          100000 * (info["assets"].length + 4)) /
          1000000 +
        " Algos",
    };
  }

  let optedInGard = verifyOptIn(info, ids.asa.gard);
  let optedInGain = verifyOptIn(info, ids.asa.gain);
  let optedInGardian =
    VERSION.slice(0,7) != "TESTNET" ? verifyOptIn(info, ids.asa.gardian) : true; //no testnet id for Gardian so this should only verify opt in if hit on mainnet
  const accountID = await accountIDPromise;
  const cdp = cdpGen(info.address, accountID);

  let params = await paramsPromise;
  let txns = [];
  let optins = 0;
  params.fee = 5000;
  // txn 0 = update interest rate
  let txn0 = makeUpdateInterestTxn(info, params)
  txns.push(txn0)
  // Sets fee to 1000 for potential opt ins
  params.fee = 1000;
  // txn 1 = opt in to gard
  let txn1;
  if (!optedInGard) {
    txn1 = createOptInTxn(params, info, ids.asa.gard);
    txns.push(txn1);
    optins++;
  }
  // txn 2 = opt in to gain
  let txn2;
  if (!optedInGain) {
    txn2 = createOptInTxn(params, info, ids.asa.gain);
    txns.push(txn2);
    optins++;
  }
  // txn 3 = opt in to gardian
  let txn3;
  if (!optedInGardian) {
    txn3 = createOptInTxn(params, info, ids.asa.gardian);
    txns.push(txn3);
    optins++;
  }
  // resetting fee to 0
  params.fee = 0;
  // txn 4 = transfer algos
  let txn4 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: cdp.address,
    amount: openingMicroALGOs,
    suggestedParams: params,
  });
  txns.push(txn4)
  // txn 5 = opt in cdp txn
  let txn5 = algosdk.makeApplicationOptInTxnFromObject({
    from: cdp.address,
    suggestedParams: params,
    appIndex: ids.app.validator,
  });
  txns.push(txn5)
  // txn 6 = new position
  let txn6 = algosdk.makeApplicationCallTxnFromObject({
    from: info.address,
    appIndex: ids.app.validator,
    onComplete: 0,
    appArgs: [enc.encode("NewPosition"), algosdk.encodeUint64(microOpeningGard), algosdk.encodeUint64(accountID)],
    accounts: [cdp.address],
    foreignApps: [ids.app.oracle, ids.app.sgard_gard, ids.app.dao.interest],
    foreignAssets: [ids.asa.gard],
    suggestedParams: params,
  });
  txns.push(txn6)
  // Governance
  let txn8
  if (commit) {
    const stringVal = toWallet
      ? `af/gov1:j{"com":${openingMicroALGOs},"bnf":"${info.address}"}`
      : "af/gov1:j{\"com\":" + (openingMicroALGOs).toString() + "}";
    const note = enc.encode(stringVal);
    // txn 7: owner check
    params.fee = 2000;
    let txn7 = algosdk.makeApplicationCallTxnFromObject({
      from: info.address,
      appIndex: ids.app.validator,
      onComplete: 0,
      appArgs: [enc.encode("OwnerCheck"), algosdk.encodeUint64(accountID)],
      accounts: [cdp.address],
      foreignApps: [],
      foreignAssets: [],
      suggestedParams: params,
    });
    txns.push(txn7)
    // txn 8: Commit
    params.fee = 0;
    txn8 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: cdp.address,
      to: "7K5TT4US7M3FM7L3XBJXSXLJGF2WCXPBV2YZJJO2FH46VCZOS3ICJ7E4QU",
      amount: 0,
      note: note,
      suggestedParams: params,
    });
    txns.push(txn8)
  }
  
  // Signing transactions
  algosdk.assignGroupID(txns);
  setLoadingStage("Awaiting Signature from Algorand Wallet...");
  let _stxns = await signGroup(info, txns);
  
  setLoadingStage("Finalizing Transactions...");
  let stxns = []
  // stxn 0
  stxns.push(_stxns[0].blob)
  // stxn 1-3
  for (let i = 0; i < optins; i++) {
    stxns.push(_stxns[1 + i].blob)
  }
  // stxn 4
  stxns.push(_stxns[1 + optins].blob)
  // stxn 5
  let lsig = algosdk.makeLogicSig(cdp.logic, [algosdk.encodeUint64(2)]);
  let stxn5 = algosdk.signLogicSigTransactionObject(txn5, lsig);
  stxns.push(stxn5.blob)
  // stxn 6
  stxns.push(_stxns[3 + optins].blob)
  if (commit) {
    // stxn 7
    stxns.push(_stxns[4 + optins].blob)
    // stxn 8
    lsig = algosdk.makeLogicSig(cdp.logic, [algosdk.encodeUint64(0)]);
    let stxn8 = algosdk.signLogicSigTransactionObject(txn8, lsig);
    stxns.push(stxn8.blob)
  }
  
  setLoadingStage("Confirming Transactions...");
  
  let response = await sendTxn(
    stxns,
    "Successfully opened a new CDP.",
  );
  
  addCDPToFireStore(accountID, -openingMicroALGOs, microOpeningGard, 0);
  addUserToGleam("openCDP", info.address)
  
  if (commit) {
    await new Promise(r => setTimeout(r, 1000)); // TODO: More elegant fix (do it in the firestore library)
    updateCommitmentFirestore(info.address, accountID, openingMicroALGOs);
    response.text =
      response.text + "\nFull Balance committed to Governance Period #5!";
  }
  
  setLoadingStage(null);
  updateCDP(info.address, accountID, openingMicroALGOs, microOpeningGard);
  return response;
}

export async function mint(accountID, newGARD) {
  // Improvenment: Add catches
  //		Ratio is good

  // Core info
  setLoadingStage("Loading...");

  let info = await accountInfo();
  let cdp = cdpGen(info.address, accountID);
  let microNewGARD = microGARD(newGARD);

  let params = await getParams(3000);
  // txn 0 - update the interest rate
  let txn0 = makeUpdateInterestTxn(info, params)
  // txn1 - more gard!
  params.fee = 0
  let txn1 = algosdk.makeApplicationCallTxnFromObject({
    from: info.address,
    appIndex: ids.app.validator,
    onComplete: 0,
    appArgs: [enc.encode("MoreGARD"), algosdk.encodeUint64(microNewGARD)],
    accounts: [cdp.address],
    foreignApps: [ids.app.oracle, ids.app.sgard_gard, ids.app.dao.interest],
    foreignAssets: [ids.asa.gard],
    suggestedParams: params,
  });

  let txns = [txn0, txn1];
  algosdk.assignGroupID(txns);
  
  setLoadingStage("Awaiting Signature from Algorand Wallet...");
  const signedGroup = await signGroup(info, txns);

  setLoadingStage("Confirming Transaction...");

  let stxns = [signedGroup[0].blob, signedGroup[1].blob];

  let response = await sendTxn(
    stxns,
    "Successfully minted " + newGARD + " GARD.",
  );
  setLoadingStage(null);
  updateDBWebActions(3, accountID, 0, microNewGARD, 0, 0, 0);
  checkChainForCDP(info.address, accountID);

  return response;
}

export async function addCollateral(accountID, newAlgos, commit) {
  if (accountID == "N/A") {
    return {
      alert: true,
      text: "You can only add to existing CDPs",
    };
  } else if (newAlgos == null) {
    return {
      alert: true,
      text: "Cannot add 'null' ALGOS to a CDP!",
    };
  } else if (newAlgos <= 0) {
    return {
      alert: true,
      text: "Value needs to be greater than 0!",
    };
  }
  accountID = Number(accountID)

  setLoadingStage("Loading...");
  // Core info
  let info = await accountInfo();

  if (newAlgos + 100000 * (info["assets"].length + 1) > info["amount"]) {
    return {
      alert: true,
      text:
        "Depositing this much collateral will put you below your minimum balance.\n" +
        "Your Maximum deposit is: " +
        (newAlgos + 100000 * (info["assets"].length + 1)) / 1000000 +
        " Algos",
    };
  }
  let cdp = cdpGen(info.address, accountID);
  let microNewAlgos = parseInt(newAlgos * 1000000);

  let params = await getParams(1000);
  let txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: cdp.address,
    amount: microNewAlgos,
    suggestedParams: params,
  });
  let txn2 = makeUpdateInterestTxn(info, params)
  let txns = [txn1, txn2];
  
  let govAlgos = microNewAlgos
  let txn8
  if (commit) {
    const cdpInfo = await accountInfo(cdp.address)
    govAlgos += cdpInfo.amount
    const stringVal = `af/gov1:j{"com":${govAlgos},"bnf":"${info.address}"}`;
    const note = enc.encode(stringVal);
    // txn 7: owner check
    params.fee = 2000;
    let txn7 = algosdk.makeApplicationCallTxnFromObject({
      from: info.address,
      appIndex: ids.app.validator,
      onComplete: 0,
      appArgs: [enc.encode("OwnerCheck"), algosdk.encodeUint64(accountID)],
      accounts: [cdp.address],
      foreignApps: [],
      foreignAssets: [],
      suggestedParams: params,
    });
    txns.push(txn7)
    // txn 8: Commit
    params.fee = 0;
    txn8 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: cdp.address,
      to: "7K5TT4US7M3FM7L3XBJXSXLJGF2WCXPBV2YZJJO2FH46VCZOS3ICJ7E4QU",
      amount: 0,
      note: note,
      suggestedParams: params,
    });
    txns.push(txn8)
  }
  
  setLoadingStage("Awaiting Signature from Algorand Wallet...");
  
  algosdk.assignGroupID(txns);

  const signedGroup = await signGroup(info, txns);

  setLoadingStage("Confirming Transaction...");

  const stxns = [signedGroup[0].blob, signedGroup[1].blob];
  if (commit) {
    stxns.push(signedGroup[2].blob)
    const lsig = algosdk.makeLogicSig(cdp.logic, [algosdk.encodeUint64(0)]);
    let stxn8 = algosdk.signLogicSigTransactionObject(txn8, lsig);
    stxns.push(stxn8.blob)
  }

  const response = await sendTxn(
    stxns,
    "Successfully added " + newAlgos + " ALGOs as collateral.",
  );
  setLoadingStage(null);

  checkChainForCDP(info.address, accountID);
  updateDBWebActions(2, accountID, -microNewAlgos, 0, 0, 0, 2000);
  
  if (commit) {
    await new Promise(r => setTimeout(r, 1000)); // TODO: More elegant fix (do it in the firestore library)
    updateCommitmentFirestore(info.address, accountID, govAlgos);
    response.text =
      response.text + "\nFull Balance committed to Governance Period #5!";
  }

  return response;
}


async function sgardToGard(amt) {
  const conversionRate = await getAppField(ids.app.sgard_gard, "conversion_rate")
  return conversionRate * amt / (10 ** 10)
}


async function totalDebt(cdpInfo) {
  console.log(cdpInfo)
  return await sgardToGard(getCDPState(cdpInfo).debt)
}


export async function repayCDP(accountID, repayGARD) {

  // Promise setup
  setLoadingStage("Loading...");

  const accountInfoPromise = accountInfo();
  const paramsPromise = getParams(3000);
  const info = await accountInfoPromise;
  let cdp = cdpGen(info.address, accountID);
  let cdpInfo = await accountInfo(cdp.address);
  let params = await paramsPromise;
  
  let microRepayGARD = microGARD(repayGARD)
  console.log(microRepayGARD)
  
  let gard_debt = await totalDebt(cdpInfo);
  if (gard_debt - microRepayGARD < 1000000) {
    return {
      alert: true,
      text: "You must maintain a balance of 1 GARD to keep a CDP open!",
    };
  } 
  else if (getMicroGardBalance(info) < microRepayGARD){
    return {
      alert: true,
      text: "You have insufficient GARD to complete the transaction. You need " + 
      ((microRepayGARD/1000000).toFixed(3)).toString() + " GARD."
    };
  }
  
  // txn 0 - updated interest
  let txn0 = makeUpdateInterestTxn(info, params)
  // THROUGH HERE
  // txn 1 - closing check
  params.fee = 0
  let txn1 = algosdk.makeApplicationCallTxnFromObject({
    from: info.address,
    appIndex: ids.app.validator,
    onComplete: 0,
    appArgs: [enc.encode("Repay")],
    accounts: [cdp.address, info.address],
    foreignApps: [ids.app.sgard_gard],
    foreignAssets: [ids.asa.gard],
    suggestedParams: params,
  });
  // txn 2 - send the closing gard
  let txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: algosdk.getApplicationAddress(ids.app.validator),
    amount: microRepayGARD,
    suggestedParams: params,
    assetIndex: ids.asa.gard,
  });


  let txns = [txn0, txn1, txn2];
  algosdk.assignGroupID(txns);

  const signedGroupPromise = signGroup(info, [txn0, txn1, txn2]);

  setLoadingStage("Awaiting Signature from Algorand Wallet...");

  const signedGroup = await signedGroupPromise;

  setLoadingStage("Confirming Transaction...");

  let stxns = [signedGroup[0].blob, signedGroup[1].blob, signedGroup[2].blob];

  let response = await sendTxn(
    stxns,
    "Successfully repayed your cdp.",
  );
  setLoadingStage(null);
  removeCDP(info.address, accountID);
  checkChainForCDP(info.address, accountID);
  // updateDBWebActions(1, accountID, cdpBal - fee, -microRepayGARD, 0, 0, fee); TODO: Fix this
  return response;
}


export async function closeCDP(accountID) {

  // Promise setup
  setLoadingStage("Loading...");

  const accountInfoPromise = accountInfo();
  const paramsPromise = getParams(5000);
  const info = await accountInfoPromise;
  let cdp = cdpGen(info.address, accountID);
  let cdpInfo = await accountInfo(cdp.address);
  let params = await paramsPromise;

  let microRepayGARD = Math.trunc((await totalDebt(cdpInfo)) * (1 + (5 * cdpInterest)/365/24/60)) + 3000
  console.log(microRepayGARD)
  
  let gard_bal = getMicroGardBalance(info);
  if (gard_bal == null || gard_bal < microRepayGARD) {
    let mod = 0;
    if ((gard_bal / 1000000).toFixed(2) == (microRepayGARD / 1000000).toFixed(2)) {
      mod = .01;
    }
    return {
      alert: true,
      text:
        "Insufficient GARD for transaction. Balance: " +
        (gard_bal / 1000000).toFixed(2).toString() +
        "\n" +
        "Required: " +
        (microRepayGARD / 1000000 + mod).toFixed(2).toString(),
    };
  }
  
  console.log(microRepayGARD)
  
  // txn 0 - updated interest
  let txn0 = makeUpdateInterestTxn(info, params)
  // txn 1 - closing check
  params.fee = 0
  let txn1 = algosdk.makeApplicationCallTxnFromObject({
    from: cdp.address,
    appIndex: ids.app.validator,
    onComplete: 2,
    appArgs: [enc.encode("Close")],
    accounts: [cdp.address, info.address],
    foreignApps: [ids.app.sgard_gard],
    foreignAssets: [ids.asa.gard],
    suggestedParams: params,
  });
  // txn 2 - send the closing gard
  let txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: algosdk.getApplicationAddress(ids.app.validator),
    amount: microRepayGARD,
    suggestedParams: params,
    assetIndex: ids.asa.gard,
  });
  // txn 3 - send the collateral
  let txn3 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: cdp.address,
    to: info.address,
    closeRemainderTo: info.address,
    amount: 0,
    suggestedParams: params,
  });
  
  console.log(txn1)
  console.log(txn3)


  let txns = [txn0, txn1, txn2, txn3];
  algosdk.assignGroupID(txns);

  const signedGroupPromise = signGroup(info, [txn0, txn1, txn2, txn3]);

  setLoadingStage("Awaiting Signature from Algorand Wallet...");

  let lsig = algosdk.makeLogicSig(cdp.logic, [algosdk.encodeUint64(1)]);
  const stxn1 = algosdk.signLogicSigTransactionObject(txn1, lsig);
  const stxn3 = algosdk.signLogicSigTransactionObject(txn3, lsig);
  const signedGroup = await signedGroupPromise;

  setLoadingStage("Confirming Transaction...");

  let stxns = [signedGroup[0].blob, stxn1.blob, signedGroup[2].blob, stxn3.blob];

  let response = await sendTxn(
    stxns,
    "Successfully closed your cdp.",
  );
  setLoadingStage(null);
  removeCDP(info.address, accountID);
  // updateDBWebActions(1, accountID, cdpBal - fee, -microRepayGARD, 0, 0, fee); TODO: Fix this
  return response;
}

function updateCDP(
  address,
  id,
  newCollateral,
  newDebt,
  state = "open",
  commitment = 0, // TODO: Go through and fix commitment
) {
  // Could eventually add some metadata for better caching
  let CDPs = getCDPs();
  let accountCDPs = CDPs[address];
  if (accountCDPs == null) {
    accountCDPs = {};
  }
  if (accountCDPs.hasOwnProperty(id)) {
    if (accountCDPs[id].hasOwnProperty("committed")) {
      commitment = accountCDPs[id]["committed"];
    }
  }
  accountCDPs[id] = {
    collateral: newCollateral,
    debt: newDebt, // This is not total debt, this is principal
    checked: Date.now(),
    state: state,
    committed: commitment,
  };
  CDPs[address] = accountCDPs;
  localStorage.setItem("CDPs", JSON.stringify(CDPs));
}

function removeCDP(address, id) {
  updateCDP(address, id, 0, 0, "closed");
}

export function getCDPs() {
  // V1: Only loads from cache
  // CDPs is a list of CDP dictionaries. These dictionaries include:
  // {
  //   collateral: MICROALGOS,
  //   debt: MICROGARD,
  // }
  let CDPs = localStorage.getItem("CDPs");
  if (CDPs !== null) {
    return JSON.parse(CDPs);
  }
  return {};
}

export async function commitCDP(account_id, amount, toWallet) {
  // Setting up promises
  setLoadingStage("Loading...");
  const infoPromise = accountInfo();
  const paramsPromise = getParams(2000);

  const info = await infoPromise;

  const stringVal = toWallet
    ? `af/gov1:j{"com":${parseInt(amount * 1000000)},"bnf":"${info.address}"}`
    : "af/gov1:j{\"com\":" + parseInt(amount * 1000000).toString() + "}";

  const note = enc.encode(stringVal);

  let cdp = cdpGen(info.address, account_id);

  let params = await paramsPromise;
  let txn1 = algosdk.makeApplicationCallTxnFromObject({
    from: info.address,
    appIndex: ids.app.validator,
    onComplete: 0,
    appArgs: [enc.encode("OwnerCheck"), algosdk.encodeUint64(account_id)],
    accounts: [cdp.address],
    suggestedParams: params,
  });
  params.fee = 0;
  let txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: cdp.address,
    to: "7K5TT4US7M3FM7L3XBJXSXLJGF2WCXPBV2YZJJO2FH46VCZOS3ICJ7E4QU",
    amount: 0,
    note: note,
    suggestedParams: params,
  });
  let txns = [txn1, txn2];
  algosdk.assignGroupID(txns);

  const signedGroupPromise = signGroup(info, txns);

  setLoadingStage("Awaiting Signature from Algorand Wallet...");

  let lsig = algosdk.makeLogicSig(cdp.logic, [algosdk.encodeUint64(0)]);
  const stxn2 = algosdk.signLogicSigTransactionObject(txn2, lsig);
  const signedGroup = await signedGroupPromise;
  const stxn1 = signedGroup[0];

  setLoadingStage("Committing ALGOs...");

  let stxns = [stxn1.blob, stxn2.blob];
  let response = await sendTxn(
    stxns,
    "Succesfully committed your algos to governance! You may verify" +
      " <a href=\"" +
      "https://governance.algorand.foundation/governance-period-5/governors/" +
      cdp.address +
      "\">here</a>.\n",
    true,
  );
  setLoadingStage(null);
  updateCommitmentFirestore(
    info.address,
    account_id,
    parseInt(amount * 1000000),
  );
  return response;
}

export async function voteCDP(account_id, option1, option2) {
  // Setting up promises
  setLoadingStage("Loading...");
  const infoPromise = accountInfo();
  const paramsPromise = getParams(2000);

  const stringVal = "af/gov1:j[6,\"" + option1 + "\",\"" + option2 + "\"]";

  const note = enc.encode(stringVal);

  const info = await infoPromise;

  let cdp = cdpGen(info.address, account_id);

  let params = await paramsPromise;
  let txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: info.address,
    amount: parseInt(account_id),
    suggestedParams: params,
  });
  params.fee = 0;
  let txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: cdp.address,
    to: "UD33QBPIM4ZO4B2WK5Y5DYT5J5LYY5FA3IF3G4AVYSCWLCSMS5NYDRW6GE",
    amount: 0,
    note: note,
    suggestedParams: params,
  });
  let txns = [txn1, txn2];
  algosdk.assignGroupID(txns);

  const signedGroupPromise = signGroup(info, txns);

  setLoadingStage("Awaiting Signature from Algorand Wallet...");

  let lsig = algosdk.makeLogicSig(cdp.logic, [algosdk.encodeUint64(0)]);
  const stxn2 = algosdk.signLogicSigTransactionObject(txn2, lsig);
  const signedGroup = await signedGroupPromise;
  const stxn1 = signedGroup[0];
  setLoadingStage("Sending Votes...");

  let stxns = [stxn1.blob, stxn2.blob];
  let response = await sendTxn(
    stxns,
    "Successfully voted for options " +
      option1 +
      " and " +
      option2 +
      "."
  );
  updateDBWebActions(6, account_id, 0, 0, 0, 0, 2000);
  setLoadingStage(null);
  return response;
}

