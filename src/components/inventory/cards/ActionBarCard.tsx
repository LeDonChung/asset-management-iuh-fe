"use client";

import React from "react";
import { Save, Trash2 } from "lucide-react";
import { AssetType } from "@/types/asset";

interface ActionBarCardProps {
  selectedAssetType: AssetType;
  assetCount: number;
  countedAssets: number;
  roomCode: string;
  isViewingSubmittedResults: boolean;
  tempSaving: boolean;
  saving: boolean;
  submitResultLoading: boolean;
  onTempSave: () => void;
  onClearTempResults: () => void;
  onSaveResults: () => void;
}

export default function ActionBarCard({
  selectedAssetType,
  assetCount,
  countedAssets,
  roomCode,
  isViewingSubmittedResults,
  tempSaving,
  saving,
  submitResultLoading,
  onTempSave,
  onClearTempResults,
  onSaveResults,
}: ActionBarCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 md:px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-base md:text-lg font-semibold text-gray-900">
              <div
                className={`w-3 h-3 rounded-full ${
                  selectedAssetType === AssetType.FIXED_ASSET
                    ? "bg-blue-500"
                    : "bg-green-500"
                }`}
              ></div>
              {selectedAssetType === AssetType.FIXED_ASSET
                ? "Tài sản cố định"
                : "Công cụ dụng cụ"}
              : {assetCount} tài sản
            </div>
            <p className="text-sm md:text-base text-gray-600">
              Đã kiểm: {countedAssets} | Phòng: {roomCode}
            </p>
          </div>
          
          {isViewingSubmittedResults && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium border border-green-200">
              ✓ Đã hoàn thành
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {!isViewingSubmittedResults && (
        <div className="p-4 md:p-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 pb-2 border-b border-gray-200">
              Thao tác kiểm kê
            </h4>
            
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <button
                onClick={onTempSave}
                disabled={tempSaving || saving}
                className="flex items-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed justify-center sm:justify-start border border-gray-600 hover:border-gray-700"
              >
                <Save className="h-4 w-4" />
                <span>{tempSaving ? "Đang lưu tạm..." : "Lưu tạm thời"}</span>
              </button>
              
              <button
                onClick={onClearTempResults}
                disabled={tempSaving || saving}
                className="flex items-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed justify-center sm:justify-start border border-orange-600 hover:border-orange-700"
              >
                <Trash2 className="h-4 w-4" />
                <span>Xóa dữ liệu tạm</span>
              </button>
              
              <button
                onClick={onSaveResults}
                disabled={saving || tempSaving || submitResultLoading}
                className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed justify-center sm:justify-start border border-blue-600 hover:border-blue-700 shadow-md"
              >
                <Save className="h-4 w-4" />
                <span>{saving || submitResultLoading ? "Đang lưu kết quả..." : "Lưu kết quả cuối cùng"}</span>
              </button>
            </div>
            
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border">
              <p className="mb-1">
                <strong>Lưu tạm thời:</strong> Lưu tiến độ hiện tại, có thể tiếp tục sau (24h)
              </p>
              <p className="mb-1">
                <strong>Xóa dữ liệu tạm:</strong> Xóa toàn bộ dữ liệu kiểm kê tạm thời
              </p>
              <p>
                <strong>Lưu kết quả cuối cùng:</strong> Hoàn thành kiểm kê và gửi kết quả chính thức
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
