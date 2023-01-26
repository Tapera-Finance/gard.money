import { gardpool } from "../../transactions/swap";
import { getWalletInfo, getGARDInWallet } from "../../wallets/wallets";
import { ids } from "../../transactions/ids";
import { formatToDollars } from "../../utils";

const prices = {
  algo: gardpool.calculator.primaryAssetPrice,
  gard: gardpool.calculator.secondaryAssetPrice,
};

/**
 * swap utils
 */

export const convertToDollars = (amt, idx) =>
  formatToDollars(amt * prices[idx]);

export const inverseToDollars = (amt, idx) => formatToDollars(amt / prices[idx])

export const formatPrice = (num) => {
  let cut = 3;
  let p = num.toString();
  let ar = p.split("");
  let newStr = "";
  for (let i = 0; i < ar.length; i++) {
    let cur = ar[i];
    if (i !== 0 && i % cut === 0) {
      newStr += ",";
    }
    newStr += cur;
  }
  return newStr;
};

export const mAlgosToAlgos = (num) => {
  return num / 1000000;
};

export const algosTomAlgos = (num) => {
  return num * 1000000;
};

export const empty = (value) =>
  value === 0 || value === "" || value === undefined;

export const formatAmt = (amt) =>
  typeof amt === "string"
    ? parseInt(algosTomAlgos(parseFloat(amt)))
    : algosTomAlgos(amt);

export const getBalances = () => {
  if (!!getWalletInfo()) {
    return {
      algo: mAlgosToAlgos(getWalletInfo().amount).toFixed(2),
      gard: mAlgosToAlgos(getGARDInWallet()).toFixed(2),
    };
  }
};

export const exchangeRatioAssetXtoAssetY = (assetX, assetY) => {
  return parseFloat(assetX / assetY).toFixed(4);
};

/**
 * Component Helpers
 */

/**
 * @function calcTransResult - calculate estimated result of transaction prior to send
 * @param {Number || String} amount - input in asset unit
 * @param {Number} totalX - total asset X in pool
 * @param {Number} totalY - total asset Y in pool
 * @returns estimated return of swap between x & y
 */
export function calcTransResult(amount, totalX, totalY) {
  if (amount > 0) {
    return (estimateReturn(parseFloat(amount), totalX, totalY) / 1e6).toFixed(
      6,
    );
  }
}

export function estimateReturn(input, totalX, totalY) {
  let receivedAmount =
    (((1e6 * (input * totalY)) / Math.floor(input * 1e6 + totalX)) * 9900) /
    10000;
  return parseInt(receivedAmount);
}

/**
 * preview based on selected asset pairning, input, pool amounts
 * @param {object} assetA - has type, amount, id
 * @param {object} assetB
 * /**
 * assetA.type === ALGO || GARD
 * assetB.type === ALGO || GARD
 * pass to calculator with amount to swap, pool total
 * of id of the received assed, pool total of id of
 * the given asset, params.
 */

export function previewSwap(assetA, assetB, params) {
  let poolToUse;

  if (
    (assetA.id === 0 && assetB.id === ids.asa.gard) ||
    (assetA.id === ids.asa.gard && assetB.id === 0)
  ) {
    poolToUse = gardpool;
  }

  const { swapTo, slippageTolerance } = params;
  const from = swapTo.type === assetA.type ? assetB : assetA;
  let calcResult;
  if (from.type === assetB.type) {
    calcResult = calcTransResult(
      from.amount,
      parseFloat(poolToUse.state.totalSecondary),
      parseFloat(poolToUse.state.totalPrimary),
      slippageTolerance,
    );
  } else {
    calcResult = calcTransResult(
      from.amount,
      parseFloat(poolToUse.state.totalPrimary),
      parseFloat(poolToUse.state.totalSecondary),
      slippageTolerance,
    );
  }

  return {
    calcResult: calcResult,
  };
}
