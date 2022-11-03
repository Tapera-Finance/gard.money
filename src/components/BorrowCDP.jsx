import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import Effect from "./Effect";
import ToolTip from "./ToolTip";
import PrimaryButton from "./PrimaryButton";
import { mint } from "../transactions/cdp";
import {
  handleTxError,
  getWalletInfo,
  updateWalletInfo,
} from "../wallets/wallets";
import { setAlert } from "../redux/slices/alertSlice";
import LoadingOverlay from "./LoadingOverlay";
import { mAlgosToAlgos } from "../pages/BorrowContent";

export default function BorrowCDP({
  setCollateral,
  collateral,
  minted,
  cdp,
  price,
  setCurrentCDP,
  manageUpdate,
  maxMint,
  apr,
  setUtilization
}) {
  const walletAddress = useSelector((state) => state.wallet.address);
  const [balance, setBalance] = useState(0);
  const [supplyLimit, setSupplyLimit] = useState(0);
  const [borrowLimit, setBorrowLimit] = useState(0)
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {debt} = cdp

  const [additionalBorrow, setAdditionalBorrow] = useState("");

  const calcUtilization = (borrowed, maxBorrow) => {
   return ((100 * borrowed ) / maxBorrow).toFixed(2)
  }

  const handleAddBorrow = (event) => {
    manageUpdate(true)
    setUtilization(calcUtilization((event.target.value === "" ? mAlgosToAlgos(cdp.debt) : Number(event.target.value) + mAlgosToAlgos(cdp.debt)), mAlgosToAlgos(cdp.debt) + borrowLimit))
    setAdditionalBorrow(
      event.target.value === "" ? "" : Number(event.target.value),
    );
    minted(event.target.value === "" ? "" : Number(event.target.value));

  };

  const handleMaxBorrow = (event) => {
    manageUpdate(true)
    minted(borrowLimit)
    setAdditionalBorrow(borrowLimit)
    setUtilization(calcUtilization(borrowLimit, borrowLimit))
  }

  useEffect(async () => {
    await updateWalletInfo();
    let wallet = await getWalletInfo();
    if (wallet !== null) {
      setBalance((getWalletInfo()["amount"] / 1000000).toFixed(3));
    }
    let borrowMax = Math.max(
      0,
      Math.trunc(
        (100 * ((price * cdp.collateral) / 1000000)) / 1.4 -
          (100 * cdp.debt) / 1000000,
      ) / 100,
    )
    setBorrowLimit(borrowMax)
    setUtilization(calcUtilization(mAlgosToAlgos(cdp.debt), mAlgosToAlgos(cdp.debt) + borrowMax))
  }, []);

  useEffect(() => {
    setSupplyLimit(balance);
  }, [balance]);

  useEffect(() => {
    if (!walletAddress) navigate("/");
  }, [walletAddress]);
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
          (100 * ((price * cdp.collateral) / 1000000)) / 1.4 -
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

  return (
    <div>
      {loading ? <LoadingOverlay text={loadingText} close={()=>{setLoading(false);}}/> : <></>}
      <Container>
        <SubContainer>
          <Background>
            <Title>Borrow More GARD</Title>
            <InputContainer>
              <div style={{ display: "flex" }}>
                <Input
                  autoComplete="off"
                  display="none"
                  placeholder={"enter amount"}
                  type="number"
                  min="0.00"
                  id="borrowMore"
                  value={additionalBorrow}
                  onChange={handleAddBorrow}
                />
                <MaxButton onClick={handleMaxBorrow}>
                  <ToolTip
                    toolTip={"+MAX"}
                    toolTipText={"Click to lend maximum amount"}

                  />
                </MaxButton>
              </div>
              <Valuation>
                $Value: ${(additionalBorrow * 1).toFixed(2)}
              </Valuation>
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
            text="Borrow More"
            onClick={async () => {
              setLoading(true);
              try {
                let res = await mint(cdp.id, additionalBorrow, cdp.asaID);
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
    </div>
  );
}
const Container = styled.div`
  display: flex;
  justify-content: center;
  top: -40px;
`;

const SubContainer = styled.div`
  position: relative;
  margin-bottom: 30px;
`;
const Background = styled.div`
  margin-top: 30px;
  background: #1b2d65;
  border-radius: 10px;
`;
const Title = styled.div`
  display: flex;
  justify-content: center;
  text-align: center;
  padding: 20px 0px 20px;
`;

const InputContainer = styled.div`
  background: rgba(13, 18, 39, 0.75);
  border-radius: 10px;
  border: 1px solid white;
`;

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
`;
const MaxButton = styled.button`
  color: #01d1ff;
  background: none;
  border: none;
  margin-top: 50px;
  cursor: pointer;
  font-size: 12px;
`;

const Text = styled.text`
  //
`
const Valuation = styled.div`
  margin-left: 25px;
  margin-top: 3px;
  font-size: 12px;
  color: #999696;
`;
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
`;
