// Demo file to test mock data
// Bạn có thể sử dụng file này để test các mock data đã tạo

import { 
  mockUnits, 
  mockRooms, 
  mockUsers, 
  mockAssets, 
  mockCategories,
  MockDataHelper 
} from './index';

// Demo functions để test
export function demoMockData() {
  console.log('=== DEMO MOCK DATA ===');
  
  // Test Units
  console.log('\n1. UNITS:');
  mockUnits.forEach(unit => {
    console.log(`- ${unit.name} (${unit.type})`);
  });

  // Test Rooms by Unit
  console.log('\n2. ROOMS BY UNIT:');
  mockUnits.forEach(unit => {
    const rooms = MockDataHelper.getRoomsByUnitId(unit.id);
    console.log(`\n${unit.name}:`);
    rooms.forEach(room => {
      console.log(`  - ${MockDataHelper.formatRoomLocation(room)}`);
    });
  });

  // Test Assets by Unit
  console.log('\n3. ASSETS BY UNIT:');
  mockUnits.forEach(unit => {
    const assets = MockDataHelper.getAssetsByUnitId(unit.id);
    console.log(`\n${unit.name}: ${assets.length} tài sản`);
    assets.forEach(asset => {
      const room = asset.room;
      console.log(`  - ${asset.name} tại ${room ? MockDataHelper.formatRoomLocation(room) : 'Kho'}`);
    });
  });

  // Test Statistics
  console.log('\n4. STATISTICS BY UNIT:');
  const stats = MockDataHelper.getAssetStatsByUnit();
  Object.keys(stats).forEach(unitId => {
    const unit = MockDataHelper.getUnitById(unitId);
    const stat = stats[unitId];
    console.log(`\n${unit?.name}:`);
    console.log(`  - Tổng: ${stat.total}`);
    console.log(`  - Đang sử dụng: ${stat.inUse}`);
    console.log(`  - Chờ phân bổ: ${stat.pending}`);
    console.log(`  - Hư hỏng: ${stat.broken}`);
  });

  return {
    totalUnits: mockUnits.length,
    totalRooms: mockRooms.length,
    totalAssets: mockAssets.length,
    totalUsers: mockUsers.length,
    totalCategories: mockCategories.length
  };
}

// Usage example
export function getAssetsByRoom(roomId: string) {
  const room = MockDataHelper.getRoomById(roomId);
  const assets = MockDataHelper.getAssetsByRoomId(roomId);
  
  return {
    room: room ? MockDataHelper.formatRoomLocation(room) : 'Room not found',
    assets: assets.map(asset => ({
      id: asset.id,
      name: asset.name,
      status: asset.status,
      category: asset.category?.name
    }))
  };
}

// Example: Get all assets in room 1H2.01
export function getRoomAssets() {
  return getAssetsByRoom('1H2.01');
}
