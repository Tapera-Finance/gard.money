import React, { useReducer, useState } from "react";
import styled from "styled-components";
import Modal from "../components/Modal";
import Table from "../components/Table";
import graph from "../assets/graph.png";
import PrimaryButton from "../components/PrimaryButton";
import Chart from "../components/Chart";

/**
 * Content for DAO option in drawer
 */
export default function DaoContent() {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalCanAnimate, setModalCanAnimate] = useState(false);
  const [modalContent, setModalContent] = useState("vote");
  let closedVotes = 0;
  let recentVotes = dummyRecentVotes.map((value, index) => {
    if (!value.voteCloses) closedVotes++;
    return {
      ...value,
      voteCloses: value.voteCloses ? value.voteCloses : "Closed",
      nameOfProposal: <Link href="#">{value.nameOfProposal}</Link>,
      voted: value.voted ? (
        <SecondaryButton>
          <SecondaryButtonText>{`Voted: ${value.voted}`}</SecondaryButtonText>
        </SecondaryButton>
      ) : (
        <PrimaryButton
          text={"Place Vote"}
          onClick={() => {
            setModalContent("vote");
            setModalVisible(true);
            setModalCanAnimate(true);
          }}
        />
      ),
    };
  });

  let upcomingVotes = dummyUpcoming.map((value, index) => {
    return {
      ...value,
      proposal: <Link href={value.proposal}>{"View Proposal"}</Link>,
    };
  });

  let voteProposals = dummyProposals.map((value, index) => {
    return {
      proposal: <Link href={value.proposal}>{"View Proposal"}</Link>,
      signOn: (
        <PrimaryButton
          text={"Sign On"}
          onClick={() => {
            setModalContent("sign");
            setModalVisible(true);
            setModalCanAnimate(true);
          }}
        />
      ),
    };
  });

  return (
    <div>
      <DaoDashboard style={{ marginBottom: 35 }}>
        <div>
          <div style={{ marginBottom: 45 }}>
            <DashboardTitle>DAO Dashboard</DashboardTitle>
          </div>
          <div style={{ width: "33.3333333333333vw" }}>
            <Table
              data={[
                {
                  algoGard: "123",
                  gainUsd: "$1.01",
                  yourGain: "456",
                },
              ]}
              columns={["ALGO/GARD", "GAIN/USD", "Your GAIN"]}
              tableColor="#ffffff"
            />
          </div>
        </div>
        <div>
          <div style={{ marginLeft: 18 }}>
            <div style={{ marginBottom: 8 }}>
              <GraphTitle>{"Treasury ALGO Balance"}</GraphTitle>
            </div>
            <div style={{ marginBottom: 16 }}>
              <GraphSubtitle>
                {"Current Price: $799.89 (Last Updated 12:01 pm)"}
              </GraphSubtitle>
            </div>
          </div>
          <div>
            <Chart size={window.innerWidth * 0.25} data={[]} />
          </div>
        </div>
      </DaoDashboard>
      <div style={{ marginBottom: 35 }}>
        <Table
          title={"Open & Recent Votes"}
          countSubtitle={`${
            dummyRecentVotes.length - closedVotes
          } Open Votes,  ${closedVotes} Closed Vote`}
          data={recentVotes}
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <div style={{ flex: 1, marginRight: 8 }}>
          <Table title={"Upcoming Votes"} data={upcomingVotes} />
        </div>
        <div style={{ flex: 1, marginLeft: 8 }}>
          <Table title={"Vote Proposals"} data={voteProposals} />
        </div>
      </div>
      <Modal
        title={
          modalContent === "vote" ? "Place a Vote" : "Sign On to the Proposal"
        }
        subtitle={
          modalContent === "vote" ? (
            <div>
              <text>Place your vote below for </text>
              <Link href="#">
                Proposal A: Full Title of the Proposal Linked
              </Link>
              <text> the Full Text.</text>
            </div>
          ) : (
            ""
          )
        }
        close={() => setModalVisible(false)}
        animate={modalCanAnimate}
        visible={modalVisible}
      >
        {modalContent === "vote" ? (
          <div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ marginBottom: 13 }}>
                <div style={{ marginBottom: 8 }}>
                  <InputTitle>Your Tokens</InputTitle>
                  <InputMandatory>*</InputMandatory>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Input placeholder="123 Tokens" />
                </div>
                <div>
                  <InputSubtitle>
                    Your 123 tokens will be used to place your vote.
                  </InputSubtitle>
                </div>
              </div>
              <div style={{ marginBottom: 13 }}>
                <div style={{ marginBottom: 8 }}>
                  <InputTitle>Your Vote</InputTitle>
                  <InputMandatory>*</InputMandatory>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Select>
                    <option>"Yes: In Favor of the Proposal"</option>
                    <option>"No: Against the Proposal"</option>
                  </Select>
                </div>
                <div>
                  <InputSubtitle>
                    Select your vote from the drop down.
                  </InputSubtitle>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <PrimaryButton text="Confirm Vote" />
              <CancelButton style={{ marginLeft: 30 }}>
                <CancelButtonText>Cancel</CancelButtonText>
              </CancelButton>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 100, marginTop: 100 }}>
              <text>Place your vote below for </text>
              <Link style={{ fontSize: 16 }} href="#">
                Proposal A: Full Title of the Proposal Linked
              </Link>
              <text> the Full Text.</text>
            </div>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <PrimaryButton text="Confirm Vote" />
              <CancelButton style={{ marginLeft: 30 }}>
                <CancelButtonText>Cancel</CancelButtonText>
              </CancelButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// Styled Components
