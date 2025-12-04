"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Unit, UnitType, UnitStatus, User as UserType } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  getUnitById,
  updateUnit,
  UpdateUnitRequest,
  getUnitCampus,
} from "@/lib/store/slices/unitSlice";
import { getUsersWithoutUnit } from "@/lib/store/slices/userSlice";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { PermissionConstants } from "@/hooks/usePermissions";
import { AccessScopeType } from "@/types/asset";


interface UnitFormData {
  name: string;
  phone: string;
  email: string;
  type: UnitType | "";
  representativeId: string;
  parentUnitId: string;
  status: UnitStatus;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  type?: string;
  representativeId?: string;
  parentUnitId?: string;
}

export default function EditUnitPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const unitId = params.id as string;

  const { currentUnit, updateUnitLoading, campuses, loading } = useAppSelector(
    (state) => state.unit
  );

  const { usersWithoutUnit, usersWithoutUnitLoading } = useAppSelector(
    (state) => state.user
  );

  const [formData, setFormData] = useState<UnitFormData>({
    name: "",
    phone: "",
    email: "",
    type: "",
    representativeId: "",
    parentUnitId: "",
    status: UnitStatus.ACTIVE,
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const { user: currentUser, hasAnyPermission } = useAuth();
  const canEdit = hasAnyPermission([PermissionConstants.PERM_UPDATE_UNIT]);
  
  // Kiểm tra access scope types
  const hasGlobalScope = currentUser?.accessScopeTypes?.includes(AccessScopeType.GLOBAL) || false;
  const hasChildUnitsScope = currentUser?.accessScopeTypes?.includes(AccessScopeType.CHILD_UNITS) || false;
  const hasUnitScope = currentUser?.accessScopeTypes?.includes(AccessScopeType.UNIT) || false;

  useEffect(() => {
    dispatch(getUnitById(unitId));
    dispatch(getUsersWithoutUnit());
    dispatch(getUnitCampus());
  }, [dispatch, unitId]);

  useEffect(() => {
    if (currentUnit) {
      setFormData({
        name: currentUnit.name,
        phone: currentUnit.phone || "",
        email: currentUnit.email || "",
        type: currentUnit.type,
        representativeId: currentUnit.representativeId || "",
        parentUnitId: currentUnit.parentUnitId || "",
        status: currentUnit.status,
      });
    }
  }, [currentUnit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Tên đơn vị là bắt buộc";
    
    // Chỉ validate type cho GLOBAL scope
    if (hasGlobalScope && !formData.type) newErrors.type = "Loại đơn vị là bắt buộc";
    
    if (!formData.representativeId)
      newErrors.representativeId = "Người đại diện là bắt buộc";

    // Chỉ require parentUnitId nếu type không phải CAMPUS
    if (
      formData.type &&
      formData.type !== UnitType.CAMPUS &&
      !formData.parentUnitId
    ) {
      newErrors.parentUnitId = "Đơn vị cha là bắt buộc";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const unitData: UpdateUnitRequest = {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          type: formData.type as UnitType,
          representativeId: formData.representativeId,
          status: formData.status,
        };

        // Chỉ thêm parentUnitId nếu type không phải CAMPUS
        if (formData.type !== UnitType.CAMPUS && formData.parentUnitId) {
          unitData.parentUnitId = formData.parentUnitId;
        }

        const result = await dispatch(updateUnit({ id: unitId, unitData })).unwrap();
        if (result) {
          toast.success("Cập nhật đơn vị thành công!");
          router.push("/unit");
        }
      } catch (error: any) {
        toast.error(error.message || "Có lỗi xảy ra khi cập nhật đơn vị!");
      }
    }
  };

  const handleChange = (field: keyof UnitFormData, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Nếu chọn type là CAMPUS, clear parentUnitId
      if (field === "type" && value === UnitType.CAMPUS) {
        newData.parentUnitId = "";
      }

      return newData;
    });

    if (field in errors) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (loading && !currentUnit) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin đơn vị...</p>
        </div>
      </div>
    );
  }

  if (!currentUnit) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Không tìm thấy thông tin đơn vị</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div>
          <div className="flex items-center text-sm sm:text-base text-gray-600 mb-3">
            <button
              onClick={() => router.push("/unit")}
              className="hover:text-blue-600 text-lg sm:text-xl transition-colors font-semibold cursor-pointer"
            >
              Đơn vị
            </button>
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 mx-1 sm:mx-2" />
            <span className="text-gray-900 font-semibold text-lg sm:text-xl">
              Chỉnh sửa
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto rounded-lg border border-gray-300">
        <div className="bg-white p-6 rounded-lg shadow-md"> 
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <div className="grid grid-cols-1 gap-4">
                {/* Unit Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên đơn vị *
                  </label>
                  <Input
                    type="text"
                    className={errors.name ? "border-red-500" : ""}
                    placeholder="Nhập tên đơn vị"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Unit Type - chỉ hiện cho GLOBAL scope */}
                {hasGlobalScope && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loại đơn vị *
                    </label>
                    <div
                      className={`relative ${
                        errors.type ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <select
                        className="w-full px-3 py-2 border rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.type}
                        onChange={(e) => handleChange("type", e.target.value)}
                      >
                        <option value="">Chọn loại đơn vị</option>
                        <option value={UnitType.ADMIN_DEPT}>
                          Phòng quản trị
                        </option>
                        <option value={UnitType.USER_DEPT}>Đơn vị sử dụng</option>
                        <option value={UnitType.CAMPUS}>Cơ sở</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                        <svg
                          className="h-4 w-4 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                    {errors.type && (
                      <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                    )}
                  </div>
                )}

                {/* Parent Unit - chỉ hiện cho GLOBAL scope khi type không phải CAMPUS */}
                {hasGlobalScope && formData.type && formData.type !== UnitType.CAMPUS && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Đơn vị cha *
                    </label>
                    <div
                      className={`relative ${
                        errors.parentUnitId
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <select
                        className="w-full px-3 py-2 border rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.parentUnitId}
                        onChange={(e) =>
                          handleChange("parentUnitId", e.target.value)
                        }
                        disabled={loading}
                      >
                        <option value="">
                          {loading ? "Đang tải..." : "Chọn đơn vị cha"}
                        </option>
                        {campuses.map((campus) => (
                          <option key={campus.id} value={campus.id}>
                            {campus.name}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                        <svg
                          className="h-4 w-4 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                    {errors.parentUnitId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.parentUnitId}
                      </p>
                    )}
                  </div>
                )}

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.status}
                      onChange={(e) =>
                        handleChange("status", e.target.value as UnitStatus)
                      }
                    >
                      <option value={UnitStatus.ACTIVE}>Đang hoạt động</option>
                      <option value={UnitStatus.INACTIVE}>
                        Ngừng hoạt động
                      </option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <div className="grid grid-cols-1 gap-4">
                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <Input
                    type="tel"
                    className=""
                    placeholder="Nhập số điện thoại"
                    required={false}
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    required={false}
                    className=""
                    placeholder="Nhập email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Representative */}
            <div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chọn người đại diện *
                </label>
                <div
                  className={`relative ${
                    errors.representativeId
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  <select
                    className="w-full px-3 py-2 border rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.representativeId}
                    onChange={(e) =>
                      handleChange("representativeId", e.target.value)
                    }
                    disabled={usersWithoutUnitLoading}
                  >
                    <option value="">
                      {usersWithoutUnitLoading
                        ? "Đang tải..."
                        : "Chọn người đại diện"}
                    </option>
                    {usersWithoutUnit.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName} - {user.email}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                {errors.representativeId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.representativeId}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <Link href="/unit" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Hủy bỏ
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={updateUnitLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateUnitLoading ? "Đang cập nhật..." : "Cập nhật đơn vị"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
