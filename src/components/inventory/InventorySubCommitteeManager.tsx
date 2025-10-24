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
  Edit,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronRight,
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
import { PermissionConstants, usePermissions } from "@/hooks/usePermissions";

export default function InventorySubCommitteeManager() {
  const dispatch = useAppDispatch();
  const {
    currentSession,
    createSubCommitteeLoading,
    deleteSubCommitteeLoading,
    createGroupLoading,
    deleteGroupLoading,
  } = useAppSelector((state) => state.inventory);

  const { inventoryCommitteeUsers } = useAppSelector((state) => state.user);

  const { allUnits } = useAppSelector((state) => state.unit);
  const { hasAnyPermission } = usePermissions();
  const canEdit = hasAnyPermission([PermissionConstants.PERM_UPDATE_INVENTORY]);
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
            unit: unit.unit, // Include the unit data
          },
        };
        subCommittees.push(subCommitteeWithUnit);
      }
    });

    return subCommittees;
  };

  const [subCommittees, setSubCommittees] = useState<InventorySubCommittee[]>(
    getSubCommittees()
  );

  // Update sub-committees when current session changes
  useEffect(() => {
    const newSubCommittees = getSubCommittees();
    setSubCommittees(newSubCommittees);

    // Auto-select first sub-committee if none selected and sub-committees exist
    if (!activeSubCommittee && newSubCommittees.length > 0) {
      setActiveSubCommittee(newSubCommittees[0]);
    }

    // Clear active sub-committee if it no longer exists
    if (
      activeSubCommittee &&
      !newSubCommittees.find((sub) => sub.id === activeSubCommittee.id)
    ) {
      setActiveSubCommittee(
        newSubCommittees.length > 0 ? newSubCommittees[0] : null
      );
    }
  }, [currentSession]);

  // Load available users for inventory committee
  useEffect(() => {
    if (!inventoryCommitteeUsers || inventoryCommitteeUsers.length === 0) {
      try {
        dispatch(getAllInventoryCommitteeUsers());
      } catch (error: any) {
        console.log(error);
        toast.error(
          error.message ||
            "Có lỗi xảy ra khi lấy danh sách thành viên ban kiểm kê"
        );
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
        toast.error(error.message || "Có lỗi xảy ra khi lấy danh sách đơn vị");
      }
    }
  }, [dispatch, allUnits]);

  // Modal states
  const [isSubCommitteeModalOpen, setIsSubCommitteeModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedSubCommittee, setSelectedSubCommittee] =
    useState<InventorySubCommittee | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<InventoryGroup | null>(
    null
  );
  const [currentSubCommittee, setCurrentSubCommittee] =
    useState<InventorySubCommittee | null>(null);

  // Split layout states
  const [activeSubCommittee, setActiveSubCommittee] =
    useState<InventorySubCommittee | null>(null);

  // Expansion state for the section
  const [isExpanded, setIsExpanded] = useState(true);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "subcommittee" | "group";
    item: any;
  } | null>(null);

  // Helper function to get available session units (units without sub-committees)
  const getAvailableSessionUnits = (): InventorySessionUnit[] => {
    if (!currentSession?.inventorySessionUnits) return [];

    return currentSession.inventorySessionUnits.filter(
      (unit: any) =>
        !unit.subInventory ||
        (selectedSubCommittee &&
          unit.subInventory?.id === selectedSubCommittee.id)
    );
  };

  // Helper function to get available units for group assignments
  const getAvailableUnitsForGroups = (): Unit[] => {
    // Return all units that are not campuses (USER_DEPT and ADMIN_DEPT)
    return allUnits.filter((unit: Unit) => unit.type !== UnitType.CAMPUS);
  };

  // Helper function to get all assigned user IDs across all sub-committees and groups
  const getAllAssignedUserIds = (
    excludeSubCommitteeId?: string,
    excludeGroupId?: string
  ): string[] => {
    const assignedUserIds = new Set<string>();

    subCommittees.forEach((subCommittee) => {
      // Skip the sub-committee being edited
      if (excludeSubCommitteeId && subCommittee.id === excludeSubCommitteeId) {
        return;
      }

      // Add sub-committee members (leaders, secretaries, and members)
      if (subCommittee.members) {
        subCommittee.members.forEach((member) => {
          assignedUserIds.add(member.userId);
        });
      }

      // Add group members from all groups in this sub-committee
      if (subCommittee.groups) {
        subCommittee.groups.forEach((group) => {
          // Skip the group being edited
          if (excludeGroupId && group.id === excludeGroupId) {
            return;
          }

          if (group.members) {
            group.members.forEach((member) => {
              assignedUserIds.add(member.userId);
            });
          }
        });
      }
    });

    return Array.from(assignedUserIds);
  };

  // Helper function to get available users for sub-committee (excluding already assigned users)
  const getAvailableUsersForSubCommittee = (
    excludeSubCommitteeId?: string
  ): User[] => {
    const assignedUserIds = getAllAssignedUserIds(excludeSubCommitteeId);
    return (inventoryCommitteeUsers || []).filter(
      (user) => !assignedUserIds.includes(user.id)
    );
  };

  // Helper function to get available users for group (excluding already assigned users)
  const getAvailableUsersForGroup = (
    subCommitteeId: string,
    excludeGroupId?: string
  ): User[] => {
    const assignedUserIds = getAllAssignedUserIds(undefined, excludeGroupId);
    return (inventoryCommitteeUsers || []).filter(
      (user) => !assignedUserIds.includes(user.id)
    );
  };

  // Helper function to check if a user is already assigned
  const isUserAssigned = (
    userId: string,
    excludeSubCommitteeId?: string,
    excludeGroupId?: string
  ): { isAssigned: boolean; assignedTo?: string } => {
    const assignedUserIds = getAllAssignedUserIds(
      excludeSubCommitteeId,
      excludeGroupId
    );

    if (!assignedUserIds.includes(userId)) {
      return { isAssigned: false };
    }

    // Find where the user is assigned
    for (const subCommittee of subCommittees) {
      if (excludeSubCommitteeId && subCommittee.id === excludeSubCommitteeId) {
        continue;
      }

      // Check sub-committee members
      if (subCommittee.members?.some((member) => member.userId === userId)) {
        return {
          isAssigned: true,
          assignedTo: `tiểu ban "${subCommittee.name}"`,
        };
      }

      // Check group members
      if (subCommittee.groups) {
        for (const group of subCommittee.groups) {
          if (excludeGroupId && group.id === excludeGroupId) {
            continue;
          }

          if (group.members?.some((member) => member.userId === userId)) {
            return {
              isAssigned: true,
              assignedTo: `nhóm "${group.name}" trong tiểu ban "${subCommittee.name}"`,
            };
          }
        }
      }
    }

    return { isAssigned: false };
  };

  // Update active sub-committee when sub-committees change
  useEffect(() => {
    // Auto-select first sub-committee if none selected and sub-committees exist
    if (!activeSubCommittee && subCommittees.length > 0) {
      setActiveSubCommittee(subCommittees[0]);
    }

    // Clear active sub-committee if it no longer exists
    if (
      activeSubCommittee &&
      !subCommittees.find((sub) => sub.id === activeSubCommittee.id)
    ) {
      setActiveSubCommittee(subCommittees.length > 0 ? subCommittees[0] : null);
    }
  }, [subCommittees, activeSubCommittee]);

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
    setDeleteTarget({ type: "subcommittee", item: subCommittee });
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
          memberIds: formData.memberIds || [],
        };

        await dispatch(
          updateInventorySubCommittee({
            id: selectedSubCommittee.id,
            subData: updateData,
          })
        ).unwrap();
      } else {
        // Create new sub-committee
        const createData: CreateInventorySubDto = {
          name: formData.name || "",
          inventorySessionUnitId: formData.inventorySessionUnitId || "",
          leaderId: formData.leaderId || "",
          secretaryId: formData.secretaryId || "",
          memberIds: formData.memberIds || [],
        };

        const response = await dispatch(
          createInventorySubCommittee(createData)
        ).unwrap();
        if (response) {
          console.log("Sub committee created successfully");
          // Reset form data for next creation
          setSelectedSubCommittee(null);
          setIsSubCommitteeModalOpen(false);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi lưu tiểu ban");
    }
  };

  // Group handlers
  const handleAddGroup = (subCommittee: InventorySubCommittee) => {
    setCurrentSubCommittee(subCommittee);
    setSelectedGroup(null);
    setIsGroupModalOpen(true);
  };

  const handleEditGroup = (
    group: InventoryGroup,
    subCommittee: InventorySubCommittee
  ) => {
    setCurrentSubCommittee(subCommittee);
    setSelectedGroup(group);
    setIsGroupModalOpen(true);
  };

  const handleDeleteGroup = (group: InventoryGroup) => {
    setDeleteTarget({ type: "group", item: group });
    setShowDeleteConfirm(true);
  };

  const saveGroup = async (
    formData: CreateInventoryGroupDto | UpdateInventoryGroupDto
  ) => {
    if (!currentSubCommittee) return;

    try {
      if (selectedGroup) {
        // Edit existing group
        const updateData: UpdateInventoryGroupDto = {
          name: formData.name,
          leaderId: formData.leaderId,
          secretaryId: formData.secretaryId,
          memberIds: formData.memberIds || [],
          assignments: formData.assignments || [],
        };

        await dispatch(
          updateInventoryGroup({
            id: selectedGroup.id,
            groupData: updateData,
          })
        ).unwrap();

        console.log("Group updated successfully");
      } else {
        // Create new group
        const createData: CreateInventoryGroupDto = {
          name: formData.name!,
          subInventoryId: currentSubCommittee.id,
          leaderId: formData.leaderId!,
          secretaryId: formData.secretaryId!,
          memberIds: formData.memberIds || [],
          assignments: formData.assignments || [],
        };

        await dispatch(createInventoryGroup(createData)).unwrap();

        // Reset form data for next creation
        setSelectedGroup(null);
      }

      setIsGroupModalOpen(false);
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || "Có lỗi xảy ra khi lưu nhóm");
    }
  };

  // Delete confirmation
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === "subcommittee") {
        await dispatch(
          deleteInventorySubCommittee(deleteTarget.item.id)
        ).unwrap();
      } else if (deleteTarget.type === "group") {
        await dispatch(deleteInventoryGroup(deleteTarget.item.id)).unwrap();
      }

      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi xóa");
      console.log(error);
    }
  };

  // Helper to get initials
  const getInitials = (name: string = "") => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return parts[parts.length - 2][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Calculate total sub-committees for header
  const totalSubCommittees = subCommittees.length;

  return (
    <>
      <Card className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Header Section */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-3 text-left hover:text-blue-600 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-500" />
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Tiểu ban và nhóm kiểm kê</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Tổ chức và phân công nhiệm vụ ({totalSubCommittees} tiểu ban)
              </p>
            </div>
          </button>
          {canEdit && isExpanded && (
            <Button
              onClick={handleAddSubCommittee}
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium shadow-sm"
              disabled={createSubCommitteeLoading || getAvailableSessionUnits().length === 0}
            >
              {createSubCommitteeLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Thêm tiểu ban
            </Button>
          )}
        </div>
      </div>

      {/* Content Section */}
      {isExpanded && (
        <div className="bg-white p-6">
          {subCommittees.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Chưa có tiểu ban nào
              </h3>
              <p className="text-gray-500 mb-6">
                Tạo tiểu ban để tổ chức và phân công nhóm kiểm kê
              </p>
            </div>
          ) : (
            <div className="space-y-6">

          {/* SubCommittees Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {subCommittees.map((subCommittee) => (
              <Card key={subCommittee.id} className="overflow-hidden">
                {/* SubCommittee Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-1">
                        {subCommittee.name}
                      </h3>
                      {subCommittee.inventorySessionUnit?.unit && (
                        <p className="text-sm text-blue-600">
                          {subCommittee.inventorySessionUnit.unit.name}
                        </p>
                      )}
                    </div>
                    {canEdit && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditSubCommittee(subCommittee)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title="Sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubCommittee(subCommittee)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                </div>

                {/* Members Section */}
                {subCommittee.members && subCommittee.members.length > 0 && (
                  <div className="p-4 border-b bg-gray-50">
                    <div className="text-xs font-semibold text-gray-600 mb-3 uppercase">
                      Thành viên tiểu ban
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {subCommittee.members.map((member, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-white p-2 rounded border border-gray-100"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {getInitials(member.user?.fullName || "?")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {member.user?.fullName || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {member.user?.email || "N/A"}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                              member.role === "LEADER"
                                ? "bg-blue-100 text-blue-700"
                                : member.role === "SECRETARY"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {member.role === "LEADER"
                              ? "Trưởng ban"
                              : member.role === "SECRETARY"
                              ? "Thư ký"
                              : "Thành viên"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Groups Section */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-semibold text-gray-600 uppercase">
                      Nhóm kiểm kê ({subCommittee.groups?.length || 0})
                    </div>
                    {canEdit && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddGroup(subCommittee)}
                        disabled={createGroupLoading}
                        className="text-xs"
                      >
                        {createGroupLoading ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Plus className="h-3 w-3 mr-1" />
                        )}
                        Thêm nhóm
                      </Button>
                    )}
                  </div>

                  {!subCommittee.groups || subCommittee.groups.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded">
                      <p className="text-sm text-gray-500">Chưa có nhóm nào</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {subCommittee.groups.map((group) => (
                        <div
                          key={group.id}
                          className="border border-gray-200 rounded-lg p-3 bg-white hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-sm mb-1">
                                {group.name}
                              </h4>
                              <div className="text-xs text-gray-500">
                                {group.members?.length || 0} thành viên • {group.assignments?.length || 0} phân công
                              </div>
                            </div>
                            {canEdit && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleEditGroup(group, subCommittee)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                  title="Sửa"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteGroup(group)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                  title="Xóa"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Group Members */}
                          {group.members && group.members.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <div className="text-xs text-gray-600 mb-2">Thành viên:</div>
                              <div className="flex flex-wrap gap-1">
                                {group.members.map((member, idx) => (
                                  <div
                                    key={idx}
                                    className="inline-flex justify-center items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs"
                                  >
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-[10px] font-semibold">
                                      {getInitials(member.user?.fullName || "?")}
                                    </div>
                                    <span className="text-gray-700 text-center">
                                      {member.user?.fullName || "N/A"}
                                    </span>
                                    <span
                                      className={`px-1 rounded text-[10px] font-medium ${
                                        member.role === "LEADER"
                                          ? "bg-blue-200 text-blue-800"
                                          : member.role === "SECRETARY"
                                          ? "bg-purple-200 text-purple-800"
                                          : "bg-gray-200 text-gray-700"
                                      }`}
                                    >
                                      {member.role === "LEADER" ? "Trưởng nhóm" : member.role === "SECRETARY" ? "Thư ký nhóm" : "Thành viên nhóm"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Assignments */}
                          {group.assignments && group.assignments.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <div className="text-xs text-gray-600 mb-2">Đơn vị phân công:</div>
                              <div className="space-y-1">
                                {group.assignments.map((assignment, idx) => (
                                  <div key={idx} className="bg-blue-50 px-2 py-1.5 rounded text-xs">
                                    <div className="font-medium text-gray-900 truncate">
                                      {assignment.unit?.name || "N/A"}
                                    </div>
                                    {assignment.startDate && assignment.endDate && (
                                      <div className="text-gray-600 mt-0.5">
                                        {new Date(assignment.startDate).toLocaleDateString("vi-VN")} - {new Date(assignment.endDate).toLocaleDateString("vi-VN")}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
            </div>
          )}
        </div>
      )}
      </Card>

      <div>
      {/* Modals */}
      <SubCommitteeModal
        isOpen={isSubCommitteeModalOpen}
        onClose={() => setIsSubCommitteeModalOpen(false)}
        subCommittee={selectedSubCommittee}
        onSave={saveSubCommittee}
        availableUsers={getAvailableUsersForSubCommittee(
          selectedSubCommittee?.id
        )}
        availableSessionUnits={getAvailableSessionUnits()}
        onUserAssignmentCheck={(userId) =>
          isUserAssigned(userId, selectedSubCommittee?.id)
        }
      />

      {currentSubCommittee && (
        <GroupModal
          isOpen={isGroupModalOpen}
          onClose={() => setIsGroupModalOpen(false)}
          subCommittee={currentSubCommittee}
          group={selectedGroup}
          onSave={saveGroup}
          availableUsers={getAvailableUsersForGroup(
            currentSubCommittee.id,
            selectedGroup?.id
          )}
          availableUnits={getAvailableUnitsForGroups()}
          onUserAssignmentCheck={(userId: string) =>
            isUserAssigned(userId, undefined, selectedGroup?.id)
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="mb-4">
                <div className="text-4xl mb-3 text-center">⚠️</div>
                <h3 className="text-lg font-bold text-gray-900 text-center">
                  Xác nhận xóa
                </h3>
              </div>

              <p className="text-gray-600 mb-6 text-center">
                Bạn có chắc muốn xóa{" "}
                {deleteTarget.type === "subcommittee" ? "tiểu ban" : "nhóm"}{" "}
                <span className="font-semibold">
                  "{deleteTarget.item.name}"
                </span>
                ?
                {deleteTarget.type === "subcommittee" && (
                  <span className="block mt-2 text-sm text-red-600">
                    Tất cả nhóm thuộc tiểu ban này cũng sẽ bị xóa.
                  </span>
                )}
              </p>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  disabled={deleteSubCommitteeLoading || deleteGroupLoading}
                  className="flex-1"
                >
                  {deleteSubCommitteeLoading || deleteGroupLoading ? (
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
    </>
  );
}
