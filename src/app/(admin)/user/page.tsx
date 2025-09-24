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
    Eye,
    Users,
    Lock,
    Unlock,
    Key,
    Download,
    Upload,
    X
} from "lucide-react";
import { User, UserStatus, Role, Unit, UnitType, UnitStatus } from "@/types/asset";
import Link from "next/link";
import UserDetailModal from "@/components/user/UserDetailModal";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { RootState } from "@/lib/store";
import { deletedUser, getAllUser, updateUserStatus } from "@/lib/store/slices/userSlice";
import { getAllUnits } from "@/lib/store/slices/unitSlice";
import toast from "react-hot-toast";

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
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { lstUser, filteredSessions } = useAppSelector((state: RootState) => state.user);
    const { allUnits } = useAppSelector((state: RootState) => state.unit);

    const [searchTerm, setSearchTerm] = useState("");
    const [unitFilter, setUnitFilter] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        dispatch(getAllUnits());
        dispatch(getAllUser());
    }, [dispatch]);

    // Filter users based on search and filters
    const filteredUsers = lstUser.filter(user => {
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
            dispatch(deletedUser(userId)).unwrap()
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
        const user = lstUser.find(u => u.id === userId);
        if (!user) return;
        if (confirm(`Bạn có chắc chắn muốn ${user.status === UserStatus.LOCKED ? "mở khóa" : "khóa"} người dùng này?`)) {
            const status = user.status === UserStatus.LOCKED ? UserStatus.ACTIVE : UserStatus.LOCKED;
            dispatch(updateUserStatus({ userId: user.id, status })).unwrap()
                .then(() => {
                    toast.success(`${user.status === UserStatus.LOCKED ? "Mở khóa" : "Khóa"} tài khoản người dùng thành công!`);
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
            key: "fullname",
            title: "Họ và tên",
            render: (_, record) => (
                <div className="text-sm text-gray-900">{record.fullName}</div>
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
            sortable: true,
        },
        {
            key: "roles",
            title: "Vai trò",
            render: (_, record) => (
                <div className="text-sm text-gray-900">
                    {record.roles?.map(role => (
                        <>
                            {role.name}
                            <br />
                        </>
                    )) || <span className="text-gray-500 text-sm">Chưa có vai trò</span>}
                </div>
            ),
            sortable: true,
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
                        {allUnits.map(unit => (
                            <option key={unit.id} value={unit.id}>
                                {unit.name}
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
                        <option value={UserStatus.ACTIVE}>{statusLabels[UserStatus.ACTIVE]}</option>
                        <option value={UserStatus.INACTIVE}>{statusLabels[UserStatus.INACTIVE]}</option>
                        <option value={UserStatus.LOCKED}>{statusLabels[UserStatus.LOCKED]}</option>
                    </select>
                </div>
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-600 mb-4">
                Hiển thị {filteredUsers.length} trên tổng số {lstUser.length} người dùng
            </div>

            {/* Users Table */}
            <Table<User>
                columns={columns}
                data={filteredUsers}
                emptyText="Không tìm thấy người dùng"
                emptyIcon={<Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
            />
            <UserDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                user={selectedUser}
                onResetPassword={handleResetPassword}
                onToggleLock={selectedUser ? (() => handleToggleLock(selectedUser.id)) : (() => { })}
            />
        </div>
    );
}
