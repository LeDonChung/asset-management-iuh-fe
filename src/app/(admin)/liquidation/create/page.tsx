"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableColumn } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Package, FileText, Eye, Calendar, MapPin, User, Camera, Info, ArrowLeft, Trash2, ChevronDown, Check, RefreshCw, ChevronRight, Save } from "lucide-react";
import {
  LiquidationProposedInventoryResult,
  AssetType,
  InventoryResultStatus,
  LiquidationProposedFilterRequest,
  CreateLiquidationProposalDto,
  CreateLiquidationItemDto,
  LiquidationStatus,
  AssetBookItemStatus,
  Asset,
  AccessScopeType,
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
import AssetBookSelectionModal from "@/components/asset/AssetBookSelectionModal";

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
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${isOpen ? "ring-2 ring-blue-500 border-blue-500" : ""}
            ${loading ? "cursor-wait" : "cursor-pointer"}
            relative
          `}
        >
          <div className="flex items-center justify-between h-full py-2.5">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {icon && (
                <div
                  className={`transition-colors flex-shrink-0 ${
                    isOpen ? "text-blue-500" : "text-gray-400"
                  }`}
                >
                  {icon}
                </div>
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
                      ? "bg-blue-50 text-blue-900"
                      : "text-gray-900"
                  }
                `}
              >
                <span className="flex-1 leading-relaxed break-words">
                  {option.label}
                </span>
                {option.value === value && (
                  <Check className="h-4 w-4 text-blue-600" />
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
  
  const [systemQuantities, setSystemQuantities] = useState<Record<string, number>>({});
  const [countedQuantities, setCountedQuantities] = useState<Record<string, number>>({});
  
  const { user, hasAnyPermission } = useAuth();

  const getAssetKey = (asset: Asset): string => {
    return asset.bookItemId || asset.id;
  };
  const canCreate = hasAnyPermission([
    PermissionConstants.PERM_CREATE_LIQUIDATION,
  ]);
  
  const canPropose = hasAnyPermission([
    PermissionConstants.PERM_PROPOSED_LIQUIDATION,
  ]);

  const accessScopeTypes = user?.accessScopeTypes || [];
  const hasGlobalAccess = accessScopeTypes.includes(AccessScopeType.GLOBAL);
  const hasChildUnitsAccess = accessScopeTypes.includes(AccessScopeType.CHILD_UNITS);

  const [assetsFromStore, setAssetsFromStore] = useState<any[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<any[]>([]);
  const hasLoadedRef = useRef(false); // Để tránh load nhiều lần

  const [filterContext, setFilterContext] = useState<any>(null);

  useEffect(() => {
      if (!canCreate && !canPropose) {
          router.push("/unauthorized");
      }
  }, [canCreate, canPropose, router]);

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }
    
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
          // Auto-detect asset type from first asset if available
          if (draft.assets[0]?.type) {
            setAssetTypeFilter(draft.assets[0].type);
            setSelectedAssetType(draft.assets[0].type);
          }
          
          setAssetsFromStore(draft.assets);
          setFilteredAssets(draft.assets);
          
          // Initialize quantities from draft if available
          if (draft.systemQuantities) {
            setSystemQuantities(draft.systemQuantities);
          } else {
            // Initialize from asset quantities
            const initialSystemQuantities: Record<string, number> = {};
            draft.assets.forEach((asset: Asset) => {
              const assetKey = asset.bookItemId || asset.id;
              initialSystemQuantities[assetKey] = asset.quantity || 1;
            });
            setSystemQuantities(initialSystemQuantities);
          }
          
          if (draft.countedQuantities) {
            setCountedQuantities(draft.countedQuantities);
          } else {
            // Initialize from asset quantities
            const initialCountedQuantities: Record<string, number> = {};
            draft.assets.forEach((asset: Asset) => {
              const assetKey = asset.bookItemId || asset.id;
              initialCountedQuantities[assetKey] = asset.quantity || 1;
            });
            setCountedQuantities(initialCountedQuantities);
          }
          
          // Thông báo đã khôi phục dữ liệu
          toast.success(`Đã khôi phục ${draft.assets.length} tài sản từ phiên trước`);
          
          // Load filter context if available
          if (draft.filterContext) {
            setFilterContext(draft.filterContext);
          }
          
          hasLoadedRef.current = true;
          return; // Exit early if we loaded from draft
        }

        // Load filter context if available
        if (draft.filterContext) {
          setFilterContext(draft.filterContext);
        }
      }

      // Backwards compatibility: old key used by asset-book to save full objects
      // Only check if we haven't loaded from draft yet
      if (hasLoadedRef.current) {
        return;
      }
      
      const storedAssets = sessionStorage.getItem('selectedAssetsForLiquidation');
      if (storedAssets && storedAssets !== 'null' && storedAssets !== 'undefined') {
        const assets = JSON.parse(storedAssets);

        if (Array.isArray(assets) && assets.length > 0) {
          // If assetsFromStore already set by draft, merge unique
          if (assetsFromStore.length === 0) {
            // Auto-detect asset type from first asset if available
            if (assets[0]?.type) {
              setAssetTypeFilter(assets[0].type);
              setSelectedAssetType(assets[0].type);
            }
            
            setAssetsFromStore(assets);
            setFilteredAssets(assets); // Initially show all assets
            
            // Initialize quantities
            const initialSystemQuantities: Record<string, number> = {};
            const initialCountedQuantities: Record<string, number> = {};
            assets.forEach((asset: Asset) => {
              const assetKey = asset.bookItemId || asset.id;
              initialSystemQuantities[assetKey] = asset.quantity || 1;
              initialCountedQuantities[assetKey] = asset.quantity || 1;
            });
            setSystemQuantities(initialSystemQuantities);
            setCountedQuantities(initialCountedQuantities);
          } else {
            // merge by id
            const existingIds = new Set(assetsFromStore.map(a => a.id));
            const newAssets = assets.filter(a => !existingIds.has(a.id));
            const merged = [...assetsFromStore, ...newAssets];
            setAssetsFromStore(merged);
            setFilteredAssets(merged);
            
            // Initialize quantities for new assets
            const newSystemQuantities: Record<string, number> = {};
            const newCountedQuantities: Record<string, number> = {};
            newAssets.forEach((asset: Asset) => {
              const assetKey = asset.bookItemId || asset.id;
              newSystemQuantities[assetKey] = asset.quantity || 1;
              newCountedQuantities[assetKey] = asset.quantity || 1;
            });
            setSystemQuantities(prev => ({ ...prev, ...newSystemQuantities }));
            setCountedQuantities(prev => ({ ...prev, ...newCountedQuantities }));
          }

          hasLoadedRef.current = true; // Đánh dấu đã load
          // Do NOT remove the sessionStorage entry here — keep draft persisted across reloads
        } else {
          if (!hasLoadedRef.current) {
            hasLoadedRef.current = true;
            toast.error('Danh sách tài sản trống. Vui lòng chọn tài sản từ sổ tài sản.');
            setTimeout(() => router.push('/asset/asset-book'), 1500);
          }
        }
      } else {
        // If there was no draft and no legacy stored assets, show an error and redirect
        if (!hasLoadedRef.current) {
          hasLoadedRef.current = true;
          toast.error('Không có tài sản được chọn. Vui lòng chọn tài sản từ sổ tài sản.');
          setTimeout(() => router.push('/asset/asset-book'), 1500);
        }
      }
    } catch (error) {
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
        // keep quantities
        systemQuantities: systemQuantities,
        countedQuantities: countedQuantities,
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
      // Silent fail for sessionStorage operations
    }
  }, [selectedAssets, selectedStatus, transactionNote, selectedAssetType, assetsFromStore, filterContext, systemQuantities, countedQuantities]);
  
  // State for detail modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<any | null>(null);
  
  // State for add asset modal
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);

  // Sync selectedAssets with assetsFromStore (all assets are selected since no checkbox)
  useEffect(() => {
    const assetIds = assetsFromStore.map(asset => asset.id);
    setSelectedAssets(assetIds);
  }, [assetsFromStore]);

  // Filter assets based on search and filters
  useEffect(() => {
    let filtered = [...assetsFromStore];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(asset => 
        asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.fixedCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.ktCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply room filter
    if (roomFilter) {
      filtered = filtered.filter(asset => 
        asset.currentRoom?.id === roomFilter
      );
    }

    // Apply asset type filter (if assets have type property)
    // Only filter if assetTypeFilter is set AND assets have type property
    if (assetTypeFilter && assetsFromStore.length > 0) {
      // Check if any asset has type property before filtering
      const hasTypeProperty = assetsFromStore.some(asset => asset.type);
      if (hasTypeProperty) {
        filtered = filtered.filter(asset => asset.type === assetTypeFilter);
      }
    }

    setFilteredAssets(filtered);
  }, [searchTerm, roomFilter, assetTypeFilter, assetsFromStore]);

  // Table columns configuration
  const columns: TableColumn<any>[] = [
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
      key: "currentQuantity",
      title: "Số lượng hiện có",
      width: "120px",
      render: (_, record) => {
        const assetKey = getAssetKey(record);
        const systemQty = systemQuantities[assetKey] ?? (record.quantity || 1);
        return (
          <div className="text-sm text-center">
            <div className="text-gray-900 font-medium">{systemQty}</div>
            {record.unit && (
              <div className="text-xs text-gray-500 mt-0.5">{record.unit}</div>
            )}
          </div>
        );
      },
      className: "text-center",
      sortable: false,
    },
    {
      key: "liquidationQuantity",
      title: "Số lượng thanh lý",
      width: "150px",
      render: (_, record) => {
        const assetKey = getAssetKey(record);
        const isCCDC = record.type === AssetType.TOOLS_EQUIPMENT;
        const systemQty = systemQuantities[assetKey] ?? (record.quantity || 1);
        const countedQty = countedQuantities[assetKey] ?? (record.quantity || 1);
        
        if (isCCDC) {
          return (
            <div className="flex justify-center">
              <input
                type="number"
                min="0"
                max={systemQty}
                step="1"
                className="border rounded px-2 py-1 text-sm w-20 text-center"
                placeholder="SL"
                value={countedQty}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (!isNaN(value) && value >= 0) {
                    handleCountedQuantityChange(record, value);
                  } else if (e.target.value === '') {
                    handleCountedQuantityChange(record, 0);
                  }
                }}
                disabled={isSubmitting || isCreatingProposal}
                onBlur={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (isNaN(value) || value < 0) {
                    handleCountedQuantityChange(record, 0);
                  } else if (value > systemQty) {
                    toast.error(`Số lượng không được vượt quá ${systemQty}`);
                    handleCountedQuantityChange(record, systemQty);
                  }
                }}
              />
            </div>
          );
        } else {
          // Tài sản cố định: luôn thanh lý hết (1)
          return (
            <div className="text-sm text-center text-gray-900 font-medium">
              1
            </div>
          );
        }
      },
      className: "text-center",
      sortable: false,
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
      width: "150px",
      render: (_, record) => (
        <div className="flex justify-center items-center gap-2">
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
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-red-600 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveAsset(record);
            }}
            disabled={isSubmitting || isCreatingProposal}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: "text-center",
    },
  ];

  // Show error toast if create proposal fails
  useEffect(() => {
    if (createProposalError) {
      // Handle error object or string
      let errorMessage = 'Có lỗi xảy ra khi tạo đề xuất thanh lý';
      if (typeof createProposalError === 'string') {
        errorMessage = createProposalError;
      } else if (typeof createProposalError === 'object' && createProposalError !== null) {
        const errorObj = createProposalError as any;
        errorMessage = errorObj?.message || errorObj?.error || errorMessage;
      }
      toast.error(errorMessage);
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

  // Handle remove asset from list
  const handleRemoveAsset = (asset: Asset) => {
    const assetKey = getAssetKey(asset);
    const updatedAssets = assetsFromStore.filter(a => getAssetKey(a) !== assetKey);
    setAssetsFromStore(updatedAssets);
    setFilteredAssets(updatedAssets);
    
    // Remove quantities
    setSystemQuantities(prev => {
      const copy = { ...prev };
      delete copy[assetKey];
      return copy;
    });
    setCountedQuantities(prev => {
      const copy = { ...prev };
      delete copy[assetKey];
      return copy;
    });
  };

  // Handle system quantity change
  const handleSystemQuantityChange = (asset: Asset, quantity: number) => {
    if (quantity < 0) return;
    const assetKey = getAssetKey(asset);
    setSystemQuantities(prev => ({ ...prev, [assetKey]: quantity }));
    // Auto-update counted quantity if it's greater than new system quantity
    const currentCounted = countedQuantities[assetKey] || 0;
    if (currentCounted > quantity) {
      setCountedQuantities(prev => ({ ...prev, [assetKey]: quantity }));
    }
  };

  // Handle counted quantity change
  const handleCountedQuantityChange = (asset: Asset, quantity: number) => {
    if (quantity < 0) return;
    const assetKey = getAssetKey(asset);
    const systemQty = systemQuantities[assetKey] || asset.quantity || 1;
    if (quantity > systemQty) {
      toast.error(`Số lượng thanh lý không được vượt quá số lượng hiện có (${systemQty})`);
      setCountedQuantities(prev => ({ ...prev, [assetKey]: systemQty }));
      return;
    }
    setCountedQuantities(prev => ({ ...prev, [assetKey]: quantity }));
  };

  // Handle add assets from modal
  const handleAddAssetsFromModal = (selectedAssets: Asset[]) => {
    if (!selectedAssets || selectedAssets.length === 0) {
      toast.error("Không có tài sản nào được chọn!");
      return;
    }

    const currentAssetKeys = assetsFromStore.map(asset => getAssetKey(asset));
    const existingKeys = new Set(currentAssetKeys);
    const newAssets = selectedAssets.filter(asset => !existingKeys.has(getAssetKey(asset)));
    
    if (newAssets.length === 0) {
      toast.error("Tất cả tài sản đã được thêm vào danh sách!");
      setIsAddAssetModalOpen(false);
      return;
    }

    const updatedAssets = [...assetsFromStore, ...newAssets];
    setAssetsFromStore(updatedAssets);
    setFilteredAssets(updatedAssets);
    
    const newSystemQuantities: Record<string, number> = {};
    const newCountedQuantities: Record<string, number> = {};
    newAssets.forEach((asset: Asset) => {
      const assetKey = getAssetKey(asset);
      newSystemQuantities[assetKey] = asset.quantity || 1;
      newCountedQuantities[assetKey] = asset.quantity || 1;
    });
    setSystemQuantities(prev => ({ ...prev, ...newSystemQuantities }));
    setCountedQuantities(prev => ({ ...prev, ...newCountedQuantities }));
    
    toast.success(`Đã thêm ${newAssets.length} tài sản vào danh sách thanh lý`);
    
    setIsAddAssetModalOpen(false);
  };

  // Get initial filters for modal
  const modalInitialFilters = useMemo(() => {
    let unitId = undefined;
    if (!hasGlobalAccess && !hasChildUnitsAccess) {
      unitId = user?.unitId || undefined;
    }
    
    return {
      unitId,
      year: new Date().getFullYear().toString(),
      assetType: selectedAssetType || "FIXED_ASSET",
    };
  }, [user?.unitId, selectedAssetType, hasGlobalAccess, hasChildUnitsAccess]);

  // Handle create liquidation proposal - submit directly
  const handleCreateProposal = async () => {
    if (assetsFromStore.length === 0) {
      toast.error("Vui lòng chọn ít nhất một tài sản để tạo đề xuất thanh lý");
      return;
    }

    if (!hasGlobalAccess && !hasChildUnitsAccess && !user?.unitId) {
      toast.error("Không thể xác định đơn vị của bạn. Vui lòng đăng nhập lại.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Tạo danh sách items từ tất cả tài sản trong store
      const selectedItems = assetsFromStore;

      for (const asset of selectedItems) {
        const assetKey = getAssetKey(asset);
        const systemQty = systemQuantities[assetKey] ?? (asset.quantity || 1);
        const countedQty = countedQuantities[assetKey] ?? (asset.quantity || 1);
        
        if (systemQty < 0) {
          toast.error(`Số lượng theo sổ sách không hợp lệ cho tài sản "${asset.name}"`);
          setIsSubmitting(false);
          return;
        }
        
        if (countedQty < 0) {
          toast.error(`Số lượng thanh lý không hợp lệ cho tài sản "${asset.name}"`);
          setIsSubmitting(false);
          return;
        }
        
        if (countedQty > systemQty) {
          toast.error(`Số lượng thanh lý (${countedQty}) không được vượt quá số lượng hiện có (${systemQty}) cho tài sản "${asset.name}"`);
          setIsSubmitting(false);
          return;
        }
      }

      let unitIdToUse = user?.unitId;
      if (!unitIdToUse && assetsFromStore.length > 0) {
        const firstAsset = assetsFromStore[0];
        if (firstAsset.currentRoom?.unitId) {
          unitIdToUse = firstAsset.currentRoom.unitId;
        } else if (firstAsset.unitId) {
          unitIdToUse = firstAsset.unitId;
        }
      }

      if (!unitIdToUse && !hasGlobalAccess && !hasChildUnitsAccess) {
        toast.error("Không thể xác định đơn vị. Vui lòng chọn tài sản có thông tin đơn vị.");
        setIsSubmitting(false);
        return;
      }

      const createDto: CreateLiquidationProposalDto = {
        unitId: unitIdToUse || user!.unitId!,
        status: selectedStatus,
        items: selectedItems.map((asset): CreateLiquidationItemDto => {
          const assetKey = getAssetKey(asset);
          return {
            assetId: asset.id,
            systemQuantity: systemQuantities[assetKey] ?? (asset.quantity || 1),
            countedQuantity: countedQuantities[assetKey] ?? (asset.quantity || 1),
            note: transactionNote || `Đề xuất thanh lý từ sổ tài sản - ${asset.name}`,
            imageUrl: undefined,
          };
        }),
        assetType: selectedAssetType as AssetType,
      };

      // Gọi API tạo đề xuất thanh lý
      const result = await dispatch(createLiquidationProposal(createDto)).unwrap();
      
      const statusMessage = selectedStatus === LiquidationStatus.PROPOSED 
        ? "và đã gửi đề xuất" 
        : "dưới dạng nháp";
      
      toast.success(
        `Đã tạo đề xuất thanh lý cho ${assetsFromStore.length} tài sản ${statusMessage}!`
      );
      
      // Clear draft từ sessionStorage sau khi tạo thành công
      try {
        sessionStorage.removeItem('liquidationDraft');
        sessionStorage.removeItem('selectedAssetsForLiquidation');
      } catch (e) {
        // Silent fail for sessionStorage operations
      }
      
      // Chuyển hướng về trang danh sách đề xuất
      router.push("/liquidation");
      
    } catch (error: any) {
      // Handle error object or string
      let errorMessage = "Có lỗi xảy ra khi tạo đề xuất thanh lý. Vui lòng thử lại.";
      if (error) {
        if (typeof error === 'string') {
          errorMessage = error;
        } else if (error?.message) {
          errorMessage = error.message;
        } else if (error?.error) {
          errorMessage = typeof error.error === 'string' ? error.error : error.error?.message || errorMessage;
        } else if (error?.data?.message) {
          errorMessage = error.data.message;
        }
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col w-full sm:w-auto">
              <div className="flex items-center text-sm sm:text-base text-gray-600 mb-3">
                <button
                  onClick={() => router.push("/asset/asset-book")}
                  className="hover:text-blue-600 text-lg sm:text-xl transition-colors font-semibold cursor-pointer"
                >
                  Sổ tài sản
                </button>
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 mx-1 sm:mx-2" />
                <span className="text-gray-900 font-semibold text-lg sm:text-xl">
                  Tạo đề xuất thanh lý
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => {
                  setIsAddAssetModalOpen(true);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-green-700 text-white"
                disabled={isSubmitting || isCreatingProposal}
              >
                <Plus className="h-4 w-4" />
                Thêm tài sản
              </Button>
              <Button
                onClick={() => router.push("/asset/asset-book")}
                variant="outline"
                disabled={isSubmitting || isCreatingProposal}
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={handleCreateProposal}
                disabled={isSubmitting || isCreatingProposal || assetsFromStore.length === 0}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isCreatingProposal || isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {selectedStatus === LiquidationStatus.PROPOSED ? "Gửi đề xuất" : "Lưu nháp"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      {/* Status Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-300 mb-6">
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
        key={`assets-table-${assetsFromStore.length}`}
        columns={columns}
        data={filteredAssets || []}
        loading={false}
        emptyText="Không có tài sản nào được chọn"
        emptyIcon={<Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
        rowKey={(record) => getAssetKey(record)}
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

      <AssetBookSelectionModal
        isOpen={isAddAssetModalOpen}
        onClose={() => {
          setIsAddAssetModalOpen(false);
        }}
        onConfirm={handleAddAssetsFromModal}
        title="Chọn tài sản từ sổ tài sản để thanh lý"
        excludeAssetIds={assetsFromStore.map(asset => getAssetKey(asset))}
        initialFilters={modalInitialFilters}
      />
      </div>
    </div>
  );
}
