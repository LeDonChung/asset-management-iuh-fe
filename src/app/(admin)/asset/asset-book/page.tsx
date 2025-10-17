"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Asset, AssetType, Room, Unit } from "@/types/asset";
import {
  Search,
  Building,
  Eye,
  Package,
  MapPin,
  RefreshCw,
  Download,
  Building2,
  CalendarDays,
  ChevronDown,
  Check,
  Edit2,
  ArrowRightLeft,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableColumn } from "@/components/ui/table";
import Link from "next/link";
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

// Asset type options for filter dropdown
const assetTypeOptions = [
  { value: "", label: "Tất cả loại tài sản" },
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
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full min-h-[2.75rem] pr-10 truncate py-2 border border-gray-200 rounded-lg 
            bg-white text-left transition-all duration-200
            hover:border-gray-300 hover:shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${isOpen ? "ring-2 ring-blue-500 border-blue-500" : ""}
            ${loading ? "cursor-wait" : "cursor-pointer"}
          `}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div
                className={`transition-colors mt-0.5 ${
                  isOpen ? "text-blue-500" : "text-gray-400"
                }`}
              >
                {icon}
              </div>
              <span
                className={`flex-1 leading-relaxed break-words truncate ${
                  selectedOption ? "text-gray-900" : "text-gray-500"
                }`}
                title={selectedOption ? selectedOption.label : placeholder}
              >
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 mt-0.5 flex-shrink-0 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
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
              // Tìm campus chứa unit của user trong children
              const userCampus = campusesResult.find((campus: Unit) =>
                campus.childUnits?.some((unit) => unit.id === user?.unitId)
              );
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
            const currentFilterFirst = {
              ...currentFilter,
              campusId: isAdminDept ? user?.unitId : undefined,
              unitId: isUserDept ? user?.unitId : undefined,
              roomId: undefined,
              assetType: undefined,
            };
            await dispatch(filterAssetBook(currentFilterFirst));
          }
        }
      } catch (e: any) {
        toast.error(e.message || "Có lỗi xảy ra khi tải dữ liệu.");
      }
    };
    loadInitialData();
  }, []);

  // Handle filter changes
  useEffect(() => {
    handleFilterChange({
      ...currentFilter,
      search: searchTerm || undefined,
      campusId: selectedCampusId || undefined,
      unitId: selectedUnitId || undefined,
      year: selectedYear ? parseInt(selectedYear) : undefined,
      roomId: selectedRoomId || undefined,
      assetType: (selectedAssetType as AssetType) || undefined,
    });
  }, [
    searchTerm,
    selectedCampusId,
    selectedUnitId,
    selectedYear,
    selectedRoomId,
    selectedAssetType,
  ]);

  const handleFilterChange = (filterRequest: AssetBookFilterRequest) => {
    dispatch(filterAssetBook(filterRequest));
  };

  const handleExport = () => {
    console.log("Exporting asset book data...");
    toast.success("Đang xuất báo cáo...");
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
    setSelectedAssets(selectedRowKeys);
    console.log("Đã chọn tài sản:", selectedRowKeys);
    console.log("Chi tiết tài sản được chọn:", selectedRows);
  };

  const handleBulkHandover = () => {
    if (selectedAssets.length === 0) {
      alert("Vui lòng chọn ít nhất một tài sản để bàn giao!");
      return;
    }

    const selectedAssetObjects = filteredAssetBooks.data.filter((asset) =>
      selectedAssets.includes(asset.id)
    );

    // Console log các tài sản được chọn
    console.log("Các tài sản được chọn để bàn giao:", selectedAssetObjects);
    console.log("Số lượng tài sản:", selectedAssetObjects.length);
    selectedAssetObjects.forEach((asset, index) => {
      console.log(
        `${index + 1}. ${asset.name} (${asset.fixedCode}) - ${asset.status}`
      );
    });

    // TODO: Implement handover logic here
    toast.success(`Đã chọn ${selectedAssetObjects.length} tài sản để bàn giao`);
    setIsSelectionMode(false);
    setSelectedAssets([]);
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
      key: "actions",
      title: "Thao tác",
      render: (_, asset) => {
        return (
          <div className="flex justify-start">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 px-3 text-sm"
                >
                  Hành động
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
          <Button
            variant="outline"
            onClick={() => dispatch(filterAssetBook(currentFilter))}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Đang tải..." : "Làm mới"}
          </Button>

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
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        {/* Filter Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Search className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Bộ lọc tìm kiếm
                </h3>
                <p className="text-sm text-gray-600">
                  Lọc và tìm kiếm tài sản theo các tiêu chí
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCampusId("");
                  setSelectedUnitId("");
                  setSelectedRoomId("");
                  setSelectedAssetType("");
                  setSelectedYear(new Date().getFullYear().toString());
                }}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Đặt lại
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Content */}
        <div className="p-6 relative">
          {/* First Row - Main Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
            {/* Search */}
            <div className="lg:col-span-2 relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  placeholder="Nhập tên, mã tài sản..."
                  className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Campus Filter */}
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
            />

            {/* Asset Type Filter */}
            <CardSelect
              label="Loại tài sản"
              icon={<></>}
              value={selectedAssetType}
              onChange={setSelectedAssetType}
              options={assetTypeOptions}
              placeholder="Chọn loại tài sản"
            />
          </div>

          {/* Second Row - Room Filter */}
          {selectedUnitId && (
            <div className="border-t border-gray-100 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
                  className="lg:col-span-2"
                />
              </div>
            </div>
          )}

          {/* Active Filters Summary */}
          {(searchTerm ||
            selectedCampusId ||
            selectedUnitId ||
            selectedRoomId ||
            selectedAssetType) && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">
                    Bộ lọc đang áp dụng:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {searchTerm && (
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 max-w-[200px] truncate"
                        title={`Tìm kiếm: "${searchTerm}"`}
                      >
                        Tìm kiếm: "{searchTerm}"
                      </span>
                    )}
                    {selectedCampusId && (
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        title={`Cơ sở: ${
                          campuses.find((c) => c.id === selectedCampusId)?.name
                        }`}
                      >
                        Cơ sở:{" "}
                        {campuses.find((c) => c.id === selectedCampusId)?.name}
                      </span>
                    )}
                    {selectedUnitId && (
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                        title={`Đơn vị: ${
                          units?.find((u) => u.id === selectedUnitId)?.name
                        }`}
                      >
                        Đơn vị:{" "}
                        {units?.find((u) => u.id === selectedUnitId)?.name}
                      </span>
                    )}
                    {selectedRoomId && (
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                        title={`Phòng: ${
                          rooms?.find((r) => r.id === selectedRoomId)?.name
                        }`}
                      >
                        Phòng:{" "}
                        {rooms?.find((r) => r.id === selectedRoomId)?.name}
                      </span>
                    )}
                    {selectedAssetType && (
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        title={`Loại: ${
                          assetTypeOptions.find(
                            (opt) => opt.value === selectedAssetType
                          )?.label
                        }`}
                      >
                        Loại:{" "}
                        {
                          assetTypeOptions.find(
                            (opt) => opt.value === selectedAssetType
                          )?.label
                        }
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCampusId("");
                    setSelectedUnitId("");
                    setSelectedRoomId("");
                    setSelectedAssetType("");
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Xóa tất cả
                </Button>
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
        data={filteredAssetBooks.data}
        loading={loading}
        emptyText="Không tìm thấy tài sản"
        emptyIcon={<Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
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
        title={<div className="flex items-center">Danh sách tài sản</div>}
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
