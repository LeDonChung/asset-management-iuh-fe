"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableColumn } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Package, FileText, Eye, Calendar, MapPin, User, Camera, Info } from "lucide-react";
import {
  LiquidationProposedInventoryResult,
  AssetType,
  InventoryResultStatus,
  LiquidationProposedFilterRequest,
  CreateLiquidationProposalDto,
  CreateLiquidationItemDto,
  LiquidationStatus,
} from "@/types/asset";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { RootState } from "@/lib/store";
import {
  filterLiquidationProposedInventoryResults,
  createLiquidationProposal,
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

export default function LiquidationCreatePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    filteredLiquidationProposedInventoryResults,
    currentLiquidationProposedFilter,
    isCreatingProposal,
    createProposalError,
  } = useAppSelector((state: RootState) => state.liquidation);

  const [searchTerm, setSearchTerm] = useState("");
  const [roomFilter, setRoomFilter] = useState<string>("");
  const [assetTypeFilter, setAssetTypeFilter] = useState<AssetType>(AssetType.FIXED_ASSET);
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType>(AssetType.FIXED_ASSET);
  const { user, hasAnyPermission } = useAuth();
  const canCreate = hasAnyPermission([
    PermissionConstants.PERM_CREATE_LIQUIDATION,
  ]);
  
  const canPropose = hasAnyPermission([
    PermissionConstants.PERM_PROPOSED_LIQUIDATION,
  ]);

  useEffect(() => {
      if (!canCreate && !canPropose) {
          router.push("/unauthorized");
      }
  }, [canCreate, canPropose, router]);
  useEffect(() => {
    const loadData = () => {
      try {
        // Lọc theo đơn vị của user hiện tại và chỉ hiển thị tài sản đề xuất thanh lý
        const initialFilter: LiquidationProposedFilterRequest = {
          ...currentLiquidationProposedFilter,
          assetType: assetTypeFilter,
          // Nếu user có unitId, lọc theo unit của user
          //   roomId: user?.unitId || undefined,
        };

        dispatch(filterLiquidationProposedInventoryResults(initialFilter));
      } catch (e: any) {
        toast.error(e.message || "Có lỗi xảy ra.");
      }
    };
    loadData();
  }, []);

  // State for selected assets
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  
  // State for detail modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<LiquidationProposedInventoryResult | null>(null);
  
  // State for confirmation modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<LiquidationStatus>(LiquidationStatus.DRAFT);

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
    console.log("Filter being sent:", filter);
    console.log("Sorting configs:", filter.sorting);
    dispatch(filterLiquidationProposedInventoryResults(filter));
  };

  useEffect(() => {
    handlerRender({
      ...currentLiquidationProposedFilter,
      search: searchTerm || undefined,
      roomId: roomFilter || undefined,
      assetType: assetTypeFilter,
    });
    
    // Cập nhật selectedAssetType khi assetTypeFilter thay đổi
    setSelectedAssetType(assetTypeFilter);
  }, [searchTerm, roomFilter, assetTypeFilter]);

  // Show error toast if create proposal fails
  useEffect(() => {
    if (createProposalError) {
      toast.error(createProposalError);
    }
  }, [createProposalError]);

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

  // Handle create liquidation proposal - open confirmation modal
  const handleCreateProposal = () => {
    if (selectedAssets.length === 0) {
      toast.error("Vui lòng chọn ít nhất một tài sản để tạo đề xuất thanh lý");
      return;
    }

    if (!user?.unitId) {
      toast.error("Không thể xác định đơn vị của bạn. Vui lòng đăng nhập lại.");
      return;
    }

    setIsConfirmModalOpen(true);
  };

  // Handle confirm create with selected status
  const handleConfirmCreate = async (status: LiquidationStatus) => {
    try {
      // Tạo danh sách items từ các tài sản đã chọn
      const selectedItems = filteredLiquidationProposedInventoryResults.data.filter(
        (item) => selectedAssets.includes(item.id)
      );

      const createDto: CreateLiquidationProposalDto = {
        unitId: user!.unitId!,
        status: status,
        items: selectedItems.map((item): CreateLiquidationItemDto => ({
          assetId: item.asset.id,
          systemQuantity: item.systemQuantity,
          countedQuantity: item.countedQuantity,
          note: item.note || `Đề xuất thanh lý từ kết quả kiểm kê - ${item.inventorySession.name}`,
          // Lấy hình ảnh đầu tiên nếu có
          imageUrl: item.fileUrls && item.fileUrls.length > 0 ? item.fileUrls[0].url : undefined,
        })),
        assetType: selectedAssetType as AssetType,
      };

      // Gọi API tạo đề xuất thanh lý
      const result = await dispatch(createLiquidationProposal(createDto)).unwrap();
      
      const statusMessage = status === LiquidationStatus.PROPOSED 
        ? "và đã gửi đề xuất" 
        : "dưới dạng nháp";
      
      toast.success(
        `Đã tạo đề xuất thanh lý cho ${selectedAssets.length} tài sản ${statusMessage}!`
      );
      
      setIsConfirmModalOpen(false);
      
      // Chuyển hướng về trang danh sách đề xuất
      router.push("/liquidation");
      
    } catch (error: any) {
      console.error("Error creating liquidation proposal:", error);
      toast.error(
        error?.message || "Có lỗi xảy ra khi tạo đề xuất thanh lý. Vui lòng thử lại."
      );
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tạo đề xuất thanh lý
          </h1>
          <p className="text-gray-600">
            Danh sách tài sản được đề xuất thanh lý từ kết quả kiểm kê
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/liquidation">
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Danh sách đề xuất
            </Button>
          </Link>

          {selectedAssets.length > 0 && (
            <Button
              variant="default"
              onClick={handleCreateProposal}
              disabled={isCreatingProposal}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {isCreatingProposal ? "Đang tạo đề xuất..." : "Tạo đề xuất thanh lý"}
            </Button>
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
            onChange={(e) => {
              const value = e.target.value as AssetType;
              setAssetTypeFilter(value);
              setSelectedAssetType(value);
            }}
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

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Xác nhận tạo đề xuất thanh lý"
        size="lg"
      >
        <ModalBody className="p-6">
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tạo đề xuất thanh lý cho {selectedAssets.length} tài sản
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Bạn muốn tạo đề xuất ở trạng thái nào?
            </p>
          </div>

          <div className="space-y-3">
            <div 
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedStatus === LiquidationStatus.DRAFT
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedStatus(LiquidationStatus.DRAFT)}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value={LiquidationStatus.DRAFT}
                  checked={selectedStatus === LiquidationStatus.DRAFT}
                  onChange={() => setSelectedStatus(LiquidationStatus.DRAFT)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">
                    Lưu nháp
                  </div>
                  <div className="text-sm text-gray-500">
                    Đề xuất sẽ được lưu dưới dạng nháp, có thể chỉnh sửa sau
                  </div>
                </div>
              </div>
            </div>

            <div 
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedStatus === LiquidationStatus.PROPOSED
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedStatus(LiquidationStatus.PROPOSED)}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value={LiquidationStatus.PROPOSED}
                  checked={selectedStatus === LiquidationStatus.PROPOSED}
                  onChange={() => setSelectedStatus(LiquidationStatus.PROPOSED)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">
                    Gửi đề xuất ngay
                  </div>
                  <div className="text-sm text-gray-500">
                    Đề xuất sẽ được gửi đi để xem xét và phê duyệt
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="flex justify-end gap-3 p-6 border-t">
          <Button
            variant="outline"
            onClick={() => setIsConfirmModalOpen(false)}
            disabled={isCreatingProposal}
          >
            Hủy
          </Button>
          <Button
            variant="default"
            onClick={() => handleConfirmCreate(selectedStatus)}
            disabled={isCreatingProposal}
            className="flex items-center gap-2"
          >
            {isCreatingProposal ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang tạo...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                {selectedStatus === LiquidationStatus.PROPOSED ? "Gửi đề xuất" : "Lưu nháp"}
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
