"use client";

import React, { useState } from "react";
import {
  ArrowRightLeft,
  Building2,
  MapPin,
  Save,
  X,
  AlertCircle,
  Package2,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Asset,
  AssetTransaction,
  AssetTransactionItem,
  TransactionType,
  TransactionStatus,
} from "@/types/asset";

interface SimplifiedHandoverFormProps {
  assets: Asset[];
  onCancel: () => void;
  onSuccess: (transaction: AssetTransaction) => void;
  title?: string;
}

// Mock data cho units với rooms (sẽ được thay thế bằng API call)
const mockUnitsWithRooms = [
  {
    id: "CNTT",
    name: "Khoa Công nghệ Thông tin",
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
    rooms: [
      { id: "KT-101", name: "Phòng học Kinh tế 101" },
      { id: "KT-102", name: "Phòng thí nghiệm kế toán" },
      { id: "KT-201", name: "Phòng hội thảo kinh doanh" },
    ]
  },
  {
    id: "CO_KHI",
    name: "Khoa Cơ khí",
    rooms: [
      { id: "CK-101", name: "Xưởng thực hành cơ khí 1" },
      { id: "CK-102", name: "Xưởng thực hành cơ khí 2" },
      { id: "CK-201", name: "Phòng thiết kế CAD" },
    ]
  },
  {
    id: "HC_CHINH",
    name: "Phòng Hành chính",
    rooms: [
      { id: "HC-101", name: "Văn phòng hành chính" },
      { id: "HC-102", name: "Phòng họp lớn" },
      { id: "HC-103", name: "Phòng tiếp khách" },
    ]
  },
];

export default function SimplifiedHandoverForm({
  assets,
  onCancel,
  onSuccess,
  title = "Bàn giao tài sản"
}: SimplifiedHandoverFormProps) {
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [transactionNote, setTransactionNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getRoomsByUnitId = (unitId: string) => {
    const unit = mockUnitsWithRooms.find(u => u.id === unitId);
    return unit?.rooms || [];
  };

  const getUnitName = (unitId: string) => {
    const unit = mockUnitsWithRooms.find(u => u.id === unitId);
    return unit?.name || "";
  };

  const getRoomName = (roomId: string) => {
    for (const unit of mockUnitsWithRooms) {
      const room = unit.rooms.find(r => r.id === roomId);
      if (room) return room.name;
    }
    return "";
  };

  const handleSubmit = async () => {
    if (!selectedUnitId) {
      alert("Vui lòng chọn đơn vị sử dụng!");
      return;
    }

    const confirmMessage = selectedRoomId 
      ? `Bạn có chắc chắn muốn bàn giao ${assets.length} tài sản đến ${getUnitName(selectedUnitId)} - ${getRoomName(selectedRoomId)}?`
      : `Bạn có chắc chắn muốn bàn giao ${assets.length} tài sản đến ${getUnitName(selectedUnitId)}?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const transactionId = `HANDOVER-${Date.now()}`;
      
      // Tạo transaction items cho tất cả assets
      const transactionItems: AssetTransactionItem[] = assets.map(asset => ({
        id: `ITEM-${asset.id}-${Date.now()}`,
        transactionId: transactionId,
        assetId: asset.id,
        note: `Bàn giao đến ${getUnitName(selectedUnitId)}${selectedRoomId ? ` - ${getRoomName(selectedRoomId)}` : ""}`
      }));

      const transaction: AssetTransaction = {
        id: transactionId,
        type: TransactionType.HANDOVER,
        status: TransactionStatus.APPROVED,
        toUnitId: selectedUnitId,
        toRoomId: selectedRoomId || undefined,
        note: transactionNote || `Bàn giao ${assets.length} tài sản`,
        createdBy: "current-user", // Thay bằng user hiện tại
        createdAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
        approvedBy: "current-user", // Thay bằng user hiện tại
        items: transactionItems
      };

      // Gọi callback với transaction đã tạo
      onSuccess(transaction);

    } catch (error) {
      console.error("Error creating handover transaction:", error);
      alert("Có lỗi xảy ra khi tạo bàn giao. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-white">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
              className="mr-3 text-white border-white/30 hover:bg-white/10 hover:border-white/50 hover:text-white"
            >
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <div>
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="text-blue-100 text-sm mt-1">
                Chọn đơn vị và phòng cho {assets.length} tài sản được chọn
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedUnitId}
            className="mr-3 text-white border-white/30 hover:bg-white/10 hover:border-white/50 hover:text-white disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Tạo yêu cầu bàn giao
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="p-8">
        {/* Assets Summary */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 mb-8 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Tài sản đã chọn
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Danh sách {assets.length} tài sản sẽ được bàn giao
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">{assets.length}</div>
              <div className="text-sm text-green-700">tài sản</div>
            </div>
          </div>

          {/* Preview first few assets */}
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {assets.slice(0, 3).map((asset, index) => (
              <div key={asset.id} className="flex items-center justify-between bg-white/50 rounded px-3 py-2">
                <div className="flex items-center">
                  <Package2 className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-900">{asset.name}</span>
                </div>
                <div className="text-xs text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded mr-1">
                    {asset.ktCode}
                  </span>
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {asset.fixedCode}
                  </span>
                </div>
              </div>
            ))}
            
            {assets.length > 3 && (
              <div className="text-center py-2">
                <span className="text-sm text-gray-500">
                  ... và {assets.length - 3} tài sản khác
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Destination Selection */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8 border border-blue-200">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Chọn địa điểm bàn giao
            </h3>
            <p className="text-sm text-gray-600">
              Tất cả tài sản sẽ được bàn giao đến cùng một đơn vị và phòng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Unit Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <span className="flex items-center">
                  <Building2 className="w-4 h-4 mr-2 text-blue-500" />
                  Đơn vị sử dụng
                  <span className="text-red-500 ml-1">*</span>
                </span>
              </label>
              <select
                value={selectedUnitId}
                onChange={(e) => {
                  setSelectedUnitId(e.target.value);
                  setSelectedRoomId(""); // Reset room when unit changes
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white"
                disabled={isSubmitting}
              >
                <option value="">Chọn đơn vị sử dụng</option>
                {mockUnitsWithRooms.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Room Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                  Phòng
                </span>
              </label>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-white disabled:bg-gray-100"
                disabled={!selectedUnitId || isSubmitting}
              >
                <option value="">
                  {selectedUnitId ? "Chọn phòng (tùy chọn)" : "Vui lòng chọn đơn vị trước"}
                </option>
                {getRoomsByUnitId(selectedUnitId).map(room => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Note Section */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            <span className="flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 text-purple-500" />
              Ghi chú cho yêu cầu bàn giao
            </span>
          </label>
          <textarea
            placeholder="Nhập ghi chú cho yêu cầu bàn giao (tùy chọn)..."
            value={transactionNote}
            onChange={(e) => setTransactionNote(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-white resize-none"
            rows={3}
            disabled={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
