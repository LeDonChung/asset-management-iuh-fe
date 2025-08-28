# 🚀 Hướng dẫn nhanh - Sử dụng Components

## 📋 Tổng quan

Hướng dẫn nhanh này sẽ giúp bạn hiểu và sử dụng các component chính trong hệ thống quản lý tài sản IUH một cách hiệu quả.

## 🗂️ Table Component - Sử dụng nhanh

### Cơ bản
```tsx
import { Table, TableColumn } from "@/components/ui/table";

// 1. Định nghĩa columns
const columns: TableColumn<Asset>[] = [
  { key: "name", title: "Tên tài sản" },
  { key: "status", title: "Trạng thái" },
  { key: "createdAt", title: "Ngày tạo" }
];

// 2. Sử dụng
<Table columns={columns} data={assets} />
```

### Nâng cao với custom rendering
```tsx
const columns: TableColumn<Asset>[] = [
  {
    key: "name",
    title: "Tên tài sản",
    render: (value, record) => (
      <div className="font-medium text-blue-600">{value}</div>
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
        <Button size="sm" onClick={() => handleEdit(record)}>Sửa</Button>
        <Button size="sm" variant="destructive" onClick={() => handleDelete(record)}>Xóa</Button>
      </div>
    )
  }
];
```

### Với Selection và Pagination
```tsx
<Table
  columns={columns}
  data={assets}
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

## 🔍 AdvancedFilter Component - Sử dụng nhanh

### Cơ bản
```tsx
import AdvancedFilter from "@/components/filter/AdvancedFilter";

// 1. Định nghĩa filter options
const filterOptions = [
  { value: 'name', label: 'Tên tài sản', type: 'text' },
  { value: 'status', label: 'Trạng thái', type: 'select' },
  { value: 'createdAt', label: 'Ngày tạo', type: 'date' }
];

// 2. State quản lý
const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
const [conditionLogic, setConditionLogic] = useState<'contains' | 'equals' | 'not_contains'>('contains');

// 3. Sử dụng
<AdvancedFilter
  filterOptions={filterOptions}
  conditions={filterConditions}
  conditionLogic={conditionLogic}
  onConditionsChange={setFilterConditions}
  onConditionLogicChange={setConditionLogic}
  onApply={handleApplyFilter}
  onReset={handleResetFilter}
/>
```

### Logic lọc nhanh
```typescript
// Logic "Tất cả" (AND) - Tất cả điều kiện phải đúng
// Logic "Bất kì" (OR) - Ít nhất một điều kiện đúng  
// Logic "Không" (NOT AND) - Tất cả điều kiện phải sai

// Ví dụ: Tìm tài sản có tên chứa "laptop" VÀ trạng thái "đang sử dụng"
// Điều kiện 1: name contains "laptop"
// Điều kiện 2: status equals "đang_sử_dụng"
// Logic: "Tất cả"
```

## 📦 HandoverForm Component - Sử dụng nhanh

### Cơ bản
```tsx
import HandoverForm from "@/components/handover/HandoverForm";

// 1. State quản lý
const [showHandoverForm, setShowHandoverForm] = useState(false);
const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);

// 2. Sử dụng
{showHandoverForm && (
  <HandoverForm
    assets={selectedAssets}
    onCancel={() => setShowHandoverForm(false)}
    onSuccess={(result) => {
      console.log('Bàn giao thành công:', result);
      setShowHandoverForm(false);
    }}
  />
)}
```

### Quy trình bàn giao
1. **Chọn tài sản** → Hiển thị danh sách tài sản có thể bàn giao
2. **Chọn đơn vị nhận** → Chọn từ danh sách đơn vị
3. **Nhập thông tin** → Ghi chú, ngày dự kiến
4. **Xác nhận** → Review và gửi yêu cầu

## 📄 Pagination Component - Sử dụng nhanh

### Cơ bản
```tsx
import { Pagination } from "@/components/ui/pagination";

// 1. State quản lý
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(10);
const totalPages = Math.ceil(totalItems / pageSize);

// 2. Sử dụng
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>
```

### Với Page Size Changer
```tsx
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  showSizeChanger={true}
  pageSizeOptions={[10, 20, 50, 100]}
/>
```

## 🔧 Tích hợp hoàn chỉnh

### Trang danh sách tài sản với đầy đủ tính năng

```tsx
import { Table, TableColumn } from "@/components/ui/table";
import AdvancedFilter from "@/components/filter/AdvancedFilter";
import { Pagination } from "@/components/ui/pagination";
import HandoverForm from "@/components/handover/HandoverForm";

