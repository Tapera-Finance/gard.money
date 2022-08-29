export const CONTENT_NAMES = {
  HOME: "Home",
  DASHBOARD: "Dashboard",
  WALLET: "Wallet",
  ACTIONS: "Actions",
  MINT: "Borrow",
  AUCTIONS: "Auctions",
  SWAP: "Swap",
  REPAY: "Manage CDPs",
  DAO: "DAO",
  GOVERN: "Govern",
};

export const AUCTIONS_CONTENT_NAMES = {
  LIVE_AUCTIONS: "Live Auctions",
  BIDS: "Bids",
  MARKET_HISTORY: "Market History",
};

export const commitmentPeriodEnd = 1657814399000;

export const VERSION = "MAINNET";
// TESTNET1 = initial testnet release
// TESTNET2 = testnet w/ updated backend code
// MAINNET = mainnet

export const MINID = 7;
export const MAXID = 127;

const localStorageVersion = localStorage.getItem("version");
if (localStorageVersion != VERSION) {
  localStorage.clear();
}
localStorage.setItem("version", VERSION);
