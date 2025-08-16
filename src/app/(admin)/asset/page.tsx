"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Package2,
  Scan,
  ArrowRightLeft,
  History,
  FileText,
  Download,
  Upload,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { Asset, AssetFilter, AssetStatus, AssetType, RoomStatus } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";

// Mock data cho demo
const mockAssets: Asset[] = [
  {
    id: "1",
    ktCode: "24-0001/01",
    fixedCode: "4001.00001",
    name: "Máy tính Dell Latitude 5520",
    specs: "Intel Core i5-1135G7, 8GB RAM, 256GB SSD",
    entryDate: "2024-01-15",
    plannedRoomId: "1",
    unit: "Cái",
    quantity: 1,
    origin: "Dell Việt Nam",
    purchasePackage: 1,
    type: AssetType.TSCD,
    isLocked: false,
    categoryId: "4",
    status: AssetStatus.CHO_PHAN_BO,
    createdBy: "user1",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    category: { id: "4", name: "Máy tính", code: "4" },
    room: { 
      id: "1", 
      name: "Phòng IT 09",
      building: "B", 
      floor: "1", 
      roomNumber: "109", 
      status: RoomStatus.ACTIVE, 
      unitId: "unit1",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    }
  },
  {
    id: "2", 
    ktCode: "24-0002/01",
    fixedCode: "3001.00001",
    name: "Bàn làm việc gỗ công nghiệp",
    specs: "Kích thước 120x60cm, màu nâu",
    entryDate: "2024-01-20",
    unit: "Cái",
    quantity: 5,
    origin: "Hòa Phát",
    purchasePackage: 1,
    type: AssetType.CCDC,
    isLocked: true,
    categoryId: "3",
    status: AssetStatus.DANG_SU_DUNG,
    createdBy: "user1",
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z",
    category: { id: "3", name: "Thiết bị văn phòng", code: "3" }
  }
];

const statusColors = {
  [AssetStatus.CHO_PHAN_BO]: "bg-yellow-100 text-yellow-800",
  [AssetStatus.DANG_SU_DUNG]: "bg-green-100 text-green-800", 
  [AssetStatus.HU_HONG]: "bg-red-100 text-red-800",
  [AssetStatus.DE_XUAT_THANH_LY]: "bg-orange-100 text-orange-800",
  [AssetStatus.DA_THANH_LY]: "bg-gray-100 text-gray-800",
};

const statusLabels = {
  [AssetStatus.CHO_PHAN_BO]: "Chờ phân bổ",
  [AssetStatus.DANG_SU_DUNG]: "Đang sử dụng",
  [AssetStatus.HU_HONG]: "Hư hỏng", 
  [AssetStatus.DE_XUAT_THANH_LY]: "Đề xuất thanh lý",
  [AssetStatus.DA_THANH_LY]: "Đã thanh lý",
};

const typeLabels = {
  [AssetType.TSCD]: "Tài sản cố định",
  [AssetType.CCDC]: "Công cụ dụng cụ",
};

