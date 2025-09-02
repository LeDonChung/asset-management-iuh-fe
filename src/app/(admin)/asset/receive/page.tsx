"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Package2,
  CheckCircle,
  Calendar,
  User,
  AlertCircle,
  Filter,
  X,
  Check,
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
import AdvancedFilter, {
  FilterCondition,
  AdvancedFilterState,
} from "@/components/filter/AdvancedFilter";
import { Table, TableColumn } from "@/components/ui/table";

// Mock data cho demo - danh sách bàn giao từ ban kế hoạch đầu tư
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
      updatedAt: "2024-01-01T00:00:00Z",
    },
    toUnit: {
      id: "PQT",
      name: "Phòng Quản Trị",
      type: UnitType.PHONG_QUAN_TRI,
      status: UnitStatus.ACTIVE,
      representativeId: "tran.ha",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
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
          specs:
            'Intel Core i7-1250U, 16GB DDR4 RAM, 512GB NVMe SSD, 15.6" FHD, Windows 11 Pro',
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
          category: { id: "2141", name: "Máy tính xách tay", code: "2141" },
        },
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
          specs:
            'Intel Core i5-12500, 16GB DDR4, 1TB HDD + 256GB SSD, DVD-RW, có màn hình HP 24" IPS',
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
          category: { id: "2142", name: "Máy tính để bàn", code: "2142" },
        },
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
          specs:
            "In laser đen trắng, scan màu, copy, fax, tốc độ 38trang/phút, WiFi, duplex tự động",
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
          category: { id: "2231", name: "Máy in, máy photocopy", code: "2231" },
        },
      },
    ],
  },
  {
    id: "TXN-2025-002",
    type: TransactionType.HANDOVER,
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
      updatedAt: "2024-01-01T00:00:00Z",
    },
    toUnit: {
      id: "PQT",
      name: "Phòng Quản Trị",
      type: UnitType.PHONG_QUAN_TRI,
      status: UnitStatus.ACTIVE,
      representativeId: "tran.ha",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
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
          specs:
            "Kích thước 240x120x75cm, mặt gỗ MFC phủ Melamine, chân inox 304, có ổ cắm điện tích hợp",
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
          category: { id: "3331", name: "Bàn ghế văn phòng", code: "3331" },
        },
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
          specs:
            "Ghế xoay chân nhôm 5 chấu, đệm da PU cao cấp, tay vịn điều chỉnh, tựa lưng ergonomic",
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
          category: { id: "3331", name: "Bàn ghế văn phòng", code: "3331" },
        },
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
          specs:
            "Tủ thép sơn tĩnh điện, 4 ngăn có khóa, kích thước 90x45x132cm, chống cháy 60 phút",
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
          category: { id: "3332", name: "Tủ, kệ văn phòng", code: "3332" },
        },
      },
    ],
  },
  {
    id: "TXN-2025-003",
    type: TransactionType.HANDOVER,
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
      updatedAt: "2024-01-01T00:00:00Z",
    },
    toUnit: {
      id: "PQT",
      name: "Phòng Quản Trị",
      type: UnitType.PHONG_QUAN_TRI,
      status: UnitStatus.ACTIVE,
      representativeId: "tran.ha",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
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
          specs:
            "Laser 3LCD, 4200 lumens, độ phân giải XGA 1024x768, tuổi thọ laser 20.000h, HDMI/VGA",
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
          category: { id: "2191", name: "Thiết bị nghe nhìn", code: "2191" },
        },
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
          specs:
            'Màn chiếu treo tường tự động 120", tỷ lệ 16:9, vài sợi thủy tinh trắng, có điều khiển',
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
          category: { id: "2191", name: "Thiết bị nghe nhìn", code: "2191" },
        },
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
          specs:
            "Bộ loa âm trần 6W x 6 chiếc, amply trung tâm 120W, micro không dây UHF 2 chiếc",
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
          category: { id: "2191", name: "Thiết bị nghe nhìn", code: "2191" },
        },
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
          specs:
            "Intel Xeon Silver 4314, 32GB DDR4 ECC RAM, 2x1TB SAS HDD RAID1, iDRAC9, 2x550W PSU",
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
          category: {
            id: "2143",
            name: "Máy chủ, thiết bị mạng",
            code: "2143",
          },
        },
      },
    ],
  },
  {
    id: "TXN-2025-004",
    type: TransactionType.HANDOVER,
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
      updatedAt: "2024-01-01T00:00:00Z",
    },
    toUnit: {
      id: "PQT",
      name: "Phòng Quản Trị",
      type: UnitType.PHONG_QUAN_TRI,
      status: UnitStatus.ACTIVE,
      representativeId: "tran.ha",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
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
          specs:
            "Inox 304 dày 1.2mm, kích thước 80x40x150cm, có khóa, kệ điều chỉnh, nhiệt kế số",
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
          category: { id: "3721", name: "Thiết bị y tế", code: "3721" },
        },
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
          specs:
            "Màn hình LCD, bộ nhớ 90 lần đo, cổng USB, vòng bít 22-32cm và 32-42cm",
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
          category: { id: "3721", name: "Thiết bị y tế", code: "3721" },
        },
      },
    ],
  },
  {
    id: "TXN-2025-005",
    type: TransactionType.HANDOVER,
    fromUnitId: "PKHDTU",
    toUnitId: "PQT",
    createdBy: "Trần Thị Mai",
    createdAt: "2025-08-10T16:30:00Z",
    status: TransactionStatus.APPROVED,
    note: "Bàn giao máy móc công nghiệp - Xưởng thực hành cơ khí",
    approvedAt: "2025-08-12T09:15:00Z",
    approvedBy: "tran.ha",
    fromUnit: {
      id: "PKHDTU",
      name: "Phòng Kế Hoạch Đầu Tư",
      type: UnitType.PHONG_KE_HOACH_DAU_TU,
      status: UnitStatus.ACTIVE,
      representativeId: "tran.mai",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    toUnit: {
      id: "PQT",
      name: "Phòng Quản Trị",
      type: UnitType.PHONG_QUAN_TRI,
      status: UnitStatus.ACTIVE,
      representativeId: "tran.ha",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    items: [
      {
        id: "ITM-2025-013",
        transactionId: "TXN-2025-005",
        assetId: "MACHINE-001",
        note: "Máy tiện CNC - Đã được kiểm tra và hiệu chỉnh, sẵn sàng đưa vào sử dụng",
        asset: {
          id: "MACHINE-001",
          ktCode: "25-0013/KT",
          fixedCode: "6151.00001",
          name: "Máy tiện CNC Fanuc 0i-MF",
          specs:
            "Độ chính xác ±0.005mm, tốc độ trục chính 4000rpm, kẹp 3 chấu Ø250mm",
          entryDate: "2025-07-28",
          unit: "Chiếc",
          quantity: 1,
          purchasePackage: 5,
          type: AssetType.TSCD,
          isLocked: false,
          isHandOver: false,
          categoryId: "6151",
          status: AssetStatus.CHO_PHAN_BO,
          createdBy: "tran.mai",
          createdAt: "2025-07-28T08:00:00Z",
          updatedAt: "2025-08-10T16:30:00Z",
          category: { id: "6151", name: "Máy công cụ", code: "6151" },
        },
      },
    ],
  },
  // Additional mock data for testing filters
  {
    id: "TXN-2025-006",
    type: TransactionType.HANDOVER,
    fromUnitId: "PKHDTU",
    toUnitId: "PQT",
    createdBy: "Nguyễn Thị Lan",
    createdAt: "2025-08-05T10:00:00Z",
    status: TransactionStatus.REJECTED,
    note: "Bàn giao thiết bị điện tử - Bị từ chối do không đúng quy cách",
    fromUnit: {
      id: "PKHDTU",
      name: "Phòng Kế Hoạch Đầu Tư",
      type: UnitType.PHONG_KE_HOACH_DAU_TU,
      status: UnitStatus.ACTIVE,
      representativeId: "nguyen.lan",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    toUnit: {
      id: "PQT",
      name: "Phòng Quản Trị",
      type: UnitType.PHONG_QUAN_TRI,
      status: UnitStatus.ACTIVE,
      representativeId: "tran.ha",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    items: [
      {
        id: "ITM-2025-014",
        transactionId: "TXN-2025-006",
        assetId: "TABLET-001",
        note: "Tablet Samsung - Không đúng model yêu cầu",
        asset: {
          id: "TABLET-001",
          ktCode: "25-0014/KT",
          fixedCode: "2145.00001",
          name: "Tablet Samsung Galaxy Tab S8",
          specs: "11 inch, 8GB RAM, 256GB Storage, S-Pen",
          entryDate: "2025-08-01",
          unit: "Chiếc",
          quantity: 5,
          purchasePackage: 6,
          type: AssetType.TSCD,
          isLocked: false,
          isHandOver: false,
          categoryId: "2145",
          status: AssetStatus.CHO_PHAN_BO,
          createdBy: "nguyen.lan",
          createdAt: "2025-08-01T08:00:00Z",
          updatedAt: "2025-08-05T10:00:00Z",
          category: { id: "2145", name: "Thiết bị di động", code: "2145" },
        },
      },
    ],
  },
  {
    id: "TXN-2025-007",
    type: TransactionType.HANDOVER,
    fromUnitId: "PKHDTU",
    toUnitId: "PQT",
    createdBy: "Hoàng Văn Đức",
    createdAt: "2025-07-30T15:45:00Z",
    status: TransactionStatus.APPROVED,
    note: "Bàn giao thiết bị âm thanh phòng hội nghị",
    approvedAt: "2025-08-01T09:30:00Z",
    approvedBy: "tran.ha",
    fromUnit: {
      id: "PKHDTU",
      name: "Phòng Kế Hoạch Đầu Tư",
      type: UnitType.PHONG_KE_HOACH_DAU_TU,
      status: UnitStatus.ACTIVE,
      representativeId: "hoang.duc",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    toUnit: {
      id: "PQT",
      name: "Phòng Quản Trị",
      type: UnitType.PHONG_QUAN_TRI,
      status: UnitStatus.ACTIVE,
      representativeId: "tran.ha",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    items: [
      {
        id: "ITM-2025-015",
        transactionId: "TXN-2025-007",
        assetId: "AUDIO-001",
        note: "Bộ âm thanh hội nghị chuyên nghiệp",
        asset: {
          id: "AUDIO-001",
          ktCode: "25-0015/KT",
          fixedCode: "2192.00001",
          name: "Hệ thống âm thanh hội nghị Bosch",
          specs: "Bộ điều khiển trung tâm, 12 micro đại biểu, 2 loa cột",
          entryDate: "2025-07-25",
          unit: "Bộ",
          quantity: 1,
          purchasePackage: 7,
          type: AssetType.TSCD,
          isLocked: false,
          isHandOver: false,
          categoryId: "2192",
          status: AssetStatus.CHO_PHAN_BO,
          createdBy: "hoang.duc",
          createdAt: "2025-07-25T08:00:00Z",
          updatedAt: "2025-07-30T15:45:00Z",
          category: { id: "2192", name: "Thiết bị hội nghị", code: "2192" },
        },
      },
    ],
  },
  // Thêm dữ liệu để test pagination
  {
    id: "TXN-2025-008",
    type: TransactionType.HANDOVER,
    fromUnitId: "PKHDTU",
    toUnitId: "PQT",
    createdBy: "Vũ Thị Hoa",
    createdAt: "2025-08-20T11:20:00Z",
    status: TransactionStatus.PENDING,
    note: "Bàn giao thiết bị phòng thí nghiệm hóa học",
    fromUnit: {
      id: "PKHDTU",
      name: "Phòng Kế Hoạch Đầu Tư",
      type: UnitType.PHONG_KE_HOACH_DAU_TU,
      status: UnitStatus.ACTIVE,
      representativeId: "vu.hoa",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    toUnit: {
      id: "PQT",
      name: "Phòng Quản Trị",
      type: UnitType.PHONG_QUAN_TRI,
      status: UnitStatus.ACTIVE,
      representativeId: "tran.ha",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    items: [
      {
        id: "ITM-2025-016",
        transactionId: "TXN-2025-008",
        assetId: "CHEMICAL-001",
        note: "Tủ hút khí độc hại - Đạt chuẩn an toàn phòng thí nghiệm",
        asset: {
          id: "CHEMICAL-001",
          ktCode: "25-0016/KT",
          fixedCode: "3722.00001",
          name: "Tủ hút khí độc hại Labconco",
          specs:
            "Kích thước 120x60x75cm, quạt hút 1200m³/h, đèn UV, mặt kính an toàn",
          entryDate: "2025-08-18",
          unit: "Chiếc",
          quantity: 3,
          purchasePackage: 8,
          type: AssetType.TSCD,
          isLocked: false,
          isHandOver: false,
          categoryId: "3722",
          status: AssetStatus.CHO_PHAN_BO,
          createdBy: "vu.hoa",
          createdAt: "2025-08-18T08:00:00Z",
          updatedAt: "2025-08-20T11:20:00Z",
          category: {
            id: "3722",
            name: "Thiết bị phòng thí nghiệm",
            code: "3722",
          },
        },
      },
    ],
  },
  {
    id: "TXN-2025-009",
    type: TransactionType.HANDOVER,
    fromUnitId: "PKHDTU",
    toUnitId: "PQT",
    createdBy: "Lê Văn Sơn",
    createdAt: "2025-08-21T14:30:00Z",
    status: TransactionStatus.PENDING,
    note: "Bàn giao thiết bị thể thao - Sân vận động trường",
    fromUnit: {
      id: "PKHDTU",
      name: "Phòng Kế Hoạch Đầu Tư",
      type: UnitType.PHONG_KE_HOACH_DAU_TU,
      status: UnitStatus.ACTIVE,
      representativeId: "le.son",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    toUnit: {
      id: "PQT",
      name: "Phòng Quản Trị",
      type: UnitType.PHONG_QUAN_TRI,
      status: UnitStatus.ACTIVE,
      representativeId: "tran.ha",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    items: [
      {
        id: "ITM-2025-017",
        transactionId: "TXN-2025-009",
        assetId: "SPORTS-001",
        note: "Máy tập thể dục đa năng - Phòng gym sinh viên",
        asset: {
          id: "SPORTS-001",
          ktCode: "25-0017/KT",
          fixedCode: "3723.00001",
          name: "Máy tập thể dục đa năng Life Fitness",
          specs:
            "12 chức năng tập luyện, màn hình LCD, điều chỉnh độ khó điện tử",
          entryDate: "2025-08-19",
          unit: "Chiếc",
          quantity: 5,
          purchasePackage: 9,
          type: AssetType.TSCD,
          isLocked: false,
          isHandOver: false,
          categoryId: "3723",
          status: AssetStatus.CHO_PHAN_BO,
          createdBy: "le.son",
          createdAt: "2025-08-19T08:00:00Z",
          updatedAt: "2025-08-21T14:30:00Z",
          category: { id: "3723", name: "Thiết bị thể thao", code: "3723" },
        },
      },
    ],
  },
  {
    id: "TXN-2025-010",
    type: TransactionType.HANDOVER,
    fromUnitId: "PKHDTU",
    toUnitId: "PQT",
    createdBy: "Nguyễn Thị Dung",
    createdAt: "2025-08-22T09:15:00Z",
    status: TransactionStatus.APPROVED,
    note: "Bàn giao thiết bị thư viện - Thư viện trung tâm",
    approvedAt: "2025-08-23T10:00:00Z",
    approvedBy: "tran.ha",
    fromUnit: {
      id: "PKHDTU",
      name: "Phòng Kế Hoạch Đầu Tư",
      type: UnitType.PHONG_KE_HOACH_DAU_TU,
      status: UnitStatus.ACTIVE,
      representativeId: "nguyen.dung",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    toUnit: {
      id: "PQT",
      name: "Phòng Quản Trị",
      type: UnitType.PHONG_QUAN_TRI,
      status: UnitStatus.ACTIVE,
      representativeId: "tran.ha",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    items: [
      {
        id: "ITM-2025-018",
        transactionId: "TXN-2025-010",
        assetId: "LIBRARY-001",
        note: "Máy quét mã vạch thư viện - Hệ thống quản lý sách",
        asset: {
          id: "LIBRARY-001",
          ktCode: "25-0018/KT",
          fixedCode: "3724.00001",
          name: "Máy quét mã vạch Honeywell 1900",
          specs:
            "Quét 1D/2D, tốc độ 100 scans/giây, kết nối USB, phần mềm quản lý",
          entryDate: "2025-08-20",
          unit: "Chiếc",
          quantity: 8,
          purchasePackage: 10,
          type: AssetType.TSCD,
          isLocked: false,
          isHandOver: false,
          categoryId: "3724",
          status: AssetStatus.CHO_PHAN_BO,
          createdBy: "nguyen.dung",
          createdAt: "2025-08-20T08:00:00Z",
          updatedAt: "2025-08-22T09:15:00Z",
          category: { id: "3724", name: "Thiết bị thư viện", code: "3724" },
        },
      },
    ],
  },
  {
    id: "TXN-2025-011",
    type: TransactionType.HANDOVER,
    fromUnitId: "PKHDTU",
    toUnitId: "PQT",
    createdBy: "Trần Văn Nam",
    createdAt: "2025-08-24T16:45:00Z",
    status: TransactionStatus.PENDING,
    note: "Bàn giao thiết bị bảo mật - Hệ thống an ninh trường học",
    fromUnit: {
      id: "PKHDTU",
      name: "Phòng Kế Hoạch Đầu Tư",
      type: UnitType.PHONG_KE_HOACH_DAU_TU,
      status: UnitStatus.ACTIVE,
      representativeId: "tran.nam",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    toUnit: {
      id: "PQT",
      name: "Phòng Quản Trị",
      type: UnitType.PHONG_QUAN_TRI,
      status: UnitStatus.ACTIVE,
      representativeId: "tran.ha",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    items: [
      {
        id: "ITM-2025-019",
        transactionId: "TXN-2025-011",
        assetId: "SECURITY-001",
        note: "Camera giám sát IP - Hệ thống an ninh toàn trường",
        asset: {
          id: "SECURITY-001",
          ktCode: "25-0019/KT",
          fixedCode: "3725.00001",
          name: "Camera IP Dome Hikvision DS-2CD2142FWD-I",
          specs: "Độ phân giải 4MP, hồng ngoại 30m, chống nước IP67, PoE",
          entryDate: "2025-08-22",
          unit: "Chiếc",
          quantity: 25,
          purchasePackage: 11,
          type: AssetType.TSCD,
          isLocked: false,
          isHandOver: false,
          categoryId: "3725",
          status: AssetStatus.CHO_PHAN_BO,
          createdBy: "tran.nam",
          createdAt: "2025-08-22T08:00:00Z",
          updatedAt: "2025-08-24T16:45:00Z",
          category: { id: "3725", name: "Thiết bị an ninh", code: "3725" },
        },
      },
    ],
  },
  {
    id: "TXN-2025-012",
    type: TransactionType.HANDOVER,
    fromUnitId: "PKHDTU",
    toUnitId: "PQT",
    createdBy: "Phạm Thị Lan",
    createdAt: "2025-08-25T13:20:00Z",
    status: TransactionStatus.REJECTED,
    note: "Bàn giao thiết bị văn phòng - Bị từ chối do không đúng quy cách",
    fromUnit: {
      id: "PKHDTU",
      name: "Phòng Kế Hoạch Đầu Tư",
      type: UnitType.PHONG_KE_HOACH_DAU_TU,
      status: UnitStatus.ACTIVE,
      representativeId: "pham.lan",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    toUnit: {
      id: "PQT",
      name: "Phòng Quản Trị",
      type: UnitType.PHONG_QUAN_TRI,
      status: UnitStatus.ACTIVE,
      representativeId: "tran.ha",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    items: [
      {
        id: "ITM-2025-020",
        transactionId: "TXN-2025-012",
        assetId: "OFFICE-001",
        note: "Máy fax đa chức năng - Không đúng model yêu cầu",
        asset: {
          id: "OFFICE-001",
          ktCode: "25-0020/KT",
          fixedCode: "3726.00001",
          name: "Máy fax đa chức năng Brother FAX-2840",
          specs: "Fax, in, scan, copy, tốc độ 33.6kbps, bộ nhớ 100 trang",
          entryDate: "2025-08-23",
          unit: "Chiếc",
          quantity: 3,
          purchasePackage: 12,
          type: AssetType.TSCD,
          isLocked: false,
          isHandOver: false,
          categoryId: "3726",
          status: AssetStatus.CHO_PHAN_BO,
          createdBy: "pham.lan",
          createdAt: "2025-08-23T08:00:00Z",
          updatedAt: "2025-08-25T13:20:00Z",
          category: { id: "3726", name: "Thiết bị văn phòng", code: "3726" },
        },
      },
    ],
  },
  {
    id: "TXN-2025-013",
    type: TransactionType.HANDOVER,
    fromUnitId: "PKHDTU",
    toUnitId: "PQT",
    createdBy: "Hoàng Thị Mai",
    createdAt: "2025-08-26T10:30:00Z",
    status: TransactionStatus.PENDING,
    note: "Bàn giao thiết bị nhà bếp - Căng tin sinh viên",
    fromUnit: {
      id: "PKHDTU",
      name: "Phòng Kế Hoạch Đầu Tư",
      type: UnitType.PHONG_KE_HOACH_DAU_TU,
      status: UnitStatus.ACTIVE,
      representativeId: "hoang.mai",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    toUnit: {
      id: "PQT",
      name: "Phòng Quản Trị",
      type: UnitType.PHONG_QUAN_TRI,
      status: UnitStatus.ACTIVE,
      representativeId: "tran.ha",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    items: [
      {
        id: "ITM-2025-021",
        transactionId: "TXN-2025-013",
        assetId: "KITCHEN-001",
        note: "Tủ lạnh công nghiệp - Bảo quản thực phẩm căng tin",
        asset: {
          id: "KITCHEN-001",
          ktCode: "25-0021/KT",
          fixedCode: "3727.00001",
          name: "Tủ lạnh công nghiệp Panasonic NR-FS560",
          specs: "Dung tích 560L, 2 cửa, điều chỉnh nhiệt độ -18°C đến +10°C",
          entryDate: "2025-08-24",
          unit: "Chiếc",
          quantity: 2,
          purchasePackage: 13,
          type: AssetType.TSCD,
          isLocked: false,
          isHandOver: false,
          categoryId: "3727",
          status: AssetStatus.CHO_PHAN_BO,
          createdBy: "hoang.mai",
          createdAt: "2025-08-24T08:00:00Z",
          updatedAt: "2025-08-26T10:30:00Z",
          category: { id: "3727", name: "Thiết bị nhà bếp", code: "3727" },
        },
      },
    ],
  },
  {
    id: "TXN-2025-014",
    type: TransactionType.HANDOVER,
    fromUnitId: "PKHDTU",
    toUnitId: "PQT",
    createdBy: "Lê Văn Hùng",
    createdAt: "2025-08-27T15:10:00Z",
    status: TransactionStatus.PENDING,
    note: "Bàn giao thiết bị phòng họp - Hội trường lớn",
    fromUnit: {
      id: "PKHDTU",
      name: "Phòng Kế Hoạch Đầu Tư",
      type: UnitType.PHONG_KE_HOACH_DAU_TU,
      status: UnitStatus.ACTIVE,
      representativeId: "le.hung",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    toUnit: {
      id: "PQT",
      name: "Phòng Quản Trị",
      type: UnitType.PHONG_QUAN_TRI,
      status: UnitStatus.ACTIVE,
      representativeId: "tran.ha",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    items: [
      {
        id: "ITM-2025-022",
        transactionId: "TXN-2025-014",
        assetId: "MEETING-001",
        note: "Hệ thống âm thanh hội nghị - Phòng họp 200 người",
        asset: {
          id: "MEETING-001",
          ktCode: "25-0022/KT",
          fixedCode: "3728.00001",
          name: "Hệ thống âm thanh hội nghị Bose Professional",
          specs:
            "Amply 1000W, 8 loa treo tường, 4 micro không dây, mixer 8 kênh",
          entryDate: "2025-08-25",
          unit: "Bộ",
          quantity: 1,
          purchasePackage: 14,
          type: AssetType.TSCD,
          isLocked: false,
          isHandOver: false,
          categoryId: "3728",
          status: AssetStatus.CHO_PHAN_BO,
          createdBy: "le.hung",
          createdAt: "2025-08-25T08:00:00Z",
          updatedAt: "2025-08-27T15:10:00Z",
          category: { id: "3728", name: "Thiết bị hội nghị", code: "3728" },
        },
      },
    ],
  },
  {
    id: "TXN-2025-015",
    type: TransactionType.HANDOVER,
    fromUnitId: "PKHDTU",
    toUnitId: "PQT",
    createdBy: "Nguyễn Thị Thảo",
    createdAt: "2025-08-28T12:00:00Z",
    status: TransactionStatus.APPROVED,
    note: "Bàn giao thiết bị phòng máy tính - Phòng lab CNTT",
    approvedAt: "2025-08-29T09:30:00Z",
    approvedBy: "tran.ha",
    fromUnit: {
      id: "PKHDTU",
      name: "Phòng Kế Hoạch Đầu Tư",
      type: UnitType.PHONG_KE_HOACH_DAU_TU,
      status: UnitStatus.ACTIVE,
      representativeId: "nguyen.thao",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    toUnit: {
      id: "PQT",
      name: "Phòng Quản Trị",
      type: UnitType.PHONG_QUAN_TRI,
      status: UnitStatus.ACTIVE,
      representativeId: "tran.ha",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    items: [
      {
        id: "ITM-2025-023",
        transactionId: "TXN-2025-015",
        assetId: "COMPUTER-002",
        note: "Máy tính để bàn Dell OptiPlex - Phòng lab 30 máy",
        asset: {
          id: "COMPUTER-002",
          ktCode: "25-0023/KT",
          fixedCode: "2142.00002",
          name: "Máy tính để bàn Dell OptiPlex 7090",
          specs: "Intel Core i7-11700, 16GB DDR4, 512GB SSD, Windows 11 Pro",
          entryDate: "2025-08-26",
          unit: "Bộ",
          quantity: 30,
          purchasePackage: 15,
          type: AssetType.TSCD,
          isLocked: false,
          isHandOver: false,
          categoryId: "2142",
          status: AssetStatus.CHO_PHAN_BO,
          createdBy: "nguyen.thao",
          createdAt: "2025-08-26T08:00:00Z",
          updatedAt: "2025-08-28T12:00:00Z",
          category: { id: "2142", name: "Máy tính để bàn", code: "2142" },
        },
      },
    ],
  },
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
  const [transactions, setTransactions] = useState<AssetTransaction[]>(
    mockAssetTransactions
  );
  const [filteredTransactions, setFilteredTransactions] = useState<
    AssetTransaction[]
  >(mockAssetTransactions);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>(
    []
  );

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Advanced Filter states
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>(
    []
  );
  const [conditionLogic, setConditionLogic] = useState<
    "contains" | "equals" | "not_contains"
  >("contains");
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfigs, setSortConfigs] = useState<any[]>([]);

  // Filter options for AdvancedFilter
  const filterOptions = [
    {
      value: "status",
      label: "Trạng thái",
      type: "select" as const,
      options: Object.entries(statusLabels).map(([value, label]) => ({
        value,
        label,
      })),
    },
    { value: "createdAt", label: "Ngày tạo", type: "date" as const },
    {
      value: "fromUnit",
      label: "Đơn vị gửi",
      type: "select" as const,
      options: [
        { value: "PKHDTU", label: "Phòng Kế Hoạch Đầu Tư" },
        { value: "PQT", label: "Phòng Quản Trị" },
      ],
    },
  ];

  // Operator options for filter conditions
  const operatorOptions = [
    { value: "contains", label: "Tất cả" },
    { value: "equals", label: "Bất kì" },
    { value: "not_contains", label: "Không" },
  ];

  // Filter transactions based on search and advanced filter conditions
  useEffect(() => {
    let filtered = transactions;

    // Apply search filter first
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (transaction) =>
          transaction.id.toLowerCase().includes(searchLower) ||
          transaction.note?.toLowerCase().includes(searchLower) ||
          transaction.createdBy.toLowerCase().includes(searchLower) ||
          transaction.fromUnit?.name.toLowerCase().includes(searchLower) ||
          transaction.toUnit?.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply advanced filters
    if (filterConditions.length > 0) {
      filtered = filtered.filter((transaction) => {
        const conditionResults = filterConditions.map((condition) => {
          if (
            !condition.value ||
            (Array.isArray(condition.value) && condition.value.length === 0)
          ) {
            return true; // Skip empty conditions
          }

          let fieldValue: string | string[] = "";

          switch (condition.field) {
            case "status":
              fieldValue = transaction.status;
              break;
            case "createdAt":
              fieldValue = new Date(transaction.createdAt)
                .toISOString()
                .split("T")[0];
              break;
            case "fromUnit":
              fieldValue = transaction.fromUnit?.name || "";
              break;
            default:
              return true;
          }

          // Apply operator logic
          if (condition.operator === "contains") {
            if (Array.isArray(condition.value)) {
              return condition.value.some((val) =>
                String(fieldValue).toLowerCase().includes(val.toLowerCase())
              );
            }
            return String(fieldValue)
              .toLowerCase()
              .includes(String(condition.value).toLowerCase());
          } else if (condition.operator === "equals") {
            if (Array.isArray(condition.value)) {
              return condition.value.some(
                (val) => String(fieldValue).toLowerCase() === val.toLowerCase()
              );
            }
            return (
              String(fieldValue).toLowerCase() ===
              String(condition.value).toLowerCase()
            );
          } else if (condition.operator === "not_contains") {
            if (Array.isArray(condition.value)) {
              return !condition.value.some((val) =>
                String(fieldValue).toLowerCase().includes(val.toLowerCase())
              );
            }
            return !String(fieldValue)
              .toLowerCase()
              .includes(String(condition.value).toLowerCase());
          }

          return true;
        });

        // Apply global condition logic
        if (conditionLogic === "contains") {
          return conditionResults.every((result) => result);
        } else if (conditionLogic === "equals") {
          return conditionResults.some((result) => result);
        } else if (conditionLogic === "not_contains") {
          return conditionResults.every((result) => !result);
        }

        return true;
      });
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [transactions, searchQuery, filterConditions, conditionLogic]);

  const handleResetFilters = () => {
    setFilterConditions([]);
    setConditionLogic("contains");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || filterConditions.some(
    (c) =>
      c.value && (Array.isArray(c.value) ? c.value.length > 0 : c.value !== "")
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterConditions, conditionLogic]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle sort change
  const handleSortChange = (newSortConfigs: any[]) => {
    console.log('Sort changed:', newSortConfigs);
    setSortConfigs(newSortConfigs);
  };

  // Handle bulk actions
  const handleBulkReceive = () => {
    if (selectedTransactions.length === 0) {
      alert("Vui lòng chọn ít nhất một bàn giao để tiếp nhận!");
      return;
    }

    // Simulate receiving transactions
    const updatedTransactions = transactions.map(transaction =>
      selectedTransactions.includes(transaction.id)
        ? { ...transaction, status: TransactionStatus.APPROVED, approvedAt: new Date().toISOString() }
        : transaction
    );

    setTransactions(updatedTransactions);
    setSelectedTransactions([]);
    alert(`Đã tiếp nhận thành công ${selectedTransactions.length} bàn giao!`);
  };

  // Handle individual actions
  const handleViewDetail = (transaction: AssetTransaction) => {
    // Navigate to detail page or open modal
    console.log("View detail:", transaction);
  };

  const handleApprove = (transactionId: string) => {
    const updatedTransactions = transactions.map(transaction =>
      transaction.id === transactionId
        ? { ...transaction, status: TransactionStatus.APPROVED, approvedAt: new Date().toISOString() }
        : transaction
    );

    setTransactions(updatedTransactions);
    alert("Đã duyệt bàn giao thành công!");
  };

  const handleReject = (transactionId: string) => {
    const reason = prompt("Lý do từ chối:");
    if (reason) {
      const updatedTransactions = transactions.map(transaction =>
        transaction.id === transactionId
          ? { ...transaction, status: TransactionStatus.REJECTED, rejectedAt: new Date().toISOString(), rejectionReason: reason }
          : transaction
      );

      setTransactions(updatedTransactions);
      alert("Đã từ chối bàn giao!");
    }
  };

  // Define table columns
  const columns: TableColumn<AssetTransaction>[] = [
    {
      key: "info",
      title: "Thông tin bàn giao",
      width: "300px",
      minWidth: 250,
      maxWidth: 400,
      render: (_, transaction) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {transaction.note || "Không có ghi chú"}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "fromUnit",
      title: "Đơn vị gửi",
      width: "200px",
      minWidth: 150,
      maxWidth: 250,
      render: (_, transaction) => (
        <div className="text-sm text-gray-500">
          {transaction.fromUnit?.name || "N/A"}
        </div>
      ),
      sortable: true,
    },
    {
      key: "itemCount",
      title: "Số lượng tài sản",
      width: "150px",
      minWidth: 120,
      maxWidth: 180,
      render: (_, transaction) => (
        <Badge className="bg-purple-100 text-purple-800">
          {transaction.items?.length || 0} tài sản
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "createdAt",
      title: "Ngày gửi",
      width: "120px",
      minWidth: 100,
      maxWidth: 150,
      render: (_, transaction) => (
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-1" />
          {new Date(transaction.createdAt).toLocaleDateString("vi-VN")}
        </div>
      ),
      sortable: true,
    },
    {
      key: "status",
      title: "Trạng thái",
      width: "140px",
      minWidth: 120,
      maxWidth: 180,
      render: (_, transaction) => (
        <Badge
          className={
            statusColors[
            transaction.status as keyof typeof statusColors
            ]
          }
        >
          {
            statusLabels[
            transaction.status as keyof typeof statusLabels
            ]
          }
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "actions",
      title: "Thao tác",
      width: "180px",
      minWidth: 160,
      maxWidth: 220,
      resizable: false,
      render: (_, transaction) => (
        <div className="flex items-center space-x-2">
          <Link
            href={`/asset/receive/${transaction.id}`}
            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center"
            title="Xem chi tiết"
          >
            <Eye className="h-4 w-4" />
          </Link>
          {transaction.status === TransactionStatus.PENDING && (
            <>

              <Link
                href={`/asset/receive/${transaction.id}/approve`}
                className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors flex items-center justify-center"
                title="Duyệt"
              >
                <CheckCircle className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>
      ),
    },
  ];

  const handleReceiveTransaction = (transactionId: string) => {
    if (confirm("Bạn có chắc chắn muốn tiếp nhận bàn giao này?")) {
      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction.id === transactionId
            ? {
              ...transaction,
              status: TransactionStatus.APPROVED,
              approvedAt: new Date().toISOString(),
              approvedBy: "current_user",
            }
            : transaction
        )
      );

      alert("Tiếp nhận bàn giao thành công! Tài sản đã sẵn sàng để phân bổ.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tiếp nhận tài sản
          </h1>
          <p className="text-gray-600">
            Tiếp nhận danh sách bàn giao tài sản từ ban kế hoạch đầu tư
          </p>
        </div>
      </div>

      {/* Quick Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Tìm kiếm theo mã bàn giao, nội dung, người tạo hoặc đơn vị gửi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
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
        onApply={() => {
          console.log("Applying filters:", {
            filterConditions,
            conditionLogic,
          });
        }}
        onReset={handleResetFilters}
      />

      {/* Filter Results Info */}
      {hasActiveFilters && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Filter className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Kết quả lọc: {filteredTransactions.length} / {transactions.length} bàn giao
                </span>
              </div>
              {searchQuery && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-blue-700">Từ khóa:</span>
                  <Badge variant="outline" className="text-blue-700 border-blue-300">
                    "{searchQuery}"
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
              onClick={handleResetFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <Table
          resizable={true}
          columns={columns}
          multiSort={true}
          data={filteredTransactions}
          sortConfigs={sortConfigs}
          onSortChange={handleSortChange}
          emptyText={hasActiveFilters
            ? "Không có bàn giao nào phù hợp với các bộ lọc hiện tại"
            : "Hiện tại không có bàn giao nào cần tiếp nhận"
          }
          emptyIcon={<Package2 className="mx-auto h-12 w-12 text-gray-400" />}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: itemsPerPage,
            total: filteredTransactions.length,
            onChange: (page, pageSize) => {
              setCurrentPage(page);
              if (pageSize !== itemsPerPage) {
                setItemsPerPage(pageSize);
                setCurrentPage(1); // Reset to first page when page size changes
              }
            },
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20, 50, 100]
          }}
          rowSelection={{
            selectedRowKeys: selectedTransactions,
            onChange: (selectedRowKeys) => {
              setSelectedTransactions(selectedRowKeys);
            },
          }}
          title={
            <div className="flex items-center">
              Danh sách bàn giao cần tiếp nhận
            </div>
          }
          headerExtra={
            selectedTransactions.length > 0 ? (
              <Button
                onClick={handleBulkReceive}
                size="sm"
                className="flex items-center bg-green-500 hover:bg-green-600 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Tiếp nhận bàn giao
              </Button>
            ) : null
          }
        />
      </div>
    </div>
  );
}
