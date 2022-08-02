import {
  estimateReturn,
  previewPoolSwap,
  gardpool,
  getPools,
} from "../../transactions/swap";
import pactsdk from "@pactfi/pactsdk";

export const mAlgosToAlgos = (num) => {
  return num / 1000000;
};

export const algosTomAlgos = (num) => {
  return num * 1000000;
}

export const mGardToGard = (num) => {
  return num / 1000000;
};

export const targetPool = (assetNameX, assetNameY) =>
  `${assetNameX}/${assetNameY}`;

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
 * use asset pairings to logically determine direction of swap, decoupling it from the front end state
 *
 * @param {object} assetA - has type, amount, id
 * @param {object} assetB
 * /**
   * assetA.type === ALGO || GARD
   * assetB.type === ALGO || GARD
   * pass to calculator with amount to swap, pool total
   * of id of the received assed, pool total of id of
   * the given asset, params.
   * ensures that estimate return always receives
   * arguments the same way independent of frontend
   * state
   * also independent of what these assets are
*/

export async function processSwap(assetA, assetB, params) {
  const pools = await getPools();


  const { swapTo, slippageTolerance } = params;
  const from = swapTo.type === assetA.type ? assetB : assetA;

  const calcResult = calcTransResult(
    from.amount,
    pools[swapTo.id],
    pools[from.id],
    slippageTolerance,
  );

  const pactResult = previewPoolSwap(
    gardpool,
    from.id,
    from.amount,
    slippageTolerance,
    true,
  );
  // const swap = new pactsdk.Swap()

  return {
    calcResult: calcResult,
    pactResult: pactResult,
  };
}
