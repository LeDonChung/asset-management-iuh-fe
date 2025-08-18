# Mock Data Documentation

## Cấu trúc Mock Data

### 1. **Units** (`src/lib/mockData/units.ts`)
Quản lý thông tin các đơn vị sử dụng:
- Khoa Công nghệ thông tin
- Khoa Kinh tế  
- Khoa Cơ khí
- Phòng Kế hoạch đầu tư
- Phòng Quản trị

### 2. **Rooms** (`src/lib/mockData/rooms.ts`)
Quản lý thông tin phòng theo từng đơn vị:
- **Format**: `{TòaH}{Lầu}.{Số phòng}` (VD: 1H2.01, 2H1.02)
- Mỗi đơn vị có các phòng riêng biệt
- Liên kết với Unit thông qua `unitId`

### 3. **Users** (`src/lib/mockData/users.ts`)
Quản lý người dùng và phân quyền:
- Mỗi user thuộc về một đơn vị
- Có role tương ứng với chức năng
- Liên kết với Unit thông qua `unitId`

### 4. **Categories** (`src/lib/mockData/categories.ts`)
Phân loại tài sản:
- Thiết bị điện tử (máy tính, máy in, máy chiếu, điều hòa)
- Nội thất (bàn ghế, tủ kệ)
- Thiết bị văn phòng (máy photocopy)

### 5. **Assets** (`src/lib/mockData/assets.ts`)
Dữ liệu tài sản với đầy đủ thông tin:
- Liên kết với Room thông qua `currentRoomId` và `plannedRoomId`
- Có relation object `room` và `plannedRoom`
- Trạng thái khác nhau: đang sử dụng, chờ phân bổ, hư hỏng

## Cách sử dụng

### Import dữ liệu:
```typescript
import { 
  mockUnits, 
  mockRooms, 
  mockUsers, 
  mockAssets, 
  mockCategories,
  MockDataHelper 
} from '@/lib/mockData';
```

### Sử dụng Helper functions:
```typescript
// Lấy phòng theo đơn vị
const cnttRooms = MockDataHelper.getRoomsByUnitId('1');

// Lấy tài sản theo phòng
const roomAssets = MockDataHelper.getAssetsByRoomId('1H2.01');

// Lấy tài sản theo đơn vị
const unitAssets = MockDataHelper.getAssetsByUnitId('1');

// Format tên phòng
const roomName = MockDataHelper.formatRoomLocation(room);
// Output: "1H2.01 (Tòa 1, Lầu 2)"

// Thống kê tài sản theo đơn vị
const stats = MockDataHelper.getAssetStatsByUnit();
```

### Demo và Test:
```typescript
import { demoMockData, getRoomAssets } from '@/lib/mockData/demo';

// Chạy demo để xem toàn bộ dữ liệu
const summary = demoMockData();

// Lấy tài sản trong phòng cụ thể
const room1H201Assets = getRoomAssets();
```

## Cấu trúc Phòng

### Khoa Công nghệ thông tin (Unit ID: '1')
- Tòa 1: 1H2.01, 1H2.02, 1H2.03, 1H3.01, 1H3.02

### Khoa Kinh tế (Unit ID: '2')
- Tòa 2: 2H1.01, 2H1.02, 2H2.01, 2H2.02

### Khoa Cơ khí (Unit ID: '3')
- Tòa 3: 3H1.01, 3H1.02, 3H2.01

### Phòng Kế hoạch đầu tư (Unit ID: '4')
- Tòa A: A1.01, A1.02

### Phòng Quản trị (Unit ID: '5')
- Tòa A: A2.01, A2.02

## Lưu ý

1. **Relation Objects**: Assets có sẵn relation objects `room`, `plannedRoom`, `category` để dễ sử dụng
2. **Room ID Format**: Sử dụng format dễ nhớ và có ý nghĩa
3. **Realistic Data**: Dữ liệu mock realistis với thông tin thực tế
4. **Helper Functions**: Sử dụng `MockDataHelper` để query dữ liệu dễ dàng
5. **Extensible**: Dễ dàng thêm mới hoặc chỉnh sửa dữ liệu mock

## Ví dụ sử dụng trong Component

```typescript
import { MockDataHelper } from '@/lib/mockData';

export default function AssetList({ unitId }: { unitId: string }) {
  const unit = MockDataHelper.getUnitById(unitId);
  const assets = MockDataHelper.getAssetsByUnitId(unitId);
  
  return (
    <div>
      <h2>Tài sản của {unit?.name}</h2>
      {assets.map(asset => (
        <div key={asset.id}>
          <h3>{asset.name}</h3>
          <p>Vị trí: {asset.room ? MockDataHelper.formatRoomLocation(asset.room) : 'Kho'}</p>
          <p>Trạng thái: {asset.status}</p>
        </div>
      ))}
    </div>
  );
}
```
