"use client";

import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  Bell,
  Clock,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  MapPin,
  Package,
  X,
  FileText,
  Save,
} from "lucide-react";
import Link from "next/link";
import {
  Alert,
  AlertStatus,
  AlertType,
  AlertResolution,
  AlertResolutionStatus,
  Asset,
  Room,
  User,
} from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableColumn } from "@/components/ui/table";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { useAuth } from "@/contexts/AuthContext";
import { mockAlerts, AlertHelpers, MockDataHelper } from "@/lib/mockData";
import { useRouter } from "next/navigation";

interface AlertFilter {
  search?: string;
  status?: AlertStatus;
  type?: AlertType;
  dateFrom?: string;
  dateTo?: string;
}


interface AlertFilter {
  search?: string;
  status?: AlertStatus;
  type?: AlertType;
  dateFrom?: string;
  dateTo?: string;
}

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
                {alert.room ? MockDataHelper.formatRoomLocation(alert.room) : "N/A"}
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">Thời gian:</span>
              <span className="ml-2 font-medium">
                {new Date(alert.detectedAt).toLocaleString("vi-VN")}
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
  onResolve: (alertId: string, resolution: AlertResolutionStatus, note: string) => void;
}

const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  alert,
  isOpen,
  onClose,
  onResolve,
}) => {
  const [selectedResolution, setSelectedResolution] = useState<AlertResolutionStatus | null>(null);
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
      value: AlertResolutionStatus.CONFIRMED,
      label: "Đã xác minh (hợp lệ)",
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
    },
    {
      value: AlertResolutionStatus.FALSE_ALARM,
      label: "Sai phạm",
      icon: <XCircle className="h-4 w-4 text-red-500" />,
    },
    {
      value: AlertResolutionStatus.SYSTEM_ERROR,
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
          {/* Alert Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Tài sản:</label>
                <p className="text-gray-900">
                  {alert.asset?.name} (Mã TS: {alert.asset?.fixedCode})
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Loại:</label>
                <p className="text-red-600 font-medium">Di chuyển không hợp lệ</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Vị trí:</label>
                <p className="text-gray-900">
                  {alert.room ? MockDataHelper.formatRoomLocation(alert.room) : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Thời gian phát hiện:</label>
                <p className="text-gray-900">
                  {new Date(alert.detectedAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700">Trạng thái:</label>
                <div className="mt-1">
                  <Badge className={alert.status === AlertStatus.PENDING ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                    {alert.status === AlertStatus.PENDING ? "🔴 PENDING" : "🟢 RESOLVED"}
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
                    className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name="resolution"
                      value={option.value}
                      checked={selectedResolution === option.value}
                      onChange={(e) => setSelectedResolution(e.target.value as AlertResolutionStatus)}
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Laptop bị nhân viên mang đi họp, chưa xin phép..."
                />
              </div>
            </div>
          )}

          {/* Existing Resolution */}
          {alert.status === AlertStatus.RESOLVED && alert.resolution && (
            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-green-900 mb-4">
                ✅ Đã xử lý cảnh báo
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-green-700">Loại xử lý:</span>
                  <span className="ml-2">
                    {alert.resolution.resolution === AlertResolutionStatus.CONFIRMED && "Đã xác minh (hợp lệ)"}
                    {alert.resolution.resolution === AlertResolutionStatus.FALSE_ALARM && "Sai phạm"}
                    {alert.resolution.resolution === AlertResolutionStatus.SYSTEM_ERROR && "Lỗi hệ thống"}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-green-700">Thời gian xử lý:</span>
                  <span className="ml-2">
                    {new Date(alert.resolution.resolvedAt).toLocaleString("vi-VN")}
                  </span>
                </div>
                {alert.resolution.note && (
                  <div>
                    <span className="text-sm font-medium text-green-700">Ghi chú:</span>
                    <p className="ml-2 text-green-800">{alert.resolution.note}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </ModalBody>

      {alert.status === AlertStatus.PENDING && (
        <ModalFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
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

const statusColors = {
  [AlertStatus.PENDING]: "bg-red-100 text-red-800",
  [AlertStatus.RESOLVED]: "bg-green-100 text-green-800",
};

const statusLabels = {
  [AlertStatus.PENDING]: "🔴 PENDING",
  [AlertStatus.RESOLVED]: "🟢 RESOLVED",
};

export default function AlertPage() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>(mockAlerts);
  const [filter, setFilter] = useState<AlertFilter>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [showUrgentModal, setShowUrgentModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const { getCurrentRole } = useAuth();
  const router = useRouter();

  // Kiểm tra role
  const isSuperAdmin = getCurrentRole()?.code === "SUPER_ADMIN";
  const isAdmin = getCurrentRole()?.code === "ADMIN";
  const isPhongQuanTri = getCurrentRole()?.code === "PHONG_QUAN_TRI";

  // Get pending alerts for urgent notifications
  const pendingAlerts = alerts.filter(alert => alert.status === AlertStatus.PENDING);

  // Filter alerts
  useEffect(() => {
    let filtered = [...alerts];

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(
        (alert) =>
          alert.asset?.name.toLowerCase().includes(searchLower) ||
          alert.asset?.fixedCode.toLowerCase().includes(searchLower) ||
          (alert.room ? MockDataHelper.formatRoomLocation(alert.room).toLowerCase().includes(searchLower) : false)
      );
    }

    if (filter.status) {
      filtered = filtered.filter((alert) => alert.status === filter.status);
    }

    if (filter.type) {
      filtered = filtered.filter((alert) => alert.type === filter.type);
    }

    if (filter.dateFrom) {
      filtered = filtered.filter(
        (alert) => new Date(alert.detectedAt) >= new Date(filter.dateFrom!)
      );
    }

    if (filter.dateTo) {
      filtered = filtered.filter(
        (alert) => new Date(alert.detectedAt) <= new Date(filter.dateTo!)
      );
    }

    setFilteredAlerts(filtered);
    setCurrentPage(1);
  }, [alerts, filter]);

  // Show urgent alert modal for new pending alerts
  useEffect(() => {
    if (pendingAlerts.length > 0 && !showUrgentModal) {
      // Simulate new alert detection
      const latestAlert = pendingAlerts.sort(
        (a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
      )[0];
      
      // Show modal for alerts within last 5 minutes
      const now = new Date();
      const alertTime = new Date(latestAlert.detectedAt);
      const diffMinutes = (now.getTime() - alertTime.getTime()) / (1000 * 60);
      
      if (diffMinutes <= 5) {
        setSelectedAlert(latestAlert);
        setShowUrgentModal(true);
      }
    }
  }, [pendingAlerts.length]);

  const handleAcknowledge = (alertId: string) => {
    // Just close the modal, don't change status
    setShowUrgentModal(false);
    setSelectedAlert(null);
  };

  const handleViewDetail = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      setSelectedAlert(alert);
      setShowUrgentModal(false);
      setShowDetailModal(true);
    }
  };

  const handleResolveAlert = (alertId: string, resolution: AlertResolutionStatus, note: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? {
            ...alert,
            status: AlertStatus.RESOLVED,
            resolution: {
              id: `resolution-${Date.now()}`,
              alertId,
              resolverId: "current-user",
              resolution,
              note,
              resolvedAt: new Date().toISOString(),
            }
          }
        : alert
    ));

    window.alert("Cảnh báo đã được xử lý thành công!");
  };

  const resetFilters = () => {
    setFilter({});
    setFilteredAlerts(alerts);
    setCurrentPage(1);
  };

  // Define table columns
  const columns: TableColumn<Alert>[] = [
    {
      key: "detectedAt",
      title: "Thời gian",
      width: "150px",
      sortable: true,
      render: (_, alert) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {new Date(alert.detectedAt).toLocaleDateString("vi-VN")}
          </div>
          <div className="text-gray-500">
            {new Date(alert.detectedAt).toLocaleTimeString("vi-VN")}
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
      key: "location",
      title: "Vị trí",
      sortable: true,
      width: "180px",
      render: (_, alert) => (
        <div className="text-sm text-gray-900">
          {alert.room ? MockDataHelper.formatRoomLocation(alert.room) : "N/A"}
        </div>
      ),
    },
    {
      key: "status",
      sortable: true,
      title: "Trạng thái",
      width: "120px",
      render: (_, alert) => (
        <Badge className={statusColors[alert.status as keyof typeof statusColors]}>
          {statusLabels[alert.status as keyof typeof statusLabels]}
        </Badge>
      ),
    },
    {
      key: "actions",
      title: "Hành động",
      width: "120px",
      render: (_, alert) => (
        <div className="flex space-x-2">
          {alert.status === AlertStatus.PENDING ? (
            <Button
              size="sm"
              onClick={() => handleViewDetail(alert.id)}
              className="flex items-center"
            >
              <Eye className="h-3 w-3 mr-1" />
              Xử lý
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleViewDetail(alert.id)}
              className="flex items-center"
            >
              <Eye className="h-3 w-3 mr-1" />
              Chi tiết
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cảnh báo di chuyển</h1>
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {new Date(alert.detectedAt).toLocaleTimeString("vi-VN", { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
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
                          {alert.room ? MockDataHelper.formatRoomLocation(alert.room) : "N/A"}
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
                    <Button size="sm" className="w-full bg-red-600 hover:bg-red-700 text-white">
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
      <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên tài sản, mã tài sản hoặc vị trí..."
              value={filter.search || ""}
              onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10"
            />
          </div>
          <select
            value={filter.status || ""}
            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value as AlertStatus || undefined }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value={AlertStatus.PENDING}>Chờ xử lý</option>
            <option value={AlertStatus.RESOLVED}>Đã xử lý</option>
          </select>
          <input
            type="date"
            value={filter.dateFrom || ""}
            onChange={(e) => setFilter(prev => ({ ...prev, dateFrom: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Từ ngày"
          />
          <input
            type="date"
            value={filter.dateTo || ""}
            onChange={(e) => setFilter(prev => ({ ...prev, dateTo: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Đến ngày"
          />
          {(filter.search || filter.status || filter.dateFrom || filter.dateTo) && (
            <Button variant="outline" onClick={resetFilters}>
              <X className="h-4 w-4 mr-2" />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* Filter Results Info */}
      {(filter.search || filter.status || filter.dateFrom || filter.dateTo) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Kết quả lọc: {filteredAlerts.length} / {alerts.length} cảnh báo
              </span>
            </div>
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      )}

      {/* Alerts Table */}
      <Table
        columns={columns}
        data={filteredAlerts}
        emptyText="Không có cảnh báo nào"
        emptyIcon={<AlertCircle className="mx-auto h-12 w-12 text-gray-400" />}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize: itemsPerPage,
          total: filteredAlerts.length,
          onChange: (page, pageSize) => {
            setCurrentPage(page);
            if (pageSize !== itemsPerPage) {
              setItemsPerPage(pageSize);
              setCurrentPage(1);
            }
          },
          showSizeChanger: true,
          pageSizeOptions: [5, 10, 20, 50]
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
