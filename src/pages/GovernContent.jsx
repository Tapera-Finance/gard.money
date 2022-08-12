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


export default function Govern() {
  const [commitment, setCommitment] = useState(undefined);
  const [maxBal, setMaxBal] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [shownAll, setAllVotes] = useState(true)

  var details = [
      {
          title: "Governors",
          val: `123,400 Governors`,
          hasToolTip: true,
      },
      {
          title: "Governance APY",
          val: `${0.03}% per transaction`,
          hasToolTip: true,
      },
      {
          title: "Enrollment Countdown",
          val: `${0.00}%`,
          hasToolTip: true,
      },
      {
          title: "Governance Rewards",
          val: `${0.00}%`,
          hasToolTip: true,
      },
  ]
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
          <RewardNotice 
          program={"Governance Rewards"} 
          timespan={"Now - October 22, 2022"}
          estimatedRewards={"12% - 33% APR Rewards"}
          action={"Borrow ALGO to Claim Rewards"}
          />
          <div style={{marginTop: 20}}>
              <Details details={details} governPage={true}/>
              <TextButton text="See More Info" positioned={true}/>
          </div>

          <div style={{ height: 70, borderRadius: 10, backgroundColor: "rgba(13,18,39,0.75)", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
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

          <div style={{ height: 70, borderRadius: 10, backgroundColor: "rgba(13,18,39,0.75)", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
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
      </div>
}

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
        <PrimaryButton
          govern={true}
          text="Vote"
        />
      )
    },
    {
      nameOfProposal: "Lorem ippsum dol...",
      votesCloses: "Dec 29, 2021",
      votesInFavor: "59%",
      votesOutstanding: "37%",
      "" : (
        <PrimaryButton
          govern={true}
          text="Vote"
        />
      )
    },
    {
      nameOfProposal: "Lorem ippsum dol...",
      votesCloses: "Closed",
      votesInFavor: "59%",
      votesOutstanding: "36%",
      "" : (
        <PrimaryButton
          govern={true}
          text="Vote"
        />
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