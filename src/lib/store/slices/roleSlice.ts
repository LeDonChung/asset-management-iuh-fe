import axiosInstance from "@/lib/api";
import { Role } from "@/types/asset";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";


interface RoleState {
    inventoryRoles: Role[];
    inventoryRolesLoading: boolean;
    inventoryRolesError: string | null;
}

const initialState: RoleState = {
    inventoryRoles: [],
    inventoryRolesLoading: false,
    inventoryRolesError: null
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
    }
})

export const { } = roleSlice.actions
export default roleSlice.reducer
