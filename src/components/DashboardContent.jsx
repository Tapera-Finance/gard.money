import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import graph from '../assets/graph.png'
import Chart from './Chart'
import Table from './Table'
import PrimaryButton from './PrimaryButton'
import {
  getAlgoUsdHistoric,
  getCurrentAlgoUsd,
  getChainData,
} from '../prices/prices'
import RadioButtonSet from './RadioButtonSet'
import moment from 'moment'
import { useWindowSize } from '../hooks'
import { app, loadFireStoreCDPs } from './Firebase';
import {
  getFirestore,
  getDoc,
  doc
} from "firebase/firestore";
import { getWalletInfo } from '../wallets/wallets'

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
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data()
    console.log(data);

    return {
      webappActions: data.webappActions,
      systemAssetVal: data.systemAssetVal,
      systemDebtVal: data.systemDebtVal
    }
  } else {
    console.log("No webactions, asset values, or debt values")
  }
}

const dbData = await loadDbActionAndMetrics();
const transHistory = dbData.webappActions;

function formatTime(dateInMs) {
  return new Date(dateInMs).toUTCString();
}

/**
 *
 * @param {any} val
 * @param {function} formatter
 * @param {string[]} classes
 * @returns
 */
function formatDataCell(val, formatter, classes) {
  let computed = formatter(val);
  return {
    className: computed < 0 ? classes[0] : classes[1],
    value: computed
  }
}




/**
 * Content for dashboard option
 */

export default function DashboardContent() {
  const [selected, setSelected] = useState('System Metrics')
  const [collapsed, setCollapsed] = useState(false)

  const formattedHistory = transHistory.map((entry, idx) => {

    let formattedAddress = entry.cdpAddress.slice(0, 10) + '...' + entry.cdpAddress.slice(entry.cdpAddress.length - 3, entry.cdpAddress.length - 1)
    let formattedAlgo = formatDataCell(entry.microAlgos, mAlgosToAlgosFixed, ['negative', 'positive']);
    let formattedGard = formatDataCell(entry.microGARD, mAlgosToAlgosFixed, ['negative', 'positive']);


    const newTableEntry = {
      type: entry.actionType === 0 ? "CDP": "Swap",
      cdpAddress: collapsed ? formattedAddress : entry.cdpAddress,
      algos: formattedAlgo ? formattedAlgo : mAlgosToAlgos(entry.microAlgos).toFixed(2) ,
      gard: formattedGard ? formattedGard : mAlgosToAlgos(entry.microGARD).toFixed(2),
      timestamp: formatTime(entry.timestamp),
      feesPaid: mAlgosToAlgos(entry.feesPaid)
    };
    console.log('new table entry', newTableEntry);

    return newTableEntry
  })

  useEffect(() => {
   if (window.visualViewport.width < 768) {
    setCollapsed(true)
    formattedHistory.forEach((item, idx) => {
      if (item[idx]["cdpAddress"] && item[idx]["cdpAddress"].length > 12) {
        item[idx]["cdpAddress"] = item[idx]["cdpAddress"].slice(0, 10) + '...' + item[idx]["cdpAddress"].slice(item[idx]["cdpAddress"].length - 3, item[idx]["cdpAddress"].length - 1)
      }
    })
   }
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 40 }}>
        <RadioButtonSet
          titles={
            [
              'System Metrics',
              'My Metrics'
            ] /* add  'My Metrics' to this array when implemented */
          }
          selected={selected}
          callback={(selected) => setSelected(selected)}
        />
      </div>
     { selected === 'System Metrics' ?

      dummyGraphs.map((value, index, array) => {
        if (window.innerWidth > 900) {
          if (index % 2 !== 0)
            return (
              <GraphRow
                key={`row: ${index}`}
                items={[array[index - 1], array[index]]}
              />
            )
        } else return <GraphRow key={`row: ${index}`} items={[value]} />
      })
      : selected === 'My Metrics' ?

      myMetricsInit.map((value, index, array) => {
        if (window.innerWidth > 900) {
          if (index % 2 !== 0)
            return (
              <GraphRow
                key={`row: ${index}`}
                items={[array[index - 1], array[index]]}
              />
            )
          } else return <GraphRow key={`row: ${index}`} items={[value]} />
        })
        : null
      }

      <HistoryTable>
        <Table title="Transaction history"
        countSubtitle={`${transHistory.length} Transactions`}
        data={formattedHistory} />
      </HistoryTable>
    </div>
  )
}
const InactiveRadio = styled.button`
  background-color: transparent;
  padding: 8px 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 6px;
`

const InactiveRadioText = styled.text`
  color: #98a2b3;
  font-weight: 500;
  font-size: 16px;
`

const HistoryTable = styled.div`
  /* td {
    text-align: center;
  }
  th {
    font-weight: 500;
  } */
`

