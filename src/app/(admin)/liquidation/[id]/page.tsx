"use client";

import React, { useState, useEffect } from "react";
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Clock,
    User,
    Building,
    Calendar,
    FileText,
    AlertTriangle,
    Eye,
    Download,
    Package2
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    LiquidationProposal,
    LiquidationProposalItem,
    LiquidationStatus,
    LiquidationProposalItemCondition,
    User as UserType,
    Unit,
    Asset,
    AssetType
} from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
    mockLiquidationProposals,
    mockLiquidationProposalItems,
    mockUsers,
    mockUnits,
    mockAssets,
    getLiquidationItemsByProposal
} from "@/lib/mockData";
import Table, { TableColumn } from "@/components/ui/table";

const statusColors = {
    [LiquidationStatus.PROPOSED]: "bg-yellow-100 text-yellow-800",
    [LiquidationStatus.APPROVED]: "bg-green-100 text-green-800",
    [LiquidationStatus.REJECTED]: "bg-red-100 text-red-800",
};

const statusLabels = {
    [LiquidationStatus.PROPOSED]: "Đề xuất thanh lý",
    [LiquidationStatus.APPROVED]: "Đã phê duyệt",
    [LiquidationStatus.REJECTED]: "Từ chối",
};

const statusIcons = {
    [LiquidationStatus.PROPOSED]: Clock,
    [LiquidationStatus.APPROVED]: CheckCircle,
    [LiquidationStatus.REJECTED]: XCircle,
};

const conditionLabels = {
    [LiquidationProposalItemCondition.DAMAGED]: "Hư hỏng",
    [LiquidationProposalItemCondition.UNUSABLE]: "Không thể sử dụng",
};

const conditionColors = {
    [LiquidationProposalItemCondition.DAMAGED]: "bg-red-100 text-red-800",
    [LiquidationProposalItemCondition.UNUSABLE]: "bg-orange-100 text-orange-800",
};

type SortField = 'id' | 'assetType' | 'unit' | 'reason' | 'status' | 'createdAt';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
    field: SortField;
    direction: SortDirection;
    priority: number; // Thứ tự ưu tiên (1 = cao nhất)
}

const assetTypeLabels = {
    [AssetType.TSCD]: "Tài sản cố định",
    [AssetType.CCDC]: "Công cụ dụng cụ",
};

