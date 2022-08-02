import React, { useState } from "react";
import styled, { css } from "styled-components";
import Select from "./Select";
import InputField from "./InputField";
import Effect from "./Effect";


// entire container for currency select, input field, text for displaying vals

/**
 *
 * @param {transaction} transaction
 * @param {assets[]} assets array of assets to pass to toggle
 * @returns
 */

export default function ExchangeField({
  ids,
  type,
  assets,
  effect,
  onOptionSelect,
  onInputChange,
}) {
  return (
    <div>
      <div>
        {type === 0 ? (
          <Container>
            <SelectContainer>
              <Span for={ids[0]}>Select Asset</Span>
              <Select id={ids[0]} options={assets} callback={onOptionSelect} />
            </SelectContainer>

            <InputTitle></InputTitle>

            <ExchangeInput
              id={ids[1]}
              type="number"
              min={0}
              placeholder="0.00"
              callback={onInputChange}
            />
            <Effect title={effect.title} val={effect.val} />
          </Container>
        ) : (
          <Container>
            <SelectContainer>
              <Span for={ids[0]}>Select Asset</Span>
              <Select id={ids[0]} options={assets} callback={onOptionSelect} />
            </SelectContainer>

            <ExchangeInput
              id={ids[1]}
              type="number"
              min={0}
              placeholder="0.00"
              callback={onInputChange}
            />
            <Effect title={effect.title} val={effect.val} />
          </Container>
        )}
      </div>
    </div>
  );
}

const Container = styled.div`
  display: flex;
  background: #0d1227;
  /* width: 28vw;
  height: 16vh; */
  height: 16vh;
  width: 28vw;
  border-radius: 8px;
  opacity: 65%;
`;

const InputTitle = styled.text`
  /*  */
`;

const ExchangeInput = styled(InputField)`
  &:active {
    color: #999696;
    background: #e8e8e8;
  }
  &:focus {
    color: #999696;
    background: #e8e8e8;
    text-decoration: none;
  }
`;

const SelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  /* justify-content: space-between; */
  align-items: center;
  width: max-content;
`;

const Span = styled.label`
  font-size: 8px;
  color: #999696;
`;

const Arrow = styled.img`
  filter: invert(38%) sepia(82%) saturate(1518%) hue-rotate(181deg)
    brightness(104%) contrast(106%);
  transform: rotate(90deg);
`;
