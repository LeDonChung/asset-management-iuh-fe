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

export interface CreateAssetBookFromInventoryRequest {
  assignmentId: string;
  year: number;
  roomIds?: string[];
  note?: string;
}

export interface CreateAssetBookFromInventoryResponse extends AssetBook {
}
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
  currentAssetBook: AssetBook | null;
  assetBooksByUnit: AssetBook[];
  loading: boolean;
  error: string | null;
  isExporting: boolean;
  exportError: string | null;
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
  currentAssetBook: null,
  assetBooksByUnit: [],
  loading: false,
  error: null,
  isExporting: false,
  exportError: null,
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

/**
 * Tạo sổ tài sản từ kết quả kiểm kê của đơn vị phân công
 */
export const createAssetBookFromInventory = createAsyncThunk(
  "assetBook/createAssetBookFromInventory",
  async (request: CreateAssetBookFromInventoryRequest, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/api/v1/asset-books/create-from-inventory`,
        request
      );
      return response.data as CreateAssetBookFromInventoryResponse;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Lấy sổ tài sản theo ID
 */
export const getAssetBook = createAsyncThunk(
  "assetBook/getAssetBook",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/asset-books/${id}`);
      return response.data as AssetBook;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Lấy danh sách sổ tài sản theo đơn vị
 */
export const getAssetBooksByUnit = createAsyncThunk(
  "assetBook/getAssetBooksByUnit",
  async (unitId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/asset-books/unit/${unitId}`);
      return response.data as AssetBook[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Lấy sổ tài sản theo đơn vị và năm
 */
export const getAssetBookByUnitAndYear = createAsyncThunk(
  "assetBook/getAssetBookByUnitAndYear",
  async (params: { unitId: string; year: number }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/api/v1/asset-books/unit/${params.unitId}/year/${params.year}`
      );
      return response.data as AssetBook;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Lấy sổ tài sản hiện tại của đơn vị
 */
export const getCurrentAssetBookByUnit = createAsyncThunk(
  "assetBook/getCurrentAssetBookByUnit",
  async (unitId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/asset-books/unit/${unitId}/current`);
      return response.data as AssetBook;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Lấy sổ tài sản theo đơn vị, phòng và loại tài sản
 */
export const getAssetBookByUnitAndRoom = createAsyncThunk(
  "assetBook/getAssetBookByUnitAndRoom",
  async (
    params: { unitId: string; roomId: string; assetType?: string },
    { rejectWithValue }
  ) => {
    try {
      const url = `/api/v1/asset-books/unit/${params.unitId}/room/${params.roomId}`;
      const queryParams = params.assetType ? { assetType: params.assetType } : {};
      const response = await axiosInstance.get(url, { params: queryParams });
      return response.data as AssetBook;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Xuất sổ tài sản ra file Excel
 */
export const exportAssetBookToExcel = createAsyncThunk(
  "assetBook/exportAssetBookToExcel",
  async (
    params: { type: AssetType; unitId: string; year: number },
    { rejectWithValue }
  ) => {
    try {
      console.log("Exporting asset book to Excel:", params);
      const response = await axiosInstance.get(
        `/api/v1/asset-books/export/excel`,
        {
          params: {
            type: params.type,
            unitId: params.unitId,
            year: params.year,
          },
          responseType: 'blob', // Important for file download
        }
      );

      // Create blob and download
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const assetTypeText = params.type === AssetType.FIXED_ASSET ? 'TaiSanCoDinh' : 'CongCuDungCu';
      const filename = `So_Tai_San_${assetTypeText}_${params.year}.xlsx`;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("Export asset book to Excel successful");
      return { success: true, filename };
    } catch (error: any) {
      console.error("Export asset book to Excel error:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
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
          state.loading = false;
          state.assetBookInventory = action.payload;
          state.error = null;
        }
      );
  
      builder.addCase(
        getAssetBookInventoryFromUnitIdAndRoomId.rejected,
        (state, action) => {
          state.loading = false;
          state.error = (action.payload as any)?.message || "Failed to get asset book inventory";
        }
      );
  
      builder.addCase(
        getAssetBookInventoryFromUnitIdAndRoomId.pending,
        (state, action) => {
          state.loading = true;
          state.error = null;
        }
      );

      // createAssetBookFromInventory
      builder
        .addCase(createAssetBookFromInventory.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(createAssetBookFromInventory.fulfilled, (state, action) => {
          state.loading = false;
          state.currentAssetBook = action.payload;
          state.error = null;
        })
        .addCase(createAssetBookFromInventory.rejected, (state, action) => {
          state.loading = false;
          state.error = (action.payload as any)?.message || "Failed to create asset book from inventory";
        });

      // getAssetBook
      builder
        .addCase(getAssetBook.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(getAssetBook.fulfilled, (state, action) => {
          state.loading = false;
          state.currentAssetBook = action.payload;
          state.error = null;
        })
        .addCase(getAssetBook.rejected, (state, action) => {
          state.loading = false;
          state.error = (action.payload as any)?.message || "Failed to get asset book";
        });

      // getAssetBooksByUnit
      builder
        .addCase(getAssetBooksByUnit.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(getAssetBooksByUnit.fulfilled, (state, action) => {
          state.loading = false;
          state.assetBooksByUnit = action.payload;
          state.error = null;
        })
        .addCase(getAssetBooksByUnit.rejected, (state, action) => {
          state.loading = false;
          state.error = (action.payload as any)?.message || "Failed to get asset books by unit";
        });

      // getAssetBookByUnitAndYear
      builder
        .addCase(getAssetBookByUnitAndYear.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(getAssetBookByUnitAndYear.fulfilled, (state, action) => {
          state.loading = false;
          state.currentAssetBook = action.payload;
          state.error = null;
        })
        .addCase(getAssetBookByUnitAndYear.rejected, (state, action) => {
          state.loading = false;
          state.error = (action.payload as any)?.message || "Failed to get asset book by unit and year";
        });

      // getCurrentAssetBookByUnit
      builder
        .addCase(getCurrentAssetBookByUnit.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(getCurrentAssetBookByUnit.fulfilled, (state, action) => {
          state.loading = false;
          state.currentAssetBook = action.payload;
          state.error = null;
        })
        .addCase(getCurrentAssetBookByUnit.rejected, (state, action) => {
          state.loading = false;
          state.error = (action.payload as any)?.message || "Failed to get current asset book by unit";
        });

      // getAssetBookByUnitAndRoom
      builder
        .addCase(getAssetBookByUnitAndRoom.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(getAssetBookByUnitAndRoom.fulfilled, (state, action) => {
          state.loading = false;
          state.currentAssetBook = action.payload;
          state.error = null;
        })
        .addCase(getAssetBookByUnitAndRoom.rejected, (state, action) => {
          state.loading = false;
          state.error = (action.payload as any)?.message || "Failed to get asset book by unit and room";
        });

      // exportAssetBookToExcel
      builder
        .addCase(exportAssetBookToExcel.pending, (state) => {
          state.isExporting = true;
          state.exportError = null;
        })
        .addCase(exportAssetBookToExcel.fulfilled, (state, action) => {
          state.isExporting = false;
          state.exportError = null;
        })
        .addCase(exportAssetBookToExcel.rejected, (state, action) => {
          state.isExporting = false;
          state.exportError = (action.payload as any)?.message || "Failed to export asset book to Excel";
        });
  },
});

export const { currentFilterAssetBook, resetAssetBookFilter } =
  assetBookSlice.actions;
export default assetBookSlice.reducer;
