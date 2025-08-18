"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Package2,
  Calendar,
  Building2,
  MapPin,
  User,
  ArrowLeft,
  Eye,
} from "lucide-react";
import Link from "next/link";
import {
  AssetTransaction,
  TransactionType,
  TransactionStatus,
  AssetType,
} from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// Mock data đơn giản cho lịch sử phân bổ 
const mockAllocationTransactions: AssetTransaction[] = [
  {
    id: "TXN-ALLOCATE-001",
    type: TransactionType.ALLOCATE,
    status: TransactionStatus.APPROVED,
    createdBy: "Trần Thị Hà",
    createdAt: "2025-08-18T10:30:00Z",
    approvedBy: "Trần Thị Hà",
    approvedAt: "2025-08-18T10:30:00Z",
    note: "Phân bổ thiết bị IT cho khoa CNTT",
    items: [
      {
        id: "ITEM-001",
        transactionId: "TXN-ALLOCATE-001",
        assetId: "LAPTOP-001",
        note: "Phân bổ 2 laptop đến Khoa CNTT - Phòng lab 1",
      }
    ]
  },
  {
    id: "TXN-ALLOCATE-002", 
    type: TransactionType.ALLOCATE,
    status: TransactionStatus.APPROVED,
    createdBy: "Trần Thị Hà",
    createdAt: "2025-08-18T11:30:00Z",
    approvedBy: "Trần Thị Hà", 
    approvedAt: "2025-08-18T11:30:00Z",
    note: "Phân bổ máy in cho phòng hành chính",
    items: [
      {
        id: "ITEM-002",
        transactionId: "TXN-ALLOCATE-002",
        assetId: "PRINTER-001",
        note: "Phân bổ 1 máy in đến Phòng Hành chính",
      }
    ]
  }
];

const statusColors = {
  [TransactionStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [TransactionStatus.APPROVED]: "bg-green-100 text-green-800",
  [TransactionStatus.REJECTED]: "bg-red-100 text-red-800",
};

const statusLabels = {
  [TransactionStatus.PENDING]: "Chờ phê duyệt",
  [TransactionStatus.APPROVED]: "Đã phê duyệt",
  [TransactionStatus.REJECTED]: "Đã từ chối",
};

export default function AllocationHistoryPage() {
  const [transactions, setTransactions] = useState<AssetTransaction[]>(mockAllocationTransactions);
  const [filteredTransactions, setFilteredTransactions] = useState<AssetTransaction[]>(mockAllocationTransactions);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter transactions
  useEffect(() => {
    let filtered = transactions.filter(transaction => 
      transaction.type === TransactionType.ALLOCATE
    );

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(transaction => 
        transaction.note?.toLowerCase().includes(searchLower) ||
        transaction.createdBy.toLowerCase().includes(searchLower) ||
        transaction.items?.some(item => 
          item.note?.toLowerCase().includes(searchLower)
        )
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch sử phân bổ tài sản</h1>
          <p className="text-gray-600">
            Theo dõi lịch sử phân bổ tài sản đến các đơn vị sử dụng
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/asset/allocate">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại phân bổ
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Tổng phân bổ</p>
              <p className="text-lg font-semibold text-gray-900">{transactions.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Đã phê duyệt</p>
              <p className="text-lg font-semibold text-gray-900">
                {transactions.filter(t => t.status === TransactionStatus.APPROVED).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MapPin className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Chờ phê duyệt</p>
              <p className="text-lg font-semibold text-gray-900">
                {transactions.filter(t => t.status === TransactionStatus.PENDING).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <User className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Đã từ chối</p>
              <p className="text-lg font-semibold text-gray-900">
                {transactions.filter(t => t.status === TransactionStatus.REJECTED).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo ghi chú, người tạo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã giao dịch
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ghi chú
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số lượng tài sản
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người tạo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Package2 className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">
                      {transaction.note}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge className="bg-purple-100 text-purple-800">
                      {transaction.items?.length || 0} tài sản
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1 text-gray-400" />
                      <div className="text-sm text-gray-900">
                        {transaction.createdBy}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(transaction.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge className={statusColors[transaction.status as keyof typeof statusColors]}>
                      {statusLabels[transaction.status as keyof typeof statusLabels]}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Link href={`/asset/allocate/${transaction.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <Package2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có lịch sử nào</h3>
            <p className="mt-1 text-sm text-gray-500">
              Chưa có phân bổ nào được thực hiện hoặc không phù hợp với từ khóa tìm kiếm.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
