import axiosInstance from "@/lib/api";
import { UserStatus } from "@/types/asset";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface CreateUser {
    username: string;
    password: string;
    fullName: string;
    email: string;
    unitId?: string;
    phoneNumber?: string;
    birthDate?: string;
    status: UserStatus;
    roleIds?: string[];
}

export interface UpdateUser extends CreateUser {
}

interface UserState {
    createUserLoading: boolean;
    createUserError: string | null;
    updateUserLoading: boolean;
    updateUserError: string | null;
    findAllUserInventoryLoading: boolean;
    findAllUserInventoryError: string | null;
    inventoryCommitteeUsers: any[];
    inventoryCommitteeUsersLoading: boolean;
    inventoryCommitteeUsersError: string | null;
}

const initialState: UserState = {
    createUserLoading: false,
    createUserError: null,
    updateUserLoading: false,
    updateUserError: null,
    findAllUserInventoryLoading: false,
    findAllUserInventoryError: null,
    inventoryCommitteeUsers: [],
    inventoryCommitteeUsersLoading: false,
    inventoryCommitteeUsersError: null
}

export const createUser = createAsyncThunk(
    'user/createUser',
    async (userData: CreateUser, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/api/v1/users', userData)
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const updateUser = createAsyncThunk(
    'user/updateUser',
    async ({ id, userData }: { id: string; userData: UpdateUser }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/api/v1/users/${id}`, userData)
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const findAllUserInventory = createAsyncThunk(
    'user/findAllUserInventory',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/api/v1/users/inventory')
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const getAllInventoryCommitteeUsers = createAsyncThunk(
    'user/getAllInventoryCommitteeUsers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/api/v1/users/inventory-committee')
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response.data)
        }
    }
)

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearError: (state) => {
            state.createUserError = null
            state.updateUserError = null
            state.findAllUserInventoryError = null
            state.inventoryCommitteeUsersError = null
        }
    },
    extraReducers: (builder) => {
        builder.addCase(createUser.pending, (state) => {
            state.createUserLoading = true
            state.createUserError = null
        })
        builder.addCase(createUser.fulfilled, (state, action) => {
            state.createUserLoading = false
            state.createUserError = null
        })
        builder.addCase(createUser.rejected, (state, action) => {
            state.createUserLoading = false
            state.createUserError = (action.payload as any).message;
        })
        builder.addCase(updateUser.pending, (state) => {
            state.updateUserLoading = true
            state.updateUserError = null
        })
        builder.addCase(updateUser.fulfilled, (state, action) => {
            state.updateUserLoading = false
            state.updateUserError = null
        })
        builder.addCase(updateUser.rejected, (state, action) => {
            state.updateUserLoading = false
            state.updateUserError = (action.payload as any).message;
        })
        builder.addCase(findAllUserInventory.pending, (state) => {
            state.findAllUserInventoryLoading = true
            state.findAllUserInventoryError = null
        })
        builder.addCase(findAllUserInventory.fulfilled, (state, action) => {
            state.findAllUserInventoryLoading = false
            state.findAllUserInventoryError = null
        })
        builder.addCase(findAllUserInventory.rejected, (state, action) => {
            state.findAllUserInventoryLoading = false
            state.findAllUserInventoryError = (action.payload as any).message;
        })
        builder.addCase(getAllInventoryCommitteeUsers.pending, (state) => {
            state.inventoryCommitteeUsersLoading = true
            state.inventoryCommitteeUsersError = null
        })
        builder.addCase(getAllInventoryCommitteeUsers.fulfilled, (state, action) => {
            state.inventoryCommitteeUsersLoading = false
            state.inventoryCommitteeUsersError = null
            state.inventoryCommitteeUsers = action.payload
        })
        builder.addCase(getAllInventoryCommitteeUsers.rejected, (state, action) => {
            state.inventoryCommitteeUsersLoading = false
            state.inventoryCommitteeUsersError = (action.payload as any).message;
        })
    }
})

export const { clearError } = userSlice.actions
export default userSlice.reducer
