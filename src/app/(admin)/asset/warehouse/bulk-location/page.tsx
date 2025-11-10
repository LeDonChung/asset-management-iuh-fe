"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  MapPin,
  Building,
  Save,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
  Search,
  ChevronDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableColumn } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { PermissionConstants } from "@/constants";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { RootState } from "@/lib/store";
import { getUnitCampus } from "@/lib/store/slices/unitSlice";
import { getUnitRooms } from "@/lib/store/slices/inventorySlice";
import { 
  bulkUpdateAssetLocations, 
  clearBulkUpdateResult, 
  type LocationUpdateItem, 
  type BulkLocationUpdateRequest,
  type WarehouseAsset 
} from "@/lib/store/slices/assetSlice";

// Types
interface LocationUpdate {
  assetId: string;
  campusId?: string;
  unitId?: string;
  roomId?: string;
  notes?: string;
}

interface Room {
  id: string;
  name: string;
  roomCode: string;
  unitId: string;
}

interface Unit {
  id: string;
  name: string;
  unitCode: number;
  childUnits?: Unit[];
}

const AssetType = {
  FIXED_ASSET: "FIXED_ASSET",
  TOOLS_EQUIPMENT: "TOOLS_EQUIPMENT",
};

const typeLabels = {
  [AssetType.FIXED_ASSET]: "Tài sản cố định",
  [AssetType.TOOLS_EQUIPMENT]: "Công cụ dụng cụ",
};

const typeColors = {
  [AssetType.FIXED_ASSET]: "bg-blue-100 text-blue-800",
  [AssetType.TOOLS_EQUIPMENT]: "bg-purple-100 text-purple-800",
};

