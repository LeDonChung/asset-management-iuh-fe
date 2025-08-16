"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Package2,
  Calendar,
  MapPin,
  User,
  Clock,
  ArrowRightLeft,
  Scan,
  FileText,
  Building,
  Hash,
} from "lucide-react";
import Link from "next/link";
import { Asset, AssetLog, AssetStatus, AssetType, RoomStatus, UnitType, UnitStatus } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data cho asset detail
const mockAssetDetail: Asset = {
  id: "1",
  ktCode: "24-0001/01",
  fixedCode: "4001.00001",
  name: "Máy tính Dell Latitude 5520",
  specs: "Intel Core i5-1135G7, 8GB RAM, 256GB SSD, Windows 11 Pro",
  entryDate: "2024-01-15",
  plannedRoomId: "1",
  unit: "Cái",
  quantity: 1,
  origin: "Dell Việt Nam",
  purchasePackage: 1,
  type: AssetType.TSCD,
  isLocked: false,
  categoryId: "4",
  status: AssetStatus.CHO_PHAN_BO,
  createdBy: "user1",
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-15T10:00:00Z",
  category: { id: "4", name: "Máy tính", code: "4" },
  room: { 
    id: "1", 
    building: "B", 
    floor: "1", 
    roomNumber: "Phòng IT 09", 
    status: RoomStatus.ACTIVE, 
    unitId: "unit1",
    unit: { 
      id: "unit1", 
      name: "Khoa Công nghệ thông tin", 
      type: UnitType.DON_VI_SU_DUNG, 
      status: UnitStatus.ACTIVE,
      representativeId: "user1",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    }
  },
  rfidTag: { rfidId: "E280F3362000F00005E66021", assetId: "1", assignedDate: "2024-01-16" }
};

// Mock data cho asset logs
const mockAssetLogs: AssetLog[] = [
  {
    id: "1",
    assetId: "1",
    action: "Tạo mới tài sản",
    reason: "Nhập kho tài sản mới",
    status: AssetStatus.CHO_PHAN_BO,
    createdBy: "Lê Đôn Chủng",
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    id: "2",
    assetId: "1",
    action: "Cập nhật RFID",
    reason: "Gán thẻ RFID cho tài sản",
    status: AssetStatus.CHO_PHAN_BO,
    createdBy: "Nguyễn Văn A",
    createdAt: "2024-01-16T14:30:00Z"
  },
  {
    id: "3",
    assetId: "1",
    action: "Cập nhật thông tin",
    reason: "Cập nhật thông số kỹ thuật",
    status: AssetStatus.CHO_PHAN_BO,
    createdBy: "Lê Đôn Chủng",
    createdAt: "2024-01-17T09:15:00Z"
  }
];

const statusColors = {
  [AssetStatus.CHO_PHAN_BO]: "bg-yellow-100 text-yellow-800",
  [AssetStatus.DANG_SU_DUNG]: "bg-green-100 text-green-800", 
  [AssetStatus.BAO_TRI]: "bg-blue-100 text-blue-800",
  [AssetStatus.HU_HONG]: "bg-red-100 text-red-800",
  [AssetStatus.DE_XUAT_THANH_LY]: "bg-orange-100 text-orange-800",
  [AssetStatus.THANH_LY]: "bg-amber-100 text-amber-800",
  [AssetStatus.DA_THANH_LY]: "bg-gray-100 text-gray-800",
};

const statusLabels = {
  [AssetStatus.CHO_PHAN_BO]: "Chờ phân bổ",
  [AssetStatus.DANG_SU_DUNG]: "Đang sử dụng",
  [AssetStatus.BAO_TRI]: "Bảo trì",
  [AssetStatus.HU_HONG]: "Hư hỏng", 
  [AssetStatus.DE_XUAT_THANH_LY]: "Đề xuất thanh lý",
  [AssetStatus.THANH_LY]: "Thanh lý",
  [AssetStatus.DA_THANH_LY]: "Đã thanh lý",
};

const typeLabels = {
  [AssetType.TSCD]: "Tài sản cố định",
  [AssetType.CCDC]: "Công cụ dụng cụ",
};

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [logs, setLogs] = useState<AssetLog[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock API call
    const fetchAssetDetail = async () => {
      setIsLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In real app, fetch data based on params.id
        setAsset(mockAssetDetail);
        setLogs(mockAssetLogs);
      } catch (error) {
        console.error("Error fetching asset detail:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssetDetail();
  }, [params.id]);

  const handleDeleteAsset = async () => {
    if (!asset) return;
    
    if (confirm("Bạn có chắc chắn muốn xóa tài sản này?")) {
      try {
        // Mock API call
        console.log("Deleting asset:", asset.id);
        router.push("/asset");
      } catch (error) {
        console.error("Error deleting asset:", error);
        alert("Có lỗi xảy ra khi xóa tài sản");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2">
              <Skeleton className="h-5 w-5" />
            </div>
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        
        <Skeleton className="h-16 w-full" />
        
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <div className="-mb-px flex space-x-8 px-6">
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-10 w-36" />
            </div>
          </div>
          <div className="p-6">
            <Skeleton className="h-5 w-40 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-6 w-36" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="text-center py-12">
        <Package2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy tài sản</h3>
        <p className="mt-1 text-sm text-gray-500">Tài sản không tồn tại hoặc đã bị xóa.</p>
        <div className="mt-6">
          <Link href="/asset">
            <Button className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/asset"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{asset.name}</h1>
            <p className="text-gray-600">Chi tiết thông tin tài sản</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {!asset.isLocked && (
            <>
              <Link href={`/asset/${asset.id}/edit`}>
                <Button 
                  className="flex items-center"
                  variant="outline"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </Button>
              </Link>
              <Button
                onClick={handleDeleteAsset}
                variant="destructive"
                className="flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa
              </Button>
            </>
          )}
          <Link href={`/asset/${asset.id}/rfid`}>
            <Button 
              className="flex items-center bg-purple-600 hover:bg-purple-700"
            >
              <Scan className="h-4 w-4 mr-2" />
              Quét RFID
            </Button>
          </Link>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`p-4 rounded-lg border-l-4 ${
        asset.isLocked 
          ? "bg-orange-50 border-orange-400" 
          : "bg-blue-50 border-blue-400"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Badge 
              className={statusColors[asset.status]}
            >
              {statusLabels[asset.status]}
            </Badge>
            {asset.isLocked && (
              <span className="text-sm text-orange-700">🔒 Đã bàn giao - Không thể chỉnh sửa</span>
            )}
          </div>
          {!asset.isLocked && asset.status === AssetStatus.CHO_PHAN_BO && (
            <Button
              size="sm" 
              className="flex items-center"
            >
              <ArrowRightLeft className="h-4 w-4 mr-1" />
              Bàn giao
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Package2 className="h-4 w-4 mr-2" />
                Thông tin tài sản
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Lịch sử di chuyển
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'info' && (
            <div className="space-y-8">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin cơ bản</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Mã kế toán</label>
                    <div className="text-sm text-gray-900 font-mono">{asset.ktCode}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Mã tài sản cố định</label>
                    <div className="text-sm text-gray-900 font-mono">{asset.fixedCode}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Loại tài sản</label>
                    <div className="text-sm text-gray-900">{typeLabels[asset.type]}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Danh mục</label>
                    <div className="text-sm text-gray-900">{asset.category?.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Ngày nhập</label>
                    <div className="text-sm text-gray-900">
                      {new Date(asset.entryDate).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Đơn vị tính</label>
                    <div className="text-sm text-gray-900">{asset.unit}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Số lượng</label>
                    <div className="text-sm text-gray-900">{asset.quantity}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Xuất xứ</label>
                    <div className="text-sm text-gray-900">{asset.origin || "Không có thông tin"}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Gói mua</label>
                    <div className="text-sm text-gray-900">{asset.purchasePackage.toString().padStart(2, '0')}</div>
                  </div>
                </div>
              </div>

              {/* Location Info */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin vị trí</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {asset.room ? (
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{asset.room.roomNumber}</div>
                        <div className="text-sm text-gray-500">
                          Tòa {asset.room.building} | Tầng {asset.room.floor}
                        </div>
                        <div className="text-sm text-gray-500">Đơn vị: {asset.room.unit?.name || "Không có thông tin"}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="text-sm text-gray-500">Chưa phân bổ vị trí</div>
                    </div>
                  )}
                </div>
              </div>

              {/* RFID Info */}
              {asset.rfidTag && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin RFID</h3>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Scan className="h-4 w-4 text-purple-600" />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">ID thẻ RFID</div>
                        <div className="text-sm font-mono text-purple-700">{asset.rfidTag.rfidId}</div>
                        <div className="text-xs text-gray-500">
                          Ngày gán: {new Date(asset.rfidTag.assignedDate).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Technical Specs */}
              {asset.specs && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Thông số kỹ thuật</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-line">{asset.specs}</p>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin hệ thống</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Ngày tạo</label>
                    <div className="text-sm text-gray-900">
                      {new Date(asset.createdAt).toLocaleString("vi-VN")}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Cập nhật lần cuối</label>
                    <div className="text-sm text-gray-900">
                      {new Date(asset.updatedAt).toLocaleString("vi-VN")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-6">Lịch sử di chuyển và thay đổi</h3>
              <div className="flow-root">
                <ul className="-mb-8">
                  {logs.map((log, index) => (
                    <li key={log.id}>
                      <div className="relative pb-8">
                        {index !== logs.length - 1 && (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                              <Clock className="h-4 w-4 text-white" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-900">
                                <span className="font-medium">{log.action}</span>
                              </p>
                              <p className="text-sm text-gray-500">{log.reason}</p>
                              {log.fromLocation && log.toLocation && (
                                <p className="text-sm text-gray-500">
                                  <ArrowRightLeft className="h-3 w-3 inline mr-1" />
                                  {log.fromLocation} → {log.toLocation}
                                </p>
                              )}
                              <div className="mt-1">
                                <Badge 
                                  className={statusColors[log.status]}
                                >
                                  {statusLabels[log.status]}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <div>{new Date(log.createdAt).toLocaleDateString("vi-VN")}</div>
                              <div>{new Date(log.createdAt).toLocaleTimeString("vi-VN")}</div>
                              <div className="flex items-center mt-1">
                                <User className="h-3 w-3 mr-1" />
                                {log.createdBy}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              {logs.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có lịch sử</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Chưa có hoạt động nào được ghi nhận cho tài sản này.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}