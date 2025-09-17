# Hướng dẫn sử dụng Enhanced AdvancedFilter Component

## 📋 Tổng quan

Component `AdvancedFilter` đã được nâng cấp hoàn toàn với tích hợp backend filter system, hỗ trợ đầy đủ các loại field và operators.

## 🚀 Tính năng mới

- ✅ **Dynamic Operators**: Toán tử thay đổi theo loại field
- ✅ **5 Field Types**: TEXT, NUMBER, DATE, SELECT, BOOLEAN
- ✅ **11 Operators**: equals, contains, startsWith, endsWith, gt, gte, lt, lte, in, notIn, between
- ✅ **Logic Combinations**: AND, OR, CONTAINS
- ✅ **Backend Integration**: Tích hợp hoàn toàn với API
- ✅ **Smart Validation**: Validation thời gian thực
- ✅ **Performance Optimized**: Chỉ gọi API khi cần thiết

## 📝 Interface và Types

### Props Interface
```typescript
interface AdvancedFilterProps {
  title?: string;
  filterOptions: FilterOption[];
  conditions: FilterCondition[];
  conditionLogic?: ConditionLogic;
  onConditionsChange: (conditions: FilterCondition[]) => void;
  onConditionLogicChange?: (logic: ConditionLogic) => void;
  onApply: () => void;
  onReset: () => void;
  className?: string;
}
```

### FilterOption Interface
```typescript
interface FilterOption {
  value: string;           // Field name
  label: string;           // Display label
  type: FieldType;         // Field type
  options?: Array<{        // For SELECT type only
    value: string;
    label: string;
  }>;
}
```

### FilterCondition Interface
```typescript
interface FilterCondition {
  id: string;              // Unique identifier
  field: string;           // Field name
  fieldType: FieldType;    // Field type
  operator: FilterOperator; // Filter operator
  value: any[];            // Filter values (always array)
  dateFrom?: string;       // For DATE BETWEEN (from)
  dateTo?: string;         // For DATE BETWEEN (to)
  sort?: 'asc' | 'desc';   // Optional sorting
}
```

### Enums
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

export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  SELECT = 'select',
  BOOLEAN = 'boolean'
}

