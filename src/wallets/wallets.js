import algosdk from 'algosdk'
import MyAlgoConnect from '@randlabs/myalgo-connect'
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "algorand-walletconnect-qrcode-modal";
import { psToken } from './keys'
import { updateCDPs } from '../transactions/cdp'
import { gardID } from '../transactions/ids'
import { VERSION } from "../globals"
import { formatJsonRpcRequest } from "@json-rpc-tools/utils";
// Partial fix from https://github.com/randlabs/myalgo-connect/issues/27
import buffer from 'buffer'
const { Buffer } = buffer

function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, 1000*seconds));
}

function rerun(e) {
	if (e.toString().includes('Network request error. Received status 429')) {
		return true		
	}
	// TODO: We should eventually add more cases that return true here
	return false // We can iterate on this as we identify cases where we don't want it to rerun
}

// DEBUG SWITCH
const debug = true
let _testnet = true
if (VERSION == 'MAINNET') {
	_testnet = false
}
const testnet = _testnet

// Basic setup
var activeWallet
var activeWalletInfo

// Sets up algosdk client
let _nodeServer = 'https://testnet-algorand.api.purestake.io/ps2'
if (!testnet) {
	_nodeServer = 'https://mainnet-algorand.api.purestake.io/ps2'
}
const nodeServer = _nodeServer
const algodClient = new algosdk.Algodv2(psToken, nodeServer, '')

export async function accountInfo(address = null) {
  // XXX: Assumes the wallet is set
  // XXX: Could eventually cache for quicker/more effecient usage
  if (address == null) {
    address = activeWallet.address
  }
  return algodClient.accountInformation(address).do().catch(async (e) => {
  	if (rerun(e)) {
  		await sleep(1)
  		return await accountInfo(address);
  	}
  	throw e
  })
}

export async function updateWalletInfo() {
  let info = await accountInfo()
  activeWalletInfo = info
  updateCDPs(activeWallet.address)
  let idx = -1;
  let promises = []
  for (let i = 0; i < info['assets'].length; i++) {
  	const j = i
    if ([684649988, 684649672, 692432647].includes(info['assets'][j]['asset-id'])){
  	promises.push(
  	  algodClient
      .getAssetByID(info['assets'][j]['asset-id'])
      .do().then((response) => {
    	activeWalletInfo['assets'][j]['decimals'] = response['params']['decimals']
    	activeWalletInfo['assets'][j]['name'] = response['params']['name']
      if (info['assets'][j]['asset-id'] == 684649988 && j != 0){
        idx = j 
      }
      })
    )}
  }
  await Promise.allSettled(promises)
  if (idx != -1) {
    let temp = activeWalletInfo['assets'][0]
    activeWalletInfo['assets'][0] = activeWalletInfo['assets'][idx]
    activeWalletInfo['assets'][idx] = temp
  }
  console.log(activeWalletInfo)
  return activeWalletInfo
}

// Loading in the stored wallet
const storedWallet = localStorage.getItem('wallet')
if (!(storedWallet === null) && !(storedWallet === 'undefined')) {
  activeWallet = JSON.parse(storedWallet)
  await updateWalletInfo() // Could optimize by setting a promise and doing promise.all at the end of the page
}

// Sets up MyAlgoWallet
if (!window.Buffer) window.Buffer = Buffer // Partial fix from https://github.com/randlabs/myalgo-connect/issues/27 XXX: THIS IS ALSO NEEDED FOR PERA TOO!!!
const myAlgoConnect = new MyAlgoConnect({ disableLedgerNano: false })
// Create a connector (used for Pera)
let connector;
if (localStorage.walletconnect) {
  console.log('Using stored wallet connect')
  connector = await new WalletConnect({
        bridge: "https://bridge.walletconnect.org", // Required
        qrcodeModal: QRCodeModal,
      });
}

// Sets up AlgoSigner
/*global AlgoSigner*/

export function disconnectWallet() {
  if (connector && connector.connected) {
    connector.killSession();
  }
  activeWallet = undefined
  activeWalletInfo = undefined
  localStorage.removeItem('wallet')
}

export function getWallet() {
  // XXX: Returns even if active_address is not set
  // returns the active wallet
  // returns null if it is not set,
  // otherwise returns a dictionary formatted as
  // 		{"address": ADDRESS, "name": NAME, "type": TYPE}
  return activeWallet
}

export function displayWallet() {
  if (getWallet()) {
    let res
    if (getWallet().hasOwnProperty('name')) {
      res = getWallet().name
    } else {
      res = getWallet().address
    }
    if (res.length > 18) {
      res = res.slice(0, 15) + '...'
    }
    return res
  }
}

