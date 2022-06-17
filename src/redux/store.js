import { configureStore } from "@reduxjs/toolkit";
import alertReducer from "./slices/alertSlice";
import walletSlice from "./slices/walletSlice";

export default configureStore({
  reducer: {
    alert: alertReducer,
    wallet: walletSlice,
  },
});
