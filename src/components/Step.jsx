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
          <div style={{ display: "flex", justifyContent: "left" }}>
            <StepButton
              text={`Go to ${goTo}`}
              purple
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

`

const StepItem = styled.div`
  display: flex;
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
  border: 1px solid #6941c6;
  margin-top: 8px;
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

// export function Help({ heading, title, animate, visible, close }) {
//   return (
//     <div>
//         <Heading></Heading>
//       <Backdrop animate={animate} visible={visible} onClick={() => close()}>
//         <MainContent
//           animate={animate}
//           visible={visible}
//           onClick={(e) => e.stopPropagation()}
//         >

//       Help
//         </MainContent>
//       </Backdrop>
//     </div>
//   );
// }

// const closeHelpAnimation = keyframes`
//   0% {bottom: -200vh;}
//   1% {bottom: -200vh;}
//   99% {bottom: ${window.innerWidth < 900 ? " 20vh" : "5vh"};}
//   100% {bottom: ${window.innerWidth < 900 ? " 20vh" : "5vh"};}
// `;
// const hideBackdropAnimation = keyframes`
//   0% { z-index: -10;background: #b0b0b000;}
//   1% { z-index: 20;background: #b0b0b000;}
//   99% {background: #b0b0b080;z-index: 20;}
//   100% {background: #b0b0b080;z-index: 20;}
// `;

// const Heading = styled.text`
//   font-weight: 500;
// `

// const MainContent = styled.div`
//   background: rgba(13, 18, 39);
//   color: white;
//   /* height: ${window.innerWidth < 900 ? "450px" : "605px"}; */
//   /* width: ${`${window.innerWidth < 900 ? "90vw" : "835px"}`}; */
//   position: absolute;
//   overflow: auto;
//   border-radius: 25px;
//   ${(props) =>
//     props.animate &&
//     css`
//       animation-name: ${props.animate ? closeHelpAnimation : ""};
//       animation-duration: 1s;
//       animation-iteration-count: 1;
//       animation-fill-mode: forwards;
//       animation-direction: ${!props.visible ? "reverse" : "normal"};
//     `}
//   ${(props) => css`
//     bottom: ${props.visible
//       ? window.innerWidth < 900
//         ? "20vh"
//         : "5vh"
//       : "-200vh"};
//   `}
// `;
// const Backdrop = styled.div`
//   position: fixed;
//   height: 100vh;
//   width: 100vw;
//   left: 0;
//   top: 0;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   ${(props) =>
//     props.animate &&
//     css`
//       animation-direction: ${!props.visible ? "reverse" : "normal"};
//       animation-name: ${props.animate ? hideBackdropAnimation : ""};
//       animation-duration: 1s;
//       animation-iteration-count: 1;
//       animation-fill-mode: forwards;
//     `}
//   ${(props) => css`
//     background: ${props.visible ? "#b0b0b080" : "#b0b0b000"};
//     z-index: ${props.visible ? 20 : -10};
//   `}
// `;
