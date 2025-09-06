"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Shield,
  CheckSquare,
  Square,
  Users,
  Settings
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
      title="Chọn vai trò người dùng"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header with search */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-600">
                Đã chọn {selectedCount} / {totalCount} vai trò
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSelectAll}
              className="flex items-center gap-2"
            >
              {selectedCount === totalCount ? (
                <>
                  <Square className="h-4 w-4" />
                  Bỏ chọn tất cả
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4" />
                  Chọn tất cả
                </>
              )}
            </Button>
          </div>

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
        </div>

        {/* Selected roles preview */}
        {selectedCount > 0 && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Vai trò đã chọn ({selectedCount}):
            </h4>
            <div className="flex flex-wrap gap-1">
              {roles
                .filter(role => tempSelectedRoleIds.includes(role.id))
                .map(role => (
                  <Badge 
                    key={role.id} 
                    className="bg-blue-100 text-blue-800 flex items-center gap-1"
                  >
                    {role.name}
                    <button
                      onClick={() => handleRoleToggle(role.id)}
                      className="ml-1 hover:bg-blue-200 rounded"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
            </div>
          </div>
        )}

        {/* Roles list */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredRoles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Không tìm thấy vai trò nào</p>
            </div>
          ) : (
            filteredRoles.map(role => {
              const isSelected = tempSelectedRoleIds.includes(role.id);
              const rolePermissions = role.permissions || [];
              
              return (
                <div
                  key={role.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleRoleToggle(role.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center pt-1">
                      {isSelected ? (
                        <CheckSquare className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                          <Shield className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{role.name}</h3>
                          <p className="text-sm text-gray-500">{role.code}</p>
                        </div>
                      </div>
                      
                      {rolePermissions.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-600">
                            Quyền hạn ({rolePermissions.length}):
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {rolePermissions.slice(0, 3).map(permission => (
                              <Badge 
                                key={permission.id} 
                                variant="outline" 
                                className="text-xs bg-white text-gray-600"
                              >
                                {permission.name}
                              </Badge>
                            ))}
                            {rolePermissions.length > 3 && (
                              <Badge variant="outline" className="text-xs bg-white text-gray-600">
                                +{rolePermissions.length - 3} khác
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            Hủy
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Lưu vai trò ({selectedCount})
          </Button>
        </div>
      </div>
    </Modal>
  );
}
