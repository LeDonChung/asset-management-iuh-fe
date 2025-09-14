'use client'

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { 
  fetchAssets, 
  setFilters, 
  clearFilters,
  setCurrentAsset 
} from '@/lib/store/slices/assetSlice'
import { AssetStatus, AssetType } from '@/types/asset'

export function AssetReduxExample() {
  const dispatch = useAppDispatch()
  const { 
    assets, 
    currentAsset, 
    loading, 
    error, 
    filters, 
    pagination 
  } = useAppSelector((state) => state.asset)

  useEffect(() => {
    // Fetch assets when component mounts
    dispatch(fetchAssets({ page: 1, limit: 10 }))
  }, [dispatch])

  const handleFilterChange = (newFilters: any) => {
    dispatch(setFilters(newFilters))
    // Fetch assets with new filters
    dispatch(fetchAssets({ 
      page: 1, 
      limit: pagination.limit, 
      filters: { ...filters, ...newFilters } 
    }))
  }

  const handleAssetSelect = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId)
    dispatch(setCurrentAsset(asset || null))
  }

  const handleClearFilters = () => {
    dispatch(clearFilters())
    dispatch(fetchAssets({ page: 1, limit: pagination.limit }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Đang tải dữ liệu...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">
          <strong>Lỗi:</strong> {error}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Redux Asset Management Example</h2>
        
        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange({ 
                status: e.target.value as AssetStatus || undefined 
              })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Tất cả trạng thái</option>
              <option value={AssetStatus.DANG_SU_DUNG}>Đang sử dụng</option>
              <option value={AssetStatus.CHO_PHAN_BO}>Chờ phân bổ</option>
              <option value={AssetStatus.HU_HONG}>Hư hỏng</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại tài sản
            </label>
            <select
              value={filters.type || ''}
              onChange={(e) => handleFilterChange({ 
                type: e.target.value as AssetType || undefined 
              })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Tất cả loại</option>
              <option value={AssetType.TSCD}>Tài sản cố định</option>
              <option value={AssetType.CCDC}>Công cụ dụng cụ</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>

        {/* Assets List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">
              Danh sách tài sản ({pagination.total})
            </h3>
            <div className="text-sm text-gray-500">
              Trang {pagination.page} / {pagination.totalPages}
            </div>
          </div>

          {assets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Không có tài sản nào
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => handleAssetSelect(asset.id)}
                  className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
                    currentAsset?.id === asset.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="font-medium text-gray-900">{asset.name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Mã: {asset.ktCode}
                  </div>
                  <div className="text-sm text-gray-500">
                    Loại: {asset.type}
                  </div>
                  <div className="text-sm text-gray-500">
                    Trạng thái: {asset.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current Asset Details */}
        {currentAsset && (
          <div className="mt-6 bg-gray-50 border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">
              Chi tiết tài sản được chọn
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Tên:</span> {currentAsset.name}
              </div>
              <div>
                <span className="font-medium">Mã kế toán:</span> {currentAsset.ktCode}
              </div>
              <div>
                <span className="font-medium">Mã tài sản:</span> {currentAsset.fixedCode}
              </div>
              <div>
                <span className="font-medium">Số lượng:</span> {currentAsset.quantity}
              </div>
              <div>
                <span className="font-medium">Đơn vị:</span> {currentAsset.unit}
              </div>
              <div>
                <span className="font-medium">Ngày nhập:</span> {new Date(currentAsset.entryDate).toLocaleDateString('vi-VN')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
