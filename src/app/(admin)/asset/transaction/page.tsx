"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRightLeft,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Search,
  Plus,
  Eye,
  Edit,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  TransactionType,
  TransactionStatus,
  AssetTransaction,
  UnitType,
} from "@/types/asset";
import {
  filterSimplifiedTransactions,
  filterTransactions,
  setCurrentFilter,
  TransactionFilterDto,
  TransactionResponseDto,
  SimplifiedTransactionResponseDto,
  proposeTransaction,
  approveTransaction,
  rejectTransaction,
} from "@/lib/store/slices/transactionSlice";
import { getUnitCampus } from "@/lib/store/slices/unitSlice";
import { Unit } from "@/types/asset";
import { User } from "@/types/asset";
import { RoleBase, PermissionConstants } from "@/constants";
import { PaginatedResponse } from "@/types/asset";
import { useAuth } from "@/contexts/AuthContext";
import { RootState } from "@/lib/store";
import Table, { TableColumn } from "@/components/ui/table";
import toast from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TransactionStatusModal from "@/components/modal/TransactionStatusModal";

const statusColors = {
  [TransactionStatus.DRAFT]: "bg-gray-100 text-gray-800",
  [TransactionStatus.PROPOSED]: "bg-yellow-100 text-yellow-800",
  [TransactionStatus.APPROVED]: "bg-green-100 text-green-800",
  [TransactionStatus.REJECTED]: "bg-red-100 text-red-800",
};

const statusLabels = {
  [TransactionStatus.DRAFT]: "Nháp",
  [TransactionStatus.PROPOSED]: "Đề xuất",
  [TransactionStatus.APPROVED]: "Đã phê duyệt",
  [TransactionStatus.REJECTED]: "Từ chối",
};

const typeColors = {
  [TransactionType.TRANSFER]: "bg-blue-100 text-blue-800",
  [TransactionType.INTERNAL_MOVE]: "bg-purple-100 text-purple-800",
};

const typeLabels = {
  [TransactionType.TRANSFER]: "Bàn giao",
  [TransactionType.INTERNAL_MOVE]: "Di chuyển nội bộ",
};

