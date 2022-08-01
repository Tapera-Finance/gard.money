const axios = require("axios");

let response = null;
export async function getAlgoUsdHistoric(timeframe) {
  try {
    response = await axios.get("http://localhost:8888/prices", {
      params: { timeframe },
    });
  } catch (ex) {
    response = null;
    // error
    console.log(ex);
  }
  if (response) {
    // success
    const json = response.data;
    return json;
  }
}

export async function getChainData() {
  try {
    const response = await axios.get(
      "https://storage.googleapis.com/algo-pricing-data-2022/auction_data.json",
    );
    return response.data;
  } catch (e) {
    console.log("Can't get on-chain data");
  }
}

export async function getCurrentAlgoUsd() {
  try {
    const response = await axios.get(
      "https://storage.googleapis.com/algo-pricing-data-2022/latest_pricing.json",
    );
    return response.data.float_price;
  } catch (e) {
    console.log("Cant get current algo/usd", e);
  }
}