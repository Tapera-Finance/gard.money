import React, { useState } from "react";
import styled, { css } from "styled-components";

export default function PageToggle({ selectedTab }) {
const [swap, setSwap] = useState(true)
const [pool, setPool] = useState(false)
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "6vh",
        width: "20vh",
        background: "#000000",
        borderRadius: "12px"
      }}
    >
        <Btn
        selected={swap}
        onClick={() => {
          selectedTab("swap")
          if (swap !== true) {
            setSwap(true)
            setPool(false)
          }
        }} >Swap</Btn>
        {/* <Btn
        selected={pool}
        onClick={() => {
          selectedTab("pool")
          if (pool !== true) {
            setSwap(false)
            setPool(true)
          }
        }}
        >Pool</Btn> */}
    </div>
  );
}


const Btn = styled.text`
  border: 1px transparent;
  height: 30px;
  width: 60px;
  text-align: center;
  border-radius: 4px;
  ${(props) =>
    props.selected &&
    css`
      background: #172756;
      text-decoration: underline;
      text-decoration-style: dotted;
    `
  }
  &:hover {
    border: 1px solid #019fff;
  }
`
