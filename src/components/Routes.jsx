import { BrowserRouter, Routes, Route } from "react-router-dom";
import Referral from "./Referral";
import GovernContent from "../pages/GovernContent";
import AuctionsContent from "../pages/AuctionsContent";
import DaoContent from "../pages/DaoContent";
import AnalyticsContent from "../pages/AnalyticsContent";
import HomeContent from "../pages/HomeContent";
import ReferralContent from "../pages/ReferralContent";
import Main from "./Main";
import BorrowContent from "../pages/BorrowContent";
import ActionsContent from "../pages/ActionsContent";
import AccountContent from "../pages/AccountContent";
import SwapDetails from "./actions/SwapDetails";
import StakeDetails from "./actions/StakeDetails";
import { CONTENT_NAMES } from "../globals";
import { getWallet } from "../wallets/wallets";

export default function AppRoutes() {

  return (
    <BrowserRouter>
      <Referral></Referral>
      <Routes>
        <Route path="/" element={Main(HomeContent, CONTENT_NAMES.HOME)} />
        <Route path="/account" element={Main(AccountContent, CONTENT_NAMES.ACCOUNT)} />
        <Route path="/borrow" element={Main(BorrowContent, CONTENT_NAMES.BORROW)} />
        <Route path="/auctions" element={Main(AuctionsContent, CONTENT_NAMES.AUCTIONS)} />
        {/* <Route path="/actions" element={Main(ActionsContent, "Actions")} /> */}
        {/* <Route path="/swap" element={Main(SwapDetails, CONTENT_NAMES.SWAP)} /> */}
        <Route path="/stake" element={Main(StakeDetails, CONTENT_NAMES.STAKE)} />
        {/* <Route path="/dao" element={Main(DaoContent, "DAO")} /> */}
        <Route
          path="/govern"
          element={Main(GovernContent, CONTENT_NAMES.GOVERN)}
        />
        {<Route
          path="/analytics"
          element={Main(AnalyticsContent, CONTENT_NAMES.ANALYTICS)}
        />}
        <Route
        path="/referrals"
        element={Main(ReferralContent, "Referrals")}
        />
      </Routes>
    </BrowserRouter>
  );
}
