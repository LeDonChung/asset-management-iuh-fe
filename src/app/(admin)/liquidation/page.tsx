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
    ChevronsUpDown,
    Package2
} from "lucide-react";
import Link from "next/link";
import {
    LiquidationProposal,
    LiquidationStatus,
    User,
    Unit,
    AssetType
} from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
    mockLiquidationProposals,
    mockUsers,
    mockUnits,
    getLiquidationStats
} from "@/lib/mockData";
import { useRouter } from "next/navigation";
import Table, { TableColumn } from "@/components/ui/table";
import AdvancedFilter, { FilterCondition } from "@/components/filter/AdvancedFilter";

type SortField = 'id' | 'assetType' | 'unit' | 'reason' | 'status' | 'createdAt';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
    field: SortField;
    direction: SortDirection;
    priority: number; // Thứ tự ưu tiên (1 = cao nhất)
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

const assetTypeLabels = {
    [AssetType.TSCD]: "Tài sản cố định",
    [AssetType.CCDC]: "Công cụ dụng cụ",
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

    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<SortConfig[]>([{ field: 'createdAt', direction: 'desc', priority: 1 }]);
    const [stats, setStats] = useState({ total: 0, proposed: 0, approved: 0, rejected: 0 });

    //filter
    const [filteredProposals, setFilteredProposals] = useState<LiquidationProposal[]>([]);
    const [filter, setFilter] = useState<LiquidationFilter>({});
    const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
    const [conditionLogic, setConditionLogic] = useState<'contains' | 'equals' | 'not_contains'>('contains');

    // Filter options for AdvancedFilter
    const filterOptions = [
        {
            value: 'id',
            label: 'Mã đề xuất',
            type: 'text' as const
        },
        {
            value: 'typeAsset',
            label: 'Loại tài sản',
            type: 'select' as const,
            options: Object.entries(assetTypeLabels).map(([value, label]) => ({
                value,
                label
            }))
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
            value: 'reason',
            label: 'Lý do thanh lý',
            type: 'text' as const
        },
        {
            value: 'createdAt',
            label: 'Ngày tạo',
            type: 'date' as const
        }
    ];

    const handleSort = (lstProposal: LiquidationProposal[], lstSortConfig: any[]): LiquidationProposal[] => {
        if (lstSortConfig.length === 0) return lstProposal;

        return [...lstProposal].sort((a, b) => {
            const lstSortedConfig = [...lstSortConfig].sort((x, y) => x.priority - y.priority);

            for (const sortConfig of lstSortedConfig) {
                let result = 0;
                const aVal = (a as any)[sortConfig.key];
                const bVal = (b as any)[sortConfig.key];

                // Handle different data types
                if (aVal === bVal) {
                    result = 0;
                } else if (aVal == null) {
                    result = 1;
                } else if (bVal == null) {
                    result = -1;
                } else {
                    switch (sortConfig.key) {
                        case "assetType":
                            const aAssetType = assetTypeLabels[a.typeAsset as keyof typeof assetTypeLabels];
                            const bAssetType = assetTypeLabels[b.typeAsset as keyof typeof assetTypeLabels];
                            result = aAssetType.localeCompare(bAssetType, "vi");
                            break;

                        case "unit":
                            const aUnit = a.unit?.name || "";
                            const bUnit = b.unit?.name || "";
                            result = aUnit.localeCompare(bUnit, "vi");
                            break;

                        case "status":
                            const aStatus = statusLabels[a.status as keyof typeof statusLabels];
                            const bStatus = statusLabels[b.status as keyof typeof statusLabels];
                            result = aStatus.localeCompare(bStatus, "vi");
                            break;

                        case "createdAt":
                            result = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                            break;

                        default:
                            result = String(aVal).localeCompare(String(bVal), 'vi', { numeric: true });
                            break;
                    }
                }

                if (sortConfig.order === 'desc') {
                    result = -result;
                }

                if (result !== 0) return result;
            }

            return 0;
        });
    };


    // table
    const [sortConfigs, setSortConfigs] = useState<any[]>([]);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);

    const columns: TableColumn<LiquidationProposal>[] = [
        {
            key: "unit",
            title: "Đơn vị",
            width: "150px",
            minWidth: 100,
            maxWidth: 200,
            render: (_, proposal) => (
                <div className="text-sm font-medium text-gray-900">
                    {proposal.unit?.name}
                </div>
            ),
            sortable: true,
        },
        {
            key: "assetType",
            title: "Loại tài sản đề xuất",
            width: "150px",
            minWidth: 100,
            maxWidth: 200,
            render: (_, proposal) => (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 ">
                    {assetTypeLabels[proposal.typeAsset]}
                </Badge>
            ),
            sortable: true,
        },        
        {
            key: "status",
            title: "Trạng thái",
            width: "150px",
            minWidth: 100,
            maxWidth: 200,
            render: (_, proposal) => (
                <Badge className={`${statusColors[proposal.status]}`}>
                    {statusLabels[proposal.status]}
                </Badge>
            ),
            sortable: true,
        },
        {
            key: "createdAt",
            title: "Ngày đề xuất",
            width: "100px",
            minWidth: 80,
            maxWidth: 150,
            render: (_, proposal) => (
                <div className="text-sm font-medium text-gray-900">
                    {new Date(proposal.createdAt).toLocaleDateString()}
                </div>
            ),
            sortable: true,
        },
        {
            key: "actions",
            title: "Thao tác",
            width: "100px",
            minWidth: 80,
            maxWidth: 120,
            render: (_, proposal) => (
                <div className="flex items-center gap-2">
                    <Link
                        href={`/liquidation/${proposal.id}`}
                        className="px-2 py-2 hover:bg-blue-100 rounded text-blue-600 hover:text-blue-800"
                        title="Xem chi tiết"
                    >
                        <Eye className="h-4 w-4" />
                    </Link>
                    {proposal.status === LiquidationStatus.PROPOSED && user?.roles?.some(role =>
                        ['ADMIN', 'PHONG_QUAN_TRI', 'SUPER_ADMIN'].includes(role.code)
                    ) && (
                            <>
                                <button
                                    onClick={() => handleApprove(proposal.id)}
                                    className="px-2 py-2 hover:bg-green-100 rounded text-green-600 hover:text-green-800"
                                    title="Phê duyệt"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleReject(proposal.id)}
                                    className="px-2 py-2 hover:bg-red-100 rounded text-red-600 hover:text-red-800"
                                    title="Từ chối"
                                >
                                    <XCircle className="h-4 w-4" />
                                </button>
                            </>
                        )}
                </div>
            ),
        },
    ];

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



    const totalPages = Math.ceil(filteredProposals.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProposals = filteredProposals.slice(startIndex, endIndex);



    const getSortIcon = (field: SortField) => {
        const config = sortConfig.find(config => config.field === field);

        if (!config) {
            return <ChevronsUpDown className="h-4 w-4 text-gray-400" />;
        }

        const icon = config.direction === 'asc'
            ? <ChevronUp className="h-4 w-4 text-blue-600" />
            : <ChevronDown className="h-4 w-4 text-blue-600" />;

        // Hiển thị số thứ tự nếu có nhiều hơn 1 cột được sắp xếp
        if (sortConfig.length > 1) {
            return (
                <div className="flex items-center gap-1">
                    {icon}
                    <span className="text-xs bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center">
                        {config.priority}
                    </span>
                </div>
            );
        }

        return icon;
    };

    const handleSortChange = (newSortConfigs: any[]) => {
        console.log('Sort changed:', newSortConfigs);
        setSortConfigs(newSortConfigs);
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

    // Apply advanced filters
    const applyAdvancedFilters = () => {
        let filtered = [...proposals];

        // Apply search filter first
        if (filter.search) {
            const searchTerm = filter.search.toLowerCase();
            filtered = filtered.filter(proposal =>
                proposal.id.toLowerCase().includes(searchTerm) ||
                proposal.reason.toLowerCase().includes(searchTerm) ||
                assetTypeLabels[proposal.typeAsset].toLowerCase().includes(searchTerm) ||
                proposal.unit?.name.toLowerCase().includes(searchTerm)
            );
        }

        // Apply basic filters
        if (filter.status) {
            filtered = filtered.filter(proposal => proposal.status === filter.status);
        }

        if (filter.unitId) {
            filtered = filtered.filter(proposal => proposal.unitId === filter.unitId);
        }

        if (filter.proposerId) {
            filtered = filtered.filter(proposal => proposal.proposerId === filter.proposerId);
        }

        // Apply condition-based filters
        if (filterConditions.length > 0) {
            if (conditionLogic === 'contains') {
                // Tất cả điều kiện phải đúng (AND)
                filterConditions.forEach(condition => {
                    filtered = applyConditionFilter(filtered, condition);
                });
            } else if (conditionLogic === 'equals') {
                // Bất kì điều kiện đúng (OR)
                const originalFiltered = [...filtered];
                let orResults: LiquidationProposal[] = [];
                filterConditions.forEach(condition => {
                    const conditionResults = applyConditionFilter(originalFiltered, condition);
                    orResults = [...orResults, ...conditionResults.filter(proposal =>
                        !orResults.some(existing => existing.id === proposal.id)
                    )];
                });
                filtered = orResults;
            } else if (conditionLogic === 'not_contains') {
                // Không có điều kiện nào đúng
                filterConditions.forEach(condition => {
                    filtered = applyConditionFilter(filtered, condition, true);
                });
            }
        }

        setFilteredProposals(filtered);
        setCurrentPage(1);
    };

    // Helper function to apply single condition
    const applyConditionFilter = (proposals: LiquidationProposal[], condition: FilterCondition, negate = false): LiquidationProposal[] => {
        const fieldOption = filterOptions.find(opt => opt.value === condition.field);

        // Check if condition has value
        let hasValue = false;
        if (fieldOption?.type === 'date') {
            hasValue = !!(condition.dateFrom || condition.dateTo);
        } else if (Array.isArray(condition.value)) {
            hasValue = condition.value.length > 0;
        } else {
            hasValue = !!(condition.value && condition.value !== '');
        }

        if (!hasValue) {
            return proposals;
        }

        const result = proposals.filter(proposal => {
            const fieldValue = (proposal as any)[condition.field];

            // Handle date range filtering
            if (fieldOption?.type === 'date') {
                const proposalDate = new Date(fieldValue);
                const fromDate = condition.dateFrom ? new Date(condition.dateFrom) : null;
                const toDate = condition.dateTo ? new Date(condition.dateTo) : null;

                switch (condition.operator) {
                    case 'contains':
                        if (fromDate && toDate) {
                            return proposalDate >= fromDate && proposalDate <= toDate;
                        } else if (fromDate) {
                            return proposalDate >= fromDate;
                        } else if (toDate) {
                            return proposalDate <= toDate;
                        }
                        return true;
                    case 'equals':
                        if (fromDate && toDate) {
                            return proposalDate >= fromDate && proposalDate <= toDate;
                        } else if (fromDate) {
                            return proposalDate >= fromDate;
                        } else if (toDate) {
                            return proposalDate <= toDate;
                        }
                        return true;
                    case 'not_contains':
                        if (fromDate && toDate) {
                            return !(proposalDate >= fromDate && proposalDate <= toDate);
                        } else if (fromDate) {
                            return proposalDate < fromDate;
                        } else if (toDate) {
                            return proposalDate > toDate;
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

        return negate ? proposals.filter(proposal => !result.includes(proposal)) : result;
    };

    // Reset all filters
    const resetFilters = () => {
        setFilter({});
        setFilterConditions([]);
        setConditionLogic('contains');
        setSortConfig([{ field: 'createdAt', direction: 'desc', priority: 1 }]);
        setCurrentPage(1);
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
                    <Link href="/admin/liquidation/create">
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
            <AdvancedFilter
                title="Bộ lọc nâng cao"
                filterOptions={filterOptions}
                conditions={filterConditions}
                conditionLogic={conditionLogic}
                onConditionsChange={setFilterConditions}
                onConditionLogicChange={setConditionLogic}
                onApply={applyAdvancedFilters}
                onReset={resetFilters}
                className="mb-6"
            />

            {/* Table */}
            <Table
                resizable={true}
                columns={columns}
                multiSort={true}
                data={proposals}
                sortConfigs={sortConfigs}
                onSortChange={handleSortChange}
                emptyText="Không có dữ liệu"
                emptyIcon={<Package2 className="mx-auto h-12 w-12 text-gray-400" />}
                rowKey="id"
                pagination={{
                    current: currentPage,
                    pageSize: itemsPerPage,
                    total: proposals.length,
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
