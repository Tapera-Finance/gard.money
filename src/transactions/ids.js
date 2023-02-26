import { VERSION } from "../globals";

// ASAs
let _usdcID = 31566704;

// pact pool ids
let _pactUSDCGARDID = 701249684;
let _pactALGOGARDID = 801613881;
let _pactALGOUSDID = 620995314;

let _ids;

// swap recipients
let _pactAlgoGardPoolAddress =
  "F4HXMBXLFLT7IQAKXUVTVEU4HIW5WGULA5RFYN6QE5AALUB54JQCAY2NBI";

if (VERSION == "MAINNET") {
  _ids = {
    asa : {
        gain : 684649672,
        gard : 684649988,
        gardian : 692432647,
        galgo: 793124631,
        glitter: 607591690,
        xsol: 792313023,
        asastats: 393537671,
    },
    app : {
        dao : {
            staking : 890603826,
            manager : 890603874,
            interest : 890603875,
            updates : {
               validator : 890603919,
               claim : 890603994,
            },
        },
        dummy : 890603876,
        sgard_gard : 890603920,
        validator : 890603991,
        revenue : 890603921,
        funder : 890603992,
        auction_checker : 96679309,
        oracle : {
          0: 673925841,
          793124631: 908941119,
        },
        gard_staking : 890604041,
        gardian_staking : 1007623298,
        glitter : {
          xsol : 1033551458,
        },
        partner: {
          asastats: 1047879402,
        },
        treasury : 890603993,
        claimer : 890604040,
    }
 };
  // ASAs
  // _gainID = 684649672;
  // _gardID = 684649988;
  // _gardianID = 692432647;
  _usdcID = 31566704;

// pact app ids
  _pactUSDCGARDID = 701249684;
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
} else if (VERSION == "TESTNET2") {
  _ids = {
     asa : {
         gain : 113908047,
         gard : 113908074,
     },
     app : {
         dao : {
             staking : 113908059,
             manager : 113908073,
             interest : 113908075,
             updates : {
                validator : 113908094,
                claim : 113908112,
             },
         },
         dummy : 113908076,
         sgard_gard : 113908095,
         validator : 113908109,
         revenue : 113908096,
         funder : 113908110,
         auction_checker : 96679309,
         oracle : 53083112,
         gard_staking : 113908142,
         treasury : 113908111,
         claimer : 113908141,
     }
  };
}

// IDs object
export const ids = _ids;

// ASAs
export const usdcID = _usdcID;

// pact pool ids
export const pactUSDCGARD = _pactUSDCGARDID;
export const pactALGOGARDID = _pactALGOGARDID;
export const pactALGOUSDID = _pactALGOUSDID;

// swap AlgoGardPoolAddress
export const pactAlgoGardPoolAddress = _pactAlgoGardPoolAddress;
