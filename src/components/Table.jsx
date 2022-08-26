import React, { useEffect, useState, useContext } from "react";
import styled, { css } from "styled-components";
import copyIconSmall from "../assets/icons/copy_icon_small.png";
import { camelToWords } from "../utils";
import PrimaryButton from "./PrimaryButton";
import chevron from "../assets/icons/tablePag_icon.png";

/**
 * This renders a table with the given data
 * @prop {object[]} data - data to fill the table
 * @prop {string} title - title for the table
 * @prop {string} countSubtible - text to be displayed in the count subtitle. If ommited the title prop is used
 * @prop {string} headerColor - background color for the header row. If ommited default is used
 * @prop {string} tableColor - background color for the rows in the table. If ommited default is used
 * @prop {string[]} columns - Array of strings containing each column name
 * @prop {boolean} noID - boolean to specifiy removal of ID column from table
 * @param {{data: object[], title: string, countSubtitle: string, headerColor: string, columns: string[], tableColor: string}} props
 */
export default function Table({
  data,
  title,
  countSubtitle,
  columns,
  noID,
  className
}) {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [shownRows, setShownRows] = useState(data.slice(0, 10));
  const [currentPageStart, setCurrentPageStart] = useState(1);
  const keys = Object.keys(data[0]);


  useEffect(() => {
    window.scrollTo(0, 0);
    setShownRows(data.slice(0, rowsPerPage));
    setCurrentPageStart(1);
  }, [rowsPerPage]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setShownRows(
      data.slice(currentPageStart - 1, currentPageStart + rowsPerPage - 1),
    );
  }, [currentPageStart]);

  useEffect(() => {
    setRowsPerPage(10);
    setShownRows(data.slice(0, 10));
    setCurrentPageStart(1);
  }, [data]);

  return (
    <div className={className} >
      {title ? (
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
            <Title>{title}</Title>
          </div>
          <CountContainer>
            <CountText>
              {countSubtitle || `${data.length} ${title}`}
            </CountText>
          </CountContainer>
        </div>
      ) : (
        <></>
      )}
      <div style={{ marginBottom: 64 }}>
        <TableGrid>
          <tbody>
            <HeaderRow
            >
              {columns
                ? columns.map((value, index) => {
                    return (
                      <HeaderElement key={index}>
                        {value}
                      </HeaderElement>
                    );
                  })
                : keys.map((value, index) => {
                    if (value === "button") return;
                    if (value === "id" && noID) return;
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

                >
                  {keys.map((keyVal, keyIndex) => {
                    if (keyVal == "id" && noID) return;
                    return <Cell key={keyIndex}>{value[keyVal]}</Cell>;
                  })}
                </TableRow>
              );
            })}
          </tbody>
        </TableGrid>
        {data.length > 10 ? (
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
                  currentPageStart + rowsPerPage - 1 > data.length
                    ? data.length
                    : currentPageStart + rowsPerPage - 1
                } of ${data.length} items`}</PaginationText>
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
                      currentPageStart + rowsPerPage > data.length
                        ? ""
                        : "pointer",
                  }}
                  onClick={() => {
                    if (currentPageStart + rowsPerPage > data.length) return;
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
/**
 * style={{
                    background: tableColor,
                    borderBottom: "solid",
                    borderBottomWidth: 1,
                    borderColor: "#F9F9F9",
                  }}
 */


const TableGrid = styled.table`
  border: 1px transparent;
  width: 100%;
  margin: 10px;
  border-collapse: separate;
  border-spacing: 0px;
`

// styled components
const Title = styled.text`
  font-weight: 500;
  font-size: 18px;
`;

const CountContainer = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 2px 8px;
`

const CountText = styled.text`
  font-weight: 500;
  font-size: 12px;
  color: #999696;
`

const HeaderRow = styled.tr`
  background: #0f1733;
  height: 44px;
  border-radius: 8px;
`
const HeaderElement = styled.th`
  font-weight: 500;
  font-size: 14px;
  color: white;
  height: 44px;
  padding-left: 16px;
  border-left: none;
  border-top: 1px solid #172756;
  text-align: left;
  :first-child{
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
  }
  :last-child{
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
  }
`;
const TableRow = styled.tr`
  height: 60px;
  border-radius: 8px;
  background: #0f1733;
  border-bottom: 4px transparent #172756;
`;
const Cell = styled.td`
  border-bottom: 4px solid #172756;
  font-weight: 500;
  font-size: 14px;
  height: 44px;
  padding-left: 16px;
  text-align: left;
`;
const PaginationBar = styled.div`
  background: #fcfcfd;
  height: 60px;
`;
const PaginationText = styled.text`
  font-weight: normal;
  font-size: 12px;
  color: #464646;
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
`;
