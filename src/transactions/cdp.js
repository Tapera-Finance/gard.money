import algosdk from "algosdk";
import { ids } from "./ids";
import { cdpGen } from "./contracts";
import { setLoadingStage, getMicroGardBalance, microGARD, getAppField, cdpInterest, } from "./lib";
import {
  accountInfo,
  getParams,
  sendTxn,
  signGroup,
} from "../wallets/wallets";
import {
  updateCommitmentFirestore,
  addCDPToFireStore,
  updateDBWebActions,
} from "../components/Firebase";
import { VERSION, MINID, MAXID } from "../globals";
import { searchAccounts } from "../pages/GovernContent";

var $ = require("jquery");

const enc = new TextEncoder();
const MINRATIO = 140;
export let currentPrice = 0.30; // XXX: This should be kept close to the actual price - it is updated on initialization though

// XXX: All of these assume accountInfo has already been set! We should improve the UX of this after getting core functionality done
// XXX: All of these assume the user signs all transactions, we don't currently catch when a user doesn't do so!

export async function getPrice() {
  // TODO: cache price
  const currentPriceJSON = await $.getJSON(
    "https://storage.googleapis.com/algo-pricing-data-2022/latest_pricing.json",
  );
  currentPrice = currentPriceJSON.float_price;
  return currentPrice;
}
// We immeadiately update the price in a background thread
getPrice();

let CDPs;
let old = localStorage.getItem("CDPs") !== null;

export function getCDPs() {
  // V1: Only loads from cache
  // CDPs is a list of CDP dictionaries. These dictionaries include:
  // {
  //   collateral: MICROALGOS,
  //   debt: MICROGARD,
  // }
  if (typeof CDPs === "undefined") {
    const stored = localStorage.getItem("CDPs");
    if (stored !== null) {
      CDPs = JSON.parse(stored);
    } else {
      CDPs = {};
    }
  }
  return CDPs;
}


getCDPs();


export function calcRatio(collateral, minted, asaID, string = false) {
  // collateral: Microalgos
  // minted: GARD
  let mul = 1;
  if (asaID != 0) {
    mul = .98; // XXX: Only works for galgos
    // XXX: Should get this dynamically
  }
  const ratio = (mul * 100 * collateral * currentPrice) / minted / 1000000;
  if (string) {
    return ratio.toFixed(0) + "%";
  }
  return ratio;
}

function getCDPState(cdpInfo, asaID) {
  let res = {
    state: "closed",
  };
  if (cdpInfo.amount > 0 && (!asaID || (asaID && cdpInfo["assets"].length))) {
    res.state = "opened";
    if (asaID == 0) {
      res.collateral = cdpInfo.amount;
    } else {
      res.collateral = 0;
      for (let i = 0; i < cdpInfo["assets"].length; i++) {
        if (asaID == cdpInfo["assets"][i]["asset-id"]) {
          res.collateral = cdpInfo["assets"][i]["amount"];
          break;
        }
      }
    }
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
          res.state = "borked";
        }
        break;
      }
    }
  }
  
  return res;
}


function cdpIsCached(accountCDPs, asaID, id) {
  return accountCDPs && accountCDPs.hasOwnProperty(asaID) && accountCDPs[asaID].hasOwnProperty(id);
}


async function updateTypeCDPs(address, accountCDPs, asaID) {
  const mins_to_refresh = 15;
  let webcalls = 0;

  for (const x of Array(MAXID - MINID)
    .fill()
    .map((_, i) => i + MINID)) {
    if (
      !cdpIsCached(accountCDPs, asaID, x) ||
      accountCDPs[asaID]["checked"] + mins_to_refresh * 60 * 1000 < Date.now()
    || old) {
      updateCDP(address, asaID, x);
      webcalls += 1;
    }
    if (webcalls % 3 == 0) {
      await new Promise((r) => setTimeout(r, 1700));
    }
  }
  old = false;
}


export async function updateCDPs(address) {
  // Checks all CDPs by an address
  const accountCDPs = CDPs[address];
  // Sets the frequency to double check CDPs
  updateTypeCDPs(address, accountCDPs, 0);
  updateTypeCDPs(address, accountCDPs, ids.asa.galgo);
}

