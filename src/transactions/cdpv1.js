function getCDPs() {
  // V1: Only loads from cache
  // CDPs is a list of CDP dictionaries. These dictionaries include:
  // {
  //   collateral: MICROALGOS,
  //   debt: MICROGARD,
  // }
  let CDPs = localStorage.getItem("V1CDPs");
  if (CDPs !== null) {
    return JSON.parse(CDPs);
  }
  return {};
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
  localStorage.setItem("V1CDPs", JSON.stringify(CDPs));
}


async function checkChainForCDP(address, id) {
  // This function checks for the existence of a CDP
  // This is done by getting the info, then
  const cdp = cdpGen(address, id);
  const info = await accountInfo(cdp.address);

  if (info.amount > 0) {
    let collateral = info.amount;
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

export async function updateCDPs(address) {
  // Checks all CDPs by an address
  const CDPs = getCDPs();
  const accountCDPs = CDPs[address];
  let webcalls = 0;
  // Sets the frequency to double check CDPs
  let mins_to_refresh = 144000; // 100 day refresh
  for (const x of Array(MAXID - MINID)
    .fill()
    .map((_, i) => i + MINID)) {
    if (
      !accountCDPs ||
      !accountCDPs.hasOwnProperty(x) ||
      accountCDPs[x]["checked"] + mins_to_refresh * 60 * 1000 < Date.now()
    ) {
      if (checkChainForCDP(address, x)) {
        mins_to_refresh
      }
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
