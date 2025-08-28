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
    LiquidationProposalItemCondition,
    AssetStatus,
    Unit,
    Room
} from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { mockAssets, mockUnits, mockRooms } from "@/lib/mockData";
import { useRouter } from "next/navigation";

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
    const [form, setForm] = useState<CreateProposalForm>({
        unitId: "",
        reason: "",
        items: []
    });
    const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
    const [showAssetModal, setShowAssetModal] = useState(false);
    const [assetSearch, setAssetSearch] = useState("");
    const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load available assets for liquidation
    useEffect(() => {
        const assets = mockAssets.filter((asset: Asset) =>
            asset.status === AssetStatus.HU_HONG ||
            asset.status === AssetStatus.DE_XUAT_THANH_LY ||
            asset.status === AssetStatus.DANG_SU_DUNG
        ).map((asset: Asset) => {
            const room = mockRooms.find((room: Room) => room.id === asset.currentRoomId);
            return {
                ...asset,
                room,
                unitInfo: mockUnits.find((unit: Unit) => unit.id === room?.unitId)
            };
        });

        setAvailableAssets(assets);

        // Set default unit if user belongs to a specific unit
        if (user?.unitId) {
            setForm(prev => ({ ...prev, unitId: user.unitId! }));
        }
    }, [user]);

    const filteredAssets = availableAssets.filter((asset: Asset) =>
        !form.items.some(item => item.assetId === asset.id) &&
        (asset.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
            asset.ktCode.toLowerCase().includes(assetSearch.toLowerCase()) ||
            asset.fixedCode.toLowerCase().includes(assetSearch.toLowerCase()))
    );

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

        setSelectedAssets([]);
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
                <div className="bg-white p-6 rounded-lg shadow border">
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

                {/* Asset Selection */}
                <div className="bg-white p-6 rounded-lg shadow border">
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
                            <p className="mt-1 text-sm text-gray-500">Nhấn "Thêm tài sản" để bắt đầu</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {form.items.map((item, index) => (
                                <div key={item.id} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{item.asset?.name}</h4>
                                            <p className="text-sm text-gray-600">
                                                Mã KT: {item.asset?.ktCode} | Mã TSCD: {item.asset?.fixedCode}
                                            </p>
                                            <Badge className={`mt-1 ${conditionColors[item.condition]}`}>
                                                {conditionLabels[item.condition]}
                                            </Badge>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeAssetFromProposal(item.id)}
                                            className="text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tình trạng tài sản *
                                            </label>
                                            <select
                                                value={item.condition}
                                                onChange={(e) => updateItem(item.id, 'condition', e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                {Object.entries(conditionLabels).map(([value, label]) => (
                                                    <option key={value} value={value}>{label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Ảnh minh chứng
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            // In real app, you would upload to server and get URL
                                                            updateItem(item.id, 'mediaUrl', URL.createObjectURL(file));
                                                        }
                                                    }}
                                                    className="flex-1"
                                                />
                                                <Upload className="h-4 w-4 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Lý do cụ thể cho tài sản này *
                                        </label>
                                        <textarea
                                            value={item.reason}
                                            onChange={(e) => updateItem(item.id, 'reason', e.target.value)}
                                            rows={3}
                                            placeholder="Mô tả chi tiết tình trạng và lý do thanh lý tài sản này..."
                                            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`item-${index}-reason`] ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        {errors[`item-${index}-reason`] && (
                                            <p className="text-red-500 text-sm mt-1">{errors[`item-${index}-reason`]}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <Link href="/admin/liquidation">
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
            {showAssetModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full m-4 max-h-[80vh] overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-lg font-semibold">Chọn tài sản cần thanh lý</h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowAssetModal(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="p-6">
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Tìm kiếm tài sản..."
                                        value={assetSearch}
                                        onChange={(e) => setAssetSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="max-h-96 overflow-y-auto">
                                <div className="grid grid-cols-1 gap-3">
                                    {filteredAssets.map((asset: Asset) => (
                                        <div
                                            key={asset.id}
                                            className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                                            onClick={() => addAssetToProposal(asset)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-medium">{asset.name}</h4>
                                                    <p className="text-sm text-gray-600">
                                                        Mã KT: {asset.ktCode} | Mã TSCD: {asset.fixedCode}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Vị trí: {asset.room?.roomNumber || "Chưa xác định"} - {(asset as any).unitInfo?.name || "N/A"}
                                                    </p>
                                                </div>
                                                <Badge className="bg-blue-100 text-blue-800">
                                                    {asset.status === AssetStatus.HU_HONG ? "Hư hỏng" :
                                                        asset.status === AssetStatus.DE_XUAT_THANH_LY ? "Đề xuất thanh lý" :
                                                            "Đang sử dụng"}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {filteredAssets.length === 0 && (
                                    <div className="text-center py-8">
                                        <AlertTriangle className="mx-auto h-8 w-8 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-600">
                                            Không tìm thấy tài sản phù hợp
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
