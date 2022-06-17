import React, { useEffect, useReducer, useState, useContext } from 'react'
import styled, {css} from 'styled-components'
import { formatToDollars, formatTo } from '../utils'
import Modal from './Modal'
import PrimaryButton from './PrimaryButton'
import Table from './Table'
import WrappedSummary from './WrappedSummary'
import TransactionSummary from './TransactionSummary'
import LoadingOverlay from './LoadingOverlay'
import { mint, closeCDP, getCDPs, updateCDPs, addCollateral } from '../transactions/cdp'
import { getWalletInfo, handleTxError } from '../wallets/wallets'
import { useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { getCurrentAlgoUsd } from '../prices/prices'
import { setAlert } from '../redux/slices/alertSlice'
import { ThemeContext } from '../contexts/ThemeContext'

// TODO: Replace value.liquidationPrice with the proper liquidation price
/**
 * Content for Repay option in the Drawer
 */

function getNew(id) {
  if (
    document.getElementById(id) == null ||
    isNaN(parseFloat(document.getElementById(id).value))
  ) {
    return null
  }
  return parseFloat(document.getElementById(id).value)
}

const temp = await getCurrentAlgoUsd()

export default function RepayContent() {
  const [modalVisible, setModalVisible] = useState(false)
  const [currentPrice, setCurrentPrice] = useState(temp)
  const [modalCanAnimate, setModalCanAnimate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState(null)
  const walletAddress = useSelector((state) => state.wallet.address)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const {theme} = useContext(ThemeContext)

  useEffect(async () => {
    const updatePromise = updateCDPs()
    let currentPriceResponse = await getCurrentAlgoUsd()
    await updatePromise
    setCurrentPrice(currentPriceResponse)
  }, [])
  var sessionStorageSetHandler = function(e) {
    setLoadingText(JSON.parse(e.value))
  };

  document.addEventListener("itemInserted", sessionStorageSetHandler, false);

  const [modalContent, reduceModalContent] = useReducer(
    (state, action) => {
      const { type, transactionValue } = action
      if (type === 'repay')
        return {
          title: 'Are you sure you want to proceed?',
          subtitle:
            'Review the details of this transaction to the right and click “Confirm Transaction” to proceed.',
          children: (
            <TransactionSummary
              specifics={[
                {
                  title: 'Account',
                  value: transactionValue.id,
                },
                {
                  title: 'Liquidation Price',
                  value: formatToDollars(transactionValue.liquidationPrice),
                },
                {
                  title: 'Collateral',
                  value: formatTo('Algo', transactionValue.collateral, true),
                },
                {
                  title: 'Outstanding Debt',
                  value: formatTo('$', transactionValue.debt, true),
                },
              ]}
              transactionFunc={async () => {
                setModalCanAnimate(true)
                setModalVisible(false)
                setLoading(true)
                try {
                  let res = await closeCDP(transactionValue.id, transactionValue.debt)
                  if (res.alert) {
                    dispatch(setAlert(res.text))
                  }
                } catch (e) {
                  handleTxError(e, 'Error closing CDP')
                }
                setModalCanAnimate(false)
                setLoading(false)
              }}
              cancelCallback={() => setModalVisible(false)}
              darkToggle={theme === 'dark'}
            />
          ),
        }
      else if (type === 'collateral') {
        return {
          title: 'Add more collateral',
          subtitle:
            'Complete the details of this transaction to the right and click “Confirm Transaction” to add collateral.',
          children: (
            <TransactionSummary
              specifics={[]}
              transactionFunc={async () => {
                setModalCanAnimate(true)
                setModalVisible(false)
                setLoading(true)
                try {
                  let res = await addCollateral(
                    transactionValue.id,
                    getNew('more_collateral'),
                  )
                  if (res.alert) {
                    dispatch(setAlert(res.text))
                  }
                } catch (e) {
                  handleTxError(e, 'Error minting from CDP')
                }
                setModalCanAnimate(false)
                setLoading(false)
              }}
              cancelCallback={() => setModalVisible(false)}
              darkToggle={theme === 'dark'}
            >
              <WrappedSummary context="add_collateral" transactionData={transactionValue}></WrappedSummary>

            </TransactionSummary>
          ),
        }
      }
      else {
        const maxGard = Math.max(0, Math.trunc(100*(currentPrice * transactionValue.collateral / 1000000) / 1.4 - 100 * transactionValue.debt / 1000000)/100)
        return {
          title: 'Create a Mint Order',
          subtitle:
            'Complete the details of this transaction to the right and click “Confirm Transaction” to create a new mint order.',
          children: (
            <TransactionSummary
              specifics={[]}
              transactionFunc={async () => {
                setModalCanAnimate(true)
                setModalVisible(false)
                setLoading(true)
                try {
                  let res = await mint(transactionValue.id, getNew('more_gard'))
                  if (res.alert) {
                    dispatch(setAlert(res.text))
                  }
                } catch (e) {
                  handleTxError(e, 'Error minting from CDP')
                }
                setModalCanAnimate(false)
                setLoading(false)
              }}
              cancelCallback={() => setModalVisible(false)}
              darkToggle={theme === 'dark'}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  marginTop: 20,
                  marginBottom: 20,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <SpecificsTitle>{'Maximum Additional GARD'}</SpecificsTitle>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flex: 1,
                  }}
                >
                  {/* This value should be queried from the chain on page load. Might already be...*/}
                  <TransactionField>{maxGard}</TransactionField>
                </div>
              </div>
              <WrappedSummary context="mint_gard" transactionData={transactionValue}></WrappedSummary>
            </TransactionSummary>
          ),
        }
      }
    },
    {
      title: 'Are you sure you want to proceed?',
      subtitle:
        'Review the details of this transaction to the right and click “Confirm Transaction” to proceed.',
      children: (
        <TransactionSummary
          specifics={[]}
          transactionFunc={() => {}}
          cancelCallback={() => setModalVisible(false)}
          darkToggle={theme === 'dark'}
        />
      ),
    },
  )
  useEffect(() => {
    if (!walletAddress) navigate('/')
  }, [walletAddress])
  const loadedCDPs = CDPsToList()
  let cdps = loadedCDPs.map((value, index) => {
    delete value["committed"];
    // TODO: Add an instance where a user has no CDPs
    return {
      ...value,
      liquidationPrice: formatToDollars(value.liquidationPrice),
      collateral: formatTo('Algo', value.collateral, true),
      'add collateral': (
        <PrimaryButton
          text="Add collateral"
          onClick={() => {
            if (value.id == 'N/A') {
              return
            }
            reduceModalContent({ type: 'collateral', transactionValue: value })
            setModalVisible(true)
            setModalCanAnimate(true)
          }}
        />
      ),
      debt: formatToDollars(value.debt, true),
      mint: (
        <PrimaryButton
          text="Mint"
          onClick={() => {
            if (value.id == 'N/A') {
              return
            }
            reduceModalContent({ type: 'mint', transactionValue: value })
            setModalVisible(true)
            setModalCanAnimate(true)
          }}
        />
      ),
      repay: (
        <PrimaryButton
          text={'Repay'}
          onClick={() => {
            if (value.id == 'N/A') {
              return
            }
            reduceModalContent({ type: 'repay', transactionValue: value })
            setModalVisible(true)
            setModalCanAnimate(true)
          }}
        />
      ),
    }
  })
  if (!walletAddress) return <div></div>

  return (
    <div>
      {loading ? (
        <LoadingOverlay text={loadingText} />
      ) : (
        <></>
      )}
      <div
        style={{
          maxWidth: window.innerWidth - 0.14 * window.innerWidth,
          overflow: 'scroll',
        }}
      >
        <Table
          title="Collateralized Debt Positions (CDPs)"
          countSubtitle={`${cdps.length} CDPs`}
          data={cdps}
        />
      </div>
      <Modal
        title={modalContent.title}
        subtitle={modalContent.subtitle}
        animate={modalCanAnimate}
        visible={modalVisible}
        close={() => setModalVisible(false)}
        darkToggle={theme === 'dark'}
      >
        {modalContent.children}
      </Modal>
    </div>
  )
}

