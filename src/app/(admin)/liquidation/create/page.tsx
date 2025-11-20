"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableColumn } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Package, FileText, Eye, Calendar, MapPin, User, Camera, Info, ArrowLeft, Trash2, ChevronDown, Check, RefreshCw } from "lucide-react";
import {
  LiquidationProposedInventoryResult,
  AssetType,
  InventoryResultStatus,
  LiquidationProposedFilterRequest,
  CreateLiquidationProposalDto,
  CreateLiquidationItemDto,
  LiquidationStatus,
  AssetBookItemStatus,
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

const statusConfig: Partial<Record<AssetBookItemStatus, { label: string; className: string }>> = {
  [AssetBookItemStatus.IN_USE]: {
    label: "Đang sử dụng",
    className: "bg-green-100 text-green-800 border border-green-200",
  },
  [AssetBookItemStatus.TRANSFERRED]: {
    label: "Đã bàn giao",
    className: "bg-blue-100 text-blue-800 border border-blue-200",
  },
  [AssetBookItemStatus.LIQUIDATED]: {
    label: "Đã thanh lý",
    className: "bg-gray-100 text-gray-800 border border-gray-300",
  },
  [AssetBookItemStatus.MISSING]: {
    label: "Thất lạc",
    className: "bg-red-100 text-red-800 border border-red-200",
  },
  [AssetBookItemStatus.DAMAGED]: {
    label: "Hư hỏng",
    className: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  },
  [AssetBookItemStatus.PROPOSED_LIQUIDATION]: {
    label: "Đề xuất thanh lý",
    className: "bg-orange-100 text-orange-800 border border-orange-200",
  },
};

const liquidationStatusLabels = {
  [LiquidationStatus.DRAFT]: "Nháp",
  [LiquidationStatus.PROPOSED]: "Đề xuất",
  [LiquidationStatus.APPROVED]: "Đã duyệt",
  [LiquidationStatus.REJECTED]: "Từ chối",
  [LiquidationStatus.FINALIZED]: "Hoàn thành",
};

const liquidationStatusColors = {
  [LiquidationStatus.DRAFT]: "bg-gray-100 text-gray-800 border border-gray-300",
  [LiquidationStatus.PROPOSED]: "bg-orange-100 text-orange-800 border border-orange-300",
  [LiquidationStatus.APPROVED]: "bg-green-100 text-green-800 border border-green-300",
  [LiquidationStatus.REJECTED]: "bg-red-100 text-red-800 border border-red-300",
  [LiquidationStatus.FINALIZED]: "bg-blue-100 text-blue-800 border border-blue-300",
};

const getLiquidationStatusBadge = (status: LiquidationStatus) => {
  const config = liquidationStatusColors[status] || liquidationStatusColors[LiquidationStatus.DRAFT];
  const label = liquidationStatusLabels[status] || status;
  
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config}`}
    >
      {label}
    </span>
  );
};

const getAssetStatusBadge = (status: AssetBookItemStatus) => {
  const config = statusConfig[status];
  if (!config) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
        {status || 'N/A'}
      </span>
    );
  }
  
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
};

// CardSelect Component
interface CardSelectProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  required?: boolean;
}

const CardSelect: React.FC<CardSelectProps> = ({
  label,
  icon,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  loading = false,
  className = "",
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selectedOption = options.find((opt) => opt.value === value);

  // Update dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isOpen && !target.closest(".card-select-container")) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative group card-select-container ${className}`}>
      <label className={`block font-medium text-gray-700 mb-2 ${className.includes('text-lg') ? 'text-base' : className.includes('text-base') ? 'text-sm' : 'text-xs'}`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full ${className.includes('text-lg') ? 'min-h-[3.5rem] text-lg' : className.includes('text-base') ? 'min-h-[2.75rem] text-base' : 'min-h-[2.5rem] text-sm'} pl-3 pr-10 border border-gray-200 rounded-lg 
            bg-white text-left transition-all duration-200
            hover:border-gray-300 hover:shadow-sm
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${isOpen ? "ring-2 ring-red-500 border-red-500" : ""}
            ${loading ? "cursor-wait" : "cursor-pointer"}
            relative
          `}
        >
          <div className="flex items-center justify-between h-full py-2.5">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {icon && (
                <div className="flex-shrink-0">{icon}</div>
              )}
              <span
                className={`flex-1 truncate ${
                  selectedOption ? "text-gray-900" : "text-gray-500"
                }`}
                title={selectedOption ? selectedOption.label : placeholder}
              >
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-2 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {loading && (
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-10">
            <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
          </div>
        )}

        {isOpen && (
          <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors
                  flex items-start justify-between min-h-[3rem]
                  ${
                    option.value === value
                      ? "bg-red-50 text-red-900"
                      : "text-gray-900"
                  }
                `}
              >
                <span className="flex-1 leading-relaxed break-words">
                  {option.label}
                </span>
                {option.value === value && (
                  <Check className="h-4 w-4 text-red-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
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
  const [selectedStatus, setSelectedStatus] = useState<LiquidationStatus>(LiquidationStatus.DRAFT);
  const [transactionNote, setTransactionNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, hasAnyPermission } = useAuth();
  const canCreate = hasAnyPermission([
    PermissionConstants.PERM_CREATE_LIQUIDATION,
  ]);
  
  const canPropose = hasAnyPermission([
    PermissionConstants.PERM_PROPOSED_LIQUIDATION,
  ]);

  // State for assets from store instead of API
  const [assetsFromStore, setAssetsFromStore] = useState<any[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<any[]>([]);
  const hasLoadedRef = useRef(false); // Để tránh load nhiều lần

  // State for filter context loaded from draft
  const [filterContext, setFilterContext] = useState<any>(null);

  useEffect(() => {
      if (!canCreate && !canPropose) {
          router.push("/unauthorized");
      }
  }, [canCreate, canPropose, router]);

  // Load selected assets from sessionStorage when page loads
  useEffect(() => {
    // Chỉ load một lần duy nhất
    if (hasLoadedRef.current) {
      return;
    }
    
    console.log("Loading assets from sessionStorage...");
    
    try {
      // Try to load a draft object first (allows restoring form fields + ids)
      const draftRaw = sessionStorage.getItem('liquidationDraft');
      if (draftRaw && draftRaw !== 'null' && draftRaw !== 'undefined') {
        const draft = JSON.parse(draftRaw);
        // draft shape: { selectedIds: string[], status?: LiquidationStatus, note?: string, assetType?: AssetType, assets?: any[] }
        if (draft.selectedIds && Array.isArray(draft.selectedIds) && draft.selectedIds.length > 0) {
          setSelectedAssets(draft.selectedIds);
        }
        if (draft.status) {
          setSelectedStatus(draft.status);
        }
        if (draft.note) {
          setTransactionNote(draft.note);
        }
        if (draft.assetType) {
          setSelectedAssetType(draft.assetType);
        }

        // If the draft contains full asset objects (written by asset-book), use them
        if (draft.assets && Array.isArray(draft.assets) && draft.assets.length > 0) {
          setAssetsFromStore(draft.assets);
          setFilteredAssets(draft.assets);
          console.log('Loaded assets from draft in sessionStorage:', draft.assets);
          hasLoadedRef.current = true;
          
          // Thông báo đã khôi phục dữ liệu
          toast.success(`Đã khôi phục ${draft.assets.length} tài sản từ phiên trước`);
        }

        // Load filter context if available
        if (draft.filterContext) {
          setFilterContext(draft.filterContext);
          console.log('Loaded filter context from draft:', draft.filterContext);
        }
      }

      // Backwards compatibility: old key used by asset-book to save full objects
      const storedAssets = sessionStorage.getItem('selectedAssetsForLiquidation');
      console.log("Raw stored data:", storedAssets);
      if (storedAssets && storedAssets !== 'null' && storedAssets !== 'undefined') {
        const assets = JSON.parse(storedAssets);
        console.log("Parsed assets:", assets);

        if (Array.isArray(assets) && assets.length > 0) {
          // If assetsFromStore already set by draft, merge unique
          if (assetsFromStore.length === 0) {
            setAssetsFromStore(assets);
            setFilteredAssets(assets); // Initially show all assets
          } else {
            // merge by id
            const existingIds = new Set(assetsFromStore.map(a => a.id));
            const merged = [...assetsFromStore, ...assets.filter(a => !existingIds.has(a.id))];
            setAssetsFromStore(merged);
            setFilteredAssets(merged);
          }

          console.log('Loaded selected assets from sessionStorage (legacy key):', assets);
          hasLoadedRef.current = true; // Đánh dấu đã load
          // Do NOT remove the sessionStorage entry here — keep draft persisted across reloads
        } else {
          console.log("Assets array is empty or invalid");
          if (!hasLoadedRef.current) {
            hasLoadedRef.current = true;
            toast.error('Danh sách tài sản trống. Vui lòng chọn tài sản từ sổ tài sản.');
            setTimeout(() => router.push('/asset/asset-book'), 1500);
          }
        }
      } else {
        console.log("No stored assets found (legacy key)");
        // If there was no draft and no legacy stored assets, show an error and redirect
        if (!hasLoadedRef.current) {
          hasLoadedRef.current = true;
          toast.error('Không có tài sản được chọn. Vui lòng chọn tài sản từ sổ tài sản.');
          setTimeout(() => router.push('/asset/asset-book'), 1500);
        }
      }
    } catch (error) {
      console.error('Error loading selected assets from sessionStorage:', error);
      if (!hasLoadedRef.current) {
        hasLoadedRef.current = true;
        toast.error('Có lỗi khi tải danh sách tài sản được chọn.');
        setTimeout(() => router.push('/asset/asset-book'), 1500);
      }
    }
  }, [router]);

  // State for selected assets
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  
  // Persist a small draft object to sessionStorage so page reload can restore selection and form fields
  useEffect(() => {
    try {
      const draft = {
        selectedIds: selectedAssets,
        status: selectedStatus,
        note: transactionNote,
        assetType: selectedAssetType,
        // include full asset objects only if available
        assets: assetsFromStore && assetsFromStore.length > 0 ? assetsFromStore : undefined,
        // keep filter context if available
        filterContext: filterContext || undefined,
        timestamp: new Date().toISOString(),
      } as any;

      sessionStorage.setItem('liquidationDraft', JSON.stringify(draft));
      // Also keep legacy key for compatibility with asset-book flow
      if (assetsFromStore && assetsFromStore.length > 0) {
        sessionStorage.setItem('selectedAssetsForLiquidation', JSON.stringify(assetsFromStore));
      }
    } catch (e) {
      console.error('Error saving liquidation draft to sessionStorage:', e);
    }
  }, [selectedAssets, selectedStatus, transactionNote, selectedAssetType, assetsFromStore, filterContext]);
  
  // State for detail modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<any | null>(null);

  // Auto-select all assets when they are loaded
  useEffect(() => {
    if (assetsFromStore.length > 0) {
      const assetIds = assetsFromStore.map(asset => asset.id);
      setSelectedAssets(assetIds);
    }
  }, [assetsFromStore]);

  // Filter assets based on search and filters
  useEffect(() => {
    let filtered = [...assetsFromStore];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(asset => 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.fixedCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.ktCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply room filter
    if (roomFilter) {
      filtered = filtered.filter(asset => 
        asset.currentRoom?.id === roomFilter
      );
    }

    // Apply asset type filter (if assets have type property)
    if (assetTypeFilter && assetsFromStore.length > 0 && assetsFromStore[0].type) {
      filtered = filtered.filter(asset => asset.type === assetTypeFilter);
    }

    setFilteredAssets(filtered);
  }, [searchTerm, roomFilter, assetTypeFilter, assetsFromStore]);

  // Table columns configuration
  const columns: TableColumn<any>[] = [
    {
      key: "stt",
      title: "STT",
      width: "60px",
      render: (_, record, index) => (
        <div className="text-sm text-center text-gray-900 font-medium">
          {index + 1}
        </div>
      ),
      className: "text-center",
    },
    {
      key: "fixedCode",
      title: "Mã tài sản",
      width: "120px",
      render: (_, record) => (
        <div className="text-sm">
          <div className="text-xs text-gray-500">{record.fixedCode}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "ktCode",
      title: "Mã kế toán",
      width: "120px",
      render: (_, record) => (
        <div className="text-sm">
          <div className="text-xs text-gray-500">{record.ktCode}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "name",
      title: "Tên tài sản",
      width: "200px",
      render: (_, record) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 line-clamp-2">
            {record.name}
          </div>
          {record.specs && (
            <div className="text-xs text-gray-500 mt-1 line-clamp-1">
              {record.specs}
            </div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      key: "roomCode",
      title: "Mã vị trí",
      width: "120px",
      render: (_, record) => (
        <div className="text-sm">
          <div className="text-xs text-gray-500">{record.currentRoom?.roomCode || 'N/A'}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "quantity",
      title: "Số lượng",
      width: "80px",
      render: (_, record) => (
        <div className="text-sm text-center text-gray-900 font-medium">
          {record.quantity || 1}
        </div>
      ),
      className: "text-center",
      sortable: true,
    },
    {
      key: "status",
      title: "Trạng thái",
      width: "150px",
      render: (_, record) => (
        <div className="flex justify-center">
          {getAssetStatusBadge(record.bookItemStatus)}
        </div>
      ),
      className: "text-center",
    },
    {
      key: "actions",
      title: "Thao tác",
      width: "100px",
      render: (_, record) => (
        <div className="flex justify-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              setSelectedAssetDetail(record);
              setIsDetailModalOpen(true);
            }}
            className="h-8 px-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: "text-center",
    },
  ];

  // Show error toast if create proposal fails
  useEffect(() => {
    if (createProposalError) {
      toast.error(createProposalError);
    }
  }, [createProposalError]);

  // Get unique rooms from filtered assets for filter
  const availableRooms = useMemo(() => {
    const rooms = filteredAssets
      .map((asset) => asset.currentRoom)
      .filter(room => room != null)
      .filter(
        (room, index, self) => index === self.findIndex((r) => r.id === room.id)
      );
    return rooms;
  }, [filteredAssets]);

  // Handle asset selection
  const handleAssetSelection = (
    selectedRowKeys: string[],
    selectedRows: any[]
  ) => {
    setSelectedAssets(selectedRowKeys);
  };

  // Handle create liquidation proposal - submit directly
  const handleCreateProposal = async () => {
    if (selectedAssets.length === 0) {
      toast.error("Vui lòng chọn ít nhất một tài sản để tạo đề xuất thanh lý");
      return;
    }

    if (!user?.unitId) {
      toast.error("Không thể xác định đơn vị của bạn. Vui lòng đăng nhập lại.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Tạo danh sách items từ các tài sản đã chọn từ store
      const selectedItems = assetsFromStore.filter(
        (asset) => selectedAssets.includes(asset.id)
      );

      const createDto: CreateLiquidationProposalDto = {
        unitId: user!.unitId!,
        status: selectedStatus,
        items: selectedItems.map((asset): CreateLiquidationItemDto => ({
          assetId: asset.id,
          systemQuantity: asset.quantity || 1,
          countedQuantity: asset.quantity || 1,
          note: transactionNote || `Đề xuất thanh lý từ sổ tài sản - ${asset.name}`,
          imageUrl: undefined,
        })),
        assetType: selectedAssetType as AssetType,
      };

      // Gọi API tạo đề xuất thanh lý
      const result = await dispatch(createLiquidationProposal(createDto)).unwrap();
      
      const statusMessage = selectedStatus === LiquidationStatus.PROPOSED 
        ? "và đã gửi đề xuất" 
        : "dưới dạng nháp";
      
      toast.success(
        `Đã tạo đề xuất thanh lý cho ${selectedAssets.length} tài sản ${statusMessage}!`
      );
      
      // Clear draft từ sessionStorage sau khi tạo thành công
      try {
        sessionStorage.removeItem('liquidationDraft');
        sessionStorage.removeItem('selectedAssetsForLiquidation');
        console.log('Cleared liquidation draft from sessionStorage');
      } catch (e) {
        console.error('Error clearing draft from sessionStorage:', e);
      }
      
      // Chuyển hướng về trang danh sách đề xuất
      router.push("/liquidation");
      
    } catch (error: any) {
      console.error("Error creating liquidation proposal:", error);
      toast.error(
        error?.message || "Có lỗi xảy ra khi tạo đề xuất thanh lý. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/asset/asset-book">
                <Button
                  variant="ghost" 
                  size="sm"
                  className="p-2 hover:bg-gray-100"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Tạo đề xuất thanh lý
                </h1>
                <p className="text-gray-600">
                  Hoàn tất thông tin để tạo đề xuất thanh lý cho {assetsFromStore.length} tài sản đã chọn
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => router.push("/asset/asset-book")}
                variant="outline"
                disabled={isSubmitting || isCreatingProposal}
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={handleCreateProposal}
                disabled={isSubmitting || isCreatingProposal || selectedAssets.length === 0}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isCreatingProposal || isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    {selectedStatus === LiquidationStatus.PROPOSED ? "Gửi đề xuất thanh lý" : "Lưu nháp yêu cầu thanh lý"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      {/* Status Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-300 mb-6">
        <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-gray-100 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Chọn trạng thái đề xuất
            </h3>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardSelect
              label="Trạng thái yêu cầu"
              icon={<></>}
              value={selectedStatus}
              onChange={(value) => setSelectedStatus(value as LiquidationStatus)}
              options={[
                { value: LiquidationStatus.DRAFT, label: "Nháp" },
                { value: LiquidationStatus.PROPOSED, label: "Đề xuất" },
              ]}
              placeholder="Chọn trạng thái yêu cầu"
              disabled={isCreatingProposal || isSubmitting}
              required
              className="text-base"
            />
          </div>
        </div>
      </div>


      {/* Assets Table */}
      <Table<any>
        title="Tài sản đã chọn để thanh lý"
        columns={columns}
        data={filteredAssets}
        loading={false}
        emptyText="Không có tài sản nào được chọn"
        emptyIcon={<Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
        rowSelection={{
          selectedRowKeys: selectedAssets,
          onChange: handleAssetSelection,
        }}
        rowKey="id"
        pagination={false}
      />

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
            {/* Asset Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="p-4 rounded-lg border border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="h-4 w-4 text-gray-600" />
                  Thông tin tài sản
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <span className="text-sm text-gray-600">Mã tài sản:</span>
                    <span className="col-span-2 text-sm font-semibold text-gray-900">{selectedAssetDetail.fixedCode}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <span className="text-sm text-gray-600">Mã kế toán:</span>
                    <span className="col-span-2 text-sm font-semibold text-gray-900">{selectedAssetDetail.ktCode}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <span className="text-sm text-gray-600">Tên tài sản:</span>
                    <span className="col-span-2 text-sm text-gray-900 font-medium">{selectedAssetDetail.name}</span>
                  </div>
                  {selectedAssetDetail.specs && (
                    <div className="grid grid-cols-3 gap-4">
                      <span className="text-sm text-gray-600">Thông số:</span>
                      <span className="col-span-2 text-sm text-gray-900">{selectedAssetDetail.specs}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-4">
                    <span className="text-sm text-gray-600">Số lượng:</span>
                    <span className="col-span-2 text-sm font-semibold text-gray-900">{selectedAssetDetail.quantity || 1}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <span className="text-sm text-gray-600">Trạng thái:</span>
                    <span className="col-span-2">
                      {getAssetStatusBadge(selectedAssetDetail.bookItemStatus)}
                    </span>
                  </div>
                  {selectedAssetDetail.entrydate && (
                    <div className="grid grid-cols-3 gap-4">
                      <span className="text-sm text-gray-600">Ngày nhập:</span>
                      <span className="col-span-2 text-sm text-gray-900">
                        {new Date(selectedAssetDetail.entrydate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Information */}
              <div className="p-4 rounded-lg border border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  Thông tin vị trí
                </h3>
                <div className="space-y-3">
                  {selectedAssetDetail.currentRoom && (
                    <>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-sm text-gray-600">Phòng:</span>
                        <span className="col-span-2 text-sm text-gray-900 font-medium">{selectedAssetDetail.currentRoom.name}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="text-sm text-gray-600">Mã vị trí:</span>
                        <span className="col-span-2 text-sm font-semibold text-gray-900">{selectedAssetDetail.currentRoom.roomCode}</span>
                      </div>
                    </>
                  )}
                  {!selectedAssetDetail.currentRoom && (
                    <div className="text-sm text-gray-500">Chưa có thông tin vị trí</div>
                  )}
                </div>
              </div>
            </div>
          </ModalBody>
        )}
      </Modal>
      </div>
    </div>
  );
}
