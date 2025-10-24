"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  PlayCircle,
  FileText,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InventorySession, InventorySessionStatus } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableColumn } from "@/components/ui/table";
import { RootState } from "@/lib/store";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useAppDispatch } from "@/lib/store/hooks";
import {
  filterInventorySessions,
  InventoryFilterRequest,
  updateStatusInventorySession,
  updateStatusSessionById,
  deleteInventorySession,
  deleteSessionById,
} from "@/lib/store/slices/inventorySlice";
import { useAuth } from "@/contexts/AuthContext";
import { PermissionConstants } from "@/hooks/usePermissions";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Status options for filter dropdown
const statusOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: InventorySessionStatus.PLANNED, label: "Kế hoạch" },
  { value: InventorySessionStatus.IN_PROGRESS, label: "Đang thực hiện" },
  { value: InventorySessionStatus.COMPLETED, label: "Hoàn thành" },
  { value: InventorySessionStatus.CLOSED, label: "Đã đóng" },
];

// Year options for filter dropdown
const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear - 5; year <= currentYear + 2; year++) {
    years.push({ value: year, label: year.toString() });
  }
  return [{ value: "", label: "Tất cả năm" }, ...years];
};

// Status colors and labels
const statusColors = {
  [InventorySessionStatus.PLANNED]: "bg-blue-100 text-blue-800",
  [InventorySessionStatus.IN_PROGRESS]: "bg-yellow-100 text-yellow-800",
  [InventorySessionStatus.COMPLETED]: "bg-green-100 text-green-800",
  [InventorySessionStatus.CLOSED]: "bg-gray-100 text-gray-800",
};

const statusLabels = {
  [InventorySessionStatus.PLANNED]: "Kế hoạch",
  [InventorySessionStatus.IN_PROGRESS]: "Đang thực hiện",
  [InventorySessionStatus.COMPLETED]: "Hoàn thành",
  [InventorySessionStatus.CLOSED]: "Đã đóng",
};

