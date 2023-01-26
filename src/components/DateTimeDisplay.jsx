import React from "react";

const DateTimeDisplay = ({ value, type, isDanger }) => {
  return (
    <div className={isDanger ? "countdown danger" : "countdown"}>
      <p>{value}</p>
      <span style={{color: "grey"}}>{type}</span>
    </div>
  );
};

export default DateTimeDisplay;
