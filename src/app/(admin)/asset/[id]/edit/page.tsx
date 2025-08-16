"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Package2,
  AlertCircle,
  Building,
  Calendar,
  Hash,
  User,
} from "lucide-react";
import Link from "next/link";
import { Asset, AssetType, AssetFormData, AssetStatus, RoomStatus, UnitStatus, UnitType } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Mock data
const mockAsset: Asset = {
  id: "1",
  ktCode: "24-0001/01",
  fixedCode: "4001.00001",
  name: "Máy tính Dell Latitude 5520",
  specs: "Intel Core i5-1135G7, 8GB RAM, 256GB SSD, Windows 11 Pro",
  entryDate: "2024-01-15",
  plannedRoomId: "1",
  unit: "Cái",
  quantity: 1,
  origin: "Dell Việt Nam",
  purchasePackage: 1,
  type: AssetType.TSCD,
  isLocked: false,
  categoryId: "4",
  status: AssetStatus.CHO_PHAN_BO,
  createdBy: "user1",
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-15T10:00:00Z",
  category: { id: "4", name: "Máy tính", code: "4" },
  room: { id: "1", building: "B", floor: "1", roomNumber: "Phòng IT 09", name: "Phòng IT 09", status: RoomStatus.ACTIVE, unitId: "unit1", createdAt: "2024-01-15T10:00:00Z", updatedAt: "2024-01-15T10:00:00Z", createdBy: "admin" }
};

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
  { id: "1", building: "B", floor: "1", roomNumber: "Phòng IT 09", status: RoomStatus.ACTIVE, unitId: "unit1", name: "Phòng IT 09", createdAt: "2024-01-15T10:00:00Z", updatedAt: "2024-01-15T10:00:00Z", createdBy: "admin" },
  { id: "2", building: "B", floor: "1", roomNumber: "Phòng Kế toán 10", status: RoomStatus.ACTIVE, unitId: "unit2", name: "Phòng Kế toán 10", createdAt: "2024-01-15T10:00:00Z", updatedAt: "2024-01-15T10:00:00Z", createdBy: "admin" },
  { id: "3", building: "B", floor: "2", roomNumber: "Phòng Nhân sự 05", status: RoomStatus.ACTIVE, unitId: "unit3", name: "Phòng Nhân sự 05", createdAt: "2024-01-15T10:00:00Z", updatedAt: "2024-01-15T10:00:00Z", createdBy: "admin" },
  { id: "4", building: "C", floor: "1", roomNumber: "Phòng Quản trị 03", status: RoomStatus.ACTIVE, unitId: "unit4", name: "Phòng Quản trị 03", createdAt: "2024-01-15T10:00:00Z", updatedAt: "2024-01-15T10:00:00Z", createdBy: "admin" },
  { id: "5", building: "C", floor: "2", roomNumber: "Phòng KHĐT 07", status: RoomStatus.ACTIVE, unitId: "unit5", name: "Phòng KHĐT 07", createdAt: "2024-01-15T10:00:00Z", updatedAt: "2024-01-15T10:00:00Z", createdBy: "admin" },
];

export default function EditAssetPage() {
  const params = useParams();
  const router = useRouter();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [unitId, setUnitId] = useState<string>("");
  const [filteredRooms, setFilteredRooms] = useState(mockRooms);
  const [formData, setFormData] = useState<AssetFormData>({
    name: "",
    specs: "",
    entryDate: "",
    plannedRoomId: undefined,
    unit: "",
    quantity: 1,
    origin: "",
    purchasePackage: 0,
    type: AssetType.TSCD,
    categoryId: "",
  });

  useEffect(() => {
    // Mock API call to fetch asset
    const fetchAsset = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setAsset(mockAsset);
        
        // Set the unit ID if the asset has a room with unitId
        if (mockAsset.room?.unitId) {
          setUnitId(mockAsset.room.unitId);
        }
        
        // Populate form data
        setFormData({
          name: mockAsset.name,
          specs: mockAsset.specs || "",
          entryDate: mockAsset.entryDate,
          plannedRoomId: mockAsset.plannedRoomId,
          unit: mockAsset.unit,
          quantity: mockAsset.quantity,
          origin: mockAsset.origin || "",
          purchasePackage: mockAsset.purchasePackage,
          type: mockAsset.type,
          categoryId: mockAsset.categoryId,
        });
      } catch (error) {
        console.error("Error fetching asset:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAsset();
  }, [params.id]);
  
  // Filter rooms based on selected unit
  useEffect(() => {
    if (unitId) {
      setFilteredRooms(mockRooms.filter(room => room.unitId === unitId));
    } else {
      setFilteredRooms(mockRooms);
    }
  }, [unitId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'unitId') {
      setUnitId(value);
      // Reset room selection when unit changes
      if (unitId !== value) {
        setFormData(prev => ({
          ...prev,
          plannedRoomId: undefined
        }));
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;
    
    if (!unitId) {
      alert("Vui lòng chọn đơn vị sử dụng");
      return;
    }
    
    setIsSaving(true);

    try {
      // Mock API call
      const updatedAsset = {
        ...asset,
        ...formData,
        unitId: unitId, // Add the unit ID
        updatedAt: new Date().toISOString(),
      };

      console.log("Updating asset:", updatedAsset);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.push(`/asset/${asset.id}`);
    } catch (error) {
      console.error("Error updating asset:", error);
      alert("Có lỗi xảy ra khi cập nhật tài sản");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin tài sản...</p>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="text-center py-12">
        <Package2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy tài sản</h3>
        <p className="mt-1 text-sm text-gray-500">Tài sản không tồn tại hoặc đã bị xóa.</p>
        <div className="mt-6">
          <Link
            href="/asset"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  if (asset.isLocked) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link 
            href={`/asset/${asset.id}`}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa tài sản</h1>
            <p className="text-gray-600">{asset.name}</p>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-orange-400" />
          <h3 className="mt-2 text-lg font-medium text-orange-900">Không thể chỉnh sửa</h3>
          <p className="mt-1 text-sm text-orange-700">
            Tài sản này đã được bàn giao và không thể chỉnh sửa thông tin.
          </p>
          <div className="mt-6">
            <Link
              href={`/asset/${asset.id}`}
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Quay lại chi tiết
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href={`/asset/${asset.id}`}>
          <Button variant="ghost" size="icon" className="rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa tài sản</h1>
          <p className="text-gray-600">{asset.name}</p>
        </div>
      </div>

      {/* Asset codes info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-blue-900">Mã kế toán</label>
            <div className="font-mono text-sm text-blue-800">{asset.ktCode}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900">Mã tài sản cố định</label>
            <div className="font-mono text-sm text-blue-800">{asset.fixedCode}</div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Package2 className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Cập nhật thông tin</h3>
                <p className="text-sm text-gray-500">Chỉnh sửa thông tin chi tiết của tài sản</p>
              </div>
            </div>
          </div>

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
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
                />
              </div>
            </div>

            {/* Thông số kỹ thuật */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thông số kỹ thuật
              </label>
              <textarea
                name="specs"
                value={formData.specs}
                onChange={handleInputChange}
                rows={4}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                placeholder="Mô tả chi tiết về thông số kỹ thuật của tài sản..."
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          <Link href={`/asset/${asset.id}`}>
            <Button variant="outline">
              Hủy
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? "Đang lưu..." : "Cập nhật tài sản"}
          </Button>
        </div>
      </form>
    </div>
  );
}
