"use client";

import React from "react";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableColumn } from "@/components/ui/table";
import { Asset, AssetBookItem } from "@/types/asset";
import { AssetActionStatus } from "@/lib/api/inventoryApi";

interface AssetTableCardProps {
  assets: AssetBookItem[];
  inventoryResults: { [key: string]: any };
  isViewingSubmittedResults: boolean;
  onQuantityUpdate: (assetId: string, quantity: number) => void;
  onActionClick: (asset: Asset, actionType: "LIQUIDATION" | "REPAIR") => void;
  onViewResult: (asset: Asset) => void;
}

export default function AssetTableCard({
  assets,
  inventoryResults,
  isViewingSubmittedResults,
  onQuantityUpdate,
  onActionClick,
  onViewResult,
}: AssetTableCardProps) {
  // Get status based on quantity comparison
  const getAssetStatus = (systemQuantity: number, countedQuantity: number, actionStatus?: AssetActionStatus) => {
    // If there's an action status (LIQUIDATION_PROPOSED, NEEDS_REPAIR), use that
    if (actionStatus === AssetActionStatus.LIQUIDATION_PROPOSED) {
      return {
        status: "LIQUIDATION_PROPOSED",
        color: "bg-purple-100 text-purple-800 border-purple-200",
        text: "Đề xuất thanh lý",
      };
    } else if (actionStatus === AssetActionStatus.NEEDS_REPAIR) {
      return {
        status: "NEEDS_REPAIR",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        text: "Cần sửa chữa",
      };
    }
    
    // Otherwise, use quantity-based status
    if (countedQuantity === systemQuantity) {
      return {
        status: "MATCHED",
        color: "bg-green-100 text-green-800 border-green-200",
        text: "Khớp",
      };
    } else if (countedQuantity > systemQuantity) {
      return {
        status: "EXCESS",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        text: "Thừa",
      };
    } else {
      return {
        status: "MISSING",
        color: "bg-orange-100 text-orange-800 border-orange-200",
        text: "Thiếu",
      };
    }
  };

  // Render mobile asset card
  const renderMobileAssetCard = (item: AssetBookItem, index: number) => {
    const result = inventoryResults[item.assetId];
    const countedQuantity = result?.quantity || 0;
    const assetStatus = getAssetStatus(item.quantity, countedQuantity, result?.status);

    return (
      <div
        key={item.id}
        className="border border-gray-200 rounded-lg p-4 space-y-4 bg-white"
      >
        {/* Asset Header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="border rounded-lg p-3 bg-gray-50">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Mã kế toán
                </label>
                <p className="font-semibold text-gray-900 font-mono mt-1">
                  {item.asset?.ktCode}
                </p>
              </div>
            </div>
            <Badge className={`ml-3 flex-shrink-0 border ${assetStatus.color}`}>
              {assetStatus.text}
            </Badge>
          </div>

          <div className="border rounded-lg p-3 bg-gray-50">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Tên tài sản
            </label>
            <p className="text-gray-900 font-medium mt-1">{item.asset?.name}</p>
          </div>

          {item.asset?.specs && (
            <div className="border rounded-lg p-3 bg-gray-50">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Thông số kỹ thuật
              </label>
              <p className="text-sm text-gray-700 mt-1 truncate">
                {item.asset.specs}
              </p>
            </div>
          )}
        </div>

        {/* Quantity Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-3 bg-blue-50">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              SL sổ tài sản
            </label>
            <div className="text-blue-700 font-bold text-lg mt-1">
              {item.quantity}
            </div>
          </div>
          <div className="border rounded-lg p-3 bg-green-50">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              SL kiểm kê
            </label>
            {isViewingSubmittedResults ? (
              <div className="text-green-700 font-bold text-lg mt-1">
                {countedQuantity}
              </div>
            ) : (
              <Input
                type="number"
                value={countedQuantity}
                onChange={(e) =>
                  onQuantityUpdate(
                    item.assetId,
                    parseInt(e.target.value) || 0
                  )
                }
                className="w-full text-center text-sm h-8 mt-1 border-green-200 focus:border-green-400"
                min="0"
              />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 justify-end pt-2 border-t border-gray-100">
          {isViewingSubmittedResults ? (
            <Button
              onClick={() => onViewResult(item.asset as Asset)}
              variant="outline"
              size="sm"
              className="text-green-600 hover:text-green-800 border-green-200 hover:border-green-300"
            >
              <Eye className="h-4 w-4 mr-1" />
              Xem kết quả
            </Button>
          ) : (
            <>
              <Button
                onClick={() =>
                  onActionClick(item.asset as Asset, "LIQUIDATION")
                }
                variant="outline"
                size="sm"
                className="text-purple-600 hover:text-purple-800 border-purple-200 hover:border-purple-300"
              >
                Thanh lý
              </Button>
              <Button
                onClick={() => onActionClick(item.asset as Asset, "REPAIR")}
                variant="outline"
                size="sm"
                className="text-orange-600 hover:text-orange-800 border-orange-200 hover:border-orange-300"
              >
                Sửa chữa
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  // Desktop table columns
  const columns: TableColumn<AssetBookItem>[] = [
    {
      key: "assetInfo",
      title: "Thông tin tài sản",
      width: "300px",
      render: (_, record) => (
        <div className="space-y-2">
          <div className="border rounded-lg p-3 bg-gray-50">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Mã kế toán
            </label>
            <div className="font-medium text-gray-900 font-mono mt-1">
              {record.asset?.ktCode}
            </div>
          </div>
          <div className="border rounded-lg p-3 bg-gray-50">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Tên tài sản
            </label>
            <div className="text-sm text-gray-700 mt-1">
              {record.asset?.name}
            </div>
          </div>
          {record.asset?.specs && (
            <div className="text-xs text-gray-500 truncate">
              {record.asset.specs}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "quantity",
      title: "SL sổ tài sản",
      width: "120px",
      className: "text-center",
      render: (_, record) => (
        <div className="border rounded-lg p-3 bg-blue-50 text-center">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide block">
            Số lượng
          </label>
          <span className="text-blue-700 font-bold text-lg">
            {record.quantity}
          </span>
        </div>
      ),
    },
    {
      key: "countedQuantity",
      title: "SL kiểm kê",
      width: "120px",
      className: "text-center",
      render: (_, record) => (
        <div className="border rounded-lg p-3 bg-green-50 text-center">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide block">
            Kiểm kê
          </label>
          {isViewingSubmittedResults ? (
            <span className="text-green-700 font-bold text-lg">
              {inventoryResults[record.assetId]?.quantity || 0}
            </span>
          ) : (
            <Input
              type="number"
              value={inventoryResults[record.assetId]?.quantity || 0}
              onChange={(e) =>
                onQuantityUpdate(
                  record.assetId,
                  parseInt(e.target.value) || 0
                )
              }
              className="w-20 text-center border-green-200 focus:border-green-400 mt-1"
              min="0"
            />
          )}
        </div>
      ),
    },
    {
      key: "status",
      title: "Trạng thái",
      width: "120px",
      className: "text-center",
      render: (_, record) => {
        const result = inventoryResults[record.assetId];
        const countedQuantity = result?.quantity || 0;
        const assetStatus = getAssetStatus(record.quantity, countedQuantity, result?.status);
        return (
          <Badge className={`border ${assetStatus.color}`}>
            {assetStatus.text}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      title: "Thao tác",
      width: "150px",
      className: "text-center",
      render: (_, record) => (
        <div className="flex items-center gap-2 justify-center">
          {isViewingSubmittedResults ? (
            <Button
              onClick={() => onViewResult(record.asset as Asset)}
              variant="outline"
              size="sm"
              className="text-green-600 hover:text-green-800 border-green-200 hover:border-green-300"
            >
              <Eye className="h-4 w-4 mr-1" />
              Xem
            </Button>
          ) : (
            <>
              <Button
                onClick={() =>
                  onActionClick(record.asset as Asset, "LIQUIDATION")
                }
                variant="outline"
                size="sm"
                className="text-purple-600 hover:text-purple-800 border-purple-200 hover:border-purple-300"
              >
                Thanh lý
              </Button>
              <Button
                onClick={() => onActionClick(record.asset as Asset, "REPAIR")}
                variant="outline"
                size="sm"
                className="text-orange-600 hover:text-orange-800 border-orange-200 hover:border-orange-300"
              >
                Sửa chữa
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 md:px-6 py-4 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-900">
          Danh sách tài sản ({assets.length})
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {isViewingSubmittedResults 
            ? "Xem kết quả kiểm kê đã hoàn thành" 
            : "Nhập số lượng kiểm kê và thực hiện các thao tác"
          }
        </p>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6">
        {assets.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-lg mb-2">Không có tài sản</div>
            <div className="text-sm text-gray-500">
              Không tìm thấy tài sản nào trong phòng này
            </div>
          </div>
        ) : (
          <>
            {/* Mobile view */}
            <div className="md:hidden space-y-4">
              {assets.map((asset, index) => renderMobileAssetCard(asset, index))}
            </div>

            {/* Desktop view */}
            <div className="hidden md:block">
              <Table
                columns={columns}
                data={assets}
                rowKey="id"
                className="border-0"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
