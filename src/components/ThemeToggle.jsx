import React, {useContext, useState, useEffect} from "react";
import styled, {css} from "styled-components";
import { ThemeContext } from "../contexts/ThemeContext";
import toggleDark from '../assets/icons/toggleDark.png'
import toggleLight from '../assets/icons/toggleLight.png'


export default function ThemeToggle() {
    const {theme, setTheme, net} = useContext(ThemeContext)
    const {lightColor, setLightColor} = useState('trasparent')
    const {darkColor, setDarkColor} = useState('trasparent')

    function handleThemeToggle(){
        setTheme(theme === 'light' ? 'dark': 'light')
    }

    return <button className='toggle' style={{paddingBottom: 5, border:0, background: 'none', width: '45px'}}>
            {theme === 'light'?
            <Img src={toggleDark} alt="toggle dark" onClick={handleThemeToggle} darkToggle={theme === 'dark'} net={net}/>
            :<Img src={toggleLight} alt="toggle light" onClick={handleThemeToggle} darkToggle={theme === 'dark'} net={net}/>
            }
        </button>
}


const Img = styled.img`
    backgroundColor: transparent;
    width: 100%;
    cursor: pointer;
    border: 1px solid #6941c6;
    border-radius: 5px;
    &:hover {
        background-color: #6941c6;
    }
    ${(props) =>
        props.net === 'TESTNET1' &&
        css`
        border: 1px solid #ffee55;
        &:hover {
            background-color: #ffee55;
    `}
    ${(props) =>
        props.darkToggle &&
        css`
        border: 1px solid #c299eb;
        &:hover {
            background-color: #c299eb;
    `}
    ${(props) =>
        props.darkToggle && props.net === 'TESTNET1' &&
        css`
        &:hover {
            background-color: #ffee55;
    `}
`