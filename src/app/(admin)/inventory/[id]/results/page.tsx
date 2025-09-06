"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  Building2,
  X,
  FileText,
  Package,
  Wrench,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Minus,
  Clock,
  Calendar,
  Users,
  BarChart3,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Download,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import {
  AssetType,
  InventoryResult,
  InventoryResultStatus,
  InventoryResultFilter,
  Unit,
  Asset,
  ScanMethod,
  InventorySession,
  InventorySessionStatus,
} from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableColumn } from "@/components/ui/table";
import { Select, SelectGroup, SelectOption } from "@/components/ui/select";

import { Modal, ModalHeader } from "@/components/ui/modal";
import AdvancedFilter, { FilterCondition } from "@/components/filter/AdvancedFilter";
import { useAuth } from "@/contexts/AuthContext";
import { useParams } from "next/navigation";

// Mock inventory session data
const mockInventorySession: InventorySession = {
  id: "inv-session-1",
  year: 2024,
  name: "Kiểm kê tài sản cuối năm 2024",
  period: 1,
  isGlobal: true,
  startDate: "2024-12-01",
  endDate: "2024-12-31",
  status: InventorySessionStatus.COMPLETED,
  createdBy: "user-1",
  createdAt: "2024-11-01T00:00:00Z",
  creator: {
    id: "user-1",
    username: "admin",
    fullName: "Nguyễn Văn Admin",
    email: "admin@iuh.edu.vn",
    status: "ACTIVE" as any,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  units: [],
  committees: [],
};

// Mock data for inventory results - Extended with more data
const mockInventoryResults: InventoryResult[] = [
  // CCDC Results - Công cụ dụng cụ
  {
    id: "result-1",
    assignmentId: "assign-1",
    assetId: "asset-1",
    systemQuantity: 10,
    countedQuantity: 9,
    scanMethod: ScanMethod.RFID,
    status: InventoryResultStatus.MISSING,
    note: "Thiếu 1 máy in do di chuyển",
    createdAt: "2024-12-15T10:30:00Z",
    asset: {
      id: "asset-1",
      ktCode: "KT001",
      fixedCode: "001.001",
      name: "Máy in Canon LBP6030",
      specs: "Laser, Đen trắng, A4",
      entryDate: "2023-01-15",
      currentRoomId: "room-1",
      unit: "Cái",
      quantity: 1,
      origin: "Nhật Bản",
      purchasePackage: 1,
      type: AssetType.CCDC,
      isLocked: false,
      isHandOver: true,
      categoryId: "cat-5",
      status: "đang_sử_dụng" as any,
      createdBy: "user-1",
      createdAt: "2023-01-15T00:00:00Z",
      updatedAt: "2023-01-15T00:00:00Z",
    },
    assignment: {
      id: "assign-1",
      groupId: "group-1",
      unitId: "unit-1",
      startDate: "2024-12-01",
      endDate: "2024-12-31",
      note: "Kiểm kê khoa CNTT",
      unit: {
        id: "unit-1",
        name: "Khoa Công nghệ thông tin",
        type: "đơn_vị_sử_dụng" as any,
        representativeId: "user-1",
        status: "ACTIVE" as any,
        createdBy: "user-1",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
    },
  },
  {
    id: "result-2",
    assignmentId: "assign-1",
    assetId: "asset-2",
    systemQuantity: 15,
    countedQuantity: 15,
    scanMethod: ScanMethod.MANUAL,
    status: InventoryResultStatus.MATCHED,
    note: "Đủ số lượng",
    createdAt: "2024-12-15T11:00:00Z",
    asset: {
      id: "asset-2",
      ktCode: "KT002",
      fixedCode: "002.001",
      name: "Máy quét Canon DR-G2140",
      specs: "A4, 25ppm, USB 3.0",
      entryDate: "2023-02-20",
      currentRoomId: "room-1",
      unit: "Cái",
      quantity: 1,
      origin: "Nhật Bản",
      purchasePackage: 2,
      type: AssetType.CCDC,
      isLocked: false,
      isHandOver: true,
      categoryId: "cat-5",
      status: "đang_sử_dụng" as any,
      createdBy: "user-1",
      createdAt: "2023-02-20T00:00:00Z",
      updatedAt: "2023-02-20T00:00:00Z",
    },
    assignment: {
      id: "assign-1",
      groupId: "group-1",
      unitId: "unit-1",
      startDate: "2024-12-01",
      endDate: "2024-12-31",
      note: "Kiểm kê khoa CNTT",
      unit: {
        id: "unit-1",
        name: "Khoa Công nghệ thông tin",
        type: "đơn_vị_sử_dụng" as any,
        representativeId: "user-1",
        status: "ACTIVE" as any,
        createdBy: "user-1",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
    },
  },
  {
    id: "result-3",
    assignmentId: "assign-1",
    assetId: "asset-3",
    systemQuantity: 8,
    countedQuantity: 10,
    scanMethod: ScanMethod.MANUAL,
    status: InventoryResultStatus.EXCESS,
    note: "Thừa 2 bộ chuột bàn phím do nhập thêm",
    createdAt: "2024-12-16T09:15:00Z",
    asset: {
      id: "asset-3",
      ktCode: "KT003",
      fixedCode: "003.001",
      name: "Bộ chuột bàn phím Logitech",
      specs: "Wireless, USB receiver",
      entryDate: "2023-03-10",
      currentRoomId: "room-1",
      unit: "Bộ",
      quantity: 1,
      origin: "Thụy Sĩ",
      purchasePackage: 3,
      type: AssetType.CCDC,
      isLocked: false,
      isHandOver: true,
      categoryId: "cat-4",
      status: "đang_sử_dụng" as any,
      createdBy: "user-1",
      createdAt: "2023-03-10T00:00:00Z",
      updatedAt: "2023-03-10T00:00:00Z",
    },
    assignment: {
      id: "assign-1",
      groupId: "group-1",
      unitId: "unit-1",
      startDate: "2024-12-01",
      endDate: "2024-12-31",
      note: "Kiểm kê khoa CNTT",
      unit: {
        id: "unit-1",
        name: "Khoa Công nghệ thông tin",
        type: "đơn_vị_sử_dụng" as any,
        representativeId: "user-1",
        status: "ACTIVE" as any,
        createdBy: "user-1",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
    },
  },
  {
    id: "result-4",
    assignmentId: "assign-1",
    assetId: "asset-4",
    systemQuantity: 5,
    countedQuantity: 3,
    scanMethod: ScanMethod.MANUAL,
    status: InventoryResultStatus.BROKEN,
    note: "2 máy tính bị hỏng màn hình",
    createdAt: "2024-12-16T14:20:00Z",
    asset: {
      id: "asset-4",
      ktCode: "KT004",
      fixedCode: "004.001",
      name: "Máy tính bảng iPad Air",
      specs: "10.9 inch, 64GB, WiFi",
      entryDate: "2023-04-15",
      currentRoomId: "room-1",
      unit: "Cái",
      quantity: 1,
      origin: "Mỹ",
      purchasePackage: 4,
      type: AssetType.CCDC,
      isLocked: false,
      isHandOver: true,
      categoryId: "cat-4",
      status: "hư_hỏng" as any,
      createdBy: "user-1",
      createdAt: "2023-04-15T00:00:00Z",
      updatedAt: "2023-04-15T00:00:00Z",
    },
    assignment: {
      id: "assign-1",
      groupId: "group-1",
      unitId: "unit-1",
      startDate: "2024-12-01",
      endDate: "2024-12-31",
      note: "Kiểm kê khoa CNTT",
      unit: {
        id: "unit-1",
        name: "Khoa Công nghệ thông tin",
        type: "đơn_vị_sử_dụng" as any,
        representativeId: "user-1",
        status: "ACTIVE" as any,
        createdBy: "user-1",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
    },
  },
  {
    id: "result-11",
    assignmentId: "assign-1",
    assetId: "asset-11",
    systemQuantity: 25,
    countedQuantity: 25,
    scanMethod: ScanMethod.RFID,
    status: InventoryResultStatus.MATCHED,
    note: "Đầy đủ, tình trạng tốt",
    createdAt: "2024-12-16T08:45:00Z",
    asset: {
      id: "asset-11",
      ktCode: "KT011",
      fixedCode: "011.001",
      name: "Chuột quang Logitech B100",
      specs: "USB, Quang học, 1000 DPI",
      entryDate: "2023-03-10",
      currentRoomId: "room-1",
      unit: "Cái",
      quantity: 1,
      origin: "Thụy Sĩ",
      purchasePackage: 3,
      type: AssetType.CCDC,
      isLocked: false,
      isHandOver: true,
      categoryId: "cat-4",
      status: "đang_sử_dụng" as any,
      createdBy: "user-1",
      createdAt: "2023-03-10T00:00:00Z",
      updatedAt: "2023-03-10T00:00:00Z",
    },
    assignment: {
      id: "assign-1",
      groupId: "group-1",
      unitId: "unit-1",
      startDate: "2024-12-01",
      endDate: "2024-12-31",
      note: "Kiểm kê khoa CNTT",
      unit: {
        id: "unit-1",
        name: "Khoa Công nghệ thông tin",
        type: "đơn_vị_sử_dụng" as any,
        representativeId: "user-1",
        status: "ACTIVE" as any,
        createdBy: "user-1",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
    },
  },
  {
    id: "result-12",
    assignmentId: "assign-1",
    assetId: "asset-12",
    systemQuantity: 30,
    countedQuantity: 28,
    scanMethod: ScanMethod.MANUAL,
    status: InventoryResultStatus.MISSING,
    note: "Thiếu 2 bàn phím do hư hỏng",
    createdAt: "2024-12-16T11:15:00Z",
    asset: {
      id: "asset-12",
      ktCode: "KT012",
      fixedCode: "012.001",
      name: "Bàn phím Dell KB216",
      specs: "USB, Layout QWERTY, Đen",
      entryDate: "2023-04-05",
      currentRoomId: "room-1",
      unit: "Cái",
      quantity: 1,
      origin: "Trung Quốc",
      purchasePackage: 4,
      type: AssetType.CCDC,
      isLocked: false,
      isHandOver: true,
      categoryId: "cat-4",
      status: "đang_sử_dụng" as any,
      createdBy: "user-1",
      createdAt: "2023-04-05T00:00:00Z",
      updatedAt: "2023-04-05T00:00:00Z",
    },
    assignment: {
      id: "assign-1",
      groupId: "group-1",
      unitId: "unit-1",
      startDate: "2024-12-01",
      endDate: "2024-12-31",
      note: "Kiểm kê khoa CNTT",
      unit: {
        id: "unit-1",
        name: "Khoa Công nghệ thông tin",
        type: "đơn_vị_sử_dụng" as any,
        representativeId: "user-1",
        status: "ACTIVE" as any,
        createdBy: "user-1",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
    },
  },
  {
    id: "result-13",
    assignmentId: "assign-1",
    assetId: "asset-13",
    systemQuantity: 12,
    countedQuantity: 15,
    scanMethod: ScanMethod.MANUAL,
    status: InventoryResultStatus.EXCESS,
    note: "Thừa 3 tai nghe do nhập bổ sung",
    createdAt: "2024-12-16T14:30:00Z",
    asset: {
      id: "asset-13",
      ktCode: "KT013",
      fixedCode: "013.001",
      name: "Tai nghe Sony MDR-ZX110",
      specs: "Over-ear, Jack 3.5mm, Đen",
      entryDate: "2023-05-20",
      currentRoomId: "room-1",
      unit: "Cái",
      quantity: 1,
      origin: "Nhật Bản",
      purchasePackage: 5,
      type: AssetType.CCDC,
      isLocked: false,
      isHandOver: true,
      categoryId: "cat-8",
      status: "đang_sử_dụng" as any,
      createdBy: "user-1",
      createdAt: "2023-05-20T00:00:00Z",
      updatedAt: "2023-05-20T00:00:00Z",
    },
    assignment: {
      id: "assign-1",
      groupId: "group-1",
      unitId: "unit-1",
      startDate: "2024-12-01",
      endDate: "2024-12-31",
      note: "Kiểm kê khoa CNTT",
      unit: {
        id: "unit-1",
        name: "Khoa Công nghệ thông tin",
        type: "đơn_vị_sử_dụng" as any,
        representativeId: "user-1",
        status: "ACTIVE" as any,
        createdBy: "user-1",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
    },
  },
  {
    id: "result-14",
    assignmentId: "assign-1",
    assetId: "asset-14",
    systemQuantity: 20,
    countedQuantity: 18,
    scanMethod: ScanMethod.RFID,
    status: InventoryResultStatus.BROKEN,
    note: "2 webcam bị hư hỏng lens",
    createdAt: "2024-12-17T09:20:00Z",
    asset: {
      id: "asset-14",
      ktCode: "KT014",
      fixedCode: "014.001",
      name: "Webcam Logitech C270",
      specs: "720p HD, USB 2.0, Mic tích hợp",
      entryDate: "2023-06-10",
      currentRoomId: "room-1",
      unit: "Cái",
      quantity: 1,
      origin: "Thụy Sĩ",
      purchasePackage: 6,
      type: AssetType.CCDC,
      isLocked: false,
      isHandOver: true,
      categoryId: "cat-8",
      status: "hư_hỏng" as any,
      createdBy: "user-1",
      createdAt: "2023-06-10T00:00:00Z",
      updatedAt: "2023-06-10T00:00:00Z",
    },
    assignment: {
      id: "assign-1",
      groupId: "group-1",
      unitId: "unit-1",
      startDate: "2024-12-01",
      endDate: "2024-12-31",
      note: "Kiểm kê khoa CNTT",
      unit: {
        id: "unit-1",
        name: "Khoa Công nghệ thông tin",
        type: "đơn_vị_sử_dụng" as any,
        representativeId: "user-1",
        status: "ACTIVE" as any,
        createdBy: "user-1",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
    },
  },
  {
    id: "result-15",
    assignmentId: "assign-1",
    assetId: "asset-15",
    systemQuantity: 50,
    countedQuantity: 50,
    scanMethod: ScanMethod.MANUAL,
    status: InventoryResultStatus.NEEDS_REPAIR,
    note: "Cần bảo dưỡng định kỳ",
    createdAt: "2024-12-17T13:45:00Z",
    asset: {
      id: "asset-15",
      ktCode: "KT015",
      fixedCode: "015.001",
      name: "Ổ cứng WD Blue 1TB",
      specs: "HDD SATA III, 7200 RPM, 64MB Cache",
      entryDate: "2023-07-15",
      currentRoomId: "room-1",
      unit: "Cái",
      quantity: 1,
      origin: "Mỹ",
      purchasePackage: 7,
      type: AssetType.CCDC,
      isLocked: false,
      isHandOver: true,
      categoryId: "cat-4",
      status: "đang_sử_dụng" as any,
      createdBy: "user-1",
      createdAt: "2023-07-15T00:00:00Z",
      updatedAt: "2023-07-15T00:00:00Z",
    },
    assignment: {
      id: "assign-1",
      groupId: "group-1",
      unitId: "unit-1",
      startDate: "2024-12-01",
      endDate: "2024-12-31",
      note: "Kiểm kê khoa CNTT",
      unit: {
        id: "unit-1",
        name: "Khoa Công nghệ thông tin",
        type: "đơn_vị_sử_dụng" as any,
        representativeId: "user-1",
        status: "ACTIVE" as any,
        createdBy: "user-1",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
    },
  },
  // TSCD Results - Tài sản cố định
  {
    id: "result-5",
    assignmentId: "assign-2",
    assetId: "asset-5",
    systemQuantity: 20,
    countedQuantity: 20,
    scanMethod: ScanMethod.RFID,
    status: InventoryResultStatus.MATCHED,
    note: "Đủ số lượng",
    createdAt: "2024-12-15T11:00:00Z",
    asset: {
      id: "asset-5",
      ktCode: "KT005",
      fixedCode: "005.001",
      name: "Bàn ghế văn phòng",
      specs: "Gỗ công nghiệp, màu nâu",
      entryDate: "2023-02-20",
      currentRoomId: "room-2",
      unit: "Bộ",
      quantity: 1,
      origin: "Việt Nam",
      purchasePackage: 2,
      type: AssetType.TSCD,
      isLocked: false,
      isHandOver: true,
      categoryId: "cat-3",
      status: "đang_sử_dụng" as any,
      createdBy: "user-1",
      createdAt: "2023-02-20T00:00:00Z",
      updatedAt: "2023-02-20T00:00:00Z",
    },
    assignment: {
      id: "assign-2",
      groupId: "group-2",
      unitId: "unit-2",
      startDate: "2024-12-01",
      endDate: "2024-12-31",
      note: "Kiểm kê khoa Kinh tế",
      unit: {
        id: "unit-2",
        name: "Khoa Kinh tế",
        type: "đơn_vị_sử_dụng" as any,
        representativeId: "user-2",
        status: "ACTIVE" as any,
        createdBy: "user-1",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
    },
  },
  {
    id: "result-6",
    assignmentId: "assign-2",
    assetId: "asset-6",
    systemQuantity: 5,
    countedQuantity: 6,
    scanMethod: ScanMethod.MANUAL,
    status: InventoryResultStatus.EXCESS,
    note: "Thừa 1 máy tính do nhập thêm",
    createdAt: "2024-12-16T09:15:00Z",
    asset: {
      id: "asset-6",
      ktCode: "KT006",
      fixedCode: "006.001",
      name: "Máy tính Dell OptiPlex",
      specs: "Intel i5, 8GB RAM, 256GB SSD",
      entryDate: "2023-03-10",
      currentRoomId: "room-3",
      unit: "Cái",
      quantity: 1,
      origin: "Mỹ",
      purchasePackage: 3,
      type: AssetType.TSCD,
      isLocked: false,
      isHandOver: true,
      categoryId: "cat-4",
      status: "đang_sử_dụng" as any,
      createdBy: "user-1",
      createdAt: "2023-03-10T00:00:00Z",
      updatedAt: "2023-03-10T00:00:00Z",
    },
    assignment: {
      id: "assign-2",
      groupId: "group-2",
      unitId: "unit-2",
      startDate: "2024-12-01",
      endDate: "2024-12-31",
      note: "Kiểm kê khoa Kinh tế",
      unit: {
        id: "unit-2",
        name: "Khoa Kinh tế",
        type: "đơn_vị_sử_dụng" as any,
        representativeId: "user-2",
        status: "ACTIVE" as any,
        createdBy: "user-1",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
    },
  },
  {
    id: "result-7",
    assignmentId: "assign-3",
    assetId: "asset-7",
    systemQuantity: 12,
    countedQuantity: 10,
    scanMethod: ScanMethod.MANUAL,
    status: InventoryResultStatus.MISSING,
    note: "Thiếu 2 máy lạnh do di chuyển",
    createdAt: "2024-12-17T08:30:00Z",
    asset: {
      id: "asset-7",
      ktCode: "KT007",
      fixedCode: "007.001",
      name: "Máy lạnh Daikin FTXM35R",
      specs: "1.5HP, Inverter, R32",
      entryDate: "2023-05-20",
      currentRoomId: "room-4",
      unit: "Cái",
      quantity: 1,
      origin: "Nhật Bản",
      purchasePackage: 5,
      type: AssetType.TSCD,
      isLocked: false,
      isHandOver: true,
      categoryId: "cat-6",
      status: "đang_sử_dụng" as any,
      createdBy: "user-1",
      createdAt: "2023-05-20T00:00:00Z",
      updatedAt: "2023-05-20T00:00:00Z",
    },
    assignment: {
      id: "assign-3",
      groupId: "group-3",
      unitId: "unit-3",
      startDate: "2024-12-01",
      endDate: "2024-12-31",
      note: "Kiểm kê khoa Cơ khí",
      unit: {
        id: "unit-3",
        name: "Khoa Cơ khí",
        type: "đơn_vị_sử_dụng" as any,
        representativeId: "user-3",
        status: "ACTIVE" as any,
        createdBy: "user-1",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
    },
  },
  {
    id: "result-8",
    assignmentId: "assign-3",
    assetId: "asset-8",
    systemQuantity: 8,
    countedQuantity: 8,
    scanMethod: ScanMethod.RFID,
    status: InventoryResultStatus.NEEDS_REPAIR,
    note: "Cần bảo trì định kỳ",
    createdAt: "2024-12-17T10:45:00Z",
    asset: {
      id: "asset-8",
      ktCode: "KT008",
      fixedCode: "008.001",
      name: "Máy CNC Haas VF-2",
      specs: "3 trục, 762x406x508mm",
      entryDate: "2023-06-10",
      currentRoomId: "room-5",
      unit: "Cái",
      quantity: 1,
      origin: "Mỹ",
      purchasePackage: 6,
      type: AssetType.TSCD,
      isLocked: false,
      isHandOver: true,
      categoryId: "cat-7",
      status: "đang_sử_dụng" as any,
      createdBy: "user-1",
      createdAt: "2023-06-10T00:00:00Z",
      updatedAt: "2023-06-10T00:00:00Z",
    },
    assignment: {
      id: "assign-3",
      groupId: "group-3",
      unitId: "unit-3",
      startDate: "2024-12-01",
      endDate: "2024-12-31",
      note: "Kiểm kê khoa Cơ khí",
      unit: {
        id: "unit-3",
        name: "Khoa Cơ khí",
        type: "đơn_vị_sử_dụng" as any,
        representativeId: "user-3",
        status: "ACTIVE" as any,
        createdBy: "user-1",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
    },
  },
  {
    id: "result-9",
    assignmentId: "assign-4",
    assetId: "asset-9",
    systemQuantity: 3,
    countedQuantity: 2,
    scanMethod: ScanMethod.MANUAL,
    status: InventoryResultStatus.LIQUIDATION_PROPOSED,
    note: "Đề xuất thanh lý do hư hỏng nặng",
    createdAt: "2024-12-18T13:20:00Z",
    asset: {
      id: "asset-9",
      ktCode: "KT009",
      fixedCode: "009.001",
      name: "Máy photocopy Canon iR2525i",
      specs: "25ppm, A4, Đen trắng",
      entryDate: "2022-08-15",
      currentRoomId: "room-6",
      unit: "Cái",
      quantity: 1,
      origin: "Nhật Bản",
      purchasePackage: 7,
      type: AssetType.TSCD,
      isLocked: false,
      isHandOver: true,
      categoryId: "cat-5",
      status: "hư_hỏng" as any,
      createdBy: "user-1",
      createdAt: "2022-08-15T00:00:00Z",
      updatedAt: "2022-08-15T00:00:00Z",
    },
    assignment: {
      id: "assign-4",
      groupId: "group-4",
      unitId: "unit-4",
      startDate: "2024-12-01",
      endDate: "2024-12-31",
      note: "Kiểm kê Phòng Hành chính",
      unit: {
        id: "unit-4",
        name: "Phòng Hành chính",
        type: "đơn_vị_sử_dụng" as any,
        representativeId: "user-4",
        status: "ACTIVE" as any,
        createdBy: "user-1",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
    },
  },
  {
    id: "result-10",
    assignmentId: "assign-4",
    assetId: "asset-10",
    systemQuantity: 6,
    countedQuantity: 6,
    scanMethod: ScanMethod.RFID,
    status: InventoryResultStatus.MATCHED,
    note: "Đủ số lượng, tình trạng tốt",
    createdAt: "2024-12-18T15:10:00Z",
    asset: {
      id: "asset-10",
      ktCode: "KT010",
      fixedCode: "010.001",
      name: "Tủ tài liệu Hòa Phát",
      specs: "4 ngăn, khóa an toàn",
      entryDate: "2023-07-25",
      currentRoomId: "room-6",
      unit: "Cái",
      quantity: 1,
      origin: "Việt Nam",
      purchasePackage: 8,
      type: AssetType.TSCD,
      isLocked: false,
      isHandOver: true,
      categoryId: "cat-3",
      status: "đang_sử_dụng" as any,
      createdBy: "user-1",
      createdAt: "2023-07-25T00:00:00Z",
      updatedAt: "2023-07-25T00:00:00Z",
    },
    assignment: {
      id: "assign-4",
      groupId: "group-4",
      unitId: "unit-4",
      startDate: "2024-12-01",
      endDate: "2024-12-31",
      note: "Kiểm kê Phòng Hành chính",
      unit: {
        id: "unit-4",
        name: "Phòng Hành chính",
        type: "đơn_vị_sử_dụng" as any,
        representativeId: "user-4",
        status: "ACTIVE" as any,
        createdBy: "user-1",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
    },
  },
  {
    id: "result-16",
    assignmentId: "assign-2",
    assetId: "asset-16",
    systemQuantity: 15,
    countedQuantity: 14,
    scanMethod: ScanMethod.MANUAL,
    status: InventoryResultStatus.MISSING,
    note: "Thiếu 1 tủ sắt do thanh lý",
    createdAt: "2024-12-17T16:20:00Z",
    asset: {
      id: "asset-16",
      ktCode: "KT016",
      fixedCode: "016.001",
      name: "Tủ sắt 2 cánh Hòa Phát",
      specs: "Cao 1.8m, Rộng 0.9m, Khóa cơ",
      entryDate: "2023-08-10",
      currentRoomId: "room-2",
      unit: "Cái",
      quantity: 1,
      origin: "Việt Nam",
      purchasePackage: 8,
      type: AssetType.TSCD,
      isLocked: false,
      isHandOver: true,
      categoryId: "cat-3",
      status: "đang_sử_dụng" as any,
      createdBy: "user-1",
      createdAt: "2023-08-10T00:00:00Z",
      updatedAt: "2023-08-10T00:00:00Z",
    },
    assignment: {
      id: "assign-2",
      groupId: "group-2",
      unitId: "unit-2",
      startDate: "2024-12-01",
      endDate: "2024-12-31",
      note: "Kiểm kê khoa Kinh tế",
      unit: {
        id: "unit-2",
        name: "Khoa Kinh tế",
        type: "đơn_vị_sử_dụng" as any,
        representativeId: "user-2",
        status: "ACTIVE" as any,
        createdBy: "user-1",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
    },
  },
  {
    id: "result-17",
    assignmentId: "assign-2",
    assetId: "asset-17",
    systemQuantity: 40,
    countedQuantity: 40,
    scanMethod: ScanMethod.RFID,
    status: InventoryResultStatus.MATCHED,
    note: "Đầy đủ, tình trạng tốt",
    createdAt: "2024-12-17T10:15:00Z",
    asset: {
      id: "asset-17",
      ktCode: "KT017",
      fixedCode: "017.001",
      name: "Ghế xoay văn phòng IB505",
      specs: "Da PU, Chân xoay inox, Có tay",
      entryDate: "2023-09-05",
      currentRoomId: "room-2",
      unit: "Cái",
      quantity: 1,
      origin: "Việt Nam",
      purchasePackage: 9,
      type: AssetType.TSCD,
      isLocked: false,
      isHandOver: true,
      categoryId: "cat-3",
      status: "đang_sử_dụng" as any,
      createdBy: "user-1",
      createdAt: "2023-09-05T00:00:00Z",
      updatedAt: "2023-09-05T00:00:00Z",
    },
    assignment: {
      id: "assign-2",
      groupId: "group-2",
      unitId: "unit-2",
      startDate: "2024-12-01",
      endDate: "2024-12-31",
      note: "Kiểm kê khoa Kinh tế",
      unit: {
        id: "unit-2",
        name: "Khoa Kinh tế",
        type: "đơn_vị_sử_dụng" as any,
        representativeId: "user-2",
        status: "ACTIVE" as any,
        createdBy: "user-1",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
    },
  },
  {
    id: "result-18",
    assignmentId: "assign-3",
    assetId: "asset-18",
    systemQuantity: 8,
    countedQuantity: 9,
    scanMethod: ScanMethod.MANUAL,
    status: InventoryResultStatus.EXCESS,
    note: "Thừa 1 máy chiếu do nhập mới",
    createdAt: "2024-12-18T08:40:00Z",
    asset: {
      id: "asset-18",
      ktCode: "KT018",
      fixedCode: "018.001",
      name: "Máy chiếu BenQ MX535",
      specs: "XGA, 3600 ANSI Lumens, HDMI",
      entryDate: "2023-10-12",
      currentRoomId: "room-4",
      unit: "Cái",
      quantity: 1,
      origin: "Đài Loan",
      purchasePackage: 10,
      type: AssetType.TSCD,
      isLocked: false,
      isHandOver: true,
      categoryId: "cat-8",
      status: "đang_sử_dụng" as any,
      createdBy: "user-1",
      createdAt: "2023-10-12T00:00:00Z",
      updatedAt: "2023-10-12T00:00:00Z",
    },
    assignment: {
      id: "assign-3",
      groupId: "group-3",
      unitId: "unit-3",
      startDate: "2024-12-01",
      endDate: "2024-12-31",
      note: "Kiểm kê khoa Cơ khí",
      unit: {
        id: "unit-3",
        name: "Khoa Cơ khí",
        type: "đơn_vị_sử_dụng" as any,
        representativeId: "user-3",
        status: "ACTIVE" as any,
        createdBy: "user-1",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
    },
  },
  {
    id: "result-19",
    assignmentId: "assign-3",
    assetId: "asset-19",
    systemQuantity: 25,
    countedQuantity: 22,
    scanMethod: ScanMethod.MANUAL,
    status: InventoryResultStatus.BROKEN,
    note: "3 màn hình bị vỡ trong quá trình di chuyển",
    createdAt: "2024-12-18T11:50:00Z",
    asset: {
      id: "asset-19",
      ktCode: "KT019",
      fixedCode: "019.001",
      name: "Màn hình Samsung 24 inch",
      specs: "Full HD, VA Panel, 75Hz",
      entryDate: "2023-11-20",
      currentRoomId: "room-5",
      unit: "Cái",
      quantity: 1,
      origin: "Hàn Quốc",
      purchasePackage: 11,
      type: AssetType.TSCD,
      isLocked: false,
      isHandOver: true,
      categoryId: "cat-4",
      status: "hư_hỏng" as any,
      createdBy: "user-1",
      createdAt: "2023-11-20T00:00:00Z",
      updatedAt: "2023-11-20T00:00:00Z",
    },
    assignment: {
      id: "assign-3",
      groupId: "group-3",
      unitId: "unit-3",
      startDate: "2024-12-01",
      endDate: "2024-12-31",
      note: "Kiểm kê khoa Cơ khí",
      unit: {
        id: "unit-3",
        name: "Khoa Cơ khí",
        type: "đơn_vị_sử_dụng" as any,
        representativeId: "user-3",
        status: "ACTIVE" as any,
        createdBy: "user-1",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
    },
  },
  {
    id: "result-20",
    assignmentId: "assign-4",
    assetId: "asset-20",
    systemQuantity: 4,
    countedQuantity: 4,
    scanMethod: ScanMethod.RFID,
    status: InventoryResultStatus.LIQUIDATION_PROPOSED,
    note: "Đề xuất thanh lý do quá cũ",
    createdAt: "2024-12-18T15:30:00Z",
    asset: {
      id: "asset-20",
      ktCode: "KT020",
      fixedCode: "020.001",
      name: "Máy fax Canon L380S",
      specs: "Laser, Đen trắng, A4, Fax",
      entryDate: "2020-12-01",
      currentRoomId: "room-6",
      unit: "Cái",
      quantity: 1,
      origin: "Nhật Bản",
      purchasePackage: 12,
      type: AssetType.TSCD,
      isLocked: false,
      isHandOver: true,
      categoryId: "cat-5",
      status: "cũ" as any,
      createdBy: "user-1",
      createdAt: "2020-12-01T00:00:00Z",
      updatedAt: "2020-12-01T00:00:00Z",
    },
    assignment: {
      id: "assign-4",
      groupId: "group-4",
      unitId: "unit-4",
      startDate: "2024-12-01",
      endDate: "2024-12-31",
      note: "Kiểm kê Phòng Hành chính",
      unit: {
        id: "unit-4",
        name: "Phòng Hành chính",
        type: "đơn_vị_sử_dụng" as any,
        representativeId: "user-4",
        status: "ACTIVE" as any,
        createdBy: "user-1",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
    },
  },
];

// Mock units data - Extended
const mockUnits: Unit[] = [
  {
    id: "unit-1",
    name: "Khoa Công nghệ thông tin",
    type: "đơn_vị_sử_dụng" as any,
    representativeId: "user-1",
    status: "ACTIVE" as any,
    createdBy: "user-1",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "unit-2",
    name: "Khoa Kinh tế",
    type: "đơn_vị_sử_dụng" as any,
    representativeId: "user-2",
    status: "ACTIVE" as any,
    createdBy: "user-1",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "unit-3",
    name: "Khoa Cơ khí",
    type: "đơn_vị_sử_dụng" as any,
    representativeId: "user-3",
    status: "ACTIVE" as any,
    createdBy: "user-1",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "unit-4",
    name: "Phòng Hành chính",
    type: "đơn_vị_sử_dụng" as any,
    representativeId: "user-4",
    status: "ACTIVE" as any,
    createdBy: "user-1",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "unit-5",
    name: "Khoa Điện tử - Viễn thông",
    type: "đơn_vị_sử_dụng" as any,
    representativeId: "user-5",
    status: "ACTIVE" as any,
    createdBy: "user-1",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "unit-6",
    name: "Khoa Ngoại ngữ",
    type: "đơn_vị_sử_dụng" as any,
    representativeId: "user-6",
    status: "ACTIVE" as any,
    createdBy: "user-1",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "unit-7",
    name: "Phòng Tài chính - Kế toán",
    type: "đơn_vị_quản_lý" as any,
    representativeId: "user-7",
    status: "ACTIVE" as any,
    createdBy: "user-1",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "unit-8",
    name: "Thư viện",
    type: "đơn_vị_sử_dụng" as any,
    representativeId: "user-8",
    status: "ACTIVE" as any,
    createdBy: "user-1",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
];

// Status colors and labels
const statusColors = {
  [InventoryResultStatus.MATCHED]: "bg-green-100 text-green-800",
  [InventoryResultStatus.MISSING]: "bg-red-100 text-red-800",
  [InventoryResultStatus.EXCESS]: "bg-yellow-100 text-yellow-800",
  [InventoryResultStatus.BROKEN]: "bg-orange-100 text-orange-800",
  [InventoryResultStatus.NEEDS_REPAIR]: "bg-blue-100 text-blue-800",
  [InventoryResultStatus.LIQUIDATION_PROPOSED]: "bg-purple-100 text-purple-800",
};

const statusLabels = {
  [InventoryResultStatus.MATCHED]: "Đủ",
  [InventoryResultStatus.MISSING]: "Thiếu",
  [InventoryResultStatus.EXCESS]: "Thừa",
  [InventoryResultStatus.BROKEN]: "Hư hỏng",
  [InventoryResultStatus.NEEDS_REPAIR]: "Cần sửa chữa",
  [InventoryResultStatus.LIQUIDATION_PROPOSED]: "Đề xuất thanh lý",
};

const statusIcons = {
  [InventoryResultStatus.MATCHED]: CheckCircle,
  [InventoryResultStatus.MISSING]: Minus,
  [InventoryResultStatus.EXCESS]: Plus,
  [InventoryResultStatus.BROKEN]: XCircle,
  [InventoryResultStatus.NEEDS_REPAIR]: AlertTriangle,
  [InventoryResultStatus.LIQUIDATION_PROPOSED]: Clock,
};

const scanMethodLabels = {
  [ScanMethod.RFID]: "RFID",
  [ScanMethod.MANUAL]: "Thủ công",
};

export default function InventoryResultsPage() {
  const params = useParams();
  const sessionId = params.id as string;
  
  const [session, setSession] = useState<InventorySession | null>(mockInventorySession);
  const [results, setResults] = useState<InventoryResult[]>(mockInventoryResults);
  const [filteredResults, setFilteredResults] = useState<InventoryResult[]>(mockInventoryResults);
  const [filter, setFilter] = useState<InventoryResultFilter>({});
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
  const [conditionLogic, setConditionLogic] = useState<'contains' | 'equals' | 'not_contains'>('contains');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType>(AssetType.CCDC);
  const [selectedResult, setSelectedResult] = useState<InventoryResult | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { getCurrentRole } = useAuth();

  // Auto-apply filters
  useEffect(() => {
    applyAdvancedFilters();
  }, [selectedAssetType, filter.search, filterConditions, conditionLogic, results]);

  const handleRowClick = (result: InventoryResult) => {
    setSelectedResult(result);
    setIsDetailModalOpen(true);
  };

  const getDifference = (systemQty: number, countedQty: number) => {
    const diff = countedQty - systemQty;
    return {
      value: diff,
      isPositive: diff > 0,
      isNegative: diff < 0,
      isZero: diff === 0,
    };
  };

  // Calculate statistics
  const getStatistics = () => {
    const currentResults = filteredResults.filter(result => result.asset?.type === selectedAssetType);
    
    const total = currentResults.length;
    const matched = currentResults.filter(r => r.status === InventoryResultStatus.MATCHED).length;
    const missing = currentResults.filter(r => r.status === InventoryResultStatus.MISSING).length;
    const excess = currentResults.filter(r => r.status === InventoryResultStatus.EXCESS).length;
    const broken = currentResults.filter(r => r.status === InventoryResultStatus.BROKEN).length;
    const needsRepair = currentResults.filter(r => r.status === InventoryResultStatus.NEEDS_REPAIR).length;
    const liquidationProposed = currentResults.filter(r => r.status === InventoryResultStatus.LIQUIDATION_PROPOSED).length;

    const totalSystemQty = currentResults.reduce((sum, r) => sum + r.systemQuantity, 0);
    const totalCountedQty = currentResults.reduce((sum, r) => sum + r.countedQuantity, 0);
    const totalDifference = totalCountedQty - totalSystemQty;

    return {
      total,
      matched,
      missing,
      excess,
      broken,
      needsRepair,
      liquidationProposed,
      totalSystemQty,
      totalCountedQty,
      totalDifference,
      matchRate: total > 0 ? Math.round((matched / total) * 100) : 0,
    };
  };

  const statistics = getStatistics();

  // Filter options for AdvancedFilter
  const filterOptions = [
    {
      value: 'assetName',
      label: 'Tên tài sản',
      type: 'text' as const
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
      value: 'unitId',
      label: 'Đơn vị',
      type: 'select' as const,
      options: mockUnits.map(unit => ({
        value: unit.id,
        label: unit.name
      }))
    },
    {
      value: 'createdAt',
      label: 'Ngày kiểm kê',
      type: 'date' as const
    }
  ];

  // Apply advanced filters
  const applyAdvancedFilters = () => {
    let filtered = [...results];

    // Filter by asset type
    filtered = filtered.filter(result => result.asset?.type === selectedAssetType);

    // Filter by search
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(result =>
        result.asset?.name.toLowerCase().includes(searchLower) ||
        result.asset?.ktCode.toLowerCase().includes(searchLower) ||
        result.asset?.fixedCode.toLowerCase().includes(searchLower)
      );
    }

    // Apply condition-based filters
    if (filterConditions.length > 0) {
      if (conditionLogic === 'contains') {
        filterConditions.forEach(condition => {
          filtered = applyConditionFilter(filtered, condition);
        });
      } else if (conditionLogic === 'equals') {
        const originalFiltered = [...filtered];
        let orResults: InventoryResult[] = [];
        filterConditions.forEach(condition => {
          const conditionResults = applyConditionFilter(originalFiltered, condition);
          orResults = [...orResults, ...conditionResults.filter(result =>
            !orResults.some(existing => existing.id === result.id)
          )];
        });
        filtered = orResults;
      } else if (conditionLogic === 'not_contains') {
        filterConditions.forEach(condition => {
          filtered = applyConditionFilter(filtered, condition, true);
        });
      }
    }

    setFilteredResults(filtered);
    setCurrentPage(1);
  };

  // Helper function to apply single condition
  const applyConditionFilter = (results: InventoryResult[], condition: FilterCondition, negate = false): InventoryResult[] => {
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
      return results;
    }

    const result = results.filter(result => {
      let fieldValue: any;
      
      switch (condition.field) {
        case 'assetName':
          fieldValue = result.asset?.name;
          break;
        case 'ktCode':
          fieldValue = result.asset?.ktCode;
          break;
        case 'fixedCode':
          fieldValue = result.asset?.fixedCode;
          break;
        case 'status':
          fieldValue = result.status;
          break;
        case 'scanMethod':
          fieldValue = result.scanMethod;
          break;
        case 'unitId':
          fieldValue = result.assignment?.unitId;
          break;
        case 'createdAt':
          fieldValue = result.createdAt;
          break;
        default:
          fieldValue = (result as any)[condition.field];
      }

      if (fieldOption?.type === 'date') {
        const resultDate = new Date(fieldValue);
        const fromDate = condition.dateFrom ? new Date(condition.dateFrom) : null;
        const toDate = condition.dateTo ? new Date(condition.dateTo) : null;

        switch (condition.operator) {
          case 'contains':
          case 'equals':
            if (fromDate && toDate) {
              return resultDate >= fromDate && resultDate <= toDate;
            } else if (fromDate) {
              return resultDate >= fromDate;
            } else if (toDate) {
              return resultDate <= toDate;
            }
            return true;
          case 'not_contains':
            if (fromDate && toDate) {
              return !(resultDate >= fromDate && resultDate <= toDate);
            } else if (fromDate) {
              return resultDate < fromDate;
            } else if (toDate) {
              return resultDate > toDate;
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
              const fieldOption = filterOptions.find(opt => opt.value === condition.field);
              if (fieldOption?.type === 'select') {
                return String(fieldValue) === val;
              }
              return String(fieldValue).toLowerCase().includes(val.toLowerCase());
            });
          } else {
            return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
          }
        case 'equals':
          if (Array.isArray(condition.value)) {
            if (condition.value.length === 0) return true;
            return condition.value.some(val => {
              const fieldOption = filterOptions.find(opt => opt.value === condition.field);
              if (fieldOption?.type === 'select') {
                return String(fieldValue) === val;
              }
              return String(fieldValue).toLowerCase().includes(val.toLowerCase());
            });
          } else {
            return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
          }
        case 'not_contains':
          if (Array.isArray(condition.value)) {
            if (condition.value.length === 0) return true;
            return !condition.value.some(val => {
              const fieldOption = filterOptions.find(opt => opt.value === condition.field);
              if (fieldOption?.type === 'select') {
                return String(fieldValue) === val;
              }
              return String(fieldValue).toLowerCase().includes(val.toLowerCase());
            });
          } else {
            return !String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
          }
        default:
          return true;
      }
    });

    return negate ? results.filter(r => !result.includes(r)) : result;
  };

  // Reset all filters
  const resetFilters = () => {
    setFilter({});
    setFilterConditions([]);
    setConditionLogic('contains');
    setFilteredResults(results);
    setCurrentPage(1);
  };

  // Define table columns
  const columns: TableColumn<InventoryResult>[] = [
    {
      key: "assetCode",
      title: "Mã tài sản",
      width: "120px",
      minWidth: 100,
      maxWidth: 150,
      render: (_, result) => (
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-900">
            {result.asset?.ktCode}
          </div>
          <div className="text-xs text-gray-500">
            {result.asset?.fixedCode}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "assetName",
      title: "Tên tài sản",
      width: "250px",
      minWidth: 200,
      maxWidth: 300,
      render: (_, result) => (
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-900">
            {result.asset?.name}
          </div>
          {result.asset?.specs && (
            <div className="text-xs text-gray-500">
              {result.asset.specs}
            </div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      key: "unit",
      title: "Đơn vị tính",
      width: "100px",
      minWidth: 80,
      maxWidth: 120,
      render: (_, result) => (
        <div className="text-sm text-gray-900">
          {result.asset?.unit}
        </div>
      ),
      sortable: true,
    },
    {
      key: "systemQuantity",
      title: "SL hệ thống",
      width: "120px",
      minWidth: 100,
      maxWidth: 140,
      render: (_, result) => (
        <div className="text-sm font-medium text-gray-900">
          {result.systemQuantity}
        </div>
      ),
      sortable: true,
    },
    {
      key: "countedQuantity",
      title: "SL kiểm kê",
      width: "120px",
      minWidth: 100,
      maxWidth: 140,
      render: (_, result) => (
        <div className="text-sm font-medium text-gray-900">
          {result.countedQuantity}
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
      render: (_, result) => {
        return (
          <Badge className={statusColors[result.status]}>
            {statusLabels[result.status]}
          </Badge>
        );
      },
      sortable: true,
    },
    {
      key: "actions",
      title: "Thao tác",
      width: "100px",
      minWidth: 80,
      maxWidth: 120,
      resizable: false,
      render: (_, result) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRowClick(result)}
          className="text-blue-600 hover:text-blue-800"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/inventory/${sessionId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kết quả kiểm kê</h1>
            <p className="text-gray-600">
              {session?.name} - Năm {session?.year} - Đợt {session?.period}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Session Information */}
      {session && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Năm</p>
                <p className="text-lg font-semibold text-gray-900">{session.year}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tên kỳ kiểm kê</p>
                <p className="text-lg font-semibold text-gray-900">{session.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Đợt</p>
                <p className="text-lg font-semibold text-gray-900">{session.period}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Thời gian</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(session.startDate).toLocaleDateString("vi-VN")} - {new Date(session.endDate).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Đơn vị tham gia</p>
                <p className="text-lg font-semibold text-gray-900">
                  {session.units?.length || 0} đơn vị
                </p>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Asset Type Selection Card */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn loại tài sản</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setSelectedAssetType(AssetType.CCDC)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              selectedAssetType === AssetType.CCDC 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                selectedAssetType === AssetType.CCDC 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-orange-100 text-orange-600'
              }`}>
                <Wrench className="h-6 w-6" />
              </div>
              <div className="text-left">
                <div className={`font-semibold ${
                  selectedAssetType === AssetType.CCDC 
                    ? 'text-blue-900' 
                    : 'text-gray-900'
                }`}>
                  Công cụ dụng cụ
                </div>
                <div className="text-sm text-gray-600">
                  {results.filter(r => r.asset?.type === AssetType.CCDC).length} tài sản
                </div>
              </div>
              {selectedAssetType === AssetType.CCDC && (
                <div className="ml-auto">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
              )}
            </div>
          </button>

          <button
            onClick={() => setSelectedAssetType(AssetType.TSCD)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              selectedAssetType === AssetType.TSCD 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                selectedAssetType === AssetType.TSCD 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-purple-100 text-purple-600'
              }`}>
                <Package className="h-6 w-6" />
              </div>
              <div className="text-left">
                <div className={`font-semibold ${
                  selectedAssetType === AssetType.TSCD 
                    ? 'text-green-900' 
                    : 'text-gray-900'
                }`}>
                  Tài sản cố định
                </div>
                <div className="text-sm text-gray-600">
                  {results.filter(r => r.asset?.type === AssetType.TSCD).length} tài sản
                </div>
              </div>
              {selectedAssetType === AssetType.TSCD && (
                <div className="ml-auto">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <AdvancedFilter
          title="Tìm kiếm nâng cao"
          filterOptions={filterOptions}
          conditions={filterConditions}
          conditionLogic={conditionLogic}
          onConditionsChange={setFilterConditions}
          onConditionLogicChange={setConditionLogic}
          onApply={applyAdvancedFilters}
          onReset={resetFilters}
          className=""
        />

        {/* Filter Results Info */}
        {(filter.search || filterConditions.length > 0) && (
          <div className="bg-blue-50 rounded-lg p-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Filter className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Kết quả lọc: {filteredResults.filter(r => r.asset?.type === selectedAssetType).length} / {results.filter(r => r.asset?.type === selectedAssetType).length} tài sản
                  </span>
                </div>
                {filter.search && (
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-blue-700">Từ khóa:</span>
                    <Badge variant="outline" className="text-blue-700">
                      "{filter.search}"
                    </Badge>
                  </div>
                )}
                {filterConditions.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-blue-700">Điều kiện:</span>
                    <Badge variant="outline" className="text-blue-700">
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
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <Table
          resizable={true}
          columns={columns}
          data={filteredResults.filter(r => r.asset?.type === selectedAssetType)}
          emptyText={`Không có kết quả kiểm kê nào cho ${selectedAssetType === AssetType.CCDC ? 'Công cụ dụng cụ' : 'Tài sản cố định'}`}
          emptyIcon={<FileText className="mx-auto h-12 w-12 text-gray-400" />}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: itemsPerPage,
            total: filteredResults.filter(r => r.asset?.type === selectedAssetType).length,
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span>Danh sách kết quả kiểm kê</span>
              </div>
            </div>
          }
        />
      </div>

      {/* Detail Modal */}
      <Modal 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)}
        size="xl"
        className="max-h-[80vh] overflow-y-auto"
      >
        <ModalHeader>
          <h2 className="text-xl font-semibold text-gray-900">Chi tiết kết quả kiểm kê</h2>
        </ModalHeader>
          
          {selectedResult && (
            <div className="space-y-6">
              {/* Asset Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin tài sản</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Mã kế toán</label>
                    <p className="text-sm text-gray-900">{selectedResult.asset?.ktCode}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Mã tài sản cố định</label>
                    <p className="text-sm text-gray-900">{selectedResult.asset?.fixedCode}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Tên tài sản</label>
                    <p className="text-sm text-gray-900">{selectedResult.asset?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Thông số kỹ thuật</label>
                    <p className="text-sm text-gray-900">{selectedResult.asset?.specs || "Không có"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Ngày nhập</label>
                    <p className="text-sm text-gray-900">
                      {selectedResult.asset?.entryDate ? new Date(selectedResult.asset.entryDate).toLocaleDateString("vi-VN") : "Không có"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Xuất xứ</label>
                    <p className="text-sm text-gray-900">{selectedResult.asset?.origin || "Không có"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Đơn vị tính</label>
                    <p className="text-sm text-gray-900">{selectedResult.asset?.unit}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Gói mua</label>
                    <p className="text-sm text-gray-900">{selectedResult.asset?.purchasePackage}</p>
                  </div>
                </div>
              </div>

              {/* Inventory Result Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Kết quả kiểm kê</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Số lượng hệ thống</label>
                    <p className="text-sm text-gray-900">{selectedResult.systemQuantity}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Số lượng kiểm kê</label>
                    <p className="text-sm text-gray-900">{selectedResult.countedQuantity}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Chênh lệch</label>
                    <p className={`text-sm font-medium ${
                      getDifference(selectedResult.systemQuantity, selectedResult.countedQuantity).isPositive ? 'text-green-600' : 
                      getDifference(selectedResult.systemQuantity, selectedResult.countedQuantity).isNegative ? 'text-red-600' : 
                      'text-gray-600'
                    }`}>
                      {getDifference(selectedResult.systemQuantity, selectedResult.countedQuantity).isPositive ? '+' : ''}
                      {getDifference(selectedResult.systemQuantity, selectedResult.countedQuantity).value}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Trạng thái</label>
                    <div className="flex items-center space-x-2">
                      {(() => {
                        const StatusIcon = statusIcons[selectedResult.status];
                        return (
                          <Badge className={statusColors[selectedResult.status]}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusLabels[selectedResult.status]}
                          </Badge>
                        );
                      })()}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phương thức quét</label>
                    <p className="text-sm text-gray-900">
                      {selectedResult.scanMethod ? scanMethodLabels[selectedResult.scanMethod] : "Không có"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Thời gian kiểm kê</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedResult.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Ghi chú</label>
                    <p className="text-sm text-gray-900">{selectedResult.note || "Không có ghi chú"}</p>
                  </div>
                </div>
              </div>

              {/* Unit Information */}
              {selectedResult.assignment?.unit && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin đơn vị</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Tên đơn vị</label>
                      <p className="text-sm text-gray-900">{selectedResult.assignment.unit.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Loại đơn vị</label>
                      <p className="text-sm text-gray-900">{selectedResult.assignment.unit.type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Ngày bắt đầu kiểm kê</label>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedResult.assignment.startDate).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Ngày kết thúc kiểm kê</label>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedResult.assignment.endDate).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    {selectedResult.assignment.note && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Ghi chú phân công</label>
                        <p className="text-sm text-gray-900">{selectedResult.assignment.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
      </Modal>
    </div>
  );
}
