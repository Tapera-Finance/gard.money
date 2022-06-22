import algosdk from "algosdk";
import {
  validatorID,
  gardID,
  gainID,
  gardianID,
  oracleID,
  openFeeID,
  closeFeeID,
  pactGARDID,
  pactRecipient,
} from "./ids";
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

/**
 ********** Swap & Exchange **********
 * Exchange Algos / Gard w/ DEX:
 * - 1 - Pact [ ]
 * - 2 - Tinyman [ ]
 * - 3 - HumbleExchange [ ]
 *
 */

/**
 * Local Helpers
 */

export const parseValFromAppState = (appState, idx) =>
  parseFloat(appState[idx]["value"]["uint"]);

/**
 * Global Helpers
 */

/**
 *
 * @constructor SwapController - prototype for creating DeXControllers
 * @param {dexId} {String} - name of dex to create SwapController for
 * @param {recipient} {String} - Asset Pool address
 * @param {assetsToOptInto} {Object[]} - array of ASA names and IDs to store on instance
 * @note - as we work out the differences in exchanges and the way transactions vary per pool, this could be built out with dynamic methods per asset. For now it's a base "class" in one of the weird JS ways of utilizing inheritance
 */

export function SwapController(dexId, recipient, assetsToOptInto) {
  this.id = dexId;
  this.recipient = recipient;
  this.assets = assetsToOptInto;
  assetsToOptInto.forEach((asset) => {
    this[`${asset.name}ID`] = asset.id;
  });
}
SwapController.prototype = {
  constructor: SwapController,
  execute: function () {
    console.log(this.id);
  },
};

/*************
 * Pact Swap Controller
 * Instance of SwapController for exchanging assets with Pact
 * @function algoToGard - calculate swap exchange rate from algo to gard
 *    @param {algo} {Float} - representing how many algo to send
 *    @param {lockedInRate} {Float} - representing exchange rate from current pool at time of capture
 *    @returns {transactionSummary} - returns details of the exchange to allow for execution
 *
 * @function gardToAlgo - calculate swap exchange rate from gard to algo
 *    @param {gard} {Float} - representing how many gard to send
 *    @param {lockedInRate} {Float} - representing exchange rate from current pool at time of capture
 *    @returns {transactionSummary} - returns details of the exchange to allow for execution
 *
 * @function queryExchangeRate - query blockchain for Pact's asset pool exchange rate given two assets
 *    @param {asset1} {Object} - name and id of asset1
 *    @param {asset2} {Object} name and id of asset2
 *    @returns {rate} ratio of exchange at the time of query
 *
 * @function execute - build and execute blockchain transaction
 *    @param {type} {String} - type of exchange to execute ex. "algoToGard" || "gardToAlgo"
 *    @param {info} {Object} - account holder information with address and wallet details
 *    @returns {transactionResult} - confirmation of exchange from blockchain
 *
 *************/

export function PactSwap(dexId, recipient, assetsToOptInto) {
  SwapController.call(this, dexId, recipient, assetsToOptInto);
  this.pactTime = "pact time!";
}

PactSwap.prototype.constructor = PactSwap;

export const testObj = new PactSwap("pact", pactRecipient, [
  {
    name: "gain",
    id: gainID,
  },
  {
    name: "gard",
    id: gardID,
  },
  {
    name: "gardian",
    id: gardianID,
  },
]);

PactSwap.prototype = {
  constructor: SwapController,
  algoToGard: () => {
    console.log("algo to gard!");
  },
  gardToAlgo: () => {
    console.log("gard to algo");
  },
  showMeTheDeets: () => {
    console.log("this id", this.id);
    console.log("this recipient", this.recipient);
    console.log("this assets", this.assets);
  },
};

// export function showPactSwapObject() {
//   const result = new PactSwap("pact", pactRecipient, [
//     {
//       name: "gain",
//       id: gainID,
//     },
//     {
//       name: "gard",
//       id: gardID,
//     },
//     {
//       name: "gardian",
//       id: gardianID,
//     },
//   ]);
//   return result;
// }

// export function pactSwap(
//   asset1,
//   asset2,
//   recipient,
//   close = false
//   ) {
//   const infoPromise = accountInfo();
//   const paramsPromise = getParams(0);
//   const info = await infoPromise;
//   const params = await paramsPromise;

//   console.log("recipient from transactionFunc being called", recipient);

//   let id = openFeeID;
//   if (close) {
//     id = closeFeeID;
//   }
//   const app = await getAppByID(id);
//   // const state = app["params"]["global-state"];
//   console.log("app: -> ", app);
//   const gardBalance = getGardBalance(info);
//   console.log(gardBalance);

// console.log("state: ->", state);

// for (let n = 0; n < state.length; n++) {
// let stateVal = _parseValFromAppState(state, n);
// console.log(`state val at index ${n}`, stateVal);
// }
// let phrase = "";
// let f_a = [0, 31566704];

// let txn1 = makePaymentTxnWithSuggestedParams({
//   from: info.address,
//   to: recipient,
//   params: params,
// });

// let txn2 = makeApplicationNoOpTxn(
//   info.address,
//   params,
//   pactRecipient,
//   ["SWAP", 38, "GHOST"],
//   f_a,
// );
// let gid = computeGroupID([txn1, txn2]);
// txn1.group = gid;
// txn2.group = gid;
// let stxn1 = txn1.signTxn(key);
// let stxn2 = txn2.signTxn(key);
// let txid = await sendTxn([stxn1, stxn2]);
// return txid;
// }
