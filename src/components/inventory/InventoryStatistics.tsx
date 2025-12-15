"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { BarChart3, TrendingUp, Package } from "lucide-react";
import { InventoryStatistics as InventoryStatisticsType } from "@/lib/store/slices/inventorySlice";

interface InventoryStatisticsProps {
  statistics: InventoryStatisticsType | null;
  loading?: boolean;
}

const COLORS = {
  matched: '#10b981', // green
  missing: '#ef4444', // red
  excess: '#f59e0b', // yellow
  broken: '#dc2626', // red-dark
  needsRepair: '#f97316', // orange
  liquidationProposed: '#991b1b', // red-darker
  fixedAssets: '#3b82f6', // blue
  toolsEquipment: '#8b5cf6', // purple
  rfid: '#10b981', // green
  manual: '#6b7280', // gray
};

export const InventoryStatistics: React.FC<InventoryStatisticsProps> = ({ statistics, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Đang tải thống kê...</p>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="text-center py-16 text-gray-500">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p>Chưa có dữ liệu thống kê</p>
      </div>
    );
  }

  // Chuẩn bị dữ liệu cho biểu đồ trạng thái
  const statusData = [
    { name: 'Khớp', value: statistics.overallStatusStatistics.matched, color: COLORS.matched },
    { name: 'Thiếu', value: statistics.overallStatusStatistics.missing, color: COLORS.missing },
    { name: 'Thừa', value: statistics.overallStatusStatistics.excess, color: COLORS.excess },
    { name: 'Hỏng', value: statistics.overallStatusStatistics.broken, color: COLORS.broken },
    { name: 'Cần sửa', value: statistics.overallStatusStatistics.needsRepair, color: COLORS.needsRepair },
    { name: 'Đề xuất thanh lý', value: statistics.overallStatusStatistics.liquidationProposed, color: COLORS.liquidationProposed },
  ].filter(item => item.value > 0);

  // Chuẩn bị dữ liệu cho biểu đồ loại tài sản
  const assetTypeData = [
    { name: 'Tài sản cố định', value: statistics.overallAssetTypeStatistics.fixedAssets, color: COLORS.fixedAssets },
    { name: 'Công cụ dụng cụ', value: statistics.overallAssetTypeStatistics.toolsEquipment, color: COLORS.toolsEquipment },
  ].filter(item => item.value > 0);

  // Chuẩn bị dữ liệu cho biểu đồ phương pháp quét
  const scanMethodData = [
    { name: 'RFID', value: statistics.overallScanMethodStatistics.rfid, color: COLORS.rfid },
    { name: 'Thủ công', value: statistics.overallScanMethodStatistics.manual, color: COLORS.manual },
  ].filter(item => item.value > 0);

  // Chuẩn bị dữ liệu cho biểu đồ cột theo level (nếu có)
  const levelBarData = statistics.levelStatistics.map(item => ({
    name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
    fullName: item.name,
    'Khớp': item.statusStatistics.matched,
    'Thiếu': item.statusStatistics.missing,
    'Thừa': item.statusStatistics.excess,
    'Hỏng': item.statusStatistics.broken,
    'Cần sửa': item.statusStatistics.needsRepair,
    'Đề xuất thanh lý': item.statusStatistics.liquidationProposed,
    total: item.totalAssets,
  }));

  return (
    <div className="space-y-6">
      {/* Biểu đồ trạng thái */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Phân bố theo trạng thái
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">Không có dữ liệu</div>
            )}
          </CardContent>
        </Card>

        {/* Biểu đồ loại tài sản */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              Phân bố theo loại tài sản
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assetTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={assetTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {assetTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">Không có dữ liệu</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Biểu đồ phương pháp quét */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Phân bố theo phương pháp quét
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scanMethodData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scanMethodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8">
                  {scanMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">Không có dữ liệu</div>
          )}
        </CardContent>
      </Card>

      {/* Biểu đồ cột theo level (nếu có) */}
      {statistics.levelStatistics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              Thống kê chi tiết theo {statistics.level === 'ROOM' ? 'phòng' : 
                                      statistics.level === 'ASSIGNMENT' ? 'phân công' :
                                      statistics.level === 'GROUP' ? 'nhóm' :
                                      statistics.level === 'SESSION_UNIT' ? 'cơ sở' : 'đơn vị'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={levelBarData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Khớp" stackId="a" fill={COLORS.matched} />
                <Bar dataKey="Thiếu" stackId="a" fill={COLORS.missing} />
                <Bar dataKey="Thừa" stackId="a" fill={COLORS.excess} />
                <Bar dataKey="Hỏng" stackId="a" fill={COLORS.broken} />
                <Bar dataKey="Cần sửa" stackId="a" fill={COLORS.needsRepair} />
                <Bar dataKey="Đề xuất thanh lý" stackId="a" fill={COLORS.liquidationProposed} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