export function getWalletInfo() {
  // returns dictionary formatted as
  /*
	{"address":"55JZKGYCKRDQYCBWUQGOSR23N7RG5UEU5H7YFSS7SPICURFDVJTTSGIN54","amount":34839186,"amount-without-pending-rewards":34839186,"apps-local-state":[],
	"apps-total-schema":{"num-byte-slice":0,"num-uint":0},
	"assets":[{"amount":1000000,"asset-id":73680809,"creator":"GTFE7VRKM4PA6K54OSW3QTXMBV5A7TURNAI7ZJPQVDEXKTBKB3MQ2T2ZLM","is-frozen":false}],
	"created-apps":[],"created-assets":[],"pending-rewards":0,
	"reward-base":27521,"rewards":0,"round":19979296,"status":"Offline"}
	*/

  // TODO: Could add a refresh option

  return activeWalletInfo
}

export function getGARDInWallet() {
  let asset_array = activeWalletInfo.assets
  for (var i = 0; i < asset_array.length; i++)
  {
    if (asset_array[i]["asset-id"] == gardID) {
      return asset_array[i]["amount"]
    }
  }
  return 0
}

export async function connectWallet(type, address) {
  // XXX: Only MyAlgoConnect should be used for testing other functionality at present
  // XXX: A future improvement would allow users to select a specific wallet based upon some displayed info, rather than limiting them to one
  switch (type) {
    case 'MyAlgoConnect':
      const settings = {
        shouldSelectOneAccount: true,
        openManager: false,
      }
      try {
        let wallets = await myAlgoConnect.connect(settings)
        activeWallet = wallets[0]
        activeWallet.type = 'MyAlgoConnect'
      } catch (e) {
        // TODO: Handle errors gracefully
        // This would involve good UX informing the user that connection failed (and why)
      }
      break
    case 'AlgoSigner':
      if (typeof AlgoSigner !== 'undefined') {
        try {
          let instance = await AlgoSigner.connect()
          let ledger = 'TestNet'
          if (!testnet) {
          	ledger = 'MainNet'
          }
          let accounts = await AlgoSigner.accounts({
            ledger: ledger,
          })
          activeWallet = accounts[0] // XXX: We need to add a way to select a specific account later
          activeWallet.type = 'AlgoSigner'
          // XXX: Does not set name
        } catch (e) {
          // TODO: Graceful error handling
        }
      } else {
        //alert('AlgoSigner is not installed!')
        return {
        	alert: true,
        	text: 'AlgoSigner is not installed!'
        }
        // XXX: Improve UX
      }
      break
    case 'AlgorandWallet':
      // Check if connection is already established
      
      if (connector && connector.connected) {
        connector.killSession();
        console.log('KILLED')
      }
      connector = new WalletConnect({
        bridge: "https://bridge.walletconnect.org", // Required
        qrcodeModal: QRCodeModal,
      });
      connector.on("disconnect", payload => {
        // TODO: Need to refresh page
        console.log('DISCONNECT')
        disconnectWallet()
      });
      connector.createSession();
      var d = [];
      var p = new Promise(function(resolve, reject) {
        d.push({resolve: resolve, reject: reject });
      });
      let account;
      connector.on("connect", (error, payload) => {
        if (error) {
          throw error;
        }
        
        // Get provided accounts
        const { accounts } = payload.params[0];
        account = accounts[0]
        
        d[0].resolve('Done')
      });
      await d[0];
      await p;
      // TODO: Handle errors better
      activeWallet = {}
      activeWallet.address = account
      activeWallet.type = 'AlgorandWallet'
      break
    default:
      // We should never get here, that's on bad programming
      console.error('Undefined wallet type!')
  }
  console.log(activeWallet)
  localStorage.setItem('wallet', JSON.stringify(activeWallet))
  return await updateWalletInfo()
}

export async function getParams(fee = 1000, flat = true) {
  // XXX: Could optimize via caching
  try {
	  let params = await algodClient.getTransactionParams().do()
	  params.fee = fee
	  params.flatFee = flat
	  return params
  } catch (e) {
  	if (rerun(e)) {
  		await sleep(1)
  		return await getParams(fee, flat);
  	}
  	throw e
  }
}

function sameSender(sender1, sender2) {
  return JSON.stringify(sender1.publicKey) == JSON.stringify(sender2.publicKey)
}

