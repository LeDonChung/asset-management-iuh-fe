"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  ArrowLeft,
  Save,
  Calendar,
  FileText,
  Hash,
  Building2,
  Users,
  Globe,
  AlertCircle,
  Upload,
  File,
  X,
  Copy,
  Plus,
} from "lucide-react";
import Link from "next/link";
import {
  InventorySessionFormData,
  InventorySessionStatus,
  UnitStatus,
  InventorySession,
  CopyInventoryFormData,
} from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MultiSelect from "@/components/ui/multi-select";
import { PermissionConstants, usePermissions } from "@/hooks/usePermissions";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { getUnitCampus } from "@/lib/store/slices/unitSlice";
import { uploadFileDocument } from "@/lib/store/slices/fileSlice";
import {
  createInventorySession,
  CreateInventorySession,
  copyInventorySession,
  CopyInventorySession,
} from "@/lib/store/slices/inventorySlice";
import { CopyInventoryModal } from "@/components/inventory/CopyInventoryModal";
import toast from "react-hot-toast";

// Validation schema for regular create
const validationSchema: yup.ObjectSchema<InventorySessionFormData> = yup
  .object()
  .shape({
    year: yup
      .number()
      .required("Năm là bắt buộc")
      .min(2020, "Năm phải từ 2020 trở lên")
      .max(2050, "Năm không được quá 2050"),
    name: yup.string().required("Tên kỳ kiểm kê là bắt buộc"),
    startDate: yup.string().required("Ngày bắt đầu là bắt buộc"),
    endDate: yup
      .string()
      .required("Ngày kết thúc là bắt buộc")
      .test(
        "is-after-start",
        "Ngày kết thúc phải sau ngày bắt đầu",
        function (value) {
          const { startDate } = this.parent;
          if (!startDate || !value) return true;
          return new Date(value) > new Date(startDate);
        }
      ),
    status: yup.mixed<InventorySessionStatus>().required(),
    fileUrls: yup.array().of(yup.string().required()).optional(),
  });

// Validation schema for copy
const copyValidationSchema: yup.ObjectSchema<CopyInventoryFormData> = yup
  .object()
  .shape({
    year: yup
      .number()
      .required("Năm là bắt buộc")
      .min(2020, "Năm phải từ 2020 trở lên")
      .max(2050, "Năm không được quá 2050"),
    name: yup.string().required("Tên kỳ kiểm kê là bắt buộc"),
    startDate: yup.string().required("Ngày bắt đầu là bắt buộc"),
    endDate: yup
      .string()
      .required("Ngày kết thúc là bắt buộc")
      .test(
        "is-after-start",
        "Ngày kết thúc phải sau ngày bắt đầu",
        function (value) {
          const { startDate } = this.parent;
          if (!startDate || !value) return true;
          return new Date(value) > new Date(startDate);
        }
      ),
    description: yup.string().optional(),
    copyMembers: yup.boolean().optional(),
    copyGroups: yup.boolean().optional(),
    copyAssignments: yup.boolean().optional(),
    copyFileUrls: yup.boolean().optional(),
    copySubInventories: yup.boolean().optional(),
  });

