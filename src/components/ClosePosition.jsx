import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled, {css} from "styled-components";
import Effect from "./Effect";
import ToolTip from "./ToolTip";
import PrimaryButton from "./PrimaryButton";
import { handleTxError } from "../wallets/wallets";
import { setAlert } from "../redux/slices/alertSlice";
import LoadingOverlay from "./LoadingOverlay";
import Details from "./Details";
import { mAlgosToAlgos } from "../pages/BorrowContent";
import { closeCDP } from "../transactions/cdp";


export default function ClosePosition({cdp, price, setCurrentCDP, details, mobile, apr }){
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState(null);
    const dispatch = useDispatch();
    const [repayment, setRepayment] = useState("")

    const handleRepay = (event) => {
        setRepayment(event.target.value === "" ? "" : Number(event.target.value));
    };
    
    var details = mobile ? [
        {
          title: "Liquidation Price",
          val: `$${
            (1.20*(cdp.debt-parseInt(repayment*1e6))/cdp.collateral).toFixed(3)
          }`,
          hasToolTip: true,
        },
        {
          title: "Collateralization Ratio",
          val: `${
            (100*cdp.collateral*price / (cdp.debt - parseInt(repayment*1e6))).toFixed(0)
          }%`,
          hasToolTip: true,
        },
  ]
  : [
          {
            title: "Total Supplied ($)",
            val: `${`$${(cdp.collateral/1e6 * price).toFixed(2)}`}`,
            hasToolTip: true,
          },
          {
            title: "Borrow Utilization",
            val: `${
              (100*(cdp.debt - parseInt(repayment*1e6)) / (cdp.collateral * price / 1.1)).toFixed(2)}
            %`,
            hasToolTip: true,
          },
          {
            title: "Liquidation Price",
            val: `$${
              (1.20*(cdp.debt-parseInt(repayment*1e6))/cdp.collateral).toFixed(3)
            }`,
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
              (100*cdp.collateral*price / (cdp.debt - parseInt(repayment*1e6))).toFixed(0)
            }%`,
            hasToolTip: true,
          },
    ];

    var borrowDetails = [
      {
        title: "Already Borrowed",
        val: `${mAlgosToAlgos(cdp.debt).toFixed(2)}`,
        hasToolTip: true
      },
      {
        title: "Borrow Limit",
        val: `${Math.max(
          0,
          Math.trunc(
            (100 * ((price * cdp.collateral) / 1000000)) / 1.1 -
              (100 * cdp.debt) / 1000000,
          ) / 100,
        )} GARD`,
        hasToolTip: true,
      },
    ];

    var sessionStorageSetHandler = function (e) {
        setLoadingText(JSON.parse(e.value));
        };

        document.addEventListener("itemInserted", sessionStorageSetHandler, false);

    
    return <div style={{marginTop: 20}}>
            {loading ? <LoadingOverlay
            text={loadingText}
            close={()=>{
                setLoading(false);
            }}
            /> : <></>}
            <Container>
            <SubContainer mobile={mobile}>
                <Background>
                    <Title>Close Position</Title>
                    <InputContainer>
                        <div style={{display: "flex"}}>
                            <Input
                            autoComplete="off"
                            display="none"
                            placeholder={"enter amount"}
                            type='number'
                            min="0.00"
                            id="repay"
                            value={mAlgosToAlgos(cdp.debt).toFixed(2)}
                            />
                            <MaxButton>
                                <ToolTip toolTip={"+MAX"} toolTipText={"Max amount is already being repaid"}/>
                            </MaxButton>
                        </div>
                        <Valuation>$Value: ${(mAlgosToAlgos(cdp.debt)).toFixed(2)}</Valuation>
                        <InputDetails>
                        {borrowDetails.length && borrowDetails.length > 0
                          ? borrowDetails.map((d) => {
                              return (
                                <Item key={d.title}>
                                  <Effect
                                    title={d.title}
                                    val={d.val}
                                    hasToolTip={d.hasToolTip}
                                  ></Effect>
                                </Item>
                              );
                            })
                          : null}
                        </InputDetails>
                    </InputContainer>
                </Background>
                <PrimaryButton
                blue={true}
                positioned={true}
                text="Close Position"
                onClick={async () => {
                    setLoading(true);
                    try {
                    let res = await closeCDP(cdp.id, cdp.asaID);
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
            </SubContainer>
        </Container>
        <div style={{position:"relative", top:-28}}>
            <Details mobile={mobile} details={details}/>
        </div>
</div>

}
const Container = styled.div`
    display: flex;
    position: relative;
    justify-content: center;
`

const SubContainer = styled.div`
    position: relative;
    ${(props) => props.mobile && css`
        width: 100%;
    `}
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
    border: 1px solid white;
`

const InputDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 49%);
  row-gap: 30px;
  justify-content: center;
  padding: 30px 0px 30px;
  border-radius: 10px;
`;

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
