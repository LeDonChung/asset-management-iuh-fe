"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useAppDispatch } from "@/lib/store/hooks";
import {
  getMovementById,
  updateMovement,
  MovementResponseDto,
  MovementItemResponseDto,
} from "@/lib/store/slices/moveSlice";
import { getUnitCampus } from "@/lib/store/slices/unitSlice";
import { fetchRoomsByUnitId } from "@/lib/store/slices/roomSlice";
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
  CheckCircle,
  XCircle,
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
  Room,
  AccessScopeType,
  AssetType,
} from "@/types/asset";
import { MoveStatus } from "@/lib/store/slices/moveSlice";
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

// Convert MovementItemResponseDto to Asset format
const convertMovementItemToAsset = (item: MovementItemResponseDto): Asset => {
  const fullAsset = item.asset as any;
  
  return {
    id: item.assetId,
    bookItemId: fullAsset?.bookItemId || (item as any).bookItemId || undefined,
    ktCode: fullAsset?.ktCode || "",
    fixedCode: fullAsset?.fixedCode || "",
    name: fullAsset?.name || "",
    specs: fullAsset?.specs || "",
    entrydate: fullAsset?.entrydate || "",
    currentRoomId: item.fromRoomId,
    locationInRoom: fullAsset?.locationInRoom || "",
    unit: fullAsset?.unit || "",
    quantity: item.quantity || fullAsset?.quantity || 1,
    origin: fullAsset?.origin || "",
    purchasePackage: fullAsset?.purchasePackage || 0,
    type: fullAsset?.type as any || "FIXED_ASSET" as any,
    isLocked: fullAsset?.isLocked || false,
    isHandOver: fullAsset?.isHandOver || false,
    categoryId: fullAsset?.category?.id || "",
    status: fullAsset?.status as any || "IN_USE" as any,
    createdBy: fullAsset?.createdBy || "",
    createdAt: fullAsset?.createdAt || "",
    updatedAt: fullAsset?.updatedAt || "",
    deletedAt: fullAsset?.deletedAt || undefined,
    currentRoom: item.fromRoom ? {
      id: item.fromRoom.id,
      name: item.fromRoom.name,
      roomCode: item.fromRoom.code,
      building: (item.fromRoom as any).building || "",
      floor: (item.fromRoom as any).floor || "",
      roomNumber: (item.fromRoom as any).roomNumber || "",
      adjacentRooms: (item.fromRoom as any).adjacentRooms || [],
      status: (item.fromRoom as any).status || "ACTIVE" as any,
      unitId: item.fromRoom.unit?.id || "",
      createdBy: (item.fromRoom as any).createdBy || "",
      createdAt: (item.fromRoom as any).createdAt || "",
      updatedAt: (item.fromRoom as any).updatedAt || "",
      deletedAt: (item.fromRoom as any).deletedAt || undefined,
      unit: item.fromRoom.unit ? {
        id: item.fromRoom.unit.id,
        name: item.fromRoom.unit.name,
        unitCode: item.fromRoom.unit.unitCode,
        phone: null,
        email: null,
        type: "USER_DEPT" as any,
        representativeId: null,
        parentUnitId: null,
        status: "ACTIVE" as any,
        createdAt: "",
        updatedAt: "",
        deletedAt: null,
      } : undefined,
    } : undefined,
    category: fullAsset?.category ? {
      id: fullAsset.category.id,
      name: fullAsset.category.name,
      description: fullAsset.category.description || "",
      createdBy: "",
      createdAt: "",
      updatedAt: "",
      deletedAt: undefined,
    } : undefined,
    rfidTag: fullAsset?.rfidTag,
    transactionItems: fullAsset?.transactionItems,
  };
};

