"use client";

import React, { useState, useEffect } from "react";
import { Search, Copy, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { InventorySession, InventorySessionStatus } from "@/types/asset";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { getSimpleInventorySessions } from "@/lib/store/slices/inventorySlice";

interface CopyInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSession: (session: InventorySession) => void;
}

// Status colors and labels
const statusColors = {
  [InventorySessionStatus.PLANNED]: "bg-blue-100 text-blue-800",
  [InventorySessionStatus.IN_PROGRESS]: "bg-yellow-100 text-yellow-800",
  [InventorySessionStatus.COMPLETED]: "bg-green-100 text-green-800",
  [InventorySessionStatus.CLOSED]: "bg-gray-100 text-gray-800",
};

const statusLabels = {
  [InventorySessionStatus.PLANNED]: "Kế hoạch",
  [InventorySessionStatus.IN_PROGRESS]: "Đang thực hiện",
  [InventorySessionStatus.COMPLETED]: "Hoàn thành",
  [InventorySessionStatus.CLOSED]: "Đã đóng",
};

export const CopyInventoryModal: React.FC<CopyInventoryModalProps> = ({
  isOpen,
  onClose,
  onSelectSession,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSession, setSelectedSession] = useState<InventorySession | null>(null);

  const dispatch = useAppDispatch();
  const { sessions, loading } = useAppSelector((state) => state.inventory);

  useEffect(() => {
    if (isOpen) {
      dispatch(getSimpleInventorySessions());
    }
  }, [isOpen, dispatch]);

  // Filter sessions based on search term
  const filteredSessions = sessions.filter((session) =>
    session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.year.toString().includes(searchTerm)
  );

  const handleSelectSession = () => {
    if (selectedSession) {
      onSelectSession(selectedSession);
      onClose();
      setSelectedSession(null);
      setSearchTerm("");
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedSession(null);
    setSearchTerm("");
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalHeader>
        <div className="flex items-center gap-2">
          <span>Chọn kì kiểm kê để sao chép</span>
        </div>
      </ModalHeader>

      <ModalBody>
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc năm..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Sessions List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-500">Đang tải...</span>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "Không tìm thấy kì kiểm kê phù hợp" : "Chưa có kì kiểm kê nào"}
              </div>
            ) : (
              filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-blue-300 hover:bg-blue-50 ${
                    selectedSession?.id === session.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">{session.name}</h4>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Năm {session.year}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {new Date(session.startDate).toLocaleDateString("vi-VN")} - {" "}
                            {new Date(session.endDate).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </div>
                    </div>
                    {selectedSession?.id === session.id && (
                      <div className="ml-4">
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button
            onClick={handleSelectSession}
            disabled={!selectedSession}
            className="min-w-[120px]"
          >
            <Copy className="h-4 w-4 mr-2" />
            Chọn kì này
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};
