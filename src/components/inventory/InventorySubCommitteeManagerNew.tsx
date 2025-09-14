"use client";

import React, { useState } from "react";
import { 
  InventoryCommittee, 
  InventorySubCommittee, 
  InventoryGroup, 
  InventorySubCommitteeMember,
  InventorySubCommitteeRole,
  User 
} from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Plus, 
  Users,
  ChevronRight,
  Building,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal
} from "lucide-react";
import SubCommitteeModal from "./modals/SubCommitteeModal";
import GroupModal from "./modals/GroupModal";
import GroupCombinedModal from "./modals/GroupCombinedModal";
import SystemOverview from "./SystemOverview";
import GroupCombinedModalNew from "./modals/GroupCombinedModalNew";

interface InventorySubCommitteeManagerNewProps {
  committee: InventoryCommittee;
}

// Mock data for development - Enhanced with more realistic data
const mockUsers: User[] = [
  { 
    id: "u1", 
    fullName: "TS. Nguyễn Văn Minh", 
    username: "nguyenvanminh", 
    email: "minh.nv@iuh.edu.vn", 
    status: "ACTIVE" as any,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  { 
    id: "u2", 
    fullName: "ThS. Trần Thị Hương", 
    username: "tranthihuong", 
    email: "huong.tt@iuh.edu.vn", 
    status: "ACTIVE" as any,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  { 
    id: "u3", 
    fullName: "PGS.TS. Phạm Văn Cường", 
    username: "phamvancuong", 
    email: "cuong.pv@iuh.edu.vn", 
    status: "ACTIVE" as any,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  { 
    id: "u4", 
    fullName: "ThS. Lê Thị Diệu", 
    username: "lethidieu", 
    email: "dieu.lt@iuh.edu.vn", 
    status: "ACTIVE" as any,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  { 
    id: "u5", 
    fullName: "Th.S Nguyễn Văn Đức", 
    username: "nguyenvanduc", 
    email: "duc.nv@iuh.edu.vn", 
    status: "ACTIVE" as any,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  { 
    id: "u6", 
    fullName: "Cô. Trần Thị Lan", 
    username: "tranthilan", 
    email: "lan.tt@iuh.edu.vn", 
    status: "ACTIVE" as any,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  { 
    id: "u7", 
    fullName: "ThS. Hoàng Minh Tuấn", 
    username: "hoangminhtuan", 
    email: "tuan.hm@iuh.edu.vn", 
    status: "ACTIVE" as any,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  { 
    id: "u8", 
    fullName: "Cô. Võ Thị Mai", 
    username: "vothimai", 
    email: "mai.vt@iuh.edu.vn", 
    status: "ACTIVE" as any,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  { 
    id: "u9", 
    fullName: "ThS. Đặng Văn Nam", 
    username: "dangvannam", 
    email: "nam.dv@iuh.edu.vn", 
    status: "ACTIVE" as any,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  { 
    id: "u10", 
    fullName: "Cô. Lưu Thị Oanh", 
    username: "luuthioanh", 
    email: "oanh.lt@iuh.edu.vn", 
    status: "ACTIVE" as any,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  { 
    id: "u11", 
    fullName: "ThS. Bùi Văn Hùng", 
    username: "buivanhung", 
    email: "hung.bv@iuh.edu.vn", 
    status: "ACTIVE" as any,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  { 
    id: "u12", 
    fullName: "Cô. Ngô Thị Thu", 
    username: "ngothithu", 
    email: "thu.nt@iuh.edu.vn", 
    status: "ACTIVE" as any,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  { 
    id: "u13", 
    fullName: "ThS. Phan Minh Đức", 
    username: "phanminhduc", 
    email: "duc.pm@iuh.edu.vn", 
    status: "ACTIVE" as any,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  { 
    id: "u14", 
    fullName: "Cô. Vũ Thị Hồng", 
    username: "vuthihong", 
    email: "hong.vt@iuh.edu.vn", 
    status: "ACTIVE" as any,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  { 
    id: "u15", 
    fullName: "ThS. Tạ Văn Long", 
    username: "tavanlong", 
    email: "long.tv@iuh.edu.vn", 
    status: "ACTIVE" as any,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  { 
    id: "u16", 
    fullName: "Cô. Đinh Thị Xuân", 
    username: "dinhthixuan", 
    email: "xuan.dt@iuh.edu.vn", 
    status: "ACTIVE" as any,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  }
];

// Mock subcommittees with comprehensive data including multiple members
const mockSubCommittees: InventorySubCommittee[] = [
  {
    id: "sub1",
    committeeId: "com1",
    name: "Tiểu ban Cơ sở Gò Vấp",
    leaderId: "u1",
    secretaryId: "u2",
    createdAt: "2025-01-01T00:00:00Z",
    leader: mockUsers.find(u => u.id === "u1"),
    secretary: mockUsers.find(u => u.id === "u2"),
    members: [
      {
        id: "sm1",
        subCommitteeId: "sub1",
        userId: "u3",
        role: InventorySubCommitteeRole.MEMBER,
        user: mockUsers.find(u => u.id === "u3")
      },
      {
        id: "sm2",
        subCommitteeId: "sub1",
        userId: "u4",
        role: InventorySubCommitteeRole.MEMBER,
        user: mockUsers.find(u => u.id === "u4")
      },
      {
        id: "sm3",
        subCommitteeId: "sub1",
        userId: "u5",
        role: InventorySubCommitteeRole.MEMBER,
        user: mockUsers.find(u => u.id === "u5")
      }
    ],
    groups: [
      {
        id: "g1",
        subCommitteeId: "sub1",
        name: "Nhóm 1 - Khoa Cơ khí",
        leaderId: "u3",
        secretaryId: "u4",
        createdAt: "2025-01-01T00:00:00Z",
        leader: mockUsers.find(u => u.id === "u3"),
        secretary: mockUsers.find(u => u.id === "u4"),
        members: [
          {
            id: "m1",
            groupId: "g1",
            userId: "u5",
            role: "MEMBER" as any,
            user: mockUsers.find(u => u.id === "u5")
          },
          {
            id: "m2",
            groupId: "g1",
            userId: "u6",
            role: "MEMBER" as any,
            user: mockUsers.find(u => u.id === "u6")
          },
          {
            id: "m3",
            groupId: "g1",
            userId: "u7",
            role: "MEMBER" as any,
            user: mockUsers.find(u => u.id === "u7")
          }
        ],
        assignments: [
          {
            id: "a1",
            groupId: "g1",
            unitId: "dept1",
            startDate: "2025-01-15T00:00:00Z",
            endDate: "2025-01-25T00:00:00Z",
            note: "Kiểm kê thiết bị phòng thí nghiệm và dụng cụ thực hành",
            unit: {
              id: "dept1",
              name: "Phòng thí nghiệm Cơ khí 1",
              type: "DON_VI_SU_DUNG" as any,
              representativeId: "u3",
              status: "ACTIVE" as any,
              createdBy: "admin",
              createdAt: "2025-01-01T00:00:00Z",
              updatedAt: "2025-01-01T00:00:00Z"
            },
            results: []
          },
          {
            id: "a2",
            groupId: "g1",
            unitId: "dept2",
            startDate: "2025-01-20T00:00:00Z",
            endDate: "2025-01-30T00:00:00Z",
            note: "Kiểm kê máy móc và trang thiết bị sản xuất",
            unit: {
              id: "dept2",
              name: "Xưởng Cơ khí",
              type: "DON_VI_SU_DUNG" as any,
              representativeId: "u4",
              status: "ACTIVE" as any,
              createdBy: "admin",
              createdAt: "2025-01-01T00:00:00Z",
              updatedAt: "2025-01-01T00:00:00Z"
            },
            results: []
          }
        ]
      },
      {
        id: "g2",
        subCommitteeId: "sub1",
        name: "Nhóm 2 - Khoa Công nghệ thông tin",
        leaderId: "u8",
        secretaryId: "u9",
        createdAt: "2025-01-01T00:00:00Z",
        leader: mockUsers.find(u => u.id === "u8"),
        secretary: mockUsers.find(u => u.id === "u9"),
        members: [
          {
            id: "m4",
            groupId: "g2",
            userId: "u10",
            role: "MEMBER" as any,
            user: mockUsers.find(u => u.id === "u10")
          },
          {
            id: "m5",
            groupId: "g2",
            userId: "u11",
            role: "MEMBER" as any,
            user: mockUsers.find(u => u.id === "u11")
          },
          {
            id: "m6",
            groupId: "g2",
            userId: "u12",
            role: "MEMBER" as any,
            user: mockUsers.find(u => u.id === "u12")
          },
          {
            id: "m7",
            groupId: "g2",
            userId: "u13",
            role: "MEMBER" as any,
            user: mockUsers.find(u => u.id === "u13")
          }
        ],
        assignments: [
          {
            id: "a3",
            groupId: "g2",
            unitId: "dept3",
            startDate: "2025-01-10T00:00:00Z",
            endDate: "2025-01-20T00:00:00Z",
            note: "Kiểm kê máy tính và thiết bị mạng",
            unit: {
              id: "dept3",
              name: "Phòng máy tính P501",
              type: "DON_VI_SU_DUNG" as any,
              representativeId: "u8",
              status: "ACTIVE" as any,
              createdBy: "admin",
              createdAt: "2025-01-01T00:00:00Z",
              updatedAt: "2025-01-01T00:00:00Z"
            },
            results: []
          }
        ]
      }
    ]
  },
  {
    id: "sub2",
    committeeId: "com1",
    name: "Tiểu ban Cơ sở Quận 12",
    leaderId: "u5",
    secretaryId: "u6",
    createdAt: "2025-01-01T00:00:00Z",
    leader: mockUsers.find(u => u.id === "u5"),
    secretary: mockUsers.find(u => u.id === "u6"),
    members: [
      {
        id: "sm4",
        subCommitteeId: "sub2",
        userId: "u7",
        role: InventorySubCommitteeRole.MEMBER,
        user: mockUsers.find(u => u.id === "u7")
      },
      {
        id: "sm5",
        subCommitteeId: "sub2",
        userId: "u8",
        role: InventorySubCommitteeRole.MEMBER,
        user: mockUsers.find(u => u.id === "u8")
      }
    ],
    groups: [
      {
        id: "g4",
        subCommitteeId: "sub2",
        name: "Nhóm 1 - Khoa Kinh tế",
        leaderId: "u7",
        secretaryId: "u8",
        createdAt: "2025-01-01T00:00:00Z",
        leader: mockUsers.find(u => u.id === "u7"),
        secretary: mockUsers.find(u => u.id === "u8"),
        members: [
          {
            id: "m9",
            groupId: "g4",
            userId: "u9",
            role: "MEMBER" as any,
            user: mockUsers.find(u => u.id === "u9")
          },
          {
            id: "m10",
            groupId: "g4",
            userId: "u10",
            role: "MEMBER" as any,
            user: mockUsers.find(u => u.id === "u10")
          }
        ],
        assignments: []
      }
    ]
  }
];

export default function InventorySubCommitteeManagerNew({ committee }: InventorySubCommitteeManagerNewProps) {
  const [subCommittees, setSubCommittees] = useState<InventorySubCommittee[]>(mockSubCommittees);
  
  // Modal states
  const [isSubCommitteeModalOpen, setIsSubCommitteeModalOpen] = useState(false);
  const [selectedSubCommittee, setSelectedSubCommittee] = useState<InventorySubCommittee | null>(null);
  
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<InventoryGroup | null>(null);
  const [currentSubCommittee, setCurrentSubCommittee] = useState<InventorySubCommittee | null>(null);
  
  const [isGroupCombinedModalOpen, setIsGroupCombinedModalOpen] = useState(false);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'subcommittee' | 'group'; item: any } | null>(null);

  // SubCommittee handlers
  const handleAddSubCommittee = () => {
    setSelectedSubCommittee(null);
    setIsSubCommitteeModalOpen(true);
  };

  const handleEditSubCommittee = (subCommittee: InventorySubCommittee) => {
    setSelectedSubCommittee(subCommittee);
    setIsSubCommitteeModalOpen(true);
  };

  const handleDeleteSubCommittee = (subCommittee: InventorySubCommittee) => {
    setDeleteTarget({ type: 'subcommittee', item: subCommittee });
    setShowDeleteConfirm(true);
  };

  const saveSubCommittee = (formData: any) => {
    if (selectedSubCommittee) {
      // Edit existing
      setSubCommittees(prev => 
        prev.map(s => 
          s.id === selectedSubCommittee.id 
            ? { 
                ...s, 
                ...formData, 
                leader: mockUsers.find(u => u.id === formData.leaderId), 
                secretary: mockUsers.find(u => u.id === formData.secretaryId),
                members: formData.members?.map((member: InventorySubCommitteeMember) => ({
                  ...member,
                  user: mockUsers.find(u => u.id === member.userId)
                })) || []
              } 
            : s
        )
      );
    } else {
      // Add new
      const newSubCommittee: InventorySubCommittee = {
        id: `sub${Date.now()}`,
        committeeId: committee.id,
        name: formData.name,
        leaderId: formData.leaderId,
        secretaryId: formData.secretaryId,
        createdAt: new Date().toISOString(),
        leader: mockUsers.find(u => u.id === formData.leaderId),
        secretary: mockUsers.find(u => u.id === formData.secretaryId),
        members: formData.members?.map((member: InventorySubCommitteeMember) => ({
          ...member,
          subCommitteeId: `sub${Date.now()}`,
          user: mockUsers.find(u => u.id === member.userId)
        })) || [],
        groups: []
      };
      setSubCommittees(prev => [...prev, newSubCommittee]);
    }
  };

  // Group handlers
  const handleAddGroup = (subCommittee: InventorySubCommittee) => {
    setCurrentSubCommittee(subCommittee);
    setSelectedGroup(null);
    setIsGroupModalOpen(true);
  };

  const handleEditGroup = (group: InventoryGroup, subCommittee: InventorySubCommittee) => {
    setCurrentSubCommittee(subCommittee);
    setSelectedGroup(group);
    setIsGroupModalOpen(true);
  };

  const handleDeleteGroup = (group: InventoryGroup) => {
    setDeleteTarget({ type: 'group', item: group });
    setShowDeleteConfirm(true);
  };

  const handleViewGroupDetails = (group: InventoryGroup, subCommittee: InventorySubCommittee) => {
    setSelectedGroup(group);
    setCurrentSubCommittee(subCommittee);
    setIsGroupCombinedModalOpen(true);
  };

  const handleManageGroup = (group: InventoryGroup, subCommittee: InventorySubCommittee) => {
    setSelectedGroup(group);
    setCurrentSubCommittee(subCommittee);
    setIsGroupCombinedModalOpen(true);
  };

  const saveGroup = (formData: any) => {
    if (!currentSubCommittee) return;

    setSubCommittees(prev => 
      prev.map(sub => {
        if (sub.id === currentSubCommittee.id) {
          let updatedGroups = [...(sub.groups || [])];
          
          if (selectedGroup) {
            // Edit existing
            updatedGroups = updatedGroups.map(g => 
              g.id === selectedGroup.id 
                ? { 
                    ...g, 
                    ...formData, 
                    leader: mockUsers.find(u => u.id === formData.leaderId),
                    secretary: mockUsers.find(u => u.id === formData.secretaryId),
                    members: formData.members?.map((member: any) => ({
                      ...member,
                      user: mockUsers.find(u => u.id === member.userId)
                    })) || []
                  } 
                : g
            );
          } else {
            // Add new
            const newGroup: InventoryGroup = {
              id: `g${Date.now()}`,
              subCommitteeId: currentSubCommittee.id,
              name: formData.name,
              leaderId: formData.leaderId,
              secretaryId: formData.secretaryId,
              createdAt: new Date().toISOString(),
              leader: mockUsers.find(u => u.id === formData.leaderId),
              secretary: mockUsers.find(u => u.id === formData.secretaryId),
              members: formData.members?.map((member: any) => ({
                ...member,
                groupId: `g${Date.now()}`,
                user: mockUsers.find(u => u.id === member.userId)
              })) || [],
              assignments: []
            };
            updatedGroups.push(newGroup);
          }
          
          return { ...sub, groups: updatedGroups };
        }
        return sub;
      })
    );
  };

  // Delete confirmation
  const confirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'subcommittee') {
      setSubCommittees(prev => prev.filter(s => s.id !== deleteTarget.item.id));
    } else if (deleteTarget.type === 'group') {
      setSubCommittees(prev => 
        prev.map(sub => ({
          ...sub,
          groups: sub.groups?.filter(g => g.id !== deleteTarget.item.id) || []
        }))
      );
    }

    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý tiểu ban và nhóm</h2>
        </div>
        <Button 
          onClick={handleAddSubCommittee}
          className="bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Thêm tiểu ban
        </Button>
      </div>

      {/* Enhanced System Overview */}
      <SystemOverview 
        stats={{
          totalSubCommittees: subCommittees.length,
          totalGroups: subCommittees.reduce((total, sub) => total + (sub.groups?.length || 0), 0),
          totalMembers: subCommittees.reduce((total, sub) => 
            total + 
            (sub.groups?.reduce((groupTotal, group) => 
              groupTotal + (group.members?.length || 0), 0) || 0) +
            (sub.members?.length || 0) + 2 // Add sub-committee members + leader + secretary
          , 0),
          totalAssignments: subCommittees.reduce((total, sub) => 
            total + (sub.groups?.reduce((groupTotal, group) => 
              groupTotal + (group.assignments?.length || 0), 0) || 0), 0),
          completedAssignments: 12, // Mock data
          inProgressAssignments: 8, // Mock data  
          overdueAssignments: 2 // Mock data
        }}
      />

      {/* SubCommittees List */}
      {subCommittees.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">Chưa có tiểu ban nào</h3>
          <p className="text-gray-500 mb-6">
            Hãy tạo tiểu ban đầu tiên để bắt đầu tổ chức nhóm kiểm kê
          </p>
          <Button onClick={handleAddSubCommittee} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-5 w-5 mr-2" />
            Tạo tiểu ban đầu tiên
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {subCommittees.map((subCommittee, index) => (
            <Card key={subCommittee.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              {/* SubCommittee Header */}
              <div className={`p-6 bg-gradient-to-r ${
                index % 3 === 0 ? 'from-blue-50 to-blue-100' : 
                index % 3 === 1 ? 'from-green-50 to-green-100' : 
                'from-purple-50 to-purple-100'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${
                      index % 3 === 0 ? 'bg-blue-200' : 
                      index % 3 === 1 ? 'bg-green-200' : 
                      'bg-purple-200'
                    }`}>
                      <Users className={`h-6 w-6 ${
                        index % 3 === 0 ? 'text-blue-600' : 
                        index % 3 === 1 ? 'text-green-600' : 
                        'text-purple-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{subCommittee.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span>Trưởng: {subCommittee.leader?.fullName}</span>
                        <span>•</span>
                        <span>Thư ký: {subCommittee.secretary?.fullName}</span>
                        <span>•</span>
                        <span>{subCommittee.groups?.length || 0} nhóm</span>
                        <span>•</span>
                        <span>{(subCommittee.members?.length || 0) + 2} thành viên</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditSubCommittee(subCommittee)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteSubCommittee(subCommittee)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Groups Section */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-700">Nhóm kiểm kê</h4>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleAddGroup(subCommittee)}
                    className="border-dashed"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Thêm nhóm
                  </Button>
                </div>

                {(!subCommittee.groups || subCommittee.groups.length === 0) ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Building className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h5 className="text-lg font-medium text-gray-600 mb-2">Chưa có nhóm nào</h5>
                    <p className="text-gray-500 mb-4">
                      Hãy thêm nhóm kiểm kê để phân công nhiệm vụ cụ thể
                    </p>
                    <Button 
                      size="sm"
                      onClick={() => handleAddGroup(subCommittee)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Thêm nhóm đầu tiên
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subCommittee.groups.map((group) => (
                      <Card key={group.id} className="p-4 hover:shadow-md transition-shadow border-l-4 border-green-400">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="bg-green-100 p-2 rounded-full">
                              <Building className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-800 text-sm">{group.name}</h5>
                              <p className="text-xs text-gray-500">{group.members?.length || 0} thành viên</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditGroup(group, subCommittee)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteGroup(group)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Trưởng nhóm:</span>
                            <span className="font-medium">{group.leader?.fullName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Thư ký:</span>
                            <span className="font-medium">{group.secretary?.fullName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Phân công:</span>
                            <span className="font-medium">{group.assignments?.length || 0} đơn vị</span>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handleViewGroupDetails(group, subCommittee)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Chi tiết
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handleManageGroup(group, subCommittee)}
                          >
                            <Users className="h-4 w-4 mr-1" />
                            Quản lý
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <SubCommitteeModal
        isOpen={isSubCommitteeModalOpen}
        onClose={() => setIsSubCommitteeModalOpen(false)}
        subCommittee={selectedSubCommittee}
        onSave={saveSubCommittee}
        availableUsers={mockUsers}
      />

      {currentSubCommittee && (
        <GroupModal
          isOpen={isGroupModalOpen}
          onClose={() => setIsGroupModalOpen(false)}
          subCommittee={currentSubCommittee}
          group={selectedGroup}
          onSave={saveGroup}
          availableUsers={mockUsers}
        />
      )}

      {selectedGroup && currentSubCommittee && (
        <GroupCombinedModalNew
          isOpen={isGroupCombinedModalOpen}
          onClose={() => setIsGroupCombinedModalOpen(false)}
          group={selectedGroup}
          subCommittee={currentSubCommittee}
          availableUsers={mockUsers}
          availableUnits={[
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
              name: "Phòng Đào tạo",
              type: "DON_VI_SU_DUNG" as any,
              representativeId: "u10",
              status: "ACTIVE" as any,
              createdBy: "admin",
              createdAt: "2025-01-01T00:00:00Z",
              updatedAt: "2025-01-01T00:00:00Z"
            }
          ]}
          onSave={(updatedGroup: InventoryGroup) => {
            setSubCommittees(prev => 
              prev.map(sub => {
                if (sub.id === currentSubCommittee.id) {
                  return {
                    ...sub,
                    groups: sub.groups?.map(g => 
                      g.id === updatedGroup.id ? updatedGroup : g
                    ) || []
                  };
                }
                return sub;
              })
            );
            setIsGroupCombinedModalOpen(false);
          }}
          onEdit={(group: InventoryGroup) => {
            setSelectedGroup(group);
            setIsGroupCombinedModalOpen(false);
            handleEditGroup(group, currentSubCommittee);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-3 rounded-full mr-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Xác nhận xóa</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Bạn có chắc muốn xóa {deleteTarget.type === 'subcommittee' ? 'tiểu ban' : 'nhóm'}{' '}
                <span className="font-semibold">"{deleteTarget.item.name}"</span>?
                {deleteTarget.type === 'subcommittee' && (
                  <span className="block mt-2 text-sm text-red-600">
                    Tất cả nhóm thuộc tiểu ban này cũng sẽ bị xóa.
                  </span>
                )}
              </p>
              
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Hủy
                </Button>
                <Button variant="destructive" onClick={confirmDelete}>
                  Xóa
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
