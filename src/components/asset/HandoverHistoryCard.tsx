"use client";

import React from "react";
import {
  History,
  ArrowRight,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TransactionItemAssetResponseDto } from "@/types/asset";

interface HandoverHistoryCardProps {
  transactionItems: TransactionItemAssetResponseDto[];
}

export default function HandoverHistoryCard({ transactionItems }: HandoverHistoryCardProps) {
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatLocation = (unit: any, room: any) => {
    if (!room) return unit?.name || "Không xác định";
    return `${room.name} (${room.roomCode}) - ${unit?.name || ""}`;
  };

  if (!transactionItems || transactionItems.length === 0) {
    return (
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <History className="w-5 h-5 text-gray-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Lịch sử bàn giao</h2>
              <p className="text-sm text-gray-500">Theo dõi các lần di chuyển tài sản</p>
            </div>
          </div>
        </div>
        
        <div className="text-center py-12 border rounded-lg">
          <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base font-medium text-gray-600 mb-2">
            Chưa có lịch sử bàn giao
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Tài sản này chưa có lịch sử bàn giao nào được ghi nhận.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Lịch sử di chuyển</h2>
            <p className="text-sm text-gray-500">Theo dõi các lần di chuyển tài sản</p>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="relative">
        {transactionItems.map((item, index) => (
            <div key={item.id} className="relative">
              {/* Timeline connection line */}
              {index < transactionItems.length - 1 && (
                <div className="absolute left-4 top-16 w-0.5 h-20 bg-gray-300"></div>
              )}

              {/* Timeline item */}
              <div className="flex items-start space-x-4 pb-8">
                {/* Timeline indicator */}
                <div className="flex-shrink-0 relative">
                  <div className="w-8 h-8 border rounded-full flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 text-gray-600" />
                  </div>
                </div>

                {/* Content card */}
                <div className="flex-1 min-w-0">
                  <div className="border rounded-lg overflow-hidden">
                    {/* Item header */}
                    <div className="px-4 py-3 border-b">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900">Bàn giao tài sản</span>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Transfer details */}
                    <div className="p-4">
                      {/* Transfer flow */}
                      <div className="mb-4">
                        <div className="flex items-center space-x-3">
                          {/* From location */}
                          <div className="flex-1 space-y-2">
                            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                              Từ vị trí
                            </div>
                            <div className="border rounded-lg p-3">
                              <div className="text-sm font-medium text-gray-900">
                                {formatLocation(item.fromUnit, item.fromRoom)}
                              </div>
                              {item.fromRoom && (
                                <div className="text-xs text-gray-500 mt-1 font-mono">
                                  {item.fromRoom.roomCode}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Arrow */}
                          <div className="flex-shrink-0 pt-6">
                            <ArrowRight className="w-5 h-5 text-gray-500" />
                          </div>

                          {/* To location */}
                          <div className="flex-1 space-y-2">
                            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                              Đến vị trí
                            </div>
                            <div className="border rounded-lg p-3">
                              <div className="text-sm font-medium text-gray-900">
                                {formatLocation(item.toUnit, item.toRoom)}
                              </div>
                              {item.toRoom && (
                                <div className="text-xs text-gray-500 mt-1 font-mono">
                                  {item.toRoom.roomCode}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Note */}
                      {item.note && (
                        <div className="mb-4">
                          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                            Ghi chú
                          </div>
                          <div className="border rounded-lg p-3">
                            <p className="text-sm text-gray-700">{item.note}</p>
                          </div>
                        </div>
                      )}

                      {/* Footer info */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        
                        <span className="text-xs text-gray-600">
                          {item.fromUnit?.name !== item.toUnit?.name 
                            ? `Chuyển đơn vị: ${item.fromUnit?.name} → ${item.toUnit?.name}`
                            : "Di chuyển nội bộ"
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        ))}
      </div>

      {/* Summary footer */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {transactionItems.length > 0 && (
              <span className="text-xs text-gray-500 border px-3 py-1 rounded">
                Gần nhất: {formatDate(transactionItems[0].createdAt)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