export default function CreateInventorySessionPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    campuses,
    loading: unitsLoading,
    error: unitsError,
  } = useAppSelector((state) => state.unit);

  const { createSessionLoading, copySessionLoading } = useAppSelector((state) => state.inventory);
  const { hasAnyPermission } = usePermissions();
  const canCreate = hasAnyPermission([PermissionConstants.PERM_CREATE_INVENTORY]);
  const [evidenceFiles, setEvidenceFiles] = useState<
    { name: string; url: string; size: number }[]
  >([]);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  
  // Copy mode states
  const [isCopyMode, setIsCopyMode] = useState(false);
  const [sourceSession, setSourceSession] = useState<InventorySession | null>(null);
  const [showCopyModal, setShowCopyModal] = useState(false);

  // Redirect if not authorized
  useEffect(() => {
    if (!canCreate) {
      router.push("/unauthorized");
      return;
    }
  }, [canCreate, router]);

  // Initialize form with useForm - use any to avoid TypeScript issues with dynamic schemas
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm<any>({
    resolver: yupResolver(isCopyMode ? copyValidationSchema as any : validationSchema as any),
    defaultValues: isCopyMode ? {
      year: new Date().getFullYear(),
      name: `Kiểm kê tài sản năm ${new Date().getFullYear()}`,
      startDate: "",
      endDate: "",
      description: "",
      copyMembers: false,
      copyGroups: false,
      copyAssignments: false,
      copyFileUrls: false,
      copySubInventories: true,
    } : {
      year: new Date().getFullYear(),
      name: `Kiểm kê tài sản năm ${new Date().getFullYear()}`,
      startDate: "",
      endDate: "",
      status: InventorySessionStatus.PLANNED,
      fileUrls: [],
    },
    mode: "onChange",
  });

  // Watch form values for dynamic updates
  const watchedValues = watch();
  const { year, startDate, endDate } = watchedValues;

  // Fetch units when component mounts
  useEffect(() => {
    dispatch(getUnitCampus());
  }, [dispatch]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate file types (only PDF)
    const validFiles = files.filter((file) => {
      if (file.type !== "application/pdf") {
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

    // Upload each file
    for (const file of validFiles) {
      try {
        // Add to uploading set
        setUploadingFiles((prev) => new Set(prev).add(file.name));

        // Upload file
        const result = await dispatch(uploadFileDocument(file)).unwrap();

        // Add uploaded file info to evidenceFiles
        setEvidenceFiles((prev) => [
          ...prev,
          {
            name: file.name,
            url: result.url,
            size: file.size,
          },
        ]);

        // Remove from uploading set
        setUploadingFiles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(file.name);
          return newSet;
        });
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        toast.error(`Lỗi khi upload file "${file.name}". Vui lòng thử lại.`);

        // Remove from uploading set
        setUploadingFiles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(file.name);
          return newSet;
        });
      }
    }

    // Reset input
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Handle copy mode toggle
  const handleToggleCopyMode = () => {
    setIsCopyMode(!isCopyMode);
    setSourceSession(null);
    setEvidenceFiles([]);
    reset();
  };

  // Handle source session selection
  const handleSelectSourceSession = (session: InventorySession) => {
    setSourceSession(session);
    // Pre-fill form with source session data
    setValue("name", `${session.name} - Copy ${new Date().getFullYear()}`);
    setValue("year", new Date().getFullYear());
  };


  const onSubmit = async (data: any) => {
    try {
      if (!isValid) {
        toast.error("Vui lòng điền đầy đủ và đúng thông tin trong form.");
        return;
      }

      if (isCopyMode) {
        // Copy mode
        if (!sourceSession) {
          toast.error("Vui lòng chọn kì kiểm kê nguồn để sao chép.");
          return;
        }

        const copyData = data as CopyInventoryFormData;
        const copySession: CopyInventorySession = {
          year: copyData.year,
          name: copyData.name,
          startDate: copyData.startDate,
          endDate: copyData.endDate,
          description: copyData.description,
          copyMembers: copyData.copyMembers || false,
          copyGroups: copyData.copyGroups || false,
          copyAssignments: copyData.copyAssignments || false,
          copyFileUrls: copyData.copyFileUrls || false,
          copySubInventories: copyData.copySubInventories !== false, // default true
        };

        const result = await dispatch(
          copyInventorySession({ sourceSessionId: sourceSession.id, copyData: copySession })
        ).unwrap();
        
        if (result) {
          toast.success("Sao chép kỳ kiểm kê thành công!");
          router.push("/inventory");
        }
      } else {
        // Regular create mode
        const formData = data as InventorySessionFormData;
      const newSession: CreateInventorySession = {
          year: formData.year,
          name: formData.name,
          startDate: formData.startDate,
          endDate: formData.endDate,
        fileUrls: evidenceFiles.map((file) => file.url),
      };

      const result = await dispatch(
        createInventorySession(newSession)
      ).unwrap();
        
      if (result) {
        toast.success("Tạo kỳ kiểm kê thành công!");
        router.push("/inventory");
        }
      }
    } catch (error: any) {
      toast.error(error.message || `Có lỗi xảy ra khi ${isCopyMode ? 'sao chép' : 'tạo'} kỳ kiểm kê`);
    }
  };

  // Get unit options for multi-select
  const unitOptions = campuses
    .filter((unit) => unit.status === UnitStatus.ACTIVE)
    .map((unit) => ({
      value: unit.id,
      label: unit.name,
    }));

  useEffect(() => {
    setValue("name", `Kiểm kê tài sản năm ${year}`, {
      shouldValidate: true,
    });
  }, [year, setValue]);
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
        <Link href="/inventory">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
              {isCopyMode ? "Sao chép kỳ kiểm kê" : "Tạo kỳ kiểm kê mới"}
          </h1>
            <p className="text-gray-600">
              {isCopyMode 
                ? "Sao chép từ kỳ kiểm kê có sẵn với các tùy chọn linh hoạt"
                : "Điền đầy đủ thông tin để tạo kỳ kiểm kê mới"
              }
            </p>
          </div>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={!isCopyMode ? "default" : "outline"}
            size="sm"
            onClick={handleToggleCopyMode}
            disabled={createSessionLoading || copySessionLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Tạo mới
          </Button>
          <Button
            type="button"
            variant={isCopyMode ? "default" : "outline"}
            size="sm"
            onClick={handleToggleCopyMode}
            disabled={createSessionLoading || copySessionLoading}
          >
            <Copy className="h-4 w-4 mr-2" />
            Sao chép
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-300">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-6">
            {/* Source Session Selection - Only in Copy Mode */}
            {isCopyMode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-medium text-blue-900">
                      Kỳ kiểm kê nguồn
                    </h3>
                    <p className="text-xs text-blue-700">
                      Chọn kỳ kiểm kê để sao chép cấu trúc và dữ liệu
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCopyModal(true)}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Chọn kỳ kiểm kê
                  </Button>
                </div>
                
                {sourceSession ? (
                  <div className="bg-white border border-blue-200 rounded-md p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {sourceSession.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          Năm {sourceSession.year} • {new Date(sourceSession.startDate).toLocaleDateString("vi-VN")} - {new Date(sourceSession.endDate).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSourceSession(null)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-blue-600 text-sm">
                    Chưa chọn kỳ kiểm kê nguồn
                  </div>
                )}
              </div>
            )}
            {/* Năm và Tên kỳ kiểm kê */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Năm <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Controller
                    name="year"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min="2020"
                        max="2050"
                        placeholder="2024"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    )}
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                {errors.year && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.year.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên kỳ kiểm kê <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      placeholder="VD: Kiểm kê tài sản cuối năm 2024"
                      className="w-full"
                      {...field}
                    />
                  )}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.name.message as string}
                  </p>
                )}
              </div>
            </div>

            {/* Ngày bắt đầu và kết thúc */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      {...field}
                    />
                  )}
                />
                {errors.startDate && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.startDate.message as string}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày kết thúc <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="date"
                      min={startDate || new Date().toISOString().split("T")[0]}
                      {...field}
                    />
                  )}
                />
                {errors.endDate && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.endDate.message as string}
                  </p>
                )}
              </div>
            </div>

            {/* Copy Options - Only in Copy Mode */}
            {isCopyMode && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Tùy chọn sao chép
                </h3>
                
                <div className="space-y-4">
                  {/* Group 1: Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Copy Members */}
                    <div className="flex items-start space-x-3">
                      <Controller
                        name="copyMembers"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="checkbox"
                            id="copyMembers"
                            checked={field.value || false}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        )}
                      />
                      <div className="flex-1">
                        <label htmlFor="copyMembers" className="text-sm font-medium text-gray-700 cursor-pointer">
                          Thành viên ban kiểm kê
                        </label>
                      </div>
                    </div>

                    {/* Copy File URLs */}
                    <div className="flex items-start space-x-3">
                      <Controller
                        name="copyFileUrls"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="checkbox"
                            id="copyFileUrls"
                            checked={field.value || false}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        )}
                      />
                      <div className="flex-1">
                        <label htmlFor="copyFileUrls" className="text-sm font-medium text-gray-700 cursor-pointer">
                          File minh chứng
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>

                  {/* Group 2: Hierarchical Structure */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-800">
                      Cấu trúc tổ chức kiểm kê
                    </h4>
                    
                    {/* Copy Sub Inventories - Level 1 */}
                    <div className="flex items-start space-x-3 pl-0">
                      <Controller
                        name="copySubInventories"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="checkbox"
                            id="copySubInventories"
                            checked={field.value !== false} // default true
                            onChange={(e) => {
                              field.onChange(e.target.checked);
                              // Nếu bỏ chọn Sub Inventories, tự động bỏ chọn Groups và Assignments
                              if (!e.target.checked) {
                                setValue("copyGroups", false);
                                setValue("copyAssignments", false);
                              }
                            }}
                            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        )}
                      />
                      <div className="flex-1">
                        <label htmlFor="copySubInventories" className="text-sm font-medium text-gray-700 cursor-pointer">
                          Tiểu ban kiểm kê
                        </label>
                      </div>
                    </div>

                    {/* Copy Groups - Level 2 (indent) */}
                    {watchedValues.copySubInventories !== false && (
                      <div className="flex items-start space-x-3 pl-6 border-l-2 border-blue-200 ml-2">
                        <Controller
                          name="copyGroups"
                          control={control}
                          render={({ field }) => (
                            <input
                              type="checkbox"
                              id="copyGroups"
                              checked={field.value || false}
                              onChange={(e) => {
                                field.onChange(e.target.checked);
                                // Nếu bỏ chọn Groups, tự động bỏ chọn Assignments
                                if (!e.target.checked) {
                                  setValue("copyAssignments", false);
                                }
                              }}
                              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          )}
                        />
                        <div className="flex-1">
                          <label htmlFor="copyGroups" className="text-sm font-medium text-gray-700 cursor-pointer">
                            Nhóm kiểm kê
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Copy Assignments - Level 3 (deeper indent) */}
                    {watchedValues.copyGroups && (
                      <div className="flex items-start space-x-3 pl-6 border-l-2 border-green-200 ml-8">
                        <Controller
                          name="copyAssignments"
                          control={control}
                          render={({ field }) => (
                            <input
                              type="checkbox"
                              id="copyAssignments"
                              checked={field.value || false}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          )}
                        />
                        <div className="flex-1">
                          <label htmlFor="copyAssignments" className="text-sm font-medium text-gray-700 cursor-pointer">
                            Phân công kiểm kê
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* File minh chứng - Only in regular create mode */}
            {!isCopyMode && (
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
              {(evidenceFiles.length > 0 || uploadingFiles.size > 0) && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    File đã chọn ({evidenceFiles.length}/5):
                  </h4>

                  {/* Uploading files */}
                  {Array.from(uploadingFiles).map((fileName) => (
                    <div
                      key={`uploading-${fileName}`}
                      className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {fileName}
                          </p>
                          <p className="text-xs text-blue-600">
                            Đang upload...
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Uploaded files */}
                  {evidenceFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <File className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)} • PDF •
                            <span className="text-green-600 ml-1">
                              Đã upload
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs underline"
                        >
                          Xem
                        </a>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Xóa file"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-2 text-xs text-gray-500">
                File minh chứng có thể bao gồm: Quyết định thành lập ban kiểm
                kê, Kế hoạch chi tiết, Văn bản hướng dẫn, Biểu mẫu kiểm kê...
              </p>
            </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-8 mt-8 border-t border-gray-200">
            <Link href="/inventory">
              <Button variant="outline" disabled={createSessionLoading || copySessionLoading}>
                Hủy
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={createSessionLoading || copySessionLoading || (isCopyMode && !sourceSession)}
              className="min-w-[140px]"
            >
              {(createSessionLoading || copySessionLoading) ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isCopyMode ? "Đang sao chép..." : "Đang tạo..."}
                </div>
              ) : (
                <>
                  {isCopyMode ? <Copy className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  {isCopyMode ? "Sao chép kỳ kiểm kê" : "Tạo kỳ kiểm kê"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Copy Modal */}
      <CopyInventoryModal
        isOpen={showCopyModal}
        onClose={() => setShowCopyModal(false)}
        onSelectSession={handleSelectSourceSession}
      />
    </div>
  );
}
