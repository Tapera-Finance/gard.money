import React, {createContext, useState, useEffect} from "react";

export const ThemeContext = React.createContext();

export default function ThemeContextProvider(props){
    const [theme, setTheme] = useState(JSON.parse(window.localStorage.getItem('theme')) || 'light')

    useEffect(() => {
        window.localStorage.setItem("theme", JSON.stringify(theme));
      }, [theme]);

    return <ThemeContext.Provider value = {{
        theme,
        setTheme
    }}>
    {props.children}
    </ThemeContext.Provider>
}