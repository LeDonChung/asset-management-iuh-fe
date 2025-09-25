import axiosInstance from "@/lib/api";
import { Permission } from "@/types/asset";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface PermissionState {
    allPermission: Permission[];
    loading: boolean;
    error: string | null;
}

const initialState: PermissionState = {
    allPermission: [],
    loading: false,
    error: null,
}

export const findAllPermissions = createAsyncThunk(
    'permission/findAllPermissions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/api/v1/manager-permissions')
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response.data)
        }
    }
)

const permissionSlice = createSlice({
    name: 'permission',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(findAllPermissions.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(findAllPermissions.fulfilled, (state, action) => {
            state.loading = false;
            state.allPermission = action.payload;
        });
        builder.addCase(findAllPermissions.rejected, (state, action) => {
            state.loading = false;
            state.error = typeof action.payload === "string" ? action.payload : JSON.stringify(action.payload);
        });
    }
});

export const {} = permissionSlice.actions;
export default permissionSlice.reducer;