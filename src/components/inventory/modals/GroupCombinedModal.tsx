"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Users,
  Building,
  Calendar,
  FileText,
  X,
  UserPlus,
  Trash2,
  Edit,
  ChevronDown
} from "lucide-react";
import { InventoryGroup, InventorySubCommittee, InventoryGroupMember, InventoryGroupRole, InventoryGroupAssignment, User, Unit } from "@/types/asset";
import ProgressIndicator from "../ProgressIndicator";

interface GroupCombinedModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: InventoryGroup;
  subCommittee: InventorySubCommittee;
  availableUsers: User[];
  availableUnits: Unit[];
  onSave: (group: InventoryGroup) => void;
  onEdit: (group: InventoryGroup) => void;
}

type TabType = 'info' | 'members' | 'assignments' | 'progress';

export default function GroupCombinedModal({ 
  isOpen, 
  onClose, 
  group,
  subCommittee,
  availableUsers,
  availableUnits,
  onSave,
  onEdit
}: GroupCombinedModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [currentGroup, setCurrentGroup] = useState<InventoryGroup>(group);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [editingMember, setEditingMember] = useState<InventoryGroupMember | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<InventoryGroupAssignment | null>(null);

  if (!isOpen) return null;

  const tabs = [
    { id: 'info' as TabType, label: 'Thông tin', icon: FileText },
    { id: 'members' as TabType, label: 'Thành viên', icon: Users, count: currentGroup.members?.length || 0 },
    { id: 'assignments' as TabType, label: 'Phân công', icon: Building, count: currentGroup.assignments?.length || 0 },
    { id: 'progress' as TabType, label: 'Tiến độ', icon: Calendar }
  ];

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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-green-50 p-6 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Thông tin cơ bản
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg">
                  <span className="text-gray-600">Tên nhóm:</span>
                  <p className="font-medium text-gray-800">{currentGroup.name}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <span className="text-gray-600">Thuộc tiểu ban:</span>
                  <p className="font-medium text-gray-800">{subCommittee.name}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <span className="text-gray-600">Trưởng nhóm:</span>
                  <p className="font-medium text-gray-800">{currentGroup.leader?.fullName}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <span className="text-gray-600">Thư ký:</span>
                  <p className="font-medium text-gray-800">{currentGroup.secretary?.fullName}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">{currentGroup.members?.length || 0}</div>
                <div className="text-sm text-green-600">Thành viên</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{currentGroup.assignments?.length || 0}</div>
                <div className="text-sm text-purple-600">Phân công</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-600">85%</div>
                <div className="text-sm text-orange-600">Tiến độ</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-sm text-blue-600">Hoàn thành</div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">Tóm tắt hoạt động</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày tạo nhóm:</span>
                  <span className="font-medium">{new Date(currentGroup.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số đơn vị được phân công:</span>
                  <span className="font-medium">{currentGroup.assignments?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thời gian ước tính hoàn thành:</span>
                  <span className="font-medium text-blue-600">15 ngày nữa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hiệu suất kiểm kê:</span>
                  <span className="font-medium text-green-600">Cao (85%)</span>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'members':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Quản lý thành viên</h3>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentGroup.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-green-600">
                          {member.user?.fullName?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h5 className="font-semibold">{member.user?.fullName}</h5>
                        <p className="text-sm text-gray-600">{member.user?.email}</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
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
                      </div>
                    </div>
                    <div className="flex gap-2">
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
        );
        
      case 'assignments':
        return (
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
              <div className="grid grid-cols-1 gap-4">
                {currentGroup.assignments.map((assignment) => (
                  <div key={assignment.id} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Building className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-lg">{assignment.unit?.name}</h5>
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                              Đang tiến hành
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="bg-white p-3 rounded">
                            <span className="font-medium">Bắt đầu:</span>{' '}
                            {new Date(assignment.startDate).toLocaleDateString('vi-VN')}
                          </div>
                          <div className="bg-white p-3 rounded">
                            <span className="font-medium">Kết thúc:</span>{' '}
                            {new Date(assignment.endDate).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                        {assignment.note && (
                          <div className="mt-3 p-3 bg-white rounded text-sm text-gray-600">
                            <span className="font-medium">Ghi chú:</span> {assignment.note}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
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
        );
        
      case 'progress':
        // Mock progress data
        const mockProgressData = {
          completed: 12,
          inProgress: 5,
          notStarted: 3,
          overdue: 2
        };
        
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Tiến độ kiểm kê</h3>
            
            <ProgressIndicator
              completed={mockProgressData.completed}
              inProgress={mockProgressData.inProgress}
              notStarted={mockProgressData.notStarted}
              overdue={mockProgressData.overdue}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-green-800">Đã hoàn thành</h4>
                    <p className="text-2xl font-bold text-green-600">{mockProgressData.completed}</p>
                  </div>
                  <div className="bg-green-200 p-2 rounded-full">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-green-700 mt-2">Đơn vị đã kiểm kê xong</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-blue-800">Đang tiến hành</h4>
                    <p className="text-2xl font-bold text-blue-600">{mockProgressData.inProgress}</p>
                  </div>
                  <div className="bg-blue-200 p-2 rounded-full">
                    <Building className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm text-blue-700 mt-2">Đơn vị đang kiểm kê</p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-orange-800">Cần xử lý</h4>
                    <p className="text-2xl font-bold text-orange-600">{mockProgressData.notStarted + mockProgressData.overdue}</p>
                  </div>
                  <div className="bg-orange-200 p-2 rounded-full">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <p className="text-sm text-orange-700 mt-2">Cần phân công/theo dõi</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">Báo cáo chi tiết</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng số đơn vị được phân công:</span>
                  <span className="font-semibold">{mockProgressData.completed + mockProgressData.inProgress + mockProgressData.notStarted + mockProgressData.overdue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số thành viên tham gia:</span>
                  <span className="font-semibold">{currentGroup.members?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thời gian ước tính hoàn thành:</span>
                  <span className="font-semibold text-blue-600">15 ngày nữa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hiệu suất kiểm kê:</span>
                  <span className="font-semibold text-green-600">Cao (85%)</span>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{currentGroup.name}</h2>
              <p className="text-gray-600">Thuộc {subCommittee.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onEdit(currentGroup)}>
              Chỉnh sửa thông tin
            </Button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Tabs Sidebar */}
          <div className="w-80 bg-gray-50 p-4">
            <div className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-600 border-l-4 border-blue-500'
                        : 'text-gray-600 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </div>
                    {tab.count !== undefined && (
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {renderTabContent()}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-end gap-3 bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            Lưu thay đổi
          </Button>
        </div>

        {/* Add Member Modal */}
        {showMemberForm && (
          <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h4 className="text-lg font-semibold mb-4">Thêm thành viên mới</h4>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleAddMember({
                  userId: formData.get('userId') as string,
                  role: formData.get('role') as InventoryGroupRole
                });
              }}>
                <div className="space-y-4">
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
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button type="button" variant="outline" onClick={() => setShowMemberForm(false)}>
                    Hủy
                  </Button>
                  <Button type="submit">Thêm thành viên</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Member Modal */}
        {editingMember && (
          <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h4 className="text-lg font-semibold mb-4">Chỉnh sửa vai trò</h4>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleEditMember(editingMember, {
                  role: formData.get('role') as InventoryGroupRole
                });
              }}>
                <div className="space-y-4">
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
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button type="button" variant="outline" onClick={() => setEditingMember(null)}>
                    Hủy
                  </Button>
                  <Button type="submit">Cập nhật</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Assignment Modal */}
        {showAssignmentForm && (
          <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h4 className="text-lg font-semibold mb-4">Phân công đơn vị</h4>
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
                <div className="space-y-4">
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
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button type="button" variant="outline" onClick={() => setShowAssignmentForm(false)}>
                    Hủy
                  </Button>
                  <Button type="submit">Tạo phân công</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Assignment Modal */}
        {editingAssignment && (
          <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h4 className="text-lg font-semibold mb-4">Chỉnh sửa phân công</h4>
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
                <div className="space-y-4">
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
                      defaultValue={editingAssignment.note || ''}
                      className="w-full p-3 border rounded-lg" 
                      rows={3}
                      placeholder="Ghi chú về phân công..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button type="button" variant="outline" onClick={() => setEditingAssignment(null)}>
                    Hủy
                  </Button>
                  <Button type="submit">Cập nhật</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
