import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store";
import {
  getUnitRooms,
  clearUnitRooms,
  getRoomInventoryResults,
  getMultiRoomInventoryResults,
  clearMultiRoomResults,
  clearRoomResults,
  InventoryResultResponseDto,
  MultiRoomInventoryResponseDto,
  RoomInventorySimpleDto,
  AssetInventorySimpleDto,
} from "@/lib/store/slices/inventorySlice";
import { Button } from "@/components/ui/button";
import { Select, SelectOption } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableColumn } from "@/components/ui/table";
import { Search, FileText, Plus, Loader2, Building, Users, MapPin, Package, BarChart3, Download, Eye, Camera, Tag, CheckCircle, XCircle, AlertCircle, Clock, X, Info, ChevronDown, ChevronRight } from "lucide-react";
import {
  AssetType,
  InventoryGroup,
  InventoryGroupAssignment,
  InventoryResult,
  InventoryResultStatus,
  InventorySessionUnit,
  Room,
  ScanMethod,
  AccessScopeType,
} from "@/types/asset";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { inventoryApi, ExportMultiRoomInventoryExcelRequest, ExportInventoryExcelRequest } from "@/lib/api/inventoryApi";
import { createAssetBookFromInventory, CreateAssetBookFromInventoryRequest } from "@/lib/store/slices/assetBookSlice";

interface FilterState {
  sessionUnitId: string;
  groupId: string;
  unitId: string;
  roomId: string;
  assetType: AssetType | "ALL";
  multiRoomAssetType: string; // Thêm filter riêng cho multi-room
}


interface ViewModalData {
  isOpen: boolean;
  title: string;
  note?: string;
  imageUrls?: string[];
  fileUrls?: Array<{id: string; url: string}>;
}

