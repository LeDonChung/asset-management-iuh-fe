"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Package2,
  CheckCircle,
  Calendar,
  User,
  AlertCircle,
  Building2,
  Hash,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AssetTransaction,
  TransactionType,
  TransactionStatus,
  AssetType,
  AssetStatus,
  UnitType,
  UnitStatus,
} from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableColumn } from "@/components/ui/table";

// Mock data - trong thực tế sẽ gọi API với transaction ID
const mockAssetTransactions: AssetTransaction[] = [
  {
    id: "TXN-2025-001",
    type: TransactionType.HANDOVER,
    fromUnitId: "PKHDTU",
    toUnitId: "PQT",
    createdBy: "Nguyễn Văn Minh",
    createdAt: "2025-08-15T09:30:00Z",
    status: TransactionStatus.PENDING,
    note: "Bàn giao thiết bị IT đợt 1 - Năm học 2025-2026",
    fromUnit: {
      id: "PKHDTU",
      name: "Phòng Kế Hoạch Đầu Tư",
      type: UnitType.PHONG_KE_HOACH_DAU_TU,
      status: UnitStatus.ACTIVE,
      representativeId: "nguyen.minh",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    },
    toUnit: {
      id: "PQT",
      name: "Phòng Quản Trị",
      type: UnitType.PHONG_QUAN_TRI,
      status: UnitStatus.ACTIVE,
      representativeId: "tran.ha",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    },
    items: [
      {
        id: "ITM-2025-001",
        transactionId: "TXN-2025-001",
        assetId: "LAPTOP-001",
        note: "Laptop Dell Latitude mới - Đã test đầy đủ chức năng, bao gồm chuột không dây và cặp đựng",
        asset: {
          id: "LAPTOP-001",
          ktCode: "25-0001/KT",
          fixedCode: "2141.00001",
          name: "Laptop Dell Latitude 5530",
          specs: "Intel Core i7-1250U, 16GB DDR4 RAM, 512GB NVMe SSD, 15.6\" FHD, Windows 11 Pro",
          entryDate: "2025-07-20",
          unit: "Chiếc",
          quantity: 10,
          purchasePackage: 1,
          type: AssetType.TSCD,
          isLocked: false,
          isHandOver: false,
          categoryId: "2141",
          status: AssetStatus.CHO_PHAN_BO,
          createdBy: "nguyen.minh",
          createdAt: "2025-07-20T08:00:00Z",
          updatedAt: "2025-08-15T09:30:00Z",
          category: { id: "2141", name: "Máy tính xách tay", code: "2141" }
        }
      },
      {
        id: "ITM-2025-002",
        transactionId: "TXN-2025-001",
        assetId: "PC-001",
        note: "Máy tính để bàn HP - Cấu hình mạnh cho phòng thí nghiệm, kèm màn hình 24 inch",
        asset: {
          id: "PC-001",
          ktCode: "25-0002/KT",
          fixedCode: "2142.00001",
          name: "Máy tính để bàn HP EliteDesk 800 G9",
          specs: "Intel Core i5-12500, 16GB DDR4, 1TB HDD + 256GB SSD, DVD-RW, có màn hình HP 24\" IPS",
          entryDate: "2025-07-22",
          unit: "Bộ",
          quantity: 15,
          purchasePackage: 1,
          type: AssetType.TSCD,
          isLocked: false,
          isHandOver: false,
          categoryId: "2142",
          status: AssetStatus.CHO_PHAN_BO,
          createdBy: "nguyen.minh",
          createdAt: "2025-07-22T08:00:00Z",
          updatedAt: "2025-08-15T09:30:00Z",
          category: { id: "2142", name: "Máy tính để bàn", code: "2142" }
        }
      },
      {
        id: "ITM-2025-003",
        transactionId: "TXN-2025-001",
        assetId: "PRINTER-001",
        note: "Máy in laser HP đa chức năng - In/Scan/Copy, có khay giấy phụ",
        asset: {
          id: "PRINTER-001",
          ktCode: "25-0003/KT",
          fixedCode: "2231.00001",
          name: "Máy in đa chức năng HP LaserJet Pro M428fdw",
          specs: "In laser đen trắng, scan màu, copy, fax, tốc độ 38trang/phút, WiFi, duplex tự động",
          entryDate: "2025-07-25",
          unit: "Chiếc",
          quantity: 5,
          purchasePackage: 1,
          type: AssetType.TSCD,
          isLocked: false,
          isHandOver: false,
          categoryId: "2231",
          status: AssetStatus.CHO_PHAN_BO,
          createdBy: "nguyen.minh",
          createdAt: "2025-07-25T08:00:00Z",
          updatedAt: "2025-08-15T09:30:00Z",
          category: { id: "2231", name: "Máy in, máy photocopy", code: "2231" }
        }
      }
    ]
  }
];

