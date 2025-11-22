import axiosInstance from "../api";
import { AssetBook } from "@/types/asset";

export interface CreateAssetBookFromInventoryRequest {
  assignmentId: string;
  year: number;
  roomIds?: string[];
  note?: string;
}

export interface CreateAssetBookFromInventoryResponse extends AssetBook {
}

export const assetBookApi = {
  /**
   * Tạo sổ tài sản từ kết quả kiểm kê của đơn vị phân công
   */
  createAssetBookFromInventory: async (
    request: CreateAssetBookFromInventoryRequest
  ): Promise<CreateAssetBookFromInventoryResponse> => {
    const response = await axiosInstance.post(
      `/api/v1/asset-books/create-from-inventory`,
      request
    );
    return response.data;
  },

  /**
   * Lấy sổ tài sản theo ID
   */
  getAssetBook: async (id: string): Promise<AssetBook> => {
    const response = await axiosInstance.get(`/api/v1/asset-books/${id}`);
    return response.data;
  },

  /**
   * Lấy danh sách sổ tài sản theo đơn vị
   */
  getAssetBooksByUnit: async (unitId: string): Promise<AssetBook[]> => {
    const response = await axiosInstance.get(`/api/v1/asset-books/unit/${unitId}`);
    return response.data;
  },

  /**
   * Lấy sổ tài sản theo đơn vị và năm
   */
  getAssetBookByUnitAndYear: async (
    unitId: string, 
    year: number
  ): Promise<AssetBook> => {
    const response = await axiosInstance.get(
      `/api/v1/asset-books/unit/${unitId}/year/${year}`
    );
    return response.data;
  },

  /**
   * Lấy sổ tài sản hiện tại của đơn vị
   */
  getCurrentAssetBookByUnit: async (unitId: string): Promise<AssetBook> => {
    const response = await axiosInstance.get(`/api/v1/asset-books/unit/${unitId}/current`);
    return response.data;
  },

  /**
   * Lấy sổ tài sản theo đơn vị, phòng và loại tài sản
   */
  getAssetBookByUnitAndRoom: async (
    unitId: string,
    roomId: string,
    assetType?: string
  ): Promise<AssetBook> => {
    const url = `/api/v1/asset-books/unit/${unitId}/room/${roomId}`;
    const params = assetType ? { assetType } : {};
    const response = await axiosInstance.get(url, { params });
    return response.data;
  }
};
