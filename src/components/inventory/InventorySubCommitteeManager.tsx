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
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronRight,
  Users,
  Building2,
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

  // Get groups for selected sub-committee
  const getGroupsForSelectedSubCommittee = (): InventoryGroup[] => {
    if (!activeSubCommittee) return [];
    return activeSubCommittee.groups || [];
  };

  // State for expanded groups in table
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroupExpansion = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  // Helper to get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700';
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'PLANNED':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Helper to get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'Đang thực hiện';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'PLANNED':
        return 'Đã lập kế hoạch';
      default:
        return status || 'Đã lập kế hoạch';
    }
  };

  // Helper to get role text
  const getRoleText = (role: string) => {
    switch (role) {
      case 'LEADER':
        return 'Trưởng nhóm';
      case 'SECRETARY':
        return 'Thư ký';
      case 'MEMBER':
        return 'Thành viên';
      default:
        return role;
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg">
        {/* Header Section */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Tiểu ban và nhóm kiểm kê</h2>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {subCommittees.length === 0 ? (
            <div className="text-center py-8 px-6">
              <p className="text-base text-gray-500">Chưa có tiểu ban nào</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Sub-Committee Selection and Management */}
              <div className="space-y-4">
                <div className="flex items-end justify-between gap-4">
                  <div className="flex-1">
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Chọn tiểu ban
                    </label>
                    <select
                      value={activeSubCommittee?.id || ""}
                      onChange={(e) => {
                        const selected = subCommittees.find(
                          (sub) => sub.id === e.target.value
                        );
                        setActiveSubCommittee(selected || null);
                        // Reset expanded groups when changing sub-committee
                        setExpandedGroups(new Set());
                      }}
                      className="w-full px-3 py-2 text-base border border-gray-300 rounded focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                    >
                      <option value="">-- Chọn tiểu ban --</option>
                      {subCommittees.map((subCommittee) => (
                        <option key={subCommittee.id} value={subCommittee.id}>
                          {subCommittee.name}
                          {subCommittee.inventorySessionUnit?.unit &&
                            ` - ${subCommittee.inventorySessionUnit.unit.name}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  {canEdit && activeSubCommittee && (
                    <div className="flex gap-2">
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => handleEditSubCommittee(activeSubCommittee)}
                        className="whitespace-nowrap"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Sửa 
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Sub-Committee Members Table */}
              {activeSubCommittee && activeSubCommittee.members && activeSubCommittee.members.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Thành viên tiểu ban ({activeSubCommittee.members.length})
                  </h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider w-16">STT</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Họ và tên</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Vai trò</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {activeSubCommittee.members.map((member, index) => (
                            <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-center text-base text-gray-900">
                                {index + 1}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div>
                                    <p className="font-medium text-base text-gray-900">
                                      {member.user?.fullName || "N/A"}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 rounded text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                  {getRoleText(member.role)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-base text-gray-600">
                                {member.user?.email || "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Groups Table with Expandable Rows */}
              {activeSubCommittee ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Danh sách nhóm kiểm kê ({getGroupsForSelectedSubCommittee().length})
                    </h3>
                    {canEdit && (
                      <Button
                        size="sm"
                        onClick={() => handleAddGroup(activeSubCommittee)}
                        disabled={createGroupLoading}
                        variant="outline"
                      >
                        {createGroupLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        Thêm
                      </Button>
                    )}
                  </div>

                  {getGroupsForSelectedSubCommittee().length > 0 ? (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="w-12 px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"></th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Tên nhóm</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Trạng thái</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Thống kê</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">Hành động</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {getGroupsForSelectedSubCommittee().map((group, index) => (
                              <React.Fragment key={group.id}>
                                {/* Main Row */}
                                <tr className="hover:bg-gray-50 transition-colors">
                                  <td className="px-4 py-4">
                                    <button
                                      onClick={() => toggleGroupExpansion(group.id)}
                                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    >
                                      {expandedGroups.has(group.id) ? (
                                        <ChevronDown className="h-5 w-5 text-gray-600" />
                                      ) : (
                                        <ChevronRight className="h-5 w-5 text-gray-600" />
                                      )}
                                    </button>
                                  </td>
                                  <td className="px-4 py-4">
                                    <div>
                                      <div className="font-semibold text-base text-gray-900">{group.name}</div>
                                      {group.description && (
                                        <div className="text-sm text-gray-500 mt-1">{group.description}</div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusBadgeColor(group.status)}`}>
                                      {getStatusText(group.status)}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="flex flex-col gap-1 text-base text-gray-600">
                                      <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        <span>{group.members?.length || 0} thành viên</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Building2 className="h-4 w-4" />
                                        <span>{group.assignments?.length || 0} phân công</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-center">
                                    {canEdit && (
                                      <div className="flex justify-center gap-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleEditGroup(group, activeSubCommittee)}
                                        >
                                          <Edit className="h-4 w-4 mr-1" />
                                          Sửa
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleDeleteGroup(group)}
                                        >
                                          <Trash2 className="h-4 w-4 mr-1" />
                                          Xóa
                                        </Button>
                                      </div>
                                    )}
                                  </td>
                                </tr>

                                {/* Expanded Row */}
                                {expandedGroups.has(group.id) && (
                                  <tr>
                                    <td colSpan={5} className="px-0 py-0">
                                      <div className="bg-gray-50 p-6 border-t border-gray-200">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                          {/* Members Section */}
                                          <div>
                                            <div className="flex items-center gap-2 mb-3">
                                              <Users className="h-5 w-5 text-gray-600" />
                                              <h5 className="text-base font-semibold text-gray-700">
                                                Thành viên nhóm
                                              </h5>
                                            </div>
                                            {group.members && group.members.length > 0 ? (
                                              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                  <thead className="bg-gray-50">
                                                    <tr>
                                                      <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Họ và tên</th>
                                                      <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Vai trò</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody className="bg-white divide-y divide-gray-200">
                                                    {group.members.map((member) => (
                                                      <tr key={member.id} className="hover:bg-gray-50">
                                                        <td className="px-3 py-2">
                                                          <div className="flex items-center gap-2">
                                                            <div>
                                                              <p className="font-medium text-base text-gray-900">
                                                                {member.user?.fullName || "N/A"}
                                                              </p>
                                                              <p className="text-sm text-gray-500">
                                                                {member.user?.email || "N/A"}
                                                              </p>
                                                            </div>
                                                          </div>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                          <span className="px-2 py-1 rounded text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                                            {getRoleText(member.role)}
                                                          </span>
                                                        </td>
                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </table>
                                              </div>
                                            ) : (
                                              <div className="text-center py-6 bg-white rounded-lg border border-gray-200">
                                                <p className="text-base text-gray-500">Chưa có thành viên</p>
                                              </div>
                                            )}
                                          </div>

                                          {/* Assignments Section */}
                                          <div>
                                            <div className="flex items-center gap-2 mb-3">
                                              <Building2 className="h-5 w-5 text-gray-600" />
                                              <h5 className="text-base font-semibold text-gray-700">
                                                Phân công đơn vị
                                              </h5>
                                            </div>
                                            {group.assignments && group.assignments.length > 0 ? (
                                              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                  <thead className="bg-gray-50">
                                                    <tr>
                                                      <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Đơn vị</th>
                                                      <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Thời gian</th>
                                                      <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Ghi chú</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody className="bg-white divide-y divide-gray-200">
                                                    {group.assignments.map((assignment) => (
                                                      <tr key={assignment.id} className="hover:bg-gray-50">
                                                        <td className="px-3 py-2">
                                                          <p className="font-medium text-base text-gray-900">
                                                            {assignment.unit?.name || "N/A"}
                                                          </p>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                          <p className="text-base text-gray-700">
                                                            {assignment.startDate && assignment.endDate
                                                              ? `${new Date(assignment.startDate).toLocaleDateString("vi-VN")} - ${new Date(assignment.endDate).toLocaleDateString("vi-VN")}`
                                                              : "-"}
                                                          </p>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                          
                                                        {assignment.note && (
                                                            <p className="text-sm text-gray-500 mt-1">
                                                              {assignment.note}
                                                            </p>
                                                          )}
                                                        </td>
                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </table>
                                              </div>
                                            ) : (
                                              <div className="text-center py-6 bg-white rounded-lg border border-gray-200">
                                                <p className="text-base text-gray-500">Chưa có phân công</p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-gray-200 rounded-lg">
                      <p className="text-base text-gray-500">Chưa có nhóm kiểm kê nào</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 border border-gray-200 rounded-lg">
                  <p className="text-base text-gray-500">Vui lòng chọn tiểu ban để xem danh sách nhóm kiểm kê</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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
                <h3 className="text-xl font-bold text-gray-900 text-center">
                  Xác nhận xóa
                </h3>
              </div>

              <p className="text-base text-gray-600 mb-6 text-center">
                Bạn có chắc muốn xóa{" "}
                {deleteTarget.type === "subcommittee" ? "tiểu ban" : "nhóm"}{" "}
                <span className="font-semibold">
                  "{deleteTarget.item.name}"
                </span>
                ?
                {deleteTarget.type === "subcommittee" && (
                  <span className="block mt-2 text-base text-red-600">
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
