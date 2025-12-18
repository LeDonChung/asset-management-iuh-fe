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
  MoreVertical,
} from "lucide-react";
import { Alert, AlertStatus, AlertType } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableColumn } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { RootState } from "@/lib/store";
import {
  createAlertResolution,
  fetchAllAlert,
  filterAlert,
  AlertFilterRequest,
  moveAssetFromAlert,
} from "@/lib/store/slices/alertSlice";
import { fetchAllRooms, fetchRoomsByUnitId } from "@/lib/store/slices/roomSlice";
import { Room } from "@/types/asset";
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
  onResolve: (alertId: string, status: AlertStatus, note: string, toRoomId?: string) => void;
}

const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  alert,
  isOpen,
  onClose,
  onResolve,
}) => {
  const dispatch = useAppDispatch();
  const { rooms } = useAppSelector((state: RootState) => state.room);
  const { user } = useAuth();
  const [selectedResolution, setSelectedResolution] =
    useState<AlertStatus | null>(null);
  const [note, setNote] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");

  useEffect(() => {
    if (isOpen && user?.unitId) {
      dispatch(fetchRoomsByUnitId(user.unitId));
    }
  }, [isOpen, dispatch, user?.unitId]);

  useEffect(() => {
    if (isOpen) {
      setSelectedResolution(null);
      setNote("");
      setSelectedRoomId("");
    }
  }, [isOpen]);

  const handleResolve = () => {
    if (!selectedResolution) {
      window.alert("Vui lòng chọn loại xử lý");
      return;
    }

    if (selectedResolution === AlertStatus.CONFIRMED && !selectedRoomId) {
      window.alert("Vui lòng chọn phòng để di chuyển tài sản");
      return;
    }

    onResolve(alert.id, selectedResolution, note, selectedRoomId);
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

              {selectedResolution === AlertStatus.CONFIRMED && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <label className="block text-sm font-medium text-blue-800 mb-2">
                    Chọn phòng để di chuyển tài sản:
                  </label>
                  <select
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900"
                    required
                  >
                    <option value="">-- Chọn phòng --</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name} ({room.roomCode})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-blue-600 mt-1">
                    Tài sản sẽ được di chuyển tự động đến phòng đã chọn
                  </p>
                </div>
              )}

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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
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
    if (!canView) {
      router.push("/unauthorized");
    }
  }, [canView, router]);
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
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  useEffect(() => {
    handlerRender({
      ...currentFilter,
      search: debouncedSearchTerm || undefined,
      statusFilter: statusFilter || undefined,
      createdFrom: dateFrom || undefined,
      createdTo: dateTo || undefined,
    });
  }, [debouncedSearchTerm, statusFilter, dateFrom, dateTo]);

  const handlerRender = (currentFilter: AlertFilterRequest) => {
    dispatch(filterAlert(currentFilter));
  };

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleReceiveAlert = (alertDatas: any) => {
      alertDatas.forEach((alertData: any) => {
        setPendingAlertsFromSocket((prev) => {
          const exists = prev.some((alert) => alert.id === alertData.id);
          if (exists) return prev;

          return [...prev, alertData];
        });

        toast.success(
          `🚨 Cảnh báo mới: ${alertData.asset?.name} - ${
            alertData.room?.name || "N/A"
          }`,
          {
            duration: 5000,
            icon: "🚨",
          }
        );

        const now = new Date();
        const alertTime = new Date(alertData.createdAt);
        const diffMinutes = (now.getTime() - alertTime.getTime()) / (1000 * 60);

        if (diffMinutes <= 1) {
          setSelectedAlert(alertData);
          setShowUrgentModal(true);
        }
      });
    };

    on("receive_alert", handleReceiveAlert);

    return () => {
      off("receive_alert", handleReceiveAlert);
    };
  }, [socket, isConnected, on, off, dispatch]);

  useEffect(() => {
    if (pendingAlerts.length > 0 && !showUrgentModal) {
      const latestAlert = pendingAlerts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

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
    setShowUrgentModal(false);
    setSelectedAlert(null);
  };

  const handleViewDetail = (alertId: string) => {
    let alert = filteredAlerts.data.find((a) => a.id === alertId);
    if (!alert) {
      alert = pendingAlertsFromSocket.find((a) => a.id === alertId);
    }

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
    note: string,
    toRoomId?: string
  ) => {
    try {
      if (status === AlertStatus.CONFIRMED && toRoomId) {
        await dispatch(moveAssetFromAlert({ alertId, toRoomId, note })).unwrap();
        toast.success("Cảnh báo đã được xử lý và tài sản đã được di chuyển");
      } else {
        await dispatch(createAlertResolution({ alertId, status, note })).unwrap();
        toast.success("Cảnh báo đã được xử lý");
      }

      setPendingAlertsFromSocket((prev) =>
        prev.filter((alert) => alert.id !== alertId)
      );

      if (selectedAlert?.deviceId && socket) {
        socket.emit("send_stop_buzzer", selectedAlert.deviceId);
      }

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
      key: "room.name",
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
      title: "Thao tác",
      width: "120px",
      render: (_, alert) => (
        <div className="flex justify-start">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {canView && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetail(alert.id);
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span>Xem chi tiết</span>
                </DropdownMenuItem>
              )}
              {canResolve && alert.status === AlertStatus.PENDING && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetail(alert.id);
                  }}
                  className="flex items-center gap-2 cursor-pointer text-blue-600"
                >
                  <span>Xử lý cảnh báo</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      className: "text-right",
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center text-sm sm:text-base text-gray-600 mb-3">
            <span className="text-gray-900 font-semibold text-lg sm:text-xl">
              Cảnh báo di chuyển
            </span>
          </div>
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
      <div className="bg-white p-4 rounded-lg mb-6 border border-gray-300">
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
