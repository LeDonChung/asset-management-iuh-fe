"use client";

import React, { useState } from "react";
import {
  MapPin,
  FileText,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Asset, AssetStatus, AssetType } from "@/types/asset";

interface AssetDetailCardProps {
  asset: Asset;
}

const statusLabels = {
  [AssetStatus.IN_USE]: "Đang sử dụng",
  [AssetStatus.TRANSFERRED]: "Đã bàn giao",
  [AssetStatus.DAMAGED]: "Hư hỏng",
  [AssetStatus.LOST]: "Đã mất",
  [AssetStatus.PROPOSED_LIQUIDATION]: "Đề xuất thanh lý",
  [AssetStatus.LIQUIDATED]: "Đã thanh lý",
};

const statusColors = {
  [AssetStatus.IN_USE]: "bg-green-100 text-green-700 border-green-200",
  [AssetStatus.TRANSFERRED]: "bg-blue-100 text-blue-700 border-blue-200", 
  [AssetStatus.DAMAGED]: "bg-red-100 text-red-700 border-red-200",
  [AssetStatus.LOST]: "bg-gray-100 text-gray-700 border-gray-200",
  [AssetStatus.PROPOSED_LIQUIDATION]: "bg-orange-100 text-orange-700 border-orange-200",
  [AssetStatus.LIQUIDATED]: "bg-purple-100 text-purple-700 border-purple-200",
};

const typeLabels = {
  [AssetType.FIXED_ASSET]: "Tài sản cố định",
  [AssetType.TOOLS_EQUIPMENT]: "Công cụ dụng cụ",
};

export default function AssetDetailCard({ asset }: AssetDetailCardProps) {
  const [isSpecsExpanded, setIsSpecsExpanded] = useState(false);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div className="p-6">
      {/* Main Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900 pb-2 border-b">
            Thông tin cơ bản
          </h3>
          <div className="space-y-3">
            {/* Tên tài sản */}
            <div className="border rounded-lg p-4">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Tên tài sản</label>
              <p className="text-gray-900 font-semibold text-lg mt-1">{asset.name}</p>
            </div>

            {/* Mã và trạng thái */}
            <div className="grid grid-cols-2 gap-3">
              <div className="border rounded-lg p-3">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Mã tài sản</label>
                <p className="text-gray-900 font-mono mt-1">{asset.fixedCode}</p>
              </div>
              <div className="border rounded-lg p-3">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Mã kế toán</label>
                <p className="text-gray-900 font-mono mt-1">{asset.ktCode}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="border rounded-lg p-3">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Trạng thái</label>
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">
                    {statusLabels[asset.status]}
                  </Badge>
                </div>
              </div>
              <div className="border rounded-lg p-3">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Loại tài sản</label>
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">
                    {typeLabels[asset.type]}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Thông tin bổ sung */}
            <div className="grid grid-cols-2 gap-3">
              <div className="border rounded-lg p-3">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Đơn vị tính</label>
                <p className="text-gray-900 mt-1">{asset.unit}</p>
              </div>
              <div className="border rounded-lg p-3">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Số lượng</label>
                <p className="text-gray-900 mt-1">{asset.quantity}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="border rounded-lg p-3">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Danh mục</label>
                <p className="text-gray-900 mt-1">{asset.category?.name || "Không có thông tin"}</p>
              </div>
              <div className="border rounded-lg p-3">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Ngày nhập</label>
                <p className="text-gray-900 mt-1">{formatDate(asset.entrydate)}</p>
              </div>
            </div>

            <div className="border rounded-lg p-3">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">RFID Tag</label>
              <p className="text-gray-900 font-mono mt-1">
                {asset.rfidTag?.rfidId || "Chưa gắn RFID"}
              </p>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900 pb-2 border-b">
            Vị trí hiện tại
          </h3>
          {asset.currentRoom ? (
            <div className="space-y-3">
              {/* Tên phòng */}
              <div className="border rounded-lg p-4">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Tên phòng</label>
                <p className="text-gray-900 font-semibold text-lg mt-1">{asset.currentRoom.name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="border rounded-lg p-3">
                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Mã phòng</label>
                  <p className="text-gray-900 font-mono mt-1">{asset.currentRoom.roomCode}</p>
                </div>
                <div className="border rounded-lg p-3">
                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Tầng</label>
                  <p className="text-gray-900 mt-1">Tầng {asset.currentRoom.floor}</p>
                </div>
              </div>
              
              <div className="border rounded-lg p-3">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Đơn vị quản lý</label>
                <p className="text-gray-900 mt-1">{asset.currentRoom.unit?.name}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 border rounded-lg">
              <MapPin className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <h4 className="text-base font-medium text-gray-600 mb-1">Chưa được phân bổ</h4>
              <p className="text-sm text-gray-500">Tài sản này chưa được phân bổ đến vị trí cụ thể</p>
            </div>
          )}
        </div>
      </div>

      {/* Technical Specifications */}
      {asset.specs && (
        <div className="mt-6">
          <button
            onClick={() => setIsSpecsExpanded(!isSpecsExpanded)}
            className="w-full flex items-center justify-between text-base font-semibold text-gray-900 pb-2 border-b border-gray-200 hover:text-gray-700 transition-colors"
          >
            <div className="flex items-center">
              Thông số kỹ thuật
            </div>
            <div className={`transform transition-transform duration-200 ${isSpecsExpanded ? 'rotate-180' : ''}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          {isSpecsExpanded && (
            <div className="mt-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                {asset.specs}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
