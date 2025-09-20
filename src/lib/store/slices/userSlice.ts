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
    updateUserLoading: boolean;
    findAllUserInventoryLoading: boolean;
    inventoryCommitteeUsers: any[];
    inventoryCommitteeUsersLoading: boolean;
}

const initialState: UserState = {
    createUserLoading: false,
    updateUserLoading: false,
    findAllUserInventoryLoading: false,
    inventoryCommitteeUsers: [],
    inventoryCommitteeUsersLoading: false,
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
        }
    },
    extraReducers: (builder) => {
        builder.addCase(createUser.pending, (state) => {
            state.createUserLoading = true
        })
        builder.addCase(createUser.fulfilled, (state, action) => {
            state.createUserLoading = false
        })
        builder.addCase(createUser.rejected, (state, action) => {
            state.createUserLoading = false
        })
        builder.addCase(updateUser.pending, (state) => {
            state.updateUserLoading = true
        })
        builder.addCase(updateUser.fulfilled, (state, action) => {
            state.updateUserLoading = false 
        })
        builder.addCase(updateUser.rejected, (state, action) => {
            state.updateUserLoading = false
        })
        builder.addCase(findAllUserInventory.pending, (state) => {
            state.findAllUserInventoryLoading = true
        })
        builder.addCase(findAllUserInventory.fulfilled, (state, action) => {
            state.findAllUserInventoryLoading = false
        })
        builder.addCase(findAllUserInventory.rejected, (state, action) => {
            state.findAllUserInventoryLoading = false
        })
        builder.addCase(getAllInventoryCommitteeUsers.pending, (state) => {
            state.inventoryCommitteeUsersLoading = true
        })
        builder.addCase(getAllInventoryCommitteeUsers.fulfilled, (state, action) => {
            state.inventoryCommitteeUsersLoading = false
            state.inventoryCommitteeUsers = action.payload
        })
        builder.addCase(getAllInventoryCommitteeUsers.rejected, (state, action) => {
            state.inventoryCommitteeUsersLoading = false
        })
    }
})

export const { } = userSlice.actions
export default userSlice.reducer
