"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  MapPin,
  Building,
  Save,
  Eye,
  Package,
  AlertCircle,
  ChevronDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { PermissionConstants } from "@/constants";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { RootState } from "@/lib/store";
import {
  fetchRoomsByUnitId,
} from "@/lib/store/slices/roomSlice";
import {
  getUnitCampus,
} from "@/lib/store/slices/unitSlice";
import { Unit, Room } from "@/types/asset";

// Types
interface AssetResponseDto {
  id: string;
  ktCode: string;
  fixedCode: string;
  name: string;
  specs?: string;
  entrydate: Date;
  unit: string;
  quantity: number;
  origin?: string;
  purchasePackage: number;
  type: string;
  status: string;
  allowMove: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: {
    id: string;
    name: string;
    code: string;
  };
  currentRoom?: {
    id: string;
    name: string;
    roomCode: string;
  };
  currentUnit?: {
    id: string;
    name: string;
    unitCode: number;
  };
  rfidTag?: {
    id: number;
    rfid: string;
  };
}

interface LocationUpdate {
  campusId: string;
  unitId: string;
  roomId: string;
  notes?: string;
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
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md 
          bg-white text-left flex items-center justify-between
          ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'hover:border-gray-400 cursor-pointer'}
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
        `}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
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
                  ${option.value === value ? 'bg-blue-50 text-blue-900' : 'text-gray-900'}
                `}
              >
                <span>{option.label}</span>
                {option.value === value && <Check className="h-4 w-4 text-blue-600" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function AssetLocationUpdatePage() {
  const { user, hasAnyPermission } = useAuth();
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();

  const assetId = params.id as string;

  // Redux state
  const { campuses, loading: unitsLoading } = useAppSelector(
    (state: RootState) => state.unit
  );
  const { rooms, loading: roomsLoading } = useAppSelector(
    (state: RootState) => state.room
  );

  // Local state
  const [asset, setAsset] = useState<AssetResponseDto | null>(null);
  const [locationUpdate, setLocationUpdate] = useState<LocationUpdate>({
    campusId: "",
    unitId: "",
    roomId: "",
    notes: "",
  });
  const [units, setUnits] = useState<Unit[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Permissions
  const canUpdate = hasAnyPermission([PermissionConstants.PERM_UPDATE_ASSET]);

  // Load data on mount
  useEffect(() => {
    if (!canUpdate) {
      router.push("/unauthorized");
      return;
    }

    loadAssetData();
    dispatch(getUnitCampus());
  }, [canUpdate, router, dispatch, assetId]);

  // Load asset data
  const loadAssetData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await dispatch(fetchAssetById(assetId)).unwrap();
      
      // Mock asset data for now
      const mockAsset: AssetResponseDto = {
        id: assetId,
        ktCode: "KT001",
        fixedCode: "TS001",
        name: "Máy tính Desktop",
        specs: "Intel Core i5, 8GB RAM, 256GB SSD",
        entrydate: new Date(),
        unit: "Cái",
        quantity: 1,
        purchasePackage: 1,
        type: AssetType.FIXED_ASSET,
        status: "IN_USE",
        allowMove: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        currentUnit: {
          id: "unit-1",
          name: "Khoa CNTT",
          unitCode: 101,
        },
        currentRoom: {
          id: "room-1",
          name: "Phòng Lab 1",
          roomCode: "LAB101",
        },
      };

      setAsset(mockAsset);

      // Initialize location update with current values
      if (mockAsset.currentUnit && mockAsset.currentRoom) {
        // Find campus that contains this unit
        const campus = campuses.find(c => 
          c.childUnits?.some(u => u.id === mockAsset.currentUnit?.id)
        );
        
        setLocationUpdate({
          campusId: campus?.id || "",
          unitId: mockAsset.currentUnit.id,
          roomId: mockAsset.currentRoom.id,
          notes: "",
        });

        // Load units for the campus
        if (campus) {
          setUnits(campus.childUnits || []);
        }

        // Load rooms for the unit
        if (mockAsset.currentUnit.id) {
          dispatch(fetchRoomsByUnitId(mockAsset.currentUnit.id));
        }
      }
    } catch (error: any) {
      console.error("Error loading asset:", error);
      toast.error("Không thể tải thông tin tài sản");
      router.push("/asset/warehouse");
    } finally {
      setLoading(false);
    }
  };

  // Update campus selection
  const handleCampusChange = (campusId: string) => {
    const selectedCampus = campuses.find(c => c.id === campusId);
    setLocationUpdate(prev => ({
      ...prev,
      campusId,
      unitId: "",
      roomId: "",
    }));
    setUnits(selectedCampus?.childUnits || []);
  };

  // Update unit selection
  const handleUnitChange = (unitId: string) => {
    setLocationUpdate(prev => ({
      ...prev,
      unitId,
      roomId: "",
    }));

    // Load rooms for the selected unit
    if (unitId) {
      dispatch(fetchRoomsByUnitId(unitId));
    }
  };

  // Update room selection
  const handleRoomChange = (roomId: string) => {
    setLocationUpdate(prev => ({
      ...prev,
      roomId,
    }));
  };

  // Submit location update
  const handleSubmit = async () => {
    // Validate required fields
    if (!locationUpdate.campusId || !locationUpdate.unitId || !locationUpdate.roomId) {
      toast.error("Vui lòng điền đầy đủ thông tin vị trí");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Call API to update asset location
      // const response = await dispatch(updateAssetLocation({
      //   assetId,
      //   ...locationUpdate
      // })).unwrap();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Đã cập nhật vị trí tài sản thành công");
      
      // Navigate back
      router.push("/asset/warehouse");
    } catch (error: any) {
      console.error("Error updating location:", error);
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật vị trí");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if form is valid
  const isValid = locationUpdate.campusId && locationUpdate.unitId && locationUpdate.roomId;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Không tìm thấy thông tin tài sản</p>
          <Button
            onClick={() => router.push("/asset/warehouse")}
            className="mt-4"
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/asset/warehouse")}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Cập nhật vị trí tài sản
            </h1>
            <p className="text-gray-600">
              Nhập vị trí mới cho tài sản
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/asset/${assetId}`)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Xem chi tiết
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </div>

      {/* Asset Information Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-xl font-semibold text-gray-900">
                {asset.name}
              </h2>
              <Badge className={typeColors[asset.type] || "bg-gray-100 text-gray-800"}>
                {typeLabels[asset.type] || "Không xác định"}
              </Badge>
              {!asset.allowMove && (
                <Badge className="bg-red-100 text-red-800">
                  Không thể di chuyển
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Mã KT:</span> {asset.ktCode}
              </div>
              <div>
                <span className="font-medium">Mã tài sản:</span> {asset.fixedCode}
              </div>
              <div>
                <span className="font-medium">Đơn vị tính:</span> {asset.unit}
              </div>
              <div>
                <span className="font-medium">Số lượng:</span> {asset.quantity}
              </div>
            </div>
            {asset.specs && (
              <div className="mt-2 text-sm text-gray-600">
                <span className="font-medium">Thông số kỹ thuật:</span> {asset.specs}
              </div>
            )}
          </div>
          <Package className="h-8 w-8 text-gray-400" />
        </div>

        {/* Current Location */}
        <div className="bg-gray-50 rounded-lg p-4 mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Vị trí hiện tại</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Đơn vị:</span>
              <div className="font-medium">{asset.currentUnit?.name || "Chưa có"}</div>
            </div>
            <div>
              <span className="text-gray-500">Phòng:</span>
              <div className="font-medium">{asset.currentRoom?.roomCode || "Chưa có"}</div>
            </div>
            <div>
              <span className="text-gray-500">Tên phòng:</span>
              <div className="font-medium">{asset.currentRoom?.name || "Chưa có"}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Location Update Form */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <MapPin className="h-5 w-5 inline mr-2" />
          Vị trí mới
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Campus Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cơ sở <span className="text-red-500">*</span>
            </label>
            <Select
              value={locationUpdate.campusId}
              onChange={handleCampusChange}
              options={[
                { value: "", label: "Chọn cơ sở" },
                ...campuses.map(campus => ({
                  value: campus.id,
                  label: campus.name
                }))
              ]}
              placeholder="Chọn cơ sở"
              disabled={unitsLoading}
            />
          </div>

          {/* Unit Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đơn vị <span className="text-red-500">*</span>
            </label>
            <Select
              value={locationUpdate.unitId}
              onChange={handleUnitChange}
              options={[
                { value: "", label: "Chọn đơn vị" },
                ...units.map(unit => ({
                  value: unit.id,
                  label: unit.name
                }))
              ]}
              placeholder="Chọn đơn vị"
              disabled={!locationUpdate.campusId}
            />
          </div>

          {/* Room Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phòng <span className="text-red-500">*</span>
            </label>
            <Select
              value={locationUpdate.roomId}
              onChange={handleRoomChange}
              options={[
                { value: "", label: "Chọn phòng" },
                ...rooms.map(room => ({
                  value: room.id,
                  label: `${room.roomCode} - ${room.name}`
                }))
              ]}
              placeholder="Chọn phòng"
              disabled={!locationUpdate.unitId || roomsLoading}
            />
            {roomsLoading && (
              <div className="mt-1 text-xs text-gray-500">Đang tải danh sách phòng...</div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ghi chú
          </label>
          <Input
            value={locationUpdate.notes || ""}
            onChange={(e) => setLocationUpdate(prev => ({
              ...prev,
              notes: e.target.value
            }))}
            placeholder="Nhập ghi chú về việc di chuyển (tùy chọn)..."
            className="w-full"
          />
        </div>

        {/* Validation Message */}
        {!isValid && (
          <div className="flex items-center space-x-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3">
            <AlertCircle className="h-4 w-4" />
            <span>Vui lòng điền đầy đủ thông tin vị trí (cơ sở, đơn vị, phòng)</span>
          </div>
        )}
      </Card>
    </div>
  );
}
