"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MultiSelect from "@/components/ui/multi-select";
import { Plus, X, Filter, RotateCcw } from "lucide-react";

// Backend filter enums and types
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

export interface FilterCondition {
  id: string;
  field: string;
  fieldType: FieldType;
  operator: FilterOperator;
  value: any[];
  dateFrom?: string;
  dateTo?: string;
  sort?: 'asc' | 'desc';
}

export interface AdvancedFilterState {
  conditions: FilterCondition[];
  conditionLogic: ConditionLogic;
}

interface FilterOption {
  value: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
}

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

// Operator options based on field type
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
    case FieldType.DATE:
      return [
        { value: FilterOperator.EQUALS, label: 'Bằng' },
        { value: FilterOperator.GREATER_THAN, label: 'Sau ngày' },
        { value: FilterOperator.GREATER_THAN_OR_EQUAL, label: 'Từ ngày' },
        { value: FilterOperator.LESS_THAN, label: 'Trước ngày' },
        { value: FilterOperator.LESS_THAN_OR_EQUAL, label: 'Đến ngày' },
        { value: FilterOperator.BETWEEN, label: 'Trong khoảng' }
      ];
    case FieldType.SELECT:
      return [
        { value: FilterOperator.EQUALS, label: 'Bằng' },
        { value: FilterOperator.IN, label: 'Trong danh sách' },
        { value: FilterOperator.NOT_IN, label: 'Không trong danh sách' }
      ];
    case FieldType.BOOLEAN:
      return [
        { value: FilterOperator.EQUALS, label: 'Bằng' }
      ];
    default:
      return [
        { value: FilterOperator.CONTAINS, label: 'Chứa' },
        { value: FilterOperator.EQUALS, label: 'Bằng' }
      ];
  }
};

// Condition logic options
const conditionLogicOptions = [
  { value: ConditionLogic.AND, label: 'Tất cả điều kiện (AND)' },
  { value: ConditionLogic.OR, label: 'Bất kỳ điều kiện (OR)' },
  { value: ConditionLogic.CONTAINS, label: 'Chứa' }
];

