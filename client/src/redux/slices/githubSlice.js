import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import axiosInstance from '../../config/axiosInstance';

const initialState = {
  profiles: [],
  currentProfile: null,
  stats: null,
  pagination: {},
  loading: false,
  analyzing: false,
};

export const analyzeProfile = createAsyncThunk('/github/analyze', async (username) => {
  try {
    const response = axiosInstance.post(`/github/analyze/${username}`);
    toast.promise(response, {
      loading: `Analyzing @${username}...`,
      success: (data) => data?.data?.message,
      error: (err) => err?.response?.data?.message || 'Analysis failed',
    });
    return (await response).data;
  } catch (error) {
    toast.error(error?.response?.data?.message || 'Something went wrong');
    throw error;
  }
});

export const getAllProfiles = createAsyncThunk('/github/getAllProfiles', async ({ page = 1, limit = 10 } = {}) => {
  try {
    const response = await axiosInstance.get(`/github/profiles?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    toast.error(error?.response?.data?.message || 'Failed to fetch profiles');
    throw error;
  }
});

export const getSingleProfile = createAsyncThunk('/github/getSingleProfile', async (username) => {
  try {
    const response = await axiosInstance.get(`/github/profiles/${username}`);
    return response.data;
  } catch (error) {
    toast.error(error?.response?.data?.message || 'Profile not found');
    throw error;
  }
});

export const deleteProfile = createAsyncThunk('/github/deleteProfile', async (username) => {
  try {
    const response = axiosInstance.delete(`/github/profiles/${username}`);
    toast.promise(response, {
      loading: `Deleting @${username}...`,
      success: (data) => data?.data?.message,
      error: (err) => err?.response?.data?.message || 'Delete failed',
    });
    return (await response).data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
    throw error;
  }
});

export const getStats = createAsyncThunk('/github/getStats', async () => {
  try {
    const response = await axiosInstance.get('/github/stats');
    return response.data;
  } catch (error) {
    toast.error(error?.response?.data?.message || 'Failed to fetch stats');
    throw error;
  }
});

export const compareProfiles = createAsyncThunk('/github/compare', async (users) => {
  try {
    const response = await axiosInstance.get(`/github/compare?users=${users}`);
    return response.data;
  } catch (error) {
    toast.error(error?.response?.data?.message || 'Comparison failed');
    throw error;
  }
});

const githubSlice = createSlice({
  name: 'github',
  initialState,
  reducers: {
    clearCurrentProfile: (state) => {
      state.currentProfile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Analyze
      .addCase(analyzeProfile.pending, (state) => {
        state.analyzing = true;
      })
      .addCase(analyzeProfile.fulfilled, (state, action) => {
        state.analyzing = false;
        state.currentProfile = action.payload?.profile;
      })
      .addCase(analyzeProfile.rejected, (state) => {
        state.analyzing = false;
      })
      // Get All
      .addCase(getAllProfiles.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllProfiles.fulfilled, (state, action) => {
        state.loading = false;
        state.profiles = action.payload?.profiles || [];
        state.pagination = action.payload?.pagination || {};
      })
      .addCase(getAllProfiles.rejected, (state) => {
        state.loading = false;
      })
      // Get Single
      .addCase(getSingleProfile.pending, (state) => {
        state.loading = true;
        state.currentProfile = null;
      })
      .addCase(getSingleProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProfile = action.payload?.profile;
      })
      .addCase(getSingleProfile.rejected, (state) => {
        state.loading = false;
      })
      // Delete
      .addCase(deleteProfile.fulfilled, (state, action) => {
        const username = action.meta.arg;
        state.profiles = state.profiles.filter((p) => p.username !== username);
      })
      // Stats
      .addCase(getStats.fulfilled, (state, action) => {
        state.stats = action.payload?.stats;
      });
  },
});

export const { clearCurrentProfile } = githubSlice.actions;
export default githubSlice.reducer;
