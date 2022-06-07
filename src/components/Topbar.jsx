import React, { useReducer, useState, useContext } from 'react'
import styled from 'styled-components'
import syncIcon from '../assets/icons/sync_icon.png'
import Modal from './Modal'
import ALGOPrice from './ALGOPrice'
import PrimaryButton from './PrimaryButton'
import arrow from '../assets/arrow.png'
import {
  displayWallet,
  accountInfo,
  disconnectWallet,
} from '../wallets/wallets'

import { connectWallet } from '../wallets/wallets'
import AlgoSignerLogo from '../wallets/logos/algosigner.svg'
import MyAlgoLogo from '../wallets/logos/myalgowallet.png'
import AlgorandLogo from '../wallets/logos/algo.png'
import { CONTENT_NAMES } from '../globals'
import LoadingOverlay from './LoadingOverlay'
import { useAlert } from '../hooks'
import { useDispatch, useSelector } from 'react-redux'
import { setAlert } from '../redux/slices/alertSlice'
import { setWallet } from '../redux/slices/walletSlice'
import ThemeToggle from './ThemeToggle'
import { ThemeContext } from '../contexts/ThemeContext'
/**
 * Bar on top of our main content
 * @prop {string} contentName - name of current content, used as title on the top bar
 * @param {{contentName: string}} props
 */

export default function Topbar({ contentName, setMainContent }) {
  const {theme} = useContext(ThemeContext)
  const TopbarStyle = {
    light: {
      height: 96,
      backgroundColor: '#f9fafb',
    },
    dark: {
      height: 96,
      backgroundColor: '#333333',
      color: 'white',
    },
    common: {
      transition: 'all 1s ease',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: 36,
      paddingRight: window.innerWidth * 0.077,
    },
  }
  const themeStyle = {
    ...TopbarStyle.common,
    ...(theme === 'light' ? TopbarStyle.light : TopbarStyle.dark),
  }
  const [modalVisible, setModalVisible] = useState(false)
  const [modalCanAnimate, setModalCanAnimate] = useState(false)
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const walletAddress = useSelector((state) => state.wallet.address)
  const [modalContent, reduceModalContent] = useReducer(
    (state, action) => {
      if (action === 'options')
        return {
          title: 'Connect your wallet account',
          subtitle: 'Use the buttons to the right to connect your wallet.',
          body: (
            <WalletOptions
              onClick={async (type) => {
                if (type === 'ReadOnly') {
                  setModalCanAnimate(false)
                  reduceModalContent('form')
                } else if (type === 'AlgorandWallet') {
                  // Worse logic than all the other wallets
                  try {
                    const wallet = await connectWallet(type)
                    if (!wallet.alert) {
                      dispatch(setWallet({ address: displayWallet() }))
                    } else {
                      dispatch(setAlert(wallet.text))
                    }
                  } catch (e) {
                    console.log('error connecting wallet: ', e)
                  }
                  setModalCanAnimate(true)
                  setModalVisible(false)
                  setLoading(false)
                } else {
                  setModalCanAnimate(true)
                  setModalVisible(false)
                  setLoading(true)
                  try {
                    const wallet = await connectWallet(type)
                    if (!wallet.alert) {
                      dispatch(setWallet({ address: displayWallet() }))
                    } else {
                      dispatch(setAlert(wallet.text))
                    }
                  } catch (e) {
                    console.log('error connecting wallet: ', e)
                  }
                  setModalCanAnimate(false)
                  setLoading(false)
                }
              }}
            />
          ),
        }
      else if (action === 'form')
        return {
          title: 'Connect your account',
          subtitle:
            'Enter your wallet address key in the field provided to connect your wallet',
          body: (
            <WalletForm
              closeModal={() => {
                setModalCanAnimate(true)
                setModalVisible(false)
              }}
            />
          ),
        }
      else
        return {
          title: 'Terms of Service',
          subtitle: 'Please accept the Terms of Service in order to continue',
          body: (
            <TermsOfService
              closeModal={() => {
                setModalCanAnimate(true)
                setModalVisible(false)
              }}
              accept={(e) => {
                setModalCanAnimate(false)
                reduceModalContent('options')
              }}
            />
          ),
        }
    },
    {
      title: 'Connect your wallet account',
      subtitle: 'Use the buttons to the right to connect your wallet.',
      body: (
        <WalletOptions
          onClick={() => {
            setModalCanAnimate(true)
            setModalVisible(false)
          }}
        />
      ),
    },
  )

  return (
    <div>
      {loading ? (
        <LoadingOverlay text={'Waiting for Wallet connection...'} />
      ) : (
        <></>
      )}
      <TopBar
        style={themeStyle}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <div style={{ marginRight: 9 }}>
            <TopBarText>{contentName}</TopBarText>
          </div>
          <SimplePressable
            style={{ display: 'flex', justifyContent: 'center' }}
            onClick={() => window.location.reload()}
          >
            <img src={syncIcon} style={{ height: 24 }} alt="sync" />
          </SimplePressable>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row'}}>
          <div style={{paddingRight: 20}}> 
            <ALGOPrice/> 
          </div>
          <div>
            <PrimaryButton
              variant={walletAddress}
              text={walletAddress || 'Connect Wallet'}
              onClick={() => {
                if (walletAddress) {
                  setMainContent(CONTENT_NAMES.WALLET)
                } else {
                  reduceModalContent('terms')
                  setModalCanAnimate(true)
                  setModalVisible(true)
                }
              }}
            />
          </div>
          {walletAddress ? (
            <div style={{ marginLeft: 12 }}>
              <PrimaryButton
                variant={true}
                text="Disconnect Wallet"
                onClick={() => {
                  disconnectWallet()
                  dispatch(setWallet({ address: '' }))
                }}
              />
            </div>
          ) : (
            <></>
          )}
          <div style={{paddingLeft: 8, paddingTop: 4}}>
          <ThemeToggle />
          </div>
        </div>
      </TopBar>
      <Modal
        visible={modalVisible}
        animate={modalCanAnimate}
        title={modalContent.title}
        subtitle={modalContent.subtitle}
        close={() => {
          setModalCanAnimate(true)
          setModalVisible(false)
        }}
      >
        {modalContent.body}
      </Modal>
    </div>
  )
}

