"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  User,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableColumn } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { RootState } from "@/lib/store";
import {
  getLiquidationProposalById,
  sendLiquidationProposal,
  approveLiquidationProposal,
  finalizeLiquidationProposal,
  exportLiquidationToExcel,
} from "@/lib/store/slices/liquidationSlice";
import {
  LiquidationStatus,
  AssetType,
  LiquidationProposalResponseDto,
  LiquidationItemResponseDto,
  LiquidationHistoryResponseDto,
} from "@/types/asset";
import { PermissionConstants } from "@/hooks/usePermissions";
import toast from "react-hot-toast";
import LiquidationStatusModal from "@/components/modal/LiquidationStatusModal";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

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
  [LiquidationStatus.FINALIZED]: "Đã hoàn thành",
};

const assetTypeLabels = {
  [AssetType.FIXED_ASSET]: "Tài sản cố định",
  [AssetType.TOOLS_EQUIPMENT]: "Công cụ dụng cụ",
};

// Component để hiển thị bảng danh sách tài sản
const LiquidationItemsTable: React.FC<{
  items: LiquidationItemResponseDto[];
}> = ({ items }) => {
  const columns: TableColumn<LiquidationItemResponseDto>[] = [
    {
      key: "asset",
      title: "Tài sản",
      render: (value, record) => (
        <div className="space-y-1">
          <div className="font-medium">{record.asset?.name || "N/A"}</div>
          <div className="text-sm text-gray-500">
            <div>Mã KT: {record.asset?.ktCode || "N/A"}</div>
            <div>Mã TS: {record.asset?.fixedCode || "N/A"}</div>
          </div>
        </div>
      ),
    },
    {
      key: "quantity",
      title: "Số lượng",
      render: (value, record) => (
        <div className="text-center font-medium">{record.systemQuantity || record.countedQuantity || 1}</div>
      ),
    },
    {
      key: "note",
      title: "Ghi chú",
      render: (value, record) => (
        <div className="max-w-xs">
          {record.note ? (
            <div className="text-sm">{record.note}</div>
          ) : (
            <span className="text-gray-400 text-sm">Không có ghi chú</span>
          )}
        </div>
      ),
    }
  ];

  return <Table 
  title="Danh sách tài sản"
  data={items || []} columns={columns} />;
};