async function findOpenID(address, asaID) {
  const accountCDPs = CDPs[address];
  const typeCDPs = accountCDPs[asaID];
  for (const x of Array(MAXID - MINID)
    .fill()
    .map((_, i) => i + MINID)) {
      if (
        !cdpIsCached(accountCDPs, asaID, x) ||
        typeCDPs[x]["state"] == "closed"
      ) {
        const used = await updateCDP(address, asaID, x);
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

export function createOptInTxn(params, info, assetID, fee = 1000) {
  params.fee = fee;
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

export function makeUpdateInterestTxn(userInfo, params) {
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

function makeOptInTxns(info, params) {
  let txns = [];
  let optedInGard = verifyOptIn(info, ids.asa.gard);
  let optedInGain = verifyOptIn(info, ids.asa.gain);
  let optedInGardian =
    VERSION.slice(0,7) != "TESTNET" ? verifyOptIn(info, ids.asa.gardian) : true; //no testnet id for Gardian so this should only verify opt in if hit on mainnet
  // Sets fee to 1000 for potential opt ins
  params.fee = 1000;
  // txn 1 = opt in to gard
  let txn1;
  if (!optedInGard) {
    txn1 = createOptInTxn(params, info, ids.asa.gard);
    txns.push(txn1);
  }
  // txn 2 = opt in to gain
  let txn2;
  if (!optedInGain) {
    txn2 = createOptInTxn(params, info, ids.asa.gain);
    txns.push(txn2);
  }
  // txn 3 = opt in to gardian
  let txn3;
  if (!optedInGardian) {
    txn3 = createOptInTxn(params, info, ids.asa.gardian);
    txns.push(txn3);
  }
  return txns;
}

async function openAlgoCDP(openingMicroALGOs, microOpeningGard, commit, toWallet, info, accountID, cdp) {
  // Setting up promises
  const paramsPromise = getParams(2000);

  // Part 1: Opting in, creating needed info, etc.

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

  let params = await paramsPromise;
  let txns = makeOptInTxns(info, params);
  let optins = txns.length;
  params.fee = 5000;
  // txn 3 = update interest rate
  let txn3 = makeUpdateInterestTxn(info, params);
  txns.push(txn3);
  // txn 4 = collateral
  params.fee = 0;
  let txn4 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: cdp.address,
    amount: openingMicroALGOs,
    suggestedParams: params,
  });
  txns.push(txn4);
  // txn 5 = opt in cdp txn
  let txn5 = algosdk.makeApplicationOptInTxnFromObject({
    from: cdp.address,
    suggestedParams: params,
    appIndex: ids.app.validator,
  });
  txns.push(txn5);
  // txn 6 = new position
  let txn6 = algosdk.makeApplicationCallTxnFromObject({
    from: info.address,
    appIndex: ids.app.validator,
    onComplete: 0,
    appArgs: [enc.encode("NewPosition"), algosdk.encodeUint64(microOpeningGard), algosdk.encodeUint64(accountID)],
    accounts: [cdp.address],
    foreignApps: [ids.app.oracle[0], ids.app.sgard_gard, ids.app.dao.interest],
    foreignAssets: [ids.asa.gard],
    suggestedParams: params,
  });
  txns.push(txn6);
  // Governance
  let txn8;
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
    txns.push(txn7);
    // txn 8: Commit
    params.fee = 0;
    txn8 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: cdp.address,
      to: "SAHBJDRHHRR72JHTWSXZR5VHQQUVC7S757TJZI656FWSDO3TZZWV3IGJV4",
      amount: 0,
      note: note,
      suggestedParams: params,
    });
    txns.push(txn8);
  }
  
  // Signing transactions
  algosdk.assignGroupID(txns);
  setLoadingStage("Awaiting Signature from Algorand Wallet...");
  let _stxns = await signGroup(info, txns);
  
  setLoadingStage("Finalizing Transactions...");
  let stxns = [];
  // stxn 0-2 (opt ins)
  for (let i = 0; i < optins; i++) {
    stxns.push(_stxns[i].blob);
  }
  // stxn 0
  stxns.push(_stxns[optins].blob);
  // stxn 4
  stxns.push(_stxns[1 + optins].blob);
  // stxn 5
  let lsig = algosdk.makeLogicSig(cdp.logic, [algosdk.encodeUint64(2)]);
  let stxn5 = algosdk.signLogicSigTransactionObject(txn5, lsig);
  stxns.push(stxn5.blob);
  // stxn 6
  stxns.push(_stxns[3 + optins].blob);
  if (commit) {
    // stxn 7
    stxns.push(_stxns[4 + optins].blob);
    // stxn 8
    lsig = algosdk.makeLogicSig(cdp.logic, [algosdk.encodeUint64(0)]);
    let stxn8 = algosdk.signLogicSigTransactionObject(txn8, lsig);
    stxns.push(stxn8.blob);
  }
  
  return stxns;
}

