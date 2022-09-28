import React, { useEffect, useReducer, useState, useContext } from "react";
import { useSelector } from "react-redux";
import styled, { keyframes, css } from "styled-components";
import closeIcon from "../assets/icons/close_icon.png";
import PrimaryButton from "./PrimaryButton";
import celebration from "../assets/icons/celebration.png"

const Backdrop = styled.div`
  position: fixed;
  right: 30px;
  bottom: 30px;
  z-index: ${21};
`;
const Container = styled.div`
  height: 270px;
  width: 400px;
  background: #0E1834;
  color: white;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  padding: 10px 20px;
  border: 1px solid white;
`;

const OldBackdrop = styled.div`
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

const OldContainer = styled.div`
  background: rgba(13, 18, 39);
  color: white;
  display: flex;
  width: 400px;
  flex-direction: column;
  border-radius: 25px;
  padding: 20px 20px;
  text-align: center;
`;

export default function AlertOverlay({ text, requestClose }) {
  const [content, setContent] = useState(<></>);
  const walletAddress = useSelector(state => state.wallet.address);
  useEffect(() => {
    if (!text) return;
    setContent(textWithLink(text));
  }, []);
  var textParse = text.match( /[^.!?]+[.!?]+/g );
  var celebrate = textParse ? textParse.includes("Successfully opened a new CDP.") : false;
  return (
    <div>
      {walletAddress ? (
      <Backdrop>
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
          {celebrate ? <img style={{borderRadius: 10, objectFit:"cover",}} src={celebration} />: <></>}
          <div style={{marginTop: 10}}>{content}</div>

        </Container>
      </Backdrop>

      ) : (
        <OldBackdrop onClick={() => requestClose()}>
        <OldContainer>
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
          <div style={{ margin: 2, marginBottom: 16 }}>{content}</div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <PrimaryButton text={"OK"} blue={true} onClick={() => requestClose()} />
          </div>
        </OldContainer>
      </OldBackdrop>
      )
    }
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
  margin-bottom: 10px;
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
