"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface TransactionStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { note?: string; approvalNote?: string; rejectionReason?: string }) => void;
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

  const handleConfirm = () => {
    const submitData: { note?: string; approvalNote?: string; rejectionReason?: string } = {};
    
    if (action === 'approve') {
      submitData.approvalNote = note.trim() || undefined;
    } else if (action === 'reject') {
      submitData.rejectionReason = note.trim();
    } else {
      submitData.note = note.trim() || undefined;
    }

    onConfirm(submitData);
  };

  const handleClose = () => {
    setNote("");
    onClose();
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
