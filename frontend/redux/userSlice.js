import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


export const fetchUserData = createAsyncThunk(
  'user/fetchUserData',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
      
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userData: {
      // Core User Information
      userId: '',
      username: '',
      email: '',
      role: 'user',
      avatar: '',

      // Financial Information
      balance: 0,
      totalReward: 0,
      pendingDeposit: 0,
      pendingWithdrawal:0,
      pendingOrder: 0,

      // Transaction Summary
      payin: 0,
      payout: 0,
      transactionDetails: [],

      // Referral Information
      referCode: '',
      referredBy: null,

      // Account Security
      failedLoginAttempts: 0,
      isLocked: false,
      lockUntil: null,

      // Ban Status
      banned: false,
      banReason: null,
      banLiftDate: null,

      // Bank and UPI Details
      bankDetails: [],
      upiDetails: [],

      // Other Preferences
      emailPreferences: true,

      // Security Information
      otp: null,
      otpExpiry: null,
    },
    // UI States
    loading: false,
    error: null,
    showSensitiveData: false
  },

  reducers: {
    toggleSensitiveData: (state) => {
      state.showSensitiveData = !state.showSensitiveData;
    },

    clearUserData: (state) => {
      state.userData = {
        userId: '',
        username: '',
        email: '',
        role: 'user',
        avatar: '',
        balance: 0,
        totalReward: 0,
        pendingDeposit: 0,
        pendingWithdrawal: 0,
        pendingOrder: 0,
        payin: 0,
        payout: 0,
        transactionDetails: [],
        referCode: '',
        referredBy: null,
        failedLoginAttempts: 0,
        isLocked: false,
        lockUntil: null,
        banned: false,
        banReason: null,
        banLiftDate: null,
        bankDetails: [],
        upiDetails: [],
        emailPreferences: true,
      };
    },

    updateUserPreferences: (state, action) => {
      state.userData.emailPreferences = action.payload.emailPreferences;
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = {
          // Core User Information
          userId: action.payload._id,
          username: action.payload.username || 'Anonymous',
          email: action.payload.email || '',
          role: action.payload.role || 'user',
          avatar: action.payload.avatar || 'https://i.ibb.co/c655HzS/default-avatar.jpg',

          // Financial Information
          balance: action.payload.balance || 0,
          totalReward: action.payload.totalReward || 0,
          pendingDeposit: action.payload.pendingDeposit || 0,
          pendingWithdrawal: action.payload.pendingWithdrawal || 0,
          pendingOrder: action.payload.pendingOrder || 0,

          // Transaction Summary
          payin: action.payload.payin || 0,
          payout: action.payload.payout || 0,
          transactionDetails: action.payload.transactionDetails || [],

          // Referral Information
          referCode: action.payload.referCode || '',
          referredBy: action.payload.refBy || null,

          // Account Security
          failedLoginAttempts: action.payload.failedLoginAttempts || 0,
          isLocked: action.payload.isLocked || false,
          lockUntil: action.payload.lockUntil || null,

          // Ban Status
          banned: action.payload.banned || false,
          banReason: action.payload.banReason || null,
          banLiftDate: action.payload.banLiftDate || null,

          // Bank and UPI Details
          bankDetails: action.payload.bankDetails || [],
          upiDetails: action.payload.upiDetails || [],

          // Other Preferences
          emailPreferences: action.payload.emailPreferences ?? true,
        };
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Export actions
export const {
  toggleSensitiveData,
  clearUserData,
  updateUserPreferences
} = userSlice.actions;

// Export selectors
export const selectUser = (state) => state.user.userData;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;
export const selectShowSensitiveData = (state) => state.user.showSensitiveData;

// Export reducer
export default userSlice.reducer;
