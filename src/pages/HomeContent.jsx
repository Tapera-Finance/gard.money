import React, { useState, useEffect } from "react";
import styled, {css} from "styled-components";
import Details from "../components/Details";
import { ids } from "../transactions/ids";
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
import { cdpInterest } from "../transactions/lib"
import { getStakingAPY } from "../transactions/stake"
import { searchAccounts } from "./GovernContent";
import { getWalletInfo } from "../wallets/wallets";
import { getCDPs } from "../transactions/cdp";
import { CDPsToList } from "../components/Positions"
import { checkStaked } from "../components/actions/StakeDetails";
import { commitmentPeriodEnd } from "../globals";
import { Global, device } from "../styles/global";

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

export async function getBorrowed() {
  const v2GardPriceValidatorId = 890603991
  const sgardGardId = 890603920
  async function lookupApplications(appId) {
    const axiosObj = axios.create({
      baseURL: 'https://mainnet-idx.algonode.cloud',
      timeout: 300000,
    })
    return (await axiosObj.get(`/v2/applications/${appId}`)).data
  }
  function getStateUint(state, key) {
    const val = state.find((entry) => {
      if (entry.key === key) {
        return entry;
      }
    })
    return val.value.uint
  }
  async function getAppState(appId) {
    const res = await lookupApplications(appId);
    return res.application.params["global-state"];
  }

  const validatorState = await getAppState(v2GardPriceValidatorId);
  const SGardDebt = getStateUint(validatorState, btoa('SGARD_OWED'))
  const sgardState = await getAppState(sgardGardId);
  const SGardConversion = getStateUint(sgardState, btoa('conversion_rate'))
  return (SGardDebt * SGardConversion / 1e10)/1e6
}

async function getTotalUsers() {

  let nexttoken;
  let response = null;
  const users = new Set();

  const validators = [ids.app.validator, ids.app.gard_staking]
  for(var i = 0; i < validators.length; i++){
    do {
      // Find accounts that are opted into the GARD price validator application
      // These accounts correspond to CDP opened on the GARD protocol
      response = await searchAccounts({
        appId: validators[i],
        limit: 1000,
        nexttoken,
      });
      for (const account of response['accounts']) {
        users.add(account);
      }
      nexttoken = response['next-token']
    } while (nexttoken != null);
  }
  return users.size
}

const buttons = [
  "Swap",
  "Stake",
  "Borrow",
  "Govern",
  "Auctions",
  // "Analytics",
  // "Auctions",
  // "Pool",
  // "Stake",
  // "Trade CDP",
]

/**
 * Content found on home
 */
