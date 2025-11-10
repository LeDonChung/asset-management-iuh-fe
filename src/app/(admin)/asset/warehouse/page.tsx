"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Package,
  Search,
  Filter,
  RotateCcw,
  Eye,
  MapPin,
  Calendar,
  Building,
  MoreVertical,
  CheckSquare,
  Square,
  X,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectOption } from "@/components/ui/select";
import Table, { TableColumn } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { PermissionConstants } from "@/constants";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchWarehouseAssets,
  fetchWarehouseUnits,
} from "@/lib/store/slices/assetSlice";
import { RootState } from "@/lib/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Types for warehouse assets
interface WarehouseAssetFilterDto {
  search?: string;
  type?: string;
  status?: string;
  categoryId?: string;
  unitId?: string;
  warehouseRoomId?: string;
  currentPage?: number;
  itemsPerPage?: number;
}

interface WarehouseAssetResponseDto {
  id: string;
  ktCode: string;
  fixedCode: string;
  name: string;
  specs?: string;
  entrydate: Date;
  unit: string;
  quantity: number;
  origin?: string;
  purchasePackage: number;
  type: string;
  status: string;
  allowMove: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: {
    id: string;
    name: string;
    code: string;
  };
  currentRoom?: {
    id: string;
    name: string;
    roomCode: string;
  };
  currentUnit?: {
    id: string;
    name: string;
    unitCode: number;
  };
  rfidTag?: {
    id: number;
    rfid: string;
  };
  lastReceivedTransaction?: {
    transactionId: string;
    receivedAt: Date;
    fromUnitName: string;
    toUnitName: string;
  };
}

const AssetType = {
  FIXED_ASSET: "FIXED_ASSET",
  TOOLS_EQUIPMENT: "TOOLS_EQUIPMENT",
};

const typeLabels = {
  [AssetType.FIXED_ASSET]: "Tài sản cố định",
  [AssetType.TOOLS_EQUIPMENT]: "Công cụ dụng cụ",
};

const typeColors = {
  [AssetType.FIXED_ASSET]: "bg-blue-100 text-blue-800",
  [AssetType.TOOLS_EQUIPMENT]: "bg-purple-100 text-purple-800",
};

