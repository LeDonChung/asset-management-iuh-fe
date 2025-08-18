"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Package2,
  CheckCircle,
  Calendar,
  User,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
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
import { Input } from "@/components/ui/input";

// Mock data cho demo - danh sách bàn giao từ ban kế hoạch đầu tư
const mockAssetTransactions: AssetTransaction[] = [
  {
    id: "TXN-2025-001",
    type: TransactionType.TRANSFER,
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
  },
  {
    id: "TXN-2025-002",
    type: TransactionType.TRANSFER,
    fromUnitId: "PKHDTU",
    toUnitId: "PQT",
    createdBy: "Nguyễn Văn Minh", 
    createdAt: "2025-08-16T14:15:00Z",
    status: TransactionStatus.PENDING,
    note: "Bàn giao nội thất văn phòng đợt 2 - Trang bị phòng họp mới",
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
        id: "ITM-2025-004",
        transactionId: "TXN-2025-002",
        assetId: "TABLE-001",
        note: "Bàn họp oval gỗ cao cấp - Thiết kế hiện đại, có hệ thống điện tích hợp",
        asset: {
          id: "TABLE-001",
          ktCode: "25-0004/KT",
          fixedCode: "3331.00001",
          name: "Bàn họp oval gỗ MFC", 
          specs: "Kích thước 240x120x75cm, mặt gỗ MFC phủ Melamine, chân inox 304, có ổ cắm điện tích hợp",
          entryDate: "2025-08-01",
          unit: "Chiếc",
          quantity: 2,
          purchasePackage: 2,
          type: AssetType.CCDC,
          isLocked: false,
          isHandOver: false,
          categoryId: "3331",
          status: AssetStatus.CHO_PHAN_BO,
          createdBy: "nguyen.minh",
          createdAt: "2025-08-01T08:00:00Z", 
          updatedAt: "2025-08-16T14:15:00Z",
          category: { id: "3331", name: "Bàn ghế văn phòng", code: "3331" }
        }
      },
      {
        id: "ITM-2025-005",
        transactionId: "TXN-2025-002",
        assetId: "CHAIR-001",
        note: "Ghế xoay cao cấp - Thiết kế ergonomic, đệm da PU",
        asset: {
          id: "CHAIR-001",
          ktCode: "25-0005/KT",
          fixedCode: "3331.00002",
          name: "Ghế xoay giám đốc da PU",
          specs: "Ghế xoay chân nhôm 5 chấu, đệm da PU cao cấp, tay vịn điều chỉnh, tựa lưng ergonomic",
          entryDate: "2025-08-03",
          unit: "Chiếc",
          quantity: 20,
          purchasePackage: 2,
          type: AssetType.CCDC,
          isLocked: false,
          isHandOver: false,
          categoryId: "3331",
          status: AssetStatus.CHO_PHAN_BO,
          createdBy: "nguyen.minh",
          createdAt: "2025-08-03T08:00:00Z",
          updatedAt: "2025-08-16T14:15:00Z",
          category: { id: "3331", name: "Bàn ghế văn phòng", code: "3331" }
        }
      },
      {
        id: "ITM-2025-006",
        transactionId: "TXN-2025-002",
        assetId: "CABINET-001",
        note: "Tủ hồ sơ cao cấp - Khóa điện tử, chống cháy, chống ẩm",
        asset: {
          id: "CABINET-001",
          ktCode: "25-0006/KT",
          fixedCode: "3332.00001",
          name: "Tủ hồ sơ thép 4 ngăn cao cấp",
          specs: "Tủ thép sơn tĩnh điện, 4 ngăn có khóa, kích thước 90x45x132cm, chống cháy 60 phút",
          entryDate: "2025-08-05",
          unit: "Chiếc",
          quantity: 8,
          purchasePackage: 2,
          type: AssetType.CCDC,
          isLocked: false,
          isHandOver: false,
          categoryId: "3332",
          status: AssetStatus.CHO_PHAN_BO,
          createdBy: "nguyen.minh",
          createdAt: "2025-08-05T08:00:00Z",
          updatedAt: "2025-08-16T14:15:00Z",
          category: { id: "3332", name: "Tủ, kệ văn phòng", code: "3332" }
        }
      }
    ]
  },
  {
    id: "TXN-2025-003",
    type: TransactionType.TRANSFER,
    fromUnitId: "PKHDTU",
    toUnitId: "PQT",
    createdBy: "Lê Thị Hương", 
    createdAt: "2025-08-17T10:45:00Z",
    status: TransactionStatus.PENDING,
    note: "Bàn giao thiết bị phòng thí nghiệm - Khoa Công nghệ Thông tin",
    fromUnit: {
      id: "PKHDTU",
      name: "Phòng Kế Hoạch Đầu Tư",
      type: UnitType.PHONG_KE_HOACH_DAU_TU,
      status: UnitStatus.ACTIVE,
      representativeId: "le.huong",
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
        id: "ITM-2025-007",
        transactionId: "TXN-2025-003",
        assetId: "PROJECTOR-001",
        note: "Máy chiếu laser 4K - Độ phân giải cao, độ sáng 4000 lumens, kèm màn chiếu điện",
        asset: {
          id: "PROJECTOR-001",
          ktCode: "25-0007/KT",
          fixedCode: "2191.00001",
          name: "Máy chiếu laser Epson EB-L200X",
          specs: "Laser 3LCD, 4200 lumens, độ phân giải XGA 1024x768, tuổi thọ laser 20.000h, HDMI/VGA",
          entryDate: "2025-08-10",
          unit: "Chiếc",
          quantity: 3,
          purchasePackage: 3,
          type: AssetType.TSCD,
          isLocked: false,
          isHandOver: false,
          categoryId: "2191",
          status: AssetStatus.CHO_PHAN_BO,
          createdBy: "le.huong",
          createdAt: "2025-08-10T08:00:00Z",
          updatedAt: "2025-08-17T10:45:00Z",
          category: { id: "2191", name: "Thiết bị nghe nhìn", code: "2191" }
        }
      },
      {
        id: "ITM-2025-008",
        transactionId: "TXN-2025-003",
        assetId: "SCREEN-001",
        note: "Màn chiếu điện tự động - Kích thước lớn 120 inch, điều khiển từ xa",
        asset: {
          id: "SCREEN-001",
          ktCode: "25-0008/KT",
          fixedCode: "2191.00002",
          name: "Màn chiếu điện Dalite 120 inch",
          specs: "Màn chiếu treo tường tự động 120\", tỷ lệ 16:9, vài sợi thủy tinh trắng, có điều khiển",
          entryDate: "2025-08-10",
          unit: "Chiếc",
          quantity: 3,
          purchasePackage: 3,
          type: AssetType.CCDC,
          isLocked: false,
          isHandOver: false,
          categoryId: "2191",
          status: AssetStatus.CHO_PHAN_BO,
          createdBy: "le.huong",
          createdAt: "2025-08-10T08:00:00Z",
          updatedAt: "2025-08-17T10:45:00Z",
          category: { id: "2191", name: "Thiết bị nghe nhìn", code: "2191" }
        }
      },
      {
        id: "ITM-2025-009",
        transactionId: "TXN-2025-003",
        assetId: "SPEAKER-001",
        note: "Hệ thống loa hội nghị - Âm thanh chất lượng cao, micro không dây kèm theo",
        asset: {
          id: "SPEAKER-001",
          ktCode: "25-0009/KT",
          fixedCode: "2191.00003",
          name: "Hệ thống âm thanh hội nghị TOA",
          specs: "Bộ loa âm trần 6W x 6 chiếc, amply trung tâm 120W, micro không dây UHF 2 chiếc",
          entryDate: "2025-08-12",
          unit: "Bộ",
          quantity: 1,
          purchasePackage: 3,
          type: AssetType.TSCD,
          isLocked: false,
          isHandOver: false,
          categoryId: "2191",
          status: AssetStatus.CHO_PHAN_BO,
          createdBy: "le.huong",
          createdAt: "2025-08-12T08:00:00Z",
          updatedAt: "2025-08-17T10:45:00Z",
          category: { id: "2191", name: "Thiết bị nghe nhìn", code: "2191" }
        }
      },
      {
        id: "ITM-2025-010",
        transactionId: "TXN-2025-003",
        assetId: "SERVER-001",
        note: "Server Dell PowerEdge - Cấu hình cao cho phòng thí nghiệm, đã cài sẵn hệ điều hành",
        asset: {
          id: "SERVER-001",
          ktCode: "25-0010/KT",
          fixedCode: "2143.00001",
          name: "Máy chủ Dell PowerEdge R450",
          specs: "Intel Xeon Silver 4314, 32GB DDR4 ECC RAM, 2x1TB SAS HDD RAID1, iDRAC9, 2x550W PSU",
          entryDate: "2025-08-14",
          unit: "Chiếc",
          quantity: 1,
          purchasePackage: 3,
          type: AssetType.TSCD,
          isLocked: false,
          isHandOver: false,
          categoryId: "2143",
          status: AssetStatus.CHO_PHAN_BO,
          createdBy: "le.huong",
          createdAt: "2025-08-14T08:00:00Z",
          updatedAt: "2025-08-17T10:45:00Z",
          category: { id: "2143", name: "Máy chủ, thiết bị mạng", code: "2143" }
        }
      }
    ]
  },
  {
    id: "TXN-2025-004",
    type: TransactionType.TRANSFER,
    fromUnitId: "PKHDTU",
    toUnitId: "PQT",
    createdBy: "Phạm Minh Tuấn", 
    createdAt: "2025-08-18T08:00:00Z",
    status: TransactionStatus.PENDING,
    note: "Bàn giao thiết bị y tế - Phòng y tế trường học",
    fromUnit: {
      id: "PKHDTU",
      name: "Phòng Kế Hoạch Đầu Tư",
      type: UnitType.PHONG_KE_HOACH_DAU_TU,
      status: UnitStatus.ACTIVE,
      representativeId: "pham.tuan",
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
        id: "ITM-2025-011",
        transactionId: "TXN-2025-004",
        assetId: "MEDICAL-001",
        note: "Tủ thuốc y tế inox - Đạt chuẩn GMP, có khóa an toàn và nhiệt kế tự động",
        asset: {
          id: "MEDICAL-001",
          ktCode: "25-0011/KT",
          fixedCode: "3721.00001",
          name: "Tủ thuốc y tế inox 304 hai cánh",
          specs: "Inox 304 dày 1.2mm, kích thước 80x40x150cm, có khóa, kệ điều chỉnh, nhiệt kế số",
          entryDate: "2025-08-15",
          unit: "Chiếc",
          quantity: 2,
          purchasePackage: 4,
          type: AssetType.TSCD,
          isLocked: false,
          isHandOver: false,
          categoryId: "3721",
          status: AssetStatus.CHO_PHAN_BO,
          createdBy: "pham.tuan",
          createdAt: "2025-08-15T08:00:00Z",
          updatedAt: "2025-08-18T08:00:00Z",
          category: { id: "3721", name: "Thiết bị y tế", code: "3721" }
        }
      },
      {
        id: "ITM-2025-012",
        transactionId: "TXN-2025-004",
        assetId: "MEDICAL-002",
        note: "Máy đo huyết áp điện tử - Độ chính xác cao, có kết nối máy tính",
        asset: {
          id: "MEDICAL-002",
          ktCode: "25-0012/KT",
          fixedCode: "3721.00002",
          name: "Máy đo huyết áp bán tự động Omron HBP-1100",
          specs: "Màn hình LCD, bộ nhớ 90 lần đo, cổng USB, vòng bít 22-32cm và 32-42cm",
          entryDate: "2025-08-15",
          unit: "Chiếc",
          quantity: 3,
          purchasePackage: 4,
          type: AssetType.TSCD,
          isLocked: false,
          isHandOver: false,
          categoryId: "3721",
          status: AssetStatus.CHO_PHAN_BO,
          createdBy: "pham.tuan",
          createdAt: "2025-08-15T08:00:00Z",
          updatedAt: "2025-08-18T08:00:00Z",
          category: { id: "3721", name: "Thiết bị y tế", code: "3721" }
        }
      }
    ]
  }
];

