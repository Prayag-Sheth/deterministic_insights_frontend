import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { AuthUser } from "@/types/auth";

export interface AuthState {
  accessToken: string | null;
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  currentUser: null,
  isAuthenticated: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ accessToken: string; currentUser: AuthUser }>,
    ) {
      state.accessToken = action.payload.accessToken;
      state.currentUser = action.payload.currentUser;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    clearCredentials(state) {
      state.accessToken = null;
      state.currentUser = null;
      state.isAuthenticated = false;
    },
    setSessionLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, clearCredentials, setSessionLoading } =
  authSlice.actions;
export const authReducer = authSlice.reducer;
