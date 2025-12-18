"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Asset,
  AssetType,
  Room,
  Unit,
  AssetStatus,
  AssetBookItemStatus,
  AccessScopeType,
} from "@/types/asset";
import {
  RefreshCw,
  Download,
  ChevronDown,
  Check,
  ArrowRightLeft,
  AlertCircle,
  X,
  MoreVertical,
  Move,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableColumn } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { RootState } from "@/lib/store";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useAppDispatch } from "@/lib/store/hooks";
import {
  filterAssetBook,
  AssetBookFilterRequest,
  exportAssetBookToExcel,
} from "@/lib/store/slices/assetBookSlice";
import { getUnitCampus } from "@/lib/store/slices/unitSlice";
import { fetchRoomsByUnitId } from "@/lib/store/slices/roomSlice";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PermissionConstants } from "@/lib/constants/permissions";
import { proposeAssetLiquidation } from "@/lib/store/slices/assetSlice";
import {
  setSelectedAssetsForHandover,
  setHandoverContext,
} from "@/lib/store/slices/transactionSlice";
import {
  setSelectedAssetsForMove,
  setMoveContext,
} from "@/lib/store/slices/moveSlice";

const getAssetBookItemStatusBadge = (status: AssetBookItemStatus) => {
  const statusConfig: Partial<
    Record<AssetBookItemStatus, { label: string; className: string }>
  > = {
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

  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800 border border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
};

const canSelectForHandover = (status: AssetBookItemStatus): boolean => {
  return ![
    AssetBookItemStatus.TRANSFERRED,
    AssetBookItemStatus.LIQUIDATED,
  ].includes(status);
};

const canSelectForMove = (status: AssetBookItemStatus): boolean => {
  return ![
    AssetBookItemStatus.TRANSFERRED,
    AssetBookItemStatus.LIQUIDATED,
  ].includes(status);
};

const canProposeLiquidation = (
  bookItemStatus: AssetBookItemStatus,
  assetStatus?: AssetStatus
): boolean => {
  const eligibleInBook = ![
    AssetBookItemStatus.TRANSFERRED,
    AssetBookItemStatus.LIQUIDATED,
  ].includes(bookItemStatus);
  return eligibleInBook;
};

const assetTypeOptions = [
  { value: "", label: "Chọn loại sổ" },
  { value: "FIXED_ASSET", label: "Tài sản cố định" },
  { value: "TOOLS_EQUIPMENT", label: "Công cụ dụng cụ" },
];

const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear + 1; i >= currentYear - 3; i--) {
    years.push({ value: i.toString(), label: i.toString() });
  }
  return years;
};

const getStatusOptions = () => {
  return [
    { value: "", label: "Tất cả trạng thái" },
    { value: AssetBookItemStatus.IN_USE, label: "Đang sử dụng" },
    { value: AssetBookItemStatus.TRANSFERRED, label: "Đã bàn giao" },
    { value: AssetBookItemStatus.LIQUIDATED, label: "Đã thanh lý" },
    { value: AssetBookItemStatus.PROPOSED_LIQUIDATION, label: "Đề xuất thanh lý" },
  ];
};

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
      <label
        className={`block font-medium text-gray-700 mb-2 ${
          className.includes("text-lg")
            ? "text-base"
            : className.includes("text-base")
            ? "text-sm"
            : "text-xs"
        }`}
      >
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
            w-full ${
              className.includes("text-lg")
                ? "min-h-[3.5rem] text-lg"
                : className.includes("text-base")
                ? "min-h-[2.75rem] text-base"
                : "min-h-[2.5rem] text-sm"
            } pl-3 pr-10 border border-gray-200 rounded-lg 
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

