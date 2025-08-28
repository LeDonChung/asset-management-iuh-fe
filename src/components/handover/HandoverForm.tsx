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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Asset,
  AssetTransaction,
  AssetTransactionItem,
  TransactionType,
  TransactionStatus,
  AssetStatus,
} from "@/types/asset";

// Interface cho handover transaction item
interface HandoverTransactionItem extends AssetTransactionItem {
  asset: Asset;
}

interface HandoverFormProps {
  assets: Asset[];
  onCancel: () => void;
  onSuccess: (transaction: AssetTransaction) => void;
  title?: string;
}

// Mock data cho units với rooms
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

export default function HandoverForm({
  assets,
  onCancel,
  onSuccess,
  title = "Bàn giao tài sản"
}: HandoverFormProps) {
  const [currentTransaction, setCurrentTransaction] = useState<AssetTransaction | null>(null);
  const [handoverItems, setHandoverItems] = useState<HandoverTransactionItem[]>([]);
  const [applyAllUnit, setApplyAllUnit] = useState("");
  const [applyAllRoom, setApplyAllRoom] = useState("");

  // Initialize transaction and items when component mounts or assets change
  React.useEffect(() => {
    if (assets.length > 0) {
      const transactionId = `HANDOVER-${Date.now()}`;
      const newTransaction: AssetTransaction = {
        id: transactionId,
        type: TransactionType.HANDOVER,
        createdBy: "current-user", // Thay bằng user hiện tại
        createdAt: new Date().toISOString(),
        status: TransactionStatus.PENDING,
        note: `Bàn giao ${assets.length} tài sản`,
      };

      const newItems: HandoverTransactionItem[] = assets.map(asset => ({
        id: `ITEM-${asset.id}-${Date.now()}`,
        transactionId: transactionId,
        assetId: asset.id,
        asset: asset,
        note: ""
      }));

      setCurrentTransaction(newTransaction);
      setHandoverItems(newItems);
    }
  }, [assets]);

  const getRoomsByUnitId = (unitId: string) => {
    const unit = mockUnitsWithRooms.find(u => u.id === unitId);
    return unit?.rooms || [];
  };

  const handleUpdateHandoverItem = (itemId: string, field: string, value: any) => {
    setHandoverItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleUpdateTransaction = (field: keyof AssetTransaction, value: any) => {
    if (!currentTransaction) return;
    setCurrentTransaction(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleRemoveFromHandover = (itemId: string) => {
    setHandoverItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleApplyToAll = () => {
    if (!applyAllUnit) {
      alert("Vui lòng chọn đơn vị sử dụng để áp dụng cho tất cả!");
      return;
    }

    // Cập nhật transaction với thông tin đơn vị
    handleUpdateTransaction("toUnitId", applyAllUnit);
    handleUpdateTransaction("toRoomId", applyAllRoom);

    alert(`Đã áp dụng cài đặt cho tất cả ${handoverItems.length} tài sản!`);
  };

  const handleSaveHandover = () => {
    if (!currentTransaction || !currentTransaction.toUnitId) {
      alert("Vui lòng chọn đơn vị sử dụng cho giao dịch bàn giao!");
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn bàn giao ${handoverItems.length} tài sản?`)) {
      // Cập nhật transaction status thành APPROVED
      const completedTransaction: AssetTransaction = {
        ...currentTransaction,
        status: TransactionStatus.APPROVED,
        approvedAt: new Date().toISOString(),
        approvedBy: "current-user", // Thay bằng user hiện tại
        items: handoverItems
      };

      onSuccess(completedTransaction);
    }
  };

  if (!currentTransaction) {
    return null;
  }

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
              className="mr-3 text-white border-white/30 hover:bg-white/10 hover:border-white/50 hover:text-white"
            >
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <div>
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="text-blue-100 text-sm mt-1">
                Điền đầy đủ thông tin để hoàn tất bàn giao {handoverItems.length} tài sản
              </p>
            </div>
          </div>
          <Button
            onClick={handleSaveHandover}
            className="bg-white text-blue-700 hover:bg-gray-100 font-semibold"
          >
            <Save className="h-4 w-4 mr-2" />
            Lưu bàn giao
          </Button>
        </div>
      </div>

      <div className="p-8">
        {/* Apply to All Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Áp dụng cho tất cả tài sản
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Thiết lập đơn vị và phòng cho tất cả {handoverItems.length} tài sản cùng lúc
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Apply All Unit */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="flex items-center">
                  <Building2 className="w-4 h-4 mr-2 text-blue-500" />
                  Đơn vị sử dụng
                  <span className="text-red-500 ml-1">*</span>
                </span>
              </label>
              <select
                value={applyAllUnit}
                onChange={(e) => {
                  setApplyAllUnit(e.target.value);
                  setApplyAllRoom("");
                }}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white"
              >
                <option value="">Chọn đơn vị sử dụng</option>
                {mockUnitsWithRooms.map(unit => (
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
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-md text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-white disabled:bg-gray-100"
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
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold disabled:opacity-50"
              >
                Áp dụng cho tất cả
              </Button>
            </div>
          </div>
        </div>

        {/* Handover List */}
        <div className="space-y-4">
          {handoverItems.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all group">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* Asset Info */}
                <div className="lg:col-span-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm">
                        <Package2 className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="text-sm font-bold text-gray-900">
                        {item.asset.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <span className="bg-gray-100 px-2 py-1 rounded font-mono mr-2">
                          {item.asset.ktCode}
                        </span>
                        <span className="bg-gray-100 px-2 py-1 rounded font-mono">
                          {item.asset.fixedCode}
                        </span>
                      </div>
                    </div>
                    <div className="ml-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFromHandover(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Handover Details */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Unit */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="flex items-center">
                        <Building2 className="w-4 h-4 mr-2 text-blue-500" />
                        Đơn vị sử dụng
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                    </label>
                    <select
                      value={currentTransaction?.toUnitId || ""}
                      onChange={(e) => {
                        handleUpdateTransaction("toUnitId", e.target.value);
                        handleUpdateTransaction("toRoomId", "");
                      }}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white"
                    >
                      <option value="">Chọn đơn vị sử dụng</option>
                      {mockUnitsWithRooms.map(unit => (
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
                      value={currentTransaction?.toRoomId || ""}
                      onChange={(e) => handleUpdateTransaction("toRoomId", e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-md text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-white disabled:bg-gray-100"
                      disabled={!currentTransaction?.toUnitId}
                    >
                      <option value="">
                        {currentTransaction?.toUnitId ? "Chọn phòng (tùy chọn)" : "Vui lòng chọn đơn vị trước"}
                      </option>
                      {getRoomsByUnitId(currentTransaction?.toUnitId || "").map(room => (
                        <option key={room.id} value={room.id}>
                          {room.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Note */}
                <div className="lg:col-span-12">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2 text-purple-500" />
                      Ghi chú
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ghi chú cho tài sản này..."
                    value={item.note || ""}
                    onChange={(e) => handleUpdateHandoverItem(item.id, "note", e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-md text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {handoverItems.length === 0 && (
          <div className="text-center py-12">
            <Package2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Không có tài sản nào
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Danh sách tài sản bàn giao trống
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
