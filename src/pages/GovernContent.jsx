import React from "react";
import styled from "styled-components";
import Details from "../components/Details";
import PrimaryButton from "../components/PrimaryButton";
import RewardNotice from "../components/RewardNotice";
import TextButton from "../components/TextButton";
import Table from "../components/Table";

export default function Govern() {
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
            data={dummyCommits}
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
                <div style={{ marginRight: 20 }}>
                    <PrimaryButton text="Vote All"/>
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
    Account: "Lorem ippsum dol...",
    Balance: "Dec 29, 2021",
    APY: "59%",
    "" : (
    <PrimaryButton
        text="Commit"
    />
    )
},
{
    Account: "123456",
    Balance: "Dec 29, 2021",
    APY: "59%",
    "" : (
    <PrimaryButton
        text="Commit"
    />
    )
},
{
    Account: "123456",
    Balance: "Closed",
    APY: "59%",
    "" : (
    <PrimaryButton
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
          text="Vote"
        />
      )
    },
    {
      nameOfProposal: "123456",
      votesCloses: "Dec 29, 2021",
      votesInFavor: "59%",
      votesOutstanding: "37%",
      "" : (
        <PrimaryButton
          text="Vote"
        />
      )
    },
    {
      nameOfProposal: "123456",
      votesCloses: "Closed",
      votesInFavor: "59%",
      votesOutstanding: "36%",
      "" : (
        <PrimaryButton
          text="Vote"
        />
      )
    },
  ]