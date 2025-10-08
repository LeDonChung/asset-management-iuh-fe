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
} from "lucide-react";
import Link from "next/link";
import {
  InventorySessionFormData,
  InventorySessionStatus,
  UnitStatus,
} from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MultiSelect from "@/components/ui/multi-select";
import { usePermissions } from "@/hooks/usePermissions";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { getUnitCampus } from "@/lib/store/slices/unitSlice";
import { uploadFileDocument } from "@/lib/store/slices/fileSlice";
import {
  createInventorySession,
  CreateInventorySession,
} from "@/lib/store/slices/inventorySlice";
import toast from "react-hot-toast";

// Validation schema
const validationSchema: yup.ObjectSchema<InventorySessionFormData> = yup
  .object()
  .shape({
    year: yup
      .number()
      .required("Năm là bắt buộc")
      .min(2020, "Năm phải từ 2020 trở lên")
      .max(2030, "Năm không được quá 2030"),
    period: yup
      .number()
      .required("Đợt là bắt buộc")
      .min(1, "Đợt phải từ 1 trở lên")
      .max(12, "Đợt không được quá 12"),
    name: yup.string().required("Tên kỳ kiểm kê là bắt buộc"),
    isGlobal: yup.boolean().required(),
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
    unitIds: yup
      .array()
      .of(yup.string().required())
      .when("isGlobal", {
        is: false,
        then: (schema) =>
          schema.min(1, "Vui lòng chọn ít nhất một cơ sở/đơn vị"),
        otherwise: (schema) => schema,
      }),
    fileUrls: yup.array().of(yup.string().required()).optional(),
  });

export default function CreateInventorySessionPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    campuses,
    loading: unitsLoading,
    error: unitsError,
  } = useAppSelector((state) => state.unit);

  const { loading: fileLoading, error: fileError } = useAppSelector(
    (state) => state.file
  );

  const { createSessionLoading } = useAppSelector((state) => state.inventory);
  const { canCreateInventorySession } = usePermissions();
  const [evidenceFiles, setEvidenceFiles] = useState<
    { name: string; url: string; size: number }[]
  >([]);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());

  // Redirect if not authorized
  useEffect(() => {
    if (!canCreateInventorySession) {
      router.push("/unauthorized");
      return;
    }
  }, [canCreateInventorySession, router]);

  // Initialize form with useForm
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm<InventorySessionFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      year: new Date().getFullYear(),
      name: `Kiểm kê tài sản - Đợt ${1}/${new Date().getFullYear()}`,
      period: 1,
      isGlobal: true,
      startDate: "",
      endDate: "",
      unitIds: [],
      status: InventorySessionStatus.PLANNED,
      fileUrls: [],
    },
    mode: "onChange",
  });

  // Watch form values for dynamic updates
  const watchedValues = watch();
  const { year, period, isGlobal, startDate, endDate } = watchedValues;

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

  // Select all units if global is selected
  useEffect(() => {
    if (isGlobal) {
      setValue(
        "unitIds",
        campuses.map((unit) => unit.id),
        { shouldValidate: true }
      );
    }
  }, [isGlobal, setValue, campuses]);

  const onSubmit = async (data: InventorySessionFormData) => {
    try {
      if (!isValid) {
        toast.error("Vui lòng điền đầy đủ và đúng thông tin trong form.");
        return;
      }

      // Create new inventory session object
      const newSession: CreateInventorySession = {
        year: data.year,
        period: data.period,
        name: data.name,
        isGlobal: data.isGlobal,
        startDate: data.startDate,
        endDate: data.endDate,
        fileUrls: evidenceFiles.map((file) => file.url),
        unitIds: data.unitIds ?? [],
      };

      // Dispatch the action and wait for result
      const result = await dispatch(
        createInventorySession(newSession)
      ).unwrap();
      if (result) {
        toast.success("Tạo kỳ kiểm kê thành công!");
        router.push("/inventory");
      }
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi tạo kỳ kiểm kê");
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
    setValue("name", `Kiểm kê tài sản đợt ${period} năm ${year}`, {
      shouldValidate: true,
    });
  }, [year, period]);
  return (
    <div className="mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/inventory">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tạo kỳ kiểm kê mới
          </h1>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-semibold text-gray-900">
              Thông tin kỳ kiểm kê
            </h2>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Điền đầy đủ thông tin để tạo kỳ kiểm kê mới
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-6">
            {/* Năm và Đợt */}
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
                        max="2030"
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
                    {errors.year.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đợt <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Controller
                    name="period"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min="1"
                        max="12"
                        placeholder="1"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    )}
                  />
                  <Hash className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                {errors.period && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.period.message}
                  </p>
                )}
              </div>
            </div>

            {/* Tên kỳ kiểm kê */}
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
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Phạm vi kiểm kê */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phạm vi kiểm kê <span className="text-red-500">*</span>
              </label>
              <Controller
                name="isGlobal"
                control={control}
                render={({ field }) => (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <input
                        type="radio"
                        id="global"
                        value="true"
                        checked={field.value === true}
                        onChange={() => field.onChange(true)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="global"
                        className="flex items-center space-x-3 text-sm text-gray-700 cursor-pointer flex-1"
                      >
                        <Globe className="h-5 w-5 text-blue-600" />
                        <div>
                          <span className="font-medium">Toàn bộ cơ sở</span>
                        </div>
                      </label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <input
                        type="radio"
                        id="unit-specific"
                        value="false"
                        checked={field.value === false}
                        onChange={() => field.onChange(false)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="unit-specific"
                        className="flex items-center space-x-3 text-sm text-gray-700 cursor-pointer flex-1"
                      >
                        <Building2 className="h-5 w-5 text-green-600" />
                        <div>
                          <span className="font-medium">Cơ sở cụ thể</span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              />
            </div>

            {/* Cơ sở/Đơn vị tham gia (chỉ hiện khi không phải global) */}
            {!isGlobal && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cơ sở/Đơn vị tham gia <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  {unitsLoading ? (
                    <div className="flex items-center justify-center p-4 border border-gray-300 rounded-lg bg-gray-50">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                      <span className="text-sm text-gray-600">
                        Đang tải danh sách cơ sở...
                      </span>
                    </div>
                  ) : unitsError ? (
                    <div className="p-4 border border-red-300 rounded-lg bg-red-50">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-800">
                          Lỗi khi tải danh sách cơ sở: {unitsError}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => dispatch(getUnitCampus())}
                        className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                      >
                        Thử lại
                      </button>
                    </div>
                  ) : (
                    <>
                      <Controller
                        name="unitIds"
                        control={control}
                        render={({ field }) => (
                          <MultiSelect
                            options={unitOptions}
                            value={field.value || []}
                            onChange={field.onChange}
                            placeholder="Chọn các cơ sở"
                            className="w-full"
                          />
                        )}
                      />
                      <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-0" />
                    </>
                  )}
                </div>
                {errors.unitIds && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.unitIds.message}
                  </p>
                )}
              </div>
            )}

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
                    {errors.startDate.message}
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
                    {errors.endDate.message}
                  </p>
                )}
              </div>
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
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-8 mt-8 border-t border-gray-200">
            <Link href="/inventory">
              <Button variant="outline" disabled={createSessionLoading}>
                Hủy
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={createSessionLoading}
              className="min-w-[140px]"
            >
              {createSessionLoading ? (
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
    </div>
  );
}
