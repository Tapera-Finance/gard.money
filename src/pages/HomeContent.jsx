import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Details from "../components/Details";
import CountdownTimer from "../components/CountdownTimer";
import PrimaryButton from "../components/PrimaryButton";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { getAlgoGovAPR } from "../components/Positions";
import WalletConnect from "../components/WalletConnect";
import Step from "../components/Step";
import BinaryToggle from "../components/BinaryToggle";

const fetchTvl = async () => {
  try {
    let res = await axios.get("https://api.llama.fi/protocol/gard");
    if (res) {
      const { data } = res;
      return data;
    }
  } catch (e) {
    throw new Error(e, "Unable to fetch gard llama.fi tvl data");
  }
};

const buttons = [
  "Actions",
  "Borrow",
  "Govern",
  "Analytics",
  // "Auctions",
  // "Pool",
  // "Stake",
  // "Trade CDP",
]

/**
 * Content found on home
 */
export default function HomeContent() {
  const [tvl, setTvl] = useState(0);
  const [apy, setApy] = useState(8);
  const [backed, setBacked] = useState(0);
  const [apr, setApr] = useState(0);
  const [allOpen, setAllOpen] = useState(false);
  const [difficulty, setDifficulty] = useState("Help Me Out");
  const navigate = useNavigate();
  const walletAddress = useSelector((state) => state.wallet.address);

  const homeDetails = [
    {
      title: "Total Value Locked",
      val: `${tvl.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
      hasToolTip: false,
    },
    {
      title: "APY",
      val: `${apy}.00%`,
      hasToolTip: false,
    },
    {
      title: "Gard Backed %",
      val: `${backed}%`,
      hasToolTip: false,
    },
    {
      title: "ALGO APR",
      val: `${apr}%`,
      hasToolTip: false,
    },
  ];

  useEffect(async () => {
    let res = await fetchTvl();
    console.log("res res ress", res);
    if (res) {
      console.log("respose from tvl call", res);
      setTvl(res.currentChainTvls.Algorand.toFixed(2));
      setBacked(
        (res.currentChainTvls.Algorand / res.currentChainTvls.borrowed).toFixed(
          2,
        ),
      );
    }
  }, []);

  useEffect(async () => {
    let res = await getAlgoGovAPR();
    if (res) {
      console.log("apr", res);
      setApr(res);
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          borderRadius: 10,
          justifyContent: "space-between",
          textAlign: "center",
          background: "linear-gradient(to right, #80deff 65%, #ffffff)",
          padding: "20px 20px 0px",
        }}
      >
        <div
          style={{
            justifyContent: "center",
            textAlign: "left",
            color: "#172756",
          }}
        >
          <div>Governance Period #4</div>
          <div style={{ fontSize: "10pt" }}>Now - October 22, 2022</div>
          <div>12% - 33% APR Rewards</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: "center",
            marginLeft: "25px",
          }}
        >
          <span style={{ color: "#172756" }}>Enrollment Countdown</span>
          <CountdownTimer targetDate={1761180257000} />
        </div>
        <EnrollButton
          text="Enroll"
          onClick={() => navigate("/borrow")}
        ></EnrollButton>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          textAlign: "center",
          marginTop: "18px",
          marginBottom: "18px",
        }}
      >
        <div style={{ margin: "8px 0px 8px 0px" }}>
          <BinaryToggle
            optionA="Help Me Out"
            optionB="De-Fi Expert"
            selectedOption={setDifficulty}
          />
        </div>

        <Details details={homeDetails} />
        <div>
          <Text
            style={{
              color: "#7c52ff",
              textAlign: "center",
              fontWeight: "bolder",
            }}
            // onClick={() => navigate("/analytics")}
          >
            {`See More Metrics ${">"}`}
          </Text>
        </div>
      </div>
      {difficulty === "Help Me Out" ? (
        <div>
          <div
            style={{
              display: "flex",
              marginTop: "8px",
              marginLeft: "14px",
              marginBottom: "8px",
              marginRight: "14px",
              justifyContent: "center",
              alignItems: "center",
              padding: "0px 16px 0px 16px",
              fontWeight: "bolder",
            }}
          >
            <Text>
              The GARD Protocol is the first of its kind to offer marry stable
              coins, yield products, staking, and liquidity purchasing. To start
              capitalizing off of this unique blend of capabilities, click
              through the options below to see some of the common paths users
              take to make money!
            </Text>
          </div>
          <StepContainer>
            <Text
              style={{ color: "#80edff" }}
              onClick={() => setAllOpen(!allOpen)}
            >
              {allOpen ? `Collapse` : `Expand`} All
            </Text>
            {!walletAddress ? (
              <Step>
                Step 0: Connect Wallet:{" "}
                {<WalletConnect style={{ alignSelf: "flex-start" }} />}
              </Step>
            ) : (
              <></>
            )}

            <Step
              header="Step 1: Get Gard"
              badges={["Aeneas"]}
              subtitle="Exchange ALGO to borrow GARD"
              text="Click the button below to be taken to the Borrow Page; Here you can open Collateralized Debt Positions using ALGO to draw a stable line of credit in GARD, our stablecoin"
              goTo="Borrow"
              allOpen={allOpen}
            />
            <Step
              header="Step 2: Gain Rewards"
              badges={["Aeneas", "LP"]}
              subtitle="Add Liquidity to Pool"
              text="Click the button below to be taken to the Swap Page; Here you can swap and pool with ASAs"
              goTo="Swap"
              allOpen={allOpen}
            />
            <Step
              header="Step 3: Gain More"
              badges={["LP"]}
              subtitle="Sell LP tokens"
              text="Click the button below to be taken to the Sell LP Tokens Page; Here you can sell LP tokens accumulated through interfacing with our liquidity pools, as well as auction and sell CPDs/positions created on our Borrow Page"
              goTo="Govern"
              allOpen={allOpen}
            />
          </StepContainer>
        </div>
      ) : (
        <div style={{
          display: "flex",
          justifyContent: "space-evenly",
          alignItems: "center",
          width: "80%"
        }}>
          {buttons.map((action) => {
            return (
              <PrimaryButton text={action} purple onClick={() => navigate(`/${action.toLowerCase()}`)} key={Math.random()} />
            )
          })}
          </div>
      )}
    </div>
  );
}

// styled components
const StepContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  margin-bottom: 50px;
`;

const Text = styled.text`
  font-weight: 500px;
`;

const EnrollButton = styled(PrimaryButton)`
  appearance: none;
  border: none;
`;
