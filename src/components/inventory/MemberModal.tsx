"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Users,
  UserPlus,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { User, Role, UserStatus, InventorySessionMember, InventorySession } from "@/types/asset";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  createUser,
  UpdateUser,
  CreateUser,
} from "@/lib/store/slices/userSlice";
import {
  createMemberInventorySession,
  updateMemberInventorySession,
  setMemberSession,
} from "@/lib/store/slices/inventorySlice";
import toast from "react-hot-toast";

// DTO interfaces matching backend
interface AddMemberDto {
  userId: string;
  role?: string;
}

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: InventorySessionMember | null;
  availableUsers: User[];
  session: InventorySession;
}

interface FormData extends UpdateUser {
  role: string;
  userId: string;
  password?: string;
}

export default function MemberModal({
  isOpen,
  onClose,
  member = null,
  availableUsers,
  session,
}: MemberModalProps) {
  const dispatch = useAppDispatch();
  const { createUserLoading } = useAppSelector((state) => state.user);
  const { inventoryRoles } = useAppSelector((state) => state.role);

  const [modalTab, setModalTab] = useState<"select" | "create">("select");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    userId: "",
    username: "",
    password: "",
    fullName: "",
    email: "",
    roleIds: [],
    role: "",
    status: UserStatus.ACTIVE,
  });

  // Populate form data when editing member
  useEffect(() => {
    if (member) {
      setFormData((prev) => ({
        ...prev,
        role: member.role || "",
        userId: member.userId || "",
      }));
    }
  }, [member]);

  // Reset form when modal opens for new member
  useEffect(() => {
    if (isOpen && !member) {
      setSelectedUser(null);
      setSearchTerm("");
      setSelectedRoleFilter("");
      setFilteredUsers([]);
      setModalTab("select");
      setFormData({
        userId: "",
        username: "",
        password: "",
        fullName: "",
        email: "",
        roleIds: [],
        role: "",
        status: UserStatus.ACTIVE,
      });
    }
  }, [isOpen, member]);

  // Handle user search and role filter
  useEffect(() => {
    let filtered = availableUsers;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (selectedRoleFilter) {
      filtered = filtered.filter((user) =>
        user.roles?.some((role) => role.id === selectedRoleFilter)
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, selectedRoleFilter, availableUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If editing existing member
    if (member) {
      try {
        const updateMemberDto: AddMemberDto = {
          userId: member.userId,
          role: formData.role,
        };
        const updatedMember = await dispatch(
          updateMemberInventorySession({
            sessionId: session.id,
            memberId: member.id,
            memberData: updateMemberDto,
          })
        ).unwrap();

        // Update Redux state with updated member
        if (updatedMember) {
          dispatch(
            setMemberSession(
              session.members?.map((m: InventorySessionMember) =>
                m.id === updatedMember.id ? updatedMember : m
              ) || []
            )
          );
        }

        toast.success("Cập nhật thành viên thành công!");
        onClose();
        resetForm();
      } catch (error: any) {
        toast.error(error.message || "Có lỗi xảy ra khi cập nhật thành viên");
      }
      return;
    }

    if (modalTab === "create") {
      // Create User
      const createUserDto: CreateUser = {
        username: formData.username,
        password: formData.password || "",
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        status: UserStatus.ACTIVE,
        roleIds: formData.roleIds,
      };
      try {
        const user = await dispatch(createUser(createUserDto)).unwrap();
        if (user) {
          // Create Member
          const createMemberDto: AddMemberDto = {
            userId: user.id,
            role: formData.role ?? "",
          };
          const newMember = await dispatch(
            createMemberInventorySession({
              id: session.id,
              memberData: createMemberDto,
            })
          ).unwrap();

          // Update Redux state with new member
          if (newMember) {
            dispatch(
              setMemberSession([...(session.members ?? []), newMember])
            );
          }

          toast.success("Tạo người dùng và thêm vào ban kiểm kê thành công!");
          onClose();
          resetForm();
        }
      } catch (error: any) {
        toast.error(error.message || "Có lỗi xảy ra khi tạo người dùng");
      }
    } else {
      if (!selectedUser) {
        toast.error("Vui lòng chọn người dùng");
        return;
      }
      try {
        const createMemberDto: AddMemberDto = {
          userId: selectedUser?.id ?? "",
          role: formData.role ?? "",
        };
        const newMember = await dispatch(
          createMemberInventorySession({
            id: session.id,
            memberData: createMemberDto,
          })
        ).unwrap();

        // Update Redux state with new member
        if (newMember) {
          dispatch(setMemberSession([...(session.members ?? []), newMember]));
        }

        toast.success("Thêm thành viên vào ban kiểm kê thành công!");
        onClose();
        resetForm();
      } catch (error: any) {
        toast.error(error.message || "Có lỗi xảy ra khi thêm thành viên");
      }
    }
  };

  const resetForm = () => {
    setSelectedUser(null);
    setSearchTerm("");
    setSelectedRoleFilter("");
    setFilteredUsers([]);
    setModalTab("select");
    setFormData({
      userId: "",
      username: "",
      password: "",
      fullName: "",
      email: "",
      roleIds: [],
      role: "",
      status: UserStatus.ACTIVE,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <UserCheck className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {member ? "Chỉnh sửa thành viên" : "Thêm thành viên mới"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {member
                ? "Cập nhật thông tin thành viên ban kiểm kê"
                : "Chọn từ danh sách có sẵn hoặc tạo người dùng mới"}
            </p>
          </div>
        </div>
      </ModalHeader>

      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-6">
          {/* Show member info when editing */}
          {member && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {member.user?.fullName || "Người dùng không xác định"}
                  </div>
                  {member.user?.email && (
                    <div className="text-xs text-gray-500">
                      {member.user.email}
                    </div>
                  )}
                  {member.user?.phoneNumber && (
                    <div className="text-xs text-gray-500">
                      {member.user.phoneNumber}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab selection for add new member */}
          {!member && (
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setModalTab("select")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  modalTab === "select"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                Chọn từ danh sách
              </button>
              <button
                type="button"
                onClick={() => setModalTab("create")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  modalTab === "create"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <UserPlus className="h-4 w-4 inline mr-2" />
                Tạo người dùng mới
              </button>
            </div>
          )}

          {/* Select existing user tab */}
          {!member && modalTab === "select" && (
            <div className="space-y-4">
              {/* User search and role filter */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm người dùng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <select
                    value={selectedRoleFilter}
                    onChange={(e) => setSelectedRoleFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Tất cả vai trò</option>
                    {inventoryRoles.map((role: Role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected user display (if selected but not in filtered list) */}
              {selectedUser &&
                !filteredUsers.some((u) => u.id === selectedUser.id) && (
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium mb-2">
                      Đã chọn:
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <UserCheck className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {selectedUser.fullName}
                        </div>
                        {selectedUser.email && (
                          <div className="text-xs text-gray-500">
                            {selectedUser.email}
                          </div>
                        )}
                        {selectedUser.phoneNumber && (
                          <div className="text-xs text-gray-500">
                            {selectedUser.phoneNumber}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedUser(null)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        Bỏ chọn
                      </button>
                    </div>
                  </div>
                )}

              {/* User list */}
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {selectedRoleFilter || searchTerm
                      ? "Không tìm thấy người dùng nào phù hợp"
                      : "Không tìm thấy người dùng nào"}
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                        selectedUser?.id === user.id
                          ? "bg-blue-50 border-blue-200"
                          : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {user.fullName}
                          </div>
                          {user.email && (
                            <div className="text-xs text-gray-500">
                              {user.email}
                            </div>
                          )}
                          {user.phoneNumber && (
                            <div className="text-xs text-gray-500">
                              {user.phoneNumber}
                            </div>
                          )}
                          {user.roles && user.roles.length > 0 && (
                            <div className="text-xs text-blue-600 mt-1">
                              {user.roles.map((role) => role.name).join(", ")}
                            </div>
                          )}
                        </div>
                        {selectedUser?.id === user.id && (
                          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Create new user tab */}
          {!member && modalTab === "create" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên đăng nhập <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Nhập tên đăng nhập"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Nhập mật khẩu"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Nhập họ tên đầy đủ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="email@iuh.edu.vn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0xx.xxxx.xxxx"
                />
              </div>
            </div>
          )}

          {/* Role and Notes (common for all modes) */}
          {(member ||
            (!member &&
              (modalTab === "select" || modalTab === "create"))) && (
            <div className="border-t pt-4 space-y-4">
              {modalTab === "create" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chức vụ<span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.roleIds?.[0] ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        roleIds: [e.target.value],
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Chọn chức vụ</option>
                    {inventoryRoles.map((role: Role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhiệm vụ
                </label>
                <textarea
                  rows={4}
                  value={formData.role}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, role: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Mô tả chi tiết nhiệm vụ và trách nhiệm của thành viên trong ban kiểm kê"
                />
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onClose();
              resetForm();
            }}
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            disabled={
              createUserLoading ||
              (!member && modalTab === "select" && !selectedUser) ||
              (!member &&
                modalTab === "create" &&
                (!formData.username ||
                  !formData.password ||
                  !formData.fullName ||
                  !formData.email ||
                  !formData.roleIds)) ||
              !formData.role
            }
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {createUserLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang xử lý...</span>
              </div>
            ) : member ? (
              "Cập nhật thông tin"
            ) : (
              "Thêm thành viên"
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
