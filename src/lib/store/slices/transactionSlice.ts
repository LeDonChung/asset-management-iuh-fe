import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { Asset, AssetTransaction, Unit, PaginatedResponse, TransactionType, TransactionStatus, BaseFilterRequest } from '@/types/asset'
import axiosInstance from '@/lib/api'

// DTOs for API calls
export interface CreateTransactionItemDto {
  assetId: string
  fromRoomId?: string
  toRoomId?: string
  note?: string
}

export interface CreateTransactionDto {
  type: TransactionType
  fromUnitId?: string
  toUnitId: string
  requestNote?: string
  status?: TransactionStatus
  items: CreateTransactionItemDto[]
}

export interface UpdateTransactionDto {
  fromUnitId?: string
  toUnitId?: string
  requestNote?: string
  items?: CreateTransactionItemDto[]
}

export interface UpdateTransactionStatusDto {
  status: TransactionStatus
  note?: string
  rejectionReason?: string
  approvalNote?: string
}

export interface ProposeTransactionDto {
  note?: string
}

export interface ApproveTransactionDto {
  approvalNote?: string
}

export interface RejectTransactionDto {
  rejectionReason: string
}

export interface TransactionFilterDto extends BaseFilterRequest {
  type?: TransactionType
  status?: TransactionStatus
  fromUnitId?: string
  search?: string
}

export interface TransactionHistoryResponseDto {
  id: string
  transactionId: string
  oldStatus: TransactionStatus
  newStatus: TransactionStatus
  changer: {
    id: string
    fullName: string
    username: string
  }
  note?: string
  createdAt: Date
}

export interface TransactionItemResponseDto {
  id: string
  transactionId: string
  assetId: string
  fromRoomId?: string
  toRoomId?: string
  asset: {
    id: string
    name: string
    fixedCode: string
    ktCode: string
    type: string
    status: string
    currentRoom?: {
      id: string
      name: string
      roomCode: string
    }
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
  note?: string
  createdAt: Date
  updatedAt: Date
}

export interface TransactionResponseDto {
  id: string
  type: TransactionType
  fromUnit?: {
    id: string
    name: string
    unitCode: number
  }
  toUnit: {
    id: string
    name: string
    unitCode: number
  }
  requester: {
    id: string
    fullName: string
    username: string
  }
  approver?: {
    id: string
    fullName: string
    username: string
  }
  handover?: {
    id: string
    fullName: string
    username: string
  }
  receiver?: {
    id: string
    fullName: string
    username: string
  }
  status: TransactionStatus
  requestNote?: string
  approvalNote?: string
  rejectionReason?: string
  items: TransactionItemResponseDto[]
  histories?: TransactionHistoryResponseDto[]
  createdAt: Date
  updatedAt: Date
  totalAssets: number
}

export interface SimplifiedTransactionResponseDto {
  id: string
  type: TransactionType
  fromUnitName: string
  toUnitName: string
  status: TransactionStatus
  totalAssets: number
  requesterName: string
  createdAt: Date
}

interface HandoverContext {
  sourceCampusId?: string
  sourceUnitId?: string
  sourceRoomId?: string
  // Thông tin chi tiết
  sourceCampus?: Unit
  sourceUnit?: Unit
}

interface TransactionState {
  // Tài sản được chọn để bàn giao
  selectedAssetsForHandover: Asset[]
  // Context bàn giao (đơn vị nguồn)
  handoverContext: HandoverContext | null
  // Transaction hiện tại đang được tạo
  currentTransaction: AssetTransaction | null
  
  // API State
  filteredTransactions: PaginatedResponse<SimplifiedTransactionResponseDto>
  currentFilter: TransactionFilterDto
  currentTransactionDetail: TransactionResponseDto | null
  
  // Loading states
  isCreatingTransaction: boolean
  isUpdatingTransaction: boolean
  isUpdatingStatus: boolean
  isProposingTransaction: boolean
  isApprovingTransaction: boolean
  isRejectingTransaction: boolean
  isFetchingTransaction: boolean
  isFilteringTransactions: boolean
  
  // Error states
  createTransactionError: string | null
  updateTransactionError: string | null
  updateStatusError: string | null
  proposeTransactionError: string | null
  approveTransactionError: string | null
  rejectTransactionError: string | null
  fetchTransactionError: string | null
  filterTransactionError: string | null
  
