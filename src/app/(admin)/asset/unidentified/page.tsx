"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Package,
  Eye,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import {
  Asset,
  AssetType,
  AssetStatus,
  FieldType,
  FilterOperator,
} from "@/types/asset";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableColumn } from "@/components/ui/table";
import { RootState } from "@/lib/store";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useAppDispatch } from "@/lib/store/hooks";
import {
  fetchUnidentifiedAssets,
  UnidentifiedAssetFilter,
} from "@/lib/store/slices/assetSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PermissionConstants } from "@/hooks/usePermissions";
import { useAuth } from "@/contexts/AuthContext";

// Asset type options for filter dropdown
const assetTypeOptions = [
  { value: "", label: "Tất cả loại tài sản" },
  { value: AssetType.FIXED_ASSET, label: "Tài sản cố định" },
  { value: AssetType.TOOLS_EQUIPMENT, label: "Công cụ dụng cụ" },
];

export default function UnidentifiedAssetsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<AssetType>();
  const router = useRouter();
  const { hasAnyPermission } = useAuth();
  const canIdentify = hasAnyPermission([
    PermissionConstants.PERM_IDENTIFY_ASSET,
  ]);
  const canView = hasAnyPermission([PermissionConstants.PERM_VIEW_ASSET]);

  useEffect(() => {
    if (!canIdentify) {
      //   router.push("/unauthorized");
    }
  }, [canIdentify, router]);

  const { unidentifiedAssets, unidentifiedLoading } = useSelector(
    (state: RootState) => state.asset
  );

  const dispatch = useAppDispatch();

  const [currentFilter, setCurrentFilter] = useState<UnidentifiedAssetFilter>({
    pagination: {
      currentPage: 1,
      itemsPerPage: 10,
    },
    sorting: [],
  });

  useEffect(() => {
    const loadData = () => {
      try {
        dispatch(fetchUnidentifiedAssets(currentFilter));
      } catch (e: any) {
        toast.error(e.message || "Có lỗi xảy ra.");
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    handlerRender({
      ...currentFilter,
      conditions: [
        ...(searchTerm
          ? [
              {
                field: "name",
                fieldType: FieldType.TEXT,
                operator: FilterOperator.CONTAINS,
                value: [searchTerm],
              },
            ]
          : []),
        ...(typeFilter
          ? [
              {
                field: "type",
                fieldType: FieldType.SELECT,
                operator: FilterOperator.EQUALS,
                value: [typeFilter],
              },
            ]
          : []),
      ],
    });
  }, [searchTerm, typeFilter]);

  const handlerRender = (filter: UnidentifiedAssetFilter) => {
    setCurrentFilter(filter);
    dispatch(fetchUnidentifiedAssets(filter));
  };

  const handleIdentifyAsset = (asset: Asset) => {
    router.push(`/asset/${asset.id}/edit`);
  };

  const handleViewAsset = (asset: Asset) => {
    router.push(`/asset/${asset.id}`);
  };

  const getAssetTypeLabel = (type: AssetType) => {
    return (
      assetTypeOptions.find((option) => option.value === type)?.label || type
    );
  };

  const getUnidentifiedReason = (asset: Asset) => {
    const reasons: string[] = [];

    if (!asset.currentRoomId) {
      reasons.push("Chưa có vị trí");
    }

    if (asset.type === AssetType.FIXED_ASSET && !asset.rfidTag?.rfidId) {
      reasons.push("Chưa có RFID tag");
    }

    return reasons.join(", ") || "Chưa rõ lý do";
  };

  const columns: TableColumn<Asset>[] = [
    {
      key: "name",
      title: "Thông tin tài sản",
      render: (_, record) => (
        <div className="flex items-center">
          <Package className="h-5 min-w-5 text-gray-400 mr-3" />
          <div>
            <div className="text-sm font-medium text-gray-900">
              {record.name}
            </div>
            <div className="text-xs text-gray-500">
              {record.ktCode} • {record.fixedCode}
            </div>
            {record.specs && (
              <div className="text-xs text-gray-500 mt-1">{record.specs}</div>
            )}
          </div>
        </div>
      ),
      maxWidth: 300,
      sortable: true,
    },
    {
      key: "type",
      title: "Loại tài sản",
      render: (_, record) => (
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
          <span>{getAssetTypeLabel(record.type)}</span>
        </Badge>
      ),
      maxWidth: 160,
      sortable: true,
    },
    {
      key: "category",
      title: "Danh mục",
      render: (_, record) => (
        <div className="text-sm text-gray-900">
          {record.category?.name || "Chưa phân loại"}
        </div>
      ),
      maxWidth: 150,
      sortable: true,
    },
    {
      key: "quantity",
      title: "Số lượng",
      render: (_, record) => (
        <div className="text-sm text-gray-900">
          {record.quantity} {record.unit}
        </div>
      ),
      maxWidth: 120,
      sortable: true,
    },
    {
      key: "entrydate",
      title: "Ngày nhập",
      render: (_, record) => (
        <div className="text-sm text-gray-900">
          {new Date(record.entrydate).toLocaleDateString("vi-VN")}
        </div>
      ),
      maxWidth: 120,
      sortable: true,
    },
    {
      key: "actions",
      title: "Thao tác",
      render: (_, record) => (
        <div className="flex justify-start">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={unidentifiedLoading}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {canView && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewAsset(record);
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span>Xem chi tiết</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleIdentifyAsset(record);
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <span>Chỉnh sửa</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      maxWidth: 100,
      className: "text-right",
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tài sản chưa định danh
          </h1>
        </div>
        {canIdentify && (
          <Link href="/asset/create">
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4" />
              Thêm tài sản mới
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-300 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm theo tên tài sản..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={typeFilter || ""}
            onChange={(e) =>
              setTypeFilter((e.target.value as AssetType) || undefined)
            }
          >
            {assetTypeOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assets Table */}
      <Table<Asset>
        columns={columns}
        data={unidentifiedAssets.data}
        loading={unidentifiedLoading}
        emptyText="Không tìm thấy tài sản chưa định danh"
        emptyIcon={<Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
        multiSort={true}
        sortConfigs={currentFilter.sorting}
        onSortChange={(sortConfigs) => {
          handlerRender({
            ...currentFilter,
            sorting: sortConfigs,
          });
        }}
        pagination={{
          current: unidentifiedAssets?.pagination.page || 1,
          pageSize: unidentifiedAssets?.pagination.limit || 10,
          total: unidentifiedAssets?.pagination.total || 0,
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
