import React, { useEffect, useReducer, useState, useContext } from "react";
import styled, { keyframes, css } from "styled-components";
import closeIcon from "../assets/icons/close_icon.png";
import PrimaryButton from "./PrimaryButton";

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
const Container = styled.div`
  background: #0d1227;
  color: white;
  display: flex;
  width: 400px;
  flex-direction: column;
  border-radius: 25px;
  padding: 10px 20px;
`;

export default function AlertOverlay({ text, requestClose }) {
  const [content, setContent] = useState(<></>);
  useEffect(() => {
    if (!text) return;
    setContent(textWithLink(text));
  }, []);
  return (
    <div>
      <Backdrop onClick={() => requestClose()}>
        <Container>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <CloseButton onClick={() => requestClose()}>
              <img src={closeIcon} />
            </CloseButton>
          </div>
          <div style={{ margin: 20 }}>{content}</div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <PrimaryButton text={"OK"} onClick={() => requestClose()} />
          </div>
        </Container>
      </Backdrop>
    </div>
  );
}

const closeModalAnimation = keyframes`
  0% {bottom: -200vh;}
  1% {bottom: -200vh;}
  99% {bottom: 5vh;}
  100% {bottom: 5vh;}
`;
const hideBackdropAnimation = keyframes`
  0% { z-index: -10;background: #b0b0b000;}
  1% { z-index: 20;background: #b0b0b000;}
  99% {background: #b0b0b080;z-index: 20;}
  100% {background: #b0b0b080;z-index: 20;}
`;

const AlertText = styled.text`
  font-weight: 500;
  font-size: 16px;
`;
const CloseButton = styled.button`
  padding: 0px;
  border: 0px;
  background: transparent;
  cursor: pointer;
`;

function textWithLink(text) {
  if (!text.includes("</a>")) return <AlertText>{text}</AlertText>;
  const tagOpenStart = text.indexOf("<a");
  const hrefStart = text.indexOf("href=\"", tagOpenStart);
  const hrefEnd = text.indexOf("\"", hrefStart + 6);
  const tagOpenEnd = text.indexOf(">", hrefEnd);
  const tagClose = text.indexOf("</a>", tagOpenEnd);

  const beforeLink = text.substring(0, tagOpenStart);
  const afterLink = text.substring(tagClose + 4);
  const linkedText = text.substring(tagOpenEnd + 1, tagClose);
  const href = text.substring(hrefStart + 6, hrefEnd);
  return (
    <div>
      <AlertText>{beforeLink}</AlertText>
      <a href={href} target="_blank" rel="noopener noreferrer">
        {linkedText}
      </a>
      <AlertText>{afterLink}</AlertText>
    </div>
  );
}
