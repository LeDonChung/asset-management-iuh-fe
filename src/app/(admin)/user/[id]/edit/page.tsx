"use client";

import React, { useState, useEffect } from "react";
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
    Shield,
    Users,
    Settings,
    CheckSquare,
    ChevronRight
} from "lucide-react";
import { User, UserStatus, Role, Unit, UnitType, UnitStatus } from "@/types/asset";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import RoleSelectionModal from "@/components/user/RoleSelectionModal";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { RootState } from "@/lib/store";
import { findUserById, updateUser, UpdateUser } from "@/lib/store/slices/userSlice";
import { getAllUnits, getUnitCampus } from "@/lib/store/slices/unitSlice";
import { findAllRoles } from "@/lib/store/slices/roleSlice";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AccessScopeType } from "@/types/asset";

export default function EditUserPage() {
    const router = useRouter();
    const params = useParams(); 
    const userId = params.id as string;
    const dispatch = useAppDispatch();
    const { campuses } = useAppSelector((state: RootState) => state.unit);
    const { allRoles } = useAppSelector((state: RootState) => state.role);
    const { user } = useAppSelector((state: RootState) => state.user);       
    const [isLoading, setIsLoading] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        fullName: "",
        email: "",
        phoneNumber: "",
        birthDate: "",
        unitId: "",
        status: UserStatus.ACTIVE
    });
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [unitCampusSelected, setUnitCampusSelected] = useState<Unit>();
    const [units, setUnits] = useState<Unit[]>([]);
    
    const { user: currentUser } = useAuth();
    
    // Kiểm tra access scope types
    const hasGlobalScope = currentUser?.accessScopeTypes?.includes(AccessScopeType.GLOBAL) || false;
    const hasChildUnitsScope = currentUser?.accessScopeTypes?.includes(AccessScopeType.CHILD_UNITS) || false;
    const hasUnitScope = currentUser?.accessScopeTypes?.includes(AccessScopeType.UNIT) || false;
    
    console.log("UserId from params:", userId);    

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

    useEffect(() => {
        const fetchData = async () => {
            dispatch(getUnitCampus());
            dispatch(findAllRoles());
            setLoading(true);
            try {
                const userData = await dispatch(findUserById(userId)).unwrap();
                
                // Check quyền chỉnh sửa cho UNIT scope
                if (hasUnitScope && currentUser?.unitId && userData?.unitId !== currentUser.unitId) {
                    toast.error("Bạn không có quyền chỉnh sửa user này");
                    router.push("/user");
                    return;
                }
                
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error("Error fetching user:", error);
                toast.error("Không thể tải thông tin user");
                router.push("/user");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId, dispatch, hasUnitScope, currentUser, router]);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || "",
                fullName: user.fullName || "",
                email: user.email || "",
                phoneNumber: user.phoneNumber || "",
                birthDate: user.birthDate || "",
                unitId: user.unitId || "",
                status: user.status || UserStatus.ACTIVE
            });
            setSelectedRoles(user.roles ? user.roles.map(role => role.id) : []);
            
            // Find and set the campus for this user's unit
            if (user.unitId && campuses.length > 0) {
                // Kiểm tra xem user.unitId có phải là campus không
                let userCampus = campuses.find(campus => campus.id === user.unitId);
                
                // Nếu không phải campus, tìm campus chứa unit này
                if (!userCampus) {
                    userCampus = campuses.find(campus => 
                        campus.childUnits?.some(unit => unit.id === user.unitId)
                    );
                }
                
                if (userCampus) {
                    setUnitCampusSelected(userCampus);
                }
            }
        }
    }, [user, campuses]);

    // Xử lý logic theo access scope khi có dữ liệu campuses và current user
    useEffect(() => {
        if (campuses.length === 0 || !currentUser?.unitId) return;

        // Chỉ áp dụng logic khi chưa có user được load (tạo mới)
        // Nếu đã có user được load thì giữ nguyên campus/unit của user đó
        if (!user) {
            if (hasChildUnitsScope) {
                // CHILD_UNITS scope: unitId chính là campus ID
                const userCampus = campuses.find(campus => campus.id === currentUser.unitId);
                if (userCampus) {
                    setUnitCampusSelected(userCampus);
                }
            } else if (hasUnitScope) {
                // UNIT scope: Tìm campus tương ứng qua childUnits
                const userCampus = campuses.find(campus => 
                    campus.childUnits?.some(unit => unit.id === currentUser.unitId)
                );
                if (userCampus) {
                    setUnitCampusSelected(userCampus);
                }
            }
        }
    }, [campuses, hasGlobalScope, hasChildUnitsScope, hasUnitScope, currentUser, user]);

    console.log("user from store:", user);
    

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
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
        if (!formData.unitId) {
            newErrors.unitId = "Đơn vị là bắt buộc";
        }

        // Validate quyền chỉnh sửa cho UNIT scope
        if (hasUnitScope && currentUser?.unitId && formData.unitId !== currentUser.unitId) {
            newErrors.unitId = "Bạn không có quyền gán user cho đơn vị khác";
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
            const newUser: UpdateUser = {
                username: formData.username,
                fullName: formData.fullName,
                email: formData.email,
                phoneNumber: formData.phoneNumber || undefined,
                birthDate: formData.birthDate || undefined,
                unitId: formData.unitId,
                status: formData.status,
                roleIds: selectedRoles.length > 0 ? selectedRoles : [],
            };
            console.log("Updating user with data:", newUser);
            const result = await dispatch(updateUser({ id: userId, userData: newUser })).unwrap();
            if(result){
                toast.success("Cập nhật người dùng thành công");
                router.push("/user");
            }
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Có lỗi xảy ra khi cập nhật người dùng");
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                    <div className="h-48 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="space-y-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy người dùng</h1>
                <Link href="/user">
                    <Button>Quay lại danh sách</Button>
                </Link>
            </div>
        );
    }

    const selectedRoleObjects = allRoles.filter(role => selectedRoles.includes(role.id));

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <div>
                    <div className="flex items-center text-sm sm:text-base text-gray-600 mb-3">
                        <button
                            onClick={() => router.push("/user")}
                            className="hover:text-blue-600 text-lg sm:text-xl transition-colors font-semibold cursor-pointer"
                        >
                            Người dùng
                        </button>
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 mx-1 sm:mx-2" />
                        <span className="text-gray-900 font-semibold text-lg sm:text-xl">
                            Chỉnh sửa
                        </span>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-xl border border-gray-300">
                    {/* Form Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Thông tin cơ bản</h3>
                            </div>
                        </div>
                    </div>

                    {/* Form Body */}
                    <div className="px-6 py-6 space-y-6">
                        {/* Tài khoản và Họ tên */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tài khoản (Mã nhân viên) <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={formData.username}
                                    onChange={(e) => handleInputChange("username", e.target.value)}
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
                                    onChange={(e) => handleInputChange("fullName", e.target.value)}
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
                                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                                        placeholder="0901234567"
                                        className="pl-10"
                                    />
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        {/* Ngày sinh và Cơ sở */}
                        <div className={`grid grid-cols-1 ${hasGlobalScope ? 'md:grid-cols-2' : ''} gap-6`}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ngày sinh
                                </label>
                                <div className="relative">
                                    <Input
                                        type="date"
                                        value={formData.birthDate}
                                        onChange={(e) => handleInputChange("birthDate", e.target.value)}
                                        className="pl-10"
                                    />
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                </div>
                            </div>

                            {/* Chỉ hiển thị chọn cơ sở cho GLOBAL scope */}
                            {hasGlobalScope && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Cơ sở <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={unitCampusSelected?.id || ""}
                                            onChange={(e) => {
                                                const selectedCampus = campuses.find(unit => unit.id === e.target.value);
                                                if (selectedCampus) {
                                                    setUnitCampusSelected(selectedCampus);
                                                }
                                                // Reset unit selection when campus changes
                                                handleInputChange("unitId", "");
                                            }}
                                            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                errors.unitId ? "border-red-500" : "border-gray-300"
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
                        </div>

                        {/* Đơn vị */}
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Đơn vị <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.unitId}
                                        onChange={(e) => handleInputChange("unitId", e.target.value)}
                                        disabled={hasUnitScope || !unitCampusSelected || shouldDisableUnitSelection()} // Disable cho UNIT scope, khi chưa chọn campus hoặc khi chọn role ADMIN_DEPT
                                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.unitId ? "border-red-500" : "border-gray-300"
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
                                {!hasGlobalScope && !unitCampusSelected && (
                                    <p className="text-gray-500 text-sm mt-1">Vui lòng chọn cơ sở trước</p>
                                )}
                                {shouldDisableUnitSelection() && (
                                    <p className="text-blue-600 text-sm mt-1">
                                        Trưởng phòng quản trị được gán trực tiếp vào cơ sở
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Roles Section */}
                <div className="bg-white rounded-xl border border-gray-300">
                    {/* Form Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Phân quyền</h3>
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
                                    <span className="flex items-center gap-2">
                                        Chọn vai trò
                                    </span>
                                    <Settings className="h-4 w-4" />
                                </Button>

                                {selectedRoleObjects.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap gap-2">
                                            {selectedRoleObjects.map(role => (
                                                <Badge key={role.id} className="bg-purple-100 text-purple-800 flex items-center gap-1">
                                                    {role.name}
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedRoles(prev => prev.filter(id => id !== role.id))}
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
                                onChange={(e) => handleInputChange("status", e.target.value as UserStatus)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value={UserStatus.ACTIVE}>Đang hoạt động</option>
                                <option value={UserStatus.INACTIVE}>Không hoạt động</option>
                                <option value={UserStatus.LOCKED}>Đã khóa</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-4 pt-6">
                    <Link href="/user">
                        <Button variant="outline">
                            Hủy
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        {isLoading ? "Đang lưu..." : "Cập nhật người dùng"}
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
