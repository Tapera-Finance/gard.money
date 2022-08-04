import React, { useState } from "react";
import styled, { css } from "styled-components";

export default function InputField({
  id,
  className,
  type,
  placeholder,
  value,
  callback,
}) {
  return (
    <Field
      id={id}
      className={className}
      placeholder={placeholder}
      value={value}
      onChange={callback}
    />
  );
}

const Field = styled.input`
  appearance: none;
  background: #0d122713;
  text-decoration: underline;
  color: #ffffff;
  width: 10vw;
  height: 6vh;
  border: 1px solid #999696;
  border-radius: 6px;
  font-size: 20pt;
`;
