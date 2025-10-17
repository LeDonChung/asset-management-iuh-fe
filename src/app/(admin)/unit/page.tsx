"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Building,
  Phone,
  Mail,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { Unit, UnitType, UnitStatus } from "@/types/asset";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableColumn } from "@/components/ui/table";
import { RootState } from "@/lib/store";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useAppDispatch } from "@/lib/store/hooks";
import { filterUnit, UnitFilterRequest } from "@/lib/store/slices/unitSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PermissionConstants } from "@/hooks/usePermissions";
import { useAuth } from "@/contexts/AuthContext";

// Unit type options for filter dropdown
const unitTypeOptions = [
  { value: "", label: "Tất cả loại đơn vị" },
  { value: UnitType.ADMIN_DEPT, label: "Phòng quản trị" },
  { value: UnitType.USER_DEPT, label: "Đơn vị sử dụng" },
  { value: UnitType.CAMPUS, label: "Cơ sở" },
];

// Unit status options for filter dropdown
const unitStatusOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: UnitStatus.ACTIVE, label: "Đang hoạt động" },
  { value: UnitStatus.INACTIVE, label: "Ngừng hoạt động" },
];

export default function UnitsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<UnitType>();
  const [statusFilter, setStatusFilter] = useState<UnitStatus>();
  const router = useRouter();
  const { hasAnyPermission } = useAuth();
  const canCreate = hasAnyPermission([PermissionConstants.PERM_CREATE_UNIT]);
  const canUpdate = hasAnyPermission([PermissionConstants.PERM_UPDATE_UNIT]);
  const canDelete = hasAnyPermission([PermissionConstants.PERM_REMOVE_UNIT]);
  const canView = hasAnyPermission([PermissionConstants.PERM_VIEW_UNIT]);
  useEffect(() => {
    if (!canView) {
      router.push("/unauthorized");
    }
  }, [canView, router]);
  const { currentFilter, filteredUnits } = useSelector(
    (state: RootState) => state.unit
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    const loadData = () => {
      try {
        dispatch(filterUnit(currentFilter));
      } catch (e: any) {
        toast.error(e.message || "Có lỗi xảy ra.");
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    handlerRender({
      ...currentFilter,
      search: searchTerm || undefined,
      unitTypeFilter: typeFilter || undefined,
      statusFilter: statusFilter || undefined,
    });
  }, [searchTerm, typeFilter, statusFilter]);

  const handlerRender = (currentFilter: UnitFilterRequest) => {
    dispatch(filterUnit(currentFilter));
  };

  const handleEditUnit = (unit: Unit) => {
    router.push(`/unit/${unit.id}/edit`);
  };

  const handleViewRooms = (unit: Unit) => {
    router.push(`/unit/${unit.id}/room`);
  };

  const handleDeleteUnit = (unit: Unit) => {
    if (confirm(`Bạn có chắc chắn muốn xóa đơn vị "${unit.name}"?`)) {
    }
  };

  const columns: TableColumn<Unit>[] = [
    {
      key: "name",
      title: "Tên đơn vị",
      render: (_, record) => (
        <div className="flex items-center">
          <Building className="h-5 w-5 text-gray-400 mr-3" />
          <div>
            <div className="text-sm font-medium text-gray-900">
              {record.name}
            </div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "email",
      title: "Liên hệ",
      render: (_, record) => (
        <div className="text-sm text-gray-900">
          <div className="flex items-center mb-1">
            <Phone className="h-4 w-4 text-gray-400 mr-1" />
            {record.phone || "Chưa cập nhật"}
          </div>
          <div className="flex items-center">
            <Mail className="h-4 w-4 text-gray-400 mr-1" />
            {record.email || "Chưa cập nhật"}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "type",
      title: "Loại đơn vị",
      render: (_, record) => (
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
          <span>
            {unitTypeOptions.find((option) => option.value === record.type)
              ?.label || record.type}
          </span>
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (_, record) => (
        <Badge
          className={
            record.status === UnitStatus.ACTIVE
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }
        >
          <span>
            {unitStatusOptions.find((option) => option.value === record.status)
              ?.label || record.status}
          </span>
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "actions",
      title: "Thao tác",
      render: (_, record) => (
        <div className="flex justify-start">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="h-8 px-3 text-sm">
                Hành động
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {canUpdate && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditUnit(record);
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span>Chỉnh sửa</span>
                </DropdownMenuItem>
              )}
              {canView && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewRooms(record);
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span>Xem phòng</span>
                </DropdownMenuItem>
              )}
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteUnit(record);
                    }}
                    className="flex items-center gap-2 cursor-pointer text-red-600"
                  >
                    <span>Xóa</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn vị</h1>
          <p className="text-gray-600">Quản lý các đơn vị trong hệ thống</p>
        </div>
        {canCreate && (
          <Link href="/unit/create">
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4" />
              Thêm đơn vị
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm theo tên đơn vị..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as UnitType)}
          >
            {unitTypeOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as UnitStatus)}
          >
            {unitStatusOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Units Table */}
      <Table<Unit>
        columns={columns}
        data={filteredUnits.data}
        emptyText="Không tìm thấy đơn vị"
        emptyIcon={
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        }
        multiSort={true}
        sortConfigs={currentFilter.sorting}
        onSortChange={(sortConfigs) => {
          handlerRender({
            ...currentFilter,
            sorting: sortConfigs,
          });
        }}
        pagination={{
          current: filteredUnits?.pagination.page || 1,
          pageSize: filteredUnits?.pagination.limit || 5,
          total: filteredUnits?.pagination.total || 0,
          onChange: (page, pageSize) => {
            handlerRender({
              ...currentFilter,
              pagination: {
                currentPage: page,
                itemsPerPage: pageSize,
              },
            });
          },
          showSizeChanger: true,
          pageSizeOptions: [5, 10, 20, 50],
          serverSide: true,
        }}
      />
    </div>
  );
}
