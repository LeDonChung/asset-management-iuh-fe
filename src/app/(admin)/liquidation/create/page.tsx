"use client";

import React, { useState, useEffect } from "react";
import {
    Plus,
    Trash2,
    Upload,
    AlertTriangle,
    Save,
    ArrowLeft,
    Search,
    X
} from "lucide-react";
import Link from "next/link";
import {
    Asset,
    AssetType,
    LiquidationProposalItemCondition,
    AssetStatus,
    Unit,
    Room
} from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableColumn } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/contexts/AuthContext";
import { mockAssets, mockUnits, mockRooms } from "@/lib/mockData";
import { useRouter, useSearchParams } from "next/navigation";

interface LiquidationItem {
    id: string;
    assetId: string;
    asset?: Asset;
    reason: string;
    condition: LiquidationProposalItemCondition;
    mediaUrl?: string;
}

interface CreateProposalForm {
    unitId: string;
    reason: string;
    assetType: AssetType;
    items: LiquidationItem[];
}

const conditionLabels = {
    [LiquidationProposalItemCondition.DAMAGED]: "Hư hỏng",
    [LiquidationProposalItemCondition.UNUSABLE]: "Không thể sử dụng",
};

const conditionColors = {
    [LiquidationProposalItemCondition.DAMAGED]: "bg-red-100 text-red-800",
    [LiquidationProposalItemCondition.UNUSABLE]: "bg-orange-100 text-orange-800",
};

