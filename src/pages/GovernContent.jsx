import React, { useEffect, useState } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { useDispatch } from "react-redux";
import { setAlert } from "../redux/slices/alertSlice";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Details from "../components/Details";
import PrimaryButton from "../components/PrimaryButton";
import RewardNotice from "../components/RewardNotice";
import TextButton from "../components/TextButton";
import Table from "../components/Table";
import { CDPsToList } from "../components/Positions";
import { loadFireStoreCDPs } from "../components/Firebase";
import LoadingOverlay from "../components/LoadingOverlay";
import { cdpGen } from "../transactions/contracts";
import { commitCDP, getPrice } from "../transactions/cdp";
import { handleTxError, getWallet } from "../wallets/wallets";
import { commitmentPeriodEnd } from "../globals";
import CountdownTimer from "../components/CountdownTimer";
import Effect from "../components/Effect";
import { textAlign } from "@mui/system";
import { Switch } from "@mui/material";
import Modal from "../components/Modal";
import { getAlgoGovAPR } from "../components/Positions";
import { isFirefox } from "../utils";

const axios = require("axios");

export async function searchAccounts({ appId, limit = 1000, nexttoken, }) {
  const axiosObj = axios.create({
    baseURL: 'https://mainnet-idx.algonode.cloud',
    timeout: 300000,
  })
  await new Promise((r) => setTimeout(r, 100));
  const response = (await axiosObj.get('/v2/accounts', {
    params: {
      'application-id': appId,
      limit,
      next: nexttoken
    }
  }))
  return response.data
}

/* Get value locked in user-controlled smart contracts */
async function getAlgoGovernanceAccountBals() {

  const v2GardPriceValidatorId = 890603991
  let nexttoken
  let response = null
  let totalContractAlgo = 0

  const validators = [v2GardPriceValidatorId]
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
        totalContractAlgo += (account['amount'] / Math.pow(10, 6))
      }
      nexttoken = response['next-token']
    } while (nexttoken != null);
  }
  return totalContractAlgo
}

function getGovernorPage(id) {
  return (
    "https://governance.algorand.foundation/governance-period-5/governors/" +
    cdpGen(getWallet().address, id).address
  );
}

export async function getGovernanceInfo() {
  let response;
  try {
    response = await axios.get(
      "https://governance.algorand.foundation/api/periods/statistics/",
    );
  } catch (ex) {
    response = null;
    console.log(ex);
  }
  if (response) {
    console.log(response);
    const governorCount = parseInt(response["data"].unique_governors_count);
    const enrollmentEnd =
      response["data"]["periods"][0].registration_end_datetime;
    return [governorCount, enrollmentEnd];
  }
  return null;
}

export async function getCommDict(){
  let res = {}
  const cdps = CDPsToList()
  if (cdps[0].id == "N/A"){
    return {}
  }
  const owner_address = getWallet().address
  console.log("ccccoome on")
  const addresses = cdps.filter(value => !value.asaID).map(value => cdpGen(owner_address, value.id).address)
  try {
  const axiosObj = axios.create({
    baseURL: 'https://governance.algorand.foundation/api/governors/',
    timeout: 300000,
  })
  for (let k = 0; k < addresses.length; k++){
    let response = (await axiosObj.get(addresses[k] + '/status/', {}))
    if (response) {
      res[addresses[k]] = parseInt(response.data["committed_algo_amount"])
    } else {
      res[addresses[k]] = 0
    }
  }} catch (e) {
    console.log("Error", e)
  }
  return res
}


