"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useAppDispatch } from "@/lib/store/hooks";
import {
  filterSimplifiedMovements,
  getMovementById,
  proposeMovement,
  approveMovement,
  rejectMovement,
  executeMovement,
  deleteMovement,
  setCurrentFilter,
  MoveStatus,
  MovementFilterDto,
  SimplifiedMovementResponseDto,
} from "@/lib/store/slices/moveSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableColumn } from "@/components/ui/table";
import {
  Plus,
  Search,
  RefreshCw,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Play,
  MoreVertical,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { RoleBase } from "@/lib/constants/role";
import toast from "react-hot-toast";
import Link from "next/link";
import { PermissionConstants } from "@/constants";
import TransactionStatusModal from "@/components/modal/TransactionStatusModal";

// Helper function to render movement status badge
const getMovementStatusBadge = (status: MoveStatus) => {
  const statusConfig = {
    [MoveStatus.DRAFT]: {
      label: "Nháp",
      className: "bg-gray-100 text-gray-800 border border-gray-200",
    },
    [MoveStatus.PENDING_APPROVAL]: {
      label: "Chờ phê duyệt",
      className: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    },
    [MoveStatus.APPROVED]: {
      label: "Đã phê duyệt",
      className: "bg-blue-100 text-blue-800 border border-blue-200",
    },
    [MoveStatus.REJECTED]: {
      label: "Bị từ chối",
      className: "bg-red-100 text-red-800 border border-red-200",
    },
    [MoveStatus.COMPLETED]: {
      label: "Hoàn thành",
      className: "bg-green-100 text-green-800 border border-green-200",
    },
    [MoveStatus.CANCELLED]: {
      label: "Đã hủy",
      className: "bg-gray-100 text-gray-800 border border-gray-300",
    },
  };

  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800 border border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
};

// Status filter options
const statusFilterOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: MoveStatus.DRAFT, label: "Nháp" },
  { value: MoveStatus.PENDING_APPROVAL, label: "Chờ phê duyệt" },
  { value: MoveStatus.APPROVED, label: "Đã phê duyệt" },
  { value: MoveStatus.REJECTED, label: "Bị từ chối" },
  { value: MoveStatus.COMPLETED, label: "Hoàn thành" },
  { value: MoveStatus.CANCELLED, label: "Đã hủy" },
];

