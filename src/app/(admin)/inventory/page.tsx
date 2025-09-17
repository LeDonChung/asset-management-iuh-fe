"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  Plus,
  Calendar,
  X,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  InventorySession,
  InventorySessionStatus,
  InventorySessionFilter,
  Unit,
  User,
  UserStatus,
} from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableColumn } from "@/components/ui/table";
import AdvancedFilter, {
  FilterCondition,
} from "@/components/filter/AdvancedFilter";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import {
  filterInventorySessions,
  resetFilter,
  updatePagination,
  FilterCondition as StoreFilterCondition,
  FilterOperator,
  FieldType,
  ConditionLogic,
  updateStatusInventorySession,
  updateStatusSessionById,
} from "@/lib/store/slices/inventorySlice";
import toast from "react-hot-toast";

// Status mapping for display

// Status colors and labels
const statusColors = {
  [InventorySessionStatus.PLANNED]: "bg-blue-100 text-blue-800",
  [InventorySessionStatus.IN_PROGRESS]: "bg-yellow-100 text-yellow-800",
  [InventorySessionStatus.COMPLETED]: "bg-green-100 text-green-800",
  [InventorySessionStatus.CLOSED]: "bg-gray-100 text-gray-800",
};

const statusLabels = {
  [InventorySessionStatus.PLANNED]: "Kế hoạch",
  [InventorySessionStatus.IN_PROGRESS]: "Đang thực hiện",
  [InventorySessionStatus.COMPLETED]: "Hoàn thành",
  [InventorySessionStatus.CLOSED]: "Đã đóng",
};

const statusIcons = {
  [InventorySessionStatus.PLANNED]: Clock,
  [InventorySessionStatus.IN_PROGRESS]: PlayCircle,
  [InventorySessionStatus.COMPLETED]: CheckCircle,
  [InventorySessionStatus.CLOSED]: XCircle,
};

