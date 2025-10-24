"use client";

import React from "react";
import { Settings, Wrench } from "lucide-react";
import { AssetType } from "@/types/asset";

interface AssetTypeCardProps {
  selectedAssetType: AssetType;
  onAssetTypeChange: (type: AssetType) => void;
  fixedAssetCount: number;
  toolsEquipmentCount: number;
}

export default function AssetTypeCard({
  selectedAssetType,
  onAssetTypeChange,
  fixedAssetCount,
  toolsEquipmentCount,
}: AssetTypeCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 md:px-6 py-4 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-900">
          Loại tài sản
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Chọn loại tài sản để kiểm kê
        </p>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tài sản cố định */}
          <button
            onClick={() => onAssetTypeChange(AssetType.FIXED_ASSET)}
            className={`text-left rounded-lg p-4 border-2 transition-all duration-200 ${
              selectedAssetType === AssetType.FIXED_ASSET
                ? "border-blue-300 bg-blue-50 shadow-md"
                : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                selectedAssetType === AssetType.FIXED_ASSET
                  ? "bg-blue-100"
                  : "bg-gray-100"
              }`}>
                <Settings className={`h-5 w-5 ${
                  selectedAssetType === AssetType.FIXED_ASSET
                    ? "text-blue-600"
                    : "text-gray-600"
                }`} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-base">
                  Tài sản cố định
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {fixedAssetCount} tài sản
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Máy móc, thiết bị, nội thất
                </div>
              </div>
              {selectedAssetType === AssetType.FIXED_ASSET && (
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              )}
            </div>
          </button>

          {/* Công cụ dụng cụ */}
          <button
            onClick={() => onAssetTypeChange(AssetType.TOOLS_EQUIPMENT)}
            className={`text-left rounded-lg p-4 border-2 transition-all duration-200 ${
              selectedAssetType === AssetType.TOOLS_EQUIPMENT
                ? "border-green-300 bg-green-50 shadow-md"
                : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                selectedAssetType === AssetType.TOOLS_EQUIPMENT
                  ? "bg-green-100"
                  : "bg-gray-100"
              }`}>
                <Wrench className={`h-5 w-5 ${
                  selectedAssetType === AssetType.TOOLS_EQUIPMENT
                    ? "text-green-600"
                    : "text-gray-600"
                }`} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-base">
                  Công cụ dụng cụ
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {toolsEquipmentCount} tài sản
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Dụng cụ, đồ dùng văn phòng
                </div>
              </div>
              {selectedAssetType === AssetType.TOOLS_EQUIPMENT && (
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
