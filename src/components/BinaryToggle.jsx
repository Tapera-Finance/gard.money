import React, { useState } from "react";
import styled, { css } from "styled-components";

export default function BinaryToggle({ optionA, optionB, selectedOption }) {
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);
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
          width: "30%",
        }}
      >
        <Text selected={a}>{optionA}</Text>
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
          ></Box>
          <Box
            selected={b}
            onClick={() => {
              selectedOption(optionB);
              if (b !== true) {
                setA(false);
                setB(true);
              }
            }}
          ></Box>
        </Bar>
        <Text selected={b}>{optionB}</Text>
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
  width: 30px;
  border-radius: 12px;
  ${(props) =>
    props.selected &&
    css`
      border: 1px solid #ffffff;
      background: #80edff;
      &:hover {
        border: unset;
      }
    `}
  &:hover {
    border: 1px solid #ffffff;
  }
`;

const Text = styled.text`
  font-weight: 500px;
  color: #999696;
  ${(props) =>
    props.selected &&
    css`
      color: #80edff;
    `}
`;
