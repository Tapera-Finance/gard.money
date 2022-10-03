import { ids } from "./ids";
import { getAppByID } from "../wallets/wallets";

export function microGARD(GARD) {
  // Helper function so we don't type the number of zeros anytime
  return parseInt(GARD * 1000000);
}

export function setLoadingStage(stage) {
  sessionStorage.setItem("loadingStage", JSON.stringify(stage));
}

export function getGardBalance(info) {
  for (var i = 0; i < info["assets"].length; i++) {
    if (info["assets"][i]["asset-id"] == ids.asa.gard) {
      return info["assets"][i]["amount"];
    }
  }
  return null;
}

export async function getAppField(appId, field){
  const appInfo = (await getAppByID(appId)).params
  for (let i = 0; i < appInfo["global-state"].length; i++) {
    if (appInfo["global-state"][i]["key"] == btoa(field)) {
      return appInfo["global-state"][i]["value"]["uint"];
    }
  }
  throw "getAppField: field not present"
}
