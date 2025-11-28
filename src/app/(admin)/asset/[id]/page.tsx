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
} from "lucide-react";
import { RootState, AppDispatch } from "@/lib/store";
import { fetchAssetById, clearAsset } from "@/lib/store/slices/assetSlice";
import { AssetStatus, AssetType } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { asset, loading, error } = useSelector(
    (state: RootState) => state.asset
  );

  const assetId = params.id as string;

  useEffect(() => {
    if (assetId) {
      dispatch(fetchAssetById(assetId));
    }

    return () => {
      dispatch(clearAsset());
    };
  }, [assetId, dispatch]);

  const handleRefresh = () => {
    if (assetId) {
      dispatch(fetchAssetById(assetId));
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Chi tiết tài sản</h1>
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
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 ">
        {/* Cột trái - Thông tin chính */}
        <div className="xl:col-span-2 ">
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

        {/* Cột phải - Vị trí hiện tại */}
        <div className="xl:col-span-1">
          {asset?.currentRoom && (
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Vị trí hiện tại</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">Phòng</div>
                    <div className="font-medium">{asset.currentRoom.name}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">Tòa</div>
                    <div className="font-medium">
                      {asset.currentRoom.building}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">Tầng</div>
                    <div className="font-medium">{asset.currentRoom.floor}</div>
                  </div>

                  {asset.currentRoom.unit && (
                    <div className="space-y-1">
                      <div className="text-sm text-gray-600">Đơn vị</div>
                      <div className="font-medium">
                        {asset.currentRoom.unit.name}
                      </div>
                    </div>
                  )}

                  {asset.locationInRoom && (
                    <div className="space-y-1">
                      <div className="text-sm text-gray-600">
                        Vị trí trong phòng
                      </div>
                      <div className="font-medium">{asset.locationInRoom}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
