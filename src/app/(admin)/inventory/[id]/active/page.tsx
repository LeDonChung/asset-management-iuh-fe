"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { getAssetBookInventoryFromUnitIdAndRoomId } from "@/lib/store/slices/assetBookSlice";
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
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { getRoomById } from "@/lib/store/slices/unitSlice";
import {
  ActionModal,
  ActionModalData,
} from "@/components/inventory/modals/ActionModal";
import {
  RoomInfoCard,
  StatisticsCard,
  AssetTypeCard,
  ActionBarCard,
} from "@/components/inventory/cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableColumn } from "@/components/ui/table";
import { Eye, Wrench, Trash2 } from "lucide-react";
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

  // Get URL parameters
  const sessionId = params.id as string;
  const unitId = searchParams.get("unitId") || "";
  const roomId = searchParams.get("roomId") || "";
  const assignmentId = searchParams.get("assignmentId") || "";
  const resultsParam = searchParams.get("results");

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
        } else {
          setIsViewingSubmittedResults(false);
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
        roomId: roomId,
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

  // Render asset table
  const renderAssetTable = () => {
    const assets = getAssetsByType(selectedAssetType);

    const columns: TableColumn<AssetBookItem>[] = [
      {
        key: "assetInfo",
        title: "Thông tin tài sản",
        width: "300px",
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
        width: "120px",
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
        width: "120px",
        className: "text-center",
        render: (_, record) => (
          isViewingSubmittedResults ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
              {inventoryResults[record.assetId]?.quantity || 0}
            </span>
          ) : (
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
          )
        ),
      },
      {
        key: "status",
        title: "Trạng thái",
        width: "120px",
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
        width: "180px",
        className: "text-center",
        render: (_, record) => (
          <div className="flex items-center gap-2 justify-center">
            {isViewingSubmittedResults ? (
              <Button
                onClick={() => handleViewResult(record.asset as Asset)}
                variant="outline"
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
                  variant="outline"
                  size="sm"
                  className="text-purple-600 hover:text-purple-800"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Thanh lý
                </Button>
                <Button
                  onClick={() => handleActionClick(record.asset as Asset, "REPAIR")}
                  variant="outline"
                  size="sm"
                  className="text-orange-600 hover:text-orange-800"
                >
                  <Wrench className="h-4 w-4 mr-1" />
                  Sửa chữa
                </Button>
              </>
            )}
          </div>
        ),
      },
    ];

    return (
          <Table
            columns={columns}
            data={assets}
            rowKey="id"
            title="Danh sách tài sản"
            className="shadow-sm"
          />
    );
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
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 md:px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Quay lại</span>
              </button>
                <div className="mx-2 md:mx-4">
                <h2 className="text-base md:text-lg font-semibold text-gray-900">
                    Kiểm kê tài sản - {assetBookInventory?.unit?.name || "Đang tải..."}
                </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
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
            </div>
          </div>
        </div>

        {/* Asset Inventory Interface */}
        {currentRoom && assetBookInventory && (
          <>
            {/* Room Information Card */}
            <div className="mb-6">
              <RoomInfoCard room={currentRoom} />
            </div>

            {/* Statistics Card */}
            <div className="mb-6">
              <StatisticsCard statistics={stats} />
            </div>

            {/* Asset Type Selector Card */}
            <div className="mb-6">
              <AssetTypeCard
                selectedAssetType={selectedAssetType}
                onAssetTypeChange={setSelectedAssetType}
                fixedAssetCount={getAssetsByType(AssetType.FIXED_ASSET).length}
                toolsEquipmentCount={getAssetsByType(AssetType.TOOLS_EQUIPMENT).length}
              />
            </div>

            {/* Asset Table */}
            <div className="mb-6">
              {renderAssetTable()}
            </div>

            {/* Action Bar */}
            <ActionBarCard
              selectedAssetType={selectedAssetType}
              assetCount={getAssetsByType(selectedAssetType).length}
              countedAssets={stats.counted}
              roomCode={currentRoom.roomCode}
              isViewingSubmittedResults={isViewingSubmittedResults}
              tempSaving={tempSaving}
              saving={saving}
              submitResultLoading={submitResultLoading}
              onTempSave={handleTempSave}
              onClearTempResults={handleClearTempResults}
              onSaveResults={handleSaveResults}
            />
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