import algosdk from "algosdk";
import {
  validatorID,
  gardID,
  gainID,
  gardianID,
  oracleID,
  openFeeID,
  closeFeeID,
} from "./ids";
import { reserve, treasury, cdpGen } from "./contracts";
import {
  accountInfo,
  getParams,
  sendTxn,
  getWallet,
  getAppByID,
  signGroup,
} from "../wallets/wallets";
import { getCurrentUnix } from "../prices/prices";
import { VERSION } from "../globals";

var $ = require("jquery");

const enc = new TextEncoder();

const MINID = 7;
const MAXID = 127;
const MINRATIO = 140;
const fundingAmount = 300000;
let currentBigPrice = 816;
let currentDecimals = 3;
export let currentPrice = 0.816; // XXX: This should be kept close to the actual price - it is updated on initialization though
let currentFee = {
  open: 20, // XXX: This should be kepy close to the actual fee - it is updated on initialization though
  close: 20,
};

// XXX: All of these assume accountInfo has already been set! We should improve the UX of this after getting core functionality done
// XXX: All of these assume the user signs all transactions, we don't currently catch when a user doesn't do so!

function microGARD(GARD) {
  // Helper function so we don't type the number of zeros anytime
  return parseInt(GARD * 1000000);
}

function getGardBalance(info) {
  for (var i = 0; i < info["assets"].length; i++) {
    if (info["assets"][i]["asset-id"] == gardID) {
      return info["assets"][i]["amount"];
    }
  }
  return null;
}

export async function getPrice() {
  // Could cache price eventually
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

const encodedFee = "V2lubmVy";
async function getFee(close = false) {
  let id = openFeeID;
  if (close) {
    id = closeFeeID;
  }
  const app = await getAppByID(id);
  const state = app["params"]["global-state"];

  let feeRate;

  for (let n = 0; n < state.length; n++) {
    if (state[n]["key"] == encodedFee) {
      feeRate = state[n]["value"]["uint"];
      break;
    }
  }

  if (close) {
    currentFee.close = feeRate;
  } else {
    currentFee.open = feeRate;
  }
  return currentFee;
}
// We immeadiately update the fee in a background thread
// getFee(true)
// getFee(false)
// This was causing a circular dependency

export function calcRatio(collateral, minted, string = false) {
  // collateral: Microalgos
  // minted: GARD
  const ratio = (100 * collateral * currentPrice) / minted / 1000000;
  if (string) {
    return ratio.toFixed(0) + "%";
  }
  return ratio;
}

export function calcDevFees(amount, close = false) {
  let fee = currentFee.open;
  if (close) {
    fee = currentFee.close;
  }
  return (
    Math.floor(
      (amount * fee * 10 ** currentDecimals) / (1000 * currentBigPrice),
    ) + 10000
  );
}

async function calcDevFeesCurrent(amount, close = false) {
  await Promise.all([getPrice(), getFee(close)]);
  return calcDevFees(amount, close);
}

const EncodedDebt = "R0FSRF9ERUJU";

async function checkChainForCDP(address, id) {
  // This function checks for the existence of a CDP
  // This is done by getting the info, then
  const cdp = cdpGen(address, id);
  const info = await accountInfo(cdp.address);

  if (info.amount > 0) {
    let collateral = info.amount;
    if (VERSION == "TESTNET1") {
      collateral = collateral - fundingAmount;
    }
    let debt;
    // Done by checking the validator local state via the cdp address
    for (let i = 0; i < info["apps-local-state"].length; i++) {
      if (info["apps-local-state"][i].id == validatorID) {
        const validatorInfo = info["apps-local-state"][i];
        if (validatorInfo.hasOwnProperty("key-value")) {
          // This if statement checks for borked CDPs (first tx = good, second = bad)
          // TODO: Do something with borked CDPs

          for (let n = 0; n < validatorInfo["key-value"].length; n++) {
            if (validatorInfo["key-value"][n]["key"] == EncodedDebt) {
              debt = validatorInfo["key-value"][n]["value"]["uint"];
              break;
            }
          }
        } else {
          updateCDP(address, id, collateral, 0, "borked");
        }
        break;
      }
    }
    if (debt) {
      updateCDP(address, id, collateral, debt);
    }
    return true;
  }
  removeCDP(address, id);
  return false;
}

// Sets the frequency to double check CDPs
const mins_to_refresh = 15;

export async function updateCDPs(address) {
  // Checks all CDPs by an address
  const CDPs = getCDPs();
  const accountCDPs = CDPs[address];
  let webcalls = 0;
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
        console.log("Found open cdp: " + x);
        return x;
      }
    }
  }
  console.error("findOpenID: No open IDs!");
  return null;
}

