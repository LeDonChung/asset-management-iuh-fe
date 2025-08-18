"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  CheckSquare
} from "lucide-react";
import Link from "next/link";
import { AssetType, AssetFormData, RoomStatus, UnitStatus, UnitType } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Mock data cho dropdown
const mockCategories = [
  { id: "3", name: "Thiết bị văn phòng", code: "3" },
  { id: "4", name: "Máy tính", code: "4" },
  { id: "5", name: "Máy in", code: "5" },
];

const mockUnits = [
  { id: "unit1", name: "Phòng CNTT", type: UnitType.DON_VI_SU_DUNG, status: UnitStatus.ACTIVE },
  { id: "unit2", name: "Phòng Kế toán", type: UnitType.DON_VI_SU_DUNG, status: UnitStatus.ACTIVE },
  { id: "unit3", name: "Phòng Nhân sự", type: UnitType.DON_VI_SU_DUNG, status: UnitStatus.ACTIVE },
  { id: "unit4", name: "Phòng Quản trị", type: UnitType.PHONG_QUAN_TRI, status: UnitStatus.ACTIVE },
  { id: "unit5", name: "Phòng Kế hoạch Đầu tư", type: UnitType.PHONG_KE_HOACH_DAU_TU, status: UnitStatus.ACTIVE },
];

const mockRooms = [
  { id: "1", building: "B", floor: "1", roomNumber: "Phòng IT 09", status: RoomStatus.ACTIVE, unitId: "unit1", name: "Phòng IT 09" },
  { id: "2", building: "B", floor: "1", roomNumber: "Phòng Kế toán 10", status: RoomStatus.ACTIVE, unitId: "unit2", name: "Phòng Kế toán 10" },
  { id: "3", building: "B", floor: "2", roomNumber: "Phòng Nhân sự 05", status: RoomStatus.ACTIVE, unitId: "unit3", name: "Phòng Nhân sự 05" },
  { id: "4", building: "C", floor: "1", roomNumber: "Phòng Quản trị 03", status: RoomStatus.ACTIVE, unitId: "unit4", name: "Phòng Quản trị 03" },
  { id: "5", building: "C", floor: "2", roomNumber: "Phòng KHĐT 07", status: RoomStatus.ACTIVE, unitId: "unit5", name: "Phòng KHĐT 07" },
];

