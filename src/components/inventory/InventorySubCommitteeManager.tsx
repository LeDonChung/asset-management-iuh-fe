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

  return (
    <div className="space-y-6 py-6 min-h-0">
      {/* Split Layout Container */}
      {subCommittees.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            Chưa có tiểu ban nào
          </h3>
          <p className="text-gray-500 mb-6">
            Hãy tạo tiểu ban đầu tiên để bắt đầu tổ chức nhóm kiểm kê
          </p>
          <Button
            onClick={handleAddSubCommittee}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Tạo tiểu ban đầu tiên
          </Button>
        </Card>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 min-h-0" >
          {/* Left Panel - SubCommittees List */}
          <div className="w-full lg:w-2/5 xl:w-5/12 min-h-0">
            <Card className="h-full flex flex-col">
              <div className="p-4 lg:p-6 border-b bg-gradient-to-r from-blue-50 via-blue-50 to-indigo-50 border-blue-100 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        Danh sách tiểu ban
                      </h3>
                    </div>
                  </div>
                  <Button
                    onClick={handleAddSubCommittee}
                    size="sm"
                    variant="default"
                    disabled={
                      createSubCommitteeLoading ||
                      getAvailableSessionUnits().length === 0
                    }
                    className="flex-shrink-0"
                  >
                    {createSubCommitteeLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    <span className="hidden sm:inline">Thêm tiểu ban</span>
                    <span className="sm:hidden">Thêm</span>
                  </Button>
                </div>
              </div>
              <div className="p-4 space-y-3 overflow-y-auto flex-1 min-h-0">
                {subCommittees.map((subCommittee) => (
                  <div
                    key={subCommittee.id}
                    onClick={() => setActiveSubCommittee(subCommittee)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      activeSubCommittee?.id === subCommittee.id
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-gray-800 text-base lg:text-lg leading-tight flex-1 pr-2">
                        {subCommittee.name}
                      </h4>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSubCommittee(subCommittee);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSubCommittee(subCommittee);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex justify-between">
                          <span>Số nhóm:</span>
                          <span className="font-medium">
                            {subCommittee.groups?.length || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Thành viên:</span>
                          <span className="font-medium">
                            {subCommittee.members?.length || 0}
                          </span>
                        </div>
                      </div>
                      {subCommittee.inventorySessionUnit?.unit && (
                        <div className="mt-2">
                          <span className="text-gray-500">Đơn vị:</span>
                          <div className="font-medium text-blue-600 break-words">
                            {subCommittee.inventorySessionUnit.unit.name}
                          </div>
                        </div>
                      )}

                      {/* Members List - Collapsible for better space management */}
                      {subCommittee.members &&
                        subCommittee.members.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <div className="text-sm font-medium text-gray-700 mb-3">
                              Danh sách thành viên (
                              {subCommittee.members.length}):
                            </div>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {subCommittee.members.map(
                                (member, memberIndex) => (
                                  <div
                                    key={memberIndex}
                                    className="flex items-center justify-between bg-gray-50 p-2 rounded text-xs"
                                  >
                                    <div className="flex items-center flex-1 min-w-0">
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-800 truncate">
                                          {member.user?.fullName ||
                                            "Tên không có"}
                                        </p>
                                        <p className="text-gray-500 truncate">
                                          {member.user?.email ||
                                            "Email không có"}
                                        </p>
                                      </div>
                                    </div>
                                    <span
                                      className={`ml-2 px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                                        member.role === "LEADER"
                                          ? "bg-blue-100 text-blue-700"
                                          : member.role === "SECRETARY"
                                          ? "bg-purple-100 text-purple-700"
                                          : "bg-gray-100 text-gray-700"
                                      }`}
                                      title={
                                        member.role === "LEADER"
                                          ? "Trưởng nhóm"
                                          : member.role === "SECRETARY"
                                          ? "Thư ký"
                                          : "Thành viên"
                                      }
                                    >
                                      {member.role === "LEADER"
                                        ? "TN"
                                        : member.role === "SECRETARY"
                                        ? "TK"
                                        : "TV"}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Panel - Groups Detail */}
          <div className="w-full lg:w-3/5 xl:w-7/12 min-h-0">
            {activeSubCommittee ? (
              <Card className="h-full flex flex-col">
                {/* SubCommittee Header */}
                <div className="p-4 lg:p-5 bg-gradient-to-r from-blue-50 to-blue-100 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold mb-4">
                      Danh sách nhóm kiểm kê
                    </h4>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleAddGroup(activeSubCommittee)}
                      className="border-dashed"
                      disabled={createGroupLoading}
                    >
                      {createGroupLoading ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-1" />
                      )}
                      <span className="hidden sm:inline">Thêm nhóm</span>
                      <span className="sm:hidden">Thêm</span>
                    </Button>
                  </div>
                </div>

                {/* Groups List */}
                <div className="p-4 lg:p-6 overflow-y-auto flex-1 min-h-0">
                  {!activeSubCommittee.groups ||
                  activeSubCommittee.groups.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 lg:p-8 text-center">
                      <Building className="h-10 lg:h-12 w-10 lg:w-12 text-gray-300 mx-auto mb-3" />
                      <h5 className="text-base lg:text-lg font-medium text-gray-600 mb-2">
                        Chưa có nhóm nào
                      </h5>
                      <p className="text-gray-500 mb-4 text-sm lg:text-base">
                        Hãy thêm nhóm kiểm kê để phân công nhiệm vụ cụ thể
                      </p>
                      <Button
                        size="sm"
                        onClick={() => handleAddGroup(activeSubCommittee)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Thêm nhóm đầu tiên
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeSubCommittee.groups.map((group) => (
                        <Card
                          key={group.id}
                          className="p-4 lg:p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="bg-green-100 p-2 lg:p-3 rounded-full flex-shrink-0">
                                <Building className="h-5 lg:h-6 w-5 lg:w-6 text-green-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h5 className="font-bold text-gray-800 text-base lg:text-lg leading-tight">
                                  {group.name}
                                </h5>
                                <p className="text-sm text-gray-600">
                                  {group.members?.length || 0} thành viên
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleEditGroup(group, activeSubCommittee)
                                }
                                className="text-xs lg:text-sm"
                              >
                                <Edit className="h-3 lg:h-4 w-3 lg:w-4 mr-1" />
                                <span className="hidden sm:inline">Sửa</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteGroup(group)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs lg:text-sm"
                              >
                                <Trash2 className="h-3 lg:h-4 w-3 lg:w-4 mr-1" />
                                <span className="hidden sm:inline">Xóa</span>
                              </Button>
                            </div>
                          </div>

                          {/* Group Details */}
                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
                            {/* Members Section */}
                            <div>
                              <h6 className="font-semibold text-gray-700 mb-3 flex items-center text-sm lg:text-base">
                                <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                                Thành viên nhóm
                              </h6>
                              {group.members && group.members.length > 0 ? (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                  {group.members.map((member, index) => (
                                    <div
                                      key={index}
                                      className="bg-gray-50 p-2 lg:p-3 rounded-lg"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="min-w-0 flex-1">
                                          <p className="font-medium text-gray-800 text-sm truncate">
                                            {member.user?.fullName ||
                                              "Tên không có"}
                                          </p>
                                          <p className="text-xs lg:text-sm text-gray-600 truncate">
                                            {member.user?.email}
                                          </p>
                                        </div>
                                        <span
                                          className={`ml-2 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                                            member.role === "LEADER"
                                              ? "bg-blue-100 text-blue-800"
                                              : member.role === "SECRETARY"
                                              ? "bg-purple-100 text-purple-800"
                                              : "bg-gray-100 text-gray-800"
                                          }`}
                                        >
                                          {member.role === "LEADER"
                                            ? "TN"
                                            : member.role === "SECRETARY"
                                            ? "TK"
                                            : "TV"}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-500 text-sm italic">
                                  Chưa có thành viên nào
                                </p>
                              )}
                            </div>

                            {/* Assignments Section */}
                            <div>
                              <h6 className="font-semibold text-gray-700 mb-3 flex items-center text-sm lg:text-base">
                                <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                                Đơn vị phân công
                              </h6>
                              {group.assignments &&
                              group.assignments.length > 0 ? (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                  {group.assignments.map(
                                    (assignment, index) => (
                                      <div
                                        key={index}
                                        className="bg-blue-50 p-2 lg:p-3 rounded-lg"
                                      >
                                        <p className="font-medium text-gray-800 text-sm break-words">
                                          {assignment.unit?.name ||
                                            "Đơn vị không xác định"}
                                        </p>
                                        <div className="text-xs text-gray-600 mt-1 space-y-1">
                                          {assignment.startDate && (
                                            <p>
                                              Bắt đầu:{" "}
                                              {new Date(
                                                assignment.startDate
                                              ).toLocaleDateString("vi-VN")}
                                            </p>
                                          )}
                                          {assignment.endDate && (
                                            <p>
                                              Kết thúc:{" "}
                                              {new Date(
                                                assignment.endDate
                                              ).toLocaleDateString("vi-VN")}
                                            </p>
                                          )}
                                          {assignment.note && (
                                            <p className="break-words">
                                              {assignment.note}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              ) : (
                                <p className="text-gray-500 text-sm italic">
                                  Chưa có đơn vị nào được phân công
                                </p>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">
                    Chọn tiểu ban
                  </h3>
                  <p className="text-gray-500">
                    Chọn một tiểu ban từ danh sách bên trái để xem chi tiết nhóm
                    kiểm kê
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-3 rounded-full mr-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Xác nhận xóa
                </h3>
              </div>

              <p className="text-gray-600 mb-6">
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

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Hủy
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  disabled={deleteSubCommitteeLoading || deleteGroupLoading}
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
  );
}
