"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  Package2,
  CheckCircle,
  Clock,
  Building,
  Calendar,
  User,
  FileText,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Asset, AssetStatus, AssetType, RoomStatus } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// Mock data cho demo - tài sản từ ban kế hoạch đầu tư gửi xuống
const mockPendingAssets: Asset[] = [
  {
    id: "1",
    ktCode: "24-0001/01",
    fixedCode: "4001.00001",
    name: "Máy tính Dell Latitude 5520",
    specs: "Intel Core i5-1135G7, 8GB RAM, 256GB SSD",
    entryDate: "2024-01-15",
    unit: "Cái",
    quantity: 1,
    origin: "Dell Việt Nam",
    purchasePackage: 1,
    type: AssetType.TSCD,
    isLocked: false, // Chưa được tiếp nhận
    categoryId: "4",
    status: AssetStatus.CHO_PHAN_BO, // Trạng thái chờ tiếp nhận
    createdBy: "planning_dept", // Từ ban kế hoạch đầu tư
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    category: { id: "4", name: "Máy tính", code: "4" }
  },
  {
    id: "3", 
    ktCode: "24-0003/01",
    fixedCode: "5001.00001",
    name: "Máy in HP LaserJet Pro M404dn",
    specs: "In laser đen trắng, tốc độ 38 trang/phút",
    entryDate: "2024-01-25",
    unit: "Cái",
    quantity: 2,
    origin: "HP Việt Nam",
    purchasePackage: 1,
    type: AssetType.TSCD,
    isLocked: false, // Chưa được tiếp nhận
    categoryId: "5",
    status: AssetStatus.CHO_PHAN_BO,
    createdBy: "planning_dept",
    createdAt: "2024-01-25T10:00:00Z",
    updatedAt: "2024-01-25T10:00:00Z",
    category: { id: "5", name: "Máy in", code: "5" }
  },
  {
    id: "4",
    ktCode: "24-0004/01", 
    fixedCode: "3001.00002",
    name: "Bàn họp gỗ tự nhiên",
    specs: "Kích thước 200x100cm, gỗ sồi tự nhiên",
    entryDate: "2024-01-30",
    unit: "Cái",
    quantity: 1,
    origin: "Nội thất Hòa Phát",
    purchasePackage: 2,
    type: AssetType.CCDC,
    isLocked: false,
    categoryId: "3", 
    status: AssetStatus.CHO_PHAN_BO,
    createdBy: "planning_dept",
    createdAt: "2024-01-30T10:00:00Z",
    updatedAt: "2024-01-30T10:00:00Z",
    category: { id: "3", name: "Thiết bị văn phòng", code: "3" }
  }
];

const typeLabels = {
  [AssetType.TSCD]: "Tài sản cố định",
  [AssetType.CCDC]: "Công cụ dụng cụ",
};

interface ReceiveData {
  assetId: string;
  receivedNote: string;
  conditionNote: string;
}

