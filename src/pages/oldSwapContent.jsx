// import React, { useReducer, useState, useContext } from "react";
// import styled, { css } from "styled-components";
// import chevron from "../assets/chevron_black.png";
// import swapIcon from "../assets/icons/swap_icon_new.png";
// import Modal from "../components/Modal";
// import PrimaryButton from "../components/PrimaryButton";
// import TransactionSummary from "../components/TransactionSummary";
// import LoadingOverlay from "../components/LoadingOverlay";
// import { ThemeContext } from "../contexts/ThemeContext";
// // import {
// //   swapAlgoToGard,
// //   swapGardToAlgo,
// //   estimateReturn,
// //   queryAndConvertTotals,
// // } from "../transactions/swap";
// import { useEffect } from "react";
// import { setAlert } from "../redux/slices/alertSlice";
// import {
//   getGARDInWallet,
//   getWalletInfo,
//   handleTxError,
// } from "../wallets/wallets";
// import { useDispatch } from "react-redux";
// import { VERSION } from "../globals";

// /**
//  * local utils
//  */

// const defaultPool = "ALGO/GARD";
// const pools = [defaultPool];
// const slippageTolerance = 0.005;

// const mAlgosToAlgos = (num) => {
//   return num / 1000000;
// };

// const mGardToGard = (num) => {
//   return num / 1000000;
// };

// const exchangeRatioAssetXtoAssetY = (assetX, assetY) => {
//   return parseFloat(assetX / assetY).toFixed(4);
// };

// const targetPool = (assetNameX, assetNameY) => `${assetNameX}/${assetNameY}`;

// const getTotals = async () => await queryAndConvertTotals();

// /**
//  * Component Helpers
//  */

// /**
//  * @function calcTransResult - calculate estimated result of transaction prior to send
//  * @param {Number || String} amount - input in asset unit
//  * @param {Number} totalX - total asset X in pool
//  * @param {Number} totalY - total asset Y in pool
//  * @param {Object} transaction - data obj acc.
//  * @returns estimated return of swap between x & y
//  */
// function calcTransResult(amount, totalX, totalY, transaction) {
//   if (transaction) {
//     if (
//       transaction.offering.from === "ALGO" &&
//       transaction.receiving.to === "GARD"
//     ) {
//       if (amount > 0) {
//         return (
//           estimateReturn(parseFloat(amount), totalX, totalY) / 1e6
//         ).toFixed(6);
//       }
//     } else if (
//       transaction.offering.from === "GARD" &&
//       transaction.receiving.to === "ALGO"
//     ) {
//       if (amount > 0) {
//         return (
//           estimateReturn(parseFloat(amount), totalY, totalX) / 1e6
//         ).toFixed(6);
//       }
//     }
//   }
// }

// /**
//  * @function toggleSelect - swap element selectors based on asset pairing
//  * @param {String} val - representation of val type
//  * @param {String} other - comparison val
//  * @param {String} type1 - offering-from, offering-amount, receiving-to, receiving-amount
//  * @param {String} type2 - offering-from, offering-amount, receiving-to, receiving-amount
//  * @param {String[]} assets - arr asset names
//  * @param {Function} reducer - reduce transaction details
//  * @void
//  */

// function toggleSelect(val, other, type1, type2, assets, reducer) {
//   if (val === assets[0] && other === assets[1]) {
//     reducer({
//       type: type1,
//       value: assets[0],
//     });

//     reducer({
//       type: type2,
//       value: assets[1],
//     });
//     return;
//   }
//   if (val === assets[1] && other === assets[0]) {
//     reducer({
//       type: type1,
//       value: assets[1],
//     });
//     reducer({
//       type: type2,
//       value: assets[0],
//     });
//     return;
//   }
//   if (val === assets[0] && other === assets[0]) {
//     reducer({
//       type: type1,
//       value: assets[0],
//     });
//     reducer({
//       type: type2,
//       value: assets[1],
//     });
//     return;
//   }
//   if (val === assets[1] && other === assets[1]) {
//     reducer({
//       type: type1,
//       value: assets[1],
//     });
//     reducer({
//       type: type2,
//       value: assets[0],
//     });
//   }
// }

