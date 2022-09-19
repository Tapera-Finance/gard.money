import React, { useState, useEffect, useContext } from "react";
import { microalgosToAlgos } from "algosdk";
import styled from "styled-components";
import { getCDPs, getPrice, calcRatio, closeCDP } from "../transactions/cdp";
import { useDispatch } from "react-redux";
import { getWalletInfo, handleTxError } from "../wallets/wallets";
import { Slider, ThemeProvider } from "@mui/material";
import { ThemeContext } from "../contexts/ThemeContext";
import Details from "./Details";
import ManageCDP from "./ManageCDP";
import PrimaryButton from "./PrimaryButton";
import TextButton from "./TextButton";
import PageToggle from "./PageToggle"
import BorrowMore from "./BorrowMore";
import RepayPosition from "./RepayPosition";
import { setAlert } from "../redux/slices/alertSlice";

const axios = require("axios");

export async function getAlgoGovAPR() {
    let response;
    try {
        response = await axios.get(
            "https://governance.algorand.foundation/api/periods/statistics/",
        );
    } catch (ex) {
        response = null;
        console.log(ex);
    }
    if (response) {
        const APR = ((parseInt(response["data"]["periods"][0].algo_amount_in_reward_pool) / parseInt(response["data"]["periods"][0].total_committed_stake)) * 400).toFixed(2)
        return APR
    }
    return null;
  }

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
    const dispatch = useDispatch();
    const {theme} = useContext(ThemeContext);
    const [price, setPrice] = useState(0)
    const [apr, setAPR] = useState(0)
    const loadedCDPs = CDPsToList();
    const [currentCDP, setCurrentCDP] = useState(null)
    const [selectedTab, setSelectedTab] = useState("one");
    const [loading, setLoading] = useState(false);

    // const Tabs = {
    //     one: <SystemMetrics />,
    //     two: <YourMetrics />,
    // };
    const tabs = {
        one: "Borrow More",
        two: "Repay Postion",
        three: "Sell Position",
        four: "Close Position",
    };
    useEffect(async () => {
        setAPR(await getAlgoGovAPR())
        setPrice(await getPrice());
    }, []);
    return <div>
        <Header>
            <b>Your Positions</b>
            <b style={{textAlign: "center"}}>Rewards</b>
            <b style={{textAlign: "center"}}>CDP Health</b>
        </Header>
        <Container>
            {loadedCDPs.length && loadedCDPs.length > 0 ?
                loadedCDPs.map((cdp) => {
                    return (
            <Position key={cdp.id}>
                <div style={{position: "relative", textAlign: "right", bottom: -25, fontSize:14, color:"#FF00FF", paddingRight: 10}}>v1 CDP</div>
                <PositionInfo>
                    <div style={{display: "flex", flexDirection: "column", rowGap: 20}}>
                        <div>Supplied: {(microalgosToAlgos(cdp.collateral)).toFixed(2)} ALGOs</div>
                        <div>Borrowed: {mGardToGard(cdp.debt).toFixed(2)} GARD</div>
                    </div>
                    <div style={{alignSelf:"center", textAlign:"center"}}>APR: <span style={{color:"#01d1ff"}}>{apr}%</span></div>
                    <div style={{display: "flex", flexDirection: "column"}}>
                        <div>
                            Health {`(${calcRatio(cdp.collateral, cdp.debt / 1e6,true,)})`}
                        </div>
                        <ThemeProvider theme={theme}>
                            <Slider
                                color={calcRatio(cdp.collateral, cdp.debt / 1e6, false,) < 140 ? "danger": calcRatio(cdp.collateral, cdp.debt / 1e6, false,) < 250 ? "moderate" : "healthy"}
                                min={115}
                                max={600}
                                value={calcRatio(cdp.collateral, cdp.debt / 1e6, false,)}
                            />
                        </ThemeProvider>
                        <SliderRange>
                            <div>minimum: 115%</div>
                            <div>max: 600+%</div>
                        </SliderRange>

                    </div>
                </PositionInfo>
                <TextButton
                 positioned={true} 
                 text={cdp.id === currentCDP ? "Collapse" : "Manage Position"}
                 onClick={cdp.id === currentCDP ? () => {
                    setCurrentCDP(null)
                 } : () => {
                    setCurrentCDP(cdp.id)
                 }
                }
                 />
                {cdp.id === currentCDP ? <div>
                    <PageToggle selectedTab={setSelectedTab} tabs={tabs}/>
                    {selectedTab === "one" ? <BorrowMore cdp={cdp} price={price} setCurrentCDP={setCurrentCDP} details={details} /> 
                    : selectedTab === "two" ? <RepayPosition cdp={cdp} price={price} setCurrentCDP={setCurrentCDP} details={details} /> 
                    : selectedTab === "three" ? <div>
                        <SalesHeader>
                            <b style={{textAlign:"left"}}>Position</b>
                            <b>Sell for</b>
                            <b style={{textAlign: "center"}}>Amount</b>
                            <b style={{textAlign: "center"}}>Sale Discount</b>
                        </SalesHeader>
                        <SalesInfo>
                            <div style={{display: "flex", flexDirection: "column", rowGap: 20}}>    
                                <div>Supplied: {(microalgosToAlgos(cdp.collateral)).toFixed(2)} ALGOs</div>
                                <div>Borrowed: {mGardToGard(cdp.debt).toFixed(2)} GARD</div>
                            </div>
                            <PrimaryButton text="ALGO"/>
                            <div style={{display: "flex", flexDirection: "column", alignSelf: "center"}}>    
                                <Input 
                                autoComplete="off"
                                display="none"
                                placeholder={"enter amount"}
                                type='number'
                                min="0.00"
                                id="salesPrice"
                                // value={salesPrice}
                                // onChange={handleSalesPrice}
                                />
                                <Valuation>Value: ${12.3}</Valuation>
                            </div>
                            <div style={{color: "grey", textAlign: "center"}}> 4.33%</div>
                        </SalesInfo>
                        <PrimaryButton text="List for Sale" purple={true} disabled={true} />
                </div> 
                    : <div style={{marginTop: 40}}>
                        <PrimaryButton 
                        text="Close Position" 
                        positioned={true} 
                        purple={true}
                        onClick={ async () => {
                          setLoading(true);
                          try {
                              let res = await closeCDP(cdp.id);
                              if (res.alert) {
                                dispatch(setAlert(res.text));
                              }
                            } catch (e) {
                              handleTxError(e, "Error minting from CDP");
                            }
                          setLoading(false);
                          setCurrentCDP(null);
                        }}
                        />
                    </div>}
                </div> : <></>}
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
const SalesHeader = styled.div`
    display: grid;
    grid-template-columns: 30% 20% 20% 20%; 
    justify-content:center;
    align-content: center;
    text-align: center;
    font-size: 16px;
    margin-top: 50px;
    margin-bottom: 20px;
`
const SalesInfo = styled.div`
    display: grid; 
    grid-template-columns: 30% 20% 20% 20%; 
    justify-content:center;
    align-content: center;
    align-items: center;
    background: rgba(13, 18, 39, .75); 
    border-radius: 10px;
    font-size: 18px;
    padding: 40px 0px 40px;
    margin-bottom: 20px;
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
const Input = styled.input`
    border-radius: 0;
    height: 30px;
    width 80%;
    color: white;
    text-decoration: none;
    border: none;
    border-bottom 2px solid #7c52ff;
    text-align: center;
    opacity: 100%;
    font-size: 20px;
    background: none;
    margin-left: 25px;
    &:focus {
        outline-width: 0;
    }
`
const Valuation = styled.div`
    margin-left: 25px;
    margin-top: 3px;
    font-size: 12px;
    color: #999696;
    text-align: center;
`
