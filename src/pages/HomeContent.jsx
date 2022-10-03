import React, { useState, useEffect } from "react";
import styled, {css} from "styled-components";
import Details from "../components/Details";
import CountdownTimer from "../components/CountdownTimer";
import PrimaryButton from "../components/PrimaryButton";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { getAlgoGovAPR } from "../components/Positions";
import { getCurrentAlgoUsd, getChainData } from "../prices/prices";
import WalletConnect from "../components/WalletConnect";
import Step from "../components/Step";
import BinaryToggle from "../components/BinaryToggle";
import { setAlert } from "../redux/slices/alertSlice";
import { getGovernanceInfo } from "./GovernContent";
import Effect from "../components/Effect";

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
  "Swap",
  "Stake",
  "Borrow",
  "Govern",
  "Auctions",
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
  const [chainData, setChainData] = useState("");
  const [governors, setGovernors] = useState("...");
  const [allOpen, setAllOpen] = useState(true);
  const [difficulty, setDifficulty] = useState("Help Me Out");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const walletAddress = useSelector((state) => state.wallet.address);

  useEffect(async () => {
    const chainDataResponse = await getChainData();
    setChainData(chainDataResponse);
  }, []);

  // const circulating = 0
  const circulating = JSON.parse(
    chainData ? chainData["circulating-gard"][8064 - 1] : 0,
  )

  const check = () => {
     return chainData ? console.log("chain data", chainData) : 0
  }
  check()
  useEffect(async () => {
    const govInfo = await getGovernanceInfo();
    setGovernors(parseInt(govInfo[0]).toLocaleString("en-US"));
    console.log("2", govInfo[1]);
  }, []);

  const homeDetails = [
    {
      title: "Total Value Locked",
      val: `$${tvl.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
      hasToolTip: true,
    },
    {
      title: "Total GARD Borrowed",
      val: `$${circulating.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
      hasToolTip: true,
    },
    {
      title: "GARD Staking APY",
      val: `${2}%`,
      hasToolTip: true,
    },
    {
      title: "Number of Users",
      val: 500,
      hasToolTip: true,
    },
    {
      title: "GARD Overcollateralization",
      val: `${backed}%`,
      hasToolTip: true,
    },
    {
      title: "GARD Borrow APY",
      val: 0,
      hasToolTip: true,
    },
    {
      title: "GARD Governors",
      val: `${governors} Governors`,
      hasToolTip: true,
    },
    {
      title: "GARD Governance APY",
      val: `${34.3}%`,
      hasToolTip: true,
    },
  ];

  useEffect(async () => {
    let res = await fetchTvl();
    if (res) {
      console.log("respose from tvl call", res);
      setTvl(res.currentChainTvls.Algorand.toFixed(2));
      setBacked(
        (100 * res.currentChainTvls.Algorand / res.currentChainTvls.borrowed).toFixed(
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
      <div style={{display: "flex", flexDirection: "column"}}>

      <Banner
      >
        <div
          style={{
            justifyContent: "center",
            textAlign: "left",
            alignItems: "center",
            color: "#172756",
          }}
        >
          <div style={{ fontSize: "10pt", }}>Algorand Governance Enrollment</div>
          <div style={{ fontSize: "8pt" }}>Now - October 14, 2022 EOD</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: "center",
            marginLeft: "0px",
          }}
        >
          <div style={{
            display: "flex",
            textAlign: "left",
            flexDirection: "column"
          }}>

          <div style={{ color: "#172756", fontSize: "10pt" }}>7M Algo bonus rewards when participating via DeFi protocols</div>
          </div>
        </div>
        <div style={{display: "flex", alignItems: "center", justifyContent: "flex-end"}}>

        <Link onClick={() => {
            walletAddress ?
            navigate("/borrow") : dispatch(
              setAlert(
                "You cannot enter without first connecting a Wallet",
              ),
            );
          }}>Enroll</Link>
        </div>
      </Banner>
      <Banner>
      <div
          style={{
            justifyContent: "center",
            textAlign: "left",
            alignItems: "center",
            color: "#172756",
          }}
        >
          <div style={{ fontSize: "10pt",  }}>GARD Staking Rewards!</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: "center",
            marginLeft: "0px",
          }}
        >
          <div style={{
            display: "flex",
            textAlign: "left",
            flexDirection: "column"
          }}>

          <div style={{ color: "#172756", fontSize: "10pt" }}>Earn protocol rewards boosted by the Algorand Foundation via Aeneas grant!</div>
          </div>
        </div>
        <div style={{display: "flex", alignItems: "center", justifyContent: "flex-end"}}>

        <Link onClick={() => {
            walletAddress ?
            navigate("/stake") : dispatch(
              setAlert(
                "You cannot enter without first connecting a Wallet",
              ),
            );
          }}>Stake</Link>
        </div>
      </Banner>
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
         <Container>
            <Items>
              {homeDetails.length && homeDetails.length > 0 ?
              homeDetails.map((d) => {
                  return (
                      <Item key={d.title}>
                        <Effect
                          title={d.title}
                          val={d.val}
                          hasToolTip={d.hasToolTip} rewards={d.rewards}
                        ></Effect>
                      </Item>
                    );
                  })
                : null}
            </Items>
          </Container>
        <div>
          {/* <Text
            style={{
              color: "#7c52ff",
              textAlign: "center",
              fontWeight: "bolder",
            }}
            // onClick={() => navigate("/analytics")}
          >
            {`See More Metrics ${">"}`}
          </Text> */}
        </div>
      </div>
      {difficulty === "Help Me Out" ? (
        <div>
          <StepContainer>
            <Text
              style={{ color: "#80edff" }}
              onClick={() => setAllOpen(!allOpen)}
            >
              {allOpen ? `Collapse` : `Expand`} All
            </Text>

              <ConnectStep

              >
                <Text>
                {walletAddress ? " √" : ""} Step 1: Connect Your Wallet
                </Text>
                <div>
                  <WalletConnect style={{ alignSelf: "flex-start" }} />
                  </div>
              </ConnectStep>


            <Step
              header="Step 2: Get Gard"
              badges={[]}
              subtitle=""
              text="To get GARD and use it to participate in the services offered by the GARD Protocol a user may either swap their ALGOs for it or borrow it against their ALGOs/ALGO derivatives. To swap GARD go to the swap page. To borrow GARD go to the borrow page."
              link="https://gard.gitbook.io/gard-system-guide/"
              linkText="How to get GARD"
              goTo="Swap"
              secondGoTo="Borrow"
              allOpen={allOpen}
            />
            <Step
              header="Step 3: Gain Rewards"
              badges={["Staking Rate", "Governance Rate"]}
              subtitle=""
              text="To gain additional rewards via the GARD Protocol a user may stake their GARD or participate in Algorand governance. Staking GARD entitles users to their share of revenues earned by the protocol in real time. Participating in Algorand Governace via the GARD Protocol entitles users to leverage their committed ALGOs to borrow GARD as well as their share of a 7M ALGO boost paid out quarterly by the Algorand Foundation."
              link="https://gard.gitbook.io/gard-system-guide/how-to/participate-in-algorand-governance-via-gard-protocol"
              linkText="What is needed to participate?"
              goTo="Stake"
              secondGoTo="Govern"
              allOpen={allOpen}
            />
          </StepContainer>
        </div>
      ) : (
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14
          // width: "80%"
        }}>
          <Text>Quick Access</Text>
          {buttons.map((action) => {
            return (
              <PrimaryButton disabled={!walletAddress} text={action} blue={true} onClick={() => navigate(`/${action.toLowerCase()}`)} key={Math.random()} />
            )
          })}
          </div>
      )}
    </div>
  );
}

