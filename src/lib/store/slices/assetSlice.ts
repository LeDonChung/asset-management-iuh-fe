import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Asset, AssetFilter, AssetStatus, AssetType, PaginatedResponse, BaseFilterRequest } from "@/types/asset";
import { axiosInstance } from "@/lib/api";
import toast from "react-hot-toast";

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

// Unidentified asset types
interface UnidentifiedAssetFilter extends BaseFilterRequest {
  type?: AssetType;
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
  unidentifiedAssets: PaginatedResponse<Asset>;
  warehouseAssets: PaginatedResponse<WarehouseAsset>;
  warehouseUnits: { id: string; name: string; unitCode: number }[];
  bulkUpdateResult: BulkLocationUpdateResult | null;
  loading: boolean;
  unidentifiedLoading: boolean;
  warehouseLoading: boolean;
  unitsLoading: boolean;
  bulkUpdateLoading: boolean;
  error: string | null;
}

const initialState: AssetState = {
  asset: null,
  unidentifiedAssets: {
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
  unidentifiedLoading: false,
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

export const fetchUnidentifiedAssets = createAsyncThunk(
  "asset/fetchUnidentifiedAssets",
  async (filter: UnidentifiedAssetFilter) => {
    const response = await axiosInstance.post("api/v1/assets/unidentified", filter);
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

export const proposeAssetLiquidation = createAsyncThunk(
  "asset/proposeLiquidation",
  async ({ id, note }: { id: string; note?: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`api/v1/assets/${id}/propose-liquidation`, { note });
      toast.success("Đã đề xuất thanh lý tài sản");
      return response.data as Asset;
    } catch (error: any) {
      const message = error?.response?.data?.message || "Đề xuất thanh lý thất bại";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const createAsset = createAsyncThunk(
  "asset/createAsset",
  async (assetData: {
    name: string;
    specs?: string;
    entrydate: string;
    currentRoomId?: string;
    locationInRoom?: string;
    unit: string;
    quantity?: number;
    origin?: string;
    purchasePackage?: number;
    type: AssetType;
    categoryId: string;
    rfid?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("api/v1/assets", assetData);
      toast.success(`Tạo tài sản thành công! Mã KT: ${response.data.ktCode}, Mã TSCD: ${response.data.fixedCode}`);
      return response.data as Asset;
    } catch (error: any) {
      const message = error?.response?.data?.message || "Tạo tài sản thất bại";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateAsset = createAsyncThunk(
  "asset/updateAsset",
  async ({ id, data }: {
    id: string;
    data: {
      name?: string;
      specs?: string;
      entrydate?: string;
      currentRoomId?: string;
      locationInRoom?: string;
      unit?: string;
      quantity?: number;
      origin?: string;
      purchasePackage?: number;
      type?: AssetType;
      categoryId?: string;
      rfid?: string;
    };
  }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`api/v1/assets/${id}`, data);
      toast.success("Cập nhật tài sản thành công!");
      return response.data as Asset;
    } catch (error: any) {
      const message = error?.response?.data?.message || "Cập nhật tài sản thất bại";
      toast.error(message);
      return rejectWithValue(message);
    }
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
    clearUnidentifiedAssets: (state) => {
      state.unidentifiedAssets = {
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
      // Fetch unidentified assets
      .addCase(fetchUnidentifiedAssets.pending, (state) => {
        state.unidentifiedLoading = true;
        state.error = null;
      })
      .addCase(fetchUnidentifiedAssets.fulfilled, (state, action) => {
        state.unidentifiedLoading = false;
        state.unidentifiedAssets = action.payload;
        state.error = null;
      })
      .addCase(fetchUnidentifiedAssets.rejected, (state, action) => {
        state.unidentifiedLoading = false;
        state.error = action.error.message || "Failed to fetch unidentified assets";
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
      })
      // Propose liquidation
      .addCase(proposeAssetLiquidation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(proposeAssetLiquidation.fulfilled, (state, action) => {
        state.loading = false;
        // If we have this asset loaded, update it
        if (state.asset && state.asset.id === action.payload.id) {
          state.asset = action.payload as any;
        }
        state.error = null;
      })
      .addCase(proposeAssetLiquidation.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to propose liquidation";
      })
      // Create asset
      .addCase(createAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAsset.fulfilled, (state, action) => {
        state.loading = false;
        state.asset = action.payload as any;
        state.error = null;
      })
      .addCase(createAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to create asset";
      })
      // Update asset
      .addCase(updateAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAsset.fulfilled, (state, action) => {
        state.loading = false;
        state.asset = action.payload as any;
        state.error = null;
      })
      .addCase(updateAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to update asset";
      });
  },
});

export const { clearAsset, clearError, clearUnidentifiedAssets, clearWarehouseAssets, clearWarehouseUnits, clearBulkUpdateResult } = assetSlice.actions;

export type { UnidentifiedAssetFilter, LocationUpdateItem, BulkLocationUpdateRequest, BulkLocationUpdateResult, WarehouseAsset };

export default assetSlice.reducer;
