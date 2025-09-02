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
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [sortConfigs, setSortConfigs] = useState<any[]>([]);
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
  const { getCurrentRole } = useAuth();

  // Kiểm tra role
  const isSuperAdmin = getCurrentRole()?.code === "SUPER_ADMIN";
  const isAdmin = getCurrentRole()?.code === "ADMIN";
  const isPhongQuanTri = getCurrentRole()?.code === "PHONG_QUAN_TRI";
  // Helper function to sort assets
  const sortAssets = (assets: Asset[], sortConfigs: any[]): Asset[] => {
    if (sortConfigs.length === 0) return assets;

    return [...assets].sort((a, b) => {
      // Sort by priority (lowest first)
      const sortedConfigs = [...sortConfigs].sort((x, y) => x.priority - y.priority);
      
      for (const sortConfig of sortedConfigs) {
        let result = 0;
        const aVal = (a as any)[sortConfig.key];
        const bVal = (b as any)[sortConfig.key];

        // Handle different data types
        if (aVal === bVal) {
          result = 0;
        } else if (aVal == null) {
          result = 1;
        } else if (bVal == null) {
          result = -1;
        } else {
          // Sort logic for different field types
          switch (sortConfig.key) {
            case 'info':
            case 'name':
              result = a.name.localeCompare(b.name, 'vi', { numeric: true });
              break;
            case 'codes':
            case 'fixedCode':
              result = a.fixedCode.localeCompare(b.fixedCode, 'vi', { numeric: true });
              break;
            case 'type':
              const aTypeLabel = typeLabels[a.type as keyof typeof typeLabels];
              const bTypeLabel = typeLabels[b.type as keyof typeof typeLabels];
              result = aTypeLabel.localeCompare(bTypeLabel, 'vi');
              break;
            case 'category':
              const aCatName = a.category?.name || '';
              const bCatName = b.category?.name || '';
              result = aCatName.localeCompare(bCatName, 'vi');
              break;
            case 'location':
              const aLocation = a.room ? MockDataHelper.formatRoomLocation(a.room) : 
                (mockRooms.find(r => r.id === a.currentRoomId)?.roomNumber || 'Chưa phân bổ');
              const bLocation = b.room ? MockDataHelper.formatRoomLocation(b.room) : 
                (mockRooms.find(r => r.id === b.currentRoomId)?.roomNumber || 'Chưa phân bổ');
              result = aLocation.localeCompare(bLocation, 'vi');
              break;
            case 'entryDate':
              result = new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime();
              break;
            case 'status':
              const aStatusLabel = statusLabels[a.status as keyof typeof statusLabels];
              const bStatusLabel = statusLabels[b.status as keyof typeof statusLabels];
              result = aStatusLabel.localeCompare(bStatusLabel, 'vi');
              break;
            default:
              // Generic string comparison
              result = String(aVal).localeCompare(String(bVal), 'vi', { numeric: true });
              break;
          }
        }

        // Apply sort order
        if (sortConfig.order === 'desc') {
          result = -result;
        }

        if (result !== 0) return result;
      }
      
      return 0;
    });
  };

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

    // Apply sorting
    filtered = sortAssets(filtered, sortConfigs);

    setFilteredAssets(filtered);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [assets, filter, isPhongQuanTri, sortConfigs]);

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

    // Apply sorting after filtering
    filtered = sortAssets(filtered, sortConfigs);

    setFilteredAssets(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle sort change
  const handleSortChange = (newSortConfigs: any[]) => {
    console.log('Sort changed:', newSortConfigs);
    setSortConfigs(newSortConfigs);
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
    setSortConfigs([]); // Reset sort as well
    setFilteredAssets(assets);
    setCurrentPage(1);
  };

  // Auto-apply search filter and advanced filters
  React.useEffect(() => {
    applyAdvancedFilters();
  }, [filter.search, assets, sortConfigs, filterConditions, conditionLogic]);

  // Get current page data
  // Define table columns
  const columns: TableColumn<Asset>[] = [
    {
      key: "info",
      title: "Tên tài sản",
      width: "250px",
      minWidth: 200,
      maxWidth: 350,
      render: (_, asset) => (
            <div className="text-sm font-medium text-gray-900">
              {asset.name}
          </div>
      ),
      sortable: true,
    },
    {
      key: "codes",
      title: "Mã tài sản",
      width: "100px",
      minWidth: 120,
      maxWidth: 200,
      render: (_, asset) => (
        <div>
          <div className="text-sm text-gray-500">{asset.fixedCode}</div>
        </div>
      ),
    },
    {
      key: "type",
      title: "Loại tài sản",
      width: "140px",
      minWidth: 120,
      maxWidth: 180,
      render: (_, asset) => (
        <div>
          <div className="text-sm text-gray-900">
            {typeLabels[asset.type as keyof typeof typeLabels]}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "category",
      title: "Danh mục",
      width: "150px",
      minWidth: 120,
      maxWidth: 200,
      render: (_, asset) => (
        <div>
          <div className="text-sm text-gray-500">
            {asset.category?.name}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "location",
      title: "Vị trí",
      width: "100px",
      minWidth: 150,
      maxWidth: 300,
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
      sortable: true,
    },
    {
      key: "entryDate",
      title: "Ngày nhập",
      width: "120px",
      minWidth: 100,
      maxWidth: 150,
      render: (_, asset) => (
        <div className="text-sm text-gray-500">
          {new Date(asset.entryDate).toLocaleDateString("vi-VN")}
        </div>
      ),
      sortable: true,
    },
    {
      key: "status",
      title: "Trạng thái",
      width: "140px",
      minWidth: 120,
      maxWidth: 180,
      render: (_, asset) => (
        <Badge
          className={
            statusColors[asset.status as keyof typeof statusColors]
          }
        >
          {statusLabels[asset.status as keyof typeof statusLabels]}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "actions",
      title: "Thao tác",
      width: "180px",
      minWidth: 160,
      maxWidth: 220,
      resizable: false,
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

      {/* Quick Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên, mã kế toán hoặc mã tài sản cố định..."
            value={filter.search || ""}
            onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
            className="pl-10 pr-4 py-2 w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {filter.search && (
            <button
              onClick={() => setFilter(prev => ({ ...prev, search: "" }))}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
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

      {/* Filter Results Info */}
      {(filter.search || filterConditions.length > 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Filter className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Kết quả lọc: {filteredAssets.length} / {assets.length} tài sản
                </span>
              </div>
              {filter.search && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-blue-700">Từ khóa:</span>
                  <Badge variant="outline" className="text-blue-700 border-blue-300">
                    "{filter.search}"
                  </Badge>
                </div>
              )}
              {filterConditions.length > 0 && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-blue-700">Điều kiện:</span>
                  <Badge variant="outline" className="text-blue-700 border-blue-300">
                    {filterConditions.length} bộ lọc
                  </Badge>
                </div>
              )}
            </div>
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      )}

      {/* Assets Table or Handover Form */}
      {!isHandoverMode ? (
        <Table
          resizable={true}
          columns={columns}
          multiSort={true}
          data={filteredAssets}
          sortConfigs={sortConfigs}
          onSortChange={handleSortChange}
          emptyText="Không có tài sản nào"
          emptyIcon={<Package2 className="mx-auto h-12 w-12 text-gray-400" />}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: itemsPerPage,
            total: filteredAssets.length,
            onChange: (page, pageSize) => {
              setCurrentPage(page);
              if (pageSize !== itemsPerPage) {
                setItemsPerPage(pageSize);
                setCurrentPage(1); // Reset to first page when page size changes
              }
            },
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20, 50, 100]
          }}
          rowSelection={{
            selectedRowKeys: selectedAssets,
            onChange: (selectedRowKeys) => {
              setSelectedAssets(selectedRowKeys);
            },
            getCheckboxProps: (record) => ({
              disabled: false
            })
          }}
          title={
            <div className="flex items-center">
              Danh sách tài sản
            </div>
          }
          headerExtra={
            selectedAssets.length > 0 ? (
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
        />
      ) : (
        <HandoverForm
          assets={assetsToHandover}
          onCancel={handleHandoverCancel}
          onSuccess={handleHandoverSuccess}
          title="Bàn giao tài sản"
        />
      )}

    </div>
  );
}
