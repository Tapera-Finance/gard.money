import React, { useState } from "react";
import styled, { css } from "styled-components";

export default function InputField({
    id,
    className,
    placeholder,
    callback
}) {
    return (
        <Field
            id={id}
            className={className}
            placeholder={placeholder}
            onChange={callback}
        />
    )
}

const Field = styled.input`
  appearance: none;
  background: #0d1227;
  text-decoration: underline;
  color: #9a9a9a;
  width: 10vw;
  height: 6vh;
  border: 1px solid #999696;
  opacity: 65%;
  border-radius: 6px;
  font-size: 24pt;
`
