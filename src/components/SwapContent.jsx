import React, { useReducer, useState, useContext } from 'react'
import styled, { css } from 'styled-components'
import chevron from '../assets/chevron_black.png'
import swapIcon from '../assets/icons/swapExpanded_icon.png'
import Modal from './Modal'
import PrimaryButton from './PrimaryButton'
import TransactionSummary from './TransactionSummary'
import { gainID, gardID, gardianID, pactGARDID, pactAlgoGardPoolAddress } from '../transactions/ids'
import {ThemeContext} from '../contexts/ThemeContext'
import { swapAlgoToGard, estimateReturn, queryAndConvertTotals } from '../transactions/swap'
import { useEffect } from 'react'


const mAlgosToAlgos = (num) => {
    return num / 1000000;
  }
const algosToMAlgos = (num) => {
    return num * 1000000;
  }
const mGardToGard = (num) => {
  return num / 1000000;
}
const gardToMGard = (num) => {
  return parseFloat(num * 1000000).toFixed(3)
}

const exchangeRatioAssetXtoAssetY = (assetX, assetY) => {
  return parseFloat(assetX / assetY).toFixed(4);
}

function calcTransResult(amount, totalX, totalY,transaction) {
  if (transaction) {
    if (transaction.offering.from === "ALGO" && transaction.receiving.to === "GARD") {
      if (amount > 0) {
        let receivedAmount = estimateReturn(parseFloat(amount), totalX, totalY, 0.003);
        return receivedAmount
      }
    }
    // TODO: else if from === gard && to === algo, estimate return but flip X & Y
  }
}


/**
 * Content for Swap option in drawer
 */
