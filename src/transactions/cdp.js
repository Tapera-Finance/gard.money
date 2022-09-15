import algosdk from "algosdk";
import { ids } from "./ids";
import { reserve, treasury, cdpGen } from "./contracts";
import {
  accountInfo,
  getParams,
  sendTxn,
  getWallet,
  getAppByID,
  signGroup,
} from "../wallets/wallets";
import {
  updateCommitmentFirestore,
  addCDPToFireStore,
  updateDBWebActions,
  updateLiquidationFirestore,
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

function microGARD(GARD) {
  // Helper function so we don't type the number of zeros anytime
  return parseInt(GARD * 1000000);
}

function getGardBalance(info) {
  for (var i = 0; i < info["assets"].length; i++) {
    if (info["assets"][i]["asset-id"] == ids.asa.gard) {
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

export function calcRatio(collateral, minted, string = false) {
  // collateral: Microalgos
  // minted: GARD
  const ratio = (100 * collateral * currentPrice) / minted / 1000000;
  if (string) {
    return ratio.toFixed(0) + "%";
  }
  return ratio;
}

const EncodedPrincipal = "UHJpbmNpcGFs";

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
      if (info["apps-local-state"][i].id == ids.app.validator) {
        const validatorInfo = info["apps-local-state"][i];
        if (validatorInfo.hasOwnProperty("key-value")) {
          // This if statement checks for borked CDPs (first tx = good, second = bad)
          // Improvement: Do something with borked CDPs

          for (let n = 0; n < validatorInfo["key-value"].length; n++) {
            if (validatorInfo["key-value"][n]["key"] == EncodedPrincipal) {
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

function setLoadingStage(stage) {
  sessionStorage.setItem("loadingStage", JSON.stringify(stage));
}

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
      appArgs: [enc.encode("OwnerCheck")],
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
      to: "UAME4M7T2NWECVNCUDGQX6LJ7OVDLZP234GFQL3TH6YZUPRV3VF5NGRSRI",
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
  let lsig = algosdk.makeLogicSig(cdp.logic, [algosdk.encodeUint64(3)]);
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
  
  if (commit) {
    updateCommitmentFirestore(info.address, accountID, openingMicroALGOs);
    response.text =
      response.text + "\nFull Balance committed to Governance Period #4!";
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
  // XXX: May want to do something else besides this, a promise? loading screen?
}

export async function addCollateral(accountID, newAlgos) {
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

  setLoadingStage("Awaiting Signature from Algorand Wallet...");

  let params = await getParams(1000);
  let txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: cdp.address,
    amount: microNewAlgos,
    suggestedParams: params,
  });
  let txn2 = algosdk.makeApplicationCallTxnFromObject({
    from: info.address,
    appIndex: ids.app.auction_checker,
    onComplete: 0,
    appArgs: [enc.encode("CDP_Check")],
    accounts: [cdp.address],
    foreignApps: [ids.app.validator],
    suggestedParams: params,
  });
  let txns = [txn1, txn2];
  algosdk.assignGroupID(txns);

  const signedGroup = await signGroup(info, txns);

  setLoadingStage("Confirming Transaction...");

  const stxns = [signedGroup[0].blob, signedGroup[1].blob];

  const response = await sendTxn(
    stxns,
    "Successfully added " + newAlgos + " ALGOs as collateral.",
  );
  setLoadingStage(null);

  checkChainForCDP(info.address, accountID);
  updateDBWebActions(2, accountID, -microNewAlgos, 0, 0, 0, 2000);

  return response;
}

export async function closeCDP(accountID, microRepayGARD, payFee = true) {

  // Promise setup
  setLoadingStage("Loading...");

  const accountInfoPromise = accountInfo();
  let paramsPromise = getParams(0);

  // Core info
  let validatorArgs = [enc.encode("CloseNoFee")];
  let foreignApps = [ids.app.oracle];
  if (payFee) {
    validatorArgs = [enc.encode("CloseFee")];
    foreignApps = [ids.app.oracle];
  }
  let info = await accountInfoPromise;
  let cdp = cdpGen(info.address, accountID);
  let cdpInfo = await accountInfo(cdp.address);
  const cdpBal = cdpInfo.amount;
  let gard_bal = getGardBalance(info);

  if (gard_bal == null || gard_bal < microRepayGARD) {
    return {
      alert: true,
      text:
        "Insufficient GARD for transaction. Balance: " +
        (gard_bal / 1000000).toFixed(2).toString() +
        "\n" +
        "Required: " +
        (microRepayGARD / 1000000).toFixed(2).toString(),
    };
  }

  let params = await paramsPromise;
  let txn1 = algosdk.makeApplicationCallTxnFromObject({
    from: cdp.address,
    appIndex: ids.app.validator,
    onComplete: 0,
    appArgs: validatorArgs,
    accounts: [cdp.address],
    foreignApps: foreignApps,
    foreignAssets: [ids.asa.gard],
    suggestedParams: params,
  });
  params.fee = 4000;
  let txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: reserve.address,
    amount: microRepayGARD,
    suggestedParams: params,
    assetIndex: ids.asa.gard,
  });
  params.fee = 0;
  let txn3 = algosdk.makeApplicationClearStateTxnFromObject({
    from: cdp.address,
    appIndex: ids.app.validator,
    suggestedParams: params,
  });
  params.fee = 0;
  let fee = 0;
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

  setLoadingStage("Awaiting Signature from Algorand Wallet...");

  const lsig = algosdk.makeLogicSig(cdp.logic, [algosdk.encodeUint64(lsigArg)]);
  const stxn1 = algosdk.signLogicSigTransactionObject(txn1, lsig);
  const stxn3 = algosdk.signLogicSigTransactionObject(txn3, lsig);
  const stxn4 = algosdk.signLogicSigTransactionObject(txn4, lsig);
  const signedGroup = await signedGroupPromise;
  const stxn2 = signedGroup[1];

  setLoadingStage("Confirming Transaction...");

  let stxns = [stxn1.blob, stxn2.blob, stxn3.blob, stxn4.blob];

  let response = await sendTxn(
    stxns,
    "Successfully closed your cdp.",
  );
  setLoadingStage(null);
  removeCDP(info.address, accountID);
  updateDBWebActions(1, accountID, cdpBal - fee, -microRepayGARD, 0, 0, fee);
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
  let txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: info.address,
    amount: parseInt(account_id),
    suggestedParams: params,
  });
  params.fee = 0;
  let txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: cdp.address,
    to: "UAME4M7T2NWECVNCUDGQX6LJ7OVDLZP234GFQL3TH6YZUPRV3VF5NGRSRI",
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
    "Succesfully committed your algos from cdp " +
      account_id +
      " to governance! You may verify" +
      " <a href=\"" +
      "https://governance.algorand.foundation/governance-period-4/governors/" +
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

export async function liquidate(
  account_id,
  owner_address,
  microDebt,
  microPremium,
) {
  // Setting up promises
  setLoadingStage("Loading...");

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
