export const CONTENT_NAMES = {
  HOME: "Home",
  ACCOUNT: "Account",
  ACTIONS: "Actions",
  BORROW: "Borrow",
  AUCTIONS: "Auctions",
  SWAP: "Swap",
  STAKE: "Stake",
  DAO: "DAO",
  GOVERN: "ALGO Governance",
  ANALYTICS: "Analytics",
};

export const AUCTIONS_CONTENT_NAMES = {
  LIVE_AUCTIONS: "Live Auctions",
  BIDS: "Bids",
  MARKET_HISTORY: "Market History",
};

export function setReferrer(arg){
  referrer = arg;
}

export var referrer = null;

export const commitmentPeriodEnd = 1673798400000;

export const VERSION = "MAINNET";
const UPDATE = 3;
// TESTNET1 = initial testnet release
// TESTNET2 = testnet w/ updated backend code
// MAINNET = mainnet

export const MINID = 7;
export const MAXID = 127;

if (localStorage.getItem("version") != VERSION || localStorage.getItem("update") != UPDATE) {
  localStorage.clear();
}
localStorage.setItem("version", VERSION);
localStorage.setItem("update", UPDATE);