const Link = styled.text`
  text-decoration: none;
  font-weight: 500;
  color: #172756;
  margin-right: 12px;
  &:hover {
    color: #03a0ff;
    cursor: pointer;
  }
`;

const Banner = styled.div`
  display: flex;
  flex-direction: row;
  border-radius: 10px;
  justify-content: space-between;
  text-align: center;
  background: linear-gradient(to right, #80deff 65%, #ffffff);
  padding: 8px 6px 10px 8px;
  margin: 8px;
`


const Container = styled.div`
  background: #0E1834;
  padding-top: 30px;
  padding-bottom: 30px;
  border: 1px solid #80edff;
  border-radius: 10px;
`;

const Items = styled.div`
  display: grid;
  align-items: flex-end;
  grid-template-columns: repeat(4, 22%);
  row-gap: 30px;
  justify-content: center;
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 40%);
  }
  @media (max-width: 422px) {
    grid-template-columns: repeat(1, 40%)
  }
`;

const Item = styled.div`
  display: flex;
  flex-direction: column;
`;

// styled components
const StepContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  margin-bottom: 50px;
`;

const ConnectStep = styled.div`
  display: flex;
  font-weight: 500;
  font-size: large;
  text-align: left;
  align-items: center;
  background: #0f1733;
  color: #019fff;
  height: 80px;
  width: 60vw;
  border-radius: 10px;
  margin-top: 20px;
  margin-bottom: 20px;
  ${(props) =>
    props.open &&
    css`
      background: #019fff;
      color: #0f1733;
      width: 60vw;
    `}
  ${(props) =>
    props.allOpen &&
    css`
      background: #019fff;
      color: #0f1733;
      width: 60vw;
    `}
    @media (max-width:663)
    {
      button {
        font-size: smaller
      }

    }

  /* display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  background: #0f1733;
  color: #019fff;
  font-weight: 500;
  font-size: large;
  /* height: 80px; */
  /* width: 30vw; */
  /* border-radius: 10px;
  margin-top: 20px;
  margin-bottom: 20px;
  padding-left: 20px;
  padding-right: 20px;
*/
`;

const Text = styled.text`
  font-weight: 500px;
  cursor: pointer;
  margin: 0px 14px 0px 0px;
`;

const EnrollButton = styled(PrimaryButton)`
  appearance: none;
  border: none;
  color: unset;
  margin: 6px 0px 10px 80px;
  padding: 0px 14px 0px 14px;
  &:hover {
    color: #019fff;
  }
`;
