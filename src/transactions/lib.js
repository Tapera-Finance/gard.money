import { ids } from "./ids";
import { getAppByID } from "../wallets/wallets";

export let cdpInterest = .02; // XXX: This should be kept close to the actual interest rate - it is updated on initialization though

export async function getInterest() {
  // TODO: cache interest
  console.log("getInterest called")
  const interestInfo = await getAppField(ids.app.dao.interest, "interest_rate")
  console.log("getInterest returned: ", interestInfo)
  return interestInfo / 1000
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

export function getGardBalance(info) {
  return getMicroGardBalance(info)/1000000
}

export async function getAppField(appId, field, appInfo = undefined){
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
