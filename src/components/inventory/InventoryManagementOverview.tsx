"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  UserCheck,
  Building,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronDown,
  ChevronRight,
  Target,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Crown,
  User,
  FileText,
  MapPin,
  Settings,
  Shield,
  Star,
  Activity,
  UserPlus,
  Building2,
  PlusCircle,
  Search,
  Filter
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAllInventoryCommitteeUsers } from "@/lib/store/slices/userSlice";
import { getAllUnits } from "@/lib/store/slices/unitSlice";
import InventoryCommitteeManager from "./InventoryCommitteeManager";
import InventorySubCommitteeManager from "./InventorySubCommitteeManager";
export default function InventoryManagementOverview() {
  const { currentSession } = useAppSelector(state => state.inventory);
  const { inventoryCommitteeUsers } = useAppSelector(state => state.user);
  const { allUnits } = useAppSelector(state => state.unit);
  const dispatch = useAppDispatch();

  // State for expand/collapse
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    committee: true,
    subcommittees: true,
  });

  // State for modals
  const [showCommitteeMemberForm, setShowCommitteeMemberForm] = useState(false);

  // Load data on component mount
  useEffect(() => {
    if (!inventoryCommitteeUsers || inventoryCommitteeUsers.length === 0) {
      dispatch(getAllInventoryCommitteeUsers());
    }
    if (!allUnits || allUnits.length === 0) {
      dispatch(getAllUnits());
    }
  }, [dispatch, inventoryCommitteeUsers, allUnits]);


  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle add new member (open modal in InventoryCommitteeManager)
  const handleAddCommitteeMember = () => {
    setShowCommitteeMemberForm(true);
  };

  const handleCloseCommitteeMemberForm = () => {
    setShowCommitteeMemberForm(false);
  };

  if (!currentSession) {
    return (
      <div className="text-center py-12">
        <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Không có phiên kiểm kê</h3>
        <p className="text-gray-500">Vui lòng chọn phiên kiểm kê để xem thông tin quản lý.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Committee Section */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => toggleSection('committee')}
                className="flex items-center space-x-2 text-lg font-semibold text-gray-900 hover:text-blue-600"
              >
                {expandedSections.committee ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
                <Users className="h-5 w-5 text-blue-600" />
                <span>Ban kiểm kê chính</span>
              </button>
            </div>
            <Button
              size="sm"
              className="flex items-center gap-2"
              onClick={handleAddCommitteeMember}
            >
              <Plus className="h-4 w-4" />
              Thêm thành viên
            </Button>
          </div>
        </div>
        
        {expandedSections.committee && (
            <InventoryCommitteeManager
              showAddMemberModal={showCommitteeMemberForm}
              onCloseAddMemberModal={handleCloseCommitteeMemberForm}
            />
        )}
      </Card>
      {/* Sub-Committees Section */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => toggleSection('subcommittees')}
                className="flex items-center space-x-2 text-lg font-semibold text-gray-900 hover:text-blue-600"
              >
                {expandedSections.subcommittees ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
                <Building2 className="h-5 w-5 text-green-600" />
                <span>Tiểu ban và nhóm kiểm kê</span>
              </button>
            </div>
          </div>
        </div>
        
        {expandedSections.subcommittees && (
            <InventorySubCommitteeManager />
        )}
      </Card>
    </div>
  );
}
