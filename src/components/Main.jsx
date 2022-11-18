import React, { useEffect, useState, useContext } from "react";
import styled, { keyframes, css } from "styled-components";
import HomeContent from "../pages/HomeContent";
import Drawer from "./Drawer";
import Topbar from "./Topbar";
import { CONTENT_NAMES } from "../globals";
import AnalyticsContent from "../pages/AnalyticsContent";
import AccountContent from "../pages/AccountContent";
import BorrowContent from "../pages/BorrowContent";
import AuctionsContent from "../pages/AuctionsContent";
import ActionsContent from "../pages/ActionsContent";
import DaoContent from "../pages/DaoContent";
import GovernContent from "../pages/GovernContent";
import AlertOverlay from "./AlertOverlay";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { hide } from "../redux/slices/alertSlice";
import SwapDetails from "./actions/SwapDetails";
import StakeDetails from "./actions/StakeDetails";
import { size, device } from "../styles/global"
import { isMobile } from "../utils"

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

function debounce(fn, ms) {
  let timer
  return _ => {
    clearTimeout(timer)
    timer = setTimeout(_ => {
      timer = null
      fn.apply(this, arguments)
    }, ms)
  }
}

/**
 * This holds our drawer navigation, the recurring top bar, and the main content
 */
export default function Main(WrappedComponent, title) {
  const [isOpen, setIsOpen] = useState(true);
  const [mobile, setMobile] = useState(isMobile());
  const [canAnimate, setCanAnimate] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalCanAnimate, setModalCanAnimate] = useState(false);
  const [mainContent, setMainContent] = useState("Home");
  const [dimmensions, setDimmensions] = useState({
    width: undefined,
    height: undefined
  })

  useEffect(() => {
    setMobile(isMobile())
  }, [])


  useEffect(() => {
    // Handler to call on window resize
    const debouncedHandleResize = debounce(function handleResize() {
      // Set window width/height to state
      setDimmensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, 1000)

    // Add event listener
    window.addEventListener("resize", debouncedHandleResize);
    // Call handler right away so state gets updated with initial window size
    debouncedHandleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", debouncedHandleResize);
  }, []);


  useEffect(() => {
    setIsOpen(window.innerWidth > size.tablet);
    // setIsMobile(window.innerWidth < size.tablet)
    // Google Analytics
    googleStuff();
  }, []);

  useEffect(() => {
    if (dimmensions && dimmensions.width > parseInt(size.tablet)) {
      setIsOpen(true);
    }
  }, [dimmensions])

  const dispatch = useDispatch();
  const alertData = useSelector((state) => state.alert);

  const body = document.querySelector("body");
  body.style.backgroundColor = "#172756";

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {alertData.visible === true ? (
        <AlertOverlay
          text={alertData.text}
          requestClose={() => dispatch(hide())}
        />
      ) : (
        <></>
      )}

      <ContainedDrawer
        selected={title}
        // open={isOpen}
        animate={canAnimate}
        // toggleOpenStatus={() => setIsOpen(!isOpen)}
        allowAnimate={() => setCanAnimate(true)}
      />
      <MainContentDiv mobile={mobile} canAnimate={canAnimate} isOpen={isOpen}>
        <Topbar
          contentName={title}
          setMainContent={(content) => {
            setCanAnimate(false);
            setModalCanAnimate(false);
          }}
          style={{ background: "#172756" }}
        />
        <ContentContainer isOpen={isOpen}>
          <Wrapper style={{maxWidth: `${mobile ? "100%" : ""}`}} >
            <WrappedComponent />
          </Wrapper>
        </ContentContainer>
      </MainContentDiv>
    </div>
  );
}

const ContainedDrawer = styled(Drawer)`
  /* ${(props) => props.open &&
      css`
        visibility: hidden;
      `
    }
    ${(props) => !props.open &&
      css`
        visibility: visible;
      `
    } */
`

const Wrapper = styled.div`
  /* padding-left: 1.9444444444444vw;
  padding-right: 1.9444444444444vw; */
  padding-top: 40px;
  flex: 1;
  @media (min-width: ${size.tablet}) {
    padding-left: 6.9444444444444vw;
    padding-right: 6.9444444444444vw;
  }
  @media (${device.mobileM}) {
    padding-left: 0vw;
    width: 100%;
  }
  ${(props) => props.mobile && css`
    max-width: 100%;
  `}
`

const ContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  @media (${device.tablet}) {
    margin-left: 0vw;
  }
  @media (min-width: ${size.tablet}) {
    //
  }
`

//animation to expand or retract the main content container, depending on if the drawer is open or closed
const expandMainContentAnimation = keyframes`
  0% {margin-left: 20vw;}
  100% {margin-left: 0vw;}
`;

// main styled components
const MainContentDiv = styled.div`
  width: ${`${parseInt(window.availWidth) - 64}px`};
  animation-duration: 0.5s;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
  color: white;
  /* overflow-x: scroll; */
  max-width: 100%;
  overflow: hidden;
  /* ${(props) => css`
  animation-direction: ${!props.isOpen ? "normal" : "reverse"};
  animation-name: ${props.canAnimate && window.innerWidth > 900
      ? expandMainContentAnimation
      : ""};
  `} */
    ${(props) =>
      props.mobile &&
        css`
          width: 100%;

        `
      }
  @media (${device.tablet}) {
    margin-left: 0vw;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }
  @media (min-width: ${size.tablet}) {
    margin-left: 23.75vw;
  }
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
  color: #7c52ff;
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
    case CONTENT_NAMES.ACCOUNT:
      return <AccountContent walletAddress={walletAddress} />;
    case CONTENT_NAMES.BORROW:
      return <BorrowContent />;
    case CONTENT_NAMES.AUCTIONS:
      return <AuctionsContent />;
    case CONTENT_NAMES.SWAP:
      return <SwapDetails />
    case CONTENT_NAMES.STAKE:
      return <StakeDetails />;
    case CONTENT_NAMES.ACTIONS:
      return <ActionsContent />;
    case CONTENT_NAMES.DAO:
      return <DaoContent />;
    case CONTENT_NAMES.GOVERN:
      return <GovernContent />;
    case CONTENT_NAMES.ANALYTICS:
      return <AnalyticsContent />;

    default:
      return <div></div>;
  }
}
