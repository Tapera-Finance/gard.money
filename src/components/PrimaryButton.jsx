import React, { useContext } from "react";
import styled, { css } from "styled-components";

/**
 * @prop {string} text - Text to be rendered inside the button
 * @prop {function} onClick - Handles the action to be taken when the button is clicked
 * @param {{text: string, onClick: function}} props
 */
export default function PrimaryButton({ text, onClick, variant, disabled, positioned, exit, underTable, toggle, blue, className, left_align=false, uniform }) {

  return left_align ? (<LeftButton className={className} variant={variant} disabled={disabled} positioned={positioned} exit={exit} underTable={underTable} toggle={toggle} blue={blue} onClick={() => onClick()}>
  <ButtonText variant={variant} disabled={disabled}>
    {text}
  </ButtonText>
  </LeftButton> ) : (
    <Button className={className} variant={variant} disabled={disabled} positioned={positioned} exit={exit} underTable={underTable} toggle={toggle} blue={blue} uniform={uniform} onClick={() => onClick()}>
      <ButtonText variant={variant} disabled={disabled}>
        {text}
      </ButtonText>
    </Button>
  );
}

const Button = styled.button`
  margin: auto;
  background-color: #172756;
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
      border: none;
      z-index: 1;
    `}
  ${(props) =>
    props.blue &&
    css`
      border: none;
      background-color: #019fff;
      &:hover {
        background-color: #0167a6;
      }
    `}
  ${(props) =>
    props.underTable &&
    css`
      position: relative;
      bottom: 50px;
      margin: auto;
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
  ${(props) =>
    props.toggle &&
    css`
      border: none;
      background-color: transparent;
      color: #999696;
      &:hover {
        background-color: transparent;
      }
    `}
    ${(props) =>
      props.uniform &&
      css`
        padding: 8px 0px;
        width: 80px;
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
const LeftButton = styled.button`
margin: auto;
background-color: #172756;
border: 1px solid #ffffff;
padding: 8px 18px;
justify-content: left;
align-items: left;
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
    border: none;
    z-index: 1;
  `}
${(props) =>
  props.blue &&
  css`
    border: none;
    background-color: #019fff;
    &:hover {
      background-color: #0167a6;
    }
  `}
${(props) =>
  props.underTable &&
  css`
    position: relative;
    bottom: 50px;
    margin: auto;
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
${(props) =>
  props.toggle &&
  css`
    border: none;
    background-color: transparent;
    color: #999696;
    &:hover {
      background-color: transparent;
    }
  `}
`;
