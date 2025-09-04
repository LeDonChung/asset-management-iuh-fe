"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { 
  Users,
  Building,
  Calendar,
  FileText
} from "lucide-react";
import { InventoryGroup, InventorySubCommittee } from "@/types/asset";
import ProgressIndicator from "../ProgressIndicator";

interface GroupDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: InventoryGroup;
  subCommittee: InventorySubCommittee;
  onEdit: (group: InventoryGroup) => void;
}

type TabType = 'info' | 'members' | 'assignments' | 'progress';

export default function GroupDetailsModal({ 
  isOpen, 
  onClose, 
  group,
  subCommittee,
  onEdit
}: GroupDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('info');

  const tabs = [
    { id: 'info' as TabType, label: 'Thông tin', icon: FileText },
    { id: 'members' as TabType, label: 'Thành viên', icon: Users },
    { id: 'assignments' as TabType, label: 'Phân công', icon: Building },
    { id: 'progress' as TabType, label: 'Tiến độ', icon: Calendar }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Thông tin cơ bản</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Tên nhóm:</span>
                  <p className="font-medium">{group.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Thuộc tiểu ban:</span>
                  <p className="font-medium">{subCommittee.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Trưởng nhóm:</span>
                  <p className="font-medium">{group.leader?.fullName}</p>
                </div>
                <div>
                  <span className="text-gray-600">Thư ký:</span>
                  <p className="font-medium">{group.secretary?.fullName}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{group.members?.length || 0}</div>
                <div className="text-sm text-green-600">Thành viên</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{group.assignments?.length || 0}</div>
                <div className="text-sm text-purple-600">Phân công</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">85%</div>
                <div className="text-sm text-orange-600">Tiến độ</div>
              </div>
            </div>
          </div>
        );
        
      case 'members':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Danh sách thành viên</h3>
            </div>
            
            {(!group.members || group.members.length === 0) ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Chưa có thành viên nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {group.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      {member.user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{member.user?.fullName}</div>
                      <div className="text-sm text-gray-600">{member.user?.email}</div>
                    </div>
                    <div className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {member.role === 'LEADER' ? 'Trưởng nhóm' : 
                       member.role === 'SECRETARY' ? 'Thư ký' : 'Thành viên'}
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
              <h3 className="font-semibold">Phân công kiểm kê</h3>
            </div>
            
            {(!group.assignments || group.assignments.length === 0) ? (
              <div className="text-center py-8 text-gray-500">
                <Building className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Chưa có phân công nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {group.assignments.map((assignment) => (
                  <div key={assignment.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{assignment.unit?.name}</h4>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                        Đang tiến hành
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
                      <div>Bắt đầu: {new Date(assignment.startDate).toLocaleDateString('vi-VN')}</div>
                      <div>Kết thúc: {new Date(assignment.endDate).toLocaleDateString('vi-VN')}</div>
                    </div>
                    {assignment.note && (
                      <div className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Ghi chú:</span> {assignment.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
        case 'progress':
        // Mock progress data - trong thực tế sẽ được tính từ assignments
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
              <h4 className="font-semibold text-gray-800 mb-3">Báo cáo nhanh</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng số đơn vị được phân công:</span>
                  <span className="font-semibold">{mockProgressData.completed + mockProgressData.inProgress + mockProgressData.notStarted + mockProgressData.overdue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số thành viên tham gia:</span>
                  <span className="font-semibold">{group.members?.length || 0}</span>
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
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="2xl"
      className="max-h-[90vh] overflow-hidden"
    >
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50 -m-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <Building className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{group.name}</h2>
            <p className="text-gray-600">Thuộc {subCommittee.name}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => onEdit(group)}>
          Chỉnh sửa
        </Button>
      </div>

      <div className="flex -m-6">
        {/* Tabs Sidebar */}
        <div className="w-64 bg-gray-50 p-4">
          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-600 border-l-4 border-blue-500'
                      : 'text-gray-600 hover:bg-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
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
    </Modal>
  );
}
