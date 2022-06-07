import React, { useEffect, useState, useReducer, useContext } from 'react'
import styled, { keyframes, css } from 'styled-components'
import Modal from './Modal'
import PrimaryButton from './PrimaryButton'
import TransactionSummary from './TransactionSummary'
import LoadingOverlay from './LoadingOverlay'
import { getWallet, getWalletInfo, handleTxError } from '../wallets/wallets'
import { calcDevFees, getPrice, calcRatio } from '../transactions/cdp.js'
import { openCDP } from '../transactions/cdp'
import { useAlert } from '../hooks'
import { useDispatch } from 'react-redux'
import { setAlert } from '../redux/slices/alertSlice'
import { ThemeContext } from '../contexts/ThemeContext'

function displayRatio() {
  return calcRatio(algosToMAlgos(getCollateral()), getMinted(), true)
}

function mAlgosToAlgos(num) {
  return num / 1000000
}
function algosToMAlgos(num) {
  return num * 1000000
}

function displayFees() {
  const fees = mAlgosToAlgos(calcDevFees(algosToMAlgos(getMinted())))
  return fees + ' Algos'
}

function displayLiquidationPrice() {
  return '$' + ((1.15 * getMinted()) / getCollateral()).toFixed(4)
}

function getMinted() {
  if (
    document.getElementById('minted') == null ||
    isNaN(parseFloat(document.getElementById('minted').value))
  ) {
    return null
  }
  return parseFloat(document.getElementById('minted').value)
}

function getCollateral() {
  if (
    document.getElementById('collateral') == null ||
    isNaN(parseFloat(document.getElementById('collateral').value))
  ) {
    return null
  }
  return parseFloat(document.getElementById('collateral').value)
}
/**
 * Content for Mint option on the Drawr
 */
export default function MintContent() {
  const [modalVisible, setModalVisible] = useState(false)
  const [canAnimate, setCanAnimate] = useState(false)
  const {theme} = useContext(ThemeContext)

  const [fields, reduceFields] = useReducer(
    (state, action) => {
      setCanAnimate(false)
      let collateral = state.collateral
      let minted = state.minted
      switch (action.type) {
        case 'collateral':
          if (
            !isNaN(action.value) &&
            (isNaN(parseInt(action.value)) || parseInt(action.value) >= 0)
          ) {
            collateral = action.value.replace(/ /g, '')
          }
          break
        case 'minted':
          if (
            !isNaN(action.value) &&
            (isNaN(parseInt(action.value)) || parseInt(action.value) >= 0)
          ) {
            minted = action.value.replace(/ /g, '')
          }
          break
      }
      return { ...state, collateral, minted }
    },
    {
      collateral: '',
      minted: '',
      ratio: '',
      price: '',
      fees: '',
    },
  )
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  useEffect(async () => {
    await getPrice()
  }, [])
  return (
    <div>
      {loading ? <LoadingOverlay text={'Minting your CDP...'} /> : <></>}
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: window.innerWidth < 900 ? 'column' : 'row',
            marginBottom: 4.5,
          }}
        >
          <InputNameContainer darkToggle={theme === 'dark'}>
            <InputNameText>Current Balance (Algos)</InputNameText>
          </InputNameContainer>
          <InputContainer darkToggle={theme === 'dark'}>
            <InputNameText>
              {getWallet() == null
                ? 'N/A'
                : mAlgosToAlgos(getWalletInfo()['amount'])}
            </InputNameText>
          </InputContainer>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: window.innerWidth < 900 ? 'column' : 'row',
            marginBottom: 4.5,
          }}
        >
          <InputNameContainer darkToggle={theme === 'dark'}>
            <InputNameText>Collateral (Algos)</InputNameText>
          </InputNameContainer>
          <div>
            <Input
              darkToggle={theme === 'dark'}
              placeholder="Algos sent to CDP"
              id="collateral"
              value={fields.collateral}
              onChange={(e) =>
                reduceFields({ type: 'collateral', value: e.target.value })
              }
            />
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: window.innerWidth < 900 ? 'column' : 'row',
            marginBottom: 4.5,
          }}
        >
          <InputNameContainer darkToggle={theme === 'dark'}>
            <InputNameText>Minted GARD</InputNameText>
          </InputNameContainer>
          <div>
            <Input
              darkToggle={theme === 'dark'}
              placeholder="Min. 1"
              id="minted"
              value={fields.minted}
              onChange={(e) =>
                reduceFields({ type: 'minted', value: e.target.value })
              }
            />
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: window.innerWidth < 900 ? 'column' : 'row',
            marginBottom: 4.5,
          }}
        >
          <InputNameContainer darkToggle={theme === 'dark'}>
            <InputNameText>Collateralization Ratio</InputNameText>
          </InputNameContainer>
          <InputContainer>
            <InputNameText>
              {getMinted() == null || getCollateral() == null
                ? '...'
                : displayRatio()}
            </InputNameText>
          </InputContainer>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: window.innerWidth < 900 ? 'column' : 'row',
            marginBottom: 4.5,
          }}
        >
          <InputNameContainer darkToggle={theme === 'dark'}>
            <InputNameText>Liquidation Price (in ALGO/USD)</InputNameText>
          </InputNameContainer>
          <InputContainer>
            <InputNameText>
              {getMinted() == null || getCollateral() == null
                ? '...'
                : displayLiquidationPrice()}
            </InputNameText>
          </InputContainer>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: window.innerWidth < 900 ? 'column' : 'row',
          }}
        >
          <InputNameContainer darkToggle={theme === 'dark'}>
            <InputNameText>Protocol Fees</InputNameText>
          </InputNameContainer>
          <InputContainer>
            <InputNameText>
              {getMinted() == null || getCollateral() == null
                ? '...'
                : displayFees()}
            </InputNameText>
          </InputContainer>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: window.innerWidth < 900 ? 'column' : 'row',
          marginBottom: 40,
        }}
      >
        <InputNameContainer
          style={{ background: 'transparent' }}
        ></InputNameContainer>
        <InputNameContainer
          style={{
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: 0,
            background: 'transparent',
          }}
        >
          <PrimaryButton
            text={'Submit Mint Request'}
            onClick={() => {
              setCanAnimate(true)
              setModalVisible(true)
            }}
          />
        </InputNameContainer>
      </div>
      <Modal
        visible={modalVisible}
        close={() => setModalVisible(false)}
        animate={canAnimate}
        title="Are you sure you want to proceed?"
        subtitle="Review the details of this transaction to the right and
                    click “Confirm Transaction” to proceed."
        darkToggle={theme === 'dark'}
      >
        <TransactionSummary
          specifics={dummyTrans()}
          transactionFunc={async () => {
            if (getMinted() != null && getCollateral() != null) {
              setCanAnimate(true)
              setModalVisible(false)
              setLoading(true)
              try {
                const res = await openCDP(getCollateral(), getMinted())
                if (res.alert) {
                  dispatch(setAlert(res.text))
                }
              } catch (e) {
                handleTxError(e, 'Error minting CDP')
              }
              setCanAnimate(false)
              setLoading(false)
            }
          }}
          cancelCallback={() => setModalVisible(false)}
          darkToggle={theme === 'dark'}
        />
      </Modal>
    </div>
  )
}
// TODO: swap dummyTrans with the values from the form
// TODO: parameterize openCDP

