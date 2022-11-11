import { setLoadingStage, getMicroGardBalance } from "./lib";
import { ids } from "./ids";
import {
  accountInfo,
  getParams,
  sendTxn,
  getWallet,
  getAppByID,
  signGroup,
} from "../wallets/wallets";
import { validatorAddress, cdpGen } from "./contracts";
import algosdk from "algosdk";
import {
  updateLiquidationFirestore,
} from "../components/Firebase";

// TODO: Start auction

export async function liquidate(
  account_id,
  owner_address,
  microDebt,
  microPremium,
) {

  let reserve;
  let treasury;

  // Setting up promises
  setLoadingStage("Loading...");

  const infoPromise = accountInfo();
  const paramsPromise = getParams(0);

  let cdp = cdpGen(owner_address, account_id);

  const info = await infoPromise;
  let params = await paramsPromise;

  const liquid_fee = Math.floor(microPremium / 5);
  const to_user = liquid_fee * 4;
  let gard_bal = getMicroGardBalance(info);

  if (gard_bal == null || gard_bal < microDebt + to_user + liquid_fee) {
    return {
      alert: true,
      text:
        "Insufficient GARD for transaction. Balance: " +
        (gard_bal / 1000000).toFixed(2).toString() +
        "\n" +
        "Required: " +
        ((microDebt + to_user + liquid_fee) / 1000000).toFixed(2).toString(),
    };
  }

  let txn1 = algosdk.makeApplicationCallTxnFromObject({
    from: cdp.address,
    appIndex: ids.app.validator,
    onComplete: 2,
    foreignAssets: [ids.asa.gard],
    suggestedParams: params,
  });
  let txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: cdp.address,
    to: info.address,
    closeRemainderTo: info.address,
    amount: 0,
    suggestedParams: params,
  });
  params.fee = 5000;
  let txn3 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: reserve.address,
    amount: microDebt,
    suggestedParams: params,
    assetIndex: ids.asa.gard,
  });
  params.fee = 0;
  let txn4 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: treasury.address,
    amount: liquid_fee,
    suggestedParams: params,
    assetIndex: ids.asa.gard,
  });
  let txn5 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: info.address,
    to: owner_address,
    amount: to_user,
    suggestedParams: params,
    assetIndex: ids.asa.gard,
  });
  let txns = [txn1, txn2, txn3, txn4, txn5];
  algosdk.assignGroupID(txns);

  const signTxnsPromise = signGroup(info, txns);
  setLoadingStage("Awaiting Signature from Algorand Wallet...");
  let lsig = algosdk.makeLogicSig(cdp.logic, [algosdk.encodeUint64(1)]);
  const stxn2 = algosdk.signLogicSigTransactionObject(txn2, lsig);
  const stxn1 = algosdk.signLogicSigTransactionObject(txn1, lsig);
  const user_signed = await signTxnsPromise;
  setLoadingStage("Liquidating CDP...");
  let stxns = [
    stxn1.blob,
    stxn2.blob,
    user_signed[2].blob,
    user_signed[3].blob,
    user_signed[4].blob,
  ];
  let response = await sendTxn(
    stxns,
    `Successfully liquidated ${owner_address}'s CDP.`,
    true,
  );
  updateLiquidationFirestore(owner_address, account_id);
  setLoadingStage(null);
  return response;
}
