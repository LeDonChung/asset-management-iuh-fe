'use client';

import React from 'react';
import { ArrowLeft, Building2, CheckCircle, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Unit, InventorySession } from '@/types/asset';

interface UnitResultsProps {
  selectedUnit: Unit | null;
  selectedPeriod: InventorySession | null;
  onBackToRoom: () => void;
  confirmUnit: (unitId: string) => Promise<void>;
}

const UnitResults: React.FC<UnitResultsProps> = ({
  selectedUnit,
  selectedPeriod,
  onBackToRoom,
  confirmUnit
}) => {
  // Handle unit confirmation
  const handleConfirmUnit = async () => {
    if (selectedUnit) {
      try {
        await confirmUnit(selectedUnit.id);
        alert('Đã xác nhận hoàn thành kiểm kê đơn vị ' + selectedUnit.name);
        // After confirming unit, go back to room selection
        onBackToRoom();
      } catch (error) {
        console.error('Failed to confirm unit:', error);
      }
    }
  };

  if (!selectedUnit) {
    return (
      <div className="text-center p-10">
        <h3 className="text-xl font-semibold mb-4">Không có đơn vị được chọn</h3>
        <Button onClick={onBackToRoom}>
          Chọn đơn vị
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToRoom}
              className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Quay lại</span>
            </button>
            <div className='mx-2 md:mx-8'>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                Kết quả kiểm kê đơn vị
              </h2>
              <p className="text-sm text-gray-600">{selectedUnit.name}</p>
            </div>
          </div>
        </div>

        {/* Unit Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 rounded-lg p-2">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">Thông tin đơn vị</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Tên đơn vị</div>
              <div className="font-semibold text-gray-900">{selectedUnit.name}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Kỳ kiểm kê</div>
              <div className="font-semibold text-gray-900">{selectedPeriod?.name}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Trạng thái</div>
              <div className="font-semibold text-green-600">Đang thực hiện</div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-green-100 rounded-lg p-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">Tổng quan kết quả</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">4</div>
            <div className="text-sm text-blue-700">Phòng đã kiểm</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">156</div>
            <div className="text-sm text-green-700">Tài sản khớp</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">3</div>
            <div className="text-sm text-red-700">Tài sản thiếu</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">2</div>
            <div className="text-sm text-yellow-700">Tài sản thừa</div>
          </div>
        </div>
      </div>

      {/* Room Results */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 md:px-6 py-4 border-b bg-gray-50">
          <h3 className="text-base font-semibold text-gray-900">Kết quả theo phòng</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {[
            { room: 'Phòng 101', total: 45, checked: 45, matched: 42, missing: 1, excess: 2, status: 'completed' },
            { room: 'Phòng 102', total: 38, checked: 38, matched: 37, missing: 1, excess: 0, status: 'completed' },
            { room: 'Phòng 201', total: 52, checked: 52, matched: 51, missing: 1, excess: 0, status: 'completed' },
            { room: 'Phòng 202', total: 26, checked: 22, matched: 22, missing: 0, excess: 0, status: 'in_progress' },
          ].map((roomResult, index) => (
            <div key={index} className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-gray-900">{roomResult.room}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      roomResult.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {roomResult.status === 'completed' ? 'Hoàn thành' : 'Đang thực hiện'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Tổng</div>
                      <div className="font-medium">{roomResult.total}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Đã kiểm</div>
                      <div className="font-medium">{roomResult.checked}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Khớp</div>
                      <div className="font-medium text-green-600">{roomResult.matched}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Thiếu</div>
                      <div className="font-medium text-red-600">{roomResult.missing}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Thừa</div>
                      <div className="font-medium text-yellow-600">{roomResult.excess}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(roomResult.checked / roomResult.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {Math.round((roomResult.checked / roomResult.total) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unit Confirmation */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Hoàn thành kiểm kê đơn vị
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Xác nhận hoàn thành kiểm kê toàn bộ tài sản của đơn vị {selectedUnit.name}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                4/4 phòng đã hoàn thành
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                161/161 tài sản đã kiểm
              </span>
            </div>
          </div>
          <button
            onClick={handleConfirmUnit}
            className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 w-full sm:w-auto justify-center"
          >
            <CheckCircle className="h-5 w-5" />
            Xác nhận đơn vị
          </button>
        </div>
      </div>

      {/* Period Info */}
      {selectedPeriod && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded p-1">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-blue-900 text-sm">
                {selectedPeriod.name}
              </div>
              <div className="text-xs text-blue-700 mt-1">
                {new Date(selectedPeriod.startDate).toLocaleDateString('vi-VN')} - {new Date(selectedPeriod.endDate).toLocaleDateString('vi-VN')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitResults;
