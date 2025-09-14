import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Asset, AssetFilter, AssetStatus, AssetType } from '@/types/asset'
import { axiosInstance } from '@/lib/api'

interface AssetState {
  assets: Asset[]
  currentAsset: Asset | null
  loading: boolean
  error: string | null
  filters: AssetFilter
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const initialState: AssetState = {
  assets: [],
  currentAsset: null,
  loading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
}

// Async thunks
export const fetchAssets = createAsyncThunk(
  'asset/fetchAssets',
  async (params: { page?: number; limit?: number; filters?: AssetFilter }) => {
    const response = await axiosInstance.get('/assets', { params })
    return response.data
  }
)

export const fetchAssetById = createAsyncThunk(
  'asset/fetchAssetById',
  async (id: string) => {
    const response = await axiosInstance.get(`/assets/${id}`)
    return response.data
  }
)

export const createAsset = createAsyncThunk(
  'asset/createAsset',
  async (assetData: Partial<Asset>) => {
    const response = await axiosInstance.post('/assets', assetData)
    return response.data
  }
)

export const updateAsset = createAsyncThunk(
  'asset/updateAsset',
  async ({ id, data }: { id: string; data: Partial<Asset> }) => {
    const response = await axiosInstance.put(`/assets/${id}`, data)
    return response.data
  }
)

export const deleteAsset = createAsyncThunk(
  'asset/deleteAsset',
  async (id: string) => {
    await axiosInstance.delete(`/assets/${id}`)
    return id
  }
)

const assetSlice = createSlice({
  name: 'asset',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<AssetFilter>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {}
    },
    setCurrentAsset: (state, action: PayloadAction<Asset | null>) => {
      state.currentAsset = action.payload
    },
    setPagination: (state, action: PayloadAction<Partial<AssetState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch assets
    builder
      .addCase(fetchAssets.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.loading = false
        state.assets = action.payload.data || []
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination
        }
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch assets'
      })

    // Fetch asset by ID
    builder
      .addCase(fetchAssetById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAssetById.fulfilled, (state, action) => {
        state.loading = false
        state.currentAsset = action.payload
      })
      .addCase(fetchAssetById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch asset'
      })

    // Create asset
    builder
      .addCase(createAsset.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createAsset.fulfilled, (state, action) => {
        state.loading = false
        state.assets.unshift(action.payload)
      })
      .addCase(createAsset.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create asset'
      })

    // Update asset
    builder
      .addCase(updateAsset.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateAsset.fulfilled, (state, action) => {
        state.loading = false
        const index = state.assets.findIndex(asset => asset.id === action.payload.id)
        if (index !== -1) {
          state.assets[index] = action.payload
        }
        if (state.currentAsset?.id === action.payload.id) {
          state.currentAsset = action.payload
        }
      })
      .addCase(updateAsset.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update asset'
      })

    // Delete asset
    builder
      .addCase(deleteAsset.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteAsset.fulfilled, (state, action) => {
        state.loading = false
        state.assets = state.assets.filter(asset => asset.id !== action.payload)
        if (state.currentAsset?.id === action.payload) {
          state.currentAsset = null
        }
      })
      .addCase(deleteAsset.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete asset'
      })
  },
})

export const {
  setFilters,
  clearFilters,
  setCurrentAsset,
  setPagination,
  clearError,
} = assetSlice.actions

export default assetSlice.reducer
