"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { 
  Users,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Target
} from "lucide-react";

interface SystemOverviewProps {
  stats: {
    totalSubCommittees: number;
    totalGroups: number;
    totalMembers: number;
    totalAssignments: number;
    completedAssignments: number;
    inProgressAssignments: number;
    overdueAssignments: number;
  };
}

export default function SystemOverview({ stats }: SystemOverviewProps) {
  const progressPercentage = stats.totalAssignments > 0 
    ? Math.round((stats.completedAssignments / stats.totalAssignments) * 100)
    : 0;
    
  const efficiency = stats.totalAssignments > 0
    ? Math.round(((stats.completedAssignments + stats.inProgressAssignments) / stats.totalAssignments) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600 font-medium mb-1">Tổng tiểu ban</p>
            <p className="text-3xl font-bold text-blue-700">{stats.totalSubCommittees}</p>
          </div>
          <div className="bg-blue-200 p-3 rounded-full">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </Card>
      
      <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-600 font-medium mb-1">Tổng nhóm kiểm kê</p>
            <p className="text-3xl font-bold text-green-700">{stats.totalGroups}</p>
          </div>
          <div className="bg-green-200 p-3 rounded-full">
            <Building className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </Card>
      
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-purple-600 font-medium mb-1">Thành viên tham gia</p>
            <p className="text-3xl font-bold text-purple-700">{stats.totalMembers}</p>
          </div>
          <div className="bg-purple-200 p-3 rounded-full">
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </Card>
    </div>
  );
}