const statusIcons = {
  [InventorySessionStatus.PLANNED]: Clock,
  [InventorySessionStatus.IN_PROGRESS]: PlayCircle,
  [InventorySessionStatus.COMPLETED]: CheckCircle,
  [InventorySessionStatus.CLOSED]: XCircle,
};

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState<number>();
  const [statusFilter, setStatusFilter] = useState<InventorySessionStatus>();
  const router = useRouter();

  const { currentFilter, filteredSessions, filterLoading, filterError } =
    useSelector((state: RootState) => state.inventory);

  const dispatch = useAppDispatch();

  // Check user roles
  const { hasAnyPermission } = useAuth();
  const canCreate = hasAnyPermission([PermissionConstants.PERM_CREATE_INVENTORY]);
  const canEdit = hasAnyPermission([PermissionConstants.PERM_UPDATE_INVENTORY]);
  const canDelete = hasAnyPermission([PermissionConstants.PERM_REMOVE_INVENTORY]);
  const canView = hasAnyPermission([PermissionConstants.PERM_VIEW_INVENTORY]);
  useEffect(() => {
    const loadData = () => {
      try {
        dispatch(filterInventorySessions(currentFilter));
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
      yearFilter: yearFilter ? [yearFilter] : undefined,
      statusFilter: statusFilter ? [statusFilter] : undefined,
    });
  }, [searchTerm, yearFilter, statusFilter]);

  const handlerRender = (currentFilter: InventoryFilterRequest) => {
    dispatch(filterInventorySessions(currentFilter));
  };

  const handleViewSession = (session: InventorySession) => {
    router.push(`/inventory/${session.id}`);
  };

  const handleEditSession = (session: InventorySession) => {
    router.push(`/inventory/${session.id}/edit`);
  };

  const handleDeleteSession = async (session: InventorySession) => {
    if (confirm(`Bạn có chắc chắn muốn xóa kỳ kiểm kê "${session.name}"?`)) {
      try {
        const result = await dispatch(
          deleteInventorySession(session.id)
        ).unwrap();
        if (result) {
          dispatch(deleteSessionById({ id: session.id }));
          toast.success(`Đã xóa kỳ kiểm kê thành công!`);
        }
      } catch (error: any) {
        console.log(error);
        toast.error(error.message || "Có lỗi xảy ra khi xóa kỳ kiểm kê");
      }
    }
  };

  const handleStatusChange = async (
    sessionId: string,
    newStatus: InventorySessionStatus
  ) => {
    try {
      const result = await dispatch(
        updateStatusInventorySession({ id: sessionId, status: newStatus })
      ).unwrap();
      if (result) {
        dispatch(updateStatusSessionById({ id: sessionId, status: newStatus }));
        toast.success(`Đã cập nhật trạng thái kỳ kiểm kê thành công!`);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(
        error.message || "Có lỗi xảy ra khi cập nhật trạng thái kỳ kiểm kê"
      );
    }
  };

  // Define table columns
  const columns: TableColumn<InventorySession>[] = [
    {
      key: "name",
      title: "Tên kỳ kiểm kê",
      render: (_, session) => (
        <div className="flex items-center">
          <div>
            <div className="text-sm font-medium text-gray-900">
              {session.name}
            </div>
            <div className="text-xs text-gray-500">
              Năm {session.year} - Đợt {session.period}
            </div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "startDate",
      title: "Thời gian thực hiện",
      render: (_, session) => (
        <div className="text-sm text-gray-900">
          <div className="flex items-center mb-1">
            <Calendar className="h-4 w-4 text-gray-400 mr-1" />
            {new Date(session.startDate).toLocaleDateString("vi-VN")}
          </div>
          <div className="text-xs text-gray-500">
            đến {new Date(session.endDate).toLocaleDateString("vi-VN")}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (_, session) => {
        if (canEdit) {
          return (
            <select
              value={session.status}
              onChange={(e) =>
                handleStatusChange(
                  session.id,
                  e.target.value as InventorySessionStatus
                )
              }
              className="w-full px-3 py-2 text-xs font-medium border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer transition-colors shadow-sm"
            >
              <option value={InventorySessionStatus.PLANNED}>Kế hoạch</option>
              <option value={InventorySessionStatus.IN_PROGRESS}>
                Đang thực hiện
              </option>
              <option value={InventorySessionStatus.COMPLETED}>
                Hoàn thành
              </option>
              <option value={InventorySessionStatus.CLOSED}>Đã đóng</option>
            </select>
          );
        } else {
          const StatusIcon = statusIcons[session.status];
          return (
            <Badge className={statusColors[session.status]}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusLabels[session.status]}
            </Badge>
          );
        }
      },
      sortable: true,
    },
    {
      key: "actions",
      title: "Thao tác",
      render: (_, session) => (
        <div className="flex justify-start">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
    
            <DropdownMenuContent align="end" className="w-48">
              {/* Xem chi tiết */}
              {canView && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewSession(session);
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span>Xem chi tiết</span>
                </DropdownMenuItem>
              )}
    
              {/* Chỉnh sửa */}
              {canEdit && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditSession(session);
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span>Chỉnh sửa</span>
                </DropdownMenuItem>
              )}
    
              {/* Xóa */}
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(session);
                    }}
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
      className: "text-right",
    }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý kỳ kiểm kê
          </h1>
        </div>
        {canCreate && (
          <Link href="/inventory/create">
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4" />
              Tạo kỳ kiểm kê mới
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-300 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm theo tên kỳ kiểm kê..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Year Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={yearFilter || ""}
            onChange={(e) =>
              setYearFilter(
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
          >
            {getYearOptions().map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter || ""}
            onChange={(e) =>
              setStatusFilter(e.target.value as InventorySessionStatus)
            }
          >
            {statusOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sessions Table */}
      {filterLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : filterError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">
            <p className="font-medium">Lỗi tải dữ liệu:</p>
            <p className="text-sm">{filterError}</p>
          </div>
        </div>
      ) : (
        <Table<InventorySession>
          columns={columns}
          data={filteredSessions?.data || []}
          emptyText="Không tìm thấy kỳ kiểm kê"
          emptyIcon={
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          }
          multiSort={true}
          sortConfigs={currentFilter.sorting}
          onSortChange={(sortConfigs) => {
            handlerRender({
              ...currentFilter,
              sorting: sortConfigs,
            });
          }}
          pagination={{
            current: filteredSessions?.pagination.page || 1,
            pageSize: filteredSessions?.pagination.limit || 5,
            total: filteredSessions?.pagination.total || 0,
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
      )}
    </div>
  );
}
