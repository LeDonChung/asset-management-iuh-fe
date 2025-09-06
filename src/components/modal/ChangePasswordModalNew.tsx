"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, Eye, EyeOff, Lock, Shield, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => void;
  loading?: boolean;
}

export default function ChangePasswordModalNew({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}: ChangePasswordModalProps) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    checks: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    }
  });

  const checkPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const score = Object.values(checks).filter(Boolean).length;
    return { score, checks };
  };

  const getPasswordStrengthText = (score: number) => {
    if (score <= 2) return { text: "Yếu", color: "text-red-600", bgColor: "bg-red-100" };
    if (score <= 3) return { text: "Trung bình", color: "text-yellow-600", bgColor: "bg-yellow-100" };
    if (score <= 4) return { text: "Mạnh", color: "text-blue-600", bgColor: "bg-blue-100" };
    return { text: "Rất mạnh", color: "text-green-600", bgColor: "bg-green-100" };
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else {
      const strength = checkPasswordStrength(formData.newPassword);
      if (strength.score < 3) {
        newErrors.newPassword = "Mật khẩu quá yếu. Vui lòng tạo mật khẩu mạnh hơn";
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (formData.currentPassword === formData.newPassword && formData.newPassword) {
      newErrors.newPassword = "Mật khẩu mới không được trùng với mật khẩu hiện tại";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === "newPassword") {
      setPasswordStrength(checkPasswordStrength(value));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleClose = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setErrors({});
    setPasswordStrength({
      score: 0,
      checks: {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
      }
    });
    onClose();
  };

  if (!isOpen) return null;

  const strengthInfo = getPasswordStrengthText(passwordStrength.score);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Thay đổi mật khẩu</h2>
              <p className="text-sm text-gray-600 mt-1">Cập nhật mật khẩu bảo mật cho tài khoản của bạn</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-white/50 hover:text-gray-600 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current Password */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Mật khẩu hiện tại <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type={showPasswords.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                className={`pl-10 pr-10 h-12 ${errors.currentPassword ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"}`}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-sm">{errors.currentPassword}</p>
              </div>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => handleInputChange("newPassword", e.target.value)}
                placeholder="Nhập mật khẩu mới"
                className={`pl-10 pr-10 h-12 ${errors.newPassword ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"}`}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-sm">{errors.newPassword}</p>
              </div>
            )}

            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Độ mạnh mật khẩu:</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${strengthInfo.bgColor} ${strengthInfo.color}`}>
                    {strengthInfo.text}
                  </span>
                </div>
                
                {/* Strength Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength.score <= 2 ? 'bg-red-500' :
                      passwordStrength.score <= 3 ? 'bg-yellow-500' :
                      passwordStrength.score <= 4 ? 'bg-blue-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  />
                </div>

                {/* Requirements Checklist */}
                <div className="grid grid-cols-1 gap-1">
                  <div className={`flex items-center space-x-2 text-xs ${passwordStrength.checks.length ? 'text-green-600' : 'text-gray-500'}`}>
                    <Check className={`h-3 w-3 ${passwordStrength.checks.length ? 'text-green-600' : 'text-gray-300'}`} />
                    <span>Ít nhất 8 ký tự</span>
                  </div>
                  <div className={`flex items-center space-x-2 text-xs ${passwordStrength.checks.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                    <Check className={`h-3 w-3 ${passwordStrength.checks.uppercase ? 'text-green-600' : 'text-gray-300'}`} />
                    <span>Có chữ hoa (A-Z)</span>
                  </div>
                  <div className={`flex items-center space-x-2 text-xs ${passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                    <Check className={`h-3 w-3 ${passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-300'}`} />
                    <span>Có chữ thường (a-z)</span>
                  </div>
                  <div className={`flex items-center space-x-2 text-xs ${passwordStrength.checks.number ? 'text-green-600' : 'text-gray-500'}`}>
                    <Check className={`h-3 w-3 ${passwordStrength.checks.number ? 'text-green-600' : 'text-gray-300'}`} />
                    <span>Có số (0-9)</span>
                  </div>
                  <div className={`flex items-center space-x-2 text-xs ${passwordStrength.checks.special ? 'text-green-600' : 'text-gray-500'}`}>
                    <Check className={`h-3 w-3 ${passwordStrength.checks.special ? 'text-green-600' : 'text-gray-300'}`} />
                    <span>Có ký tự đặc biệt (!@#$%^&*)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Xác nhận mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className={`pl-10 pr-10 h-12 ${errors.confirmPassword ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"}`}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-sm">{errors.confirmPassword}</p>
              </div>
            )}
            {formData.confirmPassword && formData.newPassword && formData.confirmPassword === formData.newPassword && (
              <div className="flex items-center space-x-2 text-green-600">
                <Check className="h-4 w-4" />
                <p className="text-sm">Mật khẩu khớp</p>
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Lưu ý bảo mật:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Không chia sẻ mật khẩu với bất kỳ ai</li>
                  <li>• Sử dụng mật khẩu khác với các tài khoản khác</li>
                  <li>• Thay đổi mật khẩu định kỳ để tăng cường bảo mật</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end space-y-2 space-y-reverse sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="w-full sm:w-auto h-12 px-6 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={loading || passwordStrength.score < 3}
              className="w-full sm:w-auto h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang cập nhật...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Cập nhật mật khẩu</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
