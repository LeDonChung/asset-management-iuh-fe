'use client'

import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRole } from '@/contexts/RoleContext'
import {
  AssetBook,
  AssetBookItem,
  AssetBookItemStatus,
  BookStatus,
  Room,
  Asset,
  AssetBookFilter,
  AssetBookItemFilter,
  UnitType,
  AssetTransaction
} from '@/types/asset'
import {
  CalendarDays,
  Filter,
  Search,
  FileText,
  Package,
  MapPin,
  ChevronDown,
  RefreshCw,
  Download,
  Eye,
  Archive,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BarChart3,
  PieChart,
  Users,
  Building2,
  Zap,
  Activity,
  Target,
  ArrowRightLeft,
  Package2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'
import { Table, TableColumn } from '@/components/ui/table'
import { mockUnits } from '@/lib/mockData'
import Link from 'next/link'

// Lazy load components
const AdvancedFilter = lazy(() => import('@/components/filter/AdvancedFilter'))
const HandoverForm = lazy(() => import('@/components/handover/HandoverForm'))

// Import FilterCondition type
import type { FilterCondition } from '@/components/filter/AdvancedFilter'

// Loading skeleton components
const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
)

const SkeletonTable = () => (
  <div className="animate-pulse">
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex space-x-4">
          <div className="h-12 bg-gray-200 rounded flex-1"></div>
          <div className="h-12 bg-gray-200 rounded w-24"></div>
          <div className="h-12 bg-gray-200 rounded w-32"></div>
        </div>
      ))}
    </div>
  </div>
)

// Mock data for demonstration
const MOCK_ASSET_BOOKS: AssetBook[] = [
  // Khoa Công nghệ Thông tin - 2025
  {
    id: '1',
    unitId: '1',
    year: 2025,
    createdBy: 'user-1',
    createdAt: '2025-01-01T00:00:00Z',
    status: BookStatus.OPEN,
    unit: mockUnits.find(unit => unit.id === '1')
  },
  // Khoa Công nghệ Thông tin - 2024
  {
    id: '2',
    unitId: '1',
    year: 2024,
    createdBy: 'user-1',
    createdAt: '2024-01-01T00:00:00Z',
    lockedAt: '2024-12-31T23:59:59Z',
    status: BookStatus.CLOSE,
    unit: mockUnits.find(unit => unit.id === '1')
  },
  // Khoa Kinh tế - 2025
  {
    id: '3',
    unitId: '2',
    year: 2025,
    createdBy: 'user-2',
    createdAt: '2025-01-01T00:00:00Z',
    status: BookStatus.OPEN,
    unit: mockUnits.find(unit => unit.id === '2')
  },
  // Khoa Kinh tế - 2024
  {
    id: '4',
    unitId: '2',
    year: 2024,
    createdBy: 'user-2',
    createdAt: '2024-01-01T00:00:00Z',
    lockedAt: '2024-12-31T23:59:59Z',
    status: BookStatus.CLOSE,
    unit: mockUnits.find(unit => unit.id === '2')
  },
  // Khoa Cơ khí - 2025
  {
    id: '5',
    unitId: '3',
    year: 2025,
    createdBy: 'user-3',
    createdAt: '2025-01-01T00:00:00Z',
    status: BookStatus.OPEN,
    unit: mockUnits.find(unit => unit.id === '3')
  },
  // Khoa Xây dựng - 2025
  {
    id: '6',
    unitId: '4',
    year: 2025,
    createdBy: 'user-4',
    createdAt: '2025-01-01T00:00:00Z',
    status: BookStatus.OPEN,
    unit: mockUnits.find(unit => unit.id === '4')
  },
  // Khoa Điện - 2025
  {
    id: '7',
    unitId: '5',
    year: 2025,
    createdBy: 'user-5',
    createdAt: '2025-01-01T00:00:00Z',
    status: BookStatus.OPEN,
    unit: mockUnits.find(unit => unit.id === '5')
  },
  // Thêm sổ cho các năm trước
  {
    id: '8',
    unitId: '3',
    year: 2024,
    createdBy: 'user-3',
    createdAt: '2024-01-01T00:00:00Z',
    lockedAt: '2024-12-31T23:59:59Z',
    status: BookStatus.CLOSE,
    unit: mockUnits.find(unit => unit.id === '3')
  },
  {
    id: '9',
    unitId: '4',
    year: 2024,
    createdBy: 'user-4',
    createdAt: '2024-01-01T00:00:00Z',
    lockedAt: '2024-12-31T23:59:59Z',
    status: BookStatus.CLOSE,
    unit: mockUnits.find(unit => unit.id === '4')
  },
  {
    id: '10',
    unitId: '5',
    year: 2024,
    createdBy: 'user-5',
    createdAt: '2024-01-01T00:00:00Z',
    lockedAt: '2024-12-31T23:59:59Z',
    status: BookStatus.CLOSE,
    unit: mockUnits.find(unit => unit.id === '5')
  }
]

