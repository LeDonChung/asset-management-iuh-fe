import { mockUnits, mockRooms, mockUsers, mockAssets, mockCategories, mockAssetLogs } from './index';
import { Unit, Room, Asset, User, Category, AssetLog } from '@/types/asset';

// Helper functions để query mock data
export class MockDataHelper {
  // Units
  static getUnitById(id: string): Unit | undefined {
    return mockUnits.find(unit => unit.id === id);
  }

  static getUnitsByType(type: string): Unit[] {
    return mockUnits.filter(unit => unit.type === type);
  }

  // Rooms
  static getRoomById(id: string): Room | undefined {
    return mockRooms.find(room => room.id === id);
  }

  static getRoomsByUnitId(unitId: string): Room[] {
    return mockRooms.filter(room => room.unitId === unitId);
  }

  static getRoomsByBuilding(building: string): Room[] {
    return mockRooms.filter(room => room.building === building);
  }

  // Assets
  static getAssetById(id: string): Asset | undefined {
    return mockAssets.find(asset => asset.id === id);
  }

  static getAssetsByRoomId(roomId: string): Asset[] {
    return mockAssets.filter(asset => asset.currentRoomId === roomId);
  }

  static getAssetsByUnitId(unitId: string): Asset[] {
    const unitRooms = this.getRoomsByUnitId(unitId);
    const roomIds = unitRooms.map(room => room.id);
    return mockAssets.filter(asset => 
      asset.currentRoomId && roomIds.includes(asset.currentRoomId)
    );
  }

  static getAssetsByStatus(status: string): Asset[] {
    return mockAssets.filter(asset => asset.status === status);
  }

  static getAssetsByCategory(categoryId: string): Asset[] {
    return mockAssets.filter(asset => asset.categoryId === categoryId);
  }

  // Users
  static getUserById(id: string): User | undefined {
    return mockUsers.find(user => user.id === id);
  }

  static getUsersByUnitId(unitId: string): User[] {
    return mockUsers.filter(user => user.unitId === unitId);
  }

  // Categories
  static getCategoryById(id: string): Category | undefined {
    return mockCategories.find(category => category.id === id);
  }

  static getCategoriesByParentId(parentId: string): Category[] {
    return mockCategories.filter(category => category.parentId === parentId);
  }

  static getRootCategories(): Category[] {
    return mockCategories.filter(category => !category.parentId);
  }

  // Statistics
  static getAssetStatsByUnit(): { [unitId: string]: { total: number; inUse: number; pending: number; broken: number } } {
    const stats: { [unitId: string]: { total: number; inUse: number; pending: number; broken: number } } = {};
    
    mockUnits.forEach(unit => {
      const unitAssets = this.getAssetsByUnitId(unit.id);
      const pendingAssets = mockAssets.filter(asset => 
        asset.plannedRoomId && this.getRoomById(asset.plannedRoomId)?.unitId === unit.id
      );
      
      stats[unit.id] = {
        total: unitAssets.length + pendingAssets.length,
        inUse: unitAssets.filter(asset => asset.status === 'đang_sử_dụng').length,
        pending: pendingAssets.filter(asset => asset.status === 'chờ_phân_bổ').length,
        broken: unitAssets.filter(asset => asset.status === 'hư_hỏng').length
      };
    });

    return stats;
  }

  // Room display helpers
  static getRoomDisplayName(room: Room): string {
    return `${room.building} - ${room.floor} - ${room.roomNumber}`;
  }

  static formatRoomLocation(room: Room): string {
    return `${room.roomNumber}`;
  }

  // Asset Logs
  static getAssetLogs(assetId: string): AssetLog[] {
    return mockAssetLogs
      .filter(log => log.assetId === assetId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static getAssetLogsByStatus(status: AssetLog['status']): AssetLog[] {
    return mockAssetLogs.filter(log => log.status === status);
  }

  static getRecentAssetLogs(limit: number = 10): AssetLog[] {
    return mockAssetLogs
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}
