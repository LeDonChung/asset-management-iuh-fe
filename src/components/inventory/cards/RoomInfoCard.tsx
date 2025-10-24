"use client";

import React from "react";
import { Home } from "lucide-react";
import { Room } from "@/types/asset";

interface RoomInfoCardProps {
  room: Room;
}

export default function RoomInfoCard({ room }: RoomInfoCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 md:px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 rounded-lg p-2">
            <Home className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900">
              Thông tin phòng kiểm kê
            </h3>
            <p className="text-sm text-gray-600 hidden sm:block">
              Chi tiết phòng đang kiểm kê
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tên phòng */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Tên phòng
            </label>
            <p className="text-gray-900 font-semibold text-lg mt-1">
              {room.name}
            </p>
          </div>

          {/* Mã phòng */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Mã phòng
            </label>
            <p className="text-gray-900 font-mono mt-1">
              {room.roomCode}
            </p>
          </div>

          {/* Tầng */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Tầng
            </label>
            <p className="text-gray-900 mt-1">
              Tầng {room.floor}
            </p>
          </div>

          {/* Tòa nhà */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Tòa nhà
            </label>
            <p className="text-gray-900 mt-1">
              {room.building || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