const typeLabels = {
  [AssetType.TSCD]: "Tài sản cố định",
  [AssetType.CCDC]: "Công cụ dụng cụ",
};

const typeColors = {
  [AssetType.TSCD]: "bg-blue-100 text-blue-800",
  [AssetType.CCDC]: "bg-green-100 text-green-800",
};

const statusColors = {
  [TransactionStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [TransactionStatus.APPROVED]: "bg-green-100 text-green-800",
  [TransactionStatus.REJECTED]: "bg-red-100 text-red-800",
};

const statusLabels = {
  [TransactionStatus.PENDING]: "Chờ tiếp nhận",
  [TransactionStatus.APPROVED]: "Đã tiếp nhận",
  [TransactionStatus.REJECTED]: "Từ chối",
};

export default function TransactionDetailPage() {
  const params = useParams();
  const transactionId = params.id as string;

  const [transaction, setTransaction] = useState<AssetTransaction | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  
  // Pagination and sorting states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfigs, setSortConfigs] = useState<any[]>([]);

  useEffect(() => {
    // Trong thực tế sẽ gọi API để lấy chi tiết transaction
    const foundTransaction = mockAssetTransactions.find(t => t.id === transactionId);
    setTransaction(foundTransaction || null);
  }, [transactionId]);

  // Handle sort change
  const handleSortChange = (newSortConfigs: any[]) => {
    console.log('Sort changed:', newSortConfigs);
    setSortConfigs(newSortConfigs);
  };

  const handleReceiveTransaction = () => {
    alert("Tiếp nhận bàn giao thành công! Tài sản đã sẵn sàng để phân bổ.");
  };

  if (!transaction) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy bàn giao</h3>
          <p className="mt-1 text-sm text-gray-500">
            Bàn giao không tồn tại hoặc đã bị xóa.
          </p>
          <div className="mt-6">
            <Link href="/asset/receive">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại danh sách
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalAssets = transaction.items?.reduce((sum, item) => sum + (item.asset?.quantity || 0), 0) || 0;

  // Helper function to truncate specs text
  const truncateSpecs = (specs: string, maxLength: number = 60) => {
    if (specs.length <= maxLength) return specs;
    return specs.substring(0, maxLength) + '...';
  };

  // Define table columns for assets
  const columns: TableColumn[] = [
    {
      key: "info",
      title: "Thông tin tài sản",
      width: "300px",
      minWidth: 250,
      maxWidth: 400,
      render: (_, item: any) => (
        <div>
          <div className="text-sm font-medium text-gray-900 break-words">
            {item.asset?.name}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "codes",
      title: "Mã tài sản",
      width: "150px",
      minWidth: 120,
      maxWidth: 200,
      render: (_, item: any) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {item.asset?.fixedCode}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "type",
      title: "Loại",
      width: "120px",
      minWidth: 100,
      maxWidth: 150,
      render: (_, item: any) => (
        <Badge className={typeColors[item.asset?.type as keyof typeof typeColors]}>
          {typeLabels[item.asset?.type as keyof typeof typeLabels]}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "quantity",
      title: "Số lượng",
      width: "100px",
      minWidth: 80,
      maxWidth: 120,
      render: (_, item: any) => (
          <span className="text-sm font-medium text-gray-900">
            {item.asset?.quantity} {item.asset?.unit}
          </span>
      ),
      sortable: true,
    },
    {
      key: "specs",
      title: "Thông số",
      width: "280px",
      minWidth: 220,
      maxWidth: 350,
      render: (_, item: any) => (
        <div>
          <div className="text-sm text-gray-900 mb-1" title={item.asset?.specs}>
            {truncateSpecs(item.asset?.specs || "Không có thông số", 60)}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "note",
      title: "Ghi chú",
      width: "200px",
      minWidth: 150,
      maxWidth: 300,
      render: (_, item: any) => (
        <div className="text-sm text-gray-500 max-w-xs" title={item.note || "Không có ghi chú"}>
          {truncateSpecs(item.note || "Không có ghi chú", 60)}
        </div>
      ),
      sortable: true,
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <Link href="/asset/receive">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Chi tiết bàn giao</h1>
            <p className="text-sm md:text-base text-gray-600">
              Xem chi tiết và tiếp nhận tài sản từ bàn giao
            </p>
          </div>
        </div>

        {transaction.status === TransactionStatus.PENDING && (
          <div className="flex items-center space-x-2 md:space-x-3">
            <Button
              onClick={handleReceiveTransaction}
              className="bg-green-500 hover:bg-green-600 text-white text-sm md:text-base"
              size="sm"
            >
              <CheckCircle className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Tiếp nhận</span>
              <span className="sm:hidden">Tiếp nhận</span>
            </Button>
          </div>
        )}
      </div>

      {/* Transaction Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 h-10 w-10">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm">
                    <Package2 className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base md:text-lg font-semibold text-gray-900 break-words">
                    {transaction.note}
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500">
                    ID: {transaction.id}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Badge className={statusColors[transaction.status as keyof typeof statusColors]}>
                  {statusLabels[transaction.status as keyof typeof statusLabels]}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500">Đơn vị gửi</p>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {transaction.fromUnit?.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500">Ngày gửi</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(transaction.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500">Người tạo</p>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {transaction.createdBy}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Hash className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500">Tổng số tài sản</p>
                  <p className="text-sm font-medium text-gray-900">
                    {totalAssets} tài sản ({transaction.items?.length} loại)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3 md:space-y-4">
          <div className="bg-white rounded-lg shadow p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm text-gray-500 truncate">Tổng số loại tài sản</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">
                  {transaction.items?.length || 0}
                </p>
                <p className="text-xs text-gray-400 mt-1">loại khác nhau</p>
              </div>
              <div className="h-8 w-8 md:h-10 md:w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package2 className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm text-gray-500 truncate">Tổng số lượng</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{totalAssets}</p>
                <p className="text-xs text-gray-400 mt-1">sản phẩm</p>
              </div>
              <div className="h-8 w-8 md:h-10 md:w-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Hash className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="grid grid-cols-2 gap-3 flex-1">
                <div className="text-center">
                  <p className="text-xs md:text-sm text-gray-500">TSCD</p>
                  <p className="text-base md:text-lg font-semibold text-blue-600">
                    {transaction.items?.filter(item => item.asset?.type === AssetType.TSCD).length || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs md:text-sm text-gray-500">CCDC</p>
                  <p className="text-base md:text-lg font-semibold text-green-600">
                    {transaction.items?.filter(item => item.asset?.type === AssetType.CCDC).length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assets List using Table component */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
            <div>
              <h3 className="text-base md:text-lg font-medium text-gray-900">
                Danh sách tài sản
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Tổng cộng: {transaction.items?.length || 0} loại tài sản, {totalAssets} sản phẩm
              </p>
            </div>
            {transaction.status === TransactionStatus.PENDING && selectedAssets.length > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-blue-600 font-medium">
                  Đã chọn {selectedAssets.length} tài sản
                </span>
                <Button
                  onClick={() => {
                    const selectedItems = transaction.items?.filter(item => 
                      selectedAssets.includes(item.id)
                    );
                    const totalSelectedQuantity = selectedItems?.reduce((sum, item) => 
                      sum + (item.asset?.quantity || 0), 0
                    ) || 0;
                    
                    if (confirm(`Tiếp nhận ${selectedAssets.length} loại tài sản (${totalSelectedQuantity} sản phẩm)?`)) {
                      alert("Tiếp nhận thành công các tài sản đã chọn!");
                      setSelectedAssets([]);
                    }
                  }}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Tiếp nhận đã chọn
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="p-0">
          <Table
            resizable={true}
            columns={columns}
            multiSort={true}
            data={transaction.items || []}
            sortConfigs={sortConfigs}
            onSortChange={handleSortChange}
            emptyText="Không có tài sản nào"
            emptyIcon={<Package2 className="mx-auto h-12 w-12 text-gray-400" />}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: itemsPerPage,
              total: transaction.items?.length || 0,
              onChange: (page, pageSize) => {
                setCurrentPage(page);
                if (pageSize !== itemsPerPage) {
                  setItemsPerPage(pageSize);
                  setCurrentPage(1); // Reset to first page when page size changes
                }
              },
              showSizeChanger: true,
              pageSizeOptions: [5, 10, 20, 50]
            }}
          />
        </div>
      </div>
    </div>
  );
}
