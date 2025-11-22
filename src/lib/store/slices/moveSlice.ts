import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { Asset, Room, PaginatedResponse, BaseFilterRequest } from '@/types/asset'
import axiosInstance from '@/lib/api'

// Movement Status Enum
export enum MoveStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL', 
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// DTOs for API calls
export interface CreateMovementItemDto {
  assetId: string
  fromRoomId: string
  toRoomId: string
  note?: string
}

export interface CreateMovementDto {
  items: CreateMovementItemDto[]
  requestNote?: string
  status?: MoveStatus
  createdAt?: string
  approvalNote?: string
}

export interface UpdateMovementDto {
  items?: CreateMovementItemDto[]
  requestNote?: string
  status?: MoveStatus
}

export interface UpdateMovementStatusDto {
  status: MoveStatus
  note?: string
  rejectionReason?: string
  approvalNote?: string
}

export interface ProposeMovementDto {
  note?: string
}

export interface ApproveMovementDto {
  approvalNote?: string
  evidenceUrl?: string
}

export interface RejectMovementDto {
  rejectionReason: string
}

export interface ExecuteMovementDto {
  note?: string
}

export interface MovementFilterDto extends BaseFilterRequest {
  status?: MoveStatus
  search?: string
}

export interface MovementHistoryResponseDto {
  id: string
  oldStatus: MoveStatus
  newStatus: MoveStatus
  note?: string
  evidenceUrl?: string
  createdAt: Date
  changer: {
    id: string
    fullName: string
    email: string
  }
}

export interface MovementItemResponseDto {
  id: string
  assetId: string
  fromRoomId: string
  toRoomId: string
  note?: string
  movedAt?: Date
  movedBy?: string
  createdAt: Date
  updatedAt: Date
  asset?: {
    id: string
    name: string
    fixedCode: string
    ktCode: string
    type: string
    status: string
  }
  fromRoom?: {
    id: string
    name: string
    roomCode: string
  }
  toRoom?: {
    id: string
    name: string
    roomCode: string
  }
  mover?: {
    id: string
    fullName: string
    email: string
  }
}

export interface MovementResponseDto {
  id: string
  status: MoveStatus
  requestNote?: string
  approvalNote?: string
  rejectionReason?: string
  approvedAt?: Date
  completedAt?: Date
  cancelledAt?: Date
  createdAt: Date
  updatedAt: Date
  requester?: {
    id: string
    fullName: string
    email: string
  }
  approver?: {
    id: string
    fullName: string
    email: string
  }
  items: MovementItemResponseDto[]
  histories: MovementHistoryResponseDto[]
}

export interface SimplifiedMovementResponseDto {
  id: string
  status: MoveStatus
  requestNote?: string
  approvalNote?: string
  createdAt: Date
  updatedAt: Date
  requester?: {
    id: string
    fullName: string
    email: string
  }
  approver?: {
    id: string
    fullName: string
    email: string
  }
  itemCount: number
}

interface MoveContext {
  sourceRoomId?: string
  sourceRoom?: Room
}

interface MoveState {
  // Assets selected for movement
  selectedAssetsForMove: Asset[]
  // Movement context (source room info)
  moveContext: MoveContext | null
  // Current movement being created
  currentMovement: MovementResponseDto | null
  
  // API State
  filteredMovements: PaginatedResponse<SimplifiedMovementResponseDto>
  currentFilter: MovementFilterDto
  currentMovementDetail: MovementResponseDto | null
  
  // Loading states
  isCreatingMovement: boolean
  isUpdatingMovement: boolean
  isUpdatingStatus: boolean
  isProposingMovement: boolean
  isApprovingMovement: boolean
  isRejectingMovement: boolean
  isExecutingMovement: boolean
  isFetchingMovement: boolean
  isFilteringMovements: boolean
  
  // Error states
  createMovementError: string | null
  updateMovementError: string | null
  updateStatusError: string | null
  proposeMovementError: string | null
  approveMovementError: string | null
  rejectMovementError: string | null
  executeMovementError: string | null
  fetchMovementError: string | null
  filterMovementError: string | null
  
  loading: boolean
  error: string | null
}

