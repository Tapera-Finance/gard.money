import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AlgoGovernanceContent from "../pages/AlgoGovernanceContent";
import AuctionsContent from "../pages/AuctionsContent";
import DaoContent from "../pages/DaoContent";
import DashboardContent from "../pages/DashboardContent";
import HomeContent from "../pages/HomeContent";
import Main from "./Main";
import MintContent from "../pages/MintContent";
import RepayContent from "../pages/RepayContent";
import SwapContent from "../pages/SwapContent";
import WalletContent from "../pages/WalletContent";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={Main(HomeContent, "Home")} />
        <Route
          path="/dashboard"
          element={Main(DashboardContent, "Dashboard")}
        />
        <Route path="/wallet" element={Main(WalletContent, "Wallet")} />
        <Route path="/new-cdp" element={Main(MintContent, "New CDP")} />
        <Route path="/manage" element={Main(RepayContent, "Manage CDPs")} />
        <Route path="/auctions" element={Main(AuctionsContent, "Auctions")} />
        <Route
          path="/swap"
          element={
            APPVERSION && APPVERSION === "V2"
              ? Main(SwapContainer, "Swap")
              : Main(SwapContent, "Swap")
          }
        />
        <Route path="/dao" element={Main(DaoContent, "DAO")} />
        <Route
          path="/algo-governance"
          element={Main(AlgoGovernanceContent, "Algo Governance")}
        />
      </Routes>
    </BrowserRouter>
  );
}
