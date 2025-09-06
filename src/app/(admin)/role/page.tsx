"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableColumn } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Shield
} from "lucide-react";
import { Role, Permission, ManagerPermission } from "@/types/asset";
import RoleFormModal from "@/components/role/RoleFormModal";
import RoleDetailModal from "@/components/role/RoleDetailModal";

// Mock data cho demonstration
const mockManagerPermissions: ManagerPermission[] = [
  {
    id: "1",
    name: "Kiểm kê",
    permissions: [
      { id: "inv_view", name: "Xem kiểm kê", code: "INVENTORY_VIEW" },
      { id: "inv_create", name: "Tạo kiểm kê", code: "INVENTORY_CREATE" },
      { id: "inv_approve", name: "Duyệt kiểm kê", code: "INVENTORY_APPROVE" },
      { id: "inv_manage", name: "Quản lý kiểm kê", code: "INVENTORY_MANAGE" },
    ]
  },
  {
    id: "2", 
    name: "Tài sản",
    permissions: [
      { id: "asset_view", name: "Xem tài sản", code: "ASSET_VIEW" },
      { id: "asset_create", name: "Thêm tài sản", code: "ASSET_CREATE" },
      { id: "asset_edit", name: "Sửa tài sản", code: "ASSET_EDIT" },
      { id: "asset_delete", name: "Xóa tài sản", code: "ASSET_DELETE" },
      { id: "asset_handover", name: "Bàn giao tài sản", code: "ASSET_HANDOVER" },
    ]
  },
  {
    id: "3",
    name: "Thanh lý", 
    permissions: [
      { id: "liq_view", name: "Xem thanh lý", code: "LIQUIDATION_VIEW" },
      { id: "liq_create", name: "Tạo thanh lý", code: "LIQUIDATION_CREATE" },
      { id: "liq_approve", name: "Duyệt thanh lý", code: "LIQUIDATION_APPROVE" },
    ]
  },
  {
    id: "4",
    name: "Người dùng",
    permissions: [
      { id: "user_view", name: "Xem người dùng", code: "USER_VIEW" },
      { id: "user_create", name: "Tạo người dùng", code: "USER_CREATE" },
      { id: "user_edit", name: "Sửa người dùng", code: "USER_EDIT" },
      { id: "user_delete", name: "Xóa người dùng", code: "USER_DELETE" },
    ]
  },
  {
    id: "5",
    name: "Đơn vị",
    permissions: [
      { id: "unit_view", name: "Xem đơn vị", code: "UNIT_VIEW" },
      { id: "unit_create", name: "Tạo đơn vị", code: "UNIT_CREATE" },
      { id: "unit_edit", name: "Sửa đơn vị", code: "UNIT_EDIT" },
      { id: "unit_delete", name: "Xóa đơn vị", code: "UNIT_DELETE" },
    ]
  }
];

const mockRoles: Role[] = [
  {
    id: "1",
    name: "Quản trị viên",
    code: "ADMIN",
    permissions: [
      ...mockManagerPermissions[0].permissions!,
      ...mockManagerPermissions[1].permissions!,
      ...mockManagerPermissions[2].permissions!,
      ...mockManagerPermissions[3].permissions!,
      ...mockManagerPermissions[4].permissions!,
    ]
  },
  {
    id: "2", 
    name: "Kế toán",
    code: "ACCOUNTANT",
    permissions: [
      mockManagerPermissions[1].permissions![0], // asset_view
      mockManagerPermissions[1].permissions![1], // asset_create
      mockManagerPermissions[1].permissions![2], // asset_edit
      mockManagerPermissions[0].permissions![0], // inv_view
    ]
  },
  {
    id: "3",
    name: "Nhân viên kiểm kê", 
    code: "INVENTORY_STAFF",
    permissions: [
      mockManagerPermissions[0].permissions![0], // inv_view
      mockManagerPermissions[0].permissions![1], // inv_create
      mockManagerPermissions[1].permissions![0], // asset_view
    ]
  },
  {
    id: "4",
    name: "Trưởng phòng",
    code: "DEPARTMENT_HEAD", 
    permissions: [
      mockManagerPermissions[0].permissions![0], // inv_view
      mockManagerPermissions[0].permissions![2], // inv_approve
      mockManagerPermissions[1].permissions![0], // asset_view
      mockManagerPermissions[2].permissions![0], // liq_view
      mockManagerPermissions[2].permissions![2], // liq_approve
    ]
  }
];

export default function RolePage() {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Filter roles based on search term
  const filteredRoles = roles.filter(role =>
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

  const handleViewRole = (role: Role) => {
    setSelectedRole(role);
    setIsDetailModalOpen(true);
  };

  const handleDeleteRole = (roleId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa role này?")) {
      setRoles(prev => prev.filter(r => r.id !== roleId));
    }
  };

  const handleSaveRole = (roleData: any) => {
    if (selectedRole) {
      // Update existing role
      setRoles(prev => prev.map(r => 
        r.id === selectedRole.id ? { ...r, ...roleData } : r
      ));
    } else {
      // Create new role
      const newRole: Role = {
        id: Date.now().toString(),
        ...roleData
      };
      setRoles(prev => [...prev, newRole]);
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
      key: "permissions",
      title: "Quyền hạn",
      render: (_, record) => (
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
          {record.permissions?.length || 0} quyền
        </Badge>
      ),
    },
    {
      key: "status",
      title: "Trạng thái",
      render: () => (
        <Badge className="bg-green-100 text-green-800">
          Đang hoạt động
        </Badge>
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
              handleViewRole(record);
            }}
            title="Xem chi tiết"
          >
            <Eye className="h-4 w-4 text-gray-600" />
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
          Thêm role
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
        Hiển thị {filteredRoles.length} trên tổng số {roles.length} role
      </div>

      {/* Roles Table */}
      <Table
        columns={columns}
        data={filteredRoles}
        emptyText="Không tìm thấy role nào"
        emptyIcon={<Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
        onRowClick={(record) => handleViewRole(record)}
      />

      {/* Role Form Modal */}
      <RoleFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        role={selectedRole}
        managerPermissions={mockManagerPermissions}
        onSave={handleSaveRole}
      />

      {/* Role Detail Modal */}
      <RoleDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        role={selectedRole}
        managerPermissions={mockManagerPermissions}
      />
    </div>
  );
}
