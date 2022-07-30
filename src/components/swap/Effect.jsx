import React, { useState } from "react";
import ToolTip from "../ToolTip";
import * as tips from "../../assets/tooltiptext";

export default function Effect(title, func, hasToolTip) {
  return (
    <div>
      {hasToolTip ? (
        <ToolTip toolTip={title} toolTipText={tips[title]}></ToolTip>
      ) : (
        <Text>{title}</Text>
      )}
      <Result>{func()}</Result>
    </div>
  );
}
