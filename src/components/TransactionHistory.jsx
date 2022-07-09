import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import { camelToWords } from "../utils";
import { getWalletInfo } from '../wallets/wallets'
import PrimaryButton from "./PrimaryButton";
import chevron from '../assets/icons/tablePag_icon.png'
import { ThemeContext } from "../contexts/ThemeContext";
import { getCDPs } from "../transactions/cdp";
import { app } from './Firebase';
import {
  getFirestore,
  getDoc,
  doc
} from "firebase/firestore";

// get the firestore database instance
const db = getFirestore(app);

function mAlgosToAlgos(num) {
  return num / 1000000
}

function mAlgosToAlgosFixed(num) {
  return mAlgosToAlgos(num).toFixed(2)
}

export async function loadDbActionAndMetrics() {
  const owner_address = getWalletInfo().address
  const docRef = doc(db, "users", owner_address);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        webappActions: data.webappActions,
        systemAssetVal: data.systemAssetVal,
        systemDebtVal: data.systemDebtVal
      }
    } else {
      console.log("No webactions, asset values, or debt values")
    }
  } catch (e) {
    throw new Error(e)
  }

}

const dbData = await loadDbActionAndMetrics();
const transHistory = dbData.webappActions;

function formatTime(dateInMs) {
  return new Date(dateInMs).toLocaleDateString()

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
    className: computed < 0 ? classes[0] : classes[1],
    value: computed
  }
}

function getCDPids() {
  let ids = [];
  const CDPs = getCDPs()
  if (getWalletInfo() && CDPs[getWalletInfo().address] != null) {
    const accountCDPs = CDPs[getWalletInfo().address]
    for (const cdpID of Object.entries(accountCDPs)) {
      ids.push({id: cdpID})
    }
  }
  return ids
}
const cdpIds = getCDPids()

const formattedHistory = transHistory.map((entry, idx) => {
  // commenting this out -> should be available for the sake of a link to the CDP on algoExplorer
  // let formattedAddress = entry.cdpAddress.slice(0, 10) + '...' + entry.cdpAddress.slice(entry.cdpAddress.length - 3, entry.cdpAddress.length - 1)
  let formattedAlgo = formatDataCell(entry.microAlgos, mAlgosToAlgosFixed, ['negative', 'positive']);
  let formattedGard = formatDataCell(entry.microGARD, mAlgosToAlgosFixed, ['negative', 'positive']);


  const newTableEntry = {
    type: entry.actionType === 0 ? "CDP": "Swap",
    // cdpAddress: collapsed ? formattedAddress : entry.cdpAddress,
    id: cdpIds[idx].id,
    algos: formattedAlgo ? formattedAlgo : mAlgosToAlgos(entry.microAlgos).toFixed(2) ,
    gard: formattedGard ? formattedGard : mAlgosToAlgos(entry.microGARD).toFixed(2),
    date: formatTime(entry.timestamp),
    feesPaid: mAlgosToAlgos(entry.feesPaid)
  };
  return newTableEntry
})

/**
 * Reworked implementation of Table.jsx for the Dashboard to show txn history
 * @prop {string} headerColor - background color for the header row. If ommited default is used
 * @prop {string} tableColor - background color for the rows in the table. If ommited default is used
 */

export default function TransactionHistory({
  headerColor,
  tableColor,
}) {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [shownRows, setShownRows] = useState(transHistory.slice(0, 10));
  const [currentPageStart, setCurrentPageStart] = useState(1);
  const { theme } = useContext(ThemeContext);
  const keys = formattedHistory.length ? Object.keys(formattedHistory[0]) : ["No transaction history to display"];

  useEffect(() => {
    window.scrollTo(0, 0);
    setShownRows(formattedHistory.slice(0, rowsPerPage));
    setCurrentPageStart(1);
  }, [rowsPerPage]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setShownRows(
      formattedHistory.slice(currentPageStart - 1, currentPageStart + rowsPerPage - 1),
    );
  }, [currentPageStart]);

  useEffect(() => {
    setRowsPerPage(10);
    setShownRows(formattedHistory.slice(0, 10));
    setCurrentPageStart(1);
  }, [formattedHistory]);

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
        <CountContainer darkToggle={theme === "dark"}>
          <CountText darkToggle={theme === "dark"}>
            {formattedHistory.length !== 0
              ? formattedHistory.length > 1
                ? `${formattedHistory.length} Transactions`
                : `${formattedHistory.length} Transaction`
              : `No Transactions recorded`}
          </CountText>
        </CountContainer>
      </div>
      <div style={{ marginBottom: 64 }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <tbody>
            <HeaderRow
              darkToggle={theme === "dark"}
              style={{ background: headerColor }}
            >
              {keys.map((value, index) => {
                    if (value === "button") return;
                    return (
                      <HeaderElement darkToggle={theme === "dark"} key={index}>
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
        {formattedHistory.length > 10 ? (
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
                  currentPageStart + rowsPerPage - 1 > formattedHistory.length
                    ? formattedHistory.length
                    : currentPageStart + rowsPerPage - 1
                } of ${formattedHistory.length} items`}</PaginationText>
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
                      currentPageStart + rowsPerPage > formattedHistory.length
                        ? ""
                        : "pointer",
                  }}
                  onClick={() => {
                    if (
                      currentPageStart + rowsPerPage >
                      formattedHistory.length
                    )
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
`

const CountContainer = styled.div`
  background: #f9f5ff;
  border-radius: 16px;
  padding: 2px 8px;
  ${(props) =>
    props.darkToggle &&
    css`
      background: #404040;
  `}
`

const CountText = styled.text`
  font-weight: 500;
  font-size: 12px;
  color: #6941c6;
  ${(props) =>
    props.darkToggle &&
    css`
      color: white;
  `}
`

const HeaderRow = styled.tr`
  background: #f9fafb;
  height: 44px;
  ${(props) =>
    props.darkToggle &&
    css`
      background: #404040;
  `}
`
const HeaderElement = styled.th`
  font-weight: 500;
  font-size: 14px;
  color: #667085;
  height: 44px;
  padding-left: 16px;
  text-align: left;
  ${(props) =>
    props.darkToggle &&
    css`
      color: white;
  `}
`
const TableRow = styled.tr`
  height: 60px;
`
export const Cell = styled.td`
  font-weight: 500;
  font-size: 14px;
  height: 44px;
  padding-left: 16px;
  text-align: left;
  ${(props) => props.className && props.className === 'negative' ?
  css`
    {
      color: red
    }
  ` : props.className && props.className === 'positive' ?
  css`
    {
      color: green;
    }
  ` :
  null
}
`

const PaginationBar = styled.div`
  background: #fcfcfd;
  height: 60px;
`
const PaginationText = styled.text`
  font-weight: normal;
  font-size: 12px;
  color: #464646;
`
const PaginationSelect = styled.select`
  font-size: 12px;
  line-height: 16px;
  color: #464646;
  border: 0px;
`
const PaginationButton = styled.button`
  background: transparent;
  border: 0px;
  cursor: normal;
`
