import {useState, useEffect} from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  query,
  where,
  deleteDoc,
  FieldPath,
  doc
} from "firebase/firestore";
import { cdpGen } from "../transactions/contracts";

const firebaseConfig = {
  apiKey: "AIzaSyD4x024OYPM1Zxh2QNklzw3sXfYTV15f30",
  authDomain: "gard-money-testing.firebaseapp.com",
  projectId: "gard-money-testing",
  storageBucket: "gard-money-testing.appspot.com",
  messagingSenderId: "564363590339",
  appId: "1:564363590339:web:8b5e50a902164a03770076",
  measurementId: "G-6SMVCFC990"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// get the firestore database instance
const db = getFirestore(app);


export async function addUserToFireStore(user, walletID) {
    try {
      const walletRef = doc(db, "users", walletID);
      const docRef = await setDoc(walletRef, user);
      console.log('added to firestore')
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
  
  

  function addCDP(owner_address, cdp_address, currentCDPs) {
    const CDP = 
    {
        [cdp_address]: {
            lastCommitment: -1,
            commitmentTimestamp: -1,
            liquidatedTimestamp: [-1],
        }
    };
    // adding new CDP object we just made to current CDPs
    const CDPs = currentCDPs.concat(CDP);

    const key = `${owner_address}.ownedCDPs`
    async function addCDPToFireStore() {
      try {
        const walletRef = doc(db, "users", owner_address);
        const docRef = await updateDoc(walletRef, {
            [key] : CDPs
        });
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }
    addCDPToFireStore(CDP);
}


export async function updateCommitmentFirestore(owner_address, account_id, commitment_amt) {
    const cdp_address = cdpGen(owner_address, account_id).address
    const key1 = `ownedCDPs.${cdp_address}.lastCommitment`
    const key2 = `ownedCDPs.${cdp_address}.commitmentTimestamp`
    try {
        const walletRef = doc(db, "users", owner_address);
        const docRef = await updateDoc(walletRef, {
            [key1]: commitment_amt,
            [key2]: new Date().toISOString(),
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
            [key]: new Date().toISOString(),
        });
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}
//cdpGen(getWallet().address, id).address