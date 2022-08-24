import React, { useContext, useEffect, useState } from "react";
import styled, { css } from "styled-components";
import graph from "../assets/graph.png";
import Chart from "../components/Chart";
import TransactionHistory from "../components/TransactionHistory";
import PrimaryButton from "../components/PrimaryButton";
import { getCurrentAlgoUsd, getChainData } from "../prices/prices";
import RadioButtonSet from "../components/RadioButtonSet";
import moment from "moment";
import { loadDbActionAndMetrics } from "../components/Firebase";
import { getWalletInfo } from "../wallets/wallets";
import Effect from "../components/Effect";

// get webactions and metrics data
const dbData =
  typeof getWalletInfo() !== "undefined"
    ? await loadDbActionAndMetrics()
    : null;
const transHistory = dbData ? dbData.webappActions : [];

export default function AnalyticsContent() {
  const [selected, setSelected] = useState("System Metrics");
  var volume = 200000
  var details = [
    {
        title: "Total Value Locked (TVL)",
        val: `${88.3}M ALGO`,
        hasToolTip: true,
    },
    {
      title: "Volume",
      val: `$${volume.toLocaleString("en-US")}`,
      hasToolTip: true,
    },
    {
      title: "Fees Received",
      val: `${0.03}% per transaction`,
      hasToolTip: true,
    },
  ]
  return (
    <div>
      <div>
      <AnalyticsDetails>
            {details.length && details.length > 0 ?
            details.map((d) => {
                return (
                <Item key={d.title}>
                        <Effect title={d.title} val={d.val} hasToolTip={d.hasToolTip} rewards={d.rewards}></Effect>
                    </Item>
                )
            })
            : null}
        </AnalyticsDetails>
      </div>
      {dummyGraphs.map((value, index, array) => {
        if (window.innerWidth > 900) {
          if (index % 2 !== 0)
            return (
              <GraphRow
                key={`row: ${index}`}
                items={[array[index - 1], array[index]]}
              />
            );
        } else return <GraphRow key={`row: ${index}`} items={[value]} />;
      })}
    </div>
  );
}

