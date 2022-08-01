import React, { useState } from "react";
import styled, { css } from "styled-components";

export default function InputField({
    id,
    type,
    min,
    step,
    callback
}) {
    return (
        <Field
            id={id}
            callback={callback}
        />
    )
}
// maybe add an onChange and onSubmit handler as optional params

const Field = styled.input`
  appearance: none;
  background: #0d1227;
  text-decoration: underline;
  color: #999696;
  width: 16vw;
  height: 6vh;
  border: 1px solid yellow;
  opacity: 65%;
`
