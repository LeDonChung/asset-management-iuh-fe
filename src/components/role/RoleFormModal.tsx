"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Shield, Search } from "lucide-react";
import { Role, Permission, ManagerPermission } from "@/types/asset";

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: Role | null;
  managerPermissions: ManagerPermission[];
  onSave: (roleData: any) => void;
  isViewMode?: boolean;
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
  onSave,
  isViewMode = false
}: RoleFormModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    code: "",
    description: ""
  });

  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
  // Simplified UI: no expand/collapse – always show all groups
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
    } else {
      setFormData({
        name: "",
        code: "",
        description: ""
      });
      setSelectedPermissions([]);
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

  // Overall select all helpers
  const allPermissionsFlat: Permission[] = managerPermissions.flatMap(g => g.permissions || []);
  const isAllSelectedOverall = allPermissionsFlat.length > 0 && allPermissionsFlat.every(perm =>
    selectedPermissions.some(sel => sel.id === perm.id)
  );
  const isPartiallySelectedOverall = !isAllSelectedOverall && selectedPermissions.length > 0;
  const toggleSelectAllOverall = () => {
    if (isAllSelectedOverall) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(allPermissionsFlat);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {role ? (isViewMode ? "Xem vai trò" : "Chỉnh sửa vai trò") : "Tạo vai trò mới"}
              </h2>
              <p className="text-sm text-gray-600">
                {role ? (isViewMode ? "Xem thông tin và quyền hạn" : "Cập nhật thông tin và quyền hạn") : "Thiết lập thông tin và quyền hạn"}
              </p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information - left */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên vai trò <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Ví dụ: Quản trị viên"
                    disabled={isViewMode}
                    className={`rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.name ? "border-red-500" : ""} ${isViewMode ? "bg-gray-50" : ""}`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Permission Selection (simplified) - right */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 md:max-h-[520px] md:overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn quyền hạn</h3>

              {/* Global select all */}
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={isAllSelectedOverall}
                  ref={(input) => {
                    if (input) input.indeterminate = isPartiallySelectedOverall;
                  }}
                  onChange={toggleSelectAllOverall}
                  disabled={isViewMode}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="font-medium text-gray-900">Chọn tất cả</span>
                <span className="text-xs text-gray-500">({selectedPermissions.length} đã chọn)</span>
              </div>

              {/* Optional search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm quyền..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isViewMode}
                  className={`pl-10 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${isViewMode ? "bg-gray-50" : ""}`}
                />
              </div>

              {/* Groups with simple lists */}
              <div className="space-y-4">
                {filteredManagerPermissions.map((group) => {
                  const groupPermissions = group.permissions || [];
                  const isAllSelected = isGroupAllSelected(groupPermissions);
                  const isPartiallySelected = isGroupPartiallySelected(groupPermissions);
                  return (
                    <div key={group.id}>
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          ref={(input) => {
                            if (input) input.indeterminate = isPartiallySelected;
                          }}
                          onChange={() => selectAllInGroup(groupPermissions)}
                          disabled={isViewMode}
                          className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                        />
                        <span className="font-medium text-gray-900">{group.name}</span>
                      </div>
                      <div className="pl-6 space-y-2">
                        {groupPermissions.map((permission) => {
                          const isSelected = selectedPermissions.some(p => p.id === permission.id);
                          return (
                            <label key={permission.id} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => togglePermission(permission)}
                                disabled={isViewMode}
                                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                              />
                              <span className="text-sm text-gray-900">{permission.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {errors.permissions && (
                <p className="text-red-500 text-sm mt-3">{errors.permissions}</p>
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {isViewMode ? "Đóng" : "Hủy"}
          </Button>
          {!isViewMode && (
            <Button 
              type="submit" 
            >
              {role ? "Cập nhật" : "Tạo Role"}
            </Button>
          )}
        </ModalFooter>
      </form>
    </Modal>
  );
}
