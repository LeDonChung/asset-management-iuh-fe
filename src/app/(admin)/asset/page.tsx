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
  Building2,
  MapPin,
  Save,
  X,
  AlertCircle,
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
  AssetTransaction,
} from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableColumn } from "@/components/ui/table";
import HandoverForm from "@/components/handover/HandoverForm";
import AdvancedFilter, { FilterCondition } from "@/components/filter/AdvancedFilter";
import { useAuth } from "@/contexts/AuthContext";
import { mockAssets, mockUnits, mockRooms, mockCategories, MockDataHelper } from "@/lib/mockData";
import { useRouter } from "next/navigation";

interface HandoverData {
  assetId: string;
  unitId: string;
  roomId: string;
}



const statusColors = {
  [AssetStatus.CHO_CHUYEN_GIAO]: "bg-yellow-100 text-yellow-800",
  [AssetStatus.CHO_TIEP_NHAN]: "bg-orange-100 text-orange-800",
  [AssetStatus.DANG_SU_DUNG]: "bg-green-100 text-green-800",
  [AssetStatus.HU_HONG]: "bg-red-100 text-red-800",
  [AssetStatus.DE_XUAT_THANH_LY]: "bg-orange-100 text-orange-800",
  [AssetStatus.DA_THANH_LY]: "bg-gray-100 text-gray-800",
};

