import { createSlice } from "@reduxjs/toolkit";

export const alertSlice = createSlice({
  name: "alert",
  initialState: {
    text: "",
    visible: false,
  },
  reducers: {
    setAlert: (state, action) => {
      state.text = action.payload;
      state.visible = true;
    },
    hide: (state, action) => {
      state.visible = false;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setAlert, hide } = alertSlice.actions;

export default alertSlice.reducer;
