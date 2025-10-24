"use client";

import React from "react";
import { BarChart3 } from "lucide-react";

interface StatisticsCardProps {
  statistics: {
    total: number;
    counted: number;
    matched: number;
    missing: number;
    excess: number;
    liquidationProposed: number;
    needsRepair: number;
  };
}

export default function StatisticsCard({ statistics }: StatisticsCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 md:px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 rounded-lg p-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900">
              Thống kê kiểm kê
            </h3>
            <p className="text-sm text-gray-600 hidden sm:block">
              Kết quả và trạng thái kiểm kê chi tiết
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="text-center p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="text-emerald-600 text-lg md:text-xl font-bold">
              {statistics.matched}
            </div>
            <div className="text-xs text-gray-600 mt-1">Khớp</div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="text-orange-600 text-lg md:text-xl font-bold">
              {statistics.missing}
            </div>
            <div className="text-xs text-gray-600 mt-1">Thiếu</div>
          </div>
          
          <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-yellow-600 text-lg md:text-xl font-bold">
              {statistics.excess}
            </div>
            <div className="text-xs text-gray-600 mt-1">Thừa</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="text-purple-600 text-lg md:text-xl font-bold">
              {statistics.liquidationProposed}
            </div>
            <div className="text-xs text-gray-600 mt-1">Đề xuất thanh lý</div>
          </div>
          
          <div className="text-center p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="text-amber-700 text-lg md:text-xl font-bold">
              {statistics.needsRepair}
            </div>
            <div className="text-xs text-gray-600 mt-1">Cần sửa chữa</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-blue-600 text-lg md:text-xl font-bold">
              {statistics.counted}
            </div>
            <div className="text-xs text-gray-600 mt-1">Đã kiểm</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-gray-600 text-lg md:text-xl font-bold">
              {statistics.total}
            </div>
            <div className="text-xs text-gray-600 mt-1">Tổng</div>
          </div>
        </div>
      </div>
    </div>
  );
}
