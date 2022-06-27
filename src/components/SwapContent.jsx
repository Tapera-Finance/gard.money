import React, { useReducer, useState, useContext } from 'react';
import styled, { css } from 'styled-components';
import chevron from '../assets/chevron_black.png';
import swapIcon from '../assets/icons/swapExpanded_icon.png';
import Modal from './Modal';
import PrimaryButton from './PrimaryButton';
import TransactionSummary from './TransactionSummary';
import LoadingOverlay from './LoadingOverlay';
import { ThemeContext } from '../contexts/ThemeContext';
import {
  swapAlgoToGard,
  swapGardToAlgo,
  estimateReturn,
  queryAndConvertTotals,
} from '../transactions/swap';
import { useEffect } from 'react';
import { setAlert } from '../redux/slices/alertSlice';
import {
  getWallet,
  getWalletInfo,
  handleTxError,
  updateWalletInfo,
} from '../wallets/wallets';
import { useDispatch } from 'react-redux';
import { VERSION } from '../globals';

const defaultPool = 'ALGO/GARD';
const maxA = 100;
const maxB = 20;

const mAlgosToAlgos = (num) => {
  return num / 1000000;
};

const mGardToGard = (num) => {
  return num / 1000000;
};


const exchangeRatioAssetXtoAssetY = (assetX, assetY) => {
  return parseFloat(assetX / assetY).toFixed(4);
};

const targetPool = (assetNameX, assetNameY) => `${assetNameX}/${assetNameY}`

const getTotals = async () => await queryAndConvertTotals();

function calcTransResult(amount, totalX, totalY, transaction) {
    if (transaction) {
      if (
        transaction.offering.from === 'ALGO' &&
        transaction.receiving.to === 'GARD'
      ) {
        if (amount > 0) {
          return estimateReturn(
            parseFloat(amount),
            totalX,
            totalY,
            0.003,
          );
        }
      } else if (
        transaction.offering.from === 'GARD' &&
        transaction.receiving.to === 'ALGO'
      ) {
        if (amount > 0) {
          return estimateReturn(
            parseFloat(amount),
            totalY,
            totalX,
            0.003,
          );
        }
    }
  }
}

const toVal = (v) => parseFloat(v);

const verifyValue = (input) => {
 if ((typeof parseFloat(input) !== 'NaN') && (parseFloat(input) > 0)) {
    return parseFloat(input)
  } else return false
}
/**
 * Content for Swap option in drawer
 */
export default function SwapContent() {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalCanAnimate, setModalCanAnimate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState(null);
  const [target, setTarget] = useState('')
  const [transaction, setTransaction] = useState([]);
  const dispatch = useDispatch();
  const { theme } = useContext(ThemeContext);


  useEffect(async () => {
    const res = await getTotals();
    setTotals(res);
    return () => {
      console.log('unmounting pool totals', totals);
    };
  }, []);

  useEffect(() => {
    if (transaction && transaction.offering) {
      setTarget(targetPool(transaction.offering.from, transaction.offering.to));
    } else {
      setTarget(defaultPool);
    }
  },[])

  return (
    <div>
      {loading ? <LoadingOverlay text={'Swapping assets...'} /> : <></>}
      <div style={{ marginBottom: 50 }}>
        {titles.map((value, index) => {
          return (
            <Section
              title={value.title}
              darkToggle={theme === 'dark'}
              transactionCallback={(transaction) => {
                let keys = target.split("/");
                setModalCanAnimate(true);
                setTransaction([
                  {
                    title: 'You are offering',
                    value: `${transaction.offering.amount}$${transaction.offering.from}`,
                  },
                  {
                    title: 'You are receiving',
                    value:`${totals ? calcTransResult(
                      transaction.offering.amount,
                      totals[target][keys[0].toLowerCase()],
                      totals[target][keys[1].toLowerCase()],
                      transaction,
                    ): transaction.converted.amount} ${'$' + transaction.receiving.to}`,
                  },
                  {
                    title: 'Transaction Fee',
                    value: '0.003 Algos',
                  },
                ]);
                setModalVisible(true);
              }}
            ></Section>
          );
        })}
        <TransactionContainer darkToggle={theme === 'dark'}>
          <Modal
            title="Are you sure you want to proceed?"
            subtitle="Review the details of this transaction to the right and click “Confirm Transaction” to proceed."
            visible={modalVisible}
            animate={modalCanAnimate}
            close={() => setModalVisible(false)}
            darkToggle={theme === 'dark'}
          >
            <TransactionSummary
              specifics={transaction}
              transactionFunc={async () => {
                setModalCanAnimate(true);
                setModalVisible(false);
                setLoading(true);
                try {
                  const amount = parseFloat(transaction[0].value).toFixed(3);
                  const formattedAmount = parseFloat(amount).toFixed(3);
                  // if (balance < transaction.offering.amount) {
                  //   dispatch(setAlert(`Not enough ${transaction.offering.type} in wallet`))
                  // }

                  if (VERSION !== 'MAINNET') {
                    throw new Error('Unable to swap on TESTNET');
                  }
                  const res = await swapAlgoToGard(
                    parseInt(1000000 * formattedAmount),
                    1,
                  );
                  if (res && res.alert) {
                    dispatch(setAlert(res.text));
                  }
                } catch (e) {
                  handleTxError(e, 'Error exchanging assets');
                }
                setModalCanAnimate(false);
                setLoading(false);
              }}
              cancelCallback={() => setModalVisible(false)}
            />
          </Modal>
        </TransactionContainer>
      </div>
    </div>
  );
}

