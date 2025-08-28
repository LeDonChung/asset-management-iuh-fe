'use client'

import React, { useState, useEffect, useMemo } from 'react'
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
  UnitType
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
import { mockUnits } from '@/lib/mockData'
import Link from 'next/link'

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
    assetId: 'asset-001',
    roomId: 'room-2',
    assignedAt: '2025-01-20T08:00:00Z',
    quantity: 1,
    status: AssetBookItemStatus.IN_USE,
    note: 'Máy in laser phòng 302 - Khoa CNTT',
    asset: {
      id: 'asset-001',
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
    assetId: 'asset-001',
    roomId: 'room-3',
    assignedAt: '2025-02-01T08:00:00Z',
    quantity: 1,
    status: AssetBookItemStatus.IN_USE,
    note: 'Máy chiếu phòng 303 - Khoa CNTT',
    asset: {
      id: 'asset-001',
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
    assetId: 'asset-001',
    roomId: 'room-1',
    assignedAt: '2024-03-15T08:00:00Z',
    quantity: 1,
    status: AssetBookItemStatus.TRANSFERRED,
    note: 'Đã chuyển sang phòng 305 - Khoa CNTT',
    asset: {
      id: 'asset-001',
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
    assetId: 'asset-001',
    roomId: 'room-4',
    assignedAt: '2024-05-20T08:00:00Z',
    quantity: 1,
    status: AssetBookItemStatus.IN_USE,
    note: 'Tủ hồ sơ phòng 304 - Khoa CNTT',
    asset: {
      id: 'asset-001',
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
    assetId: 'asset-001',
    roomId: 'room-5',
    assignedAt: '2024-08-10T08:00:00Z',
    quantity: 1,
    status: AssetBookItemStatus.MISSING,
    note: 'Thất lạc trong quá trình di chuyển - Khoa CNTT',
    asset: {
      id: 'asset-001',
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
    assetId: 'asset-001',
    roomId: 'room-kt-1',
    assignedAt: '2025-01-10T08:00:00Z',
    quantity: 1,
    status: AssetBookItemStatus.IN_USE,
    note: 'Máy tính All-in-One phòng B201 - Khoa Kinh tế',
    asset: {
      id: 'asset-001',
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
    assetId: 'asset-001',
    roomId: 'room-kt-2',
    assignedAt: '2025-01-25T08:00:00Z',
    quantity: 1,
    status: AssetBookItemStatus.IN_USE,
    note: 'Bàn giảng viên phòng B202 - Khoa Kinh tế',
    asset: {
      id: 'asset-001',
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
    assetId: 'asset-001',
    roomId: 'room-kt-3',
    assignedAt: '2025-02-05T08:00:00Z',
    quantity: 1,
    status: AssetBookItemStatus.IN_USE,
    note: 'Tủ sách phòng B203 - Khoa Kinh tế',
    asset: {
      id: 'asset-001',
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
    assetId: 'asset-001',
    roomId: 'room-1',
    assignedAt: '2025-01-12T08:00:00Z',
    quantity: 5,
    status: AssetBookItemStatus.IN_USE,
    note: 'Bộ dụng cụ sửa chữa điện tử - Khoa CNTT',
    asset: {
      id: 'asset-001',
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
    assetId: 'asset-001',
    roomId: 'room-kt-1',
    assignedAt: '2025-01-08T08:00:00Z',
    quantity: 2,
    status: AssetBookItemStatus.IN_USE,
    note: 'Máy tính cầm tay khoa học - Khoa Kinh tế',
    asset: {
      id: 'asset-001',
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
  }
]

const MOCK_ROOMS: Room[] = [
  { id: 'room-1', building: 'A', floor: '3', roomNumber: '301', status: 'ACTIVE' as any, unitId: 'unit-1' },
  { id: 'room-2', building: 'A', floor: '3', roomNumber: '302', status: 'ACTIVE' as any, unitId: 'unit-1' },
  { id: 'room-3', building: 'A', floor: '3', roomNumber: '303', status: 'ACTIVE' as any, unitId: 'unit-1' },
  { id: 'room-4', building: 'A', floor: '3', roomNumber: '304', status: 'ACTIVE' as any, unitId: 'unit-1' },
  { id: 'room-5', building: 'A', floor: '3', roomNumber: '305', status: 'ACTIVE' as any, unitId: 'unit-1' }
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
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingItems, setIsLoadingItems] = useState(false)

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

  // Load asset books on mount and when filter changes
  useEffect(() => {
    loadAssetBooks()
  }, [bookFilter, selectedUnitId])

  // Load asset book items when selected book changes
  useEffect(() => {
    if (selectedBook) {
      setCurrentPage(1) // Reset pagination when changing filters
      loadAssetBookItems(selectedBook.id)
    }
  }, [selectedBook, itemFilter, searchQuery, selectedAssetType])

  // Mock API calls
  const loadAssetBooks = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

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

  const loadAssetBookItems = async (bookId: string) => {
    setIsLoadingItems(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))

      let filteredItems = MOCK_ASSET_BOOK_ITEMS.filter(item => {
        if (item.bookId !== bookId) return false
        if (itemFilter.status && item.status !== itemFilter.status) return false
        if (itemFilter.roomId && item.roomId !== itemFilter.roomId) return false
        if (selectedAssetType !== 'all' && item.asset?.type !== selectedAssetType) return false
        return true
      })

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        filteredItems = filteredItems.filter(item =>
          item.asset?.name.toLowerCase().includes(query) ||
          item.asset?.ktCode.toLowerCase().includes(query) ||
          item.asset?.fixedCode.toLowerCase().includes(query) ||
          item.note?.toLowerCase().includes(query)
        )
      }

      setAssetBookItems(filteredItems)
    } catch (error) {
      console.error('Error loading asset book items:', error)
    } finally {
      setIsLoadingItems(false)
    }
  }

  // Statistics
  const statistics = useMemo(() => {
    const total = assetBookItems.length
    const inUse = assetBookItems.filter(item => item.status === AssetBookItemStatus.IN_USE).length
    const transferred = assetBookItems.filter(item => item.status === AssetBookItemStatus.TRANSFERRED).length
    const liquidated = assetBookItems.filter(item => item.status === AssetBookItemStatus.LIQUIDATED).length
    const missing = assetBookItems.filter(item => item.status === AssetBookItemStatus.MISSING).length
    const tscd = assetBookItems.filter(item => item.asset?.type === 'TSCD').length
    const ccdc = assetBookItems.filter(item => item.asset?.type === 'CCDC').length

    return { total, inUse, transferred, liquidated, missing, tscd, ccdc }
  }, [assetBookItems])

  // Pagination
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return assetBookItems.slice(startIndex, startIndex + itemsPerPage)
  }, [assetBookItems, currentPage, itemsPerPage])

  const totalPages = Math.ceil(assetBookItems.length / itemsPerPage)

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
                          {assetBookItems.filter(item => item.asset?.type === selectedAssetType).length} tài sản
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Đang sử dụng:</span>
                        <span className="font-medium text-green-600">
                          {assetBookItems.filter(item => item.asset?.type === selectedAssetType && item.status === AssetBookItemStatus.IN_USE).length}
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
                        {assetBookItems.length} tài sản
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

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Tìm kiếm tài sản, mã KT, mã TSCD..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Bộ lọc
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phòng</label>
                <select
                  value={itemFilter.roomId || 'all'}
                  onChange={(e) => handleRoomFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tất cả phòng</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.building ? `${room.building}-` : ''}{room.floor ? `${room.floor}-` : ''}{room.roomNumber}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                <select
                  value={itemFilter.status || 'all'}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value={AssetBookItemStatus.IN_USE}>Đang sử dụng</option>
                  <option value={AssetBookItemStatus.TRANSFERRED}>Đã chuyển</option>
                  <option value={AssetBookItemStatus.LIQUIDATED}>Đã thanh lý</option>
                  <option value={AssetBookItemStatus.MISSING}>Thất lạc</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setItemFilter({ status: undefined, roomId: undefined })
                    setSearchQuery('')
                    setSelectedAssetType('all')
                  }}
                  className="w-full"
                >
                  Xóa bộ lọc
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Asset Book Items Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Danh sách tài sản
                  {selectedBook && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      - {getUnitName(selectedBook.unitId)} - Sổ năm {selectedBook.year}
                    </span>
                  )}
                </h2>
                {assetBookItems.length > 0 && (
                  <p className="mt-1 text-sm text-gray-500">
                    {assetBookItems.length} tài sản được tìm thấy
                  </p>
                )}
              </div>
            </div>
          </div>

          {isLoadingItems ? (
            <div className="p-8">
              <div className="animate-pulse">
                <div className="space-y-4">
                  <div className="grid grid-cols-7 gap-4">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-7 gap-4">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <div key={j} className="h-10 bg-gray-100 rounded"></div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : assetBookItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy tài sản</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedBook
                  ? `Sổ năm ${selectedBook.year} của ${getUnitName(selectedBook.unitId)} chưa có tài sản nào được ghi nhận.`
                  : 'Không tìm thấy sổ tài sản cho năm được chọn.'
                }
              </p>
              <div className="mt-6">
                <Button
                  onClick={() => {
                    setSearchQuery('')
                    setItemFilter({ status: undefined, roomId: undefined })
                  }}
                >
                  Đặt lại bộ lọc
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tài sản
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã số
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vị trí
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày ghi nhận
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số lượng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedItems.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.asset?.ktCode}</div>
                        <div className="text-sm text-gray-500">{item.asset?.fixedCode}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                          <span>
                            {item.room?.building ? `${item.room.building}-` : ''}
                            {item.room?.floor ? `${item.room.floor}-` : ''}
                            {item.room?.roomNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.assignedAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.quantity} {item.asset?.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                              className="p-1.5 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors flex items-center justify-center"
                              title="Di chuyển"
                            >
                              <ArrowRightLeft className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Sau
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Hiển thị{" "}
                    <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> đến{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, assetBookItems.length)}
                    </span>{" "}
                    trong tổng số{" "}
                    <span className="font-medium">{assetBookItems.length}</span> tài sản
                  </p>
                </div>
                <div>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
