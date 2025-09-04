"use client";

import React, { useState, useMemo } from "react";
import { 
  InventoryGroup, 
  InventoryGroupAssignment, 
  Unit, 
  User 
} from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Plus, 
  Edit, 
  Trash, 
  Clock,
  AlertCircle,
  CheckCircle2,
  Search,
  Calendar
} from "lucide-react";

interface InventoryAssignmentManagerProps {
  session: any; // InventorySession
}

// Mock data for development
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
  }
];

// Mock groups and assignments
const mockGroups: InventoryGroup[] = [
  {
    id: "g1",
    subCommitteeId: "sub1",
    name: "Nhóm 1 - Khoa Cơ khí",
    leaderId: "u1",
    secretaryId: "u2",
    createdAt: "2025-01-01T00:00:00Z",
    leader: mockUsers.find(u => u.id === "u1"),
    secretary: mockUsers.find(u => u.id === "u2")
  },
  {
    id: "g2",
    subCommitteeId: "sub1",
    name: "Nhóm 2 - Khoa CNTT",
    leaderId: "u2",
    secretaryId: "u1",
    createdAt: "2025-01-01T00:00:00Z",
    leader: mockUsers.find(u => u.id === "u2"),
    secretary: mockUsers.find(u => u.id === "u1")
  }
];

const mockAssignments: InventoryGroupAssignment[] = [
  {
    id: "a1",
    groupId: "g1",
    unitId: "dept1",
    startDate: "2025-01-01",
    endDate: "2025-01-07",
    note: "Kiểm kê đầy đủ các tài sản trong khoa",
    group: mockGroups.find(g => g.id === "g1"),
    unit: mockUnits.find(u => u.id === "dept1")
  },
  {
    id: "a2",
    groupId: "g1",
    unitId: "dept2",
    startDate: "2025-01-08",
    endDate: "2025-01-15",
    note: "Tập trung kiểm kê các thiết bị CNTT",
    group: mockGroups.find(g => g.id === "g1"),
    unit: mockUnits.find(u => u.id === "dept2")
  },
  {
    id: "a3",
    groupId: "g2",
    unitId: "dept3",
    startDate: "2025-01-01",
    endDate: "2025-01-05",
    group: mockGroups.find(g => g.id === "g2"),
    unit: mockUnits.find(u => u.id === "dept3")
  }
];

// Calculate assignment status based on dates
const getAssignmentStatus = (startDate: string, endDate: string) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now < start) return "NOT_STARTED";
  if (now > end) return "COMPLETED";
  return "IN_PROGRESS";
};

