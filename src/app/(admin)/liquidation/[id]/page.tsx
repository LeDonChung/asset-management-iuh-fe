"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Calendar,
  Building,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Camera,
  Eye,
  Download,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableColumn } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { RootState } from "@/lib/store";
import {
  getLiquidationProposalById,
  sendLiquidationProposal,
  approveLiquidationProposal,
  finalizeLiquidationProposal,
} from "@/lib/store/slices/liquidationSlice";
import {
  LiquidationStatus,
  AssetType,
  LiquidationProposalResponseDto,
  LiquidationItemResponseDto,
  LiquidationHistoryResponseDto,
} from "@/types/asset";
import { PermissionConstants } from "@/hooks/usePermissions";
import { RoleBase } from "@/lib/constants/role";
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
  [AssetType.TSCD]: "Tài sản cố định",
  [AssetType.CCDC]: "Công cụ dụng cụ",
};

// Component để hiển thị hình ảnh có thể click
const ClickableImage: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    window.open(imageUrl, "_blank");
  };

  return (
    <div
      className="relative group cursor-pointer w-24 h-24 mx-auto"
      onClick={handleImageClick}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
      }}
    >
      <img
        src={imageUrl}
        alt="Minh chứng"
        className="w-full h-full object-cover rounded border hover:opacity-80 pointer-events-none"
      />
      <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded flex items-center justify-center">
        <Eye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100" />
      </div>
    </div>
  );
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
      key: "systemQuantity",
      title: "Số lượng sổ sách",
      render: (value, record) => (
        <div className="text-center font-medium">{record.systemQuantity}</div>
      ),
    },
    {
      key: "countedQuantity",
      title: "Số lượng kiểm kê",
      render: (value, record) => (
        <div className="text-center font-medium">{record.countedQuantity}</div>
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
    },
    {
      key: "imageUrl",
      title: "Hình ảnh",
      render: (value, record) => (
        <div className="flex justify-center">
          {record.imageUrl ? (
            <ClickableImage imageUrl={record.imageUrl || ""} />
          ) : (
            <span className="text-gray-400 text-sm">Không có</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Danh sách tài sản
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table data={items || []} columns={columns} />
      </CardContent>
    </Card>
  );
};

// Component để hiển thị lịch sử xử lý
const LiquidationHistory: React.FC<{
  histories: LiquidationHistoryResponseDto[];
}> = ({ histories }) => {
  const sortedHistories = [...(histories || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Lịch sử xử lý</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {sortedHistories.map((history, index) => (
            <div key={history.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    history.actionStatus === LiquidationStatus.APPROVED
                      ? "bg-green-100 text-green-600"
                      : history.actionStatus === LiquidationStatus.REJECTED
                      ? "bg-red-100 text-red-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {history.actionStatus === LiquidationStatus.APPROVED ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : history.actionStatus === LiquidationStatus.REJECTED ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                </div>
                {index < sortedHistories.length - 1 && (
                  <div className="w-0.5 h-8 bg-gray-200 mt-2" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                  <Badge
                    className={
                      statusColors[history.actionStatus] ||
                      "bg-gray-100 text-gray-800"
                    }
                  >
                    {statusLabels[history.actionStatus] || history.actionStatus}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {history.createdAt
                      ? format(
                          new Date(history.createdAt),
                          "dd/MM/yyyy HH:mm",
                          { locale: vi }
                        )
                      : "N/A"}
                  </span>
                </div>
                <div className="font-medium text-sm">
                  {history.handler?.fullName || "N/A"}
                </div>
                {history.note && (
                  <div className="text-sm text-gray-600 mt-1">
                    {history.note}
                  </div>
                )}
                {history.evidenceUrl && (
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(history.evidenceUrl, "_blank");
                      }}
                      className="flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Xem minh chứng
                    </Button>
                  </div>
                )}
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
  isLoading: boolean;
}> = ({ proposal, onAction, isLoading }) => {
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

  const renderActions = () => {
    switch (proposal.status) {
      case LiquidationStatus.DRAFT:
        if (canPropose) {
          return (
            <Button
              onClick={() => onAction("send", {})}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Gửi đề xuất
            </Button>
          );
        }
        return null;

      case LiquidationStatus.PROPOSED:
        if (canApprove) {
          return (
            <div className="flex gap-2">
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

  const { currentLiquidationProposal, isFetchingProposal, fetchProposalError } =
    useAppSelector((state: RootState) => state.liquidation);

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

  if (isFetchingProposal) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (fetchProposalError || !currentLiquidationProposal) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
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
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/liquidation")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Chi tiết đề xuất thanh lý</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
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
            isLoading={isFetchingProposal}
          />
        </div>
      </div>

      {/* Layout 2 cột */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Cột trái - Nội dung chính */}
        <div className="xl:col-span-2 space-y-6">
          {/* Thông tin cơ bản */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Thông tin đề xuất
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    Người đề xuất
                  </div>
                  <div className="font-medium">
                    {currentLiquidationProposal.proposer?.fullName || "N/A"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {currentLiquidationProposal.proposer?.email || "N/A"}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building className="w-4 h-4" />
                    Đơn vị
                  </div>
                  <div className="font-medium">
                    {currentLiquidationProposal.unit?.name || "N/A"}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="w-4 h-4" />
                    Loại tài sản
                  </div>
                  <div className="font-medium">
                    {assetTypeLabels[
                      currentLiquidationProposal.assetType as AssetType
                    ] || currentLiquidationProposal.assetType}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    Ngày tạo
                  </div>
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
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    Ngày cập nhật
                  </div>
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
              </div>
            </CardContent>
          </Card>

          {/* Danh sách tài sản */}
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
