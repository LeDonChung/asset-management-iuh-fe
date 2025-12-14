"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableColumn } from "@/components/ui/table";
import {
  Package,
  Save,
  RefreshCw,
  ChevronDown,
  Check,
  Trash2,
  ChevronRight,
  Plus,
  Eye,
  ArrowLeft,
  Info,
  MapPin,
} from "lucide-react";
import {
  AssetType,
  LiquidationStatus,
  AssetBookItemStatus,
  Asset,
  UpdateLiquidationProposalDto,
  UpdateLiquidationItemDto,
} from "@/types/asset";
import { useAuth } from "@/contexts/AuthContext";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { RootState } from "@/lib/store";
import {
  getLiquidationProposalById,
  updateLiquidationProposal,
} from "@/lib/store/slices/liquidationSlice";
import { PermissionConstants } from "@/hooks/usePermissions";
import toast from "react-hot-toast";
import AssetBookSelectionModal from "@/components/asset/AssetBookSelectionModal";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";

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

export default function LiquidationEditPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const proposalId = params.id as string;

  const {
    currentLiquidationProposal,
    isFetchingProposal,
    isUpdatingProposal,
    fetchProposalError,
    updateProposalError,
  } = useAppSelector((state: RootState) => state.liquidation);

  const { user, hasAnyPermission } = useAuth();
  const canUpdate = hasAnyPermission([
    PermissionConstants.PERM_UPDATE_LIQUIDATION,
  ]);

  const [assetsFromStore, setAssetsFromStore] = useState<any[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<any[]>([]);
  const [assetNotes, setAssetNotes] = useState<Record<string, string>>({});
  const [systemQuantities, setSystemQuantities] = useState<Record<string, number>>({});
  const [countedQuantities, setCountedQuantities] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<any | null>(null);

  const getAssetKey = (asset: Asset | any): string => {
    return asset.bookItemId || asset.id;
  };

  // Load liquidation proposal data
  useEffect(() => {
    if (!canUpdate) {
      router.push("/unauthorized");
      return;
    }

    if (proposalId) {
      dispatch(getLiquidationProposalById(proposalId));
    }
  }, [proposalId, dispatch, canUpdate, router]);

  // Initialize form data when proposal is loaded
  useEffect(() => {
    if (currentLiquidationProposal) {
      // Check if proposal can be edited
      if (
        currentLiquidationProposal.status !== LiquidationStatus.DRAFT &&
        currentLiquidationProposal.status !== LiquidationStatus.REJECTED
      ) {
        toast.error("Chỉ có thể chỉnh sửa đề xuất thanh lý ở trạng thái Nháp hoặc Từ chối");
        router.push(`/liquidation/${proposalId}`);
        return;
      }

      // Convert liquidation items to assets format
      const assets = (currentLiquidationProposal.items || []).map((item) => ({
        id: item.assetId,
        itemId: item.id, // Store the liquidation item ID
        bookItemId: item.asset?.bookItemId, // Preserve bookItemId if available
        ktCode: item.asset?.ktCode || "",
        fixedCode: item.asset?.fixedCode || "",
        name: item.asset?.name || "",
        specs: item.asset?.specs || "",
        entrydate: item.asset?.entrydate || "",
        currentRoomId: item.asset?.currentRoomId,
        unit: item.asset?.unit || "",
        quantity: item.systemQuantity || 1,
        systemQuantity: item.systemQuantity,
        countedQuantity: item.countedQuantity,
        type: item.asset?.type as any || "FIXED_ASSET" as any,
        bookItemStatus: item.asset?.status as any,
        currentRoom: item.asset?.currentRoom ? {
          id: item.asset.currentRoom.id,
          name: item.asset.currentRoom.name,
          roomCode: item.asset.currentRoom.roomCode,
          building: item.asset.currentRoom.building || "",
          floor: item.asset.currentRoom.floor || "",
          roomNumber: item.asset.currentRoom.roomNumber || "",
          status: item.asset.currentRoom.status as any || "ACTIVE" as any,
          unitId: item.asset.currentRoom.unitId,
        } : undefined,
        imageUrl: item.imageUrl,
      }));

      setAssetsFromStore(assets);
      setFilteredAssets(assets);

      const notes: Record<string, string> = {};
      const systemQty: Record<string, number> = {};
      const countedQty: Record<string, number> = {};
      (currentLiquidationProposal.items || []).forEach((item) => {
        const assetKey = item.asset?.bookItemId || item.assetId;
        if (item.note) {
          notes[assetKey] = item.note;
        }
        systemQty[assetKey] = item.systemQuantity || item.asset?.quantity || 1;
        countedQty[assetKey] = item.countedQuantity || item.asset?.quantity || 1;
      });
      setAssetNotes(notes);
      setSystemQuantities(systemQty);
      setCountedQuantities(countedQty);
    }
  }, [currentLiquidationProposal, router, proposalId]);

  useEffect(() => {
    if (updateProposalError) {
      toast.error(updateProposalError);
    }
  }, [updateProposalError]);

  // Handle remove asset from list
  const handleRemoveAsset = (asset: Asset | any) => {
    const assetKey = getAssetKey(asset);
    const updatedAssets = assetsFromStore.filter(a => getAssetKey(a) !== assetKey);
    setAssetsFromStore(updatedAssets);
    setFilteredAssets(updatedAssets);
    
    setAssetNotes((prev) => {
      const copy = { ...prev };
      delete copy[assetKey];
      return copy;
    });
    setSystemQuantities((prev) => {
      const copy = { ...prev };
      delete copy[assetKey];
      return copy;
    });
    setCountedQuantities((prev) => {
      const copy = { ...prev };
      delete copy[assetKey];
      return copy;
    });
  };

  // Handle note change
  const handleNoteChange = (asset: Asset | any, note: string) => {
    const assetKey = getAssetKey(asset);
    setAssetNotes((prev) => ({ ...prev, [assetKey]: note }));
  };

  const handleSystemQuantityChange = (asset: Asset | any, quantity: number) => {
    if (quantity < 0) return;
    const assetKey = getAssetKey(asset);
    setSystemQuantities(prev => ({ ...prev, [assetKey]: quantity }));
    const currentCounted = countedQuantities[assetKey] || 0;
    if (currentCounted > quantity) {
      setCountedQuantities(prev => ({ ...prev, [assetKey]: quantity }));
    }
  };

  const handleCountedQuantityChange = (asset: Asset | any, quantity: number) => {
    if (quantity < 0) return;
    const assetKey = getAssetKey(asset);
    const systemQty = systemQuantities[assetKey] ?? (asset.systemQuantity ?? asset.quantity ?? 1);
    if (quantity > systemQty) {
      toast.error(`Số lượng thanh lý không được vượt quá số lượng hiện có (${systemQty})`);
      setCountedQuantities(prev => ({ ...prev, [assetKey]: systemQty }));
      return;
    }
    setCountedQuantities(prev => ({ ...prev, [assetKey]: quantity }));
  };

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

    // Convert new assets to the format we need
    const formattedNewAssets = newAssets.map(asset => ({
      id: asset.id,
      bookItemId: asset.bookItemId,
      ktCode: asset.ktCode,
      fixedCode: asset.fixedCode,
      name: asset.name,
      specs: asset.specs,
      entrydate: asset.entrydate,
      currentRoomId: asset.currentRoomId,
      unit: asset.unit,
      quantity: asset.quantity || 1,
      systemQuantity: asset.quantity || 1,
      countedQuantity: asset.quantity || 1,
      type: asset.type,
      bookItemStatus: asset.status,
      currentRoom: asset.currentRoom,
    }));

    const updatedAssets = [...assetsFromStore, ...formattedNewAssets];
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
  const modalInitialFilters = useMemo(() => ({
    unitId: currentLiquidationProposal?.unitId || user?.unitId || undefined,
    year: new Date().getFullYear().toString(),
    assetType: currentLiquidationProposal?.assetType || "FIXED_ASSET",
  }), [currentLiquidationProposal?.unitId, currentLiquidationProposal?.assetType, user?.unitId]);

  // Handle submit edit
  const handleSubmitEdit = async () => {
    if (assetsFromStore.length === 0) {
      toast.error("Vui lòng chọn ít nhất một tài sản để cập nhật đề xuất thanh lý");
      return;
    }

    if (!currentLiquidationProposal?.unitId) {
      toast.error("Không thể xác định đơn vị của đề xuất thanh lý.");
      return;
    }

    setIsSubmitting(true);

    try {
      for (const asset of assetsFromStore) {
        const assetKey = getAssetKey(asset);
        const systemQty = systemQuantities[assetKey] ?? (asset.systemQuantity ?? asset.quantity ?? 1);
        const countedQty = countedQuantities[assetKey] ?? (asset.countedQuantity ?? asset.quantity ?? 1);
        
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

      const items: UpdateLiquidationItemDto[] = assetsFromStore.map((asset) => {
        const assetKey = getAssetKey(asset);
        return {
          id: asset.itemId, // Include item ID if it exists (for existing items)
          assetId: asset.id,
          systemQuantity: systemQuantities[assetKey] ?? (asset.systemQuantity ?? asset.quantity ?? 1),
          countedQuantity: countedQuantities[assetKey] ?? (asset.countedQuantity ?? asset.quantity ?? 1),
          note: assetNotes[assetKey] || `Đề xuất thanh lý - ${asset.name}`,
          imageUrl: asset.imageUrl || undefined,
        };
      });

      const updateDto: UpdateLiquidationProposalDto = {
        unitId: currentLiquidationProposal.unitId,
        items: items,
      };

      // Call API to update proposal
      await dispatch(updateLiquidationProposal({
        id: proposalId,
        updateDto: updateDto,
      })).unwrap();
      
      toast.success(`Đã cập nhật đề xuất thanh lý thành công!`);
      
      // Navigate back to detail page
      router.push(`/liquidation/${proposalId}`);
      
    } catch (error: any) {
      console.error("Error updating liquidation proposal:", error);
      toast.error(
        error?.message || "Có lỗi xảy ra khi cập nhật đề xuất thanh lý. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    router.push(`/liquidation/${proposalId}`);
  };

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
        const systemQty = systemQuantities[assetKey] ?? (record.systemQuantity ?? record.quantity ?? 1);
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
        const systemQty = systemQuantities[assetKey] ?? (record.systemQuantity ?? record.quantity ?? 1);
        const countedQty = countedQuantities[assetKey] ?? (record.countedQuantity ?? record.quantity ?? 1);
        
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
                disabled={isSubmitting || isUpdatingProposal}
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
      key: "note",
      title: "Ghi chú",
      width: "200px",
      render: (_, record) => (
        <input
          type="text"
          className="border rounded px-2 py-1 text-xs w-full"
          placeholder="Nhập ghi chú..."
          value={assetNotes[getAssetKey(record)] || ""}
          onChange={(e) => handleNoteChange(record, e.target.value)}
          disabled={isSubmitting || isUpdatingProposal}
        />
      ),
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
            disabled={isSubmitting || isUpdatingProposal}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: "text-center",
    },
  ];

  if (isFetchingProposal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <RefreshCw className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Đang tải dữ liệu...
            </h2>
            <p className="text-gray-600 mb-6">Vui lòng đợi trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }

  if (fetchProposalError || !currentLiquidationProposal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy đề xuất thanh lý
            </h2>
            <p className="text-gray-600 mb-6">
              {fetchProposalError || "Đề xuất thanh lý không tồn tại hoặc đã bị xóa."}
            </p>
          </div>
          <Button onClick={() => router.push("/liquidation")} variant="outline" className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  if (assetsFromStore.length === 0 && !isFetchingProposal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Đang tải dữ liệu...
            </h2>
            <p className="text-gray-600 mb-6">Vui lòng đợi trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col w-full sm:w-auto">
              <div className="flex items-center text-sm sm:text-base text-gray-600 mb-3">
                <button
                  onClick={() => router.push("/liquidation")}
                  className="hover:text-blue-600 text-lg sm:text-xl transition-colors font-semibold cursor-pointer"
                >
                  Thanh lý
                </button>
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 mx-1 sm:mx-2" />
                <button
                  onClick={() => router.push(`/liquidation/${proposalId}`)}
                  className="hover:text-blue-600 text-lg sm:text-xl transition-colors font-semibold cursor-pointer"
                >
                  Chi tiết
                </button>
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 mx-1 sm:mx-2" />
                <span className="text-gray-900 font-semibold text-lg sm:text-xl">
                  Chỉnh sửa đề xuất thanh lý
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => {
                  setIsAddAssetModalOpen(true);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-green-700 text-white"
                disabled={isSubmitting || isUpdatingProposal}
              >
                <Plus className="h-4 w-4" />
                Thêm tài sản
              </Button>
              <Button
                onClick={handleCancelEdit}
                variant="outline"
                disabled={isSubmitting || isUpdatingProposal}
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={handleSubmitEdit}
                disabled={isSubmitting || isUpdatingProposal || assetsFromStore.length === 0}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isUpdatingProposal || isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Assets Table */}
        <Table<any>
          key={`assets-table-${assetsFromStore.length}`}
          columns={columns}
          data={filteredAssets}
          loading={false}
          emptyText="Không có tài sản nào được chọn"
          emptyIcon={<Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
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

