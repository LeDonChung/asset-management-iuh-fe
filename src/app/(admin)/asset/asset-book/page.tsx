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
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'

// Mock data for demonstration
const MOCK_ASSET_BOOKS: AssetBook[] = [
  {
    id: '1',
    unitId: 'unit-1',
    year: 2025,
    createdBy: 'user-1',
    createdAt: '2025-01-01T00:00:00Z',
    status: BookStatus.OPEN,
    unit: {
      id: 'unit-1',
      name: 'Khoa Công Nghệ Thông Tin',
      type: 'don_vi_su_dung' as any,
      representativeId: 'user-1',
      status: 'ACTIVE' as any,
      createdBy: 'admin',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  },
  {
    id: '2',
    unitId: 'unit-1',
    year: 2024,
    createdBy: 'user-1',
    createdAt: '2024-01-01T00:00:00Z',
    lockedAt: '2024-12-31T23:59:59Z',
    status: BookStatus.CLOSE,
    unit: {
      id: 'unit-1',
      name: 'Khoa Công Nghệ Thông Tin',
      type: 'don_vi_su_dung' as UnitType,
      representativeId: 'user-1',
      status: 'ACTIVE' as any,
      createdBy: 'admin',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  }
]

const MOCK_ASSET_BOOK_ITEMS: AssetBookItem[] = [
  {
    id: '1',
    bookId: '1',
    assetId: 'asset-1',
    roomId: 'room-1',
    assignedAt: '2025-01-15T08:00:00Z',
    quantity: 1,
    status: AssetBookItemStatus.IN_USE,
    note: 'Máy tính để bàn phòng 301',
    asset: {
      id: 'asset-1',
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
      unitId: 'unit-1'
    }
  },
  {
    id: '2',
    bookId: '1',
    assetId: 'asset-2',
    roomId: 'room-2',
    assignedAt: '2025-01-20T08:00:00Z',
    quantity: 1,
    status: AssetBookItemStatus.IN_USE,
    note: 'Máy in laser phòng 302',
    asset: {
      id: 'asset-2',
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
      unitId: 'unit-1'
    }
  },
  {
    id: '3',
    bookId: '1',
    assetId: 'asset-3',
    roomId: 'room-1',
    assignedAt: '2024-12-01T08:00:00Z',
    quantity: 1,
    status: AssetBookItemStatus.TRANSFERRED,
    note: 'Đã chuyển sang phòng 305',
    asset: {
      id: 'asset-3',
      ktCode: 'KT-2024/050',
      fixedCode: '2024.050',
      name: 'Bàn làm việc gỗ',
      specs: '1.2m x 0.6m x 0.8m',
      entryDate: '2024-11-15',
      unit: 'Chiếc',
      quantity: 1,
      purchasePackage: 1,
      type: 'TSCD' as any,
      isLocked: true,
      isHandOver: true,
      categoryId: 'cat-3',
      status: 'đang_sử_dụng' as any,
      createdBy: 'admin',
      createdAt: '2024-11-15T00:00:00Z',
      updatedAt: '2024-12-01T00:00:00Z',
      assignedDate: '2024-12-01',
      assignedTo: 'Lê Văn C',
      department: 'Khoa CNTT',
      location: 'Phòng 305'
    },
    room: {
      id: 'room-1',
      building: 'A',
      floor: '3',
      roomNumber: '301',
      status: 'ACTIVE' as any,
      unitId: 'unit-1'
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

// Status Badge Component
const StatusBadge: React.FC<{ status: AssetBookItemStatus }> = ({ status }) => {
  const getStatusConfig = (status: AssetBookItemStatus) => {
    switch (status) {
      case AssetBookItemStatus.IN_USE:
        return {
          text: 'Đang sử dụng',
          className: 'bg-green-100 text-green-800'
        }
      case AssetBookItemStatus.TRANSFERRED:
        return {
          text: 'Đã chuyển',
          className: 'bg-blue-100 text-blue-800'
        }
      case AssetBookItemStatus.LIQUIDATED:
        return {
          text: 'Đã thanh lý',
          className: 'bg-gray-100 text-gray-800'
        }
      case AssetBookItemStatus.MISSING:
        return {
          text: 'Thất lạc',
          className: 'bg-red-100 text-red-800'
        }
      default:
        return {
          text: 'Không xác định',
          className: 'bg-gray-100 text-gray-800'
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge className={config.className}>
      {config.text}
    </Badge>
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
  
  const [itemFilter, setItemFilter] = useState<AssetBookItemFilter>({
    status: undefined,
    roomId: undefined
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Load asset books on mount and when filter changes
  useEffect(() => {
    loadAssetBooks()
  }, [bookFilter])

  // Load asset book items when selected book changes
  useEffect(() => {
    if (selectedBook) {
      setCurrentPage(1) // Reset pagination when changing filters
      loadAssetBookItems(selectedBook.id)
    }
  }, [selectedBook, itemFilter, searchQuery])

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
        
        if (bookFilter.unitId && book.unitId !== bookFilter.unitId) return false
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

    return { total, inUse, transferred, liquidated, missing }
  }, [assetBookItems])

  // Pagination
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return assetBookItems.slice(startIndex, startIndex + itemsPerPage)
  }, [assetBookItems, currentPage, itemsPerPage])

  const totalPages = Math.ceil(assetBookItems.length / itemsPerPage)

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sổ tài sản</h1>
          <p className="text-gray-600">
            Quản lý và theo dõi tài sản của đơn vị một cách chi tiết
          </p>
        </div>
        <div className="flex items-center space-x-3">
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

      {/* Year and Book Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-6">
            {/* Year selector */}
            <div className="flex items-center space-x-2">
              <CalendarDays className="h-5 w-5 text-gray-400" />
              <label className="text-sm font-medium text-gray-700">Năm:</label>
              <select
                value={bookFilter.year || ''}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Book status */}
            {selectedBook && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Trạng thái:</span>
                <Badge
                  className={selectedBook.status === BookStatus.OPEN 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                  }
                >
                  {selectedBook.status === BookStatus.OPEN ? 'Đang mở' : 'Đã khóa'}
                </Badge>
              </div>
            )}
          </div>

          {/* Statistics Dashboard */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{statistics.total}</div>
              <div className="text-xs text-gray-500 uppercase">Tổng số</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{statistics.inUse}</div>
              <div className="text-xs text-gray-500 uppercase">Đang dùng</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{statistics.transferred}</div>
              <div className="text-xs text-gray-500 uppercase">Đã chuyển</div>
            </div>
            {statistics.missing > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{statistics.missing}</div>
                <div className="text-xs text-gray-500 uppercase">Thất lạc</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên tài sản, mã KT, mã TSCD..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-blue-50 border-blue-300" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            Bộ lọc
          </Button>
        </div>

        {/* Advanced Filter */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phòng
              </label>
              <select
                value={itemFilter.roomId || 'all'}
                onChange={(e) => handleRoomFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={itemFilter.status || 'all'}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                }}
                size="sm"
              >
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Asset Book Items */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Danh sách tài sản 
              {selectedBook && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  - Sổ năm {selectedBook.year}
                </span>
              )}
            </h2>
            {assetBookItems.length > 0 && (
              <span className="text-sm text-gray-600">
                {assetBookItems.length} mục
              </span>
            )}
          </div>
        </div>

        {isLoadingItems ? (
          <div className="p-6">
            <div className="animate-pulse">
              <div className="space-y-3">
                <div className="grid grid-cols-7 gap-4">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-7 gap-4">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <div key={j} className="h-8 bg-gray-100 rounded"></div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : assetBookItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có tài sản</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedBook 
                ? `Sổ năm ${selectedBook.year} chưa có tài sản nào được ghi nhận.`
                : 'Không tìm thấy sổ tài sản cho năm được chọn.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ghi chú
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Package className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {item.asset?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.asset?.specs}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{item.asset?.ktCode}</div>
                      <div className="text-sm text-gray-500">{item.asset?.fixedCode}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        <span>
                          {item.room?.building ? `${item.room.building}-` : ''}
                          {item.room?.floor ? `${item.room.floor}-` : ''}
                          {item.room?.roomNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(item.assignedAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.quantity} {item.asset?.unit}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.note || '-'}
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
        <div className="bg-white px-4 py-3 rounded-lg shadow flex items-center justify-between border-t border-gray-200 sm:px-6">
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
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
