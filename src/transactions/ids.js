import { VERSION } from "../globals";

// ASAs
let _gainID = 73680771;
let _gardID = 73680809;
let _gardianID = 692432647;

// App ids
let _stakingID;
let _openFeeID;
let _closeFeeID;
let _managerID;
let _validatorID;
let _treasuryID;
let _oracleID;
let _pactGARDID;
let _checkerID;

// swap recipients
let _pactAlgoGardPoolAddress = "LZ77VFESBLRGIMS5RV2TOQLS7LTVDME2W6GHWMEI2WTMXTAVEHEM4XXYTY";

if (VERSION == "MAINNET") {
  // ASAs
  _gainID = 684649672;
  _gardID = 684649988;
  _gardianID = 692432647;

  // App ids
  _stakingID = 684649809;
  _openFeeID = 684649985;
  _closeFeeID = 684649986;
  _managerID = 684649987;
  _validatorID = 684650147;
  _treasuryID = 684650318;
  _oracleID = 673925841;
  _pactGARDID = 692053574;
  _checkerID = 787191335;
  
} else if (VERSION == "TESTNET1") {
  // ASAs
  _gainID = 73680771;
  _gardID = 73680809;
  _gardianID = 73680881;

  // App ids
  _stakingID = 73680776;
  _openFeeID = 73680806;
  _closeFeeID = 73680807;
  _managerID = 73680808;
  _validatorID = 73680824;
  _treasuryID = 73680850;
  _oracleID = 53083112;
  _pactGARDID = 692053574;
  _checkerID = 96679309;
}

// ASAs
export const gainID = _gainID;
export const gardID = _gardID;
export const gardianID = _gardianID;

// App ids
export const stakingID = _stakingID;
export const openFeeID = _openFeeID;
export const closeFeeID = _closeFeeID;
export const managerID = _managerID;
export const validatorID = _validatorID;
export const treasuryID = _treasuryID;
export const oracleID = _oracleID;
export const pactGARDID = _pactGARDID;
export const checkerID = _checkerID;

// swap AlgoGardPoolAddress
export const pactAlgoGardPoolAddress = _pactAlgoGardPoolAddress;
