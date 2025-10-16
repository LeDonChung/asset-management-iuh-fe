import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  Asset,
  AssetBook,
  AssetBookItem,
  AssetBookStatus,
  AssetType,
  BaseFilterRequest,
  PaginatedResponse,
} from "@/types/asset";
import { axiosInstance } from "@/lib/api";
interface AssetBookInventory extends AssetBook {
  assetTypes: [
    {
      type: AssetType;
      items: AssetBookItem[];
    }
  ];
}
export interface AssetBookFilterRequest extends BaseFilterRequest {
  search?: string;
  campusId?: string;
  unitId?: string;
  year?: number;
  roomId?: string;
  assetType?: AssetType;
}
interface AssetBookState {
  assetBookInventory: AssetBookInventory;
  filteredAssetBooks: PaginatedResponse<Asset>;
  currentFilter: AssetBookFilterRequest;
  loading: boolean;
  error: string | null;
}

const initialState: AssetBookState = {
  assetBookInventory: {
    assetTypes: [
      {
        type: AssetType.FIXED_ASSET,
        items: [],
      },
    ],
    id: "",
    unitId: "",
    year: 0,
    status: AssetBookStatus.OPEN,
  },
  filteredAssetBooks: {
    data: [],
    pagination: {
      page: 1,
      limit: 10,
    },
  },
  currentFilter: {
    pagination: {
      currentPage: 1,
      itemsPerPage: 10,
    },
    sorting: [],
  },
  loading: false,
  error: null,
};
export const filterAssetBook = createAsyncThunk(
  "assetBook/filterAssetBook",
  async (filterRequest: AssetBookFilterRequest, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/api/v1/asset-books/assets/filter`,
        filterRequest
      );
      return response.data as PaginatedResponse<Asset>;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
export const getAssetBookInventoryFromUnitIdAndRoomId = createAsyncThunk(
  "assetBook/getAssetBookInventoryFromUnitIdAndRoomId",
  async (params: { unitId: string; roomId: string }) => {
    const response = await axiosInstance.get(
      `/api/v1/asset-books/unit/${params.unitId}/room/${params.roomId}`
    );
    return response.data;
  }
);
const assetBookSlice = createSlice({
  name: "assetBook",
  initialState,
  reducers: {
    currentFilterAssetBook: (state, action) => {
      state.currentFilter = action.payload;
    },
    resetAssetBookFilter: (state) => {
      state.currentFilter = {
        pagination: {
          currentPage: 1,
          itemsPerPage: 10,
        },
        sorting: [],
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(filterAssetBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(filterAssetBook.fulfilled, (state, action) => {
        state.loading = false;
        state.filteredAssetBooks = action.payload;
        // Cập nhật currentFilter từ request được gửi đi
        state.currentFilter = {
          ...state.currentFilter,
          ...action.meta.arg, // action.meta.arg chứa filterRequest đã gửi
        };
        if (state.currentFilter.pagination && action.payload.pagination) {
          state.currentFilter.pagination = {
            ...state.currentFilter.pagination,
            currentPage: action.payload.pagination.page,
            totalItems: action.payload.pagination.total,
            totalPages: action.payload.pagination.totalPages,
            itemsPerPage: action.payload.pagination.limit,
          };
        }
        state.error = null;
      })
      .addCase(filterAssetBook.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as any)?.message || "Failed to filter asset books";
        console.log(action.payload as any);
      });

      builder.addCase(
        getAssetBookInventoryFromUnitIdAndRoomId.fulfilled,
        (state, action) => {
          state.assetBookInventory = action.payload;
        }
      );
  
      builder.addCase(
        getAssetBookInventoryFromUnitIdAndRoomId.rejected,
        (state, action) => {}
      );
  
      builder.addCase(
        getAssetBookInventoryFromUnitIdAndRoomId.pending,
        (state, action) => {}
      );
  },
});

export const { currentFilterAssetBook, resetAssetBookFilter } =
  assetBookSlice.actions;
export default assetBookSlice.reducer;
