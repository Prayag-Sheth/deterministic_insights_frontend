import { configureStore } from "@reduxjs/toolkit";

import { authReducer } from "@/store/slices/auth-slice";

export function makeStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