async function openASACDP(openingMicroAssetAmount, microOpeningGard, asaID, info, accountID, cdp) {
  const cdpInfoPromise = accountInfo(cdp.address);
  const paramsPromise = getParams(2000);
  
  // Part 1: Opting in, creating needed info, etc.

  /*
  if (
    307000 +
      openingMicroAssetAmount +
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
  */ // TODO: Fix this

  let params = await paramsPromise;
  let txns = makeOptInTxns(info, params);
  let extraTxns = txns.length;
  const cdpInfo = await cdpInfoPromise;

  let algosToSend = 850000 - Math.min(cdpInfo.amount, 850000); // XXX: This amount may not be optimal, but it works
  params.fee = 6000;
  if (algosToSend > 0) {
    params.fee = 7000;
    // txn 3 = funding
    let txn3 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: info.address,
      to: cdp.address,
      amount: algosToSend,
      suggestedParams: params,
    });
    txns.push(txn3);
    extraTxns += 1;
    params.fee = 0;
  }
  
  // txn 4 = update interest rate
  let txn4 = makeUpdateInterestTxn(info, params);
  txns.push(txn4);
  params.fee = 0;
  // txn 5 - opt cdp into ASA
  let txn5 = createOptInTxn(params, cdp, asaID, 0);
  txns.push(txn5);
  // txn6 - asset transfer
  let txn6 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: cdp.address,
    amount: openingMicroAssetAmount,
    suggestedParams: params,
    assetIndex: asaID,
  });
  txns.push(txn6);
  // txn 7 = opt in cdp txn
  let txn7 = algosdk.makeApplicationOptInTxnFromObject({
    from: cdp.address,
    suggestedParams: params,
    appIndex: ids.app.validator,
    appArgs: [algosdk.encodeUint64(accountID)],
  });
  txns.push(txn7);
  // txn 8 = new position
  let txn8 = algosdk.makeApplicationCallTxnFromObject({
    from: info.address,
    appIndex: ids.app.validator,
    onComplete: 0,
    appArgs: [enc.encode("NewPosition"), algosdk.encodeUint64(microOpeningGard), algosdk.encodeUint64(accountID)],
    accounts: [cdp.address],
    foreignApps: [ids.app.oracle[0], ids.app.oracle[asaID], ids.app.sgard_gard, ids.app.dao.interest],
    foreignAssets: [ids.asa.gard, asaID],
    suggestedParams: params,
  });
  txns.push(txn8);
  
  // Signing transactions
  algosdk.assignGroupID(txns);
  setLoadingStage("Awaiting Signature from Algorand Wallet...");
  let _stxns = await signGroup(info, txns);
  
  setLoadingStage("Finalizing Transactions...");
  let stxns = [];
  // stxn 0-3 (opt ins + funding)
  for (let i = 0; i < extraTxns; i++) {
    stxns.push(_stxns[i].blob);
  }
  // stxn 4
  stxns.push(_stxns[extraTxns].blob);
  // stxn 5
  let lsig = algosdk.makeLogicSig(cdp.logic, [algosdk.encodeUint64(3)]);
  let stxn5 = algosdk.signLogicSigTransactionObject(txn5, lsig);
  stxns.push(stxn5.blob);
  // stxn 6
  stxns.push(_stxns[2 + extraTxns].blob);
  // stxn 7
  lsig = algosdk.makeLogicSig(cdp.logic, [algosdk.encodeUint64(1)]);
  let stxn7 = algosdk.signLogicSigTransactionObject(txn7, lsig);
  stxns.push(stxn7.blob);
  // stxn 8
  stxns.push(_stxns[4 + extraTxns].blob);
  
  return stxns;
}