function toggleSelect(val, other, type1, type2, assets, reducer) {
  if (val === assets[0] && other === assets[1]) {
    reducer({
      type: type1,
      value: assets[0],
    })

    reducer({
      type: type2,
      value: assets[1]
    })
    return
  }
  if (val === assets[1] && other === assets[0]) {
      reducer({
        type: type1,
        value: assets[1],
     })
      reducer({
        type: type2,
        value: assets[0]
      })
      return
    }
  if (val === assets[0] && other === assets[0]) {
    reducer({
      type: type1,
      value: assets[0]
    })
    reducer({
      type: type2,
      value: assets[1]
    })
    return
  }
  if (val === assets[1] && other === assets[1]) {
    reducer({
      type: type1,
      value: assets[1]
    })
    reducer({
      type: type2,
      value: assets[0]
    })
  }
}


function handleExchange(type, amount, assets, transform, params, transaction, reducer) {  if (type === "offering-amount") { // field 1 handling from field 2 input
   if (transaction) {
    if (
      transaction.offering.from === assets[0] &&
      transaction.receiving.to === assets[1]
    ) {
      if (typeof amount === 'number') {
        reducer({
          type: 'receiving-amount',
          value: transform(amount, params[0], params[1], transaction),
        });
        return;
      }
    } else if (
      transaction.offering.from === assets[1] &&
      transaction.receiving.to === assets[0]
    ) {
      if (typeof amount === 'number') {
        reducer({
          type: 'receiving-amount',
          value: transform(amount, params[1], params[0], transaction),
        });
        return;
      }
    }
  }

  } else if (transaction) {
    if (type === "receiving-amount") { // field 2 handling from field 1 input
     if (transaction) {
       if (transaction.offering.from === assets[1] && transaction.receiving.to === assets[0]) {
          if (typeof amount === 'number') {
            reducer({
              type: "offering-amount",
              value: amount,
            })
            reducer({
              type: "receiving-amount",
              value:  transform(amount, params[0], params[1], transaction)
            })
            return
          }
       } else if (transaction.offering.from === assets[0] && transaction.receiving.to === assets[1]) {
        if (typeof amount === 'number') {

          reducer({
            type: "offering-amount",
            value: parseFloat(amount),
          })
          reducer({
            type: "receiving-amount",
            value:  transform(amount, params[0], params[1], transaction)
          })
          return
        }
       }
       }
  }
  }
}

/**
 * The expandable section in swap content
 * @prop {string} title - Section title to be displayed on top
 * @prop {function} transactionCallback - Callback function for when a transaction is executed
 */