/**
 * This renders all the given graph items in a single row
 * @prop {object[]} items - graph objects to be rendered in a single row
 * @param {{items: object[]}} props
 */
function GraphRow({ items }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 100,
      }}
    >
      {items.map((value, index) => {
        return (
          <Graph key={index} title={value.title} subtitle={value.subtitle} />
        )
      })}
    </div>
  )
}

/**
 * Renders a single graph with its title and subtitle
 * @prop {string} title - This graph's title
 * @prop {string} subtitle - This graph's subtitle
 * @param {{title: string, subtitle: string}} props
 */
function Graph({ title }) {
  const [data, setData] = useState([])
  const [selected, setSelected] = useState('24H')
  const [subtitle, setSubtitle] = useState(
    'Current Price: $799.89 (Last Updated 12:01 pm)',
  )
  const [chainData, setChainData] = useState('')
  const [currentPrice, setCurrentPrice] = useState('')
  const [systemAssetValue, setSystemAssetValue] = useState('')
  const [systemDebtValue, setSystemDebtValue] = useState('')
  const [currTime, setCurrTime] = useState(new Date())

  useEffect(async () => {
    const chainDataResponse = await getChainData()
    const currentPriceResponse = await getCurrentAlgoUsd()
    const myMetricsResponse = await loadDbActionAndMetrics()
    setChainData(chainDataResponse)
    setCurrentPrice(currentPriceResponse)
    setSystemAssetValue(myMetricsResponse.systemAssetVal)
    setSystemDebtValue(myMetricsResponse.systemDebtVal)
  }, [])

  useEffect(() => {
    if (!chainData || !currentPrice) return
    if (title === 'Treasury TVL') {
      let step = 8
      let end = 288
      if (selected !== '24H') {
        step = selected === '7D' ? 56 : 224
        end = selected === '7D' ? 2016 : 8064
      }
      let historical_data = []
      for (var i = step; i <= end; i += step) {
        historical_data.push({
          name: moment(currTime)
            .subtract(5 * step * (36 - i / step), 'minutes')
            .format('lll'),
          tvl: (
            (currentPrice *
              JSON.parse(chainData['treasury-tvl'][8064 - end + i - 1])) /
            1000000
          ).toFixed(2),
        })
      }
      setSubtitle(
        `Current TVL: $` + historical_data[historical_data.length - 1].tvl,
      )
      setData(historical_data)
    } else if (title === 'Circulating GARD') {
      let step = 8
      let end = 288
      if (selected !== '24H') {
        step = selected === '7D' ? 56 : 224
        end = selected === '7D' ? 2016 : 8064
      }
      let historical_data = []
      for (var i = step; i <= end; i += step) {
        historical_data.push({
          name: moment(currTime)
            .subtract(5 * step * (36 - i / step), 'minutes')
            .format('lll'),
          circulating: JSON.parse(chainData['circulating-gard'][8064 - end + i - 1]),
        })
      }
      setSubtitle(
        `Current GARD in Circulation: ` +
          historical_data[historical_data.length - 1].circulating,
      )
      setData(historical_data)
    } else if (title === 'GAIN Price') {
      let step = 8
      let end = 288
      if (selected !== '24H') {
        step = selected === '7D' ? 56 : 224
        end = selected === '7D' ? 2016 : 8064
      }
      let historical_data = []
      for (var i = step; i <= end; i += step) {
        historical_data.push({
          name: moment(currTime)
            .subtract(5 * step * (36 - i / step), 'minutes')
            .format('lll'),
          price: (
            currentPrice *
            1000000 *
            JSON.parse(chainData['gain-price'][8064 - end + i - 1])
          ).toFixed(5),
        })
      }
      setSubtitle(
        `Current GAIN Price: $` +
          historical_data[historical_data.length - 1].price,
      )
      setData(historical_data)
    } else if (title === 'Open CDPs') {
      let step = 8
      let end = 288
      if (selected !== '24H') {
        step = selected === '7D' ? 56 : 224
        end = selected === '7D' ? 2016 : 8064
      }
      let historical_data = []
      for (var i = step; i <= end; i += step) {
        historical_data.push({
          name: moment(currTime)
            .subtract(5 * step * (36 - i / step), 'minutes')
            .format('lll'),
          open: JSON.parse(chainData['open-cdps'][8064 - end + i - 1]),
        })
      }
      setSubtitle(
        `Current Open CDPs: ` +
          historical_data[historical_data.length - 1].open,
      )
      setData(historical_data)
    }
    else if (title === 'ALGO Price') {
      let step = 8
      let end = 288
      if (selected !== '24H') {
        step = selected === '7D' ? 56 : 224
        end = selected === '7D' ? 2016 : 8064
      }
      let historical_data = []
      for (var i = step; i <= end; i += step) {
        historical_data.push({
          name: moment(currTime)
            .subtract(5 * step * (36 - i / step), 'minutes')
            .format('lll'),
          price: (JSON.parse(chainData['algo-price'][8064 - end + i - 1])).toFixed(4),
        })
      }
      setSubtitle(
        `Current Price: $${currentPrice.toFixed(4)} (Last Updated ${moment(
        currTime,
      ).format('HH:mm')})`,
      )
      setData(historical_data)
    }
    else if (title === 'ALGOs Locked') {
      let step = 8
      let end = 288
      if (selected !== '24H') {
        step = selected === '7D' ? 56 : 224
        end = selected === '7D' ? 2016 : 8064
      }
      let historical_data = []
      for (var i = step; i <= end; i += step) {
        historical_data.push({
          name: moment(currTime)
            .subtract(5 * step * (36 - i / step), 'minutes')
            .format('lll'),
          locked: (
            (
              JSON.parse(chainData['system-tvl'][8064 - end + i - 1])) /
            1000000
          ).toFixed(2),
        })
      }
      setSubtitle(
        `CDP Algos: ` + historical_data[historical_data.length - 1].locked,
      )
      setData(historical_data)
      }
  }, [selected, chainData, currentPrice])

  useEffect(() => {
    if (!systemAssetValue || !systemDebtValue) return
    if (title === 'System Asset Value') {
      let step = 8
      let end = 288
      if (selected !== '24H') {
         step = selected === '7D' ? 56 : 224
         end = selected === '7D' ? 2016 : 8064
      }
      let account_data = []
      for (var i = step; i <= end; i += step) {
        account_data.push({
          name: moment(currTime)
            .subtract(5 * step * (36 - i / step), 'minutes')
            .format('lll'),
          asset: (
            JSON.parse(
              systemAssetValue[8064 - end + i - 1]) / 1000000
          ).toFixed(2),
        })
      }
      setSubtitle(
        `System Asset Value: ` + account_data[account_data.length - 1].asset,
      )
      setData(account_data)
    }

  }, [selected, systemAssetValue, systemDebtValue])

  return (
    <div>
      <div style={{ marginLeft: 18 }}>
        <div style={{ marginBottom: 8 }}>
          <Title>{title}</Title>
        </div>
        <div style={{ marginBottom: 23 }}>
          <Subtitle>{subtitle}</Subtitle>
        </div>
      </div>
      <div>
        <Chart
          size={
            window.innerWidth < 900
              ? window.innerWidth * 0.8
              : window.innerWidth * 0.3
          }
          data={data}
        />
      </div>
      <div style={{ marginLeft: 18 }}>
        <RadioButtonSet
          titles={['24H', '7D', '30D']}
          selected={selected}
          callback={(selected) => setSelected(selected)}
        />
      </div>
    </div>
  )
}