export default function AssetListPage() {
  // State quản lý dữ liệu
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // State quản lý filter
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
  const [conditionLogic, setConditionLogic] = useState<'contains' | 'equals' | 'not_contains'>('contains');
  
  // State quản lý handover
  const [showHandoverForm, setShowHandoverForm] = useState(false);

  // Tính toán dữ liệu hiển thị
  const totalPages = Math.ceil(filteredAssets.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentAssets = filteredAssets.slice(startIndex, endIndex);

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
          <Button size="sm" onClick={() => handleEdit(record)}>Sửa</Button>
          <Button size="sm" variant="destructive" onClick={() => handleDelete(record)}>Xóa</Button>
        </div>
      )
    }
  ];

  // Filter options
  const filterOptions = [
    { value: 'name', label: 'Tên tài sản', type: 'text' },
    { value: 'status', label: 'Trạng thái', type: 'select' },
    { value: 'createdAt', label: 'Ngày tạo', type: 'date' }
  ];

  // Xử lý filter
  const handleApplyFilter = () => {
    // Logic lọc dữ liệu
    let filtered = assets;
    // ... implement filter logic
    setFilteredAssets(filtered);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Danh sách tài sản</h1>
        <div className="flex space-x-2">
          <Button onClick={() => setShowHandoverForm(true)}>
            Bàn giao tài sản
          </Button>
          <Button variant="outline" onClick={() => handleAdd()}>
            Thêm tài sản
          </Button>
        </div>
      </div>

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
        rowKey="id"
        onRowClick={(record) => handleRowClick(record)}
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
          selectedRowKeys: selectedAssets.map(a => a.id),
          onChange: (keys, rows) => setSelectedAssets(rows)
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

      {/* Handover Form */}
      {showHandoverForm && (
        <HandoverForm
          assets={selectedAssets}
          onCancel={() => setShowHandoverForm(false)}
          onSuccess={(result) => {
            console.log('Bàn giao thành công:', result);
            setShowHandoverForm(false);
            setSelectedAssets([]);
            // Refresh data
          }}
        />
      )}
    </div>
  );
}
```

## 🎯 Tips và Tricks

### 1. **Performance Optimization**
```tsx
// Sử dụng useMemo cho expensive calculations
const filteredData = useMemo(() => {
  return applyFilters(data, filterConditions, conditionLogic);
}, [data, filterConditions, conditionLogic]);

// Sử dụng useCallback cho event handlers
const handlePageChange = useCallback((page: number) => {
  setCurrentPage(page);
}, []);
```

### 2. **Error Handling**
```tsx
// Wrap components với error boundary
<ErrorBoundary fallback={<ErrorComponent />}>
  <Table columns={columns} data={assets} />
</ErrorBoundary>

// Handle loading states
{isLoading ? (
  <TableSkeleton />
) : (
  <Table columns={columns} data={assets} />
)}
```

### 3. **Accessibility**
```tsx
// Thêm ARIA labels
<Table
  columns={columns}
  data={assets}
  aria-label="Danh sách tài sản"
/>

// Keyboard navigation
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleRowClick(selectedRow);
  }
};
```

### 4. **Responsive Design**
```tsx
// Sử dụng responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>

// Hide/show columns based on screen size
const columns = useMemo(() => {
  const baseColumns = [
    { key: "name", title: "Tên tài sản" },
    { key: "status", title: "Trạng thái" }
  ];
  
  if (window.innerWidth > 768) {
    baseColumns.push({ key: "createdAt", title: "Ngày tạo" });
  }
  
  return baseColumns;
}, []);
```

## 🐛 Common Issues & Solutions

### 1. **Table không hiển thị dữ liệu**
```tsx
// Kiểm tra data format
console.log('Data:', data);
console.log('Columns:', columns);

// Đảm bảo key trong columns khớp với data properties
const columns = [
  { key: "name", title: "Tên" }, // data.name phải tồn tại
  { key: "status", title: "Trạng thái" } // data.status phải tồn tại
];
```

### 2. **Filter không hoạt động**
```tsx
// Kiểm tra filter logic
const handleApplyFilter = () => {
  console.log('Filter conditions:', filterConditions);
  console.log('Condition logic:', conditionLogic);
  
  // Implement filter logic
  let filtered = assets.filter(asset => {
    return filterConditions.every(condition => {
      // Your filter logic here
    });
  });
  
  setFilteredAssets(filtered);
};
```

### 3. **Pagination không chính xác**
```tsx
// Kiểm tra tính toán
const totalPages = Math.ceil(filteredAssets.length / pageSize);
const startIndex = (currentPage - 1) * pageSize;
const endIndex = startIndex + pageSize;

console.log('Total items:', filteredAssets.length);
console.log('Page size:', pageSize);
console.log('Total pages:', totalPages);
console.log('Current page:', currentPage);
```

## 📚 Tài liệu tham khảo

- [Hướng dẫn chi tiết](./components-usage-guide.md)
- [API Documentation](./api-docs.md)
- [TypeScript Types](./types.md)

---

**Chúc bạn sử dụng components hiệu quả! 🚀**
