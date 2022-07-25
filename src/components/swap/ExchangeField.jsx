import React, { useState } from "react";
import styled, { css } from "styled-components";
import {
  calcTransResult,
  handleExchange,
  targetPool,
} from "./swapHelpers";
import Select from "./Select";
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
  type,
  transaction,
  assets,
  transactionCallback,
  balances,
  totals,
}) {

  return (
    <div>
      <div >
        {type === 0 ? (
          <Container>
            <div style={{ marginBottom: 8 }}>
              <Select
                options={assets}
                transaction={transaction}
                value={transaction.offering.from}
                transactionCallback={transactionCallback}
              />
              <Arrow
              src={chevron}
            />
            </div>
            <InputTitle>
              {transaction.offering.from === "ALGO"
                ? "Balance: " + balances[0]
                : "Balance: " + balances[1]}
            </InputTitle>
            <Input
              id="left"
              type="number"
              min="0"
              step="0.00"
              value={transaction.offering.amount}
              onChange={(e) => {
                // e.target.value.replace(/\D+/g, "");
                console.log(e.target.value);
                e.preventDefault()
                if (e.target.value !== "") {
                  handleExchange(
                    "receiving-amount",
                    parseFloat(e.target.value),
                    assets,
                    calcTransResult,
                    [
                      totals[
                        targetPool(
                          transaction.offering.from,
                          transaction.receiving.to,
                        )
                      ][transaction.offering.from.toLowerCase()],

                      totals[
                        targetPool(
                          transaction.offering.from,
                          transaction.receiving.to,
                        )
                      ][transaction.receiving.to.toLowerCase()],
                    ],
                    transaction,
                    transactionCallback,
                  );
                } else {
                  transactionCallback({
                    type: "clear",
                  });
                }
              }}
            />
          </Container>
        ) : (
          <Container>
            <div style={{ marginBottom: 8 }}>
            <Select
                value={transaction.receiving.to}
                options={assets}
                transaction={transaction}
                transactionCallback={transactionCallback}
              />

            </div>

            <InputTitle>
              {transaction.receiving.to == "ALGO"
                ? "Balance: " + balances[0]
                : "Balance: " + balances[1]}
            </InputTitle>
            <Input
              id="right"
              type="number"
              min={0}
              value={transaction.receiving.amount}
              onChange={(e) => {
                // e.target.value.replace(/\D+/g, "");
                if (e.target.value !== "") {
                e.preventDefault()
                console.log(e.target.value);
                handleExchange(
                  "offering-amount",
                  parseFloat(e.target.value),
                  assets,
                  calcTransResult,
                  [
                    totals[
                      targetPool(
                        transaction.offering.from,
                        transaction.receiving.to,
                      )
                    ][transaction.receiving.to.toLowerCase()],
                    totals[
                      targetPool(
                        transaction.offering.from,
                        transaction.receiving.to,
                      )
                    ][transaction.offering.from.toLowerCase()],
                  ],
                  transaction,
                  transactionCallback,
                  true
                );

                } else {
                  transactionCallback({
                    type: "clear"
                  })
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
  background: #0d1227;
  width: 28vw;
  height: 16vh;
  border-radius: 8px;
  opacity: 65%;
`

const InputTitle = styled.text`
  /*  */
`;

const Input = styled.input`
  appearance: none;
  text-decoration: underline;
`;

const Arrow = styled.img`
  filter: invert(38%) sepia(82%) saturate(1518%) hue-rotate(181deg) brightness(104%) contrast(106%);
  transform: rotate(90deg);
`
