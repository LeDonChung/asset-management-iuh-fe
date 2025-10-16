"use client";

import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  Clock,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MapPin,
  Package,
  Save,
  Workflow,
} from "lucide-react";
import { Alert, AlertStatus, AlertType } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableColumn } from "@/components/ui/table";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { MockDataHelper } from "@/lib/mockData";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { RootState } from "@/lib/store";
import {
  createAlertResolution,
  fetchAllAlert,
  filterAlert,
  AlertFilterRequest,
} from "@/lib/store/slices/alertSlice";
import toast from "react-hot-toast";
import { useSocket } from "@/contexts/SocketContext";
import { useAuth } from "@/contexts/AuthContext";
import { PermissionConstants } from "@/lib/constants/permissions";

// Alert status options for filter dropdown
const alertStatusOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: AlertStatus.PENDING, label: "Chờ xử lý" },
  { value: AlertStatus.CONFIRMED, label: "Đã xác minh" },
  { value: AlertStatus.FALSE_ALARM, label: "Sai phạm" },
  { value: AlertStatus.SYSTEM_ERROR, label: "Lỗi hệ thống" },
];

// Urgent Alert Modal Component
interface UrgentAlertModalProps {
  alert: Alert;
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge: (alertId: string) => void;
  onViewDetail: (alertId: string) => void;
}

