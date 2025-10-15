import axiosInstance from "@/lib/api";
import {
  BaseFilterRequest,
  PaginatedResponse,
  User,
  UserStatus,
} from "@/types/asset";
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

export interface UserFilterRequest extends BaseFilterRequest {
  search?: string | null;
  statusFilter?: string;
  unitFilter?: string;
}

interface UserState {
  createUserLoading: boolean;
  updateUserLoading: boolean;
  findAllUserInventoryLoading: boolean;
  inventoryCommitteeUsers: any[];
  inventoryCommitteeUsersLoading: boolean;
  lstUser: any[];
  usersWithoutUnit: User[];
  usersWithoutUnitLoading: boolean;

  filteredUsers: PaginatedResponse<User>;
  currentFilter: UserFilterRequest;

  user: User | null;
}

const initialState: UserState = {
  createUserLoading: false,
  updateUserLoading: false,
  findAllUserInventoryLoading: false,
  inventoryCommitteeUsers: [],
  inventoryCommitteeUsersLoading: false,
  lstUser: [],
  usersWithoutUnit: [],
  usersWithoutUnitLoading: false,
  user: null,
  filteredUsers: {
    data: [],
    pagination: {
      page: 2,
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
};

export const createUser = createAsyncThunk(
  "user/createUser",
  async (userData: CreateUser, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/api/v1/users", userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateUser = createAsyncThunk(
  "user/updateUser",
  async (
    { id, userData }: { id: string; userData: UpdateUser },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.patch(
        `/api/v1/users/${id}`,
        userData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getAllUser = createAsyncThunk(
  "user/findAllUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/v1/users");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const findAllUserInventory = createAsyncThunk(
  "user/findAllUserInventory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/v1/users/inventory");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getAllInventoryCommitteeUsers = createAsyncThunk(
  "user/getAllInventoryCommitteeUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        "/api/v1/users/inventory-committee"
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getUsersWithoutUnit = createAsyncThunk(
  "user/getUsersWithoutUnit",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/v1/users/without-unit");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const filterUser = createAsyncThunk(
  "user/filterUser",
  async (filterRequest: UserFilterRequest, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/api/v1/users/filter",
        filterRequest
      );
      return response.data as PaginatedResponse<User>;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const findUserById = createAsyncThunk(
  "user/findUserById",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/users/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  "user/updateUserStatus",
  async (
    { userId, status }: { userId: string; status: UserStatus },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.patch(
        `/api/v1/users/${userId}/update-status`,
        { status }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deletedUser = createAsyncThunk(
  "user/deleteUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/api/v1/users/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    currentFilterUser: (state, action) => {
      state.currentFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    // get all user
    builder.addCase(getAllUser.pending, (state) => {});
    builder.addCase(getAllUser.fulfilled, (state, action) => {
      state.lstUser = action.payload;
    });
    builder.addCase(getAllUser.rejected, (state, action) => {});

    // create user
    builder.addCase(createUser.pending, (state) => {
      state.createUserLoading = true;
    });
    builder.addCase(createUser.fulfilled, (state, action) => {
      state.createUserLoading = false;
    });
    builder.addCase(createUser.rejected, (state, action) => {
      state.createUserLoading = false;
    });

    // update user
    builder.addCase(updateUser.pending, (state) => {
      state.updateUserLoading = true;
    });
    builder.addCase(updateUser.fulfilled, (state, action) => {
      state.updateUserLoading = false;
    });
    builder.addCase(updateUser.rejected, (state, action) => {
      state.updateUserLoading = false;
    });

    // find all user inventory
    builder.addCase(findAllUserInventory.pending, (state) => {
      state.findAllUserInventoryLoading = true;
    });
    builder.addCase(findAllUserInventory.fulfilled, (state, action) => {
      state.findAllUserInventoryLoading = false;
    });
    builder.addCase(findAllUserInventory.rejected, (state, action) => {
      state.findAllUserInventoryLoading = false;
    });

    // get all inventory committee users
    builder.addCase(getAllInventoryCommitteeUsers.pending, (state) => {
      state.inventoryCommitteeUsersLoading = true;
    });
    builder.addCase(
      getAllInventoryCommitteeUsers.fulfilled,
      (state, action) => {
        state.inventoryCommitteeUsersLoading = false;
        state.inventoryCommitteeUsers = action.payload;
      }
    );
    builder.addCase(getAllInventoryCommitteeUsers.rejected, (state, action) => {
      state.inventoryCommitteeUsersLoading = false;
    });

    // get users without unit
    builder.addCase(getUsersWithoutUnit.pending, (state) => {
      state.usersWithoutUnitLoading = true;
    });
    builder.addCase(getUsersWithoutUnit.fulfilled, (state, action) => {
      state.usersWithoutUnitLoading = false;
      state.usersWithoutUnit = action.payload;
    });
    builder.addCase(getUsersWithoutUnit.rejected, (state, action) => {
      state.usersWithoutUnitLoading = false;
    });

    // get user by id
    builder.addCase(findUserById.pending, (state) => {
      state.user = null;
    });
    builder.addCase(findUserById.fulfilled, (state, action) => {
      state.user = action.payload;
    });
    builder.addCase(findUserById.rejected, (state) => {
      state.user = null;
    });

    // update user status
    builder.addCase(updateUserStatus.pending, (state) => {
      state.updateUserLoading = true;
    });
    builder.addCase(updateUserStatus.fulfilled, (state, action) => {
      state.updateUserLoading = false;
    });
    builder.addCase(updateUserStatus.rejected, (state) => {
      state.updateUserLoading = false;
    });
    builder
      .addCase(filterUser.pending, (state) => {})
      .addCase(filterUser.fulfilled, (state, action) => {
        state.filteredUsers = action.payload;
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
      })
      .addCase(filterUser.rejected, (state, action) => {
        console.log(action.payload as any);
      });
  }, 
});

export const { currentFilterUser } = userSlice.actions;
export default userSlice.reducer;