// /**
//  * @function handleExchange
//  * @param {String} type - action type
//  * @param {Number} amount - input for action
//  * @param {String[]} assets - arr of asset names
//  * @param {Function} transform - data method (in this case display exc. to user
//  * @param {[]} params
//  * @param {Object} transaction - acc. data obj
//  * @param {Function} reducer - reduce transaction details using action type, value, transform method, params
//  * @void
//  */

// function handleExchange(
//   type,
//   amount,
//   assets,
//   transform,
//   params,
//   transaction,
//   reducer,
// ) {
//   if (type === "offering-amount") {
//     // field 1 handling from field 2 input
//     if (transaction) {
//       if (
//         transaction.offering.from === assets[0] &&
//         transaction.receiving.to === assets[1]
//       ) {
//         if (typeof amount === "number") {
//           reducer({
//             type: "receiving-amount",
//             value: transform(amount, params[0], params[1], transaction),
//           });
//           return;
//         }
//       } else if (
//         transaction.offering.from === assets[1] &&
//         transaction.receiving.to === assets[0]
//       ) {
//         if (typeof amount === "number") {
//           reducer({
//             type: "receiving-amount",
//             value: transform(amount, params[1], params[0], transaction),
//           });
//           return;
//         }
//       }
//     }
//   } else if (transaction) {
//     if (type === "receiving-amount") {
//       // field 2 handling from field 1 input
//       if (transaction) {
//         if (
//           transaction.offering.from === assets[1] &&
//           transaction.receiving.to === assets[0]
//         ) {
//           if (typeof amount === "number") {
//             reducer({
//               type: "offering-amount",
//               value: amount,
//             });
//             reducer({
//               type: "receiving-amount",
//               value: transform(amount, params[1], params[0], transaction),
//             });
//             return;
//           }
//         } else if (
//           transaction.offering.from === assets[0] &&
//           transaction.receiving.to === assets[1]
//         ) {
//           if (typeof amount === "number") {
//             reducer({
//               type: "offering-amount",
//               value: parseFloat(amount),
//             });
//             reducer({
//               type: "receiving-amount",
//               value: transform(amount, params[0], params[1], transaction),
//             });
//             return;
//           }
//         }
//       }
//     }
//   }
// }

// /**
//  * Components
//  * @component SwapContent
//  * Main container for DeX trading interface
//  */
// export default function SwapContent() {
//   const [modalVisible, setModalVisible] = useState(false);
//   const [modalCanAnimate, setModalCanAnimate] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [loadingText, setLoadingText] = useState(null);
//   const [totals, setTotals] = useState(null);
//   const [target, setTarget] = useState("");
//   const [transaction, setTransaction] = useState([]);
//   const dispatch = useDispatch();
//   const { theme } = useContext(ThemeContext);

//   const sessionStorageSetHandler = (e) => {
//     setLoadingText(JSON.parse(e.value));
//   };
//   document.addEventListener("itemInserted", sessionStorageSetHandler, false);

//   useEffect(async () => {
//     const res = await getTotals();
//     setTotals(res);
//     return () => {
//       console.log("unmounting pool totals", totals);
//     };
//   }, []);

//   useEffect(() => {
//     if (transaction && transaction.offering) {
//       setTarget(targetPool(transaction.offering.from, transaction.offering.to));
//     } else {
//       setTarget(defaultPool);
//     }
//   }, []);

