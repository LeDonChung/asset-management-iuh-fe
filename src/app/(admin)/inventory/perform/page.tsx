'use client';

import React, { useState } from 'react';
import { useInventoryPerform } from '@/hooks/useInventoryPerform';
import { ActionModal, ActionModalData } from '@/components/inventory/modals/ActionModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
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
import {
  Wifi,
  WifiOff,
  Scan,
  Save,
  CheckCircle,
  AlertTriangle,
  Wrench,
  Trash2,
  Eye,
  Building2,
  MapPin,
  Radio,
  Search,
  Users,
  Calendar,
  ChevronRight,
  Settings,
  Clock,
  BarChart3,
  ArrowLeft,
  ChevronLeft,
  X,
  Home
} from 'lucide-react';

// Define steps for the inventory process
enum InventoryStep {
  UNIT_SELECTION = 'unit_selection',
  ROOM_SELECTION = 'room_selection',
  ASSET_INVENTORY = 'asset_inventory',
  UNIT_RESULTS = 'unit_results'
}

const InventoryPerformPage: React.FC = () => {
  const {
    currentSession,
    userAssignments,
    selectedUnit,
    selectedRoom,
    roomAssets,
    inventoryResults,
    loading,
    saving,
    rfidConnected,
    scanning,
    setSelectedUnit,
    setSelectedRoom,
    connectRfidReader,
    scanRfid,
    updateInventoryResult,
    saveInventoryResults,
    compareWithSystem,
    confirmRoom,
    confirmUnit,
    getAssetsByType,
    getInventoryResultByAssetId
  } = useInventoryPerform();

  // Add step management state
  const [currentStep, setCurrentStep] = useState<InventoryStep>(InventoryStep.UNIT_SELECTION);

  // Add selected asset type state
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

  // Navigation functions
  const goToRoomSelection = (unit: Unit) => {
    setSelectedUnit(unit);
    setCurrentStep(InventoryStep.ROOM_SELECTION);
  };

  const goToAssetInventory = (room: Room) => {
    setSelectedRoom(room);
    setCurrentStep(InventoryStep.ASSET_INVENTORY);
  };

  const goToUnitResults = () => {
    setCurrentStep(InventoryStep.UNIT_RESULTS);
  };

  const goBackToStep = (step: InventoryStep) => {
    setCurrentStep(step);
  };

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
        // After confirming room, go back to room selection or show unit results
        setCurrentStep(InventoryStep.ROOM_SELECTION);
      } catch (error) {
        console.error('Failed to confirm room:', error);
      }
    }
  };

  // Handle unit confirmation
  const handleConfirmUnit = async () => {
    if (selectedUnit) {
      try {
        await confirmUnit(selectedUnit.id);
        alert('Đã xác nhận hoàn thành kiểm kê đơn vị ' + selectedUnit.name);
        // After confirming unit, go back to unit selection
        setCurrentStep(InventoryStep.UNIT_SELECTION);
        setSelectedUnit(null);
        setSelectedRoom(null);
      } catch (error) {
        console.error('Failed to confirm unit:', error);
      }
    }
  };

  // Handle asset type confirmation
  const handleConfirmAssetType = async (assetType: AssetType) => {
    if (!selectedRoom) return;

    try {
      const roomKey = selectedRoom.id;
      const assetTypeString = assetType === AssetType.TSCD ? 'TSCD' : 'CCDC';

      // Update confirmation state
      setAssetTypeConfirmations(prev => ({
        ...prev,
        [roomKey]: {
          ...prev[roomKey],
          [assetTypeString]: true
        }
      }));

      alert(`Đã xác nhận hoàn thành kiểm kê ${assetTypeString} trong phòng ${selectedRoom.name}`);
    } catch (error) {
      console.error('Failed to confirm asset type:', error);
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

  // Calculate statistics
  const getStatistics = () => {
    const total = inventoryResults.length;
    const counted = inventoryResults.filter(r => r.countedQuantity > 0).length;
    const matched = inventoryResults.filter(r => r.status === InventoryResultStatus.MATCHED).length;
    const missing = inventoryResults.filter(r => r.status === InventoryResultStatus.MISSING).length;
    const excess = inventoryResults.filter(r => r.status === InventoryResultStatus.EXCESS).length;

    return { total, counted, matched, missing, excess };
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

  // Render Unit Selection Step
  const renderUnitSelection = () => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-6">
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <div className="bg-blue-100 rounded-lg p-2">
          <Building2 className="h-5 w-5 text-blue-600" />
        </div>
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">Chọn đơn vị kiểm kê</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {userAssignments.map((assignment) => (
          <button
            key={assignment.id}
            className="text-left rounded-lg border border-gray-200 p-4 md:p-6 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 bg-white"
            onClick={() => assignment.unit && goToRoomSelection(assignment.unit)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-base md:text-lg text-gray-900 mb-1">
                  {assignment.unit?.name}
                </h3>
                <div className="flex items-center gap-2 md:gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <div className="bg-gray-100 rounded p-1">
                      <Calendar className="h-3 w-3" />
                    </div>
                    <span className="text-xs">{assignment.startDate} - {assignment.endDate}</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-2">
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // Render Room Selection Step
  const renderRoomSelection = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => goBackToStep(InventoryStep.UNIT_SELECTION)}
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {[
            { id: 'room-1', name: 'Phòng 101', building: 'A', floor: '1' },
            { id: 'room-2', name: 'Phòng 102', building: 'A', floor: '1' },
            { id: 'room-3', name: 'Phòng 201', building: 'A', floor: '2' },
            { id: 'room-4', name: 'Phòng 202', building: 'A', floor: '2' },
          ].map((room) => (
            <button
              key={room.id}
              className="text-center rounded-lg border border-gray-200 p-3 md:p-4 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 bg-white"
              onClick={() => goToAssetInventory(room as Room)}
            >
              <div className="bg-gray-100 rounded-lg w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mx-auto mb-2 md:mb-3">
                <MapPin className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
              </div>
              <div className="font-medium text-sm text-gray-900 mb-1">
                {room.name}
              </div>
              <div className="text-xs text-gray-500">
                Tòa {room.building} - Tầng {room.floor}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-green-600 rounded-lg p-4 md:p-6 text-white">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h3 className="text-base md:text-lg font-semibold flex items-center gap-2 mb-2">
              <div className="bg-green-500 rounded p-1">
                <BarChart3 className="h-4 w-4" />
              </div>
              Xem kết quả kiểm kê đơn vị
            </h3>
            <p className="text-green-100 text-sm">
              Xem tổng hợp kết quả kiểm kê của tất cả phòng trong đơn vị {selectedUnit?.name}
            </p>
          </div>
          <button
            onClick={() => goToUnitResults()}
            className="flex items-center gap-2 px-4 py-2 bg-white text-green-600 rounded-lg font-medium text-sm transition-colors duration-200 hover:bg-gray-50 w-full sm:w-auto justify-center"
          >
            <Eye className="h-4 w-4" />
            Xem kết quả đơn vị
          </button>
        </div>
      </div>
    </div>
  );

  // Render Unit Results Step
  const renderUnitResults = () => {
    // Sử dụng UnitInventoryResults component
    if (!selectedUnit) {
      return (
        <div className="text-center p-10">
          <h3 className="text-xl font-semibold mb-4">Không có đơn vị được chọn</h3>
          <Button
            onClick={() => goBackToStep(InventoryStep.UNIT_SELECTION)}
          >
            Chọn đơn vị
          </Button>
        </div>
      );
    }

    return (
      <h1>hi</h1>
    );
  };

  // Render Asset Inventory Step
  const renderAssetInventory = () => {
    const stats = getAssetTypeStatistics(); // Use asset type specific stats

    return (
      <div className="space-y-8">
        {/* Navigation Header - Hidden on mobile when in asset inventory */}
        <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-6 ${currentStep === InventoryStep.ASSET_INVENTORY ? 'hidden md:block' : ''
          }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => goBackToStep(InventoryStep.ROOM_SELECTION)}
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
        <div className={`md:hidden bg-white border-b border-gray-200 p-3 fixed top-0 left-0 right-0 z-50 ${currentStep === InventoryStep.ASSET_INVENTORY ? 'block' : 'hidden'
          }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => goBackToStep(InventoryStep.ROOM_SELECTION)}
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
        <div className={`md:hidden ${currentStep === InventoryStep.ASSET_INVENTORY ? 'h-16' : 'h-0'}`}></div>

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

        {selectedAssetType !== AssetType.CCDC && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 md:px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 rounded-lg p-2">
                    <Radio className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">Điều khiển thiết bị RFID</h3>
                    <p className="text-sm text-gray-600 hidden sm:block">Quản lý và điều khiển thiết bị quét RFID</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeviceList(!showDeviceList)}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">{showDeviceList ? 'Ẩn danh sách' : 'Quản lý thiết bị'}</span>
                  <span className="sm:hidden">{showDeviceList ? 'Ẩn' : 'Quản lý'}</span>
                </button>
              </div>
            </div>

            {/* Device Management Panel */}
            {showDeviceList && (
              <div className="border-b border-gray-200 bg-gray-50">
                <div className="p-4 md:p-6">
                  {/* Bluetooth Scan Section */}
                  <div className="mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 rounded-lg p-2">
                          <Radio className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Quét thiết bị Bluetooth</h4>
                          <p className="text-sm text-gray-600 hidden md:block">Tìm kiếm thiết bị RFID/Bluetooth xung quanh</p>
                        </div>
                      </div>
                      <button
                        onClick={searchDevices}
                        disabled={scanning}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto justify-center ${scanning
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                      >
                        <Radio className={`h-4 w-4 ${scanning ? 'animate-spin' : ''}`} />
                        {scanning ? 'Đang quét...' : 'Quét thiết bị'}
                      </button>
                    </div>

                    {/* Scan Status */}
                    {scanning && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-sm font-medium text-blue-800">
                            Đang quét thiết bị Bluetooth/RFID trong vùng lân cận...
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-blue-600">
                          Tìm thấy {getFilteredDevices().length} thiết bị • Thời gian quét: {Math.floor(Math.random() * 5) + 3}s
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Device List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {getFilteredDevices().map((device) => (
                      <div
                        key={device.id}
                        onClick={() => handleSelectDevice(device.id)}
                        className={`p-3 md:p-4 border rounded-lg cursor-pointer transition-all duration-200 ${selectedDevice === device.id
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                          }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${device.status === 'online' ? 'bg-green-500' :
                                device.status === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}></div>
                            <span className="font-medium text-sm text-gray-900 truncate">{device.name}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {getFilteredDevices().length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Radio className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Không tìm thấy thiết bị nào</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Control Panel */}
            <div className="p-4 md:p-6">
              {/* Selected Device Info */}
              {selectedDevice && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 rounded p-1">
                      <Radio className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-blue-900 truncate">
                        {getSelectedDeviceInfo()?.name}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${getSelectedDeviceInfo()?.status === 'online' ? 'bg-green-100 text-green-700' :
                        getSelectedDeviceInfo()?.status === 'busy' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                      {getSelectedDeviceInfo()?.status === 'online' ? 'Sẵn sàng' :
                        getSelectedDeviceInfo()?.status === 'busy' ? 'Đang sử dụng' : 'Ngoại tuyến'}
                    </span>
                  </div>
                </div>
              )}

              {/* Central Action Interface */}
              <div className="flex flex-col items-center space-y-4 md:space-y-6">

                {/* Main Control Button */}
                <div className="relative">
                  {/* Pulsing rings for scanning animation */}
                  {scanning && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-ping"></div>
                      <div className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                    </>
                  )}

                  {/* Main circular button */}
                  <button
                    onClick={!rfidConnected ? handleConnectRfid : handleScanRfid}
                    disabled={!selectedDevice || (!rfidConnected && !selectedDevice)}
                    className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white font-bold text-base md:text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${!selectedDevice
                        ? "bg-gray-400 cursor-not-allowed"
                        : !rfidConnected
                          ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 shadow-lg hover:shadow-xl"
                          : scanning
                            ? "bg-red-600 hover:bg-red-700 focus:ring-red-300 shadow-lg animate-pulse"
                            : "bg-green-600 hover:bg-green-700 focus:ring-green-300 shadow-lg hover:shadow-xl"
                      }`}
                  >
                    {!selectedDevice ? (
                      <AlertTriangle className="h-6 w-6 md:h-8 md:w-8" />
                    ) : !rfidConnected ? (
                      <div className="flex flex-col items-center">
                        <Radio className="h-5 w-5 md:h-6 md:w-6 mb-1" />
                        <span className="text-xs">Kết nối</span>
                      </div>
                    ) : scanning ? (
                      <div className="flex flex-col items-center">
                        <Scan className="h-5 w-5 md:h-6 md:w-6 mb-1 animate-spin" />
                        <span className="text-xs">Dừng</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Scan className="h-5 w-5 md:h-6 md:w-6 mb-1" />
                        <span className="text-xs">Quét</span>
                      </div>
                    )}
                  </button>
                </div>

                {/* Status Text */}
                <div className="text-center">
                  <div className="font-medium text-gray-900 text-sm md:text-base">
                    {!selectedDevice ? "Chưa chọn thiết bị" :
                      !rfidConnected ? "Nhấn để kết nối Bluetooth" :
                        scanning ? "Đang quét RFID..." : "Sẵn sàng quét"}
                  </div>
                  <div className="text-xs md:text-sm text-gray-500 mt-1">
                    {!selectedDevice ? "Vui lòng chọn thiết bị từ danh sách" :
                      !rfidConnected ? `Kết nối với ${getSelectedDeviceInfo()?.name}` :
                        scanning ? "Nhấn để dừng quét" : "Nhấn để bắt đầu quét tài sản"}
                  </div>
                </div>

                {/* Secondary Actions */}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  {/* Bluetooth toggle */}
                  <button
                    onClick={() => {
                      if (rfidConnected) {
                        // Disconnect
                        setAvailableDevices(prev => prev.map(device =>
                          device.id === selectedDevice
                            ? { ...device, status: 'online' as const }
                            : device
                        ));
                        // You would call disconnect function here
                      }
                    }}
                    disabled={!selectedDevice || !rfidConnected}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 justify-center ${!selectedDevice || !rfidConnected
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-600 text-white hover:bg-gray-700"
                      }`}
                  >
                    <WifiOff className="h-4 w-4" />
                    Ngắt kết nối
                  </button>

                  {/* Test button */}
                  <button
                    onClick={simulateScannedAssetFromOtherRoom}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-orange-600 text-white hover:bg-orange-700 transition-colors duration-200 justify-center"
                    title="Test quét tài sản ngoại lệ"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Test ngoại lệ
                  </button>
                </div>
              </div>

              {/* Status Messages */}
              {!selectedDevice && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-700">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium">Chưa chọn thiết bị</span>
                  </div>
                  <p className="text-xs text-yellow-600 mt-1">
                    Vui lòng chọn thiết bị RFID từ danh sách để bắt đầu kết nối.
                  </p>
                </div>
              )}

              {rfidConnected && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium">Đã kết nối thành công</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Thiết bị {getSelectedDeviceInfo()?.name} đã sẵn sàng quét tài sản.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}


        {/* Asset Table - Show only selected type */}
        {roomAssets.length > 0 && (
          <>
            {/* TSCD Assets */}
            {selectedAssetType === AssetType.TSCD && getAssetsByType(AssetType.TSCD).length > 0 && (
              <div className="p-0">
                {renderTSCDTable()}
              </div>
            )}

            {/* CCDC Assets */}
            {selectedAssetType === AssetType.CCDC && getAssetsByType(AssetType.CCDC).length > 0 && (
              <div className="p-0">
                {renderCCDCTable()}
              </div>
            )}

            {/* No assets message for selected type */}
            {((selectedAssetType === AssetType.TSCD && getAssetsByType(AssetType.TSCD).length === 0) ||
              (selectedAssetType === AssetType.CCDC && getAssetsByType(AssetType.CCDC).length === 0)) && (
                <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
                  <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Không có {selectedAssetType === AssetType.TSCD ? 'tài sản cố định' : 'công cụ dụng cụ'}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto text-lg">
                    Phòng {selectedRoom?.name} hiện không có {selectedAssetType === AssetType.TSCD ? 'TSCĐ' : 'CCDC'} nào để kiểm kê.
                    Hãy chọn loại tài sản khác hoặc kiểm tra lại dữ liệu.
                  </p>
                </div>
              )}
          </>
        )}

        {/* Exception Assets Table */}
        {renderExceptionAssetsTable()}

        {/* Asset Type Action Bar */}
        {roomAssets.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-base md:text-lg font-semibold text-gray-900">
                  <div className={`w-3 h-3 rounded-full ${selectedAssetType === AssetType.TSCD ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                  {selectedAssetType === AssetType.TSCD ? 'TSCĐ' : 'CCDC'}: {getAssetsByType(selectedAssetType).length} tài sản
                </div>
                <p className="text-sm md:text-base text-gray-600">
                  Đã kiểm: {getAssetTypeStatistics().counted} |
                  Tổng phòng: {roomAssets.length} tài sản
                </p>
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full lg:w-auto">
                <button
                  onClick={compareWithSystem}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors duration-200 justify-center sm:justify-start"
                >
                  <CheckCircle className="h-4 w-4" />
                  Đối chiếu dữ liệu
                </button>
                <button
                  onClick={saveInventoryResults}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed justify-center sm:justify-start"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Đang lưu...' : 'Lưu tạm'}
                </button>
                <button
                  onClick={() => handleConfirmAssetType(selectedAssetType)}
                  className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors duration-200 justify-center sm:justify-start ${selectedAssetType === AssetType.TSCD
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                  <CheckCircle className="h-4 w-4" />
                  Xác nhận {selectedAssetType === AssetType.TSCD ? 'TSCĐ' : 'CCDC'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Room Confirmation */}
        {roomAssets.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Hoàn thành kiểm kê phòng
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Xác nhận hoàn thành kiểm kê toàn bộ tài sản của phòng {selectedRoom?.name}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${getTSCDConfirmationStatus() === 'Đã xác nhận'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                    }`}>
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    TSCĐ: {getTSCDConfirmationStatus()}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${getCCDCConfirmationStatus() === 'Đã xác nhận'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                    }`}>
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    CCDC: {getCCDCConfirmationStatus()}
                  </span>
                </div>
              </div>
              <button
                onClick={handleConfirmRoom}
                disabled={!canConfirmRoom()}
                className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors duration-200 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
              >
                <CheckCircle className="h-5 w-5" />
                Xác nhận phòng
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {roomAssets.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <div className="bg-gray-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-8">
              <AlertTriangle className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Không có tài sản</h3>
            <p className="text-gray-600 max-w-lg mx-auto text-lg leading-relaxed">
              Phòng {selectedRoom?.name} hiện không có tài sản nào để kiểm kê.
              Vui lòng chọn phòng khác hoặc kiểm tra lại dữ liệu trong hệ thống.
            </p>
            <button
              onClick={() => goBackToStep(InventoryStep.ROOM_SELECTION)}
              className="mt-8 flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 mx-auto"
            >
              <ArrowLeft className="h-5 w-5" />
              Chọn phòng khác
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render mobile asset card
  const renderMobileAssetCard = (asset: Asset, index: number) => {
    const result = getInventoryResultByAssetId(asset.id);

    return (
      <div key={asset.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        {/* Asset Info - Combined Code and Name */}
        <div className="border-b border-gray-100 pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-sm">{asset.ktCode}</h4>
              <p className="text-sm text-gray-700 mt-1">{asset.name}</p>
              <p className="text-xs text-gray-500 mt-1 truncate">{asset.specs}</p>
            </div>
            {result && (
              <Badge className={`${getStatusColor(result.status)} ml-2 flex-shrink-0`}>
                {getStatusText(result.status)}
              </Badge>
            )}
          </div>
        </div>

        {/* Quantity Section */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">SL hệ thống</label>
            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {asset.quantity}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">SL kiểm kê</label>
            <Input
              type="number"
              value={result?.countedQuantity || 0}
              onChange={(e) => handleQuantityUpdate(asset.id, parseInt(e.target.value) || 0)}
              className="w-full text-center text-sm h-8"
              min="0"
            />
          </div>
        </div>

        {/* Actions - Vertical Layout */}
        <div className="space-y-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleActionClick(asset, 'REPAIR')}
            className="w-full text-orange-600 hover:text-orange-700 border-orange-200 hover:border-orange-300 text-xs"
          >
            <Wrench className="h-3 w-3 mr-2" />
            Đề xuất sửa chữa
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleActionClick(asset, 'LIQUIDATION')}
            className="w-full text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 text-xs"
          >
            <Trash2 className="h-3 w-3 mr-2" />
            Đề xuất thanh lý
          </Button>
        </div>
      </div>
    );
  };

  // Render asset table for TSCD
  const renderTSCDTable = () => {
    const tscdAssets = getAssetsByType(AssetType.TSCD);

    const columns: TableColumn<Asset>[] = [
      {
        key: 'assetInfo',
        title: 'Thông tin tài sản',
        width: '280px',
        render: (_, record) => (
          <div>
            <div className="font-medium text-gray-900">{record.ktCode}</div>
            <div className="text-sm text-gray-700 mt-1">{record.name}</div>
            <div className="text-xs text-gray-500 mt-1 truncate">{record.specs}</div>
          </div>
        )
      },
      {
        key: 'quantity',
        title: 'SL hệ thống',
        width: '90px',
        className: 'text-center',
        render: (value) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {value}
          </span>
        )
      },
      {
        key: 'countedQuantity',
        title: 'SL kiểm kê',
        width: '90px',
        className: 'text-center',
        render: (_, record) => {
          const result = getInventoryResultByAssetId(record.id);
          return (
            <Input
              type="number"
              value={result?.countedQuantity || 0}
              onChange={(e) => handleQuantityUpdate(record.id, parseInt(e.target.value) || 0)}
              className="w-20 text-center"
              min="0"
            />
          );
        }
      },
      {
        key: 'status',
        title: 'Trạng thái',
        width: '120px',
        className: 'text-center',
        render: (_, record) => {
          const result = getInventoryResultByAssetId(record.id);
          if (!result) return null;
          return (
            <Badge className={getStatusColor(result.status)}>
              {getStatusText(result.status)}
            </Badge>
          );
        }
      },
      {
        key: 'actions',
        title: 'Hành động',
        width: '180px',
        className: 'text-center',
        render: (_, record) => (
          <div className="flex justify-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleActionClick(record, 'REPAIR')}
              className="text-orange-600 hover:text-orange-700 border-orange-200 hover:border-orange-300"
              title="Đề xuất sửa chữa"
            >
              <Wrench className="h-3 w-3 mr-1" />
              Sửa chữa
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleActionClick(record, 'LIQUIDATION')}
              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              title="Đề xuất thanh lý"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Thanh lý
            </Button>
          </div>
        )
      }
    ];

    return (
      <>
        {/* Mobile view */}
        <div className="md:hidden bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h3 className="text-base font-semibold text-gray-900">
              Danh sách tài sản ({tscdAssets.length})
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {tscdAssets.map((asset, index) => renderMobileAssetCard(asset, index))}
          </div>
        </div>

        {/* Desktop view */}
        <div className="hidden md:block">
          <Table
            columns={columns}
            data={tscdAssets}
            rowKey="id"
            title="Danh sách tài sản"
            className="shadow-sm"
          />
        </div>
      </>
    );
  };

  // Render asset table for CCDC
  const renderCCDCTable = () => {
    const ccdcAssets = getAssetsByType(AssetType.CCDC);

    const columns: TableColumn<Asset>[] = [
      {
        key: 'assetInfo',
        title: 'Thông tin tài sản',
        width: '280px',
        render: (_, record) => (
          <div>
            <div className="font-medium text-gray-900">{record.ktCode}</div>
            <div className="text-sm text-gray-700 mt-1">{record.name}</div>
            <div className="text-xs text-gray-500 mt-1 truncate">{record.specs}</div>
          </div>
        )
      },
      {
        key: 'quantity',
        title: 'SL hệ thống',
        width: '90px',
        className: 'text-center',
        render: (value) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {value}
          </span>
        )
      },
      {
        key: 'countedQuantity',
        title: 'SL kiểm kê',
        width: '90px',
        className: 'text-center',
        render: (_, record) => {
          const result = getInventoryResultByAssetId(record.id);
          return (
            <Input
              type="number"
              value={result?.countedQuantity || 0}
              onChange={(e) => handleQuantityUpdate(record.id, parseInt(e.target.value) || 0)}
              className="w-20 text-center"
              min="0"
            />
          );
        }
      },
      {
        key: 'status',
        title: 'Trạng thái',
        width: '120px',
        className: 'text-center',
        render: (_, record) => {
          const result = getInventoryResultByAssetId(record.id);
          if (!result) return null;
          return (
            <Badge className={getStatusColor(result.status)}>
              {getStatusText(result.status)}
            </Badge>
          );
        }
      },
      {
        key: 'actions',
        title: 'Hành động',
        width: '180px',
        className: 'text-center',
        render: (_, record) => (
          <div className="flex justify-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleActionClick(record, 'REPAIR')}
              className="text-orange-600 hover:text-orange-700 border-orange-200 hover:border-orange-300"
              title="Đề xuất sửa chữa"
            >
              <Wrench className="h-3 w-3 mr-1" />
              Sửa chữa
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleActionClick(record, 'LIQUIDATION')}
              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              title="Đề xuất thanh lý"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Thanh lý
            </Button>
          </div>
        )
      }
    ];

    return (
      <>
        {/* Mobile view */}
        <div className="md:hidden bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h3 className="text-base font-semibold text-gray-900">
              Danh sách tài sản ({ccdcAssets.length})
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {ccdcAssets.map((asset, index) => renderMobileAssetCard(asset, index))}
          </div>
        </div>

        {/* Desktop view */}
        <div className="hidden md:block">
          <Table
            columns={columns}
            data={ccdcAssets}
            rowKey="id"
            title="Danh sách tài sản"
            className="shadow-sm"
          />
        </div>
      </>
    );
  };

  // Render mobile exception asset card
  const renderMobileExceptionAssetCard = (exceptionRecord: typeof exceptionAssets[0], index: number) => {
    return (
      <div key={exceptionRecord.asset.id} className="bg-white border border-orange-200 rounded-lg p-4 space-y-3">
        {/* Asset Info - Combined Code and Name */}
        <div className="border-b border-gray-100 pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-sm">{exceptionRecord.asset.ktCode}</h4>
              <p className="text-sm text-gray-700 mt-1">{exceptionRecord.asset.name}</p>
              <p className="text-xs text-gray-500 mt-1 truncate">{exceptionRecord.asset.specs}</p>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${exceptionRecord.isNeighbor
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
              }`}>
              {exceptionRecord.isNeighbor ? 'Hàng xóm' : 'Khác phòng'}
            </span>
          </div>
        </div>

        {/* Room and Quantity Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Phòng hiện tại</label>
            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {exceptionRecord.asset.room?.name || 'Không xác định'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">SL hệ thống</label>
            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {exceptionRecord.asset.quantity}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">SL kiểm kê</label>
            <div className="text-sm text-gray-600 font-medium">
              1
            </div>
          </div>
        </div>

        {/* Actions - Vertical Layout */}
        <div className="space-y-2 pt-2">
          {exceptionRecord.isNeighbor && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSkipExceptionAsset(exceptionRecord.asset.id)}
              className="w-full text-yellow-600 hover:text-yellow-700 border-yellow-200 hover:border-yellow-300 text-xs"
            >
              <X className="h-3 w-3 mr-2" />
              Bỏ qua tài sản hàng xóm
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              alert(`Tài sản thuộc phòng: ${exceptionRecord.asset.room?.name}. Vui lòng kiểm tra ở phòng đó.`);
            }}
            className="w-full text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 text-xs"
          >
            <Eye className="h-3 w-3 mr-2" />
            Xem chi tiết tài sản
          </Button>
        </div>
      </div>
    );
  };

  // Render Exception Assets Table
  const renderExceptionAssetsTable = () => {
    if (exceptionAssets.length === 0) return null;

    const columns: TableColumn<typeof exceptionAssets[0]>[] = [
      {
        key: 'assetInfo',
        title: 'Thông tin tài sản',
        width: '280px',
        render: (_, record) => (
          <div>
            <div className="font-medium text-gray-900">{record.asset.ktCode}</div>
            <div className="text-sm text-gray-700 mt-1">{record.asset.name}</div>
            <div className="text-xs text-gray-500 mt-1 truncate">{record.asset.specs}</div>
          </div>
        )
      },
      {
        key: 'asset.room',
        title: 'Phòng gốc',
        width: '100px',
        className: 'text-center',
        render: (_, record) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {record.asset.room?.name || 'Không xác định'}
          </span>
        )
      },
      {
        key: 'asset.quantity',
        title: 'SL hệ thống',
        width: '90px',
        className: 'text-center',
        render: (_, record) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {record.asset.quantity}
          </span>
        )
      },
      {
        key: 'countedQuantity',
        title: 'SL kiểm kê',
        width: '90px',
        className: 'text-center',
        render: (_, record) => (
          <span className="text-sm text-gray-600 font-medium">
            1
          </span>
        )
      },
      {
        key: 'isNeighbor',
        title: 'Loại',
        width: '100px',
        className: 'text-center',
        render: (_, record) => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.isNeighbor
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
            }`}>
            {record.isNeighbor ? 'Hàng xóm' : 'Khác phòng'}
          </span>
        )
      },
      {
        key: 'actions',
        title: 'Hành động',
        width: '180px',
        className: 'text-center',
        render: (_, record) => (
          <div className="flex justify-center gap-1">
            {record.isNeighbor && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSkipExceptionAsset(record.asset.id)}
                className="text-yellow-600 hover:text-yellow-700 border-yellow-200 hover:border-yellow-300"
                title="Bỏ qua tài sản hàng xóm"
              >
                <X className="h-3 w-3 mr-1" />
                Bỏ qua
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                alert(`Tài sản thuộc phòng: ${record.asset.room?.name}. Vui lòng kiểm tra ở phòng đó.`);
              }}
              className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
              title="Xem chi tiết"
            >
              <Eye className="h-3 w-3 mr-1" />
              Chi tiết
            </Button>
          </div>
        )
      }
    ];

    return (
      <>
        {/* Mobile view */}
        <div className="md:hidden bg-white border border-orange-200 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-orange-50 px-4 py-3 border-b border-orange-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-orange-900">
                Tài sản ngoại lệ ({exceptionAssets.length})
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setExceptionAssets([])}
                className="text-orange-600 hover:text-orange-700 border-orange-200 text-xs"
              >
                Xóa tất cả
              </Button>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {exceptionAssets.map((exceptionRecord, index) => renderMobileExceptionAssetCard(exceptionRecord, index))}
          </div>
        </div>

        {/* Desktop view */}
        <div className="hidden md:block bg-white border border-orange-200 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-orange-50 px-6 py-4 border-b border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 rounded-lg p-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-orange-900">
                    Tài sản ngoại lệ ({exceptionAssets.length})
                  </h3>
                  <p className="text-sm text-orange-700">Tài sản được quét ở phòng {selectedRoom?.name} nhưng thuộc phòng khác</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setExceptionAssets([])}
                className="text-orange-600 hover:text-orange-700 border-orange-200"
              >
                Xóa tất cả
              </Button>
            </div>
          </div>
          <div className="p-0">
            <Table
              columns={columns}
              data={exceptionAssets}
              rowKey={(record) => record.asset.id}
              className="shadow-sm"
            />
          </div>
        </div>
      </>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải dữ liệu kiểm kê...</p>
        </div>
      </div>
    );
  }

  const stats = getStatistics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section - Hide on mobile when in asset inventory */}
      <div className={`bg-white shadow-sm border-b ${currentStep === InventoryStep.ASSET_INVENTORY ? 'hidden md:block' : ''
        }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                Thực hiện kiểm kê tài sản
              </h1>
              <div className="mt-2 flex items-center gap-2 md:gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs md:text-sm">Kỳ kiểm kê: Kiểm kê cuối năm 2024</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs md:text-sm">Năm 2024</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8 space-y-4 md:space-y-8">

        {/* Step Navigation */}
        {currentStep === InventoryStep.UNIT_SELECTION && renderUnitSelection()}
        {currentStep === InventoryStep.ROOM_SELECTION && renderRoomSelection()}
        {currentStep === InventoryStep.ASSET_INVENTORY && renderAssetInventory()}
        {currentStep === InventoryStep.UNIT_RESULTS && renderUnitResults()}

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

export default InventoryPerformPage;