function Section({ title, transactionCallback }) {
  const [expanded, setExpanded] = useState(false);
  const [totals, setTotals] = useState(null);
  const [algoToGardRatio, setAlgoToGardRatio] = useState("Loading...");
  const [receivedValue, setReceivedValue] = useState(null);
  const { theme } = useContext(ThemeContext);
  const assetsA2G = ["ALGO", "GARD"];
  // get and set all available pool total exchange ratios, only need algoGardRatio at first
  useEffect(async () => {
    const resultsOfQuery = await queryAndConvertTotals();
    setTotals(resultsOfQuery);
    let algoGardRatio = exchangeRatioAssetXtoAssetY(
      mAlgosToAlgos(resultsOfQuery["ALGO/GARD" || "GARD/ALGO"].algo),
      mGardToGard(resultsOfQuery["ALGO/GARD"|| "GARD/ALGO"].gard),
    );
    if (algoGardRatio) {
      setAlgoToGardRatio(algoGardRatio);
    }
    return () => {
      console.log('unmounting getRatio effect', algoGardRatio);
    };
  }, []);

  useEffect(async () => {
    const res = await getTotals();
    if (res) {
      setTotals(res)
    }
    return () => {
      console.log('unmounting getTotals effect', totals)
    }
  }, [])

  const [transaction, reduceTransaction] = useReducer(
    (state, action) => {
      switch (action.type) {
        case 'offering-amount':
          console.log("state from reducer", state)
          console.log("action from reducer", action);
          return {
            ...state,
            offering: {
              ...state.offering,
              amount: action.value,
            },
          };
        case 'offering-from':
          console.log(state, action)
          return {
            ...state,
            offering: {
              ...state.offering,
              from: action.value,
            },
          };
        case 'receiving-amount':
          console.log("state from reducer", state)
          console.log("action from reducer", action);
          return {
            ...state,
            receiving: {
              ...state.receiving,
              amount: action.value
            },
          };

        case 'receiving-to':
          console.log(state, action)
          return {
            ...state,
            receiving: {
              ...state.receiving,
              to: action.value,
            },
          };
        case 'clear':
          return {
            ...state,
            offering: {
              ...state.offering,
              amount: ''
            },
            receiving: {
              ...state.receiving,
              amount: ''
            }
          }
        default:
            return {
              ...state,
              defaultPool: defaultPool
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
  );

  useEffect(() => {
    if (transaction) {
      if (totals) {
        const {offering, converted, receiving } = transaction
        let res = calcTransResult(
          offering.amount,
          totals[targetPool(offering.from, receiving.to)][offering.from.toLowerCase()],
          totals[targetPool(offering.from, receiving.to)][receiving.to.toLowerCase()],
          transaction
          );
        setReceivedValue(res);
      }
    }
    return () => {
      console.log('unmounting get totals effect');
    };
  }, []);

  return (
    <div style={{ marginBottom: 10 }}>
      <SectionButton
        darkToggle={theme === 'dark'}
        onClick={() => {
          setExpanded(!expanded);
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
              style={
                expanded ? { transform: 'rotate(90deg)', background: '' } : {}
              }
              darkToggle={theme === 'dark'}
            />
          </div>
          <div>
            <TitleText darkToggle={theme === 'dark'}>{title}</TitleText>
          </div>
        </TitleContainer>
        <RelationsContainer>
          <div style={{ flex: 1 }} darkToggle={theme === 'dark'}>
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
                <RelationsValue>
                  {' '}
                  {algoToGardRatio !== null ? algoToGardRatio : "Loading..."}
                </RelationsValue>
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
                    value={
                      transaction.offering.from //if algo
                    }
                    onChange={(e) => {
                      toggleSelect(
                        e.target.value,
                        transaction.offering.from,
                        "offering-from",
                        "receiving-to",
                        assetsA2G,
                        reduceTransaction);
                        reduceTransaction({
                            type: 'offering-amount',
                            value: transaction.receiving.amount
                          });
                        reduceTransaction({
                          type: 'receiving-amount',
                          value: transaction.offering.amount
                        });
                    }}
                    darkToggle={theme === 'dark'}
                  >
                    <option>ALGO</option>
                    <option>GARD</option>
                  </Select>
                </div>
                <div>
                  <InputTitle>
                  {getWallet() == null ? 'N/A' : 'Balance: ' + mAlgosToAlgos(getWalletInfo().amount)}
                  </InputTitle>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 8 }}>
                  <InputTitle>Amount</InputTitle>
                </div>
                <div>
                  {/* convert 1st field inputs to field 2 vals*/}
                  <Input
                    value={transaction.offering.amount}
                    onChange={(e) => {
                        if (e.target.value !== '' && typeof parseFloat(e.target.value) === 'number') {
                          handleExchange(
                         "receiving-amount",
                          parseFloat(e.target.value),
                          assetsA2G,
                          calcTransResult,
                          [
                          totals[
                            targetPool(
                              transaction.offering.from,
                              transaction.receiving.to,
                            )][transaction.offering.from.toLowerCase()],

                          totals[
                            targetPool(
                              transaction.offering.from,
                              transaction.receiving.to,
                            )][transaction.receiving.to.toLowerCase()],
                          ],
                        transaction,
                          reduceTransaction
                        )
                        } else {
                          reduceTransaction({
                            type: 'clear',
                          })
                        }
                      }
                    }
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
                  <InputTitle>To</InputTitle>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Select
                    value={transaction.receiving.to}
                    onChange={(e) => {
                      toggleSelect(
                        e.target.value,
                        transaction.offering.from,
                        "receiving-to",
                        "offering-from",
                        assetsA2G,
                        reduceTransaction)
                      reduceTransaction({
                        type: 'offering-amount',
                        value: transaction.receiving.amount
                      });
                      reduceTransaction({
                        type: 'receiving-amount',
                        value: transaction.offering.amount
                      });
                    }}
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
                  {/* convert second field inputs to field 1 vals*/}
                  <Input
                    value={transaction.receiving.amount}
                    onChange={(e) => {
                        handleExchange(
                        "offering-amount",
                         parseFloat(e.target.value),
                          assetsA2G,
                          estimateReturn,
                          [
                            totals[
                              targetPool(
                                transaction.offering.from,
                                transaction.receiving.to,
                              )][transaction.receiving.to.toLowerCase()],
                            totals[
                              targetPool(
                                transaction.offering.from,
                                transaction.receiving.to,
                              )][transaction.offering.from.toLowerCase()],
                          ],
                            transaction,
                          reduceTransaction
                        )
                      }
                    // }
                  }
                    // placeholder={
                    //   // `Max: ${maxB}`
                    //   transaction.receiving.amount
                    // }
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
  );
}

// Styled Components
const TitleContainer = styled.div`
  background: #f4ebff;
  border-radius: 6px;
  flex: 2;
  display: flex;
  flex-direction: row;
  ${(props) =>
    props.darkToggle &&
    css`
      background: #404040;
    `}
  ${(props) =>
    props.expanded &&
    css`
      background: #fcfcfd;
    `}
  ${(props) =>
    props.expanded &&
    props.darkToggle &&
    css`
      background: #1c1c1c;
    `}
`;

const TransactionContainer = styled.div`
  ${(props) =>
    props.darkToggle &&
    css`
      background: #484848;
      color: white;
    `}
`;

const SectionButton = styled.div`
  height: 96px;
  cursor: pointer;
  display: flex;
  flex-direction: row;
`;

const RelationsContainer = styled.div`
  flex: 3;
  display: flex;
  flex-direction: row;
  ${(props) =>
    props.darkToggle &&
    css`
      background: #484848;
      color: white;
    `}
`;
const TitleText = styled.text`
  font-weight: 500;
  font-size: 20px;
  ${(props) =>
    props.darkToggle
      ? `
    background: #2c2c2c
    color: #f4ebff
  `
      : ``}
`;
const RelationsSpecificsContainer = styled.div`
  border-bottom: 1px solid #f9f9f9;
  height: 48px;
`;
const RelationsTitle = styled.text`
  font-weight: bold;
  font-size: 14px;
  ${(props) =>
    props.darkToggle &&
    css`
      background: #484848;
      color: white;
      border-radius: 25px;
      border: 2px solid #c299eb;
      padding: 20px;
      width: 200px;
      height: 150px;
    `}
`;
const RelationsValue = styled.text`
  font-weight: 500;
  font-size: 14px;
`;
const ExpandedContainer = styled.div`
  height: 207px;
  background: #f4ebff;
  padding: 0px 3vw;
  ${(props) =>
    props.darkToggle &&
    css`
      background: #404040;
    `}
`;
const InputTitle = styled.text`
  font-weight: normal;
  font-size: 14px;
  color: #7a7a7a;
  ${(props) =>
    props.darkToggle &&
    css`
      color: #ffffff;
    `}
`;
const Select = styled.select`
  height: 40px;
  background: #ffffff;
  border: 1px solid #dce1e6;
  border-radius: 4px;
  width: 11.5972222222222vw;
  padding: 0px 0px 0px 12px;
  ${(props) =>
    props.darkToggle &&
    css`
      background: #525252;
      color: #ffffff;
    `}
`;
const Input = styled.input`
  height: 40px;
  background: #ffffff;
  border: 1px solid #dce1e6;
  border-radius: 4px;
  width: 11.5972222222222vw;
  padding: 0px 0px 0px 12px;
  ${(props) =>
    props.darkToggle &&
    css`
      background: #525252;
    `}
`;

const Image = styled.img`
  ${(props) =>
    props.darkToggle &&
    css`
      filter: invert();
    `}
`;

// Titles of each section
const titles = [
  {
    title: 'Pact',
  },
];

/**
 * /* <div style={{ flex: 1 }}>
            <RelationsSpecificsContainer
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            > */
          /* <div>
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
          </div> */
          /* <div style={{ flex: 1 }}>
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
 */
