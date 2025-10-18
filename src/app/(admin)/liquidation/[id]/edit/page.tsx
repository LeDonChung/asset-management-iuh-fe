"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableColumn } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Package, FileText, Eye, Calendar, MapPin, User, Camera, Info, Save, X, RefreshCw } from "lucide-react";
import {
  LiquidationProposedInventoryResult,
  AssetType,
  InventoryResultStatus,
  LiquidationProposedFilterRequest,
  LiquidationProposalResponseDto,
  LiquidationStatus,
  UpdateLiquidationProposalDto,
  UpdateLiquidationItemDto,
} from "@/types/asset";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { RootState } from "@/lib/store";
import {
  filterLiquidationProposedInventoryResults,
  getLiquidationProposalById,
  updateLiquidationProposal,
} from "@/lib/store/slices/liquidationSlice";
import toast from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { useAuth } from "@/contexts/AuthContext";
import { PermissionConstants } from "@/hooks/usePermissions";

const statusLabels = {
  [InventoryResultStatus.MATCHED]: "Khớp",
  [InventoryResultStatus.MISSING]: "Thiếu",
  [InventoryResultStatus.EXCESS]: "Thừa",
  [InventoryResultStatus.BROKEN]: "Hư hỏng",
  [InventoryResultStatus.NEEDS_REPAIR]: "Cần sửa chữa",
  [InventoryResultStatus.LIQUIDATION_PROPOSED]: "Đề xuất thanh lý",
};

const statusColors = {
  [InventoryResultStatus.MATCHED]: "bg-green-100 text-green-800",
  [InventoryResultStatus.MISSING]: "bg-red-100 text-red-800",
  [InventoryResultStatus.EXCESS]: "bg-yellow-100 text-yellow-800",
  [InventoryResultStatus.BROKEN]: "bg-red-100 text-red-800",
  [InventoryResultStatus.NEEDS_REPAIR]: "bg-orange-100 text-orange-800",
  [InventoryResultStatus.LIQUIDATION_PROPOSED]: "bg-purple-100 text-purple-800",
};

const assetTypeLabels = {
  [AssetType.FIXED_ASSET]: "Tài sản cố định",
  [AssetType.TOOLS_EQUIPMENT]: "Công cụ dụng cụ",
};

const liquidationStatusLabels = {
  [LiquidationStatus.DRAFT]: "Nháp",
  [LiquidationStatus.PROPOSED]: "Đã gửi",
  [LiquidationStatus.APPROVED]: "Đã duyệt",
  [LiquidationStatus.REJECTED]: "Từ chối",
  [LiquidationStatus.FINALIZED]: "Hoàn thành",
};

const liquidationStatusColors = {
  [LiquidationStatus.DRAFT]: "bg-gray-100 text-gray-800",
  [LiquidationStatus.PROPOSED]: "bg-blue-100 text-blue-800",
  [LiquidationStatus.APPROVED]: "bg-green-100 text-green-800",
  [LiquidationStatus.REJECTED]: "bg-red-100 text-red-800",
  [LiquidationStatus.FINALIZED]: "bg-purple-100 text-purple-800",
};

