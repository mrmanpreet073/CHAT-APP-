// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/auth.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
}); 