"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Package2,
  CheckCircle,
  Calendar,
  Building2,
  MapPin,
  Users,
  AlertCircle,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Filter,
  X,
  CalendarDays,
  Tag,
  Eye,
  History,
  Clock,
} from "lucide-react";
import Link from "next/link";
import {
  Asset,
  AssetType,
  AssetStatus,
  UnitType,
  UnitStatus,
} from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

// Mock data cho tài sản đã tiếp nhận (status = CHO_PHAN_BO)
const mockAvailableAssets: Asset[] = [
  {
    id: "LAPTOP-001",
    ktCode: "25-0001/KT", 
    fixedCode: "2141.00001",
    name: "Laptop Dell Latitude 5530",
    specs: "Intel Core i7-1250U, 16GB DDR4 RAM, 512GB NVMe SSD, 15.6\" FHD, Windows 11 Pro",
    entryDate: "2025-07-20",
    unit: "Chiếc",
    quantity: 10,
    purchasePackage: 1,
    type: AssetType.TSCD,
    isLocked: false,
    isHandOver: false,
    categoryId: "2141",
    status: AssetStatus.CHO_PHAN_BO,
    createdBy: "nguyen.minh",
    createdAt: "2025-07-20T08:00:00Z",
    updatedAt: "2025-08-15T09:30:00Z",
    category: { id: "2141", name: "Máy tính xách tay", code: "2141" }
  },
  {
    id: "PC-001",
    ktCode: "25-0002/KT",
    fixedCode: "2142.00001", 
    name: "Máy tính để bàn HP EliteDesk 800 G9",
    specs: "Intel Core i5-12500, 16GB DDR4, 1TB HDD + 256GB SSD, DVD-RW, có màn hình HP 24\" IPS",
    entryDate: "2025-07-22",
    unit: "Bộ",
    quantity: 15,
    purchasePackage: 1,
    type: AssetType.TSCD,
    isLocked: false,
    isHandOver: false,
    categoryId: "2142", 
    status: AssetStatus.CHO_PHAN_BO,
    createdBy: "nguyen.minh",
    createdAt: "2025-07-22T08:00:00Z",
    updatedAt: "2025-08-15T09:30:00Z",
    category: { id: "2142", name: "Máy tính để bàn", code: "2142" }
  },
  {
    id: "PRINTER-001",
    ktCode: "25-0003/KT",
    fixedCode: "2231.00001",
    name: "Máy in đa chức năng HP LaserJet Pro M428fdw",
    specs: "In laser đen trắng, scan màu, copy, fax, tốc độ 38trang/phút, WiFi, duplex tự động",
    entryDate: "2025-07-25",
    unit: "Chiếc",
    quantity: 5,
    purchasePackage: 1,
    type: AssetType.TSCD,
    isLocked: false,
    isHandOver: false,
    categoryId: "2231",
    status: AssetStatus.CHO_PHAN_BO,
    createdBy: "nguyen.minh",
    createdAt: "2025-07-25T08:00:00Z",
    updatedAt: "2025-08-15T09:30:00Z",
    category: { id: "2231", name: "Máy in, máy photocopy", code: "2231" }
  },
  {
    id: "TABLE-001",
    ktCode: "25-0004/KT",
    fixedCode: "3331.00001",
    name: "Bàn họp oval gỗ MFC", 
    specs: "Kích thước 240x120x75cm, mặt gỗ MFC phủ Melamine, chân inox 304, có ổ cắm điện tích hợp",
    entryDate: "2025-08-01",
    unit: "Chiếc",
    quantity: 2,
    purchasePackage: 2,
    type: AssetType.CCDC,
    isLocked: false,
    isHandOver: false,
    categoryId: "3331",
    status: AssetStatus.CHO_PHAN_BO,
    createdBy: "nguyen.minh",
    createdAt: "2025-08-01T08:00:00Z", 
    updatedAt: "2025-08-16T14:15:00Z",
    category: { id: "3331", name: "Bàn ghế văn phòng", code: "3331" }
  },
  {
    id: "CHAIR-001",
    ktCode: "25-0005/KT",
    fixedCode: "3331.00002",
    name: "Ghế xoay giám đốc da PU",
    specs: "Ghế xoay chân nhôm 5 chấu, đệm da PU cao cấp, tay vịn điều chỉnh, tựa lưng ergonomic",
    entryDate: "2025-08-03",
    unit: "Chiếc",
    quantity: 20,
    purchasePackage: 2,
    type: AssetType.CCDC,
    isLocked: false,
    isHandOver: false,
    categoryId: "3331",
    status: AssetStatus.CHO_PHAN_BO,
    createdBy: "nguyen.minh",
    createdAt: "2025-08-03T08:00:00Z",
    updatedAt: "2025-08-16T14:15:00Z",
    category: { id: "3331", name: "Bàn ghế văn phòng", code: "3331" }
  },
  {
    id: "PROJECTOR-001",
    ktCode: "25-0007/KT",
    fixedCode: "2191.00001",
    name: "Máy chiếu laser Epson EB-L200X",
    specs: "Laser 3LCD, 4200 lumens, độ phân giải XGA 1024x768, tuổi thọ laser 20.000h, HDMI/VGA",
    entryDate: "2025-08-10",
    unit: "Chiếc",
    quantity: 3,
    purchasePackage: 3,
    type: AssetType.TSCD,
    isLocked: false,
    isHandOver: false,
    categoryId: "2191",
    status: AssetStatus.CHO_PHAN_BO,
    createdBy: "le.huong",
    createdAt: "2025-08-10T08:00:00Z",
    updatedAt: "2025-08-17T10:45:00Z",
    category: { id: "2191", name: "Thiết bị nghe nhìn", code: "2191" }
  },
];

