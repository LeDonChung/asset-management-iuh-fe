# Cập nhật logic hiển thị thao tác cho các role

## Vấn đề trước đây:
- Admin và Super Admin có thao tác bị trùng lặp
- Logic hiển thị không rõ ràng và bị xung đột
- Bulk actions không phù hợp với từng role

## Giải pháp đã áp dụng:

### 1. **Cải tiến logic hiển thị thao tác**
```typescript
// Thay vì logic cũ (if/if) -> Logic mới (if/else if/else if)
{(isAdmin || isSuperAdmin) ? (
  // Admin và Super Admin có thể thực hiện tất cả chức năng
) : isPhongKeHoach ? (
  // Phòng Kế Hoạch Đầu Tư - chỉ quản lý trước khi bàn giao  
) : isPhongQuanTri ? (
  // Phòng Quản Trị - chỉ xem và phân bổ tài sản đã bàn giao
) : null}
```

### 2. **Phân tách chức năng theo role**

#### **Admin & Super Admin:**
- ✅ Xem chi tiết
- ✅ Chỉnh sửa (nếu chưa bàn giao)
- ✅ Xóa (nếu chưa bàn giao)
- ✅ Quét RFID
- ✅ Bàn giao (nếu chưa bàn giao)
- ✅ Phân bổ (nếu đã bàn giao)
- ✅ Bulk: Cả bàn giao và phân bổ

#### **Phòng Kế Hoạch Đầu Tư:**
- ✅ Xem chi tiết
- ✅ Chỉnh sửa (nếu chưa bàn giao)
- ✅ Xóa (nếu chưa bàn giao)
- ✅ Quét RFID
- ✅ Bàn giao (nếu chưa bàn giao)
- ✅ Bulk: Chỉ bàn giao

#### **Phòng Quản Trị:**
- ✅ Xem chi tiết
- ✅ Phân bổ
- ✅ Bulk: Chỉ phân bổ

### 3. **Cải tiến Bulk Actions**
- **Trước:** Hiển thị trùng lặp và logic xung đột
- **Sau:** 
  - Admin/Super Admin: Hiển thị cả 2 nút (Bàn giao + Phân bổ)
  - Phòng Kế Hoạch: Chỉ hiển thị nút Bàn giao
  - Phòng Quản Trị: Chỉ hiển thị nút Phân bổ

### 4. **Tách riêng function xử lý**
```typescript
// Function riêng cho bulk allocation (Admin/Super Admin)
const handleBulkAllocation = () => {
  // Logic phân bổ tự động cho admin
};

// Function chung cho bulk handover  
const handleBulkHandover = () => {
  if (isPhongKeHoach || (isAdmin || isSuperAdmin)) {
    // Logic bàn giao
  } else if (isPhongQuanTri) {
    // Logic phân bổ cho quản trị
  }
};
```

### 5. **UI/UX Improvements**
- **Bulk Actions:** Sử dụng màu sắc khác nhau
  - 🔵 Bàn giao: `bg-orange-500` (Cam)
  - 🟢 Phân bổ: `bg-green-500` (Xanh lá)
- **Layout:** Grid layout cho Admin/Phòng Kế Hoạch vs Flex layout cho Phòng Quản Trị
- **Tooltips:** Thêm title rõ ràng cho từng button

## Kết quả:

### ✅ **Admin & Super Admin:**
- Không còn thao tác trùng lặp
- Hiển thị đầy đủ chức năng
- 2 bulk actions riêng biệt

### ✅ **Phòng Kế Hoạch Đầu Tư:**
- Chỉ thao tác trước khi bàn giao
- 1 bulk action: Bàn giao

### ✅ **Phòng Quản Trị:**
- Chỉ xem và phân bổ tài sản đã bàn giao
- 1 bulk action: Phân bổ

## Test Cases:
1. ✅ Admin login -> Thấy tất cả thao tác không trùng lặp
2. ✅ Super Admin login -> Thấy tất cả thao tác không trùng lặp  
3. ✅ Phòng Kế Hoạch login -> Chỉ thấy thao tác bàn giao
4. ✅ Phòng Quản Trị login -> Chỉ thấy thao tác phân bổ
5. ✅ Bulk actions hiển thị đúng theo role
