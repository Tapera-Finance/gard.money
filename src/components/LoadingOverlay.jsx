import React, { useReducer, useState, useContext } from "react";
import styled, { keyframes, css } from "styled-components";
import puppy from "../assets/puppy-min.png"
import closeIcon from "../assets/icons/close_icon.png";


export default function LoadingOverlay({ text, close }) {
  return (
    <div>
      <Backdrop>
        <TextContainer>
          <CloseButton onClick={() => close()}>
              <img style={{height: 20}} src={closeIcon} />
          </CloseButton>
          {/* <img 
          style={{
            height: "40%",
            objectFit: "cover",
            borderRadius: 10,
          }} 
          src={puppy} 
          alt="puppy"/> */}
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
  font-weight: 500;
  font-size: 14px;
  animation-name: ${TextAnimation};
  animation-duration: 1s;
  animation-iteration-count: infinite;
  animation-fill-mode: forwards;
  animation-direction: ${"alternate"};
`;

const Backdrop = styled.div`
  position: fixed;
  right: 30px;
  bottom: 30px;
  z-index: ${21};
`;
const TextContainer = styled.div`
  height: 130px;
  width: 400px;
  border: 1px solid white;
  background: #0E1834;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  padding: 0px 20px 40px 20px;
`;
const CloseButton = styled.button`
  position: relative;
  bottom: 30px;
  left: 15px;
  border: 0px;
  background: transparent;
  cursor: pointer;
  align-self: end;
`;