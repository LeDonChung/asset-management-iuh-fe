"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import {
  InventorySession,
  InventorySessionFormData,
  InventorySessionStatus,
  UnitStatus,
} from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MultiSelect from "@/components/ui/multi-select";
import { PermissionConstants, usePermissions } from "@/hooks/usePermissions";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { getUnitCampus } from "@/lib/store/slices/unitSlice";
import { uploadFileDocument } from "@/lib/store/slices/fileSlice";
import {
  updateInventorySession,
  UpdateInventorySession,
  findByIdInventorySession,
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

export default function EditInventorySessionPage() {
  const params = useParams();
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

  const { createSessionLoading, findByIdLoading } = useAppSelector(
    (state) => state.inventory
  );
  const { hasAnyPermission } = usePermissions();
  const canUpdate = hasAnyPermission([PermissionConstants.PERM_UPDATE_INVENTORY]);
  const [evidenceFiles, setEvidenceFiles] = useState<
    { name: string; url: string; size: number }[]
  >([]);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [session, setSession] = useState<InventorySession | null>(null);

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
      name: "",
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

  // Mock data fetch - replace with actual API call
  useEffect(() => {
    const fetchSession = async () => {
      try {

        const result = await dispatch(findByIdInventorySession(params.id as string)).unwrap();

        setSession(result);

        const fileUrls = result.fileUrls?.map((f: any) => f.url) ?? [];
        // Populate form with existing data
        reset({
          year: result.year,
          name: result.name,
          startDate: result.startDate,
          endDate: result.endDate,
          status: result.status,
          fileUrls: fileUrls,
        });

        // https://pub-9a9604e4efdb40359db63e6d1f0d33f0.r2.dev/documents/2025/09/15/document-1757925924716.pdf
        // -> document-1757925924716.pdf
        setEvidenceFiles(fileUrls.map((f: any) => ({
          name: f?.split('/').pop() || "file.pdf",
          url: f ?? "",
        })));

      } catch (error) {
        console.error("Error fetching session:", error);
        toast.error("Không thể tải thông tin kỳ kiểm kê. Vui lòng thử lại.");
        router.push("/inventory");
      }
    };

    if (params.id) {
      fetchSession();
    }
  }, [params.id, router, reset]);
  useEffect(() => {
    setValue("name", `Kiểm kê tài sản năm ${year}`, { shouldValidate: true });
  }, [year, setValue]);
  // Redirect if not authorized
  useEffect(() => {
    if (!canUpdate) {
      router.push("/unauthorized");
      return;
    }
  }, [canUpdate, router]);

  // Check if session can be edited
  useEffect(() => {
    if (session && session.status !== InventorySessionStatus.PLANNED) {
      toast.error("Chỉ có thể chỉnh sửa kỳ kiểm kê ở trạng thái 'Kế hoạch'");
      router.push(`/inventory`);
      return;
    }
  }, [session, router]);

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


  const onSubmit = async (data: InventorySessionFormData) => {
    try {
      if (!isValid) {
        toast.error("Vui lòng điền đầy đủ và đúng thông tin trong form.");
        return;
      }

      if (!session?.id) {
        toast.error("Không tìm thấy thông tin kỳ kiểm kê.");
        return;
      }

      // Create update inventory session object
      const updateSession: UpdateInventorySession = {
        year: data.year,
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        fileUrls: evidenceFiles.map((file) => file.url),
      };

      // Dispatch the action and wait for result
      const result = await dispatch(
        updateInventorySession({ id: session.id, sessionData: updateSession })
      ).unwrap();
      if (result) {
        toast.success("Cập nhật kỳ kiểm kê thành công!");
        router.push("/inventory");
      }

    } catch (error: any) {  
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật kỳ kiểm kê");
    }
  };

  // Get unit options for multi-select
  const unitOptions = campuses
    .filter((unit) => unit.status === UnitStatus.ACTIVE)
    .map((unit) => ({
      value: unit.id,
      label: unit.name,
    }));

  if (findByIdLoading) {
    return (
      <div className="max-w-7xl mx-auto w-full space-y-8">
        <div className="flex items-center space-x-4">
          <Link href="/inventory">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa kỳ kiểm kê</h1>
            <p className="text-gray-600">Đang tải thông tin kỳ kiểm kê...</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto w-full space-y-8">
        <div className="flex items-center space-x-4">
          <Link href="/inventory">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa kỳ kiểm kê</h1>
            <p className="text-gray-600">Không tìm thấy kỳ kiểm kê</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy kỳ kiểm kê</h3>
          <p className="text-gray-500 mb-6">Kỳ kiểm kê không tồn tại hoặc đã bị xóa.</p>
          <Link href="/inventory">
            <Button>Quay lại danh sách</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm sm:text-base text-gray-600 mb-2">
          <Link href="/inventory" className="hover:text-gray-900 text-gray-900 font-semibold text-lg sm:text-xl">
            Kiểm kê
          </Link>
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 mx-1 sm:mx-2" />
          <span className="text-gray-900 font-semibold text-lg sm:text-xl">
            Chỉnh sửa
          </span>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-300">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-6">
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
                <p className="mt-1 text-xs text-gray-500">
                  Mỗi năm chỉ có một kỳ kiểm kê duy nhất cho toàn bộ hệ thống
                </p>
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
                    {errors.name.message}
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
                            {file.size ? formatFileSize(file.size) + " PDF •": ""}
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
                  Đang cập nhật...
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Cập nhật kỳ kiểm kê
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