export default function AdvancedFilter({
  title = "Bộ lọc nâng cao",
  filterOptions,
  conditions,
  conditionLogic = ConditionLogic.AND,
  onConditionsChange,
  onConditionLogicChange,
  onApply,
  onReset,
  className = ""
}: AdvancedFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [textInputs, setTextInputs] = useState<Record<string, string>>({});

  const addCondition = () => {
    // Get available fields (not used in any condition)
    const usedFields = conditions.map(condition => condition.field);
    const availableFields = filterOptions.filter(option => !usedFields.includes(option.value));
    
    // Only add if there are available fields
    if (availableFields.length === 0) {
      return;
    }
    
    const firstAvailableOption = availableFields[0];
    const defaultOperator = getOperatorOptions(firstAvailableOption.type)[0]?.value || FilterOperator.CONTAINS;
    
    // Initialize value array based on operator
    let initialValue: any[] = [];
    if (defaultOperator === FilterOperator.BETWEEN) {
      initialValue = ['', '']; // Initialize with two empty values for BETWEEN
    }
    
    const newCondition: FilterCondition = {
      id: `condition-${Date.now()}`,
      field: firstAvailableOption?.value || '',
      fieldType: firstAvailableOption?.type || FieldType.TEXT,
      operator: defaultOperator,
      value: initialValue
    };
    onConditionsChange([...conditions, newCondition]);
  };

  const updateCondition = (id: string, updates: Partial<FilterCondition>) => {
    const updatedConditions = conditions.map(condition =>
      condition.id === id ? { ...condition, ...updates } : condition
    );
    onConditionsChange(updatedConditions);
  };

  const removeCondition = (id: string) => {
    const filteredConditions = conditions.filter(condition => condition.id !== id);
    onConditionsChange(filteredConditions);
    
    // Clear text input for removed condition
    setTextInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[id];
      return newInputs;
    });
  };

  const getFieldOption = (fieldValue: string) => {
    return filterOptions.find(option => option.value === fieldValue);
  };

  // Get available fields (not used in other conditions)
  const getAvailableFields = (currentConditionId: string) => {
    const usedFields = conditions
      .filter(condition => condition.id !== currentConditionId)
      .map(condition => condition.field);
    
    return filterOptions.filter(option => !usedFields.includes(option.value));
  };

  const getOperatorLabel = (operatorValue: FilterOperator, fieldType: FieldType) => {
    const options = getOperatorOptions(fieldType);
    return options.find(op => op.value === operatorValue)?.label || operatorValue;
  };

  const getFieldLabel = (fieldValue: string) => {
    return getFieldOption(fieldValue)?.label || fieldValue;
  };

  const getValueDisplay = (condition: FilterCondition) => {
    const fieldOption = getFieldOption(condition.field);
    
    // Date range display
    if (condition.fieldType === FieldType.DATE) {
      if (condition.operator === FilterOperator.BETWEEN) {
        if (condition.dateFrom && condition.dateTo) {
          return `${condition.dateFrom} - ${condition.dateTo}`;
        } else if (condition.dateFrom) {
          return `Từ ${condition.dateFrom}`;
        } else if (condition.dateTo) {
          return `Đến ${condition.dateTo}`;
        }
      } else if (Array.isArray(condition.value) && condition.value.length > 0) {
        return condition.value[0];
      }
      return '';
    }
    
    if (condition.fieldType === FieldType.SELECT && fieldOption?.options) {
      if (Array.isArray(condition.value)) {
        const selectedOptions = fieldOption.options.filter(opt => 
          condition.value.includes(opt.value)
        );
        return selectedOptions.length > 2 
          ? `${selectedOptions.slice(0, 2).map(opt => opt.label).join(', ')} +${selectedOptions.length - 2}`
          : selectedOptions.map(opt => opt.label).join(', ');
      }
    }
    
    if (condition.fieldType === FieldType.BOOLEAN) {
      const value = Array.isArray(condition.value) ? condition.value[0] : condition.value;
      return value === 'true' ? 'Có' : value === 'false' ? 'Không' : value;
    }
    
    return Array.isArray(condition.value) ? condition.value.join(', ') : '';
  };

  const hasActiveFilters = conditions.length > 0 && conditions.some(c => {
    // Date fields check dateFrom or dateTo
    if (c.fieldType === FieldType.DATE) {
      return c.dateFrom || c.dateTo || (Array.isArray(c.value) && c.value.length > 0);
    }
    
    if (Array.isArray(c.value)) {
      return c.value.length > 0 && c.value.some(v => v !== null && v !== undefined && v !== '');
    }
    return false; // Always use array for values
  });

  return (
    <div className={`bg-white rounded-lg ${className}`}>
      {/* Header - Only show if title is provided */}
      {title && (
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-gray-900">{title}</h3>
            <div className="flex items-center space-x-2">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  className="text-gray-600 hover:text-red-600 border-gray-200 hover:border-red-300 hover:bg-red-50 text-xs px-3 py-1.5"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter Tags */}
      {hasActiveFilters && (
        <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1 mr-3">
              <Filter className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Đang lọc:</span>
            </div>
            {conditions
              .filter(condition => {
                // Date fields check dateFrom or dateTo
                if (condition.fieldType === FieldType.DATE) {
                  return condition.dateFrom || condition.dateTo || (Array.isArray(condition.value) && condition.value.length > 0);
                }
                
                if (Array.isArray(condition.value)) {
                  return condition.value.length > 0 && condition.value.some(v => v !== null && v !== undefined && v !== '');
                }
                return false; // Always use array for values
              })
              .map((condition) => (
                <div
                  key={condition.id}
                  className="inline-flex items-center bg-white border border-blue-200 text-blue-800 text-xs px-2.5 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className="font-medium text-gray-700">
                    {getFieldLabel(condition.field)}
                  </span>
                  <span className="mx-1.5 text-blue-500 font-medium">
                    {getOperatorLabel(condition.operator, condition.fieldType).toLowerCase()}
                  </span>
                  <span className="text-blue-800 font-medium max-w-32 truncate">
                    {getValueDisplay(condition)}
                  </span>
                  <button
                    onClick={() => removeCondition(condition.id)}
                    className="ml-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Filter Form */}
      <div className="space-y-4">
        {/* Always show expanded form in modal */}
        <div className="px-4 py-4 space-y-4">
          {/* Condition Logic Selector */}
          {conditions.length > 1 && onConditionLogicChange && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-center gap-3">
                <span className="text-sm font-medium text-gray-700">Áp dụng:</span>
                <select
                  value={conditionLogic}
                  onChange={(e) => onConditionLogicChange(e.target.value as ConditionLogic)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded bg-white focus:border-blue-500 focus:outline-none"
                >
                  {conditionLogicOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-600">điều kiện</span>
              </div>
            </div>
          )}
          
          {conditions.map((condition, index) => {
            const fieldOption = getFieldOption(condition.field);
            
            return (
              <div key={condition.id} className="bg-white rounded-lg border border-gray-200">
                {/* Logic Connector */}
                {index > 0 && (
                  <div className="flex justify-center -mt-2 mb-3">
                    <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                      {conditionLogic === ConditionLogic.AND ? 'VÀ' : 
                       conditionLogic === ConditionLogic.OR ? 'HOẶC' : 
                       conditionLogic === ConditionLogic.CONTAINS ? 'CHỨA' : 'VÀ'}
                    </span>
                  </div>
                )}
                
                <div className="p-3 space-y-3">
                  {/* Form Controls - Responsive Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Field Selection */}
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-600">Trường</label>
                      <select
                        value={condition.field}
                        onChange={(e) => {
                          const newFieldOption = getFieldOption(e.target.value);
                          const defaultOperator = getOperatorOptions(newFieldOption?.type || FieldType.TEXT)[0]?.value || FilterOperator.CONTAINS;
                          
                          // Initialize value array based on operator
                          let initialValue: any[] = [];
                          if (defaultOperator === FilterOperator.BETWEEN) {
                            initialValue = ['', '']; // Initialize with two empty values for BETWEEN
                          }
                          
                          updateCondition(condition.id, { 
                            field: e.target.value,
                            fieldType: newFieldOption?.type || FieldType.TEXT,
                            operator: defaultOperator,
                            value: initialValue,
                            dateFrom: undefined,
                            dateTo: undefined
                          });
                          // Clear text input for this condition
                          setTextInputs(prev => ({
                            ...prev,
                            [condition.id]: ''
                          }));
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:border-blue-500 focus:outline-none"
                      >
                        {getAvailableFields(condition.id).map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Operator Selection */}
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-600">Điều kiện</label>
                      <select
                        value={condition.operator}
                        onChange={(e) => {
                          const newOperator = e.target.value as FilterOperator;
                          
                          // Initialize value array based on operator
                          let newValue = [...condition.value];
                          if (newOperator === FilterOperator.BETWEEN) {
                            // Ensure we have two values for BETWEEN
                            if (newValue.length < 2) {
                              newValue = [newValue[0] || '', newValue[1] || ''];
                            }
                          }
                          
                          updateCondition(condition.id, { 
                            operator: newOperator,
                            value: newValue,
                            // Clear date fields when switching operators
                            dateFrom: newOperator === FilterOperator.BETWEEN && condition.fieldType === FieldType.DATE ? condition.dateFrom : undefined,
                            dateTo: newOperator === FilterOperator.BETWEEN && condition.fieldType === FieldType.DATE ? condition.dateTo : undefined
                          });
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:border-blue-500 focus:outline-none"
                      >
                        {getOperatorOptions(condition.fieldType || FieldType.TEXT).map(op => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Remove Button */}
                    <div className="space-y-1 flex items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeCondition(condition.id)}
                        className="w-full md:w-auto px-3 py-2 text-red-500 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1 md:mr-0" />
                        <span className="md:hidden">Xóa</span>
                      </Button>
                    </div>
                  </div>

                  {/* Value Input Section - Full Width */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-600">Giá trị</label>
                    {(() => {
                      // Handle different field types and operators
                      if (condition.fieldType === FieldType.SELECT && fieldOption?.options) {
                        return (
                          <MultiSelect
                            options={fieldOption.options}
                            value={Array.isArray(condition.value) ? condition.value : []}
                            onChange={(newValue) => updateCondition(condition.id, { value: newValue })}
                            placeholder="Chọn giá trị..."
                            className="w-full"
                          />
                        );
                      }

                      if (condition.fieldType === FieldType.BOOLEAN) {
                        return (
                          <select
                            value={condition.value[0] || ''}
                            onChange={(e) => updateCondition(condition.id, { value: [e.target.value] })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:border-blue-500 focus:outline-none"
                          >
                            <option value="">Chọn giá trị...</option>
                            <option value="true">Có</option>
                            <option value="false">Không</option>
                          </select>
                        );
                      }

                      if (condition.fieldType === FieldType.DATE) {
                        if (condition.operator === FilterOperator.BETWEEN) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Từ ngày</label>
                              <Input
                                type="date"
                                value={condition.dateFrom || ''}
                                onChange={(e) => updateCondition(condition.id, { dateFrom: e.target.value })}
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Đến ngày</label>
                              <Input
                                type="date"
                                value={condition.dateTo || ''}
                                onChange={(e) => updateCondition(condition.id, { dateTo: e.target.value })}
                                className="text-sm"
                              />
                            </div>
                          </div>
                        );
                        } else {
                          return (
                            <Input
                              type="date"
                              value={condition.value[0] || ''}
                              onChange={(e) => updateCondition(condition.id, { value: [e.target.value] })}
                              className="text-sm"
                              placeholder="Chọn ngày..."
                            />
                          );
                        }
                      }

                      if (condition.fieldType === FieldType.NUMBER) {
                        if (condition.operator === FilterOperator.BETWEEN) {
                          return (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <Input
                                type="number"
                                value={condition.value[0] || ''}
                                onChange={(e) => {
                                  const newValue = [...condition.value];
                                  // Ensure array has at least 2 elements
                                  while (newValue.length < 2) {
                                    newValue.push('');
                                  }
                                  newValue[0] = e.target.value;
                                  updateCondition(condition.id, { value: newValue });
                                }}
                                placeholder="Từ..."
                                className="text-sm"
                              />
                              <Input
                                type="number"
                                value={condition.value[1] || ''}
                                onChange={(e) => {
                                  const newValue = [...condition.value];
                                  // Ensure array has at least 2 elements
                                  while (newValue.length < 2) {
                                    newValue.push('');
                                  }
                                  newValue[1] = e.target.value;
                                  updateCondition(condition.id, { value: newValue });
                                }}
                                placeholder="Đến..."
                                className="text-sm"
                              />
                            </div>
                          );
                        } else if ([FilterOperator.IN, FilterOperator.NOT_IN].includes(condition.operator)) {
                          // Multiple number input
                          const addNumber = () => {
                        const inputValue = (textInputs[condition.id] || '').trim();
                            if (!inputValue) return;
                            
                            const currentValues = Array.isArray(condition.value) ? condition.value : [];
                            if (!currentValues.includes(inputValue)) {
                              updateCondition(condition.id, { value: [...currentValues, inputValue] });
                              setTextInputs(prev => ({ ...prev, [condition.id]: '' }));
                            }
                          };

                          return (
                            <div className="flex items-center space-x-2">
                              <div className="flex-1">
                                <Input
                                  type="number"
                                  placeholder="Nhập số..."
                                  value={textInputs[condition.id] || ''}
                                  onChange={(e) => setTextInputs(prev => ({ ...prev, [condition.id]: e.target.value }))}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      addNumber();
                                    }
                                  }}
                                  className="text-sm"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addNumber}
                                className="px-3 py-2 text-blue-600 border-blue-300 hover:bg-blue-50"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        } else {
                          return (
                            <Input
                              type="number"
                              value={condition.value[0] || ''}
                              onChange={(e) => updateCondition(condition.id, { value: [e.target.value] })}
                              placeholder="Nhập số..."
                              className="text-sm"
                            />
                          );
                        }
                      }

                      // Handle text fields (default case)
                      if ([FilterOperator.IN, FilterOperator.NOT_IN].includes(condition.operator)) {
                        // Multiple text input
                        const addKeyword = () => {
                          const inputValue = (textInputs[condition.id] || '').trim();
                          if (!inputValue) return;
                          
                          const currentValues = Array.isArray(condition.value) ? condition.value : [];
                          if (!currentValues.includes(inputValue)) {
                            updateCondition(condition.id, { value: [...currentValues, inputValue] });
                            setTextInputs(prev => ({ ...prev, [condition.id]: '' }));
                        }
                      };

                      return (
                        <div className="flex items-center space-x-2">
                          <div className="flex-1">
                            <Input
                              type="text"
                              placeholder="Nhập từ khóa..."
                              value={textInputs[condition.id] || ''}
                                onChange={(e) => setTextInputs(prev => ({ ...prev, [condition.id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addKeyword();
                                }
                              }}
                              className="text-sm"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addKeyword}
                            className="px-3 py-2 text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                      } else {
                        // Single text input
                        return (
                          <Input
                            type="text"
                            value={condition.value[0] || ''}
                            onChange={(e) => updateCondition(condition.id, { value: [e.target.value] })}
                            placeholder="Nhập giá trị..."
                            className="text-sm"
                          />
                        );
                      }
                    })()}
                  </div>

                  {/* Selected Values Tags */}
                  {(condition.fieldType === FieldType.DATE && (condition.dateFrom || condition.dateTo || (Array.isArray(condition.value) && condition.value.length > 0))) || 
                   (condition.fieldType !== FieldType.DATE && Array.isArray(condition.value) && condition.value.length > 0 && condition.value.some(v => v !== null && v !== undefined && v !== '')) ? (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap gap-1.5">
                        {/* Date Range Tags */}
                        {condition.fieldType === FieldType.DATE && (condition.dateFrom || condition.dateTo) && (
                          <span className="inline-flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            {condition.dateFrom && condition.dateTo 
                              ? `${condition.dateFrom} - ${condition.dateTo}`
                              : condition.dateFrom 
                                ? `Từ ${condition.dateFrom}`
                                : `Đến ${condition.dateTo}`
                            }
                            <button
                              onClick={() => updateCondition(condition.id, { dateFrom: '', dateTo: '' })}
                              className="ml-1 text-green-600 hover:text-green-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        )}

                        {/* Multi-select Tags */}
                        {condition.fieldType !== FieldType.DATE && Array.isArray(condition.value) && condition.value.length > 0 && 
                          condition.value.map((val) => {
                            const option = fieldOption?.options?.find(opt => opt.value === val);
                            const displayLabel = option?.label || val;
                            
                            return (
                              <span
                                key={val}
                                className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                              >
                                {displayLabel}
                                <button
                                  onClick={() => {
                                    const newValue = (condition.value as string[]).filter(v => v !== val);
                                    updateCondition(condition.id, { value: newValue });
                                  }}
                                  className="ml-1 text-blue-600 hover:text-blue-800"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            );
                          })
                        }
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}

          {/* Add Condition Button */}
          <div className="flex justify-center py-4">
            <Button
              variant="outline"
              onClick={addCondition}
              disabled={conditions.length >= filterOptions.length}
              className="text-green-600 hover:bg-green-50 border-green-200 hover:border-green-300 disabled:text-gray-400 disabled:hover:bg-transparent disabled:border-gray-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm điều kiện
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={onReset}
                className="text-gray-600 hover:text-red-600 border-gray-300 hover:border-red-300 hover:bg-red-50"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Xóa bộ lọc
              </Button>
            )}
            
            <Button
              onClick={() => {
                // Log data để gửi lên server
                const filterData = {
                  conditionLogic,
                  conditions: conditions.map(condition => {
                    const fieldOption = getFieldOption(condition.field);
                    return {
                      id: condition.id,
                      field: condition.field,
                      fieldLabel: fieldOption?.label,
                      fieldType: fieldOption?.type,
                      operator: condition.operator,
                      operatorLabel: getOperatorOptions(condition.fieldType).find(op => op.value === condition.operator)?.label,
                      value: condition.value,
                      dateFrom: condition.dateFrom,
                      dateTo: condition.dateTo,
                      hasValue: (() => {
                        if (condition.fieldType === FieldType.DATE) {
                          return !!(condition.dateFrom || condition.dateTo || (Array.isArray(condition.value) && condition.value.length > 0));
                        }
                        if (Array.isArray(condition.value)) {
                          return condition.value.length > 0 && condition.value.some(v => v !== null && v !== undefined && v !== '');
                        }
                        return false;
                      })()
                    };
                  }).filter(c => c.hasValue),
                  summary: {
                    totalConditions: conditions.length,
                    activeConditions: conditions.filter(c => {
                      if (c.fieldType === FieldType.DATE) {
                        return c.dateFrom || c.dateTo || (Array.isArray(c.value) && c.value.length > 0);
                      }
                      if (Array.isArray(c.value)) {
                        return c.value.length > 0 && c.value.some(v => v !== null && v !== undefined && v !== '');
                      }
                      return false;
                    }).length,
                    logic: conditionLogic,
                    logicLabel: conditionLogic === ConditionLogic.AND ? 'Tất cả điều kiện' : 
                               conditionLogic === ConditionLogic.OR ? 'Bất kỳ điều kiện' : 'Chứa'
                  }
                };

                onApply();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-medium rounded"
              disabled={!hasActiveFilters}
            >
              Áp dụng bộ lọc
              {hasActiveFilters && (
                <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  {conditions.filter(c => {
                    if (c.fieldType === FieldType.DATE) {
                      return c.dateFrom || c.dateTo || (Array.isArray(c.value) && c.value.length > 0);
                    }
                    if (Array.isArray(c.value)) {
                      return c.value.length > 0 && c.value.some(v => v !== null && v !== undefined && v !== '');
                    }
                    return false;
                  }).length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

