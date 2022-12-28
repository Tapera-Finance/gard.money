import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "./PrimaryButton";
import { useSelector } from "react-redux";

export default function Step({
  header,
  badges,
  subtitle,
  text,
  checked,
  goTo,
  secondGoTo,
  link,
  linkText,
  mobile,
  onClick,
  expanded,
}) {
  const walletAddress = useSelector(state => state.wallet.address)
  const navigate = useNavigate();


  return (
    <ExpandedStep open={expanded}>
      <StepItem onClick={onClick} open={expanded} mobile={mobile}>
        <div style={{ marginLeft: 8 }}>{checked ? " √ " : ""}{header}</div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
          }}
        >
          {expanded ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              {" "}
              {badges && badges.length > 0 ? (
                badges.map((badge) => {
                  return <Badge type={badge} key={Math.random()} />;
                })
              ) : (
                <></>
              )}
            </div>
          ) : (
            <></>
          )}
        </div>
      </StepItem>
      {expanded ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            textAlign: "center",
            justifyContent: "space-evenly",
            alignItems: "center"
          }}
        >
          <div style={{ display: "flex", textAlign: "center", marginBottom: 0, marginTop: 4 }}>
            <Link href={link} target="_blank">{linkText}</Link>
          </div>
            <text style={{
              // width: "80vw",
              marginBottom: 18, marginTop: 6}}>{text}</text>
          <div style={{ display: "flex", justifyContent: "center", margin: "2px 0px 12px 0px" }}>
            <StepButton
              text={`Go to ${goTo}`}
              blue={true}
              disabled={!walletAddress}
              onClick={() => navigate(`/${goTo.toLowerCase()}`)}
            />
            {secondGoTo !== "" && secondGoTo !== null ? <StepButton text={`Go to ${secondGoTo}`} blue={true} disabled={!walletAddress} onClick={() => navigate(`/${secondGoTo.toLowerCase()}`)} /> : <></>}

          </div>
        </div>
      ) : (
        <></>
      )}
    </ExpandedStep>
  );
}

const Link = styled.a`
  appearance: none;
  text-decoration: none;
  width: 60vw;
  margin-top: 6;
  margin-bottom: 20px;
  color: #019fff;
  font-size: large;
  font-weight: 800;
  &:hover {
    color: #a5e8ff;
  }

`

const StepItem = styled.div`
  display: flex;
  font-weight: 500;
  font-size: large;
  text-align: left;
  align-items: center;
  background: #0f1733;
  border: 1px solid #019fff;
  color: #019fff;
  height: 96px;
  /* width: 60vw; */
  border-radius: 10px;
  margin: auto;
  margin-top: 20px;
  margin-bottom: 20px;
  ${(props) =>
    props.open &&
    css`
      background: #019fff;
      color: #0f1733;

    `}
  ${(props) =>
    props.allOpen &&
    css`
      background: #019fff;
      color: #0f1733;

    `}
    ${(props) => props.mobile && css`
    width: 90%;
  `}
  
`;

const StepButton = styled(PrimaryButton)`
  appearance: none;
  margin-top: 20px;
  margin: unset;
  margin-left: 8px;
  margin-right: 8px;
  &:hover {
    border: 1px transparent;
  }
  &:active {
    border: 1px transparent;
  }
`;

const ExpandedStep = styled.div`
  width: 100%;
`;

const Badge = ({ type }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        background: "#0f1733",
        border: "1px solid #80edff",
        borderRadius: 8,
        marginLeft: 12,
        padding: 2,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div>
          <text style={{ color: "#ffffff", marginRight: 2, fontSize: "8pt" }}>
            {type.text} Reward
          </text>
          <hr
            style={{ border: "dashed 1px #019fff", margin: "0px 0px 2px 0px" }}
          ></hr>
        </div>
        <text style={{ color: "#80edff", fontSize: "8pt", alignItems: "center" }}>{type.val}%</text>
      </div>
    </div>
  );
};
