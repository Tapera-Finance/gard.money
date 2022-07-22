import React, { useReducer, useState, useContext } from "react";
import styled, { keyframes, css } from "styled-components";

export default function LoadingOverlay({ text }) {
  return (
    <div>
      <Backdrop>
        <TextContainer>
          <div>
            <LoadingText>{text || "Loading..."}</LoadingText>
          </div>
        </TextContainer>
      </Backdrop>
    </div>
  );
}

const TextAnimation = keyframes`
  0% {color: #01d1ff;}
  50% {color: #7c52ff;}
  100% {color: #ff00ff;}
`;

const LoadingText = styled.text`
  font-weight: 900;
  font-size: 24px;
  animation-name: ${TextAnimation};
  animation-duration: 1s;
  animation-iteration-count: infinite;
  animation-fill-mode: forwards;
  animation-direction: ${"alternate"};
`;

const Backdrop = styled.div`
  position: fixed;
  height: 100vh;
  width: 100vw;
  left: 0;
  top: 0;
  z-index: ${21};
  background: ${"#b0b0b080"};
  display: flex;
  justify-content: center;
  align-items: center;
`;
const TextContainer = styled.div`
  height: 100px;
  background: #0d1227;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 25px;
  padding: 0px 40px;
`;
