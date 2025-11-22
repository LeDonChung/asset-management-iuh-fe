"use client";

import React, { useState, useEffect } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableColumn } from "@/components/ui/table";
import { User, InventorySessionMember } from "@/types/asset";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { findAllUserInventory } from "@/lib/store/slices/userSlice";
import { findAllInventoryRoles } from "@/lib/store/slices/roleSlice";
import {
  deleteMemberInventorySession,
  setMemberSession,
} from "@/lib/store/slices/inventorySlice";
import toast from "react-hot-toast";
import MemberModal from "./MemberModal";
import { PermissionConstants, usePermissions } from "@/hooks/usePermissions";

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
  const { hasAnyPermission } = usePermissions();
  const canEdit = hasAnyPermission([
    PermissionConstants.PERM_UPDATE_INVENTORY,
  ]);
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
      width: "80px",
      render: (_, __, index) => (
        <div className="text-center font-medium text-gray-900">
          {index + 1}
        </div>
      ),
      className: "text-center",
    },
    {
      key: "fullName",
      title: "HỌ VÀ TÊN",
      width: "280px",
      sorter: (a, b) => {
        const nameA = a.user?.fullName || "Trưởng các đơn vị thuộc trường";
        const nameB = b.user?.fullName || "Trưởng các đơn vị thuộc trường";
        return nameA.localeCompare(nameB, "vi");
      },
      render: (_, record) => (
        <div className="py-2">
          <div className="font-semibold text-gray-900 mb-1">
            {record.user?.fullName || "Trưởng các đơn vị thuộc trường"}
          </div>
          <div className="text-sm text-gray-500">
            {record.user?.email || "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "roles",
      title: "CHỨC VỤ",
      width: "200px",
      render: (_, record) => (
        <div className="text-sm text-gray-700 font-medium">
          {record.user?.roles?.map((role) => role.name).join(", ") || "Ban kiểm kê"}
        </div>
      ),
    },
    {
      key: "role",
      title: "NHIỆM VỤ",
      render: (_, record) => (
        <div className="max-w-sm">
          <div className="text-sm text-gray-700 font-medium" title={record.role}>
            {record.role || "-"}
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      title: "HÀNH ĐỘNG",
      width: "140px",
      className: "text-center",
      render: (_, record) => (
        <div className="flex justify-center gap-2">
          {canEdit && (
            <>
              <button
                onClick={() => setEditingMember(record)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                title="Sửa"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDeleteMember(record.id)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                title="Xóa"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
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
            session && !session.members?.some(
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
      <div className="p-6 text-center">
        <p className="text-gray-500">Vui lòng tải lại trang để xem thông tin.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden">
        {session.members && session.members.length > 0 ? (
          <Table
            columns={columns}
            data={session.members}
            rowKey="id"
            className="border-0"
            emptyText="Chưa có thành viên nào trong ban kiểm kê"
          />
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">Chưa có thành viên nào trong ban kiểm kê</p>
          </div>
        )}
      </div>
      
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
