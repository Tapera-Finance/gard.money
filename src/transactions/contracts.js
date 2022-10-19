import algosdk from "algosdk";
import { VERSION } from "../globals";

function contractStringToBytes(string) {
  return Uint8Array.from(atob(string), (c) => c.charCodeAt(0));
}

// Setup
const encoder = new TextEncoder();

// Last updated: 22.02.2022
let cdpTemplateString = "BiAEAQKNs6g2ADEgMgMSMQElEhAtFyUSQACrLRciEkAANi0XIxJAACMtF4EDEkAAAQAxGCQSMRklEhA2GgCAB0F1Y3Rpb24SEEIAuDEZIhIxGCQSEEIArDEQgQYSQAAlMRYjCTgAMQASMRYjCTgYJBIQMRYjCTgZIxIQMRAiEhAiEEIAfzYcAoAgidvdgUvaEmcgvQpmihRuPxTHx528uJZ7duefZhSx298SMRgkEhAxFiMIOAAxABIQMRYjCDgQIhIQQv+6MRYiCTkaAReBDxIxFiIJORoAgApPd25lckNoZWNrEhAxFiIJOBgkEhAxECISMQglEhAxCTIDEhAxECMSERAQQw=="
let cdpTemplateString2 = "BiAEAQLXk9aoAwAxIDIDEjEBJRIQLRclEkAAqy0XIhJAADYtFyMSQAAjLReBAxJAAAEAMRgkEjEZJRIQNhoAgAdBdWN0aW9uEhBCALgxGSISMRgkEhBCAKwxEIEGEkAAJTEWIwk4ADEAEjEWIwk4GCQSEDEWIwk4GSMSEDEQIhIQIhBCAH82HAKAIL7p6xm8yfmfnSyG84Q8xISSrV4W9G8N9RyEldpnDdpiEjEYJBIQMRYjCDgAMQASEDEWIwg4ECISEEL/ujEWIgk5GgEXgQgSMRYiCTkaAIAKT3duZXJDaGVjaxIQMRYiCTgYJBIQMRAiEjEIJRIQMQkyAxIQMRAjEhEQEEM="
let asaTemplateString = "BiAFAgDR0aC/AgEEMSAyAxIxASMSEC0XIxJAAGItFyUSQABHLRciEkAAJi0XgQMSQAABADEQIQQSMRIjEhAxEYHXk9aoAxIQMRUyAxIQQgCeMRgkEjEZIxIQNhoAgAdBdWN0aW9uEhBCAIQxGSUSMRgkEhA2GgAXgQ8SEEIAcDEQgQYSQAAmMRYiCTgAMQASMRYiCTgYJBIQMRYiCTgZIhIQMRAhBBIQJRBCAEI2HAKAIInb3YFL2hJnIL0KZooUbj8Ux8edvLiWe3bnn2YUsdvfEjEYJBIQMRYiCDgAMQASEDEWIgg4ECEEEhBC/7kQQw=="
let asaTemplateString2 = "BiAFAgCXvpj6AgEEMSAyAxIxASMSEC0XIxJAAGItFyUSQABHLRciEkAAJi0XgQMSQAABADEQIQQSMRIjEhAxEYHXk9aoAxIQMRUyAxIQQgCeMRgkEjEZIxIQNhoAgAdBdWN0aW9uEhBCAIQxGSUSMRgkEhA2GgAXgQgSEEIAcDEQgQYSQAAmMRYiCTgAMQASMRYiCTgYJBIQMRYiCTgZIhIQMRAhBBIQJRBCAEI2HAKAIL7p6xm8yfmfnSyG84Q8xISSrV4W9G8N9RyEldpnDdpiEjEYJBIQMRYiCDgAMQASEDEWIgg4ECEEEhBC/7kQQw=="
if (VERSION == "MAINNET") {
  cdpTemplateString =
    "BiAEAQLXk9aoAwAxIDIDEjEBJRIQLRclEkAAqy0XIhJAADYtFyMSQAAjLReBAxJAAAEAMRgkEjEZJRIQNhoAgAdBdWN0aW9uEhBCALgxGSISMRgkEhBCAKwxEIEGEkAAJTEWIwk4ADEAEjEWIwk4GCQSEDEWIwk4GSMSEDEQIhIQIhBCAH82HAKAIInb3YFL2hJnIL0KZooUbj8Ux8edvLiWe3bnn2YUsdvfEjEYJBIQMRYjCDgAMQASEDEWIwg4ECISEEL/ujEWIgk5GgEXgQ8SMRYiCTkaAIAKT3duZXJDaGVjaxIQMRYiCTgYJBIQMRAiEjEIJRIQMQkyAxIQMRAjEhEQEEM=";
}
const cdpTemplate = contractStringToBytes(cdpTemplateString);
const cdpTemplate2 = contractStringToBytes(cdpTemplateString2);
const asaTemplate = contractStringToBytes(asaTemplateString);
const asaTemplate2 = contractStringToBytes(asaTemplateString2);

function getSlices(template1, template2) {
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
  return _slices
}

// Exports

export function cdpGen(userAddress, accountID, asaID = 0) {
  // XXX: Could cache results once they are done the first time

  let userAddressBytes = algosdk.decodeAddress(userAddress);
  let accountIDBytes = new Uint8Array([accountID]); // XXX: Could add a nice check here that it's a small enough value

  let template = cdpTemplate
  let template2 = cdpTemplate2
  if (asaID != 0) {
    template = asaTemplate
    template = asaTemplate2
  }
  
  const slices = getSlices(template, template2)
  
  let contract
  if (asaID == 0) {
    const sub1 = template.slice(slices[0], slices[1]);
    const sub2 = template.slice(slices[2], slices[3]);
    const sub3 = template.slice(slices[4]); // TODO: Check that slicing is done in the same way

    // Crafts the contract with proper insertions
    contract = new Uint8Array([
      ...sub1,
      ...userAddressBytes.publicKey,
      ...sub2,
      ...accountIDBytes,
      ...sub3,
    ]);
  } else {
    const sub1 = template.slice(slices[0], slices[1]);
    const sub2 = template.slice(slices[2], slices[3]);
    const sub3 = template.slice(slices[4], slices[5]);
    const sub4 = template.slice(slices[5])
    
    const asaIDBytes = new Uint8Array([asaID])

    // Crafts the contract with proper insertions
    contract = new Uint8Array([
      ...sub1,
      ...asaIDBytes,
      ...sub2,
      ...accountIDBytes,
      ...sub3,
      ...userAddressBytes.publicKey,
      ...sub4,
    ]);
  }

  const account = new algosdk.LogicSigAccount(contract);

  return {
    address: account.address(),
    logic: contract,
  };
}
