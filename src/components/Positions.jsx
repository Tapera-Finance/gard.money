import React, { useState, useEffect, useContext } from "react";
import { useDispatch } from "react-redux";
import { microalgosToAlgos } from "algosdk";
import styled from "styled-components";
import { getCDPs, getPrice, calcRatio, closeCDP } from "../transactions/cdp";
import { getWalletInfo, handleTxError } from "../wallets/wallets";
import { Slider, ThemeProvider } from "@mui/material";
import { ThemeContext } from "../contexts/ThemeContext";
import Details from "./Details";
import ManageCDP from "./ManageCDP";
import PrimaryButton from "./PrimaryButton";
import TextButton from "./TextButton";
import PageToggle from "./PageToggle"
import BorrowMore from "./BorrowMore";
import SupplyMore from "./SupplyMore";
import RepayPosition from "./RepayPosition";
import { setAlert } from "../redux/slices/alertSlice";
import LoadingOverlay from "./LoadingOverlay";
import { ids } from "../transactions/ids"

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

function _CDPsToList(CDPList) {
  let res = [];
  for (const [cdpID, value] of Object.entries(CDPList)) {
          if (value["state"] == "opened") {
            res.push({
            id: cdpID + value["collateralType"],
            liquidationPrice: (
                (1.15 * value["debt"]) /
                value["collateral"]
            ).toFixed(4),
            collateral: value["collateral"],
            collateralType: value["collateralType"],
            debt: value["debt"],
            asaID: value["asaID"],
            committed: value.hasOwnProperty("committed") ? value["committed"] : 0,
            });
          }
        }
  return res
}

export function CDPsToList() {
    const CDPs = getCDPs();
    let res = [];
    if (getWalletInfo() && CDPs[getWalletInfo().address] != null) {
        const accountCDPs = CDPs[getWalletInfo().address];
        if (accountCDPs[0] != null) {
          res = res.concat(_CDPsToList(accountCDPs[0]))
        }
        if (accountCDPs[ids.asa.galgo] != null) {
          res = res.concat(_CDPsToList(accountCDPs[ids.asa.galgo]))
        }
    }
    if (res.length == 0) {
        res = dummyCDPs;
    }
    return res;
}
export const dummyCDPs = [
    {
      id: "N/A",
      liquidationPrice: 0,
      collateral: 0,
      debt: 0,
    },
  ];

  function displayRatio() {
    return calcRatio(algosToMAlgos(getCollateral()), getMinted(), 0, true); // TODO: Need to set the ASA ID Properly
    }

    function mAlgosToAlgos(num) {
    return num / 1000000;
    }
    function algosToMAlgos(num) {
    return num * 1000000;
    }

    function displayLiquidationPrice() {
        return "$" + ((1.15 * getMinted()) / getCollateral()).toFixed(4);
      }

    function getMinted() {
        if (
          document.getElementById("borrowMore") == null ||
          isNaN(parseFloat(document.getElementById("borrowMore").value))
        ) {
          return null;
        }
        return parseFloat(document.getElementById("borrowMore").value);
      }

    function getCollateral() {
        if (
          document.getElementById("addCollateral") == null ||
          isNaN(parseFloat(document.getElementById("addCollateral").value))
        ) {
          return null;
        }
        return parseFloat(document.getElementById("addCollateral").value);
      }

      function recalcDetails() {
        displayLiquidationPrice()
        getMinted()
        getCollateral()
        displayRatio()
      }


