"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableColumn } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Shield
} from "lucide-react";
import { Role, Permission, ManagerPermission } from "@/types/asset";
import RoleFormModal from "@/components/role/RoleFormModal";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { RootState } from "@/lib/store";
import { useRouter } from "next/navigation";
import { createRole, CreateRoleRequest, deleteRole, findAllRoles, updateRole, UpdateRoleRequest } from "@/lib/store/slices/roleSlice";
import { findAllPermissions } from "@/lib/store/slices/permissionSlice";
import toast from "react-hot-toast";

export default function RolePage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { allRoles, loading } = useAppSelector((state: RootState) => state.role);
    const { allPermission } = useAppSelector((state: RootState) => state.permission);
    const [searchTerm, setSearchTerm] = useState("");
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                await dispatch(findAllRoles()).unwrap();
                await dispatch(findAllPermissions()).unwrap();
            } catch (error) {
                console.error("Failed to fetch roles:", error);
            }
        };
        fetchData();
    }, [dispatch]);

    // Filter roles based on search term
    const filteredRoles = allRoles.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateRole = () => {
        setSelectedRole(null);
        setIsFormModalOpen(true);
    };

    const handleEditRole = (role: Role) => {
        setSelectedRole(role);
        setIsFormModalOpen(true);
    };

    const handleDeleteRole = (roleId: string) => {
        if (confirm("Bạn có chắc chắn muốn xóa role này?")) {
            dispatch(deleteRole(roleId)).unwrap()
                .then(() => {
                    toast.success("Xóa role thành công!");
                })
                .catch((error) => {
                    console.error("Failed to delete role:", error);
                    toast.error("Xóa role thất bại: " + (error.message || "Lỗi không xác định"));
                });
        }
    };

    const handleSaveRole = (roleData: any) => {
        const lstPermission = roleData.permissions;
        const lstPermissionId = lstPermission.map((p: ManagerPermission) => p.id);
        if (selectedRole) {
            
            const newRole: UpdateRoleRequest = {
                name: roleData.name,
                permissionIds: lstPermissionId,
            };

            dispatch(updateRole({ roleId: selectedRole.id, roleData: newRole })).unwrap()
                .then(() => {
                    toast.success(`Cập nhật role "${roleData.name}" thành công!`);
                })
                .catch((error) => {
                    console.error("Failed to update role:", error);
                    toast.error("Cập nhật role thất bại: " + (error.message || "Lỗi không xác định"));
                });
        } else {
            const newRole: CreateRoleRequest = {
                name: roleData.name,
                permissionIds: lstPermissionId,
            };

            dispatch(createRole(newRole)).unwrap()
                .then(() => {
                    toast.success(`Tạo role "${roleData.name}" thành công!`);
                })
                .catch((error) => {
                    console.error("Failed to create role:", error);
                    toast.error("Tạo role thất bại: " + (error.message || "Lỗi không xác định"));
                });
        }
        setIsFormModalOpen(false);
    };

    // Table columns configuration
    const columns: TableColumn<Role>[] = [
        {
            key: "name",
            title: "Tên role",
            render: (_, record) => (
                <div className="flex items-center">
                    <Shield className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                        <div className="text-sm font-medium text-gray-900">{record.name}</div>
                    </div>
                </div>
            ),
        },
        {
            key: "actions",
            title: "Thao tác",
            render: (_, record) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEditRole(record);
                        }}
                        title="Chỉnh sửa"
                    >
                        <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRole(record.id);
                        }}
                        title="Xóa"
                    >
                        <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                </div>
            ),
            className: "text-right",
        },
    ];

    if (loading) {
        return (
            <div className="p-6 text-center text-gray-600">Đang tải dữ liệu...</div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Role</h1>
                    <p className="text-gray-600">Quản lý các vai trò và quyền hạn trong hệ thống</p>
                </div>
                <Button
                    onClick={handleCreateRole}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                    <Plus className="h-4 w-4" />
                    Thêm
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Tìm kiếm theo tên role..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-600 mb-4">
                Hiển thị {filteredRoles.length} trên tổng số {allRoles.length} role
            </div>

            {/* Roles Table */}
            <Table
                columns={columns}
                data={filteredRoles}
                emptyText="Không tìm thấy role nào"
                emptyIcon={<Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
            />

            {/* Role Form Modal */}
            <RoleFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                role={selectedRole}
                managerPermissions={allPermission}
                onSave={handleSaveRole}
            />
        </div>
    );
}
