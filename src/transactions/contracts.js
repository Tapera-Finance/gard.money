import algosdk from "algosdk";
import { VERSION } from "../globals";

function contractStringToBytes(string) {
  return Uint8Array.from(atob(string), (c) => c.charCodeAt(0));
}

// Setup
const encoder = new TextEncoder();

// Last updated: 22.02.2022
let cdpTemplateString = "BiAEAQLx7KQ2ADEgMgMSMQElEhAtFyUSQACrLRciEkAANi0XIxJAACMtF4EDEkAAAQAxGCQSMRklEhA2GgCAB0F1Y3Rpb24SEEIAuDEZIhIxGCQSEEIArDEQgQYSQAAlMRYjCTgAMQASMRYjCTgYJBIQMRYjCTgZIxIQMRAiEhAiEEIAfzYcAoAgidvdgUvaEmcgvQpmihRuPxTHx528uJZ7duefZhSx298SMRgkEhAxFiMIOAAxABIQMRYjCDgQIhIQQv+6MRYiCTkaAReBDxIxFiIJORoAgApPd25lckNoZWNrEhAxFiIJOBgkEhAxECISMQglEhAxCTIDEhAxECMSERAQQw=="
let cdpTemplateString2 = "BiAEAQLx7KQ2ADEgMgMSMQElEhAtFyUSQACrLRciEkAANi0XIxJAACMtF4EDEkAAAQAxGCQSMRklEhA2GgCAB0F1Y3Rpb24SEEIAuDEZIhIxGCQSEEIArDEQgQYSQAAlMRYjCTgAMQASMRYjCTgYJBIQMRYjCTgZIxIQMRAiEhAiEEIAfzYcAoAgvunrGbzJ+Z+dLIbzhDzEhJKtXhb0bw31HISV2mcN2mISMRgkEhAxFiMIOAAxABIQMRYjCDgQIhIQQv+6MRYiCTkaAReBDBIxFiIJORoAgApPd25lckNoZWNrEhAxFiIJOBgkEhAxECISMQglEhAxCTIDEhAxECMSERAQQw=="
if (VERSION == "MAINNET") {
  cdpTemplateString =
    "BiAJAKPdu8YCAwIBBITcu8YCBQYmAiCJ292BS9oSZyC9CmaKFG4/FMfHnby4lnt2559mFLHb3yBk2J6AcVbEU2zmoj5Zcx3tjCo7oo0ZVoc/LbqEG9PaKS0XIhJAAV0tFyEEEkABLS0XJRJAAOItFyQSQAChLRchBRJAAIEtFyEHEkAASi0XIQgSQAABADEYIxIxGSISEDYaAIAHQXVjdGlvbhIQMgQkEjMAGCMSEDMAGSISEDcAGgCACENsZWFyQXBwEhAzARkkEhARQgFaMgQkEjMAGSISEDMAGCMSEDcAGgCACE1vcmVHQVJEEhAzAQAoEhAzAQcpEhBCASsxGSEEEjEYIxIQMSAyAxIQMQEiEhBCARMyBCEFEjMAGSISEDMAGCMSEDcAGgCACkNsb3NlTm9GZWUSEDcAMAAhBhIQMwEAKBIQMwIZJBIQQgDZMgQhBRIzABkiEhAzABgjEhA3ABoAgAhDbG9zZUZlZRIQNwAwACEGEhAzAQAoEhAzAhkkEhAzAwcpEhAzAwkoEhBCAJUyBCEHEjMAGSUSEDMAGCMSEDcAMAAhBhIQMwMUKRIQMwQUKBIQQgBtMwAIgQwSMwAAKBIQMwEgMgMSEDMBASISEDIEJRJAADEyBCQSMwEQIQgSEDMBGCMTEDMCGCMSEDMCGSISEDcCGgCACEFwcENoZWNrEhAQQgAcMwEQIQQSMwEIIhIQMwEJMgMSEDMBECUSEUL/4EM=";
}
const cdpTemplate = contractStringToBytes(cdpTemplateString);
const cdpTemplate2 = contractStringToBytes(cdpTemplateString2);

let _slices = [0]
let different = false
for (let i = 0; i < cdpTemplate.length; i++) {
  if (cdpTemplate[i] != cdpTemplate2[i]) {
    if (!different) {
      _slices.push(i)
    }
    different = true
  } else {
    if (different) {
      _slices.push(i)
    }
    different = false
  }
}
const slices = _slices;


// Exports

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
