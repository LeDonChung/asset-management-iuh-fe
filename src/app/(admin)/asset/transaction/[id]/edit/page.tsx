"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useAppDispatch } from "@/lib/store/hooks";
import {
  getTransactionById,
  updateTransaction,
  setSelectedAssetsForHandover,
  setHandoverContext,
  TransactionResponseDto,
  TransactionItemResponseDto,
} from "@/lib/store/slices/transactionSlice";
import { getUnitCampus } from "@/lib/store/slices/unitSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableColumn } from "@/components/ui/table";
import {
  ArrowLeft,
  Package2,
  Building2,
  MapPin,
  Save,
  Search,
  RefreshCw,
  ChevronDown,
  Check,
  ArrowRight,
  ArrowUpDown,
  Trash2,
  ChevronRight,
  Plus,
} from "lucide-react";
import Link from "next/link";
import {
  Asset,
  Unit,
  TransactionStatus,
  AccessScopeType,
  AssetType,
} from "@/types/asset";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import AssetBookSelectionModal from "@/components/asset/AssetBookSelectionModal";

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

// Convert TransactionItemResponseDto to Asset format
const convertTransactionItemToAsset = (item: TransactionItemResponseDto): Asset => {
  // Lấy thông tin từ asset.currentRoom (có đầy đủ thông tin hơn fromRoom)
  const fullAsset = item.asset as any;
  
  return {
    id: item.assetId,
    bookItemId: fullAsset?.bookItemId || (item as any).bookItemId || undefined,
    ktCode: item.asset?.ktCode || "",
    fixedCode: item.asset?.fixedCode || "",
    name: item.asset?.name || "",
    specs: fullAsset?.specs || item.asset?.type || "",
    entrydate: fullAsset?.entrydate || "",
    currentRoomId: item.fromRoomId || item.asset?.currentRoom?.id,
    unit: fullAsset?.unit || "",
    quantity: item.quantity || fullAsset?.quantity || 1,
    purchasePackage: fullAsset?.purchasePackage || 0,
    type: item.asset?.type as any || "FIXED_ASSET" as any,
    isLocked: false,
    isHandOver: false,
    categoryId: fullAsset?.categoryId || "",
    status: item.asset?.status as any || "IN_USE" as any,
    createdBy: fullAsset?.createdBy || "",
    createdAt: fullAsset?.createdAt || "",
    updatedAt: fullAsset?.updatedAt || "",
    currentRoom: fullAsset?.currentRoom ? {
      id: fullAsset.currentRoom.id,
      name: fullAsset.currentRoom.name || fullAsset.currentRoom.roomCode,
      roomCode: fullAsset.currentRoom.roomCode,
      floor: fullAsset.currentRoom.floor || "",
      status: fullAsset.currentRoom.status || "ACTIVE" as any,
      unitId: fullAsset.currentRoom.unitId || "",
      createdBy: "",
      createdAt: fullAsset.currentRoom.createdAt || "",
      updatedAt: fullAsset.currentRoom.updatedAt || "",
      unit: fullAsset.currentRoom.unit,
    } : item.fromRoom ? {
      id: item.fromRoom.id,
      name: item.fromRoom.name || item.fromRoom.roomCode,
      roomCode: item.fromRoom.roomCode,
      floor: (item.fromRoom as any).floor || "",
      status: (item.fromRoom as any).status || "ACTIVE" as any,
      unitId: (item.fromRoom as any).unitId || "",
      createdBy: "",
      createdAt: (item.fromRoom as any).createdAt || "",
      updatedAt: (item.fromRoom as any).updatedAt || "",
    } : undefined,
  };
};

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const transactionId = params.id as string;

  const accessScopeTypes = user?.accessScopeTypes || [];
  const hasGlobalAccess = accessScopeTypes.includes(AccessScopeType.GLOBAL);
  const hasChildUnitsAccess = accessScopeTypes.includes(AccessScopeType.CHILD_UNITS);
  const hasUnitAccess = accessScopeTypes.includes(AccessScopeType.UNIT);
  const hasSelfAccess = accessScopeTypes.includes(AccessScopeType.SELF);

  const {
    currentTransactionDetail,
    isFetchingTransaction,
    isUpdatingTransaction,
    fetchTransactionError,
  } = useSelector((state: RootState) => state.transaction);
  
  const { campuses } = useSelector((state: RootState) => state.unit);

  const [selectedCampusId, setSelectedCampusId] = useState("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [transactionNote, setTransactionNote] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [assetNotes, setAssetNotes] = useState<Record<string, string>>({});
  const [assetQuantities, setAssetQuantities] = useState<Record<string, number>>({});
  
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const savedUnitIdRef = useRef<string>("");
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);

  // Helper function to get unique key for asset (handles duplicate asset codes)
  const getAssetKey = (asset: Asset): string => {
    return asset.bookItemId || asset.id;
  };

  // Load transaction data from API
  useEffect(() => {
    if (transactionId) {
      dispatch(getTransactionById(transactionId));
    }
  }, [transactionId, dispatch]);

  // Initialize form data when transaction is loaded
  useEffect(() => {
    if (currentTransactionDetail) {
      // Check if transaction can be edited
      if (
        currentTransactionDetail.status !== TransactionStatus.DRAFT &&
        currentTransactionDetail.status !== TransactionStatus.REJECTED
      ) {
        toast.error("Chỉ có thể chỉnh sửa giao dịch ở trạng thái Nháp hoặc Từ chối");
        router.push(`/asset/transaction/${transactionId}`);
        return;
      }

      // Convert transaction items to assets
      const assets = currentTransactionDetail.items.map(convertTransactionItemToAsset);
      setSelectedAssets(assets);

      const notes: Record<string, string> = {};
      const quantities: Record<string, number> = {};
      currentTransactionDetail.items.forEach((item) => {
        const asset = assets.find(a => a.id === item.assetId);
        if (asset) {
          const assetKey = getAssetKey(asset);
          if (item.note) {
            notes[assetKey] = item.note;
          }
          quantities[assetKey] = item.quantity || 1;
        }
      });
      setAssetNotes(notes);
      setAssetQuantities(quantities);

      // Set transaction note
      setTransactionNote(currentTransactionDetail.requestNote || "");

      // Set date
      if (currentTransactionDetail.createdAt) {
        const date = new Date(currentTransactionDetail.createdAt);
        setSelectedDate(date.toISOString().split('T')[0]);
      }

      // Set unit
      if (currentTransactionDetail.toUnit) {
        setSelectedUnitId(currentTransactionDetail.toUnit.id);
      }

      // Set handover context
      if (currentTransactionDetail.fromUnit) {
        dispatch(setHandoverContext({
          sourceUnitId: currentTransactionDetail.fromUnit.id,
        }));
      }
    }
  }, [currentTransactionDetail, dispatch, router, transactionId]);

  // Load campuses and units
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const campusesResult = await dispatch(getUnitCampus()).unwrap();
        if (campusesResult && user) {
          if (hasChildUnitsAccess) {
            const campusId = currentTransactionDetail?.fromUnit?.id || user?.unitId;
            const userCampus = campusesResult.find(
              (campus: Unit) => campus.id === campusId
            );
            if (userCampus) {
              setUnits(userCampus.childUnits ?? []);
              setSelectedCampusId(userCampus.id);
            } else {
              setUnits([]);
              setSelectedCampusId("");
            }
          } else if (hasUnitAccess || hasSelfAccess) {
            let userUnit: Unit | undefined;
            let userCampus: Unit | undefined;

            const unitId = currentTransactionDetail?.fromUnit?.id || user.unitId;

            for (const campus of campusesResult) {
              const foundUnit = campus.childUnits?.find(
                (unit: Unit) => unit.id === unitId
              );
              if (foundUnit) {
                userUnit = foundUnit;
                userCampus = campus;
                break;
              }
            }

            if (userCampus && userUnit) {
              setSelectedCampusId(userCampus.id);
              setUnits(userCampus.childUnits ?? []);
            }
          } else if (hasGlobalAccess) {
            if (currentTransactionDetail?.fromUnit) {
              // Find campus containing the fromUnit
              for (const campus of campusesResult) {
                const foundUnit = campus.childUnits?.find(
                  (unit: Unit) => unit.id === currentTransactionDetail.fromUnit!.id
                );
                if (foundUnit) {
                  setSelectedCampusId(campus.id);
                  setUnits(campus.childUnits ?? []);
                  break;
                }
              }
            }
          }
        }
      } catch (e: any) {
        toast.error(e.message || "Có lỗi xảy ra khi tải dữ liệu.");
      }
    };
    if (currentTransactionDetail) {
      loadInitialData();
    }
  }, [dispatch, hasGlobalAccess, hasChildUnitsAccess, hasUnitAccess, hasSelfAccess, user, currentTransactionDetail]);

  useEffect(() => {
    if (selectedCampusId) {
      const campus = campuses.find((campus) => campus.id === selectedCampusId);
      setUnits(campus?.childUnits ?? []);
      // Don't reset selectedUnitId when editing
    }
  }, [selectedCampusId, campuses]);

  const handleCancelEdit = () => {
    router.push(`/asset/transaction/${transactionId}`);
  };

  const handleRemoveAsset = (asset: Asset) => {
    const assetKey = getAssetKey(asset);
    setSelectedAssets((prev) => prev.filter((a) => getAssetKey(a) !== assetKey));
    setAssetNotes((prev) => {
      const copy = { ...prev };
      delete copy[assetKey];
      return copy;
    });
    setAssetQuantities((prev) => {
      const copy = { ...prev };
      delete copy[assetKey];
      return copy;
    });
  };

  const handleNoteChange = (asset: Asset, note: string) => {
    const assetKey = getAssetKey(asset);
    setAssetNotes((prev) => ({ ...prev, [assetKey]: note }));
  };

  const handleQuantityChange = (asset: Asset, quantity: number) => {
    if (quantity < 1) return;
    const assetKey = getAssetKey(asset);
    setAssetQuantities((prev) => ({ ...prev, [assetKey]: quantity }));
  };

  useEffect(() => {
    if (isAddAssetModalOpen) {
      savedUnitIdRef.current = selectedUnitId;
    }
  }, [isAddAssetModalOpen, selectedUnitId]);

  useEffect(() => {
    if (!isAddAssetModalOpen && savedUnitIdRef.current) {
      if (savedUnitIdRef.current && savedUnitIdRef.current !== selectedUnitId) {
        setSelectedUnitId(savedUnitIdRef.current);
      }
      setTimeout(() => {
        savedUnitIdRef.current = "";
      }, 100);
    }
  }, [isAddAssetModalOpen]);

  const handleAddAssetsFromModal = (selectedAssetsFromModal: Asset[]) => {
    if (!selectedAssetsFromModal || selectedAssetsFromModal.length === 0) {
      toast.error("Không có tài sản nào được chọn!");
      return;
    }

    const currentAssetKeys = selectedAssets.map(asset => getAssetKey(asset));
    const existingKeys = new Set(currentAssetKeys);
    const newAssets = selectedAssetsFromModal.filter(asset => !existingKeys.has(getAssetKey(asset)));
    
    if (newAssets.length === 0) {
      toast.error("Tất cả tài sản đã được thêm vào danh sách!");
      setIsAddAssetModalOpen(false);
      return;
    }

    const updatedAssets = [...selectedAssets, ...newAssets];
    
    const newQuantities: Record<string, number> = {};
    newAssets.forEach(asset => {
      const assetKey = getAssetKey(asset);
      if (asset.type === AssetType.TOOLS_EQUIPMENT) {
        newQuantities[assetKey] = 1;
      } else {
        newQuantities[assetKey] = 1;
      }
    });
    setAssetQuantities((prev) => ({ ...prev, ...newQuantities }));
    
    setSelectedAssets(updatedAssets);
    
    toast.success(`Đã thêm ${newAssets.length} tài sản vào danh sách bàn giao`);
    
    setIsAddAssetModalOpen(false);
  };

  const modalInitialFilters = useMemo(() => {
    const sourceUnitId = currentTransactionDetail?.fromUnit?.id || 
      (selectedAssets.length > 0 
        ? selectedAssets[0].currentRoom?.unit?.id 
        : undefined);
    
    return {
      unitId: sourceUnitId,
      year: new Date().getFullYear().toString(),
      assetType: "FIXED_ASSET",
    };
  }, [currentTransactionDetail?.fromUnit?.id, selectedAssets]);

  const handleSubmitEdit = async () => {
    if (!selectedUnitId) {
      toast.error("Vui lòng chọn đơn vị tiếp nhận!");
      return;
    }

    if (!selectedDate) {
      toast.error("Vui lòng chọn ngày tạo yêu cầu!");
      return;
    }

    if (selectedAssets.length === 0) {
      toast.error("Vui lòng chọn ít nhất một tài sản!");
      return;
    }

    for (const asset of selectedAssets) {
      const assetKey = getAssetKey(asset);
      if (asset.type === AssetType.TOOLS_EQUIPMENT) {
        const quantity = assetQuantities[assetKey];
        if (!quantity || quantity < 1) {
          toast.error(`Vui lòng nhập số lượng hợp lệ (>= 1) cho tài sản "${asset.name}"`);
          return;
        }
        // Validate quantity doesn't exceed current quantity
        if (quantity > asset.quantity) {
          toast.error(`Số lượng bàn giao (${quantity}) không được vượt quá số lượng hiện có (${asset.quantity}) cho tài sản "${asset.name}"`);
          return;
        }
      }
    }

    setIsSubmitting(true);

    try {
      const unitName = units.find((u) => u.id === selectedUnitId)?.name || "";

      const transactionItems = selectedAssets.map((asset) => {
        const assetKey = getAssetKey(asset);
        return {
          assetId: asset.id,
          quantity: asset.type === AssetType.TOOLS_EQUIPMENT 
            ? (assetQuantities[assetKey] || 1)
            : 1, // Tài sản cố định luôn = 1
          fromRoomId: asset.currentRoom?.id,
          note: assetNotes[assetKey] || `Bàn giao đến ${unitName}`,
        };
      });

      let fromUnitId: string | undefined = currentTransactionDetail?.fromUnit?.id;
      
      if (!fromUnitId && selectedAssets.length > 0) {
        const firstAsset = selectedAssets[0];
        fromUnitId = firstAsset.currentRoom?.unit?.id;
      }

      if (!fromUnitId) {
        throw new Error("Không thể xác định đơn vị nguồn");
      }

      const updateTransactionDto = {
        fromUnitId: fromUnitId,
        toUnitId: selectedUnitId,
        requestNote: transactionNote || `Bàn giao ${selectedAssets.length} tài sản đến ${unitName}`,
        items: transactionItems,
      };

      const result = await dispatch(updateTransaction({
        id: transactionId,
        updateDto: updateTransactionDto,
      })).unwrap();

      if (result && result.id) {
        toast.success("Cập nhật yêu cầu bàn giao thành công!");
        router.push(`/asset/transaction/${transactionId}`);
      } else {
        throw new Error("Không nhận được phản hồi hợp lệ từ máy chủ");
      }
    } catch (error: any) {
      console.error("Error updating transaction:", error);
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật yêu cầu bàn giao.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: TableColumn<Asset>[] = [
    {
      key: "codes",
      title: "Mã TSCD / Mã KT",
      render: (_, record) => (
        <div className="text-sm font-medium text-gray-900">
          <div>{record.fixedCode}</div>
          <div className="text-xs text-gray-500">{record.ktCode}</div>
        </div>
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
      key: "specs",
      title: "Thông số KT",
      render: (_, record) => (
        <div className="text-sm text-gray-500">{record.specs || "-"}</div>
      ),
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
      key: "currentQuantity",
      title: "Số lượng hiện có",
      render: (_, record) => (
        <div className="text-sm font-medium text-gray-900 text-center">
          {record.quantity}
        </div>
      ),
      sortable: false,
      className: "text-center",
    },
    {
      key: "quantity",
      title: "Số lượng bàn giao",
      render: (_, record) => {
        const assetKey = getAssetKey(record);
        const isCCDC = record.type === AssetType.TOOLS_EQUIPMENT;
        const quantity = assetQuantities[assetKey] ?? (isCCDC ? 1 : 1);
        const maxQuantity = record.quantity;
        
        if (isCCDC) {
          return (
            <div className="flex justify-center">
              <input
                type="number"
                min="1"
                max={maxQuantity}
                step="1"
                className="border rounded px-2 py-1 text-sm w-20 text-center"
                placeholder="SL"
                value={quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (!isNaN(value) && value >= 1) {
                    if (value > maxQuantity) {
                      toast.error(`Số lượng không được vượt quá ${maxQuantity}`);
                      handleQuantityChange(record, maxQuantity);
                    } else {
                      handleQuantityChange(record, value);
                    }
                  } else if (e.target.value === '') {
                    handleQuantityChange(record, 1);
                  }
                }}
                disabled={isSubmitting || isUpdatingTransaction}
                onBlur={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (isNaN(value) || value < 1) {
                    handleQuantityChange(record, 1);
                  } else if (value > maxQuantity) {
                    toast.error(`Số lượng không được vượt quá ${maxQuantity}`);
                    handleQuantityChange(record, maxQuantity);
                  }
                }}
              />
            </div>
          );
        } else {
          return (
            <div className="text-sm font-medium text-gray-900 text-center">
              1
            </div>
          );
        }
      },
      sortable: false,
      className: "text-center",
    },
    {
      key: "currentLocation",
      title: "Vị trí hiện tại",
      render: (_, record) => (
        <div className="text-sm text-gray-900">
          {record.currentRoom ? (
            <div className="space-y-1">
              <div className="flex items-center ">
                <span className="font-medium">
                  {record.currentRoom.roomCode || record.currentRoom.name}
                </span>
              </div>
              {record.currentRoom.unit && (
                <div className="flex items-center text-red-500 text-xs">
                  <Building2 className="h-3 w-3 mr-1" />
                  <span>{record.currentRoom.unit.name}</span>
                </div>
              )}
            </div>
          ) : (
            <span className="text-gray-400 italic">Chưa phân bổ</span>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      key: "note",
      title: "Ghi chú",
      render: (_, record) => {
        const assetKey = getAssetKey(record);
        return (
          <input
            type="text"
            className="border rounded px-2 py-1 text-xs w-full"
            placeholder="Nhập ghi chú..."
            value={assetNotes[assetKey] || ""}
            onChange={(e) => handleNoteChange(record, e.target.value)}
            disabled={isSubmitting || isUpdatingTransaction}
          />
        );
      },
    },
    {
      key: "actions",
      title: "Thao tác",
      render: (_, record) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:bg-red-50"
          onClick={() => handleRemoveAsset(record)}
          disabled={isSubmitting || isUpdatingTransaction}
        >
            <Trash2 className="h-4 w-4 mr-1" />
        </Button>
      ),
      className: "text-center",
    },
  ];

  if (isFetchingTransaction) {
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

  if (fetchTransactionError || !currentTransactionDetail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <Package2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy giao dịch
            </h2>
            <p className="text-gray-600 mb-6">
              {fetchTransactionError || "Giao dịch không tồn tại hoặc đã bị xóa."}
            </p>
          </div>
          <Button onClick={() => router.push("/asset/transaction")} variant="outline" className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  if (selectedAssets.length === 0 && !isFetchingTransaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <Package2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Đang tải dữ liệu...
            </h2>
            <p className="text-gray-600 mb-6">Vui lòng đợi trong giây lát</p>
          </div>
          <Link href="/asset/transaction">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
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
                <button
                  onClick={() => router.push("/asset/transaction")}
                  className="hover:text-blue-600 text-lg sm:text-xl transition-colors font-semibold cursor-pointer"
                >
                  Bàn giao
                </button>
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 mx-1 sm:mx-2" />
                <span className="text-gray-900 font-semibold text-lg sm:text-xl">
                  Chỉnh sửa bàn giao
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => {
                  setIsAddAssetModalOpen(true);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-green-700 text-white"
                disabled={isSubmitting || isUpdatingTransaction}
              >
                Thêm tài sản
              </Button>
              <Button
                onClick={handleCancelEdit}
                variant="outline"
                disabled={isSubmitting || isUpdatingTransaction}
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={handleSubmitEdit}
                disabled={isSubmitting || isUpdatingTransaction || !selectedUnitId}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting || isUpdatingTransaction ? (
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-300 mb-6 ">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hasGlobalAccess && (
                <CardSelect
                  label="Cơ sở"
                  icon={<></>}
                  value={selectedCampusId}
                  onChange={setSelectedCampusId}
                  options={[
                    { value: "", label: "Chọn cơ sở" },
                    ...campuses.map((campus) => ({
                      value: campus.id,
                      label: campus.name,
                    })),
                  ]}
                  placeholder="Chọn cơ sở"
                  disabled={isSubmitting || isUpdatingTransaction}
                  required
                  className="text-base"
                />
              )}

              {(hasChildUnitsAccess || hasGlobalAccess || hasUnitAccess || hasSelfAccess) && (
                <CardSelect
                  label="Đơn vị tiếp nhận"
                  icon={<></>}
                  value={selectedUnitId}
                  onChange={setSelectedUnitId}
                  options={[
                    { value: "", label: "Chọn đơn vị tiếp nhận" },
                    ...(units?.map((unit) => ({
                      value: unit.id,
                      label: unit.name,
                    })) || []),
                  ]}
                  placeholder="Chọn đơn vị tiếp nhận"
                  disabled={isSubmitting || isUpdatingTransaction || (hasGlobalAccess && !selectedCampusId)}
                  required
                  className="text-base"
                />
              )}
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú cho yêu cầu bàn giao
              </label>
              <Textarea
                placeholder="Nhập ghi chú cho yêu cầu bàn giao (tùy chọn)..."
                value={transactionNote}
                onChange={(e) => setTransactionNote(e.target.value)}
                disabled={isSubmitting || isUpdatingTransaction}
                className="w-full min-h-[100px]"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày bàn giao
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  disabled={isSubmitting || isUpdatingTransaction}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
        <Table<Asset>
          title="Tài sản đã chọn để bàn giao"
          columns={columns}
          data={selectedAssets}
          loading={false}
          emptyText="Không có tài sản nào được chọn"
          emptyIcon={
            <Package2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          }
        />

      <AssetBookSelectionModal
        isOpen={isAddAssetModalOpen}
        onClose={() => {
          setIsAddAssetModalOpen(false);
        }}
        onConfirm={handleAddAssetsFromModal}
        title="Chọn tài sản từ sổ tài sản để bàn giao"
        excludeAssetIds={selectedAssets.map(asset => getAssetKey(asset))}
        initialFilters={modalInitialFilters}
      />
      </div>
    </div>
  );
}