export async function signGroup(info, txnarray) {
  const senderAddressObj = algosdk.decodeAddress(info.address)
  switch (activeWallet.type) {
    case 'MyAlgoConnect':
       const toSign = txnarray.filter(txn => sameSender(txn['from'], senderAddressObj))
       const signed = await myAlgoConnect.signTransaction(toSign.map(txn => txn.toByte()))
       let res = [];
       let sIndex = 0;
       for (const [index, txn] of txnarray.entries()) {
         if(sameSender(txn['from'], senderAddressObj)) {
           res.push(signed[sIndex])
           sIndex++
         } else {
           res.push(null)
         }
       }
       return res
    case 'AlgorandWallet':
       
       const txnsToSign = txnarray.map(txn => {
         const encodedTxn = Buffer.from(algosdk.encodeUnsignedTransaction(txn)).toString("base64");
         if (!sameSender(txn['from'], senderAddressObj)) {
           return {
             txn: encodedTxn,
             message: 'Transactions for the GARD system', // XXX: Eventually we could have a more informative string
             signers: [],
           };
         }
         return {
           txn: encodedTxn,
           message: 'Transactions for the GARD system', // XXX: Eventually we could have a more informative string
         };
       });
       const requestParams = [txnsToSign];
       const request = formatJsonRpcRequest("algo_signTxn", requestParams);
       const result: Array<string | null> = await connector.sendCustomRequest(request);
       const decodedResult = result.map(element => {
         return element ? { blob: new Uint8Array(Buffer.from(element, "base64")) }: null;
       });
       return decodedResult;
     case 'AlgoSigner':
       // Alogsigner requires all txns in a sign call to be from the same group,
       // 	so we have to split out groups
       console.log(txnarray)
       let groupIDs = []
       txnarray.forEach(element => {
         if (!groupIDs.includes(element.group.toString())) {
         	groupIDs.push(element.group.toString());
         }
       })
       console.log(groupIDs)
       
       let signedTxns = []
       // Now we sign each group
       for (const id of groupIDs) {
       		const txsToSign = txnarray
       			.filter(txn => {
       				return txn.group.toString() == id
       			})
       			.map(txn => {
		     	const encodedTxn = AlgoSigner.encoding.msgpackToBase64(txn.toByte());
		     	if (!sameSender(txn['from'], senderAddressObj)) {
		       		return {
		         		txn: encodedTxn,
		         		signers: [],
		       		};
		    	}
		    	return {
		       		txn: encodedTxn,
		     	};
       		});
			console.log(txsToSign)
			signedTxns = signedTxns.concat(await AlgoSigner.signTxn(txsToSign))
       }
       console.log(signedTxns)
       const parsedResults = signedTxns.map(element => {
         return element ? { blob: new Uint8Array(Buffer.from(element.blob, "base64")) }: null;
       });
       return parsedResults
     default:    
       throw 'No wallet selected!';
  }
}

let _explorer = 'https://testnet.algoexplorer.io/tx/'
if (!testnet) {
	_explorer = 'https://algoexplorer.io/tx/'
}
const explorer = _explorer

async function sendRawTransaction(txn) {
	return algodClient.sendRawTransaction(txn).do().catch(async e => {
  	  if (rerun(e)) {
  		  await sleep(1)
  		  return await sendRawTransaction(txn);
  	  }
  	  throw e
    })
}

export async function sendTxn(txn, confirmMessage = null, commitment=false) {
  // This works for both grouped and ungrouped txns
  // XXX: We may want a better flow later
  const tx = await sendRawTransaction(txn)
  console.log('Transaction sent: ' + tx.txId)
  // We don't wait for this, but this does trigger a refresh after a transaction
  updateWalletInfo()
  let x = await algosdk.waitForConfirmation(algodClient, tx.txId, 10) // XXX: waitrounds is hardcoded to 10, may want to pick a better value
  if (confirmMessage) {
    console.log(x)
    if (!commitment) {
    	return {
			alert: true,
			text: confirmMessage +
			  '\nTransaction ID: <a href="' + explorer + tx.txId + '">' +
			  tx.txId.substring(0, 15) + '...</a>' +
			  '\nConfirmed in round: ' +
			  x['confirmed-round'],
			txn: x,
  		}
    }
    else {
      return {
        alert: true,
        text: confirmMessage +
          'Transaction ID: ' + tx.txId,
        txn: x,
        }
    }
  }
  return x
}

export function handleTxError(e, text) {
	// Supresses basic universal errors
	
	// User cancels TX
	if (e.toString() == 'Error: Operation cancelled') {
		return
	}
	
	alert(text + ': \n' + e)
}

export async function getAppByID(id) {
	return algodClient.getApplicationByID(id).do().catch(async e => {
	  	if (rerun(e)) {
	  		await sleep(1)
	  		return await getAppByID(id);
	  	}
	  	throw e
  	})
}

// Future improvement - cache names of wallets