// Component để hiển thị lịch sử xử lý
const LiquidationHistory: React.FC<{
  histories: LiquidationHistoryResponseDto[];
}> = ({ histories }) => {
  const sortedHistories = [...(histories || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (!sortedHistories || sortedHistories.length === 0) {
    return (
      <Card className="sticky top-6 border border-gray-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Clock className="w-5 h-5" />
            Lịch sử xử lý
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">Chưa có lịch sử xử lý</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-6 border border-gray-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Clock className="w-5 h-5" />
          Lịch sử xử lý
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-0 max-h-[600px] overflow-y-auto pr-2">
          {sortedHistories.map((history, index) => (
            <div key={history.id} className="relative pl-2">
              <div className="flex gap-4">
                {/* Timeline line and Icon */}
                <div className="flex flex-col items-center">
                  {/* Icon circle */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm relative z-10 ${
                      history.actionStatus === LiquidationStatus.APPROVED
                        ? "bg-green-100 text-green-600 border-green-200"
                        : history.actionStatus === LiquidationStatus.REJECTED
                        ? "bg-red-100 text-red-600 border-red-200"
                        : history.actionStatus === LiquidationStatus.FINALIZED
                        ? "bg-blue-100 text-blue-600 border-blue-200"
                        : history.actionStatus === LiquidationStatus.PROPOSED
                        ? "bg-yellow-100 text-yellow-600 border-yellow-200"
                        : "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    {history.actionStatus === LiquidationStatus.APPROVED ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : history.actionStatus === LiquidationStatus.REJECTED ? (
                      <XCircle className="w-4 h-4" />
                    ) : history.actionStatus === LiquidationStatus.FINALIZED ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                  </div>
                  {/* Timeline line */}
                  {index < sortedHistories.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 mt-2 min-h-[60px]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-6 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge
                      className={`${
                        statusColors[history.actionStatus] ||
                        "bg-gray-100 text-gray-800"
                      } text-xs`}
                    >
                      {statusLabels[history.actionStatus] || history.actionStatus}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {history.createdAt
                        ? format(
                            new Date(history.createdAt),
                            "dd/MM/yyyy HH:mm",
                            { locale: vi }
                          )
                        : "N/A"}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-sm text-gray-900">
                      {history.handler?.fullName || "N/A"}
                    </span>
                  </div>

                  {history.note && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">Ghi chú:</div>
                      <div className="text-sm text-gray-700 leading-relaxed">
                        {history.note}
                      </div>
                    </div>
                  )}

                  {history.evidenceUrl && (
                    <div className="mt-2">
                      <a
                        href={history.evidenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors px-3 py-1.5 rounded-md hover:bg-blue-50"
                      >
                        <FileText className="w-4 h-4" />
                        Xem minh chứng
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Component để hiển thị các action buttons
const LiquidationActions: React.FC<{
  proposal: LiquidationProposalResponseDto;
  onAction: (type: "send" | "approve" | "finalize", data: any) => void;
  onExport: () => void;
  onEdit: () => void;
  isLoading: boolean;
  isExporting: boolean;
}> = ({ proposal, onAction, onExport, onEdit, isLoading, isExporting }) => {
  const { hasAnyPermission } = useAuth();

  const canApprove = hasAnyPermission([
    PermissionConstants.PERM_APPROVE_LIQUIDATION,
  ]);
  const canFinalize = hasAnyPermission([
    PermissionConstants.PERM_FINALIZED_LIQUIDATION,
  ]);
  const canPropose = hasAnyPermission([
    PermissionConstants.PERM_PROPOSED_LIQUIDATION,
  ]);
  const canUpdate = hasAnyPermission([
    PermissionConstants.PERM_UPDATE_LIQUIDATION,
  ]);

  const renderActions = () => {
    switch (proposal.status) {
      case LiquidationStatus.DRAFT:
        return (
          <div className="flex gap-2">
            {canUpdate && (
              <Button
                onClick={onEdit}
                disabled={isLoading}
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                Chỉnh sửa
              </Button>
            )}
            {canPropose && (
              <Button
                onClick={() => onAction("send", {})}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Gửi đề xuất
              </Button>
            )}
          </div>
        );

      case LiquidationStatus.REJECTED:
        return (
          <div className="flex gap-2">
            {canUpdate && (
              <Button
                onClick={onEdit}
                disabled={isLoading}
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                Chỉnh sửa
              </Button>
            )}
            {canPropose && (
              <Button
                onClick={() => onAction("send", {})}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Gửi đề xuất
              </Button>
            )}
          </div>
        );

      case LiquidationStatus.PROPOSED:
        if (canApprove) {
          return (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                disabled={isExporting}
                className="flex items-center gap-2"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    Đang xuất...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Xuất danh mục thanh lý
                  </>
                )}
              </Button>
              <Button
                onClick={() => onAction("approve", {})}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                Phê duyệt
              </Button>
            </div>
          );
        }
        return null;

      case LiquidationStatus.APPROVED:
        if (canFinalize) {
          return (
            <Button
              onClick={() => onAction("finalize", {})}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Hoàn thành
            </Button>
          );
        }
        return null;

      default:
        return null;
    }
  };

  return <div className="flex gap-2">{renderActions()}</div>;
};

export default function LiquidationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { hasAnyPermission } = useAuth();
  const dispatch = useAppDispatch();

  const { 
    currentLiquidationProposal, 
    isFetchingProposal, 
    fetchProposalError,
    isExportingToExcel,
  } = useAppSelector((state: RootState) => state.liquidation);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<
    "send" | "approve" | "finalize" | null
  >(null);

  const proposalId = params.id as string;

  const canView = hasAnyPermission([PermissionConstants.PERM_VIEW_LIQUIDATION]);

  useEffect(() => {
    if (!canView) {
      toast.error("Bạn không có quyền xem chi tiết đề xuất thanh lý");
      router.push("/liquidation");
      return;
    }

    if (proposalId) {
      dispatch(getLiquidationProposalById(proposalId));
    }
  }, [proposalId, dispatch, canView, router]);

  const handleAction = (type: "send" | "approve" | "finalize", data: any) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleModalConfirm = async (formData: any) => {
    if (!modalType || !currentLiquidationProposal) return;

    try {
      switch (modalType) {
        case "send":
          await dispatch(
            sendLiquidationProposal({
              id: currentLiquidationProposal.id,
              sendDto: formData,
            })
          ).unwrap();
          toast.success("Đề xuất đã được gửi thành công");
          break;
        case "approve":
          await dispatch(
            approveLiquidationProposal({
              id: currentLiquidationProposal.id,
              approveDto: formData,
            })
          ).unwrap();
          toast.success("Đề xuất đã được phê duyệt thành công");
          break;
        case "finalize":
          await dispatch(
            finalizeLiquidationProposal({
              id: currentLiquidationProposal.id,
              finalizeDto: formData,
            })
          ).unwrap();
          toast.success("Đề xuất đã được hoàn thành thành công");
          break;
      }

      // Refresh data
      dispatch(getLiquidationProposalById(proposalId));
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    }
  };

  const handleExportToExcel = async () => {
    try {
      await dispatch(exportLiquidationToExcel(proposalId)).unwrap();
      toast.success("Xuất danh mục thanh lý thành công");
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi xuất file");
    }
  };

  const handleEdit = () => {
    router.push(`/liquidation/${proposalId}/edit`);
  };

  if (isFetchingProposal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (fetchProposalError || !currentLiquidationProposal) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4 p-6">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">
            Không tìm thấy đề xuất
          </h3>
          <p className="text-gray-500">
            {fetchProposalError ||
              "Đề xuất thanh lý không tồn tại hoặc đã bị xóa."}
          </p>
        </div>
        <Button onClick={() => router.push("/liquidation")} variant="outline">
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6">
        {/* Header with Breadcrumb */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <div className="flex items-center text-sm sm:text-base text-gray-600 mb-3">
                <button
                  onClick={() => router.push("/liquidation")}
                  className="hover:text-blue-600 text-lg sm:text-xl transition-colors font-semibold cursor-pointer"
                >
                  Thanh lý
                </button>
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 mx-1 sm:mx-2" />
                <span className="text-gray-900 font-semibold text-lg sm:text-xl">
                  Chi tiết đề xuất thanh lý
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                className={
                  statusColors[currentLiquidationProposal.status] ||
                  "bg-gray-100 text-gray-800"
                }
              >
                {statusLabels[currentLiquidationProposal.status] ||
                  currentLiquidationProposal.status}
              </Badge>
              <LiquidationActions
                proposal={currentLiquidationProposal}
                onAction={handleAction}
                onExport={handleExportToExcel}
                onEdit={handleEdit}
                isLoading={isFetchingProposal}
                isExporting={isExportingToExcel}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Cột trái - Nội dung chính */}
          <div className="xl:col-span-2 space-y-6">
            {/* Thông tin cơ bản */}
            <Card className="border border-gray-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  Thông tin đề xuất thanh lý
                </CardTitle>
              </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        Người tạo
                      </div>
                      <div className="font-medium">
                        {currentLiquidationProposal.proposer?.fullName || "N/A"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">Ngày tạo</div>
                      <div className="font-medium">
                        {currentLiquidationProposal.createdAt
                          ? format(
                              new Date(currentLiquidationProposal.createdAt),
                              "dd/MM/yyyy HH:mm",
                              { locale: vi }
                            )
                          : "N/A"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">Ngày cập nhật</div>
                      <div className="font-medium">
                        {currentLiquidationProposal.updatedAt
                          ? format(
                              new Date(currentLiquidationProposal.updatedAt),
                              "dd/MM/yyyy HH:mm",
                              { locale: vi }
                            )
                          : "N/A"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        Đơn vị
                      </div>
                      <div className="font-medium">
                        {currentLiquidationProposal.unit?.name || "N/A"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        Loại tài sản
                      </div>
                      <div className="font-medium">
                        {assetTypeLabels[
                          currentLiquidationProposal.assetType as AssetType
                        ] || currentLiquidationProposal.assetType}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <LiquidationItemsTable
                items={currentLiquidationProposal.items || []}
              />
          </div>

          {/* Cột phải - Lịch sử xử lý */}
          <div className="xl:col-span-1">
            <LiquidationHistory
              histories={currentLiquidationProposal.histories || []}
            />
          </div>
        </div>
      </div>
      </div>

      {/* Modal xử lý */}
      <LiquidationStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalConfirm}
        title={
          modalType === "send"
            ? "Gửi đề xuất thanh lý"
            : modalType === "approve"
            ? "Phê duyệt đề xuất thanh lý"
            : "Hoàn thành đề xuất thanh lý"
        }
        description={
          modalType === "send"
            ? "Bạn có chắc chắn muốn gửi đề xuất thanh lý này?"
            : modalType === "approve"
            ? "Bạn có chắc chắn muốn phê duyệt đề xuất thanh lý này?"
            : "Bạn có chắc chắn muốn hoàn thành đề xuất thanh lý này?"
        }
        requireEvidence={modalType === "approve"}
        isLoading={isFetchingProposal}
      />
    </div>
  );
}
