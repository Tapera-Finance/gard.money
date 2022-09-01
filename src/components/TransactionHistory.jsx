import React, { useEffect, useState, useContext } from "react";
import styled, { css } from "styled-components";
import { camelToWords } from "../utils";
import { getWalletInfo } from "../wallets/wallets";
import { CDPsToList } from "../pages/RepayContent";
import chevron from "../assets/icons/tablePag_icon.png";
import { loadDbActionAndMetrics, queryUser } from "./Firebase";
import { onSnapshot } from "firebase/firestore";

function mAlgosToAlgos(num) {
  return num / 1000000;
}

function mAlgosToAlgosFixed(num) {
  return mAlgosToAlgos(num).toFixed(3);
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
function formatDataCell(val, formatter, classes) {
  let computed = formatter(val);
  return {
    className: computed == 0 ? "" : computed < 0 ? classes[0] : classes[1],
    value: computed,
  };
}

function actionToLabel(type_enum) {
  switch (type_enum) {
    case 0:
      return "NEW CDP";
    case 1:
      return "CLOSE CDP";
    case 2:
      return "ADD COLLATERAL";
    case 3:
      return "MINT GARD";
    case 4:
      return "COMMITMENT";
    case 5:
      return "DEBT REPAY";
    case 6:
      return "VOTE";
    case 7:
      return "AUCTION BID";
    case 8:
      return "SWAP";
    default:
      return "CDP";
  }
}

const cdpIds = CDPsToList();

function formatHistory(documents) {
  const hist_length = documents.length - 1;
  let formattedHistory = new Array(hist_length + 1);
  const dummy = documents.map((entry, idx) => {
    // commenting this out -> should be available for the sake of a link to the CDP on algoExplorer
    // let formattedAddress = entry.cdpAddress.slice(0, 10) + '...' + entry.cdpAddress.slice(entry.cdpAddress.length - 3, entry.cdpAddress.length - 1)
    let formattedAlgo = formatDataCell(entry.microAlgos, mAlgosToAlgosFixed, [
      "negative",
      "positive",
    ]);
    let formattedGard = formatDataCell(entry.microGARD, mAlgosToAlgosFixed, [
      "negative",
      "positive",
    ]);

    const newTableEntry = {
      description: actionToLabel(entry.actionType),
      // id: entry.actionType === 0 ? cdpIds[idx].id : 0,
      algos: formattedAlgo
        ? formattedAlgo
        : mAlgosToAlgos(entry.microAlgos).toFixed(3),
      gard: formattedGard
        ? formattedGard
        : mAlgosToAlgos(entry.microGARD).toFixed(3),
      date: formatTime(entry.timestamp),
      feesPaid: formatDataCell(-entry.feesPaid, mAlgosToAlgosFixed, [
        "negative",
        "positive",
      ]),
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

export default function TransactionHistory({ headerColor, tableColor }) {
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
        <div style={{ marginRight: 8 }}>
          <Title>Transaction History</Title>
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
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <tbody>
            <HeaderRow style={{ background: headerColor }}>
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
                <TableRow
                  key={index}
                  style={{
                    color: tableColor,
                    borderBottom: "solid",
                    borderBottomWidth: 1,
                    borderColor: "#F9F9F9",
                  }}
                >
                  {keys.map((keyVal, keyIndex) => {
                    return typeof value[keyVal] === "object" ? (
                      <Cell className={value[keyVal].className} key={keyIndex}>
                        {value[keyVal].value}
                      </Cell>
                    ) : (
                      <Cell key={keyIndex}>{value[keyVal]}</Cell>
                    );
                  })}
                </TableRow>
              );
            })}
          </tbody>
        </table>
        {documents.length > 10 ? (
          <PaginationBar
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              paddingLeft: 16,
              paddingRight: 16,
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            >
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
            </div>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <div style={{ marginRight: 40 }}>
                <PaginationText>{`${currentPageStart}-${
                  currentPageStart + rowsPerPage - 1 > documents.length
                    ? documents.length
                    : currentPageStart + rowsPerPage - 1
                } of ${documents.length} items`}</PaginationText>
              </div>
              <div style={{ display: "flex", flexDirection: "row" }}>
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
              </div>
            </div>
          </PaginationBar>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

// styled components
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
  background: rgba(13, 18, 39, 0.75);
  height: 44px;
`;
const HeaderElement = styled.th`
  font-weight: 500;
  font-size: 14px;
  color: white;
  height: 44px;
  padding-left: 16px;
  text-align: left;
  :first-child {
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
  }
  :last-child {
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
  }
`;
const TableRow = styled.tr`
  height: 60px;
`;
export const Cell = styled.td`
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
