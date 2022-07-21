import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AlgoGovernanceContent from "./AlgoGovernanceContent";
import AuctionsContent from "./AuctionsContent";
import DaoContent from "./DaoContent";
import DashboardContent from "./DashboardContent";
import HomeContent from "./HomeContent";
import Main from "./Main";
import MintContent from "./MintContent";
import RepayContent from "./RepayContent";
import SwapContent from "./SwapContent";
import WalletContent from "./WalletContent";

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
        <Route path="/swap" element={Main(SwapContent, "Swap")} />
        <Route path="/dao" element={Main(DaoContent, "DAO")} />
        <Route
          path="/algo-governance"
          element={Main(AlgoGovernanceContent, "Algo Governance")}
        />
      </Routes>
    </BrowserRouter>
  );
}