export default function Govern() {
  const walletAddress = useSelector(state => state.wallet.address)
  const [commitment, setCommitment] = useState(undefined);
  const [maxBal, setMaxBal] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [commitDict, setCommitDict] = useState({})
  const [vaulted, setVaulted] = useState("Loading...");
  const [shownAll, setAllVotes] = useState(true);
  const [governors, setGovernors] = useState("...");
  const [enrollmentEnd, setEnrollmentEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(null);
  const [voteTableDisabled, setVoteTable] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalCanAnimate, setModalCanAnimate] = useState(false);
  const [toWallet, setToWallet] = useState(true);
  const [commitDisabled, setCommitDisabled] = useState(false);
  const [apr, setAPR] = useState("...");
  const dispatch = useDispatch();

  const navigate = useNavigate();

  useEffect(() => {
    if (!getWallet()) return navigate("/");
  }, []);

  const handleCheckboxChange1 = () => {
    setToWallet(!toWallet);
  };

  var sessionStorageSetHandler = function (e) {
    setLoadingText(JSON.parse(e.value));
  };
  document.addEventListener("itemInserted", sessionStorageSetHandler, false);
  var details = [
    {
      title: "Total Vaulted",
      val: vaulted,
      hasToolTip: true,
    },
    {
      title: "GARD Governance APR",
      val: `${apr}%`,
      hasToolTip: true,
    },
    {
      title: "Total Governors", // We want this to be GARD governors later
      val: `${governors} Governors`,
      hasToolTip: false,
    },
  ];
  useEffect(async () => {
    const govInfo = await getGovernanceInfo();
    setAPR(await getAlgoGovAPR());
    setGovernors(parseInt(govInfo[0]).toLocaleString("en-US"));
    console.log("2", govInfo[1]);
  }, []);

  useEffect(async () => {
    setCommitment(await loadFireStoreCDPs());
    setVaulted((await getAlgoGovernanceAccountBals()/1000000).toFixed(2) + `M Algo`);
  }, [refresh]);


  let loadedCDPs = CDPsToList();
  useEffect(() => {
    if (loadedCDPs[0].id == "N/A") {
      loadedCDPs = dummyCdps;
      setCommitDisabled(true);
    } else {
      setCommitDisabled(false);
    }
  }, [])

  useEffect(async () => {
    let dict = await getCommDict()
    setCommitDict(dict)
  }, [])

  const owner_address = getWallet().address;

  let adjusted = loadedCDPs.filter(value => !value.asaID).map((value) => {
    const cdp_address = cdpGen(owner_address, value.id).address;
    if (isFirefox()) {
      return {
        balance: value.collateral == "N/A" ? "N/A" : value.collateral / 1000000,
        committed: <a target="_blank" rel="noreferrer" style={{"text-decoration": "none", "color": "#019fff"}} href="https://governance.algorand.foundation/governance-period-5/governors">See external site</a>
      }
    } else {
      return {
        balance: value.collateral == "N/A" ? "N/A" : value.collateral / 1000000,
        committed: commitDict[cdp_address] == 0 || !commitDict[cdp_address] ? 0 : `${(commitDict[cdp_address] / 1000000).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
        id: value.id,
      };
    }
  });
  let cdps = adjusted.map((value, index) => {
    let account_id = parseInt(value.id);
    delete value.id;
    return {
      ...value,
      "":
        value.committed === "" ? (<a href="https://governance.algorand.foundation/governance-period-5/governors">See external site</a>) :
        value.committed !== 0 ? (
          <PrimaryButton
          blue={true}
            text={value.balance === value.committed ? "Committed" : "Commit More"}
            left_align={true}
            onClick={() => {
              if (value.id == "N/A") {
                return;
              }
              setModalCanAnimate(true);
              setModalVisible(true);
              setSelectedAccount(account_id);
              setMaxBal(value.balance);
            }}

            disabled={
              value.balance === value.committed ||
              !(Date.now() < commitmentPeriodEnd)
            }
          />
        ) : (
          <PrimaryButton
            text={"Commit"}
            blue={true}
            left_align={true}
            onClick={() => {
              if (value.id == "N/A") {
                return;
              }
              setModalCanAnimate(true);
              setModalVisible(true);
              setSelectedAccount(account_id);
              setMaxBal(value.balance);
            }}

            disabled={(!(Date.now() < commitmentPeriodEnd)) || commitDisabled}
          />
        ),
        "Verify Committment": (
          <PrimaryButton
            blue={true}
            text={"Governor Page"}
            left_align={true}
            onClick={() => {
              window.open(getGovernorPage(account_id));
            }}
            disabled={commitDisabled}
            />
        ),
    };
  });
  console.log("cdps", cdps);
  return ( !walletAddress ? navigate("/") :
    <div>
      {loading ? (
        <LoadingOverlay
          text={loadingText}
          close={() => {
            setLoading(false);
          }}
        />
      ) : (
        <></>
      )}
{/*
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
            window.open("https://www.algorand.foundation/news/algorand-community-governance-allocating-7m-algos-from-the-q4-2022-governance-rewards-to-defi-governors")
          }}>Learn More</Link>
        </div>
      </Banner>
        */}
      <div style={{marginBottom: 30}}>
        <fieldset
          style={{
            borderRadius: 10,
            border: "1px solid #80edff",
            width:"70%",
            transform: "rotate(180deg)",
            background: "#0E1834",
            margin: "auto",
          }}
        >
          <div style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            textAlign: "center",
            background: "#0E1834",
            padding: "20px 20px 0px",
            margin: "auto",
            transform: "rotate(180deg)",

          }}>
            <h3>Algorand Governance Period #5</h3>
            <div style={{ fontSize: 11 }}>Registration Ends</div>
            <CountDownContainer>
            <CountdownTimer targetDate={commitmentPeriodEnd} showZero={new Date().getTime() > commitmentPeriodEnd} />
              {/* 1761180257000 */}
            </CountDownContainer>
            <div>
              <GovernDetails>
                {details.length && details.length > 0
                  ? details.map((d) => {
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
              </GovernDetails>
            </div>
          </div>

          <legend style={{margin: "auto", transform: "rotate(180deg)" }}> <TextButton text="Learn More on Foundation Site →" onClick={() => window.open("https://governance.algorand.foundation/governance-period-5")}/></legend>
        </fieldset>
      </div>
      <div
        style={{
          height: 70,
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#0E1834",
          border: "1px solid #80edff",
          borderBottom: "none"
        }}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ marginLeft: 25, marginRight: 8 }}>
            <Title>Algorand Positions</Title>
          </div>
          <CountContainer>
            <CountText>{cdps.length}{cdps.length == 1 ? " Position": " Positions" }</CountText>
          </CountContainer>
        </div>
        <div style={{ marginRight: 20 }}>
          <PrimaryButton text="Commit All" blue={true} disabled={true}/>
        </div>
      </div>
      <Table data={cdps} />
      <PrimaryButton text="Deposit ALGOs" blue={true} underTable={true} onClick={() => {
            navigate("/borrow");
          }}Enroll/>
      {voteTableDisabled ? <></>:
      <div>
        <div
          style={{
            height: 70,
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#0E1834",
            border: "1px solid white",
            borderBottom: "none"
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ marginLeft: 25, marginRight: 8 }}>
              <Title>Algorand Votes</Title>
            </div>
            <CountContainer>
              <CountText>2 Votes Open, 1 Closed Vote</CountText>
            </CountContainer>
          </div>
          <div style={{ display: "flex", marginRight: 20 }}>
            <PrimaryButton text="Submit All Votes" blue={true}/>
          </div>
        </div>
        <Table data={dummyVotes} />
      </div>}
      <Modal
        title={"ALGOs to Commit"}
        close={() => setModalVisible(false)}
        animate={modalCanAnimate}
        visible={modalVisible}
      >
        {(
          <div>
            <div style={{ marginBottom: 45, marginTop: 80 }}>
              <div style={{ marginBottom: 8 }}>
                <InputTitle>Number of Algos to Commit</InputTitle>
                <InputMandatory>*</InputMandatory>
              </div>
              <div style={{ marginBottom: 16 }}>
                <InputSubtitle>{`${maxBal} Algos will be committed`}</InputSubtitle>
              </div>
              <div style={{ marginBottom: 8 }}>
                <InputTitle>
                  Optional: Send governance rewards directly to your ALGO
                  wallet?
                </InputTitle>
              </div>
              <div>
                <label
                  style={{
                    display: "flex",
                    alignContent: "center",
                  }}
                >
                  <input
                    type={"checkbox"}
                    checked={toWallet}
                    onChange={handleCheckboxChange1}
                  />
                  <InputSubtitle>
                    Governance rewards will be sent to your{" "}
                    <span style={{ fontWeight: "bold" }}>
                      {toWallet ? "ALGO Wallet" : "CDP"}
                    </span>
                  </InputSubtitle>
                </label>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <PrimaryButton
                blue={true}
                text="Confirm Commitment"
                onClick={async () => {
                  setModalCanAnimate(true);
                  setModalVisible(false);
                  setLoading(true);
                  try {
                    const res = await commitCDP(
                      selectedAccount,
                      maxBal,
                      toWallet,
                    );
                    if (res.alert) {
                      dispatch(setAlert(res.text));
                    }
                  } catch (e) {
                    handleTxError(e, "Error committing");
                  }
                  setModalCanAnimate(false);
                  setLoading(false);
                  setRefresh(refresh + 1);
                }}
              />
              <CancelButton style={{ marginLeft: 30 }}>
                <CancelButtonText>
                  Cancel
                </CancelButtonText>
              </CancelButton>
            </div>
          </div>
        )}
      </Modal>
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
  margin-bottom: 14px;
`
const GovernDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 30%);
  text-align: center;
  row-gap: 30px;
  justify-content: center;
  padding: 0px 0px 10px;
  border-radius: 10px;
  background: #0e1834;
  align-items: flex-end;
`;
const Item = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 15px;
`;
const CountDownContainer = styled.div`
  background: #0e1834;
  height: 128px;
  display: flex;
  justify-content: center;
  align-content: center;
`;

const Title = styled.text`
  font-weight: 500;
  font-size: 18px;
`;

const CountContainer = styled.div`
  background: #172756;
  border-radius: 16px;
  padding: 2px 8px;
  height: 20px;
`;

const CountText = styled.text`
  font-weight: 500;
  font-size: 12px;
  color: white;
`;
const dummyCommits = [
  {
    Account: "123456",
    Balance: "Dec 29, 2021",
    APY: "4.5%",
    "": <PrimaryButton blue={true} text="Commit" />,
  },
  {
    Account: "123456",
    Balance: "Closed",
    APY: "4.5%",
    "": <PrimaryButton blue={true} text="Commit" />,
  },
];

const dummyVotes = [
  {
    nameOfProposal: "Lorem ippsum dol...",
    votesCloses: "Dec 29, 2021",
    votesInFavor: "59%",
    votesOutstanding: "37%",
    "": (
      // <PrimaryButton
      //   blue={true}
      //   text="Vote"
      // />
      <div style={{ display: "flex" }}>
        <div style={{ alignSelf: "center", color: "#01d1ff" }}>Yes</div>
        <Switch />
        <div style={{ alignSelf: "center", color: "grey" }}>No</div>
      </div>
    ),
  },
  {
    nameOfProposal: "Lorem ippsum dol...",
    votesCloses: "Dec 29, 2021",
    votesInFavor: "59%",
    votesOutstanding: "37%",
    "": (
      // <PrimaryButton
      //   blue={true}
      //   text="Vote"
      // />
      <div style={{ display: "flex" }}>
        <div style={{ alignSelf: "center", color: "#01d1ff" }}>Yes</div>
        <Switch />
        <div style={{ alignSelf: "center", color: "grey" }}>No</div>
      </div>
    ),
  },
  {
    nameOfProposal: "Lorem ippsum dol...",
    votesCloses: "Closed",
    votesInFavor: "59%",
    votesOutstanding: "36%",
    "": (
      // <PrimaryButton
      //   blue={true}
      //   text="Vote"
      // />
      <div style={{ display: "flex" }}>
        <div style={{ alignSelf: "center", color: "#01d1ff" }}>Yes</div>
        <Switch />
        <div style={{ alignSelf: "center", color: "grey" }}>No</div>
      </div>
    ),
  },
];
const InputMandatory = styled.text`
  font-weight: bold;
  font-size: 16px;
  color: #ff9999;
`;
const InputTitle = styled.text`
  font-weight: bold;
  font-size: 16px;
`;
const BoldText = styled.text`
  font-weight: 700;
`;
const InputSubtitle = styled.text`
  font-weight: normal;
  font-size: 12px;
`;
const CancelButton = styled.button`
  border: 0px;
  background: transparent;
  display: flex;
  align-items: center;
  height: "100%";
  cursor: pointer;
`;
const CancelButtonText = styled.text`
  font-weight: 500;
  font-size: 16px;
  color: white;
`;

const dummyCdps = [
  {
    account: "N/A",
    balance: "N/A",
    APY: "",
    "": "",
  },
];
