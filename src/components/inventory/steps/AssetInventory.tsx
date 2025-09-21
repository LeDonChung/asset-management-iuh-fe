'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  Home,
  Settings,
  Wrench,
  CheckCircle,
  Radio,
  Scan,
  WifiOff,
  AlertTriangle,
  X,
  Eye,
  Trash2,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableColumn } from '@/components/ui/table';
import {
  Asset,
  AssetType,
  InventoryResult,
  InventoryResultStatus,
  Room,
  Unit
} from '@/types/asset';
import { ActionModal, ActionModalData } from '@/components/inventory/modals/ActionModal';

interface AssetInventoryProps {
  selectedUnit: Unit | null;
  selectedRoom: Room | null;
  roomAssets: Asset[];
  inventoryResults: InventoryResult[];
  loading: boolean;
  saving: boolean;
  rfidConnected: boolean;
  scanning: boolean;
  onBackToRoom: () => void;
  connectRfidReader: () => Promise<void>;
  scanRfid: () => Promise<void>;
  updateInventoryResult: (assetId: string, updates: Partial<InventoryResult>) => void;
  saveInventoryResults: () => Promise<void>;
  compareWithSystem: () => void;
  confirmRoom: (roomId: string) => Promise<void>;
  getAssetsByType: (type: AssetType) => Asset[];
  getInventoryResultByAssetId: (assetId: string) => InventoryResult | undefined;
  handleConfirmAssetType: (assetType: AssetType) => Promise<void>;
}

