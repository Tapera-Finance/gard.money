import React, { useContext } from "react";
import styled, { css } from "styled-components";
import linkIconWhite from "../assets/icons/link_icon_white.png";
import RewardNotice from "../components/RewardNotice";
import Details from "../components/Details";
import CountdownTimer from "../components/CountdownTimer";
import PrimaryButton from "../components/PrimaryButton";
import { useNavigate } from "react-router-dom";

const homeDetails = [
  {
    title: "Total Value Locked",
    val: 5324909283,
    hasToolTip: false
  },
  {
    title: "APY",
    val: "7.33%",
    hasToolTip: false
  },
  {
    title: "Gard Backed %",
    val: "67",
    hasToolTip: false
  },
  {
    title: "ALGO APR",
    val: "0.03%",
    hasToolTip: false
  }
]

/**
 * Content found on home
 */
export default function HomeContent() {
  const navigate = useNavigate();
  return (
    <div style={{}}>
      <RewardNotice
        program={"Governance Period #4"}
        timespan={"Now - October 22, 2022"}
        estimatedRewards={"12% - 33% APR Rewards"}
        action={"Borrow ALGO to Claim Rewards"}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          borderRadius: 10,
          justifyContent: "space-between",
          textAlign: "center",
          background: "linear-gradient(to right, #80deff 65%, #ffffff)",
          padding: "20px 20px 0px",
        }}
      >
        <div
          style={{
            justifyContent: "center",
            textAlign: "left",
            color: "#172756",
          }}
        >
          <div>Governance Period #4</div>
          <div style={{ fontSize: "10pt" }}>Now - October 22, 2022</div>
          <div>12% - 33% APR Rewards</div>
        </div>
        <div style={{display: "flex", flexDirection: "column", justifyContent: "center",
      textAlign: "center", marginLeft: "25px"}}>

        <span style={{ color: "#172756" }}>Enrollment Countdown</span>
        <CountdownTimer targetDate={1761180257000} />
        </div>
        <PrimaryButton
          text="Enroll"
          onClick={navigate("/borrow")}
        ></PrimaryButton>
      </div>
      <Details details={homeDetails}/>
    </div>
  );
}

// styled components
const Title = styled.text`
  font-size: 30px;
  font-weight: 700;
  /* background: "linear-gradient(#80deff, #ffffff)" */
`;
const Subtitle = styled.text`
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
`;
const Paragraph = styled.text`
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const LinkButton = styled.button`
  height: 20px;
  border-width: 0;
  background-color: transparent;
  cursor: pointer;
`;

const LinkButtonText = styled.text`
  font-weight: normal;
  font-size: 14px;
  color: #7c52ff;
  ${LinkButton}:hover & {
    text-decoration: underline;
  }
`;

const PinnedText = styled.text`
  font-weight: 500;
  font-size: 12px;
`;

const NewsImage = styled.img`
  height: 148px;
  width: 148px;
  object-fit: cover;
`;

const NewsHeadline = styled.text`
  font-weight: bold;
  font-size: 20px;
`;
const LinkButtonTextBold = styled.text`
  font-weight: bold;
  font-size: 14px;
  color: #7c52ff; ;
`;