  loading: boolean
  error: string | null
}

const initialState: TransactionState = {
  selectedAssetsForHandover: [],
  handoverContext: null,
  currentTransaction: null,
  
  // API State
  filteredTransactions: {
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
  currentTransactionDetail: null,
  
  // Loading states
  isCreatingTransaction: false,
  isUpdatingTransaction: false,
  isUpdatingStatus: false,
  isProposingTransaction: false,
  isApprovingTransaction: false,
  isRejectingTransaction: false,
  isFetchingTransaction: false,
  isFilteringTransactions: false,
  
  // Error states
  createTransactionError: null,
  updateTransactionError: null,
  updateStatusError: null,
  proposeTransactionError: null,
  approveTransactionError: null,
  rejectTransactionError: null,
  fetchTransactionError: null,
  filterTransactionError: null,
  
  loading: false,
  error: null,
}

// Async thunks for API calls
export const createTransaction = createAsyncThunk(
  'transaction/createTransaction',
  async (createDto: CreateTransactionDto, { rejectWithValue }) => {
    try {
      console.log('Creating transaction with data:', createDto)
      const response = await axiosInstance.post('/api/v1/transactions', createDto)
      console.log('Create transaction response:', response.data)
      return response.data as TransactionResponseDto
    } catch (error: any) {
      console.error('Create transaction error:', error)
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const updateTransaction = createAsyncThunk(
  'transaction/updateTransaction',
  async ({ id, updateDto }: { id: string; updateDto: UpdateTransactionDto }, { rejectWithValue }) => {
    try {
      console.log('Updating transaction:', id, updateDto)
      const response = await axiosInstance.put(`/api/v1/transactions/${id}`, updateDto)
      console.log('Update transaction response:', response.data)
      return response.data as TransactionResponseDto
    } catch (error: any) {
      console.error('Update transaction error:', error)
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const updateTransactionStatus = createAsyncThunk(
  'transaction/updateTransactionStatus',
  async ({ id, updateDto }: { id: string; updateDto: UpdateTransactionStatusDto }, { rejectWithValue }) => {
    try {
      console.log('Updating transaction status:', id, updateDto)
      const response = await axiosInstance.patch(`/api/v1/transactions/${id}/status`, updateDto)
      console.log('Update transaction status response:', response.data)
      return response.data as TransactionResponseDto
    } catch (error: any) {
      console.error('Update transaction status error:', error)
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const proposeTransaction = createAsyncThunk(
  'transaction/proposeTransaction',
  async ({ id, proposeDto }: { id: string; proposeDto: ProposeTransactionDto }, { rejectWithValue }) => {
    try {
      console.log('Proposing transaction:', id, proposeDto)
      const response = await axiosInstance.patch(`/api/v1/transactions/${id}/propose`, proposeDto)
      console.log('Propose transaction response:', response.data)
      return response.data as TransactionResponseDto
    } catch (error: any) {
      console.error('Propose transaction error:', error)
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const approveTransaction = createAsyncThunk(
  'transaction/approveTransaction',
  async ({ id, approveDto }: { id: string; approveDto: ApproveTransactionDto }, { rejectWithValue }) => {
    try {
      console.log('Approving transaction:', id, approveDto)
      const response = await axiosInstance.patch(`/api/v1/transactions/${id}/approve`, approveDto)
      console.log('Approve transaction response:', response.data)
      return response.data as TransactionResponseDto
    } catch (error: any) {
      console.error('Approve transaction error:', error)
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const rejectTransaction = createAsyncThunk(
  'transaction/rejectTransaction',
  async ({ id, rejectDto }: { id: string; rejectDto: RejectTransactionDto }, { rejectWithValue }) => {
    try {
      console.log('Rejecting transaction:', id, rejectDto)
      const response = await axiosInstance.patch(`/api/v1/transactions/${id}/reject`, rejectDto)
      console.log('Reject transaction response:', response.data)
      return response.data as TransactionResponseDto
    } catch (error: any) {
      console.error('Reject transaction error:', error)
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const getTransactionById = createAsyncThunk(
  'transaction/getTransactionById',
  async (id: string, { rejectWithValue }) => {
    try {
      console.log('Fetching transaction by ID:', id)
      const response = await axiosInstance.get(`/api/v1/transactions/${id}`)
      console.log('Get transaction response:', response.data)
      return response.data as TransactionResponseDto
    } catch (error: any) {
      console.error('Get transaction error:', error)
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const filterTransactions = createAsyncThunk(
  'transaction/filterTransactions',
  async (filterDto: TransactionFilterDto, { rejectWithValue }) => {
    try {
      console.log('Filtering transactions with data:', filterDto)
      const response = await axiosInstance.post('/api/v1/transactions/filter', filterDto)
      console.log('Filter transactions response:', response.data)
      return response.data as PaginatedResponse<TransactionResponseDto>
    } catch (error: any) {
      console.error('Filter transactions error:', error)
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const filterSimplifiedTransactions = createAsyncThunk(
  'transaction/filterSimplifiedTransactions',
  async (filterDto: TransactionFilterDto, { rejectWithValue }) => {
    try {
      console.log('Filtering simplified transactions with data:', filterDto)
      const response = await axiosInstance.post('/api/v1/transactions/filter/simplified', filterDto)
      console.log('Filter simplified transactions response:', response.data)
      return response.data as PaginatedResponse<SimplifiedTransactionResponseDto>
    } catch (error: any) {
      console.error('Filter simplified transactions error:', error)
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    // Lưu danh sách tài sản được chọn để bàn giao
    setSelectedAssetsForHandover: (state, action: PayloadAction<Asset[]>) => {
      state.selectedAssetsForHandover = action.payload
    },
    
    // Lưu context bàn giao (đơn vị nguồn)
    setHandoverContext: (state, action: PayloadAction<HandoverContext>) => {
      state.handoverContext = action.payload
    },
    
    // Xóa context bàn giao
    clearHandoverContext: (state) => {
      state.handoverContext = null
    },
    
    // Xóa danh sách tài sản đã chọn
    clearSelectedAssetsForHandover: (state) => {
      state.selectedAssetsForHandover = []
    },
    
    // Thêm tài sản vào danh sách
    addAssetForHandover: (state, action: PayloadAction<Asset>) => {
      const existingIndex = state.selectedAssetsForHandover.findIndex(asset => asset.id === action.payload.id)
      if (existingIndex === -1) {
        state.selectedAssetsForHandover.push(action.payload)
      }
    },
    
    // Xóa tài sản khỏi danh sách
    removeAssetFromHandover: (state, action: PayloadAction<string>) => {
      state.selectedAssetsForHandover = state.selectedAssetsForHandover.filter(asset => asset.id !== action.payload)
    },
    
    // Thiết lập transaction hiện tại
    setCurrentTransaction: (state, action: PayloadAction<AssetTransaction>) => {
      state.currentTransaction = action.payload
    },
    
    // Xóa transaction hiện tại
    clearCurrentTransaction: (state) => {
      state.currentTransaction = null
    },
    
    // Thiết lập loading state
    setTransactionLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    
    // Thiết lập error state
    setTransactionError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    
    // Reset toàn bộ state
    resetTransactionState: (state) => {
      state.selectedAssetsForHandover = []
      state.handoverContext = null
      state.currentTransaction = null
      state.loading = false
      state.error = null
    },
    
    // Set current filter
    setCurrentFilter: (state, action: PayloadAction<TransactionFilterDto>) => {
      state.currentFilter = action.payload
    },
    
    // Clear current transaction detail
    clearCurrentTransactionDetail: (state) => {
      state.currentTransactionDetail = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Create transaction
      .addCase(createTransaction.pending, (state) => {
        state.isCreatingTransaction = true
        state.createTransactionError = null
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.isCreatingTransaction = false
        state.createTransactionError = null
        state.currentTransactionDetail = action.payload
        console.log('Transaction created successfully:', action.payload)
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.isCreatingTransaction = false
        state.createTransactionError = action.payload as string
        console.error('Create transaction failed:', action.payload)
      })
      
      // Update transaction
      .addCase(updateTransaction.pending, (state) => {
        state.isUpdatingTransaction = true
        state.updateTransactionError = null
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.isUpdatingTransaction = false
        state.updateTransactionError = null
        state.currentTransactionDetail = action.payload
        console.log('Transaction updated successfully:', action.payload)
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.isUpdatingTransaction = false
        state.updateTransactionError = action.payload as string
        console.error('Update transaction failed:', action.payload)
      })
      
      // Update transaction status
      .addCase(updateTransactionStatus.pending, (state) => {
        state.isUpdatingStatus = true
        state.updateStatusError = null
      })
      .addCase(updateTransactionStatus.fulfilled, (state, action) => {
        state.isUpdatingStatus = false
        state.updateStatusError = null
        state.currentTransactionDetail = action.payload
        console.log('Transaction status updated successfully:', action.payload)
      })
      .addCase(updateTransactionStatus.rejected, (state, action) => {
        state.isUpdatingStatus = false
        state.updateStatusError = action.payload as string
        console.error('Update transaction status failed:', action.payload)
      })
      
      // Propose transaction
      .addCase(proposeTransaction.pending, (state) => {
        state.isProposingTransaction = true
        state.proposeTransactionError = null
      })
      .addCase(proposeTransaction.fulfilled, (state, action) => {
        state.isProposingTransaction = false
        state.proposeTransactionError = null
        state.currentTransactionDetail = action.payload
        console.log('Transaction proposed successfully:', action.payload)
      })
      .addCase(proposeTransaction.rejected, (state, action) => {
        state.isProposingTransaction = false
        state.proposeTransactionError = action.payload as string
        console.error('Propose transaction failed:', action.payload)
      })
      
      // Approve transaction
      .addCase(approveTransaction.pending, (state) => {
        state.isApprovingTransaction = true
        state.approveTransactionError = null
      })
      .addCase(approveTransaction.fulfilled, (state, action) => {
        state.isApprovingTransaction = false
        state.approveTransactionError = null
        state.currentTransactionDetail = action.payload
        console.log('Transaction approved successfully:', action.payload)
      })
      .addCase(approveTransaction.rejected, (state, action) => {
        state.isApprovingTransaction = false
        state.approveTransactionError = action.payload as string
        console.error('Approve transaction failed:', action.payload)
      })
      
      // Reject transaction
      .addCase(rejectTransaction.pending, (state) => {
        state.isRejectingTransaction = true
        state.rejectTransactionError = null
      })
      .addCase(rejectTransaction.fulfilled, (state, action) => {
        state.isRejectingTransaction = false
        state.rejectTransactionError = null
        state.currentTransactionDetail = action.payload
        console.log('Transaction rejected successfully:', action.payload)
      })
      .addCase(rejectTransaction.rejected, (state, action) => {
        state.isRejectingTransaction = false
        state.rejectTransactionError = action.payload as string
        console.error('Reject transaction failed:', action.payload)
      })
      
      // Get transaction by ID
      .addCase(getTransactionById.pending, (state) => {
        state.isFetchingTransaction = true
        state.fetchTransactionError = null
      })
      .addCase(getTransactionById.fulfilled, (state, action) => {
        state.isFetchingTransaction = false
        state.fetchTransactionError = null
        state.currentTransactionDetail = action.payload
        console.log('Transaction fetched successfully:', action.payload)
      })
      .addCase(getTransactionById.rejected, (state, action) => {
        state.isFetchingTransaction = false
        state.fetchTransactionError = action.payload as string
        console.error('Get transaction failed:', action.payload)
      })
      
      // Filter transactions
      .addCase(filterTransactions.pending, (state) => {
        state.isFilteringTransactions = true
        state.filterTransactionError = null
      })
      .addCase(filterTransactions.fulfilled, (state, action) => {
        state.isFilteringTransactions = false
        state.filterTransactionError = null
        state.filteredTransactions = action.payload
        // Update current filter from request (similar to liquidation slice)
        state.currentFilter = {
          ...state.currentFilter,
          ...action.meta.arg, // action.meta.arg contains the filterRequest that was sent
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
        console.log('Transactions filtered successfully:', action.payload)
      })
      .addCase(filterTransactions.rejected, (state, action) => {
        state.isFilteringTransactions = false
        state.filterTransactionError = action.payload as string
        console.error('Filter transactions failed:', action.payload)
      })
      
      // Filter simplified transactions
      .addCase(filterSimplifiedTransactions.pending, (state) => {
        state.isFilteringTransactions = true
        state.filterTransactionError = null
      })
      .addCase(filterSimplifiedTransactions.fulfilled, (state, action) => {
        state.isFilteringTransactions = false
        state.filterTransactionError = null
        state.filteredTransactions = action.payload
        // Update current filter from request (similar to liquidation slice)
        state.currentFilter = {
          ...state.currentFilter,
          ...action.meta.arg, // action.meta.arg contains the filterRequest that was sent
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
        console.log('Simplified transactions filtered successfully:', action.payload)
      })
      .addCase(filterSimplifiedTransactions.rejected, (state, action) => {
        state.isFilteringTransactions = false
        state.filterTransactionError = action.payload as string
        console.error('Filter simplified transactions failed:', action.payload)
      })
  },
})

export const {
  setSelectedAssetsForHandover,
  setHandoverContext,
  clearHandoverContext,
  clearSelectedAssetsForHandover,
  addAssetForHandover,
  removeAssetFromHandover,
  setCurrentTransaction,
  clearCurrentTransaction,
  setTransactionLoading,
  setTransactionError,
  resetTransactionState,
  setCurrentFilter,
  clearCurrentTransactionDetail
} = transactionSlice.actions

export default transactionSlice.reducer