//   return (
//     <div>
//       {loading ? <LoadingOverlay text={loadingText} /> : <></>}
//       <div style={{ marginBottom: 50 }}>
//         {titles.map((value, index) => {
//           return (
//             <Section
//               title={value.title}
//               key={index}
//               darkToggle={theme === "dark"}
//               transactionCallback={(transaction) => {
//                 let keys = target.split("/");
//                 setModalCanAnimate(true);
//                 setTransaction([
//                   {
//                     title: "You are offering ",
//                     value: `${transaction.offering.amount}${
//                       " " + transaction.offering.from
//                     }`,
//                     token: `${transaction.offering.from}`,
//                   },
//                   {
//                     title: "You are receiving a minimum of ",
//                     value: `${
//                       totals
//                         ? (
//                             (calcTransResult(
//                               transaction.offering.amount,
//                               totals[target][keys[0].toLowerCase()],
//                               totals[target][keys[1].toLowerCase()],
//                               transaction,
//                             ) *
//                               (1e6 * (1 - slippageTolerance))) /
//                             1e6
//                           ).toFixed(6)
//                         : transaction.converted.amount // not sure if still in use
//                     } ${transaction.receiving.to}`,
//                     token: `${transaction.receiving.to}`,
//                   },
//                   {
//                     title: "Transaction Fee",
//                     value: "0.003 Algos",
//                   },
//                 ]);
//                 setModalVisible(true);
//               }}
//             ></Section>
//           );
//         })}
//         <TransactionContainer darkToggle={theme === "dark"}>
//           <Modal
//             title="Are you sure you want to proceed?"
//             subtitle="Review the details of this transaction to the right and click “Confirm Transaction” to proceed."
//             visible={modalVisible}
//             animate={modalCanAnimate}
//             close={() => setModalVisible(false)}
//             darkToggle={theme === "dark"}
//           >
//             <TransactionSummary
//               darkToggle={theme === "dark"}
//               specifics={transaction}
//               transactionFunc={async () => {
//                 setModalCanAnimate(true);
//                 setModalVisible(false);
//                 setLoading(true);
//                 try {
//                   const amount = parseFloat(transaction[0].value);
//                   const formattedAmount = parseInt(1e6 * amount);

//                   if (VERSION !== "MAINNET") {
//                     throw new Error("Unable to swap on TESTNET");
//                   }
//                   let res;
//                   if (
//                     transaction[0].token == "ALGO" &&
//                     transaction[1].token == "GARD"
//                   ) {
//                     res = await swapAlgoToGard(
//                       formattedAmount,
//                       parseInt(
//                         1e6 *
//                           parseFloat(transaction[1].value.split()[0]) *
//                           (1 - slippageTolerance),
//                       ),
//                     );
//                   } else if (
//                     transaction[0].token == "GARD" &&
//                     transaction[1].token == "ALGO"
//                   ) {
//                     res = await swapGardToAlgo(
//                       formattedAmount,
//                       parseInt(
//                         1e6 *
//                           parseFloat(transaction[1].value.split()[0]) *
//                           (1 - slippageTolerance),
//                       ),
//                     );
//                   }
//                   if (res.alert) {
//                     dispatch(setAlert(res.text));
//                   }
//                 } catch (e) {
//                   handleTxError(e, "Error exchanging assets");
//                 }
//                 setModalCanAnimate(false);
//                 setLoading(false);
//               }}
//               cancelCallback={() => setModalVisible(false)}
//             />
//           </Modal>
//         </TransactionContainer>
//       </div>
//     </div>
//   );
// }

// /**
//  * @component Section - The expandable section in SwapContent
//  * @prop {String} title - Section title to be displayed on top
//  * @prop {Function} transactionCallback - Callback function for when a transaction is executed
//  */

// function Section({ title, transactionCallback }) {
//   const [expanded, setExpanded] = useState(false);
//   const [totals, setTotals] = useState(null);
//   const [algoToGardRatio, setAlgoToGardRatio] = useState("Loading...");
//   const [loadingText, setLoadingText] = useState(null);
//   const [balanceX, setBalanceX] = useState("...");
//   const [balanceY, setBalanceY] = useState("...");
//   const [receivedValue, setReceivedValue] = useState(null);
//   const { theme } = useContext(ThemeContext);
//   const assetsA2G = ["ALGO", "GARD"]; // 1st asset pairing, store additional pairings here

//   // get pool totals and set asset pair ratio
//   useEffect(async () => {
//     const resultsOfQuery = await queryAndConvertTotals();
//     setTotals(resultsOfQuery);
//     let algoGardRatio = exchangeRatioAssetXtoAssetY(
//       mAlgosToAlgos(resultsOfQuery["ALGO/GARD" || "GARD/ALGO"].algo),
//       mGardToGard(resultsOfQuery["ALGO/GARD" || "GARD/ALGO"].gard),
//     );
//     if (algoGardRatio) {
//       setAlgoToGardRatio(algoGardRatio);
//     }
//     return () => {
//       console.log("unmounting getRatio effect", algoGardRatio);
//     };
//   }, []);

