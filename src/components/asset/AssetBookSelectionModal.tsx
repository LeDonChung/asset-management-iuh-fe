"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useAppDispatch } from "@/lib/store/hooks";
import {
  filterAssetBook,
  AssetBookFilterRequest,
} from "@/lib/store/slices/assetBookSlice";
import { getUnitCampus } from "@/lib/store/slices/unitSlice";
import { fetchRoomsByUnitId } from "@/lib/store/slices/roomSlice";
import { useAuth } from "@/contexts/AuthContext";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableColumn } from "@/components/ui/table";
import {
  RefreshCw,
  ChevronDown,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  Asset,
  AssetType,
  Room,
  Unit,
  AssetBookItemStatus,
  AccessScopeType,
} from "@/types/asset";
import toast from "react-hot-toast";

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

interface AssetBookSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedAssets: Asset[]) => void;
  initialFilters?: {
    campusId?: string;
    unitId?: string;
    year?: string;
    roomId?: string;
    assetType?: string;
    status?: string;
    searchTerm?: string;
  };
  title?: string;
  excludeAssetIds?: string[]; 
}

export default function AssetBookSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  initialFilters,
  title = "Chọn tài sản từ sổ tài sản",
  excludeAssetIds = [],
}: AssetBookSelectionModalProps) {
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  const accessScopeTypes = user?.accessScopeTypes || [];
  const hasGlobalAccess = accessScopeTypes.includes(AccessScopeType.GLOBAL);
  const hasChildUnitsAccess = accessScopeTypes.includes(
    AccessScopeType.CHILD_UNITS
  );
  const hasUnitAccess = accessScopeTypes.includes(AccessScopeType.UNIT);
  const hasSelfAccess = accessScopeTypes.includes(AccessScopeType.SELF);

  const [searchTerm, setSearchTerm] = useState(initialFilters?.searchTerm || "");
  const [selectedCampusId, setSelectedCampusId] = useState(
    initialFilters?.campusId || ""
  );
  const [units, setUnits] = useState<Unit[]>();
  const [selectedUnitId, setSelectedUnitId] = useState(
    initialFilters?.unitId || ""
  );
  const [rooms, setRooms] = useState<Room[]>();
  const [selectedYear, setSelectedYear] = useState(
    initialFilters?.year || new Date().getFullYear().toString()
  );
  const [selectedRoomId, setSelectedRoomId] = useState(
    initialFilters?.roomId || ""
  );
  const [selectedAssetType, setSelectedAssetType] = useState(
    initialFilters?.assetType || "FIXED_ASSET"
  );
  const [selectedStatus, setSelectedStatus] = useState(
    initialFilters?.status || ""
  );
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [currentFilter, setCurrentFilter] = useState<AssetBookFilterRequest>({
    pagination: { currentPage: 1, itemsPerPage: 10 },
    sorting: [],
  });
  const savedMainFilterRef = useRef<AssetBookFilterRequest | null>(null);

  const {
    filteredAssetBooks,
    loading,
    currentFilter: mainPageFilter,
  } = useSelector((state: RootState) => state.assetBook);
  const { campuses } = useSelector((state: RootState) => state.unit);
  const { loading: roomsLoading } = useSelector(
    (state: RootState) => state.room
  );

  useEffect(() => {
    if (isOpen) {
      savedMainFilterRef.current = { ...mainPageFilter };
      
      if (initialFilters) {
        setSearchTerm(initialFilters.searchTerm || "");
        setSelectedCampusId(initialFilters.campusId || "");
        setSelectedUnitId(initialFilters.unitId || "");
        setSelectedYear(initialFilters.year || new Date().getFullYear().toString());
        setSelectedRoomId(initialFilters.roomId || "");
        setSelectedAssetType(initialFilters.assetType || "FIXED_ASSET");
        setSelectedStatus(initialFilters.status || "");
      }
      setSelectedAssets([]);
      setCurrentFilter({
        pagination: { currentPage: 1, itemsPerPage: 10 },
        sorting: [],
      });
    } else {
      setSelectedAssets([]);
      
      if (savedMainFilterRef.current) {
        dispatch(filterAssetBook(savedMainFilterRef.current));
        savedMainFilterRef.current = null;
      }
    }
  }, [isOpen]); 

  useEffect(() => {
    if (!isOpen) return;
    
    const loadInitialData = async () => {
      try {
        const campusesResult = await dispatch(getUnitCampus()).unwrap();
        if (campusesResult && user) {
          if (hasChildUnitsAccess) {
            const userCampus = campusesResult.find(
              (campus: Unit) => campus.id === user?.unitId
            );
            if (userCampus) {
              const childUnits = userCampus.childUnits ?? [];
              setUnits(childUnits);

              if (initialFilters?.campusId) {
                setSelectedCampusId(initialFilters.campusId);
              } else {
                setSelectedCampusId(userCampus.id);
              }
            } else {
              setUnits([]);
            }
          } else if (hasUnitAccess || hasSelfAccess) {
            if (initialFilters?.unitId) {
              setSelectedUnitId(initialFilters.unitId);
            } else {
              setSelectedUnitId(user.unitId);
            }
          }
        }
      } catch (e: any) {
        toast.error(e.message || "Có lỗi xảy ra khi tải dữ liệu.");
      }
    };
    
    loadInitialData();
  }, [isOpen]); 

  useEffect(() => {
    if (selectedCampusId) {
      const campus = campuses.find((campus) => campus.id === selectedCampusId);
      const childUnits = campus?.childUnits ?? [];
      setUnits(childUnits);
    } else {
      setUnits([]);
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

  useEffect(() => {
    if (!isOpen || !user) return;

    const hasUnitInfo =
      (hasGlobalAccess && selectedCampusId && selectedUnitId) ||
      (hasChildUnitsAccess && selectedUnitId) ||
      ((hasUnitAccess || hasSelfAccess) && user.unitId);

    if (!selectedYear || !selectedAssetType || !hasUnitInfo) {
      return;
    }

    const filterRequest: AssetBookFilterRequest = {
      pagination: currentFilter.pagination || { currentPage: 1, itemsPerPage: 10 },
      sorting: currentFilter.sorting || [],
      search: searchTerm || undefined,
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
    };

    const timeoutId = setTimeout(() => {
      setCurrentFilter(filterRequest);
      dispatch(filterAssetBook(filterRequest));
    }, 300); 

    return () => clearTimeout(timeoutId);
  }, [
    isOpen,
    user,
    selectedCampusId,
    selectedUnitId,
    selectedYear,
    selectedRoomId,
    selectedAssetType,
    selectedStatus,
    searchTerm,
    hasGlobalAccess,
    hasChildUnitsAccess,
    hasUnitAccess,
    hasSelfAccess,
    dispatch,
  ]);

  const handleFilterChange = (filterRequest: AssetBookFilterRequest) => {
    setCurrentFilter(filterRequest);
    dispatch(filterAssetBook(filterRequest));
  };

  const handleSelectionChange = (
    selectedRowKeys: string[],
    selectedRows: Asset[]
  ) => {
    setSelectedAssets(selectedRowKeys);
  };

  const handleConfirm = () => {
    if (selectedAssets.length === 0) {
      toast.error("Vui lòng chọn ít nhất một tài sản!");
      return;
    }

    const selectedAssetObjects = filteredAssetBooks.data.filter((asset) =>
      selectedAssets.includes(asset.id)
    );

    onConfirm(selectedAssetObjects);
    setSelectedAssets([]);
  };

  const handleClose = () => {
    setSelectedAssets([]);
    if (savedMainFilterRef.current) {
      dispatch(filterAssetBook(savedMainFilterRef.current));
      savedMainFilterRef.current = null;
    }
    onClose();
  };

  const availableAssets = filteredAssetBooks.data.filter(
    (asset) => {
      const assetKey = asset.bookItemId || asset.id;
      return !excludeAssetIds.includes(assetKey);
    }
  );

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
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="2xl">
      <div className="max-h-[80vh] overflow-y-auto">
        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-300 mb-6">
          <div className="p-6 relative">
            {/* Main Filters Row */}
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

        {/* Selection Info */}
        {selectedAssets.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Đã chọn {selectedAssets.length} tài sản
              </span>
            </div>
          </div>
        )}

        {/* Assets Table */}
        <Table<Asset>
          columns={columns}
          data={availableAssets}
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
          rowSelection={{
            selectedRowKeys: selectedAssets,
            onChange: handleSelectionChange,
            getCheckboxProps: (record) => ({
              disabled: [
                AssetBookItemStatus.TRANSFERRED,
                AssetBookItemStatus.LIQUIDATED,
              ].includes(record.bookItemStatus as AssetBookItemStatus),
            }),
          }}
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

      {/* Modal Footer */}
      <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
        <Button variant="outline" onClick={handleClose}>
          Hủy
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={selectedAssets.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Xác nhận ({selectedAssets.length})
        </Button>
      </div>
    </Modal>
  );
}

