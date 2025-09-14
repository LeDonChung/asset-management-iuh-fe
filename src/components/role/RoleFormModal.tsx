"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronRight,
  X,
  Shield,
  Users,
  Check,
  Search
} from "lucide-react";
import { Role, Permission, ManagerPermission } from "@/types/asset";

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: Role | null;
  managerPermissions: ManagerPermission[];
  onSave: (roleData: any) => void;
}

interface FormData {
  name: string;
  code: string;
  description?: string;
}

export default function RoleFormModal({
  isOpen,
  onClose,
  role,
  managerPermissions,
  onSave
}: RoleFormModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    code: "",
    description: ""
  });

  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when modal opens or role changes
  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        code: role.code,
        description: role.code // assuming description is derived from code for now
      });
      setSelectedPermissions(role.permissions || []);
      // Expand groups that have selected permissions
      const groupsWithSelected = new Set<string>();
      managerPermissions.forEach(group => {
        const hasSelected = group.permissions?.some(perm => 
          role.permissions?.some(selected => selected.id === perm.id)
        );
        if (hasSelected) {
          groupsWithSelected.add(group.id);
        }
      });
      setExpandedGroups(groupsWithSelected);
    } else {
      setFormData({
        name: "",
        code: "",
        description: ""
      });
      setSelectedPermissions([]);
      setExpandedGroups(new Set());
    }
    setErrors({});
    setSearchTerm("");
  }, [role, managerPermissions, isOpen]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-generate code from name
    if (field === 'name' && !role) {
      const generatedCode = value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '') // Keep only alphanumeric and spaces
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .substring(0, 20); // Limit length
      
      setFormData(prev => ({
        ...prev,
        code: generatedCode
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên role là bắt buộc";
    }


    if (selectedPermissions.length === 0) {
      newErrors.permissions = "Phải chọn ít nhất một quyền";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSave({
      ...formData,
      permissions: selectedPermissions
    });
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const togglePermission = (permission: Permission) => {
    setSelectedPermissions(prev => {
      const isSelected = prev.some(p => p.id === permission.id);
      if (isSelected) {
        return prev.filter(p => p.id !== permission.id);
      } else {
        return [...prev, permission];
      }
    });
  };

  const selectAllInGroup = (groupPermissions: Permission[]) => {
    const allSelected = groupPermissions.every(perm =>
      selectedPermissions.some(selected => selected.id === perm.id)
    );

    if (allSelected) {
      // Deselect all in group
      setSelectedPermissions(prev =>
        prev.filter(selected =>
          !groupPermissions.some(perm => perm.id === selected.id)
        )
      );
    } else {
      // Select all in group
      setSelectedPermissions(prev => {
        const newPermissions = [...prev];
        groupPermissions.forEach(perm => {
          if (!newPermissions.some(selected => selected.id === perm.id)) {
            newPermissions.push(perm);
          }
        });
        return newPermissions;
      });
    }
  };

  const isGroupAllSelected = (groupPermissions: Permission[]) => {
    return groupPermissions.length > 0 && groupPermissions.every(perm =>
      selectedPermissions.some(selected => selected.id === perm.id)
    );
  };

  const isGroupPartiallySelected = (groupPermissions: Permission[]) => {
    const selectedCount = groupPermissions.filter(perm =>
      selectedPermissions.some(selected => selected.id === perm.id)
    ).length;
    return selectedCount > 0 && selectedCount < groupPermissions.length;
  };

  const removePermission = (permissionId: string) => {
    setSelectedPermissions(prev => prev.filter(p => p.id !== permissionId));
  };

  // Filter permissions based on search term
  const filteredManagerPermissions = managerPermissions.map(group => ({
    ...group,
    permissions: group.permissions?.filter(perm =>
      perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perm.code.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []
  })).filter(group => group.permissions.length > 0 || searchTerm === "");

  const selectedPermissionsByGroup = managerPermissions.reduce((acc, group) => {
    const groupPermissions = selectedPermissions.filter(selected =>
      group.permissions?.some(perm => perm.id === selected.id)
    );
    if (groupPermissions.length > 0) {
      acc[group.name] = groupPermissions;
    }
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {role ? "Chỉnh sửa vai trò" : "Tạo vai trò mới"}
              </h2>
              <p className="text-sm text-gray-600">
                {role ? "Cập nhật thông tin và quyền hạn" : "Thiết lập thông tin và quyền hạn"}
              </p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên vai trò <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Ví dụ: Quản trị viên"
                    className={`rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.name ? "border-red-500" : ""}`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

              </div>
            </div>

            {/* Permission Selection */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Chọn quyền hạn</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-full">
                    {selectedPermissions.length} đã chọn
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Panel - Permission Groups */}
                <div>
                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Tìm kiếm quyền..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Permission Groups */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredManagerPermissions.map((group) => {
                      const isExpanded = expandedGroups.has(group.id);
                      const groupPermissions = group.permissions || [];
                      const isAllSelected = isGroupAllSelected(groupPermissions);
                      const isPartiallySelected = isGroupPartiallySelected(groupPermissions);

                      return (
                        <div key={group.id} className="border border-gray-200 rounded-xl overflow-hidden">
                          <div
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleGroup(group.id)}
                          >
                            <div className="flex items-center gap-3">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-gray-600" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-600" />
                              )}
                              <span className="font-medium text-gray-900">{group.name}</span>
                              <Badge variant="outline" className="text-xs rounded-full">
                                {groupPermissions.length}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isAllSelected}
                                ref={(input) => {
                                  if (input) input.indeterminate = isPartiallySelected;
                                }}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  selectAllInGroup(groupPermissions);
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-xs text-gray-500">Tất cả</span>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="border-t bg-gray-50 p-3 space-y-2">
                              {groupPermissions.map((permission) => {
                                const isSelected = selectedPermissions.some(p => p.id === permission.id);
                                return (
                                  <div
                                    key={permission.id}
                                    className="flex items-center gap-3 p-3 hover:bg-white rounded-lg cursor-pointer transition-colors"
                                    onClick={() => togglePermission(permission)}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => togglePermission(permission)}
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                                      <div className="text-xs text-gray-500">{permission.code}</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {errors.permissions && (
                    <p className="text-red-500 text-sm mt-3">{errors.permissions}</p>
                  )}
                </div>

                {/* Right Panel - Selected Permissions Preview */}
                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-4">Quyền đã chọn</h4>

                  <div className="border border-gray-200 rounded-xl p-4 max-h-96 overflow-y-auto bg-gray-50">
                    {Object.keys(selectedPermissionsByGroup).length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">Chưa chọn quyền nào</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(selectedPermissionsByGroup).map(([groupName, permissions]) => (
                          <div key={groupName}>
                            <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                              {groupName}
                              <Badge variant="outline" className="text-xs rounded-full">
                                {permissions.length}
                              </Badge>
                            </h5>
                            <div className="space-y-1">
                              {permissions.map((permission) => (
                                <div
                                  key={permission.id}
                                  className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-200 text-sm"
                                >
                                  <span className="font-medium text-gray-900">{permission.name}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removePermission(permission.id)}
                                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="bg-gray-50">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
            Hủy
          </Button>
          <Button 
            type="submit" 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl"
          >
            {role ? "Cập nhật" : "Tạo Role"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
