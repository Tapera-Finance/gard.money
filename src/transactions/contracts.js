import algosdk from "algosdk";
import { VERSION } from "../globals";

function contractStringToBytes(string) {
  return Uint8Array.from(atob(string), (c) => c.charCodeAt(0));
}

// Setup
const encoder = new TextEncoder();

// Last updated: 22.02.2022
let cdpTemplateString =
  "BSAJALiPkSMDAgEEqY+RIwUGJgIgvunrGbzJ+Z+dLIbzhDzEhJKtXhb0bw31HISV2mcN2mIg6WuSwfYLGUv+8M7RDFpOSXzJmD9OndM38jbReCdruR4tFyISQAFdLRchBBJAAS0tFyUSQADiLRckEkAAoS0XIQUSQACBLRchBxJAAEotFyEIEkAAAQAxGCMSMRkiEhA2GgCAB0F1Y3Rpb24SEDIEJBIzABgjEhAzABkiEhA3ABoAgAhDbGVhckFwcBIQMwEZJBIQEUIBWjIEJBIzABkiEhAzABgjEhA3ABoAgAhNb3JlR0FSRBIQMwEAKBIQMwEHKRIQQgErMRkhBBIxGCMSEDEgMgMSEDEBIhIQQgETMgQhBRIzABkiEhAzABgjEhA3ABoAgApDbG9zZU5vRmVlEhA3ADAAIQYSEDMBACgSEDMCGSQSEEIA2TIEIQUSMwAZIhIQMwAYIxIQNwAaAIAIQ2xvc2VGZWUSEDcAMAAhBhIQMwEAKBIQMwIZJBIQMwMHKRIQMwMJKBIQQgCVMgQhBxIzABklEhAzABgjEhA3ADAAIQYSEDMDFCkSEDMEFCgSEEIAbTMACIF0EjMAACgSEDMBIDIDEhAzAQEiEhAyBCUSQAAxMgQkEjMBECEIEhAzARgjExAzAhgjEhAzAhkiEhA3AhoAgAhBcHBDaGVjaxIQEEIAHDMBECEEEjMBCCISEDMBCTIDEhAzARAlEhFC/+BD";
let cdpTemplateString2 = "BiAEAQLGv+4zACYBBUNsb3NlLRclEkAA0C0XIhJAAJYtFyMSQABCLReBAxJAACMtF4EEEkAAAQAxGCQSMRklEhA2GgCAB0F1Y3Rpb24SEEIA4DEZIhIxGCQSEDEgMgMSEDEBJRIQQgDJMRkjEkAAJjEWIwk4ADEAEjEWIwk4GCQSEDEWIwk5GgAoEhAxECISECIQQgCcMRgkEjYaACgSEDEWIwg4ADEAEhAxFiMIOBAiEhBC/9sxGSMSMRgkEhA2HAKAIL7p6xm8yfmfnSyG84Q8xISSrV4W9G8N9RyEldpnDdpiEhBCAEkxFiIJORoBF4F0EjEWIgk5GgCACk93bmVyQ2hlY2sSEDEWIgk4GCQSEDEgMgMSEDEBJRIQMRAiEjEIJRIQMQkyAxIQMRAjEhEQQw=="
if (VERSION == "MAINNET") {
  cdpTemplateString =
    "BiAJAKPdu8YCAwIBBITcu8YCBQYmAiCJ292BS9oSZyC9CmaKFG4/FMfHnby4lnt2559mFLHb3yBk2J6AcVbEU2zmoj5Zcx3tjCo7oo0ZVoc/LbqEG9PaKS0XIhJAAV0tFyEEEkABLS0XJRJAAOItFyQSQAChLRchBRJAAIEtFyEHEkAASi0XIQgSQAABADEYIxIxGSISEDYaAIAHQXVjdGlvbhIQMgQkEjMAGCMSEDMAGSISEDcAGgCACENsZWFyQXBwEhAzARkkEhARQgFaMgQkEjMAGSISEDMAGCMSEDcAGgCACE1vcmVHQVJEEhAzAQAoEhAzAQcpEhBCASsxGSEEEjEYIxIQMSAyAxIQMQEiEhBCARMyBCEFEjMAGSISEDMAGCMSEDcAGgCACkNsb3NlTm9GZWUSEDcAMAAhBhIQMwEAKBIQMwIZJBIQQgDZMgQhBRIzABkiEhAzABgjEhA3ABoAgAhDbG9zZUZlZRIQNwAwACEGEhAzAQAoEhAzAhkkEhAzAwcpEhAzAwkoEhBCAJUyBCEHEjMAGSUSEDMAGCMSEDcAMAAhBhIQMwMUKRIQMwQUKBIQQgBtMwAIgQwSMwAAKBIQMwEgMgMSEDMBASISEDIEJRJAADEyBCQSMwEQIQgSEDMBGCMTEDMCGCMSEDMCGSISEDcCGgCACEFwcENoZWNrEhAQQgAcMwEQIQQSMwEIIhIQMwEJMgMSEDMBECUSEUL/4EM=";
} else if (VERSION == "TESTNET2") {
  cdpTemplateString =
    "BiAEAQLGv+4zACYBBUNsb3NlLRclEkAA0C0XIhJAAJYtFyMSQABCLReBAxJAACMtF4EEEkAAAQAxGCQSMRklEhA2GgCAB0F1Y3Rpb24SEEIA4DEZIhIxGCQSEDEgMgMSEDEBJRIQQgDJMRkjEkAAJjEWIwk4ADEAEjEWIwk4GCQSEDEWIwk5GgAoEhAxECISECIQQgCcMRgkEjYaACgSEDEWIwg4ADEAEhAxFiMIOBAiEhBC/9sxGSMSMRgkEhA2HAKAIInb3YFL2hJnIL0KZooUbj8Ux8edvLiWe3bnn2YUsdvfEhBCAEkxFiIJORoBF4EMEjEWIgk5GgCACk93bmVyQ2hlY2sSEDEWIgk4GCQSEDEgMgMSEDEBJRIQMRAiEjEIJRIQMQkyAxIQMRAjEhEQQw==";
  cdpTemplateString2 = "BiAEAQLGv+4zACYBBUNsb3NlLRclEkAA0C0XIhJAAJYtFyMSQABCLReBAxJAACMtF4EEEkAAAQAxGCQSMRklEhA2GgCAB0F1Y3Rpb24SEEIA4DEZIhIxGCQSEDEgMgMSEDEBJRIQQgDJMRkjEkAAJjEWIwk4ADEAEjEWIwk4GCQSEDEWIwk5GgAoEhAxECISECIQQgCcMRgkEjYaACgSEDEWIwg4ADEAEhAxFiMIOBAiEhBC/9sxGSMSMRgkEhA2HAKAIL7p6xm8yfmfnSyG84Q8xISSrV4W9G8N9RyEldpnDdpiEhBCAEkxFiIJORoBF4F0EjEWIgk5GgCACk93bmVyQ2hlY2sSEDEWIgk4GCQSEDEgMgMSEDEBJRIQMRAiEjEIJRIQMQkyAxIQMRAjEhEQQw=="
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

let _slices = [0, 196, 228, 242, 243];
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

export const validatorAddress = "YQUVJO2YQCFZRCQ7FCNUIVAV3E3NQWLNM5NKEHRNUFAVTRDAKFK6FLQRQI"
