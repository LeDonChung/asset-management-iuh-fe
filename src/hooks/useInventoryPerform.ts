import { useState, useEffect, useCallback } from 'react';
import { 
  InventorySession, 
  InventoryGroupAssignment, 
  InventoryResult, 
  Asset, 
  AssetBook,
  AssetBookItem,
  Room,
  Unit,
  AssetType,
  InventoryResultStatus,
  InventorySessionStatus,
  ScanMethod 
} from '@/types/asset';

// Mock data imports
import { mockAssets } from '@/lib/mockData/assetsNew';
import { mockUnits } from '@/lib/mockData/units';
import { mockRooms } from '@/lib/mockData/rooms';

interface InventoryPerformHookReturn {
  // Current session data
  currentSession: InventorySession | null;
  userAssignments: InventoryGroupAssignment[];
  
  // Selected data
  selectedUnit: Unit | null;
  selectedRoom: Room | null;
  
  // Assets data
  roomAssets: Asset[];
  inventoryResults: InventoryResult[];
  
  // Loading states
  loading: boolean;
  saving: boolean;
  
  // RFID states
  rfidConnected: boolean;
  scanning: boolean;
  
  // Actions
  setSelectedUnit: (unit: Unit | null) => void;
  setSelectedRoom: (room: Room | null) => void;
  connectRfidReader: () => Promise<void>;
  scanRfid: () => Promise<void>;
  updateInventoryResult: (assetId: string, data: Partial<InventoryResult>) => void;
  saveInventoryResults: () => Promise<void>;
  compareWithSystem: () => void;
  confirmRoom: (roomId: string) => Promise<void>;
  confirmUnit: (unitId: string) => Promise<void>;
  
  // Utilities
  getAssetsByType: (type: AssetType) => Asset[];
  getInventoryResultByAssetId: (assetId: string) => InventoryResult | undefined;
}

