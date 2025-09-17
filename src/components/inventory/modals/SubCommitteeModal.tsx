"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { 
  Users,
  ChevronDown,
  UserPlus,
  Trash2,
  Edit,
  Loader2
} from "lucide-react";
import { InventorySubCommittee, InventorySubCommitteeMember, InventorySubCommitteeRole, User, InventorySessionUnit } from "@/types/asset";
import { useAppSelector } from "@/lib/store/hooks";
import { AlertCircle } from "lucide-react";

interface SubCommitteeModalProps {
  isOpen: boolean;
  onClose: () => void;
  subCommittee?: InventorySubCommittee | null;
  onSave: (data: any) => void;
  availableUsers: User[];
  availableSessionUnits?: InventorySessionUnit[];
}

export default function SubCommitteeModal({ 
  isOpen, 
  onClose, 
  subCommittee, 
  onSave,
  availableUsers,
  availableSessionUnits = []
}: SubCommitteeModalProps) {
  const { 
    createSubCommitteeLoading, 
    createSubCommitteeError, 
    updateSubCommitteeLoading, 
    updateSubCommitteeError 
  } = useAppSelector(state => state.inventory);

  const [formData, setFormData] = useState({
    name: subCommittee?.name || "",
    inventorySessionUnitId: subCommittee?.inventorySessionUnitId || "",
    leaderId: subCommittee?.members?.find(m => m.role === "LEADER")?.userId || "",
    secretaryId: subCommittee?.members?.find(m => m.role === "SECRETARY")?.userId || ""
  });

  const [members, setMembers] = useState<InventorySubCommitteeMember[]>(
    subCommittee?.members || []
  );

  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState<InventorySubCommitteeMember | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Extract member IDs by role
    const memberIds = members
      .filter(m => m.role === "MEMBER")
      .map(m => m.userId);
    
    onSave({
      name: formData.name,
      inventorySessionUnitId: formData.inventorySessionUnitId,
      leaderId: formData.leaderId,
      secretaryId: formData.secretaryId,
      memberIds: memberIds
    });
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddMember = (userData: { userId: string; role: InventorySubCommitteeRole }) => {
    const newMember: InventorySubCommitteeMember = {
      id: `m${Date.now()}`,
      subInventoryId: subCommittee?.id || "",
      userId: userData.userId,
      role: userData.role as string,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: availableUsers.find(u => u.id === userData.userId)
    };

    setMembers(prev => [...prev, newMember]);
    setShowMemberForm(false);
  };

  const handleEditMember = (member: InventorySubCommitteeMember, userData: { role: InventorySubCommitteeRole }) => {
    setMembers(prev => 
      prev.map(m => m.id === member.id ? { ...m, role: userData.role } : m)
    );
    setEditingMember(null);
  };

  const handleRemoveMember = (memberId: string) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));
  };

  // Get available users (excluding leader, secretary, and current members)
  const getAvailableUsers = () => {
    const usedUserIds = [
      formData.leaderId,
      formData.secretaryId,
      ...members.map(m => m.userId)
    ].filter(Boolean);
    
    return availableUsers.filter(user => !usedUserIds.includes(user.id));
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="lg"
        className="max-h-[90vh] overflow-y-auto"
      >
        <ModalHeader>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              {subCommittee ? "Chỉnh sửa tiểu ban" : "Thêm tiểu ban mới"}
            </h2>
          </div>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <ModalBody>
            {/* Error Display */}
            {(createSubCommitteeError || updateSubCommitteeError) && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Có lỗi xảy ra</h4>
                  <p className="text-sm text-red-700 mt-1">
                    {createSubCommitteeError || updateSubCommitteeError}
                  </p>
                </div>
              </div>
            )}
            {/* Basic Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên tiểu ban
              </label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ví dụ: Tiểu ban Cơ sở Gò Vấp"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            {/* Session Unit Selection */}
            {!subCommittee && availableSessionUnits.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cơ sở tham gia
                </label>
                <div className="relative">
                  <select 
                    value={formData.inventorySessionUnitId}
                    onChange={(e) => handleChange("inventorySessionUnitId", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
                    required
                  >
                    <option value="">-- Chọn cơ sở tham gia --</option>
                    {availableSessionUnits.map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {unit.unit?.name || `Đơn vị ${unit.unitId}`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trưởng tiểu ban
                </label>
                <div className="relative">
                  <select 
                    value={formData.leaderId}
                    onChange={(e) => handleChange("leaderId", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
                    required
                  >
                    <option value="">-- Chọn trưởng tiểu ban --</option>
                    {availableUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.fullName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thư ký
                </label>
                <div className="relative">
                  <select 
                    value={formData.secretaryId}
                    onChange={(e) => handleChange("secretaryId", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
                    required
                  >
                    <option value="">-- Chọn thư ký --</option>
                    {availableUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.fullName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Members Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Thành viên tiểu ban</h3>
                <Button 
                  type="button"
                  onClick={() => setShowMemberForm(true)} 
                  variant="outline"
                  size="sm"
                  className="border-dashed"
                  disabled={getAvailableUsers().length === 0}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Thêm thành viên
                </Button>
              </div>

              {members.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Chưa có thành viên nào</p>
                  <p className="text-gray-400 text-xs">Thêm thành viên để hỗ trợ công việc tiểu ban</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">
                            {member.user?.fullName?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{member.user?.fullName}</p>
                          <p className="text-xs text-gray-600">{member.user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          member.role === InventorySubCommitteeRole.LEADER
                            ? 'bg-blue-100 text-blue-700'
                            : member.role === InventorySubCommitteeRole.SECRETARY
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {member.role === InventorySubCommitteeRole.LEADER
                            ? 'Trưởng ban'
                            : member.role === InventorySubCommitteeRole.SECRETARY
                            ? 'Thư ký'
                            : 'Thành viên'
                          }
                        </span>
                        <Button 
                          type="button"
                          size="sm" 
                          variant="ghost" 
                          onClick={() => setEditingMember(member)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          type="button"
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ModalBody>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={createSubCommitteeLoading || updateSubCommitteeLoading}
            >
              {(createSubCommitteeLoading || updateSubCommitteeLoading) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {subCommittee ? "Đang cập nhật..." : "Đang tạo..."}
                </>
              ) : (
                subCommittee ? "Cập nhật" : "Tạo tiểu ban"
              )}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Add Member Form */}
      <Modal isOpen={showMemberForm} onClose={() => setShowMemberForm(false)} title="Thêm thành viên tiểu ban">
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleAddMember({
            userId: formData.get('userId') as string,
            role: formData.get('role') as InventorySubCommitteeRole
          });
        }}>
          <ModalBody>
            <div>
              <label className="block text-sm font-medium mb-2">Chọn thành viên</label>
              <select name="userId" className="w-full p-3 border rounded-lg" required>
                <option value="">-- Chọn thành viên --</option>
                {getAvailableUsers().map(user => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} - {user.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Vai trò</label>
              <select name="role" className="w-full p-3 border rounded-lg" required>
                <option value={InventorySubCommitteeRole.MEMBER}>Thành viên</option>
                <option value={InventorySubCommitteeRole.SECRETARY}>Thư ký</option>
                <option value={InventorySubCommitteeRole.LEADER}>Trưởng tiểu ban</option>
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

      {/* Edit Member Form */}
      <Modal 
        isOpen={!!editingMember} 
        onClose={() => setEditingMember(null)} 
        title="Chỉnh sửa vai trò"
      >
        {editingMember && (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleEditMember(editingMember, {
              role: formData.get('role') as InventorySubCommitteeRole
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
                  <option value={InventorySubCommitteeRole.MEMBER}>Thành viên</option>
                  <option value={InventorySubCommitteeRole.SECRETARY}>Thư ký</option>
                  <option value={InventorySubCommitteeRole.LEADER}>Trưởng tiểu ban</option>
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
    </>
  );
}
