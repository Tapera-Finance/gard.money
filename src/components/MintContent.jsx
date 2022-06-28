import React, { useEffect, useState, useReducer, useContext } from 'react'
import styled, { keyframes, css } from 'styled-components'
import Modal from './Modal'
import PrimaryButton from './PrimaryButton'
import TransactionSummary from './TransactionSummary'
import LoadingOverlay from './LoadingOverlay'
import { getWallet, getWalletInfo, handleTxError, updateWalletInfo } from '../wallets/wallets'
import { calcDevFees, getPrice, calcRatio } from '../transactions/cdp.js'
import { openCDP } from '../transactions/cdp'
import { useAlert } from '../hooks'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setAlert } from '../redux/slices/alertSlice'
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Slider from '@mui/material/Slider';
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
  const navigate = useNavigate()

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
  const [price, setPrice] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState(null)
  const [balance, setBalance] = useState('...')
  const [cAlgos, setCollateral] = useState(0)
  const [maxCollateral, setMaxCollateral] = useState(0)
  const [mGARD, setGARD] = useState(0)
  const [maxGARD, setMaxGARD] = useState(0)
  const [minted, setMinted] = useState(1)
  const dispatch = useDispatch()
  useEffect(async () => {
    setPrice(await getPrice())
    await updateWalletInfo();
    getWallet();
    setBalance((getWalletInfo()['amount'] / 1000000).toFixed(3));
    setMaxCollateral(((getWalletInfo()['amount'] -  calcDevFees(algosToMAlgos(mGARD || 1)) - 307000 - 100000 * (getWalletInfo()["assets"].length + 4)) /1000000).toFixed(3))
  }, [])
  
  const [checked, setChecked] = useState(false);

  const handleCheckboxChange = () => {
    setChecked(!checked);
  };

  const handleSliderChange1 = (event, newValue) => {
    setCollateral(newValue);
    let max = Math.trunc(100*(algosToMAlgos(price) * algosToMAlgos(newValue) / 1000000) / 1.4  / 1000000)/100
    setMaxGARD(max)
    if (mGARD > max) {
      setGARD(max)
    } 
  };

  const handleInputChange1 = (event) => {
    setCollateral(event.target.value === '' ? '' : Number(event.target.value));
  };

  const handleSliderChange2 = (event, newValue) => {
    setGARD(newValue);
    let max = ((getWalletInfo()['amount'] - calcDevFees(algosToMAlgos(mGARD)) - 307000 - 100000 * (getWalletInfo()["assets"].length + 4)) /1000000).toFixed(3)
    setMaxCollateral(max)
    if (isNaN(cAlgos)){
      console.log('heyy')
      return
    }
    if (cAlgos > max) {
      setCollateral(max)
    }
  };

  const handleInputChange2 = (event) => {
    setGARD(event.target.value === '' ? '' : Number(event.target.value));
  };
  
  var sessionStorageSetHandler = function(e) {
    setLoadingText(JSON.parse(e.value))
  };
  document.addEventListener("itemInserted", sessionStorageSetHandler, false);
  
  return (
    <div>
      {loading ? <LoadingOverlay text={loadingText} /> : <></>}
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
                  : `${balance}`}
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
          <Box sx={{
            width: window.innerWidth < 900 ? '80vw' : '31vw',
            } }>
            <Grid container spacing={0} justifyContent="center" alignItems="center" marginLeft={0} borderBottom= '1px solid #e9ecfb' >
            <Grid item xs={12}>
                <Input
                  darkToggle={theme === 'dark'}
                  type='number'
                  min="0.00"
                  step="0.001"
                  id="collateral"
                  placeholder="Algos sent to CDP"
                  value={cAlgos}
                  size="small"
                  onKeyPress={(event) => {
                    if (!/[0-9]/.test(event.key)) {
                      if(event.key === '.'){
                        return
                      }
                      event.preventDefault();
                    }
                  }}
                  onChange={handleInputChange1}
                />
              </Grid>
              <Grid item xs={10}>
                <Slider
                  value={cAlgos}
                  color="secondary"
                  onChange={handleSliderChange1}
                  aria-labelledby="input-slider"
                  max={typeof maxCollateral === 'string' || maxCollateral instanceof String ? parseFloat(maxCollateral) : maxCollateral}
                  step={.001}
                />
              </Grid>
            </Grid>
          </Box>
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
          <Box sx={{
            width: window.innerWidth < 900 ? '80vw' : '31vw',
            } }>
            <Grid container spacing={0} justifyContent="center" alignItems="center" marginLeft={0} borderBottom= '1px solid #e9ecfb' >
            <Grid item xs={12}>
                <Input
                  darkToggle={theme === 'dark'}
                  type='number'
                  min="1.00"
                  step="0.001"
                  id="minted"
                  placeholder="Min. 1"
                  value={mGARD}
                  size="small"
                  onKeyPress={(event) => {
                    if (!/[0-9]/.test(event.key)) {
                      if(event.key === '.'){
                        return
                      }
                      event.preventDefault();
                    }
                  }}
                  onChange={handleInputChange2}
                />
              </Grid>
              <Grid item xs={10}>
                <Slider
                  value={mGARD}
                  color="secondary"
                  onChange={handleSliderChange2}
                  aria-labelledby="input-slider"
                  min={1}
                  max={maxGARD}
                  step={.001}
                />
              </Grid>
            </Grid>
          </Box>
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
        <div style={{ marginBottom: 12 }}>
          <div style={{ marginBottom: 4 }}>
            <InputTitle>Optional: Commit full balance to governance?</InputTitle>
          </div>
          <div>
            <label style={{
            display: 'flex',
            alignContent: 'center',
            }}>
              <input 
              type={"checkbox"}
              checked={checked}
              onChange={handleCheckboxChange} 
              />
                <InputSubtitle> <span style={{ fontWeight: 'bold' }}>{checked === false ? 0 : cAlgos} </span> Algos will be committed</InputSubtitle>
            </label>
          </div>
        </div>
        
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
                  navigate('/manage')
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
          commit={checked}
        />
      </Modal>
    </div>
  )
}
// TODO: swap dummyTrans with the values from the form
// TODO: parameterize openCDP

// styled components
const InputTitle = styled.text`
  font-weight: bold;
  font-size: 16px;
`
const InputSubtitle = styled.text`
  font-weight: normal;
  font-size: 12px;
  margin: 3px 3px 3px 4px
`
const InputNameContainer = styled.div`
  height: 132.31px;
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
const InputNameText = styled.text`
  font-weight: 500;
  font-size: 20px;
`
const InputContainer = styled.div`
  height: 132.31px;
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
