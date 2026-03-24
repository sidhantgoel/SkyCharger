import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthenticationState {
  password: string;
  passwordDialogOpen: boolean;
  passwordOk: boolean;
}

const initialState: AuthenticationState = {
  password: "0000",
  passwordDialogOpen: false,
  passwordOk: false,
};

const authenticationSlice = createSlice({
  name: "authentication",
  initialState,
  reducers: {
    setPassword: (state, action: PayloadAction<string>) => {
      state.password = action.payload;
    },
    openPasswordDialog: (state, action: PayloadAction<boolean>) => {
      state.passwordDialogOpen = action.payload;
    },
    closePasswordDialog: (state) => {
      state.passwordDialogOpen = false;
    },
    setPasswordOk: (state, action: PayloadAction<boolean>) => {
      state.passwordOk = action.payload;
    },
    resetAuthentication: (state) => {
      state.passwordDialogOpen = false;
      state.passwordOk = false;
    },
  },
});

export const {
  setPassword,
  openPasswordDialog,
  closePasswordDialog,
  setPasswordOk,
  resetAuthentication,
} = authenticationSlice.actions;
export default authenticationSlice;