const statusLabels = {
  [AssetStatus.CHO_CHUYEN_GIAO]: "Chờ chuyển giao",
  [AssetStatus.CHO_TIEP_NHAN]: "Chờ tiếp nhận",
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
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
  const [conditionLogic, setConditionLogic] = useState<'contains' | 'equals' | 'not_contains'>('contains');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [handoverData, setHandoverData] = useState<HandoverData>({
    assetId: "",
    unitId: "",
    roomId: ""
  });
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);

  // Bulk handover states
  const [isHandoverMode, setIsHandoverMode] = useState(false);
  const [assetsToHandover, setAssetsToHandover] = useState<Asset[]>([]);
  const itemsPerPage = 10;
  const { getCurrentRole } = useAuth();

  // Kiểm tra role
  const isSuperAdmin = getCurrentRole()?.code === "SUPER_ADMIN";
  const isAdmin = getCurrentRole()?.code === "ADMIN";
  const isPhongQuanTri = getCurrentRole()?.code === "PHONG_QUAN_TRI";
  // Filter assets
  useEffect(() => {
    let filtered = mockAssets.filter((asset) => !asset.deletedAt);

    // Apply role-based filtering
    if (isPhongQuanTri) {
      // Phòng Quản Trị chỉ xem những tài sản đã bàn giao (isHandOver = true)
      filtered = filtered.filter((asset) => asset.isHandOver === true);
    }
    // Admin và Super Admin có thể xem tất cả tài sản

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
    if (handoverData.unitId) {
      const rooms = MockDataHelper.getRoomsByUnitId(handoverData.unitId);
      setAvailableRooms(rooms);
    } else {
      setAvailableRooms([]);
    }
  }, [handoverData.unitId]);



  const router = useRouter();

  const handleBulkHandover = () => {
    if (selectedAssets.length === 0) {
      alert("Vui lòng chọn ít nhất một tài sản để bàn giao!");
      return;
    }

    const selectedAssetObjects = assets.filter(asset =>
      selectedAssets.includes(asset.id)
    );

    setAssetsToHandover(selectedAssetObjects);
    setIsHandoverMode(true);
  };

  const handleHandoverAsset = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    setAssetsToHandover([asset]);
    setIsHandoverMode(true);
  };

  const handleHandoverSubmit = () => {
    if (!handoverData.unitId || !handoverData.roomId) {
      alert("Vui lòng chọn đơn vị và phòng để bàn giao");
      return;
    }

    // Cập nhật tài sản với thông tin bàn giao
    setAssets(prev => prev.map(asset =>
      asset.id === handoverData.assetId
        ? {
          ...asset,
          currentRoomId: handoverData.roomId,
          status: AssetStatus.DANG_SU_DUNG
        }
        : asset
    ));

    // Reset và đóng modal
    setHandoverData({ assetId: "", unitId: "", roomId: "" });
    setShowHandoverModal(false);
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

  const handleHandoverCancel = () => {
    setIsHandoverMode(false);
    setAssetsToHandover([]);
  };

  const handleHandoverSuccess = (transaction: AssetTransaction) => {
    // Update asset status to DANG_SU_DUNG and set room
    setAssets(prev =>
      prev.map(asset => {
        const handoverItem = transaction.items?.find(item => item.assetId === asset.id);
        if (handoverItem) {
          return {
            ...asset,
            status: AssetStatus.DANG_SU_DUNG,
            isHandOver: true,
            currentRoomId: transaction.toRoomId || ""
          };
        }
        return asset;
      })
    );

    // Log transaction (có thể lưu vào database)
    console.log("Handover Transaction Completed:", transaction);

    // Reset states
    setSelectedAssets([]);
    setIsHandoverMode(false);
    setAssetsToHandover([]);

    alert("Bàn giao tài sản thành công! Tài sản đã được gửi đến các đơn vị sử dụng.");
  };



  // Handle page change for pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Filter options for AdvancedFilter
  const filterOptions = [
    {
      value: 'name',
      label: 'Tên tài sản',
      type: 'text' as const
    },
    {
      value: 'ktCode',
      label: 'Mã kế toán',
      type: 'text' as const
    },
    {
      value: 'fixedCode',
      label: 'Mã tài sản cố định',
      type: 'text' as const
    },
    {
      value: 'status',
      label: 'Trạng thái tài sản',
      type: 'select' as const,
      options: Object.entries(statusLabels).map(([value, label]) => ({
        value,
        label
      }))
    },
    {
      value: 'type',
      label: 'Loại tài sản',
      type: 'select' as const,
      options: Object.entries(typeLabels).map(([value, label]) => ({
        value,
        label
      }))
    },
    {
      value: 'categoryId',
      label: 'Danh mục',
      type: 'select' as const,
      options: mockCategories.map(category => ({
        value: category.id,
        label: category.name
      }))
    },
    {
      value: 'entryDate',
      label: 'Ngày nhập',
      type: 'date' as const
    }
  ];

  // Apply advanced filters
  const applyAdvancedFilters = () => {
    let filtered = [...assets];

    // Apply search filter first
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm) ||
        asset.ktCode.toLowerCase().includes(searchTerm) ||
        asset.fixedCode.toLowerCase().includes(searchTerm)
      );
    }

    // Apply condition-based filters
    if (filterConditions.length > 0) {
      // Apply condition logic (AND, OR, NOT)
      if (conditionLogic === 'contains') {
        // Tất cả điều kiện phải đúng (AND)
        filterConditions.forEach(condition => {
          filtered = applyConditionFilter(filtered, condition);
        });
      } else if (conditionLogic === 'equals') {
        // Bất kì điều kiện đúng (OR)
        const originalFiltered = [...filtered];
        let orResults: Asset[] = [];
        filterConditions.forEach(condition => {
          const conditionResults = applyConditionFilter(originalFiltered, condition);
          orResults = [...orResults, ...conditionResults.filter(asset =>
            !orResults.some(existing => existing.id === asset.id)
          )];
        });
        filtered = orResults;
      } else if (conditionLogic === 'not_contains') {
        // Không có điều kiện nào đúng - AND logic với negation
        // Tất cả điều kiện phải KHÔNG đúng (NOT A AND NOT B)
        filterConditions.forEach(condition => {
          filtered = applyConditionFilter(filtered, condition, true); // Negate result
        });
      }
    }

    setFilteredAssets(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Helper function to apply single condition
  const applyConditionFilter = (assets: Asset[], condition: FilterCondition, negate = false): Asset[] => {
    const fieldOption = filterOptions.find(opt => opt.value === condition.field);

    // Check if condition has value
    let hasValue = false;
    if (fieldOption?.type === 'date') {
      hasValue = !!(condition.dateFrom || condition.dateTo);
    } else if (Array.isArray(condition.value)) {
      hasValue = condition.value.length > 0;
    } else {
      hasValue = !!(condition.value && condition.value !== '');
    }

    if (!hasValue) {
      return assets;
    }

    const result = assets.filter(asset => {
      const fieldValue = (asset as any)[condition.field];

      // Handle date range filtering
      if (fieldOption?.type === 'date') {
        const assetDate = new Date(fieldValue);
        const fromDate = condition.dateFrom ? new Date(condition.dateFrom) : null;
        const toDate = condition.dateTo ? new Date(condition.dateTo) : null;

        switch (condition.operator) {
          case 'contains': // "Tất cả" - trong khoảng từ-đến
            if (fromDate && toDate) {
              return assetDate >= fromDate && assetDate <= toDate;
            } else if (fromDate) {
              return assetDate >= fromDate;
            } else if (toDate) {
              return assetDate <= toDate;
            }
            return true;

          case 'equals': // "Bất kì" - trong khoảng từ-đến (giống Tất cả cho date)
            if (fromDate && toDate) {
              return assetDate >= fromDate && assetDate <= toDate;
            } else if (fromDate) {
              return assetDate >= fromDate;
            } else if (toDate) {
              return assetDate <= toDate;
            }
            return true;

          case 'not_contains': // "Không" - ngoài khoảng từ-đến
            if (fromDate && toDate) {
              return !(assetDate >= fromDate && assetDate <= toDate);
            } else if (fromDate) {
              return assetDate < fromDate;
            } else if (toDate) {
              return assetDate > toDate;
            }
            return true;

          default:
            return true;
        }
      }

      switch (condition.operator) {
        case 'contains': // "Tất cả" - khớp tất cả
          if (Array.isArray(condition.value)) {
            if (condition.value.length === 0) return true;
            // Tất cả values phải khớp (AND logic)
            return condition.value.every(val => {
              if (condition.field === 'isHandOver') {
                return asset.isHandOver === (val === 'true');
              }
              // Với select fields, check exact match
              const fieldOption = filterOptions.find(opt => opt.value === condition.field);
              if (fieldOption?.type === 'select') {
                return String(fieldValue) === val;
              }
              // Với text fields, check contains - tất cả từ khóa phải có
              return String(fieldValue).toLowerCase().includes(val.toLowerCase());
            });
          } else {
            if (condition.field === 'isHandOver') {
              return asset.isHandOver === (condition.value === 'true');
            }
            return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
          }

        case 'equals': // "Bất kì" - khớp ít nhất một
          if (Array.isArray(condition.value)) {
            if (condition.value.length === 0) return true;
            // Ít nhất một value phải khớp (OR logic)
            return condition.value.some(val => {
              if (condition.field === 'isHandOver') {
                return asset.isHandOver === (val === 'true');
              }
              // Với select fields, check exact match
              const fieldOption = filterOptions.find(opt => opt.value === condition.field);
              if (fieldOption?.type === 'select') {
                return String(fieldValue) === val;
              }
              // Với text fields, check contains - ít nhất một từ khóa phải có
              return String(fieldValue).toLowerCase().includes(val.toLowerCase());
            });
          } else {
            if (condition.field === 'isHandOver') {
              return asset.isHandOver === (condition.value === 'true');
            }
            return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
          }

        case 'not_contains': // "Không" - không khớp
          if (Array.isArray(condition.value)) {
            if (condition.value.length === 0) return true;
            // Không được khớp bất kì value nào
            return !condition.value.some(val => {
              if (condition.field === 'isHandOver') {
                return asset.isHandOver === (val === 'true');
              }
              // Với select fields, check exact match
              const fieldOption = filterOptions.find(opt => opt.value === condition.field);
              if (fieldOption?.type === 'select') {
                return String(fieldValue) === val;
              }
              // Với text fields, check contains - không được chứa bất kì từ khóa nào
              return String(fieldValue).toLowerCase().includes(val.toLowerCase());
            });
          } else {
            if (condition.field === 'isHandOver') {
              return asset.isHandOver !== (condition.value === 'true');
            }
            return !String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
          }

        default:
          return true;
      }
    });

    return negate ? assets.filter(asset => !result.includes(asset)) : result;
  };

  // Reset all filters
  const resetFilters = () => {
    setFilter({});
    setFilterConditions([]);
    setConditionLogic('contains');
    setFilteredAssets(assets);
    setCurrentPage(1);
  };

  // Auto-apply search filter
  React.useEffect(() => {
    applyAdvancedFilters();
  }, [filter.search, assets]);

  // Get current page data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAssets = filteredAssets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

  // Define table columns
  const columns: TableColumn<Asset>[] = [
    {
      key: "info",
      title: "Thông tin tài sản",
      render: (_, asset) => (
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
      ),
    },
    {
      key: "codes",
      title: "Mã tài sản",
      render: (_, asset) => (
        <div>
          <div className="text-sm text-gray-900">{asset.ktCode}</div>
          <div className="text-sm text-gray-500">{asset.fixedCode}</div>
        </div>
      ),
    },
    {
      key: "category",
      title: "Loại/Danh mục",
      render: (_, asset) => (
        <div>
          <div className="text-sm text-gray-900">
            {typeLabels[asset.type as keyof typeof typeLabels]}
          </div>
          <div className="text-sm text-gray-500">
            {asset.category?.name}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (_, asset) => (
        <Badge
          className={
            statusColors[asset.status as keyof typeof statusColors]
          }
        >
          {statusLabels[asset.status as keyof typeof statusLabels]}
        </Badge>
      ),
    },
    {
      key: "location",
      title: "Vị trí hiện tại",
      render: (_, asset) => (
        <div className="text-sm text-gray-900">
          {asset.currentRoomId ? (
            <span className="font-medium">
              {asset.room ? MockDataHelper.formatRoomLocation(asset.room) :
                mockRooms.find(r => r.id === asset.currentRoomId)?.roomNumber || asset.currentRoomId}
            </span>
          ) : (
            <span className="text-gray-500">Chưa phân bổ</span>
          )}
        </div>
      ),
    },
    {
      key: "entryDate",
      title: "Ngày nhập",
      render: (_, asset) => (
        <div className="text-sm text-gray-500">
          {new Date(asset.entryDate).toLocaleDateString("vi-VN")}
        </div>
      ),
    },
    {
      key: "actions",
      title: "Thao tác",
      render: (_, asset) => {
        if (isAdmin || isSuperAdmin || isPhongQuanTri) {
          // Admin và Super Admin có thể thực hiện tất cả chức năng
          return (
            <div className="grid grid-cols-3 gap-2">
              <Link
                href={`/asset/${asset.id}`}
                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center"
                title="Xem chi tiết"
              >
                <Eye className="h-4 w-4" />
              </Link>
              <Link
                href={`/asset/${asset.id}/edit`}
                className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors flex items-center justify-center"
                title="Chỉnh sửa"
              >
                <Edit2 className="h-4 w-4" />
              </Link>
              <button
                onClick={() => handleDeleteAsset(asset.id)}
                className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center"
                title="Xóa"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <Link
                href={`/asset/${asset.id}/rfid`}
                className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors flex items-center justify-center"
                title="Quét RFID"
              >
                <Scan className="h-4 w-4" />
              </Link>
              <button
                onClick={() => handleHandoverAsset(asset.id)}
                className="p-1.5 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors flex items-center justify-center"
                title="Bàn giao"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </button>
            </div>
          );
        } else if (isPhongQuanTri) {
          // Phòng Quản Trị - chỉ xem tài sản đã bàn giao
          return (
            <div className="flex items-center space-x-2">
              <Link
                href={`/asset/${asset.id}`}
                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center"
                title="Xem chi tiết"
              >
                <Eye className="h-4 w-4" />
              </Link>
            </div>
          );
        }
        return null;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tài sản</h1>
          {(isAdmin || isSuperAdmin || isPhongQuanTri) && (
            <p className="text-gray-600">
              Quản lý toàn bộ thông tin tài sản cố định và công cụ dụng cụ
            </p>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {(isAdmin || isSuperAdmin || isPhongQuanTri) && (
            <div className="flex items-center space-x-3">
              <Link href="/asset/create">
                <Button className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Định danh tài sản
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Filter */}
      <AdvancedFilter
        title="Tìm kiếm nâng cao"
        filterOptions={filterOptions}
        conditions={filterConditions}
        conditionLogic={conditionLogic}
        onConditionsChange={setFilterConditions}
        onConditionLogicChange={setConditionLogic}
        onApply={applyAdvancedFilters}
        onReset={resetFilters}
        className="mb-6"
      />



      {/* Bulk Actions */}
      {selectedAssets.length > 0 && !isHandoverMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm text-blue-800">
                Đã chọn {selectedAssets.length} tài sản
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {(isAdmin || isSuperAdmin) && (
                <Button
                  onClick={handleBulkHandover}
                  size="sm"
                  className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <ArrowRightLeft className="h-4 w-4 mr-1" />
                  Bàn giao {selectedAssets.length} tài sản đã chọn
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pagination - Hidden in handover mode */}
      {!isHandoverMode && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200">
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
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Hiển thị:</span>
                <select
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={10} className="text-gray-900">
                    10
                  </option>
                  <option value={20} className="text-gray-900">
                    20
                  </option>
                  <option value={50} className="text-gray-900">
                    50
                  </option>
                </select>
              </div>
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
      )}
      {/* Assets Table or Handover Form */}
      {!isHandoverMode ? (
        <Table
          columns={columns}
          data={currentAssets}
          emptyText="Không có tài sản nào"
          emptyIcon={<Package2 className="mx-auto h-12 w-12 text-gray-400" />}
          rowKey="id"
          rowSelection={{
            selectedRowKeys: selectedAssets,
            onChange: (selectedRowKeys) => {
              setSelectedAssets(selectedRowKeys);
            },
            getCheckboxProps: (record) => ({
              disabled: false
            })
          }}
        />
      ) : (
        <HandoverForm
          assets={assetsToHandover}
          onCancel={handleHandoverCancel}
          onSuccess={handleHandoverSuccess}
          title="Bàn giao tài sản"
        />
      )}

      {/* Pagination - Hidden in handover mode */}
      {!isHandoverMode && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200">
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
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Hiển thị:</span>
                <select
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={10} className="text-gray-900">
                    10
                  </option>
                  <option value={20} className="text-gray-900">
                    20
                  </option>
                  <option value={50} className="text-gray-900">
                    50
                  </option>
                </select>
              </div>
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
      )}


    </div>
  );
}
