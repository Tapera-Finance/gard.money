import React from "react";
import InputField from "../components/InputField";
import styled, {css} from "styled-components";
import Effect from "./Effect";



export default function InputContainer(){
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
        marginBottom: 30,
    }}>
        <div style={{display: "flex", flexDirection: "column", marginTop: 30, background: "#131c44", borderRadius: 10,}}>
            <div style={{display: "flex", justifyContent: "center", textAlign: "center", fontStyle: "center", paddingTop: 20, paddingBottom: 20, }}>Supply ALGO</div>
            <div style={{display: "flex", flexDirection: "column", background: "rgba(13, 18, 39, .75)", borderRadius: 10,}}>
                <div style={{display: "flex"}}>
                    <InputField id={"inputContainer"} placeholder={"enter amount"}/>
                    <MaxButton>+MAX</MaxButton>
                </div>
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
        <div style={{display: "flex", flexDirection: "column", marginTop: 30, background: "#131c44", borderRadius: 10,}}>
            <div style={{display: "flex", justifyContent: "center", textAlign: "center", fontStyle: "center", paddingTop: 20, paddingBottom: 20, }}>Borrow GARD</div>
            <div style={{display: "flex", flexDirection: "column", background: "rgba(13, 18, 39, .75)", borderRadius: 10,}}>
                <div style={{display: "flex"}}>
                    <InputField id={"inputContainer"} placeholder={"enter amount"}/>
                    <MaxButton>+MAX</MaxButton>
                </div>
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
`