"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useAppDispatch } from "@/lib/store/hooks";
import {
  resetTransactionState,
  removeAssetFromHandover,
  createTransaction,
  setSelectedAssetsForHandover,
  setHandoverContext,
} from "@/lib/store/slices/transactionSlice";
import { getUnitCampus } from "@/lib/store/slices/unitSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableColumn } from "@/components/ui/table";
import {
  ArrowLeft,
  Package2,
  Building2,
  MapPin,
  Save,
  Search,
  RefreshCw,
  ChevronDown,
  Check,
  ArrowRight,
  ArrowUpDown,
  Trash2,
  ChevronRight,
  Plus,
} from "lucide-react";
import Link from "next/link";
import {
  Asset,
  AssetTransaction,
  Unit,
  TransactionType,
  TransactionStatus,
  AccessScopeType,
} from "@/types/asset";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import AssetBookSelectionModal from "@/components/asset/AssetBookSelectionModal";

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

export default function TransactionPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  const accessScopeTypes = user?.accessScopeTypes || [];
  const hasGlobalAccess = accessScopeTypes.includes(AccessScopeType.GLOBAL);
  const hasChildUnitsAccess = accessScopeTypes.includes(AccessScopeType.CHILD_UNITS);
  const hasUnitAccess = accessScopeTypes.includes(AccessScopeType.UNIT);
  const hasSelfAccess = accessScopeTypes.includes(AccessScopeType.SELF);

  const {
    selectedAssetsForHandover,
    handoverContext,
    isCreatingTransaction,
  } = useSelector((state: RootState) => state.transaction);
  
  const { campuses } = useSelector((state: RootState) => state.unit);

  const [selectedCampusId, setSelectedCampusId] = useState("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [transactionNote, setTransactionNote] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus>(TransactionStatus.DRAFT);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [assetNotes, setAssetNotes] = useState<Record<string, string>>({});
  
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const savedUnitIdRef = useRef<string>("");

  useEffect(() => {
    const loadHandoverDraft = () => {
      try {
        const savedDraft = sessionStorage.getItem('handoverDraft');
        if (savedDraft) {
          const handoverDraft = JSON.parse(savedDraft);
          console.log("Loading handover draft from sessionStorage:", handoverDraft);

          if (handoverDraft.filterContext) {
            const { filterContext } = handoverDraft;
            if (filterContext.selectedCampusId) {
              setSelectedCampusId(filterContext.selectedCampusId);
            }
            if (filterContext.selectedUnitId) {
              setSelectedUnitId(filterContext.selectedUnitId);
            }
          }

          if (selectedAssetsForHandover.length === 0 && handoverDraft.assets) {
            dispatch(setSelectedAssetsForHandover(handoverDraft.assets));
            
            if (handoverDraft.handoverContext) {
              dispatch(setHandoverContext(handoverDraft.handoverContext));
            }
          }

          if (!transactionNote && handoverDraft.assets?.length > 0) {
            const unitName = handoverDraft.filterContext?.unitName || "đơn vị được chọn";
            setTransactionNote(`Bàn giao ${handoverDraft.assets.length} tài sản đến ${unitName}`);
          }

          if (handoverDraft.assets?.length > 0) {
            // toast.success(`Đã khôi phục ${handoverDraft.assets.length} tài sản từ phiên trước`);
          }
        }
      } catch (error) {
        console.error("Error loading handover draft from sessionStorage:", error);
      }
    };

    loadHandoverDraft();
  }, []);

  useEffect(() => {
    if (selectedAssetsForHandover.length === 0) {
      const savedDraft = sessionStorage.getItem('handoverDraft');
      if (!savedDraft) {
        const timer = setTimeout(() => {
          router.push("/asset/asset-book");
        }, 100);

        return () => clearTimeout(timer);
      }
    }
  }, [selectedAssetsForHandover, router]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const campusesResult = await dispatch(getUnitCampus()).unwrap();
        if (campusesResult && user) {
          if (hasChildUnitsAccess) {
            // Child units access: unitId chính là campus ID
            const campusId = handoverContext?.sourceCampusId || user?.unitId;
            const userCampus = campusesResult.find(
              (campus: Unit) => campus.id === campusId
            );
            if (userCampus) {
              setUnits(userCampus.childUnits ?? []);
              setSelectedCampusId(userCampus.id);
            } else {
              setUnits([]);
              setSelectedCampusId("");
            }
          } else if (hasUnitAccess || hasSelfAccess) {
            // Unit/Self access: Tìm campus chứa đơn vị của user hoặc sử dụng context
            let userUnit: Unit | undefined;
            let userCampus: Unit | undefined;

            const unitId = handoverContext?.sourceUnitId || user.unitId;

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
            }
          } else if (hasGlobalAccess) {
            // Global access có thể chọn tất cả, nhưng ưu tiên context nếu có
            if (handoverContext?.sourceCampusId) {
              setSelectedCampusId(handoverContext.sourceCampusId);
              const campus = campusesResult.find(
                (c: Unit) => c.id === handoverContext.sourceCampusId
              );
              if (campus) {
                setUnits(campus.childUnits ?? []);
                if (handoverContext.sourceUnitId) {
                  setSelectedUnitId(handoverContext.sourceUnitId);
                }
              }
            }
          }
        }
      } catch (e: any) {
        toast.error(e.message || "Có lỗi xảy ra khi tải dữ liệu.");
      }
    };
    loadInitialData();
  }, [dispatch, hasGlobalAccess, hasChildUnitsAccess, hasUnitAccess, hasSelfAccess, user, handoverContext]);

  useEffect(() => {
    if (selectedCampusId) {
      const campus = campuses.find((campus) => campus.id === selectedCampusId);
      setUnits(campus?.childUnits ?? []);
      setSelectedUnitId("");
    }
  }, [selectedCampusId, campuses]);

  const handleCancelHandover = () => {
    sessionStorage.removeItem('handoverDraft');
    dispatch(resetTransactionState());
    router.push("/asset/asset-book");
  };

  const handleRemoveAsset = (assetId: string) => {
    dispatch(removeAssetFromHandover(assetId));
    setAssetNotes((prev) => {
      const copy = { ...prev };
      delete copy[assetId];
      return copy;
    });
  };

  const handleNoteChange = (assetId: string, note: string) => {
    setAssetNotes((prev) => ({ ...prev, [assetId]: note }));
  };

  useEffect(() => {
    if (isAddAssetModalOpen) {
      savedUnitIdRef.current = selectedUnitId;
    }
  }, [isAddAssetModalOpen, selectedUnitId]);

  useEffect(() => {
    if (!isAddAssetModalOpen && savedUnitIdRef.current) {
      if (savedUnitIdRef.current && savedUnitIdRef.current !== selectedUnitId) {
        setSelectedUnitId(savedUnitIdRef.current);
      }
      setTimeout(() => {
        savedUnitIdRef.current = "";
      }, 100);
    }
  }, [isAddAssetModalOpen]);

  const handleAddAssetsFromModal = (selectedAssets: Asset[]) => {
    if (!selectedAssets || selectedAssets.length === 0) {
      toast.error("Không có tài sản nào được chọn!");
      return;
    }

    const currentAssetIds = selectedAssetsForHandover.map(asset => asset.id);
    const existingIds = new Set(currentAssetIds);
    const newAssets = selectedAssets.filter(asset => !existingIds.has(asset.id));
    
    if (newAssets.length === 0) {
      toast.error("Tất cả tài sản đã được thêm vào danh sách!");
      setIsAddAssetModalOpen(false);
      return;
    }

    const updatedAssets = [...selectedAssetsForHandover, ...newAssets];
    
    dispatch(setSelectedAssetsForHandover(updatedAssets));
    
    try {
      const handoverDraft = {
        selectedIds: updatedAssets.map((asset) => asset.id),
        assets: updatedAssets,
        handoverContext: handoverContext,
        filterContext: {
          selectedCampusId: selectedCampusId || undefined,
          selectedUnitId: selectedUnitId || undefined,
        },
        status: "DRAFT",
        timestamp: new Date().toISOString(),
      };
      sessionStorage.setItem("handoverDraft", JSON.stringify(handoverDraft));
    } catch (error) {
      console.error("Error saving handover draft:", error);
    }
    
    toast.success(`Đã thêm ${newAssets.length} tài sản vào danh sách bàn giao`);
    
    setIsAddAssetModalOpen(false);
  };

  const modalInitialFilters = useMemo(() => {
    // Sử dụng đơn vị nguồn (nơi tài sản đang ở) để filter, không phải đơn vị tiếp nhận
    // Ưu tiên: handoverContext.sourceUnitId > đơn vị của tài sản đầu tiên > undefined
    const sourceUnitId = handoverContext?.sourceUnitId || 
      (selectedAssetsForHandover.length > 0 
        ? selectedAssetsForHandover[0].currentRoom?.unit?.id 
        : undefined);
    
    return {
      unitId: sourceUnitId,
      year: new Date().getFullYear().toString(),
      assetType: "FIXED_ASSET",
    };
  }, [handoverContext?.sourceUnitId, selectedAssetsForHandover]);

  const handleSubmitHandover = async () => {
    if (!selectedUnitId) {
      toast.error("Vui lòng chọn đơn vị tiếp nhận!");
      return;
    }

    if (!selectedDate) {
      toast.error("Vui lòng chọn ngày tạo yêu cầu!");
      return;
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    setIsSubmitting(true);

    try {
      const unitName = units.find((u) => u.id === selectedUnitId)?.name || "";

      const transactionItems = selectedAssetsForHandover.map((asset) => ({
        assetId: asset.id,
        fromRoomId: asset.currentRoom?.id,
        note: assetNotes[asset.id] || `Bàn giao đến ${unitName}`,
      }));

      let fromUnitId: string | undefined = handoverContext?.sourceUnitId;
      
      if (!fromUnitId && selectedAssetsForHandover.length > 0) {
        const firstAsset = selectedAssetsForHandover[0];
        fromUnitId = firstAsset.currentRoom?.unit?.id;
      }

      if (!fromUnitId) {
        throw new Error("Không thể xác định đơn vị nguồn");
      }

      const createTransactionDto = {
        fromUnitId: fromUnitId,
        toUnitId: selectedUnitId,
        status: selectedStatus,
        requestNote: transactionNote || `Bàn giao ${selectedAssetsForHandover.length} tài sản đến ${unitName}`,
        items: transactionItems,
        createdAt: new Date(selectedDate).toISOString(),
      };

      const result = await dispatch(createTransaction(createTransactionDto)).unwrap();

      if (result && result.id) {
        sessionStorage.removeItem('handoverDraft');
        
        const statusText = selectedStatus === TransactionStatus.DRAFT ? "nháp" : "đề xuất";
        toast.success(
          `Tạo yêu cầu bàn giao ${statusText} thành công! Mã giao dịch: ${result.id}`
        );

        dispatch(resetTransactionState());
        router.push("/asset/asset-book");
      } else {
        throw new Error("Không nhận được phản hồi hợp lệ từ máy chủ");
      }
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      toast.error(error.message || "Có lỗi xảy ra khi tạo yêu cầu bàn giao.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          disabled={isSubmitting || isCreatingTransaction}
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
          disabled={isSubmitting || isCreatingTransaction}
        >
            <Trash2 className="h-4 w-4 mr-1" />
        </Button>
      ),
      className: "text-center",
    },
  ];

  if (selectedAssetsForHandover.length === 0) {
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
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col w-full sm:w-auto">
              <div className="flex items-center text-sm sm:text-base text-gray-600 mb-3">
                <button
                  onClick={() => router.push("/asset/asset-book")}
                  className="hover:text-blue-600 text-lg sm:text-xl transition-colors font-semibold cursor-pointer"
                >
                  Sổ tài sản
                </button>
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 mx-1 sm:mx-2" />
                <span className="text-gray-900 font-semibold text-lg sm:text-xl">
                  Tạo bàn giao
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => {
                  setIsAddAssetModalOpen(true);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-green-700 text-white"
                disabled={isSubmitting || isCreatingTransaction}
              >
                Thêm tài sản
              </Button>
              <Button
                onClick={handleCancelHandover}
                variant="outline"
                disabled={isSubmitting || isCreatingTransaction}
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={handleSubmitHandover}
                disabled={isSubmitting || isCreatingTransaction || !selectedUnitId}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting || isCreatingTransaction ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {selectedStatus === TransactionStatus.DRAFT 
                      ? "Lưu nháp"
                      : "Tạo đề xuất"
                    }
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-300 mb-6 ">
          

          <div className="p-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  disabled={isSubmitting || isCreatingTransaction}
                  required
                  className="text-base"
                />
              )}

              {(hasChildUnitsAccess || hasGlobalAccess || hasUnitAccess || hasSelfAccess) && (
                <CardSelect
                  label="Đơn vị tiếp nhận"
                  icon={<></>}
                  value={selectedUnitId}
                  onChange={setSelectedUnitId}
                  options={[
                    { value: "", label: "Chọn đơn vị tiếp nhận" },
                    ...(units?.map((unit) => ({
                      value: unit.id,
                      label: unit.name,
                    })) || []),
                  ]}
                  placeholder="Chọn đơn vị tiếp nhận"
                  disabled={isSubmitting || isCreatingTransaction || (hasGlobalAccess && !selectedCampusId)}
                  required
                  className="text-base"
                />
              )}
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú cho yêu cầu bàn giao
              </label>
              <Textarea
                placeholder="Nhập ghi chú cho yêu cầu bàn giao (tùy chọn)..."
                value={transactionNote}
                onChange={(e) => setTransactionNote(e.target.value)}
                disabled={isSubmitting || isCreatingTransaction}
                className="w-full min-h-[100px]"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày bàn giao
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  disabled={isSubmitting || isCreatingTransaction}
                  className="w-full"
                />
              </div>

              <div>
                <CardSelect
                  label="Trạng thái yêu cầu"
                  icon={<></>}
                  value={selectedStatus}
                  onChange={(value) => setSelectedStatus(value as TransactionStatus)}
                  options={[
                    { value: TransactionStatus.DRAFT, label: "Nháp" },
                    { value: TransactionStatus.PROPOSED, label: "Đề xuất" },
                  ]}
                  placeholder="Chọn trạng thái yêu cầu"
                  disabled={isSubmitting || isCreatingTransaction}
                  required
                  className="text-base"
                />
              </div>
            </div>
          </div>
        </div>
        <Table<Asset>
          title="Tài sản đã chọn để bàn giao"
          columns={columns}
          data={selectedAssetsForHandover}
          loading={false}
          emptyText="Không có tài sản nào được chọn"
          emptyIcon={
            <Package2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          }
        />

      <AssetBookSelectionModal
        isOpen={isAddAssetModalOpen}
        onClose={() => {
          setIsAddAssetModalOpen(false);
        }}
        onConfirm={handleAddAssetsFromModal}
        title="Chọn tài sản từ sổ tài sản để bàn giao"
        excludeAssetIds={selectedAssetsForHandover.map(asset => asset.id)}
        initialFilters={modalInitialFilters}
      />
      </div>
    </div>
  );
}
