import React from "react";
import styled, { css } from "styled-components";

/**
 * @prop {string} text - Text to be rendered inside the button
 * @prop {function} onClick - Handles the action to be taken when the button is clicked
 * @param {{text: string, onClick: function}} props
 */
export default function TextButton({ text, onClick, positioned, governPage }) {
  return (
    <ButtonText positioned={positioned} governPage={governPage} onClick={() => onClick()}>
      {text}
    </ButtonText>
  );
}
const ButtonText = styled.text`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: #019fff;
  font-weight: 500;
  font-size: 16px;
  :hover& {
    color: #ffffff;
  }
  ${(props) =>
    props.positioned &&
    css`
      position: relative;
      bottom: 40px;
      margin: auto;
    `}
  ${(props) =>
    props.governPage &&
    css`
      position: relative;
      bottom: 20px;
      margin: auto;
    `}
`;