export default function CreateAssetPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AssetFormData>({
    name: "",
    specs: "",
    entryDate: new Date().toISOString().split('T')[0],
    plannedRoomId: undefined,
    unit: "",
    quantity: 1,
    origin: "",
    purchasePackage: 0,
    type: AssetType.TSCD,
    categoryId: "",
  });
  const [unitId, setUnitId] = useState<string>("");
  const [filteredRooms, setFilteredRooms] = useState(mockRooms);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'unitId') {
      setUnitId(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'quantity' || name === 'purchasePackage'
          ? (value === '' ? undefined : Number(value))
          : name === 'plannedRoomId'
            ? (value === '' ? undefined : value)
            : value
      }));
    }
  };

  // Filter rooms based on selected unit
  useEffect(() => {
    if (unitId) {
      setFilteredRooms(mockRooms.filter(room => room.unitId === unitId));
      // Reset room selection when unit changes
      setFormData(prev => ({
        ...prev,
        plannedRoomId: undefined
      }));
    } else {
      setFilteredRooms(mockRooms);
    }
  }, [unitId]);

  const generateAssetCodes = (categoryId: string, type: AssetType) => {
    const currentYear = new Date().getFullYear().toString().slice(-2);

    // Mã kế toán: xx-yyyy/nn
    const ktCode = `${currentYear}-0001/00`;

    // Mã tài sản cố định: xxxx.yyyy
    const category = mockCategories.find(cat => cat.id === categoryId);
    const fixedCode = category ? `${category.code}001.00001` : "0001.00001";

    return { ktCode, fixedCode };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!unitId) {
      alert("Vui lòng chọn đơn vị sử dụng");
      return;
    }

    setIsLoading(true);

    try {
      // Generate asset codes
      const { ktCode, fixedCode } = generateAssetCodes(formData.categoryId, formData.type);

      // Mock API call - replace with real API
      const newAsset = {
        ...formData,
        id: Date.now().toString(),
        ktCode,
        fixedCode,
        isLocked: false,
        status: "chờ_phân_bổ",
        unitId: unitId, // Add the unit ID
        createdBy: "current-user-id",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log("Creating asset:", newAsset);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      router.push("/asset");
    } catch (error) {
      console.error("Error creating asset:", error);
      alert("Có lỗi xảy ra khi tạo tài sản");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/asset">
          <Button variant="ghost" size="icon" className="rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Định danh tài sản mới</h1>
          <p className="text-gray-600">Nhập thông tin chi tiết cho tài sản mới</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow">
          {/* Form Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm">
                  <Package2 className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Thông tin cơ bản</h3>
                <p className="text-sm text-gray-500">Nhập thông tin cơ bản của tài sản</p>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="px-6 py-6 space-y-6">
            {/* Tên tài sản và Loại tài sản */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên tài sản <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Nhập tên tài sản"
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
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={AssetType.TSCD}>Tài sản cố định</option>
                  <option value={AssetType.CCDC}>Công cụ dụng cụ</option>
                </select>
              </div>
            </div>

            {/* Danh mục và Ngày nhập */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn danh mục</option>
                  {mockCategories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày nhập <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="date"
                    name="entryDate"
                    value={formData.entryDate}
                    onChange={handleInputChange}
                    required
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Đơn vị tính và Số lượng */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đơn vị tính <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  required
                  placeholder="VD: Cái, Bộ, Chiếc..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                  <Hash className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                {formData.type === AssetType.TSCD && (
                  <p className="mt-1 text-xs text-gray-500">Tài sản cố định có số lượng = 1</p>
                )}
              </div>
            </div>

            {/* Đơn vị sử dụng */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đơn vị sử dụng <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="unitId"
                    value={unitId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Chọn đơn vị sử dụng</option>
                    {mockUnits.map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xuất xứ
                </label>
                <Input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleInputChange}
                  className="w-full"
                  placeholder="VD: Dell Việt Nam, Hòa Phát..."
                />
              </div>
            </div>

            {/* Vị trí theo kế hoạch */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vị trí theo kế hoạch
                </label>
                <div className="relative">
                  <select
                    name="plannedRoomId"
                    value={formData.plannedRoomId || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!unitId}
                  >
                    <option value="">Chưa phân bổ</option>
                    {filteredRooms.map(room => (
                      <option key={room.id} value={room.id}>
                        {room.roomNumber} (Tòa {room.building}, Tầng {room.floor})
                      </option>
                    ))}
                  </select>
                  <Building className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {!unitId ? "Vui lòng chọn đơn vị sử dụng trước" : "Để trống nếu tài sản chưa được phân bổ"}
                </p>
              </div>
              <div></div>
            </div>

            {/* Gói mua */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gói mua <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  name="purchasePackage"
                  value={formData.purchasePackage}
                  onChange={handleInputChange}
                  required
                  min="0"
                  placeholder="Nhập số gói mua"
                />
                <p className="mt-1 text-xs text-gray-500">Bắt đầu từ 00</p>
              </div>
            </div>

            {/* Thông số kỹ thuật */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thông số kỹ thuật
              </label>
              <textarea
                name="specs"
                value={formData.specs || ''}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mô tả chi tiết về thông số kỹ thuật của tài sản..."
              />
            </div>
          </div>
        </div>

        {/* Preview mã tài sản */}
        {formData.categoryId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Mã tài sản sẽ được tạo:</h4>
            <div className="space-y-1 text-sm text-blue-800">
              <div>Mã kế toán: <span className="font-mono font-medium">{generateAssetCodes(formData.categoryId, formData.type).ktCode}</span></div>
              <div>Mã tài sản cố định: <span className="font-mono font-medium">{generateAssetCodes(formData.categoryId, formData.type).fixedCode}</span></div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          <Link href="/asset">
            <Button variant="outline">
              Hủy
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isLoading ? "Đang lưu..." : "Lưu tài sản"}
          </Button>
        </div>
      </form>
    </div>
  );
}
