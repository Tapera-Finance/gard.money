import React, { useState } from "react";
import styled, { css } from "styled-components";

export default function PageToggle({ selectedTab, tabs, className }) {
  const [one, setOne] = useState(true);
  const [two, setTwo] = useState(false);
  const [three, setThree] = useState(false);
  const [four, setFour] = useState(false);
  return (
    <Bar className={className} >
      <Box
        selected={one}
        onClick={() => {
          selectedTab("one");
          if (one !== true) {
            setOne(true);
            setTwo(false);
            setThree(false);
            setFour(false);
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
            setFour(false);
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
              setFour(false);
            }
          }}
        >
          <Btn selected={three}>{tabs.three}</Btn>
        </Box>
      ) : tabs.four ? (
        <Box
          selected={four}
          onClick={() => {
            selectedTab("four");
            if (four !== true) {
              setOne(false);
              setTwo(false);
              setThree(false);
              setFour(true);
            }
          }}
        >
          <Btn selected={four}>{tabs.four}</Btn>
        </Box>
      ) :
      null}
    </Bar>
  );
}

const Box = styled.div`
  display: flex;
  border: 1px transparent;
  height: 30px;
  max-width: max-content;
  text-align: center;
  justify-content: center;
  padding: 10px 15px 3px;
  align-content: center;
  cursor: pointer;
  border-radius: 10px;
  ${(props) =>
    props.selected &&
    css`
      border: 1px solid #ffffff;
      background: #172756;
      padding: 8px 2px 2px 8px;
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
  padding: 2px 12px 8px 6px;
`;
const Bar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 40px;
  min-width: 74px;
  max-width: max-content;
  background: #0f1733;
  border-radius: 6px;
  margin: auto;
`;
