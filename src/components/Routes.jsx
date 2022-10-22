import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GovernContent from "../pages/GovernContent";
import AuctionsContent from "../pages/AuctionsContent";
import DaoContent from "../pages/DaoContent";
import AnalyticsContent from "../pages/AnalyticsContent";
import HomeContent from "../pages/HomeContent";
import Main from "./Main";
import BorrowContent from "../pages/BorrowContent";
import ActionsContent from "../pages/ActionsContent";
import AccountContent from "../pages/AccountContent";
import SwapDetails from "./actions/SwapDetails";
import StakeDetails from "./actions/StakeDetails";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={Main(HomeContent, "Home")} />
        <Route path="/account" element={Main(AccountContent, "Wallet")} />
        <Route path="/borrow" element={Main(BorrowContent, "Borrow")} />
        <Route path="/auctions" element={Main(AuctionsContent, "Auctions")} />
        {/* <Route path="/actions" element={Main(ActionsContent, "Actions")} /> */}
        <Route path="/swap" element={Main(SwapDetails, "Swap")} />
        <Route path="/stake" element={Main(StakeDetails, "Stake")} />
        {/* <Route path="/dao" element={Main(DaoContent, "DAO")} /> */}
        <Route
          path="/govern"
          element={Main(GovernContent, "Govern")}
        />
        <Route
          path="/analytics"
          element={Main(AnalyticsContent, "Analytics")}
        />
      </Routes>
    </BrowserRouter>
  );
}
