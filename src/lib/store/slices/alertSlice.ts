import axiosInstance from "@/lib/api";
import {
  Alert,
  AlertStatus,
  BaseFilterRequest,
  PaginatedResponse,
  User,
  UserStatus,
} from "@/types/asset";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface AlertFilterRequest extends BaseFilterRequest {
  search?: string;
  statusFilter?: AlertStatus;
  createdFrom?: string;
  createdTo?: string;
}

export interface UpdateAlert {
    alertId: string;
    status: AlertStatus;
    note?: string;
    
}

interface AlertState {
    lstAllAlert: Alert[];
    filteredAlerts: PaginatedResponse<Alert>;
    currentFilter: AlertFilterRequest;
    loading: boolean;
}

const initialState: AlertState = {
    lstAllAlert: [],
    filteredAlerts: {
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
};

export const fetchAllAlert = createAsyncThunk(
    "alerts/findAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/api/v1/alerts");
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const filterAlert = createAsyncThunk(
    "alerts/filter",
    async (filterRequest: AlertFilterRequest, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(
                "/api/v1/alerts/filter",
                filterRequest
            );
            return response.data as PaginatedResponse<Alert>;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const createAlertResolution = createAsyncThunk(
    "alerts/createAlertResolution",
    async (data: UpdateAlert, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/api/v1/alerts/${data.alertId}/resolve`, {
                status: data.status,
                note: data.note
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

const alertSlice = createSlice({
    name: "alerts",
    initialState,
    reducers: {
        currentFilterAlert: (state, action) => {
            state.currentFilter = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchAllAlert.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchAllAlert.fulfilled, (state, action) => {
            state.loading = false;
            state.lstAllAlert = action.payload;
        });
        builder.addCase(fetchAllAlert.rejected, (state) => {
            state.loading = false;
        });

        builder.addCase(createAlertResolution.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(createAlertResolution.fulfilled, (state, action) => {
            state.loading = false;
            const index = state.lstAllAlert.findIndex(alert => alert.id === action.payload.id);
            if (index !== -1) {
                state.lstAllAlert[index] = action.payload;
            } else {
                state.lstAllAlert.unshift(action.payload);
            }
        });
        builder.addCase(createAlertResolution.rejected, (state) => {
            state.loading = false;
        });

        // Filter alerts
        builder.addCase(filterAlert.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(filterAlert.fulfilled, (state, action) => {
            state.loading = false;
            state.filteredAlerts = action.payload;
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
        });
        builder.addCase(filterAlert.rejected, (state, action) => {
            state.loading = false;
            console.log(action.payload as any);
        });
    }
});

export const { currentFilterAlert } = alertSlice.actions;
export default alertSlice.reducer;