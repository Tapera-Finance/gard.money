import React from "react";

const DateTimeDisplay = ({ value, type, isDanger }) => {
  return (
    <div style={{
      flexDirection: "column",
      background: "#0E1834",}}>
    <div className={isDanger ? "countdown danger" : "countdown"}>
      <p>{value}</p>
    </div>
    <span style={{color: "white", fontSize: "12px", font: "Consolas Bold Italic", position: "relative", left: "-4px"}}>{type}</span>
    </div>
  );
};

export default DateTimeDisplay;