export default function Positions({cdp, maxGARD, maxSupply}) {
    const dispatch = useDispatch();
    const {theme} = useContext(ThemeContext);
    const [price, setPrice] = useState(0)
    const [supplyPrice, setSupplyPrice] = useState(0)
    const [apr, setAPR] = useState(0)
    const [cAlgos, setCollateral] = useState("");
    const [mGARD, setGARD] = useState("")
    const [minted, setMinted] = useState("")
    const loadedCDPs = CDPsToList();
    const [currentCDP, setCurrentCDP] = useState(null);
    const [collateralType, setCollateralType] = useState("ALGO")
    const [selectedTab, setSelectedTab] = useState("one");
    const [manageUpdate, setManageUpdate] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState(null);
    const typeCDP = {
      galgo: "gALGO",
      algo: "ALGO"
    }
    var details = [
        {
            title: "Total Supplied (Asset)",
            val: `${cAlgos === "" ? "..." : cAlgos}`,
            hasToolTip: true,
          },
          {
            title: "Total Supplied ($)",
            val: `${cAlgos === "" ? "..." : `$${(cAlgos * supplyPrice).toFixed(2)}`}`,
            hasToolTip: true,
          },
          {
            title: "Collateral Factor",
            val: `${(100 / 140).toFixed(2)}`,
            hasToolTip: true,
          },
          {
            title: "Borrow Utilization",
            val: `${
              cAlgos === "" || maxGARD === "" ? "..." : (cAlgos / maxGARD).toFixed(2)
            }%`,
            hasToolTip: true,
          },
          {
            title: "Liquidation Price",
            val: `${
              getMinted() == null || getCollateral() == null
                ? "..."
                : displayLiquidationPrice()
            }`,
            hasToolTip: true,
          },
          // {
          //   title: "GARD Borrow APR",
          //   val: 0,
          //   hasToolTip: true,
          // },
          {
            title: "Bonus Supply Rewards",
            val: 0,
            hasToolTip: true,
          },
          {
            title: "ALGO Governance APR",
            val: `${apr}%`,
            hasToolTip: true,
          },
          {
            title: "Collateralization Ratio",
            val: `${
              getMinted() == null || getCollateral() == null ? "..." : displayRatio()
            }`,
            hasToolTip: true,
          },
    ]
    useEffect(async () => {
      setAPR(await getAlgoGovAPR());
    }, []);

    useEffect(() => {
      let type
      if (currentCDP !== null) {
        type = currentCDP.collateralType
        if (type === "galgo") {
          setCollateralType("gALGO")
        } else if (type === "algo") {
          setCollateralType("ALGO")
        }
      }
    }, [currentCDP])

    var sessionStorageSetHandler = function (e) {
      setLoadingText(JSON.parse(e.value));
    };

    document.addEventListener("itemInserted", sessionStorageSetHandler, false);

    const tabs = {
        one: "Borrow More",
        two: "Supply More",
        three: "Repay Postion",
        four: "Close Position",
    };
    useEffect(async () => {
        setAPR(await getAlgoGovAPR())
        setPrice(await getPrice());
    }, []);

    useEffect(() => {
        setSupplyPrice(price)
      }, [price])

      useEffect(() => {
        if (manageUpdate) {
          recalcDetails()
          setManageUpdate(!manageUpdate)
        }
      }, [manageUpdate])

    return <div>
      {loading ? <LoadingOverlay
      text={loadingText}
      close={()=>{
        setLoading(false);
      }}
      /> : <></>}
        <Header>
            <b>Your Positions</b>
            <b style={{textAlign: "center"}}>Governance Rewards</b>
            <b style={{textAlign: "center"}}>CDP Health</b>
        </Header>
        <Container>
            {loadedCDPs.length && loadedCDPs.length > 0 ?
                loadedCDPs.map((cdp, idx) => {
                  // console.log("logging cdp data object", cdp)
                    return (
            <Position key={cdp.id.toString() + idx.toString()}>
                {/* <div style={{position: "relative", textAlign: "right", bottom: -25, fontSize:14, color:"#FF00FF", paddingRight: 10}}>v1 CDP</div> */}
                <PositionInfo>
                    <div style={{display: "flex", flexDirection: "column", rowGap: 20}}>
                        <div>Supplied: {(microalgosToAlgos(cdp.collateral)).toFixed(2)} {typeCDP[cdp.collateralType]}</div>
                        <div>Borrowed: {mGardToGard(cdp.debt).toFixed(2)} GARD</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", rowGap: 20, alignSelf:"center", textAlign:"center", marginBottom: 10}}>APR: <span style={{color:"#01d1ff"}}>{apr}%</span></div>
                    <div style={{display: "flex", flexDirection: "column"}}>
                        <div style={{display: "flex", justifyContent: "space-between"}}>
                            <div> Health {`(${calcRatio(cdp.collateral, cdp.debt / 1e6,cdp.asaID,true,)})`} </div>
                            <div>Liquidation Price (${((1.15 * mAlgosToAlgos(cdp.debt)) / mAlgosToAlgos(cdp.collateral)).toFixed(4)})</div>
                        </div>
                        <ThemeProvider theme={theme}>
                            <Slider
                                color={calcRatio(cdp.collateral, cdp.debt / 1e6, false,) < 140 ? "danger": calcRatio(cdp.collateral, cdp.debt / 1e6, cdp.asaID, false,) < 250 ? "moderate" : "healthy"}
                                min={115}
                                max={600}
                                value={calcRatio(cdp.collateral, cdp.debt / 1e6, cdp.asaID, false,)}
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
                    setSelectedTab("one")
                 } : () => {
                    setCurrentCDP(cdp.id)
                 }
                }
                 />
                {cdp.id === currentCDP ? <div>
                    <PageToggle selectedTab={setSelectedTab} tabs={tabs}/>
                    {selectedTab === "one" ? <BorrowMore supplyPrice={supplyPrice} collateral={cAlgos} mAsset={mGARD} setCollateral={setCollateral} minted={setGARD} cdp={cdp} price={price} setCurrentCDP={setCurrentCDP} details={details} maxMint={maxGARD} apr={apr} manageUpdate={setManageUpdate} />
                    : selectedTab === "two" ? <SupplyMore collateralType={cdp.collateralType} supplyPrice={supplyPrice} cAsset={cAlgos} collateral={setCollateral} minted={setMinted} cdp={cdp} price={price} setCurrentCDP={setCurrentCDP} details={details} maxSupply={maxSupply} apr={apr} manageUpdate={setManageUpdate}/>
                    : selectedTab === "three" ? <RepayPosition cdp={cdp} price={price} setCurrentCDP={setCurrentCDP} details={details} />
                    :
                    // : selectedTab === "three" ?
                //     <div>
                //         <SalesHeader>
                //             <b style={{textAlign:"left"}}>Position</b>
                //             <b>Sell for</b>
                //             <b style={{textAlign: "center"}}>Amount</b>
                //             <b style={{textAlign: "center"}}>Sale Discount</b>
                //         </SalesHeader>
                //         <SalesInfo>
                //             <div style={{display: "flex", flexDirection: "column", rowGap: 20}}>
                //                 <div>Supplied: {(microalgosToAlgos(cdp.collateral)).toFixed(2)} ALGOs</div>
                //                 <div>Borrowed: {mGardToGard(cdp.debt).toFixed(2)} GARD</div>
                //             </div>
                //             <PrimaryButton text="ALGO"/>
                //             <div style={{display: "flex", flexDirection: "column", alignSelf: "center"}}>
                //                 <Input
                //                 autoComplete="off"
                //                 display="none"
                //                 placeholder={"enter amount"}
                //                 type='number'
                //                 min="0.00"
                //                 id="salesPrice"
                //                 // value={salesPrice}
                //                 // onChange={handleSalesPrice}
                //                 />
                //                 <Valuation>Value: ${12.3}</Valuation>
                //             </div>
                //             <div style={{color: "grey", textAlign: "center"}}> 4.33%</div>
                //         </SalesInfo>
                //         <PrimaryButton text="List for Sale" purple={true} disabled={true} />
                // </div>
                     <div style={{marginTop: 40}}>
                        <PrimaryButton
                        text="Close Position"
                        positioned={true}
                        blue={true}
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
    border: 1px solid #80edff;
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
    width: 80%;
    color: white;
    text-decoration: none;
    border: none;
    border-bottom: 2px solid #7c52ff;
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
