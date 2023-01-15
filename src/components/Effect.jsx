import React, { useEffect, useState } from "react";
import ToolTip from "./ToolTip";
import * as tips from "../assets/tooltiptext";
import styled, { css } from "styled-components";
import RewardWrapper from "./RewardWrapper";
import { size, device } from "../styles/global"

export default function Effect({ title, val, hasToolTip, className, rewards, noMarginBottom }) {
  return (
    <EffectContainer className={className} noMarginBottom={noMarginBottom}>
      {hasToolTip ? (
        <div>
          <NewToolTip
            className={className}
            toolTip={title}
            toolTipText={tips[title]}
          ></NewToolTip>
          <hr style={{ border: "none", margin: "0px 0px 7px" }} />
        </div>
      ) : (
        <div>
          <Text className={className}>{title}</Text>
          <hr style={{ border: "none", margin: "0px 0px 7px" }} />
        </div>
      )}
      {rewards ? <RewardWrapper text={val} /> : <Result>{val}</Result>}
    </EffectContainer>
  );
}

const EffectContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
  @media (${device.tablet}) {
    margin: 4px;
  }
  ${(props) => props.noMarginBottom && css`
    margin-bottom: 0px;
  `}
`;

const Text = styled.text`
  font-weight: bold;
  margin: auto;
  color: #ffffff;
`;
const Result = styled.text`
  color: #999696;
`;
const NewToolTip = styled(ToolTip)`
  font-weight: bold;
  margin: auto;
  color: #ffffff;
`;
