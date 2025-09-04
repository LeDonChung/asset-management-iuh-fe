"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { 
  Users,
  UserPlus,
  ChevronDown,
  Trash2,
  Edit,
  Building
} from "lucide-react";
import { InventoryGroup, InventoryGroupMember, InventoryGroupRole, User, Unit, InventoryGroupAssignment } from "@/types/asset";

interface GroupManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: InventoryGroup;
  availableUsers: User[];
  availableUnits: Unit[];
  onSave: (group: InventoryGroup) => void;
}

type TabType = 'members' | 'assignments';

// Mock units for development - Enhanced with more realistic IUH units
const mockUnits: Unit[] = [
  {
    id: "dept1",
    name: "Khoa Cơ khí",
    type: "DON_VI_SU_DUNG" as any,
    representativeId: "u1",
    status: "ACTIVE" as any,
    createdBy: "admin",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  {
    id: "dept2",
    name: "Khoa Công nghệ thông tin",
    type: "DON_VI_SU_DUNG" as any,
    representativeId: "u3",
    status: "ACTIVE" as any,
    createdBy: "admin",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  {
    id: "dept3",
    name: "Khoa Điện - Điện tử",
    type: "DON_VI_SU_DUNG" as any,
    representativeId: "u4",
    status: "ACTIVE" as any,
    createdBy: "admin",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  {
    id: "dept4",
    name: "Khoa Kinh tế",
    type: "DON_VI_SU_DUNG" as any,
    representativeId: "u5",
    status: "ACTIVE" as any,
    createdBy: "admin",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  {
    id: "dept5",
    name: "Khoa Kế toán - Kiểm toán",
    type: "DON_VI_SU_DUNG" as any,
    representativeId: "u6",
    status: "ACTIVE" as any,
    createdBy: "admin",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  {
    id: "dept6",
    name: "Khoa Ngoại ngữ",
    type: "DON_VI_SU_DUNG" as any,
    representativeId: "u7",
    status: "ACTIVE" as any,
    createdBy: "admin",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  {
    id: "dept7",
    name: "Khoa Khoa học Cơ bản",
    type: "DON_VI_SU_DUNG" as any,
    representativeId: "u8",
    status: "ACTIVE" as any,
    createdBy: "admin",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  {
    id: "dept8",
    name: "Khoa Luật",
    type: "DON_VI_SU_DUNG" as any,
    representativeId: "u9",
    status: "ACTIVE" as any,
    createdBy: "admin",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  {
    id: "dept9",
    name: "Phòng Đào tạo",
    type: "DON_VI_SU_DUNG" as any,
    representativeId: "u10",
    status: "ACTIVE" as any,
    createdBy: "admin",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  {
    id: "dept10",
    name: "Phòng Tài chính - Kế toán",
    type: "DON_VI_SU_DUNG" as any,
    representativeId: "u11",
    status: "ACTIVE" as any,
    createdBy: "admin",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  {
    id: "dept11",
    name: "Phòng Hành chính - Nhân sự",
    type: "DON_VI_SU_DUNG" as any,
    representativeId: "u12",
    status: "ACTIVE" as any,
    createdBy: "admin",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  {
    id: "dept12",
    name: "Phòng Quản trị Thiết bị",
    type: "DON_VI_SU_DUNG" as any,
    representativeId: "u13",
    status: "ACTIVE" as any,
    createdBy: "admin",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  {
    id: "dept13",
    name: "Thư viện",
    type: "DON_VI_SU_DUNG" as any,
    representativeId: "u14",
    status: "ACTIVE" as any,
    createdBy: "admin",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  {
    id: "dept14",
    name: "Trung tâm Tin học",
    type: "DON_VI_SU_DUNG" as any,
    representativeId: "u15",
    status: "ACTIVE" as any,
    createdBy: "admin",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  {
    id: "dept15",
    name: "Phòng thí nghiệm Trung tâm",
    type: "DON_VI_SU_DUNG" as any,
    representativeId: "u16",
    status: "ACTIVE" as any,
    createdBy: "admin",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  }
];

export default function GroupManagementModal({ 
  isOpen, 
  onClose, 
  group,
  availableUsers,
  availableUnits = mockUnits,
  onSave
}: GroupManagementModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('members');
  const [currentGroup, setCurrentGroup] = useState<InventoryGroup>(group);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [editingMember, setEditingMember] = useState<InventoryGroupMember | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<InventoryGroupAssignment | null>(null);

  const handleSave = () => {
    onSave(currentGroup);
    onClose();
  };

  const handleAddMember = (formData: { userId: string; role: InventoryGroupRole }) => {
    const newMember: InventoryGroupMember = {
      id: `m${Date.now()}`,
      groupId: currentGroup.id,
      userId: formData.userId,
      role: formData.role,
      user: availableUsers.find(u => u.id === formData.userId)
    };

    setCurrentGroup(prev => ({
      ...prev,
      members: [...(prev.members || []), newMember]
    }));

    setShowMemberForm(false);
  };

  const handleEditMember = (member: InventoryGroupMember, formData: { role: InventoryGroupRole }) => {
    setCurrentGroup(prev => ({
      ...prev,
      members: prev.members?.map(m => 
        m.id === member.id ? { ...m, role: formData.role } : m
      ) || []
    }));

    setEditingMember(null);
  };

  const handleRemoveMember = (memberId: string) => {
    setCurrentGroup(prev => ({
      ...prev,
      members: prev.members?.filter(m => m.id !== memberId) || []
    }));
  };

  const handleAddAssignment = (formData: { unitId: string; startDate: string; endDate: string; note: string }) => {
    const newAssignment: InventoryGroupAssignment = {
      id: `a${Date.now()}`,
      groupId: currentGroup.id,
      unitId: formData.unitId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      note: formData.note,
      unit: availableUnits.find(u => u.id === formData.unitId),
      results: []
    };

    setCurrentGroup(prev => ({
      ...prev,
      assignments: [...(prev.assignments || []), newAssignment]
    }));

    setShowAssignmentForm(false);
  };

  const handleEditAssignment = (assignment: InventoryGroupAssignment, formData: any) => {
    setCurrentGroup(prev => ({
      ...prev,
      assignments: prev.assignments?.map(a => 
        a.id === assignment.id ? { ...a, ...formData, unit: availableUnits.find(u => u.id === formData.unitId) } : a
      ) || []
    }));

    setEditingAssignment(null);
  };

  const handleRemoveAssignment = (assignmentId: string) => {
    setCurrentGroup(prev => ({
      ...prev,
      assignments: prev.assignments?.filter(a => a.id !== assignmentId) || []
    }));
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="2xl"
        className="max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 -m-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Building className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Quản lý nhóm: {group.name}</h2>
              <p className="text-gray-600">Thành viên và phân công kiểm kê</p>
            </div>
          </div>
        </div>

        <div className="flex -m-6">
          {/* Tabs */}
          <div className="w-64 bg-gray-50 p-4">
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('members')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'members'
                    ? 'bg-green-100 text-green-600'
                    : 'text-gray-600 hover:bg-white'
                }`}
              >
                <Users className="h-5 w-5" />
                <span className="font-medium">Thành viên</span>
                <span className="ml-auto text-sm bg-gray-200 px-2 py-1 rounded">
                  {currentGroup.members?.length || 0}
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('assignments')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'assignments'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-white'
                }`}
              >
                <Building className="h-5 w-5" />
                <span className="font-medium">Phân công</span>
                <span className="ml-auto text-sm bg-gray-200 px-2 py-1 rounded">
                  {currentGroup.assignments?.length || 0}
                </span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {activeTab === 'members' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Danh sách thành viên</h3>
                  <Button onClick={() => setShowMemberForm(true)} className="bg-green-600 hover:bg-green-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Thêm thành viên
                  </Button>
                </div>

                {(!currentGroup.members || currentGroup.members.length === 0) ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-600 mb-2">Chưa có thành viên</h4>
                    <p className="text-gray-500 mb-6">Thêm thành viên để bắt đầu phân công nhiệm vụ</p>
                    <Button onClick={() => setShowMemberForm(true)} className="bg-green-600 hover:bg-green-700">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Thêm thành viên đầu tiên
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentGroup.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-lg font-semibold text-green-600">
                              {member.user?.fullName?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h5 className="font-semibold">{member.user?.fullName}</h5>
                            <p className="text-sm text-gray-600">{member.user?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            member.role === InventoryGroupRole.LEADER
                              ? 'bg-blue-100 text-blue-700'
                              : member.role === InventoryGroupRole.SECRETARY
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {member.role === InventoryGroupRole.LEADER
                              ? 'Trưởng nhóm'
                              : member.role === InventoryGroupRole.SECRETARY
                              ? 'Thư ký'
                              : 'Thành viên'
                            }
                          </span>
                          <Button size="sm" variant="ghost" onClick={() => setEditingMember(member)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleRemoveMember(member.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'assignments' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Phân công kiểm kê</h3>
                  <Button onClick={() => setShowAssignmentForm(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Building className="h-4 w-4 mr-2" />
                    Thêm phân công
                  </Button>
                </div>

                {(!currentGroup.assignments || currentGroup.assignments.length === 0) ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-600 mb-2">Chưa có phân công</h4>
                    <p className="text-gray-500 mb-6">Phân công đơn vị cho nhóm để bắt đầu kiểm kê</p>
                    <Button onClick={() => setShowAssignmentForm(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Building className="h-4 w-4 mr-2" />
                      Thêm phân công đầu tiên
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentGroup.assignments.map((assignment) => (
                      <div key={assignment.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-semibold text-lg">{assignment.unit?.name}</h5>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-2">
                              <div>
                                <span className="font-medium">Bắt đầu:</span>{' '}
                                {new Date(assignment.startDate).toLocaleDateString('vi-VN')}
                              </div>
                              <div>
                                <span className="font-medium">Kết thúc:</span>{' '}
                                {new Date(assignment.endDate).toLocaleDateString('vi-VN')}
                              </div>
                            </div>
                            {assignment.note && (
                              <div className="mt-2 text-sm text-gray-600">
                                <span className="font-medium">Ghi chú:</span> {assignment.note}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setEditingAssignment(assignment)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleRemoveAssignment(assignment.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <ModalFooter className="-m-6 mt-6">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            Lưu thay đổi
          </Button>
        </ModalFooter>
      </Modal>

      {/* Add Member Form */}
      <Modal isOpen={showMemberForm} onClose={() => setShowMemberForm(false)} title="Thêm thành viên mới">
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleAddMember({
            userId: formData.get('userId') as string,
            role: formData.get('role') as InventoryGroupRole
          });
        }}>
          <ModalBody>
            <div>
              <label className="block text-sm font-medium mb-2">Chọn người dùng</label>
              <select name="userId" className="w-full p-3 border rounded-lg" required>
                <option value="">-- Chọn thành viên --</option>
                {availableUsers.filter(user => 
                  !currentGroup.members?.some(m => m.userId === user.id)
                ).map(user => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} - {user.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Vai trò</label>
              <select name="role" className="w-full p-3 border rounded-lg" required>
                <option value={InventoryGroupRole.MEMBER}>Thành viên</option>
                <option value={InventoryGroupRole.SECRETARY}>Thư ký</option>
                <option value={InventoryGroupRole.LEADER}>Trưởng nhóm</option>
              </select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowMemberForm(false)}>
              Hủy
            </Button>
            <Button type="submit">Thêm thành viên</Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Add Assignment Form */}
      <Modal isOpen={showAssignmentForm} onClose={() => setShowAssignmentForm(false)} title="Phân công đơn vị">
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleAddAssignment({
            unitId: formData.get('unitId') as string,
            startDate: formData.get('startDate') as string,
            endDate: formData.get('endDate') as string,
            note: formData.get('note') as string
          });
        }}>
          <ModalBody>
            <div>
              <label className="block text-sm font-medium mb-2">Đơn vị</label>
              <select name="unitId" className="w-full p-3 border rounded-lg" required>
                <option value="">-- Chọn đơn vị --</option>
                {availableUnits.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ngày bắt đầu</label>
                <input 
                  type="date" 
                  name="startDate" 
                  className="w-full p-3 border rounded-lg"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ngày kết thúc</label>
                <input 
                  type="date" 
                  name="endDate" 
                  className="w-full p-3 border rounded-lg"
                  defaultValue={new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]}
                  required 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Ghi chú</label>
              <textarea 
                name="note" 
                className="w-full p-3 border rounded-lg" 
                rows={3}
                placeholder="Ghi chú về phân công..."
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowAssignmentForm(false)}>
              Hủy
            </Button>
            <Button type="submit">Tạo phân công</Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Edit Member Form */}
      <Modal 
        isOpen={!!editingMember} 
        onClose={() => setEditingMember(null)} 
        title="Chỉnh sửa vai trò thành viên"
      >
        {editingMember && (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleEditMember(editingMember, {
              role: formData.get('role') as InventoryGroupRole
            });
          }}>
            <ModalBody>
              <div>
                <label className="block text-sm font-medium mb-2">Thành viên</label>
                <input 
                  type="text" 
                  value={editingMember.user?.fullName || ''} 
                  className="w-full p-3 border rounded-lg bg-gray-50" 
                  disabled 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Vai trò</label>
                <select name="role" defaultValue={editingMember.role} className="w-full p-3 border rounded-lg" required>
                  <option value={InventoryGroupRole.MEMBER}>Thành viên</option>
                  <option value={InventoryGroupRole.SECRETARY}>Thư ký</option>
                  <option value={InventoryGroupRole.LEADER}>Trưởng nhóm</option>
                </select>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={() => setEditingMember(null)}>
                Hủy
              </Button>
              <Button type="submit">Cập nhật</Button>
            </ModalFooter>
          </form>
        )}
      </Modal>

      {/* Edit Assignment Form */}
      <Modal 
        isOpen={!!editingAssignment} 
        onClose={() => setEditingAssignment(null)} 
        title="Chỉnh sửa phân công"
      >
        {editingAssignment && (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleEditAssignment(editingAssignment, {
              unitId: formData.get('unitId') as string,
              startDate: formData.get('startDate') as string,
              endDate: formData.get('endDate') as string,
              note: formData.get('note') as string
            });
          }}>
            <ModalBody>
              <div>
                <label className="block text-sm font-medium mb-2">Đơn vị</label>
                <select name="unitId" defaultValue={editingAssignment.unitId} className="w-full p-3 border rounded-lg" required>
                  <option value="">-- Chọn đơn vị --</option>
                  {availableUnits.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ngày bắt đầu</label>
                  <input 
                    type="date" 
                    name="startDate" 
                    defaultValue={editingAssignment.startDate.split('T')[0]}
                    className="w-full p-3 border rounded-lg"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ngày kết thúc</label>
                  <input 
                    type="date" 
                    name="endDate" 
                    defaultValue={editingAssignment.endDate.split('T')[0]}
                    className="w-full p-3 border rounded-lg"
                    required 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ghi chú</label>
                <textarea 
                  name="note" 
                  defaultValue={editingAssignment.note}
                  className="w-full p-3 border rounded-lg" 
                  rows={3}
                  placeholder="Ghi chú về phân công..."
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={() => setEditingAssignment(null)}>
                Hủy
              </Button>
              <Button type="submit">Cập nhật</Button>
            </ModalFooter>
          </form>
        )}
      </Modal>
    </>
  );
}