// styled components
const TransactionField = styled.text`
  font-weight: normal;
  font-size: 16px;
  border: 0px;
  height: 16px;
  display: flex;
  flex: 1;
  text-align: right;
  justify-content: flex-end;
  &:focus {
    outline-width: 0;
  }
`
const InputNameContainer = styled.div`
  height: 96px;
  width: 31vw;
  background: #e9d7fe;
  padding-left: 16px;
  display: flex;
  align-items: center;
  margin-right: 2.5px;
`
const InputNameText = styled.text`
  font-weight: 500;
  font-size: 20px;
`
const InputContainer = styled.div`
  height: 96px;
  width: 31vw;
  border-bottom: 1px solid #e9ecfb;
  display: flex;
  align-items: center;
  justify-content: center;
`
const SpecificsTitle = styled.text`
  font-weight: normal;
  font-size: 16px;
`
// TODO: load in CDPs from cache
export function CDPsToList() {
  const CDPs = getCDPs()
  let res = []
  if (getWalletInfo() && CDPs[getWalletInfo().address] != null) {
    const accountCDPs = CDPs[getWalletInfo().address]
    for (const [cdpID, value] of Object.entries(accountCDPs)) {
      if (value['state'] == 'open') {
        res.push({
          id: cdpID,
          liquidationPrice: (
            (1.15 * value['debt']) /
            value['collateral']
          ).toFixed(4),
          collateral: value['collateral'],
          debt: value['debt'],
          committed: value.hasOwnProperty('committed') ? value["committed"] : 0
        })
      }
    }
  }
  if (res.length == 0) {
    res = dummyCDPs
  }
  return res
}

// dummy info for the CDPs
const dummyCDPs = [
  {
    id: 'N/A',
    liquidationPrice: 0,
    collateral: 0,
    debt: 0,
  },
]
