"use client";

import React from "react";

// Table interfaces
export interface TableColumn<T = any> {
  key: string;
  title: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string;
  className?: string;
  sortable?: boolean;
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  emptyIcon?: React.ReactNode;
  className?: string;
  rowKey?: string | ((record: T) => string);
  onRowClick?: (record: T, index: number) => void;
  rowClassName?: string | ((record: T, index: number) => string);
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
    showSizeChanger?: boolean;
    pageSizeOptions?: number[];
  };
  // Selection props
  rowSelection?: {
    selectedRowKeys?: string[];
    onChange?: (selectedRowKeys: string[], selectedRows: T[]) => void;
    onSelectAll?: (selected: boolean, selectedRows: T[], changeRows: T[]) => void;
    getCheckboxProps?: (record: T) => { disabled?: boolean };
  };
  // Title and description props
  title?: React.ReactNode;
  description?: React.ReactNode;
  headerExtra?: React.ReactNode;
}

export function Table<T = any>({
  columns,
  data,
  loading = false,
  emptyText = "Không có dữ liệu",
  emptyIcon,
  className = "",
  rowKey = "id",
  onRowClick,
  rowClassName,
  pagination,
  rowSelection,
  title,
  description,
  headerExtra,
}: TableProps<T>) {
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === "function") {
      return rowKey(record);
    }
    return (record as any)[rowKey] || index.toString();
  };

  const getRowClassName = (record: T, index: number): string => {
    let baseClassName = "hover:bg-gray-50";
    if (onRowClick) {
      baseClassName += " cursor-pointer";
    }
    
    if (typeof rowClassName === "function") {
      return `${baseClassName} ${rowClassName(record, index)}`;
    }
    
    return rowClassName ? `${baseClassName} ${rowClassName}` : baseClassName;
  };

  const renderCell = (column: TableColumn<T>, record: T, index: number) => {
    if (column.render) {
      return column.render((record as any)[column.key], record, index);
    }
    return (record as any)[column.key];
  };

  // Selection logic
  const selectedRowKeys = rowSelection?.selectedRowKeys || [];
  const isAllSelected = data.length > 0 && selectedRowKeys.length === data.length;
  const isIndeterminate = selectedRowKeys.length > 0 && selectedRowKeys.length < data.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      rowSelection?.onChange?.([], []);
    } else {
      const allKeys = data.map((record, index) => getRowKey(record, index));
      rowSelection?.onChange?.(allKeys, data);
    }
    rowSelection?.onSelectAll?.(!isAllSelected, isAllSelected ? [] : data, data);
  };

  const handleSelectRow = (record: T, index: number) => {
    const key = getRowKey(record, index);
    const newSelectedKeys = selectedRowKeys.includes(key)
      ? selectedRowKeys.filter(k => k !== key)
      : [...selectedRowKeys, key];
    
    const selectedRows = data.filter((item, idx) => 
      newSelectedKeys.includes(getRowKey(item, idx))
    );
    
    rowSelection?.onChange?.(newSelectedKeys, selectedRows);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
        {(title || description || headerExtra) && (
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                {title && <div className="text-xl font-semibold text-gray-900 mb-1">{title}</div>}
                {description && <div className="text-sm text-gray-600">{description}</div>}
              </div>
              {headerExtra && <div>{headerExtra}</div>}
            </div>
          </div>
        )}
        <div className="animate-pulse">
          <div className="bg-gray-50 px-4 py-3">
            <div className="flex space-x-4">
              {columns.map((_, index) => (
                <div key={index} className="h-4 bg-gray-300 rounded flex-1"></div>
              ))}
            </div>
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="border-t border-gray-200 px-4 py-4">
              <div className="flex space-x-4">
                {columns.map((_, colIndex) => (
                  <div key={colIndex} className="h-4 bg-gray-200 rounded flex-1"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      {(title || description || headerExtra) && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              {title && <div className="text-xl font-semibold text-gray-900 mb-1">{title}</div>}
              {description && <div className="text-sm text-gray-600">{description}</div>}
            </div>
            {headerExtra && <div>{headerExtra}</div>}
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {rowSelection && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.className || ""
                  }`}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((record, index) => {
              const rowKeyValue = getRowKey(record, index);
              const isSelected = selectedRowKeys.includes(rowKeyValue);
              const checkboxProps = rowSelection?.getCheckboxProps?.(record) || {};
              
              return (
                <tr
                  key={rowKeyValue}
                  className={getRowClassName(record, index)}
                  onClick={() => onRowClick?.(record, index)}
                >
                  {rowSelection && (
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={checkboxProps.disabled}
                        onChange={() => handleSelectRow(record, index)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-4 ${column.className || ""}`}
                    >
                      {renderCell(column, record, index)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <div className="text-center py-12">
          {emptyIcon}
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {emptyText}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Không tìm thấy dữ liệu phù hợp với bộ lọc hiện tại.
          </p>
        </div>
      )}
    </div>
  );
}

export default Table;
