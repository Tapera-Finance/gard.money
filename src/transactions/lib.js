import { ids } from "./ids";

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
