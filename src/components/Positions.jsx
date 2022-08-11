import React, { useState, useEffect, useContext } from "react";
import { microalgosToAlgos } from "algosdk";
import styled from "styled-components";
import { getCDPs, getPrice, calcRatio } from "../transactions/cdp";
import { getWalletInfo } from "../wallets/wallets";
import { Slider, ThemeProvider } from "@mui/material";
import { ThemeContext } from "../contexts/ThemeContext";
import Details from "./Details";
import ManageCDP from "./ManageCDP";
import PrimaryButton from "./PrimaryButton";
import TextButton from "./TextButton";

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
    var details = [
        {
            title: "Collateral",
            val: `${0.00}%`,
            hasToolTip: true,
        },
        {
            title: "Liquidation Price",
            val: `${0.00}%`,
            hasToolTip: true,
        },
        {
            title: "Stability Fee",
            val: `${0.00}%`,
            hasToolTip: true,
        },
        {
            title: "Liquidation ratio",
            val: `${0.00}%`,
            hasToolTip: true,
        },
    ]
    const {theme} = useContext(ThemeContext);
    const [price, setPrice] = useState(0)
    const loadedCDPs = CDPsToList();
    const [currentCDP, setCurrentCDP] = useState(null)
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
                        <div>
                            Health {`(${calcRatio(cdp.collateral * 1e6, cdp.debt / 1e6,true,)})`}
                        </div>
                        <ThemeProvider theme={theme}>
                            <Slider
                                color="primary"
                                max={600}
                                value={calcRatio(cdp.collateral * 1e6, cdp.debt / 1e6, false,)}
                            />
                        </ThemeProvider>
                        <SliderRange>
                            <div>minimum: 115%</div>
                            <div>max: 600+%</div>
                        </SliderRange>
                        
                    </div>
                </PositionInfo>
                {cdp.id === currentCDP ? <div>
                    <ManageCDP cdp={cdp} price={price} setCurrentCDP={setCurrentCDP}/>
                    <div style={{position:"relative", top:-65}}>
                        <Details details={details}/>
                        <PrimaryButton
                        positioned={true}
                        exit={true}
                        text="Exit"
                        onClick={() => {
                            setCurrentCDP(null)
                        }}
                        />
                    </div>
                    
                </div> :<TextButton
                 positioned={true} 
                 text="Click to Expand"
                 onClick={() => {
                    setCurrentCDP(cdp.id)
                 }}
                 />}
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
    margin: 10px 0px 40px;
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
    font-size: 11px;
`