import axiosInstance from "@/lib/api";
import {
  InventorySessionStatus,
  InventorySubCommittee,
  InventoryGroup,
  InventorySession,
  InventoryGroupAssignment,
  Room,
} from "@/types/asset";
import { 
  SubmitInventoryResultRequest, 
  SubmitInventoryResultResponse,
  AssetActionStatus,
  ScanMethod
} from "@/lib/api/inventoryApi";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Backend filter enums and types (matching AdvancedFilter)
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

// Types for filter system
export interface FilterCondition {
  field: string;
  fieldType: FieldType;
  operator: FilterOperator;
  value: any[];
  dateFrom?: string;
  dateTo?: string;
  sort?: "asc" | "desc";
}

export interface InventoryFilterRequest {
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
  yearFilter?: number[];
  isGlobalFilter?: boolean;
}

export interface PaginatedInventoryResponse {
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
  };
}

interface InventoryState {
  // List and filter state
  sessions: any[];
  filteredSessions: PaginatedInventoryResponse | null;
  filterLoading: boolean;
  filterError: string | null;

  // Current session state
  currentSession: any | null;

  // Current filter state
  currentFilter: InventoryFilterRequest;

  // Sub committee state
  subCommittees: InventorySubCommittee[];
  subCommitteeLoading: boolean;
  createSubCommitteeLoading: boolean;
  updateSubCommitteeLoading: boolean;
  deleteSubCommitteeLoading: boolean;

  // Group state
  groups: InventoryGroup[];
  groupLoading: boolean;
  createGroupLoading: boolean;
  updateGroupLoading: boolean;
  deleteGroupLoading: boolean;

  // Legacy states
  loading: boolean;
  error: string | null;
  createSessionLoading: boolean;
  findByIdLoading: boolean;
  updateStatusLoading: boolean;
  createMemberLoading: boolean;
  deleteSessionLoading: boolean;

  // Inventory perform states
  assignedInventories: InventorySession[];
  assignedGroups: InventoryGroupAssignment[];
  unitRooms: Room[];

  // Submit result states
  submitResultLoading: boolean;
  submitResultError: string | null;
  lastSubmittedResult: any | null;
}

const initialState: InventoryState = {
  // List and filter state
  sessions: [],
  filteredSessions: null,
  filterLoading: false,
  filterError: null,
  createMemberLoading: false,

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

  // Sub committee state
  subCommittees: [],
  subCommitteeLoading: false,
  createSubCommitteeLoading: false,
  updateSubCommitteeLoading: false,
  deleteSubCommitteeLoading: false,

  // Group state
  groups: [],
  groupLoading: false,
  createGroupLoading: false,
  updateGroupLoading: false,
  deleteGroupLoading: false,

  // Legacy states
  loading: false,
  error: null,
  createSessionLoading: false,
  findByIdLoading: false,
  updateStatusLoading: false,
  deleteSessionLoading: false,

  // Inventory perform states
  assignedInventories: [],
  assignedGroups: [],
  unitRooms: [],

  // Submit result states
  submitResultLoading: false,
  submitResultError: null,
  lastSubmittedResult: null,
};

export interface CreateInventorySession {
  year: number;
  period: number;
  name: string;
  isGlobal: boolean;
  startDate: string;
  endDate: string;
  fileUrls?: string[];
  unitIds?: string[];
}

export interface CreateMember {
  userId: string;
  role?: string;
}

export interface UpdateInventorySession extends CreateInventorySession {}

// Inventory Sub Committee types
export interface CreateInventorySubDto {
  name: string;
  inventorySessionUnitId: string;
  leaderId: string;
  secretaryId: string;
  memberIds?: string[];
}

export interface UpdateInventorySubDto {
  name?: string;
  leaderId?: string;
  secretaryId?: string;
  memberIds?: string[];
  status?: string;
}

// Inventory Group types
export interface AssignUnitDto {
  unitId: string;
  startDate: string;
  endDate: string;
  note?: string;
}