export function verifyOptIn(info, assetID) {
  let verified = false;
  for (var i = 0; i < info["assets"].length; i++) {
    if (info["assets"][i]["asset-id"] == assetID) {
      verified = true;
    }
  }
  return verified;
}

export function createOptInTxn(params, info, assetID) {
  params.fee = 1000;
  console.log("creating opt in for ", assetID);
  let txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: info.address,
    amount: 0,
    suggestedParams: params,
    assetIndex: assetID,
  });
  return txn;
}

export async function openCDP(openingALGOs, openingGARD) {
  if (openingGARD < 1) {
    return {
      alert: true,
      text: "Opening GARD needs to be at least 1.\n" +
        "Your opening GARD is is: " +
        openingGARD
    }
  }

  // Setting up promises
  const infoPromise = accountInfo();
  const microOpeningGard = microGARD(openingGARD);
  const devFeesPromise = calcDevFeesCurrent(microOpeningGard, false);
  const paramsPromise = getParams(2000);

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

  const info = await infoPromise;
  const devFees = await devFeesPromise;
  const accountIDPromise = findOpenID(info.address);

  if (
    307000 +
      openingMicroALGOs +
      100000 * (info["assets"].length + 4) +
      devFees >
    info["amount"]
  ) {
    return {
      alert: true,
      text:
        "Depositing this much collateral will put you below your minimum balance.\n" +
        "Your Maximum deposit is: " +
        (info["amount"] -
          devFees -
          307000 -
          100000 * (info["assets"].length + 4)) /
          1000000 +
        " Algos",
    };
  }

  let optedInGard = verifyOptIn(info, gardID);
  let optedInGain = verifyOptIn(info, gainID);
  let optedInGardian =
    VERSION != "TESTNET1" ? verifyOptIn(info, gardianID) : true; //no testnet id for Gardian so this should only verify opt in if hit on mainnet
  const accountID = await accountIDPromise;
  const cdp = cdpGen(info.address, accountID);

  let params = await paramsPromise;
  let txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: info.address,
    suggestedParams: params,
    to: cdp.address,
    amount: fundingAmount, // XXX: We should code this as a const somplace / double check this
  });

  params.fee = 0;
  let txn2 = algosdk.makeApplicationOptInTxnFromObject({
    from: cdp.address,
    suggestedParams: params,
    appIndex: validatorID,
  });
  let r1_txns = [txn1, txn2];
  params.fee = 1000;
  let txn3;
  if (!optedInGard) {
    txn3 = createOptInTxn(params, info, gardID);
    r1_txns.push(txn3);
  }
  let txn5;
  if (!optedInGain) {
    txn5 = createOptInTxn(params, info, gainID);
    r1_txns.push(txn5);
  }
  let txn6;
  if (!optedInGardian) {
    txn6 = createOptInTxn(params, info, gardianID);
    r1_txns.push(txn6);
  }
  algosdk.assignGroupID(r1_txns);

  // txn 2
  let lsig = algosdk.makeLogicSig(cdp.logic, [algosdk.encodeUint64(4)]);
  let stxn2 = algosdk.signLogicSigTransactionObject(txn2, lsig);

  // Part 2: Actually issuing the $

  let collateral = openingMicroALGOs;
  if (VERSION != "TESTNET1") {
    collateral -= fundingAmount;
  }

  params = await getParams(0);
  // This time could be delayed up to 20 seconds
  let start_time = (await getCurrentUnix()) + 30;
  txn1 = algosdk.makeApplicationCallTxnFromObject({
    from: info.address,
    appIndex: validatorID,
    onComplete: 0,
    appArgs: [enc.encode("NewPosition"), algosdk.encodeUint64(start_time)],
    accounts: [cdp.address],
    foreignApps: [oracleID, openFeeID],
    foreignAssets: [gardID, accountID],
    suggestedParams: params,
  });
  params.fee = 4000;
  
  txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: cdp.address,
    amount: collateral,
    suggestedParams: params,
  });
  params.fee = 0;
  txn3 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: treasury.address,
    amount: devFees,
    suggestedParams: params,
  });
  let txn4 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: reserve.address,
    to: info.address,
    amount: microOpeningGard,
    suggestedParams: params,
    assetIndex: gardID,
  });
  let r2_txns = [txn1, txn2, txn3, txn4];
  algosdk.assignGroupID(r2_txns);
  // r2_txns.splice(3, 1)
  let txns = r1_txns.concat(r2_txns);
  let stxns = await signGroup(info, txns);
  console.log(stxns);

  // TODO: Adjust indexing based on including all txns

  let r1_stxns = [stxns[0].blob, stxn2.blob];
  // txn3
  let start = 0;
  if (!optedInGard) {
    r1_stxns.push(stxns[2+start].blob);
    start += 1;
  }
  if (!optedInGain) {
    r1_stxns.push(stxns[2+start].blob);
    start += 1;
  }
  if (!optedInGardian) {
    r1_stxns.push(stxns[2+start].blob);
    start += 1;
  }
  if ((await getCurrentUnix()) - start_time > 30) {
    return {
      alert: true,
      text: "Aborted: Transaction review and signing took too long. Please try again.",
    };
  }

  const sendTxn1Promise = sendTxn(r1_stxns);

  lsig = algosdk.makeLogicSig(reserve.logic, [algosdk.encodeUint64(1)]);
  let stxn4 = algosdk.signLogicSigTransactionObject(txn4, lsig);

  let stxns2 = [
    stxns[start + 2].blob,
    stxns[start + 3].blob,
    stxns[start + 4].blob,
    stxn4.blob,
  ];
  let response = await sendTxn1Promise;
  response = await sendTxn(stxns2, "Successfully opened a CDP with ID: " + accountID + ".");
  updateCDP(info.address, accountID, openingMicroALGOs, microOpeningGard);
  return response;
  // XXX: May want to do something else besides this, a promise? loading screen?
}