export default function AssetPage() {
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>(mockAssets);
  const [filter, setFilter] = useState<AssetFilter>({});
  const [showFilter, setShowFilter] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Filter assets
  useEffect(() => {
    let filtered = assets.filter(asset => !asset.deletedAt);

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(asset => 
        asset.name.toLowerCase().includes(searchLower) ||
        asset.ktCode.toLowerCase().includes(searchLower) ||
        asset.fixedCode.toLowerCase().includes(searchLower)
      );
    }

    if (filter.status) {
      filtered = filtered.filter(asset => asset.status === filter.status);
    }

    if (filter.type) {
      filtered = filtered.filter(asset => asset.type === filter.type);
    }

    if (filter.categoryId) {
      filtered = filtered.filter(asset => asset.categoryId === filter.categoryId);
    }

    if (filter.isLocked !== undefined) {
      filtered = filtered.filter(asset => asset.isLocked === filter.isLocked);
    }

    setFilteredAssets(filtered);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [assets, filter]);

  const handleSelectAsset = (assetId: string) => {
    setSelectedAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAssets.length === filteredAssets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(filteredAssets.map(asset => asset.id));
    }
  };

  const handleBulkHandover = () => {
    // Xử lý bàn giao hàng loạt
    console.log("Bulk handover:", selectedAssets);
    
    // Giả lập cập nhật trạng thái bàn giao hàng loạt
    if (confirm(`Bạn có chắc chắn muốn bàn giao ${selectedAssets.length} tài sản đã chọn?`)) {
      setAssets(prev => 
        prev.map(asset => 
          selectedAssets.includes(asset.id) 
            ? { ...asset, isLocked: true, status: AssetStatus.DANG_SU_DUNG }
            : asset
        )
      );
      setSelectedAssets([]);
    }
  };
  
  const handleHandoverAsset = (assetId: string) => {
    // Xử lý bàn giao một tài sản
    if (confirm("Bạn có chắc chắn muốn bàn giao tài sản này?")) {
      setAssets(prev => 
        prev.map(asset => 
          asset.id === assetId 
            ? { ...asset, isLocked: true, status: AssetStatus.DANG_SU_DUNG }
            : asset
        )
      );
    }
  };

  const handleDeleteAsset = (assetId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa tài sản này?")) {
      setAssets(prev => 
        prev.map(asset => 
          asset.id === assetId 
            ? { ...asset, deletedAt: new Date().toISOString() }
            : asset
        )
      );
    }
  };

  // Handle page change for pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Get current page data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAssets = filteredAssets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tài sản</h1>
          <p className="text-gray-600">Quản lý thông tin tài sản cố định và công cụ dụng cụ</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/asset/receive">
            <Button variant="outline" className="flex items-center bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100">
              <Package2 className="h-4 w-4 mr-2" />
              Tiếp nhận tài sản
            </Button>
          </Link>
          <Link href="/asset/allocate">
            <Button variant="outline" className="flex items-center bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Phân bổ tài sản
            </Button>
          </Link>
          <Link href="/asset/move">
            <Button variant="outline" className="flex items-center bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
              <MapPin className="h-4 w-4 mr-2" />
              Di chuyển tài sản
            </Button>
          </Link>
          <Link href="/asset/create">
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Thêm tài sản
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên, mã kế toán, mã tài sản..."
              value={filter.search || ""}
              onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilter(!showFilter)}
            className={showFilter ? "bg-blue-50 border-blue-300" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            Bộ lọc
          </Button>
        </div>

        {/* Advanced Filter */}
        {showFilter && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                value={filter.status || ""}
                onChange={(e) => setFilter(prev => ({ 
                  ...prev, 
                  status: e.target.value ? e.target.value as AssetStatus : undefined 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả trạng thái</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại tài sản</label>
              <select
                value={filter.type || ""}
                onChange={(e) => setFilter(prev => ({ 
                  ...prev, 
                  type: e.target.value ? e.target.value as AssetType : undefined 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả loại</option>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
              <select
                value={filter.categoryId || ""}
                onChange={(e) => setFilter(prev => ({ 
                  ...prev, 
                  categoryId: e.target.value || undefined 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả danh mục</option>
                <option value="3">Thiết bị văn phòng</option>
                <option value="4">Máy tính</option>
                <option value="5">Máy in</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái bàn giao</label>
              <select
                value={filter.isLocked === undefined ? "" : filter.isLocked.toString()}
                onChange={(e) => setFilter(prev => ({ 
                  ...prev, 
                  isLocked: e.target.value === "" ? undefined : e.target.value === "true"
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả</option>
                <option value="false">Chưa bàn giao</option>
                <option value="true">Đã bàn giao</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedAssets.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm text-blue-800">
                Đã chọn {selectedAssets.length} tài sản
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleBulkHandover}
                size="sm"
                className="flex items-center bg-orange-500 hover:bg-orange-600 text-white"
              >
                <ArrowRightLeft className="h-4 w-4 mr-1" />
                Bàn giao {selectedAssets.length} tài sản đã chọn
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assets Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedAssets.length === filteredAssets.length && filteredAssets.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thông tin tài sản
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã tài sản
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại/Danh mục
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vị trí
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày nhập
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedAssets.includes(asset.id)}
                      onChange={() => handleSelectAsset(asset.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Package2 className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {asset.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {asset.specs}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">{asset.ktCode}</div>
                    <div className="text-sm text-gray-500">{asset.fixedCode}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">{typeLabels[asset.type as keyof typeof typeLabels]}</div>
                    <div className="text-sm text-gray-500">{asset.category?.name}</div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge 
                      className={statusColors[asset.status as keyof typeof statusColors]}
                    >
                      {statusLabels[asset.status as keyof typeof statusLabels]}
                    </Badge>
                    {asset.isLocked && (
                      <div className="text-xs text-orange-600 mt-1">🔒 Đã bàn giao</div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {asset.room?.roomNumber || "Chưa phân bổ"}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {new Date(asset.entryDate).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-4">
                    <div className="grid grid-cols-3 gap-2">
                      <Link 
                        href={`/asset/${asset.id}`}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center"
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      {!asset.isLocked && (
                        <Link 
                          href={`/asset/${asset.id}/edit`}
                          className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors flex items-center justify-center"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                      )}
                      {!asset.isLocked && (
                        <button
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      <Link 
                        href={`/asset/${asset.id}/rfid`}
                        className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors flex items-center justify-center"
                        title="Quét RFID"
                      >
                        <Scan className="h-4 w-4" />
                      </Link>
                      <Link 
                        href={`/asset/${asset.id}/history`}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
                        title="Lịch sử"
                      >
                        <History className="h-4 w-4" />
                      </Link>
                      {!asset.isLocked && (
                        <button
                          onClick={() => handleHandoverAsset(asset.id)}
                          className="p-1.5 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors flex items-center justify-center"
                          title="Bàn giao"
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

        {filteredAssets.length === 0 && (
          <div className="text-center py-12">
            <Package2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có tài sản nào</h3>
            <p className="mt-1 text-sm text-gray-500">
              Không tìm thấy tài sản nào phù hợp với bộ lọc hiện tại.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 rounded-lg shadow flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">{indexOfFirstItem + 1}</span> đến{" "}
              <span className="font-medium">
                {Math.min(indexOfLastItem, filteredAssets.length)}
              </span>{" "}
              trong tổng số <span className="font-medium">{filteredAssets.length}</span> tài sản
            </p>
          </div>
          <div>
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          </div>
        </div>
        <div className="flex-1 flex justify-between sm:hidden">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Trước
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}
