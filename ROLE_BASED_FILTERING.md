# Role-Based Asset Filtering - Summary of Changes

## Tổng quan thay đổi

Đã thêm trường `isHandOver` vào interface `AssetFilter` và cập nhật logic filtering để phù hợp với yêu cầu về 2 role:

### 1. Thay đổi Interface

#### AssetFilter Interface
```typescript
export interface AssetFilter {
  search?: string;
  status?: AssetStatus;
  type?: AssetType;
  categoryId?: string;
  roomId?: string;
  unitId?: string;
  isLocked?: boolean;
  isHandOver?: boolean; // ✅ THÊM MỚI: Trường lọc theo trạng thái bàn giao
  hasRfid?: boolean;
  entryDateFrom?: string;
  entryDateTo?: string;
}
```

#### Asset Interface
```typescript
export interface Asset {
  // ... existing fields
  isLocked: boolean; // Khi đã bàn giao thì không cho cập nhật lại
  isHandOver: boolean; // ✅ ĐÃ CÓ: Đã bàn giao
  
  // ✅ THÊM MỚI: Thông tin bàn giao (cho sổ tài sản)
  assignedDate?: string; // Ngày bàn giao
  assignedTo?: string; // Người được bàn giao
  department?: string; // Phòng ban
  location?: string; // Vị trí cụ thể
  // ... existing fields
}
```

### 2. Logic Filtering theo Role

#### Phòng Quản Trị (PHONG_QUAN_TRI)
- **Chỉ hiển thị** tài sản đã bàn giao (`isHandOver = true`)
- Không thể xem tài sản chưa bàn giao
- Có quyền phân bổ tài sản đã bàn giao

#### Phòng Kế Hoạch Đầu Tư (PHONG_KE_HOACH_DAU_TU) 
- **Có thể xem cả 2**: tài sản đã bàn giao và chưa bàn giao
- Có filter để lọc theo trạng thái bàn giao
- Có quyền bàn giao tài sản (chuyển `isHandOver` từ `false` → `true`)

### 3. Cập nhật UI

#### Trang Asset Management (`/asset/page.tsx`)
```typescript
// ✅ Role-based filtering
useEffect(() => {
  let filtered = assets.filter((asset) => !asset.deletedAt);

  // Apply role-based filtering
  if (isPhongQuanTri) {
    // Phòng Quản Trị chỉ xem những tài sản đã bàn giao
    filtered = filtered.filter((asset) => asset.isHandOver === true);
  }
  // Phòng Kế Hoạch Đầu Tư có thể xem cả 2

  // ... other filters
  if (filter.isHandOver !== undefined) {
    filtered = filtered.filter((asset) => asset.isHandOver === filter.isHandOver);
  }
}, [assets, filter, isPhongQuanTri]);
```

#### Filter UI
- **Phòng Kế Hoạch Đầu Tư**: Hiển thị dropdown "Trạng thái bàn giao" với options:
  - Tất cả
  - Chưa bàn giao
  - Đã bàn giao

- **Phòng Quản Trị**: Hiển thị dropdown "Trạng thái khóa" thay thế

#### Status Display
```typescript
// ✅ Hiển thị trạng thái chi tiết
{asset.isHandOver && (
  <div className="text-xs text-green-600 mt-1">
    ✅ Đã bàn giao
  </div>
)}
{asset.isLocked && !asset.isHandOver && (
  <div className="text-xs text-orange-600 mt-1">
    🔒 Đã khóa
  </div>
)}
```

### 4. Cập nhật các trang liên quan

#### Asset Ledger (`/asset-ledger/page.tsx`)
- Chỉ hiển thị tài sản đã bàn giao (`isHandOver = true`)
- Thêm thông tin bàn giao: `assignedTo`, `department`, `location`, `assignedDate`

#### Asset Allocate (`/asset/allocate/page.tsx`)
- Chỉ hiển thị tài sản đã bàn giao (`isHandOver = true`) và sẵn sàng phân bổ
- Cập nhật filter logic

### 5. Hành vi Action Buttons

#### Phòng Kế Hoạch Đầu Tư
- Chỉnh sửa/Xóa: chỉ khi `isHandOver = false`
- Bàn giao: chỉ khi `isHandOver = false`
- Khi bàn giao: `isHandOver = false → true`, `isLocked = false → true`

#### Phòng Quản Trị  
- Chỉ có quyền xem và phân bổ tài sản đã bàn giao
- Không thể chỉnh sửa hoặc xóa

### 6. Mock Data Updates

Tất cả mock data đã được cập nhật để bao gồm trường `isHandOver`:
- Tài sản chưa bàn giao: `isHandOver: false`
- Tài sản đã bàn giao: `isHandOver: true, isLocked: true`

## Kết quả

✅ **Phòng Quản Trị**: Chỉ thấy tài sản đã bàn giao, có thể phân bổ
✅ **Phòng Kế Hoạch Đầu Tư**: Thấy tất cả, có thể filter, có thể bàn giao
✅ **Filter hợp lý**: Tùy chọn filter phù hợp với từng role
✅ **UI responsive**: Hiển thị trạng thái rõ ràng
✅ **Data consistency**: Mock data nhất quán trên tất cả các trang
