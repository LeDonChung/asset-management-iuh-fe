"use client";

import React, { useState, useEffect, Fragment } from "react";
import {
  Search,
  Filter,
  MapPin,
  Package2,
  Building,
  CheckCircle,
  Clock,
  ArrowRight,
  ArrowRightLeft,
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { Asset, AssetStatus, AssetType, Room, RoomStatus } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// Mock data cho demo - tài sản đã phân bổ về đơn vị nhưng chưa di chuyển đến vị trí thực tế
const mockAllocatedAssets: Asset[] = [
  {
    id: "1",
    ktCode: "24-0001/01",
    fixedCode: "4001.00001",
    name: "Máy tính Dell Latitude 5520",
    specs: "Intel Core i5-1135G7, 8GB RAM, 256GB SSD",
    entryDate: "2024-01-15",
    plannedRoomId: "1", // Vị trí theo kế hoạch
    unit: "Cái",
    quantity: 1,
    origin: "Dell Việt Nam",
    purchasePackage: 1,
    type: AssetType.TSCD,
    isLocked: true,
    categoryId: "4",
    status: AssetStatus.CHO_PHAN_BO, // Đã phân bổ nhưng chưa di chuyển
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
    id: "6",
    ktCode: "24-0006/01",
    fixedCode: "5001.00002",
    name: "Máy photocopy Canon iR2625",
    specs: "Máy photocopy đa năng A3, scan, fax",
    entryDate: "2024-02-05",
    // plannedRoomId: undefined - Chưa có vị trí theo kế hoạch cụ thể
    unit: "Cái",
    quantity: 1,
    origin: "Canon Việt Nam",
    purchasePackage: 3,
    type: AssetType.TSCD,
    isLocked: true,
    categoryId: "5",
    status: AssetStatus.CHO_PHAN_BO, // Đã phân bổ nhưng chưa di chuyển
    createdBy: "user1",
    createdAt: "2024-02-05T10:00:00Z",
    updatedAt: "2024-02-05T10:00:00Z",
    category: { id: "5", name: "Máy in", code: "5" }
  }
];

// Mock data cho các phòng thuộc đơn vị hiện tại (giả sử là Khoa CNTT)
const mockCurrentUnitRooms: Room[] = [
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
    id: "3",
    name: "Phòng IT 10",
    building: "B",
    floor: "1",
    roomNumber: "110",
    area: 60,
    capacity: 35,
    description: "Phòng thực hành CNTT",
    status: RoomStatus.ACTIVE,
    unitId: "unit1",
    createdBy: "admin",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "4",
    name: "Phòng Giảng viên CNTT",
    building: "A",
    floor: "3",
    roomNumber: "A301",
    area: 25,
    capacity: 8,
    description: "Phòng làm việc giảng viên CNTT",
    status: RoomStatus.ACTIVE,
    unitId: "unit1",
    createdBy: "admin",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
];

const typeLabels = {
  [AssetType.TSCD]: "Tài sản cố định",
  [AssetType.CCDC]: "Công cụ dụng cụ",
};

interface MoveData {
  assetId: string;
  actualRoomId: string;
  reason: string;
}

export default function AssetMovePage() {
  const [assets, setAssets] = useState<Asset[]>(mockAllocatedAssets);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>(mockAllocatedAssets);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveData, setMoveData] = useState<MoveData>({
    assetId: "",
    actualRoomId: "",
    reason: ""
  });

  // Filter assets - chỉ hiển thị tài sản đã phân bổ nhưng chưa di chuyển
  useEffect(() => {
    let filtered = assets.filter(asset =>
      !asset.deletedAt &&
      asset.status === AssetStatus.CHO_PHAN_BO // Đã phân bổ nhưng chưa di chuyển
    );

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(searchLower) ||
        asset.ktCode.toLowerCase().includes(searchLower) ||
        asset.fixedCode.toLowerCase().includes(searchLower)
      );
    }

    setFilteredAssets(filtered);
  }, [assets, searchTerm]);

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

  const handleMoveAsset = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);

    // Nếu tài sản đã có vị trí theo kế hoạch
    if (asset?.plannedRoomId && asset.room) {
      if (confirm(`Tài sản này đã có vị trí theo kế hoạch: ${asset.room.building} - ${asset.room.roomNumber} (${asset.room.name}). Bạn có muốn di chuyển trực tiếp đến vị trí này không?`)) {
        // Yêu cầu lý do di chuyển
        const reason = prompt("Vui lòng nhập lý do di chuyển:");
        if (reason && reason.trim()) {
          // Di chuyển trực tiếp theo kế hoạch
          setAssets(prev =>
            prev.map(a =>
              a.id === assetId
                ? {
                  ...a,
                  status: AssetStatus.DANG_SU_DUNG
                }
                : a
            )
          );
          alert("Di chuyển tài sản thành công theo kế hoạch!");
          return;
        } else {
          alert("Lý do di chuyển là bắt buộc!");
          return;
        }
      }
    }

    // Nếu không có vị trí theo kế hoạch hoặc người dùng muốn chọn lại
    setMoveData({
      assetId,
      actualRoomId: asset?.plannedRoomId || "", // Mặc định là vị trí dự kiến
      reason: ""
    });
    setShowMoveModal(true);
  };

  const handleSubmitMove = () => {
    if (!moveData.actualRoomId || !moveData.reason.trim()) {
      alert("Vui lòng điền đầy đủ thông tin di chuyển");
      return;
    }

    const assetIds = moveData.assetId.includes(',') 
      ? moveData.assetId.split(',') 
      : [moveData.assetId];

    const assetCount = assetIds.length;
    const confirmMessage = assetCount > 1 
      ? `Bạn có chắc chắn muốn di chuyển ${assetCount} tài sản này?`
      : "Bạn có chắc chắn muốn di chuyển tài sản này?";

    if (confirm(confirmMessage)) {
      // Cập nhật trạng thái tài sản
      setAssets(prev =>
        prev.map(asset =>
          assetIds.includes(asset.id)
            ? {
              ...asset,
              status: AssetStatus.DANG_SU_DUNG, // Chuyển sang đang sử dụng
              plannedRoomId: moveData.actualRoomId, // Cập nhật vị trí thực tế
              room: mockCurrentUnitRooms.find(r => r.id === moveData.actualRoomId)
            }
            : asset
        )
      );

      // Reset form và đóng modal
      setMoveData({ assetId: "", actualRoomId: "", reason: "" });
      setShowMoveModal(false);
      setSelectedAssets([]); // Xóa selection sau khi di chuyển

      const successMessage = assetCount > 1
        ? `Di chuyển ${assetCount} tài sản thành công!`
        : "Di chuyển tài sản thành công!";
      alert(successMessage);
    }
  };

  const handleBulkMove = () => {
    if (selectedAssets.length === 0) return;
    
    // Mở modal với các tài sản đã chọn
    setMoveData({
      assetId: selectedAssets.join(','), // Lưu nhiều ID bằng cách nối chuỗi
      actualRoomId: "",
      reason: ""
    });
    setShowMoveModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Di chuyển tài sản</h1>
          <p className="text-gray-600">
            Di chuyển tài sản đã phân bổ về vị trí sử dụng thực tế
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
          <p className="text-sm text-blue-800">
            <Building className="inline h-4 w-4 mr-1" />
            Đơn vị: Khoa Công nghệ thông tin
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <MapPin className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-900">Hướng dẫn di chuyển</h3>
            <p className="text-sm text-yellow-700 mt-1">
              • <strong>Tài sản có vị trí theo kế hoạch</strong>: Sẽ được di chuyển trực tiếp đến vị trí đã định sẵn<br />
              • <strong>Tài sản chưa có vị trí theo kế hoạch</strong>: Cần chọn vị trí thực tế để di chuyển
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên, mã kế toán, mã tài sản..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedAssets.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm text-green-800">
                Đã chọn {selectedAssets.length} tài sản
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleBulkMove}
                size="sm"
                className="flex items-center bg-green-500 hover:bg-green-600 text-white"
              >
                <MapPin className="h-4 w-4 mr-1" />
                Di chuyển hàng loạt
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
                  Vị trí hiện tại
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
                          {asset.room.building} - {asset.room.roomNumber}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm text-gray-400">
                          Chưa xác định vị trí
                        </div>
                        <Badge className="mt-1 bg-orange-100 text-orange-800 text-xs">
                          Cần chọn vị trí
                        </Badge>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {asset.room ? (
                      <Badge className="bg-green-100 text-green-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Sẵn sàng di chuyển
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-100 text-orange-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Cần chọn vị trí
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleMoveAsset(asset.id)}
                      className="p-1.5 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors flex items-center justify-center"
                      title="Di chuyển"
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                    </button>
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
              Không có tài sản nào cần di chuyển hoặc không phù hợp với từ khóa tìm kiếm.
            </p>
          </div>
        )}
      </div>

      {/* Move Modal */}
      <Transition appear show={showMoveModal} as={Fragment}>
        <Dialog 
          as="div" 
          className="relative z-50" 
          onClose={() => {
            setShowMoveModal(false);
            setMoveData({ assetId: "", actualRoomId: "", reason: "" });
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    Di chuyển tài sản
                    {moveData.assetId.includes(',') && (
                      <span className="text-sm text-gray-500 font-normal">
                        {' '}({moveData.assetId.split(',').length} tài sản)
                      </span>
                    )}
                  </Dialog.Title>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chọn phòng đích *
                      </label>
                      <select
                        value={moveData.actualRoomId}
                        onChange={(e) => setMoveData(prev => ({ ...prev, actualRoomId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">-- Chọn phòng --</option>
                        {mockCurrentUnitRooms.map(room => (
                          <option key={room.id} value={room.id}>
                            {room.building}-{room.roomNumber}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lý do di chuyển *
                      </label>
                      <textarea
                        value={moveData.reason}
                        onChange={(e) => setMoveData(prev => ({ ...prev, reason: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Nhập lý do di chuyển..."
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowMoveModal(false);
                        setMoveData({ assetId: "", actualRoomId: "", reason: "" });
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSubmitMove}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <ArrowRightLeft className="h-4 w-4 mr-2" />
                      Di chuyển
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
