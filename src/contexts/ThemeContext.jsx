import React, {createContext, useState, useEffect} from "react";

export const ThemeContext = React.createContext();

export default function ThemeContextProvider(props){
    const [theme, setTheme] = useState(JSON.parse(window.localStorage.getItem('theme')) || 'dark')
    const [net, setNet] = useState(JSON.parse(window.localStorage.getItem('net')) || 'MAINNET')

    useEffect(() => {
        window.localStorage.setItem("theme", JSON.stringify(theme));
      }, [theme]);
    
      useEffect(() => {
        window.localStorage.setItem("net", JSON.stringify(net));
      }, [net]);

    return <ThemeContext.Provider value = {{
        theme,
        setTheme,
        setNet,
        net,
    }}>
    {props.children}
    </ThemeContext.Provider>
}