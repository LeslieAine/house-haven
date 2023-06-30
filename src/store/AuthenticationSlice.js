import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { setLocalStorage, getLocalStorage, deleteLocalStorage } from '../helpers/storage';

const baseUrl = 'http://localhost:3000/users';

const initialState = {
  token: getLocalStorage('token') || null,
  user: getLocalStorage('user') || null,
  tempUser: {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  },
  isLoading: false,
  errors: null,
  formAuth: 'login',
};

export const logInUser = createAsyncThunk('auth/login', async (userInput, thunkAPI) => {
  try {
    const response = await axios.post(`${baseUrl}/sign_in`, userInput);
    const tempToken = response.headers.getAuthorization(/Bearer /).input;
    response.data.tempToken = tempToken;
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue('Sign in failed!');
  }
});

export const logOutUser = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  try {
    const response = await axios.delete(`${baseUrl}/sign_out`, {
      headers: {
        authorization: thunkAPI.getState().auth.token,
      },
    });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue('Sign out failed!');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userInput, thunkAPI) => {
  try {
    const response = await axios.post(baseUrl, userInput);
    return response.data;
  } catch (error) {
    if (error.response.status === 422) {
      return thunkAPI.rejectWithValue('Username and Email must be unique');
    }
    return thunkAPI.rejectWithValue('Sign up failed!');
  }
});

const authSlice = createSlice({
  name: 'authentication',
  initialState,
  reducers: {
    handleUpdate: (state, { payload: { name, value } }) => {
      const tempUser = { ...state.tempUser, [name]: value };
      return { ...state, tempUser };
    },
    toggleFormAuth: (state) => ({
      ...state,
      formAuth: state.formAuth === 'login' ? 'register' : 'login',
    }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(logInUser.pending, (state) => ({
        ...state,
        isLoading: true,
      }))
      .addCase(logInUser.fulfilled, (state, { payload }) => {
        setLocalStorage('token', payload.tempToken);
        setLocalStorage('user', payload.status.data);
        return {
          ...state,
          token: payload.tempToken,
          user: payload.status.data,
          isLoading: false,
        };
      })
      .addCase(logInUser.rejected, (state, { payload }) => ({
        ...state,
        isLoading: false,
        errors: payload,
      }));
    builder
      .addCase(logOutUser.pending, (state) => ({
        ...state,
        isLoading: true,
      }))
      .addCase(logOutUser.fulfilled, (state) => {
        deleteLocalStorage('token');
        deleteLocalStorage('user');
        return {
          ...state,
          isLoading: false,
          token: null,
          user: null,
        };
      })
      .addCase(logOutUser.rejected, (state) => {
        deleteLocalStorage('token');
        deleteLocalStorage('user');
        return {
          ...state,
          isLoading: false,
          token: null,
          user: null,
        };
      });
    builder
      .addCase(registerUser.pending, (state) => ({
        ...state,
        isLoading: true,
      }))
      .addCase(registerUser.fulfilled, (state) => ({
        ...state,
        isLoading: false,
      }))
      .addCase(registerUser.rejected, (state, { payload }) => ({
        ...state,
        isLoading: false,
        errors: payload,
      }));
  },
});

export const { handleUpdate, toggleFormAuth } = authSlice.actions;
export default authSlice.reducer;