import React, { createRef } from "react";
import styled, { css } from "styled-components";
import Select from "./Select";
import InputField from "./InputField";
import Effect from "./Effect";
import chevronDown from "../assets/chevron_down.png"


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
  const optionSelectRef = createRef();
  const optionSelectRef2 = createRef()
  return (
    <div>
      <div>
        {type === 0 ? (
          <div>
              <Span for={ids[0]}>You Put Up</Span>
          <Container>
            <SelectContainer  >
              <ExchangeSelect id={ids[0]} options={assets} callback={onOptionSelect} ref={optionSelectRef}/>
              <Arrow src={chevronDown} onClick={() => {
                optionSelectRef.focus()
              }} ></Arrow>
            </SelectContainer>


            <InputContainer>
            <ExchangeInput
              id={ids[1]}
              type="number"
              min={0}
              placeholder="0.00"
              callback={onInputChange}
            />
            <DollarEffect title={effect.title} val={effect.val} />
            </InputContainer>
          </Container>
          </div>
        ) : (
          <div>
              <Span for={ids[0]}>You'll Receive</Span>
          <Container>
            <SelectContainer>
              <ExchangeSelect id={ids[0]} options={assets} callback={onOptionSelect} ref={optionSelectRef2}/>
              <Arrow src={chevronDown} onClick={() => {
                optionSelectRef2.current?.focus()
              }}  ></Arrow>
            </SelectContainer>
            <InputContainer>
            <ExchangeInput
              id={ids[1]}
              type="number"
              min={0}
              placeholder="0.00"
              callback={onInputChange}
              />
            <DollarEffect title={effect.title} val={effect.val} />
              </InputContainer>
          </Container>
          </div>
        )}
      </div>
    </div>
  );
}

const Container = styled.div`
  display: flex;
  background: #0d122788;
  justify-content: space-between;
  height: 12vh;
  width: 30vw;
  border-radius: 8px;
`;

const InputTitle = styled.text`
  /*  */
`;

const DollarEffect = styled(Effect)`
  color: #999696;
  scale: .8;
  display: unset;
  flex-direction: initial;

`

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const ExchangeInput = styled(InputField)`
  width: 8vw;
  height: 4vh;
  border: 1px transparent;
  text-decoration-color: #6430ff;
  text-decoration-thickness: 2px;
  font-size: 14pt;
  color: #ffffff;
  text-align: center;
  background: #0d122710;
  margin: 10px 10px 10px 10px;

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
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: max-content;
  &:hover {
    img:only-of-type {
      color: #ffffff;
      transform: unset;
      filter: sepia(0%) saturate(7430%) hue-rotate(104deg) brightness(118%) contrast(88%);
    }
    select + img {
      color: #ffffff;
      transform: unset;
      filter: sepia(0%) saturate(7430%) hue-rotate(104deg) brightness(118%) contrast(88%);
    }
  }
`;

const ExchangeSelect = styled(Select)`
  font-size: 14pt;
  margin: 0px 0px 0px 12px;
  &:focus {
    color: #ffffff;
  }
  &:visited {
    color: #ffffff;
  }
  &:active {
    color: #ffffff;
  }
  &:hover {
    color: #ffffff;
    /* border: 1px solid #01d1ff; */
  }
`

const Span = styled.label`
  font-size: 10px;
  color: #ffffff;
  margin-left: 15px;
  margin-bottom: -20px;
  /* margin-bottom: */
`;

const Arrow = styled.img`
  filter: invert(38%) sepia(82%) saturate(1518%) hue-rotate(181deg)
    brightness(104%) contrast(106%);
    transform: rotate(270deg);

  &:hover {
    color: #ffffff;
    transform: unset;
  }
`;
