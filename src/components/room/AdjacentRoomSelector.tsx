"use client";

import React from "react";
import { Room } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface AdjacentRoomSelectorProps {
  availableRooms: Room[];
  selectedRoomIds: string[];
  onToggleRoom: (roomId: string) => void;
  onRemoveRoom: (roomId: string) => void;
}

const AdjacentRoomSelector: React.FC<AdjacentRoomSelectorProps> = ({
  availableRooms,
  selectedRoomIds,
  onToggleRoom,
  onRemoveRoom
}) => {
  const selectedRooms = availableRooms.filter(room => selectedRoomIds.includes(room.id));
  const unselectedRooms = availableRooms.filter(room => !selectedRoomIds.includes(room.id));

  return (
    <div className="space-y-4">
      {/* Selected rooms */}
      {selectedRooms.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Phòng cạnh bên đã chọn:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedRooms.map(room => (
              <div
                key={room.id}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                <span>{room.name} ({room.building}-{room.floor})</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-blue-200"
                  onClick={() => onRemoveRoom(room.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available rooms */}
      {unselectedRooms.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Chọn phòng cạnh bên:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {unselectedRooms.map(room => (
              <button
                key={room.id}
                type="button"
                className="text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                onClick={() => onToggleRoom(room.id)}
              >
                <div className="font-medium text-sm">{room.name}</div>
                <div className="text-xs text-gray-500">
                  Tòa {room.building}, Tầng {room.floor}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {unselectedRooms.length === 0 && selectedRooms.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          Không có phòng nào khả dụng để chọn làm hàng xóm
        </p>
      )}
    </div>
  );
};

export default AdjacentRoomSelector;
