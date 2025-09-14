# User Management System - Documentation

## Tổng quan
Hệ thống quản lý người dùng hoàn chỉnh cho ứng dụng quản lý tài sản IUH với đầy đủ các tính năng CRUD, phân quyền và quản lý trạng thái.

## Cấu trúc File

### 1. Trang chính - User List Page
**File:** `src/app/(admin)/user/page.tsx`

**Tính năng:**
- ✅ Hiển thị danh sách người dùng trong bảng
- ✅ Tìm kiếm theo username, email, fullName
- ✅ Bộ lọc theo đơn vị và trạng thái
- ✅ Hiển thị thông tin: tài khoản, liên hệ, đơn vị, vai trò, trạng thái, ngày tạo
- ✅ Thao tác: Xem chi tiết, Chỉnh sửa, Khóa/Mở khóa, Reset mật khẩu, Xóa
- ✅ Nút Import/Export Excel
- ✅ Phân trang (sẵn sàng tích hợp)
- ✅ Responsive design

### 2. Trang tạo người dùng mới
**File:** `src/app/(admin)/user/create/page.tsx`

**Tính năng:**
- ✅ Form nhập đầy đủ thông tin cơ bản
- ✅ Validation form với hiển thị lỗi
- ✅ Input password với toggle show/hide
- ✅ Xác nhận mật khẩu
- ✅ Chọn đơn vị từ dropdown
- ✅ Multi-select vai trò với checkbox
- ✅ Hiển thị preview vai trò đã chọn
- ✅ Responsive design với card layout

### 3. Trang chỉnh sửa người dùng
**File:** `src/app/(admin)/user/[id]/edit/page.tsx`

**Tính năng:**
- ✅ Load thông tin người dùng hiện tại
- ✅ Form chỉnh sửa (không có password)
- ✅ Cập nhật vai trò
- ✅ Thay đổi trạng thái
- ✅ Validation và xử lý lỗi
- ✅ Loading state khi fetch data

### 4. Modal chi tiết người dùng
**File:** `src/components/user/UserDetailModal.tsx`

**Tính năng:**
- ✅ Hiển thị đầy đủ thông tin người dùng
- ✅ Danh sách vai trò và quyền hạn
- ✅ Thông tin hệ thống (ngày tạo, cập nhật)
- ✅ Hành động nhanh: Reset mật khẩu, Khóa/Mở khóa
- ✅ Design đẹp với icon và badge

## Dữ liệu Mock

### User Status
- `ACTIVE`: Đang hoạt động (màu xanh)
- `INACTIVE`: Không hoạt động (màu xám)
- `LOCKED`: Đã khóa (màu đỏ)
- `DELETED`: Đã xóa (màu đen)

### Vai trò mẫu
- Quản trị viên (ADMIN)
- Kế toán (ACCOUNTANT)
- Nhân viên kiểm kê (INVENTORY_STAFF)
- Trưởng phòng (DEPARTMENT_HEAD)

### Đơn vị mẫu
- Phòng Kế hoạch Đầu tư
- Phòng Quản trị
- Khoa Công nghệ Thông tin

## Trải nghiệm người dùng (UX)

### ✅ Đã implement:
1. **Search & Filter**: Tìm kiếm và lọc dữ liệu real-time
2. **Responsive Design**: Tối ưu cho mọi kích thước màn hình
3. **Loading States**: Hiển thị loading khi fetch data
4. **Error Handling**: Validation form và hiển thị lỗi
5. **Quick Actions**: Các hành động nhanh từ bảng và modal
6. **Visual Feedback**: Badge, icon, màu sắc phân biệt trạng thái
7. **Navigation**: Breadcrumb và back button

### 🚀 Sẵn sàng tích hợp:
1. **Import/Export Excel**: UI đã có, cần tích hợp logic
2. **Pagination**: Table component hỗ trợ, cần data từ API
3. **Real API**: Thay thế mock data bằng API calls
4. **Permission Check**: Ẩn/hiện button dựa trên quyền user
5. **Email Integration**: Gửi email khi reset password

## Công nghệ sử dụng

- **Framework**: Next.js 15 với App Router
- **Styling**: Tailwind CSS với custom components
- **Icons**: Lucide React
- **Form Validation**: Custom validation với real-time feedback
- **State Management**: React useState hooks
- **Routing**: Next.js dynamic routes

## Hướng dẫn sử dụng

### 1. Tạo người dùng mới:
- Truy cập `/user` → Click "Thêm người dùng"
- Điền đầy đủ thông tin bắt buộc (*)
- Chọn vai trò và đơn vị
- Nhập mật khẩu và xác nhận
- Click "Lưu người dùng"

### 2. Chỉnh sửa người dùng:
- Từ danh sách → Click icon Edit
- Cập nhật thông tin cần thiết
- Thay đổi vai trò nếu cần
- Click "Cập nhật người dùng"

### 3. Quản lý trạng thái:
- **Khóa/Mở khóa**: Click icon Lock từ bảng hoặc modal
- **Reset password**: Click icon Key
- **Xóa**: Click icon Trash (chuyển status thành DELETED)

### 4. Xem chi tiết:
- Click vào hàng trong bảng hoặc icon Eye
- Xem đầy đủ thông tin và quyền hạn
- Thực hiện hành động nhanh từ modal

## Tích hợp với Backend

### API Endpoints cần thiết:
```
GET    /api/users              # Lấy danh sách người dùng
POST   /api/users              # Tạo người dùng mới
GET    /api/users/:id          # Lấy chi tiết người dùng
PUT    /api/users/:id          # Cập nhật người dùng
DELETE /api/users/:id          # Xóa người dùng
POST   /api/users/:id/reset    # Reset mật khẩu
POST   /api/users/:id/lock     # Khóa/mở khóa tài khoản
GET    /api/roles              # Lấy danh sách vai trò
GET    /api/units              # Lấy danh sách đơn vị
```

## Bảo mật

- ✅ Password validation (min 6 ký tự)
- ✅ Email format validation
- ✅ Required field validation
- 🔄 Cần thêm: Permission-based access control
- 🔄 Cần thêm: Password hashing backend
- 🔄 Cần thêm: Session management

---

**Trạng thái**: ✅ Hoàn thành UI/UX, sẵn sàng tích hợp backend  
**Tác giả**: GitHub Copilot  
**Ngày tạo**: September 6, 2025
