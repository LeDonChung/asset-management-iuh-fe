import axiosInstance from "@/lib/api";
import {
    Asset,
  BaseFilterRequest,
  CreateLiquidationProposalDto,
  LiquidationProposal,
  LiquidationProposalFilterRequest,
  LiquidationProposalResponseDto,
  LiquidationProposedFilterRequest,
  LiquidationProposedInventoryResult,
  PaginatedResponse,
  UpdateLiquidationProposalDto,
  UpdateLiquidationStatusDto,
  UploadEvidenceDto,
  User,
  UserStatus,
} from "@/types/asset";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Additional DTOs for new endpoints
interface SendProposalDto {
  note?: string;
  evidenceUrl?: string;
}

interface ApproveProposalDto {
  note?: string;
  evidenceUrl: string;
}

interface FinalizeProposalDto {
  note?: string;
  evidenceUrl?: string;
}

interface LiquidationState {
  filteredLiquidationProposals: PaginatedResponse<LiquidationProposal>;
  currentFilter: LiquidationProposalFilterRequest;
  filteredLiquidationProposedInventoryResults: PaginatedResponse<LiquidationProposedInventoryResult>;
  currentLiquidationProposedFilter: LiquidationProposedFilterRequest;
  currentLiquidationProposal: LiquidationProposalResponseDto | null;
  user: User | null;
  isCreatingProposal: boolean;
  isUpdatingProposal: boolean;
  isUpdatingStatus: boolean;
  isUploadingEvidence: boolean;
  isSendingProposal: boolean;
  isApprovingProposal: boolean;
  isFinalizingProposal: boolean;
  isFetchingProposal: boolean;
  isExportingToExcel: boolean;
  isExportingAssetsToExcel: boolean;
  createProposalError: string | null;
  updateProposalError: string | null;
  updateStatusError: string | null;
  uploadEvidenceError: string | null;
  sendProposalError: string | null;
  approveProposalError: string | null;
  finalizeProposalError: string | null;
  fetchProposalError: string | null;
  exportToExcelError: string | null;
  exportAssetsToExcelError: string | null;
}

// Legacy interface - keeping for backward compatibility if needed
export interface InventoryResultLiquidationFilterRequest extends BaseFilterRequest {
  search?: string | null;
}

const initialState: LiquidationState = {
  filteredLiquidationProposals: {
    data: [],
    pagination: {
      page: 1,
      limit: 10,
    },
  },
  currentFilter: {
    search: null,
    pagination: {
      currentPage: 1,
      itemsPerPage: 10,
    },
    sorting: [],
  },
  filteredLiquidationProposedInventoryResults: {
    data: [],
    pagination: {
      page: 1,
      limit: 10,
    },
  },
  currentLiquidationProposedFilter: {
    pagination: {
      currentPage: 1,
      itemsPerPage: 10,
    },
    sorting: [],
  },
  currentLiquidationProposal: null,
  user: null,
  isCreatingProposal: false,
  isUpdatingProposal: false,
  isUpdatingStatus: false,
  isUploadingEvidence: false,
  isSendingProposal: false,
  isApprovingProposal: false,
  isFinalizingProposal: false,
  isFetchingProposal: false,
  isExportingToExcel: false,
  isExportingAssetsToExcel: false,
  createProposalError: null,
  updateProposalError: null,
  updateStatusError: null,
  uploadEvidenceError: null,
  sendProposalError: null,
  approveProposalError: null,
  finalizeProposalError: null,
  fetchProposalError: null,
  exportToExcelError: null,
  exportAssetsToExcelError: null,
};

