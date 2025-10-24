"use client";

import React, { useState, useEffect } from "react";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAllInventoryCommitteeUsers } from "@/lib/store/slices/userSlice";
import { getAllUnits } from "@/lib/store/slices/unitSlice";
import InventoryCommitteeManager from "./InventoryCommitteeManager";
import InventorySubCommitteeManager from "./InventorySubCommitteeManager";
import { PermissionConstants, usePermissions } from "@/hooks/usePermissions";

export default function InventoryManagementOverview() {
  const { currentSession } = useAppSelector((state) => state.inventory);
  const { inventoryCommitteeUsers } = useAppSelector((state) => state.user);
  const { allUnits } = useAppSelector((state) => state.unit);
  const dispatch = useAppDispatch();

  const [showCommitteeMemberForm, setShowCommitteeMemberForm] = useState(false);
  const [isCommitteeExpanded, setIsCommitteeExpanded] = useState(true);

  useEffect(() => {
    if (!inventoryCommitteeUsers || inventoryCommitteeUsers.length === 0) {
      dispatch(getAllInventoryCommitteeUsers());
    }
    if (!allUnits || allUnits.length === 0) {
      dispatch(getAllUnits());
    }
  }, [dispatch, inventoryCommitteeUsers, allUnits]);

  const { hasAnyPermission } = usePermissions();
  const canEdit = hasAnyPermission([PermissionConstants.PERM_UPDATE_INVENTORY]);

  const handleAddCommitteeMember = () => {
    setShowCommitteeMemberForm(true);
  };

  const handleCloseCommitteeMemberForm = () => {
    setShowCommitteeMemberForm(false);
  };

  if (!currentSession) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Chưa chọn phiên kiểm kê
          </h3>
          <p className="text-gray-500">
            Vui lòng chọn phiên kiểm kê để bắt đầu quản lý
          </p>
        </div>
      </div>
    );
  }

  const totalMembers = currentSession.members?.length || 0;
  const totalSubCommittees = currentSession.inventorySessionUnits?.filter(
    (unit: any) => unit.subInventory
  ).length || 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 border border-gray-200 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Ban kiểm kê chính</div>
          <div className="text-3xl font-bold text-blue-600">{totalMembers}</div>
          <div className="text-xs text-gray-500 mt-1">thành viên</div>
        </Card>
        <Card className="p-6 border border-gray-200 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Tiểu ban</div>
          <div className="text-3xl font-bold text-green-600">{totalSubCommittees}</div>
          <div className="text-xs text-gray-500 mt-1">tiểu ban</div>
        </Card>
        <Card className="p-6 border border-gray-200 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Phiên kiểm kê</div>
          <div className="text-xl font-semibold text-gray-800 truncate">{currentSession.name}</div>
          <div className="text-xs text-gray-500 mt-1">{currentSession.status}</div>
        </Card>
      </div>

      {/* Main Committee Section */}
      <Card className="border border-gray-300 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsCommitteeExpanded(!isCommitteeExpanded)}
              className="flex items-center gap-3 text-left hover:text-blue-600 transition-colors"
            >
              {isCommitteeExpanded ? (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Ban kiểm kê chính</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Quản lý thành viên ban kiểm kê ({totalMembers} thành viên)
                </p>
              </div>
            </button>
            {canEdit && (
              <Button
                size="sm"
                onClick={handleAddCommitteeMember}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm
              </Button>
            )}
          </div>
        </div>
        {isCommitteeExpanded && (
          <div className="bg-white">
            <InventoryCommitteeManager
              showAddMemberModal={showCommitteeMemberForm}
              onCloseAddMemberModal={handleCloseCommitteeMemberForm}
            />
          </div>
        )}
      </Card>

      {/* Sub-Committees Section */}
      <InventorySubCommitteeManager />
    </div>
  );
}
