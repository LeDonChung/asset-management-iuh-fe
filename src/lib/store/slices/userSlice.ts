import axiosInstance from "@/lib/api";
import { User, UserStatus } from "@/types/asset";
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

export interface UpdateUser {
    username: string;
    fullName: string;
    email: string;
    unitId?: string;
    phoneNumber?: string;
    birthDate?: string;
    status: UserStatus;
    roleIds?: string[];
}

export enum FilterOperator {
    EQUALS = "equals",
    CONTAINS = "contains",
    STARTS_WITH = "startsWith",
    ENDS_WITH = "endsWith",
    GREATER_THAN = "gt",
    GREATER_THAN_OR_EQUAL = "gte",
    LESS_THAN = "lt",
    LESS_THAN_OR_EQUAL = "lte",
    IN = "in",
    NOT_IN = "notIn",
    BETWEEN = "between",
}

export enum FieldType {
    TEXT = "text",
    NUMBER = "number",
    DATE = "date",
    SELECT = "select",
    BOOLEAN = "boolean",
}

export enum ConditionLogic {
    AND = "and",
    OR = "or",
    CONTAINS = "contains",
}

export interface FilterCondition {
    field: string;
    fieldType: FieldType;
    operator: FilterOperator;
    value: any[];
    dateFrom?: string;
    dateTo?: string;
    sort?: "asc" | "desc";
}

export interface UserFilterRequest {
    conditionLogic?: ConditionLogic;
    conditions?: FilterCondition[];
    pagination?: {
        currentPage?: number;
        totalItems?: number;
        itemsPerPage?: number;
        totalPages?: number;
    };
    sorting?: Array<{
        field: string;
        direction: string;
        priority: number;
    }>;
    search?: string | null;
    statusFilter?: string[];

}

export interface PaginatedUserResponse {
    data: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
        nextPage: number | null;
        prevPage: number | null;
        firstPage: number;
        lastPage: number;
    }
}

interface UserState {
    createUserLoading: boolean;
    updateUserLoading: boolean;
    findAllUserInventoryLoading: boolean;
    inventoryCommitteeUsers: any[];
    inventoryCommitteeUsersLoading: boolean;
    lstUser: any[];
    // List and filter state
    sessions: any[];
    filteredSessions: PaginatedUserResponse | null;
    filterLoading: boolean;
    filterError: string | null;

    // Current session state
    currentSession: any | null;

    // Current filter state
    currentFilter: UserFilterRequest | null;

    user: User | null;
}

const initialState: UserState = {
    createUserLoading: false,
    updateUserLoading: false,
    findAllUserInventoryLoading: false,
    inventoryCommitteeUsers: [],
    inventoryCommitteeUsersLoading: false,
    lstUser: [],
    // List and filter state
    sessions: [],
    filteredSessions: null,
    filterLoading: false,
    filterError: null,

    // Current session state
    currentSession: null,

    // Current filter state
    currentFilter: {
        conditionLogic: ConditionLogic.AND,
        conditions: [],
        pagination: {
            currentPage: 1,
            itemsPerPage: 5,
            totalItems: 0,
            totalPages: 0,
        },
        sorting: [],
        search: null,
    },

    user: null,
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

export const getAllUser = createAsyncThunk(
    'user/findAllUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/api/v1/users')
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

export const filterUserSessions = createAsyncThunk(
    'user/filterUserSessions',
    async (filterRequest: UserFilterRequest, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/api/v1/users/filter', filterRequest)
            return response.data as PaginatedUserResponse;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
)

export const findUserById = createAsyncThunk(
    'user/findUserById',
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/api/v1/users/${userId}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
)

export const updateUserStatus = createAsyncThunk(
    'user/updateUserStatus',
    async ({ userId, status }: { userId: string; status: UserStatus }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/api/v1/users/${userId}/update-status`, { status });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const deletedUser = createAsyncThunk(
    'user/deleteUser',
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/api/v1/users/${userId}/deleted`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearError: (state) => {
        }
    },
    extraReducers: (builder) => {
        // get danh sach user voi dieu kien loc
        builder.addCase(filterUserSessions.pending, (state) => {
            state.filterLoading = true;
            state.filterError = null;
        });
        builder.addCase(filterUserSessions.fulfilled, (state, action) => {
            state.filterLoading = false;
            state.filterError = null;
            state.filteredSessions = action.payload;

            if (state.currentFilter?.pagination) {
                state.currentFilter.pagination = {
                    ...state.currentFilter.pagination,
                    currentPage: action.payload.pagination.page,
                    totalItems: action.payload.pagination.total,
                    totalPages: action.payload.pagination.totalPages,
                    itemsPerPage: action.payload.pagination.limit,
                };
            }
        });
        builder.addCase(filterUserSessions.rejected, (state, action) => {
            state.filterLoading = false;
            state.filterError = (action.payload as any)?.message || 'Failed to filter sessions';
        });

        // get all user
        builder.addCase(getAllUser.pending, (state) => {
        })
        builder.addCase(getAllUser.fulfilled, (state, action) => {
            state.lstUser = action.payload
        })
        builder.addCase(getAllUser.rejected, (state, action) => {
        })

        // create user
        builder.addCase(createUser.pending, (state) => {
            state.createUserLoading = true
        })
        builder.addCase(createUser.fulfilled, (state, action) => {
            state.createUserLoading = false
        })
        builder.addCase(createUser.rejected, (state, action) => {
            state.createUserLoading = false
        })

        // update user
        builder.addCase(updateUser.pending, (state) => {
            state.updateUserLoading = true
        })
        builder.addCase(updateUser.fulfilled, (state, action) => {
            state.updateUserLoading = false
        })
        builder.addCase(updateUser.rejected, (state, action) => {
            state.updateUserLoading = false
        })

        // find all user inventory
        builder.addCase(findAllUserInventory.pending, (state) => {
            state.findAllUserInventoryLoading = true
        })
        builder.addCase(findAllUserInventory.fulfilled, (state, action) => {
            state.findAllUserInventoryLoading = false
        })
        builder.addCase(findAllUserInventory.rejected, (state, action) => {
            state.findAllUserInventoryLoading = false
        })

        // get all inventory committee users
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

        // get user by id
        builder.addCase(findUserById.pending, (state) => {
            state.user = null;
        })
        builder.addCase(findUserById.fulfilled, (state, action) => {
            state.user = action.payload;
        })
        builder.addCase(findUserById.rejected, (state) => {
            state.user = null;
        })

        // update user status
        builder.addCase(updateUserStatus.pending, (state) => {
            state.updateUserLoading = true;
        })
        builder.addCase(updateUserStatus.fulfilled, (state, action) => {
            state.updateUserLoading = false;
        })
        builder.addCase(updateUserStatus.rejected, (state) => {
            state.updateUserLoading = false;
        })
    }
})

export const { } = userSlice.actions
export default userSlice.reducer