export default function MovementManagementPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { hasRole, user } = useAuth();

  const isAdmin = hasRole([RoleBase.ADMIN]);
  const isAdminDept = hasRole([RoleBase.ADMIN_DEPT]);
  const isUserDept = hasRole([RoleBase.USER_DEPT]);

  const {
    filteredMovements,
    currentFilter,
    isFilteringMovements,
    isProposingMovement,
    isApprovingMovement,
    isRejectingMovement,
    loading,
  } = useSelector((state: RootState) => state.move);

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Dialog states for delete
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    movement: SimplifiedMovementResponseDto | null;
  }>({
    isOpen: false,
    movement: null,
  });

  // Modal states for propose/approve/reject
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"propose" | "approve" | "reject" | null>(null);
  const [selectedMovementId, setSelectedMovementId] = useState<string | null>(null);

  // Load movements on component mount and filter changes
  useEffect(() => {
    const filterRequest: MovementFilterDto = {
      pagination: {
        currentPage: 1,
        itemsPerPage: 10,
      },
      sorting: [],
      search: searchTerm || undefined,
      status: (selectedStatus as MoveStatus) || undefined,
    };

    dispatch(setCurrentFilter(filterRequest));
    dispatch(filterSimplifiedMovements(filterRequest));
  }, [dispatch, searchTerm, selectedStatus]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
  };

  const handleRefresh = () => {
    dispatch(filterSimplifiedMovements(currentFilter));
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    const newFilter = {
      ...currentFilter,
      pagination: {
        currentPage: page,
        itemsPerPage: pageSize,
      },
    };
    dispatch(setCurrentFilter(newFilter));
    dispatch(filterSimplifiedMovements(newFilter));
  };

  const openActionDialog = (
    type: "propose" | "approve" | "reject" | "delete",
    movement: SimplifiedMovementResponseDto
  ) => {
    if (type === "delete") {
      setDeleteDialog({
        isOpen: true,
        movement,
      });
    } else {
      setSelectedMovementId(movement.id);
      setModalType(type);
      setIsModalOpen(true);
    }
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      movement: null,
    });
  };

  const handleDelete = async () => {
    if (!deleteDialog.movement) return;

    try {
      await dispatch(deleteMovement(deleteDialog.movement.id)).unwrap();
      toast.success("Đã xóa yêu cầu di chuyển thành công!");
      closeDeleteDialog();
      handleRefresh();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Có lỗi xảy ra khi xóa!");
    }
  };

  const handleModalConfirm = async (data: {
    note?: string;
    approvalNote?: string;
    rejectionReason?: string;
    evidenceUrl?: string;
  }) => {
    if (!selectedMovementId) return;

    try {
      switch (modalType) {
        case "propose":
          await dispatch(
            proposeMovement({
              id: selectedMovementId,
              proposeDto: { note: data.note },
            })
          ).unwrap();
          toast.success("Đã đề xuất yêu cầu di chuyển thành công!");
          break;

        case "approve":
          await dispatch(
            approveMovement({
              id: selectedMovementId,
              approveDto: { 
                approvalNote: data.approvalNote,
                evidenceUrl: data.evidenceUrl 
              },
            })
          ).unwrap();
          toast.success("Đã phê duyệt yêu cầu di chuyển thành công!");
          break;

        case "reject":
          if (!data.rejectionReason?.trim()) {
            toast.error("Vui lòng nhập lý do từ chối!");
            return;
          }
          await dispatch(
            rejectMovement({
              id: selectedMovementId,
              rejectDto: { rejectionReason: data.rejectionReason },
            })
          ).unwrap();
          toast.success("Đã từ chối yêu cầu di chuyển!");
          break;
      }

      setIsModalOpen(false);
      handleRefresh();
    } catch (error: any) {
      console.error("Action error:", error);
      toast.error(error.message || "Có lỗi xảy ra khi thực hiện thao tác!");
    }
  };
  const { hasAnyPermission } = useAuth();
  const canApprove = hasAnyPermission([PermissionConstants.PERM_APPROVE_MOVEMENT]);
  const canPropose = hasAnyPermission([PermissionConstants.PERM_PROPOSE_MOVEMENT]);
  const canDelete = hasAnyPermission([PermissionConstants.PERM_REMOVE_MOVEMENT]);
  const canView = hasAnyPermission([PermissionConstants.PERM_VIEW_MOVEMENT]);
  const canPerformAction = (movement: SimplifiedMovementResponseDto, action: string) => {
    const isRequester = movement.requester?.id === user?.id;

    switch (action) {
      case "edit":
        return movement.status === MoveStatus.DRAFT && isRequester;
      case "propose":
        return movement.status === MoveStatus.DRAFT && isRequester && canPropose;
      case "approve":
        return movement.status === MoveStatus.PENDING_APPROVAL && canApprove;
      case "reject":
        return (movement.status === MoveStatus.PENDING_APPROVAL || movement.status === MoveStatus.APPROVED) && canApprove;
      case "delete":
        return (movement.status === MoveStatus.DRAFT || movement.status === MoveStatus.REJECTED || movement.status === MoveStatus.CANCELLED) && (isRequester || canApprove);
      default:
        return false;
    }
  };

  // Define table columns
  const columns: TableColumn<SimplifiedMovementResponseDto>[] = [
    {
      key: "requester",
      title: "Người yêu cầu",
      render: (_, record) => (
        <div className="text-sm text-gray-900">
          {record.requester?.fullName || "N/A"}
        </div>
      ),
      sortable: true,
    },
    {
      key: "itemCount",
      title: "Số tài sản",
      render: (_, record) => (
        <div className="text-sm font-medium text-gray-900 text-center">
          {record.itemCount}
        </div>
      ),
      sortable: true,
      className: "text-center",
    },
    {
      key: "requestNote",
      title: "Ghi chú",
      render: (_, record) => (
        <div className="text-sm text-gray-500 max-w-xs truncate">
          {record.requestNote || "-"}
        </div>
      ),
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (_, record) => (
        <div className="flex justify-center">
          {getMovementStatusBadge(record.status)}
        </div>
      ),
      sortable: true,
      className: "text-center",
    },
    {
      key: "approver",
      title: "Người phê duyệt",
      render: (_, record) => (
        <div className="text-sm text-gray-900">
          {record.approver?.fullName || "-"}
        </div>
      ),
      sortable: true,
    },
    {
      key: "createdAt",
      title: "Ngày tạo",
      render: (_, record) => (
        <div className="text-sm text-gray-900">
          {new Date(record.createdAt).toLocaleDateString("vi-VN")}
        </div>
      ),
      sortable: true,
    },
    {
      key: "actions",
      title: "Thao tác",
      render: (_, record) => (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52">
              {/* View Details */}
              <DropdownMenuItem
                onClick={() => router.push(`/asset/move/${record.id}`)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <span>Xem chi tiết</span>
              </DropdownMenuItem>

              {/* Edit (Draft only) */}
              {canPerformAction(record, "edit") && (
                <DropdownMenuItem
                  onClick={() => router.push(`/asset/move/${record.id}/edit`)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span>Chỉnh sửa</span>
                </DropdownMenuItem>
              )}

              {/* Propose */}
              {canPerformAction(record, "propose") && (
                <DropdownMenuItem
                  onClick={() => openActionDialog("propose", record)}
                  className="flex items-center gap-2 cursor-pointer text-blue-600"
                >
                  <span>Đề xuất</span>
                </DropdownMenuItem>
              )}

              {/* Approve */}
              {canPerformAction(record, "approve") && (
                <DropdownMenuItem
                  onClick={() => openActionDialog("approve", record)}
                  className="flex items-center gap-2 cursor-pointer text-green-600"
                >
                  <span>Phê duyệt</span>
                </DropdownMenuItem>
              )}

              {/* Reject */}
              {canPerformAction(record, "reject") && (
                <DropdownMenuItem
                  onClick={() => openActionDialog("reject", record)}
                  className="flex items-center gap-2 cursor-pointer text-red-600"
                >
                  <span>Từ chối</span>
                </DropdownMenuItem>
              )}

              {/* Delete */}
              {canPerformAction(record, "delete") && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => openActionDialog("delete", record)}
                    className="flex items-center gap-2 cursor-pointer text-red-600"
                  >
                    <span>Xóa</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      className: "text-center",
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Di chuyển</h1>
          <p className="text-gray-600">
            Quản lý các yêu cầu di chuyển tài sản giữa các phòng
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isFilteringMovements}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFilteringMovements ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
          <Link href="/asset/asset-book">
            <Button className="flex items-center bg-green-600 hover:bg-green-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Tạo yêu cầu mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-300 mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Bộ lọc</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo mã yêu cầu, ghi chú..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedStatus}
              onChange={(e) => handleStatusFilter(e.target.value)}
            >
              {statusFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Movements Table */}
      <Table<SimplifiedMovementResponseDto>
        columns={columns}
        data={filteredMovements.data}
        loading={isFilteringMovements}
        emptyText="Không tìm thấy yêu cầu di chuyển nào"
        emptyIcon={
          <div className="h-12 w-12 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <span className="text-gray-400 font-bold text-xl">📦</span>
          </div>
        }
        pagination={{
          current: filteredMovements?.pagination.page || 1,
          pageSize: filteredMovements?.pagination.limit || 10,
          total: filteredMovements?.pagination.total || 0,
          onChange: handlePaginationChange,
          showSizeChanger: true,
          serverSide: true,
        }}
      />

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={closeDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa yêu cầu di chuyển</DialogTitle>
            <DialogDescription>
              Xóa vĩnh viễn yêu cầu di chuyển này. Thao tác này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteDialog}>
              Hủy
            </Button>
            <Button
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading && (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              )}
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Modal */}
      <TransactionStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalConfirm}
        title={
          modalType === "propose"
            ? "Đề xuất yêu cầu di chuyển"
            : modalType === "approve"
            ? "Phê duyệt yêu cầu di chuyển"
            : "Từ chối yêu cầu di chuyển"
        }
        description={
          modalType === "propose"
            ? "Gửi yêu cầu di chuyển để chờ phê duyệt."
            : modalType === "approve"
            ? "Phê duyệt yêu cầu di chuyển này. Bạn có thể đính kèm file minh chứng."
            : "Từ chối yêu cầu di chuyển này."
        }
        action={modalType || "propose"}
        isLoading={isProposingMovement || isApprovingMovement || isRejectingMovement}
      />
    </div>
  );
}