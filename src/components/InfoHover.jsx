import React, { useState } from "react";
import styled, { css } from "styled-components";

export default function InfoHover({ infotext }) {

  return (
    <InfoCircle>
    <Text>
        {"i"}
        <ToolTipText>{infotext}</ToolTipText>
    </Text>
  </InfoCircle>
);

}

const InfoCircle = styled.div`
    background-color: transparent;
    border-radius: 50%;
    border: 1px solid #999696;
    text-align: center;
    width: 10px;
    height: 10px;
    margin-right: 10px;
`;

const Text = styled.text`
  font-weight: 500px;
  text-align: center;
  position: relative;
  font-size: 10px;
  color: #999696;
  top: -7px;
`;

const ToolTipText = styled.span`
  visibility: hidden;
  font-size: 10px;
  width: 200px;
  background-color: #0d1227;
  color: #fff;
  text-align: center;
  border-radius: 10px;
  border: 1px solid white;
  padding: 8px 8px;
  bottom: 100%;

  position: absolute;
  bottom: 100%;
  left: -25%;
  z-index: 1;
  ${InfoCircle}:hover & {
    visibility: visible;
  }
`;