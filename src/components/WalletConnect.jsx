import React, { useState, useReducer, useEffect } from "react";
import styled, { css } from "styled-components";
import Modal from "./Modal";
import PrimaryButton from "./PrimaryButton";
import { displayWallet, disconnectWallet, getWallet } from "../wallets/wallets";
import { connectWallet } from "../wallets/wallets";
import AlgoSignerLogo from "../wallets/logos/algosigner.svg";
import MyAlgoLogo from "../wallets/logos/myalgowallet.png";
import PeraLogo from "../wallets/logos/pera.png";
import ExodusLogo from "../wallets/logos/exodus.png"
import arrow from "../assets/arrow.png";
import LoadingOverlay from "./LoadingOverlay";
import { useDispatch, useSelector } from "react-redux";
import { setAlert } from "../redux/slices/alertSlice";
import { setWallet } from "../redux/slices/walletSlice";
import { userInDB, addUserToFireStore, addReferrerToFirestore, userInTotals, addUserToTotals } from "../components/Firebase";
import { getCDPs } from "../transactions/cdp";
import { cdpGen } from "../transactions/contracts";
import { useNavigate } from "react-router-dom";
import { ids } from "../transactions/ids"
import { size, device } from "../styles/global"
import { isMobile, isSafari } from "../utils";

const instantiateUser = (address) => {
  let accountCDPs = getCDPs()[address];
  let addrs = Object.keys(accountCDPs[0]);
  addrs = addrs.concat(Object.keys(accountCDPs[ids.asa.galgo]));
  let owned = {};
  for (var i = 0; i < addrs.length; i++) {
    if (accountCDPs[addrs[i]].state == "opened") {
      let cdp_address = cdpGen(address, addrs[i]).address;
      Object.assign(owned, {
        [cdp_address]: {
          lastCommitment: -1,
          commitmentTimestamp: -1,
          liquidatedTimestamp: [-1],
        },
      });
    }
  }
  const user = {
    id: address,
    webappActions: [],
    ownedCDPs: owned,
    systemAssetVal: [0, 0],
    systemDebtVal: [0, 0],
  };
  return user;
};

export default function WalletConnect(contentName) {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalCanAnimate, setModalCanAnimate] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const walletAddress = useSelector((state) => state.wallet.address);
  const [mobile, setMobile] = useState(isMobile());
  const accountPage = contentName.contentName.contentName == "Account"

  useEffect(() => {
    setMobile(isMobile())
  }, [])

  const [modalContent, reduceModalContent] = useReducer(
    (state, action) => {
      if (action === "options")
        return {
          title: "Connect your wallet account",
          subtitle: "Use the buttons below to connect your wallet.",
          body: (
            <WalletOptions
              onClick={async (type) => {
                  if (type !== "Pera") {
                    setModalCanAnimate(true);
                    setLoading(true);
                  }
                  setModalVisible(false);
                  try {
                    const wallet = await connectWallet(type);
                    if (!wallet.alert) {
                      dispatch(setWallet({ address: displayWallet() }));
                      const owner_address = getWallet().address;
                      let in_DB = await userInDB(owner_address);
                      if (!in_DB) {
                        const user = instantiateUser(owner_address);
                        addUserToFireStore(user, owner_address);
                      }
                    } else {
                      dispatch(setAlert(wallet.text));
                    }
                  } catch (e) {
                    console.log("error connecting wallet: ", e);
                  }
                  let referrerPromise = addReferrerToFirestore(getWallet().address)
                  if (modalVisible) {
                    setModalVisible(false);
                  }
                  setLoading(false);
                  await referrerPromise
                }
              }
            />
          ),
        };
      else
        return {
          title: "Terms of Service",
          subtitle: "Please accept the Terms of Service in order to continue",
          body: (
            <TermsOfService
              closeModal={() => {
                setModalCanAnimate(true);
                setModalVisible(false);
              }}
              accept={(e) => {
                setModalCanAnimate(false);
                reduceModalContent("options");
              }}
            />
          ),
        };
    },
    {
      title: "Connect your wallet account",
      subtitle: "Use the buttons below to connect your wallet.",
      body: (
        <WalletOptions
          onClick={() => {
            setModalCanAnimate(true);
            setModalVisible(false);
          }}
        />
      ),
    },
  );

  return (
    <div>
      {loading ? (
        <LoadingOverlay text={"Waiting for Wallet connection..."} />
      ) : (
        <></>
      )}
      <WalletConnectDiv mobile={mobile} accountPage={accountPage}>
        <BtnBox>
          <WalletBarButton
            text={walletAddress || "Connect Wallet"}
            blue={true}
            onClick={() => {
              if (walletAddress) {
                navigate("/account");
              } else {
                if(isSafari()){
                  dispatch(setAlert('We noticed you are using safari. Please make sure to <a href="https://www.avast.com/c-allow-and-block-pop-ups-safari">enable pop-ups</a> to use our web app properly!'))
                }
                reduceModalContent("terms");
                setModalCanAnimate(true);
                setModalVisible(true);
              }
            }}
          />
        </BtnBox>
        {walletAddress ? (
          <BtnBox>
            {mobile ? (accountPage ?  <WalletBarButton
              text="Disconnect Wallet"
              blue={true}
              onClick={() => {
                disconnectWallet();
                dispatch(setWallet({ address: "" }));
              }}
            /> :<></>) : <></>}
          </BtnBox>
        ) : (
          <></>
        )}
      </WalletConnectDiv>
      <StyledModal
        visible={modalVisible}
        animate={modalCanAnimate}
        title={modalContent.title}
        subtitle={modalContent.subtitle}
        close={() => {
          if (modalVisible) {
            setModalCanAnimate(true);
            setModalVisible(false);
          }
        }}
      >
        {modalContent.body}
      </StyledModal>
    </div>
  );
}

