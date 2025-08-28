# 🏢 Hệ thống Quản lý Tài sản - IUH Frontend

Hệ thống quản lý tài sản toàn diện cho trường Đại học Công nghiệp TP.HCM (IUH) với giao diện hiện đại và tính năng mạnh mẽ.

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Tính năng chính](#tính-năng-chính)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cài đặt và chạy](#cài-đặt-và-chạy)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Components](#components)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Đóng góp](#đóng-góp)

## 🎯 Tổng quan

Hệ thống quản lý tài sản IUH là một ứng dụng web hiện đại được xây dựng để quản lý toàn bộ tài sản của trường đại học, từ việc nhập kho, phân bổ, bàn giao đến thanh lý. Hệ thống hỗ trợ đầy đủ các quy trình nghiệp vụ và cung cấp giao diện thân thiện cho người dùng.

### 🎨 Thiết kế UI/UX

- **Modern Design**: Giao diện hiện đại với Tailwind CSS
- **Responsive**: Hoạt động tốt trên mọi thiết bị
- **Accessibility**: Tuân thủ tiêu chuẩn accessibility
- **Dark Mode**: Hỗ trợ chế độ tối (đang phát triển)

## ✨ Tính năng chính

### 📦 Quản lý Tài sản
- ✅ **Danh sách tài sản** với bộ lọc nâng cao
- ✅ **Thêm/Sửa/Xóa** tài sản
- ✅ **Chi tiết tài sản** với lịch sử di chuyển
- ✅ **Phân loại tài sản** theo danh mục
- ✅ **Trạng thái tài sản** (Chờ phân bổ, Đang sử dụng, Hư hỏng, v.v.)

### 🔄 Quy trình Bàn giao
- ✅ **Tạo yêu cầu bàn giao** giữa các đơn vị
- ✅ **Phê duyệt bàn giao** theo quy trình
- ✅ **Lịch sử bàn giao** chi tiết
- ✅ **Bàn giao hàng loạt** nhiều tài sản

### 📊 Báo cáo và Thống kê
- ✅ **Dashboard** tổng quan
- ✅ **Báo cáo tài sản** theo đơn vị
- ✅ **Thống kê sử dụng** tài sản
- ✅ **Xuất báo cáo** PDF/Excel

### 👥 Quản lý Người dùng
- ✅ **Phân quyền** theo vai trò
- ✅ **Quản lý đơn vị** và phòng ban
- ✅ **Lịch sử hoạt động** người dùng

## 🛠️ Công nghệ sử dụng

### Frontend
- **Next.js 14** - React framework với App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **React Hook Form** - Form management
- **Zod** - Schema validation

### UI Components
- **Custom Components** - Table, Filter, Pagination, etc.
- **Responsive Design** - Mobile-first approach
- **Accessibility** - ARIA labels, keyboard navigation

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js 18+ 
- npm hoặc yarn
- Git

### Cài đặt

```bash
# Clone repository
git clone https://github.com/your-org/asset-management-iuh-fe.git
cd asset-management-iuh-fe

# Cài đặt dependencies
npm install
# hoặc
yarn install

# Tạo file environment
cp .env.example .env.local

# Chạy development server
npm run dev
# hoặc
yarn dev
```

### Environment Variables

Tạo file `.env.local` với các biến sau:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Database (nếu cần)
DATABASE_URL=your-database-url
```

### Scripts

```bash
# Development
npm run dev          # Chạy development server
npm run build        # Build production
npm run start        # Chạy production server

# Code Quality
npm run lint         # Kiểm tra code style
npm run lint:fix     # Tự động fix code style
npm run type-check   # Kiểm tra TypeScript

# Testing
npm run test         # Chạy tests
npm run test:watch   # Chạy tests với watch mode
```

## 📁 Cấu trúc dự án

```
src/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Admin routes
│   │   ├── asset/         # Asset management
│   │   ├── dashboard/     # Dashboard
│   │   └── users/         # User management
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── filter/           # Filter components
│   ├── handover/         # Handover components
│   └── layout/           # Layout components
├── lib/                  # Utilities and helpers
├── types/                # TypeScript type definitions
├── hooks/                # Custom React hooks
└── utils/                # Utility functions
```

## 🧩 Components

### Core Components

#### 1. **Table Component**
```tsx
import { Table, TableColumn } from "@/components/ui/table";

const columns: TableColumn<Asset>[] = [
  { key: "name", title: "Tên tài sản" },
  { key: "status", title: "Trạng thái" }
];

<Table columns={columns} data={assets} />
```

#### 2. **AdvancedFilter Component**
```tsx
import AdvancedFilter from "@/components/filter/AdvancedFilter";

<AdvancedFilter
  filterOptions={filterOptions}
  conditions={conditions}
  onApply={handleApplyFilter}
/>
```

#### 3. **HandoverForm Component**
```tsx
import HandoverForm from "@/components/handover/HandoverForm";

<HandoverForm
  assets={selectedAssets}
  onSuccess={handleSuccess}
  onCancel={handleCancel}
/>
```

### Tính năng Components

- ✅ **Responsive Design** - Hoạt động trên mọi thiết bị
- ✅ **TypeScript Support** - Type-safe development
- ✅ **Accessibility** - Tuân thủ WCAG guidelines
- ✅ **Customizable** - Dễ dàng tùy chỉnh
- ✅ **Performance** - Tối ưu hiệu suất

## 📚 API Documentation

### Authentication
```typescript
// Login
POST /api/auth/login
{
  "username": "string",
  "password": "string"
}

// Logout
POST /api/auth/logout
```

### Assets
```typescript
// Get assets list
GET /api/assets?page=1&limit=10&filter=...

// Create asset
POST /api/assets
{
  "name": "string",
  "categoryId": "string",
  "specs": "string"
}

// Update asset
PUT /api/assets/:id
{
  "name": "string",
  "status": "string"
}

// Delete asset
DELETE /api/assets/:id
```

### Handovers
```typescript
// Get handovers
GET /api/handovers?status=pending

// Create handover
POST /api/handovers
{
  "fromUnitId": "string",
  "toUnitId": "string",
  "assetIds": ["string"]
}

// Approve handover
PUT /api/handovers/:id/approve
```

## 🚀 Deployment

### Production Build

```bash
# Build application
npm run build

# Start production server
npm run start
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables (Production)

```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret
```

## 🤝 Đóng góp

### Quy trình đóng góp

1. **Fork** repository
2. **Tạo branch** mới (`git checkout -b feature/amazing-feature`)
3. **Commit** thay đổi (`git commit -m 'Add amazing feature'`)
4. **Push** lên branch (`git push origin feature/amazing-feature`)
5. **Tạo Pull Request**

### Code Standards

- Sử dụng **TypeScript** cho tất cả files
- Tuân thủ **ESLint** rules
- Viết **JSDoc** cho functions phức tạp
- Test coverage > 80%
- Responsive design cho mọi component

### Commit Convention

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: code style changes
refactor: code refactoring
test: add or update tests
chore: build process or auxiliary tool changes
```

## 📄 License

Dự án này được phát triển cho trường Đại học Công nghiệp TP.HCM (IUH).

## 📞 Liên hệ

- **Email**: dev@iuh.edu.vn
- **Website**: https://iuh.edu.vn
- **GitHub**: https://github.com/iuh/asset-management

## 🙏 Cảm ơn

Cảm ơn tất cả các thành viên đã đóng góp vào dự án này!

---

**IUH Asset Management System** - Quản lý tài sản thông minh cho tương lai! 🚀
