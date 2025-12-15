import axiosInstance from "../api";
import { InventoryResultResponseDto } from "../store/slices/inventorySlice";

export enum AssetActionStatus {
  MATCHED = 'MATCHED',
  MISSING = 'MISSING',
  EXCESS = 'EXCESS',
  BROKEN = 'BROKEN',
  NEEDS_REPAIR = 'NEEDS_REPAIR',
  LIQUIDATION_PROPOSED = 'LIQUIDATION_PROPOSED'
}

export enum ScanMethod {
  RFID = 'RFID',
  MANUAL = 'MANUAL'
}

export interface AssetInventoryDetail {
  quantity: number;
  status: AssetActionStatus;
  note?: string;
  imageUrls?: string[];
  updatedAt: string;
}

export interface SaveTempInventoryRequest {
  roomId: string;
  unitId: string;
  sessionId: string;
  inventoryResults: { [assetId: string]: AssetInventoryDetail };
  note?: string;
  ttlSeconds?: number;
}

export interface TempInventoryResponse {
  roomId: string;
  unitId: string;
  sessionId: string;
  inventoryResults: { [assetId: string]: AssetInventoryDetail };
  note?: string;
  createdAt: string;
  expiresAt: string;
  ttl: number;
  totalAssets: number;
  matchedAssets: number;
  missingAssets: number;
  excessAssets: number;
  brokenAssets: number;
  needsRepairAssets: number;
  liquidationProposedAssets: number;
}

// Export Excel Types
export interface ExportInventoryExcelRequest {
  roomId: string;
  assignmentId?: string;
  assetType?: 'FIXED_ASSET' | 'TOOLS_EQUIPMENT';
  statusFilter?: string[];
  fileName?: string;
  includeImages?: boolean;
}

export interface ExportMultiRoomInventoryExcelRequest {
  unitId: string;
  assignmentId?: string;
  roomIds?: string[];
  assetType?: 'FIXED_ASSET' | 'TOOLS_EQUIPMENT';
  statusFilter?: string[];
  fileName?: string;
  includeImages?: boolean;
}

// Submit Inventory Result Types
export interface SubmitInventoryResultItem {
  assetId: string;
  systemQuantity: number;
  countedQuantity: number;
  scanMethod: ScanMethod;
  status: AssetActionStatus;
  note?: string;
  imageUrls?: string[];
}

export interface SubmitInventoryResultRequest {
  assignmentId: string;
  results: SubmitInventoryResultItem[];
  note?: string;
}

export interface SubmittedInventoryResultItem {
  id: string;
  assetId: string;
  systemQuantity: number;
  countedQuantity: number;
  scanMethod: ScanMethod;
  status: AssetActionStatus;
  note: string;
  imageUrls: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitInventoryResultResponse {
  assignmentId: string;
  results: SubmittedInventoryResultItem[];
  note: string;
  totalResults: number;
  statistics: {
    totalAssets: number;
    matchedAssets: number;
    missingAssets: number;
    excessAssets: number;
    brokenAssets: number;
    needsRepairAssets: number;
    liquidationProposedAssets: number;
  };
  submittedAt: string;
}

export const inventoryApi = {
  /**
   * Lưu kết quả kiểm kê tạm thời vào Redis
   */
  saveTempResults: async (data: SaveTempInventoryRequest): Promise<TempInventoryResponse> => {
    const response = await axiosInstance.post('/api/v1/inventories/temp-results', data);
    return response.data;
  },

  /**
   * Lấy kết quả kiểm kê tạm thời theo roomId
   */
  getTempResults: async (roomId: string): Promise<TempInventoryResponse | null> => {
    try {
      const response = await axiosInstance.get(`/api/v1/inventories/temp-results/${roomId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Xóa kết quả kiểm kê tạm thời theo roomId
   */
  deleteTempResults: async (roomId: string): Promise<void> => {
    await axiosInstance.delete(`/api/v1/inventories/temp-results/${roomId}`);
  },

  /**
   * Lấy tất cả kết quả kiểm kê tạm thời
   */
  getAllTempResults: async (): Promise<TempInventoryResponse[]> => {
    const response = await axiosInstance.get('/api/v1/inventories/temp-results');
    return response.data;
  },

  /**
   * Submit kết quả kiểm kê chính thức
   */
  submitInventoryResult: async (data: SubmitInventoryResultRequest): Promise<SubmitInventoryResultResponse> => {
    const response = await axiosInstance.post('/api/v1/inventories/submit-result', data);
    return response.data;
  },

  /**
   * Lấy trạng thái kiểm kê của các phòng trong phân công
   */
  getRoomsInventoryStatus: async (assignmentId: string): Promise<{roomId: string, status: boolean}[]> => {
    const response = await axiosInstance.get(`/api/v1/inventories/rooms-inventory-status/${assignmentId}`);
    return response.data;
  },

  /**
   * Lấy kết quả kiểm kê của một phòng cụ thể
   */
  getRoomInventoryResults: async (roomId: string, assignmentId: string): Promise<TempInventoryResponse[]> => {
    const response = await axiosInstance.get(`/api/v1/inventories/room-inventory-results/${roomId}/${assignmentId}`);
    return response.data;
  },

  /**
   * Xuất file Excel kết quả kiểm kê cho một phòng
   */
  exportRoomInventoryToExcel: async (data: ExportInventoryExcelRequest): Promise<void> => {
    const response = await axiosInstance.post('/api/v1/inventories/export-excel/room', data, {
      responseType: 'blob',
    });
    
    // Tạo tên file
    const fileName = data.fileName 
      ? `${data.fileName}.xlsx` 
      : `Ket_qua_kiem_ke_phong_${data.roomId.substring(0, 8)}_${new Date().getTime()}.xlsx`;
    
    // Tạo URL để download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Xuất file Excel kết quả kiểm kê cho nhiều phòng của đơn vị
   */
  exportMultiRoomInventoryToExcel: async (data: ExportMultiRoomInventoryExcelRequest): Promise<void> => {
    const response = await axiosInstance.post('/api/v1/inventories/export-excel/multi-room', data, {
      responseType: 'blob',
    });
    
    // Tạo tên file
    const fileName = data.fileName 
      ? `${data.fileName}.xlsx` 
      : `Ket_qua_kiem_ke_don_vi_${data.unitId.substring(0, 8)}_${new Date().getTime()}.xlsx`;
    
    // Tạo URL để download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Cập nhật số lượng kết quả kiểm kê
   */
  updateInventoryResult: async (resultId: string, data: { countedQuantity: number }): Promise<InventoryResultResponseDto> => {
    const response = await axiosInstance.patch(`/api/v1/inventories/inventory-results/${resultId}`, data);
    return response.data;
  },

  /**
   * Lấy thống kê kết quả kiểm kê theo nhiều mức độ
   */
  getInventoryStatistics: async (filters: {
    level?: 'ALL' | 'SESSION_UNIT' | 'GROUP' | 'ASSIGNMENT' | 'ROOM';
    sessionUnitId?: string;
    groupId?: string;
    assignmentId?: string;
    roomId?: string;
    assetType?: string;
  }): Promise<any> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    const response = await axiosInstance.get(`/api/v1/inventories/statistics?${params.toString()}`);
    return response.data;
  },
};

export type { InventoryResultResponseDto };