export async function mint(accountID, newGARD) {
  // TODO: Add catches
  //		Ratio is good

  // Core info
  let info = await accountInfo();
  let cdp = cdpGen(info.address, accountID);
  let microNewGARD = microGARD(newGARD);

  let params = await getParams(0);
  let txn1 = algosdk.makeApplicationCallTxnFromObject({
    from: cdp.address,
    appIndex: validatorID,
    onComplete: 0,
    appArgs: [enc.encode("MoreGARD")],
    accounts: [cdp.address],
    foreignApps: [oracleID, openFeeID],
    foreignAssets: [gardID],
    suggestedParams: params,
  });
  params.fee = 3000;
  const devFees = await calcDevFeesCurrent(microNewGARD, false);
  let txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: treasury.address,
    amount: devFees,
    suggestedParams: params,
  });
  params.fee = 0;
  let txn3 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: reserve.address,
    to: info.address,
    amount: microNewGARD,
    suggestedParams: params,
    assetIndex: gardID,
  });

  let txns = [txn1, txn2, txn3];
  algosdk.assignGroupID(txns);
  const signedGroupPromise = signGroup(info, txns);

  let lsigCDP = algosdk.makeLogicSig(cdp.logic, [algosdk.encodeUint64(5)]);
  let lsigReserve = algosdk.makeLogicSig(reserve.logic, [
    algosdk.encodeUint64(2),
  ]);

  let stxn1 = algosdk.signLogicSigTransactionObject(txn1, lsigCDP);
  let stxn3 = algosdk.signLogicSigTransactionObject(txn3, lsigReserve);
  let signedGroup = await signedGroupPromise;
  let stxn2 = signedGroup[1];

  let stxns = [stxn1.blob, stxn2.blob, stxn3.blob];

  let response = await sendTxn(stxns, "Successfully minted " + newGARD + " GARD.");

  checkChainForCDP(info.address, accountID);

  return response;
  // XXX: May want to do something else besides this, a promise? loading screen?
}

