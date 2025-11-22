"use client";

import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
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
          <p className="text-gray-500">Chưa chọn phiên kiểm kê</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sub-Committees Section */}
      <InventorySubCommitteeManager />
      
      {/* Main Committee Section */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Ban kiểm kê chính</h2>
            {canEdit && (
              <Button
                size="sm"
                onClick={handleAddCommitteeMember}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm
              </Button>
            )}
          </div>
        </div>
        <div>
          <InventoryCommitteeManager
            showAddMemberModal={showCommitteeMemberForm}
            onCloseAddMemberModal={handleCloseCommitteeMemberForm}
          />
        </div>
      </div>
    </div>
  );
}