export async function openCDP(openingAssetAmount, openingGARD, asaID, commit = false, toWallet = true) {

  const openingMicroAssetAmount = parseInt(openingAssetAmount * 1000000); // XXX: This works for algos and galgos, but potentially not other assets

  // Setting up promises
  const infoPromise = accountInfo();

  setLoadingStage("Loading...");

  if (openingGARD < 1) {
    return {
      alert: true,
      text:
        "Opening GARD needs to be at least 1.\n" +
        "Your opening GARD is is: " +
        openingGARD,
    };
  }
  
  const ratio = calcRatio(openingMicroAssetAmount, openingGARD, asaID);
  if (ratio < MINRATIO) {
    return {
      alert: true,
      text:
        "Ratio needs to be above " +
        MINRATIO +
        "%.\n" +
        "Your ratio is: " +
        calcRatio(openingMicroAssetAmount, openingGARD, asaID, true),
    };
  }
  
  
  const microOpeningGard = microGARD(openingGARD);
  const info = await infoPromise;
  const accountID = await findOpenID(info.address, asaID);
  const cdp = cdpGen(info.address, accountID, asaID);
  let stxns;
  if (asaID == 0) {
    stxns = await openAlgoCDP(openingMicroAssetAmount, microOpeningGard, commit, toWallet, info, accountID, cdp);
  } else {
    stxns = await openASACDP(openingMicroAssetAmount, microOpeningGard, asaID, info, accountID, cdp);
  }
  
  setLoadingStage("Confirming Transactions...");
  
  let response = await sendTxn(
    stxns,
    "Successfully opened a new CDP.",
  );
  
  updateCDP(info.address, asaID, accountID);
  
  addCDPToFireStore(accountID, -openingMicroAssetAmount, microOpeningGard, 0);

  if (commit) {
    await new Promise(r => setTimeout(r, 1000));
    updateCommitmentFirestore(info.address, accountID, openingMicroAssetAmount);
    response.text =
      response.text + "\nFull Balance committed to Governance Period #6!";
  }
  
  setLoadingStage(null);
  
  return response;
}

export async function mint(accountID, newGARD, asaID) {
  // Improvenment: Add catches
  //		Ratio is good

  // Core info
  setLoadingStage("Loading...");

  let info = await accountInfo();
  let cdp = cdpGen(info.address, accountID, asaID);
  let microNewGARD = microGARD(newGARD);
  let params = await getParams(1000);
  // txn 0 - update the interest rate
  let txn_neg1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: info.address,
    amount: 0,
    suggestedParams: params,
    assetIndex: asaID,
  });
  params.fee = 3000;
  let txn0 = makeUpdateInterestTxn(info, params);
  params.fee = 0;
  // txn1 - more gard!
  let apps = [ids.app.oracle[0], ids.app.sgard_gard, ids.app.dao.interest];
  let assets = [ids.asa.gard];
  if (asaID != 0) {
    apps = [ids.app.oracle[0], ids.app.oracle[asaID], ids.app.sgard_gard, ids.app.dao.interest];
    assets = [ids.asa.gard, asaID];
  }
  let txn1 = algosdk.makeApplicationCallTxnFromObject({
    from: info.address,
    appIndex: ids.app.validator,
    onComplete: 0,
    appArgs: [enc.encode("MoreGARD"), algosdk.encodeUint64(microNewGARD)],
    accounts: [cdp.address],
    foreignApps: apps,
    foreignAssets: assets,
    suggestedParams: params,
  });

  let txns = [txn_neg1, txn0, txn1];
  if (asaID == 0) {
    txns.shift(); // Removes first txn
  }
  algosdk.assignGroupID(txns);
  
  setLoadingStage("Awaiting Signature from Algorand Wallet...");
  const signedGroup = await signGroup(info, txns);

  setLoadingStage("Confirming Transaction...");

  let stxns = [signedGroup[0].blob, signedGroup[1].blob];
  if (asaID){
    stxns = stxns.concat([signedGroup[2].blob]);
  }

  let response = await sendTxn(
    stxns,
    "Successfully minted " + newGARD + " GARD.",
  );
  updateCDP(info.address, asaID, accountID);
  
  // DB Updates
  updateDBWebActions(3, accountID, 0, microNewGARD, 0, 0, 0);
  
  setLoadingStage(null);
  return response;
}

