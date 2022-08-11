import React, { useContext } from "react";
import styled, { css } from "styled-components";

/**
 * @prop {string} text - Text to be rendered inside the button
 * @prop {function} onClick - Handles the action to be taken when the button is clicked
 * @param {{text: string, onClick: function}} props
 */
export default function PrimaryButton({ text, onClick, variant, disabled, positioned, exit }) {

  return (
    <Button variant={variant} disabled={disabled} positioned={positioned} exit={exit} onClick={() => onClick()}>
      <ButtonText variant={variant} disabled={disabled}>
        {text}
      </ButtonText>
    </Button>
  );
}

const Button = styled.button`
  background-color: transparent;
  border: 1px solid #ffffff;
  padding: 8px 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 6px;
  &:hover {
    background-color: #6941c6;
  }
  ${(props) =>
    props.variant &&
    css`
      background-color: transparent;
      border: 1px solid white;
      &:hover {
        background-color: #6941c6;
      }
    `}
  ${(props) =>
    props.positioned &&
    css`
      position: relative;
      bottom: 20px;
      margin: auto;
      background-color: #7c52ff;
      border: none;
      z-index: 1;
    `}
  ${(props) =>
    props.disabled &&
    css`
      border: none;
      background-color: #999999;
      pointer-events: none;
    `}
  ${(props) =>
    props.exit &&
    css`
      border: 1px solid #ffffff;
      background-color: #172756;
      &:hover {
        background-color: #23325e;
      }
    `}
`;
const ButtonText = styled.text`
  color: #ffffff;
  font-weight: 500;
  font-size: 16px;
  ${Button}:hover & {
    color: #ffffff;
  }
`;
