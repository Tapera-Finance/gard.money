import React, { useState } from "react";
import InputField from "../components/InputField";
import styled, {css} from "styled-components";
import Effect from "./Effect";
import ToolTip from "./ToolTip";
import PrimaryButton from "./PrimaryButton";



export default function InputContainer({balance, price}){
    const [supplyInput, setSupplyInput] = useState(0);
    const [supplyPrice, setSupplyPrice] = useState(0);
    const [borrowInput, setBorrowInput] = useState(0);
    const [borrowPrice, setBorrowPrice] = useState(0);



    var supplyDetails = [
        {
            title: "Borrow Limit",
            val: `${0.00}%`,
            hasToolTip: true,
        },
        {
            title: "Supply APY",
            val: `${0.00}%`,
            hasToolTip: true,
        },
        {
            title: "Supply Rewards",
            val: `${0.00}%`,
            hasToolTip: true,
        },];
    var borrowDetails = [
        {
            title: "Supply Limit",
            val: `${0.00}%`,
            hasToolTip: true,
        },
        {
            title: "Borrow APR",
            val: `${0.00}%`,
            hasToolTip: true,
        },
        {
            title: "Borrow Limit",
            val: `${0.00}%`,
            hasToolTip: true,
        },];
    return <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 49%)",
        columnGap: "2%",
    }}>
        <div style={{postion:"relative"}}>
            <div style={{display: "flex", flexDirection: "column", marginTop: 30, background: "#131c44", borderRadius: 10,}}>
                <div style={{display: "flex", justifyContent: "center", textAlign: "center", fontStyle: "center", paddingTop: 20, paddingBottom: 20, }}>Supply ALGO</div>
                <div style={{display: "flex", flexDirection: "column", background: "rgba(13, 18, 39, .75)", borderRadius: 10,}}>
                    <div style={{display: "flex"}}>
                        <InputField id={"inputContainer"} placeholder={"enter amount"}/>
                        <MaxButton>
                            <ToolTip toolTip={"+MAX"} toolTipText={"Click to lend maximum amount"}/>
                        </MaxButton>
                    </div>
                    <Valuation>$Value: ${(supplyInput * supplyPrice).toFixed(2)}</Valuation>
                    <div style={{
                    display: "grid",
                    gridTemplateColumns:"repeat(3, 30%)", 
                    rowGap: 30, 
                    justifyContent: "center",
                    paddingTop: 30,
                    paddingBottom: 30,
                    borderRadius: 10}}>
                        {supplyDetails.length && supplyDetails.length > 0 ?
                        supplyDetails.map((d) => {
                            return (
                                <Item key={d.title}>
                                    <Effect title={d.title} val={d.val} hasToolTip={d.hasToolTip}></Effect>
                                </Item>
                            )
                        })
                        : null
        }
                    </div>
                </div>
            </div>
            <PrimaryButton positioned={true} text="Supply"/>
        </div>
        <div style={{postion:"relative"}}>
            <div style={{display: "flex", flexDirection: "column", marginTop: 30, background: "#131c44", borderRadius: 10,}}>
                <div style={{display: "flex", justifyContent: "center", textAlign: "center", fontStyle: "center", paddingTop: 20, paddingBottom: 20, }}>Borrow GARD</div>
                <div style={{display: "flex", flexDirection: "column", background: "rgba(13, 18, 39, .75)", borderRadius: 10,}}>
                    <div style={{display: "flex"}}>
                        <InputField id={"inputContainer"} placeholder={"enter amount"}/>
                        <MaxButton>
                            <ToolTip toolTip={"+MAX"} toolTipText={"Click to lend maximum amount"}/>
                        </MaxButton>
                    </div>
                    <Valuation>$Value: ${(supplyInput * supplyPrice).toFixed(2)}</Valuation>
                    <div style={{
                    display: "grid",
                    gridTemplateColumns:"repeat(3, 30%)", 
                    rowGap: 30, 
                    justifyContent: "center",
                    paddingTop: 30,
                    paddingBottom: 30,
                    borderRadius: 10}}>
                        {borrowDetails.length && borrowDetails.length > 0 ?
                        borrowDetails.map((d) => {
                            return (
                                <Item key={d.title}>
                                    <Effect title={d.title} val={d.val} hasToolTip={d.hasToolTip}></Effect>
                                </Item>
                            )
                        })
                        : null
        }
                    </div>
                </div>
            </div>
            <PrimaryButton positioned={true} text="Borrow" disabled={true} />
        </div>
    </div>
}

const Item = styled.div`
    display: flex;
    flex-direction: column;
    font-size: 14px;
`
const MaxButton = styled.button`
    color: #01d1ff;
    background: none;
    border: none;
    margin-top: 50px;
    cursor: pointer;
    font-size: 12px;
`
const Valuation = styled.div`
    margin-left: 25px;
    margin-top: 3px;
    font-size: 12px;
    color: #999696;
`