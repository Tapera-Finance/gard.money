import React, { useReducer, useState } from 'react'
import styled, { css } from 'styled-components'
import chevron from '../assets/chevron_black.png'
import swapIcon from '../assets/icons/swapExpanded_icon.png'
import Modal from './Modal'
import PrimaryButton from './PrimaryButton'
import TransactionSummary from './TransactionSummary'

/**
 * Content for Swap option in drawer
 */
export default function SwapContent() {
  const [modalVisible, setModalVisible] = useState(false)
  const [modalCanAnimate, setModalCanAnimate] = useState(false)
  const [transaction, setTransaction] = useState([])
  return (
    <div style={{ marginBottom: 50 }}>
      {titles.map((value, index) => {
        return (
          <Section
            title={value.title}
            transactionCallback={(transaction) => {
              setModalCanAnimate(true)
              setTransaction([
                {
                  title: 'You are offering',
                  value: `${transaction.offering.amount} $${transaction.offering.from}`,
                },
                {
                  title: 'You are receiving',
                  value: `${transaction.receiving.amount} $${transaction.receiving.to}`,
                },
                {
                  title: 'Fee',
                  value: '$0.001',
                },
              ])
              setModalVisible(true)
            }}
          />
        )
      })}
      <Modal
        title="Are you sure you want to proceed?"
        subtitle="Review the details of this transaction to the right and click “Confirm Transaction” to proceed."
        visible={modalVisible}
        animate={modalCanAnimate}
        close={() => setModalVisible(false)}
      >
        <TransactionSummary
          specifics={transaction}
          cancelCallback={() => setModalVisible(false)}
        />
      </Modal>
    </div>
  )
}

/**
 * The expandable section in swap content
 * @prop {string} title - Section title to be displayed on top
 * @prop {function} transactionCallback - Callback function for when a transaction is executed
 */
