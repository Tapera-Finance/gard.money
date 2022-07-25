import { Container } from "@mui/system";
import React, { useState } from "react";
import styled, { css } from "styled-components";
import {
  calcTransResult,
  toggleSelect,
  handleExchange,
  targetPool,
} from "./swapHelpers";
import { estimateReturn } from "../../transactions/swap";

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
      <Container>
        {type === 0 ? (
          <div>
            <div style={{ marginBottom: 8 }}>
              <Select
                value={transaction.offering.from}
                onChange={(e) => {
                  toggleSelect(
                    e.target.value,
                    transaction.offering.from,
                    "offering-from",
                    "receiving-to",
                    assets,
                    transactionCallback,
                  );
                  transactionCallback({
                    type: "offering-amount",
                    value: transaction.receiving.amount,
                  });
                  transactionCallback({
                    type: "receiving-amount",
                    value: transaction.offering.amount,
                  });
                }}
              >
                <option>ALGO</option>
                <option>GARD</option>
              </Select>
            </div>
            <InputTitle>
              {transaction.offering.from === "ALGO"
                ? "Balance: " + balances[0]
                : "Balance: " + balances[1]}
            </InputTitle>
            <Input
              type="number"
              min="0"
              step="0.00"
              value={transaction.offering.amount}
              onChange={(e) => {
                e.target.value.replace(/\D+/g, "");
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
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 8 }}>
              <Select
                value={transaction.receiving.to}
                onChange={(e) => {
                  toggleSelect(
                    e.target.value,
                    transaction.offering.from,
                    "receiving-to",
                    "offering-from",
                    assets,
                    transactionCallback,
                  );
                  transactionCallback({
                    type: "offering-amount",
                    value: transaction.receiving.amount,
                  });
                  transactionCallback({
                    type: "receiving-amount",
                    value: transaction.offering.amount,
                  });
                }}
              >
                <option>GARD</option>
                <option>ALGO</option>
              </Select>
            </div>

            <InputTitle>
              {transaction.receiving.to == "ALGO"
                ? "Balance: " + balances[0]
                : "Balance: " + balances[1]}
            </InputTitle>
            <Input
              type="number"
              min={0}
              value={transaction.receiving.amount}
              onChange={(e) => {
                e.target.value.replace(/\D+/g, "");
                handleExchange(
                  "offering-amount",
                  parseFloat(e.target.value),
                  assets,
                  estimateReturn,
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
                );
              }}
              disabled={true}
            />
          </div>
        )}
      </Container>
    </div>
  );
}

const InputTitle = styled.text`
  /*  */
`;
const Select = styled.select`
  /*  */
`;

const Input = styled.input`
  /*  */
`;