export interface CreateInventoryGroupDto {
  name: string;
  subInventoryId: string;
  leaderId: string;
  secretaryId: string;
  memberIds?: string[];
  assignments: AssignUnitDto[];
}

export interface UpdateInventoryGroupDto {
  name?: string;
  leaderId?: string;
  secretaryId?: string;
  memberIds?: string[];
  assignments?: AssignUnitDto[];
  status?: string;
}

// Inventory Sub Committee API calls
export const createInventorySubCommittee = createAsyncThunk(
  "inventory-sub/create",
  async (subData: CreateInventorySubDto, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/api/v1/inventory-sub",
        subData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateInventorySubCommittee = createAsyncThunk(
  "inventory-sub/update",
  async (
    { id, subData }: { id: string; subData: UpdateInventorySubDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.patch(
        `/api/v1/inventory-sub/${id}`,
        subData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteInventorySubCommittee = createAsyncThunk(
  "inventory-sub/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/api/v1/inventory-sub/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getInventorySubCommitteeBySessionUnit = createAsyncThunk(
  "inventory-sub/getBySessionUnit",
  async (sessionUnitId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/api/v1/inventory-sub/by-session-unit/${sessionUnitId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getAllInventorySubCommittees = createAsyncThunk(
  "inventory-sub/getAll",
  async (
    { sessionId, status }: { sessionId?: string; status?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      if (sessionId) params.append("sessionId", sessionId);
      if (status) params.append("status", status);

      const response = await axiosInstance.get(
        `/api/v1/inventory-sub?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Inventory Group API calls
export const createInventoryGroup = createAsyncThunk(
  "inventory-group/create",
  async (groupData: CreateInventoryGroupDto, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/api/v1/inventory-group",
        groupData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateInventoryGroup = createAsyncThunk(
  "inventory-group/update",
  async (
    { id, groupData }: { id: string; groupData: UpdateInventoryGroupDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.patch(
        `/api/v1/inventory-group/${id}`,
        groupData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteInventoryGroup = createAsyncThunk(
  "inventory-group/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/api/v1/inventory-group/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getInventoryGroupById = createAsyncThunk(
  "inventory-group/getById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/inventory-group/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getInventoryGroupsBySub = createAsyncThunk(
  "inventory-group/getBySub",
  async (subId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/api/v1/inventory-group/by-sub/${subId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getAllInventoryGroups = createAsyncThunk(
  "inventory-group/getAll",
  async (
    { subId, status }: { subId?: string; status?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      if (subId) params.append("subId", subId);
      if (status) params.append("status", status);

      const response = await axiosInstance.get(
        `/api/v1/inventory-group?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Filter inventory sessions
export const filterInventorySessions = createAsyncThunk(
  "inventory-session/filter",
  async (filterRequest: InventoryFilterRequest, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/api/v1/inventories/filter",
        filterRequest
      );
      return response.data as PaginatedInventoryResponse;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get simple list of inventory sessions
export const getSimpleInventorySessions = createAsyncThunk(
  "inventory-session/simple",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/v1/inventories/simple");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const findByIdInventorySession = createAsyncThunk(
  "inventory-session/findById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/inventories/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
export const createInventorySession = createAsyncThunk(
  "inventory-session/createSession",
  async (sessionData: CreateInventorySession, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/api/v1/inventories",
        sessionData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateInventorySession = createAsyncThunk(
  "inventory-session/updateSession",
  async (
    { id, sessionData }: { id: string; sessionData: UpdateInventorySession },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.patch(
        `/api/v1/inventories/${id}`,
        sessionData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteInventorySession = createAsyncThunk(
  "inventory-session/deleteSession",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/api/v1/inventories/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateStatusInventorySession = createAsyncThunk(
  "inventory-session/updateStatus",
  async (
    { id, status }: { id: string; status: InventorySessionStatus },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.patch(
        `/api/v1/inventories/${id}/status?status=${status}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createMemberInventorySession = createAsyncThunk(
  "inventory-session/createMember",
  async (
    { id, memberData }: { id: string; memberData: CreateMember },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post(
        `/api/v1/inventories/${id}/members`,
        memberData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateMemberInventorySession = createAsyncThunk(
  "inventory-session/updateMember",
  async (
    {
      sessionId,
      memberId,
      memberData,
    }: { sessionId: string; memberId: string; memberData: CreateMember },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.patch(
        `/api/v1/inventories/${sessionId}/members/${memberId}`,
        memberData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteMemberInventorySession = createAsyncThunk(
  "inventory-session/deleteMember",
  async (
    { sessionId, memberId }: { sessionId: string; memberId: string },
    { rejectWithValue }
  ) => {
    try {
      await axiosInstance.delete(
        `/api/v1/inventories/${sessionId}/members/${memberId}`
      );
      return { sessionId, memberId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getAssignedMembersInSession = createAsyncThunk(
  "inventory-session/getAssignedMembersInSession",
  async (
    { sessionId, groupId }: { sessionId: string; groupId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.get(
        `/api/v1/inventories/${sessionId}/assigned-members/${groupId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getAssignedInventories = createAsyncThunk(
  "inventory-session/getAssignedInventories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/v1/inventories/assigned");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getUnitRooms = createAsyncThunk(
  "inventory-session/getUnitRooms",
  async (unitId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/units/${unitId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const submitInventoryResult = createAsyncThunk(
  "inventory/submitResult",
  async (data: SubmitInventoryResultRequest, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/v1/inventories/submit-result', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    // Filter actions
    updateFilter: (state, action) => {
      state.currentFilter = { ...state.currentFilter, ...action.payload };
    },
    setCurrentSession: (state, action) => {
      state.currentSession = action.payload;
    },
    deleteSessionById: (state, action) => {
      state.sessions = state.sessions.filter(
        (session) => session.id !== action.payload.id
      );
    },
    clearCurrentSession: (state) => {
      state.currentSession = null;
    },
    setMemberSession: (state, action) => {
      if (state.currentSession) {
        state.currentSession.members = action.payload;
      }
    },
    updateStatusSessionById: (state, action) => {
      const { id, status } = action.payload;

      // Update in sessions array
      state.sessions = state.sessions.map((session) =>
        session.id === id ? { ...session, status } : session
      );

      // Update in filteredSessions if exists
      if (state.filteredSessions?.data) {
        state.filteredSessions.data = state.filteredSessions.data.map(
          (session) => (session.id === id ? { ...session, status } : session)
        );
      }

      // Update currentSession if it matches
      if (state.currentSession?.id === id) {
        state.currentSession.status = status;
      }
    },
    resetFilter: (state) => {
      state.currentFilter = {
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
      };
      state.filteredSessions = null;
    },
    updatePagination: (state, action) => {
      if (state.currentFilter.pagination) {
        state.currentFilter.pagination = {
          ...state.currentFilter.pagination,
          ...action.payload,
        };
      }
    },
    clearFilterError: (state) => {
      state.filterError = null;
    },
    clearUnitRooms: (state) => {
      state.unitRooms = [];
    },
    clearSubmitResultError: (state) => {
      state.submitResultError = null;
    },
    clearLastSubmittedResult: (state) => {
      state.lastSubmittedResult = null;
    },
    updateSubCommitteeInSession: (state, action) => {
      const { sessionUnitId, subCommittee } = action.payload;
      if (state.currentSession?.inventorySessionUnits) {
        state.currentSession.inventorySessionUnits =
          state.currentSession.inventorySessionUnits.map((unit: any) =>
            unit.id === sessionUnitId
              ? { ...unit, subInventory: subCommittee }
              : unit
          );
      }
    },
    removeSubCommitteeFromSession: (state, action) => {
      const sessionUnitId = action.payload;
      if (state.currentSession?.inventorySessionUnits) {
        state.currentSession.inventorySessionUnits =
          state.currentSession.inventorySessionUnits.map((unit: any) =>
            unit.id === sessionUnitId ? { ...unit, subInventory: null } : unit
          );
      }
    },
    updateGroupInSubCommittee: (state, action) => {
      const { subCommitteeId, group } = action.payload;
      if (state.currentSession?.inventorySessionUnits) {
        state.currentSession.inventorySessionUnits =
          state.currentSession.inventorySessionUnits.map((unit: any) => {
            if (unit.subInventory?.id === subCommitteeId) {
              const updatedSubInventory = { ...unit.subInventory };
              if (!updatedSubInventory.groups) {
                updatedSubInventory.groups = [];
              }
              const existingIndex = updatedSubInventory.groups.findIndex(
                (g: any) => g.id === group.id
              );
              if (existingIndex >= 0) {
                updatedSubInventory.groups[existingIndex] = group;
              } else {
                updatedSubInventory.groups.push(group);
              }
              return { ...unit, subInventory: updatedSubInventory };
            }
            return unit;
          });
      }
    },
    removeGroupFromSubCommittee: (state, action) => {
      const { subCommitteeId, groupId } = action.payload;
      if (state.currentSession?.inventorySessionUnits) {
        state.currentSession.inventorySessionUnits =
          state.currentSession.inventorySessionUnits.map((unit: any) => {
            if (unit.subInventory?.id === subCommitteeId) {
              const updatedSubInventory = { ...unit.subInventory };
              if (updatedSubInventory.groups) {
                updatedSubInventory.groups = updatedSubInventory.groups.filter(
                  (g: any) => g.id !== groupId
                );
              }
              return { ...unit, subInventory: updatedSubInventory };
            }
            return unit;
          });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Filter inventory sessions
      .addCase(filterInventorySessions.pending, (state) => {
        state.filterLoading = true;
        state.filterError = null;
      })
      .addCase(filterInventorySessions.fulfilled, (state, action) => {
        state.filterLoading = false;
        state.filterError = null;
        state.filteredSessions = action.payload;
        // Update pagination in current filter
        if (state.currentFilter.pagination) {
          state.currentFilter.pagination = {
            ...state.currentFilter.pagination,
            currentPage: action.payload.pagination.page,
            totalItems: action.payload.pagination.total,
            totalPages: action.payload.pagination.totalPages,
            itemsPerPage: action.payload.pagination.limit,
          };
        }
      })
      .addCase(filterInventorySessions.rejected, (state, action) => {
        state.filterLoading = false;
        state.filterError = (action.payload as any)?.message || "Filter failed";
        state.filteredSessions = null;
      })

      // Simple inventory sessions
      .addCase(getSimpleInventorySessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSimpleInventorySessions.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.sessions = action.payload;
      })
      .addCase(getSimpleInventorySessions.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as any)?.message || "Failed to load sessions";
      })

      // Legacy actions
      .addCase(createInventorySession.pending, (state) => {
        state.createSessionLoading = true;
      })
      .addCase(createInventorySession.fulfilled, (state, action) => {
        state.createSessionLoading = false;
      })
      .addCase(createInventorySession.rejected, (state, action) => {
        state.createSessionLoading = false;
      })
      .addCase(deleteInventorySession.pending, (state) => {
        state.deleteSessionLoading = true;
      })
      .addCase(deleteInventorySession.fulfilled, (state, action) => {
        state.deleteSessionLoading = false;
      })
      .addCase(deleteInventorySession.rejected, (state, action) => {
        state.deleteSessionLoading = false;
      })
      .addCase(updateInventorySession.pending, (state) => {
        state.createSessionLoading = true;
      })
      .addCase(updateInventorySession.fulfilled, (state, action) => {
        state.createSessionLoading = false;
      })
      .addCase(updateInventorySession.rejected, (state, action) => {
        state.createSessionLoading = false;
      })
      .addCase(findByIdInventorySession.pending, (state) => {
        state.findByIdLoading = true;
      })
      .addCase(findByIdInventorySession.fulfilled, (state, action) => {
        state.findByIdLoading = false;
        state.currentSession = action.payload;
      })
      .addCase(findByIdInventorySession.rejected, (state, action) => {
        state.findByIdLoading = false;
      })
      .addCase(updateStatusInventorySession.pending, (state) => {
        state.updateStatusLoading = true;
      })
      .addCase(updateStatusInventorySession.fulfilled, (state, action) => {
        state.updateStatusLoading = false;
      })
      .addCase(updateStatusInventorySession.rejected, (state, action) => {
        state.updateStatusLoading = false;
      })
      .addCase(createMemberInventorySession.pending, (state) => {
        state.createMemberLoading = true;
      })
      .addCase(createMemberInventorySession.fulfilled, (state, action) => {
        state.createMemberLoading = false;
      })
      .addCase(createMemberInventorySession.rejected, (state, action) => {
        state.createMemberLoading = false;
      })
      .addCase(updateMemberInventorySession.pending, (state) => {
        state.createMemberLoading = true;
      })
      .addCase(updateMemberInventorySession.fulfilled, (state, action) => {
        state.createMemberLoading = false;
      })
      .addCase(updateMemberInventorySession.rejected, (state, action) => {
        state.createMemberLoading = false;
      })
      .addCase(deleteMemberInventorySession.pending, (state) => {
        state.createMemberLoading = true;
      })
      .addCase(deleteMemberInventorySession.fulfilled, (state, action) => {
        state.createMemberLoading = false;
      })
      .addCase(deleteMemberInventorySession.rejected, (state, action) => {
        state.createMemberLoading = false;
      })

      // Sub committee actions
      .addCase(createInventorySubCommittee.pending, (state) => {
        state.createSubCommitteeLoading = true;
      })
      .addCase(createInventorySubCommittee.fulfilled, (state, action) => {
        state.createSubCommitteeLoading = false;
        state.subCommittees.push(action.payload);

        // Update current session if the sub-committee belongs to it
        if (state.currentSession?.inventorySessionUnits) {
          state.currentSession.inventorySessionUnits =
            state.currentSession.inventorySessionUnits.map((unit: any) =>
              unit.id === action.payload.inventorySessionUnitId
                ? { ...unit, subInventory: action.payload }
                : unit
            );
        }
      })
      .addCase(createInventorySubCommittee.rejected, (state, action) => {
        state.createSubCommitteeLoading = false;
      })

      .addCase(updateInventorySubCommittee.pending, (state) => {
        state.updateSubCommitteeLoading = true;
      })
      .addCase(updateInventorySubCommittee.fulfilled, (state, action) => {
        state.updateSubCommitteeLoading = false;

        // Update in sub-committees array
        state.subCommittees = state.subCommittees.map((sub) =>
          sub.id === action.payload.id ? action.payload : sub
        );

        // Update current session if the sub-committee belongs to it
        if (state.currentSession?.inventorySessionUnits) {
          state.currentSession.inventorySessionUnits =
            state.currentSession.inventorySessionUnits.map((unit: any) =>
              unit.id === action.payload.inventorySessionUnitId
                ? { ...unit, subInventory: action.payload }
                : unit
            );
        }
      })
      .addCase(updateInventorySubCommittee.rejected, (state, action) => {
        state.updateSubCommitteeLoading = false;
      })

      .addCase(deleteInventorySubCommittee.pending, (state) => {
        state.deleteSubCommitteeLoading = true;
      })
      .addCase(deleteInventorySubCommittee.fulfilled, (state, action) => {
        state.deleteSubCommitteeLoading = false;
        const deletedId = action.payload;

        // Remove from sub-committees array
        state.subCommittees = state.subCommittees.filter(
          (sub) => sub.id !== deletedId
        );

        // Update current session - remove sub-committee from the unit
        if (state.currentSession?.inventorySessionUnits) {
          state.currentSession.inventorySessionUnits =
            state.currentSession.inventorySessionUnits.map((unit: any) =>
              unit.subInventory?.id === deletedId
                ? { ...unit, subInventory: null }
                : unit
            );
        }
      })
      .addCase(deleteInventorySubCommittee.rejected, (state, action) => {
        state.deleteSubCommitteeLoading = false;
      })

      .addCase(getAllInventorySubCommittees.pending, (state) => {
        state.subCommitteeLoading = true;
      })
      .addCase(getAllInventorySubCommittees.fulfilled, (state, action) => {
        state.subCommitteeLoading = false;
        state.subCommittees = action.payload;
      })
      .addCase(getAllInventorySubCommittees.rejected, (state, action) => {
        state.subCommitteeLoading = false;
      })

      .addCase(getInventorySubCommitteeBySessionUnit.pending, (state) => {
        state.subCommitteeLoading = true;
      })
      .addCase(
        getInventorySubCommitteeBySessionUnit.fulfilled,
        (state, action) => {
          state.subCommitteeLoading = false;

          // Update or add to sub-committees array
          const existingIndex = state.subCommittees.findIndex(
            (sub) => sub.id === action.payload.id
          );
          if (existingIndex >= 0) {
            state.subCommittees[existingIndex] = action.payload;
          } else {
            state.subCommittees.push(action.payload);
          }
        }
      )
      .addCase(
        getInventorySubCommitteeBySessionUnit.rejected,
        (state, action) => {
          state.subCommitteeLoading = false;
        }
      )

      // Group actions
      .addCase(createInventoryGroup.pending, (state) => {
        state.createGroupLoading = true;
      })
      .addCase(createInventoryGroup.fulfilled, (state, action) => {
        state.createGroupLoading = false;
        state.groups.push(action.payload);

        // Update current session if the group belongs to it
        if (state.currentSession?.inventorySessionUnits) {
          state.currentSession.inventorySessionUnits =
            state.currentSession.inventorySessionUnits.map((unit: any) => {
              if (unit.subInventory?.id === action.payload.subInventoryId) {
                const updatedSubInventory = { ...unit.subInventory };
                if (!updatedSubInventory.groups) {
                  updatedSubInventory.groups = [];
                }
                updatedSubInventory.groups.push(action.payload);
                return { ...unit, subInventory: updatedSubInventory };
              }
              return unit;
            });
        }
      })
      .addCase(createInventoryGroup.rejected, (state, action) => {
        state.createGroupLoading = false;
      })

      .addCase(updateInventoryGroup.pending, (state) => {
        state.updateGroupLoading = true;
      })
      .addCase(updateInventoryGroup.fulfilled, (state, action) => {
        state.updateGroupLoading = false;

        // Update in groups array
        state.groups = state.groups.map((group) =>
          group.id === action.payload.id ? action.payload : group
        );

        // Update current session if the group belongs to it
        if (state.currentSession?.inventorySessionUnits) {
          state.currentSession.inventorySessionUnits =
            state.currentSession.inventorySessionUnits.map((unit: any) => {
              if (unit.subInventory?.id === action.payload.subInventoryId) {
                const updatedSubInventory = { ...unit.subInventory };
                if (updatedSubInventory.groups) {
                  updatedSubInventory.groups = updatedSubInventory.groups.map(
                    (g: any) =>
                      g.id === action.payload.id ? action.payload : g
                  );
                }
                return { ...unit, subInventory: updatedSubInventory };
              }
              return unit;
            });
        }
      })
      .addCase(updateInventoryGroup.rejected, (state, action) => {
        state.updateGroupLoading = false;
      })

      .addCase(deleteInventoryGroup.pending, (state) => {
        state.deleteGroupLoading = true;
      })
      .addCase(deleteInventoryGroup.fulfilled, (state, action) => {
        state.deleteGroupLoading = false;
        const deletedId = action.payload;

        // Remove from groups array
        state.groups = state.groups.filter((group) => group.id !== deletedId);

        // Update current session - remove group from the sub-committee
        if (state.currentSession?.inventorySessionUnits) {
          state.currentSession.inventorySessionUnits =
            state.currentSession.inventorySessionUnits.map((unit: any) => {
              if (unit.subInventory?.groups) {
                const updatedSubInventory = { ...unit.subInventory };
                updatedSubInventory.groups = updatedSubInventory.groups.filter(
                  (g: any) => g.id !== deletedId
                );
                return { ...unit, subInventory: updatedSubInventory };
              }
              return unit;
            });
        }
      })
      .addCase(deleteInventoryGroup.rejected, (state, action) => {
        state.deleteGroupLoading = false;
      })

      .addCase(getAllInventoryGroups.pending, (state) => {
        state.groupLoading = true;
      })
      .addCase(getAllInventoryGroups.fulfilled, (state, action) => {
        state.groupLoading = false;
        state.groups = action.payload;
      })
      .addCase(getAllInventoryGroups.rejected, (state, action) => {
        state.groupLoading = false;
      })

      .addCase(getInventoryGroupsBySub.pending, (state) => {
        state.groupLoading = true;
      })
      .addCase(getInventoryGroupsBySub.fulfilled, (state, action) => {
        state.groupLoading = false;

        // Update or add to groups array
        action.payload.forEach((group: any) => {
          const existingIndex = state.groups.findIndex(
            (g) => g.id === group.id
          );
          if (existingIndex >= 0) {
            state.groups[existingIndex] = group;
          } else {
            state.groups.push(group);
          }
        });
      })
      .addCase(getInventoryGroupsBySub.rejected, (state, action) => {
        state.groupLoading = false;
      })

      // Inventory perform actions
      .addCase(getAssignedInventories.pending, (state) => {
      })
      .addCase(getAssignedInventories.fulfilled, (state, action) => {
        state.assignedInventories = action.payload;
      })
      .addCase(getAssignedInventories.rejected, (state, action) => {
      })
      .addCase(getAssignedMembersInSession.pending, (state) => {

      })
      .addCase(getAssignedMembersInSession.fulfilled, (state, action) => {
        state.assignedGroups = action.payload;
      })
      .addCase(getAssignedMembersInSession.rejected, (state, action) => {

      })
      .addCase(getUnitRooms.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUnitRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.unitRooms = action.payload?.rooms || [];
      })
      .addCase(getUnitRooms.rejected, (state, action) => {
        state.loading = false;
      })

      // Submit inventory result actions
      .addCase(submitInventoryResult.pending, (state) => {
        state.submitResultLoading = true;
        state.submitResultError = null;
      })
      .addCase(submitInventoryResult.fulfilled, (state, action) => {
        state.submitResultLoading = false;
        state.submitResultError = null;
        state.lastSubmittedResult = action.payload;
      })
      .addCase(submitInventoryResult.rejected, (state, action) => {
        state.submitResultLoading = false;
        state.submitResultError = (action.payload as any)?.message || "Submit failed";
      })
  },
});

export const {
  updateFilter,
  resetFilter,
  deleteSessionById,
  updatePagination,
  clearFilterError,
  clearUnitRooms,
  clearSubmitResultError,
  clearLastSubmittedResult,
  updateStatusSessionById,
  setCurrentSession,
  clearCurrentSession,
  setMemberSession,
  updateSubCommitteeInSession,
  removeSubCommitteeFromSession,
  updateGroupInSubCommittee,
  removeGroupFromSubCommittee,
} = inventorySlice.actions;
export default inventorySlice.reducer;
