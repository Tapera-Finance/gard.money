import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "./PrimaryButton";
// import Help from "./Help";

export default function Step({
  header,
  badges,
  subtitle,
  text,
  goTo,
  link,
  linkText,
  allOpen,
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpen = () => {
    setOpen(!open);
  };

  useEffect(() => {
    setOpen(allOpen);
  }, [allOpen]);

  return (
    <ExpandedStep open={open}>
      <StepItem onClick={handleOpen} open={open}>
        <div style={{ marginLeft: 8 }}>{header}</div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
          }}
        >
          {open ? (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              {" "}
              {badges? console.log("badges?", badges) : null}
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
      {open ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            textAlign: "left",
            alignItems: "left",
            justifyContent: "space-evenly",
          }}
        >
          <div style={{ display: "flex", textAlign: "center", width: "60vw", marginBottom: 6, marginTop: 6 }}>
            <Link href={link} target="_blank">What is {linkText}?</Link>
          </div>
          <text
            style={{ fontWeight: "bolder", width: "40%", marginBottom: 12 }}
            >
            {subtitle}
          </text>
            <text style={{width: "60vw", marginBottom: 6, marginTop: 6}}>{text}</text>
          <div style={{ display: "flex", justifyContent: "left", margin: "2px 0px 12px 0px" }}>
            <StepButton
              text={`Go to ${goTo}`}
              blue={true}
              onClick={() => navigate(`/${goTo.toLowerCase()}`)}
            />

            <div style={{ marginLeft: "75%" }}></div>
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
  color: #019fff;
  height: 80px;
  width: 60vw;
  border-radius: 10px;
  margin-top: 20px;
  margin-bottom: 20px;
  ${(props) =>
    props.open &&
    css`
      background: #019fff;
      color: #0f1733;
      width: 60vw;
    `}
  ${(props) =>
    props.allOpen &&
    css`
      background: #019fff;
      color: #0f1733;
      width: 60vw;
    `}
`;

const StepButton = styled(PrimaryButton)`
  appearance: none;
  margin-top: 20px;
  margin: unset;
  &:hover {
    border: 1px transparent;
  }
  &:active {
    border: 1px transparent;
  }
`;

const ExpandedStep = styled.div`
  width: 100%auto;
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
        padding: 4,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <text style={{ color: "#ffffff", marginRight: 2 }}>
            {type} Reward
          </text>
          <hr
            style={{ border: "dashed 1px #019fff", margin: "0px 0px 2px 0px" }}
          ></hr>
        </div>
        <text style={{ color: "#80edff" }}>0.03%</text>
      </div>
    </div>
  );
};
