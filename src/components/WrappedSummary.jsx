import React from 'react'
import styled from 'styled-components'
import { calcRatio } from '../transactions/cdp.js'

function getNew(id) {
    if (
      document.getElementById(id) == null ||
      isNaN(parseFloat(document.getElementById(id).value))
    ) {
      return null
    }
    return parseFloat(document.getElementById(id).value)
  }

const isValidInput = (val) => (!isNaN(val) && val > 0 && val !== null)


export default class WrappedSummary extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        someVar: '...'
      };
      this.handleCollateral = this.handleCollateral.bind(this)
      this.handleMinting = this.handleMinting.bind(this)
    }

    handleCollateral() {
    if (getNew("more_collateral") !== null ) {
      this.setState({
        someVar: getNew("more_collateral")
      })
    } else {
      this.setState({
        someVar: 0
      })
    }
    }

    handleMinting() {
      if (getNew("more_gard") !== null) {
        this.setState({
          someVar: getNew("more_gard")
        })
      } else {
      this.setState({
        someVar: 0
      })
    }
    }

    render() {
      switch (this.props.context) {
        case 'add_collateral':
          return <Child handler = {this.handleCollateral} someVar={this.state.someVar} transactionData={this.props.transactionData} context={this.props.context} />
        case 'mint_gard':
          return <Child handler = {this.handleMinting} someVar={this.state.someVar} transactionData={this.props.transactionData} context={this.props.context}/>
      }
    }
  }

  class Child extends React.Component {
    render() {
      switch (this.props.context) {
        case 'add_collateral':
          return (
            <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      marginTop: 20,
                      marginBottom: 0,
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                <div>
                    <SpecificsTitle>{'New Collateral added'}</SpecificsTitle>
                </div>
                <div
                style={{
                display: 'flex',
                flex: 1,
                }}
                >
                <TransactionInput
                    placeholder="Enter Value Here"
                    id="more_collateral"
                    onChange={this.props.handler}
                  />
                </div>
                <div
                    style={{
                    display: 'flex',
                    flexDirection: 'column',
                    marginTop: 20,
                    marginBottom: 20,
                    justifyContent: 'space-between',
                    }}
                    >
                    <div>
                      <SpecificsTitle>{'New Collateralization Ratio'}</SpecificsTitle>
                    </div>
                    <div>
                      <SpecificsValue>{
                      !isValidInput(this.props.someVar) ? "..." :
                      calcRatio(this.props.transactionData.collateral + (this.props.someVar * 1e6), this.props.transactionData.debt/1e6, true)}</SpecificsValue>
                    </div>
                    <div>
                      <SpecificsTitle>{'New Liquidation Price'}</SpecificsTitle>
                    </div>
                    <div>
                      <SpecificsValue>{
                       !isValidInput(this.props.someVar) ?
                        "..." : '$' + (((1.15 * this.props.transactionData.debt ) / this.props.transactionData.collateral+this.props.someVar/1e6).toFixed(4))
                      }</SpecificsValue>
                    </div>
                    <div>
                      <SpecificsTitle>{'Transaction Fees'}</SpecificsTitle>
                    </div>
                    <div>
                      <SpecificsValue>{'0.001 Algos'}</SpecificsValue>
                    </div>
                </div>
            </div>
          )
        case "mint_gard":
          return(
             <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      marginTop: 20,
                      marginBottom: 0,
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                  <div>
                    <SpecificsTitle>{'GARD to mint'}</SpecificsTitle>
                  </div>
                  <div>
                    <TransactionInput
                    placeholder="Enter Value Here"
                    id="more_gard"
                    onChange={this.props.handler}
                  />
                  </div>
                <div
                    style={{
                    display: 'flex',
                    flexDirection: 'column',
                    marginTop: 20,
                    marginBottom: 20,
                    justifyContent: 'space-between',
                    }}
                    >
                    <div>
                      <SpecificsTitle>{'New Collateralization Ratio'}</SpecificsTitle>
                    </div>
                    <div>
                      <SpecificsValue>{
                       !isValidInput(this.props.someVar) ? "..." : calcRatio(this.props.transactionData.collateral, (this.props.transactionData.debt+(this.props.someVar*1e6))/1e6, true)
                       }</SpecificsValue>
                    </div>
                    <div>
                      <SpecificsTitle>{'New Liquidation Price'}</SpecificsTitle>
                    </div>
                    <div>
                      <SpecificsValue>{
                        !isValidInput(this.props.someVar) ? "..." : '$' + (((1.15 * ((this.props.someVar*1e6)+this.props.transactionData.debt) ) / this.props.transactionData.collateral).toFixed(4))
                      }</SpecificsValue>
                    </div>
                    <div>
                      <SpecificsTitle>{'Transaction Fees'}</SpecificsTitle>
                    </div>
                    <div>
                      <SpecificsValue>{'0.001 Algos'}</SpecificsValue>
                    </div>
                </div>
            </div>
          )
      }
    }
  }

const SpecificsValue = styled.text`
  font-weight: bold;
  font-size: 16px;
  align-items: right;
  margin-top: 10px
`

const SpecificsTitle = styled.text`
  font-weight: normal;
  font-size: 16px;
`

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
`
