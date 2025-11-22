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
  getTransactionById,
  proposeTransaction,
  approveTransaction,
  rejectTransaction,
  TransactionResponseDto,
  TransactionItemResponseDto,
  TransactionHistoryResponseDto,
} from "@/lib/store/slices/transactionSlice";
import { TransactionStatus, TransactionType } from "@/types/asset";
import { PermissionConstants } from "@/hooks/usePermissions";
import toast from "react-hot-toast";
import TransactionStatusModal from "@/components/modal/TransactionStatusModal";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const statusColors: Record<TransactionStatus, string> = {
  [TransactionStatus.DRAFT]: "bg-gray-100 text-gray-800",
  [TransactionStatus.PROPOSED]: "bg-yellow-100 text-yellow-800",
  [TransactionStatus.APPROVED]: "bg-green-100 text-green-800",
  [TransactionStatus.RECEIVED]: "bg-blue-100 text-blue-800",
  [TransactionStatus.REJECTED]: "bg-red-100 text-red-800",
};

const statusLabels: Record<TransactionStatus, string> = {
  [TransactionStatus.DRAFT]: "Nháp",
  [TransactionStatus.PROPOSED]: "Đã đề xuất",
  [TransactionStatus.APPROVED]: "Đã phê duyệt",
  [TransactionStatus.RECEIVED]: "Đã tiếp nhận",
  [TransactionStatus.REJECTED]: "Từ chối",
};

const typeLabels: Record<TransactionType, string> = {
  [TransactionType.TRANSFER]: "Bàn giao",
  [TransactionType.INTERNAL_MOVE]: "Di chuyển nội bộ",
};

