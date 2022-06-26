import React, { useState, useContext } from 'react'
import styled, { css, keyframes } from 'styled-components'
import dashboardIcon from '../assets/icons/dashboard_icon.png'
import algoGovernanceIcon from '../assets/icons/algo_governance_icon.png'
import auctionsIcon from '../assets/icons/auctions_icon.png'
import daoIcon from '../assets/icons/dao_icon.png'
import mintIcon from '../assets/icons/mint_icon.png'
import repayIcon from '../assets/icons/repay_icon.png'
import swapIcon from '../assets/icons/swap_icon.png'
import walletIcon from '../assets/icons/wallet_icon.png'
import logo from '../assets/gard_logo.png'
import chevronDown from '../assets/chevron_down.png'
import chevronUp from '../assets/chevron_up.png'
import hamburguerIcon from '../assets/icons/hamburger_icon.png'
import hamburguerPurpleIcon from '../assets/icons/hamburger-purple_icon.png'
import { CONTENT_NAMES } from '../globals'
import TwitterIcon from '../assets/icons/twitter_icon.png'
import RedditIcon from '../assets/icons/reddit_icon.png'
import TelegramIcon from '../assets/icons/telegram_icon.png'
import DiscordIcon from '../assets/icons/discord_icon.png'
import DocumentIcon from '../assets/icons/document_icon.png'
import TutorialIcon from '../assets/icons/tutorial_icon.png'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setAlert } from '../redux/slices/alertSlice'
import { useSelector } from 'react-redux'
import { ThemeContext } from '../contexts/ThemeContext'

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
  animate,
  toggleOpenStatus,
  allowAnimate,
}) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const walletAddress = useSelector((state) => state.wallet.address)


  const {theme} = useContext(ThemeContext)
  const DrawerStyle = {
    light: {
      background: 'linear-gradient(45deg, #42307d 0%, #7f56d9 100%)',
    },
    dark: {
      background: '#3c3c3c',
    },
    common: {
      transition: 'all 1s ease',
    },
  }
  const themeStyle = {
    ...DrawerStyle.common,
    ...(theme === 'light' ? DrawerStyle.light : DrawerStyle.dark),
  }
  return (
    <div>
      {!open ? (
        <HamburgerButton
          style={{}}
          onClick={() => {
            toggleOpenStatus()
            allowAnimate()
          }}
        >
          <HamburgerIcon alt="burger" src={hamburguerPurpleIcon} />
        </HamburgerButton>
      ) : (
        <></>
      )}
      <DrawerDiv style={themeStyle} open={open} animate={animate}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <LogoButton
            style={{
              display: 'flex',
              marginTop: 48,
              marginLeft: '03.9583333333333vw',
              marginBottom: 38,
            }}
            onClick={() => {
              if (window.innerWidth < 900) toggleOpenStatus()
              navigate('/')
            }}
          >
            <NavLogo src={logo} alt="logo" />
          </LogoButton>
          {window.innerWidth < 900 ? (
            <HamburgerButton
              style={{ position: 'relative' }}
              onClick={() => toggleOpenStatus()}
            >
              <HamburgerIcon alt="burger" src={hamburguerIcon} />
            </HamburgerButton>
          ) : (
            <></>
          )}
        </div>
        <div>
          {menuItems.map((v, i) => {
            return (
              <div
                style={{
                  marginBottom: 8,
                  display: 'flex',
                  justifyContent: 'center',
                }}
                key={i}
              >
                {v.subOptions.length < 1 ? (
                  <NavButton
                    style={{
                      paddingLeft: '3vw',
                      displey: 'flex',
                      alignItems: 'center',
                      ...(selected === v.name
                        ? { backgroundColor: 'rgba(233, 236, 251, 0.3)' }
                        : {}),
                    }}
                    onClick={() => {
                      if (
                        [
                          'Wallet',
                          'Manage CDPs',
                          'New CDP',
                          'Algo Governance',
                          'Auctions',
                          'Swap'
                        ].includes(v.name) &&
                        !walletAddress
                      )
                        dispatch(
                          setAlert(
                            'You cannot enter without first connecting a Wallet',
                          ),
                        )
                      // else if (['Swap', 'DAO'].includes(v.name))
                      //   dispatch(setAlert('This page is under construction!'))
                      else {
                        if (window.innerWidth < 900) toggleOpenStatus()
                        navigate(v.route)
                      }
                    }}
                  >
                    <div style={{ marginRight: 25 }}>
                      <ButtonIcon src={v.icon} alt={`${v.name}-icon`} />
                    </div>
                    <div style={{ display: 'flex', marginRight: 16 }}>
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
            )
          })}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            marginTop: 10,
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
              style={{ display: 'flex', alignItems: 'center' }}
              onClick={() => window.open('https://www.youtube.com/channel/UCEVv90DTh3gRNH4YweMnBTA')}
            >
              <SocialMediaIcon src={TutorialIcon} />
              <div style={{ marginLeft: 5 }}>
                <LinkText>Tutorial</LinkText>
              </div>
            </SocialMediaButton>
          </SocialMediaContainer>
          <SocialMediaContainer
            style={{
              paddingTop: 8,
              justifyContent: 'space-between',
              paddingBottom: 8,
            }}
          >
            <SocialMediaButton
              onClick={() => window.open('https://twitter.com/algogard')}
            >
              <SocialMediaIcon src={TwitterIcon} />
            </SocialMediaButton>
            <SocialMediaButton
              onClick={() => window.open('https://www.reddit.com/r/AlgoGARD')}
            >
              <SocialMediaIcon src={RedditIcon} />
            </SocialMediaButton>
            <SocialMediaButton
              onClick={() => window.open('https://t.me/AlgoGARD')}
            >
              <SocialMediaIcon src={TelegramIcon} />
            </SocialMediaButton>
            <SocialMediaButton
              onClick={() => window.open('https://discord.gg/y6rTK5S22a')}
            >
              <SocialMediaIcon src={DiscordIcon} />
            </SocialMediaButton>
          </SocialMediaContainer>
          <SocialMediaContainer
            style={{
              paddingTop: 8,
              paddingBottom: 8,
            }}
          >
            <SocialMediaButton
              style={{ display: 'flex', alignItems: 'center' }}
              onClick={() =>
                window.open('https://www.algogard.com/app-terms-of-use.html')
              }
            >
              <SocialMediaIcon src={DocumentIcon} />
              <div style={{ marginLeft: 5 }}>
                <LinkText>Terms of Service</LinkText>
              </div>
            </SocialMediaButton>
            <SocialMediaButton
              style={{ display: 'flex', alignItems: 'center' }}
              onClick={() =>
                window.open('https://algogard.com/app-privacy-policy.html')
              }
            >
              <SocialMediaIcon src={DocumentIcon} />
              <div style={{ marginLeft: 5 }}>
                <LinkText>Privacy Policy</LinkText>
              </div>
            </SocialMediaButton>
          </SocialMediaContainer>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <HideNavButton
            onClick={() => {
              allowAnimate()
              toggleOpenStatus()
            }}
          >
            <img
              src={chevronDown}
              alt="chev-down"
              style={{ transform: 'rotate(90deg)' }}
            />
          </HideNavButton>
        </div>
      </DrawerDiv>
    </div>
  )
}
// animation for closing and opening drawer
const closeDrawerAnimation = keyframes`
  0% {left: 0vw;}
  100% {left: ${`${window.innerWidth < 900 ? -101 : -20}vw`}}
`

const DrawerDiv = styled.div`
  height: 101vh;
  width: ${`${window.innerWidth < 900 ? 101 : 20}vw`};
  z-index: 15;
  left: ${`${window.innerWidth < 900 ? -101 : 0}vw`};
  position: ${`${window.innerWidth < 900 ? `absolute` : `fixed`}`};
  overflow-y: auto;
  ${(props) =>
    props.animate &&
    css`
      animation-direction: ${!props.open ? 'normal' : 'reverse'};
      animation-name: ${props.animate ? closeDrawerAnimation : ''};
      animation-duration: 0.5s;
      animation-iteration-count: 1;
      animation-fill-mode: forwards;
    `}
`
const SocialMediaContainer = styled.div`
  border-top: 1px solid white;
  width: 80%;
  display: flex;
  flex-direction: row;
`
const SocialMediaButton = styled.div`
  cursor: pointer;
`
const SocialMediaIcon = styled.img`
  height: 25px;
  color: white;
  ${SocialMediaButton}:hover & {
    opacity: 0.5;
  }
`
const LinkText = styled.text`
  font-size: 12px;
  font-weight: 500;
  color: #ffffff;
  ${SocialMediaButton}:hover & {
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
  const [dropdownClicked, setDropdownClicked] = useState(false)
  return (
    <div>
      <div>
        <NavButton
          style={{
            paddingLeft: '03.9583333333333vw',
            displey: 'flex',
            alignItems: 'center',
          }}
          onClick={() => setDropdownClicked(!dropdownClicked)}
        >
          <div style={{ marginRight: 25 }}>
            <ButtonIcon src={icon} alt={`${name}-icon`} />
          </div>
          <div style={{ display: 'flex', marginRight: 16 }}>
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
                    displey: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', marginRight: 16 }}>
                    <ButtonText>{v.name}</ButtonText>
                  </div>
                </NavButton>
              </div>
            )
          })}
        </div>
      ) : (
        <></>
      )}
    </div>
  )
}

// styled components
const LogoButton = styled.button`
  background-color: transparent;
  border-width: 0px;
  cursor: pointer;
`
const HideNavButton = styled.button`
  border-width: 0;
  background-color: transparent;
  cursor: pointer;
  &:hover {
    background-color: #381d77;
  }
`
const HamburgerButton = styled.button`
  background-color: transparent;
  height: 40px;
  width: 40px;
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-width: 0px;
  position: absolute;
`
const HamburgerIcon = styled.img`
  height: 30px;
`
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
    background-color: rgba(233, 236, 251, 0.3);
  }
`
const ButtonText = styled.text`
  color: #ffffff;
  font-size: 15px;
  font-weight: 500;
`
const ButtonIcon = styled.img`
  height: 24px;
`
const ButtonChevronIcon = styled.img`
  height: 20px;
`
const NavLogo = styled.img`
  height: 45px;
`

// items for our drawer method
const menuItems = [
  {
    name: CONTENT_NAMES.DASHBOARD,
    icon: dashboardIcon,
    subOptions: [],
    route: '/dashboard',
  },
  {
    name: CONTENT_NAMES.WALLET,
    icon: walletIcon,
    subOptions: [],
    route: '/wallet',
  },
  {
    name: CONTENT_NAMES.MINT,
    icon: mintIcon,
    subOptions: [],
    route: '/new-cdp',
  },
  {
    name: CONTENT_NAMES.REPAY,
    icon: repayIcon,
    subOptions: [],
    route: '/manage',
  },
  {
    name: CONTENT_NAMES.AUCTIONS,
    icon: auctionsIcon,
    subOptions: [],
    route: '/auctions',
  },
  {
    name: CONTENT_NAMES.SWAP,
    icon: swapIcon,
    subOptions: [],
    route: '/swap',
  },
  {
    name: CONTENT_NAMES.DAO,
    icon: daoIcon,
    subOptions: [],
    route: '/dao',
  },
  {
    name: CONTENT_NAMES.ALGO_GOVERNANCE,
    icon: algoGovernanceIcon,
    subOptions: [],
    route: '/algo-governance',
  },
]
