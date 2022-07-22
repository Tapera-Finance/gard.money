import React, { useContext } from "react";
import styled, { css } from "styled-components";
import { ThemeContext } from "../contexts/ThemeContext";

/**
 * @prop {string} text - Text to be rendered inside the button
 * @prop {function} onClick - Handles the action to be taken when the button is clicked
 * @param {{text: string, onClick: function}} props
 */
export default function PrimaryButton({ text, onClick, variant, disabled }) {

  return (
    <Button variant={variant} disabled={disabled}  onClick={() => onClick()}>
      <ButtonText variant={variant} disabled={disabled}>
        {text}
      </ButtonText>
    </Button>
  );
}

const Button = styled.button`
  background-color: #6941c6;
  border: 1px solid #ffffff;
  padding: 8px 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 6px;
  &:hover {
    background-color: #381d77;
  }
  ${(props) =>
    props.variant &&
    css`
      background-color: transparent;
      border: 1px solid #6941c6;
      &:hover {
        background-color: #6941c6;
      }
    `}
  ${(props) =>
    props.disabled &&
    css`
      border: 1px solid #999999;
      background-color: #cccccc;
      pointer-events: none;
    `}
`;
const ButtonText = styled.text`
  color: #ffffff;
  font-weight: 500;
  font-size: 16px;
  ${Button}:hover & {
    color: #ffffff;
  }
  ${(props) =>
    props.variant &&
    css`
      color: #6941c6;
    `}
  ${(props) =>
    props.disabled &&
    css`
      color: #666666;
    `}
`;