export async function addCollateral(accountID, newAlgos, commit, asaID) {
  // XXX: This only is setup to work for algos and galgos currently
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
  accountID = Number(accountID);

  setLoadingStage("Loading...");
  // Core info
  let info = await accountInfo();
  let microNewAlgos = parseInt(newAlgos * 1000000);
  
  if (asaID == 0) {
    if (info["amount"] - microNewAlgos - 4000 < info["min-balance"]) {
      return {
        alert: true,
        text:
          "Depositing this much collateral will put you below your minimum balance.\n" +
          "Your Maximum deposit is: " +
          (info["amount"] - info["min-balance"] - 4000) / 1000000 +
          " Algos", 
      };
    }
  }
  
  let cdp = cdpGen(info.address, accountID, asaID);

  let params = await getParams(1000);
  let txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: cdp.address,
    amount: microNewAlgos,
    suggestedParams: params,
  });
  if (asaID != 0) {
    txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: info.address,
      to: cdp.address,
      amount: microNewAlgos,
      suggestedParams: params,
      assetIndex: asaID,
    });
  }
  let txn2 = makeUpdateInterestTxn(info, params);
  let txns = [txn1, txn2];
  
  let govAlgos = microNewAlgos;
  let txn8;
  if (commit && asaID == 0) {
    const cdpInfo = await accountInfo(cdp.address);
    govAlgos += cdpInfo.amount;
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
    txns.push(txn7);
    // txn 8: Commit
    params.fee = 0;
    txn8 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: cdp.address,
      to: "SAHBJDRHHRR72JHTWSXZR5VHQQUVC7S757TJZI656FWSDO3TZZWV3IGJV4",
      amount: 0,
      note: note,
      suggestedParams: params,
    });
    txns.push(txn8);
  }
  
  setLoadingStage("Awaiting Signature from Algorand Wallet...");
  
  algosdk.assignGroupID(txns);

  const signedGroup = await signGroup(info, txns);

  setLoadingStage("Confirming Transaction...");

  const stxns = [signedGroup[0].blob, signedGroup[1].blob];
  if (commit && asaID == 0) {
    stxns.push(signedGroup[2].blob);
    const lsig = algosdk.makeLogicSig(cdp.logic, [algosdk.encodeUint64(0)]);
    let stxn8 = algosdk.signLogicSigTransactionObject(txn8, lsig);
    stxns.push(stxn8.blob);
  }

  const response = await sendTxn(
    stxns,
    `Successfully added ${newAlgos} ${asaID == 793124631 ? " gALGO": " ALGO"} as collateral.`,
  );

  updateCDP(info.address, asaID, accountID);
  updateDBWebActions(2, accountID, -microNewAlgos, 0, 0, 0, 2000);
  
  if (commit && asaID == 0) {
    await new Promise(r => setTimeout(r, 1000)); // TODO: More elegant fix (do it in the firestore library)
    updateCommitmentFirestore(info.address, accountID, govAlgos);
    response.text =
      response.text + "\nFull Balance committed to Governance Period #6!";
  }
  
  setLoadingStage(null);

  return response;
}

let conversionRate;
let conversionRateUpdated = 0;
sgardToGard(0);

async function sgardToGard(amt, force_update = false) {
  if ((Date.now() - conversionRateUpdated) / 6000 > 1 || force_update) {
    conversionRate = await getAppField(ids.app.sgard_gard, "conversion_rate");
    conversionRateUpdated = Date.now();
  }
  return conversionRate * amt / (10 ** 10);
}


async function totalDebt(cdpInfo) {
  return await sgardToGard(getCDPState(cdpInfo).debt, true);
}


export async function repayCDP(accountID, repayGARD, asaID) {

  // Promise setup
  setLoadingStage("Loading...");

  const accountInfoPromise = accountInfo();
  const paramsPromise = getParams(3000);
  const info = await accountInfoPromise;
  let cdp = cdpGen(info.address, accountID, asaID);
  let cdpInfo = await accountInfo(cdp.address);
  let params = await paramsPromise;
  
  let microRepayGARD = microGARD(repayGARD);
  
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
  let txn0 = makeUpdateInterestTxn(info, params);
  // THROUGH HERE
  // txn 1 - closing check
  params.fee = 0;
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
  updateCDP(info.address, asaID, accountID);
  // updateDBWebActions(1, accountID, cdpBal - fee, -microRepayGARD, 0, 0, fee); TODO: Fix this
  return response;
}


