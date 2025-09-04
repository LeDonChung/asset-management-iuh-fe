"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit2,
  Settings,
  Calendar,
  Users,
  Building2,
  Clock,
  User,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  PlayCircle,
  AlertCircle,
  FileText,
  Globe,
  MapPin,
  Hash,
  Download
} from "lucide-react";
import Link from "next/link";
import {
  InventorySession,
  InventorySessionStatus,
  UserStatus,
  Unit,
  UnitStatus,
  UnitType
} from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import InventorySessionTabs from "@/components/inventory/InventorySessionTabs";

// Mock data
const mockInventorySession: InventorySession = {
  id: "inv-session-1",
  year: 2024,
  name: "Kiểm kê tài sản cuối năm 2024",
  period: 1,
  isGlobal: true,
  startDate: "2024-12-01",
  endDate: "2024-12-31",
  status: InventorySessionStatus.PLANNED,
  createdBy: "user-1",
  createdAt: "2024-11-01T00:00:00Z",
  creator: {
    id: "user-1",
    username: "admin",
    fullName: "Nguyễn Văn Admin",
    email: "admin@iuh.edu.vn",
    phoneNumber: "0123456789",
    status: UserStatus.ACTIVE,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  units: [
    {
      id: "session-unit-1",
      sessionId: "inv-session-1",
      unitId: "unit-1",
      unit: {
        id: "unit-1",
        name: "Khoa Công nghệ thông tin",
        type: UnitType.DON_VI_SU_DUNG,
        status: UnitStatus.ACTIVE,
        phone: "028-38968641",
        email: "cntt@iuh.edu.vn",
        representativeId: "user-2",
        createdBy: "admin",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
      }
    },
    {
      id: "session-unit-2",
      sessionId: "inv-session-1",
      unitId: "unit-2",
      unit: {
        id: "unit-2",
        name: "Khoa Cơ khí",
        type: UnitType.DON_VI_SU_DUNG,
        status: UnitStatus.ACTIVE,
        phone: "028-38968642",
        email: "comech@iuh.edu.vn",
        representativeId: "user-3",
        createdBy: "admin",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
      }
    }
  ],
  committees: [],
};

// Status configuration
const statusConfig = {
  [InventorySessionStatus.PLANNED]: {
    label: "Kế hoạch",
    color: "bg-blue-100 text-blue-800",
    icon: Clock,
    nextStatus: InventorySessionStatus.IN_PROGRESS,
    nextLabel: "Bắt đầu kiểm kê",
    nextIcon: PlayCircle
  },
  [InventorySessionStatus.IN_PROGRESS]: {
    label: "Đang thực hiện",
    color: "bg-yellow-100 text-yellow-800",
    icon: PlayCircle,
    nextStatus: InventorySessionStatus.COMPLETED,
    nextLabel: "Hoàn thành",
    nextIcon: CheckCircle
  },
  [InventorySessionStatus.COMPLETED]: {
    label: "Hoàn thành",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
    nextStatus: InventorySessionStatus.CLOSED,
    nextLabel: "Đóng kỳ",
    nextIcon: XCircle
  },
  [InventorySessionStatus.CLOSED]: {
    label: "Đã đóng",
    color: "bg-gray-100 text-gray-800",
    icon: XCircle,
    nextStatus: null,
    nextLabel: null,
    nextIcon: null
  }
};

export default function InventorySessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getCurrentRole } = useAuth();
  
  const [session, setSession] = useState<InventorySession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  // Check user permissions
  const isSuperAdmin = getCurrentRole()?.code === "SUPER_ADMIN";
  const isAdmin = getCurrentRole()?.code === "ADMIN";
  const isPhongQuanTri = getCurrentRole()?.code === "PHONG_QUAN_TRI";

  // Fetch session data
  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true);
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setSession(mockInventorySession);
      } catch (error) {
        console.error("Error fetching session:", error);
        alert("Không thể tải thông tin kỳ kiểm kê. Vui lòng thử lại.");
        router.push("/inventory");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchSession();
    }
  }, [params.id, router]);

  const handleStatusChange = async (newStatus: InventorySessionStatus) => {
    if (!session) return;

    const config = statusConfig[session.status];
    if (!config.nextStatus || config.nextStatus !== newStatus) {
      alert("Không thể chuyển trạng thái này");
      return;
    }

    const newConfig = statusConfig[newStatus];
    if (confirm(`Bạn có chắc chắn muốn ${newConfig.nextLabel?.toLowerCase()}?`)) {
      setIsChangingStatus(true);
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setSession(prev => prev ? {
          ...prev,
          status: newStatus,
          updatedAt: new Date().toISOString()
        } : null);
        
        alert(`${newConfig.nextLabel} thành công!`);
      } catch (error) {
        console.error("Error changing status:", error);
        alert("Có lỗi xảy ra khi thay đổi trạng thái. Vui lòng thử lại.");
      } finally {
        setIsChangingStatus(false);
      }
    }
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center space-x-4">
          <Link href="/inventory">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết kỳ kiểm kê</h1>
            <p className="text-gray-600">Đang tải thông tin...</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center space-x-4">
          <Link href="/inventory">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết kỳ kiểm kê</h1>
            <p className="text-gray-600">Không tìm thấy kỳ kiểm kê</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy kỳ kiểm kê</h3>
          <p className="text-gray-500 mb-6">Kỳ kiểm kê không tồn tại hoặc đã bị xóa.</p>
          <Link href="/inventory">
            <Button>Quay lại danh sách</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentStatusConfig = statusConfig[session.status];
  const StatusIcon = currentStatusConfig.icon;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/inventory">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{session.name}</h1>
            <p className="text-gray-600">Chi tiết kỳ kiểm kê năm {session.year} - Đợt {session.period}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {/* Edit Button - Only for PLANNED status */}
          {session.status === InventorySessionStatus.PLANNED && (isAdmin || isSuperAdmin) && (
            <Link href={`/inventory/${session.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit2 className="h-4 w-4 mr-2" />
                Sửa thông tin
              </Button>
            </Link>
          )}

          {/* Status Change Button */}
          {currentStatusConfig.nextStatus && (isAdmin || isSuperAdmin) && (
            <Button
              onClick={() => handleStatusChange(currentStatusConfig.nextStatus!)}
              disabled={isChangingStatus}
              className="min-w-[140px]"
            >
              {isChangingStatus ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang xử lý...
                </div>
              ) : (
                <>
                  {React.createElement(currentStatusConfig.nextIcon!, { className: "h-4 w-4 mr-2" })}
                  {currentStatusConfig.nextLabel}
                </>
              )}
            </Button>
          )}

          {/* Management Button */}
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Quản lý
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* General Information Card - Takes 3 columns */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Thông tin chung
                </h2>
                <Badge className={currentStatusConfig.color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {currentStatusConfig.label}
                </Badge>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Basic Info */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-600">Năm kiểm kê</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{session.year}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Hash className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-600">Đợt</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{session.period}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Thời gian thực hiện</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-blue-700">
                        <strong>Bắt đầu:</strong> {new Date(session.startDate).toLocaleDateString('vi-VN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-blue-700">
                        <strong>Kết thúc:</strong> {new Date(session.endDate).toLocaleDateString('vi-VN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-blue-800 font-medium">
                        Thời gian: {calculateDuration(session.startDate, session.endDate)} ngày
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Scope & Creator Info */}
                <div className="space-y-6">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      {session.isGlobal ? (
                        <Globe className="h-4 w-4 text-green-600" />
                      ) : (
                        <Building2 className="h-4 w-4 text-green-600" />
                      )}
                      <span className="text-sm font-medium text-green-800">Phạm vi kiểm kê</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-green-900">
                        {session.isGlobal ? "Toàn trường" : "Đơn vị cụ thể"}
                      </p>
                      {!session.isGlobal && session.units && session.units.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs text-green-700 font-medium">
                            Đơn vị tham gia ({session.units.length}):
                          </p>
                          {session.units.slice(0, 3).map((sessionUnit) => (
                            <div key={sessionUnit.id} className="flex items-center space-x-2">
                              <MapPin className="h-3 w-3 text-green-600" />
                              <span className="text-xs text-green-800">
                                {sessionUnit.unit?.name}
                              </span>
                            </div>
                          ))}
                          {session.units.length > 3 && (
                            <p className="text-xs text-green-700">
                              và {session.units.length - 3} đơn vị khác...
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <User className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Người tạo</span>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold text-purple-900">{session.creator?.fullName}</p>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-3 w-3 text-purple-600" />
                          <span className="text-sm text-purple-700">{session.creator?.email}</span>
                        </div>
                        {session.creator?.phoneNumber && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-3 w-3 text-purple-600" />
                            <span className="text-sm text-purple-700">{session.creator.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-purple-600">
                        Tạo lúc: {new Date(session.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="h-4 w-4 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">Tiến trình kỳ kiểm kê</h3>
              </div>
              <div className="space-y-3">
                {Object.entries(statusConfig).map(([status, config]) => {
                  const isCurrentStatus = session.status === status;
                  const isPastStatus = Object.keys(statusConfig).indexOf(session.status) > 
                                     Object.keys(statusConfig).indexOf(status);
                  
                  return (
                    <div 
                      key={status} 
                      className={`flex items-center space-x-3 p-3 rounded-lg ${
                        isCurrentStatus 
                          ? 'bg-blue-100 border border-blue-300' 
                          : isPastStatus 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-white border border-gray-200'
                      }`}
                    >
                      {React.createElement(config.icon, { 
                        className: `h-5 w-5 ${
                          isCurrentStatus 
                            ? 'text-blue-600' 
                            : isPastStatus 
                              ? 'text-green-600' 
                              : 'text-gray-400'
                        }` 
                      })}
                      <span className={`text-sm font-medium ${
                        isCurrentStatus 
                          ? 'text-blue-900' 
                          : isPastStatus 
                            ? 'text-green-800' 
                            : 'text-gray-500'
                      }`}>
                        {config.label}
                      </span>
                      {isCurrentStatus && (
                        <Badge variant="outline" className="ml-auto text-xs text-blue-700 border-blue-300">
                          Hiện tại
                        </Badge>
                      )}
                      {isPastStatus && (
                        <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Card - Takes 1 column */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
            <div className="flex items-center space-x-2 mb-4">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-medium text-gray-900">Thao tác nhanh</h3>
            </div>
            
            <div className="space-y-3">
              <Link 
                href={`/inventory/${session.id}/committees`}
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Ban kiểm kê</span>
                </div>
                <ArrowLeft className="h-4 w-4 text-blue-600 rotate-180 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                href={`/inventory/${session.id}/assignments`}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Phân công</span>
                </div>
                <ArrowLeft className="h-4 w-4 text-green-600 rotate-180 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                href={`/inventory/${session.id}/reports`}
                className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <Download className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Báo cáo</span>
                </div>
                <ArrowLeft className="h-4 w-4 text-purple-600 rotate-180 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                href={`/inventory/${session.id}/settings`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Cài đặt</span>
                </div>
                <ArrowLeft className="h-4 w-4 text-gray-600 rotate-180 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Status Actions */}
            {currentStatusConfig.nextStatus && (isAdmin || isSuperAdmin) && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">Hành động tiếp theo</p>
                <Button
                  onClick={() => handleStatusChange(currentStatusConfig.nextStatus!)}
                  disabled={isChangingStatus}
                  className="w-full"
                  size="sm"
                >
                  {isChangingStatus ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang xử lý...
                    </div>
                  ) : (
                    <>
                      {React.createElement(currentStatusConfig.nextIcon!, { className: "h-4 w-4 mr-2" })}
                      {currentStatusConfig.nextLabel}
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Section */}
      <InventorySessionTabs session={session} />
    </div>
  );
}