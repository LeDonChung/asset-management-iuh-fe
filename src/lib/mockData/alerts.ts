import {
  Alert,
  AlertStatus,
  AlertType,
  AlertResolution,
  AlertResolutionStatus,
} from '@/types/asset';
import { mockAssets } from './assets';
import { mockRooms } from './rooms';
import { mockUsers } from './users';

// Mock Alerts Data
export const mockAlerts: Alert[] = [
  {
    id: "alert-001",
    assetId: "asset-001",
    detectedAt: "2025-09-06T10:21:00Z",
    roomId: "room-gate-001",
    type: AlertType.UNAUTHORIZED_MOVEMENT,
    status: AlertStatus.PENDING,
    createdAt: "2025-09-06T10:21:00Z",
    asset: mockAssets[0], // Laptop HP Pavilion
    room: mockRooms.find(r => r.name?.includes("Cổng chính")) || {
      id: "room-gate-001",
      name: "Cổng chính",
      building: "Tòa A",
      floor: "Tầng 1",
      roomNumber: "Cổng ra chính",
      status: "ACTIVE" as any,
      unitId: "unit-001",
      createdBy: "system",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
  },
  {
    id: "alert-002",
    assetId: "asset-002",
    detectedAt: "2025-09-06T10:05:00Z",
    roomId: "room-meeting-001",
    type: AlertType.UNAUTHORIZED_MOVEMENT,
    status: AlertStatus.PENDING,
    createdAt: "2025-09-06T10:05:00Z",
    asset: mockAssets[1], // Máy chiếu EPSON
    room: mockRooms.find(r => r.name?.includes("Phòng họp A")) || {
      id: "room-meeting-001",
      name: "Phòng họp A",
      building: "Tòa B",
      floor: "Tầng 2",
      roomNumber: "B201",
      status: "ACTIVE" as any,
      unitId: "unit-002",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
  },
  {
    id: "alert-003",
    assetId: "asset-003",
    detectedAt: "2025-09-06T09:58:00Z",
    roomId: "room-corridor-b1",
    type: AlertType.UNAUTHORIZED_MOVEMENT,
    status: AlertStatus.RESOLVED,
    createdAt: "2025-09-06T09:58:00Z",
    asset: mockAssets[2], // Camera Sony
    room: {
      id: "room-corridor-b1",
      name: "Lối đi B1",
      building: "Tòa B",
      floor: "Tầng 1",
      roomNumber: "Lối đi B1",
      status: "ACTIVE" as any,
      unitId: "unit-003",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    resolution: {
      id: "resolution-001",
      alertId: "alert-003",
      resolverId: "user-001",
      resolution: AlertResolutionStatus.FALSE_ALARM,
      note: "Máy chiếu được di chuyển theo lịch họp đã đăng ký trước",
      resolvedAt: "2025-09-06T10:15:00Z",
      resolver: mockUsers.find(u => u.fullName.includes("Admin")) || mockUsers[0],
    },
  },
  {
    id: "alert-004",
    assetId: "asset-004",
    detectedAt: "2025-09-06T09:45:00Z",
    roomId: "room-hallway-b1",
    type: AlertType.UNAUTHORIZED_MOVEMENT,
    status: AlertStatus.PENDING,
    createdAt: "2025-09-06T09:45:00Z",
    asset: mockAssets[3], // Sony device
    room: {
      id: "room-hallway-b1",
      name: "Hành lang B1",
      building: "Tòa B",
      floor: "Tầng 1",
      roomNumber: "Hành lang B1",
      status: "ACTIVE" as any,
      unitId: "unit-003",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
  },
  {
    id: "alert-005",
    assetId: "asset-005",
    detectedAt: "2025-09-06T08:30:00Z",
    roomId: "room-parking-001",
    type: AlertType.UNAUTHORIZED_MOVEMENT,
    status: AlertStatus.RESOLVED,
    createdAt: "2025-09-06T08:30:00Z",
    asset: mockAssets[4], // Dell laptop
    room: {
      id: "room-parking-001",
      name: "Bãi đỗ xe",
      building: "Khu vực ngoài",
      floor: "Tầng trệt",
      roomNumber: "Bãi đỗ xe chính",
      status: "ACTIVE" as any,
      unitId: "unit-004",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    resolution: {
      id: "resolution-002",
      alertId: "alert-005",
      resolverId: "user-002",
      resolution: AlertResolutionStatus.CONFIRMED,
      note: "Laptop bị nhân viên mang ra ngoài không được phép. Đã liên hệ thu hồi.",
      resolvedAt: "2025-09-06T09:00:00Z",
      resolver: mockUsers.find(u => u.fullName.includes("Quản")) || mockUsers[1],
    },
  },
  {
    id: "alert-006",
    assetId: "asset-006",
    detectedAt: "2025-09-06T07:15:00Z",
    roomId: "room-lab-001",
    type: AlertType.UNAUTHORIZED_MOVEMENT,
    status: AlertStatus.RESOLVED,
    createdAt: "2025-09-06T07:15:00Z",
    asset: mockAssets[5] || mockAssets[0], // Canon printer or fallback
    room: {
      id: "room-lab-001",
      name: "Phòng thí nghiệm",
      building: "Tòa C",
      floor: "Tầng 3",
      roomNumber: "C301",
      status: "ACTIVE" as any,
      unitId: "unit-005",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    resolution: {
      id: "resolution-003",
      alertId: "alert-006",
      resolverId: "user-003",
      resolution: AlertResolutionStatus.SYSTEM_ERROR,
      note: "RFID reader bị lỗi, đọc nhầm thẻ tài sản. Đã kiểm tra và máy in vẫn ở vị trí cũ.",
      resolvedAt: "2025-09-06T07:45:00Z",
      resolver: mockUsers.find(u => u.fullName.includes("Kỹ thuật")) || mockUsers[2],
    },
  },
];

// Mock Alert Resolutions Data
export const mockAlertResolutions: AlertResolution[] = [
  {
    id: "resolution-001",
    alertId: "alert-003",
    resolverId: "user-001",
    resolution: AlertResolutionStatus.FALSE_ALARM,
    note: "Máy chiếu được di chuyển theo lịch họp đã đăng ký trước",
    resolvedAt: "2025-09-06T10:15:00Z",
    resolver: mockUsers.find(u => u.fullName.includes("Admin")) || mockUsers[0],
  },
  {
    id: "resolution-002",
    alertId: "alert-005",
    resolverId: "user-002",
    resolution: AlertResolutionStatus.CONFIRMED,
    note: "Laptop bị nhân viên mang ra ngoài không được phép. Đã liên hệ thu hồi.",
    resolvedAt: "2025-09-06T09:00:00Z",
    resolver: mockUsers.find(u => u.fullName.includes("Quản")) || mockUsers[1],
  },
  {
    id: "resolution-003",
    alertId: "alert-006",
    resolverId: "user-003",
    resolution: AlertResolutionStatus.SYSTEM_ERROR,
    note: "RFID reader bị lỗi, đọc nhầm thẻ tài sản. Đã kiểm tra và máy in vẫn ở vị trí cũ.",
    resolvedAt: "2025-09-06T07:45:00Z",
    resolver: mockUsers.find(u => u.fullName.includes("Kỹ thuật")) || mockUsers[2],
  },
];

// Helper functions for alerts
export const AlertHelpers = {
  // Get alerts by status
  getAlertsByStatus: (status: AlertStatus): Alert[] => {
    return mockAlerts.filter(alert => alert.status === status);
  },

  // Get pending alerts (for urgent notifications)
  getPendingAlerts: (): Alert[] => {
    return mockAlerts.filter(alert => alert.status === AlertStatus.PENDING);
  },

  // Get recent alerts (within last N hours)
  getRecentAlerts: (hours: number = 24): Alert[] => {
    const now = new Date();
    const cutoff = new Date(now.getTime() - hours * 60 * 60 * 1000);
    return mockAlerts.filter(alert => new Date(alert.detectedAt) >= cutoff);
  },

  // Get alert by ID
  getAlertById: (id: string): Alert | undefined => {
    return mockAlerts.find(alert => alert.id === id);
  },

  // Get alerts by asset ID
  getAlertsByAssetId: (assetId: string): Alert[] => {
    return mockAlerts.filter(alert => alert.assetId === assetId);
  },

  // Get alerts by room ID
  getAlertsByRoomId: (roomId: string): Alert[] => {
    return mockAlerts.filter(alert => alert.roomId === roomId);
  },

  // Get alert stats
  getAlertStats: () => {
    const total = mockAlerts.length;
    const pending = mockAlerts.filter(a => a.status === AlertStatus.PENDING).length;
    const resolved = mockAlerts.filter(a => a.status === AlertStatus.RESOLVED).length;
    const today = mockAlerts.filter(a => {
      const today = new Date().toDateString();
      return new Date(a.detectedAt).toDateString() === today;
    }).length;

    return {
      total,
      pending,
      resolved,
      today,
      resolvedRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
    };
  },

  // Format alert type label
  formatAlertTypeLabel: (type: AlertType): string => {
    switch (type) {
      case AlertType.UNAUTHORIZED_MOVEMENT:
        return "Di chuyển không hợp lệ";
      default:
        return type;
    }
  },

  // Format resolution status label
  formatResolutionStatusLabel: (status: AlertResolutionStatus): string => {
    switch (status) {
      case AlertResolutionStatus.CONFIRMED:
        return "Đã xác minh";
      case AlertResolutionStatus.FALSE_ALARM:
        return "Sai phạm nhẹ";
      case AlertResolutionStatus.SYSTEM_ERROR:
        return "Lỗi hệ thống";
      default:
        return status;
    }
  },

  // Get alerts with filters
  getFilteredAlerts: (filters: {
    search?: string;
    status?: AlertStatus;
    type?: AlertType;
    dateFrom?: string;
    dateTo?: string;
    assetId?: string;
    roomId?: string;
  }): Alert[] => {
    let filtered = [...mockAlerts];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(alert =>
        alert.asset?.name.toLowerCase().includes(searchLower) ||
        alert.asset?.fixedCode.toLowerCase().includes(searchLower) ||
        alert.room?.name?.toLowerCase().includes(searchLower) ||
        alert.room?.roomNumber?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      filtered = filtered.filter(alert => alert.status === filters.status);
    }

    if (filters.type) {
      filtered = filtered.filter(alert => alert.type === filters.type);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(alert => 
        new Date(alert.detectedAt) >= new Date(filters.dateFrom!)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(alert => 
        new Date(alert.detectedAt) <= new Date(filters.dateTo!)
      );
    }

    if (filters.assetId) {
      filtered = filtered.filter(alert => alert.assetId === filters.assetId);
    }

    if (filters.roomId) {
      filtered = filtered.filter(alert => alert.roomId === filters.roomId);
    }

    return filtered;
  },
};