export async function closeCDP(accountID, asaID) {

  // Promise setup
  setLoadingStage("Loading...");

  const accountInfoPromise = accountInfo();
  const paramsPromise = getParams(5000);
  const info = await accountInfoPromise;
  let cdp = cdpGen(info.address, accountID, asaID);
  let cdpInfo = await accountInfo(cdp.address);
  let params = await paramsPromise;
  let microRepayGARD = Math.trunc((await totalDebt(cdpInfo)) * (1 + (5000 * cdpInterest)/365/24/60)) + 3000; // Adds a safe amount of extra repay to ensure the txn goes through (5000 mins of interest) and 3000 microalgo
  
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
  
  // txn 0 - updated interest
  let txn0 = makeUpdateInterestTxn(info, params);
  // txn 1 - closing check
  params.fee = 0;
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
  let lsigNum = 1;
  if (asaID != 0) {
    txn3 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: cdp.address,
      to: info.address,
      closeRemainderTo: info.address,
      amount: 0,
      suggestedParams: params,
      assetIndex: asaID,
    });
    lsigNum = 0;
  }


  let txns = [txn0, txn1, txn2, txn3];
  algosdk.assignGroupID(txns);

  const signedGroupPromise = signGroup(info, [txn0, txn1, txn2, txn3]);

  setLoadingStage("Awaiting Signature from Algorand Wallet...");

  let lsig = algosdk.makeLogicSig(cdp.logic, [algosdk.encodeUint64(lsigNum)]);
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
  updateCDP(info.address, asaID, accountID);
  // updateDBWebActions(1, accountID, cdpBal - fee, -microRepayGARD, 0, 0, fee); TODO: Fix this
  return response;
}