export enum ConditionLogic {
  AND = 'and',
  OR = 'or',
  CONTAINS = 'contains'
}
```

## 🎯 Cách sử dụng

### 1. Import Components
```typescript
import AdvancedFilter, { 
  FilterCondition, 
  FilterOperator, 
  FieldType, 
  ConditionLogic 
} from '@/components/filter/AdvancedFilter';
```

### 2. Định nghĩa Filter Options
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
    value: "period",
    label: "Đợt kiểm kê",
    type: FieldType.NUMBER,
  },
  {
    value: "startDate",
    label: "Ngày bắt đầu",
    type: FieldType.DATE,
  },
  {
    value: "endDate",
    label: "Ngày kết thúc",
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

### 3. State Management
```typescript
const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
const [conditionLogic, setConditionLogic] = useState<ConditionLogic>(ConditionLogic.AND);
const [hasUnappliedChanges, setHasUnappliedChanges] = useState<boolean>(false);
```

### 4. Component Usage
```tsx
<AdvancedFilter
  title=""
  filterOptions={filterOptions}
  conditions={filterConditions}
  conditionLogic={conditionLogic}
  onConditionsChange={(conditions) => {
    setFilterConditions(conditions);
    setHasUnappliedChanges(true); // Mark as having unapplied changes
  }}
  onConditionLogicChange={(logic) => {
    setConditionLogic(logic);
    setHasUnappliedChanges(true);
  }}
  onApply={() => {
    // Only call API when user clicks Apply
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

### 5. API Integration Functions
```typescript
const applyAdvancedFilters = async () => {
  const filterData = createApiFilterData(
    filterConditions,
    conditionLogic,
    filter.search || null,
    0,
    1
  );

  console.log('Applying filter:', filterData);
  
  try {
    await dispatch(filterInventorySessions(filterData));
  } catch (error) {
    console.error('Filter failed:', error);
  }
};

const resetFilters = async () => {
  setFilter({});
  setFilterConditions([]);
  setConditionLogic(ConditionLogic.AND);
  setSortConfigs([]);
  
  dispatch(resetFilter());
  
  try {
    await dispatch(filterInventorySessions({}));
  } catch (error) {
    console.error('Reset filters failed:', error);
  }
};
```

## 📊 Field Types và Operators

### TEXT Fields
| Operator | Label | Mô tả | Ví dụ |
|----------|-------|-------|-------|
| `contains` | Chứa | Chứa chuỗi con | "abc" chứa "b" |
| `equals` | Bằng | Bằng chính xác | "abc" bằng "abc" |
| `startsWith` | Bắt đầu với | Bắt đầu với chuỗi | "abc" bắt đầu với "a" |
| `endsWith` | Kết thúc với | Kết thúc với chuỗi | "abc" kết thúc với "c" |
| `in` | Trong danh sách | Có trong danh sách | "abc" trong ["abc", "def"] |
| `notIn` | Không trong danh sách | Không có trong danh sách | "abc" không trong ["def", "ghi"] |

### NUMBER Fields  
| Operator | Label | Mô tả | Ví dụ |
|----------|-------|-------|-------|
| `equals` | Bằng | Bằng số | 2024 = 2024 |
| `gt` | Lớn hơn | Lớn hơn | 2024 > 2023 |
| `gte` | Lớn hơn hoặc bằng | Lớn hơn hoặc bằng | 2024 >= 2024 |
| `lt` | Nhỏ hơn | Nhỏ hơn | 2023 < 2024 |
| `lte` | Nhỏ hơn hoặc bằng | Nhỏ hơn hoặc bằng | 2023 <= 2024 |
| `between` | Trong khoảng | Trong khoảng hai số | 2024 BETWEEN 2023 AND 2025 |
| `in` | Trong danh sách | Có trong danh sách số | 2024 IN [2023, 2024, 2025] |

### DATE Fields
| Operator | Label | Mô tả | Ví dụ |
|----------|-------|-------|-------|
| `equals` | Bằng | Bằng ngày | 2025-01-01 = 2025-01-01 |
| `gt` | Sau ngày | Sau ngày | 2025-01-02 > 2025-01-01 |
| `gte` | Từ ngày | Từ ngày trở đi | 2025-01-01 >= 2025-01-01 |
| `lt` | Trước ngày | Trước ngày | 2024-12-31 < 2025-01-01 |
| `lte` | Đến ngày | Đến ngày | 2025-01-01 <= 2025-01-01 |
| `between` | Trong khoảng | Trong khoảng thời gian | date BETWEEN '2025-01-01' AND '2025-12-31' |

### SELECT Fields
| Operator | Label | Mô tả | Ví dụ |
|----------|-------|-------|-------|
| `equals` | Bằng | Bằng giá trị | status = "PLANNED" |
| `in` | Trong danh sách | Có trong danh sách | status IN ["PLANNED", "IN_PROGRESS"] |
| `notIn` | Không trong danh sách | Không có trong danh sách | status NOT IN ["COMPLETED", "CLOSED"] |

### BOOLEAN Fields
| Operator | Label | Mô tả | Ví dụ |
|----------|-------|-------|-------|
| `equals` | Bằng | Bằng true/false | isGlobal = true |

## 🔗 Logic Combinations

### AND Logic (Tất cả điều kiện)
```typescript
// Tất cả điều kiện phải đúng
conditionLogic: ConditionLogic.AND

// Ví dụ: Năm = 2024 AND Trạng thái = "PLANNED" AND isGlobal = true
// Chỉ trả về records thỏa mãn TẤT CẢ điều kiện
```

### OR Logic (Bất kỳ điều kiện)
```typescript
// Ít nhất một điều kiện phải đúng
conditionLogic: ConditionLogic.OR

// Ví dụ: Năm = 2024 OR Trạng thái = "COMPLETED" OR isGlobal = true
// Trả về records thỏa mãn ÍT NHẤT MỘT điều kiện
```

### CONTAINS Logic (Legacy)
```typescript
// Logic chứa (để tương thích với phiên bản cũ)
conditionLogic: ConditionLogic.CONTAINS
```

## 🎨 Input Handling theo Field Type

### TEXT Field Input
```typescript
// Single value
<Input
  type="text"
  value={condition.value[0] || ''}
  onChange={(e) => updateCondition(condition.id, { value: [e.target.value] })}
  placeholder="Nhập giá trị..."
/>

// Multiple values (IN/NOT_IN)
<div className="flex items-center space-x-2">
  <Input
    type="text"
    placeholder="Nhập từ khóa..."
    onKeyDown={(e) => {
      if (e.key === 'Enter') {
        addKeyword();
      }
    }}
  />
  <Button onClick={addKeyword}>
    <Plus className="h-4 w-4" />
  </Button>
</div>
```

### NUMBER Field Input
```typescript
// Single value
<Input
  type="number"
  value={condition.value[0] || ''}
  onChange={(e) => updateCondition(condition.id, { value: [e.target.value] })}
  placeholder="Nhập số..."
/>

// BETWEEN operator
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
```

### DATE Field Input
```typescript
// Single value
<Input
  type="date"
  value={condition.value[0] || ''}
  onChange={(e) => updateCondition(condition.id, { value: [e.target.value] })}
/>

// BETWEEN operator
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
  <div>
    <label>Từ ngày</label>
    <Input
      type="date"
      value={condition.dateFrom || ''}
      onChange={(e) => updateCondition(condition.id, { dateFrom: e.target.value })}
    />
  </div>
  <div>
    <label>Đến ngày</label>
    <Input
      type="date"
      value={condition.dateTo || ''}
      onChange={(e) => updateCondition(condition.id, { dateTo: e.target.value })}
    />
  </div>
</div>
```

### SELECT Field Input
```typescript
<MultiSelect
  options={fieldOption.options}
  value={Array.isArray(condition.value) ? condition.value : []}
  onChange={(newValue) => updateCondition(condition.id, { value: newValue })}
  placeholder="Chọn giá trị..."
/>
```

### BOOLEAN Field Input
```typescript
<select
  value={condition.value[0] || ''}
  onChange={(e) => updateCondition(condition.id, { value: [e.target.value] })}
>
  <option value="">Chọn giá trị...</option>
  <option value="true">Có</option>
  <option value="false">Không</option>
</select>
```

## 📡 API Request Format

Component tự động tạo API request với format sau:

```json
{
  "conditionLogic": "and",
  "conditions": [
    {
      "field": "year",
      "fieldType": "number",
      "operator": "between",
      "value": ["2023", "2025"]
    },
    {
      "field": "status",
      "fieldType": "select",
      "operator": "in",
      "value": ["PLANNED", "IN_PROGRESS"]
    },
    {
      "field": "startDate",
      "fieldType": "date",
      "operator": "between",
      "dateFrom": "2025-01-01",
      "dateTo": "2025-12-31",
      "value": []
    }
  ],
  "pagination": {
    "currentPage": 1,
    "itemsPerPage": 5,
    "totalItems": 0,
    "totalPages": 0
  },
  "sorting": [],
  "search": null
}
```

## 🎯 Ví dụ thực tế

### Ví dụ 1: Filter cơ bản
```typescript
// Tìm kỳ kiểm kê có tên chứa "2024" AND trạng thái là "PLANNED"
const basicConditions: FilterCondition[] = [
  {
    id: "condition-1",
    field: "name",
    fieldType: FieldType.TEXT,
    operator: FilterOperator.CONTAINS,
    value: ["2024"]
  },
  {
    id: "condition-2",
    field: "status",
    fieldType: FieldType.SELECT,
    operator: FilterOperator.EQUALS,
    value: ["PLANNED"]
  }
];
```

### Ví dụ 2: Filter phức tạp với BETWEEN
```typescript
// Tìm kỳ kiểm kê:
// - Năm trong khoảng 2023-2025
// - VÀ Ngày bắt đầu từ 2025-01-01 đến 2025-12-31
// - VÀ Trạng thái trong danh sách [PLANNED, IN_PROGRESS]
const complexConditions: FilterCondition[] = [
  {
    id: "condition-1",
    field: "year",
    fieldType: FieldType.NUMBER,
    operator: FilterOperator.BETWEEN,
    value: ["2023", "2025"]
  },
  {
    id: "condition-2",
    field: "startDate",
    fieldType: FieldType.DATE,
    operator: FilterOperator.BETWEEN,
    value: [],
    dateFrom: "2025-01-01",
    dateTo: "2025-12-31"
  },
  {
    id: "condition-3",
    field: "status",
    fieldType: FieldType.SELECT,
    operator: FilterOperator.IN,
    value: ["PLANNED", "IN_PROGRESS"]
  }
];
```

### Ví dụ 3: OR Logic
```typescript
// Tìm kỳ kiểm kê:
// - Năm = 2024 OR Trạng thái = "COMPLETED" OR isGlobal = true
const orConditions: FilterCondition[] = [
  {
    id: "condition-1",
    field: "year",
    fieldType: FieldType.NUMBER,
    operator: FilterOperator.EQUALS,
    value: ["2024"]
  },
  {
    id: "condition-2",
    field: "status",
    fieldType: FieldType.SELECT,
    operator: FilterOperator.EQUALS,
    value: ["COMPLETED"]
  },
  {
    id: "condition-3",
    field: "isGlobal",
    fieldType: FieldType.BOOLEAN,
    operator: FilterOperator.EQUALS,
    value: ["true"]
  }
];

// Set conditionLogic to OR
setConditionLogic(ConditionLogic.OR);
```

## ⚡ Performance Best Practices

### 1. Optimized API Calls
```typescript
// ✅ Chỉ gọi API khi user nhấn Apply
onApply={() => {
  applyAdvancedFilters(); // Gọi API
  setHasUnappliedChanges(false);
}}

// ❌ Tránh auto-apply on change
onConditionsChange={(conditions) => {
  setFilterConditions(conditions);
  // applyAdvancedFilters(); // KHÔNG làm như này
}}
```

### 2. Visual Feedback
```typescript
// Show unapplied changes indicator
{hasUnappliedChanges && (
  <Badge className="ml-2 bg-orange-100 text-orange-800 text-xs">
    Chưa áp dụng
  </Badge>
)}
```

### 3. Loading States
```typescript
{filterLoading ? (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    <p>Đang tải dữ liệu...</p>
  </div>
) : (
  <Table data={filteredSessions?.data || []} />
)}
```

### 4. Error Handling
```typescript
{filterError && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <div className="text-red-800">
      <p className="font-medium">Lỗi tải dữ liệu:</p>
      <p className="text-sm">{filterError}</p>
    </div>
  </div>
)}
```

## 🚨 Troubleshooting

### Lỗi thường gặp và cách khắc phục

#### 1. BETWEEN operator không hoạt động
**Lỗi**: `value` array không đủ 2 phần tử
```typescript
// ❌ Sai
value: ["2023"] // Chỉ có 1 phần tử

// ✅ Đúng  
value: ["2023", "2025"] // Đủ 2 phần tử cho BETWEEN
```

#### 2. DATE BETWEEN không hoạt động
**Lỗi**: Dùng `value` array thay vì `dateFrom`/`dateTo`
```typescript
// ❌ Sai
{
  fieldType: FieldType.DATE,
  operator: FilterOperator.BETWEEN,
  value: ["2025-01-01", "2025-12-31"]
}

// ✅ Đúng
{
  fieldType: FieldType.DATE,
  operator: FilterOperator.BETWEEN,
  value: [],
  dateFrom: "2025-01-01",
  dateTo: "2025-12-31"
}
```

#### 3. SELECT field không có options
**Lỗi**: Quên định nghĩa `options` cho SELECT field
```typescript
// ❌ Sai
{
  value: "status",
  label: "Trạng thái", 
  type: FieldType.SELECT
  // Thiếu options
}

// ✅ Đúng
{
  value: "status",
  label: "Trạng thái",
  type: FieldType.SELECT,
  options: [
    { value: "PLANNED", label: "Kế hoạch" },
    { value: "IN_PROGRESS", label: "Đang thực hiện" }
  ]
}
```

#### 4. TypeScript errors với enums
**Lỗi**: Import sai enums
```typescript
// ❌ Sai
import { FilterOperator } from 'wrong-path';

// ✅ Đúng
import { 
  FilterOperator, 
  FieldType, 
  ConditionLogic 
} from '@/components/filter/AdvancedFilter';
```

## 🔗 Tích hợp với các modules khác

Component này có thể được tái sử dụng cho bất kỳ entity nào:

### Assets Filter
```typescript
const assetFilterOptions = [
  { value: "name", label: "Tên tài sản", type: FieldType.TEXT },
  { value: "price", label: "Giá trị", type: FieldType.NUMBER },
  { value: "purchaseDate", label: "Ngày mua", type: FieldType.DATE },
  { value: "status", label: "Trạng thái", type: FieldType.SELECT, options: [...] },
  { value: "isActive", label: "Đang sử dụng", type: FieldType.BOOLEAN }
];
```

### Users Filter
```typescript
const userFilterOptions = [
  { value: "fullName", label: "Họ tên", type: FieldType.TEXT },
  { value: "age", label: "Tuổi", type: FieldType.NUMBER },
  { value: "createdAt", label: "Ngày tạo", type: FieldType.DATE },
  { value: "role", label: "Vai trò", type: FieldType.SELECT, options: [...] },
  { value: "isActive", label: "Hoạt động", type: FieldType.BOOLEAN }
];
```

Để biết thêm chi tiết về hệ thống filter, xem: [Advanced Filter System Guide](./advanced-filter-system-guide.md)
