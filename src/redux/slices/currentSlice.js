import { createSlice } from "@reduxjs/toolkit";

export const currentSlice = createSlice({
  name: "current",
  initialState: {
    price: 0.401,
  },
  reducers: {
    setCurrent: (state, action) => {
      state.price = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setCurrent } = currentSlice.actions;

export default currentSlice.reducer;