export const useInventoryPerform = (): InventoryPerformHookReturn => {
  // States
  const [currentSession, setCurrentSession] = useState<InventorySession | null>(null);
  const [userAssignments, setUserAssignments] = useState<InventoryGroupAssignment[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomAssets, setRoomAssets] = useState<Asset[]>([]);
  const [inventoryResults, setInventoryResults] = useState<InventoryResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rfidConnected, setRfidConnected] = useState(false);
  const [scanning, setScanning] = useState(false);

  // Mock current session - in real app, this would come from API
  const mockCurrentSession: InventorySession = {
    id: 'session-2024',
    year: 2024,
    name: 'Kiểm kê cuối năm 2024',
    period: 1,
    isGlobal: true,
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: InventorySessionStatus.IN_PROGRESS,
    createdBy: 'admin',
    createdAt: '2024-12-01T00:00:00.000Z'
  };

  // Mock user assignments - in real app, this would be filtered by current user's group
  const mockUserAssignments: InventoryGroupAssignment[] = [
    {
      id: 'assignment-1',
      groupId: 'group-1',
      unitId: '1',
      startDate: '2024-12-01',
      endDate: '2024-12-15',
      note: 'Kiểm kê khoa Công nghệ thông tin',
      unit: mockUnits.find(u => u.id === '1')
    },
    {
      id: 'assignment-2',
      groupId: 'group-1',
      unitId: '2',
      startDate: '2024-12-01',
      endDate: '2024-12-15',
      note: 'Kiểm kê khoa Cơ khí',
      unit: mockUnits.find(u => u.id === '2')
    }
  ];

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setCurrentSession(mockCurrentSession);
        setUserAssignments(mockUserAssignments);
        
        console.log('Loaded user assignments:', mockUserAssignments);
        console.log('Mock units:', mockUnits);
      } catch (error) {
        console.error('Error loading inventory data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Load room assets when room is selected
  useEffect(() => {
    if (selectedRoom) {
      const assets = mockAssets.filter(asset => 
        asset.currentRoomId === selectedRoom.id
      );
      setRoomAssets(assets);
      
      // Initialize inventory results if not exists
      const existingResults = inventoryResults.filter(result => 
        assets.some(asset => asset.id === result.assetId)
      );
      
      const newResults = assets
        .filter(asset => 
          !existingResults.some(result => result.assetId === asset.id)
        )
        .map(asset => ({
          id: `result-${asset.id}`,
          assignmentId: userAssignments[0]?.id || '',
          assetId: asset.id,
          systemQuantity: asset.quantity,
          countedQuantity: 0,
          status: InventoryResultStatus.MISSING,
          createdAt: new Date().toISOString(),
          asset
        }));
      
      setInventoryResults(prev => {
        // Remove results for assets not in current room
        const filteredResults = prev.filter(result => 
          assets.some(asset => asset.id === result.assetId)
        );
        return [...filteredResults, ...newResults];
      });
    }
  }, [selectedRoom, userAssignments]);

  // Actions
  const connectRfidReader = useCallback(async () => {
    try {
      // Simulate RFID reader connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      setRfidConnected(true);
    } catch (error) {
      console.error('Error connecting RFID reader:', error);
      throw error;
    }
  }, []);

  const scanRfid = useCallback(async () => {
    if (!rfidConnected) {
      throw new Error('RFID reader not connected');
    }

    setScanning(true);
    try {
      // Simulate RFID scan - randomly select an asset with RFID
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const assetsWithRfid = roomAssets.filter(asset => asset.rfidTag);
      if (assetsWithRfid.length > 0) {
        const randomAsset = assetsWithRfid[Math.floor(Math.random() * assetsWithRfid.length)];
        
        // Update inventory result
        updateInventoryResult(randomAsset.id, {
          countedQuantity: randomAsset.quantity,
          scanMethod: ScanMethod.RFID,
          status: InventoryResultStatus.MATCHED
        });
      }
    } catch (error) {
      console.error('Error scanning RFID:', error);
      throw error;
    } finally {
      setScanning(false);
    }
  }, [rfidConnected, roomAssets]);

  const updateInventoryResult = useCallback((assetId: string, data: Partial<InventoryResult>) => {
    setInventoryResults(prev => 
      prev.map(result => 
        result.assetId === assetId 
          ? { ...result, ...data }
          : result
      )
    );
  }, []);

  const saveInventoryResults = useCallback(async () => {
    setSaving(true);
    try {
      // Simulate API call to save results
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Inventory results saved:', inventoryResults);
    } catch (error) {
      console.error('Error saving inventory results:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [inventoryResults]);

  const compareWithSystem = useCallback(() => {
    setInventoryResults(prev => 
      prev.map(result => {
        let status: InventoryResultStatus = InventoryResultStatus.MATCHED;
        
        if (result.countedQuantity < result.systemQuantity) {
          status = InventoryResultStatus.MISSING;
        } else if (result.countedQuantity > result.systemQuantity) {
          status = InventoryResultStatus.EXCESS;
        }
        
        return { ...result, status };
      })
    );
  }, []);

  const confirmRoom = useCallback(async (roomId: string) => {
    try {
      // Simulate API call to confirm room inventory
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`Room ${roomId} inventory confirmed`);
    } catch (error) {
      console.error('Error confirming room inventory:', error);
      throw error;
    }
  }, []);

  const confirmUnit = useCallback(async (unitId: string) => {
    try {
      // Simulate API call to confirm unit inventory
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`Unit ${unitId} inventory confirmed`);
    } catch (error) {
      console.error('Error confirming unit inventory:', error);
      throw error;
    }
  }, []);

  // Utilities
  const getAssetsByType = useCallback((type: AssetType) => {
    return roomAssets.filter(asset => asset.type === type);
  }, [roomAssets]);

  const getInventoryResultByAssetId = useCallback((assetId: string) => {
    return inventoryResults.find(result => result.assetId === assetId);
  }, [inventoryResults]);

  return {
    // Current session data
    currentSession,
    userAssignments,
    
    // Selected data
    selectedUnit,
    selectedRoom,
    
    // Assets data
    roomAssets,
    inventoryResults,
    
    // Loading states
    loading,
    saving,
    
    // RFID states
    rfidConnected,
    scanning,
    
    // Actions
    setSelectedUnit,
    setSelectedRoom,
    connectRfidReader,
    scanRfid,
    updateInventoryResult,
    saveInventoryResults,
    compareWithSystem,
    confirmRoom,
    confirmUnit,
    
    // Utilities
    getAssetsByType,
    getInventoryResultByAssetId
  };
};
