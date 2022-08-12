import React, { useState } from "react";
import styled, { css } from "styled-components";

export default function PageToggle({ selectedTab, tabs }) {
  const [one, setOne] = useState(true);
  const [two, setTwo] = useState(false);
  const [three, setThree] = useState(false);
  const [four, setFour] = useState(false);
  return (
    <Bar>
      <Box
        selected={one}
        onClick={() => {
          selectedTab("one");
          if (one !== true) {
            setOne(true);
            setTwo(false);
            setThree(false);
          }
        }}
      >
        <Btn selected={one}>{tabs.one}</Btn>
      </Box>
      <Box
        selected={two}
        onClick={() => {
          selectedTab("two");
          if (two !== true) {
            setOne(false);
            setTwo(true);
            setThree(false);
          }
        }}
      >
        <Btn selected={two}>{tabs.two}</Btn>
      </Box>
      {tabs.three ? (
        <Box
          selected={three}
          onClick={() => {
            selectedTab("three");
            if (three !== true) {
              setOne(false);
              setTwo(false);
              setThree(true);
            }
          }}
        >
          <Btn selected={three}>{tabs.three}</Btn>
        </Box>
      ) : null}
    </Bar>
  );
}

const Box = styled.div`
  display: flex;
  border: 1px transparent;
  height: 30px;
  max-width: fit-content;
  text-align: center;
  justify-content: center;
  padding: 6px 2px 2px 6px;
  align-content: center;
  cursor: pointer;
  border-radius: 3px;
  ${(props) =>
    props.selected &&
    css`
      border: 1px solid #ffffff;
      background: #172756;
      padding: 6px 0px 0px 6px;
      &:hover {
        border: unset;
      }
    `}
  &:hover {
    border: 1px solid #ffffff;
  }
`;

const Btn = styled.text`
  text-decoration: underline;
  text-decoration-style: dotted;
  max-width: max-content;
  padding: 0px 2px 2px 0px;
`;
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
`;