export const filterLiquidationProposals = createAsyncThunk(
  "liquidation/filterLiquidationProposals",
  async (filterRequest: LiquidationProposalFilterRequest, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/api/v1/liquidations/filter",
        filterRequest
      );
      return response.data as PaginatedResponse<LiquidationProposal>;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const filterLiquidationProposedInventoryResults = createAsyncThunk(
  "liquidation/filterLiquidationProposedInventoryResults",
  async (filterRequest: LiquidationProposedFilterRequest, { rejectWithValue }) => {
    try {
      console.log("API call with filterRequest:", filterRequest);
      const response = await axiosInstance.post(
        "/api/v1/asset-books/liquidation-proposed/filter",
        filterRequest
      );
      console.log("API response:", response.data);
      return response.data as PaginatedResponse<LiquidationProposedInventoryResult>;
    } catch (error: any) {
      console.error("API error:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createLiquidationProposal = createAsyncThunk(
  "liquidation/createLiquidationProposal",
  async (createDto: CreateLiquidationProposalDto, { rejectWithValue }) => {
    try {
      console.log("Creating liquidation proposal with data:", createDto);
      const response = await axiosInstance.post(
        "/api/v1/liquidations",
        createDto
      );
      console.log("Create liquidation proposal response:", response.data);
      return response.data as LiquidationProposalResponseDto;
    } catch (error: any) {
      console.error("Create liquidation proposal error:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateLiquidationStatus = createAsyncThunk(
  "liquidation/updateLiquidationStatus",
  async ({ id, updateDto }: { id: string; updateDto: UpdateLiquidationStatusDto }, { rejectWithValue }) => {
    try {
      console.log("Updating liquidation status:", id, updateDto);
      const response = await axiosInstance.patch(
        `/api/v1/liquidations/${id}/status`,
        updateDto
      );
      console.log("Update liquidation status response:", response.data);
      return response.data as LiquidationProposalResponseDto;
    } catch (error: any) {
      console.error("Update liquidation status error:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const uploadLiquidationEvidence = createAsyncThunk(
  "liquidation/uploadLiquidationEvidence",
  async ({ id, evidenceDto }: { id: string; evidenceDto: UploadEvidenceDto }, { rejectWithValue }) => {
    try {
      console.log("Uploading liquidation evidence:", id, evidenceDto);
      const response = await axiosInstance.post(
        `/api/v1/liquidations/${id}/evidence`,
        evidenceDto
      );
      console.log("Upload liquidation evidence response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Upload liquidation evidence error:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const sendLiquidationProposal = createAsyncThunk(
  "liquidation/sendLiquidationProposal",
  async ({ id, sendDto }: { id: string; sendDto: SendProposalDto }, { rejectWithValue }) => {
    try {
      console.log("Sending liquidation proposal:", id, sendDto);
      const response = await axiosInstance.patch(
        `/api/v1/liquidations/${id}/send`,
        sendDto
      );
      console.log("Send liquidation proposal response:", response.data);
      return response.data as LiquidationProposalResponseDto;
    } catch (error: any) {
      console.error("Send liquidation proposal error:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const approveLiquidationProposal = createAsyncThunk(
  "liquidation/approveLiquidationProposal",
  async ({ id, approveDto }: { id: string; approveDto: ApproveProposalDto }, { rejectWithValue }) => {
    try {
      console.log("Approving liquidation proposal:", id, approveDto);
      const response = await axiosInstance.patch(
        `/api/v1/liquidations/${id}/approve`,
        approveDto
      );
      console.log("Approve liquidation proposal response:", response.data);
      return response.data as LiquidationProposalResponseDto;
    } catch (error: any) {
      console.error("Approve liquidation proposal error:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const finalizeLiquidationProposal = createAsyncThunk(
  "liquidation/finalizeLiquidationProposal",
  async ({ id, finalizeDto }: { id: string; finalizeDto: FinalizeProposalDto }, { rejectWithValue }) => {
    try {
      console.log("Finalizing liquidation proposal:", id, finalizeDto);
      const response = await axiosInstance.patch(
        `/api/v1/liquidations/${id}/finalize`,
        finalizeDto
      );
      console.log("Finalize liquidation proposal response:", response.data);
      return response.data as LiquidationProposalResponseDto;
    } catch (error: any) {
      console.error("Finalize liquidation proposal error:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getLiquidationProposalById = createAsyncThunk(
  "liquidation/getLiquidationProposalById",
  async (id: string, { rejectWithValue }) => {
    try {
      console.log("Fetching liquidation proposal by ID:", id);
      const response = await axiosInstance.get(`/api/v1/liquidations/${id}`);
      console.log("Get liquidation proposal response:", response.data);
      return response.data as LiquidationProposalResponseDto;
    } catch (error: any) {
      console.error("Get liquidation proposal error:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateLiquidationProposal = createAsyncThunk(
  "liquidation/updateLiquidationProposal",
  async ({ id, updateDto }: { id: string; updateDto: UpdateLiquidationProposalDto }, { rejectWithValue }) => {
    try {
      console.log("Updating liquidation proposal:", id, updateDto);
      const response = await axiosInstance.put(
        `/api/v1/liquidations/${id}`,
        updateDto
      );
      console.log("Update liquidation proposal response:", response.data);
      return response.data as LiquidationProposalResponseDto;
    } catch (error: any) {
      console.error("Update liquidation proposal error:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const exportLiquidationToExcel = createAsyncThunk(
  "liquidation/exportLiquidationToExcel",
  async (id: string, { rejectWithValue }) => {
    try {
      console.log("Exporting liquidation proposal to Excel:", id);
      const response = await axiosInstance.get(
        `/api/v1/liquidations/${id}/export`,
        {
          responseType: "blob",
        }
      );
      
      // Tạo URL để download file
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Danh_muc_thanh_ly_${id}_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log("Export liquidation proposal to Excel successful");
      return { success: true };
    } catch (error: any) {
      console.error("Export liquidation proposal to Excel error:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const exportLiquidationAssetsToExcel = createAsyncThunk(
  "liquidation/exportLiquidationAssetsToExcel",
  async (id: string, { rejectWithValue }) => {
    try {
      console.log("Exporting liquidation assets to Excel:", id);
      const response = await axiosInstance.get(
        `/api/v1/liquidations/${id}/export-assets`,
        {
          responseType: "blob",
        }
      );
      
      // Tạo URL để download file
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Danh_sach_tai_san_thanh_ly_${id}_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log("Export liquidation assets to Excel successful");
      return { success: true };
    } catch (error: any) {
      console.error("Export liquidation assets to Excel error:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Legacy function - keeping for backward compatibility if needed
export const filterInventoryResultLiquidation = createAsyncThunk(
  "liquidation/filterInventoryResultLiquidation",
  async (filterRequest: InventoryResultLiquidationFilterRequest, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/api/v1/asset-books/filter",
        filterRequest
      );
      return response.data as PaginatedResponse<Asset>;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const liquidationSlice = createSlice({
  name: "liquidation",
  initialState,
  reducers: {
    currentFilterLiquidationProposal: (state, action) => {
      state.currentFilter = action.payload;
    },
    currentFilterLiquidationProposed: (state, action) => {
      state.currentLiquidationProposedFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Filter liquidation proposals
      .addCase(filterLiquidationProposals.pending, (state) => {})
      .addCase(filterLiquidationProposals.fulfilled, (state, action) => {
        state.filteredLiquidationProposals = action.payload;
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
      .addCase(filterLiquidationProposals.rejected, (state, action) => {
        console.log(action.payload as any);
      })
      
      // Filter liquidation proposed inventory results
      .addCase(filterLiquidationProposedInventoryResults.pending, (state) => {})
      .addCase(filterLiquidationProposedInventoryResults.fulfilled, (state, action) => {
        state.filteredLiquidationProposedInventoryResults = action.payload;
        // Cập nhật currentLiquidationProposedFilter từ request được gửi đi
        state.currentLiquidationProposedFilter = {
          ...state.currentLiquidationProposedFilter,
          ...action.meta.arg, // action.meta.arg chứa filterRequest đã gửi
        };
        if (state.currentLiquidationProposedFilter.pagination && action.payload.pagination) {
          state.currentLiquidationProposedFilter.pagination = {
            ...state.currentLiquidationProposedFilter.pagination,
            currentPage: action.payload.pagination.page,
            totalItems: action.payload.pagination.total,
            totalPages: action.payload.pagination.totalPages,
            itemsPerPage: action.payload.pagination.limit,
          };
        }
      })
      .addCase(filterLiquidationProposedInventoryResults.rejected, (state, action) => {
        console.log(action.payload as any);
      })
      
      // Legacy: Filter inventory result liquidation
      .addCase(filterInventoryResultLiquidation.pending, (state) => {})
      .addCase(filterInventoryResultLiquidation.fulfilled, (state, action) => {
        // Handle legacy if needed - for now just log
        console.log("Legacy filterInventoryResultLiquidation fulfilled", action.payload);
      })
      .addCase(filterInventoryResultLiquidation.rejected, (state, action) => {
        console.log(action.payload as any);
      })
      
      // Create liquidation proposal
      .addCase(createLiquidationProposal.pending, (state) => {
        state.isCreatingProposal = true;
        state.createProposalError = null;
      })
      .addCase(createLiquidationProposal.fulfilled, (state, action) => {
        state.isCreatingProposal = false;
        state.createProposalError = null;
        // Optionally add the created proposal to the list if needed
        console.log("Liquidation proposal created successfully:", action.payload);
      })
      .addCase(createLiquidationProposal.rejected, (state, action) => {
        state.isCreatingProposal = false;
        state.createProposalError = action.payload as string;
        console.error("Create liquidation proposal failed:", action.payload);
      })
      
      // Update liquidation status
      .addCase(updateLiquidationStatus.pending, (state) => {
        state.isUpdatingStatus = true;
        state.updateStatusError = null;
      })
      .addCase(updateLiquidationStatus.fulfilled, (state, action) => {
        state.isUpdatingStatus = false;
        state.updateStatusError = null;
        console.log("Liquidation status updated successfully:", action.payload);
      })
      .addCase(updateLiquidationStatus.rejected, (state, action) => {
        state.isUpdatingStatus = false;
        state.updateStatusError = action.payload as string;
        console.error("Update liquidation status failed:", action.payload);
      })
      
      // Upload liquidation evidence
      .addCase(uploadLiquidationEvidence.pending, (state) => {
        state.isUploadingEvidence = true;
        state.uploadEvidenceError = null;
      })
      .addCase(uploadLiquidationEvidence.fulfilled, (state, action) => {
        state.isUploadingEvidence = false;
        state.uploadEvidenceError = null;
        console.log("Liquidation evidence uploaded successfully:", action.payload);
      })
      .addCase(uploadLiquidationEvidence.rejected, (state, action) => {
        state.isUploadingEvidence = false;
        state.uploadEvidenceError = action.payload as string;
        console.error("Upload liquidation evidence failed:", action.payload);
      })
      
      // Send liquidation proposal
      .addCase(sendLiquidationProposal.pending, (state) => {
        state.isSendingProposal = true;
        state.sendProposalError = null;
      })
      .addCase(sendLiquidationProposal.fulfilled, (state, action) => {
        state.isSendingProposal = false;
        state.sendProposalError = null;
        console.log("Liquidation proposal sent successfully:", action.payload);
      })
      .addCase(sendLiquidationProposal.rejected, (state, action) => {
        state.isSendingProposal = false;
        state.sendProposalError = action.payload as string;
        console.error("Send liquidation proposal failed:", action.payload);
      })
      
      // Approve liquidation proposal
      .addCase(approveLiquidationProposal.pending, (state) => {
        state.isApprovingProposal = true;
        state.approveProposalError = null;
      })
      .addCase(approveLiquidationProposal.fulfilled, (state, action) => {
        state.isApprovingProposal = false;
        state.approveProposalError = null;
        console.log("Liquidation proposal approved successfully:", action.payload);
      })
      .addCase(approveLiquidationProposal.rejected, (state, action) => {
        state.isApprovingProposal = false;
        state.approveProposalError = action.payload as string;
        console.error("Approve liquidation proposal failed:", action.payload);
      })
      
      // Finalize liquidation proposal
      .addCase(finalizeLiquidationProposal.pending, (state) => {
        state.isFinalizingProposal = true;
        state.finalizeProposalError = null;
      })
      .addCase(finalizeLiquidationProposal.fulfilled, (state, action) => {
        state.isFinalizingProposal = false;
        state.finalizeProposalError = null;
        console.log("Liquidation proposal finalized successfully:", action.payload);
      })
      .addCase(finalizeLiquidationProposal.rejected, (state, action) => {
        state.isFinalizingProposal = false;
        state.finalizeProposalError = action.payload as string;
        console.error("Finalize liquidation proposal failed:", action.payload);
      })
      
      // Get liquidation proposal by ID
      .addCase(getLiquidationProposalById.pending, (state) => {
        state.isFetchingProposal = true;
        state.fetchProposalError = null;
      })
      .addCase(getLiquidationProposalById.fulfilled, (state, action) => {
        state.isFetchingProposal = false;
        state.fetchProposalError = null;
        state.currentLiquidationProposal = action.payload;
        console.log("Liquidation proposal fetched successfully:", action.payload);
      })
      .addCase(getLiquidationProposalById.rejected, (state, action) => {
        state.isFetchingProposal = false;
        state.fetchProposalError = action.payload as string;
        console.error("Get liquidation proposal failed:", action.payload);
      })
      
      // Update liquidation proposal
      .addCase(updateLiquidationProposal.pending, (state) => {
        state.isUpdatingProposal = true;
        state.updateProposalError = null;
      })
      .addCase(updateLiquidationProposal.fulfilled, (state, action) => {
        state.isUpdatingProposal = false;
        state.updateProposalError = null;
        state.currentLiquidationProposal = action.payload;
        console.log("Liquidation proposal updated successfully:", action.payload);
      })
      .addCase(updateLiquidationProposal.rejected, (state, action) => {
        state.isUpdatingProposal = false;
        const errorPayload = action.payload as any;
        state.updateProposalError = errorPayload?.message || errorPayload?.response?.data?.message || "Có lỗi xảy ra khi cập nhật đề xuất thanh lý";
        console.error("Update liquidation proposal failed:", action.payload);
      })
      
      // Export liquidation to Excel
      .addCase(exportLiquidationToExcel.pending, (state) => {
        state.isExportingToExcel = true;
        state.exportToExcelError = null;
      })
      .addCase(exportLiquidationToExcel.fulfilled, (state) => {
        state.isExportingToExcel = false;
        state.exportToExcelError = null;
        console.log("Export liquidation to Excel successful");
      })
      .addCase(exportLiquidationToExcel.rejected, (state, action) => {
        state.isExportingToExcel = false;
        state.exportToExcelError = action.payload as string;
        console.error("Export liquidation to Excel failed:", action.payload);
      })
      
      // Export liquidation assets to Excel
      .addCase(exportLiquidationAssetsToExcel.pending, (state) => {
        state.isExportingAssetsToExcel = true;
        state.exportAssetsToExcelError = null;
      })
      .addCase(exportLiquidationAssetsToExcel.fulfilled, (state) => {
        state.isExportingAssetsToExcel = false;
        state.exportAssetsToExcelError = null;
        console.log("Export liquidation assets to Excel successful");
      })
      .addCase(exportLiquidationAssetsToExcel.rejected, (state, action) => {
        state.isExportingAssetsToExcel = false;
        state.exportAssetsToExcelError = action.payload as string;
        console.error("Export liquidation assets to Excel failed:", action.payload);
      });
  },
});

export const { 
  currentFilterLiquidationProposal, 
  currentFilterLiquidationProposed 
} = liquidationSlice.actions;
export default liquidationSlice.reducer;