//   // get/set totals... this appears redundant
//   useEffect(async () => {
//     const res = await getTotals();
//     if (res) {
//       setTotals(res);
//     }
//     return () => {
//       console.log("unmounting getTotals effect", totals);
//     };
//   }, []);

//   // handler for central swapping mechanism (reverse, reverse!)
//   const handleSwapButton = (e) => {
//     e.preventDefault();
//     const swappedObj = {
//       offering: {
//         from: transaction.receiving.to,
//         amount: transaction.receiving.amount,
//       },
//       receiving: {
//         to: transaction.offering.from,
//         amount: transaction.offering.amount,
//       },
//     };
//     reduceTransaction({
//       type: "flip",
//       value: swappedObj,
//     });
//   };

//   // data object reducer
//   const [transaction, reduceTransaction] = useReducer(
//     (state, action) => {
//       switch (action.type) {
//         case "offering-amount":
//           return {
//             ...state,
//             offering: {
//               ...state.offering,
//               amount: action.value,
//             },
//           };
//         case "offering-from":
//           return {
//             ...state,
//             offering: {
//               ...state.offering,
//               from: action.value,
//             },
//           };
//         case "receiving-amount":
//           return {
//             ...state,
//             receiving: {
//               ...state.receiving,
//               amount: action.value,
//             },
//           };
//         case "receiving-to":
//           return {
//             ...state,
//             receiving: {
//               ...state.receiving,
//               to: action.value,
//             },
//           };
//         case "clear":
//           return {
//             ...state,
//             offering: {
//               ...state.offering,
//               amount: "",
//             },
//             receiving: {
//               ...state.receiving,
//               amount: "",
//             },
//           };
//         case "flip":
//           return {
//             ...state,
//             ...action.value,
//           };
//         default:
//           return {
//             ...state,
//             defaultPool: defaultPool,
//           };
//       }
//     },
//     {
//       offering: {
//         amount: "",
//         from: "ALGO",
//       },
//       receiving: {
//         amount: "",
//         to: "GARD",
//       },
//     },
//   );

//   // state update of estimated return
//   useEffect(() => {
//     if (transaction) {
//       if (totals) {
//         const { offering, receiving } = transaction;
//         let res = calcTransResult(
//           offering.amount,
//           totals[targetPool(offering.from, receiving.to)][
//             offering.from.toLowerCase()
//           ],
//           totals[targetPool(offering.from, receiving.to)][
//             receiving.to.toLowerCase()
//           ],
//           transaction,
//         );
//         setReceivedValue(res);
//       }
//     }
//     return () => {
//       console.log("unmounting get totals effect");
//     };
//   }, []);

//   // wallet info effect
//   useEffect(() => {
//     let balX = mAlgosToAlgos(getWalletInfo().amount);
//     let balY = mAlgosToAlgos(getGARDInWallet());
//     setBalanceX(balX);
//     setBalanceY(balY);
//   }, []);