// Mock data cho đơn vị
const mockUnits = [
  {
    id: "CNTT",
    name: "Khoa Công nghệ Thông tin",
    type: UnitType.DON_VI_SU_DUNG,
    rooms: [
      { id: "CNTT-101", name: "Phòng thí nghiệm máy tính 1" },
      { id: "CNTT-102", name: "Phòng thí nghiệm máy tính 2" },
      { id: "CNTT-201", name: "Phòng lý thuyết CNTT-201" },
      { id: "CNTT-202", name: "Phòng thực hành mạng máy tính" },
    ]
  },
  {
    id: "KINH_TE",
    name: "Khoa Kinh tế",
    type: UnitType.DON_VI_SU_DUNG,
    rooms: [
      { id: "KT-101", name: "Phòng học Kinh tế 101" },
      { id: "KT-102", name: "Phòng thí nghiệm kế toán" },
      { id: "KT-201", name: "Phòng hội thảo kinh doanh" },
    ]
  },
  {
    id: "CO_KHI",
    name: "Khoa Cơ khí",
    type: UnitType.DON_VI_SU_DUNG,
    rooms: [
      { id: "CK-101", name: "Xưởng thực hành cơ khí 1" },
      { id: "CK-102", name: "Xưởng thực hành cơ khí 2" },
      { id: "CK-201", name: "Phòng thiết kế CAD" },
    ]
  },
  {
    id: "HC_CHINH",
    name: "Phòng Hành chính",
    type: UnitType.DON_VI_SU_DUNG,
    rooms: [
      { id: "HC-101", name: "Văn phòng hành chính" },
      { id: "HC-102", name: "Phòng họp lớn" },
      { id: "HC-103", name: "Phòng tiếp khách" },
    ]
  },
];

// Interface cho allocation item
interface AllocationItem {
  id: string;
  asset: Asset;
  allocatedQuantity: number;
  unitId: string;
  roomId: string;
  note?: string;
}

const typeLabels = {
  [AssetType.TSCD]: "Tài sản cố định",
  [AssetType.CCDC]: "Công cụ dụng cụ",
};

const typeColors = {
  [AssetType.TSCD]: "bg-blue-100 text-blue-800",
  [AssetType.CCDC]: "bg-green-100 text-green-800",
};

