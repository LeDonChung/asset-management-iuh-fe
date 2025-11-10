"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Asset, AssetType, Room, Unit, AssetStatus, AssetBookItemStatus } from "@/types/asset";
import {
  Building,
  Eye,
  RefreshCw,
  Download,
  ChevronDown,
  Check,
  Edit2,
  ArrowRightLeft,
  AlertCircle,
  X,
  MoreVertical,
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
} from "@/lib/store/slices/assetBookSlice";
import { getUnitCampus } from "@/lib/store/slices/unitSlice";
import { fetchRoomsByUnitId } from "@/lib/store/slices/roomSlice";
import { useAuth } from "@/contexts/AuthContext";
import { RoleBase } from "@/lib/constants/role";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setSelectedAssetsForHandover, setHandoverContext } from "@/lib/store/slices/transactionSlice";

// Helper function to render asset book item status badge
const getAssetBookItemStatusBadge = (status: AssetBookItemStatus) => {
  const statusConfig = {
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

// Helper function to render asset status badge
const getAssetStatusBadge = (status: AssetStatus) => {
  const statusConfig = {
    [AssetStatus.IN_USE]: {
      label: "Đang sử dụng",
      className: "bg-green-100 text-green-800 border border-green-200",
    },
    [AssetStatus.TRANSFERRED]: {
      label: "Đã bàn giao",
      className: "bg-blue-100 text-blue-800 border border-blue-200",
    },
    [AssetStatus.DAMAGED]: {
      label: "Hư hỏng",
      className: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    },
    [AssetStatus.LOST]: {
      label: "Đã mất",
      className: "bg-red-100 text-red-800 border border-red-200",
    },
    [AssetStatus.PROPOSED_LIQUIDATION]: {
      label: "Đề xuất thanh lý",
      className: "bg-orange-100 text-orange-800 border border-orange-200",
    },
    [AssetStatus.LIQUIDATED]: {
      label: "Đã thanh lý",
      className: "bg-gray-100 text-gray-800 border border-gray-300",
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

// Asset type options for filter dropdown
const assetTypeOptions = [
  { value: "", label: "Chọn loại sổ" },
  { value: "FIXED_ASSET", label: "Tài sản cố định" },
  { value: "TOOLS_EQUIPMENT", label: "Công cụ dụng cụ" },
];

// Year options
const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= currentYear - 3; i--) {
    years.push({ value: i.toString(), label: i.toString() });
  }
  return years;
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

export default function AssetBookPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { hasRole, user } = useAuth();

  const isAdmin = hasRole([RoleBase.ADMIN]);
  const isAdminDept = hasRole([RoleBase.ADMIN_DEPT]);
  const isUserDept = hasRole([RoleBase.USER_DEPT]);

  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCampusId, setSelectedCampusId] = useState("");
  const [units, setUnits] = useState<Unit[]>();
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [rooms, setRooms] = useState<Room[]>();
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedAssetType, setSelectedAssetType] = useState("");

  // Selection mode states
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  
  // Advanced filter toggle
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Redux selectors
  const { currentFilter, filteredAssetBooks, loading, error } = useSelector(
    (state: RootState) => state.assetBook
  );
  const { campuses } = useSelector((state: RootState) => state.unit);
  const { loading: roomsLoading } = useSelector(
    (state: RootState) => state.room
  );

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const campusesResult = await dispatch(getUnitCampus()).unwrap();
        if (campusesResult) {
          if (user) {
            console.log("User unit ID:", user.unitId);
            if (isAdminDept) {
              // AdminDept: unitId chính là campus ID
              const userCampus = campusesResult.find((campus: Unit) => campus.id === user?.unitId);
              if (userCampus) {
                setUnits(userCampus.childUnits ?? []);
                setSelectedCampusId(userCampus.id);
              } else {
                setUnits([]);
                setSelectedCampusId("");
              }
            } else if (isUserDept) {
              setSelectedUnitId(user.unitId);
            } else {
              setUnits([]);
              setSelectedCampusId("");
              setSelectedUnitId("");
            }
            // KHÔNG call API ở đây nữa - chỉ call khi chọn xong loại tài sản
          }
        }
      } catch (e: any) {
        toast.error(e.message || "Có lỗi xảy ra khi tải dữ liệu.");
      }
    };
    loadInitialData();
  }, []);

  // Handle filter changes - chỉ call API khi đã chọn loại tài sản
  useEffect(() => {
    // Kiểm tra điều kiện bắt buộc trước khi call API
    const hasRequiredFilters = () => {
      // 1. Phải có thông tin user và đơn vị
      if (!user) return false;
      
      const hasUnitInfo = 
        (isAdmin && selectedCampusId && selectedUnitId) || 
        (isAdminDept && selectedUnitId) || 
        (isUserDept && user.unitId);
      
      // 2. Phải chọn năm
      if (!selectedYear) return false;
      
      // 3. Phải chọn loại tài sản (đây là điều kiện cuối cùng để trigger API)
      if (!selectedAssetType) return false;
      
      return hasUnitInfo;
    };

    // Chỉ call API khi đã đủ tất cả điều kiện
    if (hasRequiredFilters()) {
      handleFilterChange({
        ...currentFilter,
        search: searchTerm || undefined,
        campusId: selectedCampusId || undefined,
        unitId: selectedUnitId || (isUserDept && user ? user.unitId : undefined),
        year: selectedYear ? parseInt(selectedYear) : undefined,
        roomId: selectedRoomId || undefined,
        assetType: (selectedAssetType as AssetType) || undefined,
      });
    }
  }, [
    searchTerm,
    selectedCampusId,
    selectedUnitId,
    selectedYear,
    selectedRoomId,
    selectedAssetType, // Đây là trigger chính
    user?.unitId,
    isAdmin,
    isAdminDept,
    isUserDept,
  ]);

  const handleFilterChange = (filterRequest: AssetBookFilterRequest) => {
    dispatch(filterAssetBook(filterRequest));
  };

  const handleExport = () => {
    console.log("Exporting asset book data...");
    toast.success("Đang xuất sổ tài sản...");
  };

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedAssets([]);
    }
  };

  const handleSelectionChange = (
    selectedRowKeys: string[],
    selectedRows: Asset[]
  ) => {
    console.log("=== DEBUG SELECTION ===");
    console.log("selectedRowKeys:", selectedRowKeys);
    console.log("selectedRows:", selectedRows);
    console.log("deduplicatedAssets sample:", deduplicatedAssets.slice(0, 2));
    setSelectedAssets(selectedRowKeys);
    console.log("Đã chọn tài sản:", selectedRowKeys);
    console.log("Chi tiết tài sản được chọn:", selectedRows);
  };

  // Memoize deduplicated data to avoid recalculating on every render
  const deduplicatedAssets = React.useMemo(() => {
    const seen = new Set<string>();
    return filteredAssetBooks.data.filter((asset) => {
      if (seen.has(asset.id)) {
        return false;
      }
      seen.add(asset.id);
      return true;
    });
  }, [filteredAssetBooks.data]);

  const handleBulkHandover = () => {
    if (selectedAssets.length === 0) {
      alert("Vui lòng chọn ít nhất một tài sản để bàn giao!");
      return;
    }

    const selectedAssetObjects = deduplicatedAssets.filter((asset) =>
      selectedAssets.includes(asset.id)
    );

    // Lưu danh sách tài sản đã chọn vào Redux store
    dispatch(setSelectedAssetsForHandover(selectedAssetObjects));
    
    // Logic cải thiện để xác định sourceUnitId
    let sourceUnitId: string | undefined = selectedUnitId || undefined;
    
    // Nếu chưa có selectedUnitId, thử lấy từ user (cho UserDept)
    if (!sourceUnitId && isUserDept && user?.unitId) {
      sourceUnitId = user.unitId;
    }
    
    // Nếu vẫn chưa có, thử lấy từ tài sản đã chọn
    if (!sourceUnitId && selectedAssetObjects.length > 0) {
      const firstAsset = selectedAssetObjects[0];
      sourceUnitId = firstAsset.currentRoom?.unit?.id;
    }

    // Lưu context bàn giao (thông tin đơn vị nguồn)
    const handoverContext = {
      sourceCampusId: selectedCampusId || undefined,
      sourceUnitId: sourceUnitId || undefined,
      sourceRoomId: selectedRoomId || undefined,
      // Thêm thông tin chi tiết
      sourceCampus: selectedCampusId ? campuses.find(c => c.id === selectedCampusId) : undefined,
      sourceUnit: sourceUnitId ? 
                  (units?.find(u => u.id === sourceUnitId) || 
                   campuses.flatMap(c => c.childUnits || []).find(u => u.id === sourceUnitId)) : 
                  undefined,
    };
    
    console.log("handoverContext:", handoverContext);
    dispatch(setHandoverContext(handoverContext));
    
    // Chuyển đến trang transaction để hoàn tất bàn giao
    router.push('/asset/transaction/create');
    
    // Thoát khỏi selection mode
    setIsSelectionMode(false);
    setSelectedAssets([]);
    
    toast.success(`Đã chọn ${selectedAssetObjects.length} tài sản để bàn giao`);
  };

  useEffect(() => {
    if (selectedCampusId) {
      setUnits(
        campuses.find((campus) => campus.id === selectedCampusId)?.childUnits ??
          []
      );
    }
  }, [selectedCampusId]);
  useEffect(() => {
    const fetchRooms = async () => {
      if (selectedUnitId) {
        try {
          const res = await dispatch(
            fetchRoomsByUnitId(selectedUnitId)
          ).unwrap();
          setRooms(res);
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
  // Define table columns for Asset Book (theo format Excel)
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
      key: "roomCode",
      title: "Mã vị trí",
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
      key: "name",
      title: "Tên TSCD",
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
          {getAssetBookItemStatusBadge(record.bookItemStatus as AssetBookItemStatus)}
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
                {/* Ai cũng có thể xem chi tiết */}
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

                {/* Chức năng RFID */}
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/asset/${asset.id}/rfid`;
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span>Quét RFID</span>
                </DropdownMenuItem>

                {/* Bàn giao */}
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isSelectionMode) {
                      if (!selectedAssets.includes(asset.id)) {
                        setSelectedAssets((prev) => [...prev, asset.id]);
                      }
                    } else {
                      // Nếu chưa ở chế độ bàn giao, chọn tài sản này và vào chế độ bàn giao
                      setSelectedAssets([asset.id]);
                      setIsSelectionMode(true);
                    }
                  }}
                  className="flex items-center gap-2 cursor-pointer text-orange-600"
                >
                  <span>Bàn giao</span>
                </DropdownMenuItem>

                {/* Xóa */}
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="flex items-center gap-2 cursor-pointer text-red-600"
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
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sổ Tài Sản</h1>
          <p className="text-gray-600">
            Quản lý và theo dõi tài sản theo cơ sở, đơn vị
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Nút bàn giao */}
          <Button
            onClick={handleToggleSelectionMode}
            variant={isSelectionMode ? "destructive" : "default"}
            className={`flex items-center ${
              isSelectionMode
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            {isSelectionMode ? "Hủy chọn" : "Bàn giao tài sản"}
          </Button>

          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Xuất sổ tài sản
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-300 mb-6">
        {/* Filter Content */}
        <div className="p-6 relative">
          {/* Main Filters Row - Always visible */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 mb-4">
            {/* Campus Filter - for Admin only */}
            {isAdmin && (
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
            {(isAdminDept || isAdmin) && (
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
                disabled={isAdminDept ? !selectedCampusId : false}
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
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-200 ${showAdvancedFilters ? "rotate-180" : ""}`} />
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

      {/* Assets Table */}
      <Table<Asset>
        columns={columns}
        data={deduplicatedAssets}
        loading={loading}
        emptyText="Không tìm thấy tài sản"
        emptyIcon={<div className="h-12 w-12 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
          <span className="text-gray-400 font-bold text-xl">?</span>
        </div>}
        multiSort={true}
        sortConfigs={currentFilter.sorting}
        onSortChange={(sortConfigs) => {
          handleFilterChange({
            ...currentFilter,
            sorting: sortConfigs,
          });
        }}
        rowSelection={
          isSelectionMode
            ? {
                selectedRowKeys: selectedAssets,
                onChange: handleSelectionChange,
                getCheckboxProps: (record) => ({
                  disabled: false,
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
