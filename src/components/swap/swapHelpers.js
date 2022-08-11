import { estimateReturn, gardpool } from "../../transactions/swap";
import { getWalletInfo, getGARDInWallet } from "../../wallets/wallets";
import { gardID } from "../../transactions/ids";
import { formatToDollars } from "../../utils";

const prices = {
  algo: gardpool.calculator.primaryAssetPrice,
  gard: gardpool.calculator.secondaryAssetPrice,
};

export const mAlgosToAlgos = (num) => {
  return num / 1000000;
};

export const algosTomAlgos = (num) => {
  return num * 1000000;
};

export const empty = (value) => value === 0 || value === "";

export const convertToDollars = (amt, idx) =>
  formatToDollars(amt * prices[idx]);

export const getBalances = () => {
  return {
    algo: mAlgosToAlgos(getWalletInfo().amount).toFixed(2),
    gard: mAlgosToAlgos(getGARDInWallet()).toFixed(2),
  };
};
/**
 * Component Helpers
 */

/**
 * @function calcTransResult - calculate estimated result of transaction prior to send
 * @param {Number || String} amount - input in asset unit
 * @param {Number} totalX - total asset X in pool
 * @param {Number} totalY - total asset Y in pool
 * @param {Object} transaction - data obj acc.
 * @returns estimated return of swap between x & y
 */
export function calcTransResult(amount, totalX, totalY, slippageTolerance) {
  if (amount > 0) {
    return (estimateReturn(parseFloat(amount), totalX, totalY) / 1e6).toFixed(
      6,
    );
  }
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
    (assetA.id === 0 && assetB.id === gardID) ||
    (assetA.id === gardID && assetB.id === 0)
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