export default function WarehousePage() {
  const { user, hasAnyPermission } = useAuth();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Redux state
  const {
    warehouseAssets,
    warehouseUnits,
    warehouseLoading,
    unitsLoading,
    error,
  } = useAppSelector((state: RootState) => state.asset);

  // Local state for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [unitFilter, setUnitFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Selection mode states
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [showOnlyMoveable, setShowOnlyMoveable] = useState(false);

  // Mock categories - replace with real data from API
  const categories = [
    { id: "1", name: "Máy tính", code: "MAYTINH" },
    { id: "2", name: "Thiết bị văn phòng", code: "TBVP" },
    { id: "3", name: "Máy in", code: "MAYIN" },
  ];

  // Permissions
  const canView = hasAnyPermission([PermissionConstants.PERM_VIEW_ASSET]);
  const canUpdate = hasAnyPermission([PermissionConstants.PERM_UPDATE_ASSET]);

  useEffect(() => {
    if (!canView) {
      router.push("/unauthorized");
      return;
    }

    // Load available units for filter dropdown
    dispatch(fetchWarehouseUnits());
  }, [canView, router, dispatch]);

  // Load warehouse assets
  const loadWarehouseAssets = async (filters: WarehouseAssetFilterDto) => {
    try {
      await dispatch(fetchWarehouseAssets(filters)).unwrap();
    } catch (error: any) {
      console.error("Error loading warehouse assets:", error);
      toast.error(error.message || "Có lỗi xảy ra khi tải dữ liệu");
    }
  };

  // Filter effects
  useEffect(() => {
    const filters: WarehouseAssetFilterDto = {
      search: searchTerm || undefined,
      type: typeFilter || undefined,
      status: statusFilter || undefined,
      categoryId: categoryFilter || undefined,
      unitId: unitFilter || undefined,
      currentPage,
      itemsPerPage,
    };
    loadWarehouseAssets(filters);
  }, [
    searchTerm,
    typeFilter,
    statusFilter,
    categoryFilter,
    unitFilter,
    currentPage,
    itemsPerPage,
  ]);

  // Filter data on client side for moveable assets
  const filteredData = useMemo(() => {
    if (!showOnlyMoveable) {
      return warehouseAssets.data;
    }
    return warehouseAssets.data.filter((asset) => asset.allowMove);
  }, [warehouseAssets.data, showOnlyMoveable]);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setStatusFilter("");
    setCategoryFilter("");
    setUnitFilter("");
    setCurrentPage(1);
  };

  // Selection handlers
  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedAssets([]);
    }
  };

  const handleSelectionChange = (
    selectedRowKeys: string[],
    selectedRows: WarehouseAssetResponseDto[]
  ) => {
    setSelectedAssets(selectedRowKeys);
    console.log("Đã chọn tài sản:", selectedRowKeys);
    console.log("Chi tiết tài sản được chọn:", selectedRows);
  };

  const handleBulkLocationUpdate = () => {
    if (selectedAssets.length === 0) {
      toast.error("Vui lòng chọn ít nhất một tài sản để cập nhật vị trí!");
      return;
    }

    // Get selected asset objects from filtered data
    const selectedAssetObjects = filteredData.filter((asset) =>
      selectedAssets.includes(asset.id)
    );

    // Store selected assets in localStorage for the location update page
    localStorage.setItem(
      "selectedWarehouseAssets",
      JSON.stringify(selectedAssetObjects)
    );

    // Navigate to bulk location update page
    router.push("/asset/warehouse/bulk-location");

    // Show success message
    toast.success(
      `Đã chọn ${selectedAssetObjects.length} tài sản để cập nhật vị trí`
    );

    // Exit selection mode
    setIsSelectionMode(false);
    setSelectedAssets([]);
  };

  // Calculate stats
  const stats = useMemo(() => {
    const data = filteredData;
    return {
      total: data.length,
      totalInWarehouse: warehouseAssets.pagination?.total || 0,
      fixedAssets: data.filter((asset) => asset.type === AssetType.FIXED_ASSET)
        .length,
      toolsEquipment: data.filter(
        (asset) => asset.type === AssetType.TOOLS_EQUIPMENT
      ).length,
      withRfid: data.filter((asset) => asset.rfidTag).length,
      moveable: data.filter((asset) => asset.allowMove).length,
    };
  }, [filteredData, warehouseAssets.pagination?.total]);

  // Table columns
  const columns: TableColumn<WarehouseAssetResponseDto>[] = [
    {
      key: "codes",
      title: "Mã TSCD / Mã KT",
      render: (_, asset) => (
        <div className="text-sm font-medium text-gray-900">
          <div>{asset.fixedCode}</div>
          <div className="text-xs text-gray-500">{asset.ktCode}</div>
        </div>
      ),
      sortable: true,
      maxWidth: 120,
    },
    {
      key: "name",
      title: "Tên tài sản",
      render: (_, asset) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{asset.name}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "specs",
      title: "Thông số kĩ thuật",
      render: (_, asset) => (
        <div>
          {asset.specs && (
            <div className="text-xs text-gray-500">{asset.specs}</div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      key: "unit",
      title: "ĐVT",
      render: (_, asset) => (
        <div className="text-sm text-gray-900 text-center">{asset.unit}</div>
      ),
      className: "text-center",
    },
    {
      key: "quantity",
      title: "Số lượng",
      render: (_, asset) => (
        <div className="text-sm font-medium text-gray-900 text-center">
          {asset.quantity}
        </div>
      ),
      sortable: true,
      className: "text-center",
    },
    {
      key: "type",
      title: "Loại",
      render: (_, asset) => (
        <Badge
          className={typeColors[asset.type] || "bg-gray-100 text-gray-800"}
        >
          {typeLabels[asset.type] || "Không xác định"}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "assetActions",
      title: "Thao tác",
      render: (_, asset) => (
        <div className="flex justify-start">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/asset/${asset.id}`);
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <span>Xem chi tiết</span>
              </DropdownMenuItem>

              {canUpdate && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/asset/${asset.id}/location`);
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span>Cập nhật vị trí</span>
                </DropdownMenuItem>
              )}

              {/* Quick selection for bulk update */}
              {canUpdate && asset.allowMove && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isSelectionMode) {
                      // If already in selection mode, toggle this asset
                      const isSelected = selectedAssets.includes(asset.id);
                      if (isSelected) {
                        setSelectedAssets((prev) =>
                          prev.filter((id) => id !== asset.id)
                        );
                      } else {
                        setSelectedAssets((prev) => [...prev, asset.id]);
                      }
                    } else {
                      // If not in selection mode, start selection with this asset
                      setSelectedAssets([asset.id]);
                      setIsSelectionMode(true);
                    }
                  }}
                  className="flex items-center gap-2 cursor-pointer text-blue-600"
                >
                  {isSelectionMode && selectedAssets.includes(asset.id) ? (
                    <>
                      <span>Bỏ chọn</span>
                    </>
                  ) : (
                    <>
                      <span>Chọn để cập nhật</span>
                    </>
                  )}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý kho tài sản</h1>
          <p className="text-gray-600 mt-2">
            Danh sách tài sản đã tiếp nhận chờ cập nhật vị trí
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Bulk location update button */}
          <Button
            onClick={handleToggleSelectionMode}
            variant={isSelectionMode ? "destructive" : "default"}
            className={`flex items-center ${
              isSelectionMode
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            <MapPin className="h-4 w-4 mr-2" />
            {isSelectionMode ? "Hủy chọn" : "Cập nhật vị trí"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {showOnlyMoveable
                  ? "Tài sản có thể di chuyển"
                  : "Tổng tài sản hiển thị"}
              </p>
              <p className="text-2xl font-bold">{stats.total}</p>
              {showOnlyMoveable && (
                <p className="text-xs text-gray-500">
                  Trong tổng số {stats.totalInWarehouse} tài sản
                </p>
              )}
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Tài sản cố định
              </p>
              <p className="text-2xl font-bold">{stats.fixedAssets}</p>
            </div>
            <Building className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Công cụ dụng cụ
              </p>
              <p className="text-2xl font-bold">{stats.toolsEquipment}</p>
            </div>
            <Package className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Có RFID</p>
              <p className="text-2xl font-bold">{stats.withRfid}</p>
            </div>
            <Search className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Tìm kiếm theo tên, mã KT, mã tài sản..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-[180px]"
          >
            <SelectOption value="">Tất cả loại</SelectOption>
            <SelectOption value={AssetType.FIXED_ASSET}>
              Tài sản cố định
            </SelectOption>
            <SelectOption value={AssetType.TOOLS_EQUIPMENT}>
              Công cụ dụng cụ
            </SelectOption>
          </Select>

          <Select
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            className="w-[180px]"
            disabled={unitsLoading}
          >
            <SelectOption value="">
              {unitsLoading ? "Đang tải..." : "Tất cả đơn vị"}
            </SelectOption>
            {warehouseUnits.map((unit) => (
              <SelectOption key={unit.id} value={unit.id}>
                {unit.name}
              </SelectOption>
            ))}
          </Select>
        </div>
      </div>
      {/* Selection Mode Info */}
      {isSelectionMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Chọn tài sản để cập nhật vị trí
              </span>
              {selectedAssets.length > 0 && (
                <span className="text-sm text-blue-700">
                  - Đã chọn {selectedAssets.length} tài sản
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {selectedAssets.length > 0 && (
                <Button
                  onClick={handleBulkLocationUpdate}
                  size="sm"
                  className="flex items-center bg-green-600 hover:bg-green-700 text-white"
                >
                  Cập nhật vị trí
                </Button>
              )}
              <Button
                onClick={handleToggleSelectionMode}
                size="sm"
                variant="outline"
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                Hủy
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Table */}
      <Table
        title="Danh sách tài sản trong kho"
        columns={columns}
        data={filteredData}
        loading={warehouseLoading}
        emptyText="Không có tài sản nào trong kho"
        emptyIcon={<Package className="mx-auto h-12 w-12 text-gray-400" />}
        rowKey="id"
        rowSelection={
          isSelectionMode
            ? {
                selectedRowKeys: selectedAssets,
                onChange: handleSelectionChange,
                getCheckboxProps: (record) => ({
                  disabled: !record.allowMove, // Disable selection for assets that cannot be moved
                }),
              }
            : undefined
        }
        pagination={{
          current: warehouseAssets.pagination?.page || 1,
          pageSize: warehouseAssets.pagination?.limit || 10,
          total: warehouseAssets.pagination?.total || 0,
          onChange: (page, pageSize) => {
            setCurrentPage(page);
            setItemsPerPage(pageSize || 10);
          },
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50, 100],
          serverSide: true,
        }}
      />
    </div>
  );
}