// styled components
const InputNameContainer = styled.div`
  height: 96px;
  width: ${window.innerWidth < 900 ? '80vw' : '31vw'};
  background: #e9d7fe;
  padding-left: 16px;
  display: flex;
  align-items: center;
  margin-right: 2.5px;
  ${(props) =>
    props.darkToggle &&
    css`
    background: #404040;
  `}
`
//404040
const InputNameText = styled.text`
  font-weight: 500;
  font-size: 20px;
`
const InputContainer = styled.div`
  height: 96px;
  width: ${window.innerWidth < 900 ? '80vw' : '31vw'};
  border-bottom: 1px solid #e9ecfb;
  display: flex;
  align-items: center;
  justify-content: center;
`
const Input = styled.input`
  font-weight: 500;
  font-size: 20px;
  width: 100%;
  border: 0px;
  height: 96px;
  width: ${window.innerWidth < 900 ? '80vw' : '31vw'};
  border-bottom: 1px solid #e9ecfb;
  text-align: center;
  &:focus {
    outline-color: #bc82ff;
  }
  &:focus::placeholder {
    color: transparent;
  }
  ${(props) =>
    props.darkToggle &&
    css`
    transition: 'all 1s ease';
    background: #121212;
    color: white;
    &:focus {
      outline-color: white;
    }
    &:focus::placeholder {
      color: transparent;
    }
  `}
`
// Why don't these refresh right away?
// dummy info for the transaction
function dummyTrans() {
  if (getMinted() == null || getCollateral() == null) {
    return [
      {
        title: 'Collateral Staked',
        value: 'x Algos',
      },
      {
        title: 'GARD to Be Minted',
        value: 'Minimum 1 GARD',
      },
      {
        title: 'Collateralization Ratio',
        value: '...',
      },
      {
        title: 'Liquidation Price (in ALGO/USD)',
        value: '...',
      },
      {
        title: 'Transaction Fee',
        value: '...',
      },
    ]
  } else {
    return [
      {
        title: 'Collateral Staked',
        value: getCollateral() + ' Algos',
      },
      {
        title: 'GARD to Be Minted',
        value: getMinted() + ' GARD',
      },
      {
        title: 'Collateralization Ratio',
        value: displayRatio(),
      },
      {
        title: 'Liquidation Price',
        value: displayLiquidationPrice(),
      },
      {
        title: 'Transaction Fee',
        value: displayFees(),
      },
    ]
  }
} /*[
  {
    title: 'Collateral Staked',
    value: getCollateral() == null ? 'x microAlgos' : getCollateral() + ' microAlgos',
  },
  {
    title: 'GARD to Be Minted',
    value: getMinted() == null ? 'Minimum 1 GARD' : getMinted() + ' GARD',
  },
  {
    title: 'Collateralization Ratio',
    value: (getMinted() == null || getCollateral() == null) ? '...' : displayRatio(),
  },
  {
    title: 'Liquidation Price',
    value: (getMinted() == null || getCollateral() == null) ? '...' : displayLiquidationPrice(),
  },
  {
    title: 'Transaction Fee',
    value: (getMinted() == null || getCollateral() == null) ? '...' : displayFees(),
  },
] */