const MOCK_ASSET_BOOK_ITEMS: AssetBookItem[] = [
  // Khoa Công nghệ Thông tin - Năm 2025 (bookId: '1')
  {
    id: '1',
    bookId: '1',
    assetId: 'asset-001',
    roomId: 'room-1',
    assignedAt: '2025-01-15T08:00:00Z',
    quantity: 1,
    status: AssetBookItemStatus.IN_USE,
    note: 'Máy tính để bàn phòng 301 - Khoa CNTT',
    asset: {
      id: 'asset-001',
      ktCode: 'KT-2025/001',
      fixedCode: '2025.001',
      name: 'Máy tính để bàn Dell OptiPlex 7090',
      specs: 'Intel i5-11500, 8GB RAM, 256GB SSD',
      entryDate: '2025-01-10',
      unit: 'Chiếc',
      quantity: 1,
      purchasePackage: 1,
      type: 'TSCD' as any,
      isLocked: false,
      isHandOver: true,
      categoryId: 'cat-1',
      status: 'đang_sử_dụng' as any,
      createdBy: 'admin',
      createdAt: '2025-01-10T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z',
      assignedDate: '2025-01-15',
      assignedTo: 'Nguyễn Văn A',
      department: 'Khoa CNTT',
      location: 'Phòng 301'
    },
    room: {
      id: 'room-1',
      building: 'A',
      floor: '3',
      roomNumber: '301',
      status: 'ACTIVE' as any,
      unitId: '1'
    }
  },
  {
    id: '2',
    bookId: '1',
    assetId: 'asset-002',
    roomId: 'room-2',
    assignedAt: '2025-01-20T08:00:00Z',
    quantity: 1,
    status: AssetBookItemStatus.IN_USE,
    note: 'Máy in laser phòng 302 - Khoa CNTT',
    asset: {
      id: 'asset-002',
      ktCode: 'KT-2025/002',
      fixedCode: '2025.002',
      name: 'Máy in HP LaserJet Pro M404dn',
      specs: 'In đen trắng, tốc độ 38 trang/phút',
      entryDate: '2025-01-18',
      unit: 'Chiếc',
      quantity: 1,
      purchasePackage: 1,
      type: 'TSCD' as any,
      isLocked: false,
      isHandOver: true,
      categoryId: 'cat-2',
      status: 'đang_sử_dụng' as any,
      createdBy: 'admin',
      createdAt: '2025-01-18T00:00:00Z',
      updatedAt: '2025-01-20T00:00:00Z',
      assignedDate: '2025-01-20',
      assignedTo: 'Trần Thị B',
      department: 'Khoa CNTT',
      location: 'Phòng 302'
    },
    room: {
      id: 'room-2',
      building: 'A',
      floor: '3',
      roomNumber: '302',
      status: 'ACTIVE' as any,
      unitId: '1'
    }
  },
  {
    id: '3',
    bookId: '1',
    assetId: 'asset-003',
    roomId: 'room-3',
    assignedAt: '2025-02-01T08:00:00Z',
    quantity: 1,
    status: AssetBookItemStatus.IN_USE,
    note: 'Máy chiếu phòng 303 - Khoa CNTT',
    asset: {
      id: 'asset-003',
      ktCode: 'KT-2025/003',
      fixedCode: '2025.003',
      name: 'Máy chiếu Epson EB-X41',
      specs: 'XGA 1024x768, 3600 lumens, HDMI/VGA',
      entryDate: '2025-01-25',
      unit: 'Chiếc',
      quantity: 1,
      purchasePackage: 1,
      type: 'TSCD' as any,
      isLocked: false,
      isHandOver: true,
      categoryId: 'cat-3',
      status: 'đang_sử_dụng' as any,
      createdBy: 'admin',
      createdAt: '2025-01-25T00:00:00Z',
      updatedAt: '2025-02-01T00:00:00Z',
      assignedDate: '2025-02-01',
      assignedTo: 'Lê Văn C',
      department: 'Khoa CNTT',
      location: 'Phòng 303'
    },
    room: {
      id: 'room-3',
      building: 'A',
      floor: '3',
      roomNumber: '303',
      status: 'ACTIVE' as any,
      unitId: '1'
    }
  },
  // Khoa Công nghệ Thông tin - Năm 2024 (bookId: '2')
  {
    id: '4',
    bookId: '2',
    assetId: 'asset-004',
    roomId: 'room-1',
    assignedAt: '2024-03-15T08:00:00Z',
    quantity: 1,
    status: AssetBookItemStatus.TRANSFERRED,
    note: 'Đã chuyển sang phòng 305 - Khoa CNTT',
    asset: {
      id: 'asset-004',
      ktCode: 'KT-2024/015',
      fixedCode: '2024.015',
      name: 'Bàn làm việc gỗ MFC',
      specs: '1.2m x 0.6m x 0.8m, gỗ MFC phủ Melamine',
      entryDate: '2024-03-10',
      unit: 'Chiếc',
      quantity: 1,
      purchasePackage: 1,
      type: 'TSCD' as any,
      isLocked: true,
      isHandOver: true,
      categoryId: 'cat-4',
      status: 'đang_sử_dụng' as any,
      createdBy: 'admin',
      createdAt: '2024-03-10T00:00:00Z',
      updatedAt: '2024-03-15T00:00:00Z',
      assignedDate: '2024-03-15',
      assignedTo: 'Phạm Thị D',
      department: 'Khoa CNTT',
      location: 'Phòng 305'
    },
    room: {
      id: 'room-1',
      building: 'A',
      floor: '3',
      roomNumber: '301',
      status: 'ACTIVE' as any,
      unitId: '1'
    }
  },
  {
    id: '5',
    bookId: '2',
    assetId: 'asset-005',
    roomId: 'room-4',
    assignedAt: '2024-05-20T08:00:00Z',
    quantity: 1,
    status: AssetBookItemStatus.IN_USE,
    note: 'Tủ hồ sơ phòng 304 - Khoa CNTT',
    asset: {
      id: 'asset-005',
      ktCode: 'KT-2024/032',
      fixedCode: '2024.032',
      name: 'Tủ hồ sơ thép 4 ngăn',
      specs: 'Tủ thép sơn tĩnh điện, 4 ngăn có khóa, 90x45x132cm',
      entryDate: '2024-05-15',
      unit: 'Chiếc',
      quantity: 1,
      purchasePackage: 1,
      type: 'TSCD' as any,
      isLocked: true,
      isHandOver: true,
      categoryId: 'cat-5',
      status: 'đang_sử_dụng' as any,
      createdBy: 'admin',
      createdAt: '2024-05-15T00:00:00Z',
      updatedAt: '2024-05-20T00:00:00Z',
      assignedDate: '2024-05-20',
      assignedTo: 'Hoàng Văn E',
      department: 'Khoa CNTT',
      location: 'Phòng 304'
    },
    room: {
      id: 'room-4',
      building: 'A',
      floor: '3',
      roomNumber: '304',
      status: 'ACTIVE' as any,
      unitId: '1'
    }
  },
  {
    id: '6',
    bookId: '2',
    assetId: 'asset-006',
    roomId: 'room-5',
    assignedAt: '2024-08-10T08:00:00Z',
    quantity: 1,
    status: AssetBookItemStatus.MISSING,
    note: 'Thất lạc trong quá trình di chuyển - Khoa CNTT',
    asset: {
      id: 'asset-006',
      ktCode: 'KT-2024/047',
      fixedCode: '2024.047',
      name: 'Ghế xoay văn phòng',
      specs: 'Ghế xoay chân nhôm, đệm da PU, tựa lưng ergonomic',
      entryDate: '2024-08-05',
      unit: 'Chiếc',
      quantity: 1,
      purchasePackage: 1,
      type: 'TSCD' as any,
      isLocked: true,
      isHandOver: true,
      categoryId: 'cat-6',
      status: 'đang_sử_dụng' as any,
      createdBy: 'admin',
      createdAt: '2024-08-05T00:00:00Z',
      updatedAt: '2024-08-10T00:00:00Z',
      assignedDate: '2024-08-10',
      assignedTo: 'Vũ Thị F',
      department: 'Khoa CNTT',
      location: 'Phòng 305'
    },
    room: {
      id: 'room-5',
      building: 'A',
      floor: '3',
      roomNumber: '305',
      status: 'ACTIVE' as any,
      unitId: '1'
    }
  },
  // Khoa Kinh tế - Năm 2025 (bookId: '3')
  {
    id: '7',
    bookId: '3',
    assetId: 'asset-007',
    roomId: 'room-kt-1',
    assignedAt: '2025-01-10T08:00:00Z',
    quantity: 1,
    status: AssetBookItemStatus.IN_USE,
    note: 'Máy tính All-in-One phòng B201 - Khoa Kinh tế',
    asset: {
      id: 'asset-007',
      ktCode: 'KT-2025/101',
      fixedCode: '2025.101',
      name: 'Máy tính All-in-One HP EliteOne 800 G8',
      specs: 'Intel i5-11500, 16GB RAM, 512GB SSD, 23.8" Full HD',
      entryDate: '2025-01-05',
      unit: 'Chiếc',
      quantity: 1,
      purchasePackage: 1,
      type: 'TSCD' as any,
      isLocked: false,
      isHandOver: true,
      categoryId: 'cat-1',
      status: 'đang_sử_dụng' as any,
      createdBy: 'admin',
      createdAt: '2025-01-05T00:00:00Z',
      updatedAt: '2025-01-10T00:00:00Z',
      assignedDate: '2025-01-10',
      assignedTo: 'Nguyễn Thị G',
      department: 'Khoa Kinh tế',
      location: 'Phòng B201'
    },
    room: {
      id: 'room-kt-1',
      building: 'B',
      floor: '2',
      roomNumber: '201',
      status: 'ACTIVE' as any,
      unitId: '2'
    }
  },
  {
    id: '8',
    bookId: '3',
    assetId: 'asset-008',
    roomId: 'room-kt-2',
    assignedAt: '2025-01-25T08:00:00Z',
    quantity: 1,
    status: AssetBookItemStatus.IN_USE,
    note: 'Bàn giảng viên phòng B202 - Khoa Kinh tế',
    asset: {
      id: 'asset-008',
      ktCode: 'KT-2025/102',
      fixedCode: '2025.102',
      name: 'Bàn giảng viên gỗ cao cấp',
      specs: '1.4m x 0.7m x 0.8m, gỗ tự nhiên sơn PU',
      entryDate: '2025-01-20',
      unit: 'Chiếc',
      quantity: 1,
      purchasePackage: 1,
      type: 'TSCD' as any,
      isLocked: false,
      isHandOver: true,
      categoryId: 'cat-3',
      status: 'đang_sử_dụng' as any,
      createdBy: 'admin',
      createdAt: '2025-01-20T00:00:00Z',
      updatedAt: '2025-01-25T00:00:00Z',
      assignedDate: '2025-01-25',
      assignedTo: 'Trần Văn H',
      department: 'Khoa Kinh tế',
      location: 'Phòng B202'
    },
    room: {
      id: 'room-kt-2',
      building: 'B',
      floor: '2',
      roomNumber: '202',
      status: 'ACTIVE' as any,
      unitId: '2'
    }
  },
  {
    id: '9',
    bookId: '3',
    assetId: 'asset-009',
    roomId: 'room-kt-3',
    assignedAt: '2025-02-05T08:00:00Z',
    quantity: 1,
    status: AssetBookItemStatus.IN_USE,
    note: 'Tủ sách phòng B203 - Khoa Kinh tế',
    asset: {
      id: 'asset-009',
      ktCode: 'KT-2025/103',
      fixedCode: '2025.103',
      name: 'Tủ sách gỗ 5 tầng',
      specs: '1.8m x 0.4m x 2.0m, gỗ MFC phủ Melamine',
      entryDate: '2025-02-01',
      unit: 'Chiếc',
      quantity: 1,
      purchasePackage: 1,
      type: 'TSCD' as any,
      isLocked: false,
      isHandOver: true,
      categoryId: 'cat-7',
      status: 'đang_sử_dụng' as any,
      createdBy: 'admin',
      createdAt: '2025-02-01T00:00:00Z',
      updatedAt: '2025-02-05T00:00:00Z',
      assignedDate: '2025-02-05',
      assignedTo: 'Lê Thị I',
      department: 'Khoa Kinh tế',
      location: 'Phòng B203'
    },
    room: {
      id: 'room-kt-3',
      building: 'B',
      floor: '2',
      roomNumber: '203',
      status: 'ACTIVE' as any,
      unitId: '2'
    }
  },
  {
    id: '10',
    bookId: '1',
    assetId: 'asset-010',
    roomId: 'room-1',
    assignedAt: '2025-01-12T08:00:00Z',
    quantity: 5,
    status: AssetBookItemStatus.IN_USE,
    note: 'Bộ dụng cụ sửa chữa điện tử - Khoa CNTT',
    asset: {
      id: 'asset-010',
      ktCode: 'KT-2025/004',
      fixedCode: '2025.004',
      name: 'Bộ dụng cụ sửa chữa điện tử',
      specs: 'Tua vít, kìm, đồng hồ vạn năng, hàn thiếc',
      entryDate: '2025-01-10',
      unit: 'Bộ',
      quantity: 5,
      purchasePackage: 1,
      type: 'CCDC' as any,
      isLocked: false,
      isHandOver: true,
      categoryId: 'cat-8',
      status: 'đang_sử_dụng' as any,
      createdBy: 'admin',
      createdAt: '2025-01-10T00:00:00Z',
      updatedAt: '2025-01-12T00:00:00Z',
      assignedDate: '2025-01-12',
      assignedTo: 'Nguyễn Văn A',
      department: 'Khoa CNTT',
      location: 'Phòng 301'
    },
    room: {
      id: 'room-1',
      building: 'A',
      floor: '3',
      roomNumber: '301',
      status: 'ACTIVE' as any,
      unitId: '1'
    }
  },
  {
    id: '11',
    bookId: '3',
    assetId: 'asset-011',
    roomId: 'room-kt-1',
    assignedAt: '2025-01-08T08:00:00Z',
    quantity: 2,
    status: AssetBookItemStatus.IN_USE,
    note: 'Máy tính cầm tay khoa học - Khoa Kinh tế',
    asset: {
      id: 'asset-011',
      ktCode: 'KT-2025/104',
      fixedCode: '2025.104',
      name: 'Máy tính cầm tay Casio FX-570VN Plus',
      specs: 'Máy tính khoa học, 417 chức năng, năng lượng mặt trời',
      entryDate: '2025-01-05',
      unit: 'Chiếc',
      quantity: 2,
      purchasePackage: 1,
      type: 'CCDC' as any,
      isLocked: false,
      isHandOver: true,
      categoryId: 'cat-9',
      status: 'đang_sử_dụng' as any,
      createdBy: 'admin',
      createdAt: '2025-01-05T00:00:00Z',
      updatedAt: '2025-01-08T00:00:00Z',
      assignedDate: '2025-01-08',
      assignedTo: 'Nguyễn Thị G',
      department: 'Khoa Kinh tế',
      location: 'Phòng B201'
    },
    room: {
      id: 'room-kt-1',
      building: 'B',
      floor: '2',
      roomNumber: '201',
      status: 'ACTIVE' as any,
      unitId: '2'
    }
  },
  // Thêm nhiều dữ liệu mock khác
  // Khoa Cơ khí - 2025 (bookId: '5')
  {
    id: '12',
    bookId: '5',
    assetId: 'asset-012',
    roomId: 'room-ck-1',
    assignedAt: '2025-01-12T08:00:00Z',
    quantity: 1,
    status: AssetBookItemStatus.IN_USE,
    note: 'Máy tiện CNC phòng thực hành - Khoa Cơ khí',
    asset: {
      id: 'asset-012',
      ktCode: 'KT-2025/201',
      fixedCode: '2025.201',
      name: 'Máy tiện CNC FANUC',
      specs: 'Máy tiện CNC 3 trục, điều khiển FANUC 0i-MF',
      entryDate: '2025-01-08',
      unit: 'Chiếc',
      quantity: 1,
      purchasePackage: 1,
      type: 'TSCD' as any,
      isLocked: false,
      isHandOver: true,
      categoryId: 'cat-10',
      status: 'đang_sử_dụng' as any,
      createdBy: 'admin',
      createdAt: '2025-01-08T00:00:00Z',
      updatedAt: '2025-01-12T00:00:00Z',
      assignedDate: '2025-01-12',
      assignedTo: 'Phạm Văn K',
      department: 'Khoa Cơ khí',
      location: 'Phòng thực hành CNC'
    },
    room: {
      id: 'room-ck-1',
      building: 'C',
      floor: '1',
      roomNumber: '101',
      status: 'ACTIVE' as any,
      unitId: '3'
    }
  },
  {
    id: '13',
    bookId: '5',
    assetId: 'asset-013',
    roomId: 'room-ck-2',
    assignedAt: '2025-01-18T08:00:00Z',
    quantity: 1,
    status: AssetBookItemStatus.IN_USE,
    note: 'Máy phay CNC phòng thực hành - Khoa Cơ khí',
    asset: {
      id: 'asset-013',
      ktCode: 'KT-2025/202',
      fixedCode: '2025.202',
      name: 'Máy phay CNC VMC850E',
      specs: 'Máy phay CNC 3 trục, hành trình 850x510x500mm',
      entryDate: '2025-01-15',
      unit: 'Chiếc',
      quantity: 1,
      purchasePackage: 1,
      type: 'TSCD' as any,
      isLocked: false,
      isHandOver: true,
      categoryId: 'cat-10',
      status: 'đang_sử_dụng' as any,
      createdBy: 'admin',
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-18T00:00:00Z',
      assignedDate: '2025-01-18',
      assignedTo: 'Lê Thị L',
      department: 'Khoa Cơ khí',
      location: 'Phòng thực hành CNC'
    },
    room: {
      id: 'room-ck-2',
      building: 'C',
      floor: '1',
      roomNumber: '102',
      status: 'ACTIVE' as any,
      unitId: '3'
    }
  },
  // Khoa Xây dựng - 2025 (bookId: '6')
  {
    id: '14',
    bookId: '6',
    assetId: 'asset-014',
    roomId: 'room-xd-1',
    assignedAt: '2025-01-20T08:00:00Z',
    quantity: 1,
    status: AssetBookItemStatus.IN_USE,
    note: 'Máy nén bê tông phòng thí nghiệm - Khoa Xây dựng',
    asset: {
      id: 'asset-014',
      ktCode: 'KT-2025/301',
      fixedCode: '2025.301',
      name: 'Máy nén bê tông ELE ADR-3000',
      specs: 'Máy nén bê tông tự động, lực nén 3000kN',
      entryDate: '2025-01-18',
      unit: 'Chiếc',
      quantity: 1,
      purchasePackage: 1,
      type: 'TSCD' as any,
      isLocked: false,
      isHandOver: true,
      categoryId: 'cat-11',
      status: 'đang_sử_dụng' as any,
      createdBy: 'admin',
      createdAt: '2025-01-18T00:00:00Z',
      updatedAt: '2025-01-20T00:00:00Z',
      assignedDate: '2025-01-20',
      assignedTo: 'Nguyễn Văn M',
      department: 'Khoa Xây dựng',
      location: 'Phòng thí nghiệm vật liệu'
    },
    room: {
      id: 'room-xd-1',
      building: 'D',
      floor: '1',
      roomNumber: '101',
      status: 'ACTIVE' as any,
      unitId: '4'
    }
  },
  // Khoa Điện - 2025 (bookId: '7')
  {
    id: '15',
    bookId: '7',
    assetId: 'asset-015',
    roomId: 'room-d-1',
    assignedAt: '2025-01-22T08:00:00Z',
    quantity: 1,
    status: AssetBookItemStatus.IN_USE,
    note: 'Oscilloscope kỹ thuật số - Khoa Điện',
    asset: {
      id: 'asset-015',
      ktCode: 'KT-2025/401',
      fixedCode: '2025.401',
      name: 'Oscilloscope Tektronix MSO64',
      specs: '4 kênh, băng thông 1GHz, tốc độ lấy mẫu 6.25GS/s',
      entryDate: '2025-01-20',
      unit: 'Chiếc',
      quantity: 1,
      purchasePackage: 1,
      type: 'TSCD' as any,
      isLocked: false,
      isHandOver: true,
      categoryId: 'cat-12',
      status: 'đang_sử_dụng' as any,
      createdBy: 'admin',
      createdAt: '2025-01-20T00:00:00Z',
      updatedAt: '2025-01-22T00:00:00Z',
      assignedDate: '2025-01-22',
      assignedTo: 'Trần Văn N',
      department: 'Khoa Điện',
      location: 'Phòng thí nghiệm điện tử'
    },
    room: {
      id: 'room-d-1',
      building: 'E',
      floor: '2',
      roomNumber: '201',
      status: 'ACTIVE' as any,
      unitId: '5'
    }
  },
  // Thêm một số tài sản có trạng thái khác
  {
    id: '16',
    bookId: '1',
    assetId: 'asset-016',
    roomId: 'room-1',
    assignedAt: '2025-02-01T08:00:00Z',
    quantity: 1,
    status: AssetBookItemStatus.TRANSFERRED,
    note: 'Đã chuyển sang phòng khác - Khoa CNTT',
    asset: {
      id: 'asset-016',
      ktCode: 'KT-2025/005',
      fixedCode: '2025.005',
      name: 'Máy chiếu Panasonic PT-VW545N',
      specs: 'Độ phân giải WXGA, độ sáng 5500 lumens',
      entryDate: '2025-01-28',
      unit: 'Chiếc',
      quantity: 1,
      purchasePackage: 1,
      type: 'TSCD' as any,
      isLocked: false,
      isHandOver: true,
      categoryId: 'cat-3',
      status: 'đang_sử_dụng' as any,
      createdBy: 'admin',
      createdAt: '2025-01-28T00:00:00Z',
      updatedAt: '2025-02-01T00:00:00Z',
      assignedDate: '2025-02-01',
      assignedTo: 'Lê Văn O',
      department: 'Khoa CNTT',
      location: 'Phòng 304'
    },
    room: {
      id: 'room-1',
      building: 'A',
      floor: '3',
      roomNumber: '301',
      status: 'ACTIVE' as any,
      unitId: '1'
    }
  },
  {
    id: '17',
    bookId: '3',
    assetId: 'asset-017',
    roomId: 'room-kt-2',
    assignedAt: '2025-02-10T08:00:00Z',
    quantity: 1,
    status: AssetBookItemStatus.MISSING,
    note: 'Tài sản bị thất lạc trong quá trình kiểm kê - Khoa Kinh tế',
    asset: {
      id: 'asset-017',
      ktCode: 'KT-2025/105',
      fixedCode: '2025.105',
      name: 'Laptop Dell Inspiron 15 3000',
      specs: 'Intel i3-1115G4, 4GB RAM, 256GB SSD, 15.6" HD',
      entryDate: '2025-02-05',
      unit: 'Chiếc',
      quantity: 1,
      purchasePackage: 1,
      type: 'TSCD' as any,
      isLocked: false,
      isHandOver: true,
      categoryId: 'cat-1',
      status: 'đang_sử_dụng' as any,
      createdBy: 'admin',
      createdAt: '2025-02-05T00:00:00Z',
      updatedAt: '2025-02-10T00:00:00Z',
      assignedDate: '2025-02-10',
      assignedTo: 'Phạm Thị P',
      department: 'Khoa Kinh tế',
      location: 'Phòng B202'
    },
    room: {
      id: 'room-kt-2',
      building: 'B',
      floor: '2',
      roomNumber: '202',
      status: 'ACTIVE' as any,
      unitId: '2'
    }
  }
]