// Custom Select Component
interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  disabled?: boolean;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
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

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener("scroll", handleScroll, true);
      return () => window.removeEventListener("scroll", handleScroll, true);
    }
  }, [isOpen]);

  const dropdownContent = isOpen ? (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998]"
        onClick={() => setIsOpen(false)}
      />
      {/* Dropdown */}
      <div
        className="fixed z-[9999] bg-white border border-gray-300 rounded-md shadow-2xl max-h-60 overflow-auto"
        style={{
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: dropdownPosition.width,
        }}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              onChange(option.value);
              setIsOpen(false);
            }}
            className={`
              w-full px-3 py-2 text-sm text-left hover:bg-gray-50
              flex items-center justify-between
              ${
                option.value === value
                  ? "bg-blue-50 text-blue-900"
                  : "text-gray-900"
              }
            `}
          >
            <span>{option.label}</span>
            {option.value === value && (
              <Check className="h-4 w-4 text-blue-600" />
            )}
          </button>
        ))}
      </div>
    </>
  ) : null;

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full h-9 px-3 py-2 text-sm border border-gray-300 rounded-md 
          bg-white text-left flex items-center justify-between
          ${
            disabled
              ? "bg-gray-50 text-gray-500 cursor-not-allowed"
              : "hover:border-gray-400 cursor-pointer"
          }
          ${isOpen ? "ring-2 ring-blue-500 border-blue-500" : ""}
        `}
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-500"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {typeof window !== "undefined" &&
        createPortal(dropdownContent, document.body)}
    </div>
  );
};

export default function BulkLocationUpdatePage() {
  const { user, hasAnyPermission } = useAuth();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Redux state
  const { campuses, loading: unitsLoading } = useAppSelector(
    (state: RootState) => state.unit
  );
  const { unitRooms } = useAppSelector((state: RootState) => state.inventory);
  const { bulkUpdateLoading, bulkUpdateResult } = useAppSelector((state: RootState) => state.asset);

  // Local state
  const [selectedAssets, setSelectedAssets] = useState<
    WarehouseAsset[]
  >([]);
  const [locationUpdates, setLocationUpdates] = useState<LocationUpdate[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [rooms, setRooms] = useState<{ [unitId: string]: Room[] }>({});
  const [searchTerm, setSearchTerm] = useState("");

  // Permissions
  const canUpdate = hasAnyPermission([PermissionConstants.PERM_UPDATE_ASSET]);

  // Load data on mount
  useEffect(() => {
    if (!canUpdate) {
      router.push("/unauthorized");
      return;
    }

    // Load selected assets from localStorage
    const storedAssets = localStorage.getItem("selectedWarehouseAssets");
    if (storedAssets) {
      const assets = JSON.parse(storedAssets);
      setSelectedAssets(assets);

      // Initialize location updates - only allow room selection within current unit
      const initialUpdates = assets.map((asset: WarehouseAsset) => ({
        assetId: asset.id,
        campusId: "", // Will be set automatically based on current unit
        unitId: asset.currentUnit?.id || "", // Keep current unit
        roomId: "", // Reset room selection
        notes: "",
      }));
      setLocationUpdates(initialUpdates);

      // Load rooms for the first unit (usually all assets belong to same unit)
      const uniqueUnitIds = [
        ...new Set(
          assets
            .map((a: WarehouseAsset) => a.currentUnit?.id)
            .filter(Boolean)
        ),
      ] as string[];
      if (uniqueUnitIds.length > 0) {
        const firstUnitId = uniqueUnitIds[0];
        loadRoomsForUnit(firstUnitId);
      }
    } else {
      toast.error(
        "Không tìm thấy tài sản được chọn. Vui lòng quay lại trang trước."
      );
      router.push("/asset/warehouse");
    }

    // Load campuses
    dispatch(getUnitCampus());
  }, [canUpdate, router, dispatch]);

  // Load rooms when unit is selected
  const loadRoomsForUnit = async (unitId: string) => {
    if (!unitId || rooms[unitId]) return; // Already loaded

    try {
      const unitData = await dispatch(getUnitRooms(unitId)).unwrap();

      // getUnitRooms trả về data của unit, rooms nằm trong unitData.rooms
      const roomsData = unitData.rooms || [];

      setRooms((prev) => ({
        ...prev,
        [unitId]: roomsData,
      }));
    } catch (error) {
      toast.error("Không thể tải danh sách phòng");
    }
  };

  // Update location for an asset - only room selection allowed
  const updateAssetLocation = (
    assetId: string,
    field: keyof LocationUpdate,
    value: string
  ) => {
    // Only allow room updates, unit and campus are fixed
    if (field === "roomId") {
      setLocationUpdates((prev) =>
        prev.map((update) =>
          update.assetId === assetId ? { ...update, [field]: value } : update
        )
      );
    }
  };

  // Submit location updates
  const handleSubmit = async () => {
    // Validate required fields - only roomId is required now
    const invalidUpdates = locationUpdates.filter((update) => !update.roomId);

    if (invalidUpdates.length > 0) {
      toast.error("Vui lòng chọn phòng cho tất cả tài sản");
      return;
    }

    try {
      // Prepare data for API call
      const updateData: BulkLocationUpdateRequest = {
        items: locationUpdates.map((update) => ({
          assetId: update.assetId,
          roomId: update.roomId!,
          note: update.notes,
        })),
        generalNote: "Cập nhật vị trí hàng loạt từ warehouse",
      };

      // Dispatch Redux action
      const result = await dispatch(bulkUpdateAssetLocations(updateData)).unwrap();

      if (result.errorCount > 0) {
        toast.error(`Có ${result.errorCount} lỗi xảy ra. Vui lòng kiểm tra chi tiết.`);
        // Show detailed errors
        result.errors.forEach((error: string) => {
          toast.error(error);
        });
      }

      if (result.successCount > 0) {
        toast.success(
          `Đã cập nhật vị trí cho ${result.successCount}/${result.totalCount} tài sản thành công`
        );

        // Clear localStorage
        localStorage.removeItem("selectedWarehouseAssets");

        // Navigate back after successful update
        if (result.errorCount === 0) {
          router.push("/asset/warehouse");
        }
      }
    } catch (error: any) {
      console.error("Error updating locations:", error);
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật vị trí");
    }
  };

  // Filter assets based on search
  const filteredAssets = useMemo(() => {
    if (!searchTerm) return selectedAssets;
    return selectedAssets.filter(
      (asset) =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.ktCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.fixedCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [selectedAssets, searchTerm]);

  // Check if all updates are valid - only need roomId now
  const isValid = locationUpdates.every((update) => update.roomId);

  const completedCount = locationUpdates.filter(
    (update) => update.roomId
  ).length;

  // Debug: Log rooms state
  useEffect(() => {
    console.log("Rooms state updated:", rooms);
  }, [rooms]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clear bulk update result when component unmounts
      dispatch(clearBulkUpdateResult());
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/asset/warehouse")}
                className="flex items-center hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Chọn phòng mới cho tài sản
                </h1>
                <p className="text-gray-600">
                  Chọn phòng mới trong cùng đơn vị cho {selectedAssets.length}{" "}
                  tài sản được chọn
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleSubmit}
                disabled={!isValid || bulkUpdateLoading}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {bulkUpdateLoading
                  ? "Đang lưu..."
                  : `Lưu thay đổi (${completedCount}/${selectedAssets.length})`}
              </Button>
            </div>
          </div>
        </div>
        {/* Search */}
        <Card className="shadow-sm border-gray-200">
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Tìm kiếm tài sản theo tên, mã KT, mã tài sản..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </Card>
        {/* Assets List */}
        <div className="bg-white rounded-xl border-gray-200">
          <Table
            columns={[
              {
                key: "codes",
                title: "Mã TSCD / Mã KT",
                render: (_, asset) => (
                  <div className="text-sm font-medium text-gray-900">
                    <div>{asset.fixedCode}</div>
                    <div className="text-xs text-gray-500">{asset.ktCode}</div>
                  </div>
                ),
                sortable: true,
              },
              {
                key: "name",
                title: "Tên tài sản",
                render: (_, asset) => (
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {asset.name}
                    </div>
                    {asset.specs && (
                      <div className="text-xs text-gray-500 mt-1">
                        {asset.specs}
                      </div>
                    )}
                  </div>
                ),
                sortable: true,
              },
              {
                key: "type",
                title: "Loại",
                render: (_, asset) => (
                  <Badge
                    className={
                      typeColors[asset.type] || "bg-gray-100 text-gray-800"
                    }
                  >
                    {typeLabels[asset.type] || "Không xác định"}
                  </Badge>
                ),
                sortable: true,
              },
              {
                key: "currentLocation",
                title: "Vị trí hiện tại",
                render: (_, asset) => (
                  <div className="text-sm text-gray-900">
                    <div className="flex items-center space-x-1 mb-1">Kho</div>
                  </div>
                ),
                sortable: true,
              },
              {
                key: "newRoom",
                title: "Phòng mới",
                render: (_, asset) => {
                  const update = locationUpdates.find(
                    (u) => u.assetId === asset.id
                  );

                  // Lấy phòng từ unit đầu tiên (vì tất cả tài sản thường cùng unit)
                  const uniqueUnitIds = [
                    ...new Set(
                      selectedAssets
                        .map((a) => a.currentUnit?.id)
                        .filter(Boolean)
                    ),
                  ] as string[];
                  const firstUnitId = uniqueUnitIds[0];
                  const availableRooms = firstUnitId
                    ? rooms[firstUnitId] || []
                    : [];

                  // Tạo options với validation
                  const roomOptions = availableRooms
                    .map((room) => {
                      return {
                        value: room.id,
                        label: room.roomCode
                          ? `${room.roomCode} - ${room.name}`
                          : room.name,
                      };
                    })
                    .filter((option) => option.value);

                  return (
                    <div className="min-w-[200px]">
                      <Select
                        value={update?.roomId || ""}
                        onChange={(value) =>
                          updateAssetLocation(asset.id, "roomId", value)
                        }
                        options={[
                          { value: "", label: "Chọn phòng mới" },
                          ...roomOptions,
                        ]}
                        placeholder="Chọn phòng mới"
                        disabled={!firstUnitId || roomOptions.length === 0}
                      />
                    </div>
                  );
                },
              },
              {
                key: "actions",
                title: "Thao tác",
                render: (_, asset) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/asset/${asset.id}`)}
                    className="hover:bg-gray-100"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                ),
                className: "text-center",
              },
            ]}
            data={filteredAssets}
            loading={false}
            emptyText="Không tìm thấy tài sản nào"
            emptyIcon={
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            }
            rowKey="id"
          />
        </div>{" "}
        {/* Empty State */}
        {filteredAssets.length === 0 && (
          <Card className="shadow-sm border-gray-200">
            <div className="p-12 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Không tìm thấy tài sản
              </h3>
              <p className="text-gray-600">Thử tìm kiếm với từ khóa khác</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