const initialState: MoveState = {
  selectedAssetsForMove: [],
  moveContext: null,
  currentMovement: null,
  
  // API State
  filteredMovements: {
    data: [],
    pagination: {
      page: 1,
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
  currentMovementDetail: null,
  
  // Loading states
  isCreatingMovement: false,
  isUpdatingMovement: false,
  isUpdatingStatus: false,
  isProposingMovement: false,
  isApprovingMovement: false,
  isRejectingMovement: false,
  isExecutingMovement: false,
  isFetchingMovement: false,
  isFilteringMovements: false,
  
  // Error states
  createMovementError: null,
  updateMovementError: null,
  updateStatusError: null,
  proposeMovementError: null,
  approveMovementError: null,
  rejectMovementError: null,
  executeMovementError: null,
  fetchMovementError: null,
  filterMovementError: null,
  
  loading: false,
  error: null,
}

// Async thunks for API calls
export const createMovement = createAsyncThunk(
  'move/createMovement',
  async (createDto: CreateMovementDto, { rejectWithValue }) => {
    try {
      console.log('Creating movement with data:', createDto)
      const response = await axiosInstance.post('/api/v1/movements', createDto)
      console.log('Create movement response:', response.data)
      return response.data as MovementResponseDto
    } catch (error: any) {
      console.error('Create movement error:', error)
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const updateMovement = createAsyncThunk(
  'move/updateMovement',
  async ({ id, updateDto }: { id: string; updateDto: UpdateMovementDto }, { rejectWithValue }) => {
    try {
      console.log('Updating movement:', id, updateDto)
      const response = await axiosInstance.put(`/api/v1/movements/${id}`, updateDto)
      console.log('Update movement response:', response.data)
      return response.data as MovementResponseDto
    } catch (error: any) {
      console.error('Update movement error:', error)
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const updateMovementStatus = createAsyncThunk(
  'move/updateMovementStatus',
  async ({ id, updateDto }: { id: string; updateDto: UpdateMovementStatusDto }, { rejectWithValue }) => {
    try {
      console.log('Updating movement status:', id, updateDto)
      const response = await axiosInstance.patch(`/api/v1/movements/${id}/status`, updateDto)
      console.log('Update movement status response:', response.data)
      return response.data as MovementResponseDto
    } catch (error: any) {
      console.error('Update movement status error:', error)
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const proposeMovement = createAsyncThunk(
  'move/proposeMovement',
  async ({ id, proposeDto }: { id: string; proposeDto: ProposeMovementDto }, { rejectWithValue }) => {
    try {
      console.log('Proposing movement:', id, proposeDto)
      const response = await axiosInstance.patch(`/api/v1/movements/${id}/propose`, proposeDto)
      console.log('Propose movement response:', response.data)
      return response.data as MovementResponseDto
    } catch (error: any) {
      console.error('Propose movement error:', error)
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const approveMovement = createAsyncThunk(
  'move/approveMovement',
  async ({ id, approveDto }: { id: string; approveDto: ApproveMovementDto }, { rejectWithValue }) => {
    try {
      console.log('Approving movement:', id, approveDto)
      const response = await axiosInstance.patch(`/api/v1/movements/${id}/approve`, approveDto)
      console.log('Approve movement response:', response.data)
      return response.data as MovementResponseDto
    } catch (error: any) {
      console.error('Approve movement error:', error)
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const rejectMovement = createAsyncThunk(
  'move/rejectMovement',
  async ({ id, rejectDto }: { id: string; rejectDto: RejectMovementDto }, { rejectWithValue }) => {
    try {
      console.log('Rejecting movement:', id, rejectDto)
      const response = await axiosInstance.patch(`/api/v1/movements/${id}/reject`, rejectDto)
      console.log('Reject movement response:', response.data)
      return response.data as MovementResponseDto
    } catch (error: any) {
      console.error('Reject movement error:', error)
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const executeMovement = createAsyncThunk(
  'move/executeMovement',
  async ({ id, executeDto }: { id: string; executeDto: ExecuteMovementDto }, { rejectWithValue }) => {
    try {
      console.log('Executing movement:', id, executeDto)
      const response = await axiosInstance.patch(`/api/v1/movements/${id}/execute`, executeDto)
      console.log('Execute movement response:', response.data)
      return response.data as MovementResponseDto
    } catch (error: any) {
      console.error('Execute movement error:', error)
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const getMovementById = createAsyncThunk(
  'move/getMovementById',
  async (id: string, { rejectWithValue }) => {
    try {
      console.log('Fetching movement by ID:', id)
      const response = await axiosInstance.get(`/api/v1/movements/${id}`)
      console.log('Get movement response:', response.data)
      return response.data as MovementResponseDto
    } catch (error: any) {
      console.error('Get movement error:', error)
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const filterSimplifiedMovements = createAsyncThunk(
  'move/filterSimplifiedMovements',
  async (filterDto: MovementFilterDto, { rejectWithValue }) => {
    try {
      console.log('Filtering simplified movements with data:', filterDto)
      const response = await axiosInstance.post('/api/v1/movements/filter/simplified', filterDto)
      console.log('Filter simplified movements response:', response.data)
      return response.data as PaginatedResponse<SimplifiedMovementResponseDto>
    } catch (error: any) {
      console.error('Filter simplified movements error:', error)
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const deleteMovement = createAsyncThunk(
  'move/deleteMovement',
  async (id: string, { rejectWithValue }) => {
    try {
      console.log('Deleting movement:', id)
      const response = await axiosInstance.delete(`/api/v1/movements/${id}`)
      console.log('Delete movement response:', response.data)
      return id
    } catch (error: any) {
      console.error('Delete movement error:', error)
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

const moveSlice = createSlice({
  name: 'move',
  initialState,
  reducers: {
    // Save selected assets for movement
    setSelectedAssetsForMove: (state, action: PayloadAction<Asset[]>) => {
      state.selectedAssetsForMove = action.payload
    },
    
    // Save movement context (source room info)
    setMoveContext: (state, action: PayloadAction<MoveContext>) => {
      state.moveContext = action.payload
    },
    
    // Clear movement context
    clearMoveContext: (state) => {
      state.moveContext = null
    },
    
    // Clear selected assets
    clearSelectedAssetsForMove: (state) => {
      state.selectedAssetsForMove = []
    },
    
    // Add asset to movement list
    addAssetForMove: (state, action: PayloadAction<Asset>) => {
      const existingIndex = state.selectedAssetsForMove.findIndex(asset => asset.id === action.payload.id)
      if (existingIndex === -1) {
        state.selectedAssetsForMove.push(action.payload)
      }
    },
    
    // Remove asset from movement list
    removeAssetFromMove: (state, action: PayloadAction<string>) => {
      state.selectedAssetsForMove = state.selectedAssetsForMove.filter(asset => asset.id !== action.payload)
    },
    
    // Set current movement
    setCurrentMovement: (state, action: PayloadAction<MovementResponseDto>) => {
      state.currentMovement = action.payload
    },
    
    // Clear current movement
    clearCurrentMovement: (state) => {
      state.currentMovement = null
    },
    
    // Set loading state
    setMoveLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    
    // Set error state
    setMoveError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    
    // Reset entire state
    resetMoveState: (state) => {
      state.selectedAssetsForMove = []
      state.moveContext = null
      state.currentMovement = null
      state.loading = false
      state.error = null
    },
    
    // Set current filter
    setCurrentFilter: (state, action: PayloadAction<MovementFilterDto>) => {
      state.currentFilter = action.payload
    },
    
    // Clear current movement detail
    clearCurrentMovementDetail: (state) => {
      state.currentMovementDetail = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Create movement
      .addCase(createMovement.pending, (state) => {
        state.isCreatingMovement = true
        state.createMovementError = null
      })
      .addCase(createMovement.fulfilled, (state, action) => {
        state.isCreatingMovement = false
        state.createMovementError = null
        state.currentMovementDetail = action.payload
        console.log('Movement created successfully:', action.payload)
      })
      .addCase(createMovement.rejected, (state, action) => {
        state.isCreatingMovement = false
        state.createMovementError = action.payload as string
        console.error('Create movement failed:', action.payload)
      })
      
      // Update movement
      .addCase(updateMovement.pending, (state) => {
        state.isUpdatingMovement = true
        state.updateMovementError = null
      })
      .addCase(updateMovement.fulfilled, (state, action) => {
        state.isUpdatingMovement = false
        state.updateMovementError = null
        state.currentMovementDetail = action.payload
        console.log('Movement updated successfully:', action.payload)
      })
      .addCase(updateMovement.rejected, (state, action) => {
        state.isUpdatingMovement = false
        state.updateMovementError = action.payload as string
        console.error('Update movement failed:', action.payload)
      })
      
      // Update movement status
      .addCase(updateMovementStatus.pending, (state) => {
        state.isUpdatingStatus = true
        state.updateStatusError = null
      })
      .addCase(updateMovementStatus.fulfilled, (state, action) => {
        state.isUpdatingStatus = false
        state.updateStatusError = null
        state.currentMovementDetail = action.payload
        console.log('Movement status updated successfully:', action.payload)
      })
      .addCase(updateMovementStatus.rejected, (state, action) => {
        state.isUpdatingStatus = false
        state.updateStatusError = action.payload as string
        console.error('Update movement status failed:', action.payload)
      })
      
      // Propose movement
      .addCase(proposeMovement.pending, (state) => {
        state.isProposingMovement = true
        state.proposeMovementError = null
      })
      .addCase(proposeMovement.fulfilled, (state, action) => {
        state.isProposingMovement = false
        state.proposeMovementError = null
        state.currentMovementDetail = action.payload
        console.log('Movement proposed successfully:', action.payload)
      })
      .addCase(proposeMovement.rejected, (state, action) => {
        state.isProposingMovement = false
        state.proposeMovementError = action.payload as string
        console.error('Propose movement failed:', action.payload)
      })
      
      // Approve movement
      .addCase(approveMovement.pending, (state) => {
        state.isApprovingMovement = true
        state.approveMovementError = null
      })
      .addCase(approveMovement.fulfilled, (state, action) => {
        state.isApprovingMovement = false
        state.approveMovementError = null
        state.currentMovementDetail = action.payload
        console.log('Movement approved successfully:', action.payload)
      })
      .addCase(approveMovement.rejected, (state, action) => {
        state.isApprovingMovement = false
        state.approveMovementError = action.payload as string
        console.error('Approve movement failed:', action.payload)
      })
      
      // Reject movement
      .addCase(rejectMovement.pending, (state) => {
        state.isRejectingMovement = true
        state.rejectMovementError = null
      })
      .addCase(rejectMovement.fulfilled, (state, action) => {
        state.isRejectingMovement = false
        state.rejectMovementError = null
        state.currentMovementDetail = action.payload
        console.log('Movement rejected successfully:', action.payload)
      })
      .addCase(rejectMovement.rejected, (state, action) => {
        state.isRejectingMovement = false
        state.rejectMovementError = action.payload as string
        console.error('Reject movement failed:', action.payload)
      })
      
      // Execute movement
      .addCase(executeMovement.pending, (state) => {
        state.isExecutingMovement = true
        state.executeMovementError = null
      })
      .addCase(executeMovement.fulfilled, (state, action) => {
        state.isExecutingMovement = false
        state.executeMovementError = null
        state.currentMovementDetail = action.payload
        console.log('Movement executed successfully:', action.payload)
      })
      .addCase(executeMovement.rejected, (state, action) => {
        state.isExecutingMovement = false
        state.executeMovementError = action.payload as string
        console.error('Execute movement failed:', action.payload)
      })
      
      // Get movement by ID
      .addCase(getMovementById.pending, (state) => {
        state.isFetchingMovement = true
        state.fetchMovementError = null
      })
      .addCase(getMovementById.fulfilled, (state, action) => {
        state.isFetchingMovement = false
        state.fetchMovementError = null
        state.currentMovementDetail = action.payload
        console.log('Movement fetched successfully:', action.payload)
      })
      .addCase(getMovementById.rejected, (state, action) => {
        state.isFetchingMovement = false
        state.fetchMovementError = action.payload as string
        console.error('Get movement failed:', action.payload)
      })
      
      // Filter simplified movements
      .addCase(filterSimplifiedMovements.pending, (state) => {
        state.isFilteringMovements = true
        state.filterMovementError = null
      })
      .addCase(filterSimplifiedMovements.fulfilled, (state, action) => {
        state.isFilteringMovements = false
        state.filterMovementError = null
        state.filteredMovements = action.payload
        // Update current filter from request
        state.currentFilter = {
          ...state.currentFilter,
          ...action.meta.arg,
        }
        if (state.currentFilter.pagination && action.payload.pagination) {
          state.currentFilter.pagination = {
            ...state.currentFilter.pagination,
            currentPage: action.payload.pagination.page || 1,
            totalItems: action.payload.pagination.total,
            totalPages: action.payload.pagination.totalPages,
            itemsPerPage: action.payload.pagination.limit || 10,
          }
        }
        console.log('Simplified movements filtered successfully:', action.payload)
      })
      .addCase(filterSimplifiedMovements.rejected, (state, action) => {
        state.isFilteringMovements = false
        state.filterMovementError = action.payload as string
        console.error('Filter simplified movements failed:', action.payload)
      })
      
      // Delete movement
      .addCase(deleteMovement.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteMovement.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        // Remove from filtered movements
        state.filteredMovements.data = state.filteredMovements.data.filter(
          movement => movement.id !== action.payload
        )
        console.log('Movement deleted successfully:', action.payload)
      })
      .addCase(deleteMovement.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        console.error('Delete movement failed:', action.payload)
      })
  },
})

export const {
  setSelectedAssetsForMove,
  setMoveContext,
  clearMoveContext,
  clearSelectedAssetsForMove,
  addAssetForMove,
  removeAssetFromMove,
  setCurrentMovement,
  clearCurrentMovement,
  setMoveLoading,
  setMoveError,
  resetMoveState,
  setCurrentFilter,
  clearCurrentMovementDetail
} = moveSlice.actions

export default moveSlice.reducer
