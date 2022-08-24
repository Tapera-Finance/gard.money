import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Details from "../components/Details";
import PrimaryButton from "../components/PrimaryButton";
import RewardNotice from "../components/RewardNotice";
import TextButton from "../components/TextButton";
import Table from "../components/Table";
import { CDPsToList } from "../components/Positions";
import { loadFireStoreCDPs } from "../components/Firebase";
import { cdpGen } from "../transactions/contracts";
import { getWallet } from "../wallets/wallets";
import { commitmentPeriodEnd } from "../globals";
import CountdownTimer from "../components/CountdownTimer";
import Effect from "../components/Effect";
import { textAlign } from "@mui/system";
import { Switch } from "@mui/material";

const axios = require("axios");

async function getGovernanceInfo() {
    let response;
    try {
        response = await axios.get(
            "https://governance.algorand.foundation/api/periods/statistics/",
        );
    } catch (ex) {
        response = null;
        console.log(ex);
    }
    if (response) {
        console.log(response)
        const governorCount = parseInt(response["data"].unique_governors_count);
        const enrollmentEnd = response["data"]["periods"][0].registration_end_datetime;
        return [governorCount, enrollmentEnd];
    }
    return null;
  }

export default function Govern() {
  const [commitment, setCommitment] = useState(undefined);
  const [maxBal, setMaxBal] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [shownAll, setAllVotes] = useState(true);
  const [governors, setGovernors] = useState("...");
  const [enrollmentEnd, setEnrollmentEnd] = useState("");

  var details = [
      {
          title: "Total Vaulted",
          val: `${88.3}M ALGO`,
          hasToolTip: true,
      },
      {
        title: "Governance APY",
        val: `${34.3}%`,
        hasToolTip: true,
      },
      {
        title: "GARD Governors",
        val: `${governors} Governors`,
        hasToolTip: true,
      },
  ]
  useEffect(async () => {
    const govInfo = await getGovernanceInfo()
    setGovernors((parseInt(govInfo[0])).toLocaleString("en-US"))
    console.log("2", govInfo[1])
  }, []);

  useEffect(async () => {
    setCommitment(await loadFireStoreCDPs());
  }, [refresh]);

  let loadedCDPs = CDPsToList();
  if (loadedCDPs[0].id == "N/A") {
    loadedCDPs = dummyCdps;
  }
  const owner_address = getWallet().address;
  let adjusted = loadedCDPs.map((value) => {
    const cdp_address = cdpGen(owner_address, value.id).address;
    return {
      account: value.id,
      balance: value.collateral == "N/A" ? "N/A" : value.collateral / 1000000,
      committed:
        commitment == undefined || commitment[cdp_address] == undefined
          ? "unknown"
          : commitment[cdp_address].lastCommitment == -1
          ? 0
          : commitment[cdp_address].lastCommitment / 1000000,
    };
  });
  let cdps = adjusted.map((value, index) => {
    return {
      ...value,
      "":
        value.committed !== 0 && value.committed !== "unknown" ? (
          <PrimaryButton
            text={"Committed"}
            onClick={() => {
              if (value.id == "N/A") {
                return;
              }
              setSelectedAccount(value.id);
              setMaxBal(value.balance);
            }}
            // variant ={true}
            disabled={
              value.balance === value.committed ||
              !(Date.now() < commitmentPeriodEnd)
            }
          />
        ) : (
          <PrimaryButton
            text={"Commit"}
            govern={true}
            onClick={() => {
              if (value.id == "N/A") {
                return;
              }
              setSelectedAccount(value.id);
              setMaxBal(value.balance);
            }}
            // variant ={true}
            disabled={!(Date.now() < commitmentPeriodEnd)}
          />
        ),
    };
  });
  console.log("cdps", cdps)
  return <div>
          {/* <RewardNotice 
          program={"Governance Rewards"} 
          timespan={"Now - October 22, 2022"}
          estimatedRewards={"12% - 33% APR Rewards"}
          action={"Borrow ALGO to Claim Rewards"}
          /> */}
          <div style={{display: "flex", flexDirection: "column", borderRadius: 10, justifyContent: "space-between", textAlign: "center", background: "#0E1834", padding: "20px 20px 0px"}}>
            <h3>Governance Period #4</h3>
            <div style={{fontSize: 11}}>Registration Ends</div>
            <CountDownContainer>
              <CountdownTimer targetDate={1761180257000}/>
            </CountDownContainer>
          </div>
          
          <div>
              <GovernDetails>
                  {details.length && details.length > 0 ?
                  details.map((d) => {
                      return (
                        <Item key={d.title}>
                              <Effect title={d.title} val={d.val} hasToolTip={d.hasToolTip} rewards={d.rewards}></Effect>
                          </Item>
                      )
                  })
                  : null}
              </GovernDetails>
              <TextButton text="Learn More on ALGO Site" positioned={true}/>
          </div>

          <div style={{ height: 70, borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
              <div style={{ display: "flex", justifyContent: "center"}}>
                  <div style={{ marginLeft: 25, marginRight: 8 }}>
                  <Title>
                      Algorand Positions
                  </Title>
                  </div>
                  <CountContainer>
                  <CountText>
                      2 Positions
                  </CountText>
                  </CountContainer>
              </div>
              <div style={{ marginRight: 20 }}>
                  <PrimaryButton text="Commit All"/>
              </div>
          </div>
          <Table
          data={cdps}
          />
          <PrimaryButton text="Deposit ALGOs" positioned={true}/>

          <div style={{ height: 70, borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
              <div style={{ display: "flex", justifyContent: "center"}}>
                  <div style={{ marginLeft: 25, marginRight: 8 }}>
                  <Title>
                      Algorand Votes
                  </Title>
                  </div>
                  <CountContainer>
                  <CountText>
                      2 Votes Open, 1 Closed Vote
                  </CountText>
                  </CountContainer>
              </div>
              <div style={{ display: "flex", marginRight: 20 }}>
                  <PrimaryButton
                  text="All"
                  toggle={!shownAll}
                  onClick={() => {
                    setAllVotes(true)
                  }}
                  />
                  <PrimaryButton
                  text="Open"
                  toggle={shownAll}
                  onClick={() => {
                    setAllVotes(false)
                  }}
                  />
              </div>
          </div>
          <Table
          data={dummyVotes}
          />
          <PrimaryButton text="Submit All Votes" positioned={true}/>

      </div>
}
const GovernDetails = styled.div`
display: grid;
grid-template-columns:repeat(3, 20%); 
text-align: center;
row-gap: 30px; 
justify-content: center;
padding: 30px 0px 30px;
border-radius: 10px;
background: #0E1834;
`
const Item = styled.div`
    display: flex;
    flex-direction: column;
    font-size: 14px;
`
const CountDownContainer = styled.div`
  background: #0E1834;
  height: 128px;
  display: flex;
  justify-content: center;
  align-content: center;
`

const Title = styled.text`
  font-weight: 500;
  font-size: 18px;
`;

const CountContainer = styled.div`
  background: #172756;
  border-radius: 16px;
  padding: 2px 8px;
  height: 20px
`

const CountText = styled.text`
  font-weight: 500;
  font-size: 12px;
  color: white;
  `
const dummyCommits = [
{
    Account: "123456",
    Balance: "Dec 29, 2021",
    APY: "4.5%",
    "" : (
    <PrimaryButton
      govern={true}
        text="Commit"
    />
    )
},
{
    Account: "123456",
    Balance: "Closed",
    APY: "4.5%",
    "" : (
    <PrimaryButton
      govern={true}
        text="Commit"
    />
    )
},
]

const dummyVotes = [
    {
      nameOfProposal: "Lorem ippsum dol...",
      votesCloses: "Dec 29, 2021",
      votesInFavor: "59%",
      votesOutstanding: "37%",
      "" : (
        // <PrimaryButton
        //   govern={true}
        //   text="Vote"
        // />
        <div style={{display: "flex"}}>
          <div style={{alignSelf: "center", color: "#01d1ff"}}>Yes</div>
          <Switch />
          <div style={{alignSelf: "center", color: "grey"}}>No</div>
        </div>
      )
    },
    {
      nameOfProposal: "Lorem ippsum dol...",
      votesCloses: "Dec 29, 2021",
      votesInFavor: "59%",
      votesOutstanding: "37%",
      "" : (
        // <PrimaryButton
        //   govern={true}
        //   text="Vote"
        // />
        <div style={{display: "flex"}}>
          <div style={{alignSelf: "center", color: "#01d1ff"}}>Yes</div>
          <Switch />
          <div style={{alignSelf: "center", color: "grey"}}>No</div>
        </div>
      )
    },
    {
      nameOfProposal: "Lorem ippsum dol...",
      votesCloses: "Closed",
      votesInFavor: "59%",
      votesOutstanding: "36%",
      "" : (
        // <PrimaryButton
        //   govern={true}
        //   text="Vote"
        // />
        <div style={{display: "flex"}}>
          <div style={{alignSelf: "center", color: "#01d1ff"}}>Yes</div>
          <Switch />
          <div style={{alignSelf: "center", color: "grey"}}>No</div>
        </div>
      )
    },
  ]


  const dummyCdps = [
    {
      account: "N/A",
      balance: "N/A",
      APY: "",
      "": "",
    },
  ];