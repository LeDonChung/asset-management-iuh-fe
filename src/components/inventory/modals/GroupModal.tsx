"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { 
  Users,
  ChevronDown,
  Building,
  UserPlus,
  Trash2,
  Edit
} from "lucide-react";
import { InventoryGroup, InventorySubCommittee, InventoryGroupMember, InventoryGroupRole, User, Unit, InventoryGroupAssignment } from "@/types/asset";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { AlertCircle, Loader2, Plus, Calendar, MapPin, Eye, EyeOff } from "lucide-react";
import { getUnitChildren } from "@/lib/store/slices/unitSlice";
import { createUser, CreateUser } from "@/lib/store/slices/userSlice";
import { UserStatus } from "@/types/asset";

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  subCommittee: InventorySubCommittee;
  group?: InventoryGroup | null;
  onSave: (data: any) => void;
  availableUsers: User[];
  availableUnits?: Unit[];
}

export default function GroupModal({ 
  isOpen, 
  onClose, 
  subCommittee,
  group, 
  onSave,
  availableUsers,
  availableUnits = []
}: GroupModalProps) {
  const dispatch = useAppDispatch();
  const { 
    createGroupLoading, 
    createGroupError, 
    updateGroupLoading, 
    updateGroupError 
  } = useAppSelector(state => state.inventory);
  
  const { 
    childrenUnits,
    childrenLoading: childrenUnitsLoading
  } = useAppSelector(state => state.unit);
  const [formData, setFormData] = useState({
    name: group?.name || "",
    leaderId: group?.members?.find(m => m.role === "LEADER")?.userId || "",
    secretaryId: group?.members?.find(m => m.role === "SECRETARY")?.userId || ""
  });

  const [members, setMembers] = useState<InventoryGroupMember[]>(
    group?.members || []
  );

  const [assignments, setAssignments] = useState<InventoryGroupAssignment[]>(
    group?.assignments || []
  );

  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState<InventoryGroupMember | null>(null);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<InventoryGroupAssignment | null>(null);
  
  // Member form states
  const [memberModalTab, setMemberModalTab] = useState<'select' | 'create'>('select');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Create user form states
  const [showPassword, setShowPassword] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({
    username: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    unitId: ""
  });
  const [createUserErrors, setCreateUserErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Extract member IDs by role
    const memberIds = members
      .filter(m => m.role === "MEMBER")
      .map(m => m.userId);
    
    // Format assignments for API
    const formattedAssignments = assignments.map(assignment => ({
      unitId: assignment.unitId,
      startDate: assignment.startDate,
      endDate: assignment.endDate,
      note: assignment.note
    }));
    
    onSave({
      name: formData.name,
      subInventoryId: subCommittee.id,
      leaderId: formData.leaderId,
      secretaryId: formData.secretaryId,
      memberIds: memberIds,
      assignments: formattedAssignments
    });
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddMember = (userData: { userId: string; role: InventoryGroupRole }) => {
    const newMember: InventoryGroupMember = {
      id: `m${Date.now()}`,
      groupId: group?.id || "",
      userId: userData.userId,
      role: userData.role as string,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: availableUsers.find(u => u.id === userData.userId)
    };

    setMembers(prev => [...prev, newMember]);
    setShowMemberForm(false);
  };

  const handleEditMember = (member: InventoryGroupMember, userData: { role: InventoryGroupRole }) => {
    setMembers(prev => 
      prev.map(m => m.id === member.id ? { ...m, role: userData.role } : m)
    );
    setEditingMember(null);
  };

  const handleRemoveMember = (memberId: string) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));
  };

  // Assignment handlers
  const handleAddAssignment = (assignmentData: { unitId: string; startDate: string; endDate: string; note?: string }) => {
    const newAssignment: InventoryGroupAssignment = {
      id: `a${Date.now()}`,
      groupId: group?.id || "",
      unitId: assignmentData.unitId,
      startDate: assignmentData.startDate,
      endDate: assignmentData.endDate,
      note: assignmentData.note,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      unit: getAvailableUnitsFromCampus().find((u: Unit) => u.id === assignmentData.unitId)
    };

    setAssignments(prev => [...prev, newAssignment]);
    setShowAssignmentForm(false);
  };

  const handleEditAssignment = (assignment: InventoryGroupAssignment, assignmentData: { unitId: string; startDate: string; endDate: string; note?: string }) => {
    setAssignments(prev => 
      prev.map(a => a.id === assignment.id ? { 
        ...a, 
        unitId: assignmentData.unitId,
        startDate: assignmentData.startDate,
        endDate: assignmentData.endDate,
        note: assignmentData.note,
        unit: getAvailableUnitsFromCampus().find((u: Unit) => u.id === assignmentData.unitId)
      } : a)
    );
    setEditingAssignment(null);
  };

  const handleRemoveAssignment = (assignmentId: string) => {
    setAssignments(prev => prev.filter(a => a.id !== assignmentId));
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

  // Filter users based on search term
  useEffect(() => {
    let filtered = getAvailableUsers();

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, availableUsers, formData.leaderId, formData.secretaryId, members]);

  // Reset member form when modal opens
  useEffect(() => {
    if (showMemberForm) {
      setSelectedUser(null);
      setSearchTerm("");
      setMemberModalTab('select');
      setCreateUserForm({
        username: "",
        fullName: "",
        email: "",
        phoneNumber: "",
        password: "",
        unitId: ""
      });
      setCreateUserErrors({});
      setShowPassword(false);
    }
  }, [showMemberForm]);

  // Validate create user form
  const validateCreateUserForm = () => {
    const newErrors: Record<string, string> = {};

    if (!createUserForm.username.trim()) {
      newErrors.username = "Tài khoản là bắt buộc";
    }
    if (!createUserForm.fullName.trim()) {
      newErrors.fullName = "Họ và tên là bắt buộc";
    }
    if (!createUserForm.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(createUserForm.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    if (!createUserForm.password.trim()) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (createUserForm.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    setCreateUserErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Get available units (excluding already assigned units)
  const getAvailableUnits = () => {
    const usedUnitIds = assignments.map(a => a.unitId);
    return availableUnits.filter(unit => !usedUnitIds.includes(unit.id));
  };
  // Load children units for the sub-committee's campus
  useEffect(() => {
    const unitId = subCommittee?.inventorySessionUnit?.unit?.id;
    if (unitId && !childrenUnits[unitId]) {
      console.log('Loading children units for unitId:', unitId, 'subCommittee:', subCommittee);
      dispatch(getUnitChildren(unitId));
    } else if (!unitId) {
      console.warn('Unit ID is missing for subCommittee:', subCommittee);
    }
  }, [dispatch, subCommittee?.inventorySessionUnit?.unit?.id, childrenUnits]);

  // Get available units from children of the sub-committee's campus
  const getAvailableUnitsFromCampus = () => {
    if (!subCommittee?.inventorySessionUnit?.unit?.id) {
      console.log('No unit ID found in subCommittee.inventorySessionUnit.unit');
      return [];
    }
    
    const parentUnitId = subCommittee.inventorySessionUnit.unit.id;
    const campusChildren = childrenUnits[parentUnitId] || [];
    const usedUnitIds = assignments.map(a => a.unitId);
    const availableUnits = campusChildren.filter((unit: Unit) => !usedUnitIds.includes(unit.id));
    
    console.log('getAvailableUnitsFromCampus debug:', {
      parentUnitId: parentUnitId,
      campusChildren: campusChildren,
      usedUnitIds: usedUnitIds,
      availableUnits: availableUnits,
      childrenUnits: childrenUnits
    });
    
    return availableUnits;
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
            <div className="bg-green-100 p-2 rounded-full">
              <Building className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {group ? "Chỉnh sửa nhóm" : "Thêm nhóm kiểm kê"}
              </h2>
              <p className="text-sm text-gray-600">Thuộc tiểu ban: {subCommittee.name}</p>
            </div>
          </div>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <ModalBody>
            {/* Error Display */}
            {(createGroupError || updateGroupError) && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Có lỗi xảy ra</h4>
                  <p className="text-sm text-red-700 mt-1">
                    {createGroupError || updateGroupError}
                  </p>
                </div>
              </div>
            )}
            
            {/* Basic Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên nhóm
              </label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ví dụ: Nhóm 1 - Khoa Cơ khí"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trưởng nhóm
                </label>
                <div className="relative">
                  <select 
                    value={formData.leaderId}
                    onChange={(e) => handleChange("leaderId", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors appearance-none"
                    required
                  >
                    <option value="">-- Chọn trưởng nhóm --</option>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors appearance-none"
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
                <h3 className="text-lg font-semibold text-gray-800">Thành viên nhóm</h3>
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
                  <p className="text-gray-400 text-xs">Thêm thành viên để hỗ trợ việc kiểm kê</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-green-600">
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

            {/* Assignments Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Phân công đơn vị</h3>
                <Button 
                  type="button"
                  onClick={() => setShowAssignmentForm(true)} 
                  variant="outline"
                  size="sm"
                  className="border-dashed"
                  disabled={getAvailableUnitsFromCampus().length === 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm phân công
                </Button>
              </div>

              {assignments.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Chưa có phân công nào</p>
                  <p className="text-gray-400 text-xs">Thêm phân công để giao nhiệm vụ kiểm kê cho các đơn vị</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{assignment.unit?.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(assignment.startDate).toLocaleDateString('vi-VN')} - {new Date(assignment.endDate).toLocaleDateString('vi-VN')}</span>
                          </div>
                          {assignment.note && (
                            <p className="text-xs text-gray-500 mt-1">{assignment.note}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          type="button"
                          size="sm" 
                          variant="ghost" 
                          onClick={() => setEditingAssignment(assignment)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          type="button"
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleRemoveAssignment(assignment.id)}
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
              className="bg-green-600 hover:bg-green-700"
              disabled={createGroupLoading || updateGroupLoading}
            >
              {(createGroupLoading || updateGroupLoading) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {group ? "Đang cập nhật..." : "Đang tạo..."}
                </>
              ) : (
                group ? "Cập nhật nhóm" : "Tạo nhóm"
              )}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Add Member Form */}
      <Modal 
        isOpen={showMemberForm} 
        onClose={() => setShowMemberForm(false)} 
        size="lg"
        className="max-h-[90vh] overflow-y-auto"
      >
        <ModalHeader>
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <UserPlus className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Thêm thành viên nhóm
              </h2>
              <p className="text-sm text-gray-600">Chọn từ danh sách có sẵn hoặc tạo tài khoản mới</p>
            </div>
          </div>
        </ModalHeader>

        <form onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const role = formData.get('role') as InventoryGroupRole;

          if (memberModalTab === 'create') {
            // Validate create user form
            if (!validateCreateUserForm()) {
              return;
            }

            try {
              // Create user
              const createUserDto: CreateUser = {
                username: createUserForm.username,
                password: createUserForm.password,
                fullName: createUserForm.fullName,
                email: createUserForm.email,
                phoneNumber: createUserForm.phoneNumber || undefined,
                unitId: createUserForm.unitId || undefined,
                status: UserStatus.ACTIVE,
                roleIds: [] // Default empty roles
              };

              const newUser = await dispatch(createUser(createUserDto)).unwrap();
              
              if (newUser) {
                // Add the newly created user as member
                handleAddMember({
                  userId: newUser.id,
                  role: role
                });
              }
            } catch (error: any) {
              console.error('Failed to create user:', error);
              // Error will be handled by Redux
            }
          } else {
            // Select existing user
            handleAddMember({
              userId: formData.get('userId') as string,
              role: role
            });
          }
        }}>
          <ModalBody>
            {/* Tab selection */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
              <button
                type="button"
                onClick={() => setMemberModalTab('select')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  memberModalTab === 'select'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-4 w-4" />
                  Chọn có sẵn
                </div>
              </button>
              <button
                type="button"
                onClick={() => setMemberModalTab('create')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  memberModalTab === 'create'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Thêm tài khoản
                </div>
              </button>
            </div>

            {memberModalTab === 'select' ? (
              <>
                {/* Search and filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tìm kiếm thành viên
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Tìm theo tên, email hoặc username..."
                      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    />
                    <Users className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* User selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn thành viên
                  </label>
                  <div className="relative">
                    <select 
                      name="userId" 
                      value={selectedUser?.id || ''}
                      onChange={(e) => {
                        const userId = e.target.value;
                        const user = filteredUsers.find(u => u.id === userId);
                        setSelectedUser(user || null);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors appearance-none" 
                      required
                    >
                      <option value="">-- Chọn thành viên --</option>
                      {filteredUsers.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.fullName} - {user.email}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Chọn thành viên từ danh sách có sẵn</p>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tài khoản <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={createUserForm.username}
                      onChange={(e) => setCreateUserForm(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Nhập tài khoản..."
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        createUserErrors.username ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {createUserErrors.username && (
                      <p className="mt-1 text-xs text-red-600">{createUserErrors.username}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={createUserForm.fullName}
                      onChange={(e) => setCreateUserForm(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Nhập họ và tên..."
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        createUserErrors.fullName ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {createUserErrors.fullName && (
                      <p className="mt-1 text-xs text-red-600">{createUserErrors.fullName}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={createUserForm.email}
                      onChange={(e) => setCreateUserForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Nhập email..."
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        createUserErrors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {createUserErrors.email && (
                      <p className="mt-1 text-xs text-red-600">{createUserErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={createUserForm.phoneNumber}
                      onChange={(e) => setCreateUserForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="Nhập số điện thoại..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={createUserForm.password}
                      onChange={(e) => setCreateUserForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Nhập mật khẩu..."
                      className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        createUserErrors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {createUserErrors.password && (
                    <p className="mt-1 text-xs text-red-600">{createUserErrors.password}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Mật khẩu phải có ít nhất 6 ký tự</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đơn vị
                  </label>
                  <div className="relative">
                    <select
                      value={createUserForm.unitId}
                      onChange={(e) => setCreateUserForm(prev => ({ ...prev, unitId: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors appearance-none"
                    >
                      <option value="">-- Chọn đơn vị (tùy chọn) --</option>
                      {availableUnits.map(unit => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Chọn đơn vị cho người dùng mới (không bắt buộc)</p>
                </div>
              </div>
            )}

            {/* Role selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vai trò trong nhóm
              </label>
              <div className="relative">
                <select 
                  name="role" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors appearance-none" 
                  required
                >
                  <option value={InventoryGroupRole.MEMBER}>Thành viên</option>
                  <option value={InventoryGroupRole.SECRETARY}>Thư ký</option>
                  <option value={InventoryGroupRole.LEADER}>Trưởng nhóm</option>
                </select>
                <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              <p className="mt-1 text-xs text-gray-500">Chọn vai trò cho thành viên trong nhóm</p>
            </div>
          </ModalBody>
          
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowMemberForm(false)}>
              Hủy
            </Button>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700"
              disabled={
                (memberModalTab === 'select' && !selectedUser) ||
                (memberModalTab === 'create' && Object.keys(createUserErrors).length > 0)
              }
            >
              {memberModalTab === 'create' ? 'Tạo tài khoản & Thêm thành viên' : 'Thêm thành viên'}
            </Button>
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

      {/* Add Assignment Form */}
      <Modal 
        isOpen={showAssignmentForm} 
        onClose={() => setShowAssignmentForm(false)} 
        size="lg"
        className="max-h-[90vh] overflow-y-auto"
      >
        <ModalHeader>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Thêm phân công đơn vị
              </h2>
              <p className="text-sm text-gray-600">Giao nhiệm vụ kiểm kê cho đơn vị</p>
            </div>
          </div>
        </ModalHeader>

        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleAddAssignment({
            unitId: formData.get('unitId') as string,
            startDate: formData.get('startDate') as string,
            endDate: formData.get('endDate') as string,
            note: formData.get('note') as string || undefined
          });
        }}>
          <ModalBody>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đơn vị
              </label>
              <div className="relative">
                <select 
                  name="unitId" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none" 
                  required
                >
                  <option value="">-- Chọn đơn vị --</option>
                  {getAvailableUnitsFromCampus().map((unit: Unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              <p className="mt-1 text-xs text-gray-500">Chọn đơn vị cần kiểm kê</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày bắt đầu
                </label>
                <input 
                  type="date" 
                  name="startDate" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  required 
                />
                <p className="mt-1 text-xs text-gray-500">Ngày bắt đầu thực hiện kiểm kê</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày kết thúc
                </label>
                <input 
                  type="date" 
                  name="endDate" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  required 
                />
                <p className="mt-1 text-xs text-gray-500">Ngày hoàn thành kiểm kê</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú (tùy chọn)
              </label>
              <textarea 
                name="note" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none" 
                rows={3}
                placeholder="Ghi chú về nhiệm vụ kiểm kê, yêu cầu đặc biệt..."
              />
              <p className="mt-1 text-xs text-gray-500">Thêm thông tin chi tiết về nhiệm vụ kiểm kê</p>
            </div>
          </ModalBody>
          
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowAssignmentForm(false)}>
              Hủy
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
            >
              Thêm phân công
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Edit Assignment Form */}
      <Modal 
        isOpen={!!editingAssignment} 
        onClose={() => setEditingAssignment(null)} 
        size="lg"
        className="max-h-[90vh] overflow-y-auto"
      >
        <ModalHeader>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Chỉnh sửa phân công
              </h2>
              <p className="text-sm text-gray-600">Cập nhật thông tin phân công đơn vị</p>
            </div>
          </div>
        </ModalHeader>

        {editingAssignment && (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleEditAssignment(editingAssignment, {
              unitId: formData.get('unitId') as string,
              startDate: formData.get('startDate') as string,
              endDate: formData.get('endDate') as string,
              note: formData.get('note') as string || undefined
            });
          }}>
            <ModalBody>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đơn vị
                </label>
                <div className="relative">
                  <select 
                    name="unitId" 
                    defaultValue={editingAssignment.unitId} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none" 
                    required
                  >
                    <option value="">-- Chọn đơn vị --</option>
                    {getAvailableUnitsFromCampus().map((unit: Unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                <p className="mt-1 text-xs text-gray-500">Chọn đơn vị cần kiểm kê</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày bắt đầu
                  </label>
                  <input 
                    type="date" 
                    name="startDate" 
                    defaultValue={editingAssignment.startDate} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    required 
                  />
                  <p className="mt-1 text-xs text-gray-500">Ngày bắt đầu thực hiện kiểm kê</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày kết thúc
                  </label>
                  <input 
                    type="date" 
                    name="endDate" 
                    defaultValue={editingAssignment.endDate} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    required 
                  />
                  <p className="mt-1 text-xs text-gray-500">Ngày hoàn thành kiểm kê</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú (tùy chọn)
                </label>
                <textarea 
                  name="note" 
                  defaultValue={editingAssignment.note || ''} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none" 
                  rows={3}
                  placeholder="Ghi chú về nhiệm vụ kiểm kê, yêu cầu đặc biệt..."
                />
                <p className="mt-1 text-xs text-gray-500">Thêm thông tin chi tiết về nhiệm vụ kiểm kê</p>
              </div>
            </ModalBody>
            
            <ModalFooter>
              <Button type="button" variant="outline" onClick={() => setEditingAssignment(null)}>
                Hủy
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
              >
                Cập nhật
              </Button>
            </ModalFooter>
          </form>
        )}
      </Modal>
    </>
  );
}
