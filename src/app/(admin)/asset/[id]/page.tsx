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
import { mockAssets, mockUsers, mockRooms, mockUnits, MockDataHelper } from "@/lib/mockData";

// Mock data cho lịch sử di chuyển
const mockAssetLogs = [
  {
    id: "log-1",
    assetId: "asset-001",
    action: "Bàn giao tài sản",
    reason: "Bàn giao cho phòng IT theo kế hoạch",
    fromLocation: "Kho trung tâm",
    toLocation: "Phòng IT - Tầng 3",
    status: "COMPLETED",
    createdBy: "Nguyễn Văn A",
    createdAt: new Date("2024-01-15T09:30:00").toISOString()
  },
  {
    id: "log-2",
    assetId: "asset-001",
    action: "Chuyển đổi vị trí",
    reason: "Chuyển từ phòng IT sang phòng Kế toán",
    fromLocation: "Phòng IT - Tầng 3",
    toLocation: "Phòng Kế toán - Tầng 2",
    status: "COMPLETED",
    createdBy: "Trần Thị B",
    createdAt: new Date("2024-02-20T14:15:00").toISOString()
  },
  {
    id: "log-3",
    assetId: "asset-001",
    action: "Bảo trì định kỳ",
    reason: "Bảo trì theo lịch trình hàng tháng",
    fromLocation: "Phòng Kế toán - Tầng 2",
    toLocation: "Phòng Kế toán - Tầng 2",
    status: "COMPLETED",
    createdBy: "Lê Văn C",
    createdAt: new Date("2024-03-10T11:00:00").toISOString()
  },
  {
    id: "log-4",
    assetId: "asset-001",
    action: "Cập nhật thông tin",
    reason: "Cập nhật thông số kỹ thuật mới",
    fromLocation: "Phòng Kế toán - Tầng 2",
    toLocation: "Phòng Kế toán - Tầng 2",
    status: "COMPLETED",
    createdBy: "Phạm Thị D",
    createdAt: new Date("2024-03-25T16:45:00").toISOString()
  },
  {
    id: "log-5",
    assetId: "asset-001",
    action: "Chuyển đổi vị trí",
    reason: "Chuyển về phòng IT theo yêu cầu",
    fromLocation: "Phòng Kế toán - Tầng 2",
    toLocation: "Phòng IT - Tầng 3",
    status: "IN_PROGRESS",
    createdBy: "Hoàng Văn E",
    createdAt: new Date("2024-04-01T08:30:00").toISOString()
  }
];

const statusColors = {
  [AssetStatus.CHO_PHAN_BO]: "bg-yellow-100 text-yellow-800",
  [AssetStatus.DANG_SU_DUNG]: "bg-green-100 text-green-800",
  [AssetStatus.HU_HONG]: "bg-red-100 text-red-800",
  [AssetStatus.DE_XUAT_THANH_LY]: "bg-orange-100 text-orange-800",
  [AssetStatus.DA_THANH_LY]: "bg-gray-100 text-gray-800",
};

