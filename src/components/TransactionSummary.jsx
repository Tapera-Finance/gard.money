import React from 'react'
import styled, {css} from 'styled-components'
import PrimaryButton from './PrimaryButton'

/**
 * @prop {Specifics[]} specifics - List of concepts and their values to be shown inside the transaction
 * @prop {React.ReactNode} children - Extra content for the transaction. Is added on top of specifics
 * @param {{specifics: Specifics[], children: React.ReactNode}} props
 */
export default function TransactionSummary({
  specifics,
  transactionFunc,
  children,
  cancelCallback,
  darkToggle,
  commit,
}) {
  return (
    <div style={{}}>
      <div style={{ marginLeft: 16, marginBottom: 8 }}>
        <TTitle darkToggle={darkToggle}>Transaction Summary</TTitle>
      </div>
      <SpecificsContainer>
        {children}
        {specifics.map((value, index) => {
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: window.innerWidth < 900 ? 'column' : 'row',
                marginTop: 20,
                marginBottom: 20,
                justifyContent: 'space-between',
              }}
            >
              <div>
                <SpecificsTitle>{value.title}</SpecificsTitle>
              </div>
              <div>
                <SpecificsValue>{value.value}</SpecificsValue>
              </div>
            </div>
          )
        })}
        {commit !== undefined && commit !== null ? <div
          style={{
            display: 'flex',
            flexDirection: window.innerWidth < 900 ? 'column' : 'row',
            marginTop: 20,
            marginBottom: 20,
            justifyContent: 'space-between',
          }}
        >
          <div>
            <SpecificsTitle>Collateral Balance Commited</SpecificsTitle>
          </div>
          <div>
            <SpecificsValue>{commit === false ? 'No' : 'Yes'}</SpecificsValue>
          </div>
        </div> : <div></div>}
      </SpecificsContainer>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <PrimaryButton
          text="Confirm Transaction"
          onClick={() => {
            transactionFunc()
          }}
        />
        <CancelButton
          style={{ marginLeft: 30 }}
          onClick={() => cancelCallback()}
        >
          <CancelButtonText darkToggle={darkToggle}>Cancel</CancelButtonText>
        </CancelButton>
      </div>
    </div>
  )
}

// styled components
const SpecificsContainer = styled.div`
  border: solid;
  border-width: 1px 0px;
  margin-bottom: 32px;
  padding: 0px 0px 0px 0px;
`
const TTitle = styled.text`
  font-weight: normal;
  font-size: 14px;
  color: #7a7a7a;
  ${(props) =>
    props.darkToggle &&
    css`
      color: white;
  `}
`
const CancelButton = styled.button`
  border: 0px;
  background: transparent;
  display: flex;
  align-items: center;
  height: '100%';
  cursor: pointer;
`
const CancelButtonText = styled.text`
  font-weight: 500;
  font-size: 16px;
  ${(props) =>
    props.darkToggle &&
    css`
      color: white;
  `}
`
const SpecificsTitle = styled.text`
  font-weight: normal;
  font-size: 16px;
`
const SpecificsValue = styled.text`
  font-weight: bold;
  font-size: 16px;
`

/**
 * @typedef {object} Specifics
 * @prop {string} title - Left side concept inside the transaction
 * @prop {string} value - Right side value inside the transaction
 */
