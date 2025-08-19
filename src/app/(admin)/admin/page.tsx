"use client";

import React from "react";
import Link from "next/link";
import {
  Package2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  ArrowUpRight,
  Package,
  Scan,
  ArrowRightLeft,
  Plus,
} from "lucide-react";

// Mock data for dashboard
const mockStats = {
  totalAssets: 1247,
  activeAssets: 1189,
  pendingAssets: 38,
  brokenAssets: 20,
  recentActivities: [
    {
      id: "1",
      type: "create",
      message: "Thêm mới máy tính Dell Latitude 5520",
      user: "Lê Đôn Chủng",
      time: "2 phút trước",
    },
    {
      id: "2", 
      type: "rfid",
      message: "Gán RFID cho máy in Canon LBP6230",
      user: "Nguyễn Văn A",
      time: "15 phút trước",
    },
    {
      id: "3",
      type: "handover",
      message: "Bàn giao 5 tài sản về phòng quản trị",
      user: "Trần Thị B",
      time: "1 giờ trước",
    },
    {
      id: "4",
      type: "update",
      message: "Cập nhật thông tin bàn làm việc",
      user: "Lê Văn C",
      time: "2 giờ trước",
    },
  ],
  categoryStats: [
    { name: "Máy tính", count: 450, percentage: 36 },
    { name: "Thiết bị văn phóng", count: 320, percentage: 26 },
    { name: "Máy in", count: 180, percentage: 14 },
    { name: "Khác", count: 297, percentage: 24 },
  ],
  locationStats: [
    { name: "Phòng IT", count: 85, code: "1B01.09" },
    { name: "Phòng Kế toán", count: 42, code: "1B01.10" },
    { name: "Phòng Nhân sự", count: 38, code: "1B02.05" },
    { name: "Chưa phân bổ", count: 73, code: "" },
  ],
};

const activityIcons = {
  create: <Plus className="h-4 w-4 text-blue-500" />,
  rfid: <Scan className="h-4 w-4 text-purple-500" />,
  handover: <ArrowRightLeft className="h-4 w-4 text-green-500" />,
  update: <Package className="h-4 w-4 text-orange-500" />,
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Tổng quan hệ thống quản lý tài sản</p>
      </div>

    </div>
  );
}
