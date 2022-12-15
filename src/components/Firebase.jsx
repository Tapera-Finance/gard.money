import { VERSION } from "../globals";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  doc,
  arrayUnion,
  increment
} from "firebase/firestore";
import { cdpGen } from "../transactions/contracts";
import { getWalletInfo } from "../wallets/wallets";
import { referrer } from "../globals";
var configkey = null;

const module = await import("../wallets/keys.js");
if (VERSION === "MAINNET") {
  configkey = module.mainDBkey;
} else {
  configkey = module.testKey;
}

const firebaseConfig = configkey;

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// get the firestore database instance
const db = getFirestore(app);

export async function addUserToFireStore(user, walletID) {
  try {
    const walletRef = doc(db, "users", walletID);
    await setDoc(walletRef, user);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export async function addReferrerToFirestore(walletID){
  if (referrer == null) return
  try {
    const walletRef = doc(db, "referrers", walletID);
    const info = {
      referred: referrer,
      timestamp: Date.now()
    }
    const querySnapshot = await getDoc(query(walletRef))
    if (querySnapshot["_document"] != null) return;
    await setDoc(walletRef, info);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export async function userInDB(walletID) {
  // get users collection
  const usersRef = collection(db, "users");
  // query the collection to find the user with the walletID address
  const q = query(usersRef, where("id", "==", walletID));
  // execute the query using getDocs
  const querySnapshot = await getDocs(q);
  // returns true if there is a document that matches the walletId and false if there isn't (there should be one matched user)
  return querySnapshot.docs.length >= 1;
}

export async function getReferrerDB(refIDs){
  const collectionRef = collection(db, "referrers")
  const q = query(collectionRef, where("referred", "in", refIDs))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs
}

export async function updateCommitmentFirestore(
  owner_address,
  account_id,
  commitment_amt,
) {
  const cdp_address = cdpGen(owner_address, account_id).address;
  const key1 = `ownedCDPs.${cdp_address}.lastCommitment`;
  const key2 = `ownedCDPs.${cdp_address}.commitmentTimestamp`;
  try {
    const walletRef = doc(db, "users", owner_address);
    await updateDoc(walletRef, {
      [key1]: commitment_amt,
      [key2]: Date.now(),
      webappActions: arrayUnion({
        actionType: 4,
        cdpAddress: cdp_address,
        microAlgos: 0,
        microGARD: 0,
        microGAIN: 0,
        swapPair: 0,
        feesPaid: 2000,
        timestamp: Date.now(),
      }),
    });
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}
export async function updateLiquidationFirestore(owner_address, account_id) {
  const cdp_address = cdpGen(owner_address, account_id).address;
  const key1 = `ownedCDPs.${cdp_address}.lastCommitment`;
  const key2 = `ownedCDPs.${cdp_address}.commitmentTimestamp`;
  const key3 = `ownedCDPs.${cdp_address}.liquidatedTimestamp`;
  try {
    const walletRef = doc(db, "users", owner_address);
    await updateDoc(walletRef, {
      [key1]: -1,
      [key2]: -1,
      [key3]: arrayUnion(Date.now()),
    });
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}
export async function loadFireStoreCDPs() {
  const owner_address = getWalletInfo().address;
  const docRef = doc(db, "users", owner_address);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return data.ownedCDPs;
  } else {
    console.log("No such document!");
  }
}

export async function addCDPToFireStore(
  account_id,
  microAlgos,
  microGARD,
  feesPaid,
) {
  const owner_address = getWalletInfo().address;
  const cdp_address = cdpGen(owner_address, account_id).address;
  const initStats = {
    lastCommitment: -1,
    commitmentTimestamp: -1,
    liquidatedTimestamp: [-1],
  };
  var CDPs = null;
  const key = `ownedCDPs.${cdp_address}`;
  const key1 = `ownedCDPs.${cdp_address}.lastCommitment`;
  const key2 = `ownedCDPs.${cdp_address}.commitmentTimestamp`;
  const walletRef = doc(db, "users", owner_address);
  const docSnap = await getDoc(walletRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    CDPs = data.ownedCDPs;
  } else {
    console.log("No such document!");
  }
  if (cdp_address in CDPs) {
    await updateDoc(walletRef, {
      [key1]: -1,
      [key2]: -1,
      webappActions: arrayUnion({
        actionType: 0,
        cdpAddress: cdp_address,
        microAlgos: microAlgos,
        microGARD: microGARD,
        microGAIN: 0,
        swapPair: 0,
        feesPaid: feesPaid,
        timestamp: Date.now(),
      }),
    });
  } else {
    await updateDoc(walletRef, {
      [key]: initStats,
      webappActions: arrayUnion({
        actionType: 0,
        cdpAddress: cdp_address,
        microAlgos: microAlgos,
        microGARD: microGARD,
        microGAIN: 0,
        swapPair: 0,
        feesPaid: feesPaid,
        timestamp: Date.now(),
      }),
    });
  }
}

export async function updateDBWebActions(
  actionType,
  account_id,
  microAlgos,
  microGARD,
  microGAIN,
  swapPair,
  feesPaid,
) {
  const owner_address = getWalletInfo().address;
  var cdp_address = null;
  account_id === null
    ? (cdp_address = 0)
    : (cdp_address = cdpGen(owner_address, account_id).address);
  const walletRef = doc(db, "users", owner_address);
  await updateDoc(walletRef, {
    webappActions: arrayUnion({
      actionType: actionType,
      cdpAddress: cdp_address,
      microAlgos: microAlgos,
      microGARD: microGARD,
      microGAIN: microGAIN,
      swapPair: swapPair,
      feesPaid: feesPaid,
      timestamp: Date.now(),
    }),
  });
}
// [{Action type, CDP address (“0” if not applicable), microAlgos in/out, microGARD in/out,
// microGAIN in/out, swapPair (“0” if not applicable”), Fees Paid (in microAlgos), Timestamp}]

export async function loadDbActionAndMetrics() {
  return {
    webappActions: [],
    systemAssetVal: [],
    systemDebtVal: [],
  };
  /*
  const owner_address = getWalletInfo().address;
  const docRef = doc(db, "users", owner_address);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        webappActions: data.webappActions,
        systemAssetVal: data.systemAssetVal,
        systemDebtVal: data.systemDebtVal,
      };
    } else {
      console.log("No webactions, asset values, or debt values");
    }
  } catch (e) {
    throw new Error(e);
  }
  */
}

export function queryUser() {
  const owner_address = getWalletInfo().address;
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("id", "==", owner_address));
  return q;
}

export async function addUserToGleam(gleamAction, walletID) {
  const gleamRef = doc(db, "gleamActions", gleamAction);
  await updateDoc(gleamRef, {
    [gleamAction]: arrayUnion(walletID),
  });
}
export async function loadUserTotals() {
  const owner_address = getWalletInfo().address;
  const docRef = doc(db, "userTotals", owner_address);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return data;
  } else {
    console.log("No such document!");
  }
}

export async function userInTotals(walletID) {
  // get users collection
  const userTotalsRef = collection(db, "userTotals");
  // query the collection to find the user with the walletID address
  const q = query(userTotalsRef, where("id", "==", walletID));
  // execute the query using getDocs
  const querySnapshot = await getDocs(q);
  // returns true if there is a document that matches the walletId and false if there isn't (there should be one matched user)
  return querySnapshot.docs.length >= 1;
}

export async function addUserToTotals(user, walletID) {
  try {
    const walletRef = doc(db, "userTotals", walletID);
    await setDoc(walletRef, user);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export async function updateTotal(owner_address, totalType, amount) {
  try {
    const walletRef = doc(db, "userTotals", owner_address);
    await updateDoc(walletRef, {
      [totalType]: increment(amount),
    });
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}