const DaoDashboard = styled.div`
  height: 220px;
  background: #f4ebff;
  padding: 43px 33px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;
const DashboardTitle = styled.text`
  font-weight: bold;
  font-size: 48px;
`;
const GraphTitle = styled.text`
  font-weight: bold;
  font-size: 16px;
`;

const GraphSubtitle = styled.text`
  font-weight: normal;
  font-size: 12px;
  color: #475467;
`;

const SecondaryButton = styled.button`
  background: transparent;
  padding: 8px 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #6941c6;
  border-radius: 6px;
`;
const Link = styled.a`
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  color: #1849f8;
`;
const SecondaryButtonText = styled.text`
  color: #6941c6;
  font-weight: 500;
  font-size: 16px;
`;
const InputTitle = styled.text`
  font-weight: bold;
  font-size: 16px;
`;
const InputSubtitle = styled.text`
  font-weight: normal;
  font-size: 12px;
`;
const Input = styled.input`
  width: 24.3055555555556vw;
  height: 44px;
  border: 1px solid #dce1e6;
  padding-left: 12px;
  box-sizing: border-box;
`;
const Select = styled.select`
  width: 24.3055555555556vw;
  height: 44px;
  border: 1px solid #dce1e6;
  padding-left: 12px;
  box-sizing: border-box;
`;
const InputMandatory = styled.text`
  font-weight: bold;
  font-size: 16px;
  color: #ff0000;
`;
const CancelButton = styled.button`
  border: 0px;
  background: transparent;
  display: flex;
  align-items: center;
  height: "100%";
  cursor: pointer;
`;
const CancelButtonText = styled.text`
  font-weight: 500;
  font-size: 16px;
`;

// Dummy rows for recent votes table
const dummyRecentVotes = [
  {
    nameOfProposal: "Lorem ipsum dol",
    voteCloses: "Dec 29, 2021",
    votesInFavor: "60%",
    votesAgainst: "37%",
    votesOutstanding: "3%",
    voted: "",
  },
  {
    nameOfProposal: "Lorem ipsum dol",
    voteCloses: "Dec 29, 2021",
    votesInFavor: "60%",
    votesAgainst: "37%",
    votesOutstanding: "3%",
    voted: "",
  },
  {
    nameOfProposal: "Lorem ipsum dol",
    voteCloses: "",
    votesInFavor: "60%",
    votesAgainst: "37%",
    votesOutstanding: "3%",
    voted: "yes",
  },
];

// Dummy rows for upcoming votes table
const dummyUpcoming = [
  {
    dateOfVote: "Jan 6, 2022 - Jan 6, 2022",
    proposal: "#",
  },
  {
    dateOfVote: "Jan 6, 2022 - Jan 6, 2022",
    proposal: "#",
  },
  {
    dateOfVote: "Jan 6, 2022 - Jan 6, 2022",
    proposal: "#",
  },
];

// Dummy rows for proposals table
const dummyProposals = [
  {
    proposals: "#",
  },
  {
    proposals: "#",
  },
  {
    proposals: "#",
  },
];
