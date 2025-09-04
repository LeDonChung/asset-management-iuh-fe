"use client";

import React from "react";
import { 
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Users,
  Building
} from "lucide-react";

interface ProgressIndicatorProps {
  completed: number;
  inProgress: number;
  notStarted: number;
  overdue: number;
  className?: string;
}

export default function ProgressIndicator({ 
  completed, 
  inProgress, 
  notStarted, 
  overdue,
  className = "" 
}: ProgressIndicatorProps) {
  const total = completed + inProgress + notStarted + overdue;
  const completedPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-blue-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getProgressTextColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-blue-600";
    if (percentage >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className={`bg-white rounded-lg border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Tiến độ kiểm kê</h3>
        <span className={`text-2xl font-bold ${getProgressTextColor(completedPercentage)}`}>
          {completedPercentage}%
        </span>
      </div>
      
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(completedPercentage)}`}
            style={{ width: `${completedPercentage}%` }}
          ></div>
        </div>
        <div className="text-sm text-gray-600 mt-1">
          {completed}/{total} đơn vị đã hoàn thành
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-gray-600">Hoàn thành:</span>
          <span className="font-semibold text-green-600">{completed}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-blue-500" />
          <span className="text-gray-600">Đang thực hiện:</span>
          <span className="font-semibold text-blue-600">{inProgress}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600">Chưa bắt đầu:</span>
          <span className="font-semibold text-gray-600">{notStarted}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <span className="text-gray-600">Quá hạn:</span>
          <span className="font-semibold text-red-600">{overdue}</span>
        </div>
      </div>
    </div>
  );
}
