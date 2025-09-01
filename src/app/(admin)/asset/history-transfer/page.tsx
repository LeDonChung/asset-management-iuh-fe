"use client";

import { useState, useEffect } from "react";
import {
    Search,
    Package2,
    Calendar,
    Users,
    AlertCircle,
    Plus,
    Trash2,
    Save,
    ArrowLeft,
    Eye,
    History,
    Clock,
    Filter,
    X,
    CalendarDays,
    Tag,
    Building2,
} from "lucide-react";
import Link from "next/link";
import {
    Asset,
    AssetType,
    AssetStatus,
    UnitType,
    AssetTransaction,
    TransactionType,
    TransactionStatus,
    AssetTransactionItem,
    Unit,
} from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableColumn } from "@/components/ui/table";
import AdvancedFilter, { FilterCondition } from "@/components/filter/AdvancedFilter";
import { Pagination } from "@/components/ui/pagination";
import { useAuth } from "@/contexts/AuthContext";
import { mockAssets } from "@/lib/mockData";

// Mock data cho tài sản đã tiếp nhận (status = CHO_PHAN_BO)
const mockAvailableAssets = mockAssets.filter(
    (asset) => asset.isHandOver === false
);

// Mock data cho đơn vị (dùng cho filter)
const mockUnits = [
    { id: "CNTT", name: "Khoa Công nghệ Thông tin" },
    { id: "KINH_TE", name: "Khoa Kinh tế" },
    { id: "CO_KHI", name: "Khoa Cơ khí" },
    { id: "HC_CHINH", name: "Phòng Hành chính" },
];

