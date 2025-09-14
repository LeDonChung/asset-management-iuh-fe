# Hướng dẫn: Nút Thanh lý và Modal Table trong Liquidation

## Tóm tắt các thay đổi

### 1. **Nút thanh lý trong Asset-Book**
- Thêm nút "Tạo đề xuất thanh lý" xuất hiện khi chọn tài sản
- Nút chỉ hiển thị khi có ít nhất 1 tài sản được chọn
- Kiểm tra tài sản cùng loại trước khi chuyển trang
- Truyền dữ liệu qua URL parameters

### 2. **Modal Table trong Create Liquidation**
- Modal "Thêm tài sản" hiển thị dạng Table thay vì list
- Có checkbox để chọn nhiều tài sản cùng lúc
- Hiển thị số lượng tài sản đã chọn
- Nút "Thêm X tài sản" với số lượng động

## Chi tiết thực hiện

### Asset-Book Page Updates

#### Thêm Import
```typescript
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
```

#### Thêm Function xử lý thanh lý
```typescript
const handleBulkLiquidation = () => {
    if (selectedItems.length === 0) {
        alert('Vui lòng chọn ít nhất một tài sản để thanh lý.');
        return;
    }

    const selectedAssetBookItems = filteredAssetBookItems.filter(item =>
        selectedItems.includes(item.id) && item.asset
    );

    if (selectedAssetBookItems.length === 0) {
        alert('Không có tài sản nào có thể thanh lý.');
        return;
    }

    // Check if all selected assets are of the same type
    const assetTypes = [...new Set(selectedAssetBookItems.map(item => item.asset?.type).filter(Boolean))];
    
    if (assetTypes.length > 1) {
        alert('Vui lòng chỉ chọn tài sản cùng loại (TSCD hoặc CCDC) để thanh lý.');
        return;
    }

    const assetType = assetTypes[0];
    const assetIds = selectedAssetBookItems.map(item => item.asset?.id).filter(Boolean);
    const unitId = selectedBook?.unitId;

    // Navigate to liquidation create page with selected assets
    const queryParams = new URLSearchParams({
        assetIds: assetIds.join(','),
        assetType: assetType || 'TSCD',
        ...(unitId && { unitId })
    });

    router.push(`/admin/liquidation/create?${queryParams.toString()}`);
};
```

#### Cập nhật headerExtra
```typescript
headerExtra={
    selectedItems.length > 0 ? (
        <div className="flex gap-2">
            <Button
                onClick={handleBulkHandover}
                size="sm"
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
            >
                <ArrowRightLeft className="h-4 w-4 mr-1" />
                Tạo yêu cầu bàn giao
            </Button>
            <Button
                onClick={handleBulkLiquidation}
                size="sm"
                className="flex items-center bg-red-600 hover:bg-red-700 text-white"
            >
                <Trash2 className="h-4 w-4 mr-1" />
                Tạo đề xuất thanh lý
            </Button>
        </div>
    ) : null
}
```

### Create Liquidation Page Updates

#### Thêm State cho modal
```typescript
const [selectedAssetsInModal, setSelectedAssetsInModal] = useState<string[]>([]);
```

#### Thêm function cho việc chọn nhiều tài sản
```typescript
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
```

#### Thêm Table Columns cho modal
```typescript
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
```

#### Cập nhật Modal content
```typescript
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
```

## Demo Components

### AssetBookDemo Component
- Minh họa cách thêm nút thanh lý vào asset-book
- Có validation và navigation
- Hiển thị số lượng tài sản đã chọn

### Demo Page
- Trang `/admin/demo/liquidation` để test tính năng
- Hiển thị quy trình complete từ asset-book đến create
- Có hướng dẫn sử dụng chi tiết

## Cách sử dụng

### Từ Asset-Book
1. Chọn tài sản cần thanh lý bằng checkbox
2. Nút "Tạo đề xuất thanh lý" sẽ xuất hiện
3. Click nút để chuyển sang trang create với tài sản đã chọn

### Từ Create Liquidation
1. Tài sản từ asset-book sẽ tự động load vào bảng
2. Có thể thêm tài sản mới qua nút "Thêm tài sản"
3. Modal hiển thị table với checkbox để chọn nhiều tài sản
4. Điền thông tin và submit đề xuất

## Testing

### Test URL Parameters
```
/admin/liquidation/create?assetIds=asset1,asset2,asset3&assetType=TSCD&unitId=unit1
```

### Test Cases
- [ ] Chọn tài sản trong asset-book và chuyển sang create
- [ ] Modal table với checkbox hoạt động đúng
- [ ] Validation tài sản cùng loại
- [ ] Thêm nhiều tài sản cùng lúc
- [ ] Reset state khi đóng modal
- [ ] Hiển thị số lượng tài sản đã chọn

## Files Created/Modified

### New Files
- `src/components/examples/AssetBookDemo.tsx` - Demo component
- `src/app/(admin)/demo/liquidation/page.tsx` - Demo page
- `docs/liquidation-button-guide.md` - Documentation

### Modified Files
- `src/app/(admin)/liquidation/create/page.tsx` - Updated modal
- `src/app/(admin)/asset/asset-book/page.tsx` - Added liquidation button (needs manual integration)

## Next Steps

1. Integrate liquidation button into actual asset-book page
2. Test with real data
3. Add permission checks for liquidation feature
4. Consider adding bulk actions menu for other operations
