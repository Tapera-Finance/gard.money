import React, { useState } from "react";
import styled, { css } from "styled-components";
import { device } from "../styles/global";
import Effect from "./Effect";

export default function PageToggle({ selectedTab, tabs, className, pageHeader=true }) {
  const [one, setOne] = useState(true);
  const [two, setTwo] = useState(false);
  const [three, setThree] = useState(false);
  const [four, setFour] = useState(false);
  return (
    <Bar className={className}>
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
        {pageHeader ? (<Effect title={tabs.one} hasToolTip={true} noMarginBottom={true}><Btn selected={one}>{tabs.one}</Btn></Effect>) 
        : (<Btn selected={one}>{tabs.one}</Btn>)
        }
      </Box>
      {tabs.two ? (
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
      ) : (
        <></>
      )}
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
      ) : null}
      {tabs.four ? (
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
      ) : null}
    </Bar>
  );
}

const Box = styled.div`
  display: flex;
  border: 1px transparent;
  /* height: 30px; */
  /* max-width: max-content; */
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
      &:hover {
        border: unset;
      }
    `}
  &:hover {
    border: 1px solid #ffffff;
  }

  @media (${device.mobileM}) {
    padding: 10px 0px 3px;
  }
  @media (${device.mobileL}) {
    &:hover {
      border: 1px solid #ffffff;
      background: #172756;
    }
  }
`;

const Btn = styled.text`
  /* text-decoration: underline; */
  /* text-decoration-style: dotted; */
  /* max-width: max-content; */
  padding: 2px 12px 8px 6px;
  @media (${device.mobileM}) {
    padding: 0px 0px 0px 0px;
    transform: scale(0.8);
  }
`;
const Bar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  /* min-height: 40px;
  min-width: 74px; */
  max-width: fit-content;
  border-radius: 6px;
  margin: auto;
  @media (${device.mobileL}) {
    transform: scale(0.9);
    max-width: inherit;
  }
  @media (${device.mobileM}) {
    transform: scale(0.8);
    /* width: max-content; */
  }
`;
