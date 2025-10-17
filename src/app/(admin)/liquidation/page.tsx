"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Package2,
} from "lucide-react";
import Link from "next/link";
import {
  LiquidationProposal,
  LiquidationStatus,
  AssetType,
  LiquidationProposalFilterRequest,
  Unit,
} from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Table, { TableColumn } from "@/components/ui/table";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { RootState } from "@/lib/store";
import {
  filterLiquidationProposals,
  currentFilterLiquidationProposal,
} from "@/lib/store/slices/liquidationSlice";
import { getUnitCampus } from "@/lib/store/slices/unitSlice";
import toast from "react-hot-toast";
import { PermissionConstants } from "@/hooks/usePermissions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RoleBase } from "@/lib/constants/role";
import LiquidationStatusModal from "@/components/modal/LiquidationStatusModal";
import { 
  sendLiquidationProposal, 
  approveLiquidationProposal, 
  finalizeLiquidationProposal 
} from "@/lib/store/slices/liquidationSlice";

const statusColors = {
  [LiquidationStatus.PROPOSED]: "bg-yellow-100 text-yellow-800",
  [LiquidationStatus.APPROVED]: "bg-green-100 text-green-800",
  [LiquidationStatus.REJECTED]: "bg-red-100 text-red-800",
  [LiquidationStatus.DRAFT]: "bg-gray-100 text-gray-800",
  [LiquidationStatus.FINALIZED]: "bg-blue-100 text-blue-800",
};

const statusLabels = {
  [LiquidationStatus.PROPOSED]: "Đề xuất thanh lý",
  [LiquidationStatus.APPROVED]: "Đã phê duyệt",
  [LiquidationStatus.REJECTED]: "Từ chối",
  [LiquidationStatus.DRAFT]: "Nháp",
  [LiquidationStatus.FINALIZED]: "Hoàn thành",
};

const assetTypeLabels = {
  [AssetType.FIXED_ASSET]: "Tài sản cố định",
  [AssetType.TOOLS_EQUIPMENT]: "Công cụ dụng cụ",
  [AssetType.TSCD]: "Tài sản cố định",
  [AssetType.CCDC]: "Công cụ dụng cụ",
};