export default function LiquidationEditPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const liquidationId = params.id as string;
  
  const {
    filteredLiquidationProposedInventoryResults,
    currentLiquidationProposedFilter,
    currentLiquidationProposal,
    isFetchingProposal,
    isUpdatingProposal,
    updateProposalError,
  } = useAppSelector((state: RootState) => state.liquidation);

  const [searchTerm, setSearchTerm] = useState("");
  const [roomFilter, setRoomFilter] = useState<string>("");
  const [assetTypeFilter, setAssetTypeFilter] = useState<AssetType>(AssetType.FIXED_ASSET);
  const { user, hasAnyPermission } = useAuth();
  
  const canUpdate = hasAnyPermission([
    PermissionConstants.PERM_UPDATE_LIQUIDATION,
  ]);

  // State for selected assets (for comparison and editing)
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [originalSelectedAssets, setOriginalSelectedAssets] = useState<string[]>([]);
  
  // State for detail modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<LiquidationProposedInventoryResult | null>(null);
  
  // State for save confirmation modal
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!canUpdate) {
      router.push("/unauthorized");
      return;
    }

    if (liquidationId) {
      // Load liquidation proposal details
      dispatch(getLiquidationProposalById(liquidationId));
    }
  }, [canUpdate, router, liquidationId, dispatch]);

  // Load inventory data when proposal is loaded
  useEffect(() => {
    if (currentLiquidationProposal) {
      const initialFilter: LiquidationProposedFilterRequest = {
        ...currentLiquidationProposedFilter,
        assetType: currentLiquidationProposal.assetType,
      };

      dispatch(filterLiquidationProposedInventoryResults(initialFilter));
      
      // Set original selected assets from current proposal
      const currentAssetIds = currentLiquidationProposal.items?.map(item => item.assetId) || [];
      setOriginalSelectedAssets(currentAssetIds);
      // Note: selectedAssets will be set after inventory data is loaded
    }
  }, [currentLiquidationProposal, dispatch]);

  // Set selected assets when inventory data is loaded
  useEffect(() => {
    if (filteredLiquidationProposedInventoryResults.data.length > 0 && originalSelectedAssets.length > 0) {
      // Map asset IDs to inventory result IDs
      const selectedInventoryIds = filteredLiquidationProposedInventoryResults.data
        .filter(item => originalSelectedAssets.includes(item.asset.id))
        .map(item => item.id);
      setSelectedAssets(selectedInventoryIds);
    }
  }, [filteredLiquidationProposedInventoryResults.data, originalSelectedAssets]);

  // Check for changes
  useEffect(() => {
    const hasChanged = JSON.stringify(selectedAssets.sort()) !== JSON.stringify(originalSelectedAssets.map(assetId => 
      filteredLiquidationProposedInventoryResults.data.find(item => item.asset.id === assetId)?.id
    ).filter(Boolean).sort());
    setHasChanges(hasChanged);
  }, [selectedAssets, originalSelectedAssets, filteredLiquidationProposedInventoryResults.data]);

  // Show error toast if update fails
  useEffect(() => {
    if (updateProposalError) {
      toast.error(updateProposalError);
    }
  }, [updateProposalError]);

  // Table columns configuration
  const columns: TableColumn<LiquidationProposedInventoryResult>[] = [
    {
      key: "stt",
      title: "STT",
      width: "60px",
      render: (_, record, index) => (
        <div className="text-sm text-center text-gray-900 font-medium">
          {((filteredLiquidationProposedInventoryResults?.pagination.page ||
            1) -
            1) *
            (filteredLiquidationProposedInventoryResults?.pagination.limit ||
              10) +
            index +
            1}
        </div>
      ),
      className: "text-center",
    },
    {
      key: "asset.fixedCode",
      title: "Mã tài sản",
      width: "120px",
      render: (_, record) => (
        <div className="text-sm">
          <div className="text-xs text-gray-500">{record.asset.fixedCode}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "asset.ktCode",
      title: "Mã kế toán",
      width: "120px",
      render: (_, record) => (
        <div className="text-sm">
          <div className="text-xs text-gray-500">{record.asset.ktCode}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "asset.name",
      title: "Tên tài sản",
      width: "200px",
      render: (_, record) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 line-clamp-2">
            {record.asset.name}
          </div>
          {record.asset.specs && (
            <div className="text-xs text-gray-500 mt-1 line-clamp-1">
              {record.asset.specs}
            </div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      key: "room.code",
      title: "Mã vị trí",
      width: "120px",
      render: (_, record) => (
        <div className="text-sm">
          <div className="text-xs text-gray-500">{record.room.code}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "systemQuantity",
      title: "SL theo sổ sách",
      width: "80px",
      render: (_, record) => (
        <div className="text-sm text-center text-gray-900 font-medium">
          {record.systemQuantity}
        </div>
      ),
      className: "text-center",
      sortable: true,
    },
    {
      key: "countedQuantity",
      title: "SL theo kiểm kê",
      width: "80px",
      render: (_, record) => (
        <div className="text-sm text-center text-gray-900 font-medium">
          {record.countedQuantity}
        </div>
      ),
      className: "text-center",
      sortable: true,
    },
    {
      key: "note",
      title: "Ghi chú",
      width: "150px",
      render: (_, record) => (
        <div className="text-sm text-gray-600">{record.note || "-"}</div>
      ),
    },
    {
      key: "imgs",
      title: "Hình ảnh",
      width: "100px",
      render: (_, record) => (
        <div className="flex justify-center">
          {record.fileUrls && record.fileUrls.length > 0 ? (
            record.fileUrls.slice(0, 3).map((file) => (
              <img
                key={file.id}
                src={file.url}
                alt="Asset"
                className="w-20 h-20 rounded-md object-cover mx-1 border"
              />
            ))
          ) : (
            <div className="text-xs text-gray-500">Không có hình ảnh</div>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      title: "Thao tác",
      width: "120px",
      render: (_, record) => (
        <div className="flex justify-start">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="h-8 px-3 text-sm">
                Hành động
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAssetDetail(record);
                  setIsDetailModalOpen(true);
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <span>Xem chi tiết</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      className: "text-left",
    },
  ];

  const handlerRender = (filter: LiquidationProposedFilterRequest) => {
    dispatch(filterLiquidationProposedInventoryResults(filter));
  };

  useEffect(() => {
    if (currentLiquidationProposal) {
      handlerRender({
        ...currentLiquidationProposedFilter,
        search: searchTerm || undefined,
        roomId: roomFilter || undefined,
        assetType: assetTypeFilter,
      });
    }
  }, [searchTerm, roomFilter, assetTypeFilter, currentLiquidationProposal]);

  // Get unique rooms from data for filter
  const availableRooms = useMemo(() => {
    const rooms = filteredLiquidationProposedInventoryResults.data
      .map((item) => item.room)
      .filter(
        (room, index, self) => index === self.findIndex((r) => r.id === room.id)
      );
    return rooms;
  }, [filteredLiquidationProposedInventoryResults.data]);

  // Handle asset selection
  const handleAssetSelection = (
    selectedRowKeys: string[],
    selectedRows: LiquidationProposedInventoryResult[]
  ) => {
    setSelectedAssets(selectedRowKeys);
  };

  // Handle save liquidation proposal
  const handleSaveProposal = () => {
    if (!hasChanges) {
      toast("Không có thay đổi nào để lưu");
      return;
    }

    setIsSaveModalOpen(true);
  };

  // Handle confirm save
  const handleConfirmSave = async () => {
    try {
      if (!currentLiquidationProposal) {
        toast.error("Không tìm thấy thông tin đề xuất");
        return;
      }

      // Tạo danh sách items từ các tài sản đã chọn
      const selectedItems = filteredLiquidationProposedInventoryResults.data.filter(
        (item) => selectedAssets.includes(item.id)
      );

      const updateDto: UpdateLiquidationProposalDto = {
        items: selectedItems.map((item): UpdateLiquidationItemDto => {
          // Tìm item hiện tại trong proposal (nếu có)
          const existingItem = currentLiquidationProposal.items?.find(
            proposalItem => proposalItem.assetId === item.asset.id
          );

          return {
            id: existingItem?.id, // Giữ ID cũ nếu có để cập nhật
            assetId: item.asset.id,
            systemQuantity: item.systemQuantity,
            countedQuantity: item.countedQuantity,
            note: item.note || `Đề xuất thanh lý từ kết quả kiểm kê - ${item.inventorySession.name}`,
            // Lấy hình ảnh đầu tiên nếu có
            imageUrl: item.fileUrls && item.fileUrls.length > 0 ? item.fileUrls[0].url : undefined,
          };
        }),
      };

      // Gọi API cập nhật đề xuất thanh lý
      await dispatch(updateLiquidationProposal({
        id: liquidationId,
        updateDto: updateDto
      })).unwrap();
      
      toast.success("Đã cập nhật đề xuất thanh lý thành công!");
      
      setIsSaveModalOpen(false);
      
      // Reload proposal data
      dispatch(getLiquidationProposalById(liquidationId));
      
    } catch (error: any) {
      console.error("Error updating liquidation proposal:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi cập nhật đề xuất thanh lý. Vui lòng thử lại.";
      toast.error(errorMessage);
    }
  };

  // Handle reset changes
  const handleResetChanges = () => {
    setSelectedAssets(originalSelectedAssets);
    toast("Đã khôi phục về trạng thái ban đầu");
  };

  if (isFetchingProposal) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Đang tải thông tin đề xuất...</span>
        </div>
      </div>
    );
  }

  if (!currentLiquidationProposal) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy đề xuất</h2>
          <p className="text-gray-600 mb-4">Đề xuất thanh lý không tồn tại hoặc bạn không có quyền truy cập.</p>
          <Link href="/liquidation">
            <Button variant="default">Quay lại danh sách</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (currentLiquidationProposal.status !== LiquidationStatus.DRAFT) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không thể chỉnh sửa</h2>
          <p className="text-gray-600 mb-4">
            Chỉ có thể chỉnh sửa đề xuất ở trạng thái nháp (DRAFT). 
            Trạng thái hiện tại: <Badge className={liquidationStatusColors[currentLiquidationProposal.status]}>
              {liquidationStatusLabels[currentLiquidationProposal.status]}
            </Badge>
          </p>
          <Link href={`/liquidation/${liquidationId}`}>
            <Button variant="default">Xem chi tiết</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chỉnh sửa đề xuất thanh lý
            </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/liquidation/${liquidationId}`}>
            <Button variant="outline" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Xem chi tiết
            </Button>
          </Link>

          {hasChanges && (
            <>
              <Button
                variant="outline"
                onClick={handleResetChanges}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Hủy thay đổi
              </Button>
              <Button
                variant="default"
                onClick={handleSaveProposal}
                disabled={isUpdatingProposal}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isUpdatingProposal ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm theo tên tài sản, mã tài sản..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Room Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
          >
            <option value="">Tất cả phòng</option>
            {availableRooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} ({room.code})
              </option>
            ))}
          </select>

          {/* Asset Type Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={assetTypeFilter}
            onChange={(e) => setAssetTypeFilter(e.target.value as AssetType)}
          >
            {Object.entries(assetTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assets Table */}
      <Table<LiquidationProposedInventoryResult>
        columns={columns}
        data={filteredLiquidationProposedInventoryResults.data}
        emptyText="Không tìm thấy tài sản đề xuất thanh lý"
        emptyIcon={<Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
        multiSort={true}
        sortConfigs={currentLiquidationProposedFilter.sorting}
        onSortChange={(sortConfigs) => {
          handlerRender({
            ...currentLiquidationProposedFilter,
            sorting: sortConfigs,
          });
        }}
        rowSelection={{
          selectedRowKeys: selectedAssets,
          onChange: handleAssetSelection,
        }}
        rowKey="id"
        pagination={{
          current:
            filteredLiquidationProposedInventoryResults?.pagination.page || 1,
          pageSize:
            filteredLiquidationProposedInventoryResults?.pagination.limit || 10,
          total:
            filteredLiquidationProposedInventoryResults?.pagination.total || 0,
          onChange: (page, pageSize) => {
            handlerRender({
              ...currentLiquidationProposedFilter,
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

      {/* Save Confirmation Modal */}
      <Modal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="Xác nhận cập nhật đề xuất thanh lý"
        size="lg"
      >
        <ModalBody className="p-6">
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <Save className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Cập nhật đề xuất thanh lý
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Bạn có chắc chắn muốn cập nhật danh sách tài sản trong đề xuất này?
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Thay đổi:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Số tài sản ban đầu:</span>
                <span className="font-medium">{originalSelectedAssets.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Số tài sản sau chỉnh sửa:</span>
                <span className="font-medium">{selectedAssets.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Thay đổi:</span>
                <span className={`font-medium ${selectedAssets.length > originalSelectedAssets.length ? 'text-green-600' : selectedAssets.length < originalSelectedAssets.length ? 'text-red-600' : 'text-gray-600'}`}>
                  {selectedAssets.length > originalSelectedAssets.length ? '+' : ''}{selectedAssets.length - originalSelectedAssets.length}
                </span>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="flex justify-end gap-3 p-6 border-t">
          <Button
            variant="outline"
            onClick={() => setIsSaveModalOpen(false)}
            disabled={isUpdatingProposal}
          >
            Hủy
          </Button>
          <Button
            variant="default"
            onClick={handleConfirmSave}
            disabled={isUpdatingProposal}
            className="flex items-center gap-2"
          >
            {isUpdatingProposal ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang cập nhật...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Cập nhật
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Asset Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedAssetDetail(null);
        }}
        title="Chi tiết tài sản"
        size="2xl"
      >
        {selectedAssetDetail && (
          <ModalBody className="p-6">
            {/* First Row - Inventory Session and Location */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Inventory Information */}
              <div className="p-4 rounded-lg border border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  Thông tin kỳ kiểm kê
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <span className="text-sm text-gray-600">Tên kỳ kiểm kê:</span>
                    <span className="col-span-2 text-sm text-gray-900 font-medium">{selectedAssetDetail.inventorySession.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <span className="text-sm text-gray-600">Năm:</span>
                    <span className="col-span-2 text-sm text-gray-900">{selectedAssetDetail.inventorySession.year}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <span className="text-sm text-gray-600">SL theo sổ sách:</span>
                    <span className="col-span-2 text-sm font-semibold text-gray-900">{selectedAssetDetail.systemQuantity}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <span className="text-sm text-gray-600">SL theo kiểm kê:</span>
                    <span className="col-span-2 text-sm font-semibold text-gray-900">{selectedAssetDetail.countedQuantity}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <span className="text-sm text-gray-600">Trạng thái:</span>
                    <Badge className={`w-fit ${statusColors[selectedAssetDetail.status as InventoryResultStatus]}`}>
                      {statusLabels[selectedAssetDetail.status as InventoryResultStatus]}
                    </Badge>
                  </div>
                  {selectedAssetDetail.scanMethod && (
                    <div className="grid grid-cols-3 gap-4">
                      <span className="text-sm text-gray-600">Phương thức quét:</span>
                      <span className="col-span-2 text-sm text-gray-900">{selectedAssetDetail.scanMethod}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-4">
                    <span className="text-sm text-gray-600">Ngày kiểm kê:</span>
                    <span className="col-span-2 text-sm text-gray-900">
                      {new Date(selectedAssetDetail.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="p-4 rounded-lg border border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  Thông tin vị trí
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <span className="text-sm text-gray-600">Phòng:</span>
                    <span className="col-span-2 text-sm text-gray-900 font-medium">{selectedAssetDetail.room.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <span className="text-sm text-gray-600">Mã vị trí:</span>
                    <span className="col-span-2 text-sm font-semibold text-gray-900">{selectedAssetDetail.room.code}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Note Section (if exists) */}
            {selectedAssetDetail.note && (
              <div className="mb-6 p-4 rounded-lg border border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-2">Ghi chú</h3>
                <p className="text-sm text-gray-900">{selectedAssetDetail.note}</p>
              </div>
            )}

            {/* Second Row - Asset Basic Info and Images */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Asset Info */}
              <div className="p-4 rounded-lg border border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="h-4 w-4 text-gray-600" />
                  Thông tin tài sản
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <span className="text-sm text-gray-600">Mã tài sản:</span>
                    <span className="col-span-2 text-sm font-semibold text-gray-900">{selectedAssetDetail.asset.fixedCode || selectedAssetDetail.asset.ktCode}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <span className="text-sm text-gray-600">Mã kế toán:</span>
                    <span className="col-span-2 text-sm font-semibold text-gray-900">{selectedAssetDetail.asset.ktCode}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <span className="text-sm text-gray-600">Tên tài sản:</span>
                    <span className="col-span-2 text-sm text-gray-900 font-medium">{selectedAssetDetail.asset.name}</span>
                  </div>
                  {selectedAssetDetail.asset.specs && (
                    <div className="grid grid-cols-3 gap-4">
                      <span className="text-sm text-gray-600">Thông số:</span>
                      <span className="col-span-2 text-sm text-gray-900">{selectedAssetDetail.asset.specs}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-4">
                    <span className="text-sm text-gray-600">Loại tài sản:</span>
                    <Badge className="w-fit bg-gray-100 text-gray-800 border-gray-300">
                      {assetTypeLabels[selectedAssetDetail.asset.type as keyof typeof assetTypeLabels]}
                    </Badge>
                  </div>
                  {selectedAssetDetail.asset.entrydate && (
                    <div className="grid grid-cols-3 gap-4">
                      <span className="text-sm text-gray-600">Ngày nhập:</span>
                      <span className="col-span-2 text-sm text-gray-900">
                        {new Date(selectedAssetDetail.asset.entrydate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Images */}
              <div className="p-4 rounded-lg border border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Camera className="h-4 w-4 text-gray-600" />
                  Hình ảnh minh chứng ({selectedAssetDetail.fileUrls?.length || 0})
                </h3>
                {selectedAssetDetail.fileUrls && selectedAssetDetail.fileUrls.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto">
                    {selectedAssetDetail.fileUrls.map((file, index) => (
                      <div key={file.id} className="relative group border rounded-lg overflow-hidden bg-white">
                        <img
                          src={file.url}
                          alt={`Hình ảnh ${index}`}
                          className="w-full h-32 object-contain"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.png';
                            e.currentTarget.alt = 'Không thể tải hình ảnh';
                          }}
                        />
                        <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                          <button
                            onClick={() => window.open(file.url, '_blank')}
                            className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-3 py-1 rounded-md text-xs font-medium transition-opacity shadow-lg"
                          >
                            Xem lớn
                          </button>
                        </div>
                        <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white px-1.5 py-0.5 rounded text-xs">
                          {new Date(file.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 border-2 border-dashed border-orange-300 rounded-lg bg-white">
                    <Camera className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                    <p className="text-xs">Không có hình ảnh minh chứng</p>
                  </div>
                )}
              </div>
            </div>
          </ModalBody>
        )}
      </Modal>
    </div>
  );
}
