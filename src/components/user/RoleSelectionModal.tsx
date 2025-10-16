"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  CheckSquare,
  Square
} from "lucide-react";
import { Role, ManagerPermission } from "@/types/asset";

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  roles: Role[];
  selectedRoleIds: string[];
  onSave: (selectedRoleIds: string[]) => void;
  managerPermissions?: ManagerPermission[];
}

export default function RoleSelectionModal({
  isOpen,
  onClose,
  roles,
  selectedRoleIds,
  onSave,
  managerPermissions = []
}: RoleSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tempSelectedRoleIds, setTempSelectedRoleIds] = useState<string[]>(selectedRoleIds);

  React.useEffect(() => {
    setTempSelectedRoleIds(selectedRoleIds);
  }, [selectedRoleIds, isOpen]);

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleToggle = (roleId: string) => {
    setTempSelectedRoleIds(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSelectAll = () => {
    setTempSelectedRoleIds(
      tempSelectedRoleIds.length === filteredRoles.length
        ? []
        : filteredRoles.map(role => role.id)
    );
  };

  const handleSave = () => {
    onSave(tempSelectedRoleIds);
    onClose();
  };

  const handleCancel = () => {
    setTempSelectedRoleIds(selectedRoleIds);
    onClose();
  };

  const selectedCount = tempSelectedRoleIds.length;
  const totalCount = filteredRoles.length;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleCancel} 
      title="Chọn vai trò"
      size="lg"
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm vai trò..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Select All Button */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Đã chọn {selectedCount} / {totalCount} vai trò
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSelectAll}
          >
            {selectedCount === totalCount ? "Bỏ chọn tất cả" : "Chọn tất cả"}
          </Button>
        </div>

        {/* Roles list */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredRoles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Không tìm thấy vai trò nào</p>
            </div>
          ) : (
            filteredRoles.map(role => {
              const isSelected = tempSelectedRoleIds.includes(role.id);
              
              return (
                <div
                  key={role.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => handleRoleToggle(role.id)}
                >
                  {isSelected ? (
                    <CheckSquare className="h-5 w-5 text-gray-400  flex-shrink-0" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                  
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{role.name}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            Hủy
          </Button>
          <Button onClick={handleSave}>
            Lưu
          </Button>
        </div>
      </div>
    </Modal>
  );
}
