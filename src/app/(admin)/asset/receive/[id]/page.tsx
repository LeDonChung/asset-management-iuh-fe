"use client";

import React, { useState, useEffect } from "react";
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

// Mock data - trong thực tế sẽ gọi API với transaction ID
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
          quantity: 1,
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
          quantity: 1,
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
          quantity: 1,
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
          quantity: 1,
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
          specs: "Màn chiếu treo tường tự động 120\", tỷ lệ 16:9, vải sợi thủy tinh trắng, có điều khiển",
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
          quantity: 1,
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
          specs: "Màn chiếu treo tường tự động 120\", tỷ lệ 16:9, vải sợi thủy tinh trắng, có điều khiển",
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

  useEffect(() => {
    // Trong thực tế sẽ gọi API để lấy chi tiết transaction
    const foundTransaction = mockAssetTransactions.find(t => t.id === transactionId);
    setTransaction(foundTransaction || null);
  }, [transactionId]);

  const handleSelectAsset = (assetId: string) => {
    setSelectedAssets(prev =>
      prev.includes(assetId)
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleSelectAll = () => {
    if (!transaction?.items) return;

    if (selectedAssets.length === transaction.items.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(transaction.items.map(item => item.assetId));
    }
  };

  const handleReceiveTransaction = () => {

      alert("Tiếp nhận bàn giao thành công! Tài sản đã sẵn sàng để phân bổ.");
  };

  const handleRejectTransaction = () => {
    if (!transaction) return;

    const reason = prompt("Vui lòng nhập lý do từ chối:");
    if (!reason) return;

    if (confirm("Bạn có chắc chắn muốn từ chối bàn giao này?")) {
      // Trong thực tế sẽ gọi API để cập nhật trạng thái
      setTransaction(prev => prev ? {
        ...prev,
        status: TransactionStatus.REJECTED,
        rejectedAt: new Date().toISOString(),
        rejectedBy: "current_user",
        rejectionReason: reason
      } : null);

      alert("Đã từ chối bàn giao.");
    }
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
              <div>
                <p className="text-xs md:text-sm text-gray-500">Tổng số loại tài sản</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">
                  {transaction.items?.length || 0}
                </p>
              </div>
              <div className="h-8 w-8 md:h-10 md:w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package2 className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500">Tổng số lượng</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{totalAssets}</p>
              </div>
              <div className="h-8 w-8 md:h-10 md:w-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Hash className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500">TSCD</p>
                <p className="text-base md:text-lg font-semibold text-blue-600">
                  {transaction.items?.filter(item => item.asset?.type === AssetType.TSCD).length || 0}
                </p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-500">CCDC</p>
                <p className="text-base md:text-lg font-semibold text-green-600">
                  {transaction.items?.filter(item => item.asset?.type === AssetType.CCDC).length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assets List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
            <h3 className="text-base md:text-lg font-medium text-gray-900">
              Danh sách tài sản ({transaction.items?.length || 0})
            </h3>
            {transaction.status === TransactionStatus.PENDING && (
              <div className="flex items-center space-x-2">
                <span className="text-xs md:text-sm text-gray-500">
                  {selectedAssets.length > 0 && `Đã chọn ${selectedAssets.length} tài sản`}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thông tin tài sản
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã tài sản
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số lượng
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ghi chú
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transaction.items?.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm">
                          <Package2 className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="ml-3 min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 break-words">
                          {item.asset?.name}
                        </div>
                        <div className="text-sm text-gray-500" title={item.asset?.specs}>
                          {truncateSpecs(item.asset?.specs || '', 30)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.asset?.ktCode}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.asset?.fixedCode}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <Badge className={typeColors[item.asset?.type as keyof typeof typeColors]}>
                      {typeLabels[item.asset?.type as keyof typeof typeLabels]}
                    </Badge>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">
                      {item.asset?.quantity} {item.asset?.unit}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="text-sm text-gray-500 truncate max-w-xs" title={item.note || "Không có ghi chú"}>
                      {item.note || "Không có ghi chú"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(!transaction.items || transaction.items.length === 0) && (
          <div className="text-center py-12">
            <Package2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có tài sản</h3>
            <p className="mt-1 text-sm text-gray-500">
              Bàn giao này không chứa tài sản nào.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
