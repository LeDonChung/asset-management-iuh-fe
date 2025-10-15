import axiosInstance from "@/lib/api";
import {
  BaseFilterRequest,
  PaginatedResponse,
  Room,
  Unit,
  UnitStatus,
  UnitType,
} from "@/types/asset";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface CreateUnitRequest {
  name: string;
  phone?: string;
  email?: string;
  type: UnitType;
  representativeId?: string;
  parentUnitId?: string;
  status?: UnitStatus;
}

export interface UpdateUnitRequest {
  name?: string;
  phone?: string;
  email?: string;
  type?: UnitType;
  representativeId?: string;
  parentUnitId?: string;
  status?: UnitStatus;
}

export interface UnitFilterRequest extends BaseFilterRequest {
  search?: string;
  statusFilter?: UnitStatus;
  unitTypeFilter?: UnitType;
}

export interface RoomFilterRequest extends BaseFilterRequest {
  search?: string;
  buildingFilter?: string;
  floorFilter?: string;
}

export const createUnit = createAsyncThunk(
  "units/createUnit",
  async (unitData: CreateUnitRequest, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/api/v1/units", unitData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getUnitById = createAsyncThunk(
  "units/getUnitById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/units/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateUnit = createAsyncThunk(
  "units/updateUnit",
  async ({ id, unitData }: { id: string; unitData: UpdateUnitRequest }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/api/v1/units/${id}`, unitData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

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

export const filterRoomByUnitId = createAsyncThunk(
  "units/filterRoomByUnitId",
  async ({ unitId, filterRequest }: { unitId: string; filterRequest: RoomFilterRequest }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/api/v1/rooms/unit/${unitId}/filter`,
        filterRequest
      );
      return response.data as PaginatedResponse<Room>;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

interface UnitState {
  filteredUnits: PaginatedResponse<Unit>;
  currentFilter: UnitFilterRequest;
  filteredRooms: PaginatedResponse<Room>;
  currentRoomFilter: RoomFilterRequest;
  currentRoom: Room | null;
  campuses: Unit[];
  allUnits: Unit[];
  childrenUnits: { [parentId: string]: Unit[] };
  currentUnit: Unit | null;
  loading: boolean;
  error: string | null;
  childrenLoading: boolean;
  childrenError: string | null;
  createUnitLoading: boolean;
  updateUnitLoading: boolean;
  roomsLoading: boolean;
  roomsError: string | null;
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
  filteredRooms: {
    data: [],
    pagination: {
      page: 1,
      limit: 10,
    },
  },
  currentRoomFilter: {
    pagination: {
      currentPage: 1,
      itemsPerPage: 10,
    },
    sorting: [],
  },
  currentRoom: null,
  campuses: [] as Unit[],
  allUnits: [] as Unit[],
  childrenUnits: {},
  currentUnit: null,
  loading: false,
  error: null as string | null,
  childrenLoading: false,
  childrenError: null as string | null,
  createUnitLoading: false,
  updateUnitLoading: false,
  roomsLoading: false,
  roomsError: null as string | null,
};

const unitSlice = createSlice({
  name: "units",
  initialState,
  reducers: {
    currentFilterUnit: (state, action) => {
      state.currentFilter = action.payload
    },
    currentFilterRoom: (state, action) => {
      state.currentRoomFilter = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Create unit
      .addCase(createUnit.pending, (state) => {
        state.createUnitLoading = true;
      })
      .addCase(createUnit.fulfilled, (state, action) => {
        state.createUnitLoading = false;
      })
      .addCase(createUnit.rejected, (state, action) => {
        state.createUnitLoading = false;
      })

      // Get unit by ID
      .addCase(getUnitById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentUnit = null;
      })
      .addCase(getUnitById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUnit = action.payload;
        state.error = null;
      })
      .addCase(getUnitById.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any).message;
        state.currentUnit = null;
      })

      // Update unit
      .addCase(updateUnit.pending, (state) => {
        state.updateUnitLoading = true;
        state.error = null;
      })
      .addCase(updateUnit.fulfilled, (state, action) => {
        state.updateUnitLoading = false;
        state.currentUnit = action.payload;
        state.error = null;
      })
      .addCase(updateUnit.rejected, (state, action) => {
        state.updateUnitLoading = false;
        state.error = (action.payload as any).message;
      })

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
      })

      // Filter rooms by unit ID
      .addCase(filterRoomByUnitId.pending, (state) => {
        state.roomsLoading = true;
        state.roomsError = null;
      })
      .addCase(filterRoomByUnitId.fulfilled, (state, action) => {
        state.roomsLoading = false;
        state.filteredRooms = action.payload;
        // Update currentRoomFilter from request
        state.currentRoomFilter = {
          ...state.currentRoomFilter,
          ...action.meta.arg.filterRequest,
        };
        if (state.currentRoomFilter.pagination && action.payload.pagination) {
          state.currentRoomFilter.pagination = {
            ...state.currentRoomFilter.pagination,
            currentPage: action.payload.pagination.page,
            totalItems: action.payload.pagination.total,
            totalPages: action.payload.pagination.totalPages,
            itemsPerPage: action.payload.pagination.limit,
          };
        }
        state.roomsError = null;
      })
      .addCase(filterRoomByUnitId.rejected, (state, action) => {
        state.roomsLoading = false;
        state.roomsError = (action.payload as any)?.message || "Failed to filter rooms";
        state.filteredRooms = {
          data: [],
          pagination: {
            page: 1,
            limit: 10,
          },
        };
      })

      // Get room by ID
      .addCase(getRoomById.pending, (state) => {
        state.roomsLoading = true;
        state.roomsError = null;
        state.currentRoom = null;
      })
      .addCase(getRoomById.fulfilled, (state, action) => {
        state.roomsLoading = false;
        state.currentRoom = action.payload;
        state.roomsError = null;
      })
      .addCase(getRoomById.rejected, (state, action) => {
        state.roomsLoading = false;
        state.roomsError = (action.payload as any)?.message || "Failed to get room";
        state.currentRoom = null;
      });
  },
});

export const {
  currentFilterUnit,
  currentFilterRoom
} = unitSlice.actions;
export default unitSlice.reducer;
