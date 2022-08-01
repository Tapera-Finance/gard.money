import React, { useState } from "react";
import styled, { css } from "styled-components";
import {
  calcTransResult,
  handleExchange,
  targetPool,
} from "./swapHelpers";
import Select from "./Select";
import InputField from "./InputField";
import { formatToDollars } from "../../utils";
import chevron from "../../assets/chevron_black.png";



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
  onOptionSelect,
  onInputChange,
  balances,
  totals,
}) {

  return (
    <div>
      <div >
        {type === 0 ? (
          <Container>

            {/* <Arrow
              src={chevron}
              // onClick={() => {
              //   let el = document.querySelector(".left")
              //   el.
              // }}
            /> */}
            <SelectContainer>
            <Span for={ids[0]}>Select Asset</Span>
              <Select
                id={ids[0]}
                options={assets}

                // value={transaction.offering.from}
                callback={onOptionSelect}
              />
              </SelectContainer>


            <InputTitle>
              {/* {transaction.offering.from === "ALGO"
                ? "Balance: " + balances[0]
                : "Balance: " + balances[1]} */}
            </InputTitle>

            <InputField
              id={ids[1]}
              type="number"
              min="0"
              step="0.00"
              // value={transaction.offering.amount}
              onChange={onInputChange}

                // (e) => {
                // e.target.value.replace(/\D+/g, "");
                // console.log(e.target.value);
                // e.preventDefault()
                // if (e.target.value !== "") {
                //   handleExchange(
                //     "receiving-amount",
                //     parseFloat(e.target.value),
                //     assets,
                //     calcTransResult,
                //     [
                //       totals[
                //         targetPool(
                //           transaction.offering.from,
                //           transaction.receiving.to,
                //         )
                //       ][transaction.offering.from.toLowerCase()],

                //       totals[
                //         targetPool(
                //           transaction.offering.from,
                //           transaction.receiving.to,
                //         )
                //       ][transaction.receiving.to.toLowerCase()],
                //     ],
                //     transaction,
                //     transactionCallback,
                //   );
                // } else {
                //   transactionCallback({
                //     type: "clear",
                //   });
              //   }
              // }

            />
          </Container>
        ) : (
          <Container>

            {/* <Arrow
              src={chevron}
            /> */}
            <SelectContainer>
             <Span for={ids[0]}>Select Asset</Span>
            <Select
                // value={transaction.receiving.to}
                id={ids[0]}
                options={assets}
                callback={onOptionSelect}

              />
            </SelectContainer>


            <InputTitle>
              {/* {transaction.receiving.to == "ALGO"
                ? "Balance: " + balances[0]
                : "Balance: " + balances[1]} */}
            </InputTitle>

            <InputField
              id={ids[1]}
              type="number"
              min={0}
              // value={transaction.receiving.amount}
              onChange={(e) => {
                // e.target.value.replace(/\D+/g, "");
                if (e.target.value !== "") {
                // e.preventDefault()
                // console.log(e.target.value);
                // handleExchange(
                //   "offering-amount",
                //   parseFloat(e.target.value),
                //   assets,
                //   calcTransResult,
                //   [
                //     totals[
                //       targetPool(
                //         transaction.offering.from,
                //         transaction.receiving.to,
                //       )
                //     ][transaction.receiving.to.toLowerCase()],
                //     totals[
                //       targetPool(
                //         transaction.offering.from,
                //         transaction.receiving.to,
                //       )
                //     ][transaction.offering.from.toLowerCase()],
                //   ],
                //   transaction,
                //   transactionCallback,
                //   true
                // );

                // } else {
                //   transactionCallback({
                //     type: "clear"
                //   })
                }
              }}
            />
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
`

const InputTitle = styled.text`
  /*  */
`;

const SelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  /* justify-content: space-between; */
  align-items: center;
  width: max-content;
`

const Span = styled.label`
  font-size: 8px;
  color: #999696;

`


const Arrow = styled.img`
  filter: invert(38%) sepia(82%) saturate(1518%) hue-rotate(181deg) brightness(104%) contrast(106%);
  transform: rotate(90deg);
`
