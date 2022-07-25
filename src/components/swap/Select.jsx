import React, { useState } from "react";
import styled, { css } from "styled-components";

export function toggleSelect(val, other, type1, type2, assets, reducer) {
  if (val === assets[0] && other === assets[1]) {
    reducer({
      type: type1,
      value: assets[0],
    });

    reducer({
      type: type2,
      value: assets[1],
    });
    return;
  }
  if (val === assets[1] && other === assets[0]) {
    reducer({
      type: type1,
      value: assets[1],
    });
    reducer({
      type: type2,
      value: assets[0],
    });
    return;
  }
}

export default function Select({
  value,
  options,
  transaction,
  transactionCallback,
}) {
  return (
    <Dropdown
      transaction={transaction}
      value={value}
      onChange={(e) => {
        toggleSelect(
          e.target.value,
          value,
          "offering-from",
          "receiving-to",
          options,
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
      {options.length > 0 ? (
        options.map((opt, idx) => {
          return <option key={idx}>{opt}</option>;
        })
      ) : (
        <option>Select</option>
      )}
    </Dropdown>
  );
}

const Dropdown = styled.select`
  background: #0d1227;
  color: #01d1ff;
  border: 1px transparent;
  border-radius: 4px;
  width: 11.5972222222222vw;
  padding: 0px 0px 0px 12px;
  appearance: none;
  display: block;
  font-family: inherit;
  font-size: 140%;
  margin: 0;
  box-sizing: border-box;
  width: 30%;
  height: 30%;
  padding: 5px;
`;
