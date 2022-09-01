import React from "react";
import styled, { css } from "styled-components";
import Effect from "./Effect";

export default function Details({ className, details }) {
  return (
    <Container className={className}>
      <Items>
        {details.length && details.length > 0
          ? details.map((d) => {
              return (
                <Item key={d.title}>
                  <Effect
                    title={d.title}
                    val={d.val}
                    hasToolTip={d.hasToolTip}
                  ></Effect>
                </Item>
              );
            })
          : null}
      </Items>
    </Container>
  );
}

const Container = styled.div`
  background: rgba(13, 18, 39, 0.75);
  padding-top: 30px;
  padding-bottom: 30px;
  border-radius: 10px;
`;

const Items = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 20%);
  row-gap: 30px;
  justify-content: center;
`;

const Item = styled.div`
  display: flex;
  flex-direction: column;
`;
const Text = styled.text`
  //
`;
