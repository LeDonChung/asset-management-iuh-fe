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
  ChevronRight,
  ArrowRightLeft,
  Users,
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
  { value: MoveStatus.CANCELLED, label: "Đã hủy" },
];

export default function MovementManagementPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  const {
    filteredMovements,
    currentFilter,
    isFilteringMovements,
    isProposingMovement,
    isApprovingMovement,
    isRejectingMovement,
    loading,
  } = useSelector((state: RootState) => state.move);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    movement: SimplifiedMovementResponseDto | null;
  }>({
    isOpen: false,
    movement: null,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"propose" | "approve" | "reject" | null>(null);
  const [selectedMovementId, setSelectedMovementId] = useState<string | null>(null);

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
              proposeDto: { 
                note: data.note,
                evidenceUrl: data.evidenceUrl 
              },
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
        return (movement.status === MoveStatus.DRAFT || movement.status === MoveStatus.REJECTED) && isRequester;
      case "propose":
        return (movement.status === MoveStatus.DRAFT || movement.status === MoveStatus.REJECTED) && isRequester && canPropose;
      case "approve":
        return movement.status === MoveStatus.PENDING_APPROVAL && canApprove;
      case "reject":
        return movement.status === MoveStatus.PENDING_APPROVAL && canApprove;
      case "delete":
        return movement.status === MoveStatus.DRAFT && (isRequester || canApprove);
      default:
        return false;
    }
  };

  const stats = React.useMemo(() => {
    const data = filteredMovements.data;
    return {
      total: data.length,
      draft: data.filter((m: any) => m.status === MoveStatus.DRAFT).length,
      pendingApproval: data.filter((m: any) => m.status === MoveStatus.PENDING_APPROVAL).length,
      approved: data.filter((m: any) => m.status === MoveStatus.APPROVED).length,
      rejected: data.filter((m: any) => m.status === MoveStatus.REJECTED).length,
      cancelled: data.filter((m: any) => m.status === MoveStatus.CANCELLED).length,
    };
  }, [filteredMovements.data]);

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
      title: "Ngày yêu cầu",
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
                  <span>{record.status === MoveStatus.REJECTED ? "Đề xuất" : "Đề xuất"}</span>
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

  const canCreate = hasAnyPermission([PermissionConstants.PERM_PROPOSE_MOVEMENT]);

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center text-sm sm:text-base text-gray-600 mb-3">
              <button
                onClick={() => router.push("/asset/asset-book")}
                className="hover:text-blue-600 text-lg sm:text-xl transition-colors font-semibold cursor-pointer"
              >
                Tài sản
              </button>
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 mx-1 sm:mx-2" />
              <span className="text-gray-900 font-semibold text-lg sm:text-xl">
                Di chuyển
              </span>
            </div>
          </div>
          {canCreate && (
            <Link href="/asset/asset-book">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Tạo yêu cầu mới
              </Button>
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng số</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <ArrowRightLeft className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nháp</p>
                <p className="text-2xl font-bold text-gray-600">
                  {stats.draft}
                </p>
              </div>
              <Clock className="h-8 w-8 text-gray-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chờ phê duyệt</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pendingApproval}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Đã phê duyệt
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.approved}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Hoàn thành
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.completed}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm theo mã yêu cầu, ghi chú..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

        {/* Movements Table */}
        <Table<SimplifiedMovementResponseDto>
          columns={columns}
          data={filteredMovements.data}
          loading={isFilteringMovements}
          emptyText="Không tìm thấy yêu cầu di chuyển nào"
          emptyIcon={
            <ArrowRightLeft className="mx-auto h-12 w-12 text-gray-400" />
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
      </div>

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
            ? "Gửi yêu cầu di chuyển để chờ phê duyệt. Bạn có thể đính kèm file minh chứng."
            : modalType === "approve"
            ? "Phê duyệt yêu cầu di chuyển này. Bạn có thể đính kèm file minh chứng."
            : "Từ chối yêu cầu di chuyển này."
        }
        action={modalType || "propose"}
        isLoading={isProposingMovement || isApprovingMovement || isRejectingMovement}
      />
    </>
  );
}