const AssetInventory: React.FC<AssetInventoryProps> = ({
  selectedUnit,
  selectedRoom,
  roomAssets,
  inventoryResults,
  loading,
  saving,
  rfidConnected,
  scanning,
  onBackToRoom,
  connectRfidReader,
  scanRfid,
  updateInventoryResult,
  saveInventoryResults,
  compareWithSystem,
  confirmRoom,
  getAssetsByType,
  getInventoryResultByAssetId,
  handleConfirmAssetType
}) => {
  // Local states
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType>(AssetType.TSCD);
  
  // Exception assets state - for assets scanned from other rooms
  const [exceptionAssets, setExceptionAssets] = useState<Array<{
    asset: Asset;
    isNeighbor: boolean; // true if from neighbor room, false if from distant room
    scannedAt: Date;
  }>>([]);

  // Asset type confirmation state
  const [assetTypeConfirmations, setAssetTypeConfirmations] = useState<{
    [key: string]: {
      TSCD: boolean;
      CCDC: boolean;
    };
  }>({});

  // RFID Device Management State
  const [availableDevices, setAvailableDevices] = useState<Array<{
    id: string;
    name: string;
    type: string;
    status: 'online' | 'offline' | 'busy';
    signal: number; // 0-100
    lastSeen: Date;
  }>>([
    { id: 'rfid-001', name: 'RFID Reader #001', type: 'Handheld', status: 'online', signal: 85, lastSeen: new Date() },
    { id: 'rfid-002', name: 'RFID Reader #002', type: 'Desktop', status: 'offline', signal: 0, lastSeen: new Date(Date.now() - 300000) },
    { id: 'rfid-003', name: 'RFID Scanner Pro', type: 'Handheld', status: 'busy', signal: 92, lastSeen: new Date() },
  ]);

  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [deviceSearchQuery, setDeviceSearchQuery] = useState('');
  const [showDeviceList, setShowDeviceList] = useState(false);

  // Modal states
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    asset: Asset | null;
    actionType: 'LIQUIDATION' | 'REPAIR' | null;
  }>({
    isOpen: false,
    asset: null,
    actionType: null
  });

  // Handle RFID connection
  const handleConnectRfid = async () => {
    try {
      if (selectedDevice) {
        await connectRfidReader();
        // Update device status
        setAvailableDevices(prev => prev.map(device =>
          device.id === selectedDevice
            ? { ...device, status: 'busy' as const }
            : device
        ));
      } else {
        alert('Vui lòng chọn thiết bị RFID trước khi kết nối');
        setShowDeviceList(true);
      }
    } catch (error) {
      console.error('Failed to connect RFID reader:', error);
    }
  };

  // Handle device selection
  const handleSelectDevice = (deviceId: string) => {
    setSelectedDevice(deviceId);
    setShowDeviceList(false);
  };

  // Search devices
  const searchDevices = async () => {
    // Simulate device discovery
    const mockDevices = [
      { id: 'rfid-004', name: 'New RFID Scanner', type: 'Portable', status: 'online' as const, signal: 78, lastSeen: new Date() },
      { id: 'rfid-005', name: 'RFID Station Beta', type: 'Desktop', status: 'online' as const, signal: 95, lastSeen: new Date() },
    ];

    setAvailableDevices(prev => {
      const existing = prev.filter(device => !mockDevices.some(mock => mock.id === device.id));
      return [...existing, ...mockDevices];
    });

    alert('Đã tìm thấy 2 thiết bị mới!');
  };

  // Get filtered devices based on search query
  const getFilteredDevices = () => {
    return availableDevices.filter(device =>
      device.name.toLowerCase().includes(deviceSearchQuery.toLowerCase()) ||
      device.type.toLowerCase().includes(deviceSearchQuery.toLowerCase())
    );
  };

  // Get selected device info
  const getSelectedDeviceInfo = () => {
    return availableDevices.find(device => device.id === selectedDevice);
  };

  // Handle RFID scan
  const handleScanRfid = async () => {
    try {
      await scanRfid();
      // Simulate scanning asset from other room for testing
      // Remove this in production
      simulateScannedAssetFromOtherRoom();
    } catch (error) {
      console.error('Failed to scan RFID:', error);
    }
  };

  // Simulate scanned asset from other room (for testing purposes)
  const simulateScannedAssetFromOtherRoom = () => {
    // Mock assets from other rooms
    const mockExceptionAssets = [
      {
        id: 'exception-1',
        ktCode: 'TS001234',
        name: 'Máy tính Dell OptiPlex',
        specs: 'Intel i5, 8GB RAM, 256GB SSD',
        type: AssetType.TSCD,
        room: { id: 'room-2', name: 'Phòng 102' }, // Neighbor room
        quantity: 1
      },
      {
        id: 'exception-2',
        ktCode: 'CC005678',
        name: 'Bàn làm việc',
        specs: 'Gỗ công nghiệp, 120x60cm',
        type: AssetType.CCDC,
        room: { id: 'room-5', name: 'Phòng 501' }, // Distant room
        quantity: 1
      }
    ];

    // Randomly add one of the mock assets
    const randomAsset = mockExceptionAssets[Math.floor(Math.random() * mockExceptionAssets.length)];
    handleScannedAssetFromOtherRoom(randomAsset as Asset);
  };

  // Handle exception asset when scanned from other room
  const handleScannedAssetFromOtherRoom = (asset: Asset) => {
    // Check if asset is from current room
    if (asset.room?.id === selectedRoom?.id) {
      // Normal processing - asset belongs to current room
      return;
    }

    // Check if asset is from neighbor room (same floor, adjacent rooms)
    const isNeighbor = isNeighborRoom(asset.room, selectedRoom);

    // Add to exception list if not already there
    const exists = exceptionAssets.find(ex => ex.asset.id === asset.id);
    if (!exists) {
      setExceptionAssets(prev => [...prev, {
        asset,
        isNeighbor,
        scannedAt: new Date()
      }]);
    }
  };

  // Check if a room is neighbor to current room
  const isNeighborRoom = (assetRoom: any, currentRoom: Room | null): boolean => {
    if (!assetRoom || !currentRoom) return false;

    // Simple logic: neighbor if same building and same floor
    // You can customize this logic based on your room numbering system
    const currentRoomNum = parseInt(currentRoom.name.replace(/\D/g, ''));
    const assetRoomNum = parseInt(assetRoom.name.replace(/\D/g, ''));

    // Consider neighbor if room numbers are adjacent (±1)
    return Math.abs(currentRoomNum - assetRoomNum) === 1;
  };

  // Remove exception asset (skip)
  const handleSkipExceptionAsset = (assetId: string) => {
    setExceptionAssets(prev => prev.filter(ex => ex.asset.id !== assetId));
  };

  // Handle manual quantity update
  const handleQuantityUpdate = (assetId: string, quantity: number) => {
    updateInventoryResult(assetId, {
      countedQuantity: quantity,
      scanMethod: 'MANUAL' as any
    });
  };

  // Handle action modal
  const handleActionClick = (asset: Asset, actionType: 'LIQUIDATION' | 'REPAIR') => {
    setActionModal({
      isOpen: true,
      asset,
      actionType
    });
  };

  const handleActionConfirm = async (data: ActionModalData) => {
    if (actionModal.asset) {
      updateInventoryResult(actionModal.asset.id, {
        status: data.status,
        note: data.reason
      });
    }
    setActionModal({ isOpen: false, asset: null, actionType: null });
  };

  // Handle room confirmation
  const handleConfirmRoom = async () => {
    if (selectedRoom) {
      try {
        await confirmRoom(selectedRoom.id);
        alert('Đã xác nhận hoàn thành kiểm kê phòng ' + selectedRoom.name);
        // After confirming room, go back to room selection
        onBackToRoom();
      } catch (error) {
        console.error('Failed to confirm room:', error);
      }
    }
  };

  // Get TSCD confirmation status
  const getTSCDConfirmationStatus = (): string => {
    if (!selectedRoom) return 'Chưa xác nhận';
    const roomKey = selectedRoom.id;
    const isConfirmed = assetTypeConfirmations[roomKey]?.TSCD || false;
    return isConfirmed ? 'Đã xác nhận' : 'Chưa xác nhận';
  };

  // Get CCDC confirmation status  
  const getCCDCConfirmationStatus = (): string => {
    if (!selectedRoom) return 'Chưa xác nhận';
    const roomKey = selectedRoom.id;
    const isConfirmed = assetTypeConfirmations[roomKey]?.CCDC || false;
    return isConfirmed ? 'Đã xác nhận' : 'Chưa xác nhận';
  };

  // Check if room can be confirmed (both asset types must be confirmed)
  const canConfirmRoom = (): boolean => {
    if (!selectedRoom) return false;
    const roomKey = selectedRoom.id;
    const confirmations = assetTypeConfirmations[roomKey];

    // Check if we have assets of each type in this room
    const hasTSCD = getAssetsByType(AssetType.TSCD).length > 0;
    const hasCCDC = getAssetsByType(AssetType.CCDC).length > 0;

    // Room can be confirmed if:
    // - TSCD is confirmed (or no TSCD assets exist)
    // - CCDC is confirmed (or no CCDC assets exist)
    const tscdOk = !hasTSCD || (confirmations?.TSCD || false);
    const ccdcOk = !hasCCDC || (confirmations?.CCDC || false);

    return tscdOk && ccdcOk;
  };

  // Get status color
  const getStatusColor = (status: InventoryResultStatus) => {
    switch (status) {
      case InventoryResultStatus.MATCHED: return 'bg-green-100 text-green-800';
      case InventoryResultStatus.MISSING: return 'bg-red-100 text-red-800';
      case InventoryResultStatus.EXCESS: return 'bg-yellow-100 text-yellow-800';
      case InventoryResultStatus.BROKEN: return 'bg-gray-100 text-gray-800';
      case InventoryResultStatus.NEEDS_REPAIR: return 'bg-orange-100 text-orange-800';
      case InventoryResultStatus.LIQUIDATION_PROPOSED: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status text
  const getStatusText = (status: InventoryResultStatus) => {
    switch (status) {
      case InventoryResultStatus.MATCHED: return 'Khớp';
      case InventoryResultStatus.MISSING: return 'Thiếu';
      case InventoryResultStatus.EXCESS: return 'Thừa';
      case InventoryResultStatus.BROKEN: return 'Hư hỏng';
      case InventoryResultStatus.NEEDS_REPAIR: return 'Cần sửa chữa';
      case InventoryResultStatus.LIQUIDATION_PROPOSED: return 'Đề xuất thanh lý';
      default: return 'Chưa xác định';
    }
  };

  // Calculate statistics for selected asset type
  const getAssetTypeStatistics = () => {
    const selectedAssets = getAssetsByType(selectedAssetType);
    const selectedResults = inventoryResults.filter(result =>
      selectedAssets.some(asset => asset.id === result.assetId)
    );

    const total = selectedAssets.length;
    const counted = selectedResults.filter(r => r.countedQuantity > 0).length;
    const matched = selectedResults.filter(r => r.status === InventoryResultStatus.MATCHED).length;
    const missing = selectedResults.filter(r => r.status === InventoryResultStatus.MISSING).length;
    const excess = selectedResults.filter(r => r.status === InventoryResultStatus.EXCESS).length;

    return { total, counted, matched, missing, excess };
  };

  const stats = getAssetTypeStatistics();

  // Rest of the render functions would go here (renderTSCDTable, renderCCDCTable, etc.)
  // Due to length constraints, I'll create separate files for these

  return (
    <div className="space-y-8">
      {/* Navigation Header - Hidden on mobile when in asset inventory */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-6 hidden md:block">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToRoom}
              className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Quay lại</span>
            </button>
            <div className='mx-2 md:mx-8'>
              <h2 className="text-base md:text-lg font-semibold text-gray-900">
                Kiểm kê tài sản - {selectedRoom?.name}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <span>{selectedUnit?.name}</span>
                <ChevronRight className="h-3 w-3" />
                <span className="font-medium">{selectedRoom?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar - Only show on mobile when in asset inventory */}
      <div className="md:hidden bg-white border-b border-gray-200 p-3 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToRoom}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-gray-900 truncate">
              {selectedRoom?.name}
            </h2>
            <p className="text-xs text-gray-500 truncate">{selectedUnit?.name}</p>
          </div>
        </div>
      </div>

      {/* Mobile spacing when fixed header is shown */}
      <div className="md:hidden h-16"></div>

      {/* Room Information Panel */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-100 rounded-lg p-2">
            <Home className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-base md:text-lg font-semibold text-gray-900">Thông tin phòng</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Room Name */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Tên phòng</div>
            <div className="font-semibold text-gray-900">{selectedRoom?.name}</div>
          </div>

          {/* Unit Information */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Đơn vị</div>
            <div className="font-semibold text-gray-900">{selectedUnit?.name}</div>
          </div>

          {/* Asset Count */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Tổng tài sản</div>
            <div className="font-semibold text-gray-900">{roomAssets.length}</div>
          </div>

          {/* Status */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Trạng thái</div>
            <div className="font-semibold text-green-600">Đang kiểm kê</div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
          <div className="text-center">
            <div className="text-emerald-600 text-lg md:text-xl font-bold">{stats.matched}</div>
            <div className="text-xs text-gray-600">Khớp</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
          <div className="text-center">
            <div className="text-red-600 text-lg md:text-xl font-bold">{stats.missing}</div>
            <div className="text-xs text-gray-600">Thiếu</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
          <div className="text-center">
            <div className="text-yellow-600 text-lg md:text-xl font-bold">{stats.excess}</div>
            <div className="text-xs text-gray-600">Thừa</div>
          </div>
        </div>

        <div className="hidden md:block bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
          <div className="text-center">
            <div className="text-blue-600 text-lg md:text-xl font-bold">{stats.counted}</div>
            <div className="text-xs text-gray-600">Đã kiểm</div>
          </div>
        </div>

        <div className="hidden md:block bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
          <div className="text-center">
            <div className="text-purple-600 text-lg md:text-xl font-bold">{stats.total}</div>
            <div className="text-xs text-gray-600">Tổng</div>
          </div>
        </div>
      </div>

      {/* Asset Type Selector */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Loại tài sản</h3>

        {/* Mobile: Select dropdown */}
        <div className="block md:hidden">
          <select
            value={selectedAssetType}
            onChange={(e) => setSelectedAssetType(e.target.value as AssetType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          >
            <option value={AssetType.TSCD}>
              TSCĐ ({getAssetsByType(AssetType.TSCD).length})
            </option>
            <option value={AssetType.CCDC}>
              CCDC ({getAssetsByType(AssetType.CCDC).length})
            </option>
          </select>
        </div>

        {/* Desktop: Card buttons */}
        <div className="hidden md:grid md:grid-cols-2 gap-3">
          <button
            onClick={() => setSelectedAssetType(AssetType.TSCD)}
            className={`text-left rounded-lg p-3 border transition-all ${selectedAssetType === AssetType.TSCD
                ? "border-blue-300 bg-blue-50"
                : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-gray-600" />
              <div>
                <div className="font-medium text-sm">TSCĐ</div>
                <div className="text-xs text-gray-500">{getAssetsByType(AssetType.TSCD).length} tài sản</div>
              </div>
              {selectedAssetType === AssetType.TSCD && (
                <CheckCircle className="h-4 w-4 text-blue-600 ml-auto" />
              )}
            </div>
          </button>

          <button
            onClick={() => setSelectedAssetType(AssetType.CCDC)}
            className={`text-left rounded-lg p-3 border transition-all ${selectedAssetType === AssetType.CCDC
                ? "border-green-300 bg-green-50"
                : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
          >
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-gray-600" />
              <div>
                <div className="font-medium text-sm">CCDC</div>
                <div className="text-xs text-gray-500">{getAssetsByType(AssetType.CCDC).length} tài sản</div>
              </div>
              {selectedAssetType === AssetType.CCDC && (
                <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Action Modal */}
      <ActionModal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false, asset: null, actionType: null })}
        asset={actionModal.asset}
        actionType={actionModal.actionType}
        onConfirm={handleActionConfirm}
      />
    </div>
  );
};

export default AssetInventory;
