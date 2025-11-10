"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Edit2,
  Settings,
  Calendar,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  PlayCircle,
  AlertCircle,
  FileText,
  MapPin,
  Hash,
  Download,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { InventorySessionStatus, InventorySessionUnit } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import InventoryManagementOverview from "@/components/inventory/InventoryManagementOverview";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  findByIdInventorySession,
  updateStatusInventorySession,
  updateStatusSessionById,
  setCurrentSession,
  clearCurrentSession,
} from "@/lib/store/slices/inventorySlice";
import toast from "react-hot-toast";
import { InventoryResultManager } from "@/components/inventory/InventoryResultManager";
import { PermissionConstants, usePermissions } from "@/hooks/usePermissions";

// Status configuration
const statusConfig = {
  [InventorySessionStatus.PLANNED]: {
    label: "Kế hoạch",
    color: "bg-blue-100 text-blue-800",
    icon: Clock,
    nextStatus: InventorySessionStatus.IN_PROGRESS,
    nextLabel: "Đang thực hiện",
    nextIcon: PlayCircle,
  },
  [InventorySessionStatus.IN_PROGRESS]: {
    label: "Đang thực hiện",
    color: "bg-yellow-100 text-yellow-800",
    icon: PlayCircle,
    nextStatus: InventorySessionStatus.COMPLETED,
    nextLabel: "Hoàn thành",
    nextIcon: CheckCircle,
  },
  [InventorySessionStatus.COMPLETED]: {
    label: "Hoàn thành",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
    nextStatus: InventorySessionStatus.CLOSED,
    nextLabel: "Đóng kỳ",
    nextIcon: XCircle,
  },
  [InventorySessionStatus.CLOSED]: {
    label: "Đã đóng",
    color: "bg-gray-100 text-gray-800",
    icon: XCircle,
    nextStatus: null,
    nextLabel: null,
    nextIcon: null,
  },
};

