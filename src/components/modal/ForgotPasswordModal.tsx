"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, Mail, User, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({
  isOpen,
  onClose
}: ForgotPasswordModalProps) {
  const [identifier, setIdentifier] = useState("");
  const [identifierType, setIdentifierType] = useState<"email" | "studentId">("studentId");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateStudentId = (studentId: string) => {
    // Vietnamese student ID format: 8 digits starting with year
    const studentIdRegex = /^\d{8}$/;
    return studentIdRegex.test(studentId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim()) {
      setError(identifierType === "email" ? "Email không được để trống" : "Mã sinh viên không được để trống");
      return;
    }

    if (identifierType === "email" && !validateEmail(identifier)) {
      setError("Email không hợp lệ");
      return;
    }

    if (identifierType === "studentId" && !validateStudentId(identifier)) {
      setError("Mã sinh viên không hợp lệ (8 chữ số)");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement API call to send reset password
      console.log('Sending reset password for:', identifierType, identifier);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitted(true);
      toast.success('Yêu cầu đặt lại mật khẩu đã được gửi!');
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIdentifier("");
    setIdentifierType("studentId");
    setError("");
    setIsSubmitted(false);
    onClose();
  };

  const handleBackToLogin = () => {
    handleClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">QUÊN MẬT KHẨU</h2>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-white/80 hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Nhập vào {identifierType === "email" ? "email" : "mã sinh viên"} của bạn
                </p>
                
                {/* Identifier Type Toggle */}
                <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIdentifierType("studentId");
                      setIdentifier("");
                      setError("");
                    }}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      identifierType === "studentId"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <User className="h-4 w-4 inline mr-2" />
                    Mã sinh viên
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIdentifierType("email");
                      setIdentifier("");
                      setError("");
                    }}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      identifierType === "email"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email
                  </button>
                </div>

                {/* Input Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {identifierType === "email" ? "Email" : "Mã sinh viên"} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    {identifierType === "email" ? (
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    ) : (
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    )}
                    <Input
                      type={identifierType === "email" ? "email" : "text"}
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder={identifierType === "email" ? "example@email.com" : "01xxxxx"}
                      className={`pl-10 ${error ? "border-red-500 focus:ring-red-500" : ""}`}
                    />
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>Đang xử lý...</span>
                    </div>
                  ) : (
                    "Quên mật khẩu"
                  )}
                </Button>
                
                <div className="text-center">
                  <span className="text-sm text-gray-500">Hoặc</span>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToLogin}
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại Đăng Nhập
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Yêu cầu đã được gửi!
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến {identifierType === "email" ? "email" : "mã sinh viên"} <strong>{identifier}</strong>.
                </p>
                <p className="text-xs text-gray-500">
                  Vui lòng kiểm tra và làm theo hướng dẫn để đặt lại mật khẩu.
                </p>
              </div>
              <Button
                onClick={handleBackToLogin}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại đăng nhập
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