//   return (
//     <div style={{ marginBottom: 10 }}>
//       <SectionButton
//         darkToggle={theme === "dark"}
//         onClick={() => {
//           setExpanded(!expanded);
//         }}
//       >
//         <TitleContainer
//           expanded={expanded}
//           style={{ paddingTop: 44, paddingLeft: 16 }}
//           darkToggle={theme === "dark"}
//         >
//           <div style={{ marginRight: 8 }}>
//             <Arrow
//               src={chevron}
//               style={
//                 expanded ? { transform: "rotate(90deg)", background: "" } : {}
//               }
//               darkToggle={theme === "dark"}
//             />
//           </div>
//           <div>
//             <TitleText darkToggle={theme === "dark"}>{title}</TitleText>
//           </div>
//         </TitleContainer>
//         <RelationsContainer>
//           <div style={{ flex: 1 }} darkToggle={theme === "dark"}>
//             <RelationsSpecificsContainer
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <div>
//                 <RelationsTitle>{pools[0]}</RelationsTitle>
//               </div>
//             </RelationsSpecificsContainer>
//             <RelationsSpecificsContainer
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <div>
//                 <RelationsValue>
//                   {algoToGardRatio !== null ? algoToGardRatio : "Loading..."}
//                 </RelationsValue>
//               </div>
//             </RelationsSpecificsContainer>
//           </div>
//         </RelationsContainer>
//       </SectionButton>
//       {expanded ? (
//         <ExpandedContainer
//           style={{
//             display: "flex",
//             flexDirection: "column",
//           }}
//           darkToggle={theme === "dark"}
//         >
//           <div
//             style={{
//               height: 93,
//               paddingTop: 21,
//               display: "flex",
//               flexDirection: "row",
//               flex: 1,
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 flexDirection: "row",
//                 flex: 3,
//                 justifyContent: "space-between",
//               }}
//             >
//               <div style={{ flex: 1 }}>
//                 <div style={{ marginBottom: 8 }}>
//                   <InputTitle>From</InputTitle>
//                 </div>
//                 <div style={{ marginBottom: 8 }}>
//                   <Select
//                     value={transaction.offering.from}
//                     onChange={(e) => {
//                       toggleSelect(
//                         e.target.value,
//                         transaction.offering.from,
//                         "offering-from",
//                         "receiving-to",
//                         assetsA2G,
//                         reduceTransaction,
//                       );
//                       reduceTransaction({
//                         type: "offering-amount",
//                         value: transaction.receiving.amount,
//                       });
//                       reduceTransaction({
//                         type: "receiving-amount",
//                         value: transaction.offering.amount,
//                       });
//                     }}
//                     darkToggle={theme === "dark"}
//                   >
//                     <option>ALGO</option>
//                     <option>GARD</option>
//                   </Select>
//                 </div>
//                 <div>
//                   <InputTitle>
//                     {transaction.offering.from === "ALGO"
//                       ? "Balance: " + balanceX
//                       : "Balance: " + balanceY}
//                   </InputTitle>
//                 </div>
//               </div>
//               <div style={{ flex: 1 }}>
//                 <div style={{ marginBottom: 8 }}>
//                   <InputTitle>Amount</InputTitle>
//                 </div>
//                 <div>
//                   {/* convert 1st field inputs to field 2 vals*/}
//                   <Input
//                     type="number"
//                     min="0"
//                     step="0.00"
//                     value={transaction.offering.amount}
//                     darkToggle={theme === "dark"}
//                     onChange={(e) => {
//                       e.target.value.replace(/\D+/g, "");
//                       if (e.target.value !== "") {
//                         handleExchange(
//                           "receiving-amount",
//                           parseFloat(e.target.value),
//                           assetsA2G,
//                           calcTransResult,
//                           [
//                             totals[
//                               targetPool(
//                                 transaction.offering.from,
//                                 transaction.receiving.to,
//                               )
//                             ][transaction.offering.from.toLowerCase()],

