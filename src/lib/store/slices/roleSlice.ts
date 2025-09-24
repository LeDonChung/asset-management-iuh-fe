import axiosInstance from "@/lib/api";
import { Role } from "@/types/asset";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";


interface RoleState {
    inventoryRoles: Role[];
    inventoryRolesLoading: boolean;
    inventoryRolesError: string | null;
    loading: boolean;
    allRoles: any[];
}

const initialState: RoleState = {
    inventoryRoles: [],
    inventoryRolesLoading: false,
    inventoryRolesError: null,
    allRoles: [],
    loading: false,
}

export const findAllInventoryRoles = createAsyncThunk(
    'role/findAllInventoryRoles',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/api/v1/roles/inventory')
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const findAllRoles = createAsyncThunk(
    'role/findAllRoles',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/api/v1/roles')
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response.data)
        }
    }
)

const roleSlice = createSlice({
    name: 'role',
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder.addCase(findAllInventoryRoles.pending, (state) => {
            state.inventoryRolesLoading = true;
            state.inventoryRolesError = null;
            state.inventoryRoles = [];
        })
        builder.addCase(findAllInventoryRoles.fulfilled, (state, action) => {
            state.inventoryRolesLoading = false;
            state.inventoryRolesError = null;
            state.inventoryRoles = action.payload;
        })
        builder.addCase(findAllInventoryRoles.rejected, (state, action) => {
            state.inventoryRolesLoading = false;
            state.inventoryRolesError = (action.payload as any).message;
        })

        builder.addCase(findAllRoles.pending, (state) => {
            state.loading = true;
            state.allRoles = [];
        })
        builder.addCase(findAllRoles.fulfilled, (state, action) => {
            state.loading = false;
            state.allRoles = action.payload;
        })
        builder.addCase(findAllRoles.rejected, (state, action) => {
            state.loading = false;
            state.allRoles = [];
        })
    }
})

export const { } = roleSlice.actions
export default roleSlice.reducer
