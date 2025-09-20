# Hướng dẫn chi tiết: Hệ thống Filter nâng cao

## 📋 Mục lục
1. [Tổng quan hệ thống](#tổng-quan-hệ-thống)
2. [Kiến trúc và cấu trúc](#kiến-trúc-và-cấu-trúc)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [Tích hợp và sử dụng](#tích-hợp-và-sử-dụng)
6. [Các loại Field và Operator](#các-loại-field-và-operator)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## 🎯 Tổng quan hệ thống

### Mục đích
Hệ thống filter nâng cao cho phép người dùng tạo các bộ lọc phức tạp với nhiều điều kiện, hỗ trợ đầy đủ các loại dữ liệu và toán tử logic.

### Tính năng chính
- ✅ **Multi-condition filtering**: Nhiều điều kiện lọc
- ✅ **Dynamic operators**: Toán tử thay đổi theo loại field
- ✅ **Logic combinations**: AND, OR, CONTAINS logic
- ✅ **Field type support**: TEXT, NUMBER, DATE, SELECT, BOOLEAN
- ✅ **Backend integration**: Tích hợp hoàn toàn với backend API
- ✅ **Real-time validation**: Validation thời gian thực
- ✅ **Optimized performance**: Chỉ gọi API khi cần thiết

---

## 🏗️ Kiến trúc và cấu trúc

### Sơ đồ tổng quan
```
Frontend (React/TypeScript)
├── AdvancedFilter Component
├── Redux Store (inventorySlice)
├── API Integration
└── Type Definitions

Backend (NestJS/TypeORM)
├── Filter DTOs
├── Filter Utilities
├── Query Builder
└── Generic Filter Service
```

### Luồng dữ liệu
```
User Input → AdvancedFilter → Redux Store → API Call → Backend Processing → Database Query → Response → UI Update
```

---

## 🔧 Backend Implementation

### 1. Filter DTOs (`src/common/dto/`)

#### FilterOperator Enum
```typescript
export enum FilterOperator {
  EQUALS = 'equals',
  CONTAINS = 'contains',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUAL = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUAL = 'lte',
  IN = 'in',
  NOT_IN = 'notIn',
  BETWEEN = 'between'
}
```

#### FieldType Enum
```typescript
export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  SELECT = 'select',
  BOOLEAN = 'boolean'
}
```

#### FilterCondition Class
```typescript
export class FilterCondition {
  @ApiPropertyOptional({ description: 'Field name to filter by' })
  field?: string;

  @ApiPropertyOptional({ enum: FieldType })
  fieldType?: FieldType;

  @ApiPropertyOptional({ enum: FilterOperator })
  operator?: FilterOperator;

  @ApiPropertyOptional({ type: [String] })
  value?: any[];

  @ApiPropertyOptional({ description: 'Date from (for BETWEEN)' })
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Date to (for BETWEEN)' })
  dateTo?: string;
}
```

### 2. Query Builder Utility (`src/common/utils/query-builder.util.ts`)

#### BETWEEN Operator Handler
```typescript
case FilterOperator.BETWEEN:
  // Handle date fields with dateFrom/dateTo
  if (condition.fieldType === FieldType.DATE && condition.dateFrom && condition.dateTo) {
    qb[index === 0 ? 'where' : whereMethod](`${fieldPath} BETWEEN :${paramKey}_from AND :${paramKey}_to`, {
      [`${paramKey}_from`]: condition.dateFrom,
      [`${paramKey}_to`]: condition.dateTo
    });
  }
  // Handle number fields with value[0] and value[1]
  else if (condition.fieldType === FieldType.NUMBER && condition.value && condition.value.length >= 2) {
    qb[index === 0 ? 'where' : whereMethod](`${fieldPath} BETWEEN :${paramKey}_from AND :${paramKey}_to`, {
      [`${paramKey}_from`]: condition.value[0],
      [`${paramKey}_to`]: condition.value[1]
    });
  }
  break;
```

### 3. Generic Filter Service (`src/common/utils/filter.util.ts`)

#### Usage Example
```typescript
// In your service
async findAllWithFilter(filterDto: InventoryFilterDto): Promise<PaginatedResponseDto<InventorySessionResponseDto>> {
  const config = {
    searchFields: ['name', 'period'],
    fieldTypeMap: {
      'name': FieldType.TEXT,
      'year': FieldType.NUMBER,
      'status': FieldType.SELECT,
      'isGlobal': FieldType.BOOLEAN,
      'startDate': FieldType.DATE,
    },
    defaultSorting: { field: 'createdAt', direction: 'DESC' as const },
    relations: ['fileUrls', 'inventorySessionUnits']
  };

  return FilterUtil.getFilteredResults(
    this.inventorySessionRepository,
    filterDto,
    InventorySessionResponseDto,
    config,
    'inventory'
  );
}
```

---

## 🎨 Frontend Implementation

### 1. Type Definitions (`src/lib/store/slices/inventorySlice.ts`)

```typescript
// Backend filter enums (matching backend)
export enum FilterOperator {
  EQUALS = 'equals',
  CONTAINS = 'contains',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUAL = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUAL = 'lte',
  IN = 'in',
  NOT_IN = 'notIn',
  BETWEEN = 'between'
}

export interface FilterCondition {
  field: string;
  fieldType: FieldType;
  operator: FilterOperator;
  value: any[];
  dateFrom?: string;
  dateTo?: string;
  sort?: 'asc' | 'desc';
}
```

### 2. AdvancedFilter Component (`src/components/filter/AdvancedFilter.tsx`)

#### Dynamic Operator Options
```typescript
const getOperatorOptions = (fieldType: FieldType) => {
  switch (fieldType) {
    case FieldType.TEXT:
      return [
        { value: FilterOperator.CONTAINS, label: 'Chứa' },
        { value: FilterOperator.EQUALS, label: 'Bằng' },
        { value: FilterOperator.STARTS_WITH, label: 'Bắt đầu với' },
        { value: FilterOperator.ENDS_WITH, label: 'Kết thúc với' },
        { value: FilterOperator.IN, label: 'Trong danh sách' },
        { value: FilterOperator.NOT_IN, label: 'Không trong danh sách' }
      ];
    case FieldType.NUMBER:
      return [
        { value: FilterOperator.EQUALS, label: 'Bằng' },
        { value: FilterOperator.GREATER_THAN, label: 'Lớn hơn' },
        { value: FilterOperator.GREATER_THAN_OR_EQUAL, label: 'Lớn hơn hoặc bằng' },
        { value: FilterOperator.LESS_THAN, label: 'Nhỏ hơn' },
        { value: FilterOperator.LESS_THAN_OR_EQUAL, label: 'Nhỏ hơn hoặc bằng' },
        { value: FilterOperator.BETWEEN, label: 'Trong khoảng' },
        { value: FilterOperator.IN, label: 'Trong danh sách' }
      ];
    // ... other field types
  }
};
```

#### Smart Value Input Handling
```typescript
// NUMBER BETWEEN input
if (condition.fieldType === FieldType.NUMBER && condition.operator === FilterOperator.BETWEEN) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Input
        type="number"
        value={condition.value[0] || ''}
        onChange={(e) => {
          const newValue = [...condition.value];
          while (newValue.length < 2) newValue.push('');
          newValue[0] = e.target.value;
          updateCondition(condition.id, { value: newValue });
        }}
        placeholder="Từ..."
      />
      <Input
        type="number"
        value={condition.value[1] || ''}
        onChange={(e) => {
          const newValue = [...condition.value];
          while (newValue.length < 2) newValue.push('');
          newValue[1] = e.target.value;
          updateCondition(condition.id, { value: newValue });
        }}
        placeholder="Đến..."
      />
    </div>
  );
}
```

### 3. Redux Integration

#### Async Actions
```typescript
export const filterInventorySessions = createAsyncThunk(
  "inventory-session/filter",
  async (filterRequest: InventoryFilterRequest, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/api/v1/inventories/filter",
        filterRequest
      );
      return response.data as PaginatedInventoryResponse;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
```

---

## 🔗 Tích hợp và sử dụng

### 1. Trong Page Component

#### Filter Options Definition
```typescript
const filterOptions = [
  {
    value: "name",
    label: "Tên kỳ kiểm kê",
    type: FieldType.TEXT,
  },
  {
    value: "year",
    label: "Năm",
    type: FieldType.NUMBER,
  },
  {
    value: "startDate",
    label: "Ngày bắt đầu",
    type: FieldType.DATE,
  },
  {
    value: "status",
    label: "Trạng thái",
    type: FieldType.SELECT,
    options: [
      { value: "PLANNED", label: "Kế hoạch" },
      { value: "IN_PROGRESS", label: "Đang thực hiện" },
      { value: "COMPLETED", label: "Hoàn thành" },
      { value: "CLOSED", label: "Đã đóng" }
    ],
  },
  {
    value: "isGlobal",
    label: "Phạm vi kiểm kê",
    type: FieldType.BOOLEAN,
  },
];
```

#### Component Usage
```tsx
<AdvancedFilter
  title=""
  filterOptions={filterOptions}
  conditions={filterConditions}
  conditionLogic={conditionLogic}
  onConditionsChange={(conditions) => {
    setFilterConditions(conditions);
    setHasUnappliedChanges(true);
  }}
  onConditionLogicChange={(logic) => {
    setConditionLogic(logic);
    setHasUnappliedChanges(true);
  }}
  onApply={() => {
    applyAdvancedFilters();
    setHasUnappliedChanges(false);
  }}
  onReset={() => {
    resetFilters();
    setHasUnappliedChanges(false);
  }}
  className="border-0 shadow-none bg-transparent"
/>
```

### 2. API Call Optimization

#### Chỉ gọi API khi cần thiết
```typescript
// Search: Chỉ khi nhấn Enter hoặc blur
onKeyDown={(e) => {
  if (e.key === 'Enter') {
    applyAdvancedFilters();
  }
}}

// Advanced Filter: Chỉ khi nhấn "Áp dụng"
onApply={() => {
  applyAdvancedFilters();
}}

// Pagination: Gọi ngay lập tức
const handlePaginationChange = async (newPage: number, newPageSize?: number) => {
  await dispatch(filterInventorySessions(filterData));
}
```

---

## 📊 Các loại Field và Operator

### TEXT Fields
| Operator | Mô tả | Ví dụ |
|----------|-------|-------|
| `contains` | Chứa | "abc" chứa "b" |
| `equals` | Bằng | "abc" bằng "abc" |
| `startsWith` | Bắt đầu với | "abc" bắt đầu với "a" |
| `endsWith` | Kết thúc với | "abc" kết thúc với "c" |
| `in` | Trong danh sách | "abc" trong ["abc", "def"] |
| `notIn` | Không trong danh sách | "abc" không trong ["def", "ghi"] |

### NUMBER Fields
| Operator | Mô tả | Ví dụ |
|----------|-------|-------|
| `equals` | Bằng | 2024 = 2024 |
| `gt` | Lớn hơn | 2024 > 2023 |
| `gte` | Lớn hơn hoặc bằng | 2024 >= 2024 |
| `lt` | Nhỏ hơn | 2023 < 2024 |
| `lte` | Nhỏ hơn hoặc bằng | 2023 <= 2024 |
| `between` | Trong khoảng | 2024 BETWEEN 2023 AND 2025 |
| `in` | Trong danh sách | 2024 IN [2023, 2024, 2025] |

### DATE Fields
| Operator | Mô tả | Ví dụ |
|----------|-------|-------|
| `equals` | Bằng | 2025-01-01 = 2025-01-01 |
| `gt` | Sau ngày | 2025-01-02 > 2025-01-01 |
| `gte` | Từ ngày | 2025-01-01 >= 2025-01-01 |
| `lt` | Trước ngày | 2024-12-31 < 2025-01-01 |
| `lte` | Đến ngày | 2025-01-01 <= 2025-01-01 |
| `between` | Trong khoảng | date BETWEEN '2025-01-01' AND '2025-12-31' |

### SELECT Fields
| Operator | Mô tả | Ví dụ |
|----------|-------|-------|
| `equals` | Bằng | status = "PLANNED" |
| `in` | Trong danh sách | status IN ["PLANNED", "IN_PROGRESS"] |
| `notIn` | Không trong danh sách | status NOT IN ["COMPLETED", "CLOSED"] |

### BOOLEAN Fields
| Operator | Mô tả | Ví dụ |
|----------|-------|-------|
| `equals` | Bằng | isGlobal = true |

---

## 🔧 Troubleshooting

### Lỗi thường gặp

#### 1. BETWEEN operator không hoạt động
**Nguyên nhân**: Value array không đủ 2 phần tử
**Giải pháp**:
```typescript
// Đảm bảo khởi tạo đúng
if (newOperator === FilterOperator.BETWEEN) {
  if (newValue.length < 2) {
    newValue = [newValue[0] || '', newValue[1] || ''];
  }
}
```

#### 2. API call quá nhiều
**Nguyên nhân**: Auto-trigger filter changes
**Giải pháp**:
```typescript
// Chỉ gọi API khi user nhấn Apply
onConditionsChange={(conditions) => {
  setFilterConditions(conditions);
  setHasUnappliedChanges(true); // Không gọi API
}}
```

#### 3. Type errors với FilterOperator
**Nguyên nhân**: Enum không sync giữa frontend/backend
**Giải pháp**: Đảm bảo enum values giống nhau:
```typescript
// Backend và Frontend phải giống nhau
EQUALS = 'equals', // không phải 'EQUALS'
```

#### 4. Date BETWEEN không hoạt động
**Nguyên nhân**: Dùng value array thay vì dateFrom/dateTo
**Giải pháp**:
```typescript
if (condition.fieldType === FieldType.DATE && condition.operator === FilterOperator.BETWEEN) {
  // Dùng dateFrom/dateTo, không phải value array
  transformedCondition.dateFrom = condition.dateFrom;
  transformedCondition.dateTo = condition.dateTo;
}
```

### Debug Tips

#### 1. Log filter data trước khi gửi API
```typescript
const applyAdvancedFilters = async () => {
  const filterData = createApiFilterData(filterConditions, conditionLogic, filter.search, 0, 1);
  console.log('Filter Data:', JSON.stringify(filterData, null, 2));
  await dispatch(filterInventorySessions(filterData));
};
```

#### 2. Kiểm tra backend logs
```typescript
// Trong controller
@Post('filter')
async findAll(@Body() filterDto: InventoryFilterDto) {
  console.log('Received filter:', JSON.stringify(filterDto, null, 2));
  return this.inventoriesService.findAllWithFilter(filterDto);
}
```

---

## ✅ Best Practices

### 1. Performance Optimization
```typescript
// ✅ Chỉ gọi API khi cần thiết
onApply={() => applyAdvancedFilters()} // Tốt
onChange={() => applyAdvancedFilters()} // Tránh

// ✅ Debounce search input
const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
onKeyDown={(e) => {
  if (e.key === 'Enter') {
    applyAdvancedFilters();
  }
}}
```

### 2. Type Safety
```typescript
// ✅ Sử dụng enums thay vì strings
operator: FilterOperator.BETWEEN // Tốt
operator: 'between' // Tránh

// ✅ Định nghĩa interface rõ ràng
interface FilterCondition {
  field: string;
  fieldType: FieldType;
  operator: FilterOperator;
  value: any[];
}
```

### 3. Error Handling
```typescript
// ✅ Handle API errors gracefully
try {
  await dispatch(filterInventorySessions(filterData));
} catch (error) {
  console.error('Filter failed:', error);
  // Show user-friendly error message
}
```

### 4. User Experience
```typescript
// ✅ Visual feedback cho unapplied changes
{hasUnappliedChanges && (
  <Badge className="ml-2 bg-orange-100 text-orange-800 text-xs">
    Chưa áp dụng
  </Badge>
)}

// ✅ Loading states
{filterLoading ? (
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
) : (
  <Table data={filteredSessions?.data || []} />
)}
```

### 5. Code Organization
```typescript
// ✅ Tách logic thành utility functions
const createApiFilterData = (conditions, logic, search, total, page) => {
  // Clean and transform conditions
  // Return API-ready data
};

// ✅ Reusable filter configurations
const getInventoryFilterOptions = () => [
  { value: "name", label: "Tên kỳ kiểm kê", type: FieldType.TEXT },
  { value: "year", label: "Năm", type: FieldType.NUMBER },
  // ...
];
```

---

## 🎯 Kết luận

Hệ thống filter nâng cao đã được thiết kế để:
- ✅ **Linh hoạt**: Hỗ trợ đầy đủ các loại field và operator
- ✅ **Hiệu quả**: Tối ưu hóa API calls và performance
- ✅ **An toàn**: Type-safe với TypeScript
- ✅ **Dễ bảo trì**: Cấu trúc rõ ràng, có thể tái sử dụng
- ✅ **User-friendly**: UX tốt với visual feedback

Hệ thống này có thể được áp dụng cho bất kỳ entity nào khác trong ứng dụng bằng cách:
1. Tạo filter options phù hợp
2. Cấu hình field type mapping
3. Tích hợp với generic FilterUtil

Để biết thêm chi tiết, tham khảo:
- [Components Usage Guide](./components-usage-guide.md)
- [Backend Generic Filter Usage](../asset-management-iuh-be/GENERIC_FILTER_USAGE.md)
