import React, { useReducer, useState, useContext } from 'react'
import styled, { keyframes, css } from 'styled-components'
import { ThemeContext } from '../contexts/ThemeContext'

export default function LoadingOverlay({ text }) {
  const {theme} = useContext(ThemeContext)
  return (
    <div>
      <Backdrop darkToggle ={theme === 'dark'}>
        <TextContainer darkToggle ={theme === 'dark'}>
          <div>
            <LoadingText >{text || 'Loading...'}</LoadingText>
          </div>
        </TextContainer>
      </Backdrop>
    </div>
  )
}

const TextAnimation = keyframes`
  0% {color: #ffffff;}
  50% {color: #6941c6;}
  100% {color: black;}
`

const LoadingText = styled.text`
    font-weight: 900;
    font-size: 24px;
    animation-name: ${TextAnimation};
    animation-duration: 1s;
    animation-iteration-count: infinite;
    animation-fill-mode: forwards;
    animation-direction: ${'alternate'};
  `

const Backdrop = styled.div`
  position: fixed;
  height: 100vh;
  width: 100vw;
  left: 0;
  top: 0;
  z-index: ${21};
  background: ${'#b0b0b080'};
  display: flex;
  justify-content: center;
  align-items: center;
`
const TextContainer = styled.div`
  height: 100px;
  background: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 25px;
  padding: 0px 40px;
  ${(props) =>
    props.darkToggle &&
    css`
    background: #484848;
  `}
`
