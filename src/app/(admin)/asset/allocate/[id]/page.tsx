"use client";

import React from "react";
import {
  Package2,
  Calendar,
  Building2,
  MapPin,
  User,
  ArrowLeft,
  FileText,
  Info,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Asset,
  AssetType,
} from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

// Mock data cho chi tiết phân bổ (tương tự như trong history)
const mockAllocationDetail = {
  id: "ALLOC-HIST-001",
  assetId: "LAPTOP-001",
  asset: {
    id: "LAPTOP-001",
    ktCode: "25-0001/KT", 
    fixedCode: "2141.00001",
    name: "Laptop Dell Latitude 5530",
    specs: "Intel Core i7-1250U, 16GB DDR4 RAM, 512GB NVMe SSD, 15.6\" FHD, Windows 11 Pro",
    entryDate: "2025-07-20",
    unit: "Chiếc",
    quantity: 8,
    purchasePackage: 1,
    type: AssetType.TSCD,
    isLocked: false,
    isHandOver: false,
    categoryId: "2141",
    status: "DANG_SU_DUNG" as any,
    createdBy: "nguyen.minh",
    createdAt: "2025-07-20T08:00:00Z",
    updatedAt: "2025-08-15T09:30:00Z",
    category: { id: "2141", name: "Máy tính xách tay", code: "2141" }
  },
  allocatedQuantity: 2,
  unitId: "CNTT",
  unitName: "Khoa Công nghệ Thông tin",
  roomId: "CNTT-101",
  roomName: "Phòng thí nghiệm máy tính 1",
  allocatedBy: "Trần Thị Hà",
  allocatedAt: "2025-08-18T10:30:00Z",
  note: "Phân bổ cho phòng thí nghiệm CNTT - sử dụng cho sinh viên thực hành lập trình",
  status: "active",
  // Thông tin bổ sung
  approvedBy: "Nguyễn Văn Minh",
  approvedAt: "2025-08-18T09:15:00Z",
  receivedBy: "Lê Văn Thành",
  receivedAt: "2025-08-18T14:20:00Z",
  installationDate: "2025-08-19T08:00:00Z",
  warrantyExpiry: "2025-07-20", // 1 năm từ ngày nhập
  condition: "Tốt",
  maintenanceSchedule: "3 tháng/lần"
};

const typeLabels = {
  [AssetType.TSCD]: "Tài sản cố định",
  [AssetType.CCDC]: "Công cụ dụng cụ",
};

export default function AllocationDetailPage() {
  const params = useParams();
  const allocationId = params.id as string;

  // Trong thực tế sẽ fetch data dựa trên ID
  const allocation = mockAllocationDetail;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chi tiết phân bổ tài sản</h1>
          <p className="text-gray-600">
            Thông tin chi tiết về phân bổ #{allocationId}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/asset/allocate/history">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại lịch sử
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Package2 className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold">Thông tin tài sản</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Tên tài sản</label>
                <p className="mt-1 text-sm text-gray-900">{allocation.asset.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Mã kế toán</label>
                <p className="mt-1 text-sm text-gray-900">{allocation.asset.ktCode}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Mã định mức</label>
                <p className="mt-1 text-sm text-gray-900">{allocation.asset.fixedCode}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Loại tài sản</label>
                <div className="mt-1">
                  <Badge className="bg-purple-100 text-purple-800">
                    {typeLabels[allocation.asset.type as keyof typeof typeLabels]}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Danh mục</label>
                <p className="mt-1 text-sm text-gray-900">{allocation.asset.category?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Ngày nhập</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(allocation.asset.entryDate).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-500">Thông số kỹ thuật</label>
              <p className="mt-1 text-sm text-gray-900">{allocation.asset.specs}</p>
            </div>
          </Card>

          {/* Allocation Information */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Building2 className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold">Thông tin phân bổ</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Đơn vị sử dụng</label>
                <div className="mt-1 flex items-center">
                  <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-900">{allocation.unitName}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phòng sử dụng</label>
                <div className="mt-1 flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-900">{allocation.roomName}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Số lượng phân bổ</label>
                <p className="mt-1 text-sm text-gray-900">
                  {allocation.allocatedQuantity} {allocation.asset.unit}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tình trạng</label>
                <p className="mt-1 text-sm text-gray-900">{allocation.condition}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Ngày cài đặt</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(allocation.installationDate).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Hết bảo hành</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(allocation.warrantyExpiry).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-500">Ghi chú</label>
              <p className="mt-1 text-sm text-gray-900">{allocation.note}</p>
            </div>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Info className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold">Trạng thái</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <Badge className="bg-green-100 text-green-800">
                  Đang sử dụng
                </Badge>
              </div>
              <div className="text-sm text-gray-600">
                Tài sản đang được sử dụng bình thường tại vị trí được phân bổ
              </div>
            </div>
          </Card>

          {/* Timeline Card */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold">Dòng thời gian</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Đã tiếp nhận</p>
                  <p className="text-sm text-gray-500">
                    {new Date(allocation.receivedAt).toLocaleString("vi-VN")}
                  </p>
                  <p className="text-sm text-gray-500">
                    Người tiếp nhận: {allocation.receivedBy}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Đã phê duyệt</p>
                  <p className="text-sm text-gray-500">
                    {new Date(allocation.approvedAt).toLocaleString("vi-VN")}
                  </p>
                  <p className="text-sm text-gray-500">
                    Người phê duyệt: {allocation.approvedBy}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Đã phân bổ</p>
                  <p className="text-sm text-gray-500">
                    {new Date(allocation.allocatedAt).toLocaleString("vi-VN")}
                  </p>
                  <p className="text-sm text-gray-500">
                    Người phân bổ: {allocation.allocatedBy}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Maintenance Card */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold">Bảo trì</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Chu kỳ bảo trì</label>
                <p className="text-sm text-gray-900">{allocation.maintenanceSchedule}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Bảo trì tiếp theo</label>
                <p className="text-sm text-gray-900">15/11/2025</p>
              </div>
              <Button size="sm" variant="outline" className="w-full">
                Lập lịch bảo trì
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
