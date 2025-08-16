"use client";

import React, { useState, useEffect, Fragment } from "react";
import {
    Search,
    Filter,
    Plus,
    Eye,
    ArrowRightLeft,
    Package2,
    Building,
    MapPin,
    User,
    CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { Dialog, Transition } from "@headlessui/react";
import { Asset, AssetFilter, AssetStatus, AssetType, Unit, Room, UnitType, UnitStatus, RoomStatus } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// Mock data cho demo - chỉ các tài sản đã bàn giao (isLocked = true) và chờ phân bổ
const mockHandedOverAssets: Asset[] = [
    {
        id: "1",
        ktCode: "24-0001/01",
        fixedCode: "4001.00001",
        name: "Máy tính Dell Latitude 5520",
        specs: "Intel Core i5-1135G7, 8GB RAM, 256GB SSD",
        entryDate: "2024-01-15",
        plannedRoomId: "1", // Có vị trí theo kế hoạch
        unit: "Cái",
        quantity: 1,
        origin: "Dell Việt Nam",
        purchasePackage: 1,
        type: AssetType.TSCD,
        isLocked: true, // Đã bàn giao
        categoryId: "4",
        status: AssetStatus.DANG_SU_DUNG, // Đã bàn giao nhưng chưa phân bổ
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
        id: "3",
        ktCode: "24-0003/01",
        fixedCode: "5001.00001",
        name: "Máy in HP LaserJet Pro M404dn",
        specs: "In laser đen trắng, tốc độ 38 trang/phút",
        entryDate: "2024-01-25",
        // plannedRoomId: undefined - Chưa có vị trí theo kế hoạch
        unit: "Cái",
        quantity: 2,
        origin: "HP Việt Nam",
        purchasePackage: 1,
        type: AssetType.TSCD,
        isLocked: true, // Đã bàn giao
        categoryId: "5",
        status: AssetStatus.DANG_SU_DUNG,
        createdBy: "user1",
        createdAt: "2024-01-25T10:00:00Z",
        updatedAt: "2024-01-25T10:00:00Z",
        category: { id: "5", name: "Máy in", code: "5" }
    },
    {
        id: "5",
        ktCode: "24-0005/01",
        fixedCode: "3001.00003",
        name: "Ghế văn phòng ergonomic",
        specs: "Ghế xoay có tựa lưng, điều chỉnh độ cao",
        entryDate: "2024-02-01",
        plannedRoomId: "2", // Có vị trí theo kế hoạch
        unit: "Cái",
        quantity: 1,
        origin: "Nội thất Hòa Phát",
        purchasePackage: 2,
        type: AssetType.CCDC,
        isLocked: true,
        categoryId: "3",
        status: AssetStatus.DANG_SU_DUNG,
        createdBy: "user1",
        createdAt: "2024-02-01T10:00:00Z",
        updatedAt: "2024-02-01T10:00:00Z",
        category: { id: "3", name: "Thiết bị văn phòng", code: "3" },
        room: {
            id: "2",
            name: "Phòng Giảng viên",
            building: "A",
            floor: "2",
            roomNumber: "A201",
            status: RoomStatus.ACTIVE,
            unitId: "unit2",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        }
    }
];

// Mock data cho các đơn vị sử dụng
const mockUnits: Unit[] = [
    {
        id: "unit1",
        name: "Khoa Công nghệ thông tin",
        phone: "0123456789",
        email: "cntt@iuh.edu.vn",
        type: UnitType.DON_VI_SU_DUNG,
        representativeId: "user2",
        status: UnitStatus.ACTIVE,
        createdBy: "admin",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        representative: { id: "user2", username: "nvA", fullName: "Nguyễn Văn A", email: "nvA@iuh.edu.vn", status: "ACTIVE" as any, createdAt: "2024-01-01", updatedAt: "2024-01-01" }
    },
    {
        id: "unit2",
        name: "Khoa Kinh tế",
        phone: "0987654321",
        email: "kt@iuh.edu.vn",
        type: UnitType.DON_VI_SU_DUNG,
        representativeId: "user3",
        status: UnitStatus.ACTIVE,
        createdBy: "admin",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        representative: { id: "user3", username: "nvB", fullName: "Nguyễn Văn B", email: "nvB@iuh.edu.vn", status: "ACTIVE" as any, createdAt: "2024-01-01", updatedAt: "2024-01-01" }
    }
];

// Mock data cho các phòng
const mockRooms: Room[] = [
    {
        id: "1",
        name: "Phòng IT 09",
        building: "B",
        floor: "1",
        roomNumber: "109",
        area: 50,
        capacity: 30,
        description: "Phòng thực hành CNTT",
        status: RoomStatus.ACTIVE,
        unitId: "unit1",
        createdBy: "admin",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
    },
    {
        id: "2",
        name: "Phòng Giảng viên",
        building: "A",
        floor: "2",
        roomNumber: "A201",
        area: 30,
        capacity: 10,
        description: "Phòng làm việc giảng viên",
        status: RoomStatus.ACTIVE,
        unitId: "unit2",
        createdBy: "admin",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
    }
];

const statusColors = {
    [AssetStatus.CHO_PHAN_BO]: "bg-yellow-100 text-yellow-800",
    [AssetStatus.DANG_SU_DUNG]: "bg-green-100 text-green-800",
};

const statusLabels = {
    [AssetStatus.CHO_PHAN_BO]: "Chờ phân bổ",
    [AssetStatus.DANG_SU_DUNG]: "Chưa phân bổ",
};

const typeLabels = {
    [AssetType.TSCD]: "Tài sản cố định",
    [AssetType.CCDC]: "Công cụ dụng cụ",
};

interface AllocationData {
    assetId: string;
    unitId: string;
    roomId: string;
}

export default function AssetAllocatePage() {
    const [assets, setAssets] = useState<Asset[]>(mockHandedOverAssets);
    const [filteredAssets, setFilteredAssets] = useState<Asset[]>(mockHandedOverAssets);
    const [filter, setFilter] = useState<AssetFilter>({});
    const [showFilter, setShowFilter] = useState(false);
    const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
    const [showAllocationModal, setShowAllocationModal] = useState(false);
    const [showBulkAllocationModal, setShowBulkAllocationModal] = useState(false);
    const [allocationData, setAllocationData] = useState<AllocationData>({
        assetId: "",
        unitId: "",
        roomId: ""
    });
    const [bulkAllocationData, setBulkAllocationData] = useState({
        unitId: "",
        roomId: ""
    });
    const [availableRooms, setAvailableRooms] = useState<Room[]>([]);

    // Filter assets - chỉ hiển thị tài sản đã tiếp nhận (isLocked = true) và sẵn sàng phân bổ
    useEffect(() => {
        let filtered = assets.filter(asset =>
            !asset.deletedAt &&
            asset.isLocked && // Đã được tiếp nhận từ ban kế hoạch đầu tư
            asset.status === AssetStatus.DANG_SU_DUNG // Sẵn sàng để phân bổ
            // Bỏ điều kiện !asset.plannedRoomId để hiển thị cả tài sản có và không có vị trí theo kế hoạch
        );

        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            filtered = filtered.filter(asset =>
                asset.name.toLowerCase().includes(searchLower) ||
                asset.ktCode.toLowerCase().includes(searchLower) ||
                asset.fixedCode.toLowerCase().includes(searchLower)
            );
        }

        if (filter.type) {
            filtered = filtered.filter(asset => asset.type === filter.type);
        }

        if (filter.categoryId) {
            filtered = filtered.filter(asset => asset.categoryId === filter.categoryId);
        }

        setFilteredAssets(filtered);
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

    const handleAllocateAsset = (assetId: string) => {
        const asset = assets.find(a => a.id === assetId);

        // Nếu tài sản đã có vị trí theo kế hoạch
        if (asset?.plannedRoomId) {
            const plannedRoom = mockRooms.find(r => r.id === asset.plannedRoomId);
            if (plannedRoom) {
                if (confirm(`Tài sản này đã có vị trí theo kế hoạch: ${plannedRoom.building} - ${plannedRoom.roomNumber} (${plannedRoom.name}). Bạn có muốn phân bổ trực tiếp đến vị trí này không?`)) {
                    // Phân bổ trực tiếp theo kế hoạch
                    setAssets(prev =>
                        prev.map(a =>
                            a.id === assetId
                                ? {
                                    ...a,
                                    status: AssetStatus.CHO_PHAN_BO,
                                    room: plannedRoom
                                }
                                : a
                        )
                    );
                    alert("Phân bổ tài sản thành công theo kế hoạch!");
                    return;
                }
            }
        }

        // Nếu không có vị trí theo kế hoạch hoặc người dùng muốn chọn lại
        setAllocationData(prev => ({ ...prev, assetId }));
        setShowAllocationModal(true);
    };

    const handleBulkAllocate = () => {
        if (selectedAssets.length === 0) return;
        // Mở modal phân bổ hàng loạt
        setShowBulkAllocationModal(true);
    };

    // Cập nhật danh sách phòng khi chọn đơn vị
    useEffect(() => {
        if (allocationData.unitId) {
            const rooms = mockRooms.filter(room => room.unitId === allocationData.unitId);
            setAvailableRooms(rooms);
            setAllocationData(prev => ({ ...prev, roomId: "" })); // Reset room selection
        } else {
            setAvailableRooms([]);
        }
    }, [allocationData.unitId]);

    // Cập nhật danh sách phòng cho phân bổ hàng loạt
    useEffect(() => {
        if (bulkAllocationData.unitId) {
            const rooms = mockRooms.filter(room => room.unitId === bulkAllocationData.unitId);
            setAvailableRooms(rooms);
            setBulkAllocationData(prev => ({ ...prev, roomId: "" })); // Reset room selection
        } else if (!allocationData.unitId) {
            setAvailableRooms([]);
        }
    }, [bulkAllocationData.unitId, allocationData.unitId]);

    const handleSubmitAllocation = () => {
        if (!allocationData.unitId || !allocationData.roomId) {
            alert("Vui lòng điền đầy đủ thông tin phân bổ");
            return;
        }

        if (confirm("Bạn có chắc chắn muốn phân bổ tài sản này?")) {
            // Cập nhật trạng thái tài sản
            setAssets(prev =>
                prev.map(asset =>
                    asset.id === allocationData.assetId
                        ? {
                            ...asset,
                            status: AssetStatus.CHO_PHAN_BO,
                            plannedRoomId: allocationData.roomId,
                            room: mockRooms.find(r => r.id === allocationData.roomId)
                        }
                        : asset
                )
            );

            // Reset form và đóng modal
            setAllocationData({ assetId: "", unitId: "", roomId: "" });
            setShowAllocationModal(false);

            alert("Phân bổ tài sản thành công!");
        }
    };

    const handleSubmitBulkAllocation = () => {
        if (!bulkAllocationData.unitId || !bulkAllocationData.roomId) {
            alert("Vui lòng điền đầy đủ thông tin phân bổ");
            return;
        }

        if (confirm(`Bạn có chắc chắn muốn phân bổ ${selectedAssets.length} tài sản đã chọn?`)) {
            const selectedRoom = mockRooms.find(r => r.id === bulkAllocationData.roomId);
            
            // Cập nhật trạng thái các tài sản được chọn
            setAssets(prev =>
                prev.map(asset =>
                    selectedAssets.includes(asset.id)
                        ? {
                            ...asset,
                            status: AssetStatus.CHO_PHAN_BO,
                            plannedRoomId: bulkAllocationData.roomId,
                            room: selectedRoom
                        }
                        : asset
                )
            );

            // Reset form và đóng modal
            setBulkAllocationData({ unitId: "", roomId: "" });
            setShowBulkAllocationModal(false);
            setSelectedAssets([]); // Clear selection

            alert(`Phân bổ thành công ${selectedAssets.length} tài sản!`);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Phân bổ tài sản</h1>
                    <p className="text-gray-600">
                        Phân bổ tài sản đã tiếp nhận đến các đơn vị sử dụng (các khoa phòng)
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <Link href="/asset/receive">
                        <Button variant="outline" className="flex items-center bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
                            Tiếp nhận tài sản
                        </Button>
                    </Link>
                    <Link href="/asset">
                        <Button variant="outline">
                            Quay lại danh sách tài sản
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-medium text-yellow-900">Hướng dẫn phân bổ</h3>
                        <p className="text-sm text-yellow-700 mt-1">
                            • <strong>Tài sản có vị trí theo kế hoạch</strong>: Sẽ được phân bổ trực tiếp đến vị trí đã định sẵn<br />
                            • <strong>Tài sản chưa có vị trí theo kế hoạch</strong>: Cần chọn đơn vị và phòng để phân bổ
                        </p>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
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
                    </div>
                )}
            </div>

            {/* Bulk Actions */}
            {selectedAssets.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Package2 className="h-5 w-5 text-blue-600" />
                            <div>
                                <span className="text-sm font-medium text-blue-800">
                                    Đã chọn {selectedAssets.length} tài sản
                                </span>
                                <div className="text-xs text-blue-600 mt-0.5">
                                    {filteredAssets
                                        .filter(asset => selectedAssets.includes(asset.id))
                                        .map(asset => asset.ktCode)
                                        .slice(0, 3)
                                        .join(", ")}
                                    {selectedAssets.length > 3 && ` và ${selectedAssets.length - 3} tài sản khác`}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                onClick={() => setSelectedAssets([])}
                                size="sm"
                                variant="outline"
                                className="text-gray-600 hover:text-gray-800"
                            >
                                Bỏ chọn tất cả
                            </Button>
                            <Button
                                onClick={handleBulkAllocate}
                                size="sm"
                                className="flex items-center bg-green-500 hover:bg-green-600 text-white"
                            >
                                <ArrowRightLeft className="h-4 w-4 mr-1" />
                                Phân bổ hàng loạt
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
                                    Vị trí KH
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày tiếp nhận
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAssets.map((asset) => (
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
                                        {asset.room ? (
                                            <div>
                                                <div className="flex items-center text-sm text-green-600">
                                                    <MapPin className="h-4 w-4 mr-1" />
                                                    {asset.room.building}-{asset.room.roomNumber}
                                                </div>
                                                <Badge className="mt-1 bg-green-100 text-green-800 text-xs">
                                                    Có vị trí KH
                                                </Badge>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="text-sm text-gray-400">
                                                    Chưa có vị trí
                                                </div>
                                                <Badge className="mt-1 bg-orange-100 text-orange-800 text-xs">
                                                    Cần chọn
                                                </Badge>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        <Badge className="bg-green-100 text-green-800">
                                            {statusLabels[asset.status]}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-500">
                                        {new Date(asset.updatedAt).toLocaleDateString("vi-VN")}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center space-x-2">
                                            <Link
                                                href={`/asset/${asset.id}`}
                                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="Xem chi tiết"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleAllocateAsset(asset.id)}
                                                className="p-1.5 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors flex items-center justify-center"
                                                title="Phân bổ"
                                            >
                                                <ArrowRightLeft className="h-4 w-4" />
                                            </button>
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
                            Không có tài sản nào sẵn sàng để phân bổ hoặc không phù hợp với bộ lọc hiện tại.
                        </p>
                        <div className="mt-4">
                            <Link href="/asset/receive">
                                <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                                    Chuyển đến tiếp nhận tài sản
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Allocation Modal */}
            <Transition appear show={showAllocationModal} as={Fragment}>
                <Dialog 
                    as="div" 
                    className="relative z-50" 
                    onClose={() => {
                        setShowAllocationModal(false);
                        setAllocationData({ assetId: "", unitId: "", roomId: "" });
                    }}
                >
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0  !bg-opacity-50 " />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl !bg-white p-6 text-left align-middle shadow-xl transition-all relative z-10 !text-gray-900 dark:!bg-white dark:!text-gray-900">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 !text-gray-900 mb-4"
                                    >
                                        Phân bổ tài sản
                                    </Dialog.Title>

                                    {/* Thông báo nếu tài sản có vị trí theo kế hoạch */}
                                    {(() => {
                                        const currentAsset = assets.find(a => a.id === allocationData.assetId);
                                        if (currentAsset?.room) {
                                            return (
                                                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                    <div className="flex items-start">
                                                        <MapPin className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                                                        <div>
                                                            <p className="text-sm font-medium text-blue-900">Vị trí theo kế hoạch</p>
                                                            <p className="text-sm text-blue-700">
                                                                {currentAsset.room.building} - {currentAsset.room.roomNumber} ({currentAsset.room.name})
                                                            </p>
                                                            <p className="text-xs text-blue-600 mt-1">
                                                                Bạn có thể chọn vị trí khác nếu cần thiết
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}

                                    <div className="space-y-4">
                                        {/* Chọn đơn vị */}
                                        <div>
                                            <label className="block text-sm font-medium !text-gray-700 mb-1 dark:!text-gray-700">
                                                Đơn vị sử dụng *
                                            </label>
                                            <select
                                                value={allocationData.unitId}
                                                onChange={(e) => setAllocationData(prev => ({ ...prev, unitId: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 !bg-white !text-gray-900 dark:!bg-white dark:!text-gray-900"
                                                required
                                            >
                                                <option value="">Chọn đơn vị sử dụng</option>
                                                {mockUnits.map(unit => (
                                                    <option key={unit.id} value={unit.id}>
                                                        {unit.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Chọn phòng */}
                                        <div>
                                            <label className="block text-sm font-medium !text-gray-700 mb-1 dark:!text-gray-700">
                                                Vị trí dự kiến *
                                            </label>
                                            <select
                                                value={allocationData.roomId}
                                                onChange={(e) => setAllocationData(prev => ({ ...prev, roomId: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 !bg-white !text-gray-900 dark:!bg-white dark:!text-gray-900"
                                                disabled={!allocationData.unitId}
                                                required
                                            >
                                                <option value="">Chọn vị trí</option>
                                                {availableRooms.map(room => (
                                                    <option key={room.id} value={room.id}>
                                                        {room.building} - {room.roomNumber} ({room.name})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-3 mt-6">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setShowAllocationModal(false);
                                                setAllocationData({ assetId: "", unitId: "", roomId: "" });
                                            }}
                                        >
                                            Hủy
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={handleSubmitAllocation}
                                            className="bg-green-500 hover:bg-green-600 text-white"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Phân bổ
                                        </Button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Bulk Allocation Modal */}
            <Transition appear show={showBulkAllocationModal} as={Fragment}>
                <Dialog 
                    as="div" 
                    className="relative z-50" 
                    onClose={() => {
                        setShowBulkAllocationModal(false);
                        setBulkAllocationData({ unitId: "", roomId: "" });
                    }}
                >
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 " />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all relative z-10  ">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6  mb-4"
                                    >
                                        Phân bổ hàng loạt
                                    </Dialog.Title>

                                    {/* Thông tin tài sản được chọn */}
                                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-start">
                                            <Package2 className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-blue-900">
                                                    {selectedAssets.length} tài sản đã chọn
                                                </p>
                                                <p className="text-sm text-blue-700">
                                                    Tất cả tài sản sẽ được phân bổ đến cùng một vị trí
                                                </p>
                                                <div className="text-xs text-blue-600 mt-1">
                                                    {filteredAssets
                                                        .filter(asset => selectedAssets.includes(asset.id))
                                                        .map(asset => asset.name)
                                                        .slice(0, 3)
                                                        .join(", ")}
                                                    {selectedAssets.length > 3 && `... và ${selectedAssets.length - 3} tài sản khác`}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Chọn đơn vị */}
                                        <div>
                                            <label className="block text-sm font-medium !text-gray-700 mb-1 dark:!text-gray-700">
                                                Đơn vị sử dụng *
                                            </label>
                                            <select
                                                value={bulkAllocationData.unitId}
                                                onChange={(e) => setBulkAllocationData(prev => ({ ...prev, unitId: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 !bg-white !text-gray-900 dark:!bg-white dark:!text-gray-900"
                                                required
                                            >
                                                <option value="">Chọn đơn vị sử dụng</option>
                                                {mockUnits.map(unit => (
                                                    <option key={unit.id} value={unit.id}>
                                                        {unit.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Chọn phòng */}
                                        <div>
                                            <label className="block text-sm font-medium !text-gray-700 mb-1 dark:!text-gray-700">
                                                Vị trí dự kiến *
                                            </label>
                                            <select
                                                value={bulkAllocationData.roomId}
                                                onChange={(e) => setBulkAllocationData(prev => ({ ...prev, roomId: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 !bg-white !text-gray-900 dark:!bg-white dark:!text-gray-900"
                                                disabled={!bulkAllocationData.unitId}
                                                required
                                            >
                                                <option value="">Chọn vị trí</option>
                                                {availableRooms.map(room => (
                                                    <option key={room.id} value={room.id}>
                                                        {room.building} - {room.roomNumber} ({room.name})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-3 mt-6">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setShowBulkAllocationModal(false);
                                                setBulkAllocationData({ unitId: "", roomId: "" });
                                            }}
                                        >
                                            Hủy
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={handleSubmitBulkAllocation}
                                            className="bg-green-500 hover:bg-green-600 text-white"
                                        >
                                            <ArrowRightLeft className="h-4 w-4 mr-2" />
                                            Phân bổ {selectedAssets.length} tài sản
                                        </Button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}
