import axiosInstance from "@/lib/api";
import {
  BaseFilterRequest,
  PaginatedResponse,
  Unit,
  UnitStatus,
  UnitType,
} from "@/types/asset";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { log } from "console";
export interface UnitFilterRequest extends BaseFilterRequest {
  search?: string;
  statusFilter?: UnitStatus;
  unitTypeFilter?: UnitType;
}

export const getUnitCampus = createAsyncThunk(
  "units/getUnitCampus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/v1/units/campuses");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getUnitChildren = createAsyncThunk(
  "units/getUnitChildren",
  async (parentId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/api/v1/units/${parentId}/children`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getAllUnits = createAsyncThunk(
  "units/getAllUnits",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/v1/units");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getRoomById = createAsyncThunk(
  "units/getRoomById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/rooms/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const filterUnit = createAsyncThunk(
  "units/filter",
  async (filterRequest: UnitFilterRequest, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/api/v1/units/filter",
        filterRequest
      );
      return response.data as PaginatedResponse<Unit>;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

interface UnitState {
  filteredUnits: PaginatedResponse<Unit>;
  currentFilter: UnitFilterRequest;
  campuses: Unit[];
  allUnits: Unit[];
  childrenUnits: { [parentId: string]: Unit[] };
  loading: boolean;
  error: string | null;
  childrenLoading: boolean;
  childrenError: string | null;
}

const initialState: UnitState = {
  filteredUnits: {
    data: [],
    pagination: {
      page: 2,
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
  campuses: [] as Unit[],
  allUnits: [] as Unit[],
  childrenUnits: {},
  loading: false,
  error: null as string | null,
  childrenLoading: false,
  childrenError: null as string | null,
};

const unitSlice = createSlice({
  name: "units",
  initialState,
  reducers: {
    currentFilterUnit: (state, action) => {
      state.currentFilter = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Get campuses
      .addCase(getUnitCampus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUnitCampus.fulfilled, (state, action) => {
        state.loading = false;
        state.campuses = action.payload;
        state.error = null;
      })
      .addCase(getUnitCampus.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any).message;
        state.campuses = [];
      })

      // Get all units
      .addCase(getAllUnits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUnits.fulfilled, (state, action) => {
        state.loading = false;
        state.allUnits = action.payload;
        state.error = null;
      })
      .addCase(getAllUnits.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any).message;
        state.allUnits = [];
      })

      // Get unit children
      .addCase(getUnitChildren.pending, (state) => {
        state.childrenLoading = true;
        state.childrenError = null;
      })
      .addCase(getUnitChildren.fulfilled, (state, action) => {
        state.childrenLoading = false;
        // Store children by parent ID
        const parentId = action.meta.arg;
        state.childrenUnits[parentId] = action.payload;
        state.childrenError = null;
      })
      .addCase(getUnitChildren.rejected, (state, action) => {
        state.childrenLoading = false;
        state.childrenError = (action.payload as any).message;
      })
      .addCase(filterUnit.pending, (state) => {})
      .addCase(filterUnit.fulfilled, (state, action) => {
        state.filteredUnits = action.payload;
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
      })
      .addCase(filterUnit.rejected, (state, action) => {
        console.log(action.payload as any);
      });
  },
});

export const {
  currentFilterUnit
} = unitSlice.actions;
export default unitSlice.reducer;
