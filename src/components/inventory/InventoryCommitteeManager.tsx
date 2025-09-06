"use client";

import React, { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableColumn } from "@/components/ui/table";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { 
  InventoryCommitteeMember, 
  InventoryCommitteeRole,
  InventorySession
} from "@/types/asset";

interface InventoryCommitteeManagerProps {
  session: InventorySession;
}

export default function InventoryCommitteeManager({ session }: InventoryCommitteeManagerProps) {
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<InventoryCommitteeMember | null>(null);

  // Mock data for committee members using proper interface
  const [committeeMembers, setCommitteeMembers] = useState<InventoryCommitteeMember[]>([
    {
      id: "1",
      committeeId: "committee-1",
      userId: "user-1",
      role: InventoryCommitteeRole.CHAIR,
      responsibility: "Chỉ đạo chung công tác kiểm kê, quyết định các vấn đề quan trọng",
      user: {
        id: "user-1",
        username: "nxhong",
        fullName: "Nguyễn Xuân Hồng",
        email: "nguyenxuanhong@iuh.edu.vn",
        phoneNumber: "028.38940390",
        status: "ACTIVE" as any,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01"
      }
    },
    {
      id: "2",
      committeeId: "committee-1", 
      userId: "user-2",
      role: InventoryCommitteeRole.VICE_CHAIR,
      responsibility: "Hỗ trợ trưởng ban, phụ trách điều phối các tiểu ban",
      user: {
        id: "user-2",
        username: "nqtuan",
        fullName: "Nguyễn Quý Tuấn",
        email: "nguyenquytuan@iuh.edu.vn",
        phoneNumber: "028.38940390",
        status: "ACTIVE" as any,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01"
      }
    },
    {
      id: "3",
      committeeId: "committee-1",
      userId: "user-3", 
      role: InventoryCommitteeRole.CHIEF_SECRETARY,
      responsibility: "Tổng hợp báo cáo, quản lý tài liệu, điều phối thông tin",
      user: {
        id: "user-3",
        username: "ptttrang",
        fullName: "Phạm Thị Thùy Trang",
        email: "phamthithuytrang@iuh.edu.vn",
        phoneNumber: "028.38940390",
        status: "ACTIVE" as any,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01"
      }
    },
    {
      id: "4",
      committeeId: "committee-1",
      userId: "user-4",
      role: InventoryCommitteeRole.SECRETARY,
      responsibility: "Hỗ trợ thư ký tổng hợp, quản lý hồ sơ phân công",
      user: {
        id: "user-4",
        username: "dihai",
        fullName: "Đặng Ích Hải", 
        email: "dangichai@iuh.edu.vn",
        phoneNumber: "028.38940390",
        status: "ACTIVE" as any,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01"
      }
    },
    {
      id: "5",
      committeeId: "committee-1",
      userId: "user-5",
      role: InventoryCommitteeRole.MEMBER,
      responsibility: "Giám sát công tác kiểm kê tài chính kế toán",
      user: {
        id: "user-5",
        username: "ptqminh",
        fullName: "Phạm Thị Quế Minh",
        email: "phamthiqueminh@iuh.edu.vn", 
        phoneNumber: "028.38940390",
        status: "ACTIVE" as any,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01"
      }
    },
    {
      id: "6",
      committeeId: "committee-1",
      userId: "user-6",
      role: InventoryCommitteeRole.MEMBER,
      responsibility: "Kiểm tra công tác lập kế hoạch và đầu tư tài sản",
      user: {
        id: "user-6",
        username: "ntthi",
        fullName: "Nguyễn Trường Thi",
        email: "nguyentruongthi@iuh.edu.vn",
        phoneNumber: "028.38940390", 
        status: "ACTIVE" as any,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01"
      }
    },
    {
      id: "7",
      committeeId: "committee-1", 
      userId: "user-7",
      role: InventoryCommitteeRole.MEMBER,
      responsibility: "Hỗ trợ kiểm tra công tác kế hoạch đầu tư",
      user: {
        id: "user-7",
        username: "tthai",
        fullName: "Trần Thanh Hải",
        email: "tranthanhai@iuh.edu.vn",
        phoneNumber: "028.38940390",
        status: "ACTIVE" as any,
        createdAt: "2024-01-01", 
        updatedAt: "2024-01-01"
      }
    },
    {
      id: "8",
      committeeId: "committee-1",
      userId: "user-8", 
      role: InventoryCommitteeRole.MEMBER,
      responsibility: "Giám sát kiểm kê tại cơ sở Thanh Hóa",
      user: {
        id: "user-8",
        username: "ntha",
        fullName: "Nguyễn Thị Hà",
        email: "nguyenthiha@iuh.edu.vn",
        phoneNumber: "0237.3940390",
        status: "ACTIVE" as any,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01"
      }
    },
    {
      id: "9",
      committeeId: "committee-1",
      userId: "user-9",
      role: InventoryCommitteeRole.MEMBER, 
      responsibility: "Giám sát kiểm kê tại phân hiệu Quảng Ngãi",
      user: {
        id: "user-9",
        username: "pvhung",
        fullName: "Phạm Việt Hùng",
        email: "phamviethung@iuh.edu.vn",
        phoneNumber: "0255.3940390",
        status: "ACTIVE" as any,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01"
      }
    },
    {
      id: "10", 
      committeeId: "committee-1",
      role: InventoryCommitteeRole.MEMBER,
      responsibility: "Điều phối các đơn vị thuộc trường tham gia kiểm kê"
    }
  ]);

  const getRoleLabel = (role: InventoryCommitteeRole) => {
    switch (role) {
      case InventoryCommitteeRole.CHAIR:
        return "Trưởng ban";
      case InventoryCommitteeRole.VICE_CHAIR:
        return "Phó Trưởng ban";
      case InventoryCommitteeRole.CHIEF_SECRETARY:
        return "Thư ký Tổng hợp";
      case InventoryCommitteeRole.SECRETARY:
        return "Thư ký";
      case InventoryCommitteeRole.MEMBER:
        return "Ủy viên";
      default:
        return "Ủy viên";
    }
  };

  const getRoleBadgeColor = (role: InventoryCommitteeRole) => {
    switch (role) {
      case InventoryCommitteeRole.CHAIR:
        return "bg-red-100 text-red-800";
      case InventoryCommitteeRole.VICE_CHAIR:
        return "bg-orange-100 text-orange-800";
      case InventoryCommitteeRole.CHIEF_SECRETARY:
        return "bg-blue-100 text-blue-800";
      case InventoryCommitteeRole.SECRETARY:
        return "bg-cyan-100 text-cyan-800";
      case InventoryCommitteeRole.MEMBER:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDeleteMember = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa thành viên này khỏi ban kiểm kê?")) {
      setCommitteeMembers(prev => prev.filter(member => member.id !== id));
    }
  };

  // Define table columns
  const columns: TableColumn<InventoryCommitteeMember>[] = [
    {
      key: "index",
      title: "STT",
      width: "60px",
      render: (_, __, index) => index + 1,
      className: "text-center"
    },
    {
      key: "user",
      title: "Họ tên",
      width: "250px",
      sortable: true,
      sorter: (a, b) => {
        const nameA = a.user?.fullName || "Trưởng các đơn vị thuộc trường";
        const nameB = b.user?.fullName || "Trưởng các đơn vị thuộc trường";
        return nameA.localeCompare(nameB, 'vi');
      },
      render: (_, record) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            <UserCheck className="h-5 w-5 text-gray-500" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {record.user?.fullName || "Trưởng các đơn vị thuộc trường"}
            </div>
            {record.user && (
              <div className="text-sm text-gray-500">
                {record.user.phoneNumber} • {record.user.email}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: "role",
      title: "Chức vụ",
      width: "150px",
      sortable: true,
      render: (_, record) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(record.role)}`}>
          {getRoleLabel(record.role)}
        </span>
      )
    },
    {
      key: "responsibility",
      title: "Nhiệm vụ",
      sortable: true,
      render: (value) => (
        <div className="max-w-xs">
          <div className="truncate" title={value}>
            {value || "Chưa có mô tả nhiệm vụ"}
          </div>
        </div>
      )
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
      )
    }
  ];

  // Add/Edit Member Modal Component
  const MemberModal = ({ 
    isOpen, 
    onClose, 
    member = null 
  }: {
    isOpen: boolean;
    onClose: () => void;
    member?: InventoryCommitteeMember | null;
  }) => {
    const [formData, setFormData] = useState({
      fullName: member?.user?.fullName || "",
      role: member?.role || InventoryCommitteeRole.MEMBER,
      responsibility: member?.responsibility || "",
      phoneNumber: member?.user?.phoneNumber || "",
      email: member?.user?.email || ""
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (member) {
        // Update existing member
        setCommitteeMembers(prev => 
          prev.map(m => m.id === member.id ? {
            ...member,
            role: formData.role,
            responsibility: formData.responsibility,
            user: member.user ? {
              ...member.user,
              fullName: formData.fullName,
              phoneNumber: formData.phoneNumber,
              email: formData.email
            } : undefined
          } : m)
        );
      } else {
        // Add new member
        const newMember: InventoryCommitteeMember = {
          id: Date.now().toString(),
          committeeId: "committee-1",
          userId: `user-${Date.now()}`,
          role: formData.role,
          responsibility: formData.responsibility,
          user: {
            id: `user-${Date.now()}`,
            username: formData.fullName.toLowerCase().replace(/\s/g, ''),
            fullName: formData.fullName,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            status: "ACTIVE" as any,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        };
        setCommitteeMembers(prev => [...prev, newMember]);
      }
      
      onClose();
      setFormData({
        fullName: "",
        role: InventoryCommitteeRole.MEMBER,
        responsibility: "",
        phoneNumber: "",
        email: ""
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
                {member ? "Cập nhật thông tin thành viên ban kiểm kê" : "Thêm thành viên mới vào ban kiểm kê"}
              </p>
            </div>
          </div>
        </ModalHeader>
        
        <form onSubmit={handleSubmit}>
          <ModalBody className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Nhập họ tên đầy đủ"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chức vụ <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as InventoryCommitteeRole }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value={InventoryCommitteeRole.CHAIR}>Trưởng ban</option>
                  <option value={InventoryCommitteeRole.VICE_CHAIR}>Phó Trưởng ban</option>
                  <option value={InventoryCommitteeRole.CHIEF_SECRETARY}>Thư ký Tổng hợp</option>
                  <option value={InventoryCommitteeRole.SECRETARY}>Thư ký</option>
                  <option value={InventoryCommitteeRole.MEMBER}>Ủy viên</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhiệm vụ <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.responsibility}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsibility: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Mô tả chi tiết nhiệm vụ và trách nhiệm của thành viên"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0xx.xxxx.xxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="email@iuh.edu.vn"
                />
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {member ? "Cập nhật thông tin" : "Thêm thành viên"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    );
  };

  return (
    <div className="mt-6">
      {/* Committee Members Table */}
      <Table
        columns={columns}
        data={committeeMembers}
        rowKey="id"
        title="Ban kiểm kê chính"
        headerExtra={
          <Button 
            onClick={() => setShowAddMemberModal(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm thành viên</span>
          </Button>
        }
        className="mb-6"
        emptyText="Chưa có thành viên nào trong ban kiểm kê"
        emptyIcon={<UserCheck className="h-16 w-16 text-gray-300 mx-auto" />}
      />

      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            {committeeMembers.length}
          </div>
          <div className="text-sm text-gray-500">Tổng thành viên</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-red-600">
            {committeeMembers.filter(m => m.role === InventoryCommitteeRole.CHAIR).length}
          </div>
          <div className="text-sm text-gray-500">Trưởng ban</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">
            {committeeMembers.filter(m => m.role === InventoryCommitteeRole.VICE_CHAIR).length}
          </div>
          <div className="text-sm text-gray-500">Phó Trưởng ban</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {committeeMembers.filter(m => [InventoryCommitteeRole.CHIEF_SECRETARY, InventoryCommitteeRole.SECRETARY].includes(m.role)).length}
          </div>
          <div className="text-sm text-gray-500">Thư ký</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-600">
            {committeeMembers.filter(m => m.role === InventoryCommitteeRole.MEMBER).length}
          </div>
          <div className="text-sm text-gray-500">Ủy viên</div>
        </div>
      </div>

      {/* Member Modals */}
      <MemberModal 
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
      />
      <MemberModal 
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        member={editingMember}
      />
    </div>
  );
}
