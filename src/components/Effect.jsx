import React, { useEffect, useState } from "react";
import ToolTip from "./ToolTip";
import * as tips from "../assets/tooltiptext";
import styled, {css} from "styled-components";

export default function Effect({title, val,  hasToolTip}) {
 return (
    <div>
      {hasToolTip ? (
        <ToolTip toolTip={title} toolTipText={tips[title]}></ToolTip>
      ) : (
        <Text>{title}</Text>
      )}
      <Result>{val}</Result>
    </div>
  );
}

const Text = styled.text`

`
const Result = styled.text`

`
