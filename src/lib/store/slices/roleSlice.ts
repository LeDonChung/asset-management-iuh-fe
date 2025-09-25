import axiosInstance from "@/lib/api";
import { Role } from "@/types/asset";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

/**
 * CreateRoleRequest
 * @description Dữ liệu để tạo vai trò mới
 * @property {string} name - Tên của vai trò
 * @property {string[]} permissionIds - Danh sách ID quyền liên quan đến vai trò
 * @example
 * {
 *   "name": "Admin",
 *   "permissionIds": ["perm1", "perm2", "perm3"]
 * }
 */
export interface CreateRoleRequest {
    name: string;
    permissionIds: string[];
}

export interface UpdateRoleRequest extends CreateRoleRequest {
}

/**
 * RoleState
 * @description Trạng thái của slice quản lý vai trò
 * @property {Role[]} inventoryRoles - Danh sách các vai trò dành cho kiểm kê
 * @property {boolean} inventoryRolesLoading - Trạng thái tải các vai trò kiểm kê
 * @property {string | null} inventoryRolesError - Lỗi khi tải các vai trò kiểm kê
 * @property {boolean} loading - Trạng thái tải chung
 * @property {any[]} allRoles - Danh sách tất cả các vai trò
 */
interface RoleState {
    inventoryRoles: Role[];
    inventoryRolesLoading: boolean;
    inventoryRolesError: string | null;
    loading: boolean;
    allRoles: any[];
}

/**
 * initialState
 * @description Trạng thái ban đầu của slice quản lý vai trò
 */
const initialState: RoleState = {
    inventoryRoles: [],
    inventoryRolesLoading: false,
    inventoryRolesError: null,
    allRoles: [],
    loading: false,
}

/**
 * findAllInventoryRoles
 * @description Lấy tất cả các vai trò dành cho kiểm kê
 * @returns Danh sách các vai trò kiểm kê
 */
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

/**
 * findAllRoles
 * @description Lấy tất cả các vai trò
 * @returns Danh sách tất cả vai trò
 */
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

/**
 * createRole
 * @description Tạo vai trò mới
 * @param roleData Dữ liệu để tạo vai trò mới
 * @returns Vai trò đã được tạo
 */
export const createRole = createAsyncThunk(
    'role/createRole',
    async (roleData: CreateRoleRequest, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/api/v1/roles', roleData)
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response.data)
        }
    }
)

/**
 * updateRole
 * @description Cập nhật vai trò theo ID
 * @param roleId ID của vai trò cần cập nhật
 * @param roleData Dữ liệu để cập nhật vai trò
 * @returns Vai trò đã được cập nhật
 */
export const updateRole = createAsyncThunk(
    'role/updateRole',
    async ({roleId, roleData}: {roleId: string, roleData: UpdateRoleRequest}, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/api/v1/roles/${roleId}`, roleData)
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response.data)
        }
    }
)

/**
 * deleteRole
 * @description Xóa vai trò theo ID
 * @param roleId ID của vai trò cần xóa
 * @returns ID của vai trò đã được xóa
 */
export const deleteRole = createAsyncThunk(
    'role/deleteRole',
    async (roleId: string, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/api/v1/roles/${roleId}`)
            return roleId;
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
        // Inventory Roles
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

        // All Roles
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

        // Create Role
        builder.addCase(createRole.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(createRole.fulfilled, (state, action) => {
            state.loading = false;
            state.allRoles.push(action.payload);
        })
        builder.addCase(createRole.rejected, (state, action) => {
            state.loading = false;
        })

        // Update Role
        builder.addCase(updateRole.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(updateRole.fulfilled, (state, action) => {
            state.loading = false;
            const index = state.allRoles.findIndex(role => role.id === action.payload.id);
            if (index !== -1) {
                state.allRoles[index] = action.payload;
            }
        })
        builder.addCase(updateRole.rejected, (state, action) => {
            state.loading = false;
        })

        // Delete Role
        builder.addCase(deleteRole.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(deleteRole.fulfilled, (state, action) => {
            state.loading = false;
            state.allRoles = state.allRoles.filter(role => role.id !== action.payload);
        })
        builder.addCase(deleteRole.rejected, (state, action) => {
            state.loading = false;
        })
    }
})

export const { } = roleSlice.actions
export default roleSlice.reducer
