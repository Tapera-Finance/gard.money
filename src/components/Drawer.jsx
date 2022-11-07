import React, { useState, useContext, useEffect } from "react";
import styled, { css, keyframes } from "styled-components";
import analyticsIcon from "../assets/icons/dashboard_icon.png";
import borrowIcon from "../assets/icons/algo_governance_icon.png";
import auctionsIcon from "../assets/icons/document_icon.png";
import governIcon from "../assets/icons/auctions_icon.png";
import daoIcon from "../assets/icons/dao_icon.png";
import mintIcon from "../assets/icons/mint_icon.png";
import repayIcon from "../assets/icons/repay_icon.png";
import swapIcon from "../assets/icons/swap_icon.png";
import stakeIcon from "../assets/icons/icons8-stake-block-64.png"
import walletIcon from "../assets/icons/wallet_icon.png";
import logo from "../assets/new_gard_logo.png";
import chevronDown from "../assets/chevron_down.png";
import chevronUp from "../assets/chevron_up.png";
import hamburguerIcon from "../assets/icons/hamburger_icon.png";
import closeIcon from "../assets/icons/close_icon.png"
import hamburguerPurpleIcon from "../assets/icons/hamburger-purple_icon.png";
import { CONTENT_NAMES } from "../globals";
import TwitterIcon from "../assets/icons/twitter_icon.png";
import RedditIcon from "../assets/icons/reddit_icon.png";
import ALGOPrice from "./ALGOPrice";
import TelegramIcon from "../assets/icons/telegram_icon.png";
import DiscordIcon from "../assets/icons/discord_icon.png";
import MediumIcon from "../assets/icons/icons8-medium-48.png"
import DocumentIcon from "../assets/icons/document_icon.png";
import TutorialIcon from "../assets/icons/tutorial_icon.png";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAlert } from "../redux/slices/alertSlice";
import { useSelector } from "react-redux";
import { device, size } from "../styles/global";
import { px2vw } from "../utils"

/**
 * Used as our main navigation
 * @prop {boolean} open - defines if drawer should be open
 * @prop {boolean} animate - defines if drawer should be animated, prevents animation on page load
 * @prop {function} toggleOpenStatus - callback for changing the open state
 * @prop {function} allowAnimate - callback to set animate status as true
 * @prop {function} setMainContent - callback to set our page main content
 * @param {{open: boolean, animate: boolean, toggleOpenStatus: function, allowAnimate: function, setMainContent: function}} props
 */
