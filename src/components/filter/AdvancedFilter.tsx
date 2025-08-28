"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MultiSelect from "@/components/ui/multi-select";
import { Plus, X, Filter, RotateCcw } from "lucide-react";

export interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: string | string[];
  dateFrom?: string;
  dateTo?: string;
  label?: string;
}

export interface AdvancedFilterState {
  conditions: FilterCondition[];
  conditionLogic: 'contains' | 'equals' | 'not_contains'; // Tất cả | Bất kì | Không
}

interface FilterOption {
  value: string;
  label: string;
  type: 'text' | 'select' | 'date';
  options?: { value: string; label: string }[];
}

interface AdvancedFilterProps {
  title?: string;
  filterOptions: FilterOption[];
  conditions: FilterCondition[];
  conditionLogic?: 'contains' | 'equals' | 'not_contains';
  onConditionsChange: (conditions: FilterCondition[]) => void;
  onConditionLogicChange?: (logic: 'contains' | 'equals' | 'not_contains') => void;
  onApply: () => void;
  onReset: () => void;
  className?: string;
}

const operatorOptions = [
  { value: 'contains', label: 'Tất cả' },
  { value: 'equals', label: 'Bất kì' },
  { value: 'not_contains', label: 'Không' }
];

export default function AdvancedFilter({
  title = "Người dùng đã ghi danh",
  filterOptions,
  conditions,
  conditionLogic = 'contains',
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
    
    const newCondition: FilterCondition = {
      id: `condition-${Date.now()}`,
      field: firstAvailableOption?.value || '',
      operator: 'contains', // Mặc định "Tất cả"
      value: firstAvailableOption?.type === 'select' ? [] : [] // Always start with array for consistency
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

  const getOperatorLabel = (operatorValue: string) => {
    return operatorOptions.find(op => op.value === operatorValue)?.label || operatorValue;
  };

  const getFieldLabel = (fieldValue: string) => {
    return getFieldOption(fieldValue)?.label || fieldValue;
  };

  const getValueDisplay = (condition: FilterCondition) => {
    const fieldOption = getFieldOption(condition.field);
    
    // Date range display
    if (fieldOption?.type === 'date') {
      if (condition.dateFrom && condition.dateTo) {
        return `${condition.dateFrom} - ${condition.dateTo}`;
      } else if (condition.dateFrom) {
        return `Từ ${condition.dateFrom}`;
      } else if (condition.dateTo) {
        return `Đến ${condition.dateTo}`;
      }
      return '';
    }
    
    if (fieldOption?.type === 'select' && fieldOption.options) {
      if (Array.isArray(condition.value)) {
        const selectedOptions = fieldOption.options.filter(opt => 
          condition.value.includes(opt.value)
        );
        return selectedOptions.length > 2 
          ? `${selectedOptions.slice(0, 2).map(opt => opt.label).join(', ')} +${selectedOptions.length - 2}`
          : selectedOptions.map(opt => opt.label).join(', ');
      } else {
        const selectedOption = fieldOption.options.find(opt => opt.value === condition.value);
        return selectedOption?.label || condition.value;
      }
    }
    return Array.isArray(condition.value) ? condition.value.join(', ') : condition.value;
  };

  const hasActiveFilters = conditions.length > 0 && conditions.some(c => {
    const fieldOption = getFieldOption(c.field);
    
    // Date fields check dateFrom or dateTo
    if (fieldOption?.type === 'date') {
      return c.dateFrom || c.dateTo;
    }
    
    if (Array.isArray(c.value)) {
      return c.value.length > 0;
    }
    return c.value && c.value !== '';
  });

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="text-gray-600 hover:text-red-600 border-gray-300 hover:border-red-300"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Xóa bộ lọc
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="border-gray-300 hover:border-blue-500 hover:text-blue-600"
            >
              <Filter className="h-4 w-4 mr-2" />
              Bộ lọc
              {hasActiveFilters && (
                <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                  {conditions.filter(c => c.value).length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Tags */}
      {hasActiveFilters && (
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600 mr-2">Bộ lọc:</span>
            {conditions
              .filter(condition => {
                const fieldOption = getFieldOption(condition.field);
                
                // Date fields check dateFrom or dateTo
                if (fieldOption?.type === 'date') {
                  return condition.dateFrom || condition.dateTo;
                }
                
                if (Array.isArray(condition.value)) {
                  return condition.value.length > 0;
                }
                return condition.value && condition.value !== '';
              })
              .map((condition) => (
                <div
                  key={condition.id}
                  className="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                >
                  <span className="mr-1 font-medium">
                    {getFieldLabel(condition.field)}
                  </span>
                  <span className="mr-1 text-blue-600">
                    {getOperatorLabel(condition.operator)}
                  </span>
                  <span className="mr-2">
                    {getValueDisplay(condition)}
                  </span>
                  <button
                    onClick={() => removeCondition(condition.id)}
                    className="text-blue-600 hover:text-blue-800 ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Filter Form */}
      {isExpanded && (
        <div className="px-6 py-4 space-y-4">
          {/* Condition Logic Selector */}
          {conditions.length > 1 && onConditionLogicChange && (
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Áp dụng:</span>
              <select
                value={conditionLogic}
                onChange={(e) => onConditionLogicChange(e.target.value as 'contains' | 'equals' | 'not_contains')}
                className="px-3 py-1 text-sm border border-gray-300 rounded bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="contains">Tất cả</option>
                <option value="equals">Bất kì</option>
                <option value="not_contains">Không</option>
              </select>
              <span className="text-xs text-gray-500">dưới đây</span>
            </div>
          )}
          
          {conditions.map((condition, index) => {
            const fieldOption = getFieldOption(condition.field);
            
            return (
              <div key={condition.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex flex-wrap items-start gap-3">
                  {/* Logic Connector */}
                  {index > 0 && (
                    <div className="flex-shrink-0">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                        {conditionLogic === 'contains' ? 'VÀ' : 
                         conditionLogic === 'equals' ? 'HOẶC' : 'VÀ'}
                      </span>
                    </div>
                  )}
                  
                  {/* Field Selection */}
                  <div className="flex-shrink-0">
                    <select
                      value={condition.field}
                      onChange={(e) => {
                        const newFieldOption = getFieldOption(e.target.value);
                        updateCondition(condition.id, { 
                          field: e.target.value,
                          operator: 'contains', // Mặc định "Tất cả"
                          value: [] // Always reset to array
                        });
                        // Clear text input for this condition
                        setTextInputs(prev => ({
                          ...prev,
                          [condition.id]: ''
                        }));
                      }}
                      className="w-32 px-2 py-1.5 text-sm border border-gray-300 rounded bg-white focus:border-blue-500 focus:outline-none"
                    >
                      {getAvailableFields(condition.id).map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Operator Selection */}
                  <div className="flex-shrink-0">
                    <select
                      value={condition.operator}
                      onChange={(e) => updateCondition(condition.id, { operator: e.target.value })}
                      className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded bg-white focus:border-blue-500 focus:outline-none"
                    >
                      {operatorOptions.map(op => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Value Input */}
                  <div className="flex-1 min-w-0">
                  {(() => {
                    if (fieldOption?.type === 'select' && fieldOption.options) {
                      return (
                        <MultiSelect
                          options={fieldOption.options}
                          value={Array.isArray(condition.value) ? condition.value : []}
                          onChange={(newValue) => updateCondition(condition.id, { value: newValue })}
                          placeholder="Type or select..."
                          className="w-full min-w-0"
                        />
                      );
                    }

                    if (fieldOption?.type === 'date') {
                      return (
                        <div className="flex items-center space-x-2">
                          <div className="flex-1">
                            <Input
                              type="date"
                              placeholder="Từ ngày"
                              value={condition.dateFrom || ''}
                              onChange={(e) => updateCondition(condition.id, { dateFrom: e.target.value })}
                              className="text-sm"
                            />
                          </div>
                          <span className="text-gray-500 text-sm">đến</span>
                          <div className="flex-1">
                            <Input
                              type="date"
                              placeholder="Đến ngày"
                              value={condition.dateTo || ''}
                              onChange={(e) => updateCondition(condition.id, { dateTo: e.target.value })}
                              className="text-sm"
                            />
                          </div>
                        </div>
                      );
                    }

                    const addKeyword = () => {
                      const inputValue = (textInputs[condition.id] || '').trim();
                      if (!inputValue) {
                        console.log('No input value');
                        return;
                      }
                      
                      console.log('Adding keyword:', inputValue);
                      console.log('Current condition.value:', condition.value);
                      
                      const currentValues = Array.isArray(condition.value) 
                        ? condition.value 
                        : condition.value && condition.value !== '' ? [condition.value as string] : [];
                      
                      console.log('Current values array:', currentValues);
                      
                      if (!currentValues.includes(inputValue)) {
                        const newValues = [...currentValues, inputValue];
                        console.log('New values:', newValues);
                        updateCondition(condition.id, { value: newValues });
                        setTextInputs(prev => ({
                          ...prev,
                          [condition.id]: ''
                        }));
                      } else {
                        console.log('Value already exists');
                      }
                    };

                    return (
                      <div className="flex items-center space-x-2 min-w-0">
                        <div className="flex-1 min-w-0">
                          <Input
                            type="text"
                            placeholder="Nhập từ khóa..."
                            value={textInputs[condition.id] || ''}
                            onChange={(e) => {
                              setTextInputs(prev => ({
                                ...prev,
                                [condition.id]: e.target.value
                              }));
                              // Don't sync with condition.value - text input is just for adding keywords
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addKeyword();
                              }
                            }}
                            className="text-sm w-full"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addKeyword}
                          className="px-2 py-1.5 text-blue-600 border-blue-300 hover:bg-blue-50 flex-shrink-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })()}
                </div>

                {/* Selected Values Tags */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {/* Date Range Tags */}
                  {fieldOption?.type === 'date' && (condition.dateFrom || condition.dateTo) && (
                    <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {condition.dateFrom && condition.dateTo 
                        ? `${condition.dateFrom} - ${condition.dateTo}`
                        : condition.dateFrom 
                          ? `Từ ${condition.dateFrom}`
                          : `Đến ${condition.dateTo}`
                      }
                      <button
                        onClick={() => updateCondition(condition.id, { dateFrom: '', dateTo: '' })}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}

                  {/* Multi-select Tags */}
                  {fieldOption?.type !== 'date' && Array.isArray(condition.value) && condition.value.length > 0 && 
                    condition.value.map((val) => {
                      const option = fieldOption?.options?.find(opt => opt.value === val);
                      const displayLabel = option?.label || val;
                      
                      return (
                        <span
                          key={val}
                          className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
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
                  
                  {/* Single Value Tags */}
                  {fieldOption?.type !== 'date' && !Array.isArray(condition.value) && condition.value && (
                    <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {condition.value}
                      <button
                        onClick={() => updateCondition(condition.id, { value: '' })}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>

                  {/* Remove Condition Button */}
                  <div className="flex-shrink-0 ml-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCondition(condition.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={addCondition}
              disabled={conditions.length >= filterOptions.length}
              className="text-green-600 hover:bg-green-50 text-sm disabled:text-gray-400 disabled:hover:bg-transparent"
            >
              <Plus className="h-4 w-4 mr-1" />
              Thêm điều kiện
              {conditions.length >= filterOptions.length && (
                <span className="ml-1 text-xs text-gray-500">(Đã đủ)</span>
              )}
            </Button>

            <div className="flex items-center space-x-3">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={onReset}
                  className="text-gray-600 hover:text-red-600 border-gray-300 hover:border-red-300"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Xóa bộ lọc
                </Button>
              )}
              <Button
                onClick={() => {
                  // Log data để gửi lên server
                  const filterData = {
                    conditionLogic, // 'contains' | 'equals' | 'not_contains'
                    conditions: conditions.map(condition => {
                      const fieldOption = getFieldOption(condition.field);
                      return {
                        id: condition.id,
                        field: condition.field,
                        fieldLabel: fieldOption?.label,
                        fieldType: fieldOption?.type,
                        operator: condition.operator,
                        operatorLabel: operatorOptions.find(op => op.value === condition.operator)?.label,
                        value: condition.value,
                        dateFrom: condition.dateFrom,
                        dateTo: condition.dateTo,
                        // For server: clean data
                        hasValue: (() => {
                          if (fieldOption?.type === 'date') {
                            return !!(condition.dateFrom || condition.dateTo);
                          }
                          if (Array.isArray(condition.value)) {
                            return condition.value.length > 0;
                          }
                          return !!(condition.value && condition.value !== '');
                        })()
                      };
                    }).filter(c => c.hasValue), // Only send conditions with values
                    summary: {
                      totalConditions: conditions.length,
                      activeConditions: conditions.filter(c => {
                        const fieldOption = getFieldOption(c.field);
                        if (fieldOption?.type === 'date') {
                          return c.dateFrom || c.dateTo;
                        }
                        if (Array.isArray(c.value)) {
                          return c.value.length > 0;
                        }
                        return c.value && c.value !== '';
                      }).length,
                      logic: conditionLogic,
                      logicLabel: conditionLogic === 'contains' ? 'Tất cả' : 
                                 conditionLogic === 'equals' ? 'Bất kì' : 'Không'
                    }
                  };

                  console.log('=== FILTER DATA TO SEND TO SERVER ===');
                  console.log('Full Filter Object:', filterData);
                  console.log('JSON String:', JSON.stringify(filterData, null, 2));
                  console.log('Condition Logic:', filterData.conditionLogic);
                  console.log('Active Conditions:', filterData.conditions);
                  console.log('Summary:', filterData.summary);
                  console.log('=====================================');

                  // Call original onApply
                  onApply();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-semibold"
                disabled={conditions.length === 0}
              >
                Áp dụng bộ lọc
                {hasActiveFilters && (
                  <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {conditions.filter(c => {
                      const fieldOption = getFieldOption(c.field);
                      if (fieldOption?.type === 'date') {
                        return c.dateFrom || c.dateTo;
                      }
                      if (Array.isArray(c.value)) {
                        return c.value.length > 0;
                      }
                      return c.value && c.value !== '';
                    }).length}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
