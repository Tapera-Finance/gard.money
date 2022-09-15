import algosdk from "algosdk";
import { VERSION } from "../globals";

function contractStringToBytes(string) {
  return Uint8Array.from(atob(string), (c) => c.charCodeAt(0));
}

// Setup
const encoder = new TextEncoder();

// Last updated: 22.02.2022
let cdpTemplateString =
  "BiAEAgGmtMg0ADEgMgMSMQElEhAtFyUSQACoLRcjEkAANi0XIhJAACMtF4EDEkAAAQAxGCQSMRklEhA2GgCAB0F1Y3Rpb24SEEIAtTEZIxIxGCQSEEIAqTEQIxJAAEYxGSISNhwCgCCJ292BS9oSZyC9CmaKFG4/FMfHnby4lnt2559mFLHb3xIQMRgkEhAxFiIIOAAxABIQMRYiCDgQIxIQQgBcMRYiCTgAMQASMRYiCTgYJBIQMRYiCTgZIhIQQgA+MRYjCTkaAReBDxIxFiMJORoAgApPd25lckNoZWNrEhAxFiMJOBgkEhAxECMSMQglEhAxCTIDEhAxECISERAQQw==";
let cdpTemplateString2 = "BiAEAgGmtMg0ADEgMgMSMQElEhAtFyUSQACoLRcjEkAANi0XIhJAACMtF4EDEkAAAQAxGCQSMRklEhA2GgCAB0F1Y3Rpb24SEEIAtTEZIxIxGCQSEEIAqTEQIxJAAEYxGSISNhwCgCC+6esZvMn5n50shvOEPMSEkq1eFvRvDfUchJXaZw3aYhIQMRgkEhAxFiIIOAAxABIQMRYiCDgQIxIQQgBcMRYiCTgAMQASMRYiCTgYJBIQMRYiCTgZIhIQQgA+MRYjCTkaAReBDBIxFiMJORoAgApPd25lckNoZWNrEhAxFiMJOBgkEhAxECMSMQglEhAxCTIDEhAxECISERAQQw=="
if (VERSION == "MAINNET") {
  cdpTemplateString =
    "BiAJAKPdu8YCAwIBBITcu8YCBQYmAiCJ292BS9oSZyC9CmaKFG4/FMfHnby4lnt2559mFLHb3yBk2J6AcVbEU2zmoj5Zcx3tjCo7oo0ZVoc/LbqEG9PaKS0XIhJAAV0tFyEEEkABLS0XJRJAAOItFyQSQAChLRchBRJAAIEtFyEHEkAASi0XIQgSQAABADEYIxIxGSISEDYaAIAHQXVjdGlvbhIQMgQkEjMAGCMSEDMAGSISEDcAGgCACENsZWFyQXBwEhAzARkkEhARQgFaMgQkEjMAGSISEDMAGCMSEDcAGgCACE1vcmVHQVJEEhAzAQAoEhAzAQcpEhBCASsxGSEEEjEYIxIQMSAyAxIQMQEiEhBCARMyBCEFEjMAGSISEDMAGCMSEDcAGgCACkNsb3NlTm9GZWUSEDcAMAAhBhIQMwEAKBIQMwIZJBIQQgDZMgQhBRIzABkiEhAzABgjEhA3ABoAgAhDbG9zZUZlZRIQNwAwACEGEhAzAQAoEhAzAhkkEhAzAwcpEhAzAwkoEhBCAJUyBCEHEjMAGSUSEDMAGCMSEDcAMAAhBhIQMwMUKRIQMwQUKBIQQgBtMwAIgQwSMwAAKBIQMwEgMgMSEDMBASISEDIEJRJAADEyBCQSMwEQIQgSEDMBGCMTEDMCGCMSEDMCGSISEDcCGgCACEFwcENoZWNrEhAQQgAcMwEQIQQSMwEIIhIQMwEJMgMSEDMBECUSEUL/4EM=";
}
const cdpTemplate = contractStringToBytes(cdpTemplateString);
const cdpTemplate2 = contractStringToBytes(cdpTemplateString2);

/*
for (let i = 0; i < cdpTemplate.length; i++) {
  if (cdpTemplate[i] != cdpTemplate2[i]) {
    console.log(i)
  }
}
*/

// Exports

let _slices = [0, 104, 136, 204, 205];
if (VERSION == "MAINNET") {
  _slices = [0, 23, 55, 448, 449, 554];
}
const slices = _slices;

export function cdpGen(userAddress, accountID) {
  // XXX: Could cache results once they are done the first time

  let userAddressBytes = algosdk.decodeAddress(userAddress);
  let accountIDBytes = new Uint8Array([accountID]); // XXX: Could add a nice check here that it's a small enough value

  const sub1 = cdpTemplate.slice(slices[0], slices[1]);
  const sub2 = cdpTemplate.slice(slices[2], slices[3]);
  const sub3 = cdpTemplate.slice(slices[4]);

  // Crafts the contract with proper insertions
  const contract = new Uint8Array([
    ...sub1,
    ...userAddressBytes.publicKey,
    ...sub2,
    ...accountIDBytes,
    ...sub3,
  ]);

  const account = new algosdk.LogicSigAccount(contract);

  return {
    address: account.address(),
    logic: contract,
  };
}

export const validatorAddress = "CYGI4RUDHYCZH576B7ALQ432JYANGNE52NWRS3CQEPJNWOONYMWILDWK4E"
