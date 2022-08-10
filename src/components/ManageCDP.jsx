import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled, {css} from "styled-components";
import Effect from "./Effect";
import ToolTip from "./ToolTip";
import PrimaryButton from "./PrimaryButton";
import Modal from "./Modal";
import TransactionSummary from "./TransactionSummary";
import { addCollateral } from "../transactions/cdp";
import WrappedSummary from "./WrappedSummary";
import { handleTxError } from "../wallets/wallets";
import { setAlert } from "../redux/slices/alertSlice";

export default function ManageCDP({cdpID}){
    const [supplyInput, setSupplyInput] = useState(0);
    const [supplyPrice, setSupplyPrice] = useState(0);
    const [borrowInput, setBorrowInput] = useState(0);
    const [borrowPrice, setBorrowPrice] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalCanAnimate, setModalCanAnimate] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [additionalSupply, setAdditionalSupply] = useState("")
    const [additionalBorrow, setAdditionalBorrow] = useState("")

    const handleAddSupply = (event) => {
        setAdditionalSupply(event.target.value === "" ? "" : Number(event.target.value));
      };

    const handleAddBorrow = (event) => {
    setAdditionalBorrow(event.target.value === "" ? "" : Number(event.target.value));
    };

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
        
    return <div>
            <Container>
            <SubContainer>
                <Background>
                    <Title>Supply More ALGO</Title>
                    <InputContainer>
                        <div style={{display: "flex"}}>
                            <Input 
                            autoComplete="off"
                            display="none"
                            placeholder={"enter amount"}
                            type='number'
                            min="0.00"
                            id="addCollateral"
                            value={additionalSupply}
                            onChange={handleAddSupply}
                            />
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
                <PrimaryButton
                positioned={true}
                text="Supply More"
                onClick={() => {
                    setModalVisible(true);
                    setModalCanAnimate(true);
                  }}
                />
            </SubContainer>
            <SubContainer>
                <Background>
                    <Title>Borrow More GARD</Title>
                    <InputContainer>
                        <div style={{display: "flex"}}>
                            <Input
                            autoComplete="off"
                            display="none"
                            placeholder={"enter amount"}
                            type='number'
                            min="0.00"
                            id="borrowMore"
                            value={additionalBorrow}
                            onChange={handleAddBorrow}
                            />
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
                <PrimaryButton
                positioned={true}
                text="Borrow More"
                onClick={() => {
                    console.log("borrow", additionalBorrow);
                }}
                />
            </SubContainer>
        </Container>
        <Modal
        title={"Supply More ALGOs"}
        subtitle={"Complete the details of this transaction to the right and click “Confirm Transaction” to supply more ALGO."}
        animate={modalCanAnimate}
        visible={modalVisible}
        close={() => setModalVisible(false)}
    >
        <TransactionSummary
              specifics={[]}
              transactionFunc={async () => {
                setModalCanAnimate(true);
                setModalVisible(false);
                setLoading(true);
                try {
                  let res = await addCollateral(
                    cdpID,
                    additionalSupply,
                  );
                  if (res.alert) {
                    dispatch(setAlert(res.text));
                  }
                } catch (e) {
                  handleTxError(e, "Error minting from CDP");
                }
                setModalCanAnimate(false);
                setLoading(false);
              }}
              cancelCallback={() => setModalVisible(false)}
            >
              <WrappedSummary
                context="add_collateral"
                transactionData={1}
              ></WrappedSummary>
            </TransactionSummary>
    </Modal>
</div>
    
}
const Container = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 49%);
    column-gap: 2%;
    position: relative;
    top: -40px;
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
const Input = styled.input`
  padding-top: 35px;
  border-radius: 0;
  height: 30px;
  width 80%;
  color: white;
  text-decoration: none;
  border: none;
  border-bottom 2px solid #01d1ff;
  opacity: 100%;
  font-size: 20px;
  background: none;
  margin-left: 25px;
  &:focus {
      outline-width: 0;
    }
`
