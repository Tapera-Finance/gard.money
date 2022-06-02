import React, {useState, useEffect} from "react";
import { getPrice } from "../transactions/cdp";

export default function ALGOPrice(props) {
    const [currentPrice, setPrice] = useState('Loading...')
    useEffect(()=> {
        const interval = setInterval(() => {
            getPrice().then((val) => {
                const num = val;
                const algoprice = num.toFixed(5);
                setPrice(algoprice);
            });
        }, 500);
        
        return () => {
            clearInterval(interval);
        }
    }, [])
    return (
        <div style={{paddingTop: 8}}> ALGO PRICE: <b>${currentPrice}</b> </div>
    )
}