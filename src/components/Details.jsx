import React from "react";
import styled, { css } from "styled-components";
import Effect from "./Effect";

export default function Details({ className, details, governPage }) {
  return (
    <Container
      className={className}
    >
      <Items
      governPage={governPage}
      >
        {details.length && details.length > 0 ?
        details.map((d) => {
            return (
                <Item key={d.title}>
                  <Effect
                    title={d.title}
                    val={d.val}
                    hasToolTip={d.hasToolTip} rewards={d.rewards}
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
  background: #0E1834;
  padding-top: 30px;
  padding-bottom: 30px;
  border: 1px solid white;
  border-radius: 10px;
`;

const Items = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 22%);
  row-gap: 30px;
  justify-content: center;
    ${(props) =>
    props.governPage === true && css`
    column-gap: 2%;
    `}
`;

const Item = styled.div`
  display: flex;
  flex-direction: column;
`;
const Text = styled.text`
  //
`;
