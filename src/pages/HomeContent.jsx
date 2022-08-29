import React, { useContext } from "react";
import styled, { css } from "styled-components";
import linkIconWhite from "../assets/icons/link_icon_white.png";
import RewardNotice from "../components/RewardNotice"
import Details from "../components/Details"


/**
 * Content found on home
 */
export default function HomeContent() {
  return (
    <div style={{}}>
      <RewardNotice
        program={"Governance Period #4"}
        timespan={"Now - October 22, 2022"}
        estimatedRewards={"12% - 33% APR Rewards"}
        action={"Borrow ALGO to Claim Rewards"}
      />
      {/* <Details /> */}

    </div>
  );
}

// styled components
const Title = styled.text`
  font-size: 30px;
  font-weight: 700;
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
  color: #7c52ff;
  ;
`;