export default function InventorySessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { findByIdLoading, updateStatusLoading, currentSession } =
    useAppSelector((state) => state.inventory);
  const dispatch = useAppDispatch();

  const [activeMainTab, setActiveMainTab] = useState<
    "overview" | "management" | "result"
  >("overview");

  const session = currentSession;
  const { hasAnyPermission } = usePermissions();
  const canCreate = hasAnyPermission([
    PermissionConstants.PERM_CREATE_INVENTORY,
  ]);
  const canEdit = hasAnyPermission([PermissionConstants.PERM_UPDATE_INVENTORY]);
  const canDelete = hasAnyPermission([
    PermissionConstants.PERM_REMOVE_INVENTORY,
  ]);
  const canView = hasAnyPermission([PermissionConstants.PERM_VIEW_INVENTORY]);
  const canViewResult = hasAnyPermission([
    PermissionConstants.PERM_VIEW_RESULT_INVENTORY,
  ]);
  // Fetch session data and store in Redux
  useEffect(() => {
    const fetchSession = async () => {
      try {
        // This will automatically set currentSession in Redux via the fulfilled case
        await dispatch(findByIdInventorySession(params.id as string)).unwrap();
      } catch (error) {
        console.error("Error fetching session:", error);
        toast.error("Không thể tải thông tin kỳ kiểm kê. Vui lòng thử lại.");
        router.push("/inventory");
      }
    };

    if (params.id) {
      fetchSession();
    }
  }, [params.id, router, dispatch]);

  // Clean up currentSession when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearCurrentSession());
    };
  }, [dispatch]);

  const handleStatusChange = async (newStatus: InventorySessionStatus) => {
    if (!session) return;

    const config = statusConfig[session.status as InventorySessionStatus];
    if (!config.nextStatus || config.nextStatus !== newStatus) {
      toast.error("Không thể chuyển trạng thái này");
      return;
    }

    const newConfig = statusConfig[newStatus];
    if (confirm(`Bạn có chắc chắn muốn ${newConfig.label?.toLowerCase()}?`)) {
      try {
        const result = await dispatch(
          updateStatusInventorySession({
            id: session.id,
            status: newStatus,
          })
        ).unwrap();

        if (result) {
          // Update Redux store state
          dispatch(
            updateStatusSessionById({ id: session.id, status: newStatus })
          );

          // Show appropriate success message
          if (newStatus === InventorySessionStatus.CLOSED) {
            toast.success(`Đã đóng kỳ kiểm kê thành công!`);
          } else {
            toast.success(`Đã cập nhật trạng thái kỳ kiểm kê thành công!`);
          }
        }
      } catch (error: any) {
        console.error("Error changing status:", error);
        toast.error(
          error?.message ||
            "Có lỗi xảy ra khi thay đổi trạng thái. Vui lòng thử lại."
        );
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

  const handleGoBack = () => {
    const returnUrl = searchParams.get("returnUrl");
    const allParams = searchParams.toString();

    if (returnUrl && returnUrl.trim() !== "") {
      const decodedUrl = decodeURIComponent(returnUrl);
      console.log("Decoded URL:", decodedUrl);
      // Quay lại URL với đầy đủ filter state
      router.push(decodedUrl);
    } else {
      console.log("No valid returnUrl found, going to /inventory");
      // Fallback về trang inventory
      router.push("/inventory");
    }
  };

  if (findByIdLoading) {
    return (
      <div className=" mx-auto space-y-8">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết kỳ kiểm kê
            </h1>
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
  // This function is no longer needed since we use Redux actions directly
  if (!session) {
    return (
      <div className=" mx-auto space-y-8">
        <div className="flex items-center space-x-4">
          <Link href="/inventory">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết kỳ kiểm kê
            </h1>
            <p className="text-gray-600">Không tìm thấy kỳ kiểm kê</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không tìm thấy kỳ kiểm kê
          </h3>
          <p className="text-gray-500 mb-6">
            Kỳ kiểm kê không tồn tại hoặc đã bị xóa.
          </p>
          <Link href="/inventory">
            <Button>Quay lại danh sách</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentStatusConfig =
    statusConfig[session.status as InventorySessionStatus];
  const StatusIcon = currentStatusConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleGoBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Chi tiết kỳ kiểm kê</h1>
                <p className="text-sm text-gray-600 truncate max-w-md">
                  {session.name}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {canViewResult && canView && session.status === InventorySessionStatus.COMPLETED && (
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Xuất báo cáo
                </Button>
              )}

              {/* Edit Button - Only for PLANNED status */}
              {session.status === InventorySessionStatus.PLANNED && canEdit && (
                <Link href={`/inventory/${session.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Sửa thông tin
                  </Button>
                </Link>
              )}

              {/* Status Change Button */}
              {currentStatusConfig.nextStatus && canEdit && (
                <Button
                  onClick={() =>
                    handleStatusChange(currentStatusConfig.nextStatus!)
                  }
                  disabled={updateStatusLoading}
                  size="sm"
                >
                  {updateStatusLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang xử lý...
                    </div>
                  ) : (
                    <>
                      {React.createElement(currentStatusConfig.nextIcon!, {
                        className: "w-4 h-4 mr-2",
                      })}
                      {currentStatusConfig.nextLabel}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Main Tab Navigation */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {[
                  { id: "overview", label: "Tổng quan", icon: FileText },
                  {
                    id: "management",
                    label: "Quản lý ban kiểm kê",
                    icon: Settings,
                  },
                  { id: "result", label: "Kết quả kiểm kê", icon: CheckCircle },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeMainTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveMainTab(tab.id as any)}
                      className={`border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap flex items-center space-x-2 ${
                        isActive
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {canView && activeMainTab === "overview" && (
                <div className="space-y-6">
                  {/* Overview content - moved from above */}
                  <div className="space-y-6">
                    {/* Thông tin cơ bản */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Năm kiểm kê */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center space-x-2 mb-3">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-gray-600">
                            Năm kiểm kê
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {session.year}
                        </p>
                      </div>

                      {/* Thời gian */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center space-x-2 mb-3">
                          <Clock className="h-5 w-5 text-orange-600" />
                          <span className="text-sm font-medium text-gray-600">
                            Thời gian thực hiện
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mb-1">
                          {calculateDuration(
                            session.startDate,
                            session.endDate
                          )}{" "}
                          ngày
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(session.startDate).toLocaleDateString(
                            "vi-VN"
                          )}{" "}
                          -{" "}
                          {new Date(session.endDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Các cơ sở tham gia */}
                    {session?.inventorySessionUnits &&
                      session.inventorySessionUnits.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                          <div className="flex items-center space-x-2 mb-4">
                            <Building2 className="h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-900">
                              Cơ sở tham gia kiểm kê
                            </h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {session.inventorySessionUnits.map(
                              (sessionUnit: InventorySessionUnit) => (
                                <div
                                  key={sessionUnit.id}
                                  className="bg-blue-50 rounded-lg p-4 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer group"
                                  onClick={() => {}}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <MapPin className="h-4 w-4 text-blue-600" />
                                      <span className="text-sm font-medium text-blue-800">
                                        Cơ sở
                                      </span>
                                    </div>
                                    <Eye className="h-4 w-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                  <p className="text-sm font-semibold text-blue-900 mb-1">
                                    {sessionUnit.unit?.name?.replace(
                                      "Đại học Công nghiệp thành phố Hồ Chí Minh",
                                      "TP.HCM"
                                    )}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Status Timeline */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center space-x-2 mb-6">
                        <Settings className="h-5 w-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          Tiến trình kỳ kiểm kê
                        </h3>
                      </div>

                      {/* Horizontal Progress Steps */}
                      <div className="flex items-center justify-between relative">
                        {[
                          InventorySessionStatus.PLANNED,
                          InventorySessionStatus.IN_PROGRESS,
                          InventorySessionStatus.COMPLETED,
                          InventorySessionStatus.CLOSED,
                        ].map((status, index) => {
                          const config = statusConfig[status];
                          const isCurrentStatus = session.status === status;
                          const isPastStatus =
                            [
                              InventorySessionStatus.PLANNED,
                              InventorySessionStatus.IN_PROGRESS,
                              InventorySessionStatus.COMPLETED,
                              InventorySessionStatus.CLOSED,
                            ].indexOf(session.status) > index;

                          const isLast = index === 3;

                          return (
                            <div
                              key={status}
                              className="flex items-center flex-1"
                            >
                              {/* Step Circle and Content */}
                              <div className="flex flex-col items-center relative z-10">
                                {/* Circle with Icon */}
                                <div
                                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-sm ${
                                    isCurrentStatus
                                      ? "bg-blue-600 border-blue-600"
                                      : isPastStatus
                                      ? "bg-green-600 border-green-600"
                                      : "bg-white border-gray-300"
                                  }`}
                                >
                                  {React.createElement(config.icon, {
                                    className: `h-5 w-5 ${
                                      isCurrentStatus || isPastStatus
                                        ? "text-white"
                                        : "text-gray-400"
                                    }`,
                                  })}
                                </div>

                                {/* Label */}
                                <div className="mt-3 text-center">
                                  <span
                                    className={`text-sm font-medium ${
                                      isCurrentStatus
                                        ? "text-blue-900"
                                        : isPastStatus
                                        ? "text-green-800"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {config.label}
                                  </span>
                                  {isCurrentStatus && (
                                    <div className="mt-1">
                                      <Badge
                                        variant="outline"
                                        className="text-xs text-blue-700 border-blue-300 bg-blue-50"
                                      >
                                        Hiện tại
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Connecting Line */}
                              {!isLast && (
                                <div className="flex-1 mx-4">
                                  <div
                                    className={`h-1 w-full rounded-full ${
                                      isPastStatus ||
                                      (isCurrentStatus && index < 3)
                                        ? "bg-green-600"
                                        : "bg-gray-300"
                                    }`}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {canView && activeMainTab === "management" && (
                <InventoryManagementOverview />
              )}

              {canViewResult && activeMainTab === "result" && <InventoryResultManager />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
