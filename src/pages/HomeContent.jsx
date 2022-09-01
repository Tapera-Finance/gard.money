import React, { useState, useContext, useEffect } from "react";
import styled, { css } from "styled-components";
import linkIconWhite from "../assets/icons/link_icon_white.png";
import RewardNotice from "../components/RewardNotice";
import Details from "../components/Details";
import CountdownTimer from "../components/CountdownTimer";
import PrimaryButton from "../components/PrimaryButton";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { getAlgoGovAPR } from "../components/Positions";
import WalletConnect from "../components/WalletConnect";

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

/**
 * Content found on home
 */
export default function HomeContent() {
  const [tvl, setTvl] = useState(0);
  const [apy, setApy] = useState(8);
  const [backed, setBacked] = useState(0);
  const [apr, setApr] = useState(0);
  const navigate = useNavigate();
  const walletAddress = useSelector(state => state.wallet.address)

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
        <Details details={homeDetails} />
        <div>
          <Text
            style={{
              color: "#7c52ff",
              textAlign: "center",
              fontWeight: "bolder",
            }}
            onClick={() => console.log("seeing more metrics, eh?")}
          >
            {`See More Metrics ${">"}`}
          </Text>
        </div>
      </div>
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
          capitalizing off of this unique blend of capabilities, click through
          the options below to see some of the common paths users take to make
          money!
        </Text>
      </div>
      <StepContainer>
        {!walletAddress ? (
          <Step>
            Step 0: Connect Wallet:{" "}
            {<WalletConnect style={{ alignSelf: "flex-start" }} />}
          </Step>
        ) : (
          <></>
        )}

        <StepItem
          header="Step 1: Get Gard"
          badges={["Aeneas"]}
          subtitle="Exchange ALGO to borrow GARD"
          text="Click the button below to be taken to the Borrow Page; Here you can open Collateralized Debt Positions using ALGO to draw a stable line of credit in GARD, our stablecoin"
          goTo="Borrow"
        />
        <StepItem
          header="Step 2: Gain Rewards"
          badges={["Aeneas", "LP"]}
          subtitle="Add Liquidity to Pool"
          text="Click the button below to be taken to the Swap Page; Here you can swap and pool with ASAs"
          goTo="Swap"
        />
        <StepItem
          header="Step 3: Gain More"
          badges={["LP"]}
          subtitle="Sell LP tokens"
          text="Click the button below to be taken to the Sell LP Tokens Page; Here you can sell LP tokens accumulated through interfacing with our liquidity pools, as well as auction and sell CPDs/positions created on our Borrow Page"
          goTo="Govern"
        />
      </StepContainer>
    </div>
  );
}


const StepContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  margin-bottom: 50px;
`


const Text = styled.text`
  font-weight: 500px;
`;

const EnrollButton = styled(PrimaryButton)`
  appearance: none;
  border: none;
`

// styled components
const Title = styled.text`
  font-size: 30px;
  font-weight: 700;
  /* background: "linear-gradient(#80deff, #ffffff)" */
`;
const Subtitle = styled.text`
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
`;
const Paragraph = styled.text`
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const LinkButton = styled.button`
  height: 20px;
  border-width: 0;
  background-color: transparent;
  cursor: pointer;
`;

const LinkButtonText = styled.text`
  font-weight: normal;
  font-size: 14px;
  color: #7c52ff;
  ${LinkButton}:hover & {
    text-decoration: underline;
  }
`;

const PinnedText = styled.text`
  font-weight: 500;
  font-size: 12px;
`;

const NewsImage = styled.img`
  height: 148px;
  width: 148px;
  object-fit: cover;
`;

const NewsHeadline = styled.text`
  font-weight: bold;
  font-size: 20px;
`;
const LinkButtonTextBold = styled.text`
  font-weight: bold;
  font-size: 14px;
  color: #7c52ff; ;
`;

function StepItem({ header, badges, subtitle, text, goTo }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate()

  const handleOpen = () => {
    setOpen(!open)
  }

  return (
    <ExpandedStep open={open}>
      <Step onClick={handleOpen} open={open}>
        <div style={{ marginLeft: 8 }}>{header}</div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
          }}
        >
          {open ? (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              {badges.length > 0 ? (
                badges.map((badge) => {
                  <Badge type={badge} />;
                })
              ) : (
                <></>
              )}
            </div>
          ) : (
            <></>
          )}
        </div>
      </Step>
      {open ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            textAlign: "left",
            alignItems: "left",
            justifyContent: "space-evenly",
          }}
        >
          <text style={{ fontWeight: "bolder", width: "40%", marginBottom: 12 }}>{subtitle}</text>
          <text style={{ width: "60vw", marginBottom: 6, marginTop: 6 }}>{text}</text>
          <div style={{ display: "flex", justifyContent: "left" }}>
            <StepButton
              text={`Go to ${goTo}`}
              purple

              onClick={() => navigate(`/${goTo.toLowerCase()}`)}
            />
            <div style={{ marginLeft: "75%" }}></div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </ExpandedStep>
  );
}

const Step = styled.div`
  display: flex;
  /* justify-content: center; */
  text-align: left;
  align-items: center;
  background: #0f1733;
  color: #019fff;
  height: 80px;
  width: 60vw;
  border-radius: 10px;
  margin-top: 20px;
  margin-bottom: 20px;
  ${(props) => props.open && css`
    background: #019fff;
    color: #0f1733;
    width: 60vw;
  `}
`

const StepButton = styled(PrimaryButton)`
  appearance: none;
  border: none;
  margin-top: 8px;
  margin: unset;
`

const ExpandedStep = styled.div`
  width: 100%auto;
`

const Badge = ({type}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        background: "#0f1733",
        border: "1px solid #80edff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <text style={{ color: "#ffffff" }}>{type} Reward</text>
          <hr style={{ border: "dashed 1px #019fff" }}></hr>
        </div>
        <text style={{ color: "#80edff" }}>0.03%</text>
      </div>
    </div>
  );
}

