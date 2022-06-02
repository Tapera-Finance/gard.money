import React, { useReducer, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setAlert } from '../redux/slices/alertSlice'
import styled, {css} from 'styled-components'
import Modal from './Modal'
import PrimaryButton from './PrimaryButton'
import LoadingOverlay from './LoadingOverlay'
import { CDPsToList } from './RepayContent'
import { commitCDP, voteCDP } from '../transactions/cdp'
import { handleTxError, getWallet } from '../wallets/wallets'
import { cdpGen } from "../transactions/contracts";
import Table from './Table'

function getGovernorPage(id) {
  return 'https://governance.algorand.foundation/governance-period-3/governors/' + cdpGen(getWallet().address, id).address
}
/**
 * Content for Algo Governance option in drawer
 */
export default function AlgoGovernanceContent() {
  const [modalVisible, setModalVisible] = useState(false)
  const [modalCanAnimate, setModalCanAnimate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [modalContent, setModalContent] = useState('vote')
  const [selectedAccount, setSelectedAccount] = useState('')
  const [maxBal, setMaxBal] = useState('')
  const dispatch = useDispatch()

  const [measure1Vote, setM1Vote] = useState("Granting governor status and twice the voting power to qualified DeFi projects");
  const [measure2Vote, setM2Vote] = useState("Approve the mechanism for community proposals");


  const handleChangeMeasure1 = (event) => {
    setM1Vote(event.target.value);
  };

  const handleChangeMeasure2 = (event) => {
    setM2Vote(event.target.valu);
  };

  let loadedCDPs = CDPsToList()
  if (loadedCDPs[0].id == 'N/A') {
    loadedCDPs = dummyCdps
  }
  let adjusted = loadedCDPs.map((value) => {
    if(value.hasOwnProperty('committed')){
      return {
        id: value.id,
        balance: value.collateral == 'N/A' ? 'N/A' : (value.collateral / 1000000),
        committed: value.committed / 1000000
      }
    }
    else {
    return {
      id: value.id,
      balance: value.collateral == 'N/A' ? 'N/A' : (value.collateral / 1000000), 
    }
  }
  })
  let cdps = adjusted.map((value, index) => {
    return {
      ...value,
      commit: (
        value.committed != 0 ?
        <PrimaryButton
          text={'Committed'}
          onClick={() => {
            return
            if (value.id == 'N/A') {
              return
            }
            setModalContent('commit')
            setModalVisible(true)
            setModalCanAnimate(true)
            setSelectedAccount(value.id)
            setMaxBal(value.balance)
          }}
          // variant ={true}
          disabled = {true}
        />
        :<PrimaryButton
          text={'Commit'}
          onClick={() => {
            return
            if (value.id == 'N/A') {
              return
            }
            setModalContent('commit')
            setModalVisible(true)
            setModalCanAnimate(true)
            setSelectedAccount(value.id)
            setMaxBal(value.balance)
          }}
          // variant ={true}
          disabled = {true}
        />
      ),
      voted: (
        <PrimaryButton
          text={'Place Vote'}
          onClick={() => {
            if (value.id == 'N/A') {
              return
            }
            setModalContent('vote')
            setModalVisible(true)
            setModalCanAnimate(true)
            setSelectedAccount(value.id)
          }}
        />
      ),
      info: (
      <PrimaryButton
        text={'Governor Page'}
        onClick={() => {
          window.open(getGovernorPage(value.id))
        }}
      />
      )
    }
  })
  return (
    <div>
      {loading ? <LoadingOverlay text={'Committing to governance...'} /> : <></>}
      <Table
        title="Algorand CDPs"
        countSubtitle={`${loadedCDPs == dummyCdps ? 0 : adjusted.length} CDPs`}
        data={cdps}
      />
      <Modal
        title={modalContent === 'vote' ? 'Cast Your Vote' : 'ALGOs to Commit'}
        subtitle={
          modalContent === 'vote' ? (
            <div>
              <text>Place your vote below for </text>
              <Link href="https://governance.algorand.foundation/governance-period-3/period-3-voting-session-1">
                Governance Period #3 Voting Session #1
              </Link>
              <text>.</text>
            </div>
          ) : (
            <div>
              <text>
                Enter the number of Algo tokens you would like commit for 
                governance period #3 from 
              </text>
              <BoldText>{` CDP #${selectedAccount}.`}</BoldText>
            </div>
          )
        }
        close={() => setModalVisible(false)}
        animate={modalCanAnimate}
        visible={modalVisible}
      >
        {modalContent === 'vote' ? (
          <div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ marginBottom: 13 }}>
                <div style={{ marginBottom: 8 }}>
                  <h3>
                  <Link href="https://algorand.foundation/algorand-governance-period3-voting-measure-1-defi-participation" subtitle = {true}>
                  Measure #1:
                  </Link> Including DeFi Participants in Governance
                  </h3>
                  <InputTitle>Your Vote</InputTitle>
                  <InputMandatory>*</InputMandatory>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Select value={measure1Vote} onChange={handleChangeMeasure1}>
                    <option>"Granting governor status and twice the voting power to qualified DeFi projects"</option>
                    <option>"Keeping the status quo, only Algo holders are governors"</option>
                  </Select>
                </div>
                <div>
                  <InputSubtitle>
                    Select your vote from the drop down.
                  </InputSubtitle>
                </div>
              </div>
              <div style={{ marginBottom: 13 }}>
                <div style={{ marginBottom: 8 }}>
                  <h3>
                    <Link href="https://algorand.foundation/algorand-governance-period3-voting-measure-2-xgov" subtitle = {true}>
                    Measure #2: 
                    </Link> XGovs: Proposing & Upvoting Measures
                  </h3>
                  <InputTitle>Your Vote</InputTitle>
                  <InputMandatory>*</InputMandatory>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Select value={measure2Vote} onChange={handleChangeMeasure2}>
                    <option>"Approve the mechanism for community proposals"</option>
                    <option>"Keeping for now the status quo, only the Foundation proposes measures"</option>
                  </Select>
                </div>
                <div>
                  <InputSubtitle>
                    Select your vote from the drop down.
                  </InputSubtitle>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <PrimaryButton text="Confirm Vote" onClick={async () => {
                setModalCanAnimate(true)
                setModalVisible(false)
                setLoading(true)
                try {
                  const res = await voteCDP(selectedAccount, measure1Vote == "Granting governor status and twice the voting power to qualified DeFi projects" ? "a" : "b", measure2Vote == "Approve the mechanism for community proposals" ? "a" : "b") 
                  if (res.alert) {
                    dispatch(setAlert(res.text));
                  }
                } catch (e) {
                  handleTxError(e, 'Error sending vote');
                }
                setModalCanAnimate(false);
                setLoading(false);
              }} />
              <CancelButton style={{ marginLeft: 30 }}>
                <CancelButtonText>Cancel</CancelButtonText>
              </CancelButton>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 45, marginTop: 80 }}>
              <div style={{ marginBottom: 8 }}>
                <InputTitle>Number of Algos to Commit</InputTitle>
                <InputMandatory>*</InputMandatory>
              </div>
              <div>
                <InputSubtitle>{`${maxBal} Algos from CDP #${selectedAccount} will be committed`}</InputSubtitle>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <PrimaryButton text="Confirm Commitment" onClick={async () => {
                setModalCanAnimate(true)
                setModalVisible(false)
                setLoading(true)
                try {
                  const res = await commitCDP(selectedAccount, maxBal)
                  if (res.alert) {
                    dispatch(setAlert(res.text))
                  }
                } catch (e) {
                  handleTxError(e, 'Error committing')
                }
                setModalCanAnimate(false)
                setLoading(false)
              }}/>
              <CancelButton style={{ marginLeft: 30 }}>
                <CancelButtonText>Cancel</CancelButtonText>
              </CancelButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

// Styled Components
const SecondaryButton = styled.button`
  background: transparent;
  padding: 8px 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #6941c6;
  border-radius: 6px;
`
const SecondaryButtonText = styled.text`
  color: #6941c6;
  font-weight: 500;
  font-size: 16px;
`
const BoldText = styled.text`
  font-weight: 700;
`
const Link = styled.a`
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  color: #1849f8;
  ${(props) =>
    props.subtitle &&
    css`
      font-size: 17px;
    `}
`
const InputTitle = styled.text`
  font-weight: bold;
  font-size: 16px;
`
const Input = styled.input`
  height: 44px;
  width: 100%;
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
const Select = styled.select`
  width: 24.3055555555556vw;
  height: 44px;
  border: 1px solid #dce1e6;
  padding-left: 12px;
  box-sizing: border-box;
`
const InputMandatory = styled.text`
  font-weight: bold;
  font-size: 16px;
  color: #ff0000;
`

// Dummy info for cdp rows
const dummyCdps = [
  {
    id: 'N/A',
    collateral: 'N/A',
    commit: '',
  },
]
