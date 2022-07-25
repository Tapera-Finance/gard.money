import React, { useState } from "react";
import styled, { css } from "styled-components";

export default function PageToggle({ selectedTab }) {
const [swap, setSwap] = useState(true)
const [pool, setPool] = useState(false)
  return (
    <Bar
    >
      <Box selected={swap} >
        <Btn
        selected={swap}
        onClick={() => {
          selectedTab("swap")
          if (swap !== true) {
            setSwap(true)
            setPool(false)
          }
        }} >Swap</Btn>
      </Box>
      {/* <Box selected={pool}>
        <Btn
        selected={pool}
        onClick={() => {
          selectedTab("pool")
          if (pool !== true) {
            setSwap(false)
            setPool(true)
          }
        }}
        >Pool</Btn>
      </Box> */}
    </Bar>
  );
}

const Box = styled.div`
  display: flex;
  border: 1px transparent;
  height: 30px;
  width: 65px;
  text-align: center;
  justify-content: center;
  align-content: center;
  border-radius: 3px;
  ${(props) =>
    props.selected &&
    css`
      border: 1px solid #ffffff;
      background: #172756;
      &:hover {
        border: unset;
      }
    `
  }
  &:hover {
    border: 1px solid #ffffff;
  }

`

const Btn = styled.text`
  text-decoration: underline;
  text-decoration-style: dotted;

`
const Bar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 40px;
  min-width: 74px;
  max-width: max-content;
  background: #000000;
  border-radius: 6px;
  margin: auto;

`
