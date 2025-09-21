'use client';

import React, { useEffect } from 'react';
import { Building2, Calendar, ChevronRight, ArrowLeft } from 'lucide-react';
import { Unit, InventorySession } from '@/types/asset';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { getAssignedInventories, getAssignedMembersInSession, getUnitRooms } from '@/lib/store/slices/inventorySlice';

// Extended Unit interface for this component to include unitCode
interface UnitWithCode extends Unit {
  unitCode: number;
}

// Utility function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Utility function to get assignment status
const getAssignmentStatus = (startDate: string, endDate: string) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now < start) {
    return { status: 'upcoming', label: 'Sắp tới', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
  } else if (now >= start && now <= end) {
    return { status: 'active', label: 'Đang diễn ra', color: 'text-green-600 bg-green-50 border-green-200' };
  } else {
    return { status: 'completed', label: 'Đã hoàn thành', color: 'text-gray-600 bg-gray-50 border-gray-200' };
  }
};

interface UnitAssignment {
  id: string;
  groupId: string;
  unitId: string;
  startDate: string;
  endDate: string;
  note?: string;
  unit: UnitWithCode;
  createdAt: string;
}

interface UnitSelectionProps {
  selectedPeriod: InventorySession;
  onBackToPeriod: () => void;
  onUnitSelect: (unit: Unit) => void;
}

const UnitSelection: React.FC<UnitSelectionProps> = ({
  selectedPeriod,
  onBackToPeriod,
  onUnitSelect
}) => {

  const dispatch = useAppDispatch();
  const { assignedGroups } = useAppSelector(state => state.inventory);

  // Fetch assigned inventories on component mount
  useEffect(() => {
    if (selectedPeriod?.id && selectedPeriod?.inventorySessionUnits?.[0]?.subInventory?.groups?.[0]?.id) {
      dispatch(getAssignedMembersInSession({ 
        sessionId: selectedPeriod.id, 
        groupId: selectedPeriod.inventorySessionUnits[0].subInventory.groups[0].id 
      }));
    }
  }, [dispatch, selectedPeriod]);

  // Handle unit selection with room pre-loading
  const handleUnitSelect = (unit: Unit) => {
    // Pre-load rooms for the selected unit
    dispatch(getUnitRooms(unit.id));
    // Call the original onUnitSelect callback
    onUnitSelect(unit);
  };
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header with back button */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToPeriod}
              className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Quay lại</span>
            </button>
            <div className='mx-2 md:mx-8'>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                Chọn đơn vị kiểm kê
              </h2>
              <p className="text-sm text-gray-600">{selectedPeriod?.name}</p>
            </div>
          </div>
        </div>

        {assignedGroups.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Không có đơn vị nào được phân công cho bạn trong kỳ kiểm kê này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {assignedGroups.map((assignment) => {
              const assignmentStatus = getAssignmentStatus(assignment.startDate, assignment.endDate);
              return (
                <button
                  key={assignment.id}
                  className="text-left rounded-lg border border-gray-200 p-4 md:p-6 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 bg-white"
                  onClick={() => handleUnitSelect(assignment.unit as Unit)}
                >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-base md:text-lg text-gray-900 mb-1">
                      {assignment.unit?.name ?? ''}
                  </h3>
                  <div className="flex items-center gap-2 md:gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <div className="bg-gray-100 rounded p-1">
                        <Calendar className="h-3 w-3" />
                      </div>
                      <span className="text-xs">{formatDate(assignment.startDate)} - {formatDate(assignment.endDate)}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-lg p-2">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitSelection;
