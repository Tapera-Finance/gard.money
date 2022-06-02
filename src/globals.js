export const CONTENT_NAMES = {
  HOME: 'Home',
  DASHBOARD: 'Dashboard',
  WALLET: 'Wallet',
  MINT: 'New CDP',
  REPAY: 'Manage CDPs',
  AUCTIONS: 'Auctions',
  SWAP: 'Swap',
  DAO: 'DAO',
  ALGO_GOVERNANCE: 'Algo Governance',
}

export const AUCTIONS_CONTENT_NAMES = {
  LIVE_AUCTIONS: 'Live Auctions',
  BIDS: 'Bids',
  MARKET_HISTORY: 'Market History',
}

export const VERSION = "TESTNET1"
// TESTNET1 = initial testnet release
// TESTNET2 = testnet w/ updated backend code
// MAINNET = mainnet

const localStorageVersion = localStorage.getItem('version')
if (localStorageVersion != VERSION) {
	localStorage.clear()
}
localStorage.setItem('version', VERSION)
