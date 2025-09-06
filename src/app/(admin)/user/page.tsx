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
  Users,
  Lock,
  Unlock,
  Key,
  Download,
  Upload
} from "lucide-react";
import { User, UserStatus, Role, Unit, UnitType, UnitStatus } from "@/types/asset";
import Link from "next/link";
import UserDetailModal from "@/components/user/UserDetailModal";

// Mock data cho demonstration
const mockRoles: Role[] = [
  { id: "1", name: "Quản trị viên", code: "ADMIN" },
  { id: "2", name: "Kế toán", code: "ACCOUNTANT" },
  { id: "3", name: "Nhân viên kiểm kê", code: "INVENTORY_STAFF" },
  { id: "4", name: "Trưởng phòng", code: "DEPARTMENT_HEAD" }
];

const mockUnits: Unit[] = [
  {
    id: "unit1",
    name: "Phòng Kế hoạch Đầu tư",
    phone: "0234567890",
    email: "kehoach@iuh.edu.vn",
    type: UnitType.PHONG_KE_HOACH_DAU_TU,
    representativeId: "user1",
    status: UnitStatus.ACTIVE,
    createdBy: "admin",
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-10T08:00:00Z"
  },
  {
    id: "unit2",
    name: "Phòng Quản trị",
    phone: "0234567891",
    email: "quantri@iuh.edu.vn",
    type: UnitType.PHONG_QUAN_TRI,
    representativeId: "user2",
    status: UnitStatus.ACTIVE,
    createdBy: "admin",
    createdAt: "2024-01-11T08:00:00Z",
    updatedAt: "2024-01-11T08:00:00Z"
  },
  {
    id: "unit3",
    name: "Khoa Công nghệ Thông tin",
    phone: "0234567892",
    email: "cntt@iuh.edu.vn",
    type: UnitType.DON_VI_SU_DUNG,
    representativeId: "user3",
    status: UnitStatus.ACTIVE,
    createdBy: "admin",
    createdAt: "2024-01-12T08:00:00Z",
    updatedAt: "2024-01-12T08:00:00Z"
  }
];

const mockUsers: User[] = [
  {
    id: "1",
    username: "NV001",
    fullName: "Nguyễn Văn An",
    email: "nvan@iuh.edu.vn",
    phoneNumber: "0901234567",
    birthDate: "1990-05-15",
    unitId: "unit1",
    status: UserStatus.ACTIVE,
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-10T08:00:00Z",
    roles: [mockRoles[0], mockRoles[1]],
    unit: mockUnits[0]
  },
  {
    id: "2",
    username: "NV002",
    fullName: "Trần Thị Bình",
    email: "ttbinh@iuh.edu.vn",
    phoneNumber: "0901234568",
    birthDate: "1985-03-20",
    unitId: "unit2",
    status: UserStatus.ACTIVE,
    createdAt: "2024-01-11T08:00:00Z",
    updatedAt: "2024-01-11T08:00:00Z",
    roles: [mockRoles[2]],
    unit: mockUnits[1]
  },
  {
    id: "3",
    username: "NV003",
    fullName: "Lê Văn Cường",
    email: "lvcuong@iuh.edu.vn",
    phoneNumber: "0901234569",
    birthDate: "1992-08-10",
    unitId: "unit3",
    status: UserStatus.INACTIVE,
    createdAt: "2024-01-12T08:00:00Z",
    updatedAt: "2024-01-12T08:00:00Z",
    roles: [mockRoles[3]],
    unit: mockUnits[2]
  },
  {
    id: "4",
    username: "NV004",
    fullName: "Phạm Thị Dung",
    email: "ptdung@iuh.edu.vn",
    phoneNumber: "0901234570",
    birthDate: "1988-12-05",
    unitId: "unit1",
    status: UserStatus.LOCKED,
    createdAt: "2024-01-13T08:00:00Z",
    updatedAt: "2024-01-13T08:00:00Z",
    roles: [mockRoles[1]],
    unit: mockUnits[0]
  }
];

const statusLabels = {
  [UserStatus.ACTIVE]: "Đang hoạt động",
  [UserStatus.INACTIVE]: "Không hoạt động",
  [UserStatus.LOCKED]: "Đã khóa",
  [UserStatus.DELETED]: "Đã xóa"
};

