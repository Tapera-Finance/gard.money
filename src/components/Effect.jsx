import React, { useEffect, useState } from "react";
import ToolTip from "./ToolTip";
import * as tips from "../assets/tooltiptext";
import styled, {css} from "styled-components";
import RewardWrapper from "./RewardWrapper";
import { titleToToolTip } from "../utils";

export default function Effect({title, val,  hasToolTip, className}) {
 return (
    <EffectContainer  className={className}>
      {hasToolTip ? (
        <NewToolTip className={className} toolTip={title} toolTipText={tips[titleToToolTip(title)]}></NewToolTip>
      ) : (
        <Text className={className}>{title}</Text>
      )}
      <Result className={className}>{val}</Result>
    </EffectContainer>
  );
}

const EffectContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  align-items: center;
`

const Text = styled.text`
  text-decoration: underline;
  text-decoration-style: dotted;
  margin: auto;
  color: #ffffff;
`
const Result = styled.text`
  color: #999696;
`
const NewToolTip = styled(ToolTip)`
  text-decoration: underline;
  text-decoration-style: dotted;
  margin: auto;
  color: #ffffff;
`
