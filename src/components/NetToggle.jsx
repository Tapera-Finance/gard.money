import React, {useContext, useState, useEffect} from "react";
import styled, {css} from "styled-components";
import { ThemeContext } from "../contexts/ThemeContext";
import PrimaryButton from "./PrimaryButton";
import { useNavigate } from 'react-router'
import { disconnectWallet } from "../wallets/wallets";


export default function NetToggle() {
    const {net, setNet, theme} = useContext(ThemeContext)
    const navigate = useNavigate()
    

    function handleNetToggle(){
        console.log('net',net)
        window.localStorage.removeItem('CDPs')
        setNet(net === 'MAINNET' ? 'TESTNET1': 'MAINNET')
        disconnectWallet()
        navigate('/dashboard')
        window.location.reload(false);
    }

    return net === 'MAINNET'?
            <PrimaryButton onClick={handleNetToggle} darkToggle={theme === 'dark'} text = "MAINNET"/>
            :<PrimaryButton onClick={handleNetToggle} darkToggle={theme === 'dark'} text = "TESTNET"/>
}


