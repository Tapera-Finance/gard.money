import React, { useState } from "react";
import InputField from "./InputField";
import styled, {css} from "styled-components";
import Effect from "./Effect";
import ToolTip from "./ToolTip";
import PrimaryButton from "./PrimaryButton";



export default function CreatePositon({balance, price}){
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
        
    return <Container>
        <SubContainer>
            <Background>
                <Title>Supply ALGO</Title>
                <InputContainer>
                    <div style={{display: "flex"}}>
                        <InputField id={"inputContainer"} placeholder={"enter amount"}/>
                        <MaxButton>
                            <ToolTip toolTip={"+MAX"} toolTipText={"Click to lend maximum amount"}/>
                        </MaxButton>
                    </div>
                    <Valuation>$Value: ${(supplyInput * supplyPrice).toFixed(2)}</Valuation>
                    <InputDetails>
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
                    </InputDetails>
                </InputContainer>
            </Background>
            <PrimaryButton positioned={true} text="Supply"/>
        </SubContainer>
        <SubContainer>
            <Background>
                <Title>Borrow GARD</Title>
                <InputContainer>
                    <div style={{display: "flex"}}>
                        <InputField id={"inputContainer"} placeholder={"enter amount"}/>
                        <MaxButton>
                            <ToolTip toolTip={"+MAX"} toolTipText={"Click to lend maximum amount"}/>
                        </MaxButton>
                    </div>
                    <Valuation>$Value: ${(supplyInput * supplyPrice).toFixed(2)}</Valuation>
                    <InputDetails>
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
                    </InputDetails>
                </InputContainer>
            </Background>
            <PrimaryButton positioned={true} text="Borrow" disabled={true} />
        </SubContainer>
    </Container>
}
const Container = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 49%);
    column-gap: 2%;
`

const SubContainer = styled.div`
    position: relative;
`
const Background = styled.div`
    margin-top: 30px;
    background: #131c44; 
    border-radius: 10px;
`
const Title = styled.div`
    display: flex;
    justify-content: center; 
    text-align: center; 
    padding: 20px 0px 20px;
`

const InputContainer = styled.div`
    background: rgba(13, 18, 39, .75); 
    border-radius: 10px;
`

const InputDetails = styled.div`
display: grid;
grid-template-columns:repeat(3, 30%); 
row-gap: 30px; 
justify-content: center;
padding: 30px 0px 30px;
border-radius: 10px;
`

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