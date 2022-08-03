import React, { useEffect, useState } from "react";
import ToolTip from "./ToolTip";
import * as tips from "../assets/tooltiptext";
import styled, {css} from "styled-components";

export default function Effect({title, val, hasToolTip}) {
 return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      flexDirection: "column",
    }} >
      {hasToolTip ? (
        <div style={{paddingBottom:8}}>
          <NewToolTip toolTip={title} toolTipText={tips[title]}></NewToolTip>
        </div>
      ) : (
        <Text>{title}</Text>
      )}
      <Result>{val}</Result>
    </div>
  );
}

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
