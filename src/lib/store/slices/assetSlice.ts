import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Asset, AssetFilter, AssetStatus, AssetType, PaginatedResponse } from "@/types/asset";
import { axiosInstance } from "@/lib/api";

// Bulk location update types
interface LocationUpdateItem {
  assetId: string;
  roomId: string;
  note?: string;
}

interface BulkLocationUpdateRequest {
  items: LocationUpdateItem[];
  generalNote?: string;
}

interface BulkLocationUpdateResult {
  successCount: number;
  errorCount: number;
  totalCount: number;
  successAssetIds: string[];
  errors: string[];
  executedAt: string;
  executedBy: string;
}

// Warehouse asset types
interface WarehouseAssetFilter {
  search?: string;
  type?: string;
  status?: string;
  categoryId?: string;
  unitId?: string;
  warehouseRoomId?: string;
  currentPage?: number;
  itemsPerPage?: number;
}

interface WarehouseAsset {
  id: string;
  ktCode: string;
  fixedCode: string;
  name: string;
  specs?: string;
  entrydate: Date;
  unit: string;
  quantity: number;
  origin?: string;
  purchasePackage: number;
  type: string;
  status: string;
  allowMove: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: {
    id: string;
    name: string;
    code: string;
  };
  currentRoom?: {
    id: string;
    name: string;
    roomCode: string;
  };
  currentUnit?: {
    id: string;
    name: string;
    unitCode: number;
  };
  rfidTag?: {
    id: number;
    rfid: string;
  };
  lastReceivedTransaction?: {
    transactionId: string;
    receivedAt: Date;
    fromUnitName: string;
    toUnitName: string;
  };
}

interface AssetState {
  asset: Asset | null;
  warehouseAssets: PaginatedResponse<WarehouseAsset>;
  warehouseUnits: { id: string; name: string; unitCode: number }[];
  bulkUpdateResult: BulkLocationUpdateResult | null;
  loading: boolean;
  warehouseLoading: boolean;
  unitsLoading: boolean;
  bulkUpdateLoading: boolean;
  error: string | null;
}

const initialState: AssetState = {
  asset: null,
  warehouseAssets: {
    data: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
      nextPage: null,
      prevPage: null,
      firstPage: 1,
      lastPage: 1,
    },
  },
  warehouseUnits: [],
  bulkUpdateResult: null,
  loading: false,
  warehouseLoading: false,
  unitsLoading: false,
  bulkUpdateLoading: false,
  error: null,
};

export const fetchAssetById = createAsyncThunk(
  "asset/fetchAssetById",
  async (id: string) => {
    const response = await axiosInstance.get(`api/v1/assets/${id}`);
    return response.data;
  }
);

export const fetchWarehouseAssets = createAsyncThunk(
  "asset/fetchWarehouseAssets",
  async (filter: WarehouseAssetFilter) => {
    const response = await axiosInstance.post("api/v1/assets/warehouse/filter", filter);
    return response.data;
  }
);

export const fetchWarehouseUnits = createAsyncThunk(
  "asset/fetchWarehouseUnits",
  async () => {
    const response = await axiosInstance.get("api/v1/assets/warehouse/units");
    return response.data;
  }
);

export const bulkUpdateAssetLocations = createAsyncThunk(
  "asset/bulkUpdateLocations",
  async (updateData: BulkLocationUpdateRequest) => {
    const response = await axiosInstance.post("api/v1/assets/bulk-update-locations", updateData);
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
    clearWarehouseAssets: (state) => {
      state.warehouseAssets = {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
          nextPage: null,
          prevPage: null,
          firstPage: 1,
          lastPage: 1,
        },
      };
    },
    clearWarehouseUnits: (state) => {
      state.warehouseUnits = [];
    },
    clearBulkUpdateResult: (state) => {
      state.bulkUpdateResult = null;
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
      })
      // Fetch warehouse assets
      .addCase(fetchWarehouseAssets.pending, (state) => {
        state.warehouseLoading = true;
        state.error = null;
      })
      .addCase(fetchWarehouseAssets.fulfilled, (state, action) => {
        state.warehouseLoading = false;
        state.warehouseAssets = action.payload;
        state.error = null;
      })
      .addCase(fetchWarehouseAssets.rejected, (state, action) => {
        state.warehouseLoading = false;
        state.error = action.error.message || "Failed to fetch warehouse assets";
      })
      // Fetch warehouse units
      .addCase(fetchWarehouseUnits.pending, (state) => {
        state.unitsLoading = true;
        state.error = null;
      })
      .addCase(fetchWarehouseUnits.fulfilled, (state, action) => {
        state.unitsLoading = false;
        state.warehouseUnits = action.payload;
        state.error = null;
      })
      .addCase(fetchWarehouseUnits.rejected, (state, action) => {
        state.unitsLoading = false;
        state.error = action.error.message || "Failed to fetch warehouse units";
      })
      // Bulk update asset locations
      .addCase(bulkUpdateAssetLocations.pending, (state) => {
        state.bulkUpdateLoading = true;
        state.error = null;
      })
      .addCase(bulkUpdateAssetLocations.fulfilled, (state, action) => {
        state.bulkUpdateLoading = false;
        state.bulkUpdateResult = action.payload;
        state.error = null;
      })
      .addCase(bulkUpdateAssetLocations.rejected, (state, action) => {
        state.bulkUpdateLoading = false;
        state.error = action.error.message || "Failed to update asset locations";
      });
  },
});

export const { clearAsset, clearError, clearWarehouseAssets, clearWarehouseUnits, clearBulkUpdateResult } = assetSlice.actions;

export type { LocationUpdateItem, BulkLocationUpdateRequest, BulkLocationUpdateResult, WarehouseAsset };

export default assetSlice.reducer;
