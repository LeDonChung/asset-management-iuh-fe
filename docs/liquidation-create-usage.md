# Hướng dẫn sử dụng trang Tạo đề xuất thanh lý

## Tổng quan

Trang tạo đề xuất thanh lý đã được cập nhật để hỗ trợ nhận danh sách tài sản từ trang sổ tài sản và hiển thị dưới dạng bảng thay vì card.

## Các tính năng chính

### 1. Nhận dữ liệu từ URL parameters
- `assetIds`: Danh sách ID tài sản được chọn từ trang asset-book (cách nhau bởi dấu phẩy)
- `assetType`: Loại tài sản (TSCD hoặc CCDC)
- `unitId`: ID đơn vị (tùy chọn)

### 2. Form thông tin cơ bản
- **Đơn vị sử dụng**: Dropdown chọn đơn vị (tự động disable nếu user thuộc đơn vị cụ thể)
- **Loại tài sản**: Dropdown chọn TSCD hoặc CCDC (tự động đặt theo URL parameter)
- **Lý do thanh lý**: Textarea nhập lý do chung

### 3. Bảng danh sách tài sản
Hiển thị tài sản đã chọn trong bảng với các cột:
- **Thông tin tài sản**: Tên, mã KT, mã TSCD, vị trí
- **Tình trạng**: Dropdown chọn "Hư hỏng" hoặc "Không thể sử dụng"
- **Lý do cụ thể**: Textarea nhập lý do cho từng tài sản
- **Ảnh minh chứng**: Input upload file
- **Thao tác**: Nút xóa tài sản khỏi danh sách

### 4. Thêm tài sản mới
- Nút "Thêm tài sản" mở modal danh sách tài sản
- Modal chỉ hiển thị tài sản:
  - Cùng loại (TSCD/CCDC) với lựa chọn hiện tại
  - Thuộc đơn vị đã chọn
  - Chưa được thêm vào danh sách
  - Có trạng thái phù hợp để thanh lý

## Cách sử dụng từ trang Asset Book

### 1. Trang Asset Book
```typescript
import { useRouter } from "next/navigation";
import { AssetType } from "@/types/asset";

const handleCreateLiquidationProposal = (selectedAssetIds: string[], assetType: AssetType) => {
    const queryParams = new URLSearchParams({
        assetIds: selectedAssetIds.join(','),
        assetType: assetType,
        // unitId: currentUnitId // nếu có
    });

    router.push(`/admin/liquidation/create?${queryParams.toString()}`);
};
```

### 2. URL Examples
```
/admin/liquidation/create?assetIds=asset1,asset2,asset3&assetType=TSCD
/admin/liquidation/create?assetIds=asset4,asset5&assetType=CCDC&unitId=unit1
```

## Components sử dụng

### UI Components
- `Table` từ `@/components/ui/table` - Hiển thị danh sách tài sản dạng bảng
- `Modal` từ `@/components/ui/modal` - Modal chọn thêm tài sản
- `Button`, `Input`, `Badge` từ `@/components/ui/`

### Types
- `AssetType` - Enum TSCD/CCDC
- `LiquidationProposalItemCondition` - Enum tình trạng tài sản
- `Asset`, `Unit`, `Room` - Interfaces cơ bản

## Validation

### Form validation
- Đơn vị sử dụng: Bắt buộc
- Lý do thanh lý: Bắt buộc
- Danh sách tài sản: Ít nhất 1 tài sản

### Item validation
- Lý do cụ thể cho mỗi tài sản: Bắt buộc

## Workflow

1. User chọn tài sản trong sổ tài sản
2. Nhấn "Tạo đề xuất thanh lý" 
3. Chuyển đến trang create với dữ liệu đã chọn
4. Tài sản được tự động load vào bảng
5. User điền thông tin bổ sung (lý do, tình trạng, ảnh)
6. Có thể thêm tài sản mới qua modal
7. Submit đề xuất thanh lý

## Notes

- Khi thay đổi loại tài sản, danh sách tài sản sẽ được reset
- Modal chỉ hiển thị tài sản cùng loại và cùng đơn vị
- File upload chỉ demo (cần implement upload service thực tế)
- Validation errors hiển thị real-time
