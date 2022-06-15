import { configureStore } from "@reduxjs/toolkit";
import alertReducer from "./slices/alertSlice";
import walletSlice from "./slices/walletSlice";
import currentSlice from "./slices/currentSlice";

export default configureStore({
  reducer: {
    alert: alertReducer,
    wallet: walletSlice,
    current: currentSlice,
  },
});
