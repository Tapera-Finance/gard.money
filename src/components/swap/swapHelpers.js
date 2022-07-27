import { estimateReturn, queryAndConvertTotals } from "../../transactions/swap";

export const mAlgosToAlgos = (num) => {
  return num / 1000000;
};

export const mGardToGard = (num) => {
  return num / 1000000;
};

export const exchangeRatioAssetXtoAssetY = (assetX, assetY) => {
  return parseFloat(assetX / assetY).toFixed(4);
};

export const targetPool = (assetNameX, assetNameY) =>
  `${assetNameX}/${assetNameY}`;

export const getTotals = async () => await queryAndConvertTotals();

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
        return (
          estimateReturn(parseFloat(amount), totalX, totalY) / 1e6
        ).toFixed(6);
      }
}

/**
 * @function toggleSelect - swap element selectors based on asset pairing
 * @param {String} val - representation of val type
 * @param {String} other - comparison val
 * @param {String} type1 - offering-from, offering-amount, receiving-to, receiving-amount
 * @param {String} type2 - offering-from, offering-amount, receiving-to, receiving-amount
 * @param {String[]} assets - arr asset names
 * @param {Function} reducer - reduce transaction details
 * @void
 */

export function toggleSelect(val, other, type1, type2, assets, reducer) {
  if (val === assets[0] && other === assets[1]) {
    reducer({
      type: type1,
      value: assets[0],
    });

    reducer({
      type: type2,
      value: assets[1],
    });
    return;
  }
  if (val === assets[1] && other === assets[0]) {
    reducer({
      type: type1,
      value: assets[1],
    });
    reducer({
      type: type2,
      value: assets[0],
    });
    return;
  }
  if (val === assets[0] && other === assets[0]) {
    reducer({
      type: type1,
      value: assets[0],
    });
    reducer({
      type: type2,
      value: assets[1],
    });
    return;
  }
  if (val === assets[1] && other === assets[1]) {
    reducer({
      type: type1,
      value: assets[1],
    });
    reducer({
      type: type2,
      value: assets[0],
    });
  }
}

/**
 * @function handleExchange
 * @param {String} type - action type
 * @param {Number} amount - input for action
 * @param {String[]} assets - arr of asset names
 * @param {Function} transform - data method (in this case display exc. to user
 * @param {[]} params
 * @param {Object} transaction - acc. data obj
 * @param {Function} reducer - reduce transaction details using action type, value, transform method, params
 * @void
 */

export function handleExchange(
  type,
  amount,
  assets,
  transform,
  params,
  transaction,
  reducer,
  rightSideChanged = false
) {
  if (rightSideChanged) {
    // reducer({
    //   type: "flip-input"
    // })
    console.log("right side changed")
  }
  if (type === "offering-amount") {
    // field 1 handling from field 2 input
    if (transaction) {
      if (
        transaction.offering.from === assets[0] &&
        transaction.receiving.to === assets[1]
      ) {
        if (typeof amount === "number") {
          reducer({
            type: "receiving-amount",
            value: transform(amount, params[0], params[1], transaction),
          });
          return;
        }
      } else if (
        transaction.offering.from === assets[1] &&
        transaction.receiving.to === assets[0]
      ) {
        if (typeof amount === "number") {
          reducer({
            type: "receiving-amount",
            value: transform(amount, params[1], params[0], transaction),
          });
          return;
        }
      }
    }
  } else if (transaction) {
    if (type === "receiving-amount") {
      // field 2 handling from field 1 input
      if (transaction) {
        if (
          transaction.offering.from === assets[1] &&
          transaction.receiving.to === assets[0]
        ) {
          if (typeof amount === "number") {
            reducer({
              type: "offering-amount",
              value: amount,
            });
            reducer({
              type: "receiving-amount",
              value: transform(amount, params[1], params[0], transaction),
            });
            return;
          }
        } else if (
          transaction.offering.from === assets[0] &&
          transaction.receiving.to === assets[1]
        ) {
          if (typeof amount === "number") {
            reducer({
              type: "offering-amount",
              value: parseFloat(amount),
            });
            reducer({
              type: "receiving-amount",
              value: transform(amount, params[0], params[1], transaction),
            });
            return;
          }
        }
      }
    }
  }
}

/**
 * use asset pairings to logically determine direction of swap, decoupling it from the front end state
 *
 * @param {object} assetA - has type, amount, id
 * @param {object} assetB
 */

export async function processSwap(assetA, assetB, params) {
  /**
   * assetA.type === ALGO || GARD
   * assetB.type === ALGO || GARD
   * if assetA.type === assetB.type => throw error
   * params should have a swapTo property that is either a or b
   * from variable that is b === to ? a : a === to ? b : null
   *
      params = {
        swapTo: assetA || assetB
        from: to === assetA ? assetB : assetA
        slippageTolerance: number,
      }
   *
    * if A is being swapped to, its from B. if A is not being swapped to,  * B is from A

      pass to calculator with amount to swap, pool total of id of the received assed, pool total of id of the given asset, params.
      ensures that estimate return always receives arguments the same way independent of frontend state

      also independent of what these assets are
      */

     const poolId = targetPool(assetA.type, assetB.type)
     const pools = await queryAndConvertTotals()

     const { swapTo, slippageTolerance } = params
     const from = swapTo.type === assetA.type ? assetB : assetA
    //  const receivedValue = calcTransResult(from.amount, pools[swapTo.id], pools[from.id], slippageTolerance )
}
