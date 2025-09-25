'use client';

import React, { useEffect, useState } from 'react';
import { MapPin, ArrowLeft, Building, Hash, CheckCircle } from 'lucide-react';
import { Room, Unit, RoomStatus, InventorySession } from '@/types/asset';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { getUnitRooms } from '@/lib/store/slices/inventorySlice';
import { inventoryApi } from '@/lib/api/inventoryApi';

interface RoomSelectionProps {
  selectedUnit: Unit | null;
  selectedPeriod: InventorySession | null;
  assignmentId?: string;
  onRoomSelect: (room: Room) => void;
  onRoomInventoryResults: (roomId: string, results: any[]) => void;
  onBackToUnit: () => void;
}

const RoomSelection: React.FC<RoomSelectionProps> = ({
  selectedUnit,
  assignmentId,
  onRoomSelect,
  onRoomInventoryResults,
  onBackToUnit,
}) => {
  const dispatch = useAppDispatch();
  const { unitRooms, loading } = useAppSelector(state => state.inventory);
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [inventoriedRooms, setInventoriedRooms] = useState<Set<string>>(new Set());

  // Fetch rooms when selectedUnit changes
  useEffect(() => {
    if (selectedUnit?.id) {
      dispatch(getUnitRooms(selectedUnit.id));
    }
  }, [dispatch, selectedUnit?.id]);

  // Fetch room inventory status when assignmentId is available
  useEffect(() => {
    const fetchRoomStatuses = async () => {
      if (assignmentId) {
        try {
          const statuses = await inventoryApi.getRoomsInventoryStatus(assignmentId);
          const inventoriedRoomIds = new Set(
            statuses.filter(item => item.status).map(item => item.roomId)
          );
          setInventoriedRooms(inventoriedRoomIds);
        } catch (error) {
          console.error('Error fetching room statuses:', error);
        }
      }
    };

    fetchRoomStatuses();
  }, [assignmentId]);

  const rooms = Array.isArray(unitRooms) ? unitRooms : [];

  // Get unique floors for filter
  const uniqueFloors = Array.from(new Set(rooms.map(room => room.floor))).sort((a, b) => parseInt(a) - parseInt(b));

  // Handle room click
  const handleRoomClick = async (room: Room) => {
    const isInventoried = inventoriedRooms.has(room.id);
    
    if (isInventoried && assignmentId) {
      // Navigate to results page without loading data first
      // Data will be loaded in the results page
      onRoomInventoryResults(room.id, []);
    } else {
      // Normal room selection for new inventory
      onRoomSelect(room);
    }
  };

  // Filter rooms based on floor
  const filteredRooms = floorFilter === 'all' 
    ? rooms 
    : rooms.filter(room => room.floor === floorFilter);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header with back button */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToUnit}
              className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Quay lại</span>
            </button>
            <div className='mx-2 md:mx-8'>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                Chọn phòng kiểm kê
              </h2>
              <p className="text-sm text-gray-600">{selectedUnit?.name}</p>
            </div>
          </div>
        </div>

        {/* Floor Filter */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm font-medium text-gray-700">Lọc theo tầng:</span>
          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả tầng</option>
            {uniqueFloors.map(floor => (
              <option key={floor} value={floor}>Tầng {floor}</option>
            ))}
          </select>
          <span className="text-sm text-gray-500">
            ({filteredRooms.length} phòng)
          </span>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Đang tải danh sách phòng...</span>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-gray-100 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <MapPin className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">Không có phòng nào</p>
            <p className="text-sm text-gray-400 mt-1">Đơn vị này chưa có phòng được thiết lập</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-gray-100 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <MapPin className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">Không có phòng ở tầng này</p>
            <p className="text-sm text-gray-400 mt-1">Thử chọn tầng khác</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredRooms.map((room) => {
              const isInventoried = inventoriedRooms.has(room.id);
              return (
                <button
                  key={room.id}
                  className={`text-center rounded-lg border p-3 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 ${
                    isInventoried 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-gray-200 bg-white'
                  }`}
                  onClick={() => handleRoomClick(room)}
                >
                  <div className={`rounded-lg w-10 h-10 flex items-center justify-center mx-auto mb-2 ${
                    isInventoried ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {isInventoried ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <MapPin className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                  <div className="font-medium text-sm text-gray-900 mb-1">
                    {room.name || room.roomCode}
                  </div>
                  <div className="text-xs text-gray-500">
                    Tầng {room.floor}
                  </div>
                  {room.building && (
                    <div className="text-xs text-gray-400 mt-1">
                      Tòa {room.building}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomSelection;
