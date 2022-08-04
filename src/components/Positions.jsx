import React, { useState, useEffect, useContext } from "react";
import TextButton from "./TextButton";
import styled, { css } from "styled-components";
import { getCDPs, getPrice } from "../transactions/cdp";
import { getWalletInfo } from "../wallets/wallets";
import { microalgosToAlgos } from "algosdk";
import { Slider, ThemeProvider } from "@mui/material";
import { ThemeContext } from "../contexts/ThemeContext";

const mGardToGard = (num) => {
    return num / 1000000;
  };

export function CDPsToList() {
    const CDPs = getCDPs();
    let res = [];
    if (getWalletInfo() && CDPs[getWalletInfo().address] != null) {
        const accountCDPs = CDPs[getWalletInfo().address];
        for (const [cdpID, value] of Object.entries(accountCDPs)) {
        if (value["state"] == "open") {
            res.push({
            id: cdpID,
            liquidationPrice: (
                (1.15 * value["debt"]) /
                value["collateral"]
            ).toFixed(4),
            collateral: value["collateral"],
            debt: value["debt"],
            committed: value.hasOwnProperty("committed") ? value["committed"] : 0,
            });
        }
        }
    }
    if (res.length == 0) {
        res = dummyCDPs;
    }
    return res;
}
const dummyCDPs = [
    {
      id: "N/A",
      liquidationPrice: 0,
      collateral: 0,
      debt: 0,
    },
  ];
  

export default function Positions() {
    const {theme} = useContext(ThemeContext);
    const [price, setPrice] = useState(0)
    const loadedCDPs = CDPsToList();
    useEffect(async () => {
        setPrice(await getPrice());
    }, []);
    return <div>
        <Header>
            <b>Your Positions</b>
            <b>Rewards</b>
            <b>Total Balance</b>
        </Header>
        <Container>
            {loadedCDPs.length && loadedCDPs.length > 0 ?
                loadedCDPs.map((cdp) => {
                    return (
            <Position key={cdp.id}>
                <PositionInfo>
                    <div style={{display: "flex", flexDirection: "column", rowGap: 20}}>    
                        <div>Supplied: ${(microalgosToAlgos(cdp.collateral) * price).toFixed(2)} in ALGOs</div>
                        <div>Borrowed: ${mGardToGard(cdp.debt)} in GARD</div>
                    </div>
                    <div>APR 123%</div>
                    <div style={{display: "flex", flexDirection: "column"}}>    
                        <div>Health {`(100%)`}</div>
                        <ThemeProvider theme={theme}>
                            <Slider
                                color="primary"
                            />
                        </ThemeProvider>
                        <SliderRange>
                            <div>minimum:$0</div>
                            <div>maximum:$0</div>
                        </SliderRange>
                        
                    </div>
                </PositionInfo>
                <TextButton positioned={true} text="Click to Expand"/>
            </Position>
             )
            })
            : null
        }
        </Container>
    </div>
}

const Header = styled.div`
    display: grid;
    grid-template-columns:repeat(3, 30%); 
    justify-content:center;
    align-content: center;
    font-size: 20px;
    margin-top: 50px;
`

const Container = styled.div`
    margin: 10px 0px 80px;
`

const Position = styled.div`
    position: relative;
`
const PositionInfo = styled.div`
    display: grid; 
    grid-template-columns:repeat(3, 30%); 
    justify-content:center;
    align-content: center;
    background: rgba(13, 18, 39, .75); 
    border-radius: 10px;
    font-size: 18px;
    padding: 40px 0px 40px;
`
const SliderRange = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: 1px;
`