import axiosInstance from "../api";

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
};
