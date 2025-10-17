"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableColumn } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Users } from "lucide-react";
import { User, UserStatus } from "@/types/asset";
import Link from "next/link";
import UserDetailModal from "@/components/user/UserDetailModal";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { RootState } from "@/lib/store";
import {
  deletedUser,
  filterUser,
  getAllUser,
  updateUserStatus,
  UserFilterRequest,
} from "@/lib/store/slices/userSlice";
import { getUnitCampus } from "@/lib/store/slices/unitSlice";
import toast from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PermissionConstants } from "@/hooks/usePermissions";
import { useAuth } from "@/contexts/AuthContext";
import { RoleBase } from "@/lib/constants/role";

const statusLabels = {
  [UserStatus.ACTIVE]: "Đang hoạt động",
  [UserStatus.INACTIVE]: "Không hoạt động",
  [UserStatus.LOCKED]: "Đã khóa",
  [UserStatus.DELETED]: "Đã xóa",
};

const statusColors = {
  [UserStatus.ACTIVE]: "bg-green-100 text-green-800",
  [UserStatus.INACTIVE]: "bg-gray-100 text-gray-800",
  [UserStatus.LOCKED]: "bg-red-100 text-red-800",
  [UserStatus.DELETED]: "bg-black text-white",
};

export default function UsersPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { lstUser, filteredUsers, currentFilter } = useAppSelector(
    (state: RootState) => state.user
  );
  const { campuses } = useAppSelector((state: RootState) => state.unit);

  const [searchTerm, setSearchTerm] = useState("");
  const [unitFilter, setUnitFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { hasAnyPermission, hasRole, user: currentUser } = useAuth();
  const isAdmin = hasRole([RoleBase.ADMIN]);
  const isAdminDept = hasRole([RoleBase.ADMIN_DEPT]);
  const isUserDept = hasRole([RoleBase.USER_DEPT]);

  // Tính toán danh sách units để hiển thị trong dropdown filter dựa vào role
  const getFilterUnits = () => {
    if (isAdmin) {
      // Admin chỉ thấy các cơ sở (campuses)
      return campuses;
    }
    
    if (isAdminDept && currentUser?.unitId) {
      // Admin Dept: tìm campus của mình và lấy tất cả children
      const userCampus = campuses.find(campus => campus.id === currentUser.unitId);
      if (userCampus) {
        return [userCampus, ...(userCampus.childUnits || [])];
      }
    }
    
    if (isUserDept && currentUser?.unitId) {
      // User Dept: chỉ thấy unit của mình
      const allUnits = campuses.flatMap(campus => [
        campus,
        ...(campus.childUnits || [])
      ]);
      const userUnit = allUnits.find(unit => unit.id === currentUser.unitId);
      return userUnit ? [userUnit] : [];
    }
    
    return [];
  };

  const filterUnits = getFilterUnits();
  const canCreate = hasAnyPermission([PermissionConstants.PERM_CREATE_USER]);
  const canUpdate = hasAnyPermission([PermissionConstants.PERM_UPDATE_USER]);
  const canDelete = hasAnyPermission([PermissionConstants.PERM_REMOVE_USER]);
  const canView = hasAnyPermission([PermissionConstants.PERM_VIEW_USER]);
  useEffect(() => {
    if (!canCreate && !canUpdate && !canDelete && !canView) {
      router.push("/unauthorized");
    }
  }, [canCreate, canUpdate, canDelete, canView, router]);
  useEffect(() => {
    const loadData = () => {
      try {
        dispatch(filterUser(currentFilter));
        dispatch(getUnitCampus());
      } catch (e: any) {
        toast.error(e.message || "Có lỗi xảy ra.");
      }
    };
    loadData();
  }, []);

  const handleDeleteUser = (userId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      dispatch(deletedUser(userId))
        .unwrap()
        .then(() => {
          toast.success("Xóa người dùng thành công!");
          dispatch(getAllUser());
        })
        .catch(() => {
          toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
        });
    }
  };

  const handleToggleLock = (userId: string) => {
    const user = lstUser.find((u) => u.id === userId);
    if (!user) return;
    if (
      confirm(
        `Bạn có chắc chắn muốn ${
          user.status === UserStatus.LOCKED ? "mở khóa" : "khóa"
        } người dùng này?`
      )
    ) {
      const status =
        user.status === UserStatus.LOCKED
          ? UserStatus.ACTIVE
          : UserStatus.LOCKED;
      dispatch(updateUserStatus({ userId: user.id, status }))
        .unwrap()
        .then(() => {
          toast.success(
            `${
              user.status === UserStatus.LOCKED ? "Mở khóa" : "Khóa"
            } tài khoản người dùng thành công!`
          );
          dispatch(getAllUser());
        })
        .catch(() => {
          toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
        });
    }
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
        <div className="text-sm text-gray-900">{record.username}</div>
      ),
    },
    {
      key: "fullName",
      title: "Họ và tên",
      render: (_, record) => (
        <>
          <div className="text-sm text-gray-900">{record.fullName}</div>
          <div className="text-sm text-gray-500">{record.email}</div>
        </>
      ),
      sortable: true,
    },
    {
      key: "unit",
      title: "Đơn vị",
      render: (_, record) => (
        <div className="text-sm text-gray-900">
          {record.unit?.name || "Chưa phân bổ"}
        </div>
      ),
      sortable: true,
    },
    {
      key: "roles",
      title: "Vai trò",
      render: (_, record) => (
        <div className="text-sm text-gray-900">
          {record.roles?.map((role) => (
            <span className="flex" key={role.id}>
              {role.name}
            </span>
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
      sortable: true,
    },
    {
      key: "actions",
      title: "Thao tác",
      render: (_, record) => (
        <div className="flex justify-start">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="h-8 px-3 text-sm">
                Hành động
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {record.status !== UserStatus.LOCKED && canUpdate && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/user/${record.id}/edit`);
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span>Chỉnh sửa</span>
                </DropdownMenuItem>
              )}
              {canUpdate && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleLock(record.id);
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {record.status === UserStatus.LOCKED ? (
                    <>
                      <span>Mở khóa</span>
                    </>
                  ) : (
                    <>
                      <span>Khóa tài khoản</span>
                    </>
                  )}
                </DropdownMenuItem>
              )}
              {record.status !== UserStatus.LOCKED && canUpdate && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetPassword(record.id);
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span>Đặt lại mật khẩu</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {canDelete && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteUser(record.id);
                  }}
                  className="flex items-center gap-2 cursor-pointer text-red-600"
                >
                  <span>Xóa</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      className: "text-right",
    },
  ];

  const handlerRender = (currentFilter: UserFilterRequest) => {
    dispatch(filterUser(currentFilter));
  };

  useEffect(() => {
    handlerRender({
      ...currentFilter,
      search: searchTerm || undefined,
      unitFilter: unitFilter || undefined,
      statusFilter: statusFilter || undefined,
    });
  }, [searchTerm, unitFilter, statusFilter]);
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý người dùng
          </h1>
          <p className="text-gray-600">
            Quản lý thông tin người dùng và phân quyền
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canCreate && (
            <Link href="/user/create">
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4" />
                Thêm người dùng
              </Button>
            </Link>
          )}
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
            {filterUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
                {unit.type === 'CAMPUS'}
                {unit.type === 'ADMIN_DEPT'}
                {unit.type === 'USER_DEPT'}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as UserStatus | "")}
          >
            <option value="">Tất cả trạng thái</option>
            <option value={UserStatus.ACTIVE}>
              {statusLabels[UserStatus.ACTIVE]}
            </option>
            <option value={UserStatus.INACTIVE}>
              {statusLabels[UserStatus.INACTIVE]}
            </option>
            <option value={UserStatus.LOCKED}>
              {statusLabels[UserStatus.LOCKED]}
            </option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <Table<User>
        columns={columns}
        data={filteredUsers.data}
        emptyText="Không tìm thấy người dùng"
        emptyIcon={<Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
        multiSort={true}
        sortConfigs={currentFilter.sorting}
        onSortChange={(sortConfigs) => {
          handlerRender({
            ...currentFilter,
            sorting: sortConfigs,
          });
        }}
        pagination={{
          current: filteredUsers?.pagination.page || 1,
          pageSize: filteredUsers?.pagination.limit || 5,
          total: filteredUsers?.pagination.total || 0,
          onChange: (page, pageSize) => {
            handlerRender({
              ...currentFilter,
              pagination: {
                currentPage: page,
                itemsPerPage: pageSize,
              },
            });
          },
          showSizeChanger: true,
          pageSizeOptions: [5, 10, 20, 50],
          serverSide: true,
        }}
      />
      <UserDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        user={selectedUser}
        onResetPassword={handleResetPassword}
        onToggleLock={
          selectedUser ? () => handleToggleLock(selectedUser.id) : () => {}
        }
      />
    </div>
  );
}
