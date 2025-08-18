"use client";

import React, { useState, useEffect } from "react";
import {
    Search,
    Package2,
    Calendar,
    Users,
    AlertCircle,
    Plus,
    Trash2,
    Save,
    ArrowLeft,
    Eye,
    History,
    Clock,
    Filter,
    X,
    CalendarDays,
    Tag,
} from "lucide-react";
import Link from "next/link";
import {
    Asset,
    AssetType,
    AssetStatus,
    UnitType,
    AssetTransaction,
    TransactionType,
    TransactionStatus,
    AssetTransactionItem,
    Unit,
} from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { mockAssets } from "@/lib/mockData";

// Mock data cho tài sản đã tiếp nhận (status = CHO_PHAN_BO)
const mockAvailableAssets = mockAssets.filter(
    (asset) => asset.status === AssetStatus.CHO_PHAN_BO
);

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

// Mock data cho lịch sử chuyển giao
const mockTransferHistory: AssetTransaction[] = [
    {
        id: "TXN-2025-001",
        type: TransactionType.TRANSFER,
        fromUnitId: "PQT",
        toUnitId: "CNTT",
        createdBy: "Trần Thị Hà",
        createdAt: "2025-08-10T14:30:00Z",
        status: TransactionStatus.APPROVED,
        note: "Chuyển giao máy tính cho phòng thí nghiệm CNTT",
        approvedAt: "2025-08-11T09:15:00Z",
        approvedBy: "Nguyễn Văn Nam",
        fromUnit: {
            id: "PQT",
            name: "Phòng Quản Trị",
            type: UnitType.PHONG_QUAN_TRI,
            status: "ACTIVE" as any,
            representativeId: "tran.ha",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        toUnit: {
            id: "CNTT",
            name: "Khoa Công nghệ Thông tin",
            type: UnitType.DON_VI_SU_DUNG,
            status: "ACTIVE" as any,
            representativeId: "nguyen.nam",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        items: [
            {
                id: "ITM-TXF-001",
                transactionId: "TXF-2025-001",
                assetId: "LAPTOP-001",
                note: "Laptop cho giảng viên",
            },
            {
                id: "ITM-TXF-002",
                transactionId: "TXF-2025-001",
                assetId: "PC-001",
                note: "Máy tính cho phòng lab",
            }
        ]
    },
    {
        id: "TXF-2025-002",
        type: TransactionType.TRANSFER,
        fromUnitId: "PQT",
        toUnitId: "KINH_TE",
        createdBy: "Trần Thị Hà",
        createdAt: "2025-08-05T10:20:00Z",
        status: TransactionStatus.PENDING,
        note: "Chuyển giao thiết bị văn phòng cho khoa Kinh tế",
        fromUnit: {
            id: "PQT",
            name: "Phòng Quản Trị",
            type: UnitType.PHONG_QUAN_TRI,
            status: "ACTIVE" as any,
            representativeId: "tran.ha",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        toUnit: {
            id: "KINH_TE",
            name: "Khoa Kinh tế",
            type: UnitType.DON_VI_SU_DUNG,
            status: "ACTIVE" as any,
            representativeId: "le.minh",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        items: [
            {
                id: "ITM-TXF-003",
                transactionId: "TXF-2025-002",
                assetId: "PRINTER-001",
                note: "Máy in cho văn phòng khoa",
            }
        ]
    },
    {
        id: "TXF-2025-003",
        type: TransactionType.TRANSFER,
        fromUnitId: "PQT",
        toUnitId: "CO_KHI",
        createdBy: "Trần Thị Hà",
        createdAt: "2025-07-28T16:45:00Z",
        status: TransactionStatus.REJECTED,
        note: "Chuyển giao máy móc cho xưởng cơ khí - Bị từ chối",
        fromUnit: {
            id: "PQT",
            name: "Phòng Quản Trị",
            type: UnitType.PHONG_QUAN_TRI,
            status: "ACTIVE" as any,
            representativeId: "tran.ha",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        toUnit: {
            id: "CO_KHI",
            name: "Khoa Cơ khí",
            type: UnitType.DON_VI_SU_DUNG,
            status: "ACTIVE" as any,
            representativeId: "hoang.duc",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        items: [
            {
                id: "ITM-TXF-004",
                transactionId: "TXF-2025-003",
                assetId: "MACHINE-001",
                note: "Máy tiện CNC - Không phù hợp với yêu cầu",
            }
        ]
    }
];

const typeLabels = {
    [AssetType.TSCD]: "Tài sản cố định",
    [AssetType.CCDC]: "Công cụ dụng cụ",
};

const typeColors = {
    [AssetType.TSCD]: "bg-blue-100 text-blue-800",
    [AssetType.CCDC]: "bg-green-100 text-green-800",
};

export default function AssetTransferPage() {
    const [availableAssets, setAvailableAssets] = useState<Asset[]>(mockAvailableAssets);
    const [filteredAssets, setFilteredAssets] = useState<Asset[]>(mockAvailableAssets);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
    const [isCreatingTransfer, setIsCreatingTransfer] = useState(false);
    const [transferData, setTransferData] = useState<Partial<AssetTransaction>>({
        type: TransactionType.TRANSFER,
        status: TransactionStatus.PENDING,
        fromUnitId: "",
        toUnitId: "",
        note: "",
        items: []
    });

    // States for transfer history
    const [transferHistory, setTransferHistory] = useState<AssetTransaction[]>(mockTransferHistory);
    const [showHistory, setShowHistory] = useState(false);

    // Filter states for assets
    const [assetFilters, setAssetFilters] = useState({
        type: "",
        category: "",
        dateFrom: "",
        dateTo: ""
    });
    const [showAssetFilters, setShowAssetFilters] = useState(false);

    // Filter states for transfer history
    const [historyFilters, setHistoryFilters] = useState({
        status: "",
        toUnit: "",
        dateFrom: "",
        dateTo: ""
    });
    const [showHistoryFilters, setShowHistoryFilters] = useState(false);

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

    // Get unique units from transfer history
    const availableUnits = Array.from(
        new Set(transferHistory.map(t => t.toUnit?.id).filter(Boolean))
    ).map(unitId => {
        const transfer = transferHistory.find(t => t.toUnit?.id === unitId);
        return transfer?.toUnit;
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

    // Clear history filters
    const clearHistoryFilters = () => {
        setHistoryFilters({
            status: "",
            toUnit: "",
            dateFrom: "",
            dateTo: ""
        });
    };

    // Count active filters
    const activeAssetFiltersCount = Object.values(assetFilters).filter(v => v !== "").length;
    const activeHistoryFiltersCount = Object.values(historyFilters).filter(v => v !== "").length;

    // Filter transfer history
    const filteredTransferHistory = transferHistory.filter(transfer => {
        if (historyFilters.status && transfer.status !== historyFilters.status) return false;
        if (historyFilters.toUnit && transfer.toUnit?.id !== historyFilters.toUnit) return false;
        
        if (historyFilters.dateFrom) {
            const fromDate = new Date(historyFilters.dateFrom);
            if (new Date(transfer.createdAt) < fromDate) return false;
        }
        
        if (historyFilters.dateTo) {
            const toDate = new Date(historyFilters.dateTo);
            toDate.setHours(23, 59, 59, 999);
            if (new Date(transfer.createdAt) > toDate) return false;
        }
        
        return true;
    });

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

    const handleCreateTransferList = () => {
        if (selectedAssets.length === 0) {
            alert("Vui lòng chọn ít nhất một tài sản để chuyển giao!");
            return;
        }

        const transferItems: AssetTransactionItem[] = selectedAssets.map(assetId => ({
            id: `item-${assetId}-${Date.now()}`,
            transactionId: `transfer-${Date.now()}`,
            assetId,
            note: ""
        }));

        setTransferData(prev => ({
            ...prev,
            items: transferItems
        }));
        setIsCreatingTransfer(true);
    };

    const handleSaveTransfer = () => {
        // Create transfer transaction
        const newTransfer: AssetTransaction = {
            id: `transfer-${Date.now()}`,
            type: TransactionType.TRANSFER,
            fromUnitId: transferData.fromUnitId!,
            toUnitId: transferData.toUnitId!,
            status: TransactionStatus.PENDING,
            note: transferData.note || "",
            createdBy: "current-user", // This should be from auth context
            createdAt: new Date().toISOString(),
            items: transferData.items || []
        };

        // Here you would save to backend
        console.log("Transfer created:", newTransfer);

        // Add to history
        setTransferHistory(prev => [newTransfer, ...prev]);

        alert("Chuyển giao đã được tạo thành công!");

        // Reset form
        setIsCreatingTransfer(false);
        setSelectedAssets([]);
        setTransferData({
            type: TransactionType.TRANSFER,
            status: TransactionStatus.PENDING,
            fromUnitId: "",
            toUnitId: "",
            note: "",
            items: []
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Chuyển giao tài sản</h1>
                    <p className="text-gray-600">
                        Chuyển giao tài sản đến phòng quản trị
                    </p>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-medium text-blue-900">Hướng dẫn chuyển giao</h3>
                        <p className="text-sm text-blue-700 mt-1">
                            1. Chọn các tài sản cần chuyển giao từ danh sách bên dưới
                            <br />
                            2. Nhấn "Tạo danh sách chuyển giao" để thiết lập chi tiết chuyển giao
                            <br />
                            3. Lưu để hoàn tất quá trình chuyển giao
                        </p>
                    </div>
                </div>
            </div>

            {!isCreatingTransfer ? (
                <>
                    {/* Asset Selection */}
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                        <div className="p-4 md:p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <div className="w-1 h-6 bg-blue-500 rounded-full mr-3"></div>
                                    <h2 className="text-xl font-bold text-gray-800">Chọn tài sản cần chuyển giao</h2>
                                </div>
                                {selectedAssets.length > 0 && (
                                    <Button
                                        onClick={handleCreateTransferList}
                                        className="flex items-center bg-blue-600 hover:bg-blue-700 shadow-lg"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Tạo danh sách chuyển giao ({selectedAssets.length})
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
                                                Số lượng
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
                                        Hiện tại không có tài sản nào sẵn sàng để chuyển giao hoặc không phù hợp với từ khóa tìm kiếm.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Transfer History Section */}
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 mt-6">
                        <div className="p-4 md:p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <div className="w-1 h-6 bg-green-500 rounded-full mr-3"></div>
                                    <h2 className="text-xl font-bold text-gray-800">Lịch sử chuyển giao</h2>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowHistoryFilters(!showHistoryFilters)}
                                        className="flex items-center"
                                    >
                                        <Filter className="h-4 w-4 mr-2" />
                                        Bộ lọc
                                        {activeHistoryFiltersCount > 0 && (
                                            <Badge className="ml-2 bg-green-100 text-green-600 text-xs">
                                                {activeHistoryFiltersCount}
                                            </Badge>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowHistory(!showHistory)}
                                        className="flex items-center"
                                    >
                                        <History className="h-4 w-4 mr-2" />
                                        {showHistory ? 'Ẩn lịch sử' : 'Xem lịch sử'}
                                    </Button>
                                </div>
                            </div>

                            {/* History Filters */}
                            {showHistoryFilters && (
                                <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                                            <Filter className="h-4 w-4 mr-2 text-green-500" />
                                            Bộ lọc lịch sử chuyển giao
                                        </h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearHistoryFilters}
                                            className="text-gray-500 hover:text-red-600"
                                        >
                                            <X className="h-4 w-4 mr-1" />
                                            Xóa bộ lọc
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {/* Status Filter */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Tag className="inline h-4 w-4 mr-1" />
                                                Trạng thái
                                            </label>
                                            <select
                                                value={historyFilters.status}
                                                onChange={(e) => setHistoryFilters(prev => ({ ...prev, status: e.target.value }))}
                                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-sm"
                                            >
                                                <option value="">Tất cả trạng thái</option>
                                                <option value={TransactionStatus.PENDING}>Chờ tiếp nhận</option>
                                                <option value={TransactionStatus.APPROVED}>Đã tiếp nhận</option>
                                                <option value={TransactionStatus.REJECTED}>Từ chối</option>
                                            </select>
                                        </div>

                                        {/* To Unit Filter */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Users className="inline h-4 w-4 mr-1" />
                                                Đơn vị nhận
                                            </label>
                                            <select
                                                value={historyFilters.toUnit}
                                                onChange={(e) => setHistoryFilters(prev => ({ ...prev, toUnit: e.target.value }))}
                                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-sm"
                                            >
                                                <option value="">Phòng quản trị</option>
                                            </select>
                                        </div>

                                        {/* Date From Filter */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <CalendarDays className="inline h-4 w-4 mr-1" />
                                                Từ ngày
                                            </label>
                                            <Input
                                                type="date"
                                                value={historyFilters.dateFrom}
                                                onChange={(e) => setHistoryFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                                                className="text-sm"
                                            />
                                        </div>

                                        {/* Date To Filter */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <CalendarDays className="inline h-4 w-4 mr-1" />
                                                Đến ngày
                                            </label>
                                            <Input
                                                type="date"
                                                value={historyFilters.dateTo}
                                                onChange={(e) => setHistoryFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                                                className="text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Active History Filters Summary */}
                                    {activeHistoryFiltersCount > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="flex flex-wrap gap-2">
                                                {historyFilters.status && (
                                                    <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                                                        Trạng thái: {
                                                            historyFilters.status === TransactionStatus.APPROVED ? "Đã tiếp nhận" :
                                                            historyFilters.status === TransactionStatus.PENDING ? "Chờ tiếp nhận" :
                                                            "Từ chối"
                                                        }
                                                        <X 
                                                            className="h-3 w-3 cursor-pointer hover:text-blue-600" 
                                                            onClick={() => setHistoryFilters(prev => ({ ...prev, status: "" }))}
                                                        />
                                                    </Badge>
                                                )}
                                                {historyFilters.toUnit && (
                                                    <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                                                        Đơn vị: {availableUnits.find(u => u?.id === historyFilters.toUnit)?.name}
                                                        <X 
                                                            className="h-3 w-3 cursor-pointer hover:text-green-600" 
                                                            onClick={() => setHistoryFilters(prev => ({ ...prev, toUnit: "" }))}
                                                        />
                                                    </Badge>
                                                )}
                                                {historyFilters.dateFrom && (
                                                    <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
                                                        Từ: {new Date(historyFilters.dateFrom).toLocaleDateString("vi-VN")}
                                                        <X 
                                                            className="h-3 w-3 cursor-pointer hover:text-purple-600" 
                                                            onClick={() => setHistoryFilters(prev => ({ ...prev, dateFrom: "" }))}
                                                        />
                                                    </Badge>
                                                )}
                                                {historyFilters.dateTo && (
                                                    <Badge className="bg-orange-100 text-orange-800 flex items-center gap-1">
                                                        Đến: {new Date(historyFilters.dateTo).toLocaleDateString("vi-VN")}
                                                        <X 
                                                            className="h-3 w-3 cursor-pointer hover:text-orange-600" 
                                                            onClick={() => setHistoryFilters(prev => ({ ...prev, dateTo: "" }))}
                                                        />
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {showHistory && (
                                <div className="bg-white rounded-lg shadow">
                                    {/* Results Counter for History */}
                                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                        <div className="text-sm text-gray-700">
                                            Hiển thị <span className="font-medium">{filteredTransferHistory.length}</span> / <span className="font-medium">{transferHistory.length}</span> giao dịch chuyển giao
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Thông tin chuyển giao
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Đơn vị nhận
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Số tài sản
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Ngày tạo
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Trạng thái
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Thao tác
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {filteredTransferHistory.map((transfer) => (
                                                    <tr key={transfer.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-4">
                                                            <div className="flex items-center">
                                                                <div className="flex-shrink-0 h-10 w-10">
                                                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm">
                                                                        <Package2 className="h-5 w-5 text-white" />
                                                                    </div>
                                                                </div>
                                                                <div className="ml-3">
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {transfer.note}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {transfer.id}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                Phòng quản trị
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <Badge className="bg-purple-100 text-purple-800">
                                                                {transfer.items?.length || 0} tài sản
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-4 text-sm text-gray-500">
                                                            <div className="flex items-center">
                                                                <Calendar className="h-4 w-4 mr-1" />
                                                                {new Date(transfer.createdAt).toLocaleDateString("vi-VN")}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <Badge className={
                                                                transfer.status === TransactionStatus.APPROVED ? "bg-green-100 text-green-800" :
                                                                    transfer.status === TransactionStatus.PENDING ? "bg-yellow-100 text-yellow-800" :
                                                                        "bg-red-100 text-red-800"
                                                            }>
                                                                {transfer.status === TransactionStatus.APPROVED ? "Đã tiếp nhận" :
                                                                    transfer.status === TransactionStatus.PENDING ? "Chờ tiếp nhận" :
                                                                        "Từ chối"}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <Link href={`/asset/receive/${transfer.id}`}>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="flex items-center"
                                                                >
                                                                    <Eye className="h-4 w-4 mr-1" />
                                                                    Chi tiết
                                                                </Button>
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {filteredTransferHistory.length === 0 && (
                                        <div className="text-center py-12 bg-white">
                                            <History className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                                {transferHistory.length === 0 ? "Chưa có lịch sử chuyển giao" : "Không tìm thấy kết quả"}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {transferHistory.length === 0 
                                                    ? "Các chuyển giao đã thực hiện sẽ hiển thị ở đây." 
                                                    : "Thử điều chỉnh bộ lọc để xem thêm kết quả."
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Transfer Form - Enhanced Styling */}
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        {/* Header with gradient background */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-white">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsCreatingTransfer(false)}
                                        className="mr-3 text-white border-white/30 hover:bg-white/10 hover:border-white/50 hover:text-white transition-all duration-200"
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Quay lại
                                    </Button>
                                    <div>
                                        <h2 className="text-xl font-bold">Thông tin chuyển giao tài sản</h2>
                                        <p className="text-blue-100 text-sm mt-1">
                                            Điền đầy đủ thông tin để hoàn tất chuyển giao
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={handleSaveTransfer}
                                    className="bg-white text-blue-700 hover:bg-gray-100 hover:text-blue-800 font-semibold shadow-md transition-all duration-200"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Lưu chuyển giao
                                </Button>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column - Transfer Information */}
                                <div className="space-y-6">
                                    <div className="flex items-center pb-3 border-b-2 border-blue-100">
                                        <div className="w-2 h-6 bg-blue-500 rounded-full mr-3"></div>
                                        <h3 className="text-lg font-bold text-gray-800">
                                            Thông tin chuyển giao
                                        </h3>
                                    </div>


                                    {/* To Unit with enhanced styling */}
                                    <div className="group">
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            <span className="flex items-center">
                                                <Users className="w-4 h-4 mr-2 text-green-500" />
                                                Đơn vị nhận
                                                <span className="text-red-500 ml-1">*</span>
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={transferData.toUnitId}
                                                onChange={(e) => setTransferData(prev => ({
                                                    ...prev,
                                                    toUnitId: e.target.value
                                                }))}
                                                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 text-gray-700 font-medium shadow-sm hover:border-gray-300"
                                                required
                                            >
                                                <option value="" className="text-gray-400">Phòng quản trị</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Note with enhanced styling */}
                                    <div className="group">
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            <span className="flex items-center">
                                                <AlertCircle className="w-4 h-4 mr-2 text-orange-500" />
                                                Ghi chú
                                            </span>
                                        </label>
                                        <textarea
                                            value={transferData.note}
                                            onChange={(e) => setTransferData(prev => ({
                                                ...prev,
                                                note: e.target.value
                                            }))}
                                            rows={4}
                                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 text-gray-700 resize-none shadow-sm hover:border-gray-300"
                                            placeholder="Nhập ghi chú cho chuyển giao... (VD: Lý do chuyển giao, yêu cầu đặc biệt, v.v.)"
                                        />
                                    </div>
                                </div>

                                {/* Right Column - Selected Assets */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between pb-3 border-b-2 border-green-100">
                                        <div className="flex items-center">
                                            <div className="w-2 h-6 bg-green-500 rounded-full mr-3"></div>
                                            <h3 className="text-lg font-bold text-gray-800">
                                                Tài sản được chuyển giao
                                            </h3>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge className="bg-green-100 text-green-800 font-semibold px-3 py-1">
                                                <Package2 className="w-3 h-3 mr-1" />
                                                {transferData.items?.length || 0} tài sản
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                                        <div className="space-y-3">
                                            {transferData.items?.map((item, index) => {
                                                const asset = availableAssets.find(a => a.id === item.assetId);
                                                if (!asset) return null;

                                                return (
                                                    <Card key={item.id} className="bg-white border border-gray-200 hover:shadow-md transition-all duration-200 group">
                                                        <div className="p-4">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div className="flex items-center">
                                                                    <div className="flex-shrink-0 h-10 w-10">
                                                                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm">
                                                                            <Package2 className="h-5 w-5 text-white" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="ml-4">
                                                                        <div className="text-sm font-bold text-gray-900">
                                                                            {asset.name}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500 mt-1">
                                                                            <div className="flex items-center space-x-2 mb-1">
                                                                                <span className="bg-gray-100 px-2 py-1 rounded-md font-mono">
                                                                                    {asset.ktCode}
                                                                                </span>
                                                                                <span>•</span>
                                                                                <span className="bg-gray-100 px-2 py-1 rounded-md font-mono">
                                                                                    {asset.fixedCode}
                                                                                </span>
                                                                            </div>
                                                                            {asset.specs && (
                                                                                <div className="text-xs text-gray-400" title={asset.specs}>
                                                                                    {asset.specs.length > 40
                                                                                        ? asset.specs.substring(0, 40) + '...'
                                                                                        : asset.specs}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        const updatedItems = transferData.items?.filter((_, i) => i !== index);
                                                                        setTransferData(prev => ({
                                                                            ...prev,
                                                                            items: updatedItems
                                                                        }));
                                                                    }}
                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>

                                                            {/* Item Note */}
                                                            <div>
                                                                <Input
                                                                    placeholder="Ghi chú riêng cho tài sản này..."
                                                                    value={item.note || ""}
                                                                    onChange={(e) => {
                                                                        const updatedItems = [...(transferData.items || [])];
                                                                        updatedItems[index].note = e.target.value;
                                                                        setTransferData(prev => ({
                                                                            ...prev,
                                                                            items: updatedItems
                                                                        }));
                                                                    }}
                                                                    className="text-sm border-gray-200 focus:border-blue-400 bg-gray-50 focus:bg-white transition-all duration-200"
                                                                />
                                                            </div>
                                                        </div>
                                                    </Card>
                                                );
                                            })}
                                        </div>

                                        {(!transferData.items || transferData.items.length === 0) && (
                                            <div className="text-center py-12">
                                                <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                                                    <Package2 className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <h4 className="text-gray-600 font-medium mb-2">Chưa có tài sản nào</h4>
                                                <p className="text-sm text-gray-500">
                                                    Quay lại để chọn tài sản cần chuyển giao
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            
        </div>
    );
}
