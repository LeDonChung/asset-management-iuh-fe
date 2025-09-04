"use client";

import React, { useState } from "react";
import { 
  InventorySubCommittee, 
  InventoryGroup,
  InventoryGroupMember,
  InventoryGroupRole,
  User,
  Unit,
  InventoryGroupAssignment,
  InventoryResult,
  InventoryResultStatus
} from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Plus, 
  Edit, 
  Trash, 
  ChevronDown, 
  ChevronRight,
  Users,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Building
} from "lucide-react";

interface InventoryGroupManagerProps {
  subCommittee: InventorySubCommittee;
  groups: InventoryGroup[];
  onUpdate: (groups: InventoryGroup[]) => void;
}

// Mock users for development
const mockUsers: User[] = [
  { 
    id: "u1", 
    fullName: "Nguyễn Văn A", 
    username: "nguyenvana", 
    email: "nva@example.com", 
    status: "ACTIVE" as any,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  { 
    id: "u2", 
    fullName: "Trần Thị B", 
    username: "tranthib", 
    email: "ttb@example.com", 
    status: "ACTIVE" as any,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  { 
    id: "u3", 
    fullName: "Phạm Văn C", 
    username: "phamvanc", 
    email: "pvc@example.com", 
    status: "ACTIVE" as any,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  { 
    id: "u4", 
    fullName: "Lê Thị D", 
    username: "lethid", 
    email: "ltd@example.com", 
    status: "ACTIVE" as any,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  { 
    id: "u5", 
    fullName: "Nguyễn Văn E", 
    username: "nguyenvane", 
    email: "nve@example.com", 
    status: "ACTIVE" as any,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  { 
    id: "u6", 
    fullName: "Trần Thị F", 
    username: "tranthif", 
    email: "ttf@example.com", 
    status: "ACTIVE" as any,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  }
];

// Mock units for development
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
  }
];

// Mock assignments status based on dates
const getAssignmentStatus = (startDate: string, endDate: string) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now < start) return "NOT_STARTED";
  if (now > end) return "COMPLETED";
  return "IN_PROGRESS";
};

// Calculate progress for an assignment
const calculateProgress = (assignment: InventoryGroupAssignment): number => {
  // In a real app, this would calculate based on actual inventory results
  // For mock data, generate a random progress percentage
  const status = getAssignmentStatus(assignment.startDate, assignment.endDate);
  if (status === "NOT_STARTED") return 0;
  if (status === "COMPLETED") return 100;
  
  // For IN_PROGRESS, calculate percentage between start and end dates
  const now = new Date();
  const start = new Date(assignment.startDate);
  const end = new Date(assignment.endDate);
  const total = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  
  return Math.min(Math.round((elapsed / total) * 100), 99);
};

export function InventoryGroupManager({ subCommittee, groups, onUpdate }: InventoryGroupManagerProps) {
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState<{ [key: string]: string }>({});
  const [selectedGroup, setSelectedGroup] = useState<InventoryGroup | null>(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<InventoryGroupMember | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<InventoryGroupAssignment | null>(null);
  
  // Toggle expanded state for group
  const toggleGroupExpand = (id: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    if (!activeTab[id]) {
      setActiveTab(prev => ({
        ...prev,
        [id]: "members"
      }));
    }
  };
  
  // Set active tab for a group
  const setGroupTab = (groupId: string, tab: string) => {
    setActiveTab(prev => ({
      ...prev,
      [groupId]: tab
    }));
  };
  
  // Handle add new group
  const handleAddGroup = () => {
    setSelectedGroup(null);
    setIsGroupModalOpen(true);
  };
  
  // Handle edit group
  const handleEditGroup = (group: InventoryGroup) => {
    setSelectedGroup(group);
    setIsGroupModalOpen(true);
  };
  
  // Handle delete group
  const handleDeleteGroup = (group: InventoryGroup) => {
    setSelectedGroup(group);
    setIsConfirmDeleteModalOpen(true);
  };
  
  // Confirm delete group
  const confirmDeleteGroup = () => {
    if (selectedGroup) {
      const updatedGroups = groups.filter(g => g.id !== selectedGroup.id);
      onUpdate(updatedGroups);
      setIsConfirmDeleteModalOpen(false);
      setSelectedGroup(null);
    }
  };
  
  // Save group (new or edit)
  const saveGroup = (formData: any) => {
    if (selectedGroup) {
      // Edit existing group
      const updatedGroups = groups.map(g => 
        g.id === selectedGroup.id 
          ? { 
              ...g, 
              name: formData.name,
              leaderId: formData.leaderId,
              secretaryId: formData.secretaryId,
              leader: mockUsers.find(u => u.id === formData.leaderId),
              secretary: mockUsers.find(u => u.id === formData.secretaryId)
            } 
          : g
      );
      onUpdate(updatedGroups);
    } else {
      // Add new group
      const newGroup: InventoryGroup = {
        id: `g${Date.now()}`,
        subCommitteeId: subCommittee.id,
        name: formData.name,
        leaderId: formData.leaderId,
        secretaryId: formData.secretaryId,
        createdAt: new Date().toISOString(),
        leader: mockUsers.find(u => u.id === formData.leaderId),
        secretary: mockUsers.find(u => u.id === formData.secretaryId),
        members: [],
        assignments: []
      };
      onUpdate([...groups, newGroup]);
    }
    setIsGroupModalOpen(false);
  };
  
  // Handle add member to group
  const handleAddMember = (group: InventoryGroup) => {
    setSelectedGroup(group);
    setSelectedMember(null);
    setIsMemberModalOpen(true);
  };
  
  // Handle edit member
  const handleEditMember = (group: InventoryGroup, member: InventoryGroupMember) => {
    setSelectedGroup(group);
    setSelectedMember(member);
    setIsMemberModalOpen(true);
  };
  
  // Handle remove member
  const handleRemoveMember = (group: InventoryGroup, memberId: string) => {
    const updatedGroups = groups.map(g => {
      if (g.id === group.id) {
        return {
          ...g,
          members: g.members?.filter(m => m.id !== memberId) || []
        };
      }
      return g;
    });
    onUpdate(updatedGroups);
  };
  
  // Save member
  const saveMember = (formData: any) => {
    if (!selectedGroup) return;
    
    const updatedGroups = groups.map(g => {
      if (g.id === selectedGroup.id) {
        let updatedMembers = [...(g.members || [])];
        
        if (selectedMember) {
          // Edit existing member
          updatedMembers = updatedMembers.map(m => 
            m.id === selectedMember.id
              ? { 
                  ...m, 
                  userId: formData.userId,
                  role: formData.role,
                  user: mockUsers.find(u => u.id === formData.userId)
                }
              : m
          );
        } else {
          // Add new member
          const newMember: InventoryGroupMember = {
            id: `m${Date.now()}`,
            groupId: selectedGroup.id,
            userId: formData.userId,
            role: formData.role,
            user: mockUsers.find(u => u.id === formData.userId)
          };
          updatedMembers.push(newMember);
        }
        
        return {
          ...g,
          members: updatedMembers
        };
      }
      return g;
    });
    
    onUpdate(updatedGroups);
    setIsMemberModalOpen(false);
  };
  
  // Handle add assignment to group
  const handleAddAssignment = (group: InventoryGroup) => {
    setSelectedGroup(group);
    setSelectedAssignment(null);
    setIsAssignmentModalOpen(true);
  };
  
  // Handle edit assignment
  const handleEditAssignment = (group: InventoryGroup, assignment: InventoryGroupAssignment) => {
    setSelectedGroup(group);
    setSelectedAssignment(assignment);
    setIsAssignmentModalOpen(true);
  };
  
  // Handle remove assignment
  const handleRemoveAssignment = (group: InventoryGroup, assignmentId: string) => {
    const updatedGroups = groups.map(g => {
      if (g.id === group.id) {
        return {
          ...g,
          assignments: g.assignments?.filter(a => a.id !== assignmentId) || []
        };
      }
      return g;
    });
    onUpdate(updatedGroups);
  };
  
  // Save assignment
  const saveAssignment = (formData: any) => {
    if (!selectedGroup) return;
    
    const updatedGroups = groups.map(g => {
      if (g.id === selectedGroup.id) {
        let updatedAssignments = [...(g.assignments || [])];
        
        if (selectedAssignment) {
          // Edit existing assignment
          updatedAssignments = updatedAssignments.map(a => 
            a.id === selectedAssignment.id
              ? { 
                  ...a, 
                  unitId: formData.unitId,
                  startDate: formData.startDate,
                  endDate: formData.endDate,
                  note: formData.note,
                  unit: mockUnits.find(u => u.id === formData.unitId)
                }
              : a
          );
        } else {
          // Add new assignment
          const newAssignment: InventoryGroupAssignment = {
            id: `a${Date.now()}`,
            groupId: selectedGroup.id,
            unitId: formData.unitId,
            startDate: formData.startDate,
            endDate: formData.endDate,
            note: formData.note,
            unit: mockUnits.find(u => u.id === formData.unitId),
            // Add mock results for demonstration
            results: []
          };
          updatedAssignments.push(newAssignment);
        }
        
        return {
          ...g,
          assignments: updatedAssignments
        };
      }
      return g;
    });
    
    onUpdate(updatedGroups);
    setIsAssignmentModalOpen(false);
  };
  
  // Render status badge for assignment
  const renderStatusBadge = (startDate: string, endDate: string) => {
    const status = getAssignmentStatus(startDate, endDate);
    
    switch (status) {
      case "NOT_STARTED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Clock className="w-3 h-3 mr-1" />
            Chưa kiểm kê
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Đang kiểm kê
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Đã kiểm kê xong
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Danh sách nhóm kiểm kê</h3>
        <Button 
          size="sm" 
          onClick={handleAddGroup}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md transition-all"
        >
          <Plus size={16} />
          <span>Thêm nhóm</span>
        </Button>
      </div>
      
      {groups.length === 0 ? (
        <div className="p-6 text-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all">
          <Users className="h-12 w-12 text-indigo-400 mx-auto mb-3" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Chưa có nhóm kiểm kê</h4>
          <p className="text-gray-600 max-w-md mx-auto mb-4">
            Hãy thêm các nhóm kiểm kê để phân công nhiệm vụ.
          </p>
          <Button 
            size="sm" 
            onClick={handleAddGroup}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="mr-1 h-4 w-4" /> Thêm nhóm
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {groups.map((group, index) => (
            <Card 
              key={group.id} 
              className={`overflow-hidden border-l-4 shadow-md hover:shadow-lg transition-all duration-200
                ${index % 3 === 0 ? 'border-indigo-500' : index % 3 === 1 ? 'border-emerald-500' : 'border-amber-500'}`
              }
              draggable="true"
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", group.id);
                e.currentTarget.classList.add("opacity-50");
              }}
              onDragEnd={(e) => {
                e.currentTarget.classList.remove("opacity-50");
              }}
            >
              {/* Group header */}
              <div className={`
                flex items-center justify-between p-4
                ${index % 3 === 0 ? 'bg-indigo-50' : index % 3 === 1 ? 'bg-emerald-50' : 'bg-amber-50'}
              `}>
                <div 
                  className="flex items-center cursor-pointer gap-3"
                  onClick={() => toggleGroupExpand(group.id)}
                >
                  <div className={`
                    p-2 rounded-full 
                    ${index % 3 === 0 ? 'bg-indigo-100 text-indigo-600' : index % 3 === 1 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}
                  `}>
                    {expandedGroups[group.id] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold">{group.name}</h4>
                    <div className="text-xs text-gray-500">
                      {group.members?.length || 0} thành viên | {group.assignments?.length || 0} đơn vị được phân công
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={`
                      hover:bg-white hover:shadow-sm transition-all
                      ${index % 3 === 0 ? 'text-indigo-600' : index % 3 === 1 ? 'text-emerald-600' : 'text-amber-600'}
                    `}
                    onClick={() => handleEditGroup(group)}
                  >
                    <Edit size={14} className="mr-1" /> Sửa
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:bg-white hover:shadow-sm transition-all"
                    onClick={() => handleDeleteGroup(group)}
                  >
                    <Trash size={14} className="mr-1" /> Xóa
                  </Button>
                </div>
              </div>
              
              {/* Group info */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`
                    p-2 rounded-full 
                    ${index % 3 === 0 ? 'bg-indigo-100 text-indigo-600' : index % 3 === 1 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}
                  `}>
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Trưởng nhóm</div>
                    <div className="font-medium text-sm">{group.leader?.fullName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`
                    p-2 rounded-full 
                    ${index % 3 === 0 ? 'bg-indigo-100 text-indigo-600' : index % 3 === 1 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}
                  `}>
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Thư ký</div>
                    <div className="font-medium text-sm">{group.secretary?.fullName}</div>
                  </div>
                </div>
              </div>
              
              {/* Expanded content - Tabs */}
              {expandedGroups[group.id] && (
                <div className="p-4">
                  {/* Tab buttons */}
                  <div className="flex border-b border-gray-200 mb-4">
                    <button
                      className={`pb-2 px-4 text-sm font-medium ${
                        activeTab[group.id] === "members"
                          ? `border-b-2 
                            ${index % 3 === 0 ? 'border-indigo-500 text-indigo-600' : index % 3 === 1 ? 'border-emerald-500 text-emerald-600' : 'border-amber-500 text-amber-600'}
                            `
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => setGroupTab(group.id, "members")}
                    >
                      Thành viên
                    </button>
                    <button
                      className={`pb-2 px-4 text-sm font-medium ${
                        activeTab[group.id] === "assignments"
                          ? `border-b-2 
                            ${index % 3 === 0 ? 'border-indigo-500 text-indigo-600' : index % 3 === 1 ? 'border-emerald-500 text-emerald-600' : 'border-amber-500 text-amber-600'}
                            `
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => setGroupTab(group.id, "assignments")}
                    >
                      Phân công đơn vị
                    </button>
                  </div>
                  
                  {/* Tab content */}
                  {activeTab[group.id] === "members" && (
                    <div className="space-y-4">
                      {/* Members list */}
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="text-sm font-medium">Thành viên nhóm</h5>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className={`text-xs h-8 border border-dashed 
                            ${index % 3 === 0 ? 'text-indigo-600 border-indigo-300 hover:bg-indigo-50' : 
                              index % 3 === 1 ? 'text-emerald-600 border-emerald-300 hover:bg-emerald-50' : 
                              'text-amber-600 border-amber-300 hover:bg-amber-50'}`}
                          onClick={() => handleAddMember(group)}
                        >
                          <Plus size={14} className="mr-1" /> Thêm thành viên
                        </Button>
                      </div>
                      
                      {(!group.members || group.members.length === 0) ? (
                        <div className="text-center py-6 border border-dashed border-gray-300 rounded-md bg-gray-50">
                          <Users className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-gray-500 text-sm">Chưa có thành viên</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {group.members?.map((member) => (
                            <div 
                              key={member.id} 
                              className={`relative flex items-center p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all
                                ${member.role === InventoryGroupRole.LEADER 
                                  ? index % 3 === 0 ? 'bg-indigo-50' : index % 3 === 1 ? 'bg-emerald-50' : 'bg-amber-50'
                                  : member.role === InventoryGroupRole.SECRETARY
                                    ? 'bg-blue-50'
                                    : 'bg-white'
                                }`}
                              draggable="true"
                              onDragStart={(e) => {
                                e.dataTransfer.setData("text/plain", member.id);
                                e.currentTarget.classList.add("opacity-50");
                              }}
                              onDragEnd={(e) => {
                                e.currentTarget.classList.remove("opacity-50");
                              }}
                            >
                              <div className={`
                                h-8 w-8 rounded-full flex items-center justify-center mr-3
                                ${member.role === InventoryGroupRole.LEADER 
                                  ? index % 3 === 0 ? 'bg-indigo-100 text-indigo-600' : index % 3 === 1 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                  : member.role === InventoryGroupRole.SECRETARY
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'bg-gray-100 text-gray-600'
                                }
                              `}>
                                {member.user?.fullName?.charAt(0) || 'U'}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-sm">{member.user?.fullName}</div>
                                <div className="text-xs text-gray-500">{member.user?.email}</div>
                              </div>
                              <div className="flex items-center gap-1 absolute top-1 right-1">
                                <button 
                                  className="p-1 hover:bg-white hover:shadow-sm rounded-full text-gray-500 hover:text-gray-700 transition-all"
                                  onClick={() => handleEditMember(group, member)}
                                >
                                  <Edit size={12} />
                                </button>
                                <button 
                                  className="p-1 hover:bg-white hover:shadow-sm rounded-full text-gray-500 hover:text-red-500 transition-all"
                                  onClick={() => handleRemoveMember(group, member.id)}
                                >
                                  <Trash size={12} />
                                </button>
                              </div>
                              <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-lg
                                ${member.role === InventoryGroupRole.LEADER 
                                  ? index % 3 === 0 ? 'bg-indigo-500' : index % 3 === 1 ? 'bg-emerald-500' : 'bg-amber-500'
                                  : member.role === InventoryGroupRole.SECRETARY
                                    ? 'bg-blue-500'
                                    : 'bg-gray-300'
                                }
                              `}></div>
                              <div className="absolute top-0 right-0 mt-1 mr-1">
                                <span className={`inline-block px-2 py-0.5 text-xs rounded-full 
                                  ${member.role === InventoryGroupRole.LEADER 
                                    ? index % 3 === 0 ? 'bg-indigo-100 text-indigo-700' : index % 3 === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                    : member.role === InventoryGroupRole.SECRETARY
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }
                                `}>
                                  {member.role === InventoryGroupRole.LEADER 
                                    ? "Trưởng nhóm" 
                                    : member.role === InventoryGroupRole.SECRETARY 
                                      ? "Thư ký" 
                                      : "Thành viên"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab[group.id] === "assignments" && (
                    <div className="space-y-4">
                      {/* Assignments list */}
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="text-sm font-medium">Phân công kiểm kê</h5>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className={`text-xs h-8 border border-dashed 
                            ${index % 3 === 0 ? 'text-indigo-600 border-indigo-300 hover:bg-indigo-50' : 
                              index % 3 === 1 ? 'text-emerald-600 border-emerald-300 hover:bg-emerald-50' : 
                              'text-amber-600 border-amber-300 hover:bg-amber-50'}`}
                          onClick={() => handleAddAssignment(group)}
                        >
                          <Plus size={14} className="mr-1" /> Gán đơn vị
                        </Button>
                      </div>
                      
                      {(!group.assignments || group.assignments.length === 0) ? (
                        <div className="text-center py-6 border border-dashed border-gray-300 rounded-md bg-gray-50">
                          <Building className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-gray-500 text-sm">Chưa có phân công đơn vị</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          {group.assignments?.map((assignment) => {
                            const status = getAssignmentStatus(assignment.startDate, assignment.endDate);
                            const progress = calculateProgress(assignment);
                            let statusColors = {
                              bgColor: 'bg-gray-100',
                              textColor: 'text-gray-600',
                              progressColor: 'bg-gray-500'
                            };
                            
                            if (status === 'NOT_STARTED') {
                              statusColors = {
                                bgColor: 'bg-gray-100',
                                textColor: 'text-gray-600',
                                progressColor: 'bg-gray-500'
                              };
                            } else if (status === 'IN_PROGRESS') {
                              statusColors = {
                                bgColor: 'bg-blue-100',
                                textColor: 'text-blue-600',
                                progressColor: 'bg-blue-500'
                              };
                            } else if (status === 'COMPLETED') {
                              statusColors = {
                                bgColor: 'bg-green-100',
                                textColor: 'text-green-600',
                                progressColor: 'bg-green-500'
                              };
                            }
                            
                            return (
                              <div 
                                key={assignment.id} 
                                className={`relative p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all
                                  ${progress === 100 ? 'bg-green-50' : progress > 0 ? 'bg-blue-50' : 'bg-white'}`}
                                draggable="true"
                                onDragStart={(e) => {
                                  e.dataTransfer.setData("text/plain", assignment.id);
                                  e.currentTarget.classList.add("opacity-50");
                                }}
                                onDragEnd={(e) => {
                                  e.currentTarget.classList.remove("opacity-50");
                                }}
                              >
                                <div className="absolute top-0 right-0 mt-2 mr-2 flex gap-1">
                                  <button 
                                    className="p-1 hover:bg-white hover:shadow-sm rounded-full text-gray-500 hover:text-gray-700 transition-all"
                                    onClick={() => handleEditAssignment(group, assignment)}
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button 
                                    className="p-1 hover:bg-white hover:shadow-sm rounded-full text-gray-500 hover:text-red-500 transition-all"
                                    onClick={() => handleRemoveAssignment(group, assignment.id)}
                                  >
                                    <Trash size={14} />
                                  </button>
                                </div>
                                
                                <div className="flex items-center mb-3">
                                  <div className={`p-2 rounded-full ${statusColors.bgColor} ${statusColors.textColor} mr-3`}>
                                    <Building className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <h5 className="font-medium">{assignment.unit?.name}</h5>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                                  <div>
                                    <span className="text-gray-500">Ngày bắt đầu:</span><br />
                                    <span className="font-medium">{new Date(assignment.startDate).toLocaleDateString('vi-VN')}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Ngày kết thúc:</span><br />
                                    <span className="font-medium">{new Date(assignment.endDate).toLocaleDateString('vi-VN')}</span>
                                  </div>
                                </div>
                                
                                <div className="mb-2">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-gray-500">Tiến độ kiểm kê</span>
                                    <span className="text-xs font-semibold">{progress}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                    <div 
                                      className={`${statusColors.progressColor} h-2.5 rounded-full transition-all`}
                                      style={{ width: `${progress}%` }}
                                    ></div>
                                  </div>
                                </div>
                                
                                <div className="mt-3 flex justify-between items-center">
                                  <div>
                                    {renderStatusBadge(assignment.startDate, assignment.endDate)}
                                  </div>
                                  {assignment.note && (
                                    <div className="text-xs text-gray-500 italic truncate max-w-[200px]">
                                      {assignment.note}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
      
      {/* Modal for adding/editing group */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedGroup ? "Chỉnh sửa nhóm" : "Thêm nhóm kiểm kê mới"}
              </h2>
              <button 
                type="button" 
                onClick={() => setIsGroupModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = {
                name: (e.target as any).name.value,
                leaderId: (e.target as any).leader.value,
                secretaryId: (e.target as any).secretary.value
              };
              saveGroup(formData);
            }}>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên nhóm</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        <Users size={16} />
                      </span>
                      <input 
                        type="text" 
                        name="name" 
                        placeholder="Nhập tên nhóm kiểm kê"
                        defaultValue={selectedGroup?.name || ""}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trưởng nhóm</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        <Users size={16} />
                      </span>
                      <select 
                        name="leader" 
                        defaultValue={selectedGroup?.leaderId || ""}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none"
                        required
                      >
                        <option value="">-- Chọn trưởng nhóm --</option>
                        {mockUsers.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.fullName} - {user.email}
                          </option>
                        ))}
                      </select>
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 pointer-events-none">
                        <ChevronDown size={16} />
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Trưởng nhóm có quyền phân công nhiệm vụ và phê duyệt kết quả</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thư ký</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        <Users size={16} />
                      </span>
                      <select 
                        name="secretary"
                        defaultValue={selectedGroup?.secretaryId || ""}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none"
                        required
                      >
                        <option value="">-- Chọn thư ký --</option>
                        {mockUsers.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.fullName} - {user.email}
                          </option>
                        ))}
                      </select>
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 pointer-events-none">
                        <ChevronDown size={16} />
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Thư ký ghi nhận kết quả kiểm kê và tạo báo cáo</p>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-3 bg-gray-50 flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Hủy
                </Button>
                <Button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                  {selectedGroup ? "Cập nhật" : "Tạo nhóm"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Confirm delete modal */}
      {isConfirmDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center">
              <div className="bg-red-100 p-2 rounded-full mr-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Xác nhận xóa</h2>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700">
                Bạn có chắc muốn xóa nhóm <span className="font-semibold">"{selectedGroup?.name}"</span>?
              </p>
              
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-700">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-amber-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <p>
                      Hành động này sẽ xóa tất cả dữ liệu liên quan đến nhóm này bao gồm danh sách thành viên và phân công kiểm kê. Hành động này không thể hoàn tác.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-3 bg-gray-50 flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsConfirmDeleteModalOpen(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Hủy
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDeleteGroup}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
              >
                Xóa nhóm
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal for adding/editing member */}
      {isMemberModalOpen && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedMember ? "Chỉnh sửa thành viên" : "Thêm thành viên mới"}
              </h2>
              <button 
                type="button" 
                onClick={() => setIsMemberModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = {
                userId: (e.target as any).userId.value,
                role: (e.target as any).role.value,
              };
              saveMember(formData);
            }}>
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-center px-4 py-3 bg-blue-50 rounded-lg">
                    <div className="flex-shrink-0 mr-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">Thêm vào nhóm: {selectedGroup.name}</h3>
                      <p className="text-xs text-blue-600">Trưởng nhóm: {selectedGroup.leader?.fullName}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chọn người dùng</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        <Users size={16} />
                      </span>
                      <select 
                        name="userId" 
                        defaultValue={selectedMember?.userId || ""}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none"
                        required
                      >
                        <option value="">-- Chọn thành viên --</option>
                        {mockUsers.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.fullName} - {user.email}
                          </option>
                        ))}
                      </select>
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 pointer-events-none">
                        <ChevronDown size={16} />
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò trong nhóm</label>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <input 
                          type="radio" 
                          id="role-member" 
                          name="role" 
                          value={InventoryGroupRole.MEMBER}
                          defaultChecked={!selectedMember || selectedMember?.role === InventoryGroupRole.MEMBER}
                          className="sr-only peer"
                        />
                        <label 
                          htmlFor="role-member" 
                          className="flex flex-col items-center justify-center p-2 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 peer-checked:text-indigo-600 hover:bg-gray-50"
                        >
                          <Users className="w-6 h-6 mb-1" />
                          <span className="text-sm font-medium">Thành viên</span>
                        </label>
                      </div>
                      
                      <div>
                        <input 
                          type="radio" 
                          id="role-leader" 
                          name="role" 
                          value={InventoryGroupRole.LEADER}
                          defaultChecked={selectedMember?.role === InventoryGroupRole.LEADER}
                          className="sr-only peer"
                        />
                        <label 
                          htmlFor="role-leader" 
                          className="flex flex-col items-center justify-center p-2 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 peer-checked:text-indigo-600 hover:bg-gray-50"
                        >
                          <Users className="w-6 h-6 mb-1" />
                          <span className="text-sm font-medium">Trưởng nhóm</span>
                        </label>
                      </div>
                      
                      <div>
                        <input 
                          type="radio" 
                          id="role-secretary" 
                          name="role" 
                          value={InventoryGroupRole.SECRETARY}
                          defaultChecked={selectedMember?.role === InventoryGroupRole.SECRETARY}
                          className="sr-only peer"
                        />
                        <label 
                          htmlFor="role-secretary" 
                          className="flex flex-col items-center justify-center p-2 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 peer-checked:text-indigo-600 hover:bg-gray-50"
                        >
                          <Users className="w-6 h-6 mb-1" />
                          <span className="text-sm font-medium">Thư ký</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-3 bg-gray-50 flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Hủy
                </Button>
                <Button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                  {selectedMember ? "Cập nhật" : "Thêm thành viên"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Modal for adding/editing assignment */}
      {isAssignmentModalOpen && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedAssignment ? "Chỉnh sửa phân công" : "Phân công đơn vị kiểm kê"}
              </h2>
              <button 
                type="button" 
                onClick={() => setIsAssignmentModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = {
                unitId: (e.target as any).unitId.value,
                startDate: (e.target as any).startDate.value,
                endDate: (e.target as any).endDate.value,
                note: (e.target as any).note.value
              };
              saveAssignment(formData);
            }}>
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-center px-4 py-3 bg-green-50 rounded-lg">
                    <div className="flex-shrink-0 mr-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Building className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-green-800">Phân công cho nhóm: {selectedGroup.name}</h3>
                      <p className="text-xs text-green-600">Trưởng nhóm: {selectedGroup.leader?.fullName}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị cần kiểm kê</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        <Building size={16} />
                      </span>
                      <select 
                        name="unitId" 
                        defaultValue={selectedAssignment?.unitId || ""}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none"
                        required
                      >
                        <option value="">-- Chọn đơn vị --</option>
                        {mockUnits.map(unit => (
                          <option key={unit.id} value={unit.id}>
                            {unit.name}
                          </option>
                        ))}
                      </select>
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 pointer-events-none">
                        <ChevronDown size={16} />
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Calendar size={14} className="inline mr-1" />
                        Ngày bắt đầu
                      </label>
                      <input 
                        type="date" 
                        name="startDate" 
                        defaultValue={selectedAssignment?.startDate?.split('T')[0] || new Date().toISOString().split('T')[0]}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Calendar size={14} className="inline mr-1" />
                        Ngày kết thúc
                      </label>
                      <input 
                        type="date" 
                        name="endDate" 
                        defaultValue={selectedAssignment?.endDate?.split('T')[0] || new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <AlertCircle size={14} className="inline mr-1" />
                      Ghi chú
                    </label>
                    <textarea 
                      name="note" 
                      placeholder="Nhập ghi chú về phân công này (nếu có)"
                      defaultValue={selectedAssignment?.note || ""}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      rows={3}
                    ></textarea>
                    <p className="mt-1 text-xs text-gray-500">Thông tin chi tiết về yêu cầu kiểm kê, hướng dẫn hoặc lưu ý</p>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-3 bg-gray-50 flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsAssignmentModalOpen(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Hủy
                </Button>
                <Button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                  {selectedAssignment ? "Cập nhật phân công" : "Tạo phân công"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
