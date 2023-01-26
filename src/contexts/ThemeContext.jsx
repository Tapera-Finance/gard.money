import React, { createContext, useState, useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Button from "@mui/material/Button";

export const ThemeContext = React.createContext();

export default function ThemeContextProvider(props){


const theme = createTheme({
  palette: {
    primary: {
      main: "#01d1ff",
    },
    danger: {
      // This is green.A700 as hex.
      main: "#f04438",
    },
    moderate: {
      // This is green.A700 as hex.
      main: "#f79009",
    },
    healthy: {
      // This is green.A700 as hex.
      main: "#4bb543",
    },
  },
});

  return (
    <ThemeContext.Provider
      value={{
        theme,
      }}
    >
      {props.children}
    </ThemeContext.Provider>
  );
}