export default function InventoryPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const { 
    sessions,
    filteredSessions,
    currentFilter,
    filterLoading,
    filterError,
    updateStatusError,
    updateStatusLoading,
    loading
  } = useSelector((state: RootState) => state.inventory);


  // Local state for UI
  const [filter, setFilter] = useState<InventorySessionFilter>({});
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
  const [conditionLogic, setConditionLogic] = useState<ConditionLogic>(ConditionLogic.AND);
  const [sortConfigs, setSortConfigs] = useState<any[]>([]);
  const [isAdvancedFilterModalOpen, setIsAdvancedFilterModalOpen] = useState<boolean>(false);
  
  // Track if filters have changes that haven't been applied yet
  const [hasUnappliedChanges, setHasUnappliedChanges] = useState<boolean>(false);

  // Debounce ref for search
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check user roles
  const isSuperAdmin = true;
  const isAdmin = true;

  // URL state management functions
  const updateURLParams = (newFilter: any) => {
    const params = new URLSearchParams();
    
    // Add search
    if (newFilter.search) {
      params.set('search', newFilter.search);
    }
    
    // Add pagination
    if (newFilter.pagination?.currentPage && newFilter.pagination.currentPage > 1) {
      params.set('page', newFilter.pagination.currentPage.toString());
    }
    if (newFilter.pagination?.itemsPerPage && newFilter.pagination.itemsPerPage !== 5) {
      params.set('limit', newFilter.pagination.itemsPerPage.toString());
    }
    
    // Add conditions
    if (newFilter.conditions && newFilter.conditions.length > 0) {
      params.set('conditions', JSON.stringify(newFilter.conditions));
    }
    
    // Add condition logic
    if (newFilter.conditionLogic && newFilter.conditionLogic !== ConditionLogic.AND) {
      params.set('logic', newFilter.conditionLogic);
    }
    
    // Add sorting
    if (newFilter.sorting && newFilter.sorting.length > 0) {
      params.set('sort', JSON.stringify(newFilter.sorting));
    }

    // Update URL without page reload
    const newURL = params.toString() ? `?${params.toString()}` : '/inventory';
    router.replace(newURL, { scroll: false });
  };

  const loadStateFromURL = () => {
    try {
      const search = searchParams.get('search') || '';
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '5');
      const conditionsParam = searchParams.get('conditions');
      const logic = searchParams.get('logic') || ConditionLogic.AND;
      const sortParam = searchParams.get('sort');

      // Parse conditions
      let conditions: FilterCondition[] = [];
      if (conditionsParam) {
        try {
          conditions = JSON.parse(conditionsParam);
        } catch (e) {
          console.warn('Failed to parse conditions from URL:', e);
        }
      }

      // Parse sorting
      let sorting: any[] = [];
      if (sortParam) {
        try {
          sorting = JSON.parse(sortParam);
        } catch (e) {
          console.warn('Failed to parse sorting from URL:', e);
        }
      }

      // Update local state
      setFilter({ search });
      setFilterConditions(conditions);
      setConditionLogic(logic as ConditionLogic);
      setSortConfigs(sorting);

      // Update Redux pagination
      dispatch(updatePagination({
        currentPage: page,
        itemsPerPage: limit
      }));

      return {
        search,
        conditions,
        conditionLogic: logic,
        pagination: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems: 0,
          totalPages: 0
        },
        sorting,
      };
    } catch (error) {
      console.warn('Failed to load state from URL:', error);
      return null;
    }
  };

  // Initialize state from URL on mount
  useEffect(() => {
    const urlState = loadStateFromURL();
    if (urlState) {
      // Load with URL state
      const filterData = createApiFilterData(
        urlState.conditions,
        urlState.conditionLogic,
        urlState.search || null,
        0,
        urlState.pagination.currentPage,
        urlState.pagination.itemsPerPage
      );
      dispatch(filterInventorySessions(filterData));
    } else {
      // Load with default filter
      dispatch(filterInventorySessions({}));
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Helper function to sort sessions
  const sortSessions = (
    sessions: InventorySession[],
    sortConfigs: any[]
  ): InventorySession[] => {
    if (sortConfigs.length === 0) return sessions;

    return [...sessions].sort((a, b) => {
      const sortedConfigs = [...sortConfigs].sort(
        (x, y) => x.priority - y.priority
      );

      for (const sortConfig of sortedConfigs) {
        let result = 0;
        const aVal = (a as any)[sortConfig.key];
        const bVal = (b as any)[sortConfig.key];

        if (aVal === bVal) {
          result = 0;
        } else if (aVal == null) {
          result = 1;
        } else if (bVal == null) {
          result = -1;
        } else {
          switch (sortConfig.key) {
            case "name":
              result = a.name.localeCompare(b.name, "vi", { numeric: true });
              break;
            case "year":
              result = a.year - b.year;
              break;
            case "period":
              result = a.period - b.period;
              break;
            case "startDate":
              result =
                new Date(a.startDate).getTime() -
                new Date(b.startDate).getTime();
              break;
            case "endDate":
              result =
                new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
              break;
            case "status":
              const statusOrder = {
                [InventorySessionStatus.PLANNED]: 1,
                [InventorySessionStatus.IN_PROGRESS]: 2,
                [InventorySessionStatus.COMPLETED]: 3,
                [InventorySessionStatus.CLOSED]: 4,
              };
              result = statusOrder[a.status] - statusOrder[b.status];
              break;
            case "createdAt":
              result =
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime();
              break;
            default:
              result = String(aVal).localeCompare(String(bVal), "vi", {
                numeric: true,
              });
              break;
          }
        }

        if (sortConfig.order === "desc") {
          result = -result;
        }

        if (result !== 0) return result;
      }

      return 0;
    });
  };

  // Filter sessions
  useEffect(() => {
    let filtered = [...sessions];

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(
        (session) =>
          session.name.toLowerCase().includes(searchLower) ||
          session.year.toString().includes(searchLower) ||
          session.creator?.fullName.toLowerCase().includes(searchLower)
      );
    }

    if (filter.year !== undefined) {
      filtered = filtered.filter((session) => session.year === filter.year);
    }

    if (filter.status) {
      filtered = filtered.filter((session) => session.status === filter.status);
    }

    if (filter.isGlobal !== undefined) {
      filtered = filtered.filter(
        (session) => session.isGlobal === filter.isGlobal
      );
    }

    if (filter.startDateFrom) {
      filtered = filtered.filter(
        (session) =>
          new Date(session.startDate) >= new Date(filter.startDateFrom!)
      );
    }

    if (filter.startDateTo) {
      filtered = filtered.filter(
        (session) =>
          new Date(session.startDate) <= new Date(filter.startDateTo!)
      );
    }

    // Apply sorting
    filtered = sortSessions(filtered, sortConfigs);
  }, [sessions, filter, sortConfigs]);

  // Handle sort change
  const handleSortChange = (newSortConfigs: any[]) => {
    setSortConfigs(newSortConfigs);
  };

  const handleDeleteSession = (sessionId: string) => {
    // For now, just show alert - this would typically call an API
    alert("Chức năng xóa sẽ được thêm sau khi tích hợp API hoàn chỉnh");
  };

  useEffect(() => {
    if(updateStatusError) {
      toast.error(updateStatusError ?? "Không thể cập nhật trạng thái kỳ kiểm kê. Vui lòng thử lại.");
    }
  }, [updateStatusError]);

  const handleStatusChange = async (sessionId: string, newStatus: InventorySessionStatus) => {
    const result = await  dispatch(updateStatusInventorySession({ id: sessionId, status: newStatus })).unwrap();
    if(result) {
      dispatch(updateStatusSessionById({ id: sessionId, status: newStatus }));
      toast.success(`Đã cập nhật trạng thái kỳ kiểm kê thành công!`);
    }
  };

  const handleActionSelect = (sessionId: string, action: string) => {
    // Get current URL with all params to pass as returnUrl
    // Use Next.js hooks to get the most up-to-date URL including pagination
    const currentSearch = searchParams.toString();
    const currentURL = pathname + (currentSearch ? `?${currentSearch}` : '');
    const returnUrl = encodeURIComponent(currentURL);
    
    console.log('Current pathname:', pathname);
    console.log('Current search params:', currentSearch);
    console.log('Current URL for returnUrl:', currentURL);
    console.log('Encoded returnUrl:', returnUrl);
    
    switch (action) {
      case 'view':
        router.push(`/inventory/${sessionId}?returnUrl=${returnUrl}`);
        break;
      case 'results':
        router.push(`/inventory/${sessionId}/results?returnUrl=${returnUrl}`);
        break;
      case 'edit':
        router.push(`/inventory/${sessionId}/edit?returnUrl=${returnUrl}`);
        break;
      case 'delete':
        handleDeleteSession(sessionId);
        break;
      default:
        break;
    }
  };

  // Enhanced filter options with more field types and operators
  const filterOptions = [
    {
      value: "name",
      label: "Tên kỳ kiểm kê",
      type: FieldType.TEXT,
    },
    {
      value: "year",
      label: "Năm",
      type: FieldType.NUMBER,
    },
    {
      value: "period",
      label: "Đợt kiểm kê",
      type: FieldType.NUMBER,
    },
    {
      value: "startDate",
      label: "Ngày bắt đầu",
      type: FieldType.DATE,
    },
    {
      value: "endDate",
      label: "Ngày kết thúc",
      type: FieldType.DATE,
    },
    {
      value: "createdAt",
      label: "Ngày tạo",
      type: FieldType.DATE,
    },
    {
      value: "status",
      label: "Trạng thái",
      type: FieldType.SELECT,
      options: Object.entries(statusLabels).map(([value, label]) => ({
        value,
        label,
      })),
    },
    {
      value: "isGlobal",
      label: "Phạm vi kiểm kê",
      type: FieldType.BOOLEAN,
      options: [
        { value: "true", label: "Toàn trường" },
        { value: "false", label: "Theo đơn vị" },
      ],
    },
  ];

  // Apply advanced filters and call API
  const applyAdvancedFilters = async () => {
    // Create API filter data
    const filterData = createApiFilterData(
      filterConditions,
      conditionLogic,
      filter.search || null,
      0, // Will be set by API response
      1 // Reset to first page
    );

    // Update URL with new filter state
    updateURLParams({
      search: filter.search,
      conditions: filterConditions,
      conditionLogic: conditionLogic,
      pagination: {
        currentPage: 1,
        itemsPerPage: filterData.pagination?.itemsPerPage || 5
      },
      sorting: sortConfigs
    });

    // Dispatch filter action
    try {
      await dispatch(filterInventorySessions(filterData));
    } catch (error) {
      console.error('Filter failed:', error);
    }

    return filterData;
  };

  // Helper function to get sort direction for a field
  const getSortForField = (fieldName: string) => {
    const sortConfig = sortConfigs.find((config) => config.key === fieldName);
    return sortConfig ? sortConfig.order : null;
  };

  // Create optimized filter data for API calls
  const createApiFilterData = (
    conditions: any[],
    logic: string,
    searchTerm: string | null,
    totalResults: number,
    page: number,
    pageSize?: number
  ) => {
    // Use provided pageSize or current filter itemsPerPage
    const currentPageSize = pageSize || currentFilter.pagination?.itemsPerPage || 5;

    // Clean and validate conditions - remove empty values and invalid conditions
    const cleanConditions = conditions
      .map((condition: FilterCondition) => {
        // Get field configuration
        const fieldConfig = filterOptions.find(
          (opt) => opt.value === condition.field
        );

        // Clean values - remove empty strings and null values
        let cleanValues = [];
        if (Array.isArray(condition.value)) {
          cleanValues = condition.value.filter(
            (val: any) => val !== null && val !== undefined && val !== ""
          );
        } else if (
          condition.value !== null &&
          condition.value !== undefined &&
          condition.value !== ""
        ) {
          cleanValues = [condition.value];
        }

        // For date BETWEEN operations, check dateFrom/dateTo
        const hasDateRange = condition.dateFrom || condition.dateTo;
        
        // Skip conditions with no valid values (except for date fields with date ranges)
        if (cleanValues.length === 0 && condition.fieldType !== FieldType.DATE) {
          return null;
        }
        
        if (condition.fieldType === FieldType.DATE && cleanValues.length === 0 && !hasDateRange) {
          return null;
        }

        // Transform based on field type
        let transformedCondition: any = {
          field: condition.field,
          fieldType: condition.fieldType || fieldConfig?.type || FieldType.TEXT,
          operator: condition.operator || FilterOperator.CONTAINS,
          value: cleanValues,
        };

        // Add sort if available
        const sortDirection = getSortForField(condition.field);
        if (sortDirection) {
          transformedCondition.sort = sortDirection;
        }

        // Handle special field types
        if (condition.field === "isGlobal" && cleanValues.length > 0) {
          // Convert string values to boolean for isGlobal field
          transformedCondition.value = cleanValues.map(
            (val: any) => val === "true" || val === true
          );
        }

        // Handle special cases for BETWEEN operator
        if (condition.operator === FilterOperator.BETWEEN) {
          if (condition.fieldType === FieldType.DATE && hasDateRange) {
            // Use dateFrom/dateTo for date BETWEEN
            transformedCondition.dateFrom = condition.dateFrom;
            transformedCondition.dateTo = condition.dateTo;
            transformedCondition.value = []; // Clear value array for date range
          } else if (condition.fieldType === FieldType.NUMBER && cleanValues.length >= 2) {
            // Use value array for number BETWEEN - ensure both values exist
            transformedCondition.value = [cleanValues[0], cleanValues[1]];
          } else if (cleanValues.length < 2 && !hasDateRange) {
            // Skip BETWEEN conditions without sufficient values
            return null;
          }
        } else if (condition.fieldType === FieldType.DATE && cleanValues.length === 0 && !hasDateRange) {
          return null; // Skip date conditions without values or date range
        }

        return transformedCondition;
      })
      .filter((condition) => condition !== null); // Remove null conditions

    // Create pagination info with enhanced tracking
    const paginationInfo = {
      currentPage: page,
      totalItems: totalResults,
      itemsPerPage: currentPageSize,
      totalPages: Math.ceil(totalResults / currentPageSize),
    };

    // Add sort configurations to the API data
    const sortInfo = sortConfigs.map((config) => ({
      field: config.key,
      direction: config.order,
      priority: config.priority,
    }));

    // Create the final API-ready filter object
    const apiFilterData = {
      conditionLogic: logic as ConditionLogic,
      conditions: cleanConditions,
      pagination: paginationInfo,
      sorting: sortInfo,
      search: searchTerm,
    };

    return apiFilterData;
  };

  // Note: Client-side filtering is now handled by the backend API

  // Reset all filters
  const resetFilters = async () => {
    setFilter({});
    setFilterConditions([]);
    setConditionLogic(ConditionLogic.AND);
    setSortConfigs([]);
    
    // Reset URL to clean state
    router.replace('/inventory', { scroll: false });
    
    // Reset store filter
    dispatch(resetFilter());
    
    // Load default data
    try {
      await dispatch(filterInventorySessions({}));
    } catch (error) {
      console.error('Reset filters failed:', error);
    }
  };

  // Handle pagination changes and trigger API call
  const handlePaginationChange = async (newPage: number, newPageSize?: number) => {
    const targetPage = newPage ?? 1;
    const targetPageSize = newPageSize || currentFilter.pagination?.itemsPerPage || 5;

    // Update pagination in store
    dispatch(updatePagination({
      currentPage: targetPage,
      itemsPerPage: targetPageSize
    }));

    // Update URL with new pagination
    updateURLParams({
      search: filter.search,
      conditions: filterConditions,
      conditionLogic: conditionLogic,
      pagination: {
        currentPage: targetPage,
        itemsPerPage: targetPageSize
      },
      sorting: sortConfigs
    });

    // Create API filter data
    const filterData = createApiFilterData(
      filterConditions,
      conditionLogic,
      filter.search || null,
      filteredSessions?.pagination.total || 0,
      targetPage,
      targetPageSize
    );
    
    // Call API with new pagination
    try {
      await dispatch(filterInventorySessions(filterData));
    } catch (error) {
      console.error('Pagination failed:', error);
    }
  };

  // Only auto-apply on sort changes (not search or filter conditions)
  useEffect(() => {
    if (sortConfigs.length > 0) {
    applyAdvancedFilters();
    }
  }, [sortConfigs]);

  // Define table columns
  const columns: TableColumn<InventorySession>[] = [
    {
      key: "name",
      title: "Tên kỳ kiểm kê",
      width: "300px",
      minWidth: 250,
      maxWidth: 400,
      render: (_, session) => (
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-900">
            {session.name}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "year",
      title: "Năm / Đợt",
      width: "120px",
      minWidth: 100,
      maxWidth: 150,
      render: (_, session) => (
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-900">
            {session.year}
          </div>
          <div className="text-xs text-gray-500">Đợt {session.period}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "startDate",
      title: "Thời gian",
      width: "180px",
      minWidth: 160,
      maxWidth: 220,
      render: (_, session) => (
        <div className="space-y-1">
          <div className="text-sm text-gray-900">
            <Calendar className="inline h-3 w-3 mr-1" />
            {new Date(session.startDate).toLocaleDateString("vi-VN")}
          </div>
          <div className="text-xs text-gray-500">
            đến {new Date(session.endDate).toLocaleDateString("vi-VN")}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "status",
      title: "Trạng thái",
      width: "160px",
      minWidth: 140,
      maxWidth: 200,
      render: (_, session) => {
        if (isAdmin || isSuperAdmin) {
          return (
            <select
              value={session.status}
              onChange={(e) => handleStatusChange(session.id, e.target.value as InventorySessionStatus)}
              className="w-full px-3 py-2 text-xs font-medium border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer transition-colors shadow-sm"
            >
              <option value={InventorySessionStatus.PLANNED}>Kế hoạch</option>
              <option value={InventorySessionStatus.IN_PROGRESS}>Đang thực hiện</option>
              <option value={InventorySessionStatus.COMPLETED}>Hoàn thành</option>
              <option value={InventorySessionStatus.CLOSED}>Đã đóng</option>
            </select>
          );
        } else {
          const StatusIcon = statusIcons[session.status];
          return (
            <Badge className={statusColors[session.status]}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusLabels[session.status]}
            </Badge>
          );
        }
      },
      sortable: true,
    },
    {
      key: "actions",
      title: "Thao tác",
      width: "120px",
      minWidth: 100,
      maxWidth: 150,
      resizable: false,
      render: (_, session) => {
        const canEdit = session.status === InventorySessionStatus.PLANNED;
        const canDelete = session.status === InventorySessionStatus.PLANNED;

        const actionOptions = [
          { value: '', label: 'Chọn thao tác', disabled: true },
          { value: 'view', label: 'Xem chi tiết' },
          { value: 'results', label: 'Xem kết quả' },
        ];

        if (canEdit && (isAdmin || isSuperAdmin)) {
          actionOptions.push({ value: 'edit', label: 'Chỉnh sửa' });
        }

        if (canDelete && (isAdmin || isSuperAdmin)) {
          actionOptions.push({ value: 'delete', label: 'Xóa' });
        }

        return (
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                handleActionSelect(session.id, e.target.value);
                e.target.value = ''; // Reset select after action
              }
            }}
            className="w-full px-3 py-2 text-xs font-medium border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer transition-colors shadow-sm"
          >
            {actionOptions.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
                className={option.disabled ? "text-gray-500 font-medium" : ""}
              >
                {option.label}
              </option>
            ))}
          </select>
        );
      },
    },
  ];
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý kỳ kiểm kê
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          {(isAdmin || isSuperAdmin) && (
            <Link href="/inventory/create">
              <Button className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Tạo kỳ kiểm kê mới
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Quick Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên kỳ kiểm kê, năm hoặc người tạo... (Nhấn Enter để tìm)"
              value={filter.search || ""}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, search: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  applyAdvancedFilters();
                }
              }}
              className="pl-10 pr-4 py-2 w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {filter.search && (
              <button
                onClick={() => {
                  setFilter((prev) => ({ ...prev, search: "" }));
                  // Apply immediately when clearing search
                  setTimeout(() => applyAdvancedFilters(), 0);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {/* Advanced Search Button */}
          <Button
            variant="outline"
            onClick={() => setIsAdvancedFilterModalOpen(!isAdvancedFilterModalOpen)}
            className={`flex items-center px-4 py-2 border-gray-300 hover:bg-gray-50 ${
              isAdvancedFilterModalOpen ? 'bg-blue-50 border-blue-300 text-blue-700' : ''
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Tìm nâng cao
            {filterConditions.length > 0 && (
              <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">
                {filterConditions.length}
              </Badge>
            )}
            {hasUnappliedChanges && (
              <Badge className="ml-2 bg-orange-100 text-orange-800 text-xs">
                Chưa áp dụng
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Split Layout Container */}
      <div className={`flex ${isAdvancedFilterModalOpen ? 'gap-6' : ''} transition-all duration-300 ${
        isAdvancedFilterModalOpen ? 'min-h-[600px]' : ''
      }`}>
        {/* Advanced Filter Sidebar */}
        <div className={`transition-all duration-300 ease-in-out ${
          isAdvancedFilterModalOpen 
            ? 'w-4/12 opacity-100 translate-x-0' 
            : 'w-0 opacity-0 -translate-x-full overflow-hidden'
        }`}>
          {isAdvancedFilterModalOpen && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg h-fit sticky top-6">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 " />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Tìm kiếm nâng cao
                  </h3>
                </div>
                <button
                  onClick={() => setIsAdvancedFilterModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Sidebar Content */}
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                <AdvancedFilter
                  title=""
                  filterOptions={filterOptions}
                  conditions={filterConditions}
                  conditionLogic={conditionLogic}
                  onConditionsChange={(conditions) => {
                    setFilterConditions(conditions);
                    setHasUnappliedChanges(true);
                    // Don't auto-apply, wait for user to click Apply
                  }}
                  onConditionLogicChange={(logic) => {
                    setConditionLogic(logic);
                    setHasUnappliedChanges(true);
                    // Don't auto-apply, wait for user to click Apply
                  }}
                  onApply={() => {
                    // Only call API when user clicks Apply button
                    applyAdvancedFilters();
                    setHasUnappliedChanges(false);
                  }}
                  onReset={() => {
                    resetFilters();
                    setHasUnappliedChanges(false);
                  }}
                  className="border-0 shadow-none bg-transparent"
                />
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className={`transition-all duration-300 space-y-6 ${
          isAdvancedFilterModalOpen ? 'w-8/12' : 'w-full'
        }`}>
          {/* Filter Results Info */}
          {(filter.search || filterConditions.length > 0) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Filter className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Kết quả lọc: {filteredSessions?.pagination.total || 0} kỳ kiểm kê
                    </span>
                  </div>
                  {filter.search && (
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-blue-700">Từ khóa:</span>
                      <Badge
                        variant="outline"
                        className="text-blue-700 border-blue-300"
                      >
                        "{filter.search}"
                      </Badge>
                    </div>
                  )}
                  {filterConditions.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-blue-700">Điều kiện:</span>
                      <Badge
                        variant="outline"
                        className="text-blue-700 border-blue-300"
                      >
                        {filterConditions.length} bộ lọc
                      </Badge>
                    </div>
                  )}
                </div>
                <button
                  onClick={resetFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          )}

          {/* Sessions Table */}
          {filterLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : filterError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-800">
                <p className="font-medium">Lỗi tải dữ liệu:</p>
                <p className="text-sm">{filterError}</p>
              </div>
            </div>
          ) : (
          <Table
            resizable={true}
            columns={columns}
            multiSort={true}
              data={filteredSessions?.data || []}
            sortConfigs={sortConfigs}
            onSortChange={handleSortChange}
            emptyText="Không có kỳ kiểm kê nào"
            emptyIcon={<FileText className="mx-auto h-12 w-12 text-gray-400" />}
            rowKey="id"
            pagination={{
              current: filteredSessions?.pagination.page || 1,
              pageSize: filteredSessions?.pagination.limit || 5,
              total: filteredSessions?.pagination.total || 0,
              onChange: handlePaginationChange,
              showSizeChanger: true,
              pageSizeOptions: [5, 10, 20, 50],
              // Disable Table's internal pagination slicing since backend handles it
              serverSide: true,
            }}
            title={<div className="flex items-center">Danh sách kỳ kiểm kê</div>}
          />
          )}
        </div>
      </div>
    </div>
  );
}
