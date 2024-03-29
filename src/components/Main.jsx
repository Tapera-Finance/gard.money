import React, { useEffect, useState, useContext } from "react";
import styled, { keyframes, css } from "styled-components";
import HomeContent from "../pages/HomeContent";
import Drawer from "./Drawer";
import Topbar from "./Topbar";
import { CONTENT_NAMES } from "../globals";
import DashboardContent from "../pages/DashboardContent";
import WalletContent from "../pages/WalletContent";
import MintContent from "../pages/MintContent";
import RepayContent from "../pages/RepayContent";
import AuctionsContent from "../pages/AuctionsContent";
import SwapContent from "../pages/SwapContent";
import DaoContent from "../pages/DaoContent";
import AlgoGovernanceContent from "../pages/AlgoGovernanceContent";
import PrimaryButton from "./PrimaryButton";
import helpIcon from "../assets/icons/help_icon.png";
import { useForceUpdate, useWindowSize } from "../hooks";
import { displayWallet } from "../wallets/wallets";

import Modal from "./Modal";
import AlertOverlay from "./AlertOverlay";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { hide } from "../redux/slices/alertSlice";
import { ThemeContext } from "../contexts/ThemeContext";

async function googleStuff() {
  const script = document.createElement("script");

  script.src = "https://www.googletagmanager.com/gtag/js?id=G-Z87TCKZXLL";
  script.async = true;

  document.body.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "G-Z87TCKZXLL");
  return 0;
}

/**
 * This holds our drawer navigation, the recurring top bar, and the main content
 */
export default function Main(WrappedComponent, title) {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 900);
  const [canAnimate, setCanAnimate] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalCanAnimate, setModalCanAnimate] = useState(false);
  const [mainContent, setMainContent] = useState("Home");
  const [walletAddress, setWalletAddress] = useState(displayWallet());
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    setIsOpen(window.innerWidth > 900);

    // Google Analytics
    googleStuff();
  }, []);
  const dispatch = useDispatch();
  const alertData = useSelector((state) => state.alert);

  //Dark theme context
  const { theme } = useContext(ThemeContext);

  const body = document.querySelector("body");
  body.style.transition = "all 1s ease";
  theme === "dark"
    ? (body.style.backgroundColor = "#121212")
    : (body.style.backgroundColor = "#ffffff");

  const MainStyle = {
    light: {
      backgroundColor: "#ffffff",
    },
    dark: {
      backgroundColor: "#121212",
      color: "white",
    },
    common: {
      transition: "all 1s ease",
    },
  };
  const themeStyle = {
    ...MainStyle.common,
    ...(theme === "light" ? MainStyle.light : MainStyle.dark),
  };

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      {alertData.visible === true ? (
        <AlertOverlay
          text={alertData.text}
          requestClose={() => dispatch(hide())}
        />
      ) : (
        <></>
      )}
      <Drawer
        selected={title}
        open={isOpen}
        animate={canAnimate}
        toggleOpenStatus={() => setIsOpen(!isOpen)}
        allowAnimate={() => setCanAnimate(true)}
      />
      <MainContentDiv
        style={themeStyle}
        canAnimate={canAnimate}
        isOpen={isOpen}
      >
        <Topbar
          contentName={title}
          setMainContent={(content) => {
            setCanAnimate(false);
            setModalCanAnimate(false);
          }}
        />
        <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
          <div
            style={{
              paddingLeft: "6.9444444444444vw",
              paddingRight: "6.9444444444444vw",
              paddingTop: 40,
              flex: 1,
            }}
          >
            {/* <MainContentHandler
              content={mainContent}
              walletAddress={walletAddress}
            /> */}
            <WrappedComponent />
          </div>
          <div
            style={{
              width: "6.9444444444444vw",
              height: window.innerHeight - 96,
              position: "fixed",
              right: 0,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            <HelpButton
              style={{ marginBottom: 42 }}
              onClick={() => {
                setModalVisible(true);
                setModalCanAnimate(true);
              }}
            >
              <img src={helpIcon} />
            </HelpButton>
          </div>
        </div>
      </MainContentDiv>
      <Modal
        title="Have any feedback on our web app?"
        visible={modalVisible}
        animate={modalCanAnimate}
        close={() => setModalVisible(false)}
        darkToggle={theme === "dark"}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ContactUsText>
            {"Please let us know via email at"}
            <Link
              darkToggle={theme === "dark"}
              href="mailto:hello@algogard.com"
            >
              {" "}
              hello@algogard.com
            </Link>
          </ContactUsText>
        </div>
      </Modal>
    </div>
  );
}

//animation to expand or retract the main content container, depending on if the drawer is open or closed
const expandMainContentAnimation = keyframes`
  0% {margin-left: 20vw;}
  100% {margin-left: 0vw;}
`;

// main styled components
const MainContentDiv = styled.div`
  margin-left: ${`${window.innerWidth < 900 ? 0 : 20}vw`};
  width: 100%;
  animation-duration: 0.5s;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
  ${(props) => css`
    animation-direction: ${!props.isOpen ? "normal" : "reverse"};
    animation-name: ${props.canAnimate && window.innerWidth > 900
      ? expandMainContentAnimation
      : ""};
  `}
`;
const HelpButton = styled.div`
  cursor: pointer;
`;
const ContactUsText = styled.text`
  text-align: center;
  font-size: 24px;
`;
const Link = styled.a`
  text-decoration: none;
  font-weight: 500;
  color: #1849f8;
  ${(props) =>
    props.darkToggle &&
    css`
      color: #99b2ff;
    `}
`;

/**
 * Here we can add future content options
 * @prop {string} content - unique content name
 * @param {{content: string}} props
 */
function MainContentHandler({ content, walletAddress }) {
  switch (content) {
    case CONTENT_NAMES.HOME:
      return <HomeContent />;
    case CONTENT_NAMES.DASHBOARD:
      return <DashboardContent />;
    case CONTENT_NAMES.WALLET:
      return <WalletContent walletAddress={walletAddress} />;
    case CONTENT_NAMES.MINT:
      return <MintContent />;
    case CONTENT_NAMES.REPAY:
      return <RepayContent />;
    case CONTENT_NAMES.AUCTIONS:
      return <AuctionsContent />;
    case CONTENT_NAMES.SWAP:
      return <SwapContent />;
    case CONTENT_NAMES.DAO:
      return <DaoContent />;
    case CONTENT_NAMES.ALGO_GOVERNANCE:
      return <AlgoGovernanceContent />;

    default:
      return <div></div>;
  }
}