export default function CreateLiquidationProposalPage() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Get initial data from URL params
    const selectedAssetIds = searchParams.get('assetIds')?.split(',').filter(Boolean) || [];
    const initialAssetType = searchParams.get('assetType') as AssetType || AssetType.TSCD;
    
    const [form, setForm] = useState<CreateProposalForm>({
        unitId: "",
        reason: "",
        assetType: initialAssetType,
        items: []
    });
    const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
    const [showAssetModal, setShowAssetModal] = useState(false);
    const [assetSearch, setAssetSearch] = useState("");
    const [selectedAssetsInModal, setSelectedAssetsInModal] = useState<string[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load available assets for liquidation
    useEffect(() => {
        console.log('Loading assets with form.assetType:', form.assetType);
        console.log('Total mockAssets:', mockAssets.length);
        console.log('AssetTypes in mockAssets:', [...new Set(mockAssets.map(a => a.type))]);
        
        const allEligibleAssets = mockAssets.filter((asset: Asset) =>
            asset.status === AssetStatus.HU_HONG ||
            asset.status === AssetStatus.DE_XUAT_THANH_LY ||
            asset.status === AssetStatus.DANG_SU_DUNG
        );
        console.log('Eligible assets (by status):', allEligibleAssets.length);
        
        const assetsByType = allEligibleAssets.filter((asset: Asset) => asset.type === form.assetType);
        console.log(`Assets with type ${form.assetType}:`, assetsByType.length);
        
        const assets = assetsByType.map((asset: Asset) => {
            const room = mockRooms.find((room: Room) => room.id === asset.currentRoomId);
            const unitInfo = mockUnits.find((unit: Unit) => unit.id === room?.unitId);
            console.log(`Asset ${asset.name}: room=${room?.id}, unit=${unitInfo?.id || 'NO_UNIT'}`);
            return {
                ...asset,
                room,
                unitInfo
            };
        });

        console.log('Final processed assets:', assets.length);
        console.log('Assets with unit info:', assets.filter(a => a.unitInfo).length);
        setAvailableAssets(assets);

        // Set default unit if user belongs to a specific unit
        if (user?.unitId && !form.unitId) {
            console.log('Setting default unit from user:', user.unitId);
            setForm(prev => ({ ...prev, unitId: user.unitId! }));
        }
    }, [user, form.assetType]);

    // Load pre-selected assets from URL params (only once)
    useEffect(() => {
        if (selectedAssetIds.length > 0 && form.items.length === 0) {
            const assets = mockAssets.filter((asset: Asset) =>
                selectedAssetIds.includes(asset.id) &&
                asset.type === form.assetType
            ).map((asset: Asset) => {
                const room = mockRooms.find((room: Room) => room.id === asset.currentRoomId);
                return {
                    ...asset,
                    room,
                    unitInfo: mockUnits.find((unit: Unit) => unit.id === room?.unitId)
                };
            });

            const initialItems = assets.map(asset => ({
                id: `temp-${Date.now()}-${asset.id}`,
                assetId: asset.id,
                asset,
                reason: "",
                condition: LiquidationProposalItemCondition.DAMAGED,
                mediaUrl: ""
            }));
            
            if (initialItems.length > 0) {
                setForm(prev => ({
                    ...prev,
                    items: initialItems
                }));
            }
        }
    }, [selectedAssetIds, form.assetType]); // Remove form.items dependency to prevent loop

    const filteredAssets = availableAssets.filter((asset: Asset) => {
        // Don't show assets already in the proposal
        if (form.items.some(item => item.assetId === asset.id)) {
            return false;
        }

        // Filter by asset type
        if (asset.type !== form.assetType) {
            return false;
        }

        // Search filter
        const searchLower = assetSearch.toLowerCase();
        const matchesSearch = !assetSearch || 
            asset.name.toLowerCase().includes(searchLower) ||
            asset.ktCode.toLowerCase().includes(searchLower) ||
            asset.fixedCode.toLowerCase().includes(searchLower);

        if (!matchesSearch) {
            return false;
        }

        // Unit filter - only apply if unit is selected
        if (form.unitId) {
            const assetUnitId = (asset as any).unitInfo?.id;
            if (assetUnitId !== form.unitId) {
                return false;
            }
        }

        return true;
    });

    // Debug logging
    console.log('Filter debug:', {
        availableAssets: availableAssets.length,
        filteredAssets: filteredAssets.length,
        formUnitId: form.unitId,
        formAssetType: form.assetType,
        searchQuery: assetSearch,
        itemsInProposal: form.items.length
    });

    const addAssetToProposal = (asset: Asset) => {
        const newItem: LiquidationItem = {
            id: `temp-${Date.now()}`,
            assetId: asset.id,
            asset,
            reason: "",
            condition: LiquidationProposalItemCondition.DAMAGED,
            mediaUrl: ""
        };

        setForm(prev => ({
            ...prev,
            items: [...prev.items, newItem]
        }));

        setShowAssetModal(false);
        setAssetSearch("");
    };

    const addMultipleAssetsToProposal = () => {
        if (selectedAssetsInModal.length === 0) {
            alert('Vui lòng chọn ít nhất một tài sản');
            return;
        }

        const assetsToAdd = availableAssets.filter(asset => 
            selectedAssetsInModal.includes(asset.id)
        );

        const newItems: LiquidationItem[] = assetsToAdd.map(asset => ({
            id: `temp-${Date.now()}-${asset.id}`,
            assetId: asset.id,
            asset,
            reason: "",
            condition: LiquidationProposalItemCondition.DAMAGED,
            mediaUrl: ""
        }));

        setForm(prev => ({
            ...prev,
            items: [...prev.items, ...newItems]
        }));

        setSelectedAssetsInModal([]);
        setShowAssetModal(false);
        setAssetSearch("");
    };

    const removeAssetFromProposal = (itemId: string) => {
        setForm(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== itemId)
        }));
    };

    const updateItem = (itemId: string, field: keyof LiquidationItem, value: any) => {
        setForm(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === itemId ? { ...item, [field]: value } : item
            )
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!form.unitId) {
            newErrors.unitId = "Vui lòng chọn đơn vị";
        }

        if (!form.reason.trim()) {
            newErrors.reason = "Vui lòng nhập lý do thanh lý";
        }

        if (form.items.length === 0) {
            newErrors.items = "Vui lòng chọn ít nhất một tài sản để thanh lý";
        }

        // Validate each item
        form.items.forEach((item, index) => {
            if (!item.reason.trim()) {
                newErrors[`item-${index}-reason`] = "Vui lòng nhập lý do cho tài sản này";
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Here you would typically call your API
            console.log("Creating liquidation proposal:", form);

            // Redirect to liquidation list
            router.push("/liquidation");
        } catch (error) {
            console.error("Error creating proposal:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Define table columns for liquidation items
    const tableColumns: TableColumn<LiquidationItem>[] = [
        {
            key: "asset",
            title: "Thông tin tài sản",
            render: (_, item) => (
                <div>
                    <div className="font-medium text-gray-900">{item.asset?.name}</div>
                    <div className="text-sm text-gray-600">
                        Mã KT: {item.asset?.ktCode} | Mã TSCD: {item.asset?.fixedCode}
                    </div>
                    <div className="text-sm text-gray-600">
                        Vị trí: {item.asset?.room?.roomNumber || "Chưa xác định"} - {(item.asset as any)?.unitInfo?.name || "N/A"}
                    </div>
                </div>
            ),
            width: "150px",
            minWidth: 250,
            maxWidth: 400
        },
        {
            key: "condition",
            title: "Tình trạng",
            render: (_, item, index) => (
                <select
                    value={item.condition}
                    onChange={(e) => updateItem(item.id, 'condition', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {Object.entries(conditionLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            ),
            width: "100px",
            minWidth: 100,
            maxWidth: 150
        },
        {
            key: "reason",
            title: "Lý do cụ thể",
            render: (_, item, index) => (
                <div>
                    <textarea
                        value={item.reason}
                        onChange={(e) => updateItem(item.id, 'reason', e.target.value)}
                        rows={3}
                        placeholder="Mô tả chi tiết tình trạng và lý do thanh lý..."
                        className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[`item-${index}-reason`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors[`item-${index}-reason`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`item-${index}-reason`]}</p>
                    )}
                </div>
            ),
            width: "250px",
            minWidth: 250,
            maxWidth: 400
        },
        {
            key: "media",
            title: "Ảnh minh chứng",
            render: (_, item) => (
                <div className="flex items-center gap-2">
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                updateItem(item.id, 'mediaUrl', URL.createObjectURL(file));
                            }
                        }}
                        className="flex-1"
                    />
                </div>
            ),
            width: "130px",
            minWidth: 80,
            maxWidth: 120
        },
        {
            key: "actions",
            title: "Thao tác",
            render: (_, item) => (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeAssetFromProposal(item.id)}
                    className="text-red-600 hover:bg-red-50"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            ),
            width: "70px",
            minWidth: 100,
            maxWidth: 150
        }
    ];

    // Define table columns for asset selection modal
    const modalTableColumns: TableColumn<Asset>[] = [
        {
            key: "info",
            title: "Thông tin tài sản",
            render: (_, asset) => (
                <div>
                    <div className="font-medium text-gray-900">{asset.name}</div>
                    <div className="text-sm text-gray-600">
                        Mã KT: {asset.ktCode} | Mã TSCD: {asset.fixedCode}
                    </div>
                    <div className="text-sm text-gray-600">
                        Vị trí: {asset.room?.roomNumber || "Chưa xác định"} - {(asset as any)?.unitInfo?.name || "N/A"}
                    </div>
                </div>
            ),
            width: "60%"
        },
        {
            key: "type",
            title: "Loại",
            render: (_, asset) => (
                <Badge className="bg-purple-100 text-purple-800">
                    {asset.type === AssetType.TSCD ? "TSCD" : "CCDC"}
                </Badge>
            ),
            width: "15%"
        },
        {
            key: "status",
            title: "Trạng thái",
            render: (_, asset) => (
                <Badge className="bg-blue-100 text-blue-800">
                    {asset.status === AssetStatus.HU_HONG ? "Hư hỏng" :
                        asset.status === AssetStatus.DE_XUAT_THANH_LY ? "Đề xuất thanh lý" :
                            "Đang sử dụng"}
                </Badge>
            ),
            width: "25%"
        }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/liquidation">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Tạo đề xuất thanh lý</h1>
                    <p className="text-gray-600 mt-2">
                        Lập danh sách các tài sản cần thanh lý và gửi yêu cầu phê duyệt
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Thông tin cơ bản</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Đơn vị sử dụng *
                            </label>
                            <select
                                value={form.unitId}
                                onChange={(e) => setForm(prev => ({ ...prev, unitId: e.target.value }))}
                                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.unitId ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                disabled={!!user?.unitId} // Disable if user belongs to specific unit
                            >
                                <option value="">Chọn đơn vị</option>
                                {mockUnits.map((unit: Unit) => (
                                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                                ))}
                            </select>
                            {errors.unitId && (
                                <p className="text-red-500 text-sm mt-1">{errors.unitId}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Loại tài sản *
                            </label>
                            <select
                                value={form.assetType}
                                onChange={(e) => setForm(prev => ({ ...prev, assetType: e.target.value as AssetType, items: [] }))}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value={AssetType.TSCD}>Tài sản cố định (TSCD)</option>
                                <option value={AssetType.CCDC}>Công cụ dụng cụ (CCDC)</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lý do thanh lý *
                        </label>
                        <textarea
                            value={form.reason}
                            onChange={(e) => setForm(prev => ({ ...prev, reason: e.target.value }))}
                            rows={4}
                            placeholder="Nhập lý do cần thanh lý tài sản..."
                            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.reason ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.reason && (
                            <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
                        )}
                    </div>
                </div>

                {/* Asset Table */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Danh sách tài sản thanh lý</h2>
                        <Button
                            type="button"
                            onClick={() => setShowAssetModal(true)}
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Thêm tài sản
                        </Button>
                    </div>

                    {errors.items && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                            <p className="text-red-600 text-sm">{errors.items}</p>
                        </div>
                    )}

                    {form.items.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có tài sản nào</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {selectedAssetIds.length > 0 
                                    ? "Đang tải tài sản được chọn từ sổ tài sản..." 
                                    : 'Nhấn "Thêm tài sản" để bắt đầu'
                                }
                            </p>
                        </div>
                    ) : (
                        <Table
                            columns={tableColumns}
                            data={form.items}
                            rowKey="id"
                            className="border border-gray-200 rounded-lg"
                        />
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <Link href="/liquidation">
                        <Button type="button" variant="outline">Hủy</Button>
                    </Link>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2"
                    >
                        <Save className="h-4 w-4" />
                        {isSubmitting ? "Đang gửi..." : "Gửi đề xuất"}
                    </Button>
                </div>
            </form>

            {/* Asset Selection Modal */}
            <Modal
                isOpen={showAssetModal}
                onClose={() => {
                    setShowAssetModal(false);
                    setSelectedAssetsInModal([]);
                    setAssetSearch("");
                }}
                title={`Chọn tài sản ${form.assetType === AssetType.TSCD ? 'cố định (TSCD)' : 'công cụ dụng cụ (CCDC)'} cần thanh lý`}
                size="xl"
            >
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Tìm kiếm tài sản..."
                            value={assetSearch}
                            onChange={(e) => setAssetSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Debug info */}
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded flex justify-between items-center">
                        <span>Available: {availableAssets.length} | Filtered: {filteredAssets.length} | Type: {form.assetType} | Unit: {form.unitId || 'All'}</span>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                console.log('Refreshing assets...');
                                setForm(prev => ({ ...prev, assetType: prev.assetType })); // Trigger useEffect
                            }}
                            className="text-xs h-6"
                        >
                            Refresh
                        </Button>
                    </div>

                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                        {filteredAssets.length === 0 ? (
                            <div className="text-center py-8">
                                <AlertTriangle className="mx-auto h-8 w-8 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-600">
                                    Không tìm thấy tài sản phù hợp
                                </p>
                                <div className="mt-4 text-xs text-gray-400 space-y-1">
                                    <p><strong>Debug info:</strong></p>
                                    <p>• Total available assets: {availableAssets.length}</p>
                                    <p>• Selected unit: {form.unitId || 'None'}</p>
                                    <p>• Asset type: {form.assetType}</p>
                                    <p>• Search query: {assetSearch || 'None'}</p>
                                    <p>• Items in proposal: {form.items.length}</p>
                                    {availableAssets.length > 0 && (
                                        <div className="mt-2">
                                            <p><strong>Sample assets:</strong></p>
                                            {availableAssets.slice(0, 3).map((asset, idx) => (
                                                <p key={idx}>• {asset.name} ({asset.type}) - Unit: {(asset as any).unitInfo?.id || 'No unit'}</p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {form.unitId && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-3"
                                        onClick={() => setForm(prev => ({ ...prev, unitId: "" }))}
                                    >
                                        Bỏ filter đơn vị để xem tất cả
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <Table
                                columns={modalTableColumns}
                                data={filteredAssets}
                                rowKey="id"
                                rowSelection={{
                                    selectedRowKeys: selectedAssetsInModal,
                                    onChange: (selectedRowKeys) => {
                                        setSelectedAssetsInModal(selectedRowKeys);
                                    },
                                }}
                                pagination={false}
                                className="border-0"
                            />
                        )}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-sm text-gray-600">
                            {selectedAssetsInModal.length > 0 && (
                                <span>Đã chọn {selectedAssetsInModal.length} tài sản</span>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowAssetModal(false);
                                    setSelectedAssetsInModal([]);
                                    setAssetSearch("");
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={addMultipleAssetsToProposal}
                                disabled={selectedAssetsInModal.length === 0}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Thêm {selectedAssetsInModal.length > 0 ? `${selectedAssetsInModal.length} ` : ''}tài sản
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