// styled components
const Title = styled.text`
  font-weight: bold;
  font-size: 20px;
`

const Subtitle = styled.text`
  font-weight: normal;
  font-size: 12px;
  color: #475467;


`

const dummyCDPs = [
  {
    id: 'N/A',
    liquidationPrice: 0,
    collateral: 0,
    debt: 0,
  },
  {
    id: 'N/A',
    liquidationPrice: 0,
    collateral: 0,
    debt: 0,
  },
  {
    id: 'N/A',
    liquidationPrice: 0,
    collateral: 0,
    debt: 0,
  },
]

// temporal dummy data for the graphs
const dummyGraphs = [
  /* Hidden until data is finished
  {
    title: 'GARD Price',
    subtitle: 'Current Price: $799.89 (Last Updated 12:01 pm)',
  },
  {
    title: 'GAIN Price',
    subtitle: 'Current Price: $799.89 (Last Updated 12:01 pm)',
  },
  */
  {
    title: 'ALGO Price',
    subtitle: 'Current Price: $799.89 (Last Updated 12:01 pm)',
  },
  {
    title: 'ALGOs Locked',
    subtitle: 'Current TVL: $799.89 (Last Updated 12:01 pm)',
  },
  {
    title: 'Circulating GARD',
    subtitle: 'Current Number Circulating: 799.89 (Last Updated 12:01 pm)',
  },
  {
    title: 'Open CDPs',
    subtitle: 'Number Open CDPs: 8 (Last Updated 12:01 pm)',
  },
  {
    title: 'Treasury TVL',
    subtitle: 'Current TVL: $799.89 (Last Updated 12:01 pm)',
  }
]

const myMetricsInit = [
  {
    title: 'System Asset Value',
    subtitle: "Value of assets held"
  },
  {
    title: 'System Debt Value',
    subtitle: 'Total debts held'
  },
  {
    title: 'My Open CDPs',
    subtitle: 'Number Open CDPs: 8 (Last Updated 12:01 pm)'
  },
  {
    title: 'My GARD',
    subtitle: 'Value of GARD held'
  }
]
