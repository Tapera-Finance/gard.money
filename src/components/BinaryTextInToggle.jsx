import React, { useState } from "react";
import styled, { css } from "styled-components";

export default function BinaryTextInToggle({ optionA, optionB, selectedOption, header = null }) {
  const A_is_default = header !== null ? !window.location.hash.toLowerCase().includes(header) : true;
  const [a, setA] = useState(A_is_default);
  const [b, setB] = useState(!A_is_default);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          alignItems: "center"
        }}
      >
        <Bar className="container">
          <Box
            selected={a}
            onClick={() => {
              selectedOption(optionA);
              if (a !== true) {
                setA(true);
                setB(false);
              }
            }}
          >        
          <Text
          selected={a}
          onClick={() => {
            selectedOption(optionA);
            if (a !== true) {
              setA(true);
              setB(false);
            }
          }}
        >
          {optionA}
        </Text>
        </Box>
        |
          <Box
            selected={b}
            onClick={() => {
              selectedOption(optionB);
              if (b !== true) {
                setA(false);
                setB(true);
              }
            }}
          >        
          <Text
          selected={b}
          onClick={() => {
            selectedOption(optionB);
            if (b !== true) {
              setA(false);
              setB(true);
            }
          }}
        >
          {optionB}
        </Text></Box>
        </Bar>
      </div>
    </div>
  );
}

const Bar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 40px;
  min-width: 74px;
  background: #0f1733;
  border-radius: 10px;
  margin: auto;
`;

const Box = styled.div`
  border: 1px transparent;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 160px;
  border-radius: 12px;
  &:hover {
    /* border: 1px solid #ffffff; */
  }
`;

const Text = styled.text`
  font-weight: 500px;
  text-align: center;
  color: #999696;
  cursor: pointer;
  ${(props) =>
    props.selected &&
    css`
      color: #80edff;
    `}
`;
