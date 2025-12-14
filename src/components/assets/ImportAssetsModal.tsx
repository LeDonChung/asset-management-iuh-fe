"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2 
} from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "@/lib/api";

interface ImportResult {
  totalProcessed: number;
  totalBatches: number;
  batchSize: number;
  successCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    message: string;
    data: any[];
  }>;
  createdAssets: Array<{
    id: string;
    name: string;
    ktCode?: string;
    fixedCode?: string;
    type: string;
    category: string;
    rfidTag?: string;
  }>;
}

interface ImportAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportAssetsModal({
  isOpen,
  onClose,
  onSuccess,
}: ImportAssetsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const validateFile = (file: File): boolean => {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (!validTypes.includes(file.type)) {
      toast.error("Chỉ chấp nhận file Excel (.xlsx, .xls)");
      return false;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("Kích thước file không được vượt quá 10MB");
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await axiosInstance.get(
        "/api/v1/assets/import-template",
        {
          responseType: "blob",
        }
      );

      // Create blob and download
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Mau_Import_Tai_San.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Đã tải file mẫu thành công!");
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Không thể tải file mẫu. Vui lòng thử lại.");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Vui lòng chọn file để upload");
      return;
    }

    setUploading(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axiosInstance.post<ImportResult>(
        "/api/v1/assets/import-unidentified",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setImportResult(response.data);

      if (response.data.errorCount === 0) {
        toast.success(
          `Import thành công ${response.data.successCount} tài sản!`
        );
        onSuccess();
      } else if (response.data.successCount > 0) {
        toast.success(
          `Import thành công ${response.data.successCount} tài sản, ${response.data.errorCount} lỗi`
        );
      } else {
        toast.error("Import thất bại. Vui lòng kiểm tra lại file.");
      }
    } catch (error: any) {
      console.error("Error importing assets:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Có lỗi xảy ra khi import tài sản"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setImportResult(null);
    onClose();
  };

  const handleReset = () => {
    setFile(null);
    setImportResult(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nhập tài sản từ Excel"
      size="lg"
    >
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                className="bg-white hover:bg-blue-50 border-blue-300"
              >
                <Download className="h-4 w-4 mr-2" />
                Tải xuống file mẫu
              </Button>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        {!importResult && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn file Excel
            </label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              <div className="space-y-3">
                {file ? (
                  <>
                    <FileSpreadsheet className="h-12 w-12 text-green-600 mx-auto" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      disabled={uploading}
                    >
                      Chọn file khác
                    </Button>
                  </>
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-sm text-gray-600">
                        Kéo thả file vào đây hoặc click để chọn
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Chỉ chấp nhận file .xlsx, .xls (tối đa 10MB)
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Result Section */}
        {importResult && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {importResult.totalProcessed}
                </div>
                <div className="text-sm text-gray-600">Tổng số dòng</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {importResult.successCount}
                </div>
                <div className="text-sm text-gray-600">Thành công</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {importResult.errorCount}
                </div>
                <div className="text-sm text-gray-600">Lỗi</div>
              </div>
            </div>

            {/* Success List */}
            {importResult.successCount > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Tài sản import thành công ({importResult.successCount})
                </h4>
                <div className="space-y-2">
                  {importResult.createdAssets.map((asset, index) => (
                    <div
                      key={asset.id}
                      className="bg-white rounded px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-gray-900">
                        {asset.name}
                      </span>
                      {asset.ktCode && (
                        <span className="text-gray-500 ml-2">
                          ({asset.ktCode})
                        </span>
                      )}
                      {asset.rfidTag && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          RFID: {asset.rfidTag}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error List */}
            {importResult.errorCount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                <h4 className="font-medium text-red-900 mb-3 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  Lỗi import ({importResult.errorCount})
                </h4>
                <div className="space-y-2">
                  {importResult.errors.map((error, index) => (
                    <div
                      key={index}
                      className="bg-white rounded px-3 py-2 text-sm"
                    >
                      <div className="font-medium text-red-900">
                        Dòng {error.row}
                      </div>
                      <div className="text-red-700 text-xs mt-1">
                        {error.message}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          {importResult ? (
            <>
              <Button variant="outline" onClick={handleReset}>
                Import thêm
              </Button>
              <Button onClick={handleClose}>Đóng</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose} disabled={uploading}>
                Hủy
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang import...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
