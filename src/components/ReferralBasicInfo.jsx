import { getReferrerDB } from "./Firebase";
import styled from "styled-components";
import { device } from "../styles/global";
import { useState, useEffect } from "react";

export default function ReferralBasicInfo({refIDs}){
    const [refTotal, setRefTotal] = useState(-1)

    useEffect(async () => {
        let result = await getReferrerDB(refIDs)
        setRefTotal(result.length)
      }, []);

    return (
    <AcctPgCont>
        <AccountContainer>
            <div
            style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
                alignItems: "start",
                marginBottom: 10,
            }}
            >
            <div>
                <Label>Total Referred</Label>
                <br></br>
                <AccountNumber>
                {refTotal == -1
                    ? "Loading..."
                    : refTotal}
                </AccountNumber>
            </div>
            </div>
        </AccountContainer>
    </AcctPgCont>
    )
}

const AcctPgCont = styled.div`
  /* max-width: 90vw; */
`

const AccountContainer = styled.div`
  background: rgba(13, 18, 39, 0.75);
  border: 1px solid white;
  padding: 5vw 4vw;
  margin-top: 36px;
  margin-bottom: 56px;
  border-radius: 10px;
  @media (${device.mobileL}) {
    max-width: 90vw;
  }
  @media (${device.tablet}) {
    max-width: 90vw;
  }
`;
const Label = styled.label`
  font-size: 22px;
  color: #ffffff;
  text-decoration: underline;
  margin-bottom: -20px;
  /* margin-bottom: */
`;
const AccountNumber = styled.text`
  font-weight: normal;
  font-size: 16px;
`;