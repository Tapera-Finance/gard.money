import React from "react";
import styled, { css } from "styled-components";
import Effect from "./Effect";

export default function Details({ className, details }) {
  return (
    <Container
      className={className}
    >
      <Items
      >
        {details.length && details.length > 0 ?
        details.map((d) => {
            return (
                <Item>
                    <Effect title={d.title} val={d.val} hasToolTip={d.hasToolTip}></Effect>
                </Item>
            )
        })
        : null
    }
      </Items>
    </Container>
  );
}

const Container = styled.div`
  background: rgba(13, 18, 39, 0.75);
  padding-top: 30;
  padding-bottom: 30;
  border-radius: 10;
`;

const Items = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 20%);
    row-gap: 30;
    justify-content: center;
`

const Item = styled.div`
    display: flex;
    flex-direction: column;
`
const Text = styled.text`
    //
`