export default function EditMovementPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const movementId = params.id as string;

  const accessScopeTypes = user?.accessScopeTypes || [];
  const hasGlobalAccess = accessScopeTypes.includes(AccessScopeType.GLOBAL);
  const hasChildUnitsAccess = accessScopeTypes.includes(AccessScopeType.CHILD_UNITS);
  const hasUnitAccess = accessScopeTypes.includes(AccessScopeType.UNIT);
  const hasSelfAccess = accessScopeTypes.includes(AccessScopeType.SELF);

  const {
    currentMovementDetail,
    isFetchingMovement,
    isUpdatingMovement,
    fetchMovementError,
  } = useSelector((state: RootState) => state.move);
  
  const { campuses } = useSelector((state: RootState) => state.unit);

  const [selectedCampusId, setSelectedCampusId] = useState("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [movementNote, setMovementNote] = useState("");
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

  const getAssetKey = (asset: Asset): string => {
    return asset.bookItemId || asset.id;
  };

  useEffect(() => {
    if (movementId) {
      dispatch(getMovementById(movementId));
    }
  }, [movementId, dispatch]);

  useEffect(() => {
    if (currentMovementDetail) {
      if (
        currentMovementDetail.status !== MoveStatus.DRAFT &&
        currentMovementDetail.status !== MoveStatus.REJECTED
      ) {
        toast.error("Chỉ có thể chỉnh sửa yêu cầu di chuyển ở trạng thái Nháp hoặc Từ chối");
        router.push(`/asset/move/${movementId}`);
        return;
      }

      // Convert movement items to assets
      const assets = currentMovementDetail.items.map(convertMovementItemToAsset);
      setSelectedAssets(assets);

      const notes: Record<string, string> = {};
      const quantities: Record<string, number> = {};
      currentMovementDetail.items.forEach((item) => {
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

      // Set movement note
      setMovementNote(currentMovementDetail.requestNote || "");

      // Set date
      if (currentMovementDetail.createdAt) {
        const date = new Date(currentMovementDetail.createdAt);
        setSelectedDate(date.toISOString().split('T')[0]);
      }

      // Set unit from first asset's current room or from movement items
      let unitId = "";
      if (assets.length > 0 && assets[0].currentRoom?.unit?.id) {
        unitId = assets[0].currentRoom.unit.id;
      } else if (currentMovementDetail.items.length > 0) {
        // Try to get unit from fromRoom or toRoom
        const firstItem = currentMovementDetail.items[0];
        if (firstItem.fromRoom?.unit?.id) {
          unitId = firstItem.fromRoom.unit.id;
        } else if (firstItem.toRoom?.unit?.id) {
          unitId = firstItem.toRoom.unit.id;
        }
      }
      
      if (unitId) {
        setSelectedUnitId(unitId);
      }

      // Set destination room from toRoom of first item
      if (currentMovementDetail.items.length > 0) {
        const firstItem = currentMovementDetail.items[0];
        if (firstItem.toRoomId) {
          setSelectedRoomId(firstItem.toRoomId);
        }
      }
    }
  }, [currentMovementDetail, dispatch, router, movementId]);

  // Load campuses and units
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const campusesResult = await dispatch(getUnitCampus()).unwrap();
        if (campusesResult && user) {
          if (hasChildUnitsAccess) {
            const campusId = currentMovementDetail?.fromUnit?.id || user?.unitId;
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

            const unitId = user.unitId;

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
            // For global access, load all campuses
          }
        }
      } catch (e: any) {
        toast.error(e.message || "Có lỗi xảy ra khi tải dữ liệu.");
      }
    };
    if (currentMovementDetail) {
      loadInitialData();
    }
  }, [dispatch, hasGlobalAccess, hasChildUnitsAccess, hasUnitAccess, hasSelfAccess, user, currentMovementDetail]);

  useEffect(() => {
    if (selectedCampusId) {
      const campus = campuses.find((campus) => campus.id === selectedCampusId);
      setUnits(campus?.childUnits ?? []);
      // Don't reset selectedUnitId when editing
    }
  }, [selectedCampusId, campuses]);

  useEffect(() => {
    const fetchRooms = async () => {
      if (selectedUnitId) {
        try {
          console.log("Fetching rooms for unitId:", selectedUnitId);
          const res = await dispatch(
            fetchRoomsByUnitId(selectedUnitId)
          ).unwrap();
          console.log("Fetched rooms:", res);
          setRooms(res);
        } catch (error) {
          console.error("Error fetching rooms:", error);
          setRooms([]);
        }
      } else {
        console.log("No selectedUnitId, clearing rooms");
        setRooms([]);
      }
    };
    fetchRooms();
  }, [dispatch, selectedUnitId]);

  const handleCancelEdit = () => {
    router.push(`/asset/move/${movementId}`);
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
    
    toast.success(`Đã thêm ${newAssets.length} tài sản vào danh sách di chuyển`);
    
    setIsAddAssetModalOpen(false);
  };

  const modalInitialFilters = useMemo(() => {
    const sourceUnitId = currentMovementDetail?.fromUnit?.id || 
      (selectedAssets.length > 0 
        ? selectedAssets[0].currentRoom?.unit?.id 
        : undefined);
    
    return {
      unitId: sourceUnitId,
      year: new Date().getFullYear().toString(),
      assetType: "FIXED_ASSET",
    };
  }, [currentMovementDetail?.fromUnit?.id, selectedAssets]);

  const handleSubmitEdit = async () => {
    if (selectedAssets.length === 0) {
      toast.error("Vui lòng chọn ít nhất một tài sản!");
      return;
    }

    if (!selectedDate) {
      toast.error("Vui lòng chọn ngày tạo yêu cầu!");
      return;
    }

    setIsSubmitting(true);

    try {
      if (!selectedRoomId) {
        throw new Error("Vui lòng chọn phòng đích");
      }

      for (const asset of selectedAssets) {
        const assetKey = getAssetKey(asset);
        if (!asset.currentRoom?.id) {
          toast.error(`Tài sản "${asset.name}" (${asset.fixedCode}) chưa được phân bổ vào phòng. Vui lòng kiểm tra lại.`);
          setIsSubmitting(false);
          return;
        }
        if (asset.type === AssetType.TOOLS_EQUIPMENT) {
          const quantity = assetQuantities[assetKey];
          if (!quantity || quantity < 1) {
            toast.error(`Vui lòng nhập số lượng hợp lệ (>= 1) cho tài sản "${asset.name}"`);
            setIsSubmitting(false);
            return;
          }
          if (quantity > asset.quantity) {
            toast.error(`Số lượng di chuyển (${quantity}) không được vượt quá số lượng hiện có (${asset.quantity}) cho tài sản "${asset.name}"`);
            setIsSubmitting(false);
            return;
          }
        }
      }

      const movementItems = selectedAssets.map((asset) => {
        const assetKey = getAssetKey(asset);
        return {
          assetId: asset.id,
          quantity: asset.type === AssetType.TOOLS_EQUIPMENT 
            ? (assetQuantities[assetKey] || 1)
            : 1, // Tài sản cố định luôn = 1
          fromRoomId: asset.currentRoom!.id, // Already validated above
          toRoomId: selectedRoomId, // Set to the selected destination room
          note: assetNotes[assetKey] || `Di chuyển tài sản`,
        };
      });

      // Validate that all assets have fromRoomId
      for (const item of movementItems) {
        if (!item.fromRoomId) {
          throw new Error("Một số tài sản không có thông tin phòng hiện tại");
        }
        if (item.fromRoomId === item.toRoomId) {
          throw new Error("Phòng nguồn và phòng đích không thể giống nhau");
        }
      }

      const updateMovementDto = {
        requestNote: movementNote || `Di chuyển ${selectedAssets.length} tài sản`,
        items: movementItems,
      };

      const result = await dispatch(updateMovement({
        id: movementId,
        updateDto: updateMovementDto,
      })).unwrap();

      if (result && result.id) {
        toast.success("Cập nhật yêu cầu di chuyển thành công!");
        router.push(`/asset/move/${movementId}`);
      } else {
        throw new Error("Không nhận được phản hồi hợp lệ từ máy chủ");
      }
    } catch (error: any) {
      console.error("Error updating movement:", error);
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật yêu cầu di chuyển.");
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
      title: "Số lượng di chuyển",
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
                disabled={isSubmitting || isUpdatingMovement}
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
      title: "Vị trí",
      render: (_, record) => (
        <div className="text-sm text-gray-900">
          {record.currentRoom ? (
            <div className="space-y-1">
              <div className="flex items-center ">
                <span className="font-medium">
                  {record.currentRoom.roomCode || record.currentRoom.name}
                </span>
              </div>
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
            disabled={isSubmitting || isUpdatingMovement}
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
          disabled={isSubmitting || isUpdatingMovement}
        >
            <Trash2 className="h-4 w-4 mr-1" />
        </Button>
      ),
      className: "text-center",
    },
  ];

  if (isFetchingMovement) {
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

  if (fetchMovementError || !currentMovementDetail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <Package2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy yêu cầu di chuyển
            </h2>
            <p className="text-gray-600 mb-6">
              {fetchMovementError || "Yêu cầu di chuyển không tồn tại hoặc đã bị xóa."}
            </p>
          </div>
          <Button onClick={() => router.push("/asset/move")} variant="outline" className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  if (selectedAssets.length === 0 && !isFetchingMovement) {
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
          <Link href="/asset/move">
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
                  Tài sản
                </button>
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 mx-1 sm:mx-2" />
                <button
                  onClick={() => router.push("/asset/move")}
                  className="hover:text-blue-600 text-lg sm:text-xl transition-colors font-semibold cursor-pointer"
                >
                  Di chuyển
                </button>
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 mx-1 sm:mx-2" />
                <span className="text-gray-900 font-semibold text-lg sm:text-xl">
                  Chỉnh sửa di chuyển
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => {
                  setIsAddAssetModalOpen(true);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-green-700 text-white"
                disabled={isSubmitting || isUpdatingMovement}
              >
                Thêm tài sản
              </Button>
              <Button
                onClick={handleCancelEdit}
                variant="outline"
                disabled={isSubmitting || isUpdatingMovement}
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={handleSubmitEdit}
                disabled={isSubmitting || isUpdatingMovement}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting || isUpdatingMovement ? (
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  disabled={isSubmitting || isUpdatingMovement}
                  required
                  className="text-base"
                />
              )}

              {(hasChildUnitsAccess || hasGlobalAccess) && (
                <CardSelect
                  label="Đơn vị"
                  icon={<></>}
                  value={selectedUnitId}
                  onChange={setSelectedUnitId}
                  options={[
                    { value: "", label: "Chọn đơn vị" },
                    ...(units?.map((unit) => ({
                      value: unit.id,
                      label: unit.name,
                    })) || []),
                  ]}
                  placeholder="Chọn đơn vị"
                  disabled={isSubmitting || isUpdatingMovement || (hasGlobalAccess && !selectedCampusId)}
                  required
                  className="text-base"
                />
              )}

              <CardSelect
                label="Phòng đích"
                icon={<></>}
                value={selectedRoomId}
                onChange={setSelectedRoomId}
                options={[
                  { value: "", label: "Chọn phòng đích" },
                  ...(rooms?.map((room) => ({
                    value: room.id,
                    label: `${room.roomCode} - ${room.name}`,
                  })) || []),
                ]}
                placeholder="Chọn phòng đích"
                required
                className="text-base"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú cho yêu cầu di chuyển
              </label>
              <Textarea
                placeholder="Nhập ghi chú cho yêu cầu di chuyển (tùy chọn)..."
                value={movementNote}
                onChange={(e) => setMovementNote(e.target.value)}
                disabled={isSubmitting || isUpdatingMovement}
                className="w-full min-h-[100px]"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày di chuyển
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  disabled={isSubmitting || isUpdatingMovement}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hiển thị thông tin phê duyệt/từ chối nếu có */}
        {currentMovementDetail && (currentMovementDetail.approvalNote || currentMovementDetail.rejectionReason) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-300 mb-6">
            <div className="p-6">
              <div className="space-y-4">
                {currentMovementDetail.approvalNote && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Ghi chú phê duyệt
                    </div>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm">
                      {currentMovementDetail.approvalNote}
                    </div>
                  </div>
                )}

                {currentMovementDetail.rejectionReason && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <XCircle className="w-4 h-4 text-red-600" />
                      Lý do từ chối
                    </div>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm">
                      {currentMovementDetail.rejectionReason}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <Table<Asset>
          title="Tài sản đã chọn để di chuyển"
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
        title="Chọn tài sản từ sổ tài sản để di chuyển"
        excludeAssetIds={selectedAssets.map(asset => getAssetKey(asset))}
        initialFilters={modalInitialFilters}
      />
      </div>
    </div>
  );
}
