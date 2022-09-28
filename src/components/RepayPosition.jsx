import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled, {css} from "styled-components";
import Effect from "./Effect";
import ToolTip from "./ToolTip";
import PrimaryButton from "./PrimaryButton";
import { repayCDP } from "../transactions/cdp";
import { handleTxError } from "../wallets/wallets";
import { setAlert } from "../redux/slices/alertSlice";
import LoadingOverlay from "./LoadingOverlay";
import Details from "./Details";

export default function RepayPosition({cdp, price, setCurrentCDP, details}){
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState(null);
    const dispatch = useDispatch();

    const [repayment, setRepayment] = useState("")

    const handleRepay = (event) => {
        setRepayment(event.target.value === "" ? "" : Number(event.target.value));
    };



    var sessionStorageSetHandler = function (e) {
        setLoadingText(JSON.parse(e.value));
        };

        document.addEventListener("itemInserted", sessionStorageSetHandler, false);


    return <div style={{marginTop: 30}}>
            {loading ? <LoadingOverlay text={loadingText} /> : <></>}
            <Container>
            <SubContainer>
                <Background>
                    <Title>Repay GARD</Title>
                    <InputContainer>
                        <div style={{display: "flex"}}>
                            <Input
                            autoComplete="off"
                            display="none"
                            placeholder={"enter amount"}
                            type='number'
                            min="0.00"
                            id="repay"
                            value={repayment}
                            onChange={handleRepay}
                            />
                            <MaxButton>
                                <ToolTip toolTip={"+MAX"} toolTipText={"Click to repay the maximum amount"}/>
                            </MaxButton>
                        </div>
                        <Valuation>$Value: ${(repayment * 1).toFixed(2)}</Valuation>
                    </InputContainer>
                </Background>
                <PrimaryButton
                blue={true}
                positioned={true}
                text="Repay"
                onClick={ async () => {
                    setLoading(true);
                    try {
                        let res = await repayCDP(
                          cdp.id,
                          repayment,
                        );
                        if (res.alert) {
                          dispatch(setAlert(res.text));
                        }
                      } catch (e) {
                        handleTxError(e, "Error repaying CDP");
                      }
                    setLoading(false);
                    setCurrentCDP(null);
                }}
                />
            </SubContainer>
        </Container>
        <div style={{position:"relative", top:-65}}>
            <Details details={details}/>
        </div>
</div>

}
const Container = styled.div`
    display: flex;
    position: relative;
    top: -40px;
    justify-content: center;
`

const SubContainer = styled.div`
    position: relative;
    width: 50%;
`
const Background = styled.div`
    margin-top: 30px;
    background: #1b2d65;
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
    border: 1px solid #80edff;
    padding-bottom: 35px;
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
const Input = styled.input`
  padding-top: 35px;
  border-radius: 0;
  height: 30px;
  width: 80%;
  color: white;
  text-decoration: none;
  border: none;
  border-bottom: 2px solid #01d1ff;
  opacity: 100%;
  font-size: 20px;
  background: none;
  margin-left: 25px;
  &:focus {
      outline-width: 0;
    }
`
