import React, { useEffect, useState } from 'react'
import styled, { css, keyframes } from 'styled-components'
import closeIcon from '../assets/icons/close_icon.png'
import { useWindowSize } from '../hooks'

/**
 * @prop {boolean} visible - This indicates whether the modal should be shown or not
 * @prop {function} close - Function that handles the modal closing
 * @prop {string} title - This is the title shown to the left of the modal
 * @prop {string} subtitle - Subtitle shown at the left, under the title
 * @prop {React.ReactNode} children - This is the component rendered at the right of the modal, its main content
 * @prop {boolean} animate - Handles whether the modal animation should be active
 * @param {{visible: boolean, close: function, title: string, subtitle: string, children: React.ReactNode, animate: boolean}} props
 */
export default function Modal({
  visible,
  close,
  title,
  subtitle,
  children,
  animate,
  darkToggle,
  mint,
}) {
  return (
    <div>
      <Backdrop animate={animate} visible={visible} onClick={() => close()}>
        <MainContent
          animate={animate}
          visible={visible}
          darkToggle={darkToggle}
          onClick={(e) => e.stopPropagation()}
          mint={mint}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: 21,
              marginRight: 24,
            }}
          >
            <CloseButton onClick={() => close()}>
              <img src={closeIcon} />
            </CloseButton>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: window.innerWidth < 900 ? 'column' : 'row',
              marginTop: window.innerWidth < 900 ? 10 : mint ? 25 : 104,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: 252.55, marginRight: 62.5 }}>
              <div style={{ marginBottom: 8 }}>
                <Title darkToggle={darkToggle}>{title}</Title>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Subtitle darkToggle={darkToggle}>{subtitle}</Subtitle>
              </div>
            </div>
            <div
              style={
                window.innerWidth < 900 ? { width: '85vw' } : { width: 359.9 }
              }
            >
              {children}
            </div>
          </div>
        </MainContent>
      </Backdrop>
    </div>
  )
}
// animation for closing and opening modal
const closeModalAnimation = keyframes`
  0% {bottom: -200vh;}
  1% {bottom: -200vh;}
  99% {bottom: ${window.innerWidth < 900 ? ' 20vh' : '5vh'};}
  100% {bottom: ${window.innerWidth < 900 ? ' 20vh' : '5vh'};}
`
const hideBackdropAnimation = keyframes`
  0% { z-index: -10;background: #b0b0b000;}
  1% { z-index: 20;background: #b0b0b000;}
  99% {background: #b0b0b080;z-index: 20;}
  100% {background: #b0b0b080;z-index: 20;}
`

// styled components
const Subtitle = styled.text`
  font-weight: normal;
  font-size: 14px;
  line-height: 20px;
  color: #282828;
  ${(props) =>
    props.darkToggle &&
    css`
      color: white;
  `}
`
const CloseButton = styled.button`
  border: 0px;
  background: transparent;
  cursor: pointer;
`
const Title = styled.text`
  font-weight: bold;
  font-size: ${window.innerWidth < 900 ? '24px' : '48px'};
  line-height: ${window.innerWidth < 900 ? '20px' : '60px'};
  letter-spacing: -0.02em;
  color: #464646;
  ${(props) =>
    props.darkToggle &&
    css`
      color: white;
  `}
`
const MainContent = styled.div`
  background: #ffffff;
  color: black;
  height: ${window.innerWidth < 900 ? '450px' : '605px'};
  width: ${`${window.innerWidth < 900 ? '90vw' : '835px'}`};
  position: absolute;
  overflow: scroll;
  ${(props) =>
    props.animate &&
    css`
      animation-name: ${props.animate ? closeModalAnimation : ''};
      animation-duration: 1s;
      animation-iteration-count: 1;
      animation-fill-mode: forwards;
      animation-direction: ${!props.visible ? 'reverse' : 'normal'};
  `}
  ${(props) =>
    props.darkToggle &&
    css`
      background: #484848;
      color: white;
    `}
  ${(props) => css`
    bottom: ${props.visible
      ? window.innerWidth < 900
        ? '20vh'
        : '5vh'
      : '-200vh'};
  `}
`
const Backdrop = styled.div`
  position: fixed;
  height: 100vh;
  width: 100vw;
  left: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  ${(props) =>
    props.animate &&
    css`
      animation-direction: ${!props.visible ? 'reverse' : 'normal'};
      animation-name: ${props.animate ? hideBackdropAnimation : ''};
      animation-duration: 1s;
      animation-iteration-count: 1;
      animation-fill-mode: forwards;
    `}
  ${(props) => css`
    background: ${props.visible ? '#b0b0b080' : '#b0b0b000'};
    z-index: ${props.visible ? 20 : -10};
  `}
`
