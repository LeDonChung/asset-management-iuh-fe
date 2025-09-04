"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Users,
  Building2,
  X,
  Settings,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";
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
import AdvancedFilter, { FilterCondition } from "@/components/filter/AdvancedFilter";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

// Mock data for inventory sessions
const mockInventorySessions: InventorySession[] = [
  {
    id: "inv-session-1",
    year: 2024,
    name: "Kiểm kê tài sản cuối năm 2024",
    period: 1,
    isGlobal: true,
    startDate: "2024-12-01",
    endDate: "2024-12-31",
    status: InventorySessionStatus.PLANNED,
    createdBy: "user-1",
    createdAt: "2024-11-01T00:00:00Z",
    creator: {
      id: "user-1",
      username: "admin",
      fullName: "Nguyễn Văn Admin",
      email: "admin@iuh.edu.vn",
      status: UserStatus.ACTIVE,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    units: [],
    committees: [],
  },
  {
    id: "inv-session-2",
    year: 2024,
    name: "Kiểm kê tài sản giữa năm - Khoa Công nghệ thông tin",
    period: 2,
    isGlobal: false,
    startDate: "2024-06-01",
    endDate: "2024-06-15",
    status: InventorySessionStatus.COMPLETED,
    createdBy: "user-2",
    createdAt: "2024-05-15T00:00:00Z",
    creator: {
      id: "user-2",
      username: "manager.it",
      fullName: "Trần Thị Manager",
      email: "manager.it@iuh.edu.vn",
      status: UserStatus.ACTIVE,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    units: [],
    committees: [],
  },
  {
    id: "inv-session-3",
    year: 2024,
    name: "Kiểm kê đặc biệt - Thiết bị phòng thí nghiệm",
    period: 1,
    isGlobal: false,
    startDate: "2024-09-01",
    endDate: "2024-09-30",
    status: InventorySessionStatus.IN_PROGRESS,
    createdBy: "user-3",
    createdAt: "2024-08-15T00:00:00Z",
    creator: {
      id: "user-3",
      username: "lab.supervisor",
      fullName: "Lê Văn Supervisor",
      email: "lab.supervisor@iuh.edu.vn",
      status: UserStatus.ACTIVE,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    units: [],
    committees: [],
  },
  {
    id: "inv-session-4",
    year: 2023,
    name: "Kiểm kê tài sản cuối năm 2023",
    period: 1,
    isGlobal: true,
    startDate: "2023-12-01",
    endDate: "2023-12-31",
    status: InventorySessionStatus.CLOSED,
    createdBy: "user-1",
    createdAt: "2023-11-01T00:00:00Z",
    creator: {
      id: "user-1",
      username: "admin",
      fullName: "Nguyễn Văn Admin",
      email: "admin@iuh.edu.vn",
      status: UserStatus.ACTIVE,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    units: [],
    committees: [],
  },
];

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
  const [sessions, setSessions] = useState<InventorySession[]>(mockInventorySessions);
  const [filteredSessions, setFilteredSessions] = useState<InventorySession[]>(mockInventorySessions);
  const [filter, setFilter] = useState<InventorySessionFilter>({});
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
  const [conditionLogic, setConditionLogic] = useState<'contains' | 'equals' | 'not_contains'>('contains');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [sortConfigs, setSortConfigs] = useState<any[]>([]);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

  const { getCurrentRole } = useAuth();
  const router = useRouter();

  // Check user roles
  const isSuperAdmin = getCurrentRole()?.code === "SUPER_ADMIN";
  const isAdmin = getCurrentRole()?.code === "ADMIN";
  const isPhongQuanTri = getCurrentRole()?.code === "PHONG_QUAN_TRI";

  // Helper function to sort sessions
  const sortSessions = (sessions: InventorySession[], sortConfigs: any[]): InventorySession[] => {
    if (sortConfigs.length === 0) return sessions;

    return [...sessions].sort((a, b) => {
      const sortedConfigs = [...sortConfigs].sort((x, y) => x.priority - y.priority);
      
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
            case 'name':
              result = a.name.localeCompare(b.name, 'vi', { numeric: true });
              break;
            case 'year':
              result = a.year - b.year;
              break;
            case 'period':
              result = a.period - b.period;
              break;
            case 'startDate':
              result = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
              break;
            case 'endDate':
              result = new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
              break;
            case 'status':
              const statusOrder = {
                [InventorySessionStatus.PLANNED]: 1,
                [InventorySessionStatus.IN_PROGRESS]: 2,
                [InventorySessionStatus.COMPLETED]: 3,
                [InventorySessionStatus.CLOSED]: 4,
              };
              result = statusOrder[a.status] - statusOrder[b.status];
              break;
            case 'createdAt':
              result = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
              break;
            default:
              result = String(aVal).localeCompare(String(bVal), 'vi', { numeric: true });
              break;
          }
        }

        if (sortConfig.order === 'desc') {
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
      filtered = filtered.filter((session) => session.isGlobal === filter.isGlobal);
    }

    if (filter.startDateFrom) {
      filtered = filtered.filter((session) => 
        new Date(session.startDate) >= new Date(filter.startDateFrom!)
      );
    }

    if (filter.startDateTo) {
      filtered = filtered.filter((session) => 
        new Date(session.startDate) <= new Date(filter.startDateTo!)
      );
    }

    // Apply sorting
    filtered = sortSessions(filtered, sortConfigs);

    setFilteredSessions(filtered);
    setCurrentPage(1);
  }, [sessions, filter, sortConfigs]);

  // Handle sort change
  const handleSortChange = (newSortConfigs: any[]) => {
    setSortConfigs(newSortConfigs);
  };

  const handleDeleteSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    if (session.status !== InventorySessionStatus.PLANNED) {
      alert("Chỉ có thể xóa kỳ kiểm kê ở trạng thái 'Kế hoạch'");
      return;
    }

    if (confirm("Bạn có chắc chắn muốn xóa kỳ kiểm kê này?")) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    }
  };

  const handleStatusChange = (sessionId: string, newStatus: InventorySessionStatus) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    // Define valid status transitions
    const statusTransitions: Record<InventorySessionStatus, InventorySessionStatus[]> = {
      [InventorySessionStatus.PLANNED]: [InventorySessionStatus.IN_PROGRESS],
      [InventorySessionStatus.IN_PROGRESS]: [InventorySessionStatus.COMPLETED],
      [InventorySessionStatus.COMPLETED]: [InventorySessionStatus.CLOSED],
      [InventorySessionStatus.CLOSED]: [], // No transitions from closed
    };

    const validTransitions = statusTransitions[session.status];
    if (!validTransitions.includes(newStatus)) {
      alert("Không thể chuyển trạng thái này");
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn chuyển trạng thái thành "${statusLabels[newStatus]}"?`)) {
      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { ...s, status: newStatus }
          : s
      ));
    }
  };

  // Filter options for AdvancedFilter
  const filterOptions = [
    {
      value: 'name',
      label: 'Tên kỳ kiểm kê',
      type: 'text' as const
    },
    {
      value: 'year',
      label: 'Năm',
      type: 'select' as const,
      options: Array.from(new Set(sessions.map(s => s.year)))
        .sort((a, b) => b - a)
        .map(year => ({
          value: year.toString(),
          label: year.toString()
        }))
    },
    {
      value: 'status',
      label: 'Trạng thái',
      type: 'select' as const,
      options: Object.entries(statusLabels).map(([value, label]) => ({
        value,
        label
      }))
    },
    {
      value: 'isGlobal',
      label: 'Phạm vi',
      type: 'select' as const,
      options: [
        { value: 'true', label: 'Toàn trường' },
        { value: 'false', label: 'Đơn vị' }
      ]
    },
    {
      value: 'startDate',
      label: 'Ngày bắt đầu',
      type: 'date' as const
    }
  ];

  // Apply advanced filters
  const applyAdvancedFilters = () => {
    let filtered = [...sessions];

    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      filtered = filtered.filter(session =>
        session.name.toLowerCase().includes(searchTerm) ||
        session.year.toString().includes(searchTerm) ||
        session.creator?.fullName.toLowerCase().includes(searchTerm)
      );
    }

    // Apply condition-based filters similar to asset page
    if (filterConditions.length > 0) {
      if (conditionLogic === 'contains') {
        filterConditions.forEach(condition => {
          filtered = applyConditionFilter(filtered, condition);
        });
      } else if (conditionLogic === 'equals') {
        const originalFiltered = [...filtered];
        let orResults: InventorySession[] = [];
        filterConditions.forEach(condition => {
          const conditionResults = applyConditionFilter(originalFiltered, condition);
          orResults = [...orResults, ...conditionResults.filter(session =>
            !orResults.some(existing => existing.id === session.id)
          )];
        });
        filtered = orResults;
      } else if (conditionLogic === 'not_contains') {
        filterConditions.forEach(condition => {
          filtered = applyConditionFilter(filtered, condition, true);
        });
      }
    }

    filtered = sortSessions(filtered, sortConfigs);
    setFilteredSessions(filtered);
    setCurrentPage(1);
  };

  // Helper function to apply single condition
  const applyConditionFilter = (sessions: InventorySession[], condition: FilterCondition, negate = false): InventorySession[] => {
    const fieldOption = filterOptions.find(opt => opt.value === condition.field);

    let hasValue = false;
    if (fieldOption?.type === 'date') {
      hasValue = !!(condition.dateFrom || condition.dateTo);
    } else if (Array.isArray(condition.value)) {
      hasValue = condition.value.length > 0;
    } else {
      hasValue = !!(condition.value && condition.value !== '');
    }

    if (!hasValue) {
      return sessions;
    }

    const result = sessions.filter(session => {
      const fieldValue = (session as any)[condition.field];

      if (fieldOption?.type === 'date') {
        const sessionDate = new Date(fieldValue);
        const fromDate = condition.dateFrom ? new Date(condition.dateFrom) : null;
        const toDate = condition.dateTo ? new Date(condition.dateTo) : null;

        switch (condition.operator) {
          case 'contains':
          case 'equals':
            if (fromDate && toDate) {
              return sessionDate >= fromDate && sessionDate <= toDate;
            } else if (fromDate) {
              return sessionDate >= fromDate;
            } else if (toDate) {
              return sessionDate <= toDate;
            }
            return true;
          case 'not_contains':
            if (fromDate && toDate) {
              return !(sessionDate >= fromDate && sessionDate <= toDate);
            } else if (fromDate) {
              return sessionDate < fromDate;
            } else if (toDate) {
              return sessionDate > toDate;
            }
            return true;
          default:
            return true;
        }
      }

      switch (condition.operator) {
        case 'contains':
          if (Array.isArray(condition.value)) {
            if (condition.value.length === 0) return true;
            return condition.value.every(val => {
              if (condition.field === 'isGlobal') {
                return session.isGlobal === (val === 'true');
              }
              const fieldOption = filterOptions.find(opt => opt.value === condition.field);
              if (fieldOption?.type === 'select') {
                return String(fieldValue) === val;
              }
              return String(fieldValue).toLowerCase().includes(val.toLowerCase());
            });
          } else {
            if (condition.field === 'isGlobal') {
              return session.isGlobal === (condition.value === 'true');
            }
            return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
          }
        case 'equals':
          if (Array.isArray(condition.value)) {
            if (condition.value.length === 0) return true;
            return condition.value.some(val => {
              if (condition.field === 'isGlobal') {
                return session.isGlobal === (val === 'true');
              }
              const fieldOption = filterOptions.find(opt => opt.value === condition.field);
              if (fieldOption?.type === 'select') {
                return String(fieldValue) === val;
              }
              return String(fieldValue).toLowerCase().includes(val.toLowerCase());
            });
          } else {
            if (condition.field === 'isGlobal') {
              return session.isGlobal === (condition.value === 'true');
            }
            return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
          }
        case 'not_contains':
          if (Array.isArray(condition.value)) {
            if (condition.value.length === 0) return true;
            return !condition.value.some(val => {
              if (condition.field === 'isGlobal') {
                return session.isGlobal === (val === 'true');
              }
              const fieldOption = filterOptions.find(opt => opt.value === condition.field);
              if (fieldOption?.type === 'select') {
                return String(fieldValue) === val;
              }
              return String(fieldValue).toLowerCase().includes(val.toLowerCase());
            });
          } else {
            if (condition.field === 'isGlobal') {
              return session.isGlobal !== (condition.value === 'true');
            }
            return !String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
          }
        default:
          return true;
      }
    });

    return negate ? sessions.filter(session => !result.includes(session)) : result;
  };

  // Reset all filters
  const resetFilters = () => {
    setFilter({});
    setFilterConditions([]);
    setConditionLogic('contains');
    setSortConfigs([]);
    setFilteredSessions(sessions);
    setCurrentPage(1);
  };

  // Auto-apply filters
  useEffect(() => {
    applyAdvancedFilters();
  }, [filter.search, sessions, sortConfigs, filterConditions, conditionLogic]);

  // Define table columns
  const columns: TableColumn<InventorySession>[] = [
    {
      key: "name",
      title: "Kỳ kiểm kê",
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
          <div className="text-xs text-gray-500">
            Đợt {session.period}
          </div>
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
      width: "150px",
      minWidth: 120,
      maxWidth: 180,
      render: (_, session) => {
        const StatusIcon = statusIcons[session.status];
        return (
          <Badge className={statusColors[session.status]}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusLabels[session.status]}
          </Badge>
        );
      },
      sortable: true,
    },
    {
      key: "actions",
      title: "Thao tác",
      width: "200px",
      minWidth: 180,
      maxWidth: 250,
      resizable: false,
      render: (_, session) => {
        const canEdit = session.status === InventorySessionStatus.PLANNED;
        const canDelete = session.status === InventorySessionStatus.PLANNED;
        const canChangeStatus = session.status !== InventorySessionStatus.CLOSED;

        return (
          <div className="flex items-center space-x-2">
            {/* View Details */}
            <Link
              href={`/inventory/${session.id}`}
              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              title="Xem chi tiết"
            >
              <Eye className="h-4 w-4" />
            </Link>

            {/* Edit (only if PLANNED) */}
            {canEdit && (isAdmin || isSuperAdmin) && (
              <Link
                href={`/inventory/${session.id}/edit`}
                className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                title="Chỉnh sửa"
              >
                <Edit2 className="h-4 w-4" />
              </Link>
            )}

            {/* Delete (only if PLANNED) */}
            {canDelete && (isAdmin || isSuperAdmin) && (
              <button
                onClick={() => handleDeleteSession(session.id)}
                className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                title="Xóa"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            {/* Status Management */}
            {canChangeStatus && (isAdmin || isSuperAdmin) && (
              <div className="relative group">
                <button className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors">
                  <Settings className="h-4 w-4" />
                </button>
                
                {/* Status Change Dropdown - You can implement this as a proper dropdown */}
                <div className="hidden group-hover:block absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
                  {session.status === InventorySessionStatus.PLANNED && (
                    <button
                      onClick={() => handleStatusChange(session.id, InventorySessionStatus.IN_PROGRESS)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <PlayCircle className="h-3 w-3 mr-2" />
                      Bắt đầu
                    </button>
                  )}
                  {session.status === InventorySessionStatus.IN_PROGRESS && (
                    <button
                      onClick={() => handleStatusChange(session.id, InventorySessionStatus.COMPLETED)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <CheckCircle className="h-3 w-3 mr-2" />
                      Hoàn thành
                    </button>
                  )}
                  {session.status === InventorySessionStatus.COMPLETED && (
                    <button
                      onClick={() => handleStatusChange(session.id, InventorySessionStatus.CLOSED)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <XCircle className="h-3 w-3 mr-2" />
                      Đóng kỳ
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Committee Management */}
            <Link
              href={`/inventory/${session.id}/committees`}
              className="p-1.5 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
              title="Quản lý ban kiểm kê"
            >
              <Users className="h-4 w-4" />
            </Link>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý kỳ kiểm kê</h1>
          <p className="text-gray-600">
            Quản lý các kỳ kiểm kê tài sản trong trường
          </p>
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên kỳ kiểm kê, năm hoặc người tạo..."
            value={filter.search || ""}
            onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
            className="pl-10 pr-4 py-2 w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {filter.search && (
            <button
              onClick={() => setFilter(prev => ({ ...prev, search: "" }))}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter */}
      <AdvancedFilter
        title="Tìm kiếm nâng cao"
        filterOptions={filterOptions}
        conditions={filterConditions}
        conditionLogic={conditionLogic}
        onConditionsChange={setFilterConditions}
        onConditionLogicChange={setConditionLogic}
        onApply={applyAdvancedFilters}
        onReset={resetFilters}
        className="mb-6"
      />

      {/* Filter Results Info */}
      {(filter.search || filterConditions.length > 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Filter className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Kết quả lọc: {filteredSessions.length} / {sessions.length} kỳ kiểm kê
                </span>
              </div>
              {filter.search && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-blue-700">Từ khóa:</span>
                  <Badge variant="outline" className="text-blue-700 border-blue-300">
                    "{filter.search}"
                  </Badge>
                </div>
              )}
              {filterConditions.length > 0 && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-blue-700">Điều kiện:</span>
                  <Badge variant="outline" className="text-blue-700 border-blue-300">
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
      <Table
        resizable={true}
        columns={columns}
        multiSort={true}
        data={filteredSessions}
        sortConfigs={sortConfigs}
        onSortChange={handleSortChange}
        emptyText="Không có kỳ kiểm kê nào"
        emptyIcon={<FileText className="mx-auto h-12 w-12 text-gray-400" />}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize: itemsPerPage,
          total: filteredSessions.length,
          onChange: (page, pageSize) => {
            setCurrentPage(page);
            if (pageSize !== itemsPerPage) {
              setItemsPerPage(pageSize);
              setCurrentPage(1);
            }
          },
          showSizeChanger: true,
          pageSizeOptions: [5, 10, 20, 50]
        }}
        title={
          <div className="flex items-center">
            Danh sách kỳ kiểm kê
          </div>
        }
      />
    </div>
  );
}