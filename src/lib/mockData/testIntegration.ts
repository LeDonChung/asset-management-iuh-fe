// Demo để test mock data integration
import { mockAssets, mockUnits, mockRooms, MockDataHelper } from "@/lib/mockData";

export function testMockDataIntegration() {
  console.log("=== TEST MOCK DATA INTEGRATION ===");
  
  // Test Assets
  console.log("\n1. MOCK ASSETS:");
  console.log(`Total assets: ${mockAssets.length}`);
  mockAssets.forEach(asset => {
    const roomInfo = asset.plannedRoomId ? 
      MockDataHelper.getRoomById(asset.plannedRoomId) : null;
    console.log(`- ${asset.name} (${asset.status}) - Phòng: ${
      roomInfo ? MockDataHelper.formatRoomLocation(roomInfo) : 'Chưa có'
    }`);
  });

  // Test Units
  console.log("\n2. MOCK UNITS:");
  console.log(`Total units: ${mockUnits.length}`);
  mockUnits.forEach(unit => {
    console.log(`- ${unit.name}`);
  });

  // Test Rooms
  console.log("\n3. MOCK ROOMS:");
  console.log(`Total rooms: ${mockRooms.length}`);
  mockRooms.forEach(room => {
    console.log(`- ${MockDataHelper.formatRoomLocation(room)} (Unit: ${room.unitId})`);
  });

  // Test Role-based filtering
  console.log("\n4. ROLE-BASED FILTERING:");
  
  // Assets for Phòng Quản Trị (only handedOver = true)
  const assetsForQuanTri = mockAssets.filter(asset => asset.isHandOver === true);
  console.log(`\nPhòng Quản Trị sees: ${assetsForQuanTri.length} assets`);
  assetsForQuanTri.forEach(asset => {
    console.log(`  - ${asset.name} (${asset.status})`);
  });

  // Assets for Phòng Kế Hoạch (all assets)
  const assetsForKeHoach = mockAssets.filter(asset => !asset.deletedAt);
  console.log(`\nPhòng Kế Hoạch sees: ${assetsForKeHoach.length} assets`);
  
  // Test Helper Functions
  console.log("\n5. HELPER FUNCTIONS TEST:");
  const unit1Assets = MockDataHelper.getAssetsByUnitId('1');
  console.log(`Assets in Unit 1: ${unit1Assets.length}`);
  
  const room1H201Assets = MockDataHelper.getAssetsByRoomId('1H2.01');
  console.log(`Assets in room 1H2.01: ${room1H201Assets.length}`);
  
  const pendingAssets = MockDataHelper.getAssetsByStatus('chờ_phân_bổ');
  console.log(`Pending assets: ${pendingAssets.length}`);
  
  return {
    totalAssets: mockAssets.length,
    totalUnits: mockUnits.length,
    totalRooms: mockRooms.length,
    assetsForQuanTri: assetsForQuanTri.length,
    assetsForKeHoach: assetsForKeHoach.length
  };
}