export default function AssetAllocatePage() {
  const [availableAssets, setAvailableAssets] = useState<Asset[]>(mockAvailableAssets);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>(mockAvailableAssets);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [allocationList, setAllocationList] = useState<AllocationItem[]>([]);
  const [isCreatingAllocation, setIsCreatingAllocation] = useState(false);

  // Apply All states
  const [applyAllUnit, setApplyAllUnit] = useState("");
  const [applyAllRoom, setApplyAllRoom] = useState("");

  // Filter states for assets
  const [assetFilters, setAssetFilters] = useState({
    type: "",
    category: "",
    dateFrom: "",
    dateTo: ""
  });
  const [showAssetFilters, setShowAssetFilters] = useState(false);

  // Filter assets
  useEffect(() => {
    let filtered = availableAssets.filter(asset => 
      asset.status === AssetStatus.CHO_PHAN_BO
    );

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(asset => 
        asset.name.toLowerCase().includes(searchLower) ||
        asset.ktCode.toLowerCase().includes(searchLower) ||
        asset.fixedCode.toLowerCase().includes(searchLower) ||
        asset.category?.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter
    if (assetFilters.type) {
      filtered = filtered.filter(asset => asset.type === assetFilters.type);
    }

    // Apply category filter
    if (assetFilters.category) {
      filtered = filtered.filter(asset => asset.category?.id === assetFilters.category);
    }

    // Apply date range filter
    if (assetFilters.dateFrom) {
      const fromDate = new Date(assetFilters.dateFrom);
      filtered = filtered.filter(asset => new Date(asset.entryDate) >= fromDate);
    }
    if (assetFilters.dateTo) {
      const toDate = new Date(assetFilters.dateTo);
      toDate.setHours(23, 59, 59, 999); // Include the entire day
      filtered = filtered.filter(asset => new Date(asset.entryDate) <= toDate);
    }

    setFilteredAssets(filtered);
  }, [availableAssets, searchTerm, assetFilters]);

  // Get unique categories from assets
  const availableCategories = Array.from(
    new Set(availableAssets.map(asset => asset.category?.id).filter(Boolean))
  ).map(categoryId => {
    const asset = availableAssets.find(a => a.category?.id === categoryId);
    return asset?.category;
  }).filter(Boolean);

  // Clear asset filters
  const clearAssetFilters = () => {
    setAssetFilters({
      type: "",
      category: "",
      dateFrom: "",
      dateTo: ""
    });
  };

  // Count active filters
  const activeAssetFiltersCount = Object.values(assetFilters).filter(v => v !== "").length;

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

  const handleCreateAllocationList = () => {
    if (selectedAssets.length === 0) {
      alert("Vui lòng chọn ít nhất một tài sản để phân bổ!");
      return;
    }

      const newAllocations: AllocationItem[] = selectedAssets.map(assetId => {
        const asset = availableAssets.find(a => a.id === assetId)!;
        return {
          id: `ALLOC-${assetId}-${Date.now()}`,
          asset,
          allocatedQuantity: asset.quantity, // Lấy toàn bộ số lượng
          unitId: "",
          roomId: "",
          note: ""
        };
      });

      setAllocationList(newAllocations);
      setIsCreatingAllocation(true);
      // Reset apply all states when creating new allocation
      setApplyAllUnit("");
      setApplyAllRoom("");
    };  const handleUpdateAllocation = (id: string, field: keyof AllocationItem, value: any) => {
    setAllocationList(prev => 
      prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleRemoveFromAllocation = (id: string) => {
    setAllocationList(prev => prev.filter(item => item.id !== id));
  };

  const handleApplyToAll = () => {
    if (!applyAllUnit) {
      alert("Vui lòng chọn đơn vị sử dụng để áp dụng cho tất cả!");
      return;
    }

    setAllocationList(prev => 
      prev.map(item => ({
        ...item,
        unitId: applyAllUnit,
        roomId: applyAllRoom, // Can be empty
        allocatedQuantity: item.asset.quantity // Lấy toàn bộ số lượng có sẵn
      }))
    );

    alert(`Đã áp dụng cài đặt cho tất cả ${allocationList.length} tài sản!`);
  };

  const handleSaveAllocation = () => {
    // Validate allocation list
    const invalidItems = allocationList.filter(item => 
      !item.unitId || item.allocatedQuantity <= 0
    );

    if (invalidItems.length > 0) {
      alert("Vui lòng chọn đơn vị sử dụng cho tất cả tài sản!");
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn tạo phân bổ cho ${allocationList.length} tài sản?`)) {
      // Update asset status to DANG_SU_DUNG
      setAvailableAssets(prev => 
        prev.map(asset => {
          const allocation = allocationList.find(item => item.asset.id === asset.id);
          if (allocation) {
            return {
              ...asset,
              status: AssetStatus.DANG_SU_DUNG,
              quantity: asset.quantity - allocation.allocatedQuantity
            };
          }
          return asset;
        })
      );

      // Reset states
      setAllocationList([]);
      setSelectedAssets([]);
      setIsCreatingAllocation(false);
      setApplyAllUnit("");
      setApplyAllRoom("");

      alert("Phân bổ tài sản thành công! Tài sản đã được gửi đến các đơn vị sử dụng.");
    }
  };

  const getUnitById = (unitId: string) => mockUnits.find(unit => unit.id === unitId);
  const getRoomsByUnitId = (unitId: string) => mockUnits.find(unit => unit.id === unitId)?.rooms || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Phân bổ tài sản</h1>
          <p className="text-gray-600">
            Phân bổ tài sản đã tiếp nhận đến các đơn vị và phòng sử dụng
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">Hướng dẫn phân bổ</h3>
            <p className="text-sm text-blue-700 mt-1">
              1. Chọn các tài sản cần phân bổ từ danh sách bên dưới
              <br />
              2. Nhấn "Tạo danh sách phân bổ" để thiết lập chi tiết phân bổ
              <br />
              3. Chỉ định đơn vị, phòng nếu cần.
              <br />
              4. Lưu để hoàn tất quá trình phân bổ
            </p>
          </div>
        </div>
      </div>

      {!isCreatingAllocation ? (
        <>
          {/* Asset Selection */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-1 h-6 bg-blue-500 rounded-full mr-3"></div>
                  <h2 className="text-xl font-bold text-gray-800">Chọn tài sản cần phân bổ</h2>
                </div>
                {selectedAssets.length > 0 && (
                  <Button
                    onClick={handleCreateAllocationList}
                    className="flex items-center bg-blue-600 hover:bg-blue-700 shadow-lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo danh sách phân bổ ({selectedAssets.length})
                  </Button>
                )}
              </div>
            
              {/* Search */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm theo tên tài sản, mã KT, mã định mức, danh mục..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-md border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowAssetFilters(!showAssetFilters)}
                  className="h-12 px-4 border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Bộ lọc
                  {activeAssetFiltersCount > 0 && (
                    <Badge className="ml-2 bg-blue-100 text-blue-600 text-xs">
                      {activeAssetFiltersCount}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Asset Filters */}
              {showAssetFilters && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                      <Filter className="h-4 w-4 mr-2 text-blue-500" />
                      Bộ lọc tài sản
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAssetFilters}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Xóa bộ lọc
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Asset Type Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loại tài sản
                      </label>
                      <select
                        value={assetFilters.type}
                        onChange={(e) => setAssetFilters(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm"
                      >
                        <option value="">Tất cả loại</option>
                        <option value={AssetType.TSCD}>Tài sản cố định</option>
                        <option value={AssetType.CCDC}>Công cụ dụng cụ</option>
                      </select>
                    </div>

                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Danh mục
                      </label>
                      <select
                        value={assetFilters.category}
                        onChange={(e) => setAssetFilters(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm"
                      >
                        <option value="">Tất cả danh mục</option>
                        {availableCategories.map(category => (
                          <option key={category!.id} value={category!.id}>
                            {category!.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Date From Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Từ ngày
                      </label>
                      <Input
                        type="date"
                        value={assetFilters.dateFrom}
                        onChange={(e) => setAssetFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                        className="text-sm"
                      />
                    </div>

                    {/* Date To Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Đến ngày
                      </label>
                      <Input
                        type="date"
                        value={assetFilters.dateTo}
                        onChange={(e) => setAssetFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {/* Active Filters Summary */}
                  {activeAssetFiltersCount > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex flex-wrap gap-2">
                        {assetFilters.type && (
                          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                            Loại: {typeLabels[assetFilters.type as keyof typeof typeLabels]}
                            <X 
                              className="h-3 w-3 cursor-pointer hover:text-blue-600" 
                              onClick={() => setAssetFilters(prev => ({ ...prev, type: "" }))}
                            />
                          </Badge>
                        )}
                        {assetFilters.category && (
                          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                            Danh mục: {availableCategories.find(c => c?.id === assetFilters.category)?.name}
                            <X 
                              className="h-3 w-3 cursor-pointer hover:text-green-600" 
                              onClick={() => setAssetFilters(prev => ({ ...prev, category: "" }))}
                            />
                          </Badge>
                        )}
                        {assetFilters.dateFrom && (
                          <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
                            Từ: {new Date(assetFilters.dateFrom).toLocaleDateString("vi-VN")}
                            <X 
                              className="h-3 w-3 cursor-pointer hover:text-purple-600" 
                              onClick={() => setAssetFilters(prev => ({ ...prev, dateFrom: "" }))}
                            />
                          </Badge>
                        )}
                        {assetFilters.dateTo && (
                          <Badge className="bg-orange-100 text-orange-800 flex items-center gap-1">
                            Đến: {new Date(assetFilters.dateTo).toLocaleDateString("vi-VN")}
                            <X 
                              className="h-3 w-3 cursor-pointer hover:text-orange-600" 
                              onClick={() => setAssetFilters(prev => ({ ...prev, dateTo: "" }))}
                            />
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Assets Table */}
            <div className="bg-white rounded-lg shadow">
              {/* Results Counter */}
              <div className="px-4 md:px-6 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Hiển thị <span className="font-medium">{filteredAssets.length}</span> / <span className="font-medium">{availableAssets.length}</span> tài sản
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedAssets.length > 0 && (
                      <span className="text-blue-600 font-medium">
                        {selectedAssets.length} đã chọn
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 md:px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedAssets.length === filteredAssets.length && filteredAssets.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                        />
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thông tin tài sản
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mã tài sản
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loại
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số lượng có sẵn
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày nhập
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAssets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-gray-50">
                        <td className="px-4 md:px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedAssets.includes(asset.id)}
                            onChange={() => handleSelectAsset(asset.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                          />
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm">
                                <Package2 className="h-5 w-5 text-white" />
                              </div>
                            </div>
                            <div className="ml-3 min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900 break-words">
                                {asset.name}
                              </div>
                              <div className="text-sm text-gray-500" title={asset.specs}>
                                {asset.specs && asset.specs.length > 50
                                  ? asset.specs.substring(0, 50) + '...'
                                  : asset.specs}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {asset.ktCode}
                            </div>
                            <div className="text-sm text-gray-500">
                              {asset.fixedCode}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <Badge className={typeColors[asset.type as keyof typeof typeColors]}>
                            {typeLabels[asset.type as keyof typeof typeLabels]}
                          </Badge>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">
                            {asset.quantity} {asset.unit}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="text-sm text-gray-500">
                            {new Date(asset.entryDate).toLocaleDateString("vi-VN")}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredAssets.length === 0 && (
                <div className="text-center py-12 bg-white">
                  <Package2 className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Không có tài sản</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Hiện tại không có tài sản nào sẵn sàng để phân bổ hoặc không phù hợp với từ khóa tìm kiếm.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Allocation Configuration - Enhanced Styling */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-white">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsCreatingAllocation(false);
                      setAllocationList([]);
                    }}
                    className="mr-3 text-white border-white/30 hover:bg-white/10 hover:border-white/50 hover:text-white transition-all duration-200"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Quay lại
                  </Button>
                  <div>
                    <h2 className="text-xl font-bold">Cấu hình phân bổ tài sản</h2>
                    <p className="text-green-100 text-sm mt-1">
                      Điền đầy đủ thông tin để hoàn tất phân bổ tài sản
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleSaveAllocation}
                  className="bg-white text-green-700 hover:bg-gray-100 hover:text-green-800 font-semibold shadow-md transition-all duration-200"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Lưu phân bổ
                </Button>
              </div>
            </div>

            <div className="p-8">
              {/* Apply to All Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-blue-600" />
                      Áp dụng cho tất cả tài sản
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Thiết lập đơn vị, phòng và số lượng cho tất cả {allocationList.length} tài sản cùng lúc
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 font-semibold px-3 py-2">
                    {allocationList.length} tài sản
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Apply All Unit */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="flex items-center">
                        <Building2 className="w-4 h-4 mr-2 text-green-500" />
                        Đơn vị sử dụng
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                    </label>
                    <select
                      value={applyAllUnit}
                      onChange={(e) => {
                        setApplyAllUnit(e.target.value);
                        setApplyAllRoom(""); // Reset room when unit changes
                      }}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-md text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 bg-white transition-all duration-200"
                    >
                      <option value="">Chọn đơn vị sử dụng</option>
                      {mockUnits.map(unit => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Apply All Room */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                        Phòng
                      </span>
                    </label>
                    <select
                      value={applyAllRoom}
                      onChange={(e) => setApplyAllRoom(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-md text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-white transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-500"
                      disabled={!applyAllUnit}
                    >
                      <option value="">
                        {applyAllUnit ? "Chọn phòng (tùy chọn)" : "Vui lòng chọn đơn vị trước"}
                      </option>
                      {getRoomsByUnitId(applyAllUnit).map(room => (
                        <option key={room.id} value={room.id}>
                          {room.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Apply Button */}
                  <div className="flex items-end">
                    <Button
                      onClick={handleApplyToAll}
                      disabled={!applyAllUnit}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Áp dụng cho tất cả
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {allocationList.map((item) => (
                  <Card key={item.id} className="bg-white border border-gray-200 hover:shadow-md transition-all duration-200 group">
                    <div className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Asset Info - Enhanced */}
                        <div className="lg:col-span-4">
                          <div className="flex items-center mb-4">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm">
                                <Package2 className="h-5 w-5 text-white" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-gray-900">
                                {item.asset.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="bg-gray-100 px-2 py-1 rounded-md font-mono">
                                    {item.asset.ktCode}
                                  </span>
                                  <span>•</span>
                                  <span className="bg-gray-100 px-2 py-1 rounded-md font-mono">
                                    {item.asset.fixedCode}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge className="bg-green-100 text-green-700 text-xs font-medium">
                                    <Tag className="w-3 h-3 mr-1" />
                                    Phân bổ: {item.allocatedQuantity} {item.asset.unit}
                                  </Badge>
                                  <span className="text-xs text-gray-400">
                                    (Tổng: {item.asset.quantity} {item.asset.unit})
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="ml-auto">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveFromAllocation(item.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Allocation Details */}
                        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Unit */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              <span className="flex items-center">
                                <Building2 className="w-4 h-4 mr-2 text-green-500" />
                                Đơn vị sử dụng
                                <span className="text-red-500 ml-1">*</span>
                              </span>
                            </label>
                            <select
                              value={item.unitId}
                              onChange={(e) => {
                                handleUpdateAllocation(item.id, "unitId", e.target.value);
                                handleUpdateAllocation(item.id, "roomId", ""); // Reset room when unit changes
                              }}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-md text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 bg-white transition-all duration-200"
                            >
                              <option value="">Chọn đơn vị sử dụng</option>
                              {mockUnits.map(unit => (
                                <option key={unit.id} value={unit.id}>
                                  {unit.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Room */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                                Phòng
                              </span>
                            </label>
                            <select
                              value={item.roomId}
                              onChange={(e) => handleUpdateAllocation(item.id, "roomId", e.target.value)}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-md text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-white transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-500"
                              disabled={!item.unitId}
                            >
                              <option value="">
                                {item.unitId ? "Chọn phòng (tùy chọn)" : "Vui lòng chọn đơn vị trước"}
                              </option>
                              {getRoomsByUnitId(item.unitId).map(room => (
                                <option key={room.id} value={room.id}>
                                  {room.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Note - Full width */}
                        <div className="lg:col-span-12">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <span className="flex items-center">
                              <AlertCircle className="w-4 h-4 mr-2 text-purple-500" />
                              Ghi chú cho tài sản này
                            </span>
                          </label>
                          <Input
                            type="text"
                            placeholder="Ghi chú riêng cho tài sản này... (VD: Vị trí đặt cụ thể, yêu cầu đặc biệt, v.v.)"
                            value={item.note || ""}
                            onChange={(e) => handleUpdateAllocation(item.id, "note", e.target.value)}
                            className="text-sm border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-gray-50 focus:bg-white transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {allocationList.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-gray-600 font-medium mb-2">Chưa có tài sản nào</h4>
                  <p className="text-sm text-gray-500">
                    Quay lại để chọn tài sản cần phân bổ
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
