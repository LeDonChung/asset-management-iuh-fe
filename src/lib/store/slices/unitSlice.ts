import axiosInstance from "@/lib/api";
import { Unit } from "@/types/asset";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

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
      const response = await axiosInstance.get(`/api/v1/units/${parentId}/children`);
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

interface UnitState {
  campuses: Unit[];
  allUnits: Unit[];
  childrenUnits: { [parentId: string]: Unit[] };
  loading: boolean;
  error: string | null;
  childrenLoading: boolean;
  childrenError: string | null;
}

const initialState: UnitState = {
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
  reducers: {},
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
      });
  },
});
export default unitSlice.reducer;
