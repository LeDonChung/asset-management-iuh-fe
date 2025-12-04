"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { FileText, X, Link2, Upload, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAppDispatch } from "@/lib/store/hooks";
import { uploadFileDocument } from "@/lib/store/slices/fileSlice";
import toast from "react-hot-toast";

interface TransactionStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { note?: string; approvalNote?: string; rejectionReason?: string; evidenceUrl?: string }) => void;
  title: string;
  description: string;
  action: 'propose' | 'approve' | 'reject';
  isLoading?: boolean;
}

export default function TransactionStatusModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  action,
  isLoading = false,
}: TransactionStatusModalProps) {
  const [note, setNote] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const dispatch = useAppDispatch();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error("Chỉ cho phép file PDF, Word hoặc ảnh (.pdf, .doc, .docx, .jpg, .png)");
        return;
      }

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 10MB");
        return;
      }

      setEvidenceFile(file);

      // Auto upload file
      setIsUploading(true);
      try {
        const result = await dispatch(uploadFileDocument(file)).unwrap();
        setEvidenceUrl(result.url);
        toast.success("Upload file thành công");
      } catch (error: any) {
        console.error("Upload error:", error);
        toast.error(error.message || "Có lỗi xảy ra khi upload file");
        setEvidenceFile(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleConfirm = () => {
    const submitData: { note?: string; approvalNote?: string; rejectionReason?: string; evidenceUrl?: string } = {};
    
    if (action === 'approve') {
      submitData.approvalNote = note.trim() || undefined;
      submitData.evidenceUrl = evidenceUrl.trim() || undefined;
    } else if (action === 'reject') {
      submitData.rejectionReason = note.trim();
    } else {
      submitData.note = note.trim() || undefined;
      submitData.evidenceUrl = evidenceUrl.trim() || undefined;
    }

    onConfirm(submitData);
  };

  const handleClose = () => {
    setNote("");
    setEvidenceFile(null);
    setEvidenceUrl("");
    onClose();
  };

  const getFileName = () => {
    if (evidenceFile) {
      return evidenceFile.name;
    }
    return "Chưa chọn file";
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Note field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {action === 'reject' ? 'Lý do từ chối' : 'Ghi chú'}
              {action === 'reject' ? (
                <span className="text-red-500"> *</span>
              ) : (
                <span className="text-gray-500"> (tùy chọn)</span>
              )}
            </label>
            <Textarea
              placeholder={
                action === 'reject'
                  ? 'Nhập lý do từ chối...'
                  : 'Nhập ghi chú...'
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Evidence upload - show for approve and propose actions */}
          {(action === 'approve' || action === 'propose') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Minh chứng</span>
                  <span className="text-gray-500">(tùy chọn)</span>
                </div>
              </label>

              {!evidenceUrl ? (
                <div className="space-y-3">
                  <div className="relative">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-600 mb-2">
                        Kéo thả file hoặc click để chọn
                      </div>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        disabled={isUploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {isUploading && (
                        <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-blue-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            Đang upload...
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Hỗ trợ file PDF, Word, ảnh (.pdf, .doc, .docx, .jpg, .png). Tối đa 10MB.
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-green-800">
                        {getFileName()}
                      </div>
                      <div className="text-xs text-green-600">
                        Upload thành công
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEvidenceFile(null);
                      setEvidenceUrl("");
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 p-6 pt-0">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              isLoading ||
              (action === 'reject' && !note.trim())
            }
            className="min-w-[100px]"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang xử lý...</span>
              </div>
            ) : (
              "Xác nhận"
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