const MOCK_ROOMS: Room[] = [
  // Khoa CNTT
  { id: 'room-1', building: 'A', floor: '3', roomNumber: '301', status: 'ACTIVE' as any, unitId: '1' },
  { id: 'room-2', building: 'A', floor: '3', roomNumber: '302', status: 'ACTIVE' as any, unitId: '1' },
  { id: 'room-3', building: 'A', floor: '3', roomNumber: '303', status: 'ACTIVE' as any, unitId: '1' },
  { id: 'room-4', building: 'A', floor: '3', roomNumber: '304', status: 'ACTIVE' as any, unitId: '1' },
  { id: 'room-5', building: 'A', floor: '3', roomNumber: '305', status: 'ACTIVE' as any, unitId: '1' },

  // Khoa Kinh tế
  { id: 'room-kt-1', building: 'B', floor: '2', roomNumber: '201', status: 'ACTIVE' as any, unitId: '2' },
  { id: 'room-kt-2', building: 'B', floor: '2', roomNumber: '202', status: 'ACTIVE' as any, unitId: '2' },
  { id: 'room-kt-3', building: 'B', floor: '2', roomNumber: '203', status: 'ACTIVE' as any, unitId: '2' },

  // Khoa Cơ khí
  { id: 'room-ck-1', building: 'C', floor: '1', roomNumber: '101', status: 'ACTIVE' as any, unitId: '3' },
  { id: 'room-ck-2', building: 'C', floor: '1', roomNumber: '102', status: 'ACTIVE' as any, unitId: '3' },
  { id: 'room-ck-3', building: 'C', floor: '2', roomNumber: '201', status: 'ACTIVE' as any, unitId: '3' },

  // Khoa Xây dựng
  { id: 'room-xd-1', building: 'D', floor: '1', roomNumber: '101', status: 'ACTIVE' as any, unitId: '4' },
  { id: 'room-xd-2', building: 'D', floor: '1', roomNumber: '102', status: 'ACTIVE' as any, unitId: '4' },

  // Khoa Điện
  { id: 'room-d-1', building: 'E', floor: '2', roomNumber: '201', status: 'ACTIVE' as any, unitId: '5' },
  { id: 'room-d-2', building: 'E', floor: '2', roomNumber: '202', status: 'ACTIVE' as any, unitId: '5' }
]

