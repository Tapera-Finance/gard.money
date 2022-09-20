import React, { useState } from "react";
import styled, {css, keyframes} from "styled-components";

export default function Help({ heading, title, animate, visible, close }) {
  return (
    <div>
        <Heading></Heading>
      <Backdrop animate={animate} visible={visible} onClick={() => close()}>
        <MainContent
          animate={animate}
          visible={visible}
          onClick={(e) => e.stopPropagation()}
        >

      Help
        </MainContent>
      </Backdrop>
    </div>
  );
}

const closeHelpAnimation = keyframes`
  0% {bottom: -200vh;}
  1% {bottom: -200vh;}
  99% {bottom: ${window.innerWidth < 900 ? " 20vh" : "5vh"};}
  100% {bottom: ${window.innerWidth < 900 ? " 20vh" : "5vh"};}
`;
const hideBackdropAnimation = keyframes`
  0% { z-index: -10;background: #b0b0b000;}
  1% { z-index: 20;background: #b0b0b000;}
  99% {background: #b0b0b080;z-index: 20;}
  100% {background: #b0b0b080;z-index: 20;}
`;

const Heading = styled.text`
  font-weight: 500;
`

const MainContent = styled.div`
  background: rgba(13, 18, 39);
  color: white;
  /* height: ${window.innerWidth < 900 ? "450px" : "605px"}; */
  /* width: ${`${window.innerWidth < 900 ? "90vw" : "835px"}`}; */
  position: absolute;
  overflow: auto;
  border-radius: 25px;
  ${(props) =>
    props.animate &&
    css`
      animation-name: ${props.animate ? closeHelpAnimation : ""};
      animation-duration: 1s;
      animation-iteration-count: 1;
      animation-fill-mode: forwards;
      animation-direction: ${!props.visible ? "reverse" : "normal"};
    `}
  ${(props) => css`
    bottom: ${props.visible
      ? window.innerWidth < 900
        ? "20vh"
        : "5vh"
      : "-200vh"};
  `}
`;
const Backdrop = styled.div`
  position: fixed;
  height: 100vh;
  width: 100vw;
  left: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  ${(props) =>
    props.animate &&
    css`
      animation-direction: ${!props.visible ? "reverse" : "normal"};
      animation-name: ${props.animate ? hideBackdropAnimation : ""};
      animation-duration: 1s;
      animation-iteration-count: 1;
      animation-fill-mode: forwards;
    `}
  ${(props) => css`
    background: ${props.visible ? "#b0b0b080" : "#b0b0b000"};
    z-index: ${props.visible ? 20 : -10};
  `}
`;