// Calculate progress percentage
const calculateProgress = (assignment: InventoryGroupAssignment): number => {
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

export default function InventoryAssignmentManager({ session }: InventoryAssignmentManagerProps) {
  const [assignments, setAssignments] = useState<InventoryGroupAssignment[]>(mockAssignments);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGroup, setFilterGroup] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [selectedAssignment, setSelectedAssignment] = useState<InventoryGroupAssignment | null>(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);

  // Filter assignments based on search term and filters
  const filteredAssignments = useMemo(() => {
    return assignments.filter(assignment => {
      const matchesSearch = 
        searchTerm === "" || 
        assignment.group?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.unit?.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGroup = filterGroup === "" || assignment.groupId === filterGroup;
      
      const status = getAssignmentStatus(assignment.startDate, assignment.endDate);
      const matchesStatus = filterStatus === "" || status === filterStatus;
      
      return matchesSearch && matchesGroup && matchesStatus;
    });
  }, [assignments, searchTerm, filterGroup, filterStatus]);

  // Handle add new assignment
  const handleAddAssignment = () => {
    setSelectedAssignment(null);
    setIsAssignmentModalOpen(true);
  };

  // Handle edit assignment
  const handleEditAssignment = (assignment: InventoryGroupAssignment) => {
    setSelectedAssignment(assignment);
    setIsAssignmentModalOpen(true);
  };

  // Handle delete assignment
  const handleDeleteAssignment = (assignment: InventoryGroupAssignment) => {
    setSelectedAssignment(assignment);
    setIsConfirmDeleteModalOpen(true);
  };

  // Confirm delete assignment
  const confirmDeleteAssignment = () => {
    if (selectedAssignment) {
      setAssignments(prev => prev.filter(a => a.id !== selectedAssignment.id));
      setIsConfirmDeleteModalOpen(false);
      setSelectedAssignment(null);
    }
  };

  // Save assignment (new or edit)
  const saveAssignment = (formData: any) => {
    if (selectedAssignment) {
      // Edit existing assignment
      setAssignments(prev => 
        prev.map(a => 
          a.id === selectedAssignment.id 
            ? { 
                ...a, 
                groupId: formData.groupId,
                unitId: formData.unitId,
                startDate: formData.startDate,
                endDate: formData.endDate,
                note: formData.note,
                group: mockGroups.find(g => g.id === formData.groupId),
                unit: mockUnits.find(u => u.id === formData.unitId)
              } 
            : a
        )
      );
    } else {
      // Add new assignment
      const newAssignment: InventoryGroupAssignment = {
        id: `a${Date.now()}`,
        groupId: formData.groupId,
        unitId: formData.unitId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        note: formData.note,
        group: mockGroups.find(g => g.id === formData.groupId),
        unit: mockUnits.find(u => u.id === formData.unitId)
      };
      setAssignments(prev => [...prev, newAssignment]);
    }
    setIsAssignmentModalOpen(false);
  };

  // Render status badge
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
        <h2 className="text-xl font-bold">Phân công đơn vị kiểm kê</h2>
        <Button 
          onClick={handleAddAssignment} 
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Thêm phân công</span>
        </Button>
      </div>
      
      {/* Search and filters */}
      <Card className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm nhóm, đơn vị..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả nhóm</option>
            {mockGroups.map(group => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="NOT_STARTED">Chưa kiểm kê</option>
            <option value="IN_PROGRESS">Đang kiểm kê</option>
            <option value="COMPLETED">Đã kiểm kê xong</option>
          </select>
        </div>
      </Card>
      
      {/* Assignments table */}
      <Card className="p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nhóm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đơn vị
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày bắt đầu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày kết thúc
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tiến độ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    Không tìm thấy phân công nào
                  </td>
                </tr>
              ) : (
                filteredAssignments.map(assignment => (
                  <tr key={assignment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {assignment.group?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignment.unit?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(assignment.startDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(assignment.endDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {renderStatusBadge(assignment.startDate, assignment.endDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${calculateProgress(assignment)}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {calculateProgress(assignment)}% hoàn thành
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2"
                        onClick={() => handleEditAssignment(assignment)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 text-red-500"
                        onClick={() => handleDeleteAssignment(assignment)}
                      >
                        <Trash size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Modal for adding/editing assignment */}
      {isAssignmentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">
              {selectedAssignment ? "Chỉnh sửa phân công" : "Thêm phân công mới"}
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = {
                groupId: (e.target as any).group.value,
                unitId: (e.target as any).unit.value,
                startDate: (e.target as any).startDate.value,
                endDate: (e.target as any).endDate.value,
                note: (e.target as any).note.value
              };
              saveAssignment(formData);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nhóm kiểm kê</label>
                  <select 
                    name="group" 
                    defaultValue={selectedAssignment?.groupId || ""}
                    className="w-full border rounded p-2"
                    required
                  >
                    <option value="">-- Chọn nhóm --</option>
                    {mockGroups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Đơn vị được kiểm kê</label>
                  <select 
                    name="unit" 
                    defaultValue={selectedAssignment?.unitId || ""}
                    className="w-full border rounded p-2"
                    required
                  >
                    <option value="">-- Chọn đơn vị --</option>
                    {mockUnits.map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Ngày bắt đầu</label>
                    <input 
                      type="date" 
                      name="startDate" 
                      defaultValue={selectedAssignment?.startDate || new Date().toISOString().split('T')[0]}
                      className="w-full border rounded p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ngày kết thúc</label>
                    <input 
                      type="date" 
                      name="endDate" 
                      defaultValue={selectedAssignment?.endDate || new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]}
                      className="w-full border rounded p-2"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ghi chú</label>
                  <textarea 
                    name="note" 
                    defaultValue={selectedAssignment?.note || ""}
                    className="w-full border rounded p-2"
                    rows={3}
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsAssignmentModalOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit">Lưu</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Confirm delete modal */}
      {isConfirmDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Xác nhận xóa</h2>
            <p>
              Bạn có chắc muốn xóa phân công kiểm kê cho đơn vị "{selectedAssignment?.unit?.name}"?
            </p>
            <div className="flex justify-end space-x-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setIsConfirmDeleteModalOpen(false)}
              >
                Hủy
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDeleteAssignment}
              >
                Xóa
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
