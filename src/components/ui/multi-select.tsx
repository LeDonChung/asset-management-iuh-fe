"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Check } from "lucide-react";

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Chọn...",
  className = "",
  disabled = false
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOptions = options.filter(option => value.includes(option.value));

  const toggleOption = (optionValue: string) => {
    console.log('MultiSelect toggleOption:', optionValue);
    console.log('Current value:', value);
    if (value.includes(optionValue)) {
      const newValue = value.filter(v => v !== optionValue);
      console.log('Removing, new value:', newValue);
      onChange(newValue);
    } else {
      const newValue = [...value, optionValue];
      console.log('Adding, new value:', newValue);
      onChange(newValue);
    }
  };

  const removeOption = (optionValue: string) => {
    onChange(value.filter(v => v !== optionValue));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Main Input */}
      <div
        className={`h-[38px] w-full px-3 py-2 border border-gray-300 rounded bg-white cursor-pointer focus-within:border-blue-500 focus-within:outline-none text-sm ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between h-full">
          <div className="flex-1">
            {selectedOptions.length === 0 ? (
              <span className="text-gray-500">{placeholder}</span>
            ) : (
              <span className="text-gray-900">
                {selectedOptions.length === 1 
                  ? selectedOptions[0].label
                  : `${selectedOptions.length} mục đã chọn`
                }
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            {selectedOptions.length > 0 && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearAll();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform ${
                isOpen ? 'transform rotate-180' : ''
              }`}
            />
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-200">
            <input
              ref={inputRef}
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
              autoFocus
            />
          </div>

          {/* Options */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                Không tìm thấy kết quả
              </div>
            ) : (
              <>
                {/* Select All */}
                <div
                  className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer border-b border-gray-100 font-medium text-blue-600"
                  onClick={() => {
                    if (value.length === filteredOptions.length) {
                      clearAll();
                    } else {
                      onChange(filteredOptions.map(opt => opt.value));
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      {value.length === filteredOptions.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </span>
                    {value.length === filteredOptions.length && (
                      <Check className="h-4 w-4" />
                    )}
                  </div>
                </div>

                {/* Individual Options */}
                {filteredOptions.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <div
                      key={option.value}
                      className={`px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center justify-between ${
                        isSelected ? 'bg-blue-50 text-blue-700' : ''
                      }`}
                      onClick={() => toggleOption(option.value)}
                    >
                      <span>{option.label}</span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer */}
          {selectedOptions.length > 0 && (
            <div className="p-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
              Đã chọn {selectedOptions.length} mục
            </div>
          )}
        </div>
      )}
    </div>
  );
}
