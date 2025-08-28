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
    Download
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
    Asset
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

export default function LiquidationProposalDetailPage() {
    const { user } = useAuth();
    const params = useParams();
    const proposalId = params.id as string;

    const [proposal, setProposal] = useState<LiquidationProposal | null>(null);
    const [items, setItems] = useState<LiquidationProposalItem[]>([]);
    const [proposer, setProposer] = useState<UserType | null>(null);
    const [unit, setUnit] = useState<Unit | null>(null);
    const [loading, setLoading] = useState(true);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
    const [approvalNote, setApprovalNote] = useState("");

    useEffect(() => {
        const loadData = () => {
            // Find proposal
            const foundProposal = mockLiquidationProposals.find(p => p.id === proposalId);
            if (!foundProposal) {
                setLoading(false);
                return;
            }

            // Get related data
            const proposalItems = getLiquidationItemsByProposal(proposalId).map(item => ({
                ...item,
                asset: mockAssets.find((asset: Asset) => asset.id === item.assetId)
            }));

            const proposerUser = mockUsers.find((u: UserType) => u.id === foundProposal.proposerId);
            const proposalUnit = mockUnits.find((unit: Unit) => unit.id === foundProposal.unitId);

            setProposal(foundProposal);
            setItems(proposalItems);
            setProposer(proposerUser || null);
            setUnit(proposalUnit || null);
            setLoading(false);
        };

        loadData();
    }, [proposalId]);

    const canApproveProposal = user?.roles?.some(role =>
        ['ADMIN', 'PHONG_QUAN_TRI'].includes(role.code)
    );

    const handleApproval = (action: 'approve' | 'reject') => {
        setApprovalAction(action);
        setShowApprovalModal(true);
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

            setShowApprovalModal(false);
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
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50 flex items-center gap-2"
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
                    <div className="bg-white p-6 rounded-lg shadow border">
                        <h2 className="text-xl font-semibold mb-4">Thông tin đề xuất</h2>

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

                    {/* Asset List */}
                    <div className="bg-white p-6 rounded-lg shadow border">
                        <h2 className="text-xl font-semibold mb-4">Danh sách tài sản ({items.length})</h2>

                        {items.length === 0 ? (
                            <div className="text-center py-8">
                                <AlertTriangle className="mx-auto h-8 w-8 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-600">Không có tài sản nào</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <div key={item.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900">{item.asset?.name}</h4>
                                                <div className="text-sm text-gray-600 space-y-1">
                                                    <p>Mã KT: {item.asset?.ktCode}</p>
                                                    <p>Mã TSCD: {item.asset?.fixedCode}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge className={conditionColors[item.condition]}>
                                                    {conditionLabels[item.condition]}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <h5 className="font-medium text-sm text-gray-700 mb-1">Lý do cụ thể:</h5>
                                            <p className="text-sm text-gray-600">{item.reason}</p>
                                        </div>

                                        {item.mediaUrl && (
                                            <div className="mt-3">
                                                <h5 className="font-medium text-sm text-gray-700 mb-2">Ảnh minh chứng:</h5>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                                                        <Eye className="h-3 w-3" />
                                                        Xem ảnh
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                                                        <Download className="h-3 w-3" />
                                                        Tải xuống
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Timeline */}
                    <div className="bg-white p-6 rounded-lg shadow border">
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
                        <div className="bg-white p-6 rounded-lg shadow border">
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

            {/* Approval Modal */}
            {showApprovalModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">
                                {approvalAction === 'approve' ? 'Phê duyệt đề xuất' : 'Từ chối đề xuất'}
                            </h3>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ghi chú {approvalAction === 'approve' ? '(tùy chọn)' : '*'}
                                </label>
                                <textarea
                                    value={approvalNote}
                                    onChange={(e) => setApprovalNote(e.target.value)}
                                    rows={4}
                                    placeholder={
                                        approvalAction === 'approve'
                                            ? "Nhập ghi chú phê duyệt..."
                                            : "Nhập lý do từ chối..."
                                    }
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowApprovalModal(false)}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    onClick={confirmApproval}
                                    className={
                                        approvalAction === 'approve'
                                            ? "bg-green-600 hover:bg-green-700"
                                            : "bg-red-600 hover:bg-red-700"
                                    }
                                >
                                    {approvalAction === 'approve' ? 'Phê duyệt' : 'Từ chối'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