export default function HomeContent() {
  const [tvl, setTvl] = useState("...");
  const [apy, setApy] = useState("...");
  const [borrowed, setBorrowed] = useState("...");
  const [backed, setBacked] = useState(0);
  const [apr, setApr] = useState(0);
  const [users, setUsers] = useState("Loading...")
  const [chainData, setChainData] = useState("");
  const [governors, setGovernors] = useState("...");
  const [allOpen, setAllOpen] = useState(true);
  const [difficulty, setDifficulty] = useState("Help Me Out");
  const [gardInWallet, setGardInWallet] = useState(false);
  const [gaining, setGaining] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const walletAddress = useSelector((state) => state.wallet.address);

  useEffect(async () => {
    const chainDataResponse = await getChainData();
    setChainData(chainDataResponse);
  }, []);

  useEffect(async () => {
    if (walletAddress) {
     let info = await getWalletInfo()
     let gardInfo = info["assets"].filter((asset) => asset["asset-id"] === ids.asa.gard)
      if (gardInfo.length > 0 && gardInfo[0]["amount"] > 0) {
        setGardInWallet(true)
      }
    }
    if (walletAddress) {
      let stakePromise = await checkStaked()
      let cdps = CDPsToList();
      if (cdps.length > 0 || stakePromise === true) {
        setGaining(true)
      }
    }
  }, [])

  const circulating = "TBD"
  /* const circulating = JSON.parse(
    chainData ? chainData["circulating-gard"][8064 - 1] : 0,
  ) */

  useEffect(async () => {
    const apyPromise = getStakingAPY("NL")
    const govInfo = await getGovernanceInfo();
    setApr(await getAlgoGovAPR())
    setGovernors(parseInt(govInfo[0]).toLocaleString("en-US"));
    console.log("2", govInfo[1]);
    setApy((await apyPromise).toFixed(2))
  }, []);

  const homeDetails = [
    {
      title: "Total Value Locked",
      val: `$${tvl.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
      hasToolTip: true,
    },
    {
      title: "Total GARD Borrowed",
      val: `$${borrowed.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
      hasToolTip: true,
    },
    {
      title: "GARD Staking APR",
      val: `${apy}%`,
      hasToolTip: true,
    },
    {
      title: "Number of Users",
      val: `${users.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
      hasToolTip: true,
    },
    {
      title: "GARD Overcollateralization",
      val: `${backed}%`,
      hasToolTip: true,
    },
    {
      title: "GARD Borrow APR",
      val: `${cdpInterest*100}%`,
      hasToolTip: true,
    },
    {
      title: "Total Governors", // GARD Governors later
      val: `${governors} Governors`,
      hasToolTip: false,
    },
    {
      title: "GARD Governance APR",
      val: `${apr}%`,
      hasToolTip: true,
    },
  ];

  useEffect(async () => {
    let res = await fetchTvl();
    let borrowed_res = await getBorrowed();
    if (res && borrowed_res) {
      setTvl(res.currentChainTvls.Algorand.toFixed(2));
      setBacked(
        (100 * res.currentChainTvls.Algorand / borrowed_res).toFixed(
          2,
        ),
        setBorrowed(borrowed_res.toFixed(2)),
      );
    }
  }, []);

  useEffect(async () => {
    let res = await getAlgoGovAPR();
    if (res) {
      setApr(res);
    }
    setUsers(await getTotalUsers());
  }, []);

  return (
    <HomeWrapper
      expert={difficulty == "DeFi Expert" ? true : false}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >

        <Banner expert={difficulty == "DeFi Expert" ? true : false}>
          <div
            style={{
              justifyContent: "center",
              textAlign: "left",
              alignItems: "center",
              color: "#172756",
            }}
          >
            <div style={{ fontSize: "10pt" }}>GARD Staking Rewards!</div>
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
            <div
              style={{
                display: "flex",
                textAlign: "left",
                flexDirection: "column",
              }}
            >
              <div style={{ color: "#172756", fontSize: "10pt" }}>
                Earn protocol rewards boosted by the Algorand Foundation via
                Aeneas grant!
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Link
              onClick={() => {
                walletAddress
                  ? navigate("/stake")
                  : dispatch(
                      setAlert(
                        "You cannot enter without first connecting a Wallet",
                      ),
                    );
              }}
            >
              Stake
            </Link>
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
          alignItems: "center",
        }}
      >
        <ToggleBox>
          <BinaryToggle
            optionA="Help Me Out"
            optionB="DeFi Expert"
            selectedOption={setDifficulty}
          />
        </ToggleBox>
        <Container expert={difficulty == "DeFi Expert" ? true : false}>
          <Items>
            {homeDetails.length && homeDetails.length > 0
              ? homeDetails.map((d) => {
                  return (
                    <Item key={d.title}>
                      <Effect
                        title={d.title}
                        val={d.val}
                        hasToolTip={d.hasToolTip}
                        rewards={d.rewards}
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
      <div style={{ display: "inline-grid" }}>
        {difficulty === "Help Me Out" ? (
          <StepContainer>
            <Text
              style={{ color: "#80edff" }}
              onClick={() => setAllOpen(!allOpen)}
            >
              {allOpen ? `Collapse` : `Expand`} All
            </Text>

            <ConnectStep>
              <Text>
                {walletAddress ? `  √` : ""} Step 1: Connect Your Wallet
              </Text>
              <div>
                <WalletConnect style={{ alignSelf: "flex-start" }} />
              </div>
            </ConnectStep>

            <Step
              header="Step 2: Get Gard"
              badges={[]}
              checked={gardInWallet}
              subtitle=""
              text="To get GARD and use it to participate in the services offered by the GARD Protocol a user may either swap their ALGOs for it or borrow it against their ALGOs/ALGO derivatives. To swap GARD go to the swap page. To borrow GARD go to the borrow page."
              link="https://docs.algogard.com/how-to/get-gard"
              linkText="How to get GARD"
              goTo="Swap"
              secondGoTo="Borrow"
              allOpen={allOpen}
            />
            <Step
              header="Step 3: Gain Rewards"
              badges={[
                {
                  text: "Staking Rate",
                  val: apy,
                },
                {
                  text: "Governance Rate",
                  val: apr,
                },
              ]}
              checked={gaining}
              subtitle=""
              text="To gain additional rewards via the GARD Protocol a user may stake their GARD or participate in Algorand governance. Staking GARD entitles users to their share of revenues earned by the protocol in real time. Participating in Algorand Governace via the GARD Protocol entitles users to leverage their committed ALGOs to borrow GARD as well as their share of a 7M ALGO boost paid out quarterly by the Algorand Foundation."
              link="https://gard.gitbook.io/gard-system-guide/how-to/participate-in-algorand-governance-via-gard-protocol"
              linkText="What is needed to participate?"
              goTo="Stake"
              secondGoTo="Govern"
              allOpen={allOpen}
            />
          </StepContainer>
        ) : (
          <div>
            <Text>Quick Access</Text>
            <AccessBox expert={difficulty == "DeFi Expert" ? true : false}>
              {buttons.map((action) => {
                return (
                  <PrimaryButton
                    disabled={!walletAddress}
                    text={action}
                    blue={true}
                    onClick={() => navigate(`/${action.toLowerCase()}`)}
                    key={Math.random()}
                  />
                );
              })}
            </AccessBox>
          </div>
        )}
      </div>
    </HomeWrapper>
  );
}

const ToggleBox = styled.div`
  margin: 8px 0px 8px 0px;
  @media (${device.tablet}) {

  }
`

const HomeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  ${(props) =>
    props.expert &&
    css`
      margin-right: 30px;
    `
  }
`

const AccessBox = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 100px;
  align-items: center;
  ${(props) =>
    props.expert &&
    css`
      margin-right: 30px;
    `
  }
`

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
  width: 90%;
  flex-direction: row;
  border-radius: 10px;
  justify-content: space-between;
  text-align: center;
  background: linear-gradient(to right, #80deff 65%, #ffffff);
  padding: 8px 6px 10px 8px;
  margin: 8px;
  @media (${device.tablet}) {
    width: 100%;
    ${(props) =>
    props.expert &&
    css`
      margin-right: 70px;
      width: 80%;
    `
  }
  }
  ${(props) =>
    props.expert &&
    css`
      margin-right: 30px;
    `
  }
`


const Container = styled.div`
  background: #0E1834;
  padding-top: 30px;
  width: 90%;
  padding-bottom: 30px;
  border: 1px solid white;
  border-radius: 10px;
  @media (${device.tablet}) {
    width: 100%;
    ${(props) =>
    props.expert &&
    css`
      margin-right: 70px;
      width: 80%;
    `
  }
  }
  ${(props) =>
    props.expert &&
    css`
      margin-right: 30px;
    `
  }
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
  padding: 0px 10px 0px 10px;
  display: flex;
  font-weight: 500;
  font-size: large;
  text-align: left;
  align-items: center;
  background: #0f1733;
  color: #019fff;
  border-radius: 10px;
  margin-top: 20px;
  margin-bottom: 20px;
  ${(props) =>
    props.open &&
    css`
      background: #019fff;
      color: #0f1733;
    `}
  ${(props) =>
    props.allOpen &&
    css`
      background: #019fff;
      color: #0f1733;
      /* width: 60vw; */
    `}
    @media (max-width:663)
    {
      button {
        font-size: smaller
      }

    }
    @media (${device.mobileL}) {
      //
    }
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


/**
 * unused banners
 *
 *
 *
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
          <div style={{ fontSize: "8pt" }}>Now - October 21, 2022 EOD</div>
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
          <div style={{ fontSize: "10pt",  }}>ALGO Gov Boost!</div>
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

          <div style={{ color: "#172756", fontSize: "10pt" }}>100,000 ALGO Boost for Algorand Governance Period #5!</div>
          </div>
        </div>
        <div style={{display: "flex", alignItems: "center", justifyContent: "flex-end"}}>

        <Link onClick={() => {
            window.open("https://www.algogard.com/news/gard-100k-governance-boost.html")
          }}>Learn More</Link>
        </div>
      </Banner>
 */
