import React, { useState } from "react";
import styled, { css } from "styled-components";

export default function PageToggle({ pages }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "20vh",
        width: "250vh",

      }}
    >
        <Text>Swap</Text>
        <Text>Pool</Text>
    </div>
  );
}


const Text = styled.text`
    /*  */
`
