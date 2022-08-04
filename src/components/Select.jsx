import React from "react";
import styled, { css } from "styled-components";

export default function Select({
  id,
  className,
  value,
  options,
  callback,
  ref
}) {
  return (
    <Dropdown
      id={id}
      className={className}
      value={value}
      onChange={callback}
      ref={ref}
    >
      <option value="" selected disabled hidden>Select</option>
      {options.length > 0 ? (
        options.map((opt, idx) => {
          return <option key={idx}>{opt}</option>;
        })
      ) : (
        <option>Select</option>
      )}
    </Dropdown>
  );
}

const Dropdown = styled.select`
  background: #0d122713;
  color: #01d1ff;
  border: 1px transparent;
  border-radius: 4px;
  width: 11.5972222222222vw;
  padding: 0px 0px 0px 12px;
  appearance: none;
  display: block;
  font-family: inherit;
  font-size: 140%;
  margin: 0;
  box-sizing: border-box;
  width: max-content;
  height: max-content;
  padding: 5px;
  white-space: nowrap;
`;

