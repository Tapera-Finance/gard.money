import React, {useState, useEffect} from "react";
import { setCurrent } from "../redux/slices/currentSlice";
import { getPrice } from "../transactions/cdp";
import { useDispatch } from "react-redux";

export default function ALGOPrice(props) {
    const [currentPrice, setPrice] = useState('Loading...')
    const dispatch = useDispatch()
    useEffect(()=> {
        const interval = setInterval(() => {
            getPrice().then((val) => {
                const num = val;
                const algoprice = num.toFixed(5);
                setPrice(algoprice);
                dispatch(setCurrent(algoprice))
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
