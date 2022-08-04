import React, { createContext, useState, useEffect } from "react";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Button from '@mui/material/Button';

export const ThemeContext = React.createContext();

export default function ThemeContextProvider(props){


const theme = createTheme({
  palette: {
    primary: {
      main: "#01d1ff",
    },
    secondary: {
      // This is green.A700 as hex.
      main: '#11cb5f',
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
