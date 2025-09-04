"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Calendar,
  FileText,
  Hash,
  Building2,
  Users,
  Globe,
  MapPin,
  AlertCircle,
  CheckSquare,
  Upload,
  File,
  X
} from "lucide-react";
import Link from "next/link";
import {
  InventorySessionFormData,
  InventorySessionStatus,
  Unit,
  UnitStatus,
  UnitType
} from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MultiSelect from "@/components/ui/multi-select";
import { useAuth } from "@/contexts/AuthContext";

// Mock data for units
const mockUnits: Unit[] = [
  { 
    id: "unit-1", 
    name: "Cơ sở gò vấp", 
    type: UnitType.CO_SO, 
    status: UnitStatus.ACTIVE,
    representativeId: "user-1",
    createdBy: "admin",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  { 
    id: "unit-2", 
    name: "Cơ sở thanh hóa", 
    type: UnitType.CO_SO, 
    status: UnitStatus.ACTIVE,
    representativeId: "user-2", 
    createdBy: "admin",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  { 
    id: "unit-3", 
    name: "Phân hiệu quảng ngãi", 
    type: UnitType.CO_SO, 
    status: UnitStatus.ACTIVE,
    representativeId: "user-3",
    createdBy: "admin",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  { 
    id: "unit-4", 
    name: "Phòng Quản trị", 
    type: UnitType.PHONG_QUAN_TRI, 
    status: UnitStatus.ACTIVE,
    representativeId: "user-4",
    createdBy: "admin",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  { 
    id: "unit-5", 
    name: "Phòng Kế hoạch Đầu tư", 
    type: UnitType.PHONG_KE_HOACH_DAU_TU, 
    status: UnitStatus.ACTIVE,
    representativeId: "user-5",
    createdBy: "admin",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
];

export default function CreateInventorySessionPage() {
  const router = useRouter();
  const { getCurrentRole } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<InventorySessionFormData>({
    year: new Date().getFullYear(),
    name: "",
    period: 1,
    isGlobal: true,
    startDate: "",
    endDate: "",
    unitIds: [],
  });

  const [description, setDescription] = useState("");
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);

  // Check user permissions
  const isSuperAdmin = getCurrentRole()?.code === "SUPER_ADMIN";
  const isAdmin = getCurrentRole()?.code === "ADMIN";

  // Redirect if not authorized
  useEffect(() => {
    if (!isAdmin && !isSuperAdmin) {
      router.push("/inventory");
      return;
    }
  }, [isAdmin, isSuperAdmin, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked
        : name === 'year' || name === 'period'
          ? Number(value)
          : name === 'isGlobal'
            ? value === 'true'
            : value
    }));
  };

  const handleUnitIdsChange = (unitIds: string[]) => {
    setFormData(prev => ({
      ...prev,
      unitIds
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file types (only PDF)
    const validFiles = files.filter(file => {
      if (file.type !== 'application/pdf') {
        alert(`File "${file.name}" không phải là PDF. Chỉ chấp nhận file PDF.`);
        return false;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File "${file.name}" quá lớn. Kích thước tối đa là 10MB.`);
        return false;
      }
      
      return true;
    });

    // Check total number of files (max 5)
    if (evidenceFiles.length + validFiles.length > 5) {
      alert("Tối đa chỉ được upload 5 file minh chứng.");
      return;
    }

    setEvidenceFiles(prev => [...prev, ...validFiles]);
    
    // Reset input
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Auto-generate name based on form data
  useEffect(() => {
    if (formData.year && formData.period) {
      const scopeText = formData.isGlobal ? "toàn bộ cơ sở" : "cơ sở cụ thể";
      const generatedName = `Kiểm kê tài sản ${scopeText} - Đợt ${formData.period}/${formData.year}`;
      
      if (!formData.name || formData.name.includes("Kiểm kê tài sản")) {
        setFormData(prev => ({
          ...prev,
          name: generatedName
        }));
      }
    }
  }, [formData.year, formData.period, formData.isGlobal]);

  // Clear unit selection when switching to global
  useEffect(() => {
    if (formData.isGlobal) {
      setFormData(prev => ({
        ...prev,
        unitIds: []
      }));
    }
  }, [formData.isGlobal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate dates
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        alert("Ngày kết thúc phải sau ngày bắt đầu");
        return;
      }

      // Validate units for non-global sessions
      if (!formData.isGlobal && formData.unitIds?.length === 0) {
        alert("Vui lòng chọn ít nhất một cơ sở/đơn vị cho kỳ kiểm kê cơ sở cụ thể");
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create new inventory session object
      const newSession = {
        id: `inv-session-${Date.now()}`,
        ...formData,
        status: InventorySessionStatus.PLANNED,
        createdBy: getCurrentRole()?.code || "current-user",
        createdAt: new Date().toISOString(),
        evidenceFiles: evidenceFiles.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString()
        })),
        creator: {
          id: "current-user",
          username: "current.user",
          fullName: "Current User",
          email: "user@iuh.edu.vn",
          status: "ACTIVE" as const,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        units: [],
        committees: [],
      };

      console.log("New Inventory Session Created:", newSession);
      console.log("Evidence Files:", evidenceFiles);
      alert("Tạo kỳ kiểm kê thành công!");
      router.push("/inventory");
    } catch (error) {
      console.error("Error creating inventory session:", error);
      alert("Có lỗi xảy ra khi tạo kỳ kiểm kê. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // Get unit options for multi-select
  const unitOptions = mockUnits
    .filter(unit => unit.status === UnitStatus.ACTIVE)
    .map(unit => ({
      value: unit.id,
      label: unit.name
    }));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/inventory">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tạo kỳ kiểm kê mới</h1>
          <p className="text-gray-600">Tạo kỳ kiểm kê tài sản cho trường hoặc đơn vị cụ thể</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <FileText className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h2>
          </div>

          <div className="space-y-6">
            {/* Năm và Đợt */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Năm <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                    min="2020"
                    max="2030"
                    placeholder="2024"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đợt <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    name="period"
                    value={formData.period}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="12"
                    placeholder="1"
                  />
                  <Hash className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                <p className="mt-1 text-xs text-gray-500">Đợt kiểm kê trong năm (1-12)</p>
              </div>
            </div>

            {/* Tên kỳ kiểm kê */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên kỳ kiểm kê <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="VD: Kiểm kê tài sản cuối năm 2024"
                className="w-full"
              />
              <p className="mt-1 text-xs text-gray-500">Tên sẽ tự động tạo dựa trên năm, đợt và phạm vi</p>
            </div>

            {/* Phạm vi kiểm kê */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phạm vi kiểm kê <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="global"
                    name="isGlobal"
                    value="true"
                    checked={formData.isGlobal}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="global" className="flex items-center space-x-2 text-sm text-gray-700">
                    <Globe className="h-4 w-4 text-blue-600" />
                    <div>
                      <span className="font-medium">Toàn bộ cơ sở</span>
                      <p className="text-xs text-gray-500">Áp dụng cho tất cả cơ sở và đơn vị trực thuộc</p>
                    </div>
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="unit-specific"
                    name="isGlobal"
                    value="false"
                    checked={!formData.isGlobal}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="unit-specific" className="flex items-center space-x-2 text-sm text-gray-700">
                    <Building2 className="h-4 w-4 text-green-600" />
                    <div>
                      <span className="font-medium">Cơ sở cụ thể</span>
                      <p className="text-xs text-gray-500">Chọn một hoặc nhiều cơ sở/đơn vị cần kiểm kê</p>
                    </div>
                  </label>
                </div>
              </div>
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium mb-1">Lưu ý về phạm vi kiểm kê:</p>
                    <ul className="space-y-1">
                      <li>• <strong>Toàn bộ cơ sở:</strong> Bao gồm tất cả cơ sở (Gò Vấp, Thanh Hóa, Phân hiệu Quảng Ngãi) và các phòng ban</li>
                      <li>• <strong>Cơ sở cụ thể:</strong> Chỉ áp dụng cho các cơ sở/đơn vị được chọn</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Cơ sở/Đơn vị tham gia (chỉ hiện khi không phải global) */}
            {!formData.isGlobal && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cơ sở/Đơn vị tham gia <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MultiSelect
                    options={unitOptions}
                    value={formData.unitIds || []}
                    onChange={handleUnitIdsChange}
                    placeholder="Chọn các cơ sở/đơn vị tham gia kiểm kê..."
                    className="w-full"
                  />
                  <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-0" />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Chọn một hoặc nhiều cơ sở/đơn vị sẽ tham gia vào kỳ kiểm kê này
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Time Period */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Calendar className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Thời gian thực hiện</h2>
          </div>

          <div className="space-y-6">
            {/* Ngày bắt đầu và kết thúc */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày kết thúc <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Duration display */}
            {formData.startDate && formData.endDate && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Thời gian thực hiện: {
                      Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))
                    } ngày
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <FileText className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Thông tin bổ sung</h2>
          </div>

          <div className="space-y-6">
            {/* Mô tả */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả / Ghi chú
              </label>
              <textarea
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mô tả chi tiết về mục đích, yêu cầu đặc biệt của kỳ kiểm kê..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Thông tin này sẽ giúp các thành viên hiểu rõ mục đích và yêu cầu của kỳ kiểm kê
              </p>
            </div>

            {/* File minh chứng */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File minh chứng (PDF)
              </label>
              
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  id="evidence-upload"
                  multiple
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="evidence-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600 hover:text-blue-500">
                      Nhấn để chọn file
                    </span>
                    {" hoặc kéo thả file vào đây"}
                  </div>
                  <p className="text-xs text-gray-500">
                    Chỉ chấp nhận file PDF, tối đa 10MB mỗi file, tối đa 5 file
                  </p>
                </label>
              </div>

              {/* File List */}
              {evidenceFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    File đã chọn ({evidenceFiles.length}/5):
                  </h4>
                  {evidenceFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <File className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)} • PDF
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Xóa file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-2 text-xs text-gray-500">
                File minh chứng có thể bao gồm: Quyết định thành lập ban kiểm kê, Kế hoạch chi tiết, 
                Văn bản hướng dẫn, Biểu mẫu kiểm kê...
              </p>
            </div>
          </div>
        </div>

        {/* Preview Information */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-sm font-medium text-blue-900 mb-4 flex items-center">
            <CheckSquare className="h-4 w-4 mr-2" />
            Thông tin kỳ kiểm kê sẽ được tạo:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Năm/Đợt:</span>
                <span className="font-medium text-gray-900">{formData.year} / Đợt {formData.period}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phạm vi:</span>
                <span className="font-medium text-gray-900">
                  {formData.isGlobal ? "Toàn bộ cơ sở" : "Cơ sở cụ thể"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái:</span>
                <span className="font-medium text-blue-800">Kế hoạch</span>
              </div>
            </div>
            <div className="space-y-2">
              {formData.startDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày bắt đầu:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(formData.startDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}
              {formData.endDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày kết thúc:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(formData.endDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}
              {!formData.isGlobal && formData.unitIds && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Số cơ sở/đơn vị:</span>
                  <span className="font-medium text-gray-900">{formData.unitIds.length} đơn vị</span>
                </div>
              )}
              {evidenceFiles.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">File minh chứng:</span>
                  <span className="font-medium text-gray-900">{evidenceFiles.length} file</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          <Link href="/inventory">
            <Button variant="outline" disabled={isLoading}>
              Hủy
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[140px]"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang tạo...
              </div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Tạo kỳ kiểm kê
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
