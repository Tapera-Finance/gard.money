import { createSlice } from "@reduxjs/toolkit";
import { displayWallet } from "../../wallets/wallets";

export const walletSlice = createSlice({
  name: "wallet",
  initialState: {
    address: displayWallet(),
  },
  reducers: {
    setWallet: (state, action) => {
      state.address = action.payload.address;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setWallet } = walletSlice.actions;

export default walletSlice.reducer;
