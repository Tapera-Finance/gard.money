import { getReferrerDB } from "./Firebase";
import styled from "styled-components";
import { device } from "../styles/global";
import { useState, useEffect } from "react";
import { getStateUint } from "../pages/HomeContent";
import { ids } from "../transactions/ids";
import { searchAccounts } from "../pages/GovernContent";
import algosdk from "algosdk";

function DBtoAddresses(db){
  return db.map((val) => val["_document"].key.path.segments[6]);
}

async function getUserTotals(addresses, usersMintLpInfo){
  let mintDict = usersMintLpInfo[0];
  let lpDict = usersMintLpInfo[1];
  const length = addresses.length;
  let mintedGARD = 0;
  let unstakedLP = 0;
  for (let i = 0; i < length; i++){
    if (addresses[i] in mintDict){
      mintedGARD += mintDict[addresses[i]];
    }
    if (addresses[i] in lpDict){
      unstakedLP += 2.013*lpDict[addresses[i]]/1e6;
    }
  }
  return [(mintedGARD/1e6).toFixed(0), unstakedLP.toFixed(2)];
}

async function getMintedDict() {

  let nexttoken;
  let response = null;
  const mints = {};
  const lp = {};

  const validators = [ids.app.validator];
  for(var i = 0; i < validators.length; i++){
    do {
      // Find accounts that are opted into the GARD price validator application
      // These accounts correspond to CDP opened on the GARD protocol
      response = await searchAccounts({
        appId: validators[i],
        limit: 1000,
        nexttoken,
      });
      for (const account of response["accounts"]) {
          if(account["apps-local-state"]){
          let cdp_state = account["apps-local-state"][0]["key-value"];
          const owner = algosdk.encodeAddress(Buffer.from(getStateUint(cdp_state, btoa("OWNER"), 1), "base64"));
          if (!(owner in mints)){
            mints[owner] = getStateUint(cdp_state, btoa("Principal"));
          }
          else {
            mints[owner] += getStateUint(cdp_state, btoa("Principal"));
          }
          }
        
      }
      nexttoken = response["next-token"];
    } while (nexttoken != null);
  }
  do {
    // Find accounts that are opted into the GARD price validator application
    // These accounts correspond to CDP opened on the GARD protocol
    response = await searchAccounts({
      appId: 701250027,
      limit: 1000,
      asset: 1,
      nexttoken
    });
    for (const account of response["accounts"]) {
          let assets = account["assets"];
          let holdings_length = account["assets"].length;
          for (let i = 0; i < holdings_length; i++){
            if (assets[i]["asset-id"] == 701250027){
              lp[account["address"]] = assets[i]["amount"];
            }
          }
    }
    nexttoken = response["next-token"];
  } while (nexttoken != null);
  return [mints, lp];
}

export default function ReferralBasicInfo({refIDs}){
    const [refTotal, setRefTotal] = useState(-1);
    const [mintedTotal, setMintedTotal] = useState(-1);
    const [lpTotal, setLpTotal] = useState(-1);

    useEffect(async () => {
        const dictPromise = getMintedDict();
        let result = await getReferrerDB(refIDs);
        setRefTotal(result.length);
        const addresses = DBtoAddresses(result);
        const usersInfo = await getUserTotals(addresses, await dictPromise);
        setMintedTotal(usersInfo[0]);
        setLpTotal(usersInfo[1]);
      }, []);

    return (
    <AcctPgCont>
        <AccountContainer>
            <div
            style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
                alignItems: "center",
            }}
            >
              <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-around",
                alignItems: "center",
                marginBottom: 10,
              }}>
                <Label>Total Referred</Label>
                <br></br>
                <AccountNumber>
                {refTotal == -1
                    ? "Loading..."
                    : `${refTotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`}
                </AccountNumber>
              </div>
              <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-around",
                alignItems: "center",
                marginBottom: 10,
              }}>
                <Label>GARD Minted</Label>
                <br></br>
                <AccountNumber>
                {mintedTotal == -1
                    ? "Loading..."
                    :`${mintedTotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`}
                </AccountNumber>
              </div>
              <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-around",
                alignItems: "center",
                marginBottom: 10,
              }}>
                <Label>GARD/USDC LP Value</Label>
                <br></br>
                <AccountNumber>
                {lpTotal == -1
                    ? "Loading..."
                    : `$${lpTotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`}
                </AccountNumber>
              </div>
            </div>
        </AccountContainer>
    </AcctPgCont>
    );
}

const AcctPgCont = styled.div`
  /* max-width: 90vw; */
`;

const AccountContainer = styled.div`
  background: rgba(13, 18, 39, 0.75);
  border: 1px solid white;
  padding: 5vw 4vw;
  margin-top: 36px;
  margin-bottom: 56px;
  border-radius: 10px;
  @media (${device.mobileL}) {
    max-width: 90vw;
  }
  @media (${device.tablet}) {
    max-width: 90vw;
  }
`;
const Label = styled.label`
  font-size: 22px;
  color: #ffffff;
  text-decoration: underline;
  margin-bottom: -20px;
  /* margin-bottom: */
`;
const AccountNumber = styled.text`
  font-weight: normal;
  font-size: 16px;
`;