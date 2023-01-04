import { ids } from "./ids";
import { getAppByID, getWalletInfo } from "../wallets/wallets";

export let cdpInterest = .02; // XXX: This should be kept close to the actual interest rate - it is updated on initialization though

export async function getInterest() {
  // TODO: cache interest
  const interestInfo = await getAppField(ids.app.dao.interest, "interest_rate")
  cdpInterest = interestInfo / 1000
  return cdpInterest
}

// We immeadiately update the interest in a background thread
getInterest()

export function microGARD(GARD) {
  // Helper function so we don't type the number of zeros anytime
  return parseInt(GARD * 1000000);
}

export function setLoadingStage(stage) {
  sessionStorage.setItem("loadingStage", JSON.stringify(stage));
}

export function getMicroGardBalance(info) {
  for (var i = 0; i < info["assets"].length; i++) {
    if (info["assets"][i]["asset-id"] == ids.asa.gard) {
      return info["assets"][i]["amount"];
    }
  }
  return null;
}

export function getGardianBalance(info) {
  for (var i = 0; i < info["assets"].length; i++) {
    if (info["assets"][i]["asset-id"] == ids.asa.gardian) {
      return info["assets"][i]["amount"];
    }
  }
  return null;
}

export function getGardBalance(info) {
  return getMicroGardBalance(info)/1000000
}

export function getLocalAppField(appId, field) {
  // XXX: Currently only works for uints
  const user_info = getWalletInfo();

  for (let i = 0; i < user_info["apps-local-state"].length; i++) {
    if (user_info["apps-local-state"][i].id == appId) {
      const gs_info = user_info["apps-local-state"][i];
      if (gs_info.hasOwnProperty("key-value")) {
        for (let n = 0; n < gs_info["key-value"].length; n++) {
          if (gs_info["key-value"][n]["key"] === btoa(field)) {
            return gs_info["key-value"][n]["value"]["uint"];
          } 
        }
      }
      break;
    }
  }
  return undefined;
}

export async function getAppField(appId, field, appInfo = undefined){
  // XXX: Currently only works for uints
  if (!appInfo) {
    appInfo = (await getAppByID(appId)).params
  }
  for (let i = 0; i < appInfo["global-state"].length; i++) {
    if (appInfo["global-state"][i]["key"] == btoa(field)) {
      return appInfo["global-state"][i]["value"]["uint"];
    }
  }
  throw "getAppField: field not present"
}

export async function getAppFields(appId, fields) {
  let res = []
  const appInfo = (await getAppByID(appId)).params
  fields.forEach(async (field) => {
    res.push(await getAppField(appId, field, appInfo))
  })
  return res
}