export default function TransactionPage() {
  const { user, hasAnyPermission, hasRole } = useAuth();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { filteredTransactions, currentFilter } = useAppSelector(
    (state: RootState) => state.transaction
  );
  const { campuses } = useAppSelector((state: RootState) => state.unit);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "">("");
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "">("");
  const [unitFilter, setUnitFilter] = useState<string>("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"propose" | "approve" | "reject" | null>(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  // Permissions
  const isAdmin = hasRole([RoleBase.ADMIN]);
  const isAdminDept = hasRole([RoleBase.ADMIN_DEPT]);
  const isUserDept = hasRole([RoleBase.USER_DEPT]);

  const canView = hasAnyPermission([PermissionConstants.PERM_VIEW_TRANSACTION]);
  const canCreate = hasAnyPermission([PermissionConstants.PERM_CREATE_TRANSACTION]);
  const canUpdate = hasAnyPermission([PermissionConstants.PERM_UPDATE_TRANSACTION]);
  const canApprove = hasAnyPermission([PermissionConstants.PERM_APPROVE_TRANSACTION]);
  const canReject = hasAnyPermission([PermissionConstants.PERM_REJECT_TRANSACTION]);

  useEffect(() => {
    if (!canView) {
      router.push("/unauthorized");
      return;
    }
  }, [canView, router]);

  // Tính toán danh sách units để hiển thị trong dropdown filter dựa vào role
  const getFilterUnits = () => {
    if (isAdmin) {
      // Admin thấy tất cả units từ tất cả campuses
      return campuses.flatMap(campus => [campus, ...(campus.childUnits ?? [])]);
    }
    if (isAdminDept && user?.unitId) {
      // Admin Dept: tìm campus của mình và lấy tất cả children + chính campus đó
      const userCampus = campuses.find(campus => campus.id === user.unitId);
      if (userCampus) {
        return [userCampus, ...(userCampus.childUnits ?? [])];
      }
    }
    // User Dept không cần dropdown filter
    return [];
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch(filterSimplifiedTransactions(currentFilter));
        const result = await dispatch(getUnitCampus()).unwrap();
        // Chỉ Admin và Admin Dept mới cần xử lý units cho dropdown filter
        // User Dept không cần dropdown filter nên không cần set units
        if (result && result.length > 0) {
          // Reset units, sẽ dùng getFilterUnits() để tính toán động
        }
      } catch (e: any) {
        toast.error(e.message || "Có lỗi xảy ra.");
      }
    };
    loadData();
  }, [isAdmin, isAdminDept, isUserDept, user?.unitId]);

  // Calculate stats from filtered data
  const stats = React.useMemo(() => {
    const data = filteredTransactions.data;
    return {
      total: data.length,
      draft: data.filter((t: any) => t.status === TransactionStatus.DRAFT).length,
      proposed: data.filter((t: any) => t.status === TransactionStatus.PROPOSED).length,
      approved: data.filter((t: any) => t.status === TransactionStatus.APPROVED).length,
      rejected: data.filter((t: any) => t.status === TransactionStatus.REJECTED).length,
    };
  }, [filteredTransactions.data]);

  const handleProposeTransaction = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setModalType("propose");
    setIsModalOpen(true);
  };

  const handleApprove = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setModalType("approve");
    setIsModalOpen(true);
  };

  const handleReject = async (transactionId: string) => {
    try {
      await dispatch(rejectTransaction({ 
        id: transactionId, 
        rejectDto: { rejectionReason: "Từ chối giao dịch" } 
      })).unwrap();
      toast.success("Đã từ chối giao dịch");
      dispatch(filterSimplifiedTransactions(currentFilter));
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi từ chối");
    }
  };

  const handleModalConfirm = async (data: { note?: string; evidenceUrl?: string }) => {
    if (!selectedTransactionId) return;

    try {
      switch (modalType) {
        case "propose":
          await dispatch(proposeTransaction({ 
            id: selectedTransactionId, 
            proposeDto: { note: data.note } 
          })).unwrap();
          toast.success("Đã gửi đề xuất giao dịch");
          break;
        case "approve":
          await dispatch(approveTransaction({ 
            id: selectedTransactionId, 
            approveDto: { approvalNote: data.note } 
          })).unwrap();
          toast.success("Đã phê duyệt giao dịch");
          break;
      }
      
      // Refresh data
      dispatch(filterSimplifiedTransactions(currentFilter));
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Có lỗi xảy ra");
    }
  };

  const columns: TableColumn<any>[] = [
    {
      key: "type",
      title: "Loại giao dịch",
      render: (_, transaction: any) => (
        <Badge className={typeColors[transaction.type as TransactionType] || "bg-gray-100 text-gray-800"}>
          {typeLabels[transaction.type as TransactionType] || "Không xác định"}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "fromUnit.name",
      title: "Đơn vị gửi",
      render: (_, transaction: any) => (
        <div className="text-sm font-medium text-gray-900">
          {transaction.fromUnitName || "Chưa xác định"}
        </div>
      ),
      sortable: true,
    },
    {
      key: "toUnit.name",
      title: "Đơn vị nhận",
      render: (_, transaction: any) => (
        <div className="text-sm font-medium text-gray-900">
          {transaction.toUnitName || "Chưa xác định"}
        </div>
      ),
      sortable: true,
    },
    {
      key: "totalAssets",
      title: "Số tài sản",
      render: (_, transaction: any) => (
        <div className="text-sm font-semibold text-center">
          {transaction.totalAssets}
        </div>
      ),
      sortable: false,
      className: "text-center",
    },
    {
      key: "createdAt",
      title: "Ngày tạo",
      render: (_, transaction: any) => (
        <div className="text-sm font-medium text-gray-900">
          {new Date(transaction.createdAt).toLocaleDateString("vi-VN")}
        </div>
      ),
      sortable: true,
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (_, transaction: any) => (
        <Badge className={statusColors[transaction.status as TransactionStatus] || "bg-gray-100 text-gray-800"}>
          {statusLabels[transaction.status as TransactionStatus] || "Không xác định"}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "actions",
      title: "Thao tác",
      render: (_, transaction: any) => (
        <div className="flex justify-start">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="h-8 px-3 text-sm">
                Hành động
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {canView && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/asset/transaction/${transaction.id}`);
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span>Xem chi tiết</span>
                </DropdownMenuItem>
              )}
              {canUpdate && transaction.status === TransactionStatus.DRAFT && (
                <>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/asset/transaction/${transaction.id}/edit`);
                    }}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <span>Chỉnh sửa</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProposeTransaction(transaction.id);
                    }}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <span>Gửi đề xuất</span>
                  </DropdownMenuItem>
                </>
              )}

              {canApprove && transaction.status === TransactionStatus.PROPOSED && (
                <>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApprove(transaction.id);
                    }}
                    className="flex items-center gap-2 cursor-pointer text-green-600"
                  >
                    <span>Phê duyệt</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject(transaction.id);
                    }}
                    className="flex items-center gap-2 cursor-pointer text-red-600"
                  >
                    <span>Từ chối</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      className: "text-right",
    },
  ];

  const handlerRender = (filter: TransactionFilterDto) => {
    dispatch(filterSimplifiedTransactions(filter));
  };

  useEffect(() => {
    // Tạo filter object với role-based filtering (giống liquidation)
    let filterRequest: TransactionFilterDto = {
      ...currentFilter,
      search: searchTerm || undefined,
      type: typeFilter || undefined,
      status: statusFilter || undefined,
    };

    // Áp dụng role-based filtering
    if (isUserDept && user?.unitId) {
      // User Dept chỉ xem giao dịch của đơn vị mình
      filterRequest.fromUnitId = user.unitId;
    } else if ((isAdminDept || isAdmin) && unitFilter) {
      // Admin Dept và Admin: áp dụng unit filter khi có chọn
      filterRequest.fromUnitId = unitFilter;
    }

    handlerRender(filterRequest);
  }, [searchTerm, typeFilter, statusFilter, unitFilter, isAdmin, isAdminDept, isUserDept, user?.unitId]);

  return (
    <>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý giao dịch</h1>
          <p className="text-gray-600 mt-2">
            Quản lý các giao dịch bàn giao và di chuyển tài sản
          </p>
        </div>
        {canCreate && (
          <Button 
            onClick={() => router.push("/asset/transaction/create")}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Tạo giao dịch
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng số</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <ArrowRightLeft className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
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

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đề xuất</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.proposed}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đã phê duyệt</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.approved}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm giao dịch..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TransactionType | "")}
          >
            <option value="">Tất cả loại</option>
            <option value={TransactionType.TRANSFER}>
              Bàn giao
            </option>
            <option value={TransactionType.INTERNAL_MOVE}>
              Di chuyển nội bộ
            </option>
          </select>

          {/* Status Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TransactionStatus | "")}
          >
            <option value="">Tất cả trạng thái</option>
            <option value={TransactionStatus.DRAFT}>Nháp</option>
            <option value={TransactionStatus.PROPOSED}>Đề xuất</option>
            <option value={TransactionStatus.APPROVED}>Đã phê duyệt</option>
            <option value={TransactionStatus.REJECTED}>Từ chối</option>
          </select>

          {/* Unit Filter - Chỉ hiển thị cho Admin và Admin Dept */}
          {(isAdmin || isAdminDept) && (
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
            >
              <option value="">
                {isAdmin ? "Tất cả đơn vị" : "Tất cả đơn vị trong cơ sở"}
              </option>
              {getFilterUnits().map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                  {unit.type === 'CAMPUS' ? ' (Cơ sở)' : ''}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filteredTransactions.data}
        emptyText="Không có giao dịch"
        emptyIcon={<ArrowRightLeft className="mx-auto h-12 w-12 text-gray-400" />}
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
          current: filteredTransactions?.pagination.page || 1,
          pageSize: filteredTransactions?.pagination.limit || 10,
          total: filteredTransactions?.pagination.total || 0,
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
          pageSizeOptions: [10, 20, 50, 100],
          serverSide: true,
        }}
      />
      </div>

      {/* Status Update Modal */}
      <TransactionStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalConfirm}
        title={
          modalType === "propose" ? "Gửi đề xuất giao dịch" :
          modalType === "approve" ? "Phê duyệt giao dịch" :
          modalType === "reject" ? "Từ chối giao dịch" : ""
        }
        description={
          modalType === "propose" ? "Gửi đề xuất giao dịch để xem xét phê duyệt." :
          modalType === "approve" ? "Phê duyệt giao dịch này." :
          modalType === "reject" ? "Từ chối giao dịch. Vui lòng nêu rõ lý do từ chối." : ""
        }
        action={modalType || "propose"}
        isLoading={false}
      />
    </>
  );
}
