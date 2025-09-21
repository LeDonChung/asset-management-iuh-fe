'use client';

import React, { useEffect } from 'react';
import { Calendar, ChevronRight, Clock, Building2, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { getAssignedInventories } from '@/lib/store/slices/inventorySlice';
import { InventorySession, InventorySessionStatus } from '@/types/asset';

interface PeriodSelectionProps {
  selectedPeriod: InventorySession | null;
  onPeriodSelect: (period: InventorySession) => void;
}

const PeriodSelection: React.FC<PeriodSelectionProps> = ({
  selectedPeriod,
  onPeriodSelect
}) => {
  const dispatch = useAppDispatch();
  const { assignedInventories, loading } = useAppSelector(state => state.inventory);

  // Fetch assigned inventories on component mount
  useEffect(() => {
    dispatch(getAssignedInventories());
  }, [dispatch]);

  const getStatusColor = (status: InventorySessionStatus) => {
    switch (status) {
      case InventorySessionStatus.IN_PROGRESS:
        return 'bg-green-100 text-green-800';
      case InventorySessionStatus.COMPLETED:
        return 'bg-gray-100 text-gray-800';
      case InventorySessionStatus.PLANNED:
        return 'bg-blue-100 text-blue-800';
      case InventorySessionStatus.CLOSED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: InventorySessionStatus) => {
    switch (status) {
      case InventorySessionStatus.IN_PROGRESS:
        return 'Đang thực hiện';
      case InventorySessionStatus.COMPLETED:
        return 'Đã hoàn thành';
      case InventorySessionStatus.PLANNED:
        return 'Đã lập kế hoạch';
      case InventorySessionStatus.CLOSED:
        return 'Đã đóng';
      default:
        return 'Không xác định';
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Check if session can be selected
  const canSelectSession = (session: InventorySession) => {
    return session.status === InventorySessionStatus.IN_PROGRESS || 
           session.status === InventorySessionStatus.PLANNED;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-6">
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <div className="bg-blue-100 rounded-lg p-2">
          <Calendar className="h-5 w-5 text-blue-600" />
        </div>
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">Chọn kỳ kiểm kê</h2>
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin text-blue-600 ml-auto" />
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Đang tải danh sách kỳ kiểm kê...</p>
          </div>
        </div>
      ) : assignedInventories.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Không có kỳ kiểm kê nào được phân công
          </h3>
          <p className="text-gray-600">
            Hiện tại bạn chưa được phân công tham gia kỳ kiểm kê nào.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {assignedInventories.map((session) => (
            <button
              key={session.id}
              className={`text-left rounded-lg border p-4 md:p-6 transition-all duration-200 ${
                selectedPeriod?.id === session.id
                  ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-100'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
              } ${!canSelectSession(session) ? 'opacity-75 cursor-not-allowed' : ''}`}
              onClick={() => canSelectSession(session) && onPeriodSelect(session)}
              disabled={!canSelectSession(session)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-base md:text-lg text-gray-900 mb-2">
                    {session.name}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(session.startDate)} - {formatDate(session.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>Năm {session.year}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                    {getStatusText(session.status)}
                  </span>
                  {selectedPeriod?.id === session.id && (
                    <div className="bg-blue-100 rounded-lg p-1">
                      <ChevronRight className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                </div>
              </div>
              
              {session.status === InventorySessionStatus.COMPLETED && (
                <div className="text-xs text-gray-500 italic">
                  Kỳ kiểm kê này đã hoàn thành
                </div>
              )}
              
              {session.status === InventorySessionStatus.PLANNED && (
                <div className="text-xs text-blue-600">
                  Kỳ kiểm kê đã được lập kế hoạch
                </div>
              )}
              
              {session.status === InventorySessionStatus.CLOSED && (
                <div className="text-xs text-red-600">
                  Kỳ kiểm kê đã đóng
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PeriodSelection;
