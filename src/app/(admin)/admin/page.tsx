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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package2 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {mockStats.totalAssets.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Tổng số tài sản</div>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              href="/admin/asset"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
            >
              Xem chi tiết
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {mockStats.activeAssets.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Đang sử dụng</div>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 font-medium">95.3%</span>
            <span className="text-sm text-gray-500 ml-2">tỷ lệ sử dụng</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {mockStats.pendingAssets.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Chờ phân bổ</div>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              href="/admin/asset?status=chờ_phân_bổ"
              className="text-sm text-yellow-600 hover:text-yellow-800 font-medium inline-flex items-center"
            >
              Xem danh sách
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {mockStats.brokenAssets.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Hư hỏng</div>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              href="/admin/asset?status=hư_hỏng"
              className="text-sm text-red-600 hover:text-red-800 font-medium inline-flex items-center"
            >
              Cần xử lý
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Hoạt động gần đây</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {mockStats.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {activityIcons[activity.type as keyof typeof activityIcons]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <div className="mt-1 flex items-center text-xs text-gray-500">
                      <span>{activity.user}</span>
                      <span className="mx-2">•</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link 
                href="/admin/asset"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Xem tất cả hoạt động →
              </Link>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Phân bố theo danh mục</h3>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {mockStats.categoryStats.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">
                      {category.name}
                    </div>
                    <div className="ml-2 text-sm text-gray-500">
                      ({category.count})
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600 w-10 text-right">
                      {category.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link 
                href="/admin/asset"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Xem báo cáo chi tiết →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Stats */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Tài sản theo vị trí</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {mockStats.locationStats.map((location, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {location.name}
                    </div>
                    {location.code && (
                      <div className="text-xs text-gray-500">
                        Mã: {location.code}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {location.count}
                    </div>
                    <div className="text-xs text-gray-500">tài sản</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Thao tác nhanh</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <Link 
                href="/admin/asset/create"
                className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-blue-900">Thêm tài sản</span>
              </Link>
              
              <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <Scan className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-purple-900">Quét RFID</span>
              </button>
              
              <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <ArrowRightLeft className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-green-900">Bàn giao</span>
              </button>
              
              <Link 
                href="/admin/asset"
                className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <BarChart3 className="h-8 w-8 text-gray-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Báo cáo</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-blue-900">Trạng thái hệ thống</h3>
            <p className="text-sm text-blue-700">
              Hệ thống hoạt động bình thường. Đã đồng bộ {mockStats.totalAssets} tài sản.
            </p>
          </div>
          <div className="flex-shrink-0">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Lần đồng bộ cuối:</span>
            <span className="ml-2 font-medium text-blue-900">
              {new Date().toLocaleString("vi-VN")}
            </span>
          </div>
          <div>
            <span className="text-blue-700">Tài sản có RFID:</span>
            <span className="ml-2 font-medium text-blue-900">
              {(mockStats.totalAssets * 0.78).toFixed(0)} ({Math.round((mockStats.totalAssets * 0.78 / mockStats.totalAssets) * 100)}%)
            </span>
          </div>
          <div>
            <span className="text-blue-700">Đang chờ xử lý:</span>
            <span className="ml-2 font-medium text-blue-900">{mockStats.pendingAssets} tài sản</span>
          </div>
        </div>
      </div>
    </div>
  );
}