function Section({ title, transactionCallback }) {
  const [expanded, setExpanded] = useState(false)
  const [transaction, reduceTransaction] = useReducer(
    (state, action) => {
      switch (action.type) {
        case 'offering-amount':
          return {
            ...state,
            offering: {
              ...state.offering,
              amount: action.value,
            },
          }
        case 'offering-from':
          return {
            ...state,
            offering: {
              ...state.offering,
              from: action.value,
            },
          }
        case 'receiving-amount':
          return {
            ...state,
            receiving: {
              ...state.receiving,
              amount: action.value,
            },
          }
        case 'receiving-to':
          return {
            ...state,
            receiving: {
              ...state.receiving,
              to: action.value,
            },
          }
      }
    },
    {
      offering: {
        amount: '',
        from: 'ALGO',
      },
      receiving: {
        amount: '',
        to: 'GARD',
      },
    },
  )

  return (
    <div style={{ marginBottom: 10 }}>
      <SectionButton
        onClick={() => {
          setExpanded(!expanded)
        }}
      >
        <TitleContainer
          expanded={expanded}
          style={{ paddingTop: 44, paddingLeft: 16 }}
        >
          <div style={{ marginRight: 8 }}>
            <img
              src={chevron}
              style={expanded ? { transform: 'rotate(90deg)' } : {}}
            />
          </div>
          <div>
            <TitleText>{title}</TitleText>
          </div>
        </TitleContainer>
        <RelationsContainer>
          <div style={{ flex: 1 }}>
            <RelationsSpecificsContainer
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div>
                <RelationsTitle>ALGO/GARD</RelationsTitle>
              </div>
            </RelationsSpecificsContainer>
            <RelationsSpecificsContainer
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div>
                <RelationsValue>1.1</RelationsValue>
              </div>
            </RelationsSpecificsContainer>
          </div>
          <div style={{ flex: 1 }}>
            <RelationsSpecificsContainer
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div>
                <RelationsTitle>Tether/GARD</RelationsTitle>
              </div>
            </RelationsSpecificsContainer>
            <RelationsSpecificsContainer
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div>
                <RelationsValue>1.1</RelationsValue>
              </div>
            </RelationsSpecificsContainer>
          </div>
          <div style={{ flex: 1 }}>
            <RelationsSpecificsContainer
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div>
                <RelationsTitle>USDC/GARD</RelationsTitle>
              </div>
            </RelationsSpecificsContainer>
            <RelationsSpecificsContainer
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div>
                <RelationsValue>1.1</RelationsValue>
              </div>
            </RelationsSpecificsContainer>
          </div>
        </RelationsContainer>
      </SectionButton>
      {expanded ? (
        <ExpandedContainer
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              height: 93,
              paddingTop: 21,
              display: 'flex',
              flexDirection: 'row',
              flex: 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                flex: 3,
                justifyContent: 'space-between',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 8 }}>
                  <InputTitle>From</InputTitle>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Select
                    value={transaction.offering.from}
                    onChange={(e) =>
                      reduceTransaction({
                        type: 'offering-from',
                        value: e.target.value,
                      })
                    }
                  >
                    <option>ALGO</option>
                    <option>GARD</option>
                    <option>Tether</option>
                    <option>USDC</option>
                  </Select>
                </div>
                <div>
                  <InputTitle>Balance: 123.4</InputTitle>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 8 }}>
                  <InputTitle>Amount</InputTitle>
                </div>
                <div>
                  <Input
                    value={transaction.offering.amount}
                    onChange={(e) =>
                      reduceTransaction({
                        type: 'offering-amount',
                        value: e.target.value,
                      })
                    }
                    placeholder={'Max 123.4'}
                  />
                </div>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img src={swapIcon} />
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                flex: 3,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 8 }}>
                  <InputTitle>Top</InputTitle>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Select
                    value={transaction.receiving.to}
                    onChange={(e) =>
                      reduceTransaction({
                        type: 'receiving-to',
                        value: e.target.value,
                      })
                    }
                  >
                    <option>GARD</option>
                    <option>ALGO</option>
                    <option>Tether</option>
                    <option>USDC</option>
                  </Select>
                </div>
                <div>
                  <InputTitle>Balance: 123.4</InputTitle>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 8 }}>
                  <InputTitle>Amount</InputTitle>
                </div>
                <div>
                  <Input
                    value={transaction.receiving.amount}
                    onChange={(e) =>
                      reduceTransaction({
                        type: 'receiving-amount',
                        value: e.target.value,
                      })
                    }
                    placeholder={'Max 123.4'}
                  />
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginBottom: 35 }}>
            <PrimaryButton
              text={'Execute Transaction'}
              onClick={() => transactionCallback(transaction)}
            />
          </div>
        </ExpandedContainer>
      ) : (
        <></>
      )}
    </div>
  )
}

// Styled Components
const TitleContainer = styled.div`
  background: #f4ebff;
  border-radius: 6px;
  flex: 2;
  display: flex;
  flex-direction: row;
  ${(props) =>
    props.expanded &&
    css`
      background: #fcfcfd;
    `}
`

const SectionButton = styled.div`
  height: 96px;
  cursor: pointer;
  display: flex;
  flex-direction: row;
`

const RelationsContainer = styled.div`
  flex: 3;
  display: flex;
  flex-direction: row;
`
const TitleText = styled.text`
  font-weight: 500;
  font-size: 20px;
`
const RelationsSpecificsContainer = styled.div`
  border-bottom: 1px solid #f9f9f9;
  height: 48px;
`
const RelationsTitle = styled.text`
  font-weight: bold;
  font-size: 14px;
`
const RelationsValue = styled.text`
  font-weight: 500;
  font-size: 14px;
`
const ExpandedContainer = styled.div`
  height: 207px;
  background: #f4ebff;
  padding: 0px 3vw;
`
const InputTitle = styled.text`
  font-weight: normal;
  font-size: 14px;
  color: #7a7a7a;
`
const Select = styled.select`
  height: 40px;
  background: #ffffff;
  border: 1px solid #dce1e6;
  border-radius: 4px;
  width: 11.5972222222222vw;
  padding: 0px 0px 0px 12px;
`
const Input = styled.input`
  height: 40px;
  background: #ffffff;
  border: 1px solid #dce1e6;
  border-radius: 4px;
  width: 11.5972222222222vw;
  padding: 0px 0px 0px 12px;
`

// Titles of each section
const titles = [
  {
    title: 'Algofi',
  },
  {
    title: 'Tinyman',
  },
  {
    title: 'Yieldly',
  },
  {
    title: 'HumbleSwap',
  },
]
