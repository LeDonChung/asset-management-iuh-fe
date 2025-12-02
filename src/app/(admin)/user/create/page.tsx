"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Save,
    User as UserIcon,
    Mail,
    Phone,
    Calendar,
    Building,
    Eye,
    EyeOff,
    Users,
    Settings,
    CheckSquare,
} from "lucide-react";
import {
    User,
    UserStatus,
    Role,
    Unit,
    UnitType,
    UnitStatus,
} from "@/types/asset";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RoleSelectionModal from "@/components/user/RoleSelectionModal";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { RootState } from "@/lib/store";
import { getAllUnits, getUnitCampus } from "@/lib/store/slices/unitSlice";
import { findAllRoles } from "@/lib/store/slices/roleSlice";
import { CreateUser, createUser } from "@/lib/store/slices/userSlice";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AccessScopeType } from "@/types/asset";

export default function CreateUserPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { campuses } = useAppSelector((state: RootState) => state.unit);
    const { allRoles, loading } = useAppSelector(
        (state: RootState) => state.role
    );
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        fullName: "",
        email: "",
        phoneNumber: "",
        birthDate: "",
        unitId: "",
        status: UserStatus.ACTIVE,
        password: "",
    });
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [unitCampusSelected, setUnitCampusSelected] = useState<Unit>(null as Unit);
    const [units, setUnits] = useState<Unit[]>(
        unitCampusSelected?.childUnits ?? []
    );

    const { user } = useAuth();

    // Kiểm tra access scope types
    const hasGlobalScope = user?.accessScopeTypes?.includes(AccessScopeType.GLOBAL) || false;
    const hasChildUnitsScope = user?.accessScopeTypes?.includes(AccessScopeType.CHILD_UNITS) || false;
    const hasUnitScope = user?.accessScopeTypes?.includes(AccessScopeType.UNIT) || false;

    useEffect(() => {
        dispatch(getUnitCampus());
        dispatch(findAllRoles());
    }, [dispatch]);

    // Xử lý logic theo access scope khi có dữ liệu campuses
    useEffect(() => {
        if (campuses.length === 0 || !user?.unitId) return;

        if (hasChildUnitsScope) {
            // CHILD_UNITS scope: unitId chính là campus ID
            const userCampus = campuses.find(campus => campus.id === user.unitId);
            if (userCampus) {
                setUnitCampusSelected(userCampus);
            }
        } else if (hasUnitScope) {
            // UNIT scope: Đặt đơn vị mặc định là đơn vị của user hiện tại
            setFormData(prev => ({ ...prev, unitId: user.unitId }));

            // Tìm campus tương ứng qua childUnits
            const userCampus = campuses.find(campus =>
                campus.childUnits?.some(unit => unit.id === user.unitId)
            );
            if (userCampus) {
                setUnitCampusSelected(userCampus);
            }
        }
    }, [campuses, hasGlobalScope, hasChildUnitsScope, hasUnitScope, user]);

    useEffect(() => {
        if (unitCampusSelected) {
            setUnits(unitCampusSelected.childUnits ?? []);

            // Nếu có role ADMIN_DEPT và đã chọn campus, tự động set unitId = campus ID
            if (shouldDisableUnitSelection() && unitCampusSelected.id) {
                setFormData(prev => ({ ...prev, unitId: unitCampusSelected.id }));
            }
        }
    }, [unitCampusSelected, selectedRoles]);

    // Kiểm tra xem có nên disable việc chọn đơn vị không (khi chọn role ADMIN_DEPT)
    const shouldDisableUnitSelection = () => {
        return selectedRoles.some(roleId => {
            const role = allRoles.find(r => r.id === roleId);
            return role?.code === 'ADMIN_DEPT';
        });
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleRoleSelection = (roleIds: string[]) => {
        setSelectedRoles(roleIds);

        // Kiểm tra xem có role ADMIN_DEPT (Trưởng phòng quản trị) không
        const hasAdminDeptRole = roleIds.some(roleId => {
            const role = allRoles.find(r => r.id === roleId);
            return role?.code === 'ADMIN_DEPT';
        });

        // Nếu có role ADMIN_DEPT thì set unitId = campus ID
        if (hasAdminDeptRole && unitCampusSelected?.id) {
            setFormData(prev => ({ ...prev, unitId: unitCampusSelected.id }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.username.trim()) {
            newErrors.username = "Tài khoản là bắt buộc";
        }
        if (!formData.fullName.trim()) {
            newErrors.fullName = "Họ và tên là bắt buộc";
        }
        if (!formData.email.trim()) {
            newErrors.email = "Email là bắt buộc";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email không hợp lệ";
        }
        if (!formData.password.trim()) {
            newErrors.password = "Mật khẩu là bắt buộc";
        } else if (formData.password.length < 6) {
            newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        }
        if (!formData.unitId) {
            newErrors.unitId = "Đơn vị là bắt buộc";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const newUser: CreateUser = {
                username: formData.username,
                password: formData.password,
                fullName: formData.fullName,
                email: formData.email,
                phoneNumber: formData.phoneNumber || undefined,
                birthDate: formData.birthDate || undefined,
                unitId: formData.unitId,
                status: formData.status,
                roleIds: selectedRoles.length > 0 ? selectedRoles : [],
            };

            console.log("Creating user:", newUser);
            const result = await dispatch(createUser(newUser)).unwrap();
            if (result) {
                toast.success("Tạo người dùng thành công");
                router.push("/user");
            }
        } catch (e) {
            const errorMessage =
                typeof e === "object" && e !== null && "message" in e
                    ? (e as { message?: string }).message
                    : undefined;
            toast.error(errorMessage || "Đã có lỗi xảy ra khi tạo người dùng");
        } finally {
            setIsLoading(false);
        }
    };

    const selectedRoleObjects = allRoles.filter((role) =>
        selectedRoles.includes(role.id)
    );

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <Link href="/user">
                    <Button variant="ghost" size="icon" className="rounded-lg">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Thêm người dùng mới
                    </h1>
                    <p className="text-gray-600">
                        Tạo tài khoản người dùng và phân quyền
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-xl border border-gray-300">
                    {/* Form Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <div className="">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Thông tin cơ bản
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Form Body */}
                    <div className="px-6 py-6 space-y-6">
                        {/* Tài khoản và Họ tên */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tài khoản (Mã nhân viên){" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={formData.username}
                                    onChange={(e) =>
                                        handleInputChange("username", e.target.value)
                                    }
                                    placeholder="VD: NV001"
                                    className={errors.username ? "border-red-500" : ""}
                                />
                                {errors.username && (
                                    <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Họ và tên <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={formData.fullName}
                                    onChange={(e) =>
                                        handleInputChange("fullName", e.target.value)
                                    }
                                    placeholder="Nhập họ và tên"
                                    className={errors.fullName ? "border-red-500" : ""}
                                />
                                {errors.fullName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                                )}
                            </div>
                        </div>

                        {/* Email và Số điện thoại */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        placeholder="email@iuh.edu.vn"
                                        className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                                    />
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                </div>
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Số điện thoại
                                </label>
                                <div className="relative">
                                    <Input
                                        value={formData.phoneNumber}
                                        onChange={(e) =>
                                            handleInputChange("phoneNumber", e.target.value)
                                        }
                                        placeholder="0901234567"
                                        className="pl-10"
                                    />
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        {/* Ngày sinh và Đơn vị */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ngày sinh
                                </label>
                                <div className="relative">
                                    <Input
                                        type="date"
                                        value={formData.birthDate}
                                        onChange={(e) =>
                                            handleInputChange("birthDate", e.target.value)
                                        }
                                        className="pl-10"
                                    />
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                </div>
                            </div>
                            {/* Mật khẩu */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mật khẩu <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) =>
                                            handleInputChange("password", e.target.value)
                                        }
                                        placeholder="Nhập mật khẩu"
                                        className={`pr-10 ${errors.password ? "border-red-500" : ""
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    Mật khẩu phải có ít nhất 6 ký tự
                                </p>
                            </div>
                        </div>

                        <div className={`grid grid-cols-1 ${hasGlobalScope ? 'md:grid-cols-2' : ''} gap-6`}>
                            {/* Chỉ hiển thị chọn cơ sở cho GLOBAL scope */}
                            {hasGlobalScope && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Cơ sở<span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={unitCampusSelected?.id || ""}
                                            onChange={(e) => {
                                                const selectedCampus = campuses.find((unit) => unit.id === e.target.value);
                                                if (selectedCampus) {
                                                    setUnitCampusSelected(selectedCampus);
                                                }
                                                handleInputChange("unitId", ""); // Reset unitId khi đổi campus
                                            }}
                                            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.unitId ? "border-red-500" : "border-gray-300"
                                                }`}
                                        >
                                            <option value="">Chọn cơ sở</option>
                                            {campuses.map((unit) => (
                                                <option key={unit.id} value={unit.id}>
                                                    {unit.name}
                                                </option>
                                            ))}
                                        </select>
                                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    </div>
                                </div>
                            )}
                            {unitCampusSelected && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Đơn vị<span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={formData.unitId}
                                            onChange={(e) =>
                                                handleInputChange("unitId", e.target.value)
                                            }
                                            disabled={hasUnitScope || shouldDisableUnitSelection()} // Disable cho UNIT scope hoặc khi chọn role ADMIN_DEPT
                                            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.unitId ? "border-red-500" : "border-gray-300"
                                                } ${(hasUnitScope || shouldDisableUnitSelection()) ? "bg-gray-50 cursor-not-allowed" : ""}`}
                                        >
                                            <option value="">Chọn đơn vị</option>
                                            {/* Nếu có role ADMIN_DEPT thì chỉ hiển thị campus */}
                                            {shouldDisableUnitSelection() ? (
                                                unitCampusSelected && (
                                                    <option value={unitCampusSelected.id}>
                                                        {unitCampusSelected.name} (Cơ sở)
                                                    </option>
                                                )
                                            ) : (
                                                units.map((unit) => (
                                                    <option key={unit.id} value={unit.id}>
                                                        {unit.name}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    </div>
                                    {errors.unitId && (
                                        <p className="text-red-500 text-sm mt-1">{errors.unitId}</p>
                                    )}
                                    {shouldDisableUnitSelection() && (
                                        <p className="text-blue-600 text-sm mt-1">
                                            Trưởng phòng quản trị được gán trực tiếp vào cơ sở
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Roles Section */}
                <div className="bg-white rounded-xl border border-gray-300">
                    {/* Form Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                    Phân quyền
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Form Body */}
                    <div className="px-6 py-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Vai trò
                            </label>
                            <div className="space-y-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsRoleModalOpen(true)}
                                    className="w-full justify-between"
                                >
                                    <span className="flex items-center gap-2">Chọn vai trò</span>
                                </Button>

                                {selectedRoleObjects.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-700">
                                            Đã chọn:
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedRoleObjects.map((role) => (
                                                <Badge
                                                    key={role.id}
                                                    className="bg-purple-100 text-purple-800 flex items-center gap-1"
                                                >
                                                    {role.name}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedRoles((prev) =>
                                                                prev.filter((id) => id !== role.id)
                                                            )
                                                        }
                                                        className="ml-1 hover:bg-purple-200 rounded"
                                                    >
                                                        ×
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Trạng thái
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) =>
                                    handleInputChange("status", e.target.value as UserStatus)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value={UserStatus.ACTIVE}>Đang hoạt động</option>
                                <option value={UserStatus.INACTIVE}>Không hoạt động</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-4 pt-6">
                    <Link href="/user">
                        <Button variant="outline">Hủy</Button>
                    </Link>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        {isLoading ? "Đang lưu..." : "Lưu người dùng"}
                    </Button>
                </div>
            </form>

            {/* Role Selection Modal */}
            <RoleSelectionModal
                isOpen={isRoleModalOpen}
                onClose={() => setIsRoleModalOpen(false)}
                roles={allRoles}
                selectedRoleIds={selectedRoles}
                onSave={handleRoleSelection}
            />
        </div>
    );
}