//                             totals[
//                               targetPool(
//                                 transaction.offering.from,
//                                 transaction.receiving.to,
//                               )
//                             ][transaction.receiving.to.toLowerCase()],
//                           ],
//                           transaction,
//                           reduceTransaction,
//                         );
//                       } else {
//                         reduceTransaction({
//                           type: "clear",
//                         });
//                       }
//                     }}
//                   />
//                 </div>
//               </div>
//             </div>
//             <div
//               style={{
//                 display: "flex",
//                 flex: 1,
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <ImgText>
//                 <Image
//                   onClick={handleSwapButton}
//                   src={swapIcon}
//                   darkToggle={theme === "dark"}
//                 />
//               </ImgText>
//             </div>
//             <div
//               style={{
//                 display: "flex",
//                 flexDirection: "row",
//                 justifyContent: "space-between",
//                 flex: 3,
//               }}
//             >
//               <div style={{ flex: 1 }}>
//                 <div style={{ marginBottom: 8 }}>
//                   <InputTitle>To</InputTitle>
//                 </div>
//                 <div style={{ marginBottom: 8 }}>
//                   <Select
//                     value={transaction.receiving.to}
//                     onChange={(e) => {
//                       toggleSelect(
//                         e.target.value,
//                         transaction.offering.from,
//                         "receiving-to",
//                         "offering-from",
//                         assetsA2G,
//                         reduceTransaction,
//                       );
//                       reduceTransaction({
//                         type: "offering-amount",
//                         value: transaction.receiving.amount,
//                       });
//                       reduceTransaction({
//                         type: "receiving-amount",
//                         value: transaction.offering.amount,
//                       });
//                     }}
//                     darkToggle={theme === "dark"}
//                   >
//                     <option>GARD</option>
//                     <option>ALGO</option>
//                   </Select>
//                 </div>
//                 <div>
//                   <InputTitle>
//                     {transaction.receiving.to == "ALGO"
//                       ? "Balance: " + balanceX
//                       : "Balance: " + balanceY}
//                   </InputTitle>
//                 </div>
//               </div>
//               <div style={{ flex: 1 }}>
//                 <div style={{ marginBottom: 8 }}>
//                   <InputTitle>Amount</InputTitle>
//                 </div>
//                 <div>
//                   {/* convert second field inputs to field 1 vals*/}
//                   <Input
//                     type="number"
//                     min={0}
//                     value={transaction.receiving.amount}
//                     darkToggle={theme === "dark"}
//                     onChange={(e) => {
//                       e.target.value.replace(/\D+/g, "");
//                       handleExchange(
//                         "offering-amount",
//                         parseFloat(e.target.value),
//                         assetsA2G,
//                         estimateReturn,
//                         [
//                           totals[
//                             targetPool(
//                               transaction.offering.from,
//                               transaction.receiving.to,
//                             )
//                           ][transaction.receiving.to.toLowerCase()],
//                           totals[
//                             targetPool(
//                               transaction.offering.from,
//                               transaction.receiving.to,
//                             )
//                           ][transaction.offering.from.toLowerCase()],
//                         ],
//                         transaction,
//                         reduceTransaction,
//                       );
//                     }}
//                     disabled={true}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div style={{ marginBottom: 35 }}>
//             <PrimaryButton
//               text={"Execute Transaction"}
//               onClick={() => transactionCallback(transaction)}
//               darkToggle={theme === "dark"}
//             />
//           </div>
//         </ExpandedContainer>
//       ) : (
//         <></>
//       )}
//     </div>
//   );
// }

// // Styled Components
// const TitleContainer = styled.div`
//   background: #f4ebff;
//   border-radius: 6px;
//   flex: 2;
//   display: flex;
//   flex-direction: row;
//   ${(props) =>
//     props.darkToggle &&
//     css`
//       background: #404040;
//     `}
//   ${(props) =>
//     props.expanded &&
//     css`
//       background: #fcfcfd;
//     `}
//   ${(props) =>
//     props.expanded &&
//     props.darkToggle &&
//     css`
//       background: #1c1c1c;
//     `}
// `;

// const TransactionContainer = styled.div`
//   ${(props) =>
//     props.darkToggle &&
//     css`
//       background: #484848;
//       color: white;
//     `}
// `;

// const SectionButton = styled.div`
//   height: 96px;
//   cursor: pointer;
//   display: flex;
//   flex-direction: row;
// `;

