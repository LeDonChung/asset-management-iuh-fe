"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useAppDispatch } from "@/lib/store/hooks";
import {
  resetMoveState,
  removeAssetFromMove,
  createMovement,
  MoveStatus,
  setSelectedAssetsForMove,
  setMoveContext,
} from "@/lib/store/slices/moveSlice";
import { getUnitCampus } from "@/lib/store/slices/unitSlice";
import { fetchRoomsByUnitId } from "@/lib/store/slices/roomSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableColumn } from "@/components/ui/table";
import {
  ArrowLeft,
  Package2,
  Building2,
  MapPin,
  Save,
  RefreshCw,
  ChevronDown,
  Check,
  ArrowRight,
  Trash2,
  Move,
} from "lucide-react";
import Link from "next/link";
import {
  Asset,
  Unit,
  Room,
  AccessScopeType,
} from "@/types/asset";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

// CardSelect Component
interface CardSelectProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  required?: boolean;
}

const CardSelect: React.FC<CardSelectProps> = ({
  label,
  icon,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  loading = false,
  className = "",
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selectedOption = options.find((opt) => opt.value === value);

  // Update dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isOpen && !target.closest(".card-select-container")) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative group card-select-container ${className}`}>
      <label className={`block font-medium text-gray-700 mb-2 ${className.includes('text-lg') ? 'text-base' : className.includes('text-base') ? 'text-sm' : 'text-xs'}`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full ${className.includes('text-lg') ? 'min-h-[3.5rem] text-lg' : className.includes('text-base') ? 'min-h-[2.75rem] text-base' : 'min-h-[2.5rem] text-sm'} pl-3 pr-10 border border-gray-200 rounded-lg 
            bg-white text-left transition-all duration-200
            hover:border-gray-300 hover:shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${isOpen ? "ring-2 ring-blue-500 border-blue-500" : ""}
            ${loading ? "cursor-wait" : "cursor-pointer"}
            relative
          `}
        >
          <div className="flex items-center justify-between h-full py-2.5">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {icon && (
                <div
                  className={`transition-colors flex-shrink-0 ${
                    isOpen ? "text-blue-500" : "text-gray-400"
                  }`}
                >
                  {icon}
                </div>
              )}
              <span
                className={`flex-1 truncate ${
                  selectedOption ? "text-gray-900" : "text-gray-500"
                }`}
                title={selectedOption ? selectedOption.label : placeholder}
              >
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-2 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {loading && (
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-10">
            <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
          </div>
        )}

        {isOpen && (
          <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors
                  flex items-start justify-between min-h-[3rem]
                  ${
                    option.value === value
                      ? "bg-blue-50 text-blue-900"
                      : "text-gray-900"
                  }
                `}
              >
                <span className="flex-1 leading-relaxed break-words">
                  {option.label}
                </span>
                {option.value === value && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function MoveCreatePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  // Access scope types
  const accessScopeTypes = user?.accessScopeTypes || [];
  const hasGlobalAccess = accessScopeTypes.includes(AccessScopeType.GLOBAL);
  const hasChildUnitsAccess = accessScopeTypes.includes(AccessScopeType.CHILD_UNITS);
  const hasUnitAccess = accessScopeTypes.includes(AccessScopeType.UNIT);
  const hasSelfAccess = accessScopeTypes.includes(AccessScopeType.SELF);

  const {
    selectedAssetsForMove,
    moveContext,
    currentMovement,
    loading,
    error,
    isCreatingMovement,
    createMovementError,
  } = useSelector((state: RootState) => state.move);
  
  const { campuses } = useSelector((state: RootState) => state.unit);
  const { loading: roomsLoading } = useSelector((state: RootState) => state.room);

  // State cho việc chọn đơn vị và phòng nhận
  const [selectedCampusId, setSelectedCampusId] = useState("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [movementNote, setMovementNote] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<MoveStatus>(MoveStatus.DRAFT);
  const [selectedDate, setSelectedDate] = useState(() => {
    // Mặc định là ngày hiện tại
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State cho ghi chú tài sản
  const [assetNotes, setAssetNotes] = useState<Record<string, string>>({});

  // Load move draft from sessionStorage if available
  useEffect(() => {
    const loadMoveDraft = () => {
      try {
        const savedDraft = sessionStorage.getItem('moveDraft');
        if (savedDraft) {
          const moveDraft = JSON.parse(savedDraft);
          console.log("Loading move draft from sessionStorage:", moveDraft);

          // Restore filter context
          if (moveDraft.filterContext) {
            const { filterContext } = moveDraft;
            if (filterContext.selectedCampusId) {
              setSelectedCampusId(filterContext.selectedCampusId);
            }
            if (filterContext.selectedUnitId) {
              setSelectedUnitId(filterContext.selectedUnitId);
            }
            if (filterContext.selectedRoomId) {
              setSelectedRoomId(filterContext.selectedRoomId);
            }
          }

          // Restore assets to Redux if not already loaded
          if (selectedAssetsForMove.length === 0 && moveDraft.assets) {
            dispatch(setSelectedAssetsForMove(moveDraft.assets));
            
            // Restore move context
            if (moveDraft.moveContext) {
              dispatch(setMoveContext(moveDraft.moveContext));
            }
          }

          // Set default movement note
          if (!movementNote && moveDraft.assets?.length > 0) {
            const roomName = moveDraft.filterContext?.roomName || "phòng được chọn";
            setMovementNote(`Di chuyển ${moveDraft.assets.length} tài sản đến ${roomName}`);
          }

          // Thông báo đã khôi phục dữ liệu
          if (moveDraft.assets?.length > 0) {
            toast.success(`Đã khôi phục ${moveDraft.assets.length} tài sản từ phiên trước`);
          }
        }
      } catch (error) {
        console.error("Error loading move draft from sessionStorage:", error);
      }
    };

    loadMoveDraft();
  }, [dispatch, selectedAssetsForMove.length, movementNote]);

  // Redirect nếu không có tài sản nào được chọn và không có draft
  useEffect(() => {
    if (selectedAssetsForMove.length === 0) {
      // Kiểm tra xem có draft trong sessionStorage không
      const savedDraft = sessionStorage.getItem('moveDraft');
      if (!savedDraft) {
        // Delay redirect một chút để tránh race condition
        const timer = setTimeout(() => {
          router.push("/asset/asset-book");
        }, 100);

        return () => clearTimeout(timer);
      }
    }
  }, [selectedAssetsForMove, router]);

  // Load initial data based on access scope and context
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const campusesResult = await dispatch(getUnitCampus()).unwrap();
        if (campusesResult && user) {
          if (hasChildUnitsAccess) {
            // Child units access: unitId chính là campus ID
            const userCampus = campusesResult.find(
              (campus: Unit) => campus.id === user?.unitId
            );
            if (userCampus) {
              setUnits(userCampus.childUnits ?? []);
              setSelectedCampusId(userCampus.id);
            } else {
              setUnits([]);
              setSelectedCampusId("");
            }
          } else if (hasUnitAccess || hasSelfAccess) {
            // Unit/Self access: Tìm campus chứa đơn vị của user
            let userUnit: Unit | undefined;
            let userCampus: Unit | undefined;

            const unitId = user.unitId;

            for (const campus of campusesResult) {
              const foundUnit = campus.childUnits?.find(
                (unit: Unit) => unit.id === unitId
              );
              if (foundUnit) {
                userUnit = foundUnit;
                userCampus = campus;
                break;
              }
            }

            if (userCampus && userUnit) {
              setSelectedCampusId(userCampus.id);
              setUnits(userCampus.childUnits ?? []);
              // Unit/Self access chỉ di chuyển trong đơn vị của mình
              setSelectedUnitId(userUnit.id);
            }
          } else if (hasGlobalAccess) {
            // Global access có thể chọn tất cả
            // Không set gì cả, để user tự chọn
          }
        }
      } catch (e: any) {
        toast.error(e.message || "Có lỗi xảy ra khi tải dữ liệu.");
      }
    };
    loadInitialData();
  }, [dispatch, hasGlobalAccess, hasChildUnitsAccess, hasUnitAccess, hasSelfAccess, user, moveContext]);

  // Update units when campus changes
  useEffect(() => {
    if (selectedCampusId) {
      const campus = campuses.find((campus) => campus.id === selectedCampusId);
      setUnits(campus?.childUnits ?? []);
      setSelectedUnitId(""); // Reset unit selection
      setRooms([]); // Reset rooms
      setSelectedRoomId(""); // Reset room selection
    }
  }, [selectedCampusId, campuses]);

  // Fetch rooms when unit changes
  useEffect(() => {
    const fetchRooms = async () => {
      if (selectedUnitId) {
        try {
          const res = await dispatch(
            fetchRoomsByUnitId(selectedUnitId)
          ).unwrap();
          setRooms(res);
        } catch (error) {
          console.error("Error fetching rooms:", error);
          setRooms([]);
        }
      } else {
        setRooms([]);
      }
    };
    fetchRooms();
  }, [dispatch, selectedUnitId]);

  const handleCancelMove = () => {
    // Xóa move draft khỏi sessionStorage
    sessionStorage.removeItem('moveDraft');
    // Xóa tất cả dữ liệu movement
    dispatch(resetMoveState());
    // Quay về trang sổ tài sản
    router.push("/asset/asset-book");
  };

  const handleRemoveAsset = (assetId: string) => {
    dispatch(removeAssetFromMove(assetId));
    // Xóa các state liên quan
    setAssetNotes((prev) => {
      const copy = { ...prev };
      delete copy[assetId];
      return copy;
    });
  };

  const handleNoteChange = (assetId: string, note: string) => {
    setAssetNotes((prev) => ({ ...prev, [assetId]: note }));
  };

  const handleSubmitMove = async () => {
    if (!selectedRoomId) {
      toast.error("Vui lòng chọn phòng nhận!");
      return;
    }

    if (!selectedDate) {
      toast.error("Vui lòng chọn ngày tạo yêu cầu!");
      return;
    }

    // Kiểm tra ngày không được lớn hơn ngày hiện tại
    const selectedDateObj = new Date(selectedDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of day for comparison

    setIsSubmitting(true);

    try {
      const roomName = rooms.find((r) => r.id === selectedRoomId)?.name || "";

      // Tạo movement items từ selected assets
      const movementItems = selectedAssetsForMove.map((asset) => ({
        assetId: asset.id,
        fromRoomId: asset.currentRoom?.id || "",
        toRoomId: selectedRoomId,
        note: assetNotes[asset.id] || `Di chuyển đến ${roomName}`,
      }));

      // Tạo movement DTO cho API
      const createMovementDto = {
        items: movementItems,
        requestNote: movementNote || `Di chuyển ${selectedAssetsForMove.length} tài sản đến ${roomName}`,
        status: selectedStatus,
        approvalNote: selectedStatus === MoveStatus.PENDING_APPROVAL ? "Tự động phê duyệt" : undefined,
        createdAt: new Date(selectedDate).toISOString(),
      };

      // Gọi API để tạo movement
      const result = await dispatch(createMovement(createMovementDto)).unwrap();

      // Kiểm tra kết quả
      if (result && result.id) {
        // Xóa move draft khỏi sessionStorage
        sessionStorage.removeItem('moveDraft');
        
        // Hiển thị thông báo thành công
        const statusText = selectedStatus === MoveStatus.DRAFT ? "nháp" : "đề xuất";
        toast.success(
          `Tạo yêu cầu di chuyển ${statusText} thành công! Mã yêu cầu: ${result.id}`
        );

        // Reset state and redirect
        dispatch(resetMoveState());
        router.push("/asset/asset-book");
      } else {
        throw new Error("Không nhận được phản hồi hợp lệ từ máy chủ");
      }
    } catch (error: any) {
      console.error("Error creating movement:", error);
      toast.error(error.message || "Có lỗi xảy ra khi tạo yêu cầu di chuyển.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define table columns for selected assets
  const columns: TableColumn<Asset>[] = [
    {
      key: "codes",
      title: "Mã TSCD / Mã KT",
      render: (_, record) => (
        <div className="text-sm font-medium text-gray-900">
          <div>{record.fixedCode}</div>
          <div className="text-xs text-gray-500">{record.ktCode}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "name",
      title: "Tên tài sản",
      render: (_, record) => (
        <div className="text-sm font-medium text-gray-900">{record.name}</div>
      ),
      sortable: true,
    },
    {
      key: "specs",
      title: "Thông số KT",
      render: (_, record) => (
        <div className="text-sm text-gray-500">{record.specs || "-"}</div>
      ),
    },
    {
      key: "unit",
      title: "ĐVT",
      render: (_, record) => (
        <div className="text-sm text-gray-900 text-center">{record.unit}</div>
      ),
      className: "text-center",
    },
    {
      key: "quantity",
      title: "Số lượng",
      render: (_, record) => (
        <div className="text-sm font-medium text-gray-900 text-center">
          {record.quantity}
        </div>
      ),
      sortable: true,
      className: "text-center",
    },
    {
      key: "currentLocation",
      title: "Vị trí hiện tại",
      render: (_, record) => (
        <div className="text-sm text-gray-900">
          {record.currentRoom ? (
            <div className="space-y-1">
              <div className="flex items-center ">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="font-medium">
                  {record.currentRoom.roomCode || record.currentRoom.name}
                </span>
              </div>
              {record.currentRoom.unit && (
                <div className="flex items-center text-red-500 text-xs">
                  <Building2 className="h-3 w-3 mr-1" />
                  <span>{record.currentRoom.unit.name}</span>
                </div>
              )}
            </div>
          ) : (
            <span className="text-gray-400 italic">Chưa phân bổ</span>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      key: "note",
      title: "Ghi chú",
      render: (_, record) => (
        <input
          type="text"
          className="border rounded px-2 py-1 text-xs w-full"
          placeholder="Nhập ghi chú..."
          value={assetNotes[record.id] || ""}
          onChange={(e) => handleNoteChange(record.id, e.target.value)}
          disabled={isSubmitting || isCreatingMovement}
        />
      ),
    },
    {
      key: "actions",
      title: "Thao tác",
      render: (_, record) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:bg-red-50"
          onClick={() => handleRemoveAsset(record.id)}
          disabled={isSubmitting || isCreatingMovement}
        >
            <Trash2 className="h-4 w-4 mr-1" />
        </Button>
      ),
      className: "text-center",
    },
  ];

  // Loading state khi chưa có dữ liệu
  if (selectedAssetsForMove.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <Package2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Đang tải dữ liệu...
            </h2>
            <p className="text-gray-600 mb-6">Vui lòng đợi trong giây lát</p>
          </div>
          <Link href="/asset/asset-book">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại Sổ tài sản
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/asset/asset-book">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Di chuyển tài sản
                </h1>
                <p className="text-gray-600">
                  Hoàn tất thông tin di chuyển cho{" "}
                  {selectedAssetsForMove.length} tài sản đã chọn
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleCancelMove}
                variant="outline"
                disabled={isSubmitting || isCreatingMovement}
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={handleSubmitMove}
                disabled={isSubmitting || isCreatingMovement || !selectedRoomId}
                className="flex items-center bg-green-600 hover:bg-green-700 text-white"
              >
                {isSubmitting || isCreatingMovement ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {selectedStatus === MoveStatus.DRAFT 
                      ? "Lưu nháp yêu cầu di chuyển"
                      : "Tạo đề xuất di chuyển"
                    }
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Room Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-300 mb-6 ">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-100 ">
            <div className="flex items-center space-x-3">
              <Move className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Chọn phòng nhận
              </h3>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Campus Selection (Global access only) */}
              {hasGlobalAccess && (
                <CardSelect
                  label="Cơ sở"
                  icon={<></>}
                  value={selectedCampusId}
                  onChange={setSelectedCampusId}
                  options={[
                    { value: "", label: "Chọn cơ sở" },
                    ...campuses.map((campus) => ({
                      value: campus.id,
                      label: campus.name,
                    })),
                  ]}
                  placeholder="Chọn cơ sở"
                  disabled={isSubmitting || isCreatingMovement}
                  required
                  className="text-base"
                />
              )}

              {/* Unit Selection */}
              {(hasChildUnitsAccess || hasGlobalAccess) && (
                <CardSelect
                  label="Đơn vị"
                  icon={<></>}
                  value={selectedUnitId}
                  onChange={setSelectedUnitId}
                  options={[
                    { value: "", label: "Chọn đơn vị" },
                    ...(units?.map((unit) => ({
                      value: unit.id,
                      label: unit.name,
                    })) || []),
                  ]}
                  placeholder="Chọn đơn vị"
                  disabled={isSubmitting || isCreatingMovement || (hasGlobalAccess && !selectedCampusId)}
                  required
                  className="text-base"
                />
              )}

              {/* Room Selection */}
              <CardSelect
                label="Phòng nhận"
                icon={<></>}
                value={selectedRoomId}
                onChange={setSelectedRoomId}
                options={[
                  { value: "", label: "Chọn phòng nhận" },
                  ...(rooms?.map((room) => ({
                    value: room.id,
                    label: `${room.roomCode} - ${room.name}`,
                  })) || []),
                ]}
                placeholder="Chọn phòng nhận"
                disabled={isSubmitting || isCreatingMovement || !selectedUnitId}
                loading={roomsLoading}
                required
                className="text-base"
              />
            </div>

            {/* Movement Note */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú cho yêu cầu di chuyển
              </label>
              <Input
                placeholder="Nhập ghi chú cho yêu cầu di chuyển (tùy chọn)..."
                value={movementNote}
                onChange={(e) => setMovementNote(e.target.value)}
                disabled={isSubmitting || isCreatingMovement}
                className="w-full"
              />
            </div>

            {/* Created Date */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày di chuyển <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                disabled={isSubmitting || isCreatingMovement}
                className="w-full"
              />
            </div>

            {/* Movement Status */}
            <div className="mt-6">
              <CardSelect
                label="Trạng thái yêu cầu"
                icon={<></>}
                value={selectedStatus}
                onChange={(value) => setSelectedStatus(value as MoveStatus)}
                options={[
                  { value: MoveStatus.DRAFT, label: "Nháp" },
                  { value: MoveStatus.PENDING_APPROVAL, label: "Đề xuất" },
                ]}
                placeholder="Chọn trạng thái yêu cầu"
                disabled={isSubmitting || isCreatingMovement}
                required
                className="text-base"
              />
            </div>
          </div>
        </div>

        {/* Assets Table */}
        <Table<Asset>
          title="Tài sản đã chọn để di chuyển"
          columns={columns}
          data={selectedAssetsForMove}
          loading={false}
          emptyText="Không có tài sản nào được chọn"
          emptyIcon={
            <Package2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          }
        />
      </div>
    </div>
  );
}
