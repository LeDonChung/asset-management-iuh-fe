"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Calendar,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Camera,
  Eye,
  Download,
  AlertCircle,
  ArrowRight,
  MapPin,
  Package,
  ChevronRight,
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
  getMovementById,
  proposeMovement,
  approveMovement,
  rejectMovement,
  updateMovementStatus,
  MovementResponseDto,
  MovementItemResponseDto,
  MovementHistoryResponseDto,
  MoveStatus,
} from "@/lib/store/slices/moveSlice";
import { PermissionConstants } from "@/lib/constants/permissions";
import toast from "react-hot-toast";
import TransactionStatusModal from "@/components/modal/TransactionStatusModal";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const statusColors: Record<MoveStatus, string> = {
  [MoveStatus.DRAFT]: "bg-gray-100 text-gray-800",
  [MoveStatus.PENDING_APPROVAL]: "bg-yellow-100 text-yellow-800",
  [MoveStatus.APPROVED]: "bg-green-100 text-green-800",
  [MoveStatus.REJECTED]: "bg-red-100 text-red-800",
  [MoveStatus.COMPLETED]: "bg-blue-100 text-blue-800",
  [MoveStatus.CANCELLED]: "bg-gray-100 text-gray-800",
};

const statusLabels: Record<MoveStatus, string> = {
  [MoveStatus.DRAFT]: "Nháp",
  [MoveStatus.PENDING_APPROVAL]: "Chờ phê duyệt",
  [MoveStatus.APPROVED]: "Đã phê duyệt",
  [MoveStatus.REJECTED]: "Từ chối",
  [MoveStatus.COMPLETED]: "Hoàn thành",
  [MoveStatus.CANCELLED]: "Đã hủy",
};

