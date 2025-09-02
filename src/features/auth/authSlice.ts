import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
}

const initialState: AuthState = {
  AWS_ACCESS_KEY_ID: '',
  AWS_SECRET_ACCESS_KEY: '',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAccessKeyId: (state, action: PayloadAction<string>) => {
      state.AWS_ACCESS_KEY_ID = action.payload;
    },
    setSecretAccessKey: (state, action: PayloadAction<string>) => {
      state.AWS_SECRET_ACCESS_KEY = action.payload;
    },
    clearCredentials: (state) => {
      state.AWS_ACCESS_KEY_ID = '';
      state.AWS_SECRET_ACCESS_KEY = '';
    },
  },
});

// Export actions
export const { setAccessKeyId, setSecretAccessKey, clearCredentials } =
  authSlice.actions;

// Export reducer
export default authSlice.reducer;
