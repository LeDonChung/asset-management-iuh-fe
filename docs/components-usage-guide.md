# Hướng dẫn sử dụng các Component chính

## 📋 Mục lục
1. [Table Component](#table-component)
2. [AdvancedFilter Component](#advancedfilter-component)
3. [HandoverForm Component](#handoverform-component)
4. [Pagination Component](#pagination-component)

---

## 🗂️ Table Component

### Mô tả
Component `Table` là một bảng dữ liệu có thể tái sử dụng với các tính năng nâng cao như sorting, selection, pagination và custom rendering.

### Props

```typescript
interface TableProps<T = any> {
  columns: TableColumn<T>[];           // Định nghĩa các cột
  data: T[];                          // Dữ liệu hiển thị
  loading?: boolean;                  // Trạng thái loading
  emptyText?: string;                 // Text khi không có dữ liệu
  emptyIcon?: React.ReactNode;        // Icon khi không có dữ liệu
  className?: string;                 // CSS class tùy chỉnh
  rowKey?: string | ((record: T) => string); // Key cho mỗi row
  onRowClick?: (record: T, index: number) => void; // Xử lý click row
  rowClassName?: string | ((record: T, index: number) => string); // CSS class cho row
  pagination?: PaginationProps;       // Cấu hình pagination
  rowSelection?: RowSelectionProps;   // Cấu hình selection
}
```

### Cách sử dụng

```tsx
import { Table, TableColumn } from "@/components/ui/table";

// Định nghĩa columns
const columns: TableColumn<Asset>[] = [
  {
    key: "name",
    title: "Tên tài sản",
    render: (value, record) => (
      <div className="font-medium">{value}</div>
    )
  },
  {
    key: "status",
    title: "Trạng thái",
    render: (value) => (
      <Badge className={getStatusColor(value)}>
        {getStatusLabel(value)}
      </Badge>
    )
  },
  {
    key: "actions",
    title: "Thao tác",
    render: (_, record) => (
      <div className="flex space-x-2">
        <Button size="sm" onClick={() => handleEdit(record)}>
          Sửa
        </Button>
        <Button size="sm" variant="destructive" onClick={() => handleDelete(record)}>
          Xóa
        </Button>
      </div>
    )
  }
];

// Sử dụng component
<Table
  columns={columns}
  data={assets}
  loading={isLoading}
  rowKey="id"
  onRowClick={(record) => handleRowClick(record)}
  pagination={{
    current: currentPage,
    pageSize: pageSize,
    total: totalItems,
    onChange: handlePageChange
  }}
  rowSelection={{
    selectedRowKeys: selectedIds,
    onChange: handleSelectionChange
  }}
/>
```

### Tính năng chính

- ✅ **Responsive Design**: Tự động scroll ngang trên mobile
- ✅ **Row Selection**: Chọn nhiều dòng với checkbox
- ✅ **Custom Rendering**: Tùy chỉnh hiển thị từng cột
- ✅ **Loading State**: Hiển thị skeleton khi đang tải
- ✅ **Empty State**: Giao diện khi không có dữ liệu
- ✅ **Row Click**: Xử lý sự kiện click vào dòng
- ✅ **Pagination**: Tích hợp sẵn pagination

---

## 🔍 AdvancedFilter Component

### Mô tả
Component `AdvancedFilter` cung cấp giao diện lọc dữ liệu nâng cao với nhiều điều kiện, logic phức tạp và giao diện thân thiện.

### Props

```typescript
interface AdvancedFilterProps {
  title?: string;                     // Tiêu đề bộ lọc
  filterOptions: FilterOption[];      // Danh sách các trường có thể lọc
  conditions: FilterCondition[];      // Các điều kiện lọc hiện tại
  conditionLogic: 'contains' | 'equals' | 'not_contains'; // Logic toàn cục
  onConditionsChange: (conditions: FilterCondition[]) => void;
  onConditionLogicChange: (logic: string) => void;
  onApply: () => void;               // Xử lý khi áp dụng bộ lọc
  onReset: () => void;               // Xử lý khi reset bộ lọc
}
```

### Cách sử dụng

```tsx
import AdvancedFilter, { FilterCondition } from "@/components/filter/AdvancedFilter";

// Định nghĩa các trường có thể lọc
const filterOptions = [
  { value: 'name', label: 'Tên tài sản', type: 'text' },
  { value: 'status', label: 'Trạng thái', type: 'select' },
  { value: 'createdAt', label: 'Ngày tạo', type: 'date' },
  { value: 'category', label: 'Danh mục', type: 'select' }
];

// State quản lý bộ lọc
const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
const [conditionLogic, setConditionLogic] = useState<'contains' | 'equals' | 'not_contains'>('contains');

// Sử dụng component
<AdvancedFilter
  title="Bộ lọc tài sản"
  filterOptions={filterOptions}
  conditions={filterConditions}
  conditionLogic={conditionLogic}
  onConditionsChange={setFilterConditions}
  onConditionLogicChange={setConditionLogic}
  onApply={() => {
    console.log('Áp dụng bộ lọc:', { filterConditions, conditionLogic });
    // Xử lý logic lọc dữ liệu
  }}
  onReset={() => {
    setFilterConditions([]);
    setConditionLogic('contains');
  }}
/>
```

### Logic lọc

#### 1. **Logic toàn cục (Global Logic)**
- **Tất cả (contains)**: Tất cả điều kiện phải đúng (AND)
- **Bất kì (equals)**: Ít nhất một điều kiện đúng (OR)
- **Không (not_contains)**: Tất cả điều kiện phải sai (NOT AND)

#### 2. **Các loại trường lọc**
- **Text**: Tìm kiếm theo từ khóa (contains/equals/not_contains)
- **Select**: Chọn từ danh sách có sẵn
- **Date**: Chọn ngày hoặc khoảng ngày

#### 3. **Ví dụ logic**
```typescript
// Tìm tài sản có tên chứa "laptop" VÀ trạng thái là "đang sử dụng"
// Logic: "Tất cả" (AND)
// Điều kiện 1: name contains "laptop"
// Điều kiện 2: status equals "đang_sử_dụng"

// Tìm tài sản có tên chứa "laptop" HOẶC trạng thái là "đang sử dụng"
// Logic: "Bất kì" (OR)
// Điều kiện 1: name contains "laptop"
// Điều kiện 2: status equals "đang_sử_dụng"
```

### Tính năng chính

- ✅ **Multi-condition**: Nhiều điều kiện lọc cùng lúc
- ✅ **Global Logic**: Logic AND/OR/NOT cho toàn bộ điều kiện
- ✅ **Dynamic Fields**: Trường lọc không được chọn lại
- ✅ **Multi-value Input**: Nhập nhiều giá trị cho text/select
- ✅ **Date Range**: Lọc theo khoảng thời gian
- ✅ **Visual Tags**: Hiển thị tags cho các điều kiện đang hoạt động
- ✅ **Responsive**: Giao diện responsive trên mobile

---

## 📦 HandoverForm Component

### Mô tả
Component `HandoverForm` xử lý việc bàn giao tài sản giữa các đơn vị với giao diện form đầy đủ và validation.

### Props

```typescript
interface HandoverFormProps {
  assets: Asset[];                    // Danh sách tài sản cần bàn giao
  onCancel: () => void;              // Xử lý khi hủy
  onSuccess: (result: HandoverResult) => void; // Xử lý khi thành công
}
```

### Cách sử dụng

```tsx
import HandoverForm from "@/components/handover/HandoverForm";

// State quản lý form
const [showHandoverForm, setShowHandoverForm] = useState(false);
const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);

// Sử dụng component
{showHandoverForm && (
  <HandoverForm
    assets={selectedAssets}
    onCancel={() => setShowHandoverForm(false)}
    onSuccess={(result) => {
      console.log('Bàn giao thành công:', result);
      setShowHandoverForm(false);
      // Refresh danh sách tài sản
    }}
  />
)}
```

### Quy trình bàn giao

#### 1. **Chọn tài sản**
- Chọn từ danh sách tài sản có sẵn
- Hiển thị thông tin chi tiết của từng tài sản
- Validation: Chỉ cho phép bàn giao tài sản chưa được bàn giao

#### 2. **Chọn đơn vị nhận**
- Chọn từ danh sách đơn vị có sẵn
- Hiển thị thông tin đơn vị (tên, địa chỉ, người đại diện)
- Validation: Không thể bàn giao cho chính đơn vị hiện tại

#### 3. **Nhập thông tin bổ sung**
- Ghi chú cho việc bàn giao
- Ngày dự kiến bàn giao
- Người phụ trách bàn giao

#### 4. **Xác nhận và gửi**
- Hiển thị summary của việc bàn giao
- Xác nhận thông tin trước khi gửi
- Gửi yêu cầu bàn giao

### Tính năng chính

- ✅ **Asset Selection**: Chọn nhiều tài sản cùng lúc
- ✅ **Unit Selection**: Chọn đơn vị nhận từ danh sách
- ✅ **Form Validation**: Kiểm tra dữ liệu trước khi gửi
- ✅ **Progress Steps**: Hiển thị các bước thực hiện
- ✅ **Summary View**: Xem lại thông tin trước khi xác nhận
- ✅ **Responsive Design**: Hoạt động tốt trên mobile

---

## 📄 Pagination Component

### Mô tả
Component `Pagination` cung cấp giao diện phân trang với các nút điều hướng và hiển thị thông tin trang.

### Props

```typescript
interface PaginationProps {
  currentPage: number;                // Trang hiện tại
  totalPages: number;                 // Tổng số trang
  onPageChange: (page: number) => void; // Xử lý khi chuyển trang
  showSizeChanger?: boolean;          // Hiển thị selector số items/trang
  pageSizeOptions?: number[];         // Các option cho số items/trang
}
```

### Cách sử dụng

```tsx
import { Pagination } from "@/components/ui/pagination";

// State quản lý pagination
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(10);
const totalPages = Math.ceil(totalItems / pageSize);

// Sử dụng component
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={(page) => {
    setCurrentPage(page);
    // Fetch dữ liệu cho trang mới
  }}
  showSizeChanger={true}
  pageSizeOptions={[10, 20, 50, 100]}
/>
```

### Tính năng chính

- ✅ **Page Navigation**: Nút First, Previous, Next, Last
- ✅ **Page Numbers**: Hiển thị số trang với ellipsis
- ✅ **Page Size Changer**: Thay đổi số items/trang
- ✅ **Responsive**: Tự động ẩn một số nút trên mobile
- ✅ **Accessibility**: Hỗ trợ keyboard navigation

---

## 🔧 Tích hợp với Table Component

### Sử dụng Table với AdvancedFilter và Pagination

```tsx
import { Table, TableColumn } from "@/components/ui/table";
import AdvancedFilter from "@/components/filter/AdvancedFilter";
import { Pagination } from "@/components/ui/pagination";

export default function AssetListPage() {
  // State quản lý dữ liệu
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // State quản lý filter
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
  const [conditionLogic, setConditionLogic] = useState<'contains' | 'equals' | 'not_contains'>('contains');

  // Tính toán dữ liệu hiển thị
  const totalPages = Math.ceil(filteredAssets.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentAssets = filteredAssets.slice(startIndex, endIndex);

  // Xử lý filter
  const handleApplyFilter = () => {
    // Logic lọc dữ liệu dựa trên filterConditions và conditionLogic
    let filtered = assets;
    // ... logic lọc
    setFilteredAssets(filtered);
    setCurrentPage(1); // Reset về trang đầu
  };

  return (
    <div className="space-y-6">
      {/* Advanced Filter */}
      <AdvancedFilter
        filterOptions={filterOptions}
        conditions={filterConditions}
        conditionLogic={conditionLogic}
        onConditionsChange={setFilterConditions}
        onConditionLogicChange={setConditionLogic}
        onApply={handleApplyFilter}
        onReset={() => {
          setFilterConditions([]);
          setConditionLogic('contains');
          setFilteredAssets(assets);
        }}
      />

      {/* Table */}
      <Table
        columns={columns}
        data={currentAssets}
        loading={isLoading}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: filteredAssets.length,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }
        }}
        rowSelection={{
          selectedRowKeys: selectedIds,
          onChange: setSelectedIds
        }}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Hiển thị {startIndex + 1} - {Math.min(endIndex, filteredAssets.length)} 
            trong tổng số {filteredAssets.length} tài sản
          </span>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
```

---

## 📝 Best Practices

### 1. **Performance**
- Sử dụng `useMemo` cho việc tính toán dữ liệu phức tạp
- Sử dụng `useCallback` cho các hàm xử lý sự kiện
- Implement virtual scrolling cho danh sách lớn (>1000 items)

### 2. **Accessibility**
- Thêm `aria-label` cho các nút và form controls
- Hỗ trợ keyboard navigation
- Sử dụng semantic HTML elements

### 3. **Error Handling**
- Hiển thị thông báo lỗi rõ ràng
- Implement retry mechanism cho API calls
- Validate dữ liệu trước khi gửi

### 4. **User Experience**
- Hiển thị loading state khi cần thiết
- Cung cấp feedback ngay lập tức cho user actions
- Implement auto-save cho forms dài

### 5. **Code Organization**
- Tách logic business ra khỏi UI components
- Sử dụng custom hooks cho logic phức tạp
- Implement proper TypeScript types

---

## 🐛 Troubleshooting

### Vấn đề thường gặp

#### 1. **Table không hiển thị dữ liệu**
```typescript
// Kiểm tra
console.log('Data:', data);
console.log('Columns:', columns);

// Đảm bảo data có đúng format và columns có key khớp với data
```

#### 2. **Filter không hoạt động**
```typescript
// Kiểm tra logic filter
console.log('Filter conditions:', filterConditions);
console.log('Condition logic:', conditionLogic);

// Đảm bảo field names trong filterOptions khớp với data structure
```

#### 3. **Pagination không chính xác**
```typescript
// Kiểm tra tính toán
console.log('Total items:', totalItems);
console.log('Page size:', pageSize);
console.log('Total pages:', totalPages);

// Đảm bảo totalItems được cập nhật khi filter thay đổi
```

#### 4. **Performance issues**
```typescript
// Sử dụng React DevTools Profiler để kiểm tra re-renders
// Implement React.memo cho components không cần re-render thường xuyên
// Sử dụng useMemo cho expensive calculations
```

---

## 📚 Tài liệu tham khảo

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lucide React Icons](https://lucide.dev/guide/packages/lucide-react)