export default function LiquidationProposalDetailPage() {
    const { user } = useAuth();
    const params = useParams();
    const proposalId = params.id as string;

    const [proposal, setProposal] = useState<LiquidationProposal | null>(null);
    const [items, setItems] = useState<LiquidationProposalItem[]>([]);
    const [proposer, setProposer] = useState<UserType | null>(null);
    const [unit, setUnit] = useState<Unit | null>(null);
    const [loading, setLoading] = useState(true);
    const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
    const [approvalNote, setApprovalNote] = useState("");

    //table 
    const [sortConfigs, setSortConfigs] = useState<any[]>([]);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<SortConfig[]>([{ field: 'createdAt', direction: 'desc', priority: 1 }]);

    const columns: TableColumn<LiquidationProposalItem>[] = [
        {
            key: "code",
            title: "Mã TSCD/CCDC",
            sortable: true,
            render: (_, item) => (
                <div className="text-sm font-medium text-gray-900">
                    {item.asset?.fixedCode}
                </div>
            ),
            width: "100px",
            minWidth: 100,
            maxWidth: 150,
        },
        {
            key: "ktCode",
            title: "Mã KT",
            sortable: true,
            render: (_, item) => (
                <div className="text-sm font-medium text-gray-900">
                    {item.asset?.ktCode}
                </div>
            ),
            width: "100px",
            minWidth: 100,
            maxWidth: 150,
        },
        {
            key: "name",
            title: "Tên TSCD/CCDC",
            sortable: true,
            render: (_, item) => (
                <div className="text-sm font-medium text-gray-900">
                    {item.asset?.name}
                </div>
            ),
            width: "200",
            minWidth: 150,
            maxWidth: 300,
        },
        {
            key: "specs", //thông số kỹ thuật
            title: "Thông số kỹ thuật",
            sortable: false,
            render: (_, item) => (
                <div className="text-sm text-gray-500">
                    {item.asset?.specs}
                </div>
            ),
        },
        {
            key: "location", //vị trí
            title: "Mã vị trí",
            sortable: false,
            render: (_, item) => (
                <div className="text-sm text-gray-500">
                    {item.asset?.location}
                </div>
            ),
        },
        {
            key: "reason", // lí do
            title: "Lý do thanh lý",
            sortable: false,
            render: (_, item) => (
                <div className="text-sm text-gray-500">
                    {item.reason}
                </div>
            ),
        },
        {
            key: "action", // hành động
            title: "Hành động",
            sortable: false,
            render: (_, item) => (
                <div className="flex items-center gap-2">
                    {item.mediaUrl && (
                        <>
                            <button
                                className="px-2 py-2 hover:bg-blue-100 rounded text-blue-600 hover:text-blue-800"
                                title="Xem ảnh"
                            >
                                <Eye className="h-4 w-4" />
                            </button>
                            <button
                                className="px-2 py-2 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-800"
                                title="Tải xuống"                            
                            >
                                <Download className="h-4 w-4" />
                            </button>
                            
                        </>
                    )
                    }
                </div>
            ),
            width: "100px",
            minWidth: 100,
            maxWidth: 150,
        }
    ];

    const handleSortChange = (newSortConfigs: any[]) => {
        console.log('Sort changed:', newSortConfigs);
        setSortConfigs(newSortConfigs);
    };

    useEffect(() => {
        const loadData = () => {
            // Find proposal
            const foundProposal = mockLiquidationProposals.find(p => p.id === proposalId);
            if (!foundProposal) {
                setLoading(false);
                return;
            }

            // Get related data
            const lstProposalItem = getLiquidationItemsByProposal(proposalId).map(item => ({
                ...item,
                asset: mockAssets.find((asset: Asset) => asset.id === item.assetId)
            }));

            const proposerUser = mockUsers.find((u: UserType) => u.id === foundProposal.proposerId);
            const proposalUnit = mockUnits.find((unit: Unit) => unit.id === foundProposal.unitId);

            setProposal(foundProposal);
            setItems(lstProposalItem);
            setProposer(proposerUser || null);
            setUnit(proposalUnit || null);
            setLoading(false);
        };

        loadData();
    }, [proposalId]);

    const canApproveProposal = user?.roles?.some(role =>
        ['ADMIN', 'PHONG_QUAN_TRI', 'SUPER_ADMIN'].includes(role.code)
    );

    const handleApproval = (action: 'approve' | 'reject') => {
        setApprovalAction(action);
    };

    const confirmApproval = async () => {
        if (!proposal) return;

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            const newStatus = approvalAction === 'approve' ? LiquidationStatus.APPROVED : LiquidationStatus.REJECTED;

            setProposal(prev => prev ? {
                ...prev,
                status: newStatus,
                updatedAt: new Date().toISOString()
            } : null);
            setApprovalNote("");

            // Here you would typically call your API to update the proposal status
            console.log(`${approvalAction === 'approve' ? 'Approved' : 'Rejected'} proposal:`, proposal.id);

        } catch (error) {
            console.error("Error updating proposal:", error);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!proposal) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Không tìm thấy đề xuất</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Đề xuất thanh lý không tồn tại hoặc đã bị xóa.
                    </p>
                    <Link href="/admin/liquidation" className="mt-4 inline-block">
                        <Button>Quay lại danh sách</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const StatusIcon = statusIcons[proposal.status];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/liquidation">
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Quay lại
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Chi tiết đề xuất thanh lý</h1>
                        <p className="text-gray-600 mt-2">Mã đề xuất: {proposal.id}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                {proposal.status === LiquidationStatus.PROPOSED && canApproveProposal && (
                    <div className="flex gap-2">
                        <Button
                            onClick={() => handleApproval('approve')}
                            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                        >
                            <CheckCircle className="h-4 w-4" />
                            Phê duyệt
                        </Button>
                        <Button
                            onClick={() => handleApproval('reject')}
                            className="bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                        >
                            <XCircle className="h-4 w-4" />
                            Từ chối
                        </Button>
                    </div>
                )}
            </div>

            {/* Proposal Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Thông tin đề xuất thanh lý {assetTypeLabels[proposal.typeAsset]}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <StatusIcon className={`h-5 w-5 ${proposal.status === LiquidationStatus.APPROVED ? 'text-green-600' :
                                            proposal.status === LiquidationStatus.REJECTED ? 'text-red-600' :
                                                'text-yellow-600'
                                        }`} />
                                    <div>
                                        <p className="text-sm text-gray-600">Trạng thái</p>
                                        <Badge className={statusColors[proposal.status]}>
                                            {statusLabels[proposal.status]}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">Người đề xuất</p>
                                        <p className="font-medium">{proposer?.fullName || "N/A"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Building className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">Đơn vị</p>
                                        <p className="font-medium">{unit?.name || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">Ngày tạo</p>
                                        <p className="font-medium">
                                            {new Date(proposal.createdAt).toLocaleDateString("vi-VN")}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">Ngày cập nhật</p>
                                        <p className="font-medium">
                                            {new Date(proposal.updatedAt).toLocaleDateString("vi-VN")}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">Số lượng tài sản</p>
                                        <p className="font-medium">{items.length} tài sản</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="font-medium text-gray-900 mb-2">Lý do thanh lý</h3>
                            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{proposal.reason}</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Timeline */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="font-semibold mb-4">Lịch sử xử lý</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-sm">Tạo đề xuất</p>
                                    <p className="text-xs text-gray-600">
                                        {new Date(proposal.createdAt).toLocaleString("vi-VN")}
                                    </p>
                                    {/* <p className="text-xs text-gray-500">bởi {proposer?.fullName}</p> */}
                                    <p className="text-xs text-gray-500">bởi 'Tên đơn vị sử dụng'</p>
                                </div>
                            </div>

                            {proposal.status !== LiquidationStatus.PROPOSED && (
                                <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${proposal.status === LiquidationStatus.APPROVED
                                            ? 'bg-green-100'
                                            : 'bg-red-100'
                                        }`}>
                                        <StatusIcon className={`h-4 w-4 ${proposal.status === LiquidationStatus.APPROVED
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                            }`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">
                                            {proposal.status === LiquidationStatus.APPROVED ? 'Phê duyệt' : 'Từ chối'}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {new Date(proposal.updatedAt).toLocaleString("vi-VN")}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    {proposal.status === LiquidationStatus.APPROVED && (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="font-semibold mb-4">Tài liệu liên quan</h3>
                            <div className="space-y-2">
                                <Button variant="outline" className="w-full justify-start">
                                    <Download className="h-4 w-4 mr-2" />
                                    Xuất biên bản thanh lý
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Download className="h-4 w-4 mr-2" />
                                    Xuất danh sách tài sản
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Table
                title={`Danh sách tài sản (${items.length} -  ${assetTypeLabels[proposal.typeAsset]})`}
                resizable={true}
                columns={columns}
                multiSort={true}
                data={items}
                sortConfigs={sortConfigs}
                onSortChange={handleSortChange}
                emptyText="Không có tài sản nào"
                emptyIcon={<Package2 className="mx-auto h-12 w-12 text-gray-400" />}
                rowKey="id"
                pagination={{
                    current: currentPage,
                    pageSize: itemsPerPage,
                    total: items.length,
                    onChange: (page, pageSize) => {
                        setCurrentPage(page);
                        if (pageSize !== itemsPerPage) {
                            setItemsPerPage(pageSize);
                            setCurrentPage(1);
                        }
                    },
                    showSizeChanger: true,
                    pageSizeOptions: [5, 10, 20, 50, 100]
                }}
            />
        </div>
    );
}
