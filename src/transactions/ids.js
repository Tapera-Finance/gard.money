import { VERSION } from "../globals";

// ASAs
let _gainID = 73680771;
let _gardID = 73680809;
let _gardianID = 692432647;
let _usdcID;

// pact pool ids
let _pactALGOGARDID;
let _pactUSDCGARDID;
let _pactALGOUSDID;

// App ids
let _stakingID;
let _openFeeID;
let _closeFeeID;
let _managerID;
let _validatorID;
let _treasuryID;
let _oracleID;
let _checkerID;

let _ids

// swap recipients
let _pactAlgoGardPoolAddress =
  "F4HXMBXLFLT7IQAKXUVTVEU4HIW5WGULA5RFYN6QE5AALUB54JQCAY2NBI";

if (VERSION == "MAINNET") {
  // ASAs
  _gainID = 684649672;
  _gardID = 684649988;
  _gardianID = 692432647;
  _usdcID = 31566704;

// pact app ids
  _pactUSDCGARDID = 701249684
  _pactALGOGARDID = 801613881;
  _pactALGOUSDID = 620995314;


  // App ids
  _stakingID = 684649809;
  _openFeeID = 684649985;
  _closeFeeID = 684649986;
  _managerID = 684649987;
  _validatorID = 684650147;
  _treasuryID = 684650318;
  _oracleID = 673925841;
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
  _checkerID = 96679309;
} else if (VERSION == "TESTNET2" {
  _ids = {
     asa : {
         gain : 108765013,
         gard : 108765058,
         sgard : 108765059,
     },
     app : {
         dao : {
             staking : 108765035,
             manager : 108765057,
             interest : 108765060,
             updates : 108765085,
         },
         sgard_gard : 108765105,
         validator : 108765126,
         revenue : 108765127,
         funder : 108765128,
         auction_checker : 96679309,
         oracle : 53083112,
     }
  }
}

// IDs object
export const ids = _ids

// ASAs
export const gainID = _gainID;
export const gardID = _gardID;
export const gardianID = _gardianID;
export const usdcID = _usdcID;

// pact pool ids
export const pactUSDCGARD = _pactUSDCGARDID;
export const pactALGOGARDID = _pactALGOGARDID;
export const pactALGOUSDID = _pactALGOUSDID


// App ids
export const stakingID = _stakingID;
export const openFeeID = _openFeeID;
export const closeFeeID = _closeFeeID;
export const managerID = _managerID;
export const validatorID = _validatorID;
export const treasuryID = _treasuryID;
export const oracleID = _oracleID;
export const checkerID = _checkerID;

// swap AlgoGardPoolAddress
export const pactAlgoGardPoolAddress = _pactAlgoGardPoolAddress;