export default function LiquidationPage() {
  const { user, hasAnyPermission, hasRole } = useAuth();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { filteredLiquidationProposals, currentFilter } = useAppSelector(
    (state: RootState) => state.liquidation
  );
  const { campuses } = useAppSelector((state: RootState) => state.unit);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<LiquidationStatus | "">("");
  const [unitFilter, setUnitFilter] = useState<string>("");
  const [yearFilter, setYearFilter] = useState<number | "">("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"send" | "approve" | "finalize" | null>(null);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);

  // Permissions

  const isAdmin = hasRole([RoleBase.ADMIN]);
  const isAdminDept = hasRole([RoleBase.ADMIN_DEPT]);
  const isUserDept = hasRole([RoleBase.USER_DEPT]);

  const canView = hasAnyPermission([PermissionConstants.PERM_VIEW_LIQUIDATION]);
  const canApprove = hasAnyPermission([
    PermissionConstants.PERM_APPROVE_LIQUIDATION,
  ]);
  const canFinalize = hasAnyPermission([
    PermissionConstants.PERM_FINALIZED_LIQUIDATION,
  ]);
  const canPropose = hasAnyPermission([
    PermissionConstants.PERM_PROPOSED_LIQUIDATION,
  ]);
  const canReject = hasAnyPermission([
    PermissionConstants.PERM_REJECT_LIQUIDATION,
  ]);
  const canUpdate = hasAnyPermission([
    PermissionConstants.PERM_UPDATE_LIQUIDATION,
  ]);
  const canRemove = hasAnyPermission([
    PermissionConstants.PERM_REMOVE_LIQUIDATION,
  ]);
  const canCreate = hasAnyPermission([
    PermissionConstants.PERM_CREATE_LIQUIDATION,
  ]);
  useEffect(() => {
    if (!canView) {
      router.push("/unauthorized");
    }
  }, [canView, router]);
  const [units, setUnits] = useState<Unit[]>([]);
  
  // Tính toán danh sách units để hiển thị trong dropdown filter dựa vào role
  // Chỉ dành cho Admin và Admin Dept (User Dept không cần dropdown filter)
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
    // Fallback
    return [];
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch(filterLiquidationProposals(currentFilter));
        const result = await dispatch(getUnitCampus()).unwrap();
        // Chỉ Admin và Admin Dept mới cần xử lý units cho dropdown filter
        // User Dept không cần dropdown filter nên không cần set units
        if (result && result.length > 0) {
          setUnits([]); // Reset units, sẽ dùng getFilterUnits() để tính toán động
        }
      } catch (e: any) {
        toast.error(e.message || "Có lỗi xảy ra.");
      }
    };
    loadData();
  }, [isAdmin, isAdminDept, isUserDept, user?.unitId]);

  // Calculate stats from filtered data
  const stats = React.useMemo(() => {
    const data = filteredLiquidationProposals.data;
    return {
      total: data.length,
      proposed: data.filter((p) => p.status === LiquidationStatus.PROPOSED)
        .length,
      approved: data.filter((p) => p.status === LiquidationStatus.APPROVED)
        .length,
      rejected: data.filter((p) => p.status === LiquidationStatus.REJECTED)
        .length,
      finalized: data.filter((p) => p.status === LiquidationStatus.FINALIZED)
        .length,
      draft: data.filter((p) => p.status === LiquidationStatus.DRAFT).length,
    };
  }, [filteredLiquidationProposals.data]);

  const handleSendProposal = (proposalId: string) => {
    setSelectedProposalId(proposalId);
    setModalType("send");
    setIsModalOpen(true);
  };

  const handleApprove = (proposalId: string) => {
    setSelectedProposalId(proposalId);
    setModalType("approve");
    setIsModalOpen(true);
  };

  const handleFinalize = (proposalId: string) => {
    setSelectedProposalId(proposalId);
    setModalType("finalize");
    setIsModalOpen(true);
  };

  const handleReject = async (proposalId: string) => {
    try {
      // TODO: Implement reject API call
      toast.success("Đã từ chối đề xuất thanh lý");
      dispatch(filterLiquidationProposals(currentFilter));
    } catch (error) {
      toast.error("Có lỗi xảy ra khi từ chối");
    }
  };

  const handleModalConfirm = async (data: { note?: string; evidenceUrl?: string }) => {
    if (!selectedProposalId) return;

    try {
      switch (modalType) {
        case "send":
          await dispatch(sendLiquidationProposal({ 
            id: selectedProposalId, 
            sendDto: { note: data.note, evidenceUrl: data.evidenceUrl || "" } 
          })).unwrap();
          toast.success("Đã gửi đề xuất thanh lý");
          break;
        case "approve":
          await dispatch(approveLiquidationProposal({ 
            id: selectedProposalId, 
            approveDto: { note: data.note, evidenceUrl: data.evidenceUrl || "" } 
          })).unwrap();
          toast.success("Đã phê duyệt đề xuất thanh lý");
          break;
        case "finalize":
          await dispatch(finalizeLiquidationProposal({ 
            id: selectedProposalId, 
            finalizeDto: { note: data.note, evidenceUrl: data.evidenceUrl || "" } 
          })).unwrap();
          toast.success("Đã hoàn thành đề xuất thanh lý");
          break;
      }
      
      // Refresh data
      dispatch(filterLiquidationProposals(currentFilter));
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Có lỗi xảy ra");
    }
  };

  const columns: TableColumn<LiquidationProposal>[] = [
    {
      key: "unit.name",
      title: "Đơn vị",
      render: (_, proposal) => (
        <div className="text-sm font-medium text-gray-900">
          {proposal.unit?.name || "Chưa xác định"}
        </div>
      ),
      sortable: true,
    },
    {
      key: "assetType",
      title: "Loại tài sản",
      render: (_, proposal) => (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          {assetTypeLabels[proposal.assetType]}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "createdAt",
      title: "Ngày đề xuất",
      render: (_, proposal) => (
        <div className="text-sm font-medium text-gray-900">
          {new Date(proposal.createdAt).toLocaleDateString("vi-VN")}
        </div>
      ),
      sortable: true,
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (_, proposal) => (
        <Badge className={`${statusColors[proposal.status]}`}>
          {statusLabels[proposal.status]}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "actions",
      title: "Thao tác",
      render: (_, proposal) => (
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
                    router.push(`/liquidation/${proposal.id}`);
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span>Xem chi tiết</span>
                </DropdownMenuItem>
              )}
              {canUpdate && proposal.status === LiquidationStatus.DRAFT && (
                <>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/liquidation/${proposal.id}/edit`);
                    }}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <span>Chỉnh sửa</span>
                  </DropdownMenuItem>
                  {canPropose && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendProposal(proposal.id);
                      }}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <span>Gửi đề xuất</span>
                    </DropdownMenuItem>
                  )}
                </>
              )}

              {canApprove && proposal.status === LiquidationStatus.PROPOSED && (
                <>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApprove(proposal.id);
                    }}
                    className="flex items-center gap-2 cursor-pointer text-green-600"
                  >
                    <span>Phê duyệt</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject(proposal.id);
                    }}
                    className="flex items-center gap-2 cursor-pointer text-red-600"
                  >
                    <span>Từ chối</span>
                  </DropdownMenuItem>
                </>
              )}
              {canFinalize &&
                proposal.status === LiquidationStatus.APPROVED && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFinalize(proposal.id);
                    }}
                    className="flex items-center gap-2 cursor-pointer text-green-600"
                  >
                    <span>Hoàn thành</span>
                  </DropdownMenuItem>
                )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      className: "text-right",
    },
  ];

  const handlerRender = (filter: LiquidationProposalFilterRequest) => {
    dispatch(filterLiquidationProposals(filter));
  };

  useEffect(() => {
    handlerRender({
      ...currentFilter,
      search: searchTerm || undefined,
      status: statusFilter || undefined,
      unitId: unitFilter || undefined,
      year: yearFilter || undefined,
    });
  }, [searchTerm, statusFilter, unitFilter, yearFilter]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý thanh lý tài sản</h1>
          <p className="text-gray-600 mt-2">
            Quản lý đề xuất và phê duyệt thanh lý tài sản
          </p>
        </div>
        {canCreate && (
          <Link href="/liquidation/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Tạo đề xuất thanh lý
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng đề xuất</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chờ phê duyệt</p>
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

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Từ chối</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.rejected}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.finalized}
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
              placeholder="Tìm kiếm theo lý do thanh lý..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as LiquidationStatus | "")
            }
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
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

          {/* Year Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={yearFilter}
            onChange={(e) =>
              setYearFilter(e.target.value ? Number(e.target.value) : "")
            }
          >
            <option value="">Tất cả năm</option>
            {Array.from(
              { length: 5 },
              (_, i) => new Date().getFullYear() - i
            ).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filteredLiquidationProposals.data}
        emptyText="Không có đề xuất thanh lý"
        emptyIcon={<Package2 className="mx-auto h-12 w-12 text-gray-400" />}
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
          current: filteredLiquidationProposals?.pagination.page || 1,
          pageSize: filteredLiquidationProposals?.pagination.limit || 10,
          total: filteredLiquidationProposals?.pagination.total || 0,
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

      {/* Status Update Modal */}
      <LiquidationStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalConfirm}
        title={
          modalType === "send" ? "Gửi đề xuất thanh lý" :
          modalType === "approve" ? "Phê duyệt đề xuất thanh lý" :
          modalType === "finalize" ? "Hoàn thành đề xuất thanh lý" : ""
        }
        description={
          modalType === "send" ? "Gửi đề xuất thanh lý để xem xét. Bạn có thể đính kèm file minh chứng." :
          modalType === "approve" ? "Phê duyệt đề xuất thanh lý. Vui lòng đính kèm file minh chứng phê duyệt." :
          modalType === "finalize" ? "Hoàn thành đề xuất thanh lý. Bạn có thể đính kèm file báo cáo hoàn tất." : ""
        }
        requireEvidence={false}
        isLoading={false}
      />
    </div>
  );
}
