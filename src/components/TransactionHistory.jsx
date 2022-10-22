import React, { useEffect, useState, useContext } from "react";
import styled, { css } from "styled-components";
import { camelToWords, formatToDollars } from "../utils";
import { getWalletInfo } from "../wallets/wallets";
import { CDPsToList } from "./Positions";
import chevron from "../assets/icons/tablePag_icon.png";
import { loadDbActionAndMetrics, queryUser } from "./Firebase";
import { onSnapshot } from "firebase/firestore";
import algoLogo from "../assets/icons/algorand_logo_mark_black_small.png";
import gardLogo from "../assets/icons/gardlogo_icon_small.png"

function mAlgosToAlgos(num) {
  return num / 1000000;
}

function mAlgosToAlgosFixed(num) {
  return mAlgosToAlgos(num).toFixed(1);
}

function totalVal(n1, n2) {
  return formatToDollars(((n1 - n2) / 1e6).toString())
}

// only call db if wallet present
const dbData =
  typeof getWalletInfo() !== "undefined"
    ? await loadDbActionAndMetrics()
    : null;
const transHistory = dbData ? dbData.webappActions : [];

function formatTime(dateInMs) {
  return new Date(dateInMs).toLocaleString();
}

/**
 * applies binary styling to numerical cells of transaction history table
 * @param {any} val
 * @param {function} formatter
 * @param {string[]} classes
 * @returns {object} {...className, ...value}
 */
function formatDataCell(val, formatter, classes, assetType) {
  let computed = formatter(val);
  return {
    className: computed == 0 ? "" : computed < 0 ? classes[0] : classes[1],
    value: computed,
    assetType: assetType
  };
}

function actionToLabel(type_enum) {
  switch (type_enum) {
    case 0:
      return "New Position";
    case 1:
      return "Close Position";
    case 2:
      return "Add Collateral";
    case 3:
      return "Mint Gard";
    case 4:
      return "Governance";
    case 5:
      return "Debt Repay";
    case 6:
      return "Vote";
    case 7:
      return "Auction Bid";
    case 8:
      return "Swap";
    default:
      return "Position";
  }
}

const cdpIds = CDPsToList();

function formatHistory(documents) {
  const hist_length = documents.length - 1;
  let formattedHistory = new Array(hist_length + 1);
  const dummy = documents.map((entry, idx) => {
    // commenting this out -> should be available for the sake of a link to the CDP on algoExplorer
    // let formattedAddress = entry.cdpAddress.slice(0, 10) + '...' + entry.cdpAddress.slice(entry.cdpAddress.length - 3, entry.cdpAddress.length - 1)
    let formattedAlgo = formatDataCell(
      entry.microAlgos,
      mAlgosToAlgosFixed,
      ["negative", "positive"],
      "Algo",
    );
    let formattedGard = formatDataCell(
      entry.microGARD,
      mAlgosToAlgosFixed,
      ["negative", "positive"],
      "Gard",
    );

    const newTableEntry = {
      transactionType: actionToLabel(entry.actionType),
      totalValue: totalVal(entry.microAlgos, entry.microGARD),
      tokenAmountA: formattedAlgo
        ? formattedAlgo
        : mAlgosToAlgos(entry.microAlgos).toFixed(3),
      tokenAmountB: formattedGard
        ? formattedGard
        : mAlgosToAlgos(entry.microGARD).toFixed(3),
      timestamp: formatTime(entry.timestamp),
    };
    formattedHistory[hist_length - idx] = newTableEntry;
    return;
  });
  return formattedHistory;
}
const formattedHistory = formatHistory(transHistory);
/**
 * Reworked implementation of Table.jsx for the Dashboard to show txn history
 * @prop {string} headerColor - background color for the header row. If ommited default is used
 * @prop {string} tableColor - background color for the rows in the table. If ommited default is used
 */

