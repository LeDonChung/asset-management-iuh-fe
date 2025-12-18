"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Package,
  Eye,
  MoreVertical,
  Tag,
  ChevronRight,
  FileUp,
} from "lucide-react";
import Link from "next/link";
import {
  Asset,
  AssetType,
  AssetStatus,
  FieldType,
  FilterOperator,
} from "@/types/asset";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableColumn } from "@/components/ui/table";
import { RootState } from "@/lib/store";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useAppDispatch } from "@/lib/store/hooks";
import {
  fetchUnidentifiedAssets,
  UnidentifiedAssetFilter,
  updateAsset,
} from "@/lib/store/slices/assetSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Modal } from "@/components/ui/modal";
import { Label } from "@/components/ui/label";
import { PermissionConstants } from "@/hooks/usePermissions";
import { useAuth } from "@/contexts/AuthContext";
import ImportAssetsModal from "@/components/assets/ImportAssetsModal";

export default function UnidentifiedAssetsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showIdentifyModal, setShowIdentifyModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [rfidValue, setRfidValue] = useState("");
  const [identifyLoading, setIdentifyLoading] = useState(false);
  const router = useRouter();
  const { hasAnyPermission } = useAuth();
  const canIdentify = hasAnyPermission([
    PermissionConstants.PERM_IDENTIFY_ASSET,
  ]);
  const canView = hasAnyPermission([PermissionConstants.PERM_VIEW_ASSET]);

  useEffect(() => {
    if (!canIdentify) {
      //   router.push("/unauthorized");
    }
  }, [canIdentify, router]);

  const { unidentifiedAssets, unidentifiedLoading } = useSelector(
    (state: RootState) => state.asset
  );

  const dispatch = useAppDispatch();

  const [currentFilter, setCurrentFilter] = useState<UnidentifiedAssetFilter>({
    pagination: {
      currentPage: 1,
      itemsPerPage: 10,
    },
    sorting: [],
    conditions: [
      // Chỉ lấy tài sản cố định
      {
        field: "type",
        fieldType: FieldType.SELECT,
        operator: FilterOperator.EQUALS,
        value: [AssetType.FIXED_ASSET],
      },
    ],
  });

  useEffect(() => {
    const loadData = () => {
      try {
        dispatch(fetchUnidentifiedAssets(currentFilter));
      } catch (e: any) {
        toast.error(e.message || "Có lỗi xảy ra.");
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Đợi 500ms sau khi người dùng ngừng gõ

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  useEffect(() => {
    handlerRender({
      ...currentFilter,
      conditions: [
        // Luôn lọc theo tài sản cố định
        {
          field: "type",
          fieldType: FieldType.SELECT,
          operator: FilterOperator.EQUALS,
          value: [AssetType.FIXED_ASSET],
        },
        ...(debouncedSearchTerm
          ? [
              {
                field: "name",
                fieldType: FieldType.TEXT,
                operator: FilterOperator.CONTAINS,
                value: [debouncedSearchTerm],
              },
            ]
          : []),
      ],
    });
  }, [debouncedSearchTerm]);

  const handlerRender = (filter: UnidentifiedAssetFilter) => {
    setCurrentFilter(filter);
    dispatch(fetchUnidentifiedAssets(filter));
  };

  const handleIdentifyAsset = (asset: Asset) => {
    router.push(`/asset/${asset.id}/edit`);
  };

  const handleViewAsset = (asset: Asset) => {
    router.push(`/asset/${asset.id}`);
  };

  const handleOpenIdentifyModal = (asset: Asset) => {
    setSelectedAsset(asset);
    setRfidValue(asset.rfidTag?.rfidId || "");
    setShowIdentifyModal(true);
  };

  const handleCloseIdentifyModal = () => {
    setShowIdentifyModal(false);
    setSelectedAsset(null);
    setRfidValue("");
  };

  const handleSubmitIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAsset) return;
    
    if (!rfidValue.trim()) {
      toast.error("Vui lòng nhập mã RFID");
      return;
    }

    setIdentifyLoading(true);

    try {
      await dispatch(updateAsset({
        id: selectedAsset.id,
        data: {
          rfid: rfidValue.trim(),
        }
      })).unwrap();

      toast.success("Định danh tài sản thành công!");
      handleCloseIdentifyModal();
      dispatch(fetchUnidentifiedAssets(currentFilter));
    } catch (error: any) {
      console.error("Error identifying asset:", error);
      toast.error(error.message || "Có lỗi xảy ra khi định danh tài sản.");
    } finally {
      setIdentifyLoading(false);
    }
  };

  const getUnidentifiedReason = (asset: Asset) => {
    const reasons: string[] = [];

    if (!asset.currentRoomId) {
      reasons.push("Chưa có vị trí");
    }

    if (asset.type === AssetType.FIXED_ASSET && !asset.rfidTag?.rfidId) {
      reasons.push("Chưa có RFID tag");
    }

    return reasons.join(", ") || "Chưa rõ lý do";
  };

  const columns: TableColumn<Asset>[] = [
    {
      key: "fixedCode",
      title: "Mã TSCD",
      render: (_, record) => (
        <div className="text-sm font-medium text-gray-900">
          {record.fixedCode}
        </div>
      ),
      sortable: true,
    },
    {
      key: "ktCode",
      title: "Mã KT",
      render: (_, record) => (
        <div className="text-sm font-medium text-gray-900">{record.ktCode}</div>
      ),
      sortable: true,
    },
    {
      key: "name",
      title: "Tên tài sản",
      render: (_, record) => (
        <div className="text-sm font-medium text-gray-900">{record.name}</div>
      ),
      sortable: true,
    },
    {
      key: "category",
      title: "Danh mục",
      render: (_, record) => (
        <div className="text-sm text-gray-900">
          {record.category?.name || "Chưa phân loại"}
        </div>
      ),
      sortable: true,
    },
    {
      key: "specs",
      title: "Thông số kỹ thuật",
      render: (_, record) => (
        <div className="text-sm text-gray-900">{record.specs || "-"}</div>
      ),
      sortable: true,
    },
    {
      key: "origin",
      title: "Nước SX",
      render: (_, record) => (
        <div className="text-sm text-gray-900">{record.origin || "-"}</div>
      ),
      sortable: true,
    },
    {
      key: "unit",
      title: "ĐVT",
      render: (_, record) => (
        <div className="text-sm text-gray-900 text-center">{record.unit}</div>
      ),
      className: "text-center",
    },
    {
      key: "quantity",
      title: "Số lượng",
      render: (_, record) => (
        <div className="text-sm font-medium text-gray-900 text-center">
          {record.quantity}
        </div>
      ),
      sortable: true,
      className: "text-center",
    },
    {
      key: "entrydate",
      title: "Ngày nhập",
      render: (_, record) => (
        <div className="text-sm text-gray-900">
          {new Date(record.entrydate).toLocaleDateString("vi-VN")}
        </div>
      ),
      sortable: true,
    },
    {
      key: "rfidStatus",
      title: "Trạng thái RFID",
      render: (_, record) => (
        <div className="flex justify-center">
          {record.rfidTag?.rfidId ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
              Đã có RFID
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
              Chưa có RFID
            </span>
          )}
        </div>
      ),
      className: "text-center",
    },
    {
      key: "actions",
      title: "Thao tác",
      render: (_, record) => (
        <div className="flex justify-start">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={unidentifiedLoading}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {canIdentify && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenIdentifyModal(record);
                  }}
                  className="flex items-center gap-2 cursor-pointer text-blue-600"
                >
                  <span>Định danh</span>
                </DropdownMenuItem>
              )}
              {canView && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewAsset(record);
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span>Xem chi tiết</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleIdentifyAsset(record);
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <span>Chỉnh sửa</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center text-sm sm:text-base text-gray-600 mb-3">
            <button
              onClick={() => router.push("/asset")}
              className="hover:text-blue-600 text-lg sm:text-xl transition-colors font-semibold cursor-pointer"
            >
              Tài sản
            </button>
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 mx-1 sm:mx-2" />
            <span className="text-gray-900 font-semibold text-lg sm:text-xl">
              Định danh
            </span>
          </div>
        </div>
        {canIdentify && (
          <div className="flex gap-2">
            <Button
              onClick={() => setShowImportModal(true)}
              variant="outline"
              className="flex items-center gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2"
            >
              <FileUp className="h-4 w-4" />
              Nhập Excel
            </Button>
            <Link href="/asset/create">
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-3 sm:px-4 py-2">
                <Plus className="h-4 w-4" />
                Thêm tài sản mới
              </Button>
            </Link>
          </div>
        )}
      </div>
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-300 mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Nhập tên, mã tài sản cố định..."
                  className="pl-10 min-h-[2.75rem] text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <Table<Asset>
        columns={columns}
        data={unidentifiedAssets.data}
        loading={unidentifiedLoading}
        emptyText="Không có tài sản cố định nào chưa có RFID"
        emptyIcon={<Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
        multiSort={true}
        sortConfigs={currentFilter.sorting}
        onSortChange={(sortConfigs) => {
          handlerRender({
            ...currentFilter,
            sorting: sortConfigs,
          });
        }}
        pagination={{
          current: unidentifiedAssets?.pagination.page || 1,
          pageSize: unidentifiedAssets?.pagination.limit || 10,
          total: unidentifiedAssets?.pagination.total || 0,
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

      {/* Identify Modal */}
      <Modal 
        isOpen={showIdentifyModal} 
        onClose={handleCloseIdentifyModal} 
        title="Định danh tài sản"
      >
        <form onSubmit={handleSubmitIdentify} className="space-y-4">
          {selectedAsset && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">{selectedAsset.name}</span>
                <span className="text-gray-400 mx-2">•</span>
                <span className="text-gray-600">{selectedAsset.ktCode}</span>
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="rfid">Mã RFID *</Label>
            <Input
              id="rfid"
              type="text"
              value={rfidValue}
              onChange={(e) => setRfidValue(e.target.value)}
              placeholder="Nhập mã RFID"
              required
              disabled={identifyLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Hệ thống sẽ tự động kiểm tra và cập nhật trạng thái tài sản
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCloseIdentifyModal}
              disabled={identifyLoading}
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={identifyLoading || !rfidValue.trim()}
            >
              {identifyLoading ? 'Đang xử lý...' : 'Định danh'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Import Modal */}
      <ImportAssetsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => {
          dispatch(fetchUnidentifiedAssets(currentFilter));
        }}
      />
    </div>
  );
}
