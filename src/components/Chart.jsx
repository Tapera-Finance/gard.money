import React, { useReducer, useState } from "react";
import {
  AreaChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  LinearGradient,
} from "recharts";

export default function Chart({ size, data }) {
  const dummyData = [
    { name: "Jan", price: 400 },
    { name: "Mar", price: 500 },
    { name: "May", price: 300 },
    { name: "Jul", price: 700 },
    { name: "Sep", price: 550 },
    { name: "Nov", price: 800 },
  ];

  function getDataKey() {
    for (var key in data[0]) {
      if (data[0].hasOwnProperty(key) && key != "name") {
        return key;
      }
    }
    return "price";
  }

  function getBounds(smallVal = false) {
    let key = getDataKey();
    if (data[0] === undefined) {
      return [0, 1];
    }
    let min = 1e50;
    let max = -1;
    if (smallVal) {
      for (var i = 0; i < data.length; i++) {
        let elem = data[i][key];
        if (elem > max) {
          max = elem;
        } else if (elem < min) {
          min = elem;
        }
      }
    } else {
      for (var i = 0; i < data.length; i++) {
        let elem = parseInt(data[i][key]);
        if (elem > max) {
          max = elem;
        } else if (elem < min) {
          min = elem;
        }
      }
    }
    return [Math.max(min - parseInt(0.1 * (max - min)), 0), max];
  }

  return (
    <div>
      <AreaChart
        width={size}
        height={size / 2}
        data={data.length < 1 ? dummyData : data}
      >
        <defs>
          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey={getDataKey()}
          stroke="#8884d8"
          fillOpacity={1}
          fill="url(#colorPrice)"
        />
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="name"
          angle={45}
          dx={10}
          dy={14}
          height={42}
          minTickGap={-25}
          tick={{ fontSize: 10 }}
        />
        <YAxis
          domain={getBounds(getDataKey() === "price")}
          scale={"linear"}
          tick={{ fontSize: 10 }}
        />
        <Tooltip />
      </AreaChart>
    </div>
  );
}
