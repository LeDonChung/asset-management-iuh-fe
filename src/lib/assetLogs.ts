import { AssetStatus, AssetLog } from "@/types/asset";

// Mock data cho demo - logs của các tài sản
export const mockAssetLogs: AssetLog[] = [
  {
    id: "log1",
    assetId: "1",
    action: "Tạo mới tài sản",
    reason: "Nhập tài sản mới từ gói mua số 1",
    status: AssetStatus.CHO_PHAN_BO,
    createdBy: "user1",
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    id: "log2", 
    assetId: "1",
    action: "Bàn giao tài sản",
    reason: "Bàn giao tài sản từ phòng kế hoạch đầu tư sang phòng quản trị",
    status: AssetStatus.DANG_SU_DUNG,
    createdBy: "user1",
    createdAt: "2024-01-16T14:30:00Z"
  },
  {
    id: "log3",
    assetId: "1", 
    action: "Phân bổ tài sản",
    reason: "Phân bổ tài sản cho Khoa Công nghệ thông tin",
    fromLocation: "Phòng quản trị",
    toLocation: "Khoa Công nghệ thông tin - Phòng IT 09",
    status: AssetStatus.CHO_PHAN_BO,
    createdBy: "admin",
    createdAt: "2024-01-17T09:15:00Z"
  },
  {
    id: "log4",
    assetId: "1",
    action: "Di chuyển tài sản", 
    reason: "Di chuyển tài sản đến vị trí sử dụng thực tế",
    fromLocation: "Vị trí dự kiến: Phòng IT 09",
    toLocation: "Vị trí thực tế: Phòng IT 09",
    status: AssetStatus.DANG_SU_DUNG,
    createdBy: "unit_user",
    createdAt: "2024-01-18T11:00:00Z"
  }
];

// Hàm để tạo log mới
export const createAssetLog = (
  assetId: string,
  action: string,
  reason: string,
  status: AssetStatus,
  createdBy: string,
  fromLocation?: string,
  toLocation?: string
): AssetLog => {
  return {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    assetId,
    action,
    reason,
    fromLocation,
    toLocation,
    status,
    createdBy,
    createdAt: new Date().toISOString()
  };
};

// Hàm để lấy logs của một tài sản
export const getAssetLogs = (assetId: string): AssetLog[] => {
  return mockAssetLogs
    .filter(log => log.assetId === assetId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Hàm để lấy tất cả logs
export const getAllLogs = (): AssetLog[] => {
  return mockAssetLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};
