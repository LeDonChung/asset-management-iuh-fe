"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Check
} from "lucide-react";
import { Role, Permission, ManagerPermission } from "@/types/asset";

interface RoleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: Role | null;
  managerPermissions: ManagerPermission[];
}

export default function RoleDetailModal({
  isOpen,
  onClose,
  role,
  managerPermissions
}: RoleDetailModalProps) {
  if (!role) return null;

  // Group selected permissions by ManagerPermission
  const selectedPermissionsByGroup = managerPermissions.reduce((acc, group) => {
    const groupPermissions = role.permissions?.filter(selected =>
      group.permissions?.some(perm => perm.id === selected.id)
    ) || [];
    
    if (groupPermissions.length > 0) {
      acc[group.name] = groupPermissions;
    }
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{role.name}</h2>
          </div>
        </div>
      </ModalHeader>

      <ModalBody>
        <div className="space-y-4">
          {/* Permissions by Group */}
          {Object.keys(selectedPermissionsByGroup).length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Role này chưa có quyền nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(selectedPermissionsByGroup).map(([groupName, permissions]) => (
                <div key={groupName} className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    {groupName}
                    <Badge variant="secondary" className="text-xs">
                      {permissions.length} quyền
                    </Badge>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200"
                      >
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-green-800">
                            {permission.name}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ModalBody>

      <ModalFooter>
        <Button onClick={onClose} className="rounded-lg">
          Đóng
        </Button>
      </ModalFooter>
    </Modal>
  );
}
