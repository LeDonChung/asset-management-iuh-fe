"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

// Sort interfaces
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  key: string;
  order: SortOrder;
  priority: number; // For multi-column sorting
}

export interface SortFunction<T = any> {
  (a: T, b: T, sortOrder: SortOrder): number;
}

// Table interfaces
export interface TableColumn<T = any> {
  key: string;
  title: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string;
  className?: string;
  sortable?: boolean;
  sorter?: SortFunction<T> | boolean; // Custom sort function or true for default
  defaultSortOrder?: SortOrder;
  resizable?: boolean; // Enable column resizing
  minWidth?: number; // Minimum width in pixels
  maxWidth?: number; // Maximum width in pixels
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
    showQuickJumper?: boolean;
    showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  } | false;
  // Selection props
  rowSelection?: {
    selectedRowKeys?: string[];
    onChange?: (selectedRowKeys: string[], selectedRows: T[]) => void;
    onSelectAll?: (selected: boolean, selectedRows: T[], changeRows: T[]) => void;
    getCheckboxProps?: (record: T) => { disabled?: boolean };
  };
  // Sort props
  sortConfigs?: SortConfig[];
  onSortChange?: (sortConfigs: SortConfig[]) => void;
  multiSort?: boolean; // Enable multi-column sorting
  // Resize props
  columnWidths?: Record<string, number>; // Column widths in pixels
  onColumnWidthChange?: (columnKey: string, width: number) => void;
  resizable?: boolean; // Enable column resizing globally
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
  sortConfigs = [],
  onSortChange,
  multiSort = false,
  columnWidths = {},
  onColumnWidthChange,
  resizable = false,
  title,
  description,
  headerExtra,
}: TableProps<T>) {
  const [internalSortConfigs, setInternalSortConfigs] = useState<SortConfig[]>(
    sortConfigs.length > 0 ? sortConfigs : 
    columns.filter(col => col.defaultSortOrder).map((col, index) => ({
      key: col.key,
      order: col.defaultSortOrder!,
      priority: index
    }))
  );

  // Column widths state
  const [internalColumnWidths, setInternalColumnWidths] = useState<Record<string, number>>(() => {
    const initialWidths: Record<string, number> = {};
    columns.forEach(col => {
      if (col.width) {
        // Parse width string to number (e.g., "150px" -> 150)
        const numWidth = parseInt(col.width.replace('px', ''));
        if (!isNaN(numWidth)) {
          initialWidths[col.key] = numWidth;
        }
      }
    });
    return { ...initialWidths, ...columnWidths };
  });

  // Resize state
  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const resizeStartX = useRef<number>(0);
  const resizeStartWidth = useRef<number>(0);
  const tableRef = useRef<HTMLTableElement>(null);

  const currentSortConfigs = onSortChange ? sortConfigs : internalSortConfigs;
  const currentColumnWidths = onColumnWidthChange ? columnWidths : internalColumnWidths;

  // Column resize handlers
  const handleResizeStart = useCallback((columnKey: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizingColumn(columnKey);
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = currentColumnWidths[columnKey] || 150;
    
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [currentColumnWidths]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizingColumn) return;
    
    const deltaX = e.clientX - resizeStartX.current;
    const newWidth = Math.max(80, resizeStartWidth.current + deltaX); // Minimum 80px
    
    const column = columns.find(col => col.key === resizingColumn);
    const minWidth = column?.minWidth || 80;
    const maxWidth = column?.maxWidth || 1000;
    
    const constrainedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
    
    if (onColumnWidthChange) {
      onColumnWidthChange(resizingColumn, constrainedWidth);
    } else {
      setInternalColumnWidths(prev => ({
        ...prev,
        [resizingColumn]: constrainedWidth
      }));
    }
  }, [isResizing, resizingColumn, columns, onColumnWidthChange]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setResizingColumn(null);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  // Add global mouse event listeners for resize
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const getColumnWidth = (columnKey: string): number => {
    return currentColumnWidths[columnKey] || 150;
  };

  // Sort functions
  const defaultSorter = <T,>(a: T, b: T, key: string, order: SortOrder): number => {
    const aVal = (a as any)[key];
    const bVal = (b as any)[key];
    
    if (aVal === bVal) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    
    let result = 0;
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      result = aVal.localeCompare(bVal, 'vi', { numeric: true });
    } else if (typeof aVal === 'number' && typeof bVal === 'number') {
      result = aVal - bVal;
    } else if (aVal instanceof Date && bVal instanceof Date) {
      result = aVal.getTime() - bVal.getTime();
    } else {
      result = String(aVal).localeCompare(String(bVal), 'vi', { numeric: true });
    }
    
    return order === 'asc' ? result : -result;
  };

  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    let newSortConfigs: SortConfig[] = [];
    const existingSortIndex = currentSortConfigs.findIndex(config => config.key === columnKey);
    
    if (multiSort) {
      // Multi-column sorting
      if (existingSortIndex >= 0) {
        const existingSort = currentSortConfigs[existingSortIndex];
        if (existingSort.order === 'asc') {
          // Change to desc
          newSortConfigs = currentSortConfigs.map(config => 
            config.key === columnKey 
              ? { ...config, order: 'desc' as SortOrder }
              : config
          );
        } else {
          // Remove this sort
          newSortConfigs = currentSortConfigs.filter(config => config.key !== columnKey);
        }
      } else {
        // Add new sort
        newSortConfigs = [
          ...currentSortConfigs,
          { key: columnKey, order: 'asc', priority: currentSortConfigs.length }
        ];
      }
    } else {
      // Single column sorting
      if (existingSortIndex >= 0) {
        const existingSort = currentSortConfigs[existingSortIndex];
        if (existingSort.order === 'asc') {
          newSortConfigs = [{ key: columnKey, order: 'desc', priority: 0 }];
        } else {
          newSortConfigs = [];
        }
      } else {
        newSortConfigs = [{ key: columnKey, order: 'asc', priority: 0 }];
      }
    }

    if (onSortChange) {
      onSortChange(newSortConfigs);
    } else {
      setInternalSortConfigs(newSortConfigs);
    }
  };

  // Sort data
  const sortedData = useMemo(() => {
    if (currentSortConfigs.length === 0) return data;

    return [...data].sort((a, b) => {
      // Sort by priority (lowest first)
      const sortedConfigs = [...currentSortConfigs].sort((x, y) => x.priority - y.priority);
      
      for (const sortConfig of sortedConfigs) {
        const column = columns.find(col => col.key === sortConfig.key);
        if (!column) continue;

        let result = 0;
        if (typeof column.sorter === 'function') {
          result = column.sorter(a, b, sortConfig.order);
        } else if (column.sorter === true || column.sortable) {
          result = defaultSorter(a, b, sortConfig.key, sortConfig.order);
        }

        if (result !== 0) return result;
      }
      
      return 0;
    });
  }, [data, currentSortConfigs, columns]);

  // Pagination data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    
    const { current, pageSize } = pagination;
    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, pagination]);

  const displayData = pagination ? paginatedData : sortedData;

  const getSortIcon = (columnKey: string) => {
    const sortConfig = currentSortConfigs.find(config => config.key === columnKey);
    const priority = multiSort && currentSortConfigs.length > 1 ? 
      (sortConfig ? sortConfig.priority + 1 : null) : null;
    
    if (!sortConfig) {
      // No sorting - show neutral sort icon
      return (
        <div className="flex items-center ml-1">
          <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
      );
    }
    
    return (
      <div className="flex items-center ml-1">
        {sortConfig.order === 'asc' ? (
          // Ascending - triangle pointing up with solid fill
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 14l5-5 5 5H7z"/>
          </svg>
        ) : (
          // Descending - triangle pointing down with solid fill  
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5H7z"/>
          </svg>
        )}
        {priority && (
          <span className="text-xs text-blue-600 ml-1 font-semibold bg-blue-100 rounded px-1">
            {priority}
          </span>
        )}
      </div>
    );
  };

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
  const isAllSelected = displayData.length > 0 && selectedRowKeys.length === displayData.length;
  const isIndeterminate = selectedRowKeys.length > 0 && selectedRowKeys.length < displayData.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      rowSelection?.onChange?.([], []);
    } else {
      const allKeys = displayData.map((record, index) => getRowKey(record, index));
      rowSelection?.onChange?.(allKeys, displayData);
    }
    rowSelection?.onSelectAll?.(!isAllSelected, isAllSelected ? [] : displayData, displayData);
  };

  const handleSelectRow = (record: T, index: number) => {
    const key = getRowKey(record, index);
    const newSelectedKeys = selectedRowKeys.includes(key)
      ? selectedRowKeys.filter(k => k !== key)
      : [...selectedRowKeys, key];
    
    const selectedRows = sortedData.filter((item, idx) => 
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
        <table ref={tableRef} className="w-full table-fixed">
          <thead className="bg-gray-50">
            <tr>
              {rowSelection && (
                <th className="px-4 py-3 text-left w-16 relative">
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
              {columns.map((column, index) => {
                const isResizableColumn = (resizable || column.resizable !== false) && index < columns.length - 1;
                return (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                    } ${column.className || ""}`}
                    style={{ 
                      width: `${getColumnWidth(column.key)}px`,
                      minWidth: `${column.minWidth || 80}px`,
                      maxWidth: `${column.maxWidth || 1000}px`
                    }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {column.title}
                        {column.sortable && getSortIcon(column.key)}
                      </div>
                    </div>
                    
                    {/* Resize handle */}
                    {isResizableColumn && (
                      <div
                        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-300 bg-transparent transition-colors group"
                        onMouseDown={(e) => handleResizeStart(column.key, e)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="w-full h-full opacity-0 group-hover:opacity-100 bg-blue-400 transition-opacity" />
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayData.map((record, index) => {
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
                    <td className="px-4 py-4 w-16">
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
                      className={`px-4 py-4 overflow-hidden ${column.className || ""}`}
                      style={{ 
                        width: `${getColumnWidth(column.key)}px`,
                        maxWidth: `${getColumnWidth(column.key)}px`
                      }}
                    >
                      <div 
                        className="truncate" 
                        title={typeof renderCell(column, record, index) === 'string' 
                          ? renderCell(column, record, index) as string 
                          : undefined
                        }
                      >
                        {renderCell(column, record, index)}
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {displayData.length === 0 && (
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

      {/* Pagination */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white px-6 py-3 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-700">
            Hiển thị {(pagination.current - 1) * pagination.pageSize + 1} - {Math.min(pagination.current * pagination.pageSize, pagination.total)} trong tổng số {pagination.total} tài sản
          </div>
          
          <div className="flex items-center gap-4">
            {pagination.showSizeChanger && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Hiển thị:</span>
                <select
                  value={pagination.pageSize}
                  onChange={(e) => pagination.onChange(1, Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {(pagination.pageSizeOptions || [10, 20, 50, 100]).map(size => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Page navigation */}
            <div className="flex items-center">
              {/* First page */}
              <button
                onClick={() => pagination.onChange(1, pagination.pageSize)}
                disabled={pagination.current === 1}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Trang đầu"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Previous page */}
              <button
                onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
                disabled={pagination.current === 1}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Trang trước"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {(() => {
                  const totalPages = Math.ceil(pagination.total / pagination.pageSize);
                  const currentPage = pagination.current;
                  const delta = 2;
                  const range = [];
                  const rangeWithDots = [];

                  for (let i = Math.max(1, currentPage - delta); 
                       i <= Math.min(totalPages, currentPage + delta); 
                       i++) {
                    range.push(i);
                  }

                  // Always show first page
                  if (currentPage - delta > 1) {
                    rangeWithDots.push(1);
                    if (currentPage - delta > 2) {
                      rangeWithDots.push('...');
                    }
                  }

                  rangeWithDots.push(...range);

                  // Always show last page
                  if (currentPage + delta < totalPages) {
                    if (currentPage + delta < totalPages - 1) {
                      rangeWithDots.push('...');
                    }
                    rangeWithDots.push(totalPages);
                  }

                  return rangeWithDots.map((page, index) => {
                    if (page === '...') {
                      return (
                        <span key={`dots-${index}`} className="px-3 py-2 text-sm text-gray-500">
                          ...
                        </span>
                      );
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => pagination.onChange(page as number, pagination.pageSize)}
                        className={`min-w-[36px] px-3 py-2 text-sm rounded ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  });
                })()}
              </div>

              {/* Next page */}
              <button
                onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
                disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Trang sau"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {/* Last page */}
              <button
                onClick={() => pagination.onChange(Math.ceil(pagination.total / pagination.pageSize), pagination.pageSize)}
                disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Trang cuối"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Table;
