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
} from "lucide-react";
import Link from "next/link";
import {
  Asset,
  AssetFilter,
  AssetStatus,
  AssetType,
  Unit,
  Room,
  UnitStatus,
  RoomStatus,
} from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { useAuth } from "@/contexts/AuthContext";
import { mockAssets, mockUnits, mockRooms, mockCategories, MockDataHelper } from "@/lib/mockData";
import { useRouter } from "next/navigation";

interface AllocationData {
  assetId: string;
  unitId: string;
  roomId: string;
}

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
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [allocationData, setAllocationData] = useState<AllocationData>({
    assetId: "",
    unitId: "",
    roomId: ""
  });
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const itemsPerPage = 10;
  const { getCurrentRole } = useAuth();

  // Kiểm tra role
  const isSuperAdmin = getCurrentRole()?.code === "SUPER_ADMIN";
  const isAdmin = getCurrentRole()?.code === "ADMIN";
  const isPhongQuanTri = getCurrentRole()?.code === "PHONG_QUAN_TRI";
  const isPhongKeHoach = getCurrentRole()?.code === "PHONG_KE_HOACH_DAU_TU";

  // Filter assets
  useEffect(() => {
    let filtered = mockAssets.filter((asset) => !asset.deletedAt);

    // Apply role-based filtering
    if (isPhongQuanTri) {
      // Phòng Quản Trị chỉ xem những tài sản đã bàn giao (isHandOver = true)
      filtered = filtered.filter((asset) => asset.isHandOver === true);
    }
    // Phòng Kế Hoạch Đầu Tư có thể xem tất cả tài sản (không cần filter theo isHandOver)
    // Admin và Super Admin cũng có thể xem tất cả

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(
        (asset) =>
          asset.name.toLowerCase().includes(searchLower) ||
          asset.ktCode.toLowerCase().includes(searchLower) ||
          asset.fixedCode.toLowerCase().includes(searchLower)
      );
    }

    if (filter.status) {
      filtered = filtered.filter((asset) => asset.status === filter.status);
    }

    if (filter.type) {
      filtered = filtered.filter((asset) => asset.type === filter.type);
    }

    if (filter.categoryId) {
      filtered = filtered.filter(
        (asset) => asset.categoryId === filter.categoryId
      );
    }

    if (filter.isHandOver !== undefined) {
      filtered = filtered.filter((asset) => asset.isHandOver === filter.isHandOver);
    }

    setFilteredAssets(filtered);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [assets, filter, isPhongQuanTri]);

  // Update available rooms when unit changes
  useEffect(() => {
    if (allocationData.unitId) {
      const rooms = MockDataHelper.getRoomsByUnitId(allocationData.unitId);
      setAvailableRooms(rooms);
    } else {
      setAvailableRooms([]);
    }
  }, [allocationData.unitId]);

  const handleSelectAsset = (assetId: string) => {
    setSelectedAssets((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAssets.length === filteredAssets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(filteredAssets.map((asset) => asset.id));
    }
  };

  const router = useRouter();
  const handleBulkAllocation = () => {
    router.push("/asset/allocate");
  };

  const handleBulkHandover = () => {
    if (isPhongKeHoach || (isAdmin || isSuperAdmin)) {
      // Xử lý bàn giao hàng loạt cho Phòng Kế Hoạch, Admin, Super Admin
      console.log("Bulk handover:", selectedAssets);

      if (
        confirm(
          `Bạn có chắc chắn muốn bàn giao ${selectedAssets.length} tài sản đã chọn?`
        )
      ) {
        setAssets((prev) =>
          prev.map((asset) =>
            selectedAssets.includes(asset.id)
              ? {
                ...asset,
                isLocked: true,
                isHandOver: true,
                status: AssetStatus.DANG_SU_DUNG
              }
              : asset
          )
        );
        setSelectedAssets([]);
      }
    } else if (isPhongQuanTri) {
      router.push("/asset/allocate");
    }
  };

  const handleHandoverAsset = (assetId: string) => {
    // Xử lý bàn giao một tài sản
    if (confirm("Bạn có chắc chắn muốn bàn giao tài sản này?")) {
      setAssets((prev) =>
        prev.map((asset) =>
          asset.id === assetId
            ? {
              ...asset,
              isLocked: true,
              isHandOver: true,
              status: AssetStatus.DANG_SU_DUNG
            }
            : asset
        )
      );
    }
  };

  const handleAllocateAsset = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    // Nếu tài sản đã có vị trí theo kế hoạch, phân bổ trực tiếp mà không cần hỏi
    if (asset.plannedRoomId) {
      const plannedRoom = MockDataHelper.getRoomById(asset.plannedRoomId);
      if (plannedRoom) {
        // Phân bổ trực tiếp đến vị trí theo kế hoạch
        setAssets(prev => prev.map(a =>
          a.id === assetId
            ? { ...a, status: AssetStatus.DANG_SU_DUNG }
            : a
        ));
        // Thông báo thành công
        alert(`Đã phân bổ tài sản đến vị trí: ${MockDataHelper.formatRoomLocation(plannedRoom)}`);
        return;
      }
    }

    // Nếu chưa có vị trí theo kế hoạch, mở modal để chọn
    setAllocationData({
      assetId: assetId,
      unitId: "",
      roomId: ""
    });
    setShowAllocationModal(true);
  };

  const handleAllocationSubmit = () => {
    if (!allocationData.unitId || !allocationData.roomId) {
      alert("Vui lòng chọn đơn vị và phòng để phân bổ");
      return;
    }

    // Cập nhật tài sản với thông tin phân bổ
    setAssets(prev => prev.map(asset =>
      asset.id === allocationData.assetId
        ? {
          ...asset,
          plannedRoomId: allocationData.roomId,
          status: AssetStatus.DANG_SU_DUNG
        }
        : asset
    ));

    // Reset và đóng modal
    setAllocationData({ assetId: "", unitId: "", roomId: "" });
    setShowAllocationModal(false);
  };

  const handleDeleteAsset = (assetId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa tài sản này?")) {
      setAssets((prev) =>
        prev.map((asset) =>
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
          {isPhongKeHoach && (
            <p className="text-gray-600">
              Quản lý thông tin tài sản cố định và công cụ dụng cụ - Xem tất cả tài sản
            </p>
          )}
          {isPhongQuanTri && (
            <p className="text-gray-600">
              Quản lý thông tin tài sản cố định và công cụ dụng cụ - Chỉ xem tài sản đã bàn giao
            </p>
          )}
          {(isAdmin || isSuperAdmin) && (
            <p className="text-gray-600">
              Quản lý toàn bộ thông tin tài sản cố định và công cụ dụng cụ
            </p>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {(isPhongKeHoach || isAdmin || isSuperAdmin) && (
            <div className="flex items-center space-x-3">
              <Link href="/asset/create">
                <Button className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Định danh tài sản
                </Button>
              </Link>
            </div>
          )}

          {(isPhongQuanTri || isAdmin || isSuperAdmin) && (
            <div className="flex items-center space-x-3">
              <Link href="/asset/receive">
                <Button className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow">
                  <Package2 className="h-5 w-5 mr-2" />
                  Tiếp nhận tài sản
                </Button>
              </Link>
            </div>
          )}
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
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, search: e.target.value }))
              }
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={filter.status || ""}
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    status: e.target.value
                      ? (e.target.value as AssetStatus)
                      : undefined,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả trạng thái</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại tài sản
              </label>
              <select
                value={filter.type || ""}
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    type: e.target.value
                      ? (e.target.value as AssetType)
                      : undefined,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả loại</option>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh mục
              </label>
              <select
                value={filter.categoryId || ""}
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    categoryId: e.target.value || undefined,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả danh mục</option>
                {mockCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái bàn giao
              </label>
              <select
                value={
                  filter.isHandOver === undefined
                    ? ""
                    : filter.isHandOver.toString()
                }
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    isHandOver:
                      e.target.value === ""
                        ? undefined
                        : e.target.value === "true",
                  }))
                }
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
        <div className="space-y-3">
          {(isPhongKeHoach || isAdmin || isSuperAdmin) && (
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
          {(isPhongQuanTri || isAdmin || isSuperAdmin) && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm text-green-800">
                    Đã chọn {selectedAssets.length} tài sản
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={(isAdmin || isSuperAdmin) ? handleBulkAllocation : handleBulkHandover}
                    size="sm"
                    className="flex items-center bg-green-500 hover:bg-green-600 text-white"
                  >
                    <ArrowRightLeft className="h-4 w-4 mr-1" />
                    Phân bổ {selectedAssets.length} tài sản đã chọn
                  </Button>
                </div>
              </div>
            </div>
          )}
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
                    checked={
                      selectedAssets.length === filteredAssets.length &&
                      filteredAssets.length > 0
                    }
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
                  Vị trí kế hoạch
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
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm">
                          <Package2 className="h-5 w-5 text-white" />
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
                    <div className="text-sm text-gray-500">
                      {asset.fixedCode}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">
                      {typeLabels[asset.type as keyof typeof typeLabels]}
                    </div>
                    <div className="text-sm text-gray-500">
                      {asset.category?.name}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge
                      className={
                        statusColors[asset.status as keyof typeof statusColors]
                      }
                    >
                      {statusLabels[asset.status as keyof typeof statusLabels]}
                    </Badge>

                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {asset.plannedRoomId ? (
                      <div>
                        <span className=" font-medium">
                          {asset.plannedRoom ? MockDataHelper.formatRoomLocation(asset.plannedRoom) :
                            mockRooms.find(r => r.id === asset.plannedRoomId)?.roomNumber || asset.plannedRoomId}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-gray-500">Chưa phân bổ</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {new Date(asset.entryDate).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-4">
                    {(isAdmin || isSuperAdmin) ? (
                      // Admin và Super Admin có thể thực hiện tất cả chức năng
                      <div className="grid grid-cols-3 gap-2">
                        <Link
                          href={`/asset/${asset.id}`}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {!asset.isHandOver && (
                          <Link
                            href={`/asset/${asset.id}/edit`}
                            className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors flex items-center justify-center"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Link>
                        )}
                        {!asset.isHandOver && (
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
                        {!asset.isHandOver && (
                          <button
                            onClick={() => handleHandoverAsset(asset.id)}
                            className="p-1.5 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors flex items-center justify-center"
                            title="Bàn giao"
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                          </button>
                        )}
                        {asset.isHandOver && (
                          <button
                            onClick={() => handleAllocateAsset(asset.id)}
                            className="p-1.5 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors flex items-center justify-center"
                            title={asset.plannedRoomId ? "Phân bổ tự động đến vị trí kế hoạch" : "Phân bổ (chọn vị trí thủ công)"}
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ) : isPhongKeHoach ? (
                      // Phòng Kế Hoạch Đầu Tư - chỉ quản lý trước khi bàn giao
                      <div className="grid grid-cols-3 gap-2">
                        <Link
                          href={`/asset/${asset.id}`}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {!asset.isHandOver && (
                          <Link
                            href={`/asset/${asset.id}/edit`}
                            className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors flex items-center justify-center"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Link>
                        )}
                        {!asset.isHandOver && (
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
                        {!asset.isHandOver && (
                          <button
                            onClick={() => handleHandoverAsset(asset.id)}
                            className="p-1.5 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors flex items-center justify-center"
                            title="Bàn giao"
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ) : isPhongQuanTri ? (
                      // Phòng Quản Trị - chỉ xem và phân bổ tài sản đã bàn giao
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/asset/${asset.id}`}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleAllocateAsset(asset.id)}
                          className="p-1.5 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors flex items-center justify-center"
                          title={asset.plannedRoomId ? "Phân bổ tự động đến vị trí kế hoạch" : "Phân bổ (chọn vị trí thủ công)"}
                        >
                          <ArrowRightLeft className="h-4 w-4" />
                        </button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAssets.length === 0 && (
          <div className="text-center py-12">
            <Package2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Không có tài sản nào
            </h3>
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
              Hiển thị{" "}
              <span className="font-medium">{indexOfFirstItem + 1}</span> đến{" "}
              <span className="font-medium">
                {Math.min(indexOfLastItem, filteredAssets.length)}
              </span>{" "}
              trong tổng số{" "}
              <span className="font-medium">{filteredAssets.length}</span> tài
              sản
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

      {/* Allocation Modal */}
      {showAllocationModal && (
        <div className="fixed inset-0 shadow-lg bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Phân bổ tài sản</h3>
              <button
                onClick={() => setShowAllocationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đơn vị sử dụng
                </label>
                <select
                  value={allocationData.unitId}
                  onChange={(e) => {
                    setAllocationData(prev => ({
                      ...prev,
                      unitId: e.target.value,
                      roomId: "" // Reset room when unit changes
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn đơn vị sử dụng</option>
                  {mockUnits.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phòng
                </label>
                <select
                  value={allocationData.roomId}
                  onChange={(e) => {
                    setAllocationData(prev => ({
                      ...prev,
                      roomId: e.target.value
                    }));
                  }}
                  disabled={!allocationData.unitId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Chọn phòng</option>
                  {availableRooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {MockDataHelper.formatRoomLocation(room)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAllocationModal(false)}
              >
                Hủy
              </Button>
              <Button
                onClick={handleAllocationSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Phân bổ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
