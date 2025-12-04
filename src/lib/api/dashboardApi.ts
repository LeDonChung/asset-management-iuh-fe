import { axiosInstance } from '../api';

export interface AssetStatsByStatus {
  status: string;
  count: number;
  percentage: number;
}

export interface AssetStatsByCategory {
  categoryId: string;
  categoryName: string;
  count: number;
  percentage: number;
}

export interface AssetStatsByType {
  type: string;
  count: number;
  percentage: number;
}

export interface TopLocation {
  roomId: string;
  roomName: string;
  roomCode: string;
  assetCount: number;
}

export interface UnitStatistics {
  unitId: string;
  unitName: string;
  unitCode: number;
  totalAssets: number;
  fixedAssets: number;
  toolsEquipment: number;
  inUseAssets: number;
  damagedAssets: number;
}

export interface RecentActivity {
  id: string;
  type: 'create' | 'update' | 'transaction' | 'movement' | 'liquidation' | 'inventory';
  title: string;
  description: string;
  userName: string;
  userId: string;
  createdAt: string;
}

export interface DashboardStats {
  totalAssets: number;
  fixedAssets: number;
  toolsEquipment: number;
  inUseAssets: number;
  damagedAssets: number;
  lostAssets: number;
  proposedLiquidationAssets: number;
  liquidatedAssets: number;
  unidentifiedAssets: number;
  pendingTransactions: number;
  approvedTransactions: number;
  completedTransactions: number;
  pendingMovements: number;
  completedMovements: number;
  assetsByStatus: AssetStatsByStatus[];
  assetsByCategory: AssetStatsByCategory[];
  assetsByType: AssetStatsByType[];
  topLocations: TopLocation[];
  unitStatistics: UnitStatistics[];
  recentActivities: RecentActivity[];
}

export const dashboardApi = {
  /**
   * Lấy thống kê tổng quan cho dashboard
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await axiosInstance.get('/api/v1/dashboard/stats');
    return response.data;
  },
};

