import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",

  initialState: {
    currentUser: null,
    users: [],
    loading: false,
    error: false,
    token: null,
  },
  reducers: {
    fetchStart: (state) => {
      state.loading = true;
      state.error = false;
    },

    registerSuccess: (state, { payload }) => {
      state.loading = false;
      state.currentUser = payload?.user;
      state.token = payload?.bearer?.access;
    },
    usersSuccess: (state, { payload }) => {
      state.loading = false;
      state.users = payload?.data;
    },
    loginSuccess: (state, { payload }) => {
      state.loading = false;
      state.currentUser = payload?.user;
      state.token = payload?.bearer?.access;
    },
    logoutSuccess: (state) => {
      state.loading = false;
      state.currentUser = null;
      state.token = null;
    },
    fetchFail: (state) => {
      state.loading = false;
      state.error = true;
    },
  },
});

export const {
  fetchStart,
  registerSuccess,
  logoutSuccess,
  loginSuccess,
  usersSuccess,
  fetchFail,
} = authSlice.actions;
export default authSlice.reducer;
