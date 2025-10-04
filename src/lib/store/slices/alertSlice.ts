import axiosInstance from "@/lib/api";
import { Alert, AlertStatus, User, UserStatus } from "@/types/asset";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface UpdateAlert {
    alertId: string;
    status: AlertStatus;
    note?: string;
    
}

interface AlertState {
    lstAllAlert: any[];
    loading: boolean;
}

const initialState: AlertState = {
    lstAllAlert: [],
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
    reducers: {},
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
    }
});

export const {} = alertSlice.actions;
export default alertSlice.reducer;