// styled components for topbar
const TopBar = styled.div`
  height: 96px;
  background: #f9fafb;
`
const TopBarText = styled.text`
  font-weight: 500;
  font-size: 20px;
`
const SimplePressable = styled.div`
  cursor: pointer;
`

/**
 * Renders each wallet option inside de modal
 * @prop {function} onClick - callback function to handle clicking on a wallet option
 */
function WalletOptions({ onClick }) {
  return (
    <div>
      <WalletOption
        style={{ marginBottom: 17 }}
        onClick={() => {
          onClick('AlgoSigner')
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={AlgoSignerLogo} style={{ width: 60 }} />
        </div>
        <div>
          <WalletOptionText>Install AlgoSigner</WalletOptionText>
        </div>
        <div>
          <img src={arrow} />
        </div>
      </WalletOption>
      <WalletOption
        style={{ marginBottom: 17 }}
        onClick={() => {
          onClick('MyAlgoConnect')
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: -5 }}>
          <img src={MyAlgoLogo} style={{ width: 50 }} />
        </div>
        <div style={{ marginRight: 10 }}>
          <WalletOptionText>My Algo Wallet</WalletOptionText>
        </div>
        <div>
          <img src={arrow} />
        </div>
      </WalletOption>
      <WalletOption
        style={{ marginBottom: 17 }}
        onClick={() => {
          onClick('AlgorandWallet')
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={AlgorandLogo} style={{ width: 40 }} />
        </div>
        <div>
          <WalletOptionText>Pera Wallet</WalletOptionText>
        </div>
        <div>
          <img src={arrow} />
        </div>
      </WalletOption>
      <WalletOption onClick={() => onClick('ReadOnly')}>
        <div>
          <IconBox />
        </div>
        <div>
          <WalletOptionText>Other Wallets</WalletOptionText>
        </div>
        <div>
          <img src={arrow} />
        </div>
      </WalletOption>
    </div>
  )
}

// Styled components for wallet options
const WalletOption = styled.button`
  width: ${window.innerWidth < 900 ? '80vw' : '327px'};
  height: 70px;
  background: transparent;
  cursor: pointer;
  border: 1px solid #464646;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px 20px;
  border-radius: 6px;
`
const IconBox = styled.div`
  border: 1px solid #000000;
  width: 33px;
  height: 27px;
`
const WalletOptionText = styled.text`
  font-weight: bold;
  font-size: 20px;
`

/**
 * Renders a form inside a modal after selecting a wallet option
 */
function WalletForm({ closeModal }) {
  const [address, setAddress] = useState('')
  const dispatch = useDispatch()
  async function handle_readonly(address) {
    // wait for the button on secondary pop-up (near line 272) to be clicked
    // const temp = await secondaryButtonClick()
    const wallet = await connectWallet('ReadOnly', address)
    dispatch(setWallet({ address: displayWallet() }))
    return wallet.address
  }
  return (
    <div>
      <div style={{ marginBottom: 26 }}>
        <div style={{ marginBottom: 8 }}>
          <InputTitle>Enter Your Wallet Address</InputTitle>
        </div>
        <div style={{ marginBottom: 8 }}>
          <Input
            placeholder="e.g. 0z3...4b99"
            value={address}
            //TODO basic validation
            onChange={(e) => setAddress(e.target.value)}
          ></Input>
        </div>
        <div>
          <InputSubtitle>Enter or copy your wallet address here.</InputSubtitle>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <PrimaryButton
          text="Connect Wallet"
          onClick={async () => {
            const temp = await handle_readonly(address)
            closeModal()
          }}
        />
        <CancelButton style={{ marginLeft: 30 }} onClick={() => closeModal()}>
          <CancelButtonText>Cancel</CancelButtonText>
        </CancelButton>
      </div>
    </div>
  )
}

// styled components for wallet form
const InputTitle = styled.text`
  font-weight: bold;
  font-size: 16px;
`
const Input = styled.input`
  height: 44px;
  width: 80%;
  border: 1px solid #dce1e6;
  padding-left: 12px;
`
const InputSubtitle = styled.text`
  font-weight: normal;
  font-size: 12px;
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
`

function TermsOfService({ closeModal, accept }) {
  return (
    <div>
      <TermsContainer style={{ marginBottom: 20 }}>
        <TermsText>
          The terms of service are located at: <a href='https://www.algogard.com/app-terms-of-use.html' target="_blank" rel="noopener noreferrer">https://www.algogard.com/app-terms-of-use.html</a>
          <br />
          <br />
          By using this application, you confirm you have reviewed, and that you agree to, the terms of service.
        </TermsText>
      </TermsContainer>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-end',
        }}
      >
        <PrimaryButton
          text="I Accept"
          onClick={() => {
            accept()
          }}
        />
        <CancelButton style={{ marginLeft: 30 }} onClick={() => closeModal()}>
          <CancelButtonText>I don't accept</CancelButtonText>
        </CancelButton>
      </div>
    </div>
  )
}

const TermsContainer = styled.div`
  height: 300px;
  overflow-y: scroll;
`
const TermsText = styled.text`
  text-overflow: clip;
`