export default function SwapContent() {
  const [modalVisible, setModalVisible] = useState(false)
  const [modalCanAnimate, setModalCanAnimate] = useState(false)
  const [transaction, setTransaction] = useState([])
  const {theme} = useContext(ThemeContext);

  return (
    <div style={{ marginBottom: 50 }}>
      {titles.map((value, index) => {
        return (
          <Section
            title={value.title}
            darkToggle={theme === 'dark'}
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
          transactionFunc={async () => {
            // TODO: send transaction to blockchain
          }}
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
  const [totals, setTotals] = useState(null)
  const [algoToGardRatio, setAlgoToGardRatio] = useState(1.1)
  const [receivedValue, setReceivedValue] = useState(0)
  const {theme} = useContext(ThemeContext)

  useEffect(() => {
    let res = calcTransResult(transaction);
    setReceivedValue(res)
    console.log(transaction)
    return () => {
      console.log('unmounting')
    }
  }, [])

  useEffect(async () => {
    const resultsOfQuery = await queryAndConvertTotals();
      setTotals(resultsOfQuery)
    let ratio = exchangeRatioAssetXtoAssetY(mAlgosToAlgos(resultsOfQuery.algo), mGardToGard(resultsOfQuery.gard));
    if (ratio) {
      setAlgoToGardRatio(ratio)
    }
    return () => {
      console.log(ratio);
    }
  }, [])

  const [transaction, reduceTransaction] = useReducer(
    (state, action) => {
      switch (action.type) {
        case 'offering-amount':
          console.log("offering amount state -> ", state);
          console.log("offering amount action -> ", action);
          return {
            ...state,
            offering: {
              ...state.offering,
              amount: action.value,
            },
          }
        case 'offering-from':
          console.log("offering from state -> ", state)
          console.log("offering from action -> ", action);

          return {
            ...state,
            offering: {
              ...state.offering,
              from: action.value,
            },
          }
        case 'receiving-amount':
          console.log("receiving amount state -> ", state);
          console.log("receiving amount action -> ", action);
          return {
            ...state,
            receiving: {
              ...state.receiving,
              amount: action.value,
            },
          }
        case 'receiving-to':
          console.log("receiving to state -> ", state);
          console.log("receiving to action -> ", action);
          calcTransResult(state)
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
        darkToggle={theme === 'dark'}
        onClick={() => {
          setExpanded(!expanded)
        }}
      >
        <TitleContainer
          expanded={expanded}
          style={{ paddingTop: 44, paddingLeft: 16 }}
          darkToggle={theme === 'dark'}
        >
          <div style={{ marginRight: 8 }}>
            <Image
              src={chevron}
              style={expanded ? { transform: 'rotate(90deg)', background: ''} : {}}
              darkToggle={theme === 'dark'}
            />
          </div>
          <div>
            <TitleText darkToggle={theme === 'dark'} >{title}</TitleText>
          </div>
        </TitleContainer>
        <RelationsContainer>
          <div style={{ flex: 1 }}
          darkToggle={theme === 'dark'}
          >

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

                <RelationsValue> {algoToGardRatio !== null ? algoToGardRatio : 1.1 }
                  </RelationsValue>
              </div>
            </RelationsSpecificsContainer>
          </div>
          {/* <div style={{ flex: 1 }}>
            <RelationsSpecificsContainer
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            > */}
              {/* <div>
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
          </div> */}
          {/* <div style={{ flex: 1 }}>
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
          </div> */}
        </RelationsContainer>
      </SectionButton>
      {expanded ? (
        <ExpandedContainer
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
          darkToggle={theme === 'dark'}
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
                    onChange={(e) => {
                      reduceTransaction({
                        type: 'offering-from',
                        value: e.target.value,
                      })
                    }
                    }
                    darkToggle={theme === 'dark'}
                  >
                    <option>ALGO</option>
                    <option>GARD</option>
                    {/* <option>Tether</option>
                    <option>USDC</option> */}
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
                    onChange={(e) => {
                       let result = calcTransResult(e.target.value, totals.algo, totals.gard ,transaction)
                       setReceivedValue(result)
                      reduceTransaction({
                        type: 'offering-amount',
                        value: e.target.value,
                      })
                    }
                    }
                    placeholder={'Max 123.4'}
                    darkToggle={theme === 'dark'}
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
                    darkToggle={theme === 'dark'}
                  >
                    <option>GARD</option>
                    <option>ALGO</option>
                    {/* <option>Tether</option>
                    <option>USDC</option> */}
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
                    onChange={(e) => {
                      // TODO: uncomment/refactor to make swap display both ways
                      // let result = calcTransResult(e.target.value, totals.algo, totals.gard ,transaction)
                     reduceTransaction({
                       type: 'receiving-amount',
                       value: receivedValue,
                     })
                    }
                    }
                    placeholder={receivedValue}
                    darkToggle={theme === 'dark'}
                  />
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginBottom: 35 }}>
            <PrimaryButton
              text={'Execute Transaction'}
              onClick={() => transactionCallback(transaction)}
              darkToggle={theme === 'dark'}
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
  ${(props) => props.darkToggle &&
  css `
    background: #404040;
  `
  }
  ${(props) => props.expanded &&
  css `
    background: #fcfcfd;
  `
  }
  ${(props) => props.expanded && props.darkToggle &&
  css `
    background: #1c1c1c;
  `
  }

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
  ${(props) => props.darkToggle ?
  `
    background: #2c2c2c
    color: #f4ebff
  ` :
  ``
  }
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
  ${(props) => props.darkToggle &&
  css `
    background: #404040;
  `
  }
`
const InputTitle = styled.text`
  font-weight: normal;
  font-size: 14px;
  color: #7a7a7a;
   ${(props) => props.darkToggle &&
  css`
    color:#ffffff;
    `
  }
`
const Select = styled.select`
  height: 40px;
  background: #ffffff;
  border: 1px solid #dce1e6;
  border-radius: 4px;
  width: 11.5972222222222vw;
  padding: 0px 0px 0px 12px;
  ${(props) => props.darkToggle &&
  css`
    background:#525252;
    color:#ffffff;
    `
  }
`
const Input = styled.input`
  height: 40px;
  background: #ffffff;
  border: 1px solid #dce1e6;
  border-radius: 4px;
  width: 11.5972222222222vw;
  padding: 0px 0px 0px 12px;
  ${(props) => props.darkToggle &&
  css`
    background:#525252;
  `
  }
`

const Image = styled.img`
  ${(props) => props.darkToggle &&
  css`
    filter:invert();
  `
  }
`


// Titles of each section
const titles = [
  {
    title: 'Pact',
  },
  // {
  //   title: 'Tinyman',
  // },
  // {
  //   title: 'HumbleSwap',
  // },
]
