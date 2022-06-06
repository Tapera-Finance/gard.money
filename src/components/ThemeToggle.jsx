import React, {useContext} from "react";
import Switch from "react-switch";
import { ThemeContext } from "../contexts/ThemeContext";


export default function ThemeToggle() {
    const {theme, setTheme} = useContext(ThemeContext)
    function handleThemeToggle(){
        setTheme(theme === 'light' ? 'dark': 'light')
    }
    
    return <div>
        <Switch 
            uncheckedIcon = {false}
            checkedIcon = {false}
            onColor = {'#eee'}
            onChange = {handleThemeToggle}
            checked = {theme === 'light'}
        />
    </div>
}