const statusLabels = {
  [AssetStatus.CHO_PHAN_BO]: "Chờ phân bổ",
  [AssetStatus.DANG_SU_DUNG]: "Đang sử dụng",
  [AssetStatus.HU_HONG]: "Hư hỏng",
  [AssetStatus.DE_XUAT_THANH_LY]: "Đề xuất thanh lý",
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
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock API call
    const fetchAssetDetail = async () => {
      setIsLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Lấy asset từ mock data dựa trên ID
        const foundAsset = MockDataHelper.getAssetById(params.id as string);
        if (foundAsset) {
          setAsset(foundAsset);
        } else {
          setAsset(null);
        }
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

  // Lấy logs cho asset hiện tại
  const getAssetLogs = (assetId: string) => {
    return mockAssetLogs.filter(log => log.assetId === assetId);
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
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/asset"
              className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-sm"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{asset.name}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Chi tiết thông tin tài sản</span>
                <span>•</span>
                <span className="font-mono text-gray-500">#{asset.id}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <>
              <Link href={`/asset/${asset.id}/edit`}>
                <Button
                  className="flex items-center bg-blue-600 text-white  px-4 py-2 rounded-lg shadow-sm"
                  variant="outline"
                >
                  <Edit2 className="h-4 w-4 mr-2 text-white" />
                  <span className="text-white">Chỉnh sửa</span>
                </Button>
              </Link>
              <Button
                onClick={handleDeleteAsset}
                variant="destructive"
                className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa
              </Button>
            </>
            <Link href={`/asset/${asset.id}/rfid`}>
              <Button
                className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-sm"
              >
                <Scan className="h-4 w-4 mr-2" />
                Quét RFID
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'info'
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
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'history'
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
                    <div className="text-sm text-gray-900">{asset.category?.name || 'Không có thông tin'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Ngày nhập</label>
                    <div className="text-sm text-gray-900">
                      {new Date(asset.entryDate).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                  {asset.assignedDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Ngày bàn giao</label>
                      <div className="text-sm text-gray-900">
                        {new Date(asset.assignedDate).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  )}
                  {asset.assignedTo && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Người nhận bàn giao</label>
                      <div className="text-sm text-gray-900">{asset.assignedTo}</div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Trạng thái bàn giao</label>
                    <div className="text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${asset.isHandOver ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {asset.isHandOver ? 'Đã bàn giao' : 'Chưa bàn giao'}
                      </span>
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
                    <div className="text-sm text-gray-900">{asset.origin}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Gói mua</label>
                    <div className="text-sm text-gray-900">Gói {asset.purchasePackage}</div>
                  </div>
                </div>
              </div>

              {/* Current Location Info */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Vị trí hiện tại</h3>
                <div className="space-y-4">
                  {asset.currentRoomId ? (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-sm">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shadow-sm">
                            <Building className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">Vị trí hiện tại</h4>
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              Đang sử dụng
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="text-xl font-bold text-gray-900">
                              {asset.room ?
                                MockDataHelper.formatRoomLocation(asset.room) :
                                MockDataHelper.getRoomById(asset.currentRoomId)?.roomNumber || asset.currentRoomId
                              }
                            </div>
                            {asset.room && (
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Building className="h-4 w-4" />
                                  <span>{asset.room.building} - Tầng {asset.room.floor}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Hash className="h-4 w-4" />
                                  <span>Đơn vị: {MockDataHelper.getUnitById(asset.room.unitId)?.name || "Không có thông tin"}</span>
                                </div>
                                {asset.assignedTo && (
                                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <User className="h-4 w-4" />
                                    <span>Người sử dụng: {asset.assignedTo}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shadow-sm">
                            <Package2 className="h-6 w-6 text-gray-400" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">Vị trí hiện tại</h4>
                            <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                              Chưa bàn giao
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="text-lg font-medium text-gray-500">
                              Tài sản đang ở kho / chưa được bàn giao
                            </div>
                            <div className="text-sm text-gray-400">
                              Chưa có thông tin vị trí cụ thể
                            </div>
                          </div>
                        </div>
                      </div>
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

              {getAssetLogs(asset.id).length > 0 ? (
                <div className="flow-root">
                  <ul className="-mb-8">
                    {getAssetLogs(asset.id).map((log, logIndex) => (
                      <li key={log.id}>
                        <div className="relative pb-8">
                          {logIndex !== getAssetLogs(asset.id).length - 1 && (
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
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${log.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                      log.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                        log.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-red-100 text-red-800'
                                    }`}>
                                    {log.status === 'COMPLETED' ? 'Hoàn thành' :
                                      log.status === 'IN_PROGRESS' ? 'Đang thực hiện' :
                                        log.status === 'PENDING' ? 'Chờ thực hiện' :
                                          'Đã hủy'}
                                  </span>
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
              ) : (
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-12 border-2 border-dashed border-gray-200">
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Clock className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có lịch sử di chuyển</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      Tài sản này chưa có hoạt động di chuyển hoặc thay đổi nào được ghi nhận.
                      Lịch sử sẽ xuất hiện khi có các hoạt động như bàn giao, chuyển đổi vị trí,
                      hoặc cập nhật thông tin.
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>Bàn giao</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Chuyển đổi</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span>Cập nhật</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}