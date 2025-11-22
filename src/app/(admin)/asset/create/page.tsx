"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import {
  ArrowLeft,
  Save,
  Package2,
  Building,
  Calendar,
  Hash,
  FileText,
  MapPin,
  User,
  CheckSquare,
  ChevronDown,
  Check,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { 
  AssetType, 
  AssetFormData, 
  RoomStatus, 
  UnitStatus, 
  UnitType,
  AccessScopeType,
  Unit,
  Room 
} from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { createAsset } from "@/lib/store/slices/assetSlice";
import { getUnitCampus } from "@/lib/store/slices/unitSlice";
import { fetchRoomsByUnitId } from "@/lib/store/slices/roomSlice";
import { axiosInstance } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

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

export default function CreateAssetPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { loading } = useAppSelector((state) => state.asset);
  const { campuses } = useSelector((state: RootState) => state.unit);
  const { loading: roomsLoading } = useSelector((state: RootState) => state.room);

  // Access scope types
  const accessScopeTypes = user?.accessScopeTypes || [];
  const hasGlobalAccess = accessScopeTypes.includes(AccessScopeType.GLOBAL);
  const hasChildUnitsAccess = accessScopeTypes.includes(AccessScopeType.CHILD_UNITS);
  const hasUnitAccess = accessScopeTypes.includes(AccessScopeType.UNIT);
  const hasSelfAccess = accessScopeTypes.includes(AccessScopeType.SELF);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState<AssetFormData & { locationInRoom?: string; rfid?: string }>({
    name: "",
    specs: "",
    entryDate: new Date().toISOString().split('T')[0],
    currentRoomId: undefined,
    locationInRoom: "",
    unit: "",
    quantity: 1,
    origin: "",
    purchasePackage: 0,
    type: AssetType.FIXED_ASSET,
    categoryId: "",
    rfid: "",
  });

  // State cho việc chọn đơn vị và phòng
  const [selectedCampusId, setSelectedCampusId] = useState("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load initial data based on access scope
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load categories
        const categoriesResponse = await axiosInstance.get('/api/v1/categories');
        setCategories(categoriesResponse.data);

        // Load campuses and units based on access scope
        const campusesResult = await dispatch(getUnitCampus()).unwrap();
        if (campusesResult && user) {
          if (hasChildUnitsAccess) {
            // Child units access: unitId chính là campus ID
            const userCampus = campusesResult.find(
              (campus: Unit) => campus.id === user?.unitId
            );
            if (userCampus) {
              setUnits(userCampus.childUnits ?? []);
              setSelectedCampusId(userCampus.id);
            } else {
              setUnits([]);
              setSelectedCampusId("");
            }
          } else if (hasUnitAccess || hasSelfAccess) {
            // Unit/Self access: Tìm campus chứa đơn vị của user
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
              // Unit/Self access có thể chọn đơn vị khác, không tự động set selectedUnitId
            }
          } else if (hasGlobalAccess) {
            // Global access có thể chọn tất cả
            // Không set gì cả, để user tự chọn
          }
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast.error('Có lỗi xảy ra khi tải dữ liệu.');
      }
    };

    loadInitialData();
  }, [dispatch, hasGlobalAccess, hasChildUnitsAccess, hasUnitAccess, hasSelfAccess, user]);

  // Update units when campus changes
  useEffect(() => {
    if (selectedCampusId) {
      const campus = campuses.find((campus) => campus.id === selectedCampusId);
      setUnits(campus?.childUnits ?? []);
      setSelectedUnitId(""); // Reset unit selection
      setRooms([]); // Reset rooms
      setFormData(prev => ({ ...prev, currentRoomId: undefined })); // Reset room selection
    }
  }, [selectedCampusId, campuses]);

  // Fetch rooms when unit changes
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
        setFormData(prev => ({ ...prev, currentRoomId: undefined }));
      }
    };
    fetchRooms();
  }, [dispatch, selectedUnitId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: name === 'quantity' || name === 'purchasePackage'
          ? (value === '' ? undefined : Number(value))
          : name === 'currentRoomId'
            ? (value === '' ? undefined : value)
            : value
      };

      // Nếu thay đổi loại tài sản thành "Tài sản cố định", set số lượng về 1
      if (name === 'type' && value === AssetType.FIXED_ASSET) {
        newData.quantity = 1;
        // Xóa RFID nếu chuyển từ công cụ dụng cụ sang tài sản cố định
        if (prev.type === AssetType.TOOLS_EQUIPMENT) {
          newData.rfid = "";
        }
      }

      // Nếu thay đổi từ tài sản cố định sang công cụ dụng cụ, xóa RFID
      if (name === 'type' && value === AssetType.TOOLS_EQUIPMENT && prev.type === AssetType.FIXED_ASSET) {
        newData.rfid = "";
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const resultAction = await dispatch(createAsset({
        name: formData.name,
        specs: formData.specs,
        entrydate: formData.entryDate,
        currentRoomId: formData.currentRoomId,
        locationInRoom: formData.locationInRoom,
        unit: formData.unit,
        quantity: formData.quantity,
        origin: formData.origin,
        purchasePackage: formData.purchasePackage,
        type: formData.type,
        categoryId: formData.categoryId,
        rfid: formData.rfid,
      })).unwrap();

      toast.success("Tạo tài sản thành công!");
      // Redirect on success
      router.push("/asset/unidentified");
    } catch (error: any) {
      // Error already handled in the thunk
      console.error("Error creating asset:", error);
      toast.error(error.message || "Có lỗi xảy ra khi tạo tài sản.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/asset">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Thêm tài sản mới
            </h1>
            <p className="text-gray-600">
              Điền đầy đủ thông tin để tạo tài sản mới
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-300">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                Thông tin cơ bản
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên tài sản <span className="text-red-500">*</span>
                  </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nhập tên tài sản"
                  required
                  disabled={isSubmitting}
                  className="w-full"
                />
              </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thông số kỹ thuật
                  </label>
                  <Input
                    name="specs"
                    value={formData.specs}
                    onChange={handleInputChange}
                    placeholder="Nhập thông số kỹ thuật"
                    disabled={isSubmitting}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại tài sản <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={isSubmitting}
                  >
                    <option value={AssetType.FIXED_ASSET}>Tài sản cố định</option>
                    <option value={AssetType.TOOLS_EQUIPMENT}>Công cụ dụng cụ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* RFID field - chỉ hiển thị cho tài sản cố định */}
                {formData.type === AssetType.FIXED_ASSET && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mã RFID (tùy chọn)
                    </label>
                    <Input
                      name="rfid"
                      value={formData.rfid || ""}
                      onChange={handleInputChange}
                      placeholder="Nhập mã RFID nếu có"
                      disabled={isSubmitting}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Nếu để trống, tài sản sẽ có trạng thái "Chưa định danh"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                Thông tin bổ sung
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    Ngày nhập
                  </label>
                  <Input
                    type="date"
                    name="entryDate"
                    value={formData.entryDate}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    Số lượng
                  </label>
                  <Input
                    type="number"
                    name="quantity"
                    value={formData.quantity || ""}
                    onChange={handleInputChange}
                    placeholder="Nhập số lượng"
                    min="1"
                    disabled={isSubmitting || formData.type === AssetType.FIXED_ASSET}
                    className="w-full"
                  />
                  {formData.type === AssetType.FIXED_ASSET && (
                    <p className="text-xs text-gray-500 mt-1">
                      Tài sản cố định luôn có số lượng = 1
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đơn vị
                  </label>
                  <Input
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    placeholder="Nhập đơn vị (cái, chiếc...)"
                    disabled={isSubmitting}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nguồn gốc
                  </label>
                  <Input
                    name="origin"
                    value={formData.origin}
                    onChange={handleInputChange}
                    placeholder="Nhập nguồn gốc"
                    disabled={isSubmitting}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gói thầu
                  </label>
                  <Input
                    type="number"
                    name="purchasePackage"
                    value={formData.purchasePackage || ""}
                    onChange={handleInputChange}
                    placeholder="Nhập gói thầu"
                    min="0"
                    disabled={isSubmitting}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                Vị trí
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Campus Selection (Global access only) */}
                {hasGlobalAccess && (
                  <CardSelect
                    label="Cơ sở"
                    icon={<Building className="w-4 h-4" />}
                    value={selectedCampusId}
                    onChange={setSelectedCampusId}
                    options={[
                      { value: "", label: "Chọn cơ sở" },
                      ...campuses.map((campus: Unit) => ({
                        value: campus.id,
                        label: campus.name,
                      })),
                    ]}
                    placeholder="Chọn cơ sở"
                    disabled={isSubmitting}
                    required
                    className="text-base"
                  />
                )}

                {/* Unit Selection */}
                {(hasChildUnitsAccess || hasGlobalAccess || hasUnitAccess || hasSelfAccess) && (
                  <CardSelect
                    label="Đơn vị sử dụng"
                    icon={<Building className="w-4 h-4" />}
                    value={selectedUnitId}
                    onChange={setSelectedUnitId}
                    options={[
                      { value: "", label: "Chọn đơn vị sử dụng" },
                      ...(units?.map((unit: Unit) => ({
                        value: unit.id,
                        label: unit.name,
                      })) || []),
                    ]}
                    placeholder="Chọn đơn vị sử dụng"
                    disabled={isSubmitting || (hasGlobalAccess && !selectedCampusId)}
                    className="text-base"
                  />
                )}

                {/* Room Selection */}
                <div className={hasGlobalAccess ? "md:col-span-2" : ""}>
                  <CardSelect
                    label="Phòng (không bắt buộc)"
                    icon={<MapPin className="w-4 h-4" />}
                    value={formData.currentRoomId || ""}
                    onChange={(value) => setFormData(prev => ({ ...prev, currentRoomId: value || undefined }))}
                    options={[
                      { value: "", label: "Chọn phòng" },
                      ...rooms.map((room: Room) => ({
                        value: room.id,
                        label: `${room.name || room.roomCode} - Tòa ${room.building}, Tầng ${room.floor}`,
                      })),
                    ]}
                    placeholder="Chọn phòng"
                    disabled={isSubmitting || !selectedUnitId}
                    loading={roomsLoading}
                    className="text-base"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vị trí trong phòng
                  </label>
                  <Input
                    name="locationInRoom"
                    value={formData.locationInRoom}
                    onChange={handleInputChange}
                    placeholder="Nhập vị trí cụ thể trong phòng (ví dụ: 29)"
                    className="w-full"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-8 mt-8 border-t border-gray-200">
            <Link href="/asset">
              <Button variant="outline" disabled={loading || isSubmitting}>
                Hủy
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading || isSubmitting}
              className="min-w-[140px]"
            >
              {(loading || isSubmitting) ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang tạo...
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Tạo tài sản
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}