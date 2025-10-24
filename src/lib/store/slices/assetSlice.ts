import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Asset, AssetFilter, AssetStatus, AssetType } from "@/types/asset";
import { axiosInstance } from "@/lib/api";

interface AssetState {
  asset: Asset | null;
  loading: boolean;
  error: string | null;
}

const initialState: AssetState = {
  asset: null,
  loading: false,
  error: null,
};

export const fetchAssetById = createAsyncThunk(
  "asset/fetchAssetById",
  async (id: string) => {
    const response = await axiosInstance.get(`api/v1/assets/${id}`);
    return response.data;
  }
);

const assetSlice = createSlice({
  name: "asset",
  initialState,
  reducers: {
    clearAsset: (state) => {
      state.asset = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch asset by ID
    builder
      .addCase(fetchAssetById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssetById.fulfilled, (state, action) => {
        state.loading = false;
        state.asset = action.payload;
        state.error = null;
      })
      .addCase(fetchAssetById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch asset";
      });
  },
});

export const { clearAsset, clearError } = assetSlice.actions;

export default assetSlice.reducer;
