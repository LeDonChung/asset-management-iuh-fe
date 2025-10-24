"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Edit,
  Trash2,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { RootState, AppDispatch } from "@/lib/store";
import {
  fetchAssetById,
  clearAsset,
  clearError,
} from "@/lib/store/slices/assetSlice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AssetDetailCard from "@/components/asset/AssetDetailCard";
import HandoverHistoryCard from "@/components/asset/HandoverHistoryCard";

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link href="/asset/asset-book">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold">Chi tiết tài sản</h1>
                <p className="text-sm text-gray-600 truncate max-w-md">
                  {asset?.name}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Làm mới
              </Button>
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </Button>
              <Button variant="outline" size="sm" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Asset Detail */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <AssetDetailCard asset={asset} />
          </div>

          {/* Handover History */}
          <div className="bg-white rounded-lg  border border-gray-200 overflow-hidden">
            <HandoverHistoryCard
              transactionItems={asset.transactionItems || []}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
