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

export default class WrappedSummary extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        someVar: '...'
      };
      this.handler = this.handler.bind(this)
    }
  
    handler() {
    if (getNew("more_collateral") !== null ) {
      this.setState({
        someVar: getNew("more_collateral")
      }) 
    } 
    }
  
    render() {
      return <Child handler = {this.handler} someVar={this.state.someVar} transactionData={this.props.transactionData}/>
    }
  }
  
  class Child extends React.Component {
    render() {
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
                flexDirection: 'row',
                marginTop: 20,
                marginBottom: 20,
                justifyContent: 'space-between',
                }}
                >
                <div>
                  <SpecificsTitle>{'New Collateralization Ratio'}</SpecificsTitle>
                </div>
                <div>
                  <SpecificsValue>{calcRatio(this.props.transactionData.collateral+this.props.someVar, this.props.transactionData.debt/1e6, true)}</SpecificsValue>
                </div>
                <div>
                  <SpecificsTitle>{'New Liquidation Price'}</SpecificsTitle>
                </div>
                <div>
                  <SpecificsValue>{'...'}</SpecificsValue>
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

const SpecificsValue = styled.text`
  font-weight: bold;
  font-size: 16px;
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