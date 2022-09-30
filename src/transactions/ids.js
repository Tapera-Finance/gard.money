import { VERSION } from "../globals";

// ASAs
let _usdcID = 31566704;

// pact pool ids
let _pactUSDCGARDID = 701249684
let _pactALGOGARDID = 801613881;
let _pactALGOUSDID = 620995314;

let _ids

// swap recipients
let _pactAlgoGardPoolAddress =
  "F4HXMBXLFLT7IQAKXUVTVEU4HIW5WGULA5RFYN6QE5AALUB54JQCAY2NBI";

if (VERSION == "MAINNET") {
  // ASAs
  // _gainID = 684649672;
  // _gardID = 684649988;
  // _gardianID = 692432647;
  _usdcID = 31566704;

// pact app ids
  _pactUSDCGARDID = 701249684
  _pactALGOGARDID = 801613881;
  _pactALGOUSDID = 620995314;


  // App ids
  // _stakingID = 684649809;
  // _openFeeID = 684649985;
  // _closeFeeID = 684649986;
  // _managerID = 684649987;
  // _validatorID = 684650147;
  // _treasuryID = 684650318;
  // _oracleID = 673925841;
  // _checkerID = 787191335;
} else if (VERSION == "TESTNET1") {
  // ASAs
  // _gainID = 73680771;
  // _gardID = 73680809;
  // _gardianID = 73680881;

  // App ids
  // _stakingID = 73680776;
  // _openFeeID = 73680806;
  // _closeFeeID = 73680807;
  // _managerID = 73680808;
  // _validatorID = 73680824;
  // _treasuryID = 73680850;
  // _oracleID = 53083112;
  // _checkerID = 96679309;
} else if (VERSION == "TESTNET2") {
  _ids = {
     asa : {
         gain : 113849889,
         gard : 113849920,
     },
     app : {
         dao : {
             staking : 113849914,
             manager : 113849919,
             interest : 113849921,
             updates : {
                validator : 113849945,
                claim : 113849972,
             },
         },
         sgard_gard : 113849946,
         validator : 113849969,
         revenue : 113849947,
         funder : 113849970,
         auction_checker : 96679309,
         oracle : 53083112,
         gard_staking : 113849994,
         treasury : 113849971,
         claimer : 113849993,
     }
  }
}

// IDs object
export const ids = _ids

// ASAs
export const usdcID = _usdcID;

// pact pool ids
export const pactUSDCGARD = _pactUSDCGARDID;
export const pactALGOGARDID = _pactALGOGARDID;
export const pactALGOUSDID = _pactALGOUSDID

// swap AlgoGardPoolAddress
export const pactAlgoGardPoolAddress = _pactAlgoGardPoolAddress;
