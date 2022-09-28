import React, { useState, useReducer, useEffect } from "react";
import styled from "styled-components";
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
import { userInDB, addUserToFireStore } from "../components/Firebase";
import { getCDPs } from "../transactions/cdp";
import { cdpGen } from "../transactions/contracts";
import { useNavigate } from "react-router-dom";

const instantiateUser = async (address) => {
  let accountCDPs = getCDPs()[address];
  let addrs = Object.keys(getCDPs()[address]);
  let owned = {};
  for (var i = 0; i < addrs.length; i++) {
    if (accountCDPs[addrs[i]].state == "open") {
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

export default function WalletConnect() {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalCanAnimate, setModalCanAnimate] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const walletAddress = useSelector((state) => state.wallet.address);
  const [modalContent, reduceModalContent] = useReducer(
    (state, action) => {
      if (action === "options")
        return {
          title: "Connect your wallet account",
          subtitle: "Use the buttons below to connect your wallet.",
          body: (
            <WalletOptions
              onClick={async (type) => {
                if (type === "AlgorandWallet") {
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
                  setModalCanAnimate(true);
                  setModalVisible(false);
                  setLoading(false);
                } else {
                  setModalCanAnimate(true);
                  setModalVisible(false);
                  setLoading(true);
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
                  setModalCanAnimate(false);
                  setLoading(false);
                }
              }}
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
      <WalletConnectDiv>
        <div>
          <PrimaryButton
            text={walletAddress || "Connect Wallet"}
            blue={true}
            onClick={() => {
              if (walletAddress) {
                navigate("/account");
              } else {
                reduceModalContent("terms");
                setModalCanAnimate(true);
                setModalVisible(true);
              }
            }}
          />
        </div>
        {walletAddress ? (
          <div style={{ marginLeft: 12 }}>
            <PrimaryButton
              text="Disconnect Wallet"
              blue={true}
              onClick={() => {
                disconnectWallet();
                dispatch(setWallet({ address: "" }));
              }}
            />
          </div>
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
          setModalCanAnimate(true);
          setModalVisible(false);
        }}
      >
        {modalContent.body}
      </StyledModal>
    </div>
  );
}

const WalletConnectDiv = styled.div`
  height: 96px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`

const StyledModal = styled(Modal)`
  background: #172756
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
          onClick("AlgoSigner");
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
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
          onClick("MyAlgoConnect");
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginLeft: -5 }}>
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
          onClick("AlgorandWallet");
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

const TermsContainer = styled.div`
  height: ${window.innerWidth < 769 ? "100%" : "300px"};
  overflow-y: scroll;
`;
const TermsText = styled.text`
  text-overflow: clip;
  height: 100%;
`;
