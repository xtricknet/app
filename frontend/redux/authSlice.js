import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}`
});

// Helper function to set up auth token
const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
    // Store user data when setting token
    try {
      const decoded = jwtDecode(token);
      if (decoded.id) {
        localStorage.setItem('userId', decoded.id);
        localStorage.setItem('userData', JSON.stringify({
          id: decoded.id,
          username: decoded.username,
          email: decoded.email
        }));
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userData');
  }
};

// Initialize auth token from localStorage
const token = localStorage.getItem('token');
if (token) {
  setAuthToken(token);
}

// Async thunks
export const signup = createAsyncThunk(
  'auth/signup',
  async ({ username, email, password, confirmPassword, referCode }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/auth/signup', {
        username,
        email,
        password,
        confirmPassword,
        referCode
      });
      
      return {
        success: true,
        email: data.email,
        message: data.message
      };
    } catch (error) {
      return rejectWithValue({
        success: false,
        message: error.response?.data?.message || 'Signup failed'
      });
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/auth/login', { 
        email, 
        password 
      });
      
      return {
        success: true,
        email: data.email,
        message: data.message
      };
    } catch (error) {
      return rejectWithValue({
        success: false,
        message: error.response?.data?.message || 'Login failed'
      });
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/auth/verify-otp', { 
        email, 
        otp 
      });
      
      if (data.token) {
        setAuthToken(data.token);
      }
      
      return {
        success: true,
        user: data.user,
        token: data.token,
        message: data.message
      };
    } catch (error) {
      return rejectWithValue({
        success: false,
        message: error.response?.data?.message || 'OTP verification failed'
      });
    }
  }
);

export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async (credentials, { rejectWithValue }) => {
    try {
      const isSignup = !!credentials.username;
      const endpoint = isSignup ? '/auth/signup' : '/auth/login';
      
      const { data } = await axiosInstance.post(endpoint, credentials);
      return {
        success: true,
        email: data.email,
        message: data.message || 'OTP resent successfully'
      };
    } catch (error) {
      return rejectWithValue({
        success: false,
        message: error.response?.data?.message || 'Failed to resend OTP'
      });
    }
  }
);

export const sendPasswordResetOtp = createAsyncThunk(
  'auth/forget-password',
  async ({ email }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/auth/forgot-password', { 
        email 
      });
      
      return {
        success: true,
        email: data.email,
        message: data.message
      };
    } catch (error) {
      return rejectWithValue({
        success: false,
        message: error.response?.data?.message || 'Failed to send reset OTP'
      });
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/reset-password',
  async ({ email, otp, newPassword }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/auth/reset-password', {
        email,
        otp,
        newPassword
      });
      
      return {
        success: true,
        message: data.message
      };
    } catch (error) {
      return rejectWithValue({
        success: false,
        message: error.response?.data?.message || 'Password reset failed'
      });
    }
  }
);

const getUserData = () => {
  const userData = localStorage.getItem('userData');
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }
  return null;
};

const initialState = {
  user: getUserData(),
  userId: localStorage.getItem('userId'),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  email: null,
  otpSent: false,
  otpVerified: false,
  message: null,
  resetPasswordSuccess: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.message = null;
    },
    logout: (state) => {
      setAuthToken(null);
      state.user = null;
      state.userId = null;
      state.token = null;
      state.isAuthenticated = false;
      state.email = null;
      state.otpSent = false;
      state.otpVerified = false;
    },
    resetAuthState: (state) => {
      Object.assign(state, initialState);
    },
    restoreAuthState: (state, action) => {
      const { token } = action.payload;
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 > Date.now()) {
            state.token = token;
            state.user = {
              id: decoded.id,
              username: decoded.username,
              email: decoded.email
            };
            state.userId = decoded.id;
            state.isAuthenticated = true;
            setAuthToken(token);
          } else {
            setAuthToken(null);
          }
        } catch {
          setAuthToken(null);
        }
      }
    },
    clearResetPasswordState: (state) => {
      state.resetPasswordSuccess = false;
      state.otpSent = false;
      state.error = null;
      state.message = null;
    }
  },
  extraReducers: (builder) => {
    // Signup
    builder
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.email = action.payload.email;
        state.otpSent = true;
        state.message = action.payload.message;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
        state.otpSent = false;
      })

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.email = action.payload.email;
        state.otpSent = true;
        state.message = action.payload.message;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
        state.otpSent = false;
      })

    // Verify OTP
    builder
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.userId = action.payload.user?.id;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.otpVerified = true;
        state.otpSent = false;
        state.message = action.payload.message;

        // Store user data
        if (action.payload.user) {
          localStorage.setItem('userData', JSON.stringify(action.payload.user));
        }
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })

    // Resend OTP
    builder
      .addCase(resendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.otpSent = true;
        state.message = action.payload.message;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });
      builder
      .addCase(sendPasswordResetOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendPasswordResetOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.email = action.payload.email;
        state.otpSent = true;
        state.message = action.payload.message;
      })
      .addCase(sendPasswordResetOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
        state.otpSent = false;
      })

    // Reset Password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.resetPasswordSuccess = true;
        state.otpSent = false;
        state.message = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
        state.resetPasswordSuccess = false;
      });
  }
});

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentUserId = (state) => state.auth.userId;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthLoading = (state) => state.auth.loading;

export const selectResetPasswordSuccess = (state) => state.auth.resetPasswordSuccess;

export const { clearError, logout, resetAuthState, restoreAuthState, clearResetPasswordState } = authSlice.actions;

export default authSlice.reducer;