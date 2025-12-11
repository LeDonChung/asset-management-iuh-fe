# 🏢 Hệ Thống Quản Lý Tài Sản Thông Minh

## 📌 Thông tin dự án

**Đồ án tốt nghiệp - Trường Đại học Công Nghiệp TP.HCM**

- **Sinh viên thực hiện:**
  - Lê Đôn Chủng
  - Trần Thị Thanh Tuyền
- **Năm thực hiện:** 2025

## 📖 Giới thiệu

Hệ thống Quản lý Tài sản Thông minh là một giải pháp toàn diện để quản lý tài sản của tổ chức, sử dụng công nghệ IoT (ESP32-CAM, RFID) kết hợp với ứng dụng web và mobile hiện đại.

### ✨ Tính năng chính

- 🔐 **Xác thực và phân quyền:** Hệ thống JWT authentication với phân quyền theo vai trò
- 📦 **Quản lý tài sản:** CRUD đầy đủ cho tài sản, phòng ban, vị trí
- 📊 **Dashboard thống kê:** Biểu đồ trực quan về tài sản, bảo trì, sửa chữa
- 📱 **Ứng dụng Mobile:** Quét QR code, kiểm kê tài sản, báo cáo sự cố
- 🔔 **Thông báo realtime:** Socket.IO cho cảnh báo và thông báo
- 📧 **Email notification:** Gửi email tự động khi có cảnh báo
- 🎥 **ESP32-CAM Integration:** Camera giám sát tài sản
- 🏷️ **RFID/QR Code:** Nhận diện và tracking tài sản

## 🏗️ Kiến trúc hệ thống

Dự án bao gồm 5 phần chính:

```
asset-management/
├── asset-management-iuh-fe/      # Frontend Web (Next.js)
├── asset-management-iuh-be/      # Backend API (NestJS)
├── asset-management-iuh-mb/      # Mobile App (React Native)
├── asset-management-iuh-sckt/    # Socket Server (Socket.IO)
└── asset-management-nginx/       # Reverse Proxy (Nginx)
```

### 🛠️ Công nghệ sử dụng

#### Frontend Web
- **Framework:** Next.js 14.x (React 18.x)
- **UI Library:** Tailwind CSS, Radix UI, Headless UI
- **State Management:** Redux Toolkit
- **Data Fetching:** TanStack Query (React Query)
- **Forms:** React Hook Form + Yup validation
- **Charts:** Recharts
- **QR Code:** html5-qrcode, qrcode
- **Realtime:** Socket.IO Client

#### Backend API
- **Framework:** NestJS 11.x (Node.js)
- **Database:** PostgreSQL with TypeORM
- **Authentication:** JWT + Passport
- **Validation:** class-validator
- **Documentation:** Swagger/OpenAPI
- **File Storage:** AWS S3
- **Email:** Nodemailer with Handlebars
- **Realtime:** Socket.IO

#### Mobile App
- **Framework:** React Native 0.80.x
- **Navigation:** React Navigation 7.x
- **UI:** React Native Paper
- **State Management:** Redux Toolkit
- **HTTP Client:** Axios
- **IoT:** React Native BLE (Bluetooth Low Energy)
- **Camera:** React Native Image Picker

#### Infrastructure
- **Socket Server:** Express + Socket.IO
- **Reverse Proxy:** Nginx
- **Containerization:** Docker & Docker Compose
- **Package Manager:** pnpm

## 📋 Yêu cầu hệ thống

### Môi trường phát triển
- **Node.js:** v18.x hoặc cao hơn
- **pnpm:** v8.x hoặc cao hơn
- **PostgreSQL:** v12.x hoặc cao hơn
- **Docker & Docker Compose:** (optional, khuyến nghị)

### Môi trường Mobile Development
- **Android Studio:** Với Android SDK
- **Xcode:** (Cho iOS development trên macOS)
- **Java JDK:** v17 hoặc cao hơn

## 🚀 Hướng dẫn cài đặt

### 1. Clone Repository

```bash
git clone https://github.com/LeDonChung/asset-management.git
cd asset-management
```

### 2. Cài đặt Backend API

```bash
cd asset-management-iuh-be

# Cài đặt dependencies
pnpm install

# Tạo file .env từ template
cp .env.example .env

# Cấu hình database trong .env
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=postgres
# DB_NAME=asset_management

# Khởi động PostgreSQL (nếu dùng Docker)
docker-compose up -d

# Chạy migrations
pnpm run migration:run

# Khởi động server
pnpm run start:dev
```

Backend sẽ chạy tại: `http://localhost:3000`  
Swagger API docs: `http://localhost:3000/api`

### 3. Cài đặt Frontend Web

```bash
cd asset-management-iuh-fe

# Cài đặt dependencies
pnpm install

# Tạo file .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local
echo "NEXT_PUBLIC_SOCKET_URL=http://localhost:3001" >> .env.local

# Khởi động development server
pnpm run dev
```

Frontend sẽ chạy tại: `http://localhost:3002`

### 4. Cài đặt Socket Server

```bash
cd asset-management-iuh-sckt

# Cài đặt dependencies
npm install

# Tạo file .env
echo "PORT=3001" > .env
echo "API_URL=http://localhost:3000" >> .env

# Khởi động server
npm run dev
```

Socket server sẽ chạy tại: `http://localhost:3001`

### 5. Cài đặt Mobile App

```bash
cd asset-management-iuh-mb

# Cài đặt dependencies
npm install

# Tạo file .env
echo "API_URL=http://localhost:3000" > .env
echo "SOCKET_URL=http://localhost:3001" >> .env

# Cài đặt Pods cho iOS (chỉ trên macOS)
cd ios && pod install && cd ..

# Chạy trên Android
npm run android

# Hoặc chạy trên iOS
npm run ios
```

### 6. Cài đặt Nginx (Production)

```bash
cd asset-management-nginx

# Build và chạy Nginx
docker-compose up -d
```

## 🐳 Docker Deployment (Khuyến nghị)

### Chạy toàn bộ hệ thống với Docker Compose

```bash
# Tại thư mục root của project
docker-compose up -d

# Kiểm tra logs
docker-compose logs -f

# Dừng các services
docker-compose down
```

Các services sẽ chạy tại:
- **Frontend:** http://localhost:3002
- **Backend API:** http://localhost:3000
- **Socket Server:** http://localhost:3001
- **PostgreSQL:** localhost:5432

## 📱 Cấu hình ESP32-CAM và Arduino

### ESP32-CAM
```bash
cd CameraWebServer

# Upload code lên ESP32-CAM qua Arduino IDE
# Cấu hình WiFi SSID và Password trong file .ino
# Board: AI Thinker ESP32-CAM
```

### Arduino RFID Module
```bash
cd arduino

# Upload code lên Arduino
# Kết nối RFID RC522 module
# Cấu hình Serial communication
```

## 🧪 Testing

### Backend Testing
```bash
cd asset-management-iuh-be

# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

### Frontend Testing
```bash
cd asset-management-iuh-fe

# Run tests
pnpm run test
```

## 📚 API Documentation

Sau khi khởi động backend, truy cập Swagger API documentation tại:
```
http://localhost:3000/api
```

## 🔑 Tài khoản mặc định

Sau khi seed database, có thể login với các tài khoản sau:

**Admin:**
- Email: admin@iuh.edu.vn
- Password: admin123

**User:**
- Email: user@iuh.edu.vn
- Password: user123

## 📂 Cấu trúc thư mục chi tiết

### Backend (`asset-management-iuh-be/src`)
```
src/
├── modules/           # Feature modules (auth, assets, users, etc.)
├── entities/          # TypeORM entities
├── common/            # Shared utilities, guards, decorators
├── migrations/        # Database migrations
└── templates/         # Email templates (Handlebars)
```

### Frontend (`asset-management-iuh-fe/src`)
```
src/
├── app/              # Next.js app directory
├── components/       # Reusable components
├── lib/              # Utilities and helpers
├── hooks/            # Custom React hooks
├── store/            # Redux store
└── types/            # TypeScript types
```

### Mobile (`asset-management-iuh-mb/src`)
```
src/
├── screens/          # App screens
├── components/       # Reusable components
├── navigation/       # Navigation configuration
├── services/         # API services
├── store/            # Redux store
└── utils/            # Utilities
```

## 🔧 Scripts hữu ích

### Backend
```bash
pnpm run start:dev     # Development mode với hot reload
pnpm run start:prod    # Production mode
pnpm run build         # Build project
pnpm run migration:run # Chạy migrations
pnpm run seed          # Seed database
```

### Frontend
```bash
pnpm run dev          # Development server
pnpm run build        # Build for production
pnpm run start        # Start production server
pnpm run lint         # Lint code
```

### Mobile
```bash
npm run android       # Run on Android
npm run ios          # Run on iOS
npm start            # Start Metro bundler
```

## 🌐 Environment Variables

### Backend (`.env`)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=asset_management

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=your-bucket-name

# App
PORT=3000
NODE_ENV=development
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### Mobile (`.env`)
```env
API_URL=http://localhost:3000
SOCKET_URL=http://localhost:3001
```

## 🐛 Troubleshooting

### Lỗi kết nối database
- Kiểm tra PostgreSQL đã chạy chưa
- Kiểm tra thông tin kết nối trong `.env`
- Chạy `docker-compose up -d` để khởi động database

### Lỗi build Mobile App
- Xóa `node_modules` và cài lại: `rm -rf node_modules && npm install`
- Clean build: `cd android && ./gradlew clean && cd ..`
- Reset Metro bundler: `npm start -- --reset-cache`

### Lỗi CORS
- Kiểm tra cấu hình CORS trong backend
- Đảm bảo frontend URL được thêm vào whitelist

## 📞 Liên hệ

- **Lê Đôn Chủng:** [Email/GitHub]
- **Trần Thị Thanh Tuyền:** [Email/GitHub]

## 📄 License

Đây là dự án đồ án tốt nghiệp, vui lòng không sử dụng cho mục đích thương mại mà không có sự cho phép.

## 🙏 Acknowledgments

- Trường Đại học Công Nghiệp TP.HCM
- Giảng viên hướng dẫn
- Các thư viện và framework mã nguồn mở được sử dụng trong dự án

---

**© 2025 - Hệ Thống Quản Lý Tài Sản Thông Minh - Đồ án tốt nghiệp IUH**