export default function AssetReceivePage() {
  const [assets, setAssets] = useState<Asset[]>(mockPendingAssets);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>(mockPendingAssets);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receiveData, setReceiveData] = useState<ReceiveData>({
    assetId: "",
    receivedNote: "",
    conditionNote: ""
  });

  // Filter assets - chỉ hiển thị tài sản chưa được tiếp nhận
  useEffect(() => {
    let filtered = assets.filter(asset => 
      !asset.deletedAt && 
      !asset.isLocked && // Chưa được tiếp nhận
      asset.status === AssetStatus.CHO_PHAN_BO
    );

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(asset => 
        asset.name.toLowerCase().includes(searchLower) ||
        asset.ktCode.toLowerCase().includes(searchLower) ||
        asset.fixedCode.toLowerCase().includes(searchLower)
      );
    }

    setFilteredAssets(filtered);
  }, [assets, searchTerm]);

  const handleSelectAsset = (assetId: string) => {
    setSelectedAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAssets.length === filteredAssets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(filteredAssets.map(asset => asset.id));
    }
  };

  const handleReceiveAsset = (assetId: string) => {
    setReceiveData({
      assetId,
      receivedNote: "",
      conditionNote: ""
    });
    setShowReceiveModal(true);
  };

  const handleSubmitReceive = () => {
    if (!receiveData.receivedNote.trim()) {
      alert("Vui lòng nhập ghi chú tiếp nhận");
      return;
    }

    if (confirm("Bạn có chắc chắn muốn tiếp nhận tài sản này?")) {
      // Cập nhật trạng thái tài sản - đánh dấu đã tiếp nhận
      setAssets(prev => 
        prev.map(asset => 
          asset.id === receiveData.assetId
            ? { 
                ...asset, 
                isLocked: true, // Đã tiếp nhận
                status: AssetStatus.DANG_SU_DUNG, // Sẵn sàng để phân bổ
                updatedAt: new Date().toISOString()
              }
            : asset
        )
      );

      // Reset form và đóng modal
      setReceiveData({ assetId: "", receivedNote: "", conditionNote: "" });
      setShowReceiveModal(false);
      
      alert("Tiếp nhận tài sản thành công! Tài sản đã sẵn sàng để phân bổ.");
    }
  };

  const handleBulkReceive = () => {
    if (selectedAssets.length === 0) return;
    
    if (confirm(`Bạn có chắc chắn muốn tiếp nhận ${selectedAssets.length} tài sản đã chọn?`)) {
      setAssets(prev => 
        prev.map(asset => 
          selectedAssets.includes(asset.id)
            ? { 
                ...asset, 
                isLocked: true, // Đã tiếp nhận
                status: AssetStatus.DANG_SU_DUNG, // Sẵn sàng để phân bổ
                updatedAt: new Date().toISOString()
              }
            : asset
        )
      );
      
      setSelectedAssets([]);
      alert(`Đã tiếp nhận thành công ${selectedAssets.length} tài sản!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tiếp nhận tài sản</h1>
          <p className="text-gray-600">
            Tiếp nhận tài sản từ ban kế hoạch đầu tư để chuẩn bị phân bổ
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/asset">
            <Button variant="outline">
              Quay lại danh sách tài sản
            </Button>
          </Link>
          <Link href="/asset/allocate">
            <Button className="flex items-center bg-green-500 hover:bg-green-600 text-white">
              Chuyển đến phân bổ →
            </Button>
          </Link>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">Lưu ý</h3>
            <p className="text-sm text-blue-700 mt-1">
              Đây là danh sách tài sản do ban kế hoạch đầu tư gửi xuống. 
              Sau khi tiếp nhận, tài sản sẽ có thể được phân bổ đến các đơn vị sử dụng.
            </p>
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
              placeholder="Tìm kiếm theo tên, mã kế toán, mã tài sản..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedAssets.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm text-green-800">
                Đã chọn {selectedAssets.length} tài sản
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleBulkReceive}
                size="sm"
                className="flex items-center bg-green-500 hover:bg-green-600 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Tiếp nhận hàng loạt
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assets Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedAssets.length === filteredAssets.length && filteredAssets.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thông tin tài sản
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã tài sản
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại/Danh mục
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gói mua
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày gửi
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người gửi
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedAssets.includes(asset.id)}
                      onChange={() => handleSelectAsset(asset.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Package2 className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {asset.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {asset.specs}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Số lượng: {asset.quantity} {asset.unit}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">{asset.ktCode}</div>
                    <div className="text-sm text-gray-500">{asset.fixedCode}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">{typeLabels[asset.type as keyof typeof typeLabels]}</div>
                    <div className="text-sm text-gray-500">{asset.category?.name}</div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge className="bg-purple-100 text-purple-800">
                      Gói {asset.purchasePackage}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(asset.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      Ban kế hoạch đầu tư
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <Link 
                        href={`/asset/${asset.id}`}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleReceiveAsset(asset.id)}
                        className="flex items-center px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Tiếp nhận
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAssets.length === 0 && (
          <div className="text-center py-12">
            <Package2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có tài sản nào</h3>
            <p className="mt-1 text-sm text-gray-500">
              Hiện tại không có tài sản nào cần tiếp nhận hoặc không phù hợp với từ khóa tìm kiếm.
            </p>
          </div>
        )}
      </div>

      {/* Receive Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tiếp nhận tài sản
            </h3>
            
            <div className="space-y-4">
              {/* Ghi chú tiếp nhận */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú tiếp nhận *
                </label>
                <textarea
                  value={receiveData.receivedNote}
                  onChange={(e) => setReceiveData(prev => ({ ...prev, receivedNote: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Nhập ghi chú về việc tiếp nhận tài sản..."
                  required
                />
              </div>

              {/* Tình trạng tài sản */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tình trạng tài sản khi tiếp nhận
                </label>
                <textarea
                  value={receiveData.conditionNote}
                  onChange={(e) => setReceiveData(prev => ({ ...prev, conditionNote: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Mô tả tình trạng tài sản (tùy chọn)..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReceiveModal(false);
                  setReceiveData({ assetId: "", receivedNote: "", conditionNote: "" });
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmitReceive}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Tiếp nhận
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