// const RelationsContainer = styled.div`
//   flex: 3;
//   display: flex;
//   flex-direction: row;
//   ${(props) =>
//     props.darkToggle &&
//     css`
//       background: #484848;
//       color: white;
//     `}
// `;
// const TitleText = styled.text`
//   font-weight: 500;
//   font-size: 20px;
//   ${(props) =>
//     props.darkToggle
//       ? `
//     background: #2c2c2c
//     color: #f4ebff
//   `
//       : ""}
// `;
// const RelationsSpecificsContainer = styled.div`
//   border-bottom: 1px solid #f9f9f9;
//   height: 48px;
// `;
// const RelationsTitle = styled.text`
//   font-weight: bold;
//   font-size: 14px;
//   ${(props) =>
//     props.darkToggle &&
//     css`
//       background: #484848;
//       color: white;
//       border-radius: 25px;
//       border: 2px solid #c299eb;
//       padding: 20px;
//       width: 200px;
//       height: 150px;
//     `}
// `;
// const RelationsValue = styled.text`
//   font-weight: 500;
//   font-size: 14px;
// `;
// const ExpandedContainer = styled.div`
//   height: 207px;
//   background: #f4ebff;
//   padding: 0px 3vw;
//   ${(props) =>
//     props.darkToggle &&
//     css`
//       background: #404040;
//     `}
// `;
// const InputTitle = styled.text`
//   font-weight: normal;
//   font-size: 14px;
//   color: #7a7a7a;
//   ${(props) =>
//     props.darkToggle &&
//     css`
//       color: #ffffff;
//     `}
// `;
// const Select = styled.select`
//   height: 40px;
//   background: #ffffff;
//   border: 1px solid #dce1e6;
//   border-radius: 4px;
//   width: 11.5972222222222vw;
//   padding: 0px 0px 0px 12px;
//   ${(props) =>
//     props.darkToggle &&
//     css`
//       background: #525252;
//       color: #ffffff;
//     `}
// `;
// const Input = styled.input`
//   height: 40px;
//   background: #ffffff;
//   border: 1px solid #dce1e6;
//   border-radius: 4px;
//   width: 11.5972222222222vw;
//   padding: 0px 0px 0px 12px;
//   ${(props) =>
//     props.darkToggle &&
//     css`
//       background: #525252;
//       color: white;
//     `}
//   input[type="number"]::-webkit-outer-spin-button,
//   input[type="number"]::-webkit-inner-spin-button {
//     -webkit-appearance: none;
//     margin: 0;
//   }
//   input[type="number"] {
//     -moz-appearance: textfield;
//   }
//   &:focus {
//     outline-color: #bc82ff;
//   }
//   &:focus::placeholder {
//     color: transparent;
//   }
//   &:hover {
//     input[type="number"]::-webkit-outer-spin-button,
//     input[type="number"]::-webkit-inner-spin-button {
//       -webkit-appearance: none;
//       margin: 0;
//     }
//     input[type="number"] {
//       -moz-appearance: textfield;
//     }
//   }
// `;

// const Image = styled.img`
//   background-color: #ffffff;

//   padding: 8px 18px;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   cursor: pointer;
//   border-radius: 6px;
//   &:hover {
//     background-color: #6941c6;
//     border: 1px solid #ffffff;
//   }
//   ${(props) =>
//     props.darkToggle &&
//     css`
//       border: 1px solid #c299eb;
//       background-color: #c299eb;
//       &:hover {
//         background-color: #9a71da;
//         border: 1px solid #9a71da;
//       }
//     `}
// `;

// const ImgText = styled.text`
//   color: #ffffff;
//   font-weight: 500;
//   font-size: 16px;
//   ${Image}:hover & {
//     color: #ffffff;
//   }
//   ${(props) =>
//     props.variant &&
//     css`
//       color: #6941c6;
//     `}
//   ${(props) =>
//     props.variant &&
//     props.darkToggle &&
//     css`
//       color: #c299eb;
//     `}
//   ${(props) =>
//     props.disabled &&
//     css`
//       color: #666666;
//     `}
// `;

// const Arrow = styled.img`
//   ${(props) =>
//     props.darkToggle &&
//     css`
//       filter: invert();
//     `}
// `;

// const titles = [
//   {
//     title: "Pact",
//   },
// ];

// /**
//  * // for later (shhh)
//  * /* <div style={{ flex: 1 }}>
//             <RelationsSpecificsContainer
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//               }}
//             > */
// /* <div>
//                 <RelationsTitle>Tether/GARD</RelationsTitle>
//               </div>
//             </RelationsSpecificsContainer>
//             <RelationsSpecificsContainer
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//               }}
//             >
//               <div>
//                 <RelationsValue>1.1</RelationsValue>
//               </div>
//             </RelationsSpecificsContainer>
//           </div> */
// /* <div style={{ flex: 1 }}>
//             <RelationsSpecificsContainer
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//               }}
//             >
//               <div>
//                 <RelationsTitle>USDC/GARD</RelationsTitle>
//               </div>
//             </RelationsSpecificsContainer>
//             <RelationsSpecificsContainer
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//               }}
//             >
//               <div>
//                 <RelationsValue>1.1</RelationsValue>
//               </div>
//             </RelationsSpecificsContainer>
//           </div>
//  */
