import { axiosInstance } from '../api';

export interface LocationUpdateItem {
  assetId: string;
  roomId: string;
  note?: string;
}

export interface BulkLocationUpdateRequest {
  items: LocationUpdateItem[];
  generalNote?: string;
}

export interface BulkLocationUpdateResult {
  successCount: number;
  errorCount: number;
  totalCount: number;
  successAssetIds: string[];
  errors: string[];
  executedAt: string;
  executedBy: string;
}

export const assetApi = {
  /**
   * Cập nhật vị trí hàng loạt cho tài sản warehouse
   */
  bulkUpdateLocations: async (data: BulkLocationUpdateRequest): Promise<BulkLocationUpdateResult> => {
    const response = await axiosInstance.post('/api/v1/assets/bulk-update-locations', data);
    return response.data;
  },
};
