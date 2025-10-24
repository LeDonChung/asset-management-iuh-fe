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
  Shield,
  MoreHorizontal,
  MoreVertical,
} from "lucide-react";
import { Role, Permission, ManagerPermission } from "@/types/asset";
import RoleFormModal from "@/components/role/RoleFormModal";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { RootState } from "@/lib/store";
import { useRouter } from "next/navigation";
import {
  createRole,
  CreateRoleRequest,
  deleteRole,
  findAllRoles,
  updateRole,
  UpdateRoleRequest,
} from "@/lib/store/slices/roleSlice";
import { findAllPermissions } from "@/lib/store/slices/permissionSlice";
import toast from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { PermissionConstants } from "@/hooks/usePermissions";
export default function RolePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { allRoles, loading } = useAppSelector(
    (state: RootState) => state.role
  );
  const { allPermission } = useAppSelector(
    (state: RootState) => state.permission
  );
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const { hasAnyPermission } = useAuth();
  const canCreate = hasAnyPermission([PermissionConstants.PERM_CREATE_ROLE]);
  const canUpdate = hasAnyPermission([PermissionConstants.PERM_UPDATE_ROLE]);
  const canDelete = hasAnyPermission([PermissionConstants.PERM_REMOVE_ROLE]);
  const canView = hasAnyPermission([PermissionConstants.PERM_VIEW_ROLE]);

  useEffect(() => {
    if (!canCreate && !canUpdate && !canDelete && !canView) {
      router.push("/unauthorized");
    }
  }, [canCreate, canUpdate, canDelete, canView, router]);

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

  const handleCreateRole = () => {
    setSelectedRole(null);
    setIsViewMode(false);
    setIsFormModalOpen(true);
  };

  const handleEditRole = (role: Role, viewOnly: boolean = false) => {
    setSelectedRole(role);
    setIsViewMode(viewOnly);
    setIsFormModalOpen(true);
  };

  const handleDeleteRole = (roleId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa role này?")) {
      dispatch(deleteRole(roleId))
        .unwrap()
        .then(() => {
          toast.success("Xóa role thành công!");
        })
        .catch((error) => {
          console.error("Failed to delete role:", error);
          toast.error(
            "Xóa role thất bại: " + (error.message || "Lỗi không xác định")
          );
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

      dispatch(updateRole({ roleId: selectedRole.id, roleData: newRole }))
        .unwrap()
        .then(() => {
          toast.success(`Cập nhật role "${roleData.name}" thành công!`);
        })
        .catch((error) => {
          console.error("Failed to update role:", error);
          toast.error(
            "Cập nhật role thất bại: " + (error.message || "Lỗi không xác định")
          );
        });
    } else {
      const newRole: CreateRoleRequest = {
        name: roleData.name,
        permissionIds: lstPermissionId,
      };

      dispatch(createRole(newRole))
        .unwrap()
        .then(() => {
          toast.success(`Tạo role "${roleData.name}" thành công!`);
        })
        .catch((error) => {
          console.error("Failed to create role:", error);
          toast.error(
            "Tạo role thất bại: " + (error.message || "Lỗi không xác định")
          );
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
          <div>
            <div className="text-sm font-medium text-gray-900">
              {record.name}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      title: "Thao tác",
      render: (_, record) => (
        <div className="flex justify-start">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {canUpdate && !record.isProtected && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditRole(record, false);
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span>Chỉnh sửa</span>
                </DropdownMenuItem>
              )}
              {canUpdate && record.isProtected && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditRole(record, true);
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span>Xem</span>
                </DropdownMenuItem>
              )}

              {canDelete && !record.isProtected && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRole(record.id);
                    }}
                    className="flex items-center gap-2 cursor-pointer text-red-600 "
                  >
                    <span>Xóa</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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
    <div className="p-6 ">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý vai trò</h1>
          <p className="text-gray-600">
            Quản lý các vai trò và quyền hạn trong hệ thống
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={handleCreateRole}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Thêm
          </Button>
        )}
      </div>

      {/* Roles Table */}
      <Table
        columns={columns}
        data={allRoles}
        emptyText="Không tìm thấy role nào"
        emptyIcon={<Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
      />

      {/* Role Form Modal */}
      <RoleFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setIsViewMode(false);
        }}
        role={selectedRole}
        managerPermissions={allPermission}
        onSave={handleSaveRole}
        isViewMode={isViewMode}
      />
    </div>
  );
}