// Modern Status Badge Component
const StatusBadge: React.FC<{ status: AssetBookItemStatus }> = ({ status }) => {
  const getStatusConfig = (status: AssetBookItemStatus) => {
    switch (status) {
      case AssetBookItemStatus.IN_USE:
        return {
          text: 'Đang sử dụng',
          className: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="h-3 w-3" />
        }
      case AssetBookItemStatus.TRANSFERRED:
        return {
          text: 'Đã chuyển',
          className: 'bg-blue-100 text-blue-800',
          icon: <Zap className="h-3 w-3" />
        }
      case AssetBookItemStatus.LIQUIDATED:
        return {
          text: 'Đã thanh lý',
          className: 'bg-gray-100 text-gray-800',
          icon: <Archive className="h-3 w-3" />
        }
      case AssetBookItemStatus.MISSING:
        return {
          text: 'Thất lạc',
          className: 'bg-red-100 text-red-800',
          icon: <XCircle className="h-3 w-3" />
        }
      default:
        return {
          text: 'Không xác định',
          className: 'bg-gray-100 text-gray-800',
          icon: <AlertTriangle className="h-3 w-3" />
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.icon}
      <span className="ml-1">{config.text}</span>
    </span>
  )
}

export default function AssetBookPage() {
  const { user } = useAuth()
  const { currentRole } = useRole()
  const currentYear = new Date().getFullYear()

  // State
  const [selectedBook, setSelectedBook] = useState<AssetBook | null>(null)
  const [assetBooks, setAssetBooks] = useState<AssetBook[]>([])
  const [assetBookItems, setAssetBookItems] = useState<AssetBookItem[]>([])
  const [filteredAssetBookItems, setFilteredAssetBookItems] = useState<AssetBookItem[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingItems, setIsLoadingItems] = useState(false)

  // Advanced Filter states
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([])
  const [conditionLogic, setConditionLogic] = useState<'contains' | 'equals' | 'not_contains'>('contains')

  // Filters
  const [bookFilter, setBookFilter] = useState<AssetBookFilter>({
    year: currentYear,
    unitId: user?.unitId
  })

  const [selectedUnitId, setSelectedUnitId] = useState('')
  const [itemFilter, setItemFilter] = useState<AssetBookItemFilter>({
    status: undefined,
    roomId: undefined
  })
  const [selectedAssetType, setSelectedAssetType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Selected items for bulk actions
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // Handover form states
  const [showHandoverForm, setShowHandoverForm] = useState(false)
  const [handoverAssets, setHandoverAssets] = useState<Asset[]>([])
  const [isHandoverMode, setIsHandoverMode] = useState(false)

  // Lazy loading states
  const [hasMoreData, setHasMoreData] = useState(true)
  const [currentOffset, setCurrentOffset] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  // Load asset books on mount and when filter changes
  useEffect(() => {
    loadAssetBooks()
  }, [bookFilter, selectedUnitId])

  // Load asset book items when selected book changes
  useEffect(() => {
    if (selectedBook) {
      setCurrentPage(1) // Reset pagination when changing filters
      setCurrentOffset(0) // Reset offset for lazy loading
      loadAssetBookItems(selectedBook.id, 0, itemsPerPage, false)
    }
  }, [selectedBook, itemFilter, selectedAssetType])

  // Apply advanced filters
  useEffect(() => {
    let filtered = assetBookItems

    // Apply basic search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item =>
        item.asset?.name.toLowerCase().includes(query) ||
        item.asset?.ktCode.toLowerCase().includes(query) ||
        item.asset?.fixedCode.toLowerCase().includes(query) ||
        item.note?.toLowerCase().includes(query)
      )
    }

    // Apply advanced filters
    if (filterConditions.length > 0) {
      filtered = filtered.filter((item) => {
        const conditionResults = filterConditions.map((condition) => {
          if (!condition.value || (Array.isArray(condition.value) && condition.value.length === 0)) {
            return true
          }

          let fieldValue: string = ""

          switch (condition.field) {
            case "status":
              fieldValue = item.status
              break
            case "assignedAt":
              fieldValue = new Date(item.assignedAt).toISOString().split("T")[0]
              break
            case "roomId":
              fieldValue = item.room?.roomNumber || ""
              break
            case "assetType":
              fieldValue = item.asset?.type || ""
              break
            case "assetName":
              fieldValue = item.asset?.name || ""
              break
            default:
              return true
          }

          if (condition.operator === "contains") {
            if (Array.isArray(condition.value)) {
              return condition.value.some((val) =>
                String(fieldValue).toLowerCase().includes(val.toLowerCase())
              )
            }
            return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase())
          } else if (condition.operator === "equals") {
            if (Array.isArray(condition.value)) {
              return condition.value.some((val) => String(fieldValue).toLowerCase() === val.toLowerCase())
            }
            return String(fieldValue).toLowerCase() === String(condition.value).toLowerCase()
          } else if (condition.operator === "not_contains") {
            if (Array.isArray(condition.value)) {
              return !condition.value.some((val) =>
                String(fieldValue).toLowerCase().includes(val.toLowerCase())
              )
            }
            return !String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase())
          }

          return true
        })

        if (conditionLogic === "contains") {
          return conditionResults.every((result) => result)
        } else if (conditionLogic === "equals") {
          return conditionResults.some((result) => result)
        } else if (conditionLogic === "not_contains") {
          return conditionResults.every((result) => !result)
        }

        return true
      })
    }

    setFilteredAssetBookItems(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [assetBookItems, searchQuery, filterConditions, conditionLogic])

  const loadAssetBooks = async () => {
    setIsLoading(true)
    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 800))

      let filteredBooks = MOCK_ASSET_BOOKS.filter(book => {
        // If user is a unit user, only show books for their unit
        if (currentRole?.code === 'DON_VI_SU_DUNG' && user?.unitId) {
          if (book.unitId !== user.unitId) return false
        }

        if (selectedUnitId && book.unitId !== selectedUnitId) return false
        if (bookFilter.year && book.year !== bookFilter.year) return false
        if (bookFilter.status && book.status !== bookFilter.status) return false
        return true
      })

      setAssetBooks(filteredBooks)

      // Auto-select current year book if available
      const currentYearBook = filteredBooks.find(book => book.year === currentYear)
      if (currentYearBook && !selectedBook) {
        setSelectedBook(currentYearBook)
      } else if (filteredBooks.length > 0 && !selectedBook) {
        setSelectedBook(filteredBooks[0])
      }

      // Load rooms - filter by user's unit if they're a unit user
      let availableRooms = MOCK_ROOMS
      if (currentRole?.code === 'DON_VI_SU_DUNG' && user?.unitId) {
        availableRooms = MOCK_ROOMS.filter(room => room.unitId === user.unitId)
      }
      setRooms(availableRooms)
    } catch (error) {
      console.error('Error loading asset books:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAssetBookItems = async (bookId: string, offset = 0, limit = itemsPerPage, append = false) => {
    if (offset === 0) {
      setIsLoadingItems(true)
    }

    try {
      // Simulate API call with pagination
      await new Promise(resolve => setTimeout(resolve, 500))

      let filteredItems = MOCK_ASSET_BOOK_ITEMS.filter(item => {
        if (item.bookId !== bookId) return false
        if (itemFilter.status && item.status !== itemFilter.status) return false
        if (itemFilter.roomId && item.roomId !== itemFilter.roomId) return false
        if (selectedAssetType !== 'all' && item.asset?.type !== selectedAssetType) return false
        return true
      })

      // Simulate pagination
      const totalItems = filteredItems.length
      const paginatedItems = filteredItems.slice(offset, offset + limit)

      setTotalCount(totalItems)
      setHasMoreData(offset + limit < totalItems)
      setCurrentOffset(offset + limit)

      if (append) {
        setAssetBookItems(prev => [...prev, ...paginatedItems])
      } else {
        setAssetBookItems(paginatedItems)
      }
    } catch (error) {
      console.error('Error loading asset book items:', error)
    } finally {
      setIsLoadingItems(false)
    }
  }

  // Load more data function for lazy loading
  const loadMoreItems = () => {
    if (selectedBook && hasMoreData && !isLoadingItems) {
      loadAssetBookItems(selectedBook.id, currentOffset, itemsPerPage, true)
    }
  }

  // Filter options for AdvancedFilter
  const filterOptions = [
    {
      value: 'status',
      label: 'Trạng thái',
      type: 'select' as const,
      options: [
        { value: AssetBookItemStatus.IN_USE, label: 'Đang sử dụng' },
        { value: AssetBookItemStatus.TRANSFERRED, label: 'Đã chuyển' },
        { value: AssetBookItemStatus.LIQUIDATED, label: 'Đã thanh lý' },
        { value: AssetBookItemStatus.MISSING, label: 'Thất lạc' },
      ]
    },
    { value: 'assignedAt', label: 'Ngày ghi nhận', type: 'date' as const },
    {
      value: 'roomId',
      label: 'Phòng',
      type: 'select' as const,
      options: rooms.map(room => ({
        value: room.id,
        label: `${room.building ? `${room.building}-` : ''}${room.floor ? `${room.floor}-` : ''}${room.roomNumber}`
      }))
    },
    {
      value: 'assetType',
      label: 'Loại tài sản',
      type: 'select' as const,
      options: [
        { value: 'TSCD', label: 'Tài sản cố định' },
        { value: 'CCDC', label: 'Công cụ dụng cụ' },
      ]
    },
    { value: 'assetName', label: 'Tên tài sản', type: 'text' as const }
  ]

  // Statistics
  const statistics = useMemo(() => {
    const total = filteredAssetBookItems.length
    const inUse = filteredAssetBookItems.filter(item => item.status === AssetBookItemStatus.IN_USE).length
    const transferred = filteredAssetBookItems.filter(item => item.status === AssetBookItemStatus.TRANSFERRED).length
    const liquidated = filteredAssetBookItems.filter(item => item.status === AssetBookItemStatus.LIQUIDATED).length
    const missing = filteredAssetBookItems.filter(item => item.status === AssetBookItemStatus.MISSING).length
    const tscd = filteredAssetBookItems.filter(item => item.asset?.type === 'TSCD').length
    const ccdc = filteredAssetBookItems.filter(item => item.asset?.type === 'CCDC').length

    return { total, inUse, transferred, liquidated, missing, tscd, ccdc }
  }, [filteredAssetBookItems])

  // Pagination
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAssetBookItems.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAssetBookItems, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredAssetBookItems.length / itemsPerPage)

  // Helper functions
  const getUnitName = (unitId: string) => {
    const unit = mockUnits.find(u => u.id === unitId)
    return unit?.name || 'N/A'
  }

  // Available years for dropdown
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(MOCK_ASSET_BOOKS.map(book => book.year)))
    return years.sort((a, b) => b - a) // Newest first
  }, [])

  const handleYearChange = (year: number) => {
    setBookFilter(prev => ({ ...prev, year }))
    setSelectedBook(null)
  }

  const handleRoomFilter = (roomId: string) => {
    setItemFilter(prev => ({ ...prev, roomId: roomId === 'all' ? undefined : roomId }))
  }

  const handleStatusFilter = (status: string) => {
    setItemFilter(prev => ({
      ...prev,
      status: status === 'all' ? undefined : status as AssetBookItemStatus
    }))
  }

  const handleAssetTypeFilter = (assetType: string) => {
    setSelectedAssetType(assetType)
  }

  const handleExport = () => {
    // Implementation for export functionality
    console.log('Exporting asset book data...')
  }

  const handleResetFilters = () => {
    setFilterConditions([])
    setConditionLogic('contains')
    setSearchQuery('')
    setItemFilter({ status: undefined, roomId: undefined })
    setSelectedAssetType('all')
  }

  // Handover functions
  const handleBulkHandover = () => {
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất một tài sản để bàn giao.')
      return
    }

    const selectedAssetBookItems = filteredAssetBookItems.filter(item =>
      selectedItems.includes(item.id) && item.status === AssetBookItemStatus.IN_USE
    )

    if (selectedAssetBookItems.length === 0) {
      alert('Không có tài sản nào có thể bàn giao. Chỉ có thể bàn giao tài sản đang sử dụng.')
      return
    }

    const assetsForHandover = selectedAssetBookItems.map(item => item.asset!).filter(Boolean)
    setHandoverAssets(assetsForHandover)
    setIsHandoverMode(true)
  }

  const handleSingleHandover = (item: AssetBookItem) => {
    if (!item.asset) {
      alert('Không thể bàn giao tài sản này.')
      return
    }

    if (item.status !== AssetBookItemStatus.IN_USE) {
      alert('Chỉ có thể bàn giao tài sản đang sử dụng.')
      return
    }

    setHandoverAssets([item.asset])
    setIsHandoverMode(true)
  }

  const handleHandoverSuccess = (transaction: any) => {
    console.log('Handover completed:', transaction)
    alert(`Bàn giao ${transaction.items?.length || 0} tài sản thành công!`)

    // Reset selection and close form
    setSelectedItems([])
    setIsHandoverMode(false)
    setHandoverAssets([])

    // Reload data (in real app, you would update the backend and reload)
    loadAssetBooks()
  }

  const handleHandoverCancel = () => {
    setIsHandoverMode(false)
    setHandoverAssets([])
  }

  // Define table columns
  const columns: TableColumn<AssetBookItem>[] = [
    {
      key: "asset",
      title: "Tài sản",
      render: (_, item) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm">
              <Package2 className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {item.asset?.name}
            </div>
            <div className="text-sm text-gray-500">
              {item.asset?.specs}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "codes",
      title: "Mã số",
      render: (_, item) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{item.asset?.ktCode}</div>
          <div className="text-sm text-gray-500">{item.asset?.fixedCode}</div>
        </div>
      ),
    },
    {
      key: "location",
      title: "Vị trí",
      render: (_, item) => (
        <div className="flex items-center text-sm text-gray-900">
          <MapPin className="h-4 w-4 text-gray-400 mr-1" />
          <span>
            {item.room?.building ? `${item.room.building}-` : ''}
            {item.room?.floor ? `${item.room.floor}-` : ''}
            {item.room?.roomNumber}
          </span>
        </div>
      ),
    },
    {
      key: "assignedAt",
      title: "Ngày ghi nhận",
      render: (_, item) => (
        <div className="text-sm text-gray-900">
          {new Date(item.assignedAt).toLocaleDateString('vi-VN')}
        </div>
      ),
    },
    {
      key: "quantity",
      title: "Số lượng",
      render: (_, item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {item.quantity} {item.asset?.unit}
        </span>
      ),
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (_, item) => <StatusBadge status={item.status} />,
    },
    {
      key: "actions",
      title: "Hành động",
      render: (_, item) => (
        <div className="flex items-center justify-end space-x-2">
          <Link
            href={`/asset/${item.asset?.id}`}
            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center"
            title="Xem chi tiết"
          >
            <Eye className="h-4 w-4" />
          </Link>
          {item.status === AssetBookItemStatus.IN_USE && (
            <button
              onClick={() => handleSingleHandover(item)}
              className="p-1.5 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors flex items-center justify-center"
              title="Bàn giao tài sản"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ]

  const canViewAssetBook = () => {
    if (!currentRole) return false
    // Check if user has permission to view asset books
    return currentRole.code === 'DON_VI_SU_DUNG' ||
      ['SUPER_ADMIN', 'ADMIN', 'PHONG_QUAN_TRI', 'PHONG_KE_HOACH_DAU_TU'].includes(currentRole.code)
  }

  if (!canViewAssetBook()) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Không có quyền truy cập</h3>
        <p className="mt-1 text-sm text-gray-500">
          Bạn cần có quyền phù hợp để xem sổ tài sản.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sổ Tài Sản</h1>
              <p className="mt-1 text-sm text-gray-600">
                Quản lý và theo dõi tài sản của đơn vị
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => loadAssetBooks()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Đang tải...' : 'Làm mới'}
              </Button>
              <Button onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Xuất báo cáo
              </Button>
            </div>
          </div>
        </div>

        {/* Modern Statistics Dashboard */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {/* Total Assets Card */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Tổng Tài Sản</p>
                    <p className="text-3xl font-bold text-gray-900">{statistics.total}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* In Use Assets Card */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Đang Sử Dụng</p>
                    <p className="text-3xl font-bold text-gray-900">{statistics.inUse}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Transferred Assets Card */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Đã Chuyển</p>
                    <p className="text-3xl font-bold text-gray-900">{statistics.transferred}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl shadow-lg">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Control Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Bảng điều khiển</h2>
              <p className="text-sm text-gray-600 mt-1">Chọn đơn vị và năm để xem sổ tài sản</p>
            </div>
            {selectedBook && (
              <Badge
                variant={selectedBook.status === BookStatus.OPEN ? 'default' : 'secondary'}
                className="px-3 py-1.5 text-sm font-medium"
              >
                {selectedBook.status === BookStatus.OPEN ? (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    Đang mở
                  </div>
                ) : (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                    Đã khóa
                  </div>
                )}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Unit selector - show for admin roles and PHONG_QUAN_TRI */}
            {(currentRole?.code === 'SUPER_ADMIN' ||
              currentRole?.code === 'ADMIN' ||
              currentRole?.code === 'PHONG_QUAN_TRI') && (
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center mb-3">
                      <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="text-sm font-semibold text-gray-900">Chọn đơn vị</h3>
                    </div>
                    <select
                      value={selectedUnitId}
                      onChange={(e) => {
                        setSelectedUnitId(e.target.value)
                        setSelectedBook(null)
                      }}
                      className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
                    >
                      <option value="">Tất cả đơn vị</option>
                      {mockUnits
                        .filter(unit => unit.type === UnitType.DON_VI_SU_DUNG)
                        .map(unit => (
                          <option key={unit.id} value={unit.id}>
                            {unit.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

            {/* Year selector */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-center mb-3">
                  <CalendarDays className="h-5 w-5 text-purple-600 mr-2" />
                  <h3 className="text-sm font-semibold text-gray-900">Chọn năm</h3>
                </div>
                <select
                  value={bookFilter.year || ''}
                  onChange={(e) => handleYearChange(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Asset Type Filter - Separate Card */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
                <div className="flex items-center mb-3">
                  <Package className="h-5 w-5 text-orange-600 mr-2" />
                  <h3 className="text-sm font-semibold text-gray-900">Loại tài sản</h3>
                </div>
                <select
                  value={selectedAssetType}
                  onChange={(e) => handleAssetTypeFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
                >
                  <option value="all">Tất cả loại tài sản</option>
                  <option value="TSCD">Tài sản cố định</option>
                  <option value="CCDC">Công cụ dụng cụ</option>
                </select>
                {selectedAssetType !== 'all' && (
                  <div className="mt-3 p-3 bg-white/70 rounded-lg">
                    <div className="space-y-1">
                      <div className="text-xs text-orange-700 font-semibold">
                        {selectedAssetType === 'TSCD' ? 'Tài sản cố định' : 'Công cụ dụng cụ'}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Số lượng:</span>
                        <span className="font-medium text-orange-700">
                          {filteredAssetBookItems.filter(item => item.asset?.type === selectedAssetType).length} tài sản
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Đang sử dụng:</span>
                        <span className="font-medium text-green-600">
                          {filteredAssetBookItems.filter(item => item.asset?.type === selectedAssetType && item.status === AssetBookItemStatus.IN_USE).length}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Selected book info */}
            <div className="lg:col-span-1">
              {selectedBook ? (
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100 h-full">
                  <div className="flex items-center mb-3">
                    <FileText className="h-5 w-5 text-emerald-600 mr-2" />
                    <h3 className="text-sm font-semibold text-gray-900">Sổ được chọn</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white/70 rounded-lg p-3 space-y-2">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {getUnitName(selectedBook.unitId)}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Năm {selectedBook.year} • {new Date(selectedBook.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>

                      {(() => {
                        const unit = mockUnits.find(u => u.id === selectedBook.unitId)
                        return unit && (
                          <div className="space-y-1 pt-2 border-t border-emerald-100">
                            {unit.email && (
                              <div className="flex items-center text-xs text-gray-600">
                                <span className="inline-block w-12 text-gray-500">Email:</span>
                                <span className="font-medium">{unit.email}</span>
                              </div>
                            )}
                            {unit.phone && (
                              <div className="flex items-center text-xs text-gray-600">
                                <span className="inline-block w-12 text-gray-500">SĐT:</span>
                                <span className="font-medium">{unit.phone}</span>
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-700 font-medium flex items-center">
                        <Package className="h-3 w-3 mr-1" />
                        {filteredAssetBookItems.length} tài sản
                      </span>
                      <span className="text-emerald-700 font-medium flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {statistics.inUse} đang sử dụng
                      </span>
                    </div>

                    {statistics.missing > 0 && (
                      <div className="bg-red-50 border border-red-100 rounded-lg p-2">
                        <div className="text-xs text-red-700 font-medium flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {statistics.missing} tài sản thất lạc
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200 h-full flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <div className="text-sm text-gray-500">Chọn đơn vị và năm để xem sổ tài sản</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Filter */}
        <Suspense fallback={<SkeletonCard />}>
          <AdvancedFilter
            title="Tìm kiếm nâng cao"
            filterOptions={filterOptions}
            conditions={filterConditions}
            conditionLogic={conditionLogic}
            onConditionsChange={setFilterConditions}
            onConditionLogicChange={setConditionLogic}
            onApply={() => {
              console.log("Applying filters:", { filterConditions, conditionLogic });
            }}
            onReset={handleResetFilters}
          />
        </Suspense>

        {/* Asset Book Items Table or Handover Form */}
        {!isHandoverMode ? (
          <div className='my-8'>
            {/* Asset Book Items Table using Table component */}
            {isLoadingItems && filteredAssetBookItems.length === 0 ? (
              <SkeletonTable />
            ) : (
              <Table
                columns={columns}
                data={paginatedItems}
                loading={isLoadingItems}
                title={
                  <div className="flex items-center">
                    Danh sách tài sản
                  </div>
                }
                description={
                  selectedBook
                    ? `Sổ tài sản năm ${selectedBook?.year} - ${getUnitName(selectedBook?.unitId || '')}`
                    : 'Chọn sổ tài sản để xem danh sách tài sản'
                }
                headerExtra={
                  selectedItems.length > 0 ? (
                    <Button
                      onClick={handleBulkHandover}
                      size="sm"
                      className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <ArrowRightLeft className="h-4 w-4 mr-1" />
                      Tạo yêu cầu bàn giao
                    </Button>
                  ) : null
                }
                emptyText={
                  selectedBook
                    ? `Sổ năm ${selectedBook?.year} của ${getUnitName(selectedBook?.unitId || '')} chưa có tài sản nào được ghi nhận.`
                    : 'Không tìm thấy sổ tài sản cho năm được chọn.'
                }
                emptyIcon={<Package className="mx-auto h-12 w-12 text-gray-400" />}
                rowKey="id"
                rowSelection={{
                  selectedRowKeys: selectedItems,
                  onChange: (selectedRowKeys) => {
                    setSelectedItems(selectedRowKeys);
                  },
                }}
              />
            )}

            {/* Pagination */}
            {filteredAssetBookItems.length > 0 && (
              <div className="flex flex-col items-center space-y-4 mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredAssetBookItems.length / itemsPerPage)}
                  onPageChange={setCurrentPage}
                />

                {/* Load More Button for Lazy Loading */}
                {hasMoreData && (
                  <Button
                    onClick={loadMoreItems}
                    disabled={isLoadingItems}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    {isLoadingItems ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Đang tải...</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        <span>Tải thêm dữ liệu ({totalCount - filteredAssetBookItems.length} còn lại)</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className='my-8'>
          <Suspense fallback={<SkeletonTable />}>
            <HandoverForm
              assets={handoverAssets}
              onCancel={handleHandoverCancel}
              onSuccess={handleHandoverSuccess}
              title="Bàn giao tài sản từ sổ tài sản"
            />
          </Suspense>
          </div>
        )}
      </div>
    </div>
  )
}
