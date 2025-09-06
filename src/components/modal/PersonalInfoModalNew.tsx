"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, User, Mail, Phone, Calendar, UserCheck, Save, AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
}

interface PersonalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PersonalInfo) => void;
  initialData?: Partial<PersonalInfo>;
  loading?: boolean;
}

export default function PersonalInfoModalNew({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  loading = false
}: PersonalInfoModalProps) {
  const [formData, setFormData] = useState<PersonalInfo>({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validFields, setValidFields] = useState<Record<string, boolean>>({});

  // Update form data when initialData changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName: initialData.fullName || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        dateOfBirth: initialData.dateOfBirth || ""
      });
      setErrors({});
      setValidFields({});
    }
  }, [isOpen, initialData]);

  const validateField = (field: keyof PersonalInfo, value: string) => {
    let error = "";
    let isValid = false;

    switch (field) {
      case "fullName":
        if (!value.trim()) {
          error = "Vui lòng nhập họ tên";
        } else if (value.trim().length < 2) {
          error = "Họ tên phải có ít nhất 2 ký tự";
        } else if (value.trim().length > 50) {
          error = "Họ tên không được quá 50 ký tự";
        } else {
          isValid = true;
        }
        break;
      case "email":
        if (!value.trim()) {
          error = "Vui lòng nhập email";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Email không hợp lệ";
        } else {
          isValid = true;
        }
        break;
      case "phone":
        if (value && !/^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/.test(value.replace(/\s/g, ""))) {
          error = "Số điện thoại không hợp lệ";
        } else if (value) {
          isValid = true;
        }
        break;
      case "dateOfBirth":
        if (value) {
          const birthDate = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          if (age < 16 || age > 100) {
            error = "Ngày sinh không hợp lệ";
          } else {
            isValid = true;
          }
        }
        break;
    }

    return { error, isValid };
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isFormValid = true;

    Object.keys(formData).forEach((key) => {
      const field = key as keyof PersonalInfo;
      const { error } = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isFormValid = false;
      }
    });

    setErrors(newErrors);
    return isFormValid;
  };

  const handleInputChange = (field: keyof PersonalInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    const { error, isValid } = validateField(field, value);
    
    setErrors(prev => ({ ...prev, [field]: error }));
    setValidFields(prev => ({ ...prev, [field]: isValid }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      dateOfBirth: ""
    });
    setErrors({});
    setValidFields({});
    onClose();
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format Vietnamese phone number
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3)}`;
    } else if (phoneNumber.length <= 8) {
      return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6)}`;
    } else {
      return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6, 8)} ${phoneNumber.slice(8, 10)}`;
    }
  };

  const getFieldIcon = (field: keyof PersonalInfo, hasValue: boolean) => {
    if (!hasValue) return null;
    if (errors[field]) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    if (validFields[field]) {
      return <Check className="h-4 w-4 text-green-500" />;
    }
    return null;
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h2>
              <p className="text-sm text-gray-600 mt-1">Cập nhật và quản lý thông tin tài khoản của bạn</p>
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
          {/* Full Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                placeholder="Nhập họ và tên đầy đủ"
                className={`pl-10 pr-10 h-12 ${
                  errors.fullName 
                    ? "border-red-300 focus:border-red-500 focus:ring-red-200" 
                    : validFields.fullName 
                    ? "border-green-300 focus:border-green-500 focus:ring-green-200"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {getFieldIcon("fullName", !!formData.fullName)}
              </div>
            </div>
            {errors.fullName && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-sm">{errors.fullName}</p>
              </div>
            )}
            {validFields.fullName && !errors.fullName && (
              <div className="flex items-center space-x-2 text-green-600">
                <Check className="h-4 w-4" />
                <p className="text-sm">Họ tên hợp lệ</p>
              </div>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Địa chỉ email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="example@email.com"
                className={`pl-10 pr-10 h-12 ${
                  errors.email 
                    ? "border-red-300 focus:border-red-500 focus:ring-red-200" 
                    : validFields.email 
                    ? "border-green-300 focus:border-green-500 focus:ring-green-200"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {getFieldIcon("email", !!formData.email)}
              </div>
            </div>
            {errors.email && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-sm">{errors.email}</p>
              </div>
            )}
            {validFields.email && !errors.email && (
              <div className="flex items-center space-x-2 text-green-600">
                <Check className="h-4 w-4" />
                <p className="text-sm">Email hợp lệ</p>
              </div>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Số điện thoại
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", formatPhoneNumber(e.target.value))}
                placeholder="0123 456 789"
                className={`pl-10 pr-10 h-12 ${
                  errors.phone 
                    ? "border-red-300 focus:border-red-500 focus:ring-red-200" 
                    : validFields.phone 
                    ? "border-green-300 focus:border-green-500 focus:ring-green-200"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {getFieldIcon("phone", !!formData.phone)}
              </div>
            </div>
            {errors.phone && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-sm">{errors.phone}</p>
              </div>
            )}
            {validFields.phone && !errors.phone && (
              <div className="flex items-center space-x-2 text-green-600">
                <Check className="h-4 w-4" />
                <p className="text-sm">Số điện thoại hợp lệ</p>
              </div>
            )}
            <p className="text-xs text-gray-500">Định dạng: 0XXX XXX XXX</p>
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Ngày sinh
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={`pl-10 pr-10 h-12 ${
                  errors.dateOfBirth 
                    ? "border-red-300 focus:border-red-500 focus:ring-red-200" 
                    : validFields.dateOfBirth 
                    ? "border-green-300 focus:border-green-500 focus:ring-green-200"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {getFieldIcon("dateOfBirth", !!formData.dateOfBirth)}
              </div>
            </div>
            {errors.dateOfBirth && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-sm">{errors.dateOfBirth}</p>
              </div>
            )}
          </div>

          {/* Info Notice */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <UserCheck className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Lưu ý:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Thông tin cá nhân sẽ được sử dụng để liên hệ và xác thực</li>
                  <li>• Email sẽ được dùng để nhận thông báo quan trọng</li>
                  <li>• Vui lòng cung cấp thông tin chính xác và đầy đủ</li>
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
              disabled={loading}
              className="w-full sm:w-auto h-12 px-6 bg-green-600 hover:bg-green-700 text-white font-medium"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang cập nhật...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>Lưu thông tin</span>
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