// Component để hiển thị bảng danh sách tài sản
const MovementItemsTable: React.FC<{
  items: MovementItemResponseDto[];
}> = ({ items }) => {
  const columns: TableColumn<MovementItemResponseDto>[] = [
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
      render: (value, record) => {
        const asset = record.asset as any;
        return (
          <div className="text-center">
            <div className="text-sm font-medium text-gray-900">
              {record.quantity || 1}
            </div>
            {asset?.unit && (
              <div className="text-xs text-gray-500 mt-0.5">
                {asset.unit}
              </div>
            )}
          </div>
        );
      },
      className: "text-center",
    },
    {
      key: "roomMovement",
      title: "Di chuyển",
      render: (value, record) => (
        <div className="text-left">
          {record.fromRoom && record.toRoom ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col min-w-[120px]">
                <div className="text-xs text-gray-500 mb-1">Từ phòng</div>
                <div className="font-medium text-sm text-gray-900">
                  {record.fromRoom.name || "N/A"}
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div className="flex flex-col min-w-[120px]">
                <div className="text-xs text-gray-500 mb-1">Đến phòng</div>
                <div className="font-medium text-sm text-blue-600">
                  {record.toRoom.code && record.toRoom.code.indexOf("INVENTORY") !== -1
                    ? "Kho"
                    : record.toRoom.name || "N/A"}
                </div>
              </div>
            </div>
          ) : record.fromRoom ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col min-w-[120px]">
                <div className="text-xs text-gray-500 mb-1">Từ phòng</div>
                <div className="font-medium text-sm text-gray-900">
                  {record.fromRoom.name || "N/A"}
                </div>
                {record.fromRoom.code && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    ({record.fromRoom.code})
                  </div>
                )}
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span className="text-gray-400 text-sm">Chưa phân bổ</span>
            </div>
          ) : record.toRoom ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">Chưa phân bổ</span>
              <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div className="flex flex-col min-w-[120px]">
                <div className="text-xs text-gray-500 mb-1">Đến phòng</div>
                <div className="font-medium text-sm text-blue-600">
                  {record.toRoom.code && record.toRoom.code.indexOf("INVENTORY") !== -1
                    ? "Kho"
                    : record.toRoom.name || "N/A"}
                </div>
                {record.toRoom.code && record.toRoom.code.indexOf("INVENTORY") === -1 && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    ({record.toRoom.code})
                  </div>
                )}
              </div>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">Chưa phân bổ</span>
          )}
        </div>
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
const MovementHistory: React.FC<{
  histories: MovementHistoryResponseDto[];
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
                      history.newStatus === MoveStatus.APPROVED
                        ? "bg-green-100 text-green-600 border-green-200"
                        : history.newStatus === MoveStatus.REJECTED
                        ? "bg-red-100 text-red-600 border-red-200"
                        : history.newStatus === MoveStatus.COMPLETED
                        ? "bg-blue-100 text-blue-600 border-blue-200"
                        : history.newStatus === MoveStatus.PENDING_APPROVAL
                        ? "bg-yellow-100 text-yellow-600 border-yellow-200"
                        : "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    {history.newStatus === MoveStatus.APPROVED ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : history.newStatus === MoveStatus.REJECTED ? (
                      <XCircle className="w-4 h-4" />
                    ) : history.newStatus === MoveStatus.COMPLETED ? (
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
                        statusColors[history.newStatus] ||
                        "bg-gray-100 text-gray-800"
                      } text-xs`}
                    >
                      {statusLabels[history.newStatus] || history.newStatus}
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
                      {history.changer?.fullName || "N/A"}
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
const MovementActions: React.FC<{
  movement: MovementResponseDto;
  onAction: (type: "propose" | "approve" | "reject", data: any) => void;
  isLoading: boolean;
}> = ({ movement, onAction, isLoading }) => {
  const { hasAnyPermission } = useAuth();
  const router = useRouter();

  const canApprove = hasAnyPermission([
    PermissionConstants.PERM_APPROVE_MOVEMENT,
  ]);
  const canPropose = hasAnyPermission([
    PermissionConstants.PERM_PROPOSE_MOVEMENT,
  ]);
  const canUpdate = hasAnyPermission([
    PermissionConstants.PERM_UPDATE_MOVEMENT,
  ]);

  const renderActions = () => {
    switch (movement.status) {
      case MoveStatus.DRAFT:
        return (
          <div className="flex gap-2">
            {canUpdate && (
              <Button
                onClick={() => router.push(`/asset/move/${movement.id}/edit`)}
                disabled={isLoading}
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                Chỉnh sửa
              </Button>
            )}
            {canPropose && (
              <Button
                onClick={() => onAction("propose", {})}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Gửi đề xuất
              </Button>
            )}
          </div>
        );

      case MoveStatus.REJECTED:
        return (
          <div className="flex gap-2">
            {canUpdate && (
              <Button
                onClick={() => router.push(`/asset/move/${movement.id}/edit`)}
                disabled={isLoading}
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                Chỉnh sửa
              </Button>
            )}
            {canPropose && (
              <Button
                onClick={() => onAction("propose", {})}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Gửi đề xuất
              </Button>
            )}
          </div>
        );

      case MoveStatus.PENDING_APPROVAL:
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
              <Button
                onClick={() => onAction("reject", {})}
                disabled={isLoading}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Từ chối
              </Button>
            </div>
          );
        }
        return null;

      default:
        return null;
    }
  };

  return <div className="flex gap-2">{renderActions()}</div>;
};

export default function MovementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { hasAnyPermission } = useAuth();
  const dispatch = useAppDispatch();

  const {
    currentMovementDetail,
    isFetchingMovement,
    fetchMovementError,
  } = useAppSelector((state: RootState) => state.move);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<
    "propose" | "approve" | "reject" | null
  >(null);

  const movementId = params.id as string;

  const canView = hasAnyPermission([PermissionConstants.PERM_VIEW_MOVEMENT]);

  useEffect(() => {
    if (!canView) {
      toast.error("Bạn không có quyền xem chi tiết di chuyển");
      router.push("/asset/move");
      return;
    }

    if (movementId) {
      dispatch(getMovementById(movementId));
    }
  }, [movementId, dispatch, canView, router]);

  const handleAction = (type: "propose" | "approve" | "reject", data: any) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleModalConfirm = async (formData: any) => {
    if (!modalType || !currentMovementDetail) return;

    try {
      switch (modalType) {
        case "propose":
          await dispatch(
            proposeMovement({
              id: currentMovementDetail.id,
              proposeDto: {
                note: formData.note,
                evidenceUrl: formData.evidenceUrl,
              },
            })
          ).unwrap();
          toast.success("Đề xuất đã được gửi thành công");
          break;
        case "approve":
          await dispatch(
            approveMovement({
              id: currentMovementDetail.id,
              approveDto: formData,
            })
          ).unwrap();
          toast.success("Yêu cầu di chuyển đã được phê duyệt thành công");
          break;
        case "reject":
          await dispatch(
            rejectMovement({
              id: currentMovementDetail.id,
              rejectDto: formData,
            })
          ).unwrap();
          toast.success("Yêu cầu di chuyển đã được từ chối");
          break;
      }

      // Refresh data
      dispatch(getMovementById(movementId));
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    }
  };

  if (isFetchingMovement) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (fetchMovementError || !currentMovementDetail) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">
            Không tìm thấy yêu cầu di chuyển
          </h3>
          <p className="text-gray-500">
            {fetchMovementError || "Yêu cầu di chuyển không tồn tại hoặc đã bị xóa."}
          </p>
        </div>
        <Button
          onClick={() => router.push("/asset/move")}
          variant="outline"
        >
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
                  onClick={() => router.push("/asset/asset-book")}
                  className="hover:text-blue-600 text-lg sm:text-xl transition-colors font-semibold cursor-pointer"
                >
                  Tài sản
                </button>
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 mx-1 sm:mx-2" />
                <button
                  onClick={() => router.push("/asset/move")}
                  className="hover:text-blue-600 text-lg sm:text-xl transition-colors font-semibold cursor-pointer"
                >
                  Di chuyển
                </button>
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 mx-1 sm:mx-2" />
                <span className="text-gray-900 font-semibold text-lg sm:text-xl">
                  Chi tiết di chuyển
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <MovementActions
                movement={currentMovementDetail}
                onAction={handleAction}
                isLoading={isFetchingMovement}
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
                  Thông tin yêu cầu di chuyển
                </CardTitle>
              </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        Người tạo
                      </div>
                      <div className="font-medium">
                        {currentMovementDetail.requester?.fullName || "N/A"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">Ngày tạo</div>
                      <div className="font-medium">
                        {currentMovementDetail.createdAt
                          ? format(
                              new Date(currentMovementDetail.createdAt),
                              "dd/MM/yyyy HH:mm",
                              { locale: vi }
                            )
                          : "N/A"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">Ngày cập nhật</div>
                      <div className="font-medium">
                        {currentMovementDetail.updatedAt
                          ? format(
                              new Date(currentMovementDetail.updatedAt),
                              "dd/MM/yyyy HH:mm",
                              { locale: vi }
                            )
                          : "N/A"}
                      </div>
                    </div>

                    {currentMovementDetail.approvedAt && (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">Ngày phê duyệt</div>
                        <div className="font-medium">
                          {format(
                            new Date(currentMovementDetail.approvedAt),
                            "dd/MM/yyyy HH:mm",
                            { locale: vi }
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Ghi chú yêu cầu */}
                  {currentMovementDetail.requestNote && (
                    <>
                      <Separator className="my-4" />
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">
                          Ghi chú yêu cầu
                        </div>
                        <div className="p-3 bg-gray-50 rounded-md text-sm">
                          {currentMovementDetail.requestNote}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Thông tin phê duyệt/từ chối */}
                  {(currentMovementDetail.approvalNote ||
                    currentMovementDetail.rejectionReason) && (
                    <>
                      <Separator className="my-4" />
                      <div className="space-y-4">
                        {currentMovementDetail.approvalNote && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              Ghi chú phê duyệt
                            </div>
                            <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm">
                              {currentMovementDetail.approvalNote}
                            </div>
                          </div>
                        )}

                        {currentMovementDetail.rejectionReason && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <XCircle className="w-4 h-4 text-red-600" />
                              Lý do từ chối
                            </div>
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm">
                              {currentMovementDetail.rejectionReason}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <MovementItemsTable
                items={currentMovementDetail.items || []}
              />
          </div>

          {/* Cột phải - Lịch sử xử lý */}
          <div className="xl:col-span-1">
            <MovementHistory
              histories={currentMovementDetail.histories || []}
            />
          </div>
        </div>
      </div>
      </div>

      {/* Modal xử lý */}
      <TransactionStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalConfirm}
        title={
          modalType === "propose"
            ? "Gửi đề xuất di chuyển"
            : modalType === "approve"
            ? "Phê duyệt yêu cầu di chuyển"
            : "Từ chối yêu cầu di chuyển"
        }
        description={
          modalType === "propose"
            ? "Bạn có chắc chắn muốn gửi đề xuất di chuyển này? Bạn có thể đính kèm file minh chứng."
            : modalType === "approve"
            ? "Bạn có chắc chắn muốn phê duyệt yêu cầu di chuyển này? Tài sản sẽ được di chuyển ngay sau khi phê duyệt. Bạn có thể đính kèm file minh chứng."
            : "Bạn có chắc chắn muốn từ chối yêu cầu di chuyển này?"
        }
        action={modalType || "propose"}
        isLoading={isFetchingMovement}
      />
    </div>
  );
}

