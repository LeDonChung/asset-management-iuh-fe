"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { getAssetBookInventoryFromUnitIdAndRoomId } from "@/lib/store/slices/assetBookSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableColumn } from "@/components/ui/table";
import {
  Asset,
  AssetType,
  AssetBook,
  AssetBookItem,
  AssetBookItemStatus,
  Room,
  Unit,
  InventorySession,
  AssetTypeResponse,
} from "@/types/asset";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Radio,
  Search,
  Users,
  Calendar,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Settings,
  Clock,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Wrench,
  Trash2,
  Eye,
  Save,
  Scan,
  WifiOff,
  Home,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { getRoomById } from "@/lib/store/slices/unitSlice";
import {
  ActionModal,
  ActionModalData,
} from "@/components/inventory/modals/ActionModal";
import { inventoryApi, SaveTempInventoryRequest, AssetActionStatus, AssetInventoryDetail, SubmitInventoryResultRequest, ScanMethod } from "@/lib/api/inventoryApi";
import { submitInventoryResult, clearSubmitResultError, clearLastSubmittedResult } from "@/lib/store/slices/inventorySlice";

interface InventoryActivePageProps {}

const InventoryActivePage: React.FC<InventoryActivePageProps> = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  // Get Redux state
  const assetBookInventory = useAppSelector(
    (state) => state.assetBook.assetBookInventory
  );
  const submitResultLoading = useAppSelector(
    (state) => state.inventory.submitResultLoading
  );
  const submitResultError = useAppSelector(
    (state) => state.inventory.submitResultError
  );
  const lastSubmittedResult = useAppSelector(
    (state) => state.inventory.lastSubmittedResult
  );

  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tempSaving, setTempSaving] = useState(false);
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType>(
    AssetType.FIXED_ASSET
  );
  const [inventoryResults, setInventoryResults] = useState<{
    [key: string]: AssetInventoryDetail;
  }>({});

  // Current room info (from URL params)
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  
  // Track if we're viewing submitted results (read-only mode)
  const [isViewingSubmittedResults, setIsViewingSubmittedResults] = useState(false);
  
  // Store submitted results details for viewing
  const [submittedResultsDetails, setSubmittedResultsDetails] = useState<any[]>([]);
  
  // Control room info visibility
  const [showRoomInfo, setShowRoomInfo] = useState(() => {
    // Load from localStorage, default to true
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('inventory-showRoomInfo');
      return saved ? JSON.parse(saved) : true;
    }
    return true;
  });

  // Get URL parameters
  const sessionId = params.id as string;
  const unitId = searchParams.get("unitId") || "";
  const roomId = searchParams.get("roomId") || "";
  const assignmentId = searchParams.get("assignmentId") || "";
  const resultsParam = searchParams.get("results");

  // RFID Device Management State
  const [rfidConnected, setRfidConnected] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<
    Array<{
      id: string;
      name: string;
      type: string;
      status: "online" | "offline" | "busy";
      signal: number;
      lastSeen: Date;
    }>
  >([
    {
      id: "rfid-001",
      name: "RFID Reader #001",
      type: "Handheld",
      status: "online",
      signal: 85,
      lastSeen: new Date(),
    },
    {
      id: "rfid-002",
      name: "RFID Reader #002",
      type: "Desktop",
      status: "offline",
      signal: 0,
      lastSeen: new Date(Date.now() - 300000),
    },
  ]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [showDeviceList, setShowDeviceList] = useState(false);
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    asset: Asset | null;
    actionType: "LIQUIDATION" | "REPAIR" | "VIEW_RESULT" | null;
    submittedResult?: any;
  }>({
    isOpen: false,
    asset: null,
    actionType: null,
  });

  const handleActionConfirm = async (data: ActionModalData) => {
    try {
      console.log('Action confirmed:', data);
      
      // Update inventory results with the action data
      if (actionModal.asset) {
        const assetId = actionModal.asset.id;
        setInventoryResults(prev => ({
          ...prev,
          [assetId]: {
            ...prev[assetId],
            status: data.status as unknown as AssetActionStatus,
            note: data.reason,
            imageUrls: data.images,
            updatedAt: new Date().toISOString(),
          },
        }));
        
        toast.success(`Đã ${actionModal.actionType === 'LIQUIDATION' ? 'đề xuất thanh lý' : 'đề xuất sửa chữa'} tài sản`);
      }
      
      setActionModal({ isOpen: false, asset: null, actionType: null });
    } catch (error) {
      console.error('Error handling action:', error);
      toast.error('Có lỗi xảy ra khi xử lý yêu cầu');
    }
  };

  const handleActionClick = (
    asset: Asset,
    actionType: "LIQUIDATION" | "REPAIR"
  ) => {
    setActionModal({
      isOpen: true,
      asset,
      actionType,
    });
  };

  const handleViewResult = (asset: Asset) => {
    // Find the submitted result for this asset
    const result = submittedResultsDetails.find(r => r.assetId === asset.id);
    if (result) {
      setActionModal({
        isOpen: true,
        asset,
        actionType: "VIEW_RESULT",
        submittedResult: result
      });
    }
  };

  // Exception assets state
  const [exceptionAssets, setExceptionAssets] = useState<
    Array<{
      asset: AssetBookItem;
      isNeighbor: boolean;
      scannedAt: Date;
    }>
  >([]);

  // Main data loading effect - combines all initial data loading
  useEffect(() => {
    const loadAllData = async () => {
      if (!unitId || !roomId) return;
      
      try {
        setLoading(true);

        // Check if we have results param (indicates viewing submitted results)
        if (resultsParam) {
          setIsViewingSubmittedResults(true);
          setShowRoomInfo(false); // Auto-hide room info when viewing submitted results
        } else {
          setIsViewingSubmittedResults(false);
          setShowRoomInfo(true); // Show room info for new inventory
        }

        // Load all data in parallel to avoid duplicate calls
        const [assetBookResult, roomResult, tempResults] = await Promise.allSettled([
          // Load asset book data
          dispatch(
            getAssetBookInventoryFromUnitIdAndRoomId({
              unitId,
              roomId,
            })
          ).unwrap(),
          
          // Load room info
          dispatch(getRoomById(roomId)).unwrap(),
          
          // Load temp results or submitted results based on mode
          isViewingSubmittedResults && assignmentId 
            ? inventoryApi.getRoomInventoryResults(roomId, assignmentId)
            : inventoryApi.getTempResults(roomId)
        ]);

        // Handle asset book result
        if (assetBookResult.status === 'fulfilled') {
          // Initialize inventory results when asset book data is loaded
          if (assetBookResult.value?.assetTypes) {
            const initialResults: { [key: string]: AssetInventoryDetail } = {};
            assetBookResult.value.assetTypes.forEach((assetType: any) => {
              assetType.items.forEach((item: AssetBookItem) => {
                initialResults[item.assetId] = {
                  quantity: item.quantity,
                  status: AssetActionStatus.MATCHED,
                  note: '',
                  imageUrls: [],
                  updatedAt: new Date().toISOString(),
                };
              });
            });
            setInventoryResults(initialResults);
          }
        } else {
          console.error("Error loading asset book:", assetBookResult.reason);
          toast.error("Không thể tải dữ liệu sổ tài sản");
        }

        // Handle room result
        if (roomResult.status === 'fulfilled' && roomResult.value) {
          setCurrentRoom(roomResult.value);
        } else {
          console.error("Error loading room info:", roomResult.status === 'rejected' ? roomResult.reason : 'Unknown error');
        }

        // Handle temp results or submitted results
        if (tempResults.status === 'fulfilled') {
          if (isViewingSubmittedResults) {
            // Handle submitted results
            const submittedResults = tempResults.value as any[];
            console.log('Submitted results from API:', submittedResults);
            if (submittedResults && submittedResults.length > 0) {
              // Store full details for viewing
              setSubmittedResultsDetails(submittedResults);
              
              // Convert submitted results to inventory results format
              const inventoryResultsMap: { [key: string]: any } = {};
              submittedResults.forEach(result => {
                if (result.assetId) {
                  inventoryResultsMap[result.assetId] = {
                    quantity: result.countedQuantity,
                    status: result.status,
                    note: result.note || '',
                    imageUrls: result.imageUrls || []
                  };
                }
              });
              setInventoryResults(inventoryResultsMap);
              toast.success(`Đã tải ${submittedResults.length} kết quả kiểm kê đã hoàn thành`);
            }
          } else {
            // Handle temp results
            const tempData = tempResults.value as any;
            if (tempData?.inventoryResults) {
              setInventoryResults(tempData.inventoryResults);
              toast.success(`Đã tải lại kết quả kiểm kê tạm thời (còn ${Math.floor(tempData.ttl / 3600)}h)`);
            }
          }
        } else if (tempResults.status === 'rejected') {
          console.error("Error loading results:", tempResults.reason);
        }

      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [dispatch, unitId, roomId, resultsParam, isViewingSubmittedResults, assignmentId]);

  // Save showRoomInfo state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('inventory-showRoomInfo', JSON.stringify(showRoomInfo));
    }
  }, [showRoomInfo]);

  // Handle quantity update
  const handleQuantityUpdate = (assetId: string, quantity: number) => {
    setInventoryResults((prev) => ({
      ...prev,
      [assetId]: {
        ...prev[assetId],
        quantity,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  // Handle status update
  const handleStatusUpdate = (assetId: string, status: AssetActionStatus) => {
    setInventoryResults((prev) => ({
      ...prev,
      [assetId]: {
        ...prev[assetId],
        status,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  // Handle note update
  const handleNoteUpdate = (assetId: string, note: string) => {
    setInventoryResults((prev) => ({
      ...prev,
      [assetId]: {
        ...prev[assetId],
        note,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  // Handle image URLs update
  const handleImageUrlsUpdate = (assetId: string, imageUrls: string[]) => {
    setInventoryResults((prev) => ({
      ...prev,
      [assetId]: {
        ...prev[assetId],
        imageUrls,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  // Handle RFID connection
  const handleConnectRfid = async () => {
    if (!selectedDevice) {
      toast.error("Vui lòng chọn thiết bị RFID trước khi kết nối");
      setShowDeviceList(true);
      return;
    }

    try {
      setRfidConnected(true);
      setAvailableDevices((prev) =>
        prev.map((device) =>
          device.id === selectedDevice
            ? { ...device, status: "busy" as const }
            : device
        )
      );
      toast.success("Đã kết nối thiết bị RFID");
    } catch (error) {
      console.error("Failed to connect RFID reader:", error);
      toast.error("Không thể kết nối thiết bị RFID");
    }
  };

  // Handle RFID scan
  const handleScanRfid = async () => {
    if (!rfidConnected) {
      toast.error("Vui lòng kết nối thiết bị RFID trước");
      return;
    }

    setScanning(!scanning);
    if (!scanning) {
      toast.success("Bắt đầu quét RFID");
      // Simulate scanning after 3 seconds
      setTimeout(() => {
        setScanning(false);
        toast.success("Đã quét được 1 tài sản");
        // Add mock scanned asset logic here
      }, 3000);
    } else {
      toast.success("Đã dừng quét RFID");
    }
  };

  // Handle device selection
  const handleSelectDevice = (deviceId: string) => {
    setSelectedDevice(deviceId);
    setShowDeviceList(false);
  };

  // Get selected device info
  const getSelectedDeviceInfo = () => {
    return availableDevices.find((device) => device.id === selectedDevice);
  };

  // Save inventory results temporarily
  const handleTempSave = async () => {
    if (!roomId || !unitId || !sessionId) {
      toast.error("Thiếu thông tin cần thiết để lưu tạm");
      return;
    }

    try {
      setTempSaving(true);
      
      const saveData: SaveTempInventoryRequest = {
        roomId,
        unitId,
        sessionId,
        inventoryResults,
        note: `Lưu tạm kết quả kiểm kê phòng ${currentRoom?.roomCode || roomId}`,
        ttlSeconds: 86400, // 24 hours
      };

      await inventoryApi.saveTempResults(saveData);
      toast.success("Đã lưu tạm kết quả kiểm kê");
    } catch (error) {
      console.error("Error saving temp results:", error);
      toast.error("Không thể lưu tạm kết quả kiểm kê");
    } finally {
      setTempSaving(false);
    }
  };

  // Save inventory results
  const handleSaveResults = async () => {
    if (!assignmentId) {
      toast.error("Thiếu thông tin phân công kiểm kê");
      return;
    }

    try {
      setSaving(true);
      
      // Convert inventory results to submit format
      const submitResults = Object.entries(inventoryResults).map(([assetId, result]) => ({
        assetId,
        systemQuantity: result.quantity, // This will be overridden by backend
        countedQuantity: result.quantity,
        scanMethod: ScanMethod.MANUAL, // Default to manual, can be enhanced later
        status: result.status,
        note: result.note || '',
        imageUrls: result.imageUrls || [],
      }));

      const submitData: SubmitInventoryResultRequest = {
        assignmentId,
        results: submitResults,
        note: `Kết quả kiểm kê phòng ${currentRoom?.roomCode || roomId}`,
      };

      // Submit results using Redux thunk
      const result = await dispatch(submitInventoryResult(submitData)).unwrap();
      
      // Clear temporary results after successful submit
      if (roomId) {
        try {
          await inventoryApi.deleteTempResults(roomId);
        } catch (error) {
          console.error("Error clearing temp results:", error);
        }
      }
      
      // Show success message with statistics
      toast.success(
        `Đã submit kết quả kiểm kê thành công! Tổng: ${result.totalResults} tài sản`
      );
      
      // Log statistics for debugging
      console.log("Submit result statistics:", result.statistics);
      
    } catch (error: any) {
      console.error("Error saving results:", error);
      const errorMessage = error?.message || "Không thể lưu kết quả kiểm kê";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Clear temporary results
  const handleClearTempResults = async () => {
    if (!roomId) return;
    
    try {
      await inventoryApi.deleteTempResults(roomId);
      setInventoryResults({});
      toast.success("Đã xóa kết quả kiểm kê tạm thời");
    } catch (error) {
      console.error("Error clearing temp results:", error);
      toast.error("Không thể xóa kết quả kiểm kê tạm thời");
    }
  };

  // Get assets by type
  const getAssetsByType = (type: AssetType): AssetBookItem[] => {
    if (!assetBookInventory?.assetTypes) return [];

    const assetTypeData = assetBookInventory.assetTypes.find(
      (at: any) => at.type === type
    );
    return assetTypeData?.items || [];
  };

  // Get status based on quantity comparison
  const getAssetStatus = (systemQuantity: number, countedQuantity: number, actionStatus?: AssetActionStatus) => {
    // If there's an action status (LIQUIDATION_PROPOSED, NEEDS_REPAIR), use that
    if (actionStatus === AssetActionStatus.LIQUIDATION_PROPOSED) {
      return {
        status: "LIQUIDATION_PROPOSED",
        color: "bg-purple-100 text-purple-800",
        text: "Đề xuất thanh lý",
      };
    } else if (actionStatus === AssetActionStatus.NEEDS_REPAIR) {
      return {
        status: "NEEDS_REPAIR",
        color: "bg-yellow-100 text-yellow-800",
        text: "Cần sửa chữa",
      };
    }
    
    // Otherwise, use quantity-based status
    if (countedQuantity === systemQuantity) {
      return {
        status: "MATCHED",
        color: "bg-green-100 text-green-800",
        text: "Khớp",
      };
    } else if (countedQuantity > systemQuantity) {
      return {
        status: "EXCESS",
        color: "bg-yellow-100 text-yellow-800",
        text: "Thừa",
      };
    } else {
      return {
        status: "MISSING",
        color: "bg-orange-100 text-orange-800",
        text: "Thiếu",
      };
    }
  };

  // Calculate statistics
  const getStatistics = () => {
    const assets = getAssetsByType(selectedAssetType);
    const total = assets.length;
    let matched = 0;
    let missing = 0;
    let excess = 0;
    let liquidationProposed = 0;
    let needsRepair = 0;
    let counted = 0;

    assets.forEach((asset) => {
      const result = inventoryResults[asset.assetId];
      const countedQuantity = result?.quantity || 0;

      if (countedQuantity > 0) {
        counted++;
        
        // Check action status first
        if (result?.status === AssetActionStatus.LIQUIDATION_PROPOSED) {
          liquidationProposed++;
        } else if (result?.status === AssetActionStatus.NEEDS_REPAIR) {
          needsRepair++;
        } else if (countedQuantity === asset.quantity) {
          matched++;
        } else if (countedQuantity > asset.quantity) {
          excess++;
        } else {
          missing++;
        }
      } else {
        missing++;
      }
    });

    return {
      total,
      counted,
      matched,
      missing,
      excess,
      liquidationProposed,
      needsRepair,
    };
  };

  // Render mobile asset card
  const renderMobileAssetCard = (item: AssetBookItem, index: number) => {
    const result = inventoryResults[item.assetId];
    const countedQuantity = result?.quantity || 0;
    const assetStatus = getAssetStatus(item.quantity, countedQuantity, result?.status);

    return (
      <div
        key={item.id}
        className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
      >
        {/* Asset Info */}
        <div className="border-b border-gray-100 pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-sm">
                {item.asset?.ktCode}
              </h4>
              <p className="text-sm text-gray-700 mt-1">{item.asset?.name}</p>
              <p className="text-xs text-gray-500 mt-1 truncate">
                {item.asset?.specs}
              </p>
            </div>
            <Badge className={`ml-2 flex-shrink-0 ${assetStatus.color}`}>
              {assetStatus.text}
            </Badge>
          </div>
        </div>

        {/* Quantity Section */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">
              SL sổ tài sản
            </label>
            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {item.quantity}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">
              SL kiểm kê
            </label>
            <Input
              type="number"
              value={countedQuantity}
              onChange={(e) =>
                handleQuantityUpdate(
                  item.assetId,
                  parseInt(e.target.value) || 0
                )
              }
              className="w-full text-center text-sm h-8"
              min="0"
            />
          </div>
        </div>

        {/* Action */}
        <div className="flex items-center gap-2 justify-end">
          {isViewingSubmittedResults ? (
            <Button
              onClick={() => handleViewResult(item.asset as Asset)}
              variant="default"
              size="sm"
              className="text-green-600 hover:text-green-800"
            >
              <Eye className="h-4 w-4 mr-1" />
              Xem kết quả
            </Button>
          ) : (
            <>
              <Button
                onClick={() =>
                  handleActionClick(item.asset as Asset, "LIQUIDATION")
                }
                variant="default"
                size="sm"
                className="text-blue-600 hover:text-blue-800"
              >
                Thanh lý
              </Button>
              <Button
                onClick={() => handleActionClick(item.asset as Asset, "REPAIR")}
                variant="default"
                size="sm"
                className="text-orange-600 hover:text-orange-800"
              >
                Sửa chữa
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  // Render asset table
  const renderAssetTable = () => {
    const assets = getAssetsByType(selectedAssetType);

    const columns: TableColumn<AssetBookItem>[] = [
      {
        key: "assetInfo",
        title: "Thông tin tài sản",
        width: "200px",
        render: (_, record) => (
          <div>
            <div className="font-medium text-gray-900">
              {record.asset?.ktCode}
            </div>
            <div className="text-sm text-gray-700 mt-1">
              {record.asset?.name}
            </div>
            <div className="text-xs text-gray-500 mt-1 truncate">
              {record.asset?.specs}
            </div>
          </div>
        ),
      },
      {
        key: "quantity",
        title: "SL sổ tài sản",
        width: "100px",
        className: "text-center",
        render: (_, record) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {record.quantity}
          </span>
        ),
      },
      {
        key: "countedQuantity",
        title: "SL kiểm kê",
        width: "100px",
        className: "text-center",
        render: (_, record) => (
          <Input
            type="number"
            value={inventoryResults[record.assetId]?.quantity || 0}
            onChange={(e) =>
              handleQuantityUpdate(
                record.assetId,
                parseInt(e.target.value) || 0
              )
            }
            className="w-20 text-center"
            min="0"
          />
        ),
      },
      {
        key: "status",
        title: "Trạng thái",
        width: "100px",
        className: "text-center",
        render: (_, record) => {
          const result = inventoryResults[record.assetId];
          const countedQuantity = result?.quantity || 0;
          const assetStatus = getAssetStatus(record.quantity, countedQuantity, result?.status);
          return (
            <Badge className={assetStatus.color}>{assetStatus.text}</Badge>
          );
        },
      },
      {
        key: "actions",
        title: "Thao tác",
        width: "100px",
        className: "text-center",
        render: (_, record) => (
          <div className="flex items-center gap-2">
            {isViewingSubmittedResults ? (
              <Button
                onClick={() => handleViewResult(record.asset as Asset)}
                variant="default"
                size="sm"
                className="text-green-600 hover:text-green-800"
              >
                <Eye className="h-4 w-4 mr-1" />
                Xem kết quả
              </Button>
            ) : (
              <>
                <Button
                  onClick={() =>
                    handleActionClick(record.asset as Asset, "LIQUIDATION")
                  }
                  variant="default"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Thanh lý
                </Button>
                <Button
                  onClick={() => handleActionClick(record.asset as Asset, "REPAIR")}
                  variant="default"
                  size="sm"
                  className="text-orange-600 hover:text-orange-800"
                >
                  Sửa chữa
                </Button>
              </>
            )}
          </div>
        ),
      },
    ];

    return (
      <>
        {/* Mobile view */}
        <div className="md:hidden bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h3 className="text-base font-semibold text-gray-900">
              Danh sách tài sản ({assets.length})
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {assets.map((asset, index) => renderMobileAssetCard(asset, index))}
          </div>
        </div>

        {/* Desktop view */}
        <div className="hidden md:block">
          <Table
            columns={columns}
            data={assets}
            rowKey="id"
            title="Danh sách tài sản"
            className="shadow-sm"
          />
        </div>
      </>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            Đang tải dữ liệu sổ tài sản...
          </p>
        </div>
      </div>
    );
  }

  const stats = getStatistics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mx-auto">
        {/* Navigation Header */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Quay lại</span>
              </button>
              <div className="mx-2 md:mx-8">
                <h2 className="text-base md:text-lg font-semibold text-gray-900">
                  Kiểm kê tài sản -{" "}
                  {assetBookInventory?.unit?.name || "Đang tải..."}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <span>
                    Năm {assetBookInventory?.year || new Date().getFullYear()}
                  </span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="font-medium">
                    {currentRoom ? currentRoom.roomCode : "Đang tải..."}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowRoomInfo(!showRoomInfo)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title={showRoomInfo ? "Ẩn thông tin phòng" : "Hiện thông tin phòng"}
              >
                {showRoomInfo ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    <span className="hidden sm:inline">Ẩn thông tin</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    <span className="hidden sm:inline">Hiện thông tin</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Asset Inventory Interface */}
        {currentRoom && assetBookInventory && (
          <>
            {/* Room Information & Statistics - Collapsible */}
            {showRoomInfo && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-6 mb-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-100 rounded-lg p-2">
                    <Home className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">
                    Thông tin phòng & Thống kê
                  </h3>
                </div>

                {/* Room Information */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Mã phòng</div>
                  <div className="font-semibold text-gray-900">
                    {currentRoom.roomCode}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Tầng</div>
                  <div className="font-semibold text-gray-900">
                    {currentRoom.floor}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Tòa nhà</div>
                  <div className="font-semibold text-gray-900">
                    {currentRoom.building || "N/A"}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Trạng thái</div>
                  <div className="font-semibold text-green-600">
                    Đang kiểm kê
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="border-t border-gray-100 pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <div className="text-emerald-600 text-lg md:text-xl font-bold">
                      {stats.matched}
                    </div>
                    <div className="text-xs text-gray-600">Khớp</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-orange-600 text-lg md:text-xl font-bold">
                      {stats.missing}
                    </div>
                    <div className="text-xs text-gray-600">Thiếu</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-yellow-600 text-lg md:text-xl font-bold">
                      {stats.excess}
                    </div>
                    <div className="text-xs text-gray-600">Thừa</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-purple-600 text-lg md:text-xl font-bold">
                      {stats.liquidationProposed}
                    </div>
                    <div className="text-xs text-gray-600">Đề xuất thanh lý</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-100 rounded-lg">
                    <div className="text-yellow-700 text-lg md:text-xl font-bold">
                      {stats.needsRepair}
                    </div>
                    <div className="text-xs text-gray-600">Cần sửa chữa</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-blue-600 text-lg md:text-xl font-bold">
                      {stats.counted}
                    </div>
                    <div className="text-xs text-gray-600">Đã kiểm</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-gray-600 text-lg md:text-xl font-bold">
                      {stats.total}
                    </div>
                    <div className="text-xs text-gray-600">Tổng</div>
                  </div>
                </div>
              </div>
              </div>
            )}

            {/* Asset Type Selector */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6">
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                Loại tài sản
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedAssetType(AssetType.FIXED_ASSET)}
                  className={`text-left rounded-lg p-3 border transition-all ${
                    selectedAssetType === AssetType.FIXED_ASSET
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-gray-600" />
                    <div>
                      <div className="font-medium text-sm">Tài sản cố định</div>
                      <div className="text-xs text-gray-500">
                        {getAssetsByType(AssetType.FIXED_ASSET).length} tài sản
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() =>
                    setSelectedAssetType(AssetType.TOOLS_EQUIPMENT)
                  }
                  className={`text-left rounded-lg p-3 border transition-all ${
                    selectedAssetType === AssetType.TOOLS_EQUIPMENT
                      ? "border-green-300 bg-green-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-gray-600" />
                    <div>
                      <div className="font-medium text-sm">Công cụ dụng cụ</div>
                      <div className="text-xs text-gray-500">
                        {getAssetsByType(AssetType.TOOLS_EQUIPMENT).length} tài
                        sản
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* RFID Control Panel - Only show for FIXED_ASSET */}
            {selectedAssetType === AssetType.FIXED_ASSET && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 md:px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 rounded-lg p-2">
                        <Radio className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-base md:text-lg font-semibold text-gray-900">
                          Điều khiển thiết bị RFID
                        </h3>
                        <p className="text-sm text-gray-600 hidden sm:block">
                          Quản lý và điều khiển thiết bị quét RFID
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDeviceList(!showDeviceList)}
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {showDeviceList ? "Ẩn danh sách" : "Quản lý thiết bị"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Device Management Panel */}
                {showDeviceList && (
                  <div className="border-b border-gray-200 bg-gray-50 p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availableDevices.map((device) => (
                        <div
                          key={device.id}
                          onClick={() => handleSelectDevice(device.id)}
                          className={`p-3 md:p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedDevice === device.id
                              ? "border-blue-500 bg-blue-50 shadow-md"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  device.status === "online"
                                    ? "bg-green-500"
                                    : device.status === "busy"
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                              ></div>
                              <span className="font-medium text-sm text-gray-900 truncate">
                                {device.name}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
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
                        <span
                          className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                            getSelectedDeviceInfo()?.status === "online"
                              ? "bg-green-100 text-green-700"
                              : getSelectedDeviceInfo()?.status === "busy"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {getSelectedDeviceInfo()?.status === "online"
                            ? "Sẵn sàng"
                            : getSelectedDeviceInfo()?.status === "busy"
                            ? "Đang sử dụng"
                            : "Ngoại tuyến"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Central Action Interface */}
                  <div className="flex flex-col items-center space-y-4 md:space-y-6">
                    {/* Main Control Button */}
                    <div className="relative">
                      {scanning && (
                        <>
                          <div className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-ping"></div>
                          <div
                            className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-ping"
                            style={{ animationDelay: "0.5s" }}
                          ></div>
                        </>
                      )}

                      <button
                        onClick={
                          !rfidConnected ? handleConnectRfid : handleScanRfid
                        }
                        disabled={!selectedDevice}
                        className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white font-bold text-base md:text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
                          !selectedDevice
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
                        {!selectedDevice
                          ? "Chưa chọn thiết bị"
                          : !rfidConnected
                          ? "Nhấn để kết nối Bluetooth"
                          : scanning
                          ? "Đang quét RFID..."
                          : "Sẵn sàng quét"}
                      </div>
                      <div className="text-xs md:text-sm text-gray-500 mt-1">
                        {!selectedDevice
                          ? "Vui lòng chọn thiết bị từ danh sách"
                          : !rfidConnected
                          ? `Kết nối với ${getSelectedDeviceInfo()?.name}`
                          : scanning
                          ? "Nhấn để dừng quét"
                          : "Nhấn để bắt đầu quét tài sản"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Asset Table */}
            <div className="mb-6">{renderAssetTable()}</div>

            {/* Action Bar */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-6">

              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-base md:text-lg font-semibold text-gray-900">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        selectedAssetType === AssetType.FIXED_ASSET
                          ? "bg-blue-500"
                          : "bg-green-500"
                      }`}
                    ></div>
                    {selectedAssetType === AssetType.FIXED_ASSET
                      ? "Tài sản cố định"
                      : "Công cụ dụng cụ"}
                    : {getAssetsByType(selectedAssetType).length} tài sản
                  </div>
                  <p className="text-sm md:text-base text-gray-600">
                    Đã kiểm: {stats.counted} | Phòng: {currentRoom.roomCode}
                  </p>
                </div>
                {!isViewingSubmittedResults && (
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full lg:w-auto">
                    <button
                      onClick={handleTempSave}
                      disabled={tempSaving || saving}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed justify-center sm:justify-start"
                    >
                      <Save className="h-4 w-4" />
                      {tempSaving ? "Đang lưu tạm..." : "Lưu tạm"}
                    </button>
                    <button
                      onClick={handleClearTempResults}
                      disabled={tempSaving || saving}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed justify-center sm:justify-start"
                    >
                      <Trash2 className="h-4 w-4" />
                      Xóa tạm
                    </button>
                    <button
                      onClick={handleSaveResults}
                      disabled={saving || tempSaving || submitResultLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed justify-center sm:justify-start"
                    >
                      <Save className="h-4 w-4" />
                      {saving || submitResultLoading ? "Đang lưu..." : "Lưu kết quả"}
                    </button>
                  </div>
                )}
                
                {isViewingSubmittedResults && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                    Đã hoàn thành
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <ActionModal
          isOpen={actionModal.isOpen}
          onClose={() =>
            setActionModal({ isOpen: false, asset: null, actionType: null })
          }
          asset={actionModal.asset}
          actionType={actionModal.actionType}
          submittedResult={actionModal.submittedResult}
          onConfirm={handleActionConfirm}
        />
      </div>
    </div>
  );
};

export default InventoryActivePage;