const UrgentAlertModal: React.FC<UrgentAlertModalProps> = ({
  alert,
  isOpen,
  onClose,
  onAcknowledge,
  onViewDetail,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="⚠️ CẢNH BÁO MỚI VỪA PHÁT HIỆN"
      size="md"
    >
      <ModalBody>
        <div className="space-y-4">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>

          {/* Alert Image if available */}
          {alert.image && (
            <div className="mb-4">
              <img
                src={alert.image}
                alt="Hình ảnh cảnh báo"
                className="w-full h-48 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}

          <div className="border-t border-b border-gray-200 py-4 space-y-3">
            <div className="flex items-center">
              <Package className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">Tài sản:</span>
              <span className="ml-2 font-medium">{alert.asset?.name}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">Vị trí:</span>
              <span className="ml-2 font-medium">
                {alert.room ? alert.room.name : "N/A"}
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">Thời gian:</span>
              <span className="ml-2 font-medium">
                {new Date(alert.createdAt).toLocaleString("vi-VN")}
              </span>
            </div>
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
              <span className="text-sm text-gray-600">Loại:</span>
              <span className="ml-2 font-medium text-red-600">
                Di chuyển không hợp lệ
              </span>
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button
          variant="outline"
          onClick={() => onAcknowledge(alert.id)}
          className="flex items-center"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Đã biết
        </Button>
        <Button
          onClick={() => onViewDetail(alert.id)}
          className="flex items-center"
        >
          <Eye className="h-4 w-4 mr-2" />
          Xem chi tiết
        </Button>
      </ModalFooter>
    </Modal>
  );
};

// Alert Detail Modal Component
interface AlertDetailModalProps {
  alert: Alert;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (alertId: string, status: AlertStatus, note: string) => void;
}

const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  alert,
  isOpen,
  onClose,
  onResolve,
}) => {
  const [selectedResolution, setSelectedResolution] =
    useState<AlertStatus | null>(null);
  const [note, setNote] = useState("");

  const handleResolve = () => {
    if (!selectedResolution) {
      window.alert("Vui lòng chọn loại xử lý");
      return;
    }

    onResolve(alert.id, selectedResolution, note);
    onClose();
  };

  const resolutionOptions = [
    {
      value: AlertStatus.CONFIRMED,
      label: "Đã xác minh (hợp lệ)",
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
    },
    {
      value: AlertStatus.FALSE_ALARM,
      label: "Sai phạm",
      icon: <XCircle className="h-4 w-4 text-red-500" />,
    },
    {
      value: AlertStatus.SYSTEM_ERROR,
      label: "Lỗi hệ thống",
      icon: <AlertCircle className="h-4 w-4 text-blue-500" />,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết cảnh báo"
      size="xl"
    >
      <ModalBody>
        <div className="space-y-6">
          {/* Alert Image if available */}
          {alert.image && (
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Hình ảnh cảnh báo:
              </label>
              <img
                src={alert.image}
                alt="Hình ảnh cảnh báo"
                className="w-full max-w-md h-64 object-cover rounded-lg border border-gray-200 mx-auto"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}

          {/* Alert Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Tài sản:
                </label>
                <p className="text-gray-900">
                  {alert.asset?.name} (Mã TS: {alert.asset?.fixedCode})
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Loại:
                </label>
                <p className="text-red-600 font-medium">
                  Di chuyển không hợp lệ
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Vị trí:
                </label>
                <p className="text-gray-900">
                  {alert.room ? alert.room.name : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Thời gian phát hiện:
                </label>
                <p className="text-gray-900">
                  {new Date(alert.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Trạng thái:
                </label>
                <div className="mt-1">
                  <Badge
                    className={
                      alert.status === AlertStatus.PENDING
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }
                  >
                    {alert.status === AlertStatus.PENDING
                      ? "Chưa xử lý"
                      : "Đã xử lý"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Resolution Form */}
          {alert.status === AlertStatus.PENDING && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                Xử lý cảnh báo
              </h3>

              <div className="space-y-3 mb-4">
                {resolutionOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center text-gray-900 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name="resolution"
                      value={option.value}
                      checked={selectedResolution === option.value}
                      onChange={(e) =>
                        setSelectedResolution(e.target.value as AlertStatus)
                      }
                      className="mr-3"
                    />
                    {option.icon}
                    <span className="ml-2">{option.label}</span>
                  </label>
                ))}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú:
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg placeholder:text-gray-400 text-gray-900"
                  rows={3}
                  placeholder="Nhập ghi chú (tùy chọn)..."
                />
              </div>
            </div>
          )}

          {/* Existing Resolution */}
          {alert.status !== AlertStatus.PENDING && (
            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-green-900 mb-4">
                Đã xử lý cảnh báo
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-green-700">
                    Loại xử lý:
                  </span>
                  <span className="ml-2 text-gray-800">
                    {alert.status === AlertStatus.CONFIRMED &&
                      "Đã xác minh (hợp lệ)"}
                    {alert.status === AlertStatus.FALSE_ALARM && "Sai phạm"}
                    {alert.status === AlertStatus.SYSTEM_ERROR &&
                      "Lỗi hệ thống"}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-green-700">
                    Thời gian xử lý:
                  </span>
                  <span className="ml-2 text-gray-800">
                    {alert.resolvedAt &&
                      new Date(alert.resolvedAt).toLocaleString("vi-VN")}
                  </span>
                </div>
                {alert.note && (
                  <div>
                    <span className="text-sm font-medium text-green-700">
                      Ghi chú:
                    </span>
                    <p className="ml-2 text-gray-800">{alert.note}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </ModalBody>

      {alert.status === AlertStatus.PENDING && (
        <ModalFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            onClick={handleResolve}
            className="flex items-center"
            disabled={!selectedResolution}
          >
            <Save className="h-4 w-4 mr-2" />
            Cập nhật xử lý
          </Button>
        </ModalFooter>
      )}
    </Modal>
  );
};

export default function AlertPage() {
  const dispatch = useAppDispatch();
  const { lstAllAlert, filteredAlerts, currentFilter, loading } =
    useAppSelector((state: RootState) => state.alert);
  const { socket, isConnected, on, off } = useSocket();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AlertStatus>();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showUrgentModal, setShowUrgentModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [pendingAlertsFromSocket, setPendingAlertsFromSocket] = useState<
    Alert[]
  >([]);
  const router = useRouter();
  const { hasAnyPermission } = useAuth();
  const canResolve = hasAnyPermission([PermissionConstants.PERM_RESOLVE_ALERT]);
  const canView = hasAnyPermission([PermissionConstants.PERM_VIEW_ALERT]);
  useEffect(() => {
    if (!canResolve && !canView) {
      router.push("/unauthorized");
    }
  }, [canResolve, canView, router]);
  // Get pending alerts for urgent notifications (combine from store and socket)
  const pendingAlerts = [...pendingAlertsFromSocket];

  useEffect(() => {
    if (!canView) {
      router.push("/unauthorized");
    }
  }, [canView, router]);
  useEffect(() => {
    const loadData = () => {
      try {
        dispatch(filterAlert(currentFilter));
      } catch (e: any) {
        toast.error(e.message || "Có lỗi xảy ra.");
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    handlerRender({
      ...currentFilter,
      search: searchTerm || undefined,
      statusFilter: statusFilter || undefined,
      createdFrom: dateFrom || undefined,
      createdTo: dateTo || undefined,
    });
  }, [searchTerm, statusFilter, dateFrom, dateTo]);

  const handlerRender = (currentFilter: AlertFilterRequest) => {
    dispatch(filterAlert(currentFilter));
  };

  // Socket listener for receiving new alerts
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleReceiveAlert = (alertDatas: any) => {
      console.log("Received new alerts via socket:", alertDatas);
      // For simplicity, handle one alert at a time
      alertDatas.forEach((alertData: any) => {
        // Add to pending alerts from socket
        setPendingAlertsFromSocket((prev) => {
          // Check if alert already exists to avoid duplicates
          const exists = prev.some((alert) => alert.id === alertData.id);
          if (exists) return prev;

          return [...prev, alertData];
        });

        // Show toast notification
        toast.success(
          `🚨 Cảnh báo mới: ${alertData.asset?.name} - ${
            alertData.room?.name || "N/A"
          }`,
          {
            duration: 5000,
            icon: "🚨",
          }
        );

        // Show urgent modal for new alert if it's really urgent (within last minute)
        const now = new Date();
        const alertTime = new Date(alertData.createdAt);
        const diffMinutes = (now.getTime() - alertTime.getTime()) / (1000 * 60);

        if (diffMinutes <= 1) {
          setSelectedAlert(alertData);
          setShowUrgentModal(true);
        }
      });
    };

    // Register socket listener
    on("receive_alert", handleReceiveAlert);

    // Cleanup on unmount
    return () => {
      off("receive_alert", handleReceiveAlert);
    };
  }, [socket, isConnected, on, off, dispatch]);

  // Show urgent alert modal for new pending alerts
  useEffect(() => {
    if (pendingAlerts.length > 0 && !showUrgentModal) {
      // Simulate new alert detection
      const latestAlert = pendingAlerts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

      // Show modal for alerts within last 5 minutes
      const now = new Date();
      const alertTime = new Date(latestAlert.createdAt);
      const diffMinutes = (now.getTime() - alertTime.getTime()) / (1000 * 60);

      if (diffMinutes <= 5) {
        setSelectedAlert(latestAlert);
        setShowUrgentModal(true);
      }
    }
  }, [pendingAlerts.length]);

  const handleAcknowledge = (alertId: string) => {
    // Just close the modal, don't change status
    // But keep the alert in pending list for processing later
    setShowUrgentModal(false);
    setSelectedAlert(null);
  };

  const handleViewDetail = (alertId: string) => {
    // First try to find in filtered alerts (table data)
    let alert = filteredAlerts.data.find((a) => a.id === alertId);

    // If not found, try to find in pending alerts from socket
    if (!alert) {
      alert = pendingAlertsFromSocket.find((a) => a.id === alertId);
    }

    // If still not found, try to find in all alerts
    if (!alert) {
      alert = lstAllAlert.find((a) => a.id === alertId);
    }

    if (alert) {
      setSelectedAlert(alert);
      setShowUrgentModal(false);
      setShowDetailModal(true);
    } else {
      toast.error("Không tìm thấy thông tin cảnh báo");
    }
  };

  const handleResolveAlert = async (
    alertId: string,
    status: AlertStatus,
    note: string
  ) => {
    try {
      await dispatch(createAlertResolution({ alertId, status, note })).unwrap();

      toast.success("Cảnh báo đã được xử lý");

      // Remove from pending alerts from socket if exists
      setPendingAlertsFromSocket((prev) =>
        prev.filter((alert) => alert.id !== alertId)
      );

      // Gửi lệnh dừng buzzer đến thiết bị
      if (selectedAlert?.deviceId && socket) {
        socket.emit("send_stop_buzzer", selectedAlert.deviceId);
      }

      // Refresh the alerts list to get updated data
      dispatch(filterAlert(currentFilter));
    } catch (error: any) {
      toast.error(
        "Có lỗi xảy ra khi xử lý cảnh báo: " +
          (error.message || "Unknown error")
      );
    }

    setShowDetailModal(false);
    setSelectedAlert(null);
  };

  // Define table columns
  const columns: TableColumn<Alert>[] = [
    {
      key: "createdAt",
      title: "Thời gian",
      width: "150px",
      sortable: true,
      render: (_, alert) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {new Date(alert.createdAt).toLocaleDateString("vi-VN")}
          </div>
          <div className="text-gray-500">
            {new Date(alert.createdAt).toLocaleTimeString("vi-VN")}
          </div>
        </div>
      ),
    },
    {
      key: "asset",
      title: "Tài sản",
      width: "200px",
      render: (_, alert) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{alert.asset?.name}</div>
          <div className="text-gray-500">{alert.asset?.fixedCode}</div>
        </div>
      ),
    },
    {
      key: "image",
      title: "Hình ảnh",
      width: "100px",
      render: (_, alert) =>
        alert.image ? (
          <img
            src={alert.image}
            alt="Ảnh cảnh báo"
            className="w-16 h-12 object-cover rounded border border-gray-200"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="w-16 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-400">Không có</span>
          </div>
        ),
    },
    {
      key: "location",
      title: "Vị trí",
      sortable: true,
      width: "180px",
      render: (_, alert) => (
        <div className="text-sm text-gray-900">
          {alert.room?.name ? alert.room?.name : "N/A"}
        </div>
      ),
    },
    {
      key: "status",
      title: "Trạng thái",
      width: "120px",
      render: (_, alert) => (
        <Badge
          className={
            alert.status === AlertStatus.PENDING
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }
        >
          {alert.status === AlertStatus.PENDING ? "CHỜ XỬ LÝ" : "ĐÃ XỬ LÝ"}
        </Badge>
      ),
    },
    {
      key: "actions",
      title: "Hành động",
      width: "80px",
      render: (_, alert) => (
        <div className="flex items-center gap-2">
          {alert.status === AlertStatus.PENDING ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Processing alert:", alert.id);
                handleViewDetail(alert.id);
              }}
              title="Xử lý"
            >
              <Workflow className="h-4 w-4 text-blue-600" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Viewing alert:", alert.id);
                handleViewDetail(alert.id);
              }}
              title="Xem"
            >
              <Eye className="h-4 w-4 text-gray-600" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Cảnh báo di chuyển
          </h1>
          <p className="text-gray-600">
            Giám sát và xử lý các cảnh báo di chuyển tài sản không hợp lệ
          </p>
        </div>
      </div>

      {/* Current Alerts Panel */}
      {pendingAlerts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6">
            <div className="flex items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                CẢNH BÁO HIỆN TẠI
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingAlerts.slice(0, 6).map((alert) => (
                <div
                  key={alert.id}
                  className="group bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-red-300"
                  onClick={() => handleViewDetail(alert.id)}
                >
                  <div className="space-y-3">
                    {/* Alert Image if available */}
                    {alert.image && (
                      <div className="mb-3">
                        <img
                          src={alert.image}
                          alt="Hình ảnh cảnh báo"
                          className="w-full h-24 object-cover rounded-md border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {new Date(alert.createdAt).toLocaleTimeString(
                            "vi-VN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                      <Badge className="bg-red-500 text-white px-2 py-1 text-xs animate-pulse">
                        GẤP
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-gray-600" />
                        <span className="font-semibold text-gray-900 truncate">
                          {alert.asset?.name}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700 text-sm truncate">
                          {alert.room ? alert.room.name : "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center text-xs text-gray-600">
                        <AlertTriangle className="h-3 w-3 mr-1 text-red-500" />
                        <span>Di chuyển không hợp lệ</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                      Xử lý ngay
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {pendingAlerts.length > 6 && (
              <div className="text-center py-4 mt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600 font-medium bg-gray-100 px-3 py-2 rounded-full">
                  ...và {pendingAlerts.length - 6} cảnh báo khác đang chờ xử lý
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm theo tên tài sản, mã tài sản hoặc vị trí..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter || ""}
            onChange={(e) => setStatusFilter(e.target.value as AlertStatus)}
          >
            {alertStatusOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {/* Date From Filter */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Từ ngày"
          />

          {/* Date To Filter */}
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Đến ngày"
          />
        </div>
      </div>

      {/* Alerts Table */}
      <Table<Alert>
        columns={columns}
        data={filteredAlerts.data}
        emptyText="Không có cảnh báo nào"
        emptyIcon={<AlertCircle className="mx-auto h-12 w-12 text-gray-400" />}
        rowKey="id"
        multiSort={true}
        sortConfigs={currentFilter.sorting}
        onSortChange={(sortConfigs) => {
          handlerRender({
            ...currentFilter,
            sorting: sortConfigs,
          });
        }}
        pagination={{
          current: filteredAlerts?.pagination.page || 1,
          pageSize: filteredAlerts?.pagination.limit || 10,
          total: filteredAlerts?.pagination.total || 0,
          onChange: (page, pageSize) => {
            handlerRender({
              ...currentFilter,
              pagination: {
                currentPage: page,
                itemsPerPage: pageSize,
              },
            });
          },
          showSizeChanger: true,
          pageSizeOptions: [5, 10, 20, 50],
          serverSide: true,
        }}
        title="Danh sách cảnh báo"
      />

      {/* Urgent Alert Modal */}
      {selectedAlert && (
        <UrgentAlertModal
          alert={selectedAlert}
          isOpen={showUrgentModal}
          onClose={() => setShowUrgentModal(false)}
          onAcknowledge={handleAcknowledge}
          onViewDetail={handleViewDetail}
        />
      )}

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedAlert(null);
          }}
          onResolve={handleResolveAlert}
        />
      )}
    </div>
  );
}
