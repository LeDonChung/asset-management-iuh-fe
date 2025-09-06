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
  Download,
  BookOpen,
  Eye,
  X,
  Wrench,
  Package
} from "lucide-react";
import Link from "next/link";
import {
  InventorySession,
  InventorySessionStatus,
  UserStatus,
  Unit,
  UnitStatus,
  UnitType,
  AssetType
} from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalHeader } from "@/components/ui/modal";
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

// Mock data for asset preview
const mockAssetPreview = {
  "unit-1": {
    [AssetType.CCDC]: [
      { 
        id: "1", 
        ktCode: "KT-2025/001", 
        fixedCode: "2025.001",
        name: "Máy in Canon LBP6030", 
        specs: "Laser, Đen trắng, A4",
        location: "A-3-301",
        entryDate: "15/1/2025",
        quantity: 2, 
        unit: "Chiếc",
        status: "Đầy đủ" 
      },
      { 
        id: "2", 
        ktCode: "KT-2025/002", 
        fixedCode: "2025.002",
        name: "Chuột quang Logitech B100", 
        specs: "USB, Quang học, 1000 DPI",
        location: "A-3-302",
        entryDate: "16/1/2025",
        quantity: 25, 
        unit: "Chiếc",
        status: "Đầy đủ" 
      },
      { 
        id: "3", 
        ktCode: "KT-2025/003", 
        fixedCode: "2025.003",
        name: "Bàn phím Dell KB216", 
        specs: "USB, Layout QWERTY, Đen",
        location: "A-3-303",
        entryDate: "17/1/2025",
        quantity: 28, 
        unit: "Chiếc",
        status: "Thiếu 2" 
      },
    ],
    [AssetType.TSCD]: [
      { 
        id: "4", 
        ktCode: "TS-2025/001", 
        fixedCode: "2025.004",
        name: "Máy tính để bàn Dell OptiPlex 7090", 
        specs: "Intel i5-11500, 8GB RAM, 256GB SSD",
        location: "A-3-301",
        entryDate: "15/1/2025",
        quantity: 1, 
        unit: "Chiếc",
        status: "Đầy đủ" 
      },
      { 
        id: "5", 
        ktCode: "TS-2025/002", 
        fixedCode: "2025.005",
        name: "Màn hình Samsung 24 inch", 
        specs: "Full HD, VA Panel, 75Hz",
        location: "A-3-302",
        entryDate: "16/1/2025",
        quantity: 1, 
        unit: "Chiếc",
        status: "Hư hỏng 3" 
      },
      { 
        id: "6", 
        ktCode: "TS-2025/003", 
        fixedCode: "2025.006",
        name: "Bàn ghế văn phòng", 
        specs: "Gỗ công nghiệp, màu nâu",
        location: "A-3-304",
        entryDate: "18/1/2025",
        quantity: 1, 
        unit: "Bộ",
        status: "Đầy đủ" 
      },
    ]
  },
  "unit-2": {
    [AssetType.CCDC]: [
      { 
        id: "7", 
        ktCode: "KT-2025/004", 
        fixedCode: "2025.007",
        name: "Máy khoan Bosch GSB 550", 
        specs: "550W, 13mm, Có búa",
        location: "B-1-101",
        entryDate: "20/1/2025",
        quantity: 5, 
        unit: "Chiếc",
        status: "Đầy đủ" 
      },
      { 
        id: "8", 
        ktCode: "KT-2025/005", 
        fixedCode: "2025.008",
        name: "Thước kẹp Mitutoyo", 
        specs: "0-150mm, Độ chính xác 0.02mm",
        location: "B-1-102",
        entryDate: "21/1/2025",
        quantity: 12, 
        unit: "Chiếc",
        status: "Thiếu 1" 
      },
    ],
    [AssetType.TSCD]: [
      { 
        id: "9", 
        ktCode: "TS-2025/004", 
        fixedCode: "2025.009",
        name: "Máy CNC Haas VF-2", 
        specs: "3 trục, 762x406x508mm",
        location: "B-1-201",
        entryDate: "22/1/2025",
        quantity: 1, 
        unit: "Chiếc",
        status: "Đầy đủ" 
      },
      { 
        id: "10", 
        ktCode: "TS-2025/005", 
        fixedCode: "2025.010",
        name: "Máy lạnh Daikin FTXM35R", 
        specs: "1.5HP, Inverter, R32",
        location: "B-1-202",
        entryDate: "23/1/2025",
        quantity: 1, 
        unit: "Chiếc",
        status: "Đầy đủ" 
      },
    ]
  }
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
  
  // Asset Report Modal States
  const [isAssetReportModalOpen, setIsAssetReportModalOpen] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [selectedAssetTypes, setSelectedAssetTypes] = useState<AssetType[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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

  // Asset Report Functions
  const handleUnitToggle = (unitId: string) => {
    setSelectedUnits(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  const handleAssetTypeToggle = (assetType: AssetType) => {
    setSelectedAssetTypes(prev => 
      prev.includes(assetType) 
        ? prev.filter(type => type !== assetType)
        : [...prev, assetType]
    );
  };

  const handleGenerateReport = async () => {
    if (selectedUnits.length === 0 || selectedAssetTypes.length === 0) {
      alert("Vui lòng chọn ít nhất một đơn vị và một loại tài sản");
      return;
    }

    setIsGeneratingReport(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert("Tạo sổ tài sản thành công!");
      setIsAssetReportModalOpen(false);
      resetAssetReportModal();
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Có lỗi xảy ra khi tạo sổ tài sản. Vui lòng thử lại.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const resetAssetReportModal = () => {
    setSelectedUnits([]);
    setSelectedAssetTypes([]);
    setShowPreview(false);
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
          <Link href={`/inventory/${session.id}/results`}>
            <Button
              variant="outline" 
              className="flex items-center gap-2 border border-green-200 hover:bg-green-50"
            >
              <FileText className="h-4 w-4" />
              <span className="truncate">Xem kết quả</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            className="flex items-center gap-2 border border-blue-200 hover:bg-blue-50"
          >
            <Download className="h-4 w-4" />
            <span className="truncate">Xuất báo cáo</span>
          </Button>
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
                      className={`flex items-center space-x-3 p-3 rounded-lg ${isCurrentStatus
                          ? 'bg-blue-100 border border-blue-300'
                          : isPastStatus
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-white border border-gray-200'
                        }`}
                    >
                      {React.createElement(config.icon, {
                        className: `h-5 w-5 ${isCurrentStatus
                            ? 'text-blue-600'
                            : isPastStatus
                              ? 'text-green-600'
                              : 'text-gray-400'
                          }`
                      })}
                      <span className={`text-sm font-medium ${isCurrentStatus
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
                href={`/inventory/${session.id}/results`}
                className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">Kết quả kiểm kê</span>
                </div>
                <ArrowLeft className="h-4 w-4 text-orange-600 rotate-180 group-hover:translate-x-1 transition-transform" />
              </Link>

              <button
                onClick={() => setIsAssetReportModalOpen(true)}
                className="w-full flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Tạo sổ tài sản</span>
                </div>
                <ArrowLeft className="h-4 w-4 text-blue-600 rotate-180 group-hover:translate-x-1 transition-transform" />
              </button>
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

      {/* Asset Report Modal */}
      <Modal 
        isOpen={isAssetReportModalOpen} 
        onClose={() => {
          setIsAssetReportModalOpen(false);
          resetAssetReportModal();
        }}
        size="xl"
        className="max-h-[80vh] overflow-y-auto"
      >
        <ModalHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
              Tạo sổ tài sản
            </h2>
            <button
              onClick={() => {
                setIsAssetReportModalOpen(false);
                resetAssetReportModal();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </ModalHeader>

        <div className="space-y-6">
          {/* Unit Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Chọn đơn vị đã kiểm kê</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {session?.units?.map((sessionUnit) => (
                <label
                  key={sessionUnit.id}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedUnits.includes(sessionUnit.unitId)}
                    onChange={() => handleUnitToggle(sessionUnit.unitId)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">
                      {sessionUnit.unit?.name}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Đã chọn: {selectedUnits.length} / {session?.units?.length || 0} đơn vị
            </p>
          </div>

          {/* Asset Type Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Chọn loại tài sản</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedAssetTypes.includes(AssetType.CCDC)}
                  onChange={() => handleAssetTypeToggle(AssetType.CCDC)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Wrench className="h-4 w-4 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Công cụ dụng cụ</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedAssetTypes.includes(AssetType.TSCD)}
                  onChange={() => handleAssetTypeToggle(AssetType.TSCD)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Package className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Tài sản cố định</span>
                </div>
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Đã chọn: {selectedAssetTypes.length} / 2 loại tài sản
            </p>
          </div>

          {/* Preview Toggle */}
          {selectedUnits.length > 0 && selectedAssetTypes.length > 0 && (
            <div>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Eye className="h-4 w-4" />
                <span>{showPreview ? 'Ẩn xem trước' : 'Xem trước sổ tài sản'}</span>
              </button>
            </div>
          )}

          {/* Preview Section */}
          {showPreview && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <Eye className="h-4 w-4 mr-2 text-blue-600" />
                  Xem trước sổ tài sản
                </h4>
              </div>
              
              <div className="p-4 space-y-6">
                {selectedUnits.map(unitId => {
                  const unit = session?.units?.find(u => u.unitId === unitId)?.unit;
                  const unitAssets = mockAssetPreview[unitId as keyof typeof mockAssetPreview];
                  
                  if (!unit || !unitAssets) return null;
                  
                  return (
                    <div key={unitId} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Unit Header */}
                      <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-blue-900 flex items-center">
                            <Building2 className="h-4 w-4 mr-2" />
                            {unit.name}
                          </h5>
                          <Badge variant="outline" className="text-xs text-blue-700">
                            Kỳ kiểm kê {session?.year} - Đợt {session?.period}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Asset Types */}
                      <div className="divide-y divide-gray-200">
                        {selectedAssetTypes.map(assetType => {
                          const assets = unitAssets[assetType];
                          if (!assets || assets.length === 0) return null;
                          
                          return (
                            <div key={assetType} className="p-4">
                              {/* Asset Type Header */}
                              <div className="flex items-center mb-3">
                                <div className={`w-6 h-6 rounded flex items-center justify-center mr-2 ${
                                  assetType === AssetType.CCDC 
                                    ? 'bg-orange-100' 
                                    : 'bg-purple-100'
                                }`}>
                                  {assetType === AssetType.CCDC ? (
                                    <Wrench className="h-3 w-3 text-orange-600" />
                                  ) : (
                                    <Package className="h-3 w-3 text-purple-600" />
                                  )}
                                </div>
                                <h6 className="font-medium text-gray-900">
                                  {assetType === AssetType.CCDC ? 'Công cụ dụng cụ' : 'Tài sản cố định'}
                                </h6>
                              </div>
                              
                              {/* Asset Table */}
                              <div className="overflow-x-auto">
                                <table className="min-w-full text-sm border-collapse border border-gray-300">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-3 text-left font-medium text-gray-700 border border-gray-300">Tài sản</th>
                                      <th className="px-3 py-3 text-left font-medium text-gray-700 border border-gray-300">Mã số</th>
                                      <th className="px-3 py-3 text-left font-medium text-gray-700 border border-gray-300">Vị trí</th>
                                      <th className="px-3 py-3 text-left font-medium text-gray-700 border border-gray-300">Ngày ghi nhận</th>
                                      <th className="px-3 py-3 text-center font-medium text-gray-700 border border-gray-300">Số lượng</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {assets.map((asset, index) => (
                                      <tr key={asset.id} className="hover:bg-gray-50">
                                        <td className="px-3 py-3 border border-gray-300">
                                          <div className="space-y-1">
                                            <div className="font-medium text-gray-900">{asset.name}</div>
                                            <div className="text-xs text-gray-500">{asset.specs}</div>
                                          </div>
                                        </td>
                                        <td className="px-3 py-3 border border-gray-300">
                                          <div className="space-y-1">
                                            <div className="font-mono text-sm text-gray-900">{asset.ktCode}</div>
                                            <div className="font-mono text-xs text-gray-500">{asset.fixedCode}</div>
                                          </div>
                                        </td>
                                        <td className="px-3 py-3 border border-gray-300 text-gray-900">{asset.location}</td>
                                        <td className="px-3 py-3 border border-gray-300 text-gray-900">{asset.entryDate}</td>
                                        <td className="px-3 py-3 border border-gray-300 text-center">
                                          <div className="font-medium text-gray-900">
                                            {asset.quantity} {asset.unit}
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              
                              {/* Summary for this asset type */}
                              <div className="mt-3 text-xs text-gray-600">
                                <span className="font-medium">Tổng cộng:</span> {assets.length} loại tài sản
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Unit Footer */}
                      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600 flex justify-between">
                        <span>Ngày tạo: {new Date().toLocaleDateString('vi-VN')}</span>
                        <span>Người tạo: {session?.creator?.fullName}</span>
                      </div>
                    </div>
                  );
                })}
                
                {/* Overall Summary */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h6 className="font-medium text-blue-900 mb-2">Tổng kết sổ tài sản</h6>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Số đơn vị:</span> 
                      <span className="font-medium ml-1">{selectedUnits.length}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Loại tài sản:</span> 
                      <span className="font-medium ml-1">{selectedAssetTypes.length}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Tổng số loại tài sản:</span> 
                      <span className="font-medium ml-1">
                        {selectedUnits.reduce((total, unitId) => {
                          const unitAssets = mockAssetPreview[unitId as keyof typeof mockAssetPreview];
                          if (!unitAssets) return total;
                          return total + selectedAssetTypes.reduce((typeTotal, type) => {
                            return typeTotal + (unitAssets[type]?.length || 0);
                          }, 0);
                        }, 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Kỳ kiểm kê:</span> 
                      <span className="font-medium ml-1">{session?.year} - Đợt {session?.period}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsAssetReportModalOpen(false);
                resetAssetReportModal();
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleGenerateReport}
              disabled={isGeneratingReport || selectedUnits.length === 0 || selectedAssetTypes.length === 0}
              className="min-w-[120px]"
            >
              {isGeneratingReport ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang tạo...
                </div>
              ) : (
                <>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Tạo sổ tài sản
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}