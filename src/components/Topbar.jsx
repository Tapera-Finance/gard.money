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
  getWallet
} from '../wallets/wallets'

import { connectWallet } from '../wallets/wallets'
import AlgoSignerLogo from '../wallets/logos/algosigner.svg'
import MyAlgoLogo from '../wallets/logos/myalgowallet.png'
import PeraLogo from '../wallets/logos/pera.png'
import { CONTENT_NAMES } from '../globals'
import LoadingOverlay from './LoadingOverlay'
import { useAlert } from '../hooks'
import { useDispatch, useSelector } from 'react-redux'
import { setAlert } from '../redux/slices/alertSlice'
import { setWallet } from '../redux/slices/walletSlice'
import ThemeToggle from './ThemeToggle'
import { ThemeContext } from '../contexts/ThemeContext'
import { userInDB, addUserToFireStore, updateCDPs } from '../transactions/cdp'
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
                if (type === 'AlgorandWallet') {
                  // Worse logic than all the other wallets
                  try {
                    const wallet = await connectWallet(type)
                    if (!wallet.alert) {
                      dispatch(setWallet({ address: displayWallet() }))
                      const owner_address = getWallet().address
                      console.log('owneraddr', owner_address)
                      let in_DB = await userInDB(owner_address)
                      console.log('inDB?:', in_DB)
                      if (!in_DB){
                        let temp = await updateCDPs()
                        let addrs = getCDPs().keys()
                        let owned = {}
                        for (var i = 0; i < addrs.length; i++) {
                          owned[addrs[i]] = {
                          "Last Commitment": 19012922,
		                      "Commitment Timestamp": 1654264937,
		                      "Liquidated Timestamp": [-1]
                        }
                        }
                        const user = {
                          "id": owner_address,
                          "WebApp Actions": [],
                          "Owned CDPs": owned,
                          "systemAssetVal": [0, 0],
                          "systemDebtVal": [0, 0]
                        }
                        console.log('im here')
                        addUserToFireStore(user, owner_address)
                    }
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
          <ThemeToggle />
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
          <img src={PeraLogo} style={{ width: 40 }} />
        </div>
        <div>
          <WalletOptionText>Pera Wallet</WalletOptionText>
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
const WalletOptionText = styled.text`
  font-weight: bold;
  font-size: 20px;
`

// styled components for wallet form
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