// Component để hiển thị bảng danh sách tài sản
const TransactionItemsTable: React.FC<{
  items: TransactionItemResponseDto[];
}> = ({ items }) => {
  const columns: TableColumn<TransactionItemResponseDto>[] = [
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
      key: "fromRoom",
      title: "Từ phòng",
      render: (value, record) => (
        <div className="text-left">
          {record.fromRoom ? (
            <div className="space-y-1">
              <div className="text-sm text-gray-500">
                {record.fromRoom.roomCode}
              </div>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">Chưa phân bổ</span>
          )}
        </div>
      ),
    },
    {
      key: "toRoom",
      title: "Đến phòng",
      render: (value, record) => (
        <div className="text-left">
          {record.toRoom ? (
            <div className="space-y-1">
              <div className="text-sm text-gray-500">
                {record.toRoom.roomCode}
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
    },
  ];

  return <Table data={items || []} columns={columns} />;
};

// Component để hiển thị lịch sử xử lý
const TransactionHistory: React.FC<{
  histories: TransactionHistoryResponseDto[];
}> = ({ histories }) => {
  const sortedHistories = [...(histories || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Lịch sử xử lý
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {sortedHistories.map((history, index) => (
            <div key={history.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    history.newStatus === TransactionStatus.APPROVED
                      ? "bg-green-100 text-green-600"
                      : history.newStatus === TransactionStatus.REJECTED
                      ? "bg-red-100 text-red-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {history.newStatus === TransactionStatus.APPROVED ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : history.newStatus === TransactionStatus.REJECTED ? (
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
                      statusColors[history.newStatus] ||
                      "bg-gray-100 text-gray-800"
                    }
                  >
                    {statusLabels[history.newStatus] || history.newStatus}
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
                  {history.changer?.fullName || "N/A"}
                </div>
                {history.note && (
                  <div className="text-sm text-gray-600 mt-1">
                    {history.note}
                  </div>
                )}
                {history.evidenceUrl && (
                  <div className="mt-2">
                    <a
                      href={history.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" />
                      Xem minh chứng
                    </a>
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
const TransactionActions: React.FC<{
  transaction: TransactionResponseDto;
  onAction: (type: "propose" | "approve" | "reject", data: any) => void;
  isLoading: boolean;
}> = ({ transaction, onAction, isLoading }) => {
  const { hasAnyPermission } = useAuth();

  const canApprove = hasAnyPermission([
    PermissionConstants.PERM_APPROVE_TRANSACTION,
  ]);
  const canPropose = hasAnyPermission([
    PermissionConstants.PERM_PROPOSE_TRANSACTION,
  ]);

  const renderActions = () => {
    switch (transaction.status) {
      case TransactionStatus.DRAFT:
        if (canPropose) {
          return (
            <Button
              onClick={() => onAction("propose", {})}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Gửi đề xuất
            </Button>
          );
        }
        return null;

      case TransactionStatus.PROPOSED:
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

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { hasAnyPermission } = useAuth();
  const dispatch = useAppDispatch();

  const {
    currentTransactionDetail,
    isFetchingTransaction,
    fetchTransactionError,
  } = useAppSelector((state: RootState) => state.transaction);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<
    "propose" | "approve" | "reject" | null
  >(null);

  const transactionId = params.id as string;

  const canView = hasAnyPermission([PermissionConstants.PERM_VIEW_TRANSACTION]);

  useEffect(() => {
    if (!canView) {
      toast.error("Bạn không có quyền xem chi tiết giao dịch");
      router.push("/asset/transaction");
      return;
    }

    if (transactionId) {
      dispatch(getTransactionById(transactionId));
    }
  }, [transactionId, dispatch, canView, router]);

  const handleAction = (type: "propose" | "approve" | "reject", data: any) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleModalConfirm = async (formData: any) => {
    if (!modalType || !currentTransactionDetail) return;

    try {
      switch (modalType) {
        case "propose":
          await dispatch(
            proposeTransaction({
              id: currentTransactionDetail.id,
              proposeDto: formData,
            })
          ).unwrap();
          toast.success("Đề xuất đã được gửi thành công");
          break;
        case "approve":
          await dispatch(
            approveTransaction({
              id: currentTransactionDetail.id,
              approveDto: formData,
            })
          ).unwrap();
          toast.success("Giao dịch đã được phê duyệt thành công");
          break;
        case "reject":
          await dispatch(
            rejectTransaction({
              id: currentTransactionDetail.id,
              rejectDto: formData,
            })
          ).unwrap();
          toast.success("Giao dịch đã được từ chối");
          break;
      }

      // Refresh data
      dispatch(getTransactionById(transactionId));
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    }
  };

  if (isFetchingTransaction) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (fetchTransactionError || !currentTransactionDetail) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">
            Không tìm thấy giao dịch
          </h3>
          <p className="text-gray-500">
            {fetchTransactionError || "Giao dịch không tồn tại hoặc đã bị xóa."}
          </p>
        </div>
        <Button
          onClick={() => router.push("/asset/transaction")}
          variant="outline"
        >
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/asset/transaction")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Chi tiết giao dịch</h1>
                <p className="text-sm text-gray-600 truncate max-w-md">
                  {typeLabels[currentTransactionDetail.type] ||
                    currentTransactionDetail.type}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Badge
                className={
                  statusColors[currentTransactionDetail.status] ||
                  "bg-gray-100 text-gray-800"
                }
              >
                {statusLabels[currentTransactionDetail.status] ||
                  currentTransactionDetail.status}
              </Badge>
              <TransactionActions
                transaction={currentTransactionDetail}
                onAction={handleAction}
                isLoading={isFetchingTransaction}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Cột trái - Nội dung chính */}
          <div className="xl:col-span-2 space-y-6">
            {/* Thông tin cơ bản */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <Card className="border-0 shadow-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Thông tin giao dịch
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        Loại giao dịch
                      </div>
                      <div className="font-medium">
                        {typeLabels[currentTransactionDetail.type] ||
                          currentTransactionDetail.type}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        Người tạo
                      </div>
                      <div className="font-medium">
                        {currentTransactionDetail.requester?.fullName || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {currentTransactionDetail.requester?.username || "N/A"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">Đơn vị gửi</div>
                      <div className="font-medium">
                        {currentTransactionDetail.fromUnit?.name || "N/A"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">Đơn vị nhận</div>
                      <div className="font-medium">
                        {currentTransactionDetail.toUnit?.name || "N/A"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">Ngày tạo</div>
                      <div className="font-medium">
                        {currentTransactionDetail.createdAt
                          ? format(
                              new Date(currentTransactionDetail.createdAt),
                              "dd/MM/yyyy HH:mm",
                              { locale: vi }
                            )
                          : "N/A"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">Ngày cập nhật</div>
                      <div className="font-medium">
                        {currentTransactionDetail.updatedAt
                          ? format(
                              new Date(currentTransactionDetail.updatedAt),
                              "dd/MM/yyyy HH:mm",
                              { locale: vi }
                            )
                          : "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Ghi chú yêu cầu */}
                  {currentTransactionDetail.requestNote && (
                    <>
                      <Separator className="my-4" />
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">
                          Ghi chú yêu cầu
                        </div>
                        <div className="p-3 bg-gray-50 rounded-md text-sm">
                          {currentTransactionDetail.requestNote}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Thông tin phê duyệt/từ chối */}
                  {(currentTransactionDetail.approvalNote ||
                    currentTransactionDetail.rejectionReason) && (
                    <>
                      <Separator className="my-4" />
                      <div className="space-y-4">
                        {currentTransactionDetail.approvalNote && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              Ghi chú phê duyệt
                            </div>
                            <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm">
                              {currentTransactionDetail.approvalNote}
                            </div>
                            {currentTransactionDetail.approver && (
                              <div className="text-xs text-gray-500">
                                Người phê duyệt:{" "}
                                {currentTransactionDetail.approver.fullName}
                              </div>
                            )}
                          </div>
                        )}

                        {currentTransactionDetail.rejectionReason && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <XCircle className="w-4 h-4 text-red-600" />
                              Lý do từ chối
                            </div>
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm">
                              {currentTransactionDetail.rejectionReason}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Danh sách tài sản */}
            <TransactionItemsTable
              items={currentTransactionDetail.items || []}
            />
          </div>

          {/* Cột phải - Lịch sử xử lý */}
          <div className="xl:col-span-1">
            <TransactionHistory
              histories={currentTransactionDetail.histories || []}
            />
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
            ? "Gửi đề xuất bàn giao"
            : modalType === "approve"
            ? "Phê duyệt giao dịch"
            : "Từ chối giao dịch"
        }
        description={
          modalType === "propose"
            ? "Bạn có chắc chắn muốn gửi đề xuất bàn giao này?"
            : modalType === "approve"
            ? "Bạn có chắc chắn muốn phê duyệt giao dịch này?"
            : "Bạn có chắc chắn muốn từ chối giao dịch này?"
        }
        action={modalType || "propose"}
        isLoading={isFetchingTransaction}
      />
    </div>
  );
}