export default function Drawer({
  selected,
  open,
  mobile,
  animate,
  toggleOpenStatus,
  allowAnimate,
}) {
  const [dev, setDev] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const walletAddress = useSelector((state) => state.wallet.address);



  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "baseline"
    }} >
        <MobileDrawer>
          <LogoButton
            style={{
              display: "flex",
              marginTop: 13,
              width: 50,
              height: 20,
              marginLeft: "03.9583333333333vw",
            }}
            onClick={() => {
              if (window.innerWidth < 900) toggleOpenStatus();
              navigate("/");
            }}
          >
            <MobileNavLogo src={logo} alt="logo" />
          </LogoButton>
        <HamburgerButton
          style={{}}
          onClick={() => {
            toggleOpenStatus();
            allowAnimate();
          }}
        >
          <HamburgerIcon alt="burger" src={hamburguerIcon} />
        </HamburgerButton>
        </MobileDrawer>

      <DrawerDiv id="drawer" open={open} animate={animate}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{display: "flex", justifyContent: "space-evenly"}} >
          <LogoButton
            style={{
              display: "flex",
              marginTop: 48,
              marginLeft: "03.9583333333333vw",
              marginBottom: 38,
            }}
            onClick={() => {
              if (window.innerWidth < 900) toggleOpenStatus();
              navigate("/");
            }}
          >
            <NavLogo src={logo} alt="logo" />
          </LogoButton>
        <HamburgerButton
          style={{}}
          onClick={() => {
            toggleOpenStatus();
            allowAnimate();
          }}
          >
            <HamburgerIcon alt="burger" src={!open ? hamburguerIcon : closeIcon} />
          </HamburgerButton>

          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "8px",
              marginBottom: "8px",
            }}
          >
            <ALGOPrice style={{ alignSelf: "center" }} />
          </div>
        </div>
        <div>
          {menuItems.map((v, i) => {
            return (
              <div
                style={{
                  marginBottom: 8,
                  display: "flex",
                  justifyContent: "center",
                }}
                key={i}
              >
                {v.subOptions.length < 1 ? (
                  <NavButton
                    style={{
                      paddingLeft: "3vw",
                      display: "flex",
                      alignItems: "center",
                      textAlign: "left",
                      ...(selected === v.name
                        ? { backgroundColor: "#172756" }
                        : {}),
                    }}
                    onClick={() => {
                      if (
                        [
                          "Account",
                          // "Manage CDPs",
                          "Borrow",
                          "ALGO Governance",
                          "Swap",
                          "Stake",
                          "Govern",
                          "Auctions",
                        ].includes(v.name) &&
                        !walletAddress
                      )
                        dispatch(
                          setAlert(
                            "You cannot enter without first connecting a Wallet",
                          ),
                        );
                      else if (["DAO"].includes(v.name)) {
                        dispatch(setAlert("This page is under construction!"));
                      } else if (["Actions"].includes(v.name) && !dev) {
                        dispatch(setAlert("This page is under construction!"));
                      }  else {
                        if (window.innerWidth < parseInt(size.tablet)) toggleOpenStatus();
                        navigate(v.route);
                      }
                    }}
                  >
                    <div style={{ marginRight: 25 }}>
                      <ButtonIcon src={v.icon} alt={`${v.name}-icon`} />
                    </div>
                    <div style={{ display: "flex", marginRight: 16 }}>
                      <ButtonText>{v.name}</ButtonText>
                    </div>
                  </NavButton>
                ) : (
                  <DropdownNavButton
                    name={v.name}
                    icon={v.icon}
                    subOptions={v.subOptions}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <HideNavButton
            onClick={() => {
              allowAnimate();
              toggleOpenStatus();
            }}
          >
            <img
              src={chevronDown}
              alt="chev-down"
              style={{ transform: "rotate(90deg)" }}
            />
          </HideNavButton>
        </div>
        <div style={{
          top: "85vh", left: 0, right: 0
          }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              marginTop: 10,
              bottom: 0,
              width: "100%",
              height: "2.5rem"

            }}
          >
            <SocialMediaContainer
              style={{
                paddingTop: 8,
                paddingBottom: 8,
                borderTop: 0,
              }}
            >
              <SocialMediaButton
                onClick={() =>
                  window.open(
                    "https://youtu.be/6IeOb_NZDm4",
                  )
                }
              >
                <div>
                  <LinkText>Tutorial</LinkText>
                </div>
              </SocialMediaButton>
              <SocialMediaButton
                onClick={() =>
                  window.open(
                    "https://docs.algogard.com",
                  )
                }
              >
                <div>
                  <LinkText>Gitbook</LinkText>
                </div>
              </SocialMediaButton>
            </SocialMediaContainer>
            <TermLinkBox
              style={{
                paddingTop: 12,
                paddingBottom: 12,
                display: "flex",
              }}
            >
              <ToS
                onClick={() =>
                  window.open("https://www.algogard.com/app-terms-of-use.html")
                }
              >
                Terms & Conditions
              </ToS>
              <PP
                onClick={() =>
                  window.open("https://algogard.com/app-privacy-policy.html")
                }
              >
                Privacy Policy
              </PP>
            </TermLinkBox>
            <SocialMediaContainer
              style={{
                paddingTop: 8,
                justifyContent: "space-evenly",
                paddingBottom: 8,
              }}
            >
              <SocialMediaButton
                onClick={() => window.open("https://discord.gg/y6rTK5S22a")}
              >
                <SocialMediaIcon src={DiscordIcon} />
              </SocialMediaButton>
              <SocialMediaButton
                onClick={() => window.open("https://www.reddit.com/r/AlgoGARD")}
              >
                <SocialMediaIcon src={RedditIcon} />
              </SocialMediaButton>
              <SocialMediaButton
                onClick={() => window.open("https://twitter.com/algogard")}
              >
                <SocialMediaIcon src={TwitterIcon} />
              </SocialMediaButton>
              <SocialMediaButton onClick={() => window.open("https://t.me/AlgoGARD")}>
                <SocialMediaIcon src={TelegramIcon} />
              </SocialMediaButton>
              <SocialMediaButton onClick={() => window.open("https://medium.com/@AlgoGARD")}>
                <MediumLogo src={MediumIcon} />
              </SocialMediaButton>
            </SocialMediaContainer>
          </div>
        </div>
      </DrawerDiv>
    </div>
  );
}

const MobileDrawer = styled.div`
  background: linear-gradient(80deg, #172756 0%, #000000 100%);
  display: flex;
  margin-bottom: 7vh;
  justify-content: space-between;
  align-items: baseline;
  width: 100vw;
  height: 7vh;
  @media (min-width: ${size.tablet}) {
    appearance: none;
    visibility: hidden;
  }

`

const DrawerDiv = styled.div`
  background: linear-gradient(80deg, #172756 0%, #000000 100%);
  height: 101vh;
  z-index: 15;
  overflow-y: auto;

  // if screen is smaller than tablet, hide drawer until opened at full width
  @media (${device.tablet}) {
    visibility: hidden;
    position: absolute;
    ${(props) =>
      props.open &&
      css`
        visibility: visible;
        width: 100vw;
        overflow: scroll;
        position: unset;
        position: fixed;
      `}
    ${(props) =>
      !props.open &&
      css`
        height: 101vh;
        margin-left: 0vw;
      `}
  }
  // if screen is larger than tablet, show drawer always
  @media (min-width: ${size.tablet}) {
    ${(props) =>
      props.open &&
      css`
        visibility: visible;
        height: 101vh;
        position: fixed;
      `}
    ${(props) =>
      !props.open &&
      css`
        visibility: visible;
        height: 101vh;
        position: fixed;
      `}
  }
  // if screen is smaller than tablet, eliminate left margin
`;
const SocialMediaContainer = styled.div`
  width: 80%;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
`;

const TermLinkBox = styled.div`
  width: 80%;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  @media (max-width: 1246px) {
    width: 65%;
  }
`

const SocialMediaButton = styled.div`
  cursor: pointer;
`;
const SocialMediaIcon = styled.img`
  height: 30px;
  color: white;
  ${SocialMediaButton}:hover & {
    opacity: 0.5;
  }
`;

const MediumLogo = styled.img`
height: 30px;
color: white;
filter: invert();
${SocialMediaButton}:hover & {
  opacity: 0.5;
}
`;

const LinkText = styled.text`
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  ${SocialMediaButton}:hover & {
    opacity: 0.5;
  }
`;
const ToS = styled.text`
  font-size: 12px;
  font-style: italic;
  font-weight: 500;
  padding-right: 3px;
  cursor: pointer;
  color: #ffffff;
  :hover& {
    opacity: 0.5;
  }
`;

const PP = styled.text`
  font-size: 12px;
  font-style: italic;
  font-weight: 500;
  cursor: pointer;
  color: #ffffff;
  :hover& {
    opacity: 0.5;
  }
`

/**
 * Renders a dropdown menu button for the drawer
 * @prop {string} name - main button text
 * @prop {Image} icon - main button left icon
 * @prop {object[]} subOptions - array containing all options under the main button
 * @param {{name: string, icon: Image, subOptions: object[]}} props
 */
function DropdownNavButton({ name, icon, subOptions }) {
  const [dropdownClicked, setDropdownClicked] = useState(false);
  return (
    <div>
      <div>
        <NavButton
          style={{
            paddingLeft: "03.9583333333333vw",
            displey: "flex",
            alignItems: "center",
          }}
          onClick={() => setDropdownClicked(!dropdownClicked)}
        >
          <div style={{ marginRight: 25 }}>
            <ButtonIcon src={icon} alt={`${name}-icon`} />
          </div>
          <div style={{ display: "flex", marginRight: 16 }}>
            <ButtonText>{name}</ButtonText>
          </div>
          <div>
            <ButtonChevronIcon
              src={!dropdownClicked ? chevronDown : chevronUp}
              alt="chevron"
            />
          </div>
        </NavButton>
      </div>
      {dropdownClicked ? (
        <div style={{ marginTop: 5 }}>
          {subOptions.map((v, i) => {
            return (
              <div key={i}>
                <NavButton
                  style={{
                    paddingLeft: 107,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", marginRight: 16 }}>
                    <ButtonText>{v.name}</ButtonText>
                  </div>
                </NavButton>
              </div>
            );
          })}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

// styled components
const LogoButton = styled.button`
  background-color: transparent;
  border-width: 0px;
  cursor: pointer;
`;
const HideNavButton = styled.button`
  border-width: 0;
  background-color: transparent;
  cursor: pointer;
  &:hover {
    background-color: #019fff;
  }
`;
const HamburgerButton = styled.button`
  background-color: transparent;
  height: 40px;
  width: 40px;
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-width: 0px;
  /* position: absolute; */
`;
const HamburgerIcon = styled.img`
  height: 30px;
  @media (min-width: ${size.tablet}) {
    visibility: hidden;
  }
`;
const NavButton = styled.button`
  border-width: 0;
  background-color: transparent;
  height: 50px;
  width: 90%;
  display: flex;
  flex-direction: row;
  cursor: pointer;
  border-radius: 6px;
  &:hover {
    background-color: #172756;
  }
`;
const ButtonText = styled.text`
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
`;
const ButtonIcon = styled.img`
  height: 24px;
`;
const ButtonChevronIcon = styled.img`
  height: 20px;
`;
const NavLogo = styled.img`
  height: 50px;
`;
const MobileNavLogo = styled.img`
  height: 25px;
`

// items for our drawer method
const menuItems = [
  {
    name: CONTENT_NAMES.BORROW,
    icon: borrowIcon,
    subOptions: [],
    route: "/borrow",
  },
  {
    name: CONTENT_NAMES.SWAP,
    icon: swapIcon,
    subOptions: [],
    route: "/swap",
  },
  {
    name: CONTENT_NAMES.STAKE,
    icon: stakeIcon,
    subOptions: [],
    route: "/stake"
  },
  {
    name: CONTENT_NAMES.GOVERN,
    icon: governIcon,
    subOptions: [],
    route: "/govern",
  },
  {
    name: CONTENT_NAMES.AUCTIONS,
    icon: auctionsIcon,
    subOptions: [],
    route: "/auctions",
  },
  // {
  //   name: CONTENT_NAMES.DAO,
  //   icon: daoIcon,
  //   subOptions: [],
  //   route: "/dao",
  // },
  {
    name: CONTENT_NAMES.ANALYTICS,
    icon: analyticsIcon,
    subOptions: [],
    route: "/analytics",
  },
  {
    name: CONTENT_NAMES.ACCOUNT,
    icon: walletIcon,
    subOptions: [],
    route: "/account",
  },
];
