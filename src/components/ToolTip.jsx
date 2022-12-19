import React, { useState } from "react";
import styled, { css } from "styled-components";

export default function ToolTip({ toolTip, toolTipText, className }) {
  return (
    <Text className={className}>
      {" "}
      {toolTip}
      <ToolTipText>{toolTipText}</ToolTipText>
    </Text>
  );
}

const Text = styled.div`
    position: relative;
    display: inline-block;
    cursor: help;
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
  ${Text}:hover & {
    visibility: visible;
  }
`;
