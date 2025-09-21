"use client";

import React, { useState, useEffect } from "react";
import {
  InventorySubCommittee, 
  InventoryGroup,
  User,
  InventorySessionUnit,
  Unit,
  UnitType,
} from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Plus, 
  Users,
  Building,
  AlertTriangle,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import SubCommitteeModal from "./modals/SubCommitteeModal";
import GroupModal from "./modals/GroupModal";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { 
  createInventorySubCommittee,
  updateInventorySubCommittee,
  deleteInventorySubCommittee,
  createInventoryGroup,
  updateInventoryGroup,
  deleteInventoryGroup,
  CreateInventorySubDto,
  UpdateInventorySubDto,
  CreateInventoryGroupDto,
  UpdateInventoryGroupDto,
} from "@/lib/store/slices/inventorySlice";
import { getAllInventoryCommitteeUsers } from "@/lib/store/slices/userSlice";
import { getAllUnits, getUnitChildren } from "@/lib/store/slices/unitSlice";
import toast from "react-hot-toast";


export default function InventorySubCommitteeManagerNew() {
  const dispatch = useAppDispatch();
  const { 
    currentSession,
    createSubCommitteeLoading,
    deleteSubCommitteeLoading,
    createGroupLoading,
    deleteGroupLoading,
  } = useAppSelector(state => state.inventory);
  
  const { 
    inventoryCommitteeUsers,
  } = useAppSelector(state => state.user);
  
  const { 
    allUnits,
  } = useAppSelector(state => state.unit);
  
  // Get sub-committees from current session's inventory session units
  const getSubCommittees = (): InventorySubCommittee[] => {
    if (!currentSession?.inventorySessionUnits) return [];
    
    const subCommittees: InventorySubCommittee[] = [];
    currentSession.inventorySessionUnits.forEach((unit: any) => {
      if (unit.subInventory) {
        // Ensure subCommittee has complete inventorySessionUnit data with unit info
        const subCommitteeWithUnit = {
          ...unit.subInventory,
          inventorySessionUnit: {
            ...unit,
            unit: unit.unit // Include the unit data
          }
        };
        subCommittees.push(subCommitteeWithUnit);
      }
    });
    
    return subCommittees;
  };

  const [subCommittees, setSubCommittees] = useState<InventorySubCommittee[]>(getSubCommittees());

  // Update sub-committees when current session changes
  useEffect(() => {
    setSubCommittees(getSubCommittees());
  }, [currentSession]);

  // Load available users for inventory committee
  useEffect(() => {
    if (!inventoryCommitteeUsers || inventoryCommitteeUsers.length === 0) {
      try {
        dispatch(getAllInventoryCommitteeUsers());
      } catch (error: any) {
        console.log(error);
        toast.error(error.message || 'Có lỗi xảy ra khi lấy danh sách thành viên ban kiểm kê');
      } 
    }
  }, [dispatch, inventoryCommitteeUsers]);

  // Load all units for group assignments
  useEffect(() => {
    if (!allUnits || allUnits.length === 0) {
      try {
        dispatch(getAllUnits());
      } catch (error: any) {
        console.log(error);
        toast.error(error.message || 'Có lỗi xảy ra khi lấy danh sách đơn vị');
      }
    }
  }, [dispatch, allUnits]);

  // Modal states
  const [isSubCommitteeModalOpen, setIsSubCommitteeModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedSubCommittee, setSelectedSubCommittee] = useState<InventorySubCommittee | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<InventoryGroup | null>(null);
  const [currentSubCommittee, setCurrentSubCommittee] = useState<InventorySubCommittee | null>(null);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'subcommittee' | 'group'; item: any } | null>(null);

  // Helper function to get available session units (units without sub-committees)
  const getAvailableSessionUnits = (): InventorySessionUnit[] => {
    if (!currentSession?.inventorySessionUnits) return [];
    
    return currentSession.inventorySessionUnits.filter((unit: any) => 
      !unit.subInventory || (selectedSubCommittee && unit.subInventory?.id === selectedSubCommittee.id)
    );
  };


  // Helper function to get available units for group assignments
  const getAvailableUnitsForGroups = (): Unit[] => {
    // Return all units that are not campuses (USER_DEPT and ADMIN_DEPT)
    return allUnits.filter((unit: Unit) => unit.type !== UnitType.CO_SO);
  };

  // Helper function to get all assigned user IDs across all sub-committees and groups
  const getAllAssignedUserIds = (excludeSubCommitteeId?: string, excludeGroupId?: string): string[] => {
    const assignedUserIds = new Set<string>();

    subCommittees.forEach(subCommittee => {
      // Skip the sub-committee being edited
      if (excludeSubCommitteeId && subCommittee.id === excludeSubCommitteeId) {
        return;
      }

      // Add sub-committee members (leaders, secretaries, and members)
      if (subCommittee.members) {
        subCommittee.members.forEach(member => {
          assignedUserIds.add(member.userId);
        });
      }

      // Add group members from all groups in this sub-committee
      if (subCommittee.groups) {
        subCommittee.groups.forEach(group => {
          // Skip the group being edited
          if (excludeGroupId && group.id === excludeGroupId) {
            return;
          }

          if (group.members) {
            group.members.forEach(member => {
              assignedUserIds.add(member.userId);
            });
          }
        });
      }
    });

    return Array.from(assignedUserIds);
  };

  // Helper function to get available users for sub-committee (excluding already assigned users)
  const getAvailableUsersForSubCommittee = (excludeSubCommitteeId?: string): User[] => {
    const assignedUserIds = getAllAssignedUserIds(excludeSubCommitteeId);
    return (inventoryCommitteeUsers || []).filter(user => !assignedUserIds.includes(user.id));
  };

  // Helper function to get available users for group (excluding already assigned users)
  const getAvailableUsersForGroup = (subCommitteeId: string, excludeGroupId?: string): User[] => {
    const assignedUserIds = getAllAssignedUserIds(undefined, excludeGroupId);
    return (inventoryCommitteeUsers || []).filter(user => !assignedUserIds.includes(user.id));
  };

  // Helper function to check if a user is already assigned
  const isUserAssigned = (userId: string, excludeSubCommitteeId?: string, excludeGroupId?: string): { isAssigned: boolean; assignedTo?: string } => {
    const assignedUserIds = getAllAssignedUserIds(excludeSubCommitteeId, excludeGroupId);
    
    if (!assignedUserIds.includes(userId)) {
      return { isAssigned: false };
    }

    // Find where the user is assigned
    for (const subCommittee of subCommittees) {
      if (excludeSubCommitteeId && subCommittee.id === excludeSubCommitteeId) {
        continue;
      }

      // Check sub-committee members
      if (subCommittee.members?.some(member => member.userId === userId)) {
        return { 
          isAssigned: true, 
          assignedTo: `tiểu ban "${subCommittee.name}"` 
        };
      }

      // Check group members
      if (subCommittee.groups) {
        for (const group of subCommittee.groups) {
          if (excludeGroupId && group.id === excludeGroupId) {
            continue;
          }

          if (group.members?.some(member => member.userId === userId)) {
            return { 
              isAssigned: true, 
              assignedTo: `nhóm "${group.name}" trong tiểu ban "${subCommittee.name}"` 
            };
          }
        }
      }
    }

    return { isAssigned: false };
  };

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

  const saveSubCommittee = async (formData: any) => {
    try {
      if (selectedSubCommittee) {
        // Edit existing sub-committee
        const updateData: UpdateInventorySubDto = {
          name: formData.name || "",
          leaderId: formData.leaderId || "",
          secretaryId: formData.secretaryId || "",
          memberIds: formData.memberIds || []
        };
        
        await dispatch(updateInventorySubCommittee({ 
          id: selectedSubCommittee.id, 
          subData: updateData 
        })).unwrap();
        
      } else {
        // Create new sub-committee
        const createData: CreateInventorySubDto = {
          name: formData.name || "",
          inventorySessionUnitId: formData.inventorySessionUnitId || "",
          leaderId: formData.leaderId || "",
          secretaryId: formData.secretaryId || "",
          memberIds: formData.memberIds || []
        };
        
        const response = await dispatch(createInventorySubCommittee(createData)).unwrap();
        if(response) {
          console.log('Sub committee created successfully');
          // Reset form data for next creation
          setSelectedSubCommittee(null);
          setIsSubCommitteeModalOpen(false);
        }
      }
      
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra khi lưu tiểu ban');
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


  const saveGroup = async (formData: CreateInventoryGroupDto | UpdateInventoryGroupDto) => {
    if (!currentSubCommittee) return;

    try {
      if (selectedGroup) {
        // Edit existing group
        const updateData: UpdateInventoryGroupDto = {
          name: formData.name,
          leaderId: formData.leaderId,
          secretaryId: formData.secretaryId,
          memberIds: formData.memberIds || [],
          assignments: formData.assignments || []
        };
        
        await dispatch(updateInventoryGroup({ 
          id: selectedGroup.id, 
          groupData: updateData 
        })).unwrap();
        
        console.log('Group updated successfully');
      } else {
        // Create new group
        const createData: CreateInventoryGroupDto = {
          name: formData.name!,
          subInventoryId: currentSubCommittee.id,
          leaderId: formData.leaderId!,
          secretaryId: formData.secretaryId!,
          memberIds: formData.memberIds || [],
          assignments: formData.assignments || []
        };
        
        await dispatch(createInventoryGroup(createData)).unwrap();
        
        // Reset form data for next creation
        setSelectedGroup(null);
      }
      
      setIsGroupModalOpen(false);
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || 'Có lỗi xảy ra khi lưu nhóm');
    }
  };

  // Delete confirmation
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === 'subcommittee') {
        await dispatch(deleteInventorySubCommittee(deleteTarget.item.id)).unwrap();
      } else if (deleteTarget.type === 'group') {
        await dispatch(deleteInventoryGroup(deleteTarget.item.id)).unwrap();
      }

      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra khi xóa');
      console.log(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý tiểu ban và nhóm</h2>
          <p className="text-sm text-gray-600 mt-1">
            Tổng cộng: {subCommittees.length} tiểu ban, {subCommittees.reduce((total, sub) => total + (sub.groups?.length || 0), 0)} nhóm, {getAllAssignedUserIds().length} người được phân công
          </p>
        </div>
        <Button 
          onClick={handleAddSubCommittee}
          className="bg-blue-600 hover:bg-blue-700 shadow-lg"
          disabled={createSubCommitteeLoading || getAvailableSessionUnits().length === 0}
        >
          {createSubCommitteeLoading ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <Plus className="h-5 w-5 mr-2" />
          )}
          Thêm tiểu ban
        </Button>
      </div>

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
              <div className={`p-6 bg-gradient-to-r from-blue-50 to-blue-100 `}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${
                      'bg-blue-200'
                    }`}>
                      <Users className={`h-6 w-6 ${
                        'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{subCommittee.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span>Trạng thái: {subCommittee.status}</span>
                        <span>•</span>
                        <span>{subCommittee.groups?.length || 0} nhóm</span>
                        <span>•</span>
                        <span>{subCommittee.members?.length || 0} thành viên</span>
                        {subCommittee.description && (
                          <>
                            <span>•</span>
                            <span>{subCommittee.description}</span>
                          </>
                        )}
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
                    disabled={createGroupLoading}
                  >
                    {createGroupLoading ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-1" />
                    )}
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
                            <span className="text-gray-500">Trạng thái:</span>
                            <span className="font-medium">{group.status}</span>
                          </div>
                          {group.description && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Mô tả:</span>
                              <span className="font-medium">{group.description}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-500">Phân công:</span>
                            <span className="font-medium">{group.assignments?.length || 0} đơn vị</span>
                          </div>
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
        availableUsers={getAvailableUsersForSubCommittee(selectedSubCommittee?.id)}
        availableSessionUnits={getAvailableSessionUnits()}
        onUserAssignmentCheck={(userId) => isUserAssigned(userId, selectedSubCommittee?.id)}
      />

      {currentSubCommittee && (
        <GroupModal
          isOpen={isGroupModalOpen}
          onClose={() => setIsGroupModalOpen(false)}
          subCommittee={currentSubCommittee}
          group={selectedGroup}
          onSave={saveGroup}
          availableUsers={getAvailableUsersForGroup(currentSubCommittee.id, selectedGroup?.id)}
          availableUnits={getAvailableUnitsForGroups()}
          onUserAssignmentCheck={(userId: string) => isUserAssigned(userId, undefined, selectedGroup?.id)}
        />
      )}


      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                <Button 
                  variant="destructive" 
                  onClick={confirmDelete}
                  disabled={deleteSubCommitteeLoading || deleteGroupLoading}
                >
                  {(deleteSubCommitteeLoading || deleteGroupLoading) ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
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
