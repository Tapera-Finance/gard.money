import React from "react";

export default function Positions() {
    return <div>
        <div style={{
            display: "grid",
            gridTemplateColumns:"repeat(3, 30%)", 
            justifyContent:"center",
            alignContent: "center",
            fontSize: 20,
            marginTop: 50,
            }}>
            <b>Your Positions</b>
            <b>Rewards</b>
            <b>Total Balance</b>
        </div>
        <div style={{marginBottom: 80, marginTop: 10}}>
            <div style={{
                display: "grid", 
                gridTemplateColumns:"repeat(3, 30%)", 
                justifyContent:"center",
                alignContent: "center",
                background: "rgba(13, 18, 39, .75)", 
                borderRadius: 10,
                fontSize: 18,
                paddingTop: 40,
                paddingBottom: 40,
                }}>
                <div style={{display: "flex", flexDirection: "column", rowGap: 20
            }}>    
                    <div>Supplied: $123,456</div>
                    <div>Borrowed: $13,100</div>
                </div>
                <div>APR 123%</div>
                <div style={{display: "flex", flexDirection: "column"}}>    
                    <div>Health {`(100%)`}</div>
                    <div>----slider----</div>
                </div>
            </div>
        </div>
    </div>
}