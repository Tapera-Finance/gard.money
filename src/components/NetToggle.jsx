import React, {useContext, useState, useEffect} from "react";
import styled, {css} from "styled-components";
import { ThemeContext } from "../contexts/ThemeContext";
import PrimaryButton from "./PrimaryButton";
import { useNavigate } from 'react-router'


export default function NetToggle() {
    const {net, setNet, theme} = useContext(ThemeContext)
    const navigate = useNavigate()
    

    function handleNetToggle(){
        console.log('net',net)
        window.localStorage.removeItem('CDPs')
        setNet(net === 'MAINNET' ? 'TESTNET1': 'MAINNET')
        navigate('/')
        window.location.reload(false);
    }

    return net === 'MAINNET'?
            <PrimaryButton onClick={handleNetToggle} darkToggle={theme === 'dark'} variant ={true} text = "MAINNET"/>
            :<PrimaryButton onClick={handleNetToggle} darkToggle={theme === 'dark'} variant ={true} text = "TESTNET"/>
}