const WalletBarButton = styled(PrimaryButton)`
  margin: 0px 4px 0px 4px;
  @media (${device.mobileL}) {
    width: 100%;
    margin: 2px 0px 2px 0px;
  }
`

const BtnBox = styled.div`
    margin: 4px 0px 4px 0px;

  @media (${device.mobileL}) {
    margin: 4px 0px 4px 0px;
  }
`

const WalletConnectDiv = styled.div`
  height: 96px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  ${(props) => props.mobile && css`
    flex-direction: column;
    height: 50px;
  `}
  ${(props) => props.accountPage && css`
    height: 70px;
  `}
`

const StyledModal = styled(Modal)`
  background: #172756;
`

const WalletOption = styled.button`
  width: ${window.innerWidth < 900 ? "80vw" : "327px"};
  height: 70px;
  background: transparent;
  cursor: pointer;
  border: 1px solid #e8e8e8;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px 20px;
  border-radius: 6px;
`;
const WalletOptionText = styled.text`
  font-weight: bold;
  font-size: 20px;
  color: white;
`;

// styled components for wallet form
const CancelButton = styled.button`
  border: 0px;
  background: transparent;
  display: flex;
  align-items: center;
  height: "100%";
  cursor: pointer;
`;
const CancelButtonText = styled.text`
  font-weight: 500;
  font-size: 16px;
  color: white;
`;

const TermsContainer = styled.div`
  height: ${window.innerWidth < 769 ? "100%" : "300px"};
  overflow-y: scroll;
`;
const TermsText = styled.text`
  text-overflow: clip;
  height: 100%;
`;


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
          onClick("AlgoSigner");
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src={AlgoSignerLogo} style={{ width: 60 }} />
        </div>
        <div>
          <WalletOptionText>AlgoSigner</WalletOptionText>
        </div>
        <div>
          <img src={arrow} />
        </div>
      </WalletOption>
      <WalletOption
        style={{ marginBottom: 17 }}
        onClick={() => {
          onClick("MyAlgoConnect");
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginLeft: -5 }}>
          <img src={MyAlgoLogo} style={{ width: 50 }} />
        </div>
        <div style={{ marginRight: 10 }}>
          <WalletOptionText>MyAlgo Wallet</WalletOptionText>
        </div>
        <div>
          <img src={arrow} />
        </div>
      </WalletOption>
      <WalletOption
        style={{ marginBottom: 17 }}
        onClick={() => {
          onClick("Pera");
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src={PeraLogo} style={{ width: 40 }} />
        </div>
        <div>
          <WalletOptionText>Pera Wallet</WalletOptionText>
        </div>
        <div>
          <img src={arrow} />
        </div>
      </WalletOption>
      <WalletOption
        style={{ marginBottom: 17 }}
        onClick={() => {
          onClick("Exodus");
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src={ExodusLogo} style={{ width: 40 }} />
        </div>
        <div>
          <WalletOptionText>Exodus Wallet</WalletOptionText>
        </div>
        <div>
          <img src={arrow} />
        </div>
      </WalletOption>
    </div>
  );
}

function TermsOfService({ closeModal, accept }) {
  return (
    <div>
      <TermsContainer
        style={{ marginBottom: `${window.innerWidth < 769 ? "50px" : "20px"}` }}
      >
        <TermsText>
          The terms of service are located at:{" "}
          <a
            href="https://www.algogard.com/app-terms-of-use.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://www.algogard.com/app-terms-of-use.html
          </a>
          <br />
          <br />
          By using this application, you confirm you have reviewed, and that you
          agree to, the terms of service.
        </TermsText>
      </TermsContainer>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-end",
        }}
      >
        <PrimaryButton
          text="I Accept"
          blue={true}
          onClick={() => {
            accept();
          }}
        />
        <CancelButton style={{ marginLeft: 30 }} onClick={() => closeModal()}>
          <CancelButtonText>I don't accept</CancelButtonText>
        </CancelButton>
      </div>
    </div>
  );
}


