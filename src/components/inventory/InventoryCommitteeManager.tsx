"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  UserCheck,
  Search,
  Users,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableColumn } from "@/components/ui/table";
import { User, Role, UserStatus, InventorySessionMember } from "@/types/asset";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  findAllUserInventory,
} from "@/lib/store/slices/userSlice";
import { findAllInventoryRoles } from "@/lib/store/slices/roleSlice";
import {
  deleteMemberInventorySession,
  setMemberSession,
} from "@/lib/store/slices/inventorySlice";
import toast from "react-hot-toast";
import MemberModal from "./MemberModal";

interface InventoryCommitteeManagerProps {
  showAddMemberModal?: boolean;
  onCloseAddMemberModal?: () => void;
}

export default function InventoryCommitteeManager({
  showAddMemberModal: externalShowAddMemberModal,
  onCloseAddMemberModal,
}: InventoryCommitteeManagerProps) {
  const dispatch = useAppDispatch();
  const { currentSession } = useAppSelector((state) => state.inventory);

  // Use currentSession from Redux instead of prop
  const session = currentSession;

  const [editingMember, setEditingMember] =
    useState<InventorySessionMember | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  // Use external modal state if provided
  const showAddMemberModal = externalShowAddMemberModal ?? false;
  const handleCloseAddMemberModal = onCloseAddMemberModal || (() => {});

  const handleDeleteMember = async (id: string) => {
    if (!session) return;

    if (confirm("Bạn có chắc chắn muốn xóa thành viên này khỏi ban kiểm kê?")) {
      try {
        await dispatch(
          deleteMemberInventorySession({
            sessionId: session.id,
            memberId: id,
          })
        ).unwrap();

        // Update Redux state
        dispatch(
          setMemberSession(
            session.members?.filter(
              (m: InventorySessionMember) => m.id !== id
            ) || []
          )
        );

        toast.success("Xóa thành viên thành công!");
      } catch (error: any) {
        console.log(error);
        toast.error(error.message || "Có lỗi xảy ra khi xóa thành viên");
      }
    }
  };

  // Define table columns
  const columns: TableColumn<InventorySessionMember>[] = [
    {
      key: "index",
      title: "STT",
      width: "60px",
      render: (_, __, index) => index + 1,
      className: "text-center",
    },
    {
      key: "fullName",
      title: "Họ và tên",
      width: "250px",
      sorter: (a, b) => {
        const nameA = a.user?.fullName || "Trưởng các đơn vị thuộc trường";
        const nameB = b.user?.fullName || "Trưởng các đơn vị thuộc trường";
        return nameA.localeCompare(nameB, "vi");
      },
      render: (_, record) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            <UserCheck className="h-5 w-5 text-gray-500" />
          </div>
          <div className="ml-4">
            <div className="text-sm">
              {record.user?.fullName || "Trưởng các đơn vị thuộc trường"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "roles",
      title: "Chức vụ",
      width: "150px",
      render: (_, record) => (
        <span className={`inline-flex px-2 py-1 rounded-full`}>
          {record.user?.roles?.map((role) => role.name).join(", ")}
        </span>
      ),
    },
    {
      key: "role",
      title: "Nhiệm vụ",
      render: (_, record) => (
        <div className="max-w-xs">
          <div className="truncate" title={record.role}>
            {record.role || "Chưa có ghi chú"}
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      title: "Hành động",
      width: "120px",
      className: "text-center",
      render: (_, record) => (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setEditingMember(record)}
            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
            title="Chỉnh sửa"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteMember(record.id)}
            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
            title="Xóa"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  // Load available users and roles on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        let usersResult = await dispatch(findAllUserInventory()).unwrap();
        dispatch(findAllInventoryRoles());
        usersResult = usersResult.filter(
          (user: User) =>
            !session.members?.some(
              (member: InventorySessionMember) => member.userId === user.id
            )
        );
        setAvailableUsers(usersResult || []);
      } catch (error: any) {
        console.log(error);
        toast.error(
          error.message || "Có lỗi xảy ra khi lấy danh sách người dùng"
        );
        setAvailableUsers([]);
      }
    };

    loadData();
  }, [dispatch, session]);

  // Return early if no session
  if (!session) {
    return (
      <div className="mt-6 text-center py-12">
        <UserCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Không có phiên kiểm kê
        </h3>
        <p className="text-gray-500">
          Vui lòng tải lại trang để xem thông tin.
        </p>
      </div>
    );
  }

  return (
    <>
      <Table
        columns={columns}
        data={session.members ?? []}
        rowKey="id"
        emptyText="Chưa có thành viên nào trong ban kiểm kê"
        emptyIcon={<UserCheck className="h-16 w-16 text-gray-300 mx-auto" />}
      />
      {/* Member Modals */}
      <MemberModal
        isOpen={showAddMemberModal}
        onClose={handleCloseAddMemberModal}
        availableUsers={availableUsers}
        session={session}
      />
      <MemberModal
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        member={editingMember}
        availableUsers={availableUsers}
        session={session}
      />
    </>
  );
}