const statusColors = {
  [UserStatus.ACTIVE]: "bg-green-100 text-green-800",
  [UserStatus.INACTIVE]: "bg-gray-100 text-gray-800",
  [UserStatus.LOCKED]: "bg-red-100 text-red-800",
  [UserStatus.DELETED]: "bg-black text-white"
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [unitFilter, setUnitFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUnit = !unitFilter || user.unitId === unitFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;
    
    return matchesSearch && matchesUnit && matchesStatus;
  });

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, status: UserStatus.DELETED } : u
      ));
    }
  };

  const handleToggleLock = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === UserStatus.LOCKED ? UserStatus.ACTIVE : UserStatus.LOCKED;
        return { ...u, status: newStatus };
      }
      return u;
    }));
  };

  const handleResetPassword = (userId: string) => {
    if (confirm("Bạn có chắc chắn muốn đặt lại mật khẩu cho người dùng này?")) {
      // Logic reset password
      alert("Mật khẩu đã được đặt lại và gửi qua email!");
    }
  };

  // Table columns configuration
  const columns: TableColumn<User>[] = [
    {
      key: "username",
      title: "Tài khoản",
      render: (_, record) => (
        <div className="flex items-center">
          <Users className="h-5 w-5 text-gray-400 mr-3" />
          <div>
            <div className="text-sm font-medium text-gray-900">{record.username}</div>
            <div className="text-sm text-gray-500">{record.fullName}</div>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      title: "Liên hệ",
      render: (_, record) => (
        <div className="text-sm text-gray-900">
          <div className="mb-1">{record.email}</div>
          <div className="text-gray-500">{record.phoneNumber}</div>
        </div>
      ),
    },
    {
      key: "unit",
      title: "Đơn vị",
      render: (_, record) => (
        <div className="text-sm text-gray-900">
          {record.unit?.name || "Chưa phân bổ"}
        </div>
      ),
    },
    {
      key: "roles",
      title: "Vai trò",
      render: (_, record) => (
        <div className="flex flex-wrap gap-1">
          {record.roles?.map(role => (
            <Badge key={role.id} variant="outline" className="bg-blue-100 text-blue-800 text-xs">
              {role.name}
            </Badge>
          )) || <span className="text-gray-500 text-sm">Chưa có vai trò</span>}
        </div>
      ),
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (_, record) => (
        <Badge className={statusColors[record.status]}>
          {statusLabels[record.status]}
        </Badge>
      ),
    },
    {
      key: "actions",
      title: "Thao tác",
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <Link href={`/user/${record.id}/edit`}>
            <Button
              variant="ghost"
              size="icon"
              title="Chỉnh sửa"
            >
              <Edit className="h-4 w-4 text-blue-600" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleToggleLock(record.id)}
            title={record.status === UserStatus.LOCKED ? "Mở khóa" : "Khóa tài khoản"}
          >
            {record.status === UserStatus.LOCKED ? (
              <Unlock className="h-4 w-4 text-green-600" />
            ) : (
              <Lock className="h-4 w-4 text-orange-600" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleResetPassword(record.id)}
            title="Đặt lại mật khẩu"
          >
            <Key className="h-4 w-4 text-purple-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteUser(record.id)}
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Người dùng</h1>
          <p className="text-gray-600">Quản lý thông tin người dùng và phân quyền</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/user/create">
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4" />
              Thêm người dùng
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm theo tài khoản, tên, email..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Unit Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
          >
            <option value="">Tất cả đơn vị</option>
            {mockUnits.map(unit => (
              <option key={unit.id} value={unit.id}>{unit.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as UserStatus | "")}
          >
            <option value="">Tất cả trạng thái</option>
            <option value={UserStatus.ACTIVE}>Đang hoạt động</option>
            <option value={UserStatus.INACTIVE}>Không hoạt động</option>
            <option value={UserStatus.LOCKED}>Đã khóa</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600 mb-4">
        Hiển thị {filteredUsers.length} trên tổng số {users.length} người dùng
      </div>

      {/* Users Table */}
      <Table<User>
        columns={columns}
        data={filteredUsers}
        emptyText="Không tìm thấy người dùng"
        emptyIcon={<Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
      />

      {/* User Detail Modal */}
      <UserDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        user={selectedUser}
        onResetPassword={handleResetPassword}
        onToggleLock={handleToggleLock}
      />
    </div>
  );
}