const AnalyticsDetails = styled.div`
display: grid;
grid-template-columns:repeat(3, 33%); 
text-align: center;
row-gap: 30px; 
justify-content: center;
padding: 30px 0px 30px;
border-radius: 10px;
background: #0E1834;
margin-bottom: 50px;
`
const Item = styled.div`
    display: flex;
    flex-direction: column;
    font-size: 15px;
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
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 100,
      }}
    >
      {items.map((value, index) => {
        return (
          <Graph key={index} title={value.title} subtitle={value.subtitle} />
        );
      })}
    </div>
  );
}

/**
 * Renders a single graph with its title and subtitle
 * @prop {string} title - This graph's title
 * @prop {string} subtitle - This graph's subtitle
 * @param {{title: string, subtitle: string}} props
 */
function Graph({ title }) {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState("24H");
  const [subtitle, setSubtitle] = useState(
    "Current Price: $799.89 (Last Updated 12:01 pm)",
  );
  const [chainData, setChainData] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [currTime, setCurrTime] = useState(new Date());

  useEffect(async () => {
    const chainDataResponse = await getChainData();
    const currentPriceResponse = await getCurrentAlgoUsd();
    setChainData(chainDataResponse);
    setCurrentPrice(currentPriceResponse);
  }, []);

  useEffect(() => {
    if (!chainData || !currentPrice) return;
    if (title === "Treasury TVL") {
      let step = 8;
      let end = 288;
      if (selected !== "24H") {
        step = selected === "7D" ? 56 : 224;
        end = selected === "7D" ? 2016 : 8064;
      }
      let historical_data = [];
      for (var i = step; i <= end; i += step) {
        historical_data.push({
          name: moment(currTime)
            .subtract(5 * step * (36 - i / step), "minutes")
            .format("lll"),
          tvl: (
            (currentPrice *
              JSON.parse(chainData["treasury-tvl"][8064 - end + i - 1])) /
            1000000
          ).toFixed(2),
        });
      }
      setSubtitle(
        "Current TVL: $" + historical_data[historical_data.length - 1].tvl,
      );
      setData(historical_data);
    } else if (title === "Circulating GARD") {
      let step = 8;
      let end = 288;
      if (selected !== "24H") {
        step = selected === "7D" ? 56 : 224;
        end = selected === "7D" ? 2016 : 8064;
      }
      let historical_data = [];
      for (var i = step; i <= end; i += step) {
        historical_data.push({
          name: moment(currTime)
            .subtract(5 * step * (36 - i / step), "minutes")
            .format("lll"),
          circulating: JSON.parse(
            chainData["circulating-gard"][8064 - end + i - 1],
          ),
        });
      }
      setSubtitle(
        "Current GARD in Circulation: " +
          historical_data[historical_data.length - 1].circulating,
      );
      setData(historical_data);
    } else if (title === "GAIN Price") {
      let step = 8;
      let end = 288;
      if (selected !== "24H") {
        step = selected === "7D" ? 56 : 224;
        end = selected === "7D" ? 2016 : 8064;
      }
      let historical_data = [];
      for (var i = step; i <= end; i += step) {
        historical_data.push({
          name: moment(currTime)
            .subtract(5 * step * (36 - i / step), "minutes")
            .format("lll"),
          price: (
            currentPrice *
            1000000 *
            JSON.parse(chainData["gain-price"][8064 - end + i - 1])
          ).toFixed(5),
        });
      }
      setSubtitle(
        "Current GAIN Price: $" +
          historical_data[historical_data.length - 1].price,
      );
      setData(historical_data);
    } else if (title === "Open CDPs") {
      let step = 8;
      let end = 288;
      if (selected !== "24H") {
        step = selected === "7D" ? 56 : 224;
        end = selected === "7D" ? 2016 : 8064;
      }
      let historical_data = [];
      for (var i = step; i <= end; i += step) {
        historical_data.push({
          name: moment(currTime)
            .subtract(5 * step * (36 - i / step), "minutes")
            .format("lll"),
          open: JSON.parse(chainData["open-cdps"][8064 - end + i - 1]),
        });
      }
      setSubtitle(
        "Current Open CDPs: " +
          historical_data[historical_data.length - 1].open,
      );
      setData(historical_data);
    } else if (title === "ALGO Price") {
      let step = 8;
      let end = 288;
      if (selected !== "24H") {
        step = selected === "7D" ? 56 : 224;
        end = selected === "7D" ? 2016 : 8064;
      }
      let historical_data = [];
      for (var i = step; i <= end; i += step) {
        historical_data.push({
          name: moment(currTime)
            .subtract(5 * step * (36 - i / step), "minutes")
            .format("lll"),
          price: JSON.parse(
            chainData["algo-price"][8064 - end + i - 1],
          ).toFixed(4),
        });
      }
      setSubtitle(
        `Current Price: $${currentPrice.toFixed(4)} (Last Updated ${moment(
          currTime,
        ).format("HH:mm")})`,
      );
      setData(historical_data);
    } else if (title === "ALGOs Locked") {
      let step = 8;
      let end = 288;
      if (selected !== "24H") {
        step = selected === "7D" ? 56 : 224;
        end = selected === "7D" ? 2016 : 8064;
      }
      let historical_data = [];
      for (var i = step; i <= end; i += step) {
        historical_data.push({
          name: moment(currTime)
            .subtract(5 * step * (36 - i / step), "minutes")
            .format("lll"),
          locked: (
            JSON.parse(chainData["system-tvl"][8064 - end + i - 1]) / 1000000
          ).toFixed(2),
        });
      }
      setSubtitle(
        "CDP Algos: " + historical_data[historical_data.length - 1].locked,
      );
      setData(historical_data);
    }
  }, [selected, chainData, currentPrice]);

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
      <div style={{ color: "black" }}>
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
          titles={["24H", "7D", "30D"]}
          selected={selected}
          callback={(selected) => setSelected(selected)}
        />
      </div>
    </div>
  );
}

// styled components
const Title = styled.text`
  font-weight: bold;
  font-size: 20px;
`;

const Subtitle = styled.text`
  font-weight: normal;
  font-size: 12px;
  color: white;
`;

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
    title: "ALGO Price",
    subtitle: "Current Price: $799.89 (Last Updated 12:01 pm)",
  },
  {
    title: "ALGOs Locked",
    subtitle: "Current TVL: $799.89 (Last Updated 12:01 pm)",
  },
  {
    title: "Circulating GARD",
    subtitle: "Current Number Circulating: 799.89 (Last Updated 12:01 pm)",
  },
  {
    title: "Open CDPs",
    subtitle: "Number Open CDPs: 8 (Last Updated 12:01 pm)",
  },
  {
    title: "Treasury TVL",
    subtitle: "Current TVL: $799.89 (Last Updated 12:01 pm)",
  },
];
