"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Edit,
  Trash2,
  RefreshCw,
  ChevronRight,
  Building,
  MapPin,
} from "lucide-react";
import { RootState, AppDispatch } from "@/lib/store";
import { fetchAssetById, clearAsset, fetchAssetHistory, clearAssetHistory } from "@/lib/store/slices/assetSlice";
import { AssetStatus, AssetType } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { asset, loading, error, assetHistory, historyLoading } = useSelector(
    (state: RootState) => state.asset
  );

  const assetId = params.id as string;

  useEffect(() => {
    if (assetId) {
      dispatch(fetchAssetById(assetId));
      dispatch(fetchAssetHistory(assetId));
    }

    return () => {
      dispatch(clearAsset());
      dispatch(clearAssetHistory());
    };
  }, [assetId, dispatch]);

  const handleRefresh = () => {
    if (assetId) {
      dispatch(fetchAssetById(assetId));
      dispatch(fetchAssetHistory(assetId));
    }
  };

  const handleEdit = () => {
    router.push(`/asset/${assetId}/edit`);
  };

  const handleDelete = () => {
    if (confirm("Bạn có chắc chắn muốn xóa tài sản này?")) {
      // TODO: Implement delete functionality
      console.log("Delete asset:", assetId);
    }
  };

  // Status labels for different history types
  const transactionStatusLabels: Record<string, string> = {
    DRAFT: "Nháp",
    PROPOSED: "Đã đề xuất",
    APPROVED: "Đã phê duyệt",
    RECEIVED: "Đã tiếp nhận",
    REJECTED: "Từ chối",
  };

  const transactionStatusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    PROPOSED: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    RECEIVED: "bg-blue-100 text-blue-800",
    REJECTED: "bg-red-100 text-red-800",
  };

  const movementStatusLabels: Record<string, string> = {
    PENDING_APPROVAL: "Chờ phê duyệt",
    APPROVED: "Đã phê duyệt",
    REJECTED: "Từ chối",
    IN_PROGRESS: "Đang thực hiện",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
  };

  const movementStatusColors: Record<string, string> = {
    PENDING_APPROVAL: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-gray-100 text-gray-800",
  };

  const liquidationStatusLabels: Record<string, string> = {
    DRAFT: "Nháp",
    PROPOSED: "Đề xuất thanh lý",
    APPROVED: "Đã phê duyệt",
    REJECTED: "Từ chối",
    FINALIZED: "Hoàn thành",
  };

  const liquidationStatusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    PROPOSED: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    FINALIZED: "bg-blue-100 text-blue-800",
  };

  // Component to render history timeline
  const AssetHistoryTimeline = () => {
    if (historyLoading) {
      return (
        <Card className="sticky top-6 border border-gray-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <RefreshCw className="w-5 h-5" />
              Lịch sử di chuyển
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="mt-2 text-gray-600">Đang tải lịch sử...</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!assetHistory || assetHistory.all.length === 0) {
      return (
        <Card className="sticky top-6 border border-gray-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <RefreshCw className="w-5 h-5" />
              Lịch sử di chuyển
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <RefreshCw className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">Chưa có lịch sử di chuyển</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="sticky top-6 border border-gray-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <RefreshCw className="w-5 h-5" />
            Lịch sử di chuyển
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0 max-h-[600px] overflow-y-auto pr-2">
            {assetHistory.all.map((history, index) => (
              <div key={`${history.type}-${history.id}`} className="relative pl-2">
                <div className="flex gap-4">
                  {/* Timeline line and Icon */}
                  <div className="flex flex-col items-center">
                    {/* Icon circle */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm relative z-10 ${
                        history.type === "TRANSACTION"
                          ? transactionStatusColors[(history as any).newStatus] || "bg-gray-100 text-gray-600"
                          : history.type === "MOVEMENT"
                          ? movementStatusColors[(history as any).newStatus] || "bg-gray-100 text-gray-600"
                          : liquidationStatusColors[(history as any).actionStatus] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {history.type === "TRANSACTION" ? (
                        <ArrowLeft className="w-4 h-4" />
                      ) : history.type === "MOVEMENT" ? (
                        <RefreshCw className="w-4 h-4" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </div>
                    {/* Timeline line */}
                    {index < assetHistory.all.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 mt-2 min-h-[60px]" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge className="text-xs">
                        {history.type === "TRANSACTION"
                          ? "Giao dịch"
                          : history.type === "MOVEMENT"
                          ? "Di chuyển"
                          : "Thanh lý"}
                      </Badge>
                      {history.type === "TRANSACTION" && (
                        <Badge
                          className={`${
                            transactionStatusColors[(history as any).newStatus] ||
                            "bg-gray-100 text-gray-800"
                          } text-xs`}
                        >
                          {transactionStatusLabels[(history as any).newStatus] ||
                            (history as any).newStatus}
                        </Badge>
                      )}
                      {history.type === "MOVEMENT" && (
                        <Badge
                          className={`${
                            movementStatusColors[(history as any).newStatus] ||
                            "bg-gray-100 text-gray-800"
                          } text-xs`}
                        >
                          {movementStatusLabels[(history as any).newStatus] ||
                            (history as any).newStatus}
                        </Badge>
                      )}
                      {history.type === "LIQUIDATION" && (
                        <Badge
                          className={`${
                            liquidationStatusColors[(history as any).actionStatus] ||
                            "bg-gray-100 text-gray-800"
                          } text-xs`}
                        >
                          {liquidationStatusLabels[(history as any).actionStatus] ||
                            (history as any).actionStatus}
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">
                        {format(new Date(history.createdAt), "dd/MM/yyyy HH:mm", {
                          locale: vi,
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="font-medium text-sm text-gray-900">
                        {history.user?.fullName || "N/A"}
                      </span>
                    </div>

                    {/* Location info for transaction/movement */}
                    {(history.type === "TRANSACTION" || history.type === "MOVEMENT") && (
                      <div className="mt-2 text-sm text-gray-600 space-y-1">
                        {/* From Unit - hiển thị cho cả transaction và movement nếu có */}
                        {(history as any).fromUnit && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Đơn vị gửi:</span>
                            <span>{(history as any).fromUnit.name}</span>
                          </div>
                        )}
                        
                        {/* From Room */}
                        {(history as any).fromRoom && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Từ phòng:</span>
                            <span>
                              {(history as any).fromRoom.roomCode.indexOf("INVENTORY") !== -1
                                ? "Kho"
                                : (history as any).fromRoom.roomCode}
                            </span>
                          </div>
                        )}
                        
                        {/* To Unit - hiển thị cho cả transaction và movement nếu có */}
                        {(history as any).toUnit && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Đơn vị nhận:</span>
                            <span>{(history as any).toUnit.name}</span>
                          </div>
                        )}
                        
                        {/* To Room */}
                        {(history as any).toRoom && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Đến phòng:</span>
                            <span>
                              {(history as any).toRoom.roomCode.indexOf("INVENTORY") !== -1
                                ? "Kho"
                                : (history as any).toRoom.roomCode}
                            </span>
                          </div>
                        )}
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
                          <AlertCircle className="w-4 h-4" />
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="mt-2 text-gray-600">Đang tải thông tin tài sản...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Không thể tải thông tin tài sản
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex items-center justify-center space-x-3">
              <Button onClick={handleRefresh} className="flex items-center">
                <RefreshCw className="w-4 h-4 mr-2" />
                Thử lại
              </Button>
              <Link href="/asset">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Không tìm thấy tài sản
            </h2>
            <p className="text-gray-600 mb-4">
              Tài sản với ID "{assetId}" không tồn tại hoặc đã bị xóa.
            </p>
            <Link href="/asset">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại danh sách
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col w-full sm:w-auto">
          <div className="flex items-center text-sm sm:text-base text-gray-600 mb-3">
            <button
              onClick={() => router.push("/asset/asset-book")}
              className="hover:text-blue-600 text-lg sm:text-xl transition-colors font-semibold cursor-pointer"
            >
              Tài sản
            </button>
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 mx-1 sm:mx-2" />
            <button
              onClick={() => router.push("/asset/asset-book")}
              className="hover:text-blue-600 text-lg sm:text-xl transition-colors font-semibold cursor-pointer"
            >
              Sổ tài sản
            </button>
            {asset && (
              <>
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 mx-1 sm:mx-2" />
                <span className="text-gray-900 font-semibold text-lg sm:text-xl">
                  {asset.name}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            className="flex items-center gap-2"
          >
            Chỉnh sửa
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2"
          >
            Xóa
          </Button>
        </div>
      </div>

      {/* Layout 2 cột */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Cột trái - Thông tin chính */}
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader></CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Thông tin chính */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">
                    Thông tin chính
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 mb-1 sm:mb-0">Tên tài sản</span>
                      <span className="font-medium break-words text-right sm:max-w-[60%]">
                        {asset?.name || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Mã KT</span>
                      <span className="font-medium">
                        {asset?.ktCode || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Mã TS</span>
                      <span className="font-medium">
                        {asset?.fixedCode || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Ngày nhập</span>
                      <span className="font-medium">
                        {asset?.entrydate
                          ? new Date(asset.entrydate).toLocaleDateString(
                              "vi-VN"
                            )
                          : "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Loại tài sản</span>
                      <span className="font-medium">
                        {asset?.type === AssetType.FIXED_ASSET
                          ? "Tài sản cố định"
                          : "Công cụ dụng cụ"}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Trạng thái</span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          asset?.status === AssetStatus.IN_USE
                            ? "bg-green-100 text-green-800"
                            : asset?.status === AssetStatus.UNIDENTIFIED
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {asset?.status === AssetStatus.IN_USE
                          ? "Đang sử dụng"
                          : asset?.status === AssetStatus.UNIDENTIFIED
                          ? "Chưa định danh"
                          : "Khác"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Thông tin số lượng & danh mục */}
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Số lượng</span>
                      <span className="font-medium">
                        {asset?.quantity || 1}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Đơn vị tính</span>
                      <span className="font-medium">
                        {asset?.unit || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Danh mục</span>
                      <span className="font-medium">
                        {asset?.category?.name || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Vị trí trong phòng</span>
                      <span className="font-medium">
                        {asset?.locationInRoom || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RFID Tag */}
                {asset?.rfidTag && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                      RFID Tag
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <div className="font-mono text-sm break-all">
                        {asset.rfidTag.rfidId}
                      </div>
                    </div>
                  </div>
                )}

                {/* Vị trí hiện tại */}
                {asset?.currentRoom && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                      Vị trí hiện tại
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Phòng</span>
                        <span className="font-medium">{asset.currentRoom.name}</span>
                      </div>

                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Tòa</span>
                        <span className="font-medium">{asset.currentRoom.building}</span>
                      </div>

                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Tầng</span>
                        <span className="font-medium">{asset.currentRoom.floor}</span>
                      </div>

                      {asset.currentRoom.unit && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Đơn vị</span>
                          <span className="font-medium">{asset.currentRoom.unit.name}</span>
                        </div>
                      )}

                      {asset.locationInRoom && (
                        <div className="flex justify-between py-2 border-b border-gray-100 md:col-span-2">
                          <span className="text-gray-600">Vị trí trong phòng</span>
                          <span className="font-medium">{asset.locationInRoom}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Thông số kỹ thuật */}
                {asset?.specs && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                      Thông số kỹ thuật
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                        {asset.specs}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cột phải - Lịch sử di chuyển */}
        <div className="xl:col-span-1">
          <AssetHistoryTimeline />
        </div>
      </div>
    </div>
  );
}
