import React from "react";
import styled from "styled-components";
import Select from "./Select";
import InputField from "./InputField";
import Effect from "./Effect";
import chevronDown from "../assets/chevron_down.png";

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
  selectVal,
  inputVal,
  effect,
  onOptionSelect,
  onInputChange,
  balances,
}) {
  return (
    <div>
      <div>
        {type === 0 ? (
          <div>
            <Span htmlFor={ids[0]}>You Put Up</Span>
            <Container>
              <SelectContainer>
                <ExchangeSelect
                  id={ids[0]}
                  options={assets}
                  value={selectVal}
                  callback={onOptionSelect}
                />
                <Arrow src={chevronDown}></Arrow>
              </SelectContainer>
              <Text>{`You have
              ${
                balances[
                  balances["assetA"].type === assets[0]
                    ? ["assetA"]
                    : ["assetB"]
                ].amount
              } to offer`}</Text>
              <InputContainer>
                <ExchangeInput
                  id={ids[1]}
                  placeholder="0.00"
                  value={inputVal}
                  callback={onInputChange}
                />
                <DollarEffect title="Value: " val={effect} />
              </InputContainer>
            </Container>
          </div>
        ) : (
          <div>
            <Span htmlFor={ids[0]}>You'll Receive</Span>
            <Container>
              <SelectContainer>
                <ExchangeSelect
                  id={ids[0]}
                  options={assets}
                  value={selectVal}
                  callback={onOptionSelect}
                />
                <Arrow src={chevronDown}></Arrow>
              </SelectContainer>
              <Text>
                {
                  `You have
              ${
                balances[
                  ["assetB"].type === assets[1] ? ["assetA"] : ["assetB"]
                ].amount
              } already`
                }
              </Text>
              <InputContainer>
                <ExchangeInput
                  id={ids[1]}
                  placeholder="0.00"
                  value={inputVal}
                  callback={onInputChange}
                />
                <DollarEffect title="Value: " val={effect} />
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

const Text = styled.text`
  font-size: 10pt;
  align-self: flex-end;
`;

const DollarEffect = styled(Effect)`
  color: #999696;
  scale: 0.8;
  display: unset;
  flex-direction: initial;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

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
      filter: sepia(0%) saturate(7430%) hue-rotate(104deg) brightness(118%)
        contrast(88%);
    }
    select + img {
      color: #ffffff;
      transform: unset;
      filter: sepia(0%) saturate(7430%) hue-rotate(104deg) brightness(118%)
        contrast(88%);
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
  }
`;

const Span = styled.label`
  font-size: 10px;
  color: #ffffff;
  margin-left: 15px;
  margin-bottom: -20px;
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
