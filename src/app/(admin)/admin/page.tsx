"use client";

import React, { useEffect } from "react";
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
  Wrench,
  XCircle,
  FileX,
  HelpCircle,
  Building2,
  ShoppingCart,
  Loader2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchDashboardStats } from "@/lib/store/slices/dashboardSlice";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

// Map activity types to icons and colors
const activityConfig = {
  create: { icon: Plus, color: "text-blue-500", bg: "bg-blue-50" },
  update: { icon: Package, color: "text-orange-500", bg: "bg-orange-50" },
  transaction: { icon: ArrowRightLeft, color: "text-green-500", bg: "bg-green-50" },
  movement: { icon: Scan, color: "text-purple-500", bg: "bg-purple-50" },
  liquidation: { icon: FileX, color: "text-red-500", bg: "bg-red-50" },
  inventory: { icon: BarChart3, color: "text-indigo-500", bg: "bg-indigo-50" },
};

// Map asset status to Vietnamese labels
const statusLabels: Record<string, string> = {
  IN_USE: "Đang sử dụng",
  DAMAGED: "Hư hỏng",
  LOST: "Đã mất",
  PROPOSED_LIQUIDATION: "Đề xuất thanh lý",
  LIQUIDATED: "Đã thanh lý",
  UNIDENTIFIED: "Chưa định danh",
};

// Map asset type to Vietnamese labels
const typeLabels: Record<string, string> = {
  FIXED_ASSET: "Tài sản cố định",
  TOOLS_EQUIPMENT: "Công cụ dụng cụ",
};

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { stats, loading, error } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold mb-2">Không thể tải dữ liệu dashboard</p>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => dispatch(fetchDashboardStats())}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Assets */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng số tài sản</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalAssets.toLocaleString()}</p>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="text-blue-600">TSCD: {stats.fixedAssets}</span>
                <span className="text-gray-400">|</span>
                <span className="text-green-600">CCDC: {stats.toolsEquipment}</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Package2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* In Use Assets */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đang sử dụng</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.inUseAssets.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-2">
                {stats.totalAssets > 0 
                  ? `${Math.round((stats.inUseAssets / stats.totalAssets) * 100)}% tổng tài sản`
                  : "0% tổng tài sản"
                }
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Damaged Assets */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hư hỏng / Mất</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {(stats.damagedAssets + stats.lostAssets).toLocaleString()}
              </p>
              <div className="flex items-center gap-2 text-xs mt-2">
                <span className="text-orange-600">Hỏng: {stats.damagedAssets}</span>
                <span className="text-red-600">Mất: {stats.lostAssets}</span>
              </div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Unidentified Assets */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Chưa định danh</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.unidentifiedAssets.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-2">
                Cần cập nhật thông tin
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <HelpCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Transaction & Movement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Transactions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-50 rounded-lg">
              <ArrowRightLeft className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Giao dịch đang chờ</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingTransactions}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Đã duyệt: {stats.approvedTransactions}</span>
            <span>Hoàn thành: {stats.completedTransactions}</span>
          </div>
        </div>

        {/* Pending Movements */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Scan className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Di chuyển đang chờ</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingMovements}</p>
            </div>
          </div>
          <div className="text-xs text-gray-600">
            <span>Đã hoàn thành: {stats.completedMovements}</span>
          </div>
        </div>

        {/* Liquidation Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-50 rounded-lg">
              <FileX className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Đề xuất thanh lý</p>
              <p className="text-2xl font-bold text-gray-900">{stats.proposedLiquidationAssets}</p>
            </div>
          </div>
          <div className="text-xs text-gray-600">
            <span>Đã thanh lý: {stats.liquidatedAssets}</span>
          </div>
        </div>
      </div>

      {/* Charts - Assets by Status with Bar Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Phân bố tài sản theo trạng thái
        </h3>
        <div className="space-y-3">
          {stats.assetsByStatus.map((item, index) => {
            const colors = [
              { bar: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50' },
              { bar: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50' },
              { bar: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50' },
              { bar: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' },
              { bar: 'bg-purple-500', text: 'text-purple-700', bg: 'bg-purple-50' },
              { bar: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50' },
            ];
            const color = colors[index % colors.length];
            
            return (
              <div key={item.status} className={`p-4 rounded-lg ${color.bg} hover:shadow-md transition-shadow`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${color.bar}`}></div>
                    <span className={`text-sm font-medium ${color.text}`}>
                      {statusLabels[item.status] || item.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">{item.count.toLocaleString()}</span>
                    <span className="text-sm text-gray-600 ml-2">({item.percentage}%)</span>
                  </div>
                </div>
                <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`${color.bar} h-3 rounded-full transition-all duration-500 ease-out shadow-sm`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Assets by Category with Horizontal Bar Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Package className="h-5 w-5 text-green-600" />
          Top 10 danh mục tài sản
        </h3>
        <div className="space-y-3">
          {stats.assetsByCategory.slice(0, 10).map((item, index) => (
            <div key={item.categoryId} className="group">
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">#{index + 1}</span>
                </div>
                
                {/* Category Name & Bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 truncate">{item.categoryName}</span>
                    <span className="text-sm font-semibold text-green-600 ml-2">
                      {item.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="relative w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full transition-all duration-700 ease-out group-hover:from-green-500 group-hover:to-green-700"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Percentage Badge */}
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unit Statistics and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unit Statistics with Advanced Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-600" />
            Thống kê theo đơn vị
          </h3>
          <div className="space-y-4">
            {stats.unitStatistics.map((unit, index) => (
              <div
                key={unit.unitId}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-indigo-300 transition-all duration-200"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                      <span className="text-sm font-bold text-white">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{unit.unitName}</p>
                      <p className="text-xs text-gray-500">Mã: {unit.unitCode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-indigo-600">{unit.totalAssets}</p>
                    <p className="text-xs text-gray-500">tài sản</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-blue-50 rounded-md p-2">
                    <p className="text-xs text-blue-600 font-medium">TSCD</p>
                    <p className="text-lg font-bold text-blue-700">{unit.fixedAssets}</p>
                  </div>
                  <div className="bg-green-50 rounded-md p-2">
                    <p className="text-xs text-green-600 font-medium">CCDC</p>
                    <p className="text-lg font-bold text-green-700">{unit.toolsEquipment}</p>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Đang sử dụng</span>
                      <span className="text-xs font-semibold text-green-600">{unit.inUseAssets}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${unit.totalAssets > 0 ? (unit.inUseAssets / unit.totalAssets) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Hư hỏng</span>
                      <span className="text-xs font-semibold text-red-600">{unit.damagedAssets}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-red-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${unit.totalAssets > 0 ? (unit.damagedAssets / unit.totalAssets) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {stats.unitStatistics.length === 0 && (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Chưa có dữ liệu đơn vị</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Hoạt động gần đây
          </h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {stats.recentActivities.map((activity) => {
              const config = activityConfig[activity.type as keyof typeof activityConfig] || activityConfig.create;
              const Icon = config.icon;
              
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className={`p-2 ${config.bg} rounded-lg`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{activity.userName}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {stats.recentActivities.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">Chưa có hoạt động nào</p>
            )}
          </div>
        </div>
      </div>

      {/* Asset Type Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân bố loại tài sản</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.assetsByType.map((item) => (
            <div key={item.type} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">{typeLabels[item.type] || item.type}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{item.count.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">{item.percentage}%</p>
                <p className="text-xs text-gray-500 mt-1">của tổng số</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