export default function TransactionHistory() {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPageStart, setCurrentPageStart] = useState(1);
  const [documents, setDocuments] = useState(formattedHistory);
  const [shownRows, setShownRows] = useState(documents.slice(0, 10));
  const keys = formattedHistory.length
    ? Object.keys(formattedHistory[0])
    : ["No transaction history to display"];

  useEffect(() => {
    if (typeof getWalletInfo() !== "undefined") {
      const q = queryUser();
      const unsub = onSnapshot(q, (docSnap) => {
        let docs = [];
        docSnap.forEach((doc) => {
          docs.push([...doc.data().webappActions]);
        });
        let formatted = formatHistory(docs[0]);
        setDocuments(formatted);
      });
      return () => {
        unsub();
      };
    }
  }, [documents]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setShownRows(documents.slice(0, rowsPerPage));
    setCurrentPageStart(1);
  }, [rowsPerPage]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setShownRows(
      documents.slice(currentPageStart - 1, currentPageStart + rowsPerPage - 1),
    );
  }, [currentPageStart]);

  useEffect(() => {
    setRowsPerPage(rowsPerPage);
    setShownRows(
      documents.slice(currentPageStart - 1, currentPageStart + rowsPerPage - 1),
    );
  }, [documents]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignContent: "center",
          paddingLeft: 24,
          marginBottom: 19,
        }}
      >
        <div style={{ marginRight: 8, fontWeight: "bolder" }}>
          <Title>Transactions</Title>
        </div>
        <CountContainer>
          <CountText>
            {documents.length !== 0
              ? documents.length > 1
                ? `${documents.length} Transactions`
                : `${documents.length} Transaction`
              : "No Transactions recorded"}
          </CountText>
        </CountContainer>
      </div>
      <div style={{ marginBottom: 64 }}>
        <TableGrid>
          <tbody>
            <HeaderRow>
              {keys.map((value, index) => {
                if (value === "button") return;
                return (
                  <HeaderElement key={index}>
                    {camelToWords(value)}
                  </HeaderElement>
                );
              })}
            </HeaderRow>
            {shownRows.map((value, index) => {
              return (
                <TableRow key={index}>
                  {keys.map((keyVal, keyIndex) => {
                    return typeof value[keyVal] === "object" ? (
                      <Cell className={value[keyVal].className} key={keyIndex}>
                        {value[keyVal].assetType === "Algo" ? (
                          <div style={{display: "flex", flexDirection: "row"}} >
                          <div style={{height: "40px"}}>
                            <AlgoImg src={algoLogo}></AlgoImg>
                            </div>
                        <div style={{display: "flex", flexDirection: "row", alignItems: "center"}} >
                        {value[keyVal].value}
                        </div>
                            <div style={{padding: 2, alignSelf: "center" }}>
                              Algo
                              </div>
                          </div>
                        ) : (
                          <div style={{display: "flex", flexDirection: "row"}} >
                          <div style={{height: "30px", padding: 4}}>
                            <GardImg src={gardLogo}></GardImg>
                          </div>
                            <div style={{display: "flex", flexDirection: "row", alignItems: "center"}} >
                        {value[keyVal].value}
                        </div>
                          <div style={{padding: 2, alignSelf: "center"}} >
                            Gard
                            </div>
                          </div>
                        )}
                      </Cell>
                    ) : (
                      <Cell key={keyIndex}>{value[keyVal]}</Cell>
                    );
                  })}
                </TableRow>
              );
            })}
          </tbody>
        </TableGrid>
        {documents.length > 10 ? (
          <PaginationBar>
            <PaginationDiv>
              <div style={{ marginRight: 8 }}>
                <PaginationText>Rows per Page:</PaginationText>
              </div>
              <div>
                <PaginationSelect
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(parseInt(e.target.value))}
                >
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </PaginationSelect>
              </div>
            </PaginationDiv>
            <PaginationDiv>
              <div style={{ marginRight: 40 }}>
                <PaginationText>{`${currentPageStart}-${
                  currentPageStart + rowsPerPage - 1 > documents.length
                    ? documents.length
                    : currentPageStart + rowsPerPage - 1
                } of ${documents.length} items`}</PaginationText>
              </div>
              <PaginationDiv>
                <PaginationButton
                  style={{
                    marginRight: 20,
                    cursor: currentPageStart - rowsPerPage < 1 ? "" : "pointer",
                  }}
                  onClick={() => {
                    if (currentPageStart - rowsPerPage < 1) return;
                    setCurrentPageStart(currentPageStart - rowsPerPage);
                  }}
                >
                  <img
                    src={chevron}
                    style={{ height: 24, transform: "rotate(180deg)" }}
                  />
                </PaginationButton>
                <PaginationButton
                  style={{
                    cursor:
                      currentPageStart + rowsPerPage > documents.length
                        ? ""
                        : "pointer",
                  }}
                  onClick={() => {
                    if (currentPageStart + rowsPerPage > documents.length)
                      return;
                    setCurrentPageStart(currentPageStart + rowsPerPage);
                  }}
                >
                  <img src={chevron} style={{ height: 24 }} />
                </PaginationButton>
              </PaginationDiv>
            </PaginationDiv>
          </PaginationBar>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

const PaginationDiv = styled.div`
  display: flex;
  flex-direction: row;
`;

// styled components
const TableGrid = styled.table`
  /* border-collapse: collapse; */
  border: 1px transparent;
  /* border-radius: 6px; */
  width: 100%;
  margin: 10px;
  border-collapse: separate;
  border-spacing: 0px;

  /* top-left border-radius */
  table tr:first-child th:first-child {
    border-top-left-radius: 6px;
  }

  /* top-right border-radius */
  table tr:first-child th:last-child {
    border-top-right-radius: 6px;
  }

  /* bottom-left border-radius */
  table tr:last-child td:first-child {
    border-bottom-left-radius: 6px;
  }

  /* bottom-right border-radius */
  table tr:last-child td:last-child {
    border-bottom-right-radius: 6px;
  }
`;

const AlgoImg = styled.img`
  max-width: 100%;
  max-height: 100%;
  filter: invert();
`
const GardImg = styled.img`
 max-width: 100%;
  max-height: 100%;
`

const Title = styled.text`
  font-weight: 500;
  font-size: 18px;
`;

const CountContainer = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 2px 8px;
`;

const CountText = styled.text`
  font-weight: 500;
  font-size: 12px;
  color: #999696;
`;

const HeaderRow = styled.tr`
  background: #0f1733;
  height: 44px;
  border-radius: 8px;
`;
const HeaderElement = styled.th`
  font-weight: 500;
  font-size: 14px;
  color: white;
  height: 44px;
  padding-left: 16px;
  border-left: none;
  border-top: 1px solid #172756;
  text-align: left;
  :first-child {
    /* border-top-left-radius: 10px; */
    /* border-bottom-left-radius: 10px; */
  }
  :last-child {
    /* border-top-right-radius: 10px; */
    /* border-bottom-right-radius: 10px; */
  }
`;
const TableRow = styled.tr`
  height: 60px;
  border-radius: 8px;
  background: #0f1733;
  border-bottom: 4px transparent #172756;
  background-clip: padding-box;

`;
export const Cell = styled.td`
  border-bottom: 4px solid #172756;
  background-clip: padding-box;
  font-weight: 500;
  font-size: 14px;
  height: 44px;
  padding-left: 16px;
  text-align: left;
  ${(props) =>
    props.className && props.className === "negative"
      ? css`
           {
            color: red;
          }
        `
      : props.className && props.className === "positive"
      ? css`
           {
            color: green;
          }
        `
      : null}
`;

const PaginationBar = styled.div`
  background: rgba(13, 18, 39, 0.65);
  height: 60px;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: 16;
  padding-right: 16;
  justify-content: space-between;
`;
const PaginationText = styled.text`
  font-weight: normal;
  font-size: 12px;
  color: white;
`;
const PaginationSelect = styled.select`
  font-size: 12px;
  line-height: 16px;
  color: #464646;
  border: 0px;
`;
const PaginationButton = styled.button`
  background: transparent;
  border: 0px;
  cursor: normal;
  ${(props) =>
    props.darkToggle &&
    css`
      filter: invert();
    `}
`;
