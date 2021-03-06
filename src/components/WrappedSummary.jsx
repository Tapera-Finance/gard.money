import React from "react";
import styled, { css } from "styled-components";
import { calcRatio, calcDevFees } from "../transactions/cdp.js";
import { ThemeContext } from "../contexts/ThemeContext";
import { useContext } from "react";

function mAlgosToAlgos(num) {
  return num / 1000000;
}
function algosToMAlgos(num) {
  return num * 1000000;
}

function displayFees(minted) {
  const fees = mAlgosToAlgos(calcDevFees(algosToMAlgos(minted)));
  return fees + " Algos";
}

function getNew(id) {
  if (
    document.getElementById(id) == null ||
    isNaN(parseFloat(document.getElementById(id).value))
  ) {
    return null;
  }
  return parseFloat(document.getElementById(id).value);
}

const isValidInput = (val) => !isNaN(val) && val > 0 && val !== null;

export default class WrappedSummary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      someVar: "...",
    };
    this.handleCollateral = this.handleCollateral.bind(this);
    this.handleMinting = this.handleMinting.bind(this);
  }

  handleCollateral() {
    if (getNew("more_collateral") !== null) {
      this.setState({
        someVar: getNew("more_collateral"),
      });
    } else {
      this.setState({
        someVar: 0,
      });
    }
  }

  handleMinting() {
    if (getNew("more_gard") !== null) {
      this.setState({
        someVar: getNew("more_gard"),
      });
    } else {
      this.setState({
        someVar: 0,
      });
    }
  }

  render() {
    switch (this.props.context) {
      case "add_collateral":
        return (
          <Child
            handler={this.handleCollateral}
            someVar={this.state.someVar}
            transactionData={this.props.transactionData}
            context={this.props.context}
          />
        );
      case "mint_gard":
        return (
          <Child
            handler={this.handleMinting}
            someVar={this.state.someVar}
            transactionData={this.props.transactionData}
            context={this.props.context}
          />
        );
    }
  }
}

export function Child(props) {
  const { theme } = useContext(ThemeContext);
  switch (props.context) {
    case "add_collateral":
      return (
        <SpecificsContainer>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginTop: 20,
              marginBottom: 0,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <SpecificsTitle>{"New Collateral Added (Algos)"}</SpecificsTitle>
            </div>
            <div
              style={{
                display: "flex",
                flex: 1,
              }}
            >
              <TransactionInput
                placeholder="Enter Value Here"
                id="more_collateral"
                darkToggle={theme === "dark"}
                onChange={props.handler}
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginTop: 20,
              marginBottom: 20,
              justifyContent: "space-between",
            }}
          >
            <div>
              <SpecificsTitle>{"New Collateralization Ratio"}</SpecificsTitle>
            </div>
            <div>
              <SpecificsValue>
                {!isValidInput(props.someVar)
                  ? "..."
                  : calcRatio(
                      props.transactionData.collateral + props.someVar * 1e6,
                      props.transactionData.debt / 1e6,
                      true,
                    )}
              </SpecificsValue>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginTop: 20,
              marginBottom: 20,
              justifyContent: "space-between",
            }}
          >
            <div>
              <SpecificsTitle>{"New Liquidation Price"}</SpecificsTitle>
            </div>
            <div>
              <SpecificsValue>
                {!isValidInput(props.someVar)
                  ? "..."
                  : "$" +
                    (
                      (1.15 * props.transactionData.debt) /
                      1e6 /
                      (props.transactionData.collateral / 1e6 + props.someVar)
                    ).toFixed(4)}
              </SpecificsValue>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginTop: 20,
              marginBottom: 20,
              justifyContent: "space-between",
            }}
          >
            <div>
              <SpecificsTitle>{"Transaction Fees"}</SpecificsTitle>
            </div>
            <div>
              <SpecificsValue>{"0.002 Algos"}</SpecificsValue>
            </div>
          </div>
        </SpecificsContainer>
      );
    case "mint_gard":
      return (
        <SpecificsContainer>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginTop: 20,
              marginBottom: 0,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <SpecificsTitle>{"GARD to mint"}</SpecificsTitle>
            </div>
            <div>
              <TransactionInput
                placeholder="Enter Value Here"
                id="more_gard"
                darkToggle={theme === "dark"}
                onChange={props.handler}
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginTop: 20,
              marginBottom: 20,
              justifyContent: "space-between",
            }}
          >
            <div>
              <SpecificsTitle>{"New Collateralization Ratio"}</SpecificsTitle>
            </div>
            <div>
              <SpecificsValue>
                {!isValidInput(props.someVar)
                  ? "..."
                  : calcRatio(
                      props.transactionData.collateral,
                      (props.transactionData.debt + props.someVar * 1e6) / 1e6,
                      true,
                    )}
              </SpecificsValue>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginTop: 20,
              marginBottom: 20,
              justifyContent: "space-between",
            }}
          >
            <div>
              <SpecificsTitle>{"New Liquidation Price"}</SpecificsTitle>
            </div>
            <div>
              <SpecificsValue>
                {!isValidInput(props.someVar)
                  ? "..."
                  : "$" +
                    (
                      (1.15 *
                        (props.someVar * 1e6 + props.transactionData.debt)) /
                      props.transactionData.collateral
                    ).toFixed(4)}
              </SpecificsValue>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginTop: 20,
              marginBottom: 20,
              justifyContent: "space-between",
            }}
          >
            <div>
              <SpecificsTitle>{"Transaction Fees"}</SpecificsTitle>
            </div>
            <div>
              <SpecificsValue>
                {!isValidInput(props.someVar)
                  ? "..."
                  : displayFees(props.someVar)}
              </SpecificsValue>
            </div>
          </div>
        </SpecificsContainer>
      );
  }
}

const SpecificsContainer = styled.div`
  margin-bottom: 32px;
  padding: 0px 28px 0px 0px;
  min-width: 22.5em;
`;

const SpecificsValue = styled.text`
  font-weight: bold;
  font-size: 16px;
  align-items: right;
  margin-top: 10px;
`;

const SpecificsTitle = styled.text`
  font-weight: normal;
  font-size: 16px;
`;

const TransactionInput = styled.input`
  font-weight: normal;
  font-size: 16px;
  border: 0px;
  height: 16px;
  display: flex;
  flex: 1;
  text-align: right;
  &:focus {
    outline-width: 0;
  }
  &:focus::placeholder {
    color: transparent;
  }
  ${(props) =>
    props.darkToggle &&
    css`
      transition: "all 1s ease";
      background: #484848;
      color: white;
    `}
`;
