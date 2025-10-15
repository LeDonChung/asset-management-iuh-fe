import axiosInstance from "@/lib/api";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Room, RoomStatus } from "@/types/asset";

interface CreateRoomData {
  name: string;
  building: string;
  floor: string;
  roomNumber: string;
  unitId: string;
  status?: RoomStatus;
  adjacentRoomIds?: string[];
}

interface UpdateRoomData {
  id: string;
  name: string;
  building: string;
  floor: string;
  roomNumber: string;
  unitId: string;
  status?: RoomStatus;
  adjacentRoomIds?: string[];
}

interface RoomState {
  rooms: Room[];
  currentRoom: Room | null;
  loading: boolean;
  error: string | null;
  createLoading: boolean;
  createError: string | null;
  updateLoading: boolean;
  updateError: string | null;
  suggestions: Room[];
  suggestionsLoading: boolean;
}

const initialState: RoomState = {
  rooms: [],
  currentRoom: null,
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
  updateLoading: false,
  updateError: null,
  suggestions: [],
  suggestionsLoading: false,
}

// Async thunks
export const createRoom = createAsyncThunk(
  'room/create',
  async (roomData: CreateRoomData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/v1/rooms', roomData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra khi tạo phòng');
    }
  }
);

export const updateRoom = createAsyncThunk(
  'room/update',
  async (roomData: UpdateRoomData, { rejectWithValue }) => {
    try {
      const { id, ...updateData } = roomData;
      const response = await axiosInstance.put(`/api/v1/rooms/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật phòng');
    }
  }
);

export const fetchRoomById = createAsyncThunk(
  'room/fetchById',
  async (roomId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/rooms/${roomId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra khi lấy thông tin phòng');
    }
  }
);

export const fetchRoomsByUnitId = createAsyncThunk(
  'room/fetchByUnitId',
  async (unitId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/units/${unitId}/rooms`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách phòng');
    }
  }
);

export const fetchAllRooms = createAsyncThunk(
  'room/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/v1/rooms');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách phòng');
    }
  }
);

export const fetchRoomSuggestions = createAsyncThunk(
  'room/fetchSuggestions',
  async (params: { building?: string; floor?: string; excludeUnitId?: string }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.building) queryParams.append('building', params.building);
      if (params.floor) queryParams.append('floor', params.floor);
      if (params.excludeUnitId) queryParams.append('excludeUnitId', params.excludeUnitId);
      
      const response = await axiosInstance.get(`/api/v1/rooms/suggestions?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra khi lấy gợi ý phòng');
    }
  }
);

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
    },
    clearCurrentRoom: (state) => {
      state.currentRoom = null;
    },
  },
  extraReducers: (builder) => {
    // Create room
    builder
      .addCase(createRoom.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.createLoading = false;
        state.rooms.unshift(action.payload);
        state.currentRoom = action.payload;
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload as string;
      })
      
    // Update room
    builder
      .addCase(updateRoom.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.rooms.findIndex(room => room.id === action.payload.id);
        if (index !== -1) {
          state.rooms[index] = action.payload;
        }
        state.currentRoom = action.payload;
      })
      .addCase(updateRoom.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      })
      
    // Fetch room by ID
    builder
      .addCase(fetchRoomById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoomById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRoom = action.payload;
      })
      .addCase(fetchRoomById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
    // Fetch rooms by unit ID
    builder
      .addCase(fetchRoomsByUnitId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoomsByUnitId.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchRoomsByUnitId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
    // Fetch all rooms
    builder
      .addCase(fetchAllRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchAllRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
    // Fetch room suggestions
    builder
      .addCase(fetchRoomSuggestions.pending, (state) => {
        state.suggestionsLoading = true;
      })
      .addCase(fetchRoomSuggestions.fulfilled, (state, action) => {
        state.suggestionsLoading = false;
        state.suggestions = action.payload;
      })
      .addCase(fetchRoomSuggestions.rejected, (state, action) => {
        state.suggestionsLoading = false;
        state.suggestions = [];
      });
  }
})

export const { clearError, clearCurrentRoom } = roomSlice.actions;
export default roomSlice.reducer;