export default function AssetBookPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { hasRole, hasAnyPermission, user } = useAuth();

  const accessScopeTypes = user?.accessScopeTypes || [];
  const hasGlobalAccess = accessScopeTypes.includes(AccessScopeType.GLOBAL);
  const hasChildUnitsAccess = accessScopeTypes.includes(
    AccessScopeType.CHILD_UNITS
  );
  const hasUnitAccess = accessScopeTypes.includes(AccessScopeType.UNIT);
  const hasSelfAccess = accessScopeTypes.includes(AccessScopeType.SELF);

  // Permissions check
  const canProposeTransaction = hasAnyPermission([
    PermissionConstants.PERM_PROPOSE_TRANSACTION,
  ]);
  const canProposeMovement = hasAnyPermission([
    PermissionConstants.PERM_PROPOSE_MOVEMENT,
  ]);
  const canProposeLiquidationPerm = hasAnyPermission([
    PermissionConstants.PERM_PROPOSED_LIQUIDATION,
  ]);

  const loadFiltersFromStorage = () => {
    try {
      const stored = localStorage.getItem("assetBookFilters");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      return null;
    }
    return null;
  };

  const storedFilters = loadFiltersFromStorage();

  const [searchTerm, setSearchTerm] = useState(storedFilters?.searchTerm || "");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(
    storedFilters?.searchTerm || ""
  );
  const [selectedCampusId, setSelectedCampusId] = useState(
    storedFilters?.selectedCampusId || ""
  );
  const [units, setUnits] = useState<Unit[]>();
  const [selectedUnitId, setSelectedUnitId] = useState(
    storedFilters?.selectedUnitId || ""
  );
  const [rooms, setRooms] = useState<Room[]>();
  const [selectedYear, setSelectedYear] = useState(
    storedFilters?.selectedYear || new Date().getFullYear().toString()
  );
  const [selectedRoomId, setSelectedRoomId] = useState(
    storedFilters?.selectedRoomId || ""
  );
  const [selectedAssetType, setSelectedAssetType] = useState(
    storedFilters?.selectedAssetType || "FIXED_ASSET"
  );
  const [selectedStatus, setSelectedStatus] = useState(
    storedFilters?.selectedStatus || ""
  );

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  const [isMoveMode, setIsMoveMode] = useState(false);
  const [selectedAssetsForMoveLocal, setSelectedAssetsForMoveLocal] = useState<
    string[]
  >([]);

  const [isLiquidationMode, setIsLiquidationMode] = useState(false);
  const [
    selectedAssetsForLiquidationLocal,
    setSelectedAssetsForLiquidationLocal,
  ] = useState<string[]>([]);

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const {
    currentFilter,
    filteredAssetBooks,
    loading,
    error,
    isExporting,
    exportError,
  } = useSelector((state: RootState) => state.assetBook);
  const { campuses } = useSelector((state: RootState) => state.unit);
  const { loading: roomsLoading } = useSelector(
    (state: RootState) => state.room
  );

  // Debounce search term để tránh gọi API quá nhiều khi người dùng đang gõ
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Đợi 500ms sau khi người dùng ngừng gõ

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  useEffect(() => {
    const filtersToSave = {
      searchTerm: debouncedSearchTerm,
      selectedCampusId,
      selectedUnitId,
      selectedYear,
      selectedRoomId,
      selectedAssetType,
      selectedStatus,
    };

    try {
      localStorage.setItem("assetBookFilters", JSON.stringify(filtersToSave));
    } catch (error) {
      console.error("Error saving filters to localStorage:", error);
    }
  }, [
    debouncedSearchTerm,
    selectedCampusId,
    selectedUnitId,
    selectedYear,
    selectedRoomId,
    selectedAssetType,
    selectedStatus,
  ]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const campusesResult = await dispatch(getUnitCampus()).unwrap();
        if (campusesResult && user) {
          if (hasChildUnitsAccess) {
            // Child units access: unitId chính là campus ID
            const userCampus = campusesResult.find(
              (campus: Unit) => campus.id === user?.unitId
            );
            if (userCampus) {
              const childUnits = userCampus.childUnits ?? [];
              setUnits(childUnits);

              if (!storedFilters?.selectedCampusId) {
                setSelectedCampusId(userCampus.id);
              }
            } else {
              setUnits([]);
            }
          } else if (hasUnitAccess || hasSelfAccess) {
            if (!storedFilters?.selectedUnitId) {
              setSelectedUnitId(user.unitId);
            }
          }
        }
      } catch (e: any) {
        toast.error(e.message || "Có lỗi xảy ra khi tải dữ liệu.");
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const hasRequiredFilters = () => {
      if (!user) return false;

      const hasUnitInfo =
        (hasGlobalAccess && selectedCampusId && selectedUnitId) ||
        (hasChildUnitsAccess && selectedUnitId) ||
        ((hasUnitAccess || hasSelfAccess) && user.unitId);

      if (!selectedYear) return false;
      if (!selectedAssetType) return false;

      return hasUnitInfo;
    };

    if (hasRequiredFilters()) {
      handleFilterChange({
        ...currentFilter,
        search: debouncedSearchTerm || undefined,
        campusId: selectedCampusId || undefined,
        unitId:
          selectedUnitId ||
          ((hasUnitAccess || hasSelfAccess) && user ? user.unitId : undefined),
        year: selectedYear ? parseInt(selectedYear) : undefined,
        roomId: selectedRoomId || undefined,
        assetType: (selectedAssetType as AssetType) || undefined,
        status: selectedStatus
          ? (selectedStatus as AssetBookItemStatus)
          : undefined,
      });
    }
  }, [
    debouncedSearchTerm,
    selectedCampusId,
    selectedUnitId,
    selectedYear,
    selectedRoomId,
    selectedAssetType,
    selectedStatus,
    user?.unitId,
    hasGlobalAccess,
    hasChildUnitsAccess,
    hasUnitAccess,
    hasSelfAccess,
  ]);

  const handleFilterChange = (filterRequest: AssetBookFilterRequest) => {
    dispatch(filterAssetBook(filterRequest));
  };

  const handleExport = async () => {
    try {
      if (!selectedAssetType) {
        toast.error("Vui lòng chọn loại tài sản để xuất sổ!");
        return;
      }

      if (!selectedYear) {
        toast.error("Vui lòng chọn năm để xuất sổ!");
        return;
      }

      let exportUnitId: string | undefined = selectedUnitId;

      if (!exportUnitId && (hasUnitAccess || hasSelfAccess) && user?.unitId) {
        exportUnitId = user.unitId;
      }

      if (!exportUnitId) {
        toast.error("Vui lòng chọn đơn vị để xuất sổ!");
        return;
      }

      toast.loading("Đang xuất sổ tài sản...");

      await dispatch(
        exportAssetBookToExcel({
          type: selectedAssetType as AssetType,
          unitId: exportUnitId,
          year: parseInt(selectedYear),
        })
      ).unwrap();

      toast.dismiss();
      toast.success("Xuất sổ tài sản thành công!");
    } catch (error: any) {
      toast.dismiss();
      toast.error(error?.message || "Có lỗi xảy ra khi xuất sổ tài sản!");
      console.error("Export error:", error);
    }
  };

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedAssets([]);
    }
  };

  const handleToggleMoveMode = () => {
    setIsMoveMode(!isMoveMode);
    if (isMoveMode) {
      setSelectedAssetsForMoveLocal([]);
    }
  };

  const handleToggleLiquidationMode = () => {
    setIsLiquidationMode(!isLiquidationMode);
    if (isLiquidationMode) {
      setSelectedAssetsForLiquidationLocal([]);
    }
  };

  const handleSelectionChange = (
    selectedRowKeys: string[],
    selectedRows: Asset[]
  ) => {
    const assetKeys = selectedRows.map(asset => asset.bookItemId || asset.id);
    setSelectedAssets(assetKeys);
  };

  const handleMoveSelectionChange = (
    selectedRowKeys: string[],
    selectedRows: Asset[]
  ) => {
    const assetKeys = selectedRows.map(asset => asset.bookItemId || asset.id);
    setSelectedAssetsForMoveLocal(assetKeys);
  };

  const handleLiquidationSelectionChange = (
    selectedRowKeys: string[],
    selectedRows: Asset[]
  ) => {
    // Use bookItemId || id to handle duplicate asset codes correctly
    const assetKeys = selectedRows.map(asset => asset.bookItemId || asset.id);
    setSelectedAssetsForLiquidationLocal(assetKeys);
  };

  const deduplicatedAssets = React.useMemo(() => {
    const seen = new Set<string>();
    return filteredAssetBooks.data.filter((asset) => {
      const uniqueKey = asset.bookItemId || asset.id;
      if (seen.has(uniqueKey)) {
        return false;
      }
      seen.add(uniqueKey);
      return true;
    });
  }, [filteredAssetBooks.data]);

  const handleBulkHandover = () => {
    if (selectedAssets.length === 0) {
      alert("Vui lòng chọn ít nhất một tài sản để bàn giao!");
      return;
    }

    const selectedAssetObjects = deduplicatedAssets.filter((asset) => {
      const assetKey = asset.bookItemId || asset.id;
      return selectedAssets.includes(assetKey);
    });

    let sourceUnitId: string | undefined = selectedUnitId || undefined;

    if (!sourceUnitId && (hasUnitAccess || hasSelfAccess) && user?.unitId) {
      sourceUnitId = user.unitId;
    }

    if (!sourceUnitId && selectedAssetObjects.length > 0) {
      const firstAsset = selectedAssetObjects[0];
      sourceUnitId = firstAsset.currentRoom?.unit?.id;
    }

    const handoverContext = {
      sourceCampusId: selectedCampusId || undefined,
      sourceUnitId: sourceUnitId || undefined,
      sourceRoomId: selectedRoomId || undefined,
      sourceCampus: selectedCampusId
        ? campuses.find((c) => c.id === selectedCampusId)
        : undefined,
      sourceUnit: sourceUnitId
        ? units?.find((u) => u.id === sourceUnitId) ||
          campuses
            .flatMap((c) => c.childUnits || [])
            .find((u) => u.id === sourceUnitId)
        : undefined,
    };

    try {
      const handoverDraft = {
        selectedIds: selectedAssetObjects.map((asset) => asset.id),
        assets: selectedAssetObjects,
        handoverContext: handoverContext,
        filterContext: {
          selectedCampusId: selectedCampusId || undefined,
          selectedUnitId:
            selectedUnitId ||
            ((hasUnitAccess || hasSelfAccess) && user?.unitId
              ? user.unitId
              : undefined),
          selectedYear: selectedYear || undefined,
          selectedRoomId: selectedRoomId || undefined,
          selectedAssetType: selectedAssetType || undefined,
          campusName: selectedCampusId
            ? campuses.find((c) => c.id === selectedCampusId)?.name
            : undefined,
          unitName: selectedUnitId
            ? units?.find((u) => u.id === selectedUnitId)?.name ||
              campuses
                .flatMap((c) => c.childUnits || [])
                .find((u) => u.id === selectedUnitId)?.name
            : undefined,
          roomName: selectedRoomId
            ? rooms?.find((r) => r.id === selectedRoomId)?.name
            : undefined,
        },
        status: "DRAFT",
        timestamp: new Date().toISOString(),
      };

      sessionStorage.setItem("handoverDraft", JSON.stringify(handoverDraft));
    } catch (error) {
      console.error("Error saving handover draft to sessionStorage:", error);
      toast.error("Có lỗi khi lưu dữ liệu. Vui lòng thử lại.");
      return;
    }

    dispatch(setSelectedAssetsForHandover(selectedAssetObjects));

    dispatch(setHandoverContext(handoverContext));

    toast.success(`Đã chọn ${selectedAssetObjects.length} tài sản để bàn giao`);

    setIsSelectionMode(false);
    setSelectedAssets([]);

    setTimeout(() => {
      router.push("/asset/transaction/create");
    }, 100);
  };

  const handleBulkMove = () => {
    if (selectedAssetsForMoveLocal.length === 0) {
      alert("Vui lòng chọn ít nhất một tài sản để di chuyển!");
      return;
    }

    const selectedAssetObjects = deduplicatedAssets.filter((asset) => {
      const assetKey = asset.bookItemId || asset.id;
      return selectedAssetsForMoveLocal.includes(assetKey);
    });

    const moveContext = {
      sourceRoomId: selectedRoomId || undefined,
      sourceRoom: selectedRoomId
        ? rooms?.find((r) => r.id === selectedRoomId)
        : undefined,
    };

    try {
      const moveDraft = {
        selectedIds: selectedAssetObjects.map((asset) => asset.id),
        assets: selectedAssetObjects,
        moveContext: moveContext,
        filterContext: {
          selectedCampusId: selectedCampusId || undefined,
          selectedUnitId:
            selectedUnitId ||
            ((hasUnitAccess || hasSelfAccess) && user?.unitId
              ? user.unitId
              : undefined),
          selectedYear: selectedYear || undefined,
          selectedRoomId: selectedRoomId || undefined,
          selectedAssetType: selectedAssetType || undefined,
          campusName: selectedCampusId
            ? campuses.find((c) => c.id === selectedCampusId)?.name
            : undefined,
          unitName: selectedUnitId
            ? units?.find((u) => u.id === selectedUnitId)?.name ||
              campuses
                .flatMap((c) => c.childUnits || [])
                .find((u) => u.id === selectedUnitId)?.name
            : undefined,
          roomName: selectedRoomId
            ? rooms?.find((r) => r.id === selectedRoomId)?.name
            : undefined,
        },
        status: "DRAFT",
        timestamp: new Date().toISOString(),
      };

      sessionStorage.setItem("moveDraft", JSON.stringify(moveDraft));
    } catch (error) {
      toast.error("Có lỗi khi lưu dữ liệu. Vui lòng thử lại.");
      return;
    }

    dispatch(setSelectedAssetsForMove(selectedAssetObjects));

    dispatch(setMoveContext(moveContext));

    toast.success(
      `Đã chọn ${selectedAssetObjects.length} tài sản để di chuyển`
    );

    setIsMoveMode(false);
    setSelectedAssetsForMoveLocal([]);

    setTimeout(() => {
      router.push("/asset/move/create");
    }, 100);
  };

  const handleBulkLiquidation = () => {
    if (selectedAssetsForLiquidationLocal.length === 0) {
      toast.error("Vui lòng chọn ít nhất một tài sản để thanh lý!");
      return;
    }

    const selectedAssetObjects = deduplicatedAssets.filter((asset) => {
      const assetKey = asset.bookItemId || asset.id;
      return selectedAssetsForLiquidationLocal.includes(assetKey);
    });

    try {
      const liquidationDraft = {
        selectedIds: selectedAssetObjects.map((asset) => asset.id),
        assets: selectedAssetObjects,
        filterContext: {
          selectedCampusId: selectedCampusId || undefined,
          selectedUnitId:
            selectedUnitId ||
            ((hasUnitAccess || hasSelfAccess) && user?.unitId
              ? user.unitId
              : undefined),
          selectedYear: selectedYear || undefined,
          selectedRoomId: selectedRoomId || undefined,
          selectedAssetType: selectedAssetType || undefined,
          campusName: selectedCampusId
            ? campuses.find((c) => c.id === selectedCampusId)?.name
            : undefined,
          unitName: selectedUnitId
            ? units?.find((u) => u.id === selectedUnitId)?.name ||
              campuses
                .flatMap((c) => c.childUnits || [])
                .find((u) => u.id === selectedUnitId)?.name
            : undefined,
          roomName: selectedRoomId
            ? rooms?.find((r) => r.id === selectedRoomId)?.name
            : undefined,
        },
        status: "DRAFT",
        note: "",
        assetType: selectedAssetType || "FIXED_ASSET",
        timestamp: new Date().toISOString(),
      };

      // Lưu draft mới
      sessionStorage.setItem(
        "liquidationDraft",
        JSON.stringify(liquidationDraft)
      );

      // Lưu legacy key để backward compatibility
      sessionStorage.setItem(
        "selectedAssetsForLiquidation",
        JSON.stringify(selectedAssetObjects)
      );
    } catch (error) {
      console.error("Error saving to sessionStorage:", error);
      toast.error("Có lỗi khi lưu dữ liệu. Vui lòng thử lại.");
      return;
    }

    toast.success(`Đã chọn ${selectedAssetObjects.length} tài sản để thanh lý`);

    setIsLiquidationMode(false);
    setSelectedAssetsForLiquidationLocal([]);

    setTimeout(() => {
      router.push("/liquidation/create");
    }, 100);
  };

  useEffect(() => {
    if (selectedCampusId) {
      const campus = campuses.find((campus) => campus.id === selectedCampusId);
      const childUnits = campus?.childUnits ?? [];
      setUnits(childUnits);

      const stored = loadFiltersFromStorage();
      const isRestoringFromStorage =
        stored &&
        stored.selectedCampusId === selectedCampusId &&
        stored.selectedUnitId;

      if (!isRestoringFromStorage) {
        setSelectedUnitId("");
        setSelectedRoomId("");
        setRooms([]);
      }
    }
  }, [selectedCampusId, campuses]);

  useEffect(() => {
    const fetchRooms = async () => {
      if (selectedUnitId) {
        try {
          const res = await dispatch(
            fetchRoomsByUnitId(selectedUnitId)
          ).unwrap();
          setRooms(res);
          console.log("Rooms loaded for unit:", selectedUnitId, res.length);
        } catch (error) {
          console.error("Error fetching rooms:", error);
          setRooms([]);
        }
      } else {
        setRooms([]);
      }
    };
    fetchRooms();
  }, [dispatch, selectedUnitId]);

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
      key: "roomCode",
      title: "Mã phòng",
      render: (_, record) => (
        <div className="text-sm text-gray-900">
          {record.currentRoom
            ? `${record.currentRoom?.roomCode || ""}`
            : "Chưa phân bổ"}
        </div>
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
      key: "status",
      title: "Trạng thái trong sổ",
      render: (_, record) => (
        <div className="flex justify-center">
          {getAssetBookItemStatusBadge(
            record.bookItemStatus as AssetBookItemStatus
          )}
        </div>
      ),
      sortable: true,
      className: "text-center",
    },
    {
      key: "actions",
      title: "Thao tác",
      render: (_, asset) => {
        return (
          <div className="flex justify-start">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/asset/${asset.id}`;
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span>Xem chi tiết</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/asset/${asset.id}/edit`;
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span>Chỉnh sửa</span>
                </DropdownMenuItem>

                {((canSelectForHandover(
                  asset.bookItemStatus as AssetBookItemStatus
                ) &&
                  canProposeTransaction &&
                  !isMoveMode) ||
                (canSelectForMove(
                  asset.bookItemStatus as AssetBookItemStatus
                ) &&
                  canProposeMovement &&
                  !isSelectionMode) ||
                (canProposeLiquidation(
                  asset.bookItemStatus as AssetBookItemStatus,
                  asset.status as AssetStatus
                ) &&
                  canProposeLiquidationPerm &&
                  !isSelectionMode &&
                  !isMoveMode) ||
                (canProposeLiquidationPerm &&
                  canProposeLiquidation(
                    asset.bookItemStatus as AssetBookItemStatus,
                    asset.status as AssetStatus
                  ))) ? (
                  <DropdownMenuSeparator />
                ) : null}

                {canSelectForHandover(
                  asset.bookItemStatus as AssetBookItemStatus
                ) &&
                  canProposeTransaction &&
                  !isMoveMode && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        const assetKey = asset.bookItemId || asset.id;
                        if (isSelectionMode) {
                          if (!selectedAssets.includes(assetKey)) {
                            setSelectedAssets((prev) => [...prev, assetKey]);
                          }
                        } else {
                          setSelectedAssets([assetKey]);
                          setIsSelectionMode(true);
                        }
                      }}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <span>Bàn giao</span>
                    </DropdownMenuItem>
                  )}

                {canSelectForMove(
                  asset.bookItemStatus as AssetBookItemStatus
                ) &&
                  canProposeMovement &&
                  !isSelectionMode && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        const assetKey = asset.bookItemId || asset.id;
                        if (isMoveMode) {
                          if (!selectedAssetsForMoveLocal.includes(assetKey)) {
                            setSelectedAssetsForMoveLocal((prev) => [
                              ...prev,
                              assetKey,
                            ]);
                          }
                        } else {
                          setSelectedAssetsForMoveLocal([assetKey]);
                          setIsMoveMode(true);
                        }
                      }}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <span>Di chuyển</span>
                    </DropdownMenuItem>
                  )}

                {canProposeLiquidation(
                  asset.bookItemStatus as AssetBookItemStatus,
                  asset.status as AssetStatus
                ) &&
                  canProposeLiquidationPerm &&
                  !isSelectionMode &&
                  !isMoveMode && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        const assetKey = asset.bookItemId || asset.id;
                        if (isLiquidationMode) {
                          if (
                            !selectedAssetsForLiquidationLocal.includes(
                              assetKey
                            )
                          ) {
                            setSelectedAssetsForLiquidationLocal((prev) => [
                              ...prev,
                              assetKey,
                            ]);
                          }
                        } else {
                          setSelectedAssetsForLiquidationLocal([assetKey]);
                          setIsLiquidationMode(true);
                        }
                      }}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <span>Thanh lý</span>
                    </DropdownMenuItem>
                  )}

                {canProposeLiquidationPerm &&
                  canProposeLiquidation(
                    asset.bookItemStatus as AssetBookItemStatus,
                    asset.status as AssetStatus
                  ) && (
                    <DropdownMenuItem
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await dispatch(
                            proposeAssetLiquidation({
                              id: asset.id,
                              note: "Đề xuất thanh lý từ sổ tài sản",
                            })
                          ).unwrap();
                          handleFilterChange({
                            ...currentFilter,
                          });
                        } catch (err: any) {}
                      }}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <span>Đánh dấu thanh lý</span>
                    </DropdownMenuItem>
                  )}

                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <span>Xóa</span>
                  </DropdownMenuItem>
                </>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      className: "text-right",
    },
  ];

  return (
    <div className="p-4 sm:p-6 overflow-x-auto sm:overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center text-sm sm:text-base text-gray-600 mb-3">
            <button
              onClick={() => router.push("/asset/asset-book")}
              className="hover:text-blue-600 text-lg sm:text-xl transition-colors font-semibold cursor-pointer"
            >
              Tài sản
            </button>
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 mx-1 sm:mx-2" />
            <span className="text-gray-900 font-semibold text-lg sm:text-xl">
              Sổ tài sản
            </span>
          </div>
        </div>
        <div className="flex items-center flex-wrap gap-2 sm:gap-4 w-full sm:w-auto">
          {/* Nút bàn giao */}
          {canProposeTransaction && (
            <Button
              onClick={handleToggleSelectionMode}
              variant="outline"
              disabled={isMoveMode}
              className="border border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 transition-colors text-xs sm:text-sm px-3 sm:px-4 py-2"
            >
              {isSelectionMode ? "Hủy chọn" : "Bàn giao"}
            </Button>
          )}

          {/* Nút di chuyển */}
          {canProposeMovement && (
            <Button
              onClick={handleToggleMoveMode}
              variant="outline"
              disabled={isSelectionMode}
              className="border border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 transition-colors text-xs sm:text-sm px-3 sm:px-4 py-2"
            >
              {isMoveMode ? "Hủy di chuyển" : "Di chuyển"}
            </Button>
          )}

          {/* Nút thanh lý */}
          {canProposeLiquidationPerm && (
            <Button
              onClick={handleToggleLiquidationMode}
              variant="outline"
              disabled={isSelectionMode || isMoveMode}
              className="border border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 transition-colors text-xs sm:text-sm px-3 sm:px-4 py-2"
            >
              {isLiquidationMode ? "Hủy thanh lý" : "Thanh lý"}
            </Button>
          )}

          <Button
            onClick={handleExport}
            disabled={isExporting || !selectedAssetType || !selectedYear}
            variant="outline"
            className="min-w-[120px] sm:min-w-[150px] border border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 transition-colors text-xs sm:text-sm px-3 sm:px-4 py-2"
          >
            {isExporting ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isExporting ? "Đang xuất..." : "Xuất sổ tài sản"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-300 mb-6">
        {/* Filter Content */}
        <div className="p-6 relative">
          {/* Main Filters Row - Always visible */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 mb-4">
            {/* Campus Filter - for Global access only */}
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
                disabled={loading}
                required
                className="text-base"
              />
            )}

            {/* Unit Filter */}
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
                disabled={!selectedCampusId}
                required
                className="text-base"
              />
            )}

            {/* Year Filter */}
            <CardSelect
              label="Năm"
              icon={<></>}
              value={selectedYear}
              onChange={setSelectedYear}
              options={getYearOptions()}
              placeholder="Chọn năm"
              required
              className="text-base"
            />

            {/* Asset Type Filter */}
            <CardSelect
              label="Loại tài sản"
              icon={<></>}
              value={selectedAssetType}
              onChange={setSelectedAssetType}
              options={assetTypeOptions}
              placeholder="Chọn loại tài sản"
              required
              className="text-base"
            />
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {showAdvancedFilters ? "Ẩn bộ lọc" : "Hiển thị bộ lọc"}
              <ChevronDown
                className={`h-4 w-4 ml-2 transition-transform duration-200 ${
                  showAdvancedFilters ? "rotate-180" : ""
                }`}
              />
            </Button>
          </div>

          {/* Advanced Filters - Collapsible */}
          {showAdvancedFilters && (
            <div className="border-t border-gray-100 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative group lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tìm kiếm
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="Nhập tên, mã tài sản..."
                      className="min-h-[2.75rem] text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <CardSelect
                  label="Trạng thái"
                  icon={<></>}
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  options={getStatusOptions()}
                  placeholder="Tất cả trạng thái"
                  className="text-base"
                />

                {/* Room Filter */}
                {selectedUnitId && (
                  <CardSelect
                    label="Phòng"
                    icon={<></>}
                    value={selectedRoomId}
                    onChange={setSelectedRoomId}
                    options={[
                      { value: "", label: "Tất cả phòng" },
                      ...(rooms?.map((room) => ({
                        value: room.id,
                        label: `${room.roomCode}`,
                      })) || []),
                    ]}
                    placeholder="Tất cả phòng"
                    loading={roomsLoading}
                    className="text-base"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Move Mode Info */}
      {isMoveMode && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Move className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">
                Chọn tài sản để di chuyển
              </span>
              {selectedAssetsForMoveLocal.length > 0 && (
                <span className="text-sm text-green-700">
                  - Đã chọn {selectedAssetsForMoveLocal.length} tài sản
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {selectedAssetsForMoveLocal.length > 0 && (
                <Button
                  onClick={handleBulkMove}
                  size="sm"
                  className="flex items-center bg-green-600 hover:bg-green-700 text-white"
                >
                  Xác nhận di chuyển
                </Button>
              )}
              <Button
                onClick={handleToggleMoveMode}
                size="sm"
                variant="outline"
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-1" />
                Hủy
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Selection Mode Info */}
      {isSelectionMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Chọn tài sản để bàn giao
              </span>
              {selectedAssets.length > 0 && (
                <span className="text-sm text-blue-700">
                  - Đã chọn {selectedAssets.length} tài sản
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {selectedAssets.length > 0 && (
                <Button
                  onClick={handleBulkHandover}
                  size="sm"
                  className="flex items-center bg-green-600 hover:bg-green-700 text-white"
                >
                  Xác nhận bàn giao
                </Button>
              )}
              <Button
                onClick={handleToggleSelectionMode}
                size="sm"
                variant="outline"
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-1" />
                Hủy
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Liquidation Mode Info */}
      {isLiquidationMode && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-red-900">
                Chọn tài sản để thanh lý
              </span>
              {selectedAssetsForLiquidationLocal.length > 0 && (
                <span className="text-sm text-red-700">
                  - Đã chọn {selectedAssetsForLiquidationLocal.length} tài sản
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {selectedAssetsForLiquidationLocal.length > 0 && (
                <Button
                  onClick={handleBulkLiquidation}
                  size="sm"
                  className="flex items-center bg-red-600 hover:bg-red-700 text-white"
                >
                  Xác nhận thanh lý
                </Button>
              )}
              <Button
                onClick={handleToggleLiquidationMode}
                size="sm"
                variant="outline"
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-1" />
                Hủy
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assets Table */}
      <Table<Asset>
        columns={columns}
        data={deduplicatedAssets}
        loading={loading}
        emptyText="Không tìm thấy tài sản"
        emptyIcon={
          <div className="h-12 w-12 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <span className="text-gray-400 font-bold text-xl">?</span>
          </div>
        }
        multiSort={true}
        sortConfigs={currentFilter.sorting}
        onSortChange={(sortConfigs) => {
          handleFilterChange({
            ...currentFilter,
            sorting: sortConfigs,
          });
        }}
        rowKey={(record) => record.bookItemId || record.id}
        rowSelection={
          isSelectionMode
            ? {
                selectedRowKeys: selectedAssets,
                onChange: handleSelectionChange,
                getCheckboxProps: (record) => ({
                  disabled: !canSelectForHandover(
                    record.bookItemStatus as AssetBookItemStatus
                  ),
                }),
              }
            : isMoveMode
            ? {
                selectedRowKeys: selectedAssetsForMoveLocal,
                onChange: handleMoveSelectionChange,
                getCheckboxProps: (record) => ({
                  disabled: !canSelectForMove(
                    record.bookItemStatus as AssetBookItemStatus
                  ),
                }),
              }
            : isLiquidationMode
            ? {
                selectedRowKeys: selectedAssetsForLiquidationLocal,
                onChange: handleLiquidationSelectionChange,
                getCheckboxProps: (record) => ({
                  disabled: !canProposeLiquidation(
                    record.bookItemStatus as AssetBookItemStatus,
                    record.status as AssetStatus
                  ),
                }),
              }
            : undefined
        }
        pagination={{
          current: filteredAssetBooks?.pagination.page || 1,
          pageSize: filteredAssetBooks?.pagination.limit || 10,
          total: filteredAssetBooks?.pagination.total || 0,
          onChange: (page, pageSize) => {
            handleFilterChange({
              ...currentFilter,
              pagination: {
                currentPage: page,
                itemsPerPage: pageSize,
              },
            });
          },
          showSizeChanger: true,
          serverSide: true,
        }}
      />
    </div>
  );
}
