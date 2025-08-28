"use client";

import React, { useState, useEffect } from "react";
import {
    Search,
    Filter,
    Plus,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    FileText,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown
} from "lucide-react";
import Link from "next/link";
import {
    LiquidationProposal,
    LiquidationStatus,
    User,
    Unit
} from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { useAuth } from "@/contexts/AuthContext";
import {
    mockLiquidationProposals,
    mockUsers,
    mockUnits,
    getLiquidationStats
} from "@/lib/mockData";
import { useRouter } from "next/navigation";

type SortField = 'id' | 'proposer' | 'unit' | 'reason' | 'status' | 'createdAt';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
    field: SortField;
    direction: SortDirection;
}

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

interface LiquidationFilter {
    search?: string;
    status?: LiquidationStatus;
    unitId?: string;
    proposerId?: string;
}

export default function LiquidationPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [proposals, setProposals] = useState<LiquidationProposal[]>([]);
    const [filteredProposals, setFilteredProposals] = useState<LiquidationProposal[]>([]);
    const [filter, setFilter] = useState<LiquidationFilter>({});
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'createdAt', direction: 'desc' });
    const [stats, setStats] = useState({ total: 0, proposed: 0, approved: 0, rejected: 0 });

    // Load data
    useEffect(() => {
        // Simulate API call
        const loadData = () => {
            let data = [...mockLiquidationProposals];

            // Add related data
            data = data.map(proposal => ({
                ...proposal,
                proposer: mockUsers.find((u: User) => u.id === proposal.proposerId),
                unit: mockUnits.find((unit: Unit) => unit.id === proposal.unitId)
            }));

            setProposals(data);
            setStats(getLiquidationStats());
        };

        loadData();
    }, []);

    // Apply filters
    useEffect(() => {
        let filtered = [...proposals];

        // Search filter
        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            filtered = filtered.filter(proposal =>
                proposal.id.toLowerCase().includes(searchLower) ||
                proposal.reason.toLowerCase().includes(searchLower) ||
                proposal.proposer?.fullName.toLowerCase().includes(searchLower) ||
                proposal.unit?.name.toLowerCase().includes(searchLower)
            );
        }

        // Status filter
        if (filter.status) {
            filtered = filtered.filter(proposal => proposal.status === filter.status);
        }

        // Unit filter  
        if (filter.unitId) {
            filtered = filtered.filter(proposal => proposal.unitId === filter.unitId);
        }

        // Proposer filter
        if (filter.proposerId) {
            filtered = filtered.filter(proposal => proposal.proposerId === filter.proposerId);
        }

        // Apply filters and sorting
        filtered.sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (sortConfig.field) {
                case 'proposer':
                    aValue = a.proposer?.fullName || '';
                    bValue = b.proposer?.fullName || '';
                    break;
                case 'unit':
                    aValue = a.unit?.name || '';
                    bValue = b.unit?.name || '';
                    break;
                case 'reason':
                    aValue = a.reason;
                    bValue = b.reason;
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                case 'createdAt':
                    aValue = new Date(a.createdAt);
                    bValue = new Date(b.createdAt);
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        setFilteredProposals(filtered);
        setCurrentPage(1);
    }, [proposals, filter, sortConfig]);

    const totalPages = Math.ceil(filteredProposals.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProposals = filteredProposals.slice(startIndex, endIndex);

    const handleSort = (field: SortField) => {
        setSortConfig(prevConfig => ({
            field,
            direction: prevConfig.field === field && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const getSortIcon = (field: SortField) => {
        if (sortConfig.field !== field) {
            return <ChevronsUpDown className="h-4 w-4 text-gray-400" />;
        }
        return sortConfig.direction === 'asc' 
            ? <ChevronUp className="h-4 w-4 text-blue-600" />
            : <ChevronDown className="h-4 w-4 text-blue-600" />;
    };

    const handleApprove = (proposalId: string) => {
        setProposals(prev => prev.map(proposal =>
            proposal.id === proposalId
                ? { ...proposal, status: LiquidationStatus.APPROVED, updatedAt: new Date().toISOString() }
                : proposal
        ));
    };

    const handleReject = (proposalId: string) => {
        setProposals(prev => prev.map(proposal =>
            proposal.id === proposalId
                ? { ...proposal, status: LiquidationStatus.REJECTED, updatedAt: new Date().toISOString() }
                : proposal
        ));
    };

    const canCreateProposal = user?.roles?.some(role =>
        ['DON_VI_SU_DUNG', 'ADMIN', 'SUPER_ADMIN'].includes(role.code)
    );

    const canApproveProposal = user?.roles?.some(role =>
        ['ADMIN', 'PHONG_QUAN_TRI', 'SUPER_ADMIN'].includes(role.code)
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Quản lý thanh lý tài sản</h1>
                    <p className="text-gray-600 mt-2">
                        Quản lý đề xuất và phê duyệt thanh lý tài sản
                    </p>
                </div>
                {canCreateProposal && (
                    <Link href="/liquidation/create">
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Tạo đề xuất thanh lý
                        </Button>
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Tổng đề xuất</p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                        <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Chờ phê duyệt</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.proposed}</p>
                        </div>
                        <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Đã phê duyệt</p>
                            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Từ chối</p>
                            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                        </div>
                        <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Tìm kiếm đề xuất..."
                            value={filter.search || ""}
                            onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                            className="pl-10"
                        />
                    </div>

                    <select
                        value={filter.status || ""}
                        onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value as LiquidationStatus || undefined }))}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value={LiquidationStatus.PROPOSED}>Đề xuất thanh lý</option>
                        <option value={LiquidationStatus.APPROVED}>Đã phê duyệt</option>
                        <option value={LiquidationStatus.REJECTED}>Từ chối</option>
                    </select>

                    <select
                        value={filter.unitId || ""}
                        onChange={(e) => setFilter(prev => ({ ...prev, unitId: e.target.value || undefined }))}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Tất cả đơn vị</option>
                        {mockUnits.map((unit: Unit) => (
                            <option key={unit.id} value={unit.id}>{unit.name}</option>
                        ))}
                    </select>

                    <Button
                        variant="outline"
                        onClick={() => setFilter({})}
                        className="flex items-center gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        Xóa bộ lọc
                    </Button>
                </div>
            </div>

            {/* Table */}
           <div className="bg-white rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                                    onClick={() => handleSort('proposer')}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>Người đề xuất</span>
                                        {getSortIcon('proposer')}
                                    </div>
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                                    onClick={() => handleSort('unit')}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>Đơn vị</span>
                                        {getSortIcon('unit')}
                                    </div>
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                                    onClick={() => handleSort('reason')}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>Lý do</span>
                                        {getSortIcon('reason')}
                                    </div>
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                                    onClick={() => handleSort('status')}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>Trạng thái</span>
                                        {getSortIcon('status')}
                                    </div>
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                                    onClick={() => handleSort('createdAt')}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>Ngày tạo</span>
                                        {getSortIcon('createdAt')}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentProposals.map((proposal) => {
                                const StatusIcon = statusIcons[proposal.status];
                                return (
                                    <tr key={proposal.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {proposal.proposer?.fullName || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {proposal.unit?.name || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                            {proposal.reason}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge className={`${statusColors[proposal.status]} flex items-center gap-1`}>
                                                <StatusIcon className="h-3 w-3" />
                                                {statusLabels[proposal.status]}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(proposal.createdAt).toLocaleDateString("vi-VN")}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/liquidation/${proposal.id}`}>
                                                    <Button variant="outline" size="sm" className="hover:bg-gray-100 flex items-center gap-1">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>

                                                {proposal.status === LiquidationStatus.PROPOSED && canApproveProposal && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleApprove(proposal.id)}
                                                            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleReject(proposal.id)}
                                                            className=" bg-red-600 hover:bg-red-700 flex items-center gap-1"
                                                        >
                                                            <XCircle className="h-4 w-4 text-white" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