export const InventoryResultManager = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentSession, unitRooms, roomInventoryResults, multiRoomInventoryResults, multiRoomInventoryLoading, multiRoomInventoryError } = useSelector(
    (state: RootState) => state.inventory
  );
  const { user: currentUser } = useAuth();

  // Xác định access scope
  const hasGlobalScope = currentUser?.accessScopeTypes?.includes(AccessScopeType.GLOBAL) || false;
  const hasChildUnitsScope = currentUser?.accessScopeTypes?.includes(AccessScopeType.CHILD_UNITS) || false;
  const hasUnitScope = currentUser?.accessScopeTypes?.includes(AccessScopeType.UNIT) || false;
  const hasSelfScope = currentUser?.accessScopeTypes?.includes(AccessScopeType.SELF) || false;

  // Xác định scope type hiện tại (ưu tiên theo thứ tự: GLOBAL > CHILD_UNITS > UNIT/SELF)
  const getCurrentScopeType = () => {
    if (hasGlobalScope) return 'GLOBAL';
    if (hasChildUnitsScope) return 'CHILD_UNITS';
    if (hasUnitScope || hasSelfScope) return 'UNIT';
    return 'NONE';
  };

  const currentScopeType = getCurrentScopeType();

  // Utility functions for status display
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLETE':
        return 'bg-green-100 text-green-800';
      case 'MISSING':
        return 'bg-red-100 text-red-800';
      case 'EXCESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'PARTIAL':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: InventoryResultStatus) => {
  //   MATCHED = "MATCHED", // Khớp
  // MISSING = "MISSING", // Thiếu
  // EXCESS = "EXCESS", // Thừa
  // BROKEN = "BROKEN", // Hư hỏng
  // NEEDS_REPAIR = "NEEDS_REPAIR", // Cần sửa chữa
  // LIQUIDATION_PROPOSED = "LIQUIDATION_PROPOSED", // Đề xuất thanh lý
    switch (status) {
      case 'MATCHED':
        return 'Khớp';
      case 'MISSING':
        return 'Thiếu';
      case 'EXCESS':
        return 'Thừa';
      case 'BROKEN':
        return 'Hư hỏng';
      case 'NEEDS_REPAIR':
        return 'Cần sửa chữa';
      case 'LIQUIDATION_PROPOSED':
        return 'Đề xuất thanh lý';
      default:
        return status;
    }
  };

  const getMethodText = (method: ScanMethod) => {
    switch (method) {
      case 'RFID':
        return 'RFID';
      case 'MANUAL':
        return 'Thủ công';
      default:
        return method;
    }
  };

  const [filters, setFilters] = useState<FilterState>({
    sessionUnitId: "",
    groupId: "",
    unitId: "",
    roomId: "",
    assetType: "ALL",
    multiRoomAssetType: "ALL",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [viewModal, setViewModal] = useState<ViewModalData>({
    isOpen: false,
    title: '',
    note: '',
    imageUrls: [],
    fileUrls: []
  });

  const [sessionUnits, setSessionUnits] = useState<InventorySessionUnit[]>(
    currentSession?.inventorySessionUnits ?? []
  );

  const [groups, setGroups] = useState<InventoryGroup[]>([]);

  const [assignments, setAssignments] = useState<InventoryGroupAssignment[]>(
    []
  );

  // State for asset book creation
  const [isCreatingAssetBook, setIsCreatingAssetBook] = useState(false);

  // Tự động khởi tạo filters dựa trên access scope
  useEffect(() => {
    if (!currentUser || !currentSession || !currentSession.inventorySessionUnits) return;

    // Nếu là UNIT scope, tự động tìm assignment và set unitId, load rooms
    if (currentScopeType === 'UNIT' && currentUser.unitId) {
      // Tìm assignment có unitId = user's unitId trong TẤT CẢ các sessionUnits và groups
      let foundAssignment: InventoryGroupAssignment | null = null;
      let foundGroup: InventoryGroup | null = null;
      let foundSessionUnit: InventorySessionUnit | null = null;
      
      // Tìm trong tất cả sessionUnits
      for (const sessionUnit of currentSession.inventorySessionUnits) {
        const availableGroups = sessionUnit.subInventory?.groups ?? [];
        
        for (const group of availableGroups) {
          const assignment = group.assignments?.find(
            (a: InventoryGroupAssignment) => a.unitId === currentUser.unitId
          );
          if (assignment) {
            foundAssignment = assignment;
            foundGroup = group;
            foundSessionUnit = sessionUnit;
            break;
          }
        }
        
        if (foundAssignment) break;
      }
      
      // Nếu tìm thấy assignment, set các filters tương ứng
      if (foundAssignment && foundGroup && foundSessionUnit) {
        setFilters((prev) => ({
          ...prev,
          sessionUnitId: foundSessionUnit!.id,
          groupId: foundGroup!.id,
          unitId: currentUser.unitId,
        }));
        setGroups(foundSessionUnit.subInventory?.groups ?? []);
        setAssignments(foundGroup.assignments || []);
      } else {
        // Nếu không tìm thấy assignment, vẫn tìm sessionUnit của user để set sessionUnitId
        const userSessionUnit = currentSession.inventorySessionUnits.find(
          (su: InventorySessionUnit) => su.unitId === currentUser.unitId
        );
        
        if (userSessionUnit) {
          setFilters((prev) => ({
            ...prev,
            sessionUnitId: userSessionUnit.id,
            unitId: currentUser.unitId,
          }));
          setGroups(userSessionUnit.subInventory?.groups ?? []);
        } else {
          // Nếu không tìm thấy cả sessionUnit, vẫn set unitId
          setFilters((prev) => ({
            ...prev,
            unitId: currentUser.unitId,
          }));
        }
      }
      
      // Luôn load rooms cho unit của user (bất kể có tìm thấy assignment hay không)
      dispatch(getUnitRooms(currentUser.unitId))
        .unwrap()
        .catch((error) => {
          toast.error('Không thể tải danh sách phòng. Vui lòng thử lại.');
        });
    }

    // Nếu là CHILD_UNITS scope, tự động set sessionUnitId và load groups
    if (currentScopeType === 'CHILD_UNITS' && currentUser.unitId) {
      const userSessionUnit = currentSession.inventorySessionUnits.find(
        (su: InventorySessionUnit) => su.unitId === currentUser.unitId
      );

      if (userSessionUnit) {
        setFilters((prev) => ({
          ...prev,
          sessionUnitId: userSessionUnit.id,
        }));
        // Load groups cho sessionUnit này
        const availableGroups = userSessionUnit.subInventory?.groups ?? [];
        setGroups(availableGroups);
        
        // Nếu có nhóm, tự động chọn nhóm đầu tiên và load assignments
        if (availableGroups.length > 0) {
          const firstGroup = availableGroups[0];
          setFilters((prev) => ({
            ...prev,
            groupId: firstGroup.id,
          }));
          setAssignments(firstGroup.assignments || []);
          
          // Nếu chỉ có 1 assignment, tự động chọn nó và load rooms
          if (firstGroup.assignments && firstGroup.assignments.length === 1) {
            const firstAssignment = firstGroup.assignments[0];
            if (firstAssignment?.unit?.id) {
              setFilters((prev) => ({
                ...prev,
                unitId: firstAssignment.unit!.id,
              }));
              dispatch(getUnitRooms(firstAssignment.unit!.id));
            }
          }
        }
      }
    }
  }, [currentUser, currentSession, currentScopeType, dispatch]);

  // Open modal to view note and images
  const openViewModal = (title: string, note?: string, fileUrls?: Array<{id: string; url: string}>) => {
    setViewModal({
      isOpen: true,
      title,
      note,
      imageUrls: fileUrls?.map(file => file.url) || [],
      fileUrls: fileUrls || []
    });
  };

  // Close modal
  const closeViewModal = () => {
    setViewModal({
      isOpen: false,
      title: '',
      note: '',
      imageUrls: [],
      fileUrls: []
    });
  };

  // Truncate text with tooltip
  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return null;
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETE':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'MISSING':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'EXCESS':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'PARTIAL':
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };
  useEffect(() => {
    // Với UNIT scope, rooms đã được load trong useEffect tự động khởi tạo
    // Chỉ load lại khi filters.unitId thay đổi và không phải UNIT scope
    if (currentScopeType === 'UNIT') {
      return;
    }
    
    try {
      if (!filters.unitId) {
        return;
      }
      setLoading(true);
      dispatch(getUnitRooms(filters.unitId))
        .unwrap()
        .catch((err: any) => {
          console.error(err);
          toast.error(err.message || "Đã có lỗi xảy ra khi tải danh sách phòng");
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Đã có lỗi xảy ra khi tải danh sách phòng");
      setLoading(false);
    }
  }, [filters.unitId, currentScopeType, dispatch]);

  useEffect(() => {
    try {
      if (!filters.roomId) {
        return;
      }
      setLoading(true);
      dispatch(getRoomInventoryResults(filters.roomId)).unwrap();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Đã có lỗi xảy ra khi tải kết quả kiểm kê");
    } finally {
      setLoading(false);
    }
  }, [filters.roomId]);

  // Effect để gọi multi-room API khi có unitId nhưng chưa chọn roomId
  useEffect(() => {
    if (filters.unitId && !filters.roomId) {
      const multiRoomFilters = {
        unitId: filters.unitId,
        page: 1,
        limit: 5, // Mặc định 5 phòng
        assetType: filters.multiRoomAssetType !== "ALL" ? filters.multiRoomAssetType : undefined,
      };
      
      // Clear previous results
      dispatch(clearMultiRoomResults());
      
      dispatch(getMultiRoomInventoryResults(multiRoomFilters))
        .unwrap()
        .catch((err: any) => {
          console.error(err);
          toast.error(err.message || "Đã có lỗi xảy ra khi tải kết quả kiểm kê nhiều phòng");
        });
    } else if (!filters.unitId) {
      // Clear multi-room results if no unitId
      dispatch(clearMultiRoomResults());
    }
  }, [filters.unitId, filters.roomId, filters.multiRoomAssetType, dispatch]);

  // Xử lý xuất Excel
  const handleExportExcel = async () => {
    try {
      setLoading(true);
      
      if (filters.roomId && roomInventoryResults) {
        // Export cho một phòng cụ thể
        const roomInfo = unitRooms.find(r => r.id === filters.roomId);
        const sanitizedRoomName = (roomInfo?.roomCode || 'phong').replace(/[^a-zA-Z0-9_-]/g, '_');
        const exportData: ExportInventoryExcelRequest = {
          roomId: filters.roomId,
          assignmentId: filters.unitId, // unitId trong filter thực tế là assignmentId
          assetType: filters.assetType !== "ALL" ? filters.assetType as any : undefined,
          fileName: `Ket_qua_kiem_ke_${sanitizedRoomName}_${new Date().getTime()}`,
          includeImages: false
        };
        
        await inventoryApi.exportRoomInventoryToExcel(exportData);
        toast.success("Xuất file Excel thành công!");
      } else if (filters.unitId && multiRoomInventoryResults) {
        // Export cho nhiều phòng của đơn vị
        const unitInfo = sessionUnits.find(su => 
          su.subInventory?.groups?.some(g => 
            g.assignments?.some(a => a.unit?.id === filters.unitId)
          )
        )?.unit;
        
        const sanitizedUnitName = (unitInfo?.name || 'don_vi').replace(/[^a-zA-Z0-9_-]/g, '_');
        const exportData: ExportMultiRoomInventoryExcelRequest = {
          unitId: filters.unitId,
          assetType: filters.multiRoomAssetType !== "ALL" ? filters.multiRoomAssetType as any : undefined,
          fileName: `Ket_qua_kiem_ke_${sanitizedUnitName}_${new Date().getTime()}`,
          includeImages: false
        };
        
        await inventoryApi.exportMultiRoomInventoryToExcel(exportData);
        toast.success("Xuất file Excel thành công!");
      } else {
        toast.error("Chưa có dữ liệu để xuất Excel. Vui lòng chọn đơn vị hoặc phòng.");
      }
    } catch (error: any) {
      console.error("Export Excel error:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi xuất file Excel");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thêm tài sản
  const handleAddAsset = () => {
    console.log("Adding new asset");
    // TODO: Implement add asset logic
  };

  // Kiểm tra xem có thể tạo sổ tài sản hay không
  const canCreateAssetBook = (): { canCreate: boolean; assignmentId?: string; unitId?: string } => {
    // Tìm assignment dựa trên filters hiện tại
    let targetAssignmentId: string | undefined;
    let targetUnitId: string | undefined;

    if (currentScopeType === 'UNIT' && currentUser?.unitId) {
      // Với UNIT scope, tìm assignment của user
      for (const sessionUnit of sessionUnits) {
        const availableGroups = sessionUnit.subInventory?.groups ?? [];
        for (const group of availableGroups) {
          const assignment = group.assignments?.find(
            (a: InventoryGroupAssignment) => a.unitId === currentUser.unitId
          );
          if (assignment) {
            targetAssignmentId = assignment.id;
            targetUnitId = assignment.unitId;
            break;
          }
        }
        if (targetAssignmentId) break;
      }
    } else {
      // Với GLOBAL và CHILD_UNITS scope, sử dụng filter
      const selectedAssignment = assignments.find(a => a.unit?.id === filters.unitId);
      if (selectedAssignment) {
        targetAssignmentId = selectedAssignment.id;
        targetUnitId = selectedAssignment.unitId;
      }
    }

    // Kiểm tra điều kiện:
    // 1. Có assignmentId
    // 2. Có kết quả kiểm kê (roomInventoryResults hoặc multiRoomInventoryResults)
    // 3. Assignment đã hoàn thành (có thể check qua thời gian hoặc status)
    const hasAssignment = !!targetAssignmentId;
    const hasResults = !!(roomInventoryResults || multiRoomInventoryResults);
    
    return {
      canCreate: hasAssignment && hasResults,
      assignmentId: targetAssignmentId,
      unitId: targetUnitId
    };
  };

  // Xử lý tạo sổ tài sản từ kết quả kiểm kê
  const handleCreateAssetBook = async () => {
    const { canCreate, assignmentId, unitId } = canCreateAssetBook();
    
    if (!canCreate || !assignmentId) {
      toast.error("Không thể tạo sổ tài sản. Vui lòng kiểm tra lại điều kiện.");
      return;
    }

    try {
      setIsCreatingAssetBook(true);
      
      const nextYear = new Date().getFullYear() + 1;
      const createRequest: CreateAssetBookFromInventoryRequest = {
        assignmentId: assignmentId,
        year: nextYear, // Tạo cho năm tiếp theo
        note: `Sổ tài sản năm ${nextYear} được tạo từ kết quả kiểm kê ngày ${new Date().toLocaleDateString('vi-VN')}`
      };

      const resultAction = await dispatch(createAssetBookFromInventory(createRequest));
      
      if (createAssetBookFromInventory.fulfilled.match(resultAction)) {
        const result = resultAction.payload;
        toast.success(`Tạo sổ tài sản thành công! Sổ tài sản năm ${result.year} (năm tiếp theo) đã được tạo từ kết quả kiểm kê.`);
      } else {
        throw new Error(resultAction.payload as string);
      }
      
      // Có thể navigate đến trang quản lý sổ tài sản
      // router.push(`/admin/asset-books/${result.id}`);
      
    } catch (error: any) {
      console.error("Error creating asset book:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi tạo sổ tài sản");
    } finally {
      setIsCreatingAssetBook(false);
    }
  };

  useEffect(() => {}, [filters.sessionUnitId, filters.groupId, filters.unitId]);

  // Define table columns for Fixed Assets
  const fixedAssetsColumns: TableColumn<InventoryResultResponseDto>[] = [
    {
      key: "name",
      title: "Thông tin tài sản",
      width: "300px",
      render: (_, result) => (
        <div className="flex items-center">
          <div>
            <div className="text-sm font-medium text-gray-900">
              {result.asset?.name || 'N/A'}
            </div>
            <div className="text-xs text-gray-500">
              {result.asset?.fixedCode || result.asset?.ktCode || 'N/A'}
            </div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "systemQuantity",
      title: "Số lượng hệ thống",
      width: "120px",
      render: (_, result) => (
        <div className="text-sm text-gray-900 text-center">
          {result.systemQuantity}
        </div>
      ),
      className: "text-center",
    },
    {
      key: "countedQuantity",
      title: "Số lượng kiểm kê",
      width: "120px",
      render: (_, result) => (
        <div className="text-sm text-gray-900 text-center">
          {result.countedQuantity}
        </div>
      ),
      className: "text-center",
    },
    {
      key: "scanMethod",
      title: "Phương pháp",
      width: "100px",
      render: (_, result) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          result.scanMethod === 'RFID' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {getMethodText(result.scanMethod ?? ScanMethod.MANUAL)}
        </span>
      ),
      className: "text-center",
      sortable: true,
    },
    {
      key: "status",
      title: "Trạng thái",
      width: "100px",
      render: (_, result) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(result.status)}`}>
          {getStatusText(result.status)}
        </span>
      ),
      className: "text-center",
      sortable: true,
    },
    {
      key: "actions",
      title: "Thao tác",
      width: "100px",
      render: (_, result) => {
        const hasNoteOrImages = result.note || (result.fileUrls && result.fileUrls.length > 0);
        
        if (!hasNoteOrImages) {
          return <span className="text-gray-400 text-sm">-</span>;
        }

        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openViewModal(
              result.asset?.name || 'Tài sản', 
              result.note, 
              result.fileUrls
            )}
            className="text-blue-600 hover:text-blue-700"
          >
            <Eye className="h-4 w-4 mr-1" />
            Xem
          </Button>
        );
      },
      className: "text-center",
    },
  ];

  // Define table columns for Tools Equipment (same as Fixed Assets)
  const toolsEquipmentColumns: TableColumn<InventoryResultResponseDto>[] = fixedAssetsColumns;

  // Define table columns for Multi-Room Assets
  const multiRoomAssetColumns: TableColumn<AssetInventorySimpleDto>[] = [
    {
      key: "asset",
      title: "Thông tin tài sản",
      width: "300px",
      render: (_, result) => (
        <div className="flex items-center">
          <div>
            <div className="text-sm font-medium text-gray-900">
              {result.asset?.name || 'N/A'}
            </div>
            <div className="text-xs text-gray-500">
              Mã: {result.asset?.fixedCode || result.asset?.ktCode || 'N/A'} | ID: {result.assetId.substring(0, 8)}...
            </div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "systemQuantity",
      title: "Số lượng hệ thống",
      width: "120px",
      render: (_, result) => (
        <div className="text-sm text-gray-900 text-center">
          {result.systemQuantity}
        </div>
      ),
      className: "text-center",
    },
    {
      key: "countedQuantity",
      title: "Số lượng kiểm kê",
      width: "120px",
      render: (_, result) => (
        <div className="text-sm text-gray-900 text-center">
          {result.countedQuantity}
        </div>
      ),
      className: "text-center",
    },
    {
      key: "scanMethod",
      title: "Phương pháp",
      width: "100px",
      render: (_, result) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          result.scanMethod === 'RFID' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {getMethodText(result.scanMethod as ScanMethod ?? ScanMethod.MANUAL)}
        </span>
      ),
      className: "text-center",
      sortable: true,
    },
    {
      key: "status",
      title: "Trạng thái",
      width: "100px",
      render: (_, result) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(result.status)}`}>
          {getStatusText(result.status as InventoryResultStatus)}
        </span>
      ),
      className: "text-center",
      sortable: true,
    },
    {
      key: "note",
      title: "Ghi chú",
      width: "150px",
      render: (_, result) => (
        <div className="text-sm text-gray-700">
          {result.note ? truncateText(result.note, 30) : '-'}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className=" mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quản lý kết quả kiểm kê</h1>
                <p className="text-gray-500 mt-1">Theo dõi và quản lý kết quả kiểm kê tài sản</p>
              </div>
            </div>
            <div className="flex space-x-3">
              {/* Button tạo sổ tài sản */}
              {(() => {
                const { canCreate } = canCreateAssetBook();
                return canCreate && (
                  <Button
                    onClick={handleCreateAssetBook}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-200 hover:shadow-lg"
                    disabled={isCreatingAssetBook}
                  >
                    {isCreatingAssetBook ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2" />
                    )}
                    {isCreatingAssetBook ? "Đang tạo..." : `Tạo sổ tài sản ${new Date().getFullYear() + 1}`}
                  </Button>
                );
              })()}
              
              <Button
                onClick={handleExportExcel}
                className="bg-green-600 hover:bg-green-700 text-white shadow-md transition-all duration-200 hover:shadow-lg"
                disabled={loading || (!roomInventoryResults && !multiRoomInventoryResults) || (!filters.roomId && !filters.unitId)}
              >
                <Download className="h-4 w-4 mr-2" />
                Xuất Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
              <Search className="h-5 w-5 mr-2 text-blue-600" />
              Bộ lọc tìm kiếm
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className={`grid grid-cols-1 gap-6 ${
              currentScopeType === 'GLOBAL' ? 'md:grid-cols-4' : 
              currentScopeType === 'CHILD_UNITS' ? 'md:grid-cols-3' : 
              'md:grid-cols-1'
            }`}>
              {/* Cơ sở - Chỉ hiển thị với GLOBAL scope */}
              {currentScopeType === 'GLOBAL' && (
                <div className="space-y-3">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Building className="h-4 w-4 mr-2 text-blue-500" />
                    Cơ sở
                  </label>
                  <Select
                    value={filters.sessionUnitId}
                    onChange={(e) => {
                      setFilters((prev) => ({
                        ...prev,
                        sessionUnitId: e.target.value,
                        groupId: "",
                        unitId: "",
                        roomId: "",
                      }));
                      const selectedSessionUnit = sessionUnits.find(
                        (su: InventorySessionUnit) => su.id === e.target.value
                      );
                      setGroups(selectedSessionUnit?.subInventory?.groups ?? []);
                    }}
                    className="w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <SelectOption value="">Chọn cơ sở</SelectOption>
                    {sessionUnits &&
                      sessionUnits.map((sessionUnit: InventorySessionUnit) => (
                        <SelectOption key={sessionUnit.id} value={sessionUnit.id}>
                          {sessionUnit.unit?.name || "Đơn vị không xác định"}
                        </SelectOption>
                      ))}
                  </Select>
                </div>
              )}

              {/* Nhóm - Hiển thị với GLOBAL và CHILD_UNITS scope */}
              {(currentScopeType === 'GLOBAL' || currentScopeType === 'CHILD_UNITS') && (
                <div className="space-y-3">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Users className="h-4 w-4 mr-2 text-green-500" />
                    Nhóm
                  </label>
                  <Select
                    value={filters.groupId}
                    onChange={(e) => {
                      setFilters((prev) => ({
                        ...prev,
                        groupId: e.target.value,
                        unitId: "",
                        roomId: "",
                      }));
                      const selectedGroup = groups.find(
                        (g: InventoryGroup) => g.id === e.target.value
                      );
                      setAssignments(selectedGroup?.assignments || []);
                    }}
                    disabled={!filters.sessionUnitId}
                    className="w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200 disabled:bg-gray-50"
                  >
                    <SelectOption value="">Chọn nhóm</SelectOption>
                    {groups.map((group: InventoryGroup) => (
                      <SelectOption key={group.id} value={group.id}>
                        {group.name}
                      </SelectOption>
                    ))}
                  </Select>
                </div>
              )}

              {/* Phân công đơn vị - Hiển thị với GLOBAL và CHILD_UNITS scope */}
              {(currentScopeType === 'GLOBAL' || currentScopeType === 'CHILD_UNITS') && (
                <div className="space-y-3">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Package className="h-4 w-4 mr-2 text-purple-500" />
                    Phân công
                  </label>
                  <Select
                    value={filters.unitId}
                    onChange={(e) => {
                      const selectedAssignmentId = e.target.value;
                      setFilters((prev) => ({
                        ...prev,
                        unitId: selectedAssignmentId,
                        roomId: "",
                      }));
                      // Load rooms khi chọn phân công
                      if (selectedAssignmentId) {
                        dispatch(getUnitRooms(selectedAssignmentId));
                      }
                    }}
                    disabled={!filters.groupId}
                    className="w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200 disabled:bg-gray-50"
                  >
                    <SelectOption value="">Chọn phân công</SelectOption>
                    {assignments.map((assignment: InventoryGroupAssignment) => (
                      <SelectOption
                        key={assignment.id}
                        value={assignment.unit?.id}
                      >
                        {assignment.unit?.name || "Đơn vị không xác định"}
                      </SelectOption>
                    ))}
                  </Select>
                </div>
              )}

              {/* Phòng - Hiển thị với GLOBAL, CHILD_UNITS và UNIT scope */}
              {(currentScopeType === 'GLOBAL' || currentScopeType === 'CHILD_UNITS' || currentScopeType === 'UNIT') && (
                <div className="space-y-3">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                    Phòng
                  </label>
                  <Select
                    value={filters.roomId}
                    onChange={(e) => {
                      setFilters((prev) => ({ ...prev, roomId: e.target.value }));
                    }}
                    disabled={
                      currentScopeType === 'UNIT' 
                        ? false // Với UNIT scope, luôn enable vì unitId đã có từ currentUser.unitId
                        : !filters.unitId // Với GLOBAL và CHILD_UNITS, cần có unitId từ filter
                    }
                    className="w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200 disabled:bg-gray-50"
                  >
                    <SelectOption value="">Chọn phòng/khoa</SelectOption>
                    {unitRooms.map((room: Room) => (
                      <SelectOption key={room.id} value={room.id}>
                        {room.roomCode}
                      </SelectOption>
                    ))}
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Khu vực hiển thị kết quả */}
        <Card className="bg-white shadow-sm border-slate-200">
          <CardContent className="p-0">
            {(loading || multiRoomInventoryLoading) ? (
              <div className="text-center py-16">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-ping"></div>
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600 relative z-10" />
                </div>
                <p className="text-gray-600 text-lg">Đang tải kết quả kiểm kê...</p>
                <p className="text-gray-400 text-sm mt-2">Vui lòng chờ trong giây lát</p>
              </div>
            ) : multiRoomInventoryResults && !filters.roomId ? (
                /* Hiển thị kết quả nhiều phòng */
                <div className="space-y-0">
                  {/* Header kết quả nhiều phòng */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Building className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Kết quả kiểm kê nhiều phòng
                          </h3>
                          <p className="text-sm text-gray-600">
                            Tổng số: {multiRoomInventoryResults.totalRooms} phòng | 
                            Trang {multiRoomInventoryResults.page}/{multiRoomInventoryResults.totalPages}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {/* Filter loại tài sản */}
                        <Select
                          value={filters.multiRoomAssetType}
                          onChange={(e) => {
                            setFilters((prev) => ({
                              ...prev,
                              multiRoomAssetType: e.target.value,
                            }));
                          }}
                          className="w-48 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        >
                          <SelectOption value="ALL">Tất cả loại tài sản</SelectOption>
                          <SelectOption value="FIXED_ASSET">Tài sản cố định</SelectOption>
                          <SelectOption value="TOOLS_EQUIPMENT">Công cụ dụng cụ</SelectOption>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Pagination controls và thống kê */}
                  {multiRoomInventoryResults.totalPages > 1 && (
                    <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Hiển thị {Math.min((multiRoomInventoryResults.page - 1) * multiRoomInventoryResults.limit + 1, multiRoomInventoryResults.totalRooms)} - {Math.min(multiRoomInventoryResults.page * multiRoomInventoryResults.limit, multiRoomInventoryResults.totalRooms)} trên tổng số {multiRoomInventoryResults.totalRooms} phòng
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {/* Số phòng mỗi trang */}
                          <span className="text-sm text-gray-600">Phòng mỗi trang:</span>
                          <Select
                            value={multiRoomInventoryResults.limit.toString()}
                            onChange={(e) => {
                              const newLimit = parseInt(e.target.value);
                              const newFilters = {
                                unitId: filters.unitId,
                                page: 1, // Reset về trang 1 khi đổi limit
                                limit: newLimit,
                                assetType: filters.multiRoomAssetType !== "ALL" ? filters.multiRoomAssetType : undefined,
                              };
                              dispatch(getMultiRoomInventoryResults(newFilters));
                            }}
                            className="w-20 border-slate-300"
                          >
                            <SelectOption value="5">5</SelectOption>
                            <SelectOption value="10">10</SelectOption>
                            <SelectOption value="20">20</SelectOption>
                            <SelectOption value="50">50</SelectOption>
                          </Select>

                          {/* Navigation buttons */}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!multiRoomInventoryResults.hasPrev}
                            onClick={() => {
                              if (multiRoomInventoryResults.hasPrev) {
                                const newFilters = {
                                  unitId: filters.unitId,
                                  page: multiRoomInventoryResults.page - 1,
                                  limit: multiRoomInventoryResults.limit,
                                  assetType: filters.multiRoomAssetType !== "ALL" ? filters.multiRoomAssetType : undefined,
                                };
                                dispatch(getMultiRoomInventoryResults(newFilters));
                              }
                            }}
                          >
                            ← Trước
                          </Button>
                          
                          <span className="px-3 py-1 text-sm bg-white border rounded-md">
                            {multiRoomInventoryResults.page} / {multiRoomInventoryResults.totalPages}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!multiRoomInventoryResults.hasNext}
                            onClick={() => {
                              if (multiRoomInventoryResults.hasNext) {
                                const newFilters = {
                                  unitId: filters.unitId,
                                  page: multiRoomInventoryResults.page + 1,
                                  limit: multiRoomInventoryResults.limit,
                                  assetType: filters.multiRoomAssetType !== "ALL" ? filters.multiRoomAssetType : undefined,
                                };
                                dispatch(getMultiRoomInventoryResults(newFilters));
                              }
                            }}
                          >
                            Tiếp →
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}                {/* Danh sách phòng */}
                <div className="p-6">
                  {multiRoomInventoryResults.rooms.length > 0 ? (
                    <div className="space-y-8">
                      {multiRoomInventoryResults.rooms.map((room: RoomInventorySimpleDto) => (
                        <div key={room.roomId} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Header phòng */}
                          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                              <h4 className="text-md font-semibold text-gray-800 flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                                {room.roomName}
                              </h4>
                              <div className="text-sm text-gray-600">
                                Tổng: {room.fixedAssets.length + (room.toolsEquipment?.length || 0)} tài sản
                              </div>
                            </div>
                          </div>

                          {/* Nội dung phòng */}
                          <div className="p-4 space-y-6">
                            {/* Tài sản cố định */}
                            {room.fixedAssets && room.fixedAssets.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                  <Package className="h-4 w-4 mr-2" />
                                  Tài sản cố định ({room.fixedAssets.length})
                                </h5>
                                <Table<AssetInventorySimpleDto>
                                  columns={multiRoomAssetColumns}
                                  data={room.fixedAssets}
                                  emptyText="Không có tài sản cố định"
                                />
                              </div>
                            )}

                            {/* Công cụ dụng cụ */}
                            {room.toolsEquipment && room.toolsEquipment.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                  <Package className="h-4 w-4 mr-2" />
                                  Công cụ dụng cụ ({room.toolsEquipment.length})
                                </h5>
                                <Table<AssetInventorySimpleDto>
                                  columns={multiRoomAssetColumns}
                                  data={room.toolsEquipment}
                                  emptyText="Không có công cụ dụng cụ"
                                />
                              </div>
                            )}

                            {/* Trường hợp phòng không có tài sản */}
                            {(!room.fixedAssets || room.fixedAssets.length === 0) &&
                             (!room.toolsEquipment || room.toolsEquipment.length === 0) && (
                              <div className="text-center py-8 text-gray-500">
                                <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                <p>Không có kết quả kiểm kê trong phòng này</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl p-12 text-center bg-gradient-to-br from-gray-50 to-slate-50">
                      <div className="max-w-md mx-auto">
                        <div className="p-4 bg-gray-100 rounded-full inline-block mb-4">
                          <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Không có kết quả kiểm kê</h3>
                        <p className="text-gray-500">
                          {filters.multiRoomAssetType !== "ALL" 
                            ? `Không có kết quả kiểm kê cho loại tài sản "${filters.multiRoomAssetType === 'FIXED_ASSET' ? 'Tài sản cố định' : 'Công cụ dụng cụ'}" trong đơn vị này.`
                            : "Không có kết quả kiểm kê nào trong đơn vị này."
                          }
                        </p>
                        {filters.multiRoomAssetType !== "ALL" && (
                          <p className="text-sm text-gray-400 mt-2">
                            Thử thay đổi bộ lọc loại tài sản để xem thêm kết quả.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : roomInventoryResults ? (
              <div className="space-y-0">
                {/* Header kết quả */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Eye className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Kết quả kiểm kê - Phòng: {unitRooms.find(r => r.id === filters.roomId)?.roomCode || 'N/A'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Tổng số: {roomInventoryResults.summary?.totalAssets || 0} tài sản
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thống kê tổng quan */}
                <div className="p-6 border-b border-slate-100">
                  <h4 className="text-md font-medium text-gray-700 mb-4">Thống kê tổng quan</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-600">Tài sản cố định</div>
                          <div className="text-2xl font-bold text-gray-900 mt-1">
                            {roomInventoryResults.summary?.totalFixedAssets || 0}
                          </div>
                        </div>
                        <Package className="h-5 w-5 text-gray-500" />
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-600">Công cụ dụng cụ</div>
                          <div className="text-2xl font-bold text-gray-900 mt-1">
                            {roomInventoryResults.summary?.totalToolsEquipment || 0}
                          </div>
                        </div>
                        <Package className="h-5 w-5 text-gray-500" />
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-600">Khớp</div>
                          <div className="text-2xl font-bold text-gray-900 mt-1">
                            {roomInventoryResults.summary?.matchedAssets || 0}
                          </div>
                        </div>
                        <BarChart3 className="h-5 w-5 text-gray-500" />
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-600">Thiếu</div>
                          <div className="text-2xl font-bold text-gray-900 mt-1">
                            {roomInventoryResults.summary?.missingAssets || 0}
                          </div>
                        </div>
                        <Search className="h-5 w-5 text-gray-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chi tiết kết quả kiểm kê */}
                <div className="p-6 space-y-8">
                  {/* Tài sản cố định */}
                  {roomInventoryResults.fixedAssets && roomInventoryResults.fixedAssets.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                          <Package className="h-5 w-5 mr-2" />
                          Tài sản cố định ({roomInventoryResults.fixedAssets.length} tài sản)
                        </h4>
                      </div>
                      <Table<InventoryResultResponseDto>
                        columns={fixedAssetsColumns}
                        data={roomInventoryResults.fixedAssets}
                        emptyText="Không có tài sản cố định"
                      />
                    </div>
                  )}

                  {/* Công cụ dụng cụ */}
                  {roomInventoryResults.toolsEquipment && roomInventoryResults.toolsEquipment.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                          <Package className="h-5 w-5 mr-2" />
                          Công cụ dụng cụ ({roomInventoryResults.toolsEquipment.length} tài sản)
                        </h4>
                      </div>
                      <Table<InventoryResultResponseDto>
                        columns={toolsEquipmentColumns}
                        data={roomInventoryResults.toolsEquipment}
                        emptyText="Không có công cụ dụng cụ"
                      />
                    </div>
                  )}

                {/* Trường hợp không có dữ liệu */}
                {(!roomInventoryResults.fixedAssets || roomInventoryResults.fixedAssets.length === 0) &&
                 (!roomInventoryResults.toolsEquipment || roomInventoryResults.toolsEquipment.length === 0) && (
                  <div className="border border-slate-200 rounded-xl p-12 text-center bg-gradient-to-br from-gray-50 to-slate-50">
                    <div className="max-w-md mx-auto">
                      <div className="p-4 bg-gray-100 rounded-full inline-block mb-4">
                        <Search className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-700 mb-2">Không có kết quả kiểm kê</h3>
                      <p className="text-gray-500">Không có kết quả kiểm kê nào trong phòng này. Vui lòng kiểm tra lại hoặc thực hiện kiểm kê.</p>
                    </div>
                  </div>
                )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-16 bg-gradient-to-br from-gray-50 to-slate-50">
                <div className="max-w-md mx-auto">
                  <div className="p-4 bg-blue-100 rounded-full inline-block mb-4">
                    <Search className="h-12 w-12 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">Bắt đầu tìm kiếm</h3>
                  <p className="text-gray-500">
                    {filters.unitId 
                      ? "Chọn phòng/khoa từ bộ lọc để xem kết quả kiểm kê chi tiết, hoặc để xem tất cả phòng trong đơn vị" 
                      : "Chọn đơn vị và phòng/khoa từ bộ lọc để xem kết quả kiểm kê"
                    }
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal hiển thị ghi chú và hình ảnh */}
      {viewModal.isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Chi tiết tài sản</h2>
                  <p className="text-sm text-gray-500">{viewModal.title}</p>
                </div>
              </div>
              <button
                onClick={closeViewModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
              {/* Ghi chú */}
              {viewModal.note && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-blue-500" />
                    Ghi chú
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {viewModal.note}
                    </p>
                  </div>
                </div>
              )}

              {/* Hình ảnh */}
              {viewModal.imageUrls && viewModal.imageUrls.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <Camera className="h-4 w-4 mr-2 text-green-500" />
                    Hình ảnh ({viewModal.imageUrls.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {viewModal.imageUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Hình ảnh ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border border-gray-200 transition-transform duration-200 group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDIwMCAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTkyIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA3Mkw5MCA2MkwxMTAgODJMMTIwIDcyTDE0MCA5MkwxNDAgMTMySDYwVjkyTDgwIDcyWiIgZmlsbD0iI0Q1REFERiIvPgo8Y2lyY2xlIGN4PSI4NSIgY3k9IjkyIiByPSI2IiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTYwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM2QjczODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPktow7RuZyB0YWkgxJHGsOG7o2MgaMOsbmggYW5oPC90ZXh0Pgo8L3N2Zz4K';
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                          {index + 1}/{viewModal.imageUrls?.length || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trường hợp không có ghi chú và hình ảnh */}
              {!viewModal.note && (!viewModal.imageUrls || viewModal.imageUrls.length === 0) && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Không có thông tin chi tiết</h3>
                  <p className="text-gray-500">Không có ghi chú hoặc hình ảnh cho tài sản này</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
              <Button
                onClick={closeViewModal}
                variant="outline"
                className="min-w-[100px]"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
