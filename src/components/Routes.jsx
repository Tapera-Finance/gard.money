import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GovernContent from "../pages/GovernContent";
import AuctionsContent from "../pages/AuctionsContent";
import DaoContent from "../pages/DaoContent";
import AnalyticsContent from "../pages/AnalyticsContent";
import HomeContent from "../pages/HomeContent";
import Main from "./Main";
import BorrowContent from "../pages/BorrowContent";
import RepayContent from "../pages/RepayContent";
import ActionsContent from "../pages/ActionsContent";
import WalletContent from "../pages/WalletContent";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={Main(HomeContent, "Home")} />
        <Route path="/wallet" element={Main(WalletContent, "Wallet")} />
        <Route path="/borrow" element={Main(BorrowContent, "Borrow")} />
        <Route path="/manage" element={Main(RepayContent, "Manage CDPs")} />
        <Route path="/auctions" element={Main(AuctionsContent, "Auctions")} />
        <Route path="/actions" element={Main(ActionsContent, "Actions")} />
        <Route path="/dao" element={Main(DaoContent, "DAO")} />
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
