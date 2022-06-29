import {useState, useEffect} from "react";
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
  doc
} from "firebase/firestore";
import { cdpGen } from "../transactions/contracts";
import { getWalletInfo } from "../wallets/wallets";
var configkey = null;

const module = await import ("../wallets/keys.js")
if (VERSION === 'MAINNET') {
    configkey = module.mainDBkey
}
else {
  configkey = module.testKey;
}



const firebaseConfig = configkey;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// get the firestore database instance
const db = getFirestore(app);


export async function addUserToFireStore(user, walletID) {
    try {
      const walletRef = doc(db, "users", walletID);
      const docRef = await setDoc(walletRef, user);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  
  export async function userInDB(walletID) {
    // get users collection
    const usersRef = collection(db, "users");
    // query the collection to find the user with the walletID address
    const q = query(usersRef, where('id', "==", walletID));
    // execute the query using getDocs
    const querySnapshot = await getDocs(q);
    // returns true if there is a document that matches the walletId and false if there isn't (there should be one matched user)
    return querySnapshot.docs.length >= 1
  }
  

export async function updateCommitmentFirestore(owner_address, account_id, commitment_amt) {
    const cdp_address = cdpGen(owner_address, account_id).address
    const key1 = `ownedCDPs.${cdp_address}.lastCommitment`
    const key2 = `ownedCDPs.${cdp_address}.commitmentTimestamp`
    try {
        const walletRef = doc(db, "users", owner_address);
        const docRef = await updateDoc(walletRef, {
            [key1]: commitment_amt,
            [key2]: Date.now(),
        });
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}
export async function updateLiquidationFirestore(owner_address, account_id) {
    const cdp_address = cdpGen(owner_address, account_id).address
    const key = `ownedCDPs.${cdp_address}.liquidatedTimestamp`
    try {
        const walletRef = doc(db, "users", owner_address);
        const docRef = await updateDoc(walletRef, {
            [key]: Date.now(),
        });
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}
export async function loadFireStoreCDPs() {
    const owner_address = getWalletInfo().address
    const docRef = doc(db, "users", owner_address);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
    const data = docSnap.data()
    return data.ownedCDPs
    } else {
    console.log("No such document!");
    }
}