export async function addCollateral(accountID, newAlgos) {
  // TODO: Add catches
  //		Min amount
  if (accountID == 'N/A') {
    return{
      alert: true,
      text: "You can only add to existing CDPs",
    }
  }
  else if (newAlgos == null) {
    return{
      alert: true,
      text: "Cannot add 'null' ALGOS to a CDP!"
    }
  }
  else if (newAlgos <= 0) {
    return{
      alert: true,
      text: "Value needs to be greater than 0!"
    }
  }

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

  let txns = [txn1];
  algosdk.assignGroupID(txns);

  const signedGroup = await signGroup(info, txns);

  const stxns = [signedGroup[0].blob];

  const response = await sendTxn(stxns, "Successfully added " + newAlgos + " ALGOs as collateral.",);

  checkChainForCDP(info.address, accountID);

  return response;
  // XXX: May want to do something else besides this, a promise? loading screen?
}

export async function closeCDP(accountID, microRepayGARD, payFee = true) {
  // TODO: Actually double check the state before issueing

  // Promise setup
  const accountInfoPromise = accountInfo();
  let paramsPromise = getParams(0);
  const feePromise = calcDevFeesCurrent(microRepayGARD, true);

  // Core info
  let validatorArgs = [enc.encode("CloseNoFee")];
  let foreignApps = [oracleID];
  if (payFee) {
    validatorArgs = [enc.encode("CloseFee")];
    foreignApps = [oracleID, closeFeeID];
  }
  let info = await accountInfoPromise;
  let cdp = cdpGen(info.address, accountID);
  let gard_bal = getGardBalance(info);

  if (gard_bal == null || gard_bal < microRepayGARD) {
    return {
      alert: true,
      text: "Insufficient GARD for transaction. Balance: " + (gard_bal / 1000000).toFixed(2).toString() + '\n' +
        "Required: " + (microRepayGARD / 1000000).toFixed(2).toString()
    };
  }

  let params = await paramsPromise;
  let txn1 = algosdk.makeApplicationCallTxnFromObject({
    from: cdp.address,
    appIndex: validatorID,
    onComplete: 0,
    appArgs: validatorArgs,
    accounts: [cdp.address],
    foreignApps: foreignApps,
    foreignAssets: [gardID],
    suggestedParams: params,
  });
  params.fee = 4000;
  let txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: reserve.address,
    amount: microRepayGARD,
    suggestedParams: params,
    assetIndex: gardID,
  });
  params.fee = 0;
  let txn3 = algosdk.makeApplicationClearStateTxnFromObject({
    from: cdp.address,
    appIndex: validatorID,
    suggestedParams: params,
  });
  params.fee = 0;
  let fee = 0;
  if (payFee) {
    fee = await feePromise;
  }
  let txn4 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: cdp.address,
    to: treasury.address,
    closeRemainderTo: info.address,
    amount: fee,
    suggestedParams: params,
  });

  let txns = [txn1, txn2, txn3, txn4];
  algosdk.assignGroupID(txns);

  // lsig construction
  let lsigArg = 3;
  if (payFee) {
    lsigArg = 2;
  }

  const signedGroupPromise = signGroup(info, [txn1, txn2, txn3, txn4]);
  const lsig = algosdk.makeLogicSig(cdp.logic, [algosdk.encodeUint64(lsigArg)]);
  const stxn1 = algosdk.signLogicSigTransactionObject(txn1, lsig);
  const stxn3 = algosdk.signLogicSigTransactionObject(txn3, lsig);
  const stxn4 = algosdk.signLogicSigTransactionObject(txn4, lsig);
  const signedGroup = await signedGroupPromise;
  console.log(signedGroup);
  const stxn2 = signedGroup[1];

  let stxns = [stxn1.blob, stxn2.blob, stxn3.blob, stxn4.blob];
  let response = await sendTxn(stxns, "Successfully closed your cdp with ID " + accountID + ".",);
  removeCDP(info.address, accountID);
  return response;
  // XXX: May want to do something else besides this, a promise? loading screen?
}

function updateCDP(
  address,
  id,
  newCollateral,
  newDebt,
  state = "open",
  commitment = 0,
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
    debt: newDebt,
    checked: Date.now(),
    state: state,
    committed: commitment,
  };
  CDPs[address] = accountCDPs;
  localStorage.setItem("CDPs", JSON.stringify(CDPs));
}

function updateCommitment(address, id, commitment) {
  let CDPs = getCDPs();
  CDPs[address][id]["committed"] = commitment;
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

export async function commitCDP(account_id, amount) {
  // Setting up promises
  const infoPromise = accountInfo();
  const paramsPromise = getParams(2000);

  const stringVal =
    'af/gov1:j{"com":' + parseInt(amount * 1000000).toString() + "}";

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
  let lsig = algosdk.makeLogicSig(cdp.logic, [algosdk.encodeUint64(0)]);
  const stxn2 = algosdk.signLogicSigTransactionObject(txn2, lsig);
  const signedGroup = await signedGroupPromise;
  const stxn1 = signedGroup[0];

  let stxns = [stxn1.blob, stxn2.blob];
  let response = await sendTxn(
    stxns,
    "Succesfully committed your algos from cdp " +
      account_id +
      " to governance! You may verify" +
      ' <a href="' +
      "https://governance.algorand.foundation/governance-period-3/governors/" +
      cdp.address +
      '">here</a>.\n',
     true);
  updateCommitment(info.address, account_id, parseInt(amount * 1000000));
  return response;
}

export async function voteCDP(account_id, option1, option2) {
  // Setting up promises
  const infoPromise = accountInfo();
  const paramsPromise = getParams(2000);

  const stringVal = 'af/gov1:j[6,"' + option1 + '","' + option2 + '"]';

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
  let lsig = algosdk.makeLogicSig(cdp.logic, [algosdk.encodeUint64(0)]);
  const stxn2 = algosdk.signLogicSigTransactionObject(txn2, lsig);
  const signedGroup = await signedGroupPromise;
  const stxn1 = signedGroup[0];

  let stxns = [stxn1.blob, stxn2.blob];
  let response = await sendTxn(
    stxns,
    "Successfully voted for options " +
      option1 +
      " and " +
      option2 +
      " from CDP #" +
      account_id,
  );
  return response;
}

export async function liquidate(
  account_id,
  owner_address,
  microDebt,
  microPremium,
) {
  // Setting up promises
  const infoPromise = accountInfo();
  const paramsPromise = getParams(0);

  let cdp = cdpGen(owner_address, account_id);

  const info = await infoPromise;
  let params = await paramsPromise;

  const liquid_fee = Math.floor(microPremium / 5);
  const to_user = liquid_fee * 4;
  let gard_bal = getGardBalance(info);

  if (gard_bal == null || gard_bal < microDebt + to_user + liquid_fee) {
    return {
      alert: true,
      text:
        "Insufficient GARD for transaction. Balance: " +
        (gard_bal / 1000000).toFixed(2).toString() +
        '\n' +
        "Required: " +
        ((microDebt + to_user + liquid_fee) / 1000000).toFixed(2).toString(),
    };
  }

  let txn1 = algosdk.makeApplicationCallTxnFromObject({
    from: cdp.address,
    appIndex: validatorID,
    onComplete: 2,
    foreignAssets: [gardID],
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
    assetIndex: gardID,
  });
  params.fee = 0;
  let txn4 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: treasury.address,
    amount: liquid_fee,
    suggestedParams: params,
    assetIndex: gardID,
  });
  let txn5 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: owner_address,
    amount: to_user,
    suggestedParams: params,
    assetIndex: gardID,
  });
  let txns = [txn1, txn2, txn3, txn4, txn5];
  algosdk.assignGroupID(txns);

  const signTxnsPromise = signGroup(info, txns);
  let lsig = algosdk.makeLogicSig(cdp.logic, [algosdk.encodeUint64(1)]);
  const stxn2 = algosdk.signLogicSigTransactionObject(txn2, lsig);
  const stxn1 = algosdk.signLogicSigTransactionObject(txn1, lsig);
  const user_signed = await signTxnsPromise;

  let stxns = [
    stxn1.blob,
    stxn2.blob,
    user_signed[2].blob,
    user_signed[3].blob,
    user_signed[4].blob,
  ];
  let response = await sendTxn(
    stxns,
    "Successfully liquidated CDP #" + account_id + " of " + owner_address, true);
  return response;
}
