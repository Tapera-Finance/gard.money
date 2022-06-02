import React, { useState } from 'react'
import styled from 'styled-components'
import PrimaryButton from './PrimaryButton'

export default function RadioButtonSet({ titles, selected, callback }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      {titles.map((value, index) => {
        return (
          <div>
            {value === selected ? (
              <PrimaryButton text={value} />
            ) : (
              <InactiveRadio
                onClick={() => {
                  callback(value)
                }}
              >
                <InactiveRadioText>{value}</InactiveRadioText>
              </InactiveRadio>
            )}
          </div>
        )
      })}
    </div>
  )
}

const InactiveRadio = styled.button`
  background-color: transparent;
  padding: 8px 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 6px;
`

const InactiveRadioText = styled.text`
  color: #98a2b3;
  font-weight: 500;
  font-size: 16px;
`
