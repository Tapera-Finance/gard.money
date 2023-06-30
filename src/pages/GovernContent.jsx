import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setAlert } from "../redux/slices/alertSlice";
import { useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import PrimaryButton from "../components/PrimaryButton";
import TextButton from "../components/TextButton";
import Table from "../components/Table";
import { CDPsToList } from "../components/Positions";
import LoadingOverlay from "../components/LoadingOverlay";
import { cdpGen } from "../transactions/contracts";
import { commitCDP } from "../transactions/cdp";
import { handleTxError, getWallet } from "../wallets/wallets";
import { commitmentPeriodEnd, countdownEnd } from "../globals";
import CountdownTimer from "../components/CountdownTimer";
import Effect from "../components/Effect";
import Modal from "../components/Modal";
import { getAlgoGovAPR, getField } from "../components/Positions";
import { isFirefox } from "../utils";
import { device } from "../styles/global";
import { voteCDPs, goOnlineCDP } from "../transactions/cdp";
import { isMobile } from "../utils";
import { setLoadingStage } from "../transactions/lib";

const axios = require("axios");

export function GoHomeIfNoWallet(navigate){
  try{
    getWallet().address
    return false
  }
  catch {
    navigate("/")
    return true
  }
}

export async function searchAccounts({ appId, limit = 1000, asset=0, nexttoken, }) {
  const axiosObj = axios.create({
    baseURL: "https://mainnet-idx.algonode.cloud",
    timeout: 300000,
  });
  await new Promise((r) => setTimeout(r, 100));
  const arg = asset ? "asset-id" : "application-id";
  const response = (await axiosObj.get("/v2/accounts", {
    params: {
      [arg]: appId,
      limit,
      next: nexttoken
    }
  }));
  return response.data;
}

/* Get value locked in user-controlled smart contracts */
async function getAlgoGovernanceAccountBals() {

  const v2GardPriceValidatorId = 890603991;
  let nexttoken;
  let response = null;
  let totalCommitedAlgo = 0;
  let totalGovs = 0;

  const axiosObj = axios.create({
    baseURL: "https://governance.algorand.foundation/api/governors/",
    timeout: 300000,
  });
  async function isGovernor(address) {
    try {
        let response = (await axiosObj.get(address + "/status/", {}));
        if (response) {
          totalCommitedAlgo += parseInt(response.data["committed_algo_amount"]);
          totalGovs += 1;
        }
      }
      catch (error) {
        if (error.response) {
          console.log(error.response);
        } else if (error.request) {
          // This means the item does not exist
        } else {
          // This means that there was an unhandled error
          console.error(error);
        }
      }
  }

  let promises = [];
  const validators = [v2GardPriceValidatorId];
  for(var i = 0; i < validators.length; i++){
    do {
      // Find accounts that are opted into the GARD price validator application
      // These accounts correspond to CDP opened on the GARD protocol
      response = await searchAccounts({
        appId: validators[i],
        limit: 1000,
        nexttoken,
      });
      for (const account of response["accounts"]) {
        promises.push(isGovernor(account.address));
      }
      nexttoken = response["next-token"];
    } while (nexttoken != null);
  }
  await Promise.allSettled(promises);
  return [(totalCommitedAlgo/1e12).toFixed(2) + "M Algo", totalGovs];
}

function getGovernorPage(id) {
  return (
    "https://governance.algorand.foundation/governance-period-8/governors/" +
    cdpGen(getWallet().address, id).address
  );
}

export async function getCommDict(){
  let res = {};
  const cdps = CDPsToList();
  if (cdps[0].id == "N/A"){
    return {};
  }
  const owner_address = getWallet().address;
  const addresses = cdps.filter(value => !value.asaID).map(value => cdpGen(owner_address, value.id).address);
  try {
  const axiosObj = axios.create({
    baseURL: "https://governance.algorand.foundation/api/governors/",
    timeout: 300000,
  });
  for (let k = 0; k < addresses.length; k++){
    let response = (await axiosObj.get(addresses[k] + "/status/", {}));
    if (response) {
      res[addresses[k]] = parseInt(response.data["committed_algo_amount"]);
    } else {
      res[addresses[k]] = 0;
    }
  }} catch (error) {
    if (error.response) {
      console.log(error.response);
    } else if (error.request) {
      // This means the item does not exist
    } else {
      // This means that there was an unhandled error
      console.error(error);
    }}
  return res;
}


export default function Govern() {
  const [mobile, setMobile] = useState(isMobile());
  const walletAddress = useSelector(state => state.wallet.address);
  const [maxBal, setMaxBal] = useState("");
  const [commit, setCommit] = useState(0);
  const [vote0, setVote0] = useState("Yes");
  const [vote1, setVote1] = useState("Allocate a higher amount (25MM ALGO) to DeFi rewards.");
  const [vote2, setVote2] = useState("Yes");
  const [vote3, setVote3] = useState("Allocate 7.5MM through the Targeted DeFi Rewards program.");
  const [vote4, setVote4] = useState("Yes");
  const [vote5, setVote5] = useState("Allocate 500K ALGO to the NFT Rewards program pilot");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("")
  const [refresh, setRefresh] = useState(0);
  const [commitDict, setCommitDict] = useState({});
  const [vaulted, setVaulted] = useState("Loading...");
  const [governors, setGovernors] = useState("Loading...");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modal2Visible, setModal2Visible] = useState(false);
  const [modal3Visible, setModal3Visible] = useState(false);
  const [modalCanAnimate, setModalCanAnimate] = useState(false);
  const [modal2CanAnimate, setModal2CanAnimate] = useState(false);
  const [modal3CanAnimate, setModal3CanAnimate] = useState(false);
  const [personal, setPersonal] = useState(false)
  const [onlineStatus, setOnlineStatus] = useState(false)
  const [commitDisabled, setCommitDisabled] = useState(false);
  const [apr, setAPR] = useState("...");
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const voteMap = [{
    "Yes": "a",
    "No": "b",
  },
  {
    "Allocate a higher amount (25MM ALGO) to DeFi rewards.": "a",
    "Allocate the same amount (20MM ALGO) to DeFi rewards as GP7.": "b",
  },
  {
    "Yes": "a",
    "No": "b",
  },
  {
    "Allocate 7.5MM through the Targeted DeFi Rewards program.": "a",
    "Allocate 5MM through the Targeted DeFi Rewards program.": "b",
  },
  {
    "Yes": "a",
    "No": "b",
  },
  {
    "Allocate 500K ALGO to the NFT Rewards program pilot": "a",
    "Allocate 250K ALGO to the NFT Rewards program pilot": "b",
  },];

  useEffect(() => {
    if (!getWallet()) return navigate("/");
  }, []);

  useEffect(() => {
    setMobile(isMobile());
  }, []);

  var sessionStorageSetHandler = function (e) {
    setLoadingText(JSON.parse(e.value));
  };
  document.addEventListener("itemInserted", sessionStorageSetHandler, false);
  var details = [
    {
      title: "Total Committed",
      val: vaulted,
      hasToolTip: true,
    },
    {
      title: "GARD Governance APR",
      val: `${apr}%`,
      hasToolTip: true,
    },
    {
      title: "GARD Governors",
      val: `${governors}`,
      hasToolTip: true,
    },
  ];
  useEffect(async () => {
    setAPR(await getAlgoGovAPR());
  }, []);

  useEffect(async () => {
    const algoGovPromise = getAlgoGovernanceAccountBals();
    const gov_results = await algoGovPromise;
    setVaulted(gov_results[0]);
    setGovernors(gov_results[1]);
  }, [refresh]);


  let loadedCDPs = CDPsToList();
  useEffect(() => {
    if (loadedCDPs[0].id == "N/A") {
      loadedCDPs = dummyCdps;
      setCommitDisabled(true);
    } else {
      setCommitDisabled(false);
    }
  }, []);

  useEffect(async () => {
    let dict = await getCommDict();
    setCommitDict(dict);
  }, []);

  if (GoHomeIfNoWallet(navigate)){
    return null
  }

  const owner_address = getWallet().address;
  let adjusted;
  console.log(commitDict)
  if (!loadedCDPs.filter(value => !value.asaID).length){
    adjusted = dummyCdps;
    if (!commitDisabled){
      setCommitDisabled(true);
    }
  }
  else {
    adjusted = loadedCDPs.filter(value => !value.asaID).map((value) => {
      const cdp_address = cdpGen(owner_address, value.id).address;
      if (isFirefox()) {
        return {
          balance: value.collateral == "N/A" ? "N/A" : `${(value.collateral / 1000000).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
          committed: <a target="_blank" rel="noreferrer" style={{"text-decoration": "none", "color": "#019fff"}} href="https://governance.algorand.foundation/governance-period-8/governors">See external site</a>,
          id: value.id,
          collateral: value.collateral,
          status: value.status
        };
      } else {
        return {
          balance: value.collateral == "N/A" ? "N/A" : `${(value.collateral / 1000000).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
          committed: commitDict[cdp_address] == 0 || !commitDict[cdp_address] ? 0 : `${(commitDict[cdp_address] / 1000000).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
          id: value.id,
          collateral: value.collateral,
          status: value.status
        };
      }
    });
  }
  let cdps = adjusted.map((value,) => {
    let account_id = parseInt(value.id);
    let commitBal = value.collateral;
    let status = value.status;
    delete value.status
    delete value.collateral;
    delete value.id;
    return {
      ...value,
      "":
        value.committed !== 0 ? (
          <PrimaryButton
          blue={true}
            text={value.balance === value.committed ? "Committed" : "Commit More"}
            left_align={true}
            tableShrink={mobile}
            onClick={() => {
              if (value.id == "N/A") {
                return;
              }
              setModalCanAnimate(true);
              setModalVisible(true);
              setSelectedAccount(account_id);
              setMaxBal(value.balance);
              setCommit(commitBal);
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
            tableShrink={mobile}
            onClick={() => {
              if (value.id == "N/A") {
                return;
              }
              setModalCanAnimate(true);
              setModalVisible(true);
              setSelectedAccount(account_id);
              setMaxBal(value.balance);
              setCommit(commitBal);
            }}

            disabled={(!(Date.now() < commitmentPeriodEnd)) || commitDisabled}
          />
        ),
        "Verify Committment": (
          <PrimaryButton
            blue={true}
            text={"Governor Page"}
            left_align={true}
            tableShrink={mobile}
            onClick={() => {
              window.open(getGovernorPage(account_id));
            }}
            disabled={commitDisabled}
            />
        ),
        "Consensus": ( 
          <PrimaryButton
            blue={true}
            text={"Node Consensus"}
            left_align={true}
            tableShrink={mobile}
            onClick={() => {
              setSelectedAccount(account_id);
              let temp = cdpGen(getWallet().address, account_id).address;
              setSelectedAddress(temp)
              setOnlineStatus(status !== "Offline")
              setModal3CanAnimate(true)
              setModal3Visible(true)
            }}
            />
        ),
    };
  });
  if (mobile) {
    cdps = cdps.map((value,) => {
      delete value["Consensus"]
      return value
    })
  }
  return ( !walletAddress ? navigate("/") :
    <GovContainer mobile={mobile}>
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
      <GovInfoContainer>
        <fieldset
          style={{
            borderRadius: 10,
            border: "1px solid white",
            // width:"70%",
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
            padding: `${mobile ? "0px 0px 0px": "20px 20px 0px"}`,
            margin: "auto",
            transform: "rotate(180deg)",

          }}>
            <h3>Algorand Governance Period #8</h3>
            <div style={{ fontSize: 11 }}>Commitment Period Ends</div>
            <CountDownContainer>
            <CountdownTimer targetDate={countdownEnd} showZero={new Date().getTime() > countdownEnd} />
            </CountDownContainer>
            <div>
              <GovernDetails mobile={mobile}>
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

          <legend style={{margin: "auto", transform: "rotate(180deg)" }}> <TextButton text="Learn More on Foundation Site →" onClick={() => window.open("https://governance.algorand.foundation/governance-period-8")}/></legend>
        </fieldset>
      </GovInfoContainer>
      {/* <TableContainer mobile={mobile}> */}
        <PositionTableContainer
        mobile={mobile}
        >
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
            <div style={{ marginLeft: 25, marginRight: 8 }}>
              <Title mobile={mobile}>Algorand Positions</Title>
            </div>
            <CountContainer>
              <CountText mobile={mobile}>{cdps.length}{cdps.length == 1 ? " Position": " Positions" }</CountText>
            </CountContainer>
          </div>
          <div style={{ margin: `${mobile ? "0px 5px 0px" : "0px 20px 0px"}`}}>
            <PrimaryButton text="Commit All" blue={true} disabled={true} tableShrink={mobile}/>
          </div>
        </PositionTableContainer>
        <CDPTable data={cdps} mobile={mobile}/>
      {/* </TableContainer> */}

      <div style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            textAlign: "center",
            padding: "20px 20px 0px",
            margin: "auto",
        }}>
      <PrimaryButton text="Deposit ALGOs" blue={true} underTable={false} onClick={() => {
            navigate("/borrow");
          }}/>
          
      {
      <PrimaryButton text="Place Votes" blue={true} underTable={false} onClick={async () => {
            setModal2CanAnimate(true);
            setModal2Visible(true);
            setModal2CanAnimate(false);
          }} disabled={!(Date.now() < 1686772800000 && Date.now() > countdownEnd) || loadedCDPs[0].id == "N/A" || loadedCDPs == dummyCdps
        }/>
        }
          </div>
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
                      commit,
                      true,
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
              <CancelButton style={{ marginLeft: 30 }} onClick={() => setModalVisible(false)}>
                <CancelButtonText>
                  Cancel
                </CancelButtonText>
              </CancelButton>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        title={"Cast Your Votes"}
        subtitle={
            <div>
              <text>Place your vote below for </text>
              <Link
              onClick={() => {
                window.open("https://governance.algorand.foundation/governance-period-8/period-8-voting-session-1");
              }}
                href="https://governance.algorand.foundation/governance-period-8/period-8-voting-session-1"
              >
                Governance Period #8 Voting Session #1
              </Link>
            </div>
        }
        close={() => setModal2Visible(false)}
        animate={modal2CanAnimate}
        visible={modal2Visible}
      >
      <div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ marginBottom: 13 }}>
                <div style={{ marginBottom: 8 }}>
                  <h3>
                    <Link
                    onClick={() => {
                      window.open("https://governance.algorand.foundation/governance-period-8/period-8-voting-session-1");
                    }}
                      href="https://governance.algorand.foundation/governance-period-8/period-8-voting-session-1"
                      subtitle={true}
                    >
                      Measure #1:
                    </Link>
                    Liquidity Provision to DeFi Protocols
                  </h3>
                  <InputTitle>Your Vote</InputTitle>
                  <InputMandatory>
                    *
                  </InputMandatory>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Select
                    value={vote0}
                    onChange={(e) => {
                      setVote0(e.target.value);
                    }}
                  >
                    <option>
                    Yes
                    </option>
                    <option>
                    No
                    </option>
                  </Select>
                </div>
                <div>
                  <InputSubtitle>
                    Select your vote from the drop down.
                  </InputSubtitle>
                </div>
              </div>
              <div style={{ marginBottom: 13 }}>
                <div style={{ marginBottom: 8 }}>
                  <h3>
                    <Link
                    onClick={() => {
                      window.open("https://governance.algorand.foundation/governance-period-8/period-8-voting-session-1");
                    }}
                      href="https://governance.algorand.foundation/governance-period-8/period-8-voting-session-1"
                      subtitle={true}
                    >
                      Measure #2:
                    </Link>
                    DeFi Rewards Q3 Allocation
                  </h3>
                  <InputTitle>Your Vote</InputTitle>
                  <InputMandatory>
                    *
                  </InputMandatory>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Select
                    value={vote1}
                    onChange={(e) => {
                      setVote1(e.target.value);
                    }}
                  >
                    <option>
                    Allocate a higher amount (25MM ALGO) to DeFi rewards.
                    </option>
                    <option>
                    Allocate the same amount (20MM ALGO) to DeFi rewards as GP7.
                    </option>
                  </Select>
                </div>
                <div>
                  <InputSubtitle>
                    Select your vote from the drop down.
                  </InputSubtitle>
                </div>
              </div>
              <div style={{ marginBottom: 13 }}>
                <div style={{ marginBottom: 8 }}>
                  <h3>
                    <Link
                    onClick={() => {
                      window.open("https://governance.algorand.foundation/governance-period-8/period-8-voting-session-1");
                    }}
                      href="https://governance.algorand.foundation/governance-period-8/period-8-voting-session-1"
                      subtitle={true}
                    >
                      Measure #3:
                    </Link>
                    Repeat of Targeted DeFi Rewards Boost Approval in Q3-Q4/2023
                  </h3>
                  <InputTitle>Your Vote</InputTitle>
                  <InputMandatory>
                    *
                  </InputMandatory>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Select
                    value={vote2}
                    onChange={(e) => {
                      setVote2(e.target.value);
                    }}
                  >
                    <option>
                    Yes
                    </option>
                    <option>
                    No
                    </option>
                  </Select>
                </div>
                <div>
                  <InputSubtitle>
                    Select your vote from the drop down.
                  </InputSubtitle>
                </div>
              </div>
              <div style={{ marginBottom: 13 }}>
                <div style={{ marginBottom: 8 }}>
                  <h3>
                    <Link
                    onClick={() => {
                      window.open("https://governance.algorand.foundation/governance-period-8/period-8-voting-session-1");
                    }}
                      href="https://governance.algorand.foundation/governance-period-8/period-8-voting-session-1"
                      subtitle={true}
                    >
                      Measure #4:
                    </Link>
                    Targeted DeFi Rewards Boost Allocation
                  </h3>
                  <InputTitle>Your Vote</InputTitle>
                  <InputMandatory>
                    *
                  </InputMandatory>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Select
                    value={vote3}
                    onChange={(e) => {
                      setVote3(e.target.value);
                    }}
                  >
                    <option>
                    Allocate 7.5MM through the Targeted DeFi Rewards program.
                    </option>
                    <option>
                    Allocate 5MM through the Targeted DeFi Rewards program.
                    </option>
                  </Select>
                </div>
                <div>
                  <InputSubtitle>
                    Select your vote from the drop down.
                  </InputSubtitle>
                </div>
              </div>
              <div style={{ marginBottom: 13 }}>
                <div style={{ marginBottom: 8 }}>
                  <h3>
                    <Link
                    onClick={() => {
                      window.open("https://governance.algorand.foundation/governance-period-8/period-8-voting-session-1");
                    }}
                      href="https://governance.algorand.foundation/governance-period-8/period-8-voting-session-1"
                      subtitle={true}
                    >
                      Measure #5:
                    </Link>
                    NFT Rewards Program Approval
                  </h3>
                  <InputTitle>Your Vote</InputTitle>
                  <InputMandatory>
                    *
                  </InputMandatory>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Select
                    value={vote4}
                    onChange={(e) => {
                      setVote4(e.target.value);
                    }}
                  >
                    <option>
                    Yes
                    </option>
                    <option>
                    No
                    </option>
                  </Select>
                </div>
                <div>
                  <InputSubtitle>
                    Select your vote from the drop down.
                  </InputSubtitle>
                </div>
              </div>
              <div style={{ marginBottom: 13 }}>
                <div style={{ marginBottom: 8 }}>
                  <h3>
                    <Link
                    onClick={() => {
                      window.open("https://governance.algorand.foundation/governance-period-8/period-8-voting-session-1");
                    }}
                      href="https://governance.algorand.foundation/governance-period-8/period-8-voting-session-1"
                      subtitle={true}
                    >
                      Measure #6:
                    </Link>
                    NFT Rewards Program Initial Allocation
                  </h3>
                  <InputTitle>Your Vote</InputTitle>
                  <InputMandatory>
                    *
                  </InputMandatory>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Select
                    value={vote5}
                    onChange={(e) => {
                      setVote5(e.target.value);
                    }}
                  >
                    <option>
                    Allocate 500K ALGO to the NFT Rewards program pilot
                    </option>
                    <option>
                    Allocate 250K ALGO to the NFT Rewards program pilot
                    </option>
                  </Select>
                </div>
                <div>
                  <InputSubtitle>
                    Select your vote from the drop down.
                  </InputSubtitle>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <PrimaryButton
                text="Confirm Vote"
                onClick={async () => {
                  setModal2CanAnimate(true);
                  setModal2Visible(false);
                  setLoading(true);
                  try {
                    let votes = [];
                    const votearray = [vote0, vote1, vote2, vote3, vote4, vote5];
                    for (let i = 0; i < 6; i++){
                      votes.push(voteMap[i][votearray[i]]);
                    }
                    const res = await voteCDPs(
                      loadedCDPs.filter(value => !value.asaID),
                      votes
                    );
                    if (res.alert) {
                      dispatch(setAlert(res.text));
                    }
                  } catch (e) {
                    handleTxError(e, "Error sending vote");
                  }
                  setModal2CanAnimate(false);
                  setLoading(false);
                }}
                blue={true}
              />
              <CancelButton style={{ marginLeft: 30 }} onClick={() => setModal2Visible(false)} >
                <CancelButtonText>
                  Cancel
                </CancelButtonText>
              </CancelButton>
            </div>
          </div>
        </Modal>
        <Modal
          title={"Secure the Algorand Blockchain"}
          subtitle={"Associate the Algos in your CDP with a consensus node"}
          close={() => setModal3Visible(false)}
          animate={modal3CanAnimate}
          visible={modal3Visible}
        >
          {(
              <div>
                <div style={{justifyContent: "center", alignItems: "center", display: "flex", flexDirection:"row", marginBottom: 10,}}>
                  Your ALGOs are currently:&nbsp; 
                { onlineStatus ? (
                <div style={{justifyContent: "center", alignItems: "center", color: "#228B22",}}>
                  ONLINE
                </div>) : (<div style={{justifyContent: "center", alignItems: "center", color: "#EE4B2B",}}>
                  OFFLINE
                </div>)}
                </div>
                <div style={{marginBottom: 10, display: "flex", flexDirection: "row"}}>
              <PrimaryButton
                blue={true}
                text="I run my own"
                onClick={() => {
                  setPersonal(!personal);
                }}
              /></div>
              {personal ? (<>
                <NodeInput
                autoComplete="off"
                display="none"
                placeholder={"Vote Key"}
                type='text'
                id="voteKey"
                />
                <NodeInput
                autoComplete="off"
                display="none"
                placeholder={"Selection Key"}
                type='text'
                id="selKey"
                />
                <NodeInput
                autoComplete="off"
                display="none"
                placeholder={"State Proof Key"}
                type='text'
                id="sprfKey"
                />
                <NodeInput
                autoComplete="off"
                display="none"
                placeholder={"Vote First Round"}
                type='number'
                min="0.00"
                id="voteFirst"
                />
                <NodeInput
                autoComplete="off"
                display="none"
                placeholder={"Vote Last Round"}
                type='number'
                min="0.00"
                id="voteLast"
                />
              <div style={{ display: "flex", flexDirection: "row", marginBottom: 5}}>
                <PrimaryButton
                  blue={true}
                  text="Secure with personal node"
                  onClick={async () => {
                    setLoading(true);
                    try {
                      let res = await goOnlineCDP(selectedAccount, getField("voteKey"), getField("selKey"), getField("sprfKey"), parseInt(getField("voteFirst")), parseInt(getField("voteLast")));
                      if (res.alert) {
                        dispatch(setAlert(res.text));
                      }
                    } catch (e) {
                      handleTxError(e, "Error going Online");
                    }
                    setLoading(false);
                    // setRefresh(refresh + 1);
                  }}
                />
                
                <CancelButton style={{ marginLeft: 30 }} onClick={() => setModal3Visible(false)}>
                  <CancelButtonText>
                    Cancel
                  </CancelButtonText>
                </CancelButton>
            </div>
            </>) : <></>}
          </div>
          )}
        </Modal>
    </GovContainer>
  );
}

const CDPTable = styled(Table)`
  margin-bottom: 64;
`;

const PositionTableContainer = styled.div`
  height: 70px;
  border-top-right-radius: 10px;
  border-top-left-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #0E1834;
  border: 1px solid white;
  border-bottom: none;
`;

const GovContainer = styled.div`
margin: auto;
width: 95%;
`;

const GovInfoContainer = styled.div`
  margin-bottom: 30px;
  @media (${device.tablet}) {
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;


const Link = styled.text`
  text-decoration: none;
  font-weight: 500;
  color: #03a0ff;
  margin-right: 12px;
  &:hover {
    color: #03ffff;
    cursor: pointer;
  }
`;

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
  ${(props) => props.mobile && css`
  grid-template-columns: 1fr;
  padding: 0px 0px 30px;
`}
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
  ${(props) => props.mobile && css`
  font-size: 16px;
  `}
`;
const Select = styled.select`
  width: 24.3055555555556vw;
  height: 44px;
  border: 1px solid #dce1e6;
  padding-left: 12px;
  box-sizing: border-box;
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
  ${(props) => props.mobile && css`
  font-size: 10px;
  `}
`;

const InputMandatory = styled.text`
  font-weight: bold;
  font-size: 16px;
  color: #ff9999;
`;
const InputTitle = styled.text`
  font-weight: bold;
  font-size: 16px;
`;
const InputSubtitle = styled.text`
  font-weight: normal;
  font-size: 12px;
`;
export const CancelButton = styled.button`
  border: 0px;
  background: transparent;
  display: flex;
  align-items: center;
  height: "100%";
  cursor: pointer;
`;
const NodeInput = styled.input`
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 10px;
  width: 80%;
  height: 60%;
  color: white;
  text-decoration: none;
  border: 2px solid white;
  opacity: 100%;
  font-size: 20px;
  background: none;
  &:focus {
    outline-width: 0;
  }
`;
export const CancelButtonText = styled.text`
  font-weight: 500;
  font-size: 16px;
  color: white;
`;

const dummyCdps = [
  {
    balance: "N/A",
    committed: "N/A",
  },
];
