import {algodClient} from "../../wallets/wallets";
import pactsdk from "@pactfi/pactsdk";
import {
    pactAlgoGardPoolAddress,
    pactGARDID
} from "../../transactions/ids"

// export const pactClient = new pactsdk.PactClient(algodClient);
// const algo = await pactClient.fetchAsset(0);
// const gard = await pactClient.fetchAsset(pactGARDID);
// export const AGpool = await pactClient.fetchPoolsByAssets(algo, gard);

// export async function previewPoolSwap(assetDeposited, amount, slippagePct, swapForExact) {
//     const swap = AGpool.prepareSwap({
//         assetDeposited: assetDeposited,
//         amount: amount,
//         slippagePct: slippagePct,
//         swapForExact: swapForExact
//     })
//     return swap.effect
// }

// export async function getPools() {
//     return await pactClient.listPools()
// }