const typeLabels = {
  [AssetType.TSCD]: "Tài sản cố định",
  [AssetType.CCDC]: "Công cụ dụng cụ",
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

export default function AssetReceivePage() {
  const [transactions, setTransactions] = useState<AssetTransaction[]>(mockAssetTransactions);
  const [filteredTransactions, setFilteredTransactions] = useState<AssetTransaction[]>(mockAssetTransactions);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);

  // Filter transactions - chỉ hiển thị giao dịch chờ tiếp nhận
  useEffect(() => {
    let filtered = transactions.filter(transaction => 
      transaction.status === TransactionStatus.PENDING
    );

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(transaction => 
        transaction.note?.toLowerCase().includes(searchLower) ||
        transaction.fromUnit?.name.toLowerCase().includes(searchLower) ||
        transaction.items?.some(item => 
          item.asset?.name.toLowerCase().includes(searchLower) ||
          item.asset?.ktCode.toLowerCase().includes(searchLower)
        )
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm]);

  const handleSelectTransaction = (transactionId: string) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId) 
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTransactions.length === filteredTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(filteredTransactions.map(transaction => transaction.id));
    }
  };

  const handleReceiveTransaction = (transactionId: string) => {
    if (confirm("Bạn có chắc chắn muốn tiếp nhận bàn giao này?")) {
      setTransactions(prev => 
        prev.map(transaction => 
          transaction.id === transactionId
            ? { 
                ...transaction, 
                status: TransactionStatus.APPROVED,
                approvedAt: new Date().toISOString(),
                approvedBy: "current_user"
              }
            : transaction
        )
      );
      
      alert("Tiếp nhận bàn giao thành công! Tài sản đã sẵn sàng để phân bổ.");
    }
  };

  const handleBulkReceive = () => {
    if (selectedTransactions.length === 0) return;
    
    if (confirm(`Bạn có chắc chắn muốn tiếp nhận ${selectedTransactions.length} bàn giao đã chọn?`)) {
      setTransactions(prev => 
        prev.map(transaction => 
          selectedTransactions.includes(transaction.id)
            ? { 
                ...transaction, 
                status: TransactionStatus.APPROVED,
                approvedAt: new Date().toISOString(),
                approvedBy: "current_user"
              }
            : transaction
        )
      );
      
      setSelectedTransactions([]);
      alert(`Đã tiếp nhận thành công ${selectedTransactions.length} bàn giao!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tiếp nhận tài sản</h1>
          <p className="text-gray-600">
            Tiếp nhận danh sách bàn giao tài sản từ ban kế hoạch đầu tư
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/asset">
            <Button variant="outline">
              Quay lại danh sách tài sản
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
              Đây là danh sách bàn giao do ban kế hoạch đầu tư gửi xuống. 
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
              placeholder="Tìm kiếm theo ghi chú, đơn vị, tên tài sản, mã tài sản..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTransactions.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm text-green-800">
                Đã chọn {selectedTransactions.length} bàn giao
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

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedTransactions.length === filteredTransactions.length && filteredTransactions.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thông tin bàn giao
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đơn vị gửi
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số lượng tài sản
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày gửi
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
                <React.Fragment key={transaction.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(transaction.id)}
                        onChange={() => handleSelectTransaction(transaction.id)}
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
                            {transaction.note}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {transaction.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1 text-gray-400" />
                        <div className="text-sm text-gray-900">{transaction.fromUnit?.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className="bg-purple-100 text-purple-800">
                        {transaction.items?.length || 0} tài sản
                      </Badge>
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
                      <div className="flex items-center space-x-2">
                        <Link href={`/asset/receive/${transaction.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Xem chi tiết
                          </Button>
                        </Link>
                        <Button
                          onClick={() => handleReceiveTransaction(transaction.id)}
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Tiếp nhận
                        </Button>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <Package2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có bàn giao nào</h3>
            <p className="mt-1 text-sm text-gray-500">
              Hiện tại không có bàn giao nào cần tiếp nhận hoặc không phù hợp với từ khóa tìm kiếm.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