// Mock data cho lịch sử bàn giao - Mở rộng để test pagination
const mockTransferHistory: AssetTransaction[] = [
    {
        id: "TXN-2025-001",
        type: TransactionType.HANDOVER,
        fromUnitId: "PQT",
        toUnitId: "CNTT",
        createdBy: "Trần Thị Hà",
        createdAt: "2025-08-10T14:30:00Z",
        status: TransactionStatus.APPROVED,
        note: "Bàn giao máy tính cho phòng thí nghiệm CNTT",
        approvedAt: "2025-08-11T09:15:00Z",
        approvedBy: "Nguyễn Văn Nam",
        fromUnit: {
            id: "PQT",
            name: "Phòng Quản Trị",
            type: UnitType.PHONG_QUAN_TRI,
            status: "ACTIVE" as any,
            representativeId: "tran.ha",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        toUnit: {
            id: "CNTT",
            name: "Khoa Công nghệ Thông tin",
            type: UnitType.DON_VI_SU_DUNG,
            status: "ACTIVE" as any,
            representativeId: "nguyen.nam",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        items: [
            {
                id: "ITM-TXF-001",
                transactionId: "TXF-2025-001",
                assetId: "LAPTOP-001",
                note: "Laptop cho giảng viên",
            },
            {
                id: "ITM-TXF-002",
                transactionId: "TXF-2025-001",
                assetId: "PC-001",
                note: "Máy tính cho phòng lab",
            }
        ]
    },
    {
        id: "TXF-2025-002",
        type: TransactionType.HANDOVER,
        fromUnitId: "PQT",
        toUnitId: "KINH_TE",
        createdBy: "Trần Thị Hà",
        createdAt: "2025-08-05T10:20:00Z",
        status: TransactionStatus.PENDING,
        note: "Bàn giao thiết bị văn phòng cho khoa Kinh tế",
        fromUnit: {
            id: "PQT",
            name: "Phòng Quản Trị",
            type: UnitType.PHONG_QUAN_TRI,
            status: "ACTIVE" as any,
            representativeId: "tran.ha",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        toUnit: {
            id: "KINH_TE",
            name: "Khoa Kinh tế",
            type: UnitType.DON_VI_SU_DUNG,
            status: "ACTIVE" as any,
            representativeId: "le.minh",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        items: [
            {
                id: "ITM-TXF-003",
                transactionId: "TXF-2025-002",
                assetId: "PRINTER-001",
                note: "Máy in cho văn phòng khoa",
            }
        ]
    },
    {
        id: "TXF-2025-003",
        type: TransactionType.HANDOVER,
        fromUnitId: "PQT",
        toUnitId: "CO_KHI",
        createdBy: "Trần Thị Hà",
        createdAt: "2025-07-28T16:45:00Z",
        status: TransactionStatus.REJECTED,
        note: "Bàn giao máy móc cho xưởng cơ khí - Bị từ chối",
        fromUnit: {
            id: "PQT",
            name: "Phòng Quản Trị",
            type: UnitType.PHONG_QUAN_TRI,
            status: "ACTIVE" as any,
            representativeId: "tran.ha",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        toUnit: {
            id: "CO_KHI",
            name: "Khoa Cơ khí",
            type: UnitType.DON_VI_SU_DUNG,
            status: "ACTIVE" as any,
            representativeId: "hoang.duc",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        items: [
            {
                id: "ITM-TXF-004",
                transactionId: "TXF-2025-003",
                assetId: "MACHINE-001",
                note: "Máy tiện CNC - Không phù hợp với yêu cầu",
            }
        ]
    },
    // Thêm dữ liệu để test pagination
    {
        id: "TXF-2025-004",
        type: TransactionType.HANDOVER,
        fromUnitId: "PQT",
        toUnitId: "HC_CHINH",
        createdBy: "Lê Văn Minh",
        createdAt: "2025-07-20T09:15:00Z",
        status: TransactionStatus.APPROVED,
        note: "Bàn giao thiết bị văn phòng cho phòng hành chính",
        approvedAt: "2025-07-21T10:30:00Z",
        approvedBy: "Phạm Thị Lan",
        fromUnit: {
            id: "PQT",
            name: "Phòng Quản Trị",
            type: UnitType.PHONG_QUAN_TRI,
            status: "ACTIVE" as any,
            representativeId: "tran.ha",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        toUnit: {
            id: "HC_CHINH",
            name: "Phòng Hành chính",
            type: UnitType.DON_VI_SU_DUNG,
            status: "ACTIVE" as any,
            representativeId: "pham.lan",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        items: [
            {
                id: "ITM-TXF-005",
                transactionId: "TXF-2025-004",
                assetId: "CHAIR-001",
                note: "Ghế xoay văn phòng",
            },
            {
                id: "ITM-TXF-006",
                transactionId: "TXF-2025-004",
                assetId: "DESK-001",
                note: "Bàn làm việc gỗ",
            }
        ]
    },
    {
        id: "TXF-2025-005",
        type: TransactionType.HANDOVER,
        fromUnitId: "PQT",
        toUnitId: "CNTT",
        createdBy: "Nguyễn Thị Mai",
        createdAt: "2025-07-15T15:45:00Z",
        status: TransactionStatus.PENDING,
        note: "Bàn giao máy chiếu và thiết bị âm thanh",
        fromUnit: {
            id: "PQT",
            name: "Phòng Quản Trị",
            type: UnitType.PHONG_QUAN_TRI,
            status: "ACTIVE" as any,
            representativeId: "tran.ha",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        toUnit: {
            id: "CNTT",
            name: "Khoa Công nghệ Thông tin",
            type: UnitType.DON_VI_SU_DUNG,
            status: "ACTIVE" as any,
            representativeId: "nguyen.nam",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        items: [
            {
                id: "ITM-TXF-007",
                transactionId: "TXF-2025-005",
                assetId: "PROJECTOR-001",
                note: "Máy chiếu Epson",
            },
            {
                id: "ITM-TXF-008",
                transactionId: "TXF-2025-005",
                assetId: "SPEAKER-001",
                note: "Loa âm thanh Sony",
            },
            {
                id: "ITM-TXF-009",
                transactionId: "TXF-2025-005",
                assetId: "MIC-001",
                note: "Micro không dây",
            }
        ]
    },
    {
        id: "TXF-2025-006",
        type: TransactionType.HANDOVER,
        fromUnitId: "PQT",
        toUnitId: "KINH_TE",
        createdBy: "Hoàng Văn Đức",
        createdAt: "2025-07-10T11:20:00Z",
        status: TransactionStatus.APPROVED,
        note: "Bàn giao thiết bị điều hòa và quạt",
        approvedAt: "2025-07-12T08:45:00Z",
        approvedBy: "Lê Minh Tuấn",
        fromUnit: {
            id: "PQT",
            name: "Phòng Quản Trị",
            type: UnitType.PHONG_QUAN_TRI,
            status: "ACTIVE" as any,
            representativeId: "tran.ha",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        toUnit: {
            id: "KINH_TE",
            name: "Khoa Kinh tế",
            type: UnitType.DON_VI_SU_DUNG,
            status: "ACTIVE" as any,
            representativeId: "le.minh",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        items: [
            {
                id: "ITM-TXF-010",
                transactionId: "TXF-2025-006",
                assetId: "AC-001",
                note: "Điều hòa Daikin 2HP",
            },
            {
                id: "ITM-TXF-011",
                transactionId: "TXF-2025-006",
                assetId: "FAN-001",
                note: "Quạt trần Asia",
            }
        ]
    },
    {
        id: "TXF-2025-007",
        type: TransactionType.HANDOVER,
        fromUnitId: "PQT",
        toUnitId: "CO_KHI",
        createdBy: "Phạm Thị Lan",
        createdAt: "2025-07-05T13:30:00Z",
        status: TransactionStatus.REJECTED,
        note: "Bàn giao máy hàn và dụng cụ - Không đạt yêu cầu",
        fromUnit: {
            id: "PQT",
            name: "Phòng Quản Trị",
            type: UnitType.PHONG_QUAN_TRI,
            status: "ACTIVE" as any,
            representativeId: "tran.ha",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        toUnit: {
            id: "CO_KHI",
            name: "Khoa Cơ khí",
            type: UnitType.DON_VI_SU_DUNG,
            status: "ACTIVE" as any,
            representativeId: "hoang.duc",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        items: [
            {
                id: "ITM-TXF-012",
                transactionId: "TXF-2025-007",
                assetId: "WELDER-001",
                note: "Máy hàn điện tử",
            }
        ]
    },
    {
        id: "TXF-2025-008",
        type: TransactionType.HANDOVER,
        fromUnitId: "PQT",
        toUnitId: "HC_CHINH",
        createdBy: "Lê Minh Tuấn",
        createdAt: "2025-06-30T16:00:00Z",
        status: TransactionStatus.APPROVED,
        note: "Bàn giao tủ tài liệu và kệ sách",
        approvedAt: "2025-07-01T09:30:00Z",
        approvedBy: "Trần Văn Hùng",
        fromUnit: {
            id: "PQT",
            name: "Phòng Quản Trị",
            type: UnitType.PHONG_QUAN_TRI,
            status: "ACTIVE" as any,
            representativeId: "tran.ha",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        toUnit: {
            id: "HC_CHINH",
            name: "Phòng Hành chính",
            type: UnitType.DON_VI_SU_DUNG,
            status: "ACTIVE" as any,
            representativeId: "pham.lan",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        items: [
            {
                id: "ITM-TXF-013",
                transactionId: "TXF-2025-008",
                assetId: "CABINET-001",
                note: "Tủ tài liệu gỗ 4 ngăn",
            },
            {
                id: "ITM-TXF-014",
                transactionId: "TXF-2025-008",
                assetId: "BOOKSHELF-001",
                note: "Kệ sách kim loại 5 tầng",
            }
        ]
    },
    {
        id: "TXF-2025-009",
        type: TransactionType.HANDOVER,
        fromUnitId: "PQT",
        toUnitId: "CNTT",
        createdBy: "Trần Văn Hùng",
        createdAt: "2025-06-25T10:15:00Z",
        status: TransactionStatus.PENDING,
        note: "Bàn giao máy photocopy và máy scan",
        fromUnit: {
            id: "PQT",
            name: "Phòng Quản Trị",
            type: UnitType.PHONG_QUAN_TRI,
            status: "ACTIVE" as any,
            representativeId: "tran.ha",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        toUnit: {
            id: "CNTT",
            name: "Khoa Công nghệ Thông tin",
            type: UnitType.DON_VI_SU_DUNG,
            status: "ACTIVE" as any,
            representativeId: "nguyen.nam",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        items: [
            {
                id: "ITM-TXF-015",
                transactionId: "TXF-2025-009",
                assetId: "COPIER-001",
                note: "Máy photocopy Canon",
            },
            {
                id: "ITM-TXF-016",
                transactionId: "TXF-2025-009",
                assetId: "SCANNER-001",
                note: "Máy scan HP A3",
            }
        ]
    },
    {
        id: "TXF-2025-010",
        type: TransactionType.HANDOVER,
        fromUnitId: "PQT",
        toUnitId: "KINH_TE",
        createdBy: "Nguyễn Thị Hoa",
        createdAt: "2025-06-20T14:45:00Z",
        status: TransactionStatus.APPROVED,
        note: "Bàn giao bảng trắng và bút viết",
        approvedAt: "2025-06-21T11:20:00Z",
        approvedBy: "Đỗ Văn Thắng",
        fromUnit: {
            id: "PQT",
            name: "Phòng Quản Trị",
            type: UnitType.PHONG_QUAN_TRI,
            status: "ACTIVE" as any,
            representativeId: "tran.ha",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        toUnit: {
            id: "KINH_TE",
            name: "Khoa Kinh tế",
            type: UnitType.DON_VI_SU_DUNG,
            status: "ACTIVE" as any,
            representativeId: "le.minh",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        items: [
            {
                id: "ITM-TXF-017",
                transactionId: "TXF-2025-010",
                assetId: "WHITEBOARD-001",
                note: "Bảng trắng từ tính 1.2x1.8m",
            },
            {
                id: "ITM-TXF-018",
                transactionId: "TXF-2025-010",
                assetId: "MARKER-SET-001",
                note: "Bộ bút viết bảng 12 màu",
            }
        ]
    },
    {
        id: "TXF-2025-011",
        type: TransactionType.HANDOVER,
        fromUnitId: "PQT",
        toUnitId: "CO_KHI",
        createdBy: "Đỗ Văn Thắng",
        createdAt: "2025-06-15T08:30:00Z",
        status: TransactionStatus.REJECTED,
        note: "Bàn giao máy cắt kim loại - Thiếu phụ kiện",
        fromUnit: {
            id: "PQT",
            name: "Phòng Quản Trị",
            type: UnitType.PHONG_QUAN_TRI,
            status: "ACTIVE" as any,
            representativeId: "tran.ha",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        toUnit: {
            id: "CO_KHI",
            name: "Khoa Cơ khí",
            type: UnitType.DON_VI_SU_DUNG,
            status: "ACTIVE" as any,
            representativeId: "hoang.duc",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        items: [
            {
                id: "ITM-TXF-019",
                transactionId: "TXF-2025-011",
                assetId: "CUTTER-001",
                note: "Máy cắt plasma CNC",
            }
        ]
    },
    {
        id: "TXF-2025-012",
        type: TransactionType.HANDOVER,
        fromUnitId: "PQT",
        toUnitId: "HC_CHINH",
        createdBy: "Vũ Thị Lan",
        createdAt: "2025-06-10T12:00:00Z",
        status: TransactionStatus.APPROVED,
        note: "Bàn giao máy lạnh và máy hút ẩm",
        approvedAt: "2025-06-11T14:15:00Z",
        approvedBy: "Bùi Văn Long",
        fromUnit: {
            id: "PQT",
            name: "Phòng Quản Trị",
            type: UnitType.PHONG_QUAN_TRI,
            status: "ACTIVE" as any,
            representativeId: "tran.ha",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        toUnit: {
            id: "HC_CHINH",
            name: "Phòng Hành chính",
            type: UnitType.DON_VI_SU_DUNG,
            status: "ACTIVE" as any,
            representativeId: "pham.lan",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        items: [
            {
                id: "ITM-TXF-020",
                transactionId: "TXF-2025-012",
                assetId: "AC-UNIT-001",
                note: "Máy lạnh treo tường LG 1.5HP",
            },
            {
                id: "ITM-TXF-021",
                transactionId: "TXF-2025-012",
                assetId: "DEHUMIDIFIER-001",
                note: "Máy hút ẩm Sharp 20L/ngày",
            }
        ]
    },
    // Thêm nhiều dữ liệu hơn để có thể test pagination tốt hơn
    {
        id: "TXF-2025-013",
        type: TransactionType.HANDOVER,
        fromUnitId: "PQT",
        toUnitId: "CNTT",
        createdBy: "Bùi Văn Long",
        createdAt: "2025-06-05T15:20:00Z",
        status: TransactionStatus.PENDING,
        note: "Bàn giao server và thiết bị mạng",
        fromUnit: {
            id: "PQT",
            name: "Phòng Quản Trị",
            type: UnitType.PHONG_QUAN_TRI,
            status: "ACTIVE" as any,
            representativeId: "tran.ha",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        toUnit: {
            id: "CNTT",
            name: "Khoa Công nghệ Thông tin",
            type: UnitType.DON_VI_SU_DUNG,
            status: "ACTIVE" as any,
            representativeId: "nguyen.nam",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        items: [
            {
                id: "ITM-TXF-022",
                transactionId: "TXF-2025-013",
                assetId: "SERVER-001",
                note: "Server Dell PowerEdge R640",
            },
            {
                id: "ITM-TXF-023",
                transactionId: "TXF-2025-013",
                assetId: "SWITCH-001",
                note: "Switch Cisco 24 port",
            },
            {
                id: "ITM-TXF-024",
                transactionId: "TXF-2025-013",
                assetId: "ROUTER-001",
                note: "Router Cisco ISR 4331",
            }
        ]
    },
    {
        id: "TXF-2025-014",
        type: TransactionType.HANDOVER,
        fromUnitId: "PQT",
        toUnitId: "KINH_TE",
        createdBy: "Lý Thị Mai",
        createdAt: "2025-05-30T11:30:00Z",
        status: TransactionStatus.APPROVED,
        note: "Bàn giao thiết bị thí nghiệm kinh tế",
        approvedAt: "2025-06-01T09:45:00Z",
        approvedBy: "Cao Văn Đức",
        fromUnit: {
            id: "PQT",
            name: "Phòng Quản Trị",
            type: UnitType.PHONG_QUAN_TRI,
            status: "ACTIVE" as any,
            representativeId: "tran.ha",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        toUnit: {
            id: "KINH_TE",
            name: "Khoa Kinh tế",
            type: UnitType.DON_VI_SU_DUNG,
            status: "ACTIVE" as any,
            representativeId: "le.minh",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        items: [
            {
                id: "ITM-TXF-025",
                transactionId: "TXF-2025-014",
                assetId: "CALCULATOR-001",
                note: "Máy tính Casio FX-570VN Plus",
            },
            {
                id: "ITM-TXF-026",
                transactionId: "TXF-2025-014",
                assetId: "FINANCE-SOFTWARE-001",
                note: "Phần mềm phân tích tài chính",
            }
        ]
    },
    {
        id: "TXF-2025-015",
        type: TransactionType.HANDOVER,
        fromUnitId: "PQT",
        toUnitId: "CO_KHI",
        createdBy: "Cao Văn Đức",
        createdAt: "2025-05-25T13:45:00Z",
        status: TransactionStatus.APPROVED,
        note: "Bàn giao dụng cụ đo lường cơ khí",
        approvedAt: "2025-05-26T10:30:00Z",
        approvedBy: "Hoàng Văn Đức",
        fromUnit: {
            id: "PQT",
            name: "Phòng Quản Trị",
            type: UnitType.PHONG_QUAN_TRI,
            status: "ACTIVE" as any,
            representativeId: "tran.ha",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        toUnit: {
            id: "CO_KHI",
            name: "Khoa Cơ khí",
            type: UnitType.DON_VI_SU_DUNG,
            status: "ACTIVE" as any,
            representativeId: "hoang.duc",
            createdBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
        },
        items: [
            {
                id: "ITM-TXF-027",
                transactionId: "TXF-2025-015",
                assetId: "CALIPER-001",
                note: "Thước cặp điện tử Mitutoyo",
            },
            {
                id: "ITM-TXF-028",
                transactionId: "TXF-2025-015",
                assetId: "MICROMETER-001",
                note: "Panme đo ngoài 0-25mm",
            },
            {
                id: "ITM-TXF-029",
                transactionId: "TXF-2025-015",
                assetId: "GAUGE-BLOCK-001",
                note: "Bộ chuẩn Gauge Block 87 miếng",
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
    [TransactionStatus.PENDING]: "Chờ tiếp nhận",
    [TransactionStatus.APPROVED]: "Đã tiếp nhận", 
    [TransactionStatus.REJECTED]: "Từ chối",
};

export default function AssetHistoryTransferPage() {
    const [transferHistory, setTransferHistory] = useState<AssetTransaction[]>(mockTransferHistory);
    const [filteredHistory, setFilteredHistory] = useState<AssetTransaction[]>(mockTransferHistory);
    const [selectedTransfers, setSelectedTransfers] = useState<string[]>([]);
    
    // Advanced Filter states
    const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
    const [conditionLogic, setConditionLogic] = useState<'contains' | 'equals' | 'not_contains'>('contains');
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    // Auth context for role-based access
    const { getCurrentRole } = useAuth();
    
    // Kiểm tra role
    const isSuperAdmin = getCurrentRole()?.code === "SUPER_ADMIN";
    const isAdmin = getCurrentRole()?.code === "ADMIN";
    const isPhongQuanTri = getCurrentRole()?.code === "PHONG_QUAN_TRI";

    // Filter options for AdvancedFilter
    const filterOptions = [
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
            value: 'toUnit',
            label: 'Đơn vị tiếp nhận',
            type: 'select' as const,
            options: mockUnits.map(unit => ({
                value: unit.id,
                label: unit.name
            }))
        },
        {
            value: 'createdAt',
            label: 'Ngày bàn giao',
            type: 'date' as const
        },
    ];

    // Filter transfers based on advanced filter conditions
    useEffect(() => {
        let filtered = [...transferHistory];

        // Apply role-based filtering
        if (!isSuperAdmin && !isAdmin && !isPhongQuanTri) {
            // Nếu không phải admin/super admin/phòng quản trị thì chỉ xem được của đơn vị mình
            // Tạm thời comment vì Role không có unitId
            // const userUnitId = getCurrentRole()?.unitId;
            // filtered = filtered.filter((transfer) => 
            //     transfer.fromUnitId === userUnitId || transfer.toUnitId === userUnitId
            // );
            
            // Tạm thời hiển thị tất cả cho demo
            filtered = [...transferHistory];
        }
        // Admin, SuperAdmin, PhongQuanTri có thể xem tất cả

        if (filterConditions.length > 0) {
            filtered = filtered.filter((transfer) => {
                const conditionResults = filterConditions.map((condition) => {
                    if (!condition.value || (Array.isArray(condition.value) && condition.value.length === 0)) {
                        return true; // Skip empty conditions
                    }

                    let fieldValue: string | string[] = "";

                    switch (condition.field) {
                        case 'status':
                            fieldValue = transfer.status;
                            break;
                        case 'toUnit':
                            fieldValue = transfer.toUnit?.id || "";
                            break;
                        case 'createdAt':
                            fieldValue = new Date(transfer.createdAt).toISOString().split('T')[0];
                            break;
                        case 'createdBy':
                            fieldValue = transfer.createdBy;
                            break;
                        case 'note':
                            fieldValue = transfer.note || "";
                            break;
                        default:
                            return true;
                    }

                    // Apply operator logic
                    if (condition.operator === 'contains') {
                        if (Array.isArray(condition.value)) {
                            return condition.value.some(val => 
                                String(fieldValue).toLowerCase().includes(val.toLowerCase())
                            );
                        }
                        return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
                    } else if (condition.operator === 'equals') {
                        if (Array.isArray(condition.value)) {
                            return condition.value.some(val => 
                                String(fieldValue).toLowerCase() === val.toLowerCase()
                            );
                        }
                        return String(fieldValue).toLowerCase() === String(condition.value).toLowerCase();
                    } else if (condition.operator === 'not_contains') {
                        if (Array.isArray(condition.value)) {
                            return !condition.value.some(val => 
                                String(fieldValue).toLowerCase().includes(val.toLowerCase())
                            );
                        }
                        return !String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
                    }

                    return true;
                });

                // Apply global condition logic
                if (conditionLogic === 'contains') {
                    return conditionResults.every(result => result);
                } else if (conditionLogic === 'equals') {
                    return conditionResults.some(result => result);
                } else if (conditionLogic === 'not_contains') {
                    return conditionResults.every(result => !result);
                }

                return true;
            });
        }

        setFilteredHistory(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [transferHistory, filterConditions, conditionLogic, isSuperAdmin, isAdmin, isPhongQuanTri, getCurrentRole]);

    const handleResetFilters = () => {
        setFilterConditions([]);
        setConditionLogic('contains');
    };

    const hasActiveFilters = filterConditions.some(c => 
        c.value && (Array.isArray(c.value) ? c.value.length > 0 : c.value !== '')
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentTransfers = filteredHistory.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset về trang đầu khi thay đổi số items per page
    };

    // Define table columns
    const columns: TableColumn<AssetTransaction>[] = [
        {
            key: "info",
            title: "Thông tin bàn giao",
            render: (_, transfer) => (
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm">
                            <Package2 className="h-5 w-5 text-white" />
                        </div>
                    </div>
                    <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                            {transfer.note}
                        </div>
                        <div className="text-sm text-gray-500">
                            {transfer.id}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: "units",
            title: "Đơn vị",
            render: (_, transfer) => (
                <div>
                    <div className="text-sm font-medium text-gray-900 flex items-center">
                        <Building2 className="h-4 w-4 mr-1 text-blue-500" />
                        {transfer.toUnit?.name}
                    </div>
                    <div className="text-sm text-gray-500">
                        Từ: {transfer.fromUnit?.name}
                    </div>
                </div>
            ),
        },
        {
            key: "itemCount",
            title: "Số tài sản",
            render: (_, transfer) => (
                <Badge className="bg-purple-100 text-purple-800">
                    {transfer.items?.length || 0} tài sản
                </Badge>
            ),
        },
        {
            key: "createdAt",
            title: "Ngày tạo",
            render: (_, transfer) => (
                <div className="text-sm text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(transfer.createdAt).toLocaleDateString("vi-VN")}
                </div>
            ),
        },
        {
            key: "status",
            title: "Trạng thái",
            render: (_, transfer) => (
                <Badge className={statusColors[transfer.status as keyof typeof statusColors]}>
                    {statusLabels[transfer.status as keyof typeof statusLabels]}
                </Badge>
            ),
        },
        {
            key: "actions",
            title: "Thao tác",
            render: (_, transfer) => (
                <Link
                href={`/asset/receive/${transfer.id}`}
                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center"
                title="Xem chi tiết"
              >
                <Eye className="h-4 w-4" />
              </Link>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Lịch sử bàn giao tài sản</h1>
                    <p className="text-gray-600">
                        Xem lại lịch sử các giao dịch bàn giao tài sản đã thực hiện
                    </p>
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

{/* Pagination */}
            {filteredHistory.length > 0 && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Hiển thị{" "}
                                <span className="font-medium">{startIndex + 1}</span> -{" "}
                                <span className="font-medium">
                                    {Math.min(endIndex, filteredHistory.length)}
                                </span>{" "}
                                trong tổng số{" "}
                                <span className="font-medium">{filteredHistory.length}</span> bàn giao
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-700">Hiển thị:</span>
                                <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option value={10} className="text-gray-900">
                                        10
                                    </option>
                                    <option value={20} className="text-gray-900">
                                        20
                                    </option>
                                    <option value={50} className="text-gray-900">
                                        50
                                    </option>
                                </select>
                            </div>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>
                    <div className="flex-1 flex justify-between sm:hidden">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Trước
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Sau
                        </Button>
                    </div>
                </div>
            )}
            {/* Filter Results Summary */}
            {hasActiveFilters && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                Hiển thị {filteredHistory.length} kết quả
                                {totalPages > 1 && ` (Trang ${currentPage}/${totalPages})`}
                            </span>
                            <div className="flex items-center space-x-2">
                                {filterConditions.map((condition, index) => {
                                    if (
                                        !condition.value ||
                                        (Array.isArray(condition.value) && condition.value.length === 0)
                                    ) {
                                        return null;
                                    }

                                    const fieldOption = filterOptions.find(
                                        (opt) => opt.value === condition.field
                                    );

                                    return (
                                        <Badge key={index} className="bg-blue-100 text-blue-800">
                                            {fieldOption?.label}: {Array.isArray(condition.value)
                                                ? condition.value.join(", ")
                                                : condition.value}
                                        </Badge>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Actions */}
            {selectedTransfers.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="text-sm text-blue-800">
                                Đã chọn {selectedTransfers.length} bàn giao
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                onClick={() => {
                                    console.log("Export selected transfers:", selectedTransfers);
                                }}
                                size="sm"
                                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Xuất báo cáo
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transfer History Table */}
            <div className="space-y-4">
                <Table
                    columns={columns}
                    data={currentTransfers}
                    emptyText={hasActiveFilters
                        ? "Không có bàn giao nào phù hợp với các bộ lọc hiện tại"
                        : "Chưa có lịch sử bàn giao nào"
                    }
                    emptyIcon={<History className="mx-auto h-12 w-12 text-gray-400" />}
                    rowKey="id"
                    rowSelection={{
                        selectedRowKeys: selectedTransfers,
                        onChange: (selectedRowKeys) => {
                            setSelectedTransfers(selectedRowKeys);
                        },
                    }}
                />
                
                {/* Empty state with filter reset button */}
                {filteredHistory.length === 0 && hasActiveFilters && (
                    <div className="text-center pb-4">
                        <Button
                            onClick={handleResetFilters}
                            variant="outline"
                            size="sm"
                            className="mt-3"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Xóa bộ lọc
                        </Button>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {filteredHistory.length > 0 && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Hiển thị{" "}
                                <span className="font-medium">{startIndex + 1}</span> -{" "}
                                <span className="font-medium">
                                    {Math.min(endIndex, filteredHistory.length)}
                                </span>{" "}
                                trong tổng số{" "}
                                <span className="font-medium">{filteredHistory.length}</span> bàn giao
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-700">Hiển thị:</span>
                                <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option value={10} className="text-gray-900">
                                        10
                                    </option>
                                    <option value={20} className="text-gray-900">
                                        20
                                    </option>
                                    <option value={50} className="text-gray-900">
                                        50
                                    </option>
                                </select>
                            </div>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>
                    <div className="flex-1 flex justify-between sm:hidden">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Trước
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Sau
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