export async function goOnlineCDP(accountID, voteKey, selKey, sprfKey, first_rd, last_rd) {

  // Promise setup
  setLoadingStage("Loading...");

  if (typeof accountID !== "number") {
    return {
      alert: true,
      text: "Error. accountID must be passed into goOnlineCDP as a number."
    }
  }
  const accountInfoPromise = accountInfo();
  const paramsPromise = getParams(2000);
  const info = await accountInfoPromise;
  let cdp = cdpGen(info.address, accountID);
  let cdpInfo = await accountInfo(cdp.address);

  // input checking
  if (typeof voteKey !== "string" || typeof selKey !== "string" || typeof sprfKey !== "string")
  return {
    alert: true,
    text: "At least one entered key is invalid.",
  };

  if (typeof first_rd !== "number" || typeof last_rd !== "number" || isNaN(first_rd) || isNaN(last_rd) || first_rd < cdpInfo.round || last_rd - first_rd > 3e6 || last_rd - first_rd < 10)
  return {
    alert: true,
    text: "At least one entered round is invalid.",
  };

  console.log(last_rd, first_rd)
  let params = await paramsPromise;
  let txn1 = algosdk.makeApplicationCallTxnFromObject({
    from: info.address,
    appIndex: ids.app.validator,
    onComplete: 0,
    appArgs: [enc.encode("OwnerCheck"), algosdk.encodeUint64(accountID)],
    accounts: [cdp.address],
    suggestedParams: params,
  });
  params.fee = 0;
  let txn2 = algosdk.makeKeyRegistrationTxnWithSuggestedParamsFromObject({
    from: cdp.address,
    voteKey: voteKey,
    selectionKey: selKey,
    voteFirst: first_rd,
    voteLast: last_rd,
    voteKeyDilution: Math.floor(Math.sqrt(last_rd - first_rd)), // This is some low importance parameter affecting node security/storage. Used AF recommendation.
    stateProofKey: sprfKey,
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

  setLoadingStage("Going Online...");

  let stxns = [stxn1.blob, stxn2.blob];
  let response = await sendTxn(
    stxns,
    "Consensus participation enabled! You may verify" +
      " <a href=\"" +
      "https://algoexplorer.io/address/" +
      cdp.address +
      "\">here</a>.\n",
    true,
  );
  setLoadingStage(null);
  return response
}

export async function goOfflineCDP(accountID, voteKey, selKey, sprfKey, first_rd, last_rd) {

  // Promise setup
  setLoadingStage("Loading...");
  if (typeof accountID !== "number") {
    return {
      alert: true,
      text: "Error. accountID must be passed into goOnlineCDP as a number."
    }
  }

  const accountInfoPromise = accountInfo();
  const paramsPromise = getParams(2000);
  const info = await accountInfoPromise;
  let cdp = cdpGen(info.address, accountID);
  let cdpInfo = await accountInfo(cdp.address);

  // input checking
  if (typeof voteKey !== "string" || typeof selKey !== "string" || typeof sprfKey !== "string")
  return {
    alert: true,
    text: "At least one entered key is invalid.",
  };

  if (typeof first_rd !== "number" || typeof last_rd !== "number" || first_rd < cdpInfo.round || last_rd - first_rd > 3e6)
  return {
    alert: true,
    text: "At least one entered round is invalid.",
  };

  let params = await paramsPromise;
  let txn1 = algosdk.makeApplicationCallTxnFromObject({
    from: info.address,
    appIndex: ids.app.validator,
    onComplete: 0,
    appArgs: [enc.encode("OwnerCheck"), algosdk.encodeUint64(accountID)],
    accounts: [cdp.address],
    suggestedParams: params,
  });
  params.fee = 0;
  let txn2 = algosdk.makeKeyRegistrationTxnWithSuggestedParamsFromObject({
    from: cdp.address,
    suggestedParams: params,
    nonParticipation: true,
  });

  let txns = [txn1, txn2];
  algosdk.assignGroupID(txns);

  const signedGroupPromise = signGroup(info, txns);

  setLoadingStage("Awaiting Signature from Algorand Wallet...");

  let lsig = algosdk.makeLogicSig(cdp.logic, [algosdk.encodeUint64(0)]);
  const stxn2 = algosdk.signLogicSigTransactionObject(txn2, lsig);
  const signedGroup = await signedGroupPromise;
  const stxn1 = signedGroup[0];

  setLoadingStage("Going Offline...");

  let stxns = [stxn1.blob, stxn2.blob];
  let response = await sendTxn(
    stxns,
    "Consensus participation will be disabled in 320 rounds (~20 minutes). You may verify" +
      " <a href=\"" +
      "https://algoexplorer.io/address/" +
      cdp.address +
      "\">here</a>.\n",
    true,
  );
  setLoadingStage(null);
  return response
}

// TODO: add commitment
async function updateCDP(
  address,
  asaID,
  id,
) {

  const cdp = cdpGen(address, id, asaID);
  const infoPromise = accountInfo(cdp.address);

  // Getting the entry to modify
  let accountCDPs = CDPs[address];
  if (accountCDPs == null) {
    accountCDPs = {};
  }
  let _collateralType = "algo";
  if (asaID != 0) {
    _collateralType = "galgo";
  }
  let typeCDPs = accountCDPs[asaID];
  if (typeCDPs == null) {
    typeCDPs = {};
  }
  
  // Setting vals
  const info = await infoPromise;
  const state = getCDPState(info, asaID);
  let _collateral = 0;
  let _principal = 0;
  let _debt = 0;
  
  if (state.state == "borked") {
    _collateral = state.collateral;
  } else if (state.state == "opened") {
    _collateral = state.collateral;
    _principal = state.principal;
    _debt = await sgardToGard(state.debt);
  }
  
  
  typeCDPs[id] = {
    collateralType: _collateralType,
    asaID: asaID,
    collateral: _collateral,
    debt: _debt,
    principal: _principal,
    checked: Date.now(),
    state: state.state,
  };
  accountCDPs[asaID] = typeCDPs;
  CDPs[address] = accountCDPs;
  localStorage.setItem("CDPs", JSON.stringify(CDPs));
  
  if (state.state !== "closed") {
    return true;
  }
  return false;
}


export async function commitCDP(account_id, amount, toWallet) {
  // Setting up promises
  setLoadingStage("Loading...");
  const infoPromise = accountInfo();
  const paramsPromise = getParams(2000);

  const info = await infoPromise;

  const stringVal = toWallet
    ? `af/gov1:j{"com":${parseInt(amount)},"bnf":"${info.address}"}`
    : "af/gov1:j{\"com\":" + parseInt(amount).toString() + "}";

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
    to: "SAHBJDRHHRR72JHTWSXZR5VHQQUVC7S757TJZI656FWSDO3TZZWV3IGJV4",
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
      "https://governance.algorand.foundation/governance-period-6/governors/" +
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

export async function voteCDPs(cdpArray, voteArray) {
  console.log(cdpArray);
  // Setting up promises
  setLoadingStage("Loading...");
  const infoPromise = accountInfo();
  const paramsPromise = getParams(2000);

  const stringVal = "af/gov1:j[8,\"" + voteArray[0] + "\",\"" + voteArray[1] + "\",\"" + voteArray[2]  + "\",\"" + voteArray[3] + "\",\"" + voteArray[4] + "\"]";
  
  const note = enc.encode(stringVal);

  const info = await infoPromise;
  const params = await paramsPromise;

  let loops = cdpArray.length;
  let offset = 0;
  let response = {alert: false, text: ""};

  while (loops - offset > 0){
    setLoadingStage("Loading...");
    let txns = [];
    let lsigs = [];
    let group_size = Math.min(loops - offset, 8);
    for (let i = 0; i < group_size; i++){
      let account_id = parseInt(cdpArray[offset + i].id);
      let cdp = cdpGen(info.address, account_id, 0);
      params.fee = 2000;
      let txn1 = algosdk.makeApplicationCallTxnFromObject({
        from: info.address,
        appIndex: ids.app.validator,
        onComplete: 0,
        appArgs: [enc.encode("OwnerCheck"), algosdk.encodeUint64(account_id)],
        accounts: [cdp.address],
        foreignApps: [],
        foreignAssets: [],
        suggestedParams: params,
      });
      params.fee = 0;
      let txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: cdp.address,
        to: "SAHBJDRHHRR72JHTWSXZR5VHQQUVC7S757TJZI656FWSDO3TZZWV3IGJV4",
        amount: 0,
        note: note,
        suggestedParams: params,
      });
      txns.push(txn1);
      txns.push(txn2);
      lsigs.push(algosdk.makeLogicSig(cdp.logic, [algosdk.encodeUint64(0)]));
    }
    algosdk.assignGroupID(txns);
    console.log(group_size);
    const signedGroupPromise = signGroup(info, txns);
    let s_lsig = [];
    for (let j = 0; j < group_size; j++){
      s_lsig.push(algosdk.signLogicSigTransactionObject(txns[(2*j)+1], lsigs[j]));
    }
    const signedGroup = await signedGroupPromise;
    setLoadingStage("Sending Votes For " + group_size.toString() + " CDP(s).");
  
    let stxns = [];
    for (let k = 0; k < group_size; k++){
      stxns.push(signedGroup[2*k].blob);
      stxns.push(s_lsig[k].blob);
    }
    response = await sendTxn(
      stxns,
      "Successfully voted for options " +
        voteArray.toString() +
        " on all CDPs "
    );

    setLoadingStage(null);
    offset += 8;
  }
  return response;
  /*
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
  return response;*
  */
}

function getCDPVal(cdp, key, isInt) {
  for (const kv of cdp["apps-local-state"][0]["key-value"]) {
    if (kv.key == btoa(key)) {
      if (isInt) {
        return kv.value.uint;
      } else {
        return kv.value.bytes;
      }
    }
  }
  return -1;
}

export async function getAllCDPs() {
  // TODO: Do the pages thing in case it's more than 1000
  let optedIn = [];
  let nexttoken;
  do {
    // Find accounts that are opted into the GARD price validator application
    // These accounts correspond to CDP opened on the GARD protocol
    let response = await searchAccounts({
      appId: ids.app.validator,
      limit: 1000,
      nexttoken,
    });
    
    for (const account of response["accounts"]) {
      optedIn.push(account);
    }
    nexttoken = response["next-token"];
  } while (nexttoken != null);

  const withState = optedIn.filter(account => "apps-local-state" in account);
  const rightApp = withState.filter(account => account["apps-local-state"][0].id == ids.app.validator);
  const unixtime = Math.floor(Date.now() / 1000);
  let withDebt = rightApp.filter(account => {
    return getCDPVal(account, "SGARD_DEBT", true) > 0;
  });
  for (let cdp of withDebt) {
    if (cdp["total-assets-opted-in"] > 0) {
      cdp.collateralID = cdp["assets"][0]["asset-id"];
      cdp.collateralAmount = cdp["assets"][0]["amount"];
    } else {
      cdp.collateralID = 0;
      cdp.collateralAmount = cdp.amount;
    }
    cdp.sgard_debt = getCDPVal(cdp, "SGARD_DEBT", true);
    cdp.gard_owed = (await sgardToGard(cdp.sgard_debt)) / 1000000;
    cdp.ratio = calcRatio(cdp.collateralAmount, cdp.gard_owed, cdp.collateralID);
    cdp.owner = algosdk.encodeAddress(Buffer.from(getCDPVal(cdp, "OWNER", false), "base64"));
    cdp.creator = algosdk.encodeAddress(Buffer.from(getCDPVal(cdp, "CREATOR", false), "base64"));
    cdp.id = getCDPVal(cdp, "account_id", true);
    cdp.activeAuction = getCDPVal(cdp, "UNIX_START", true) % 2 == 1;
    cdp.premium = cdp.activeAuction ? Math.max(0, (Math.floor((23*cdp.gard_owed*1e6)/20) - Math.floor(cdp.gard_owed*1e6*(unixtime - getCDPVal(cdp, "UNIX_START", true))/2400))/1e6 - cdp.gard_owed): 0;
    if (cdp.activeAuction){
      console.log(cdp.premium);
    }
  }
  withDebt.sort((a, b) => a.ratio - b.ratio);
  return withDebt;
}

// async function getAll
