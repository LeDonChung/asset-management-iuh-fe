"use client";

import React, { useState } from "react";
import {
  Users,
} from "lucide-react";
import { useAppSelector } from "@/lib/store/hooks";
import InventoryCommitteeManager from "./InventoryCommitteeManager";
import InventorySubCommitteeManager from "./InventorySubCommitteeManager";

interface InventorySessionTabsProps {
  // Remove props since we'll use Redux
}

export default function InventorySessionTabs({}: InventorySessionTabsProps) {
  const [activeTab, setActiveTab] = useState("committees");
  const { currentSession } = useAppSelector(state => state.inventory);
  
  // Use currentSession from Redux instead of prop
  const session = currentSession;

  const tabs = [
    {
      id: "committees",
      label: "Ban kiểm kê",
      icon: Users
    },
    {
      id: "groups",
      label: "Tiểu ban & Nhóm", 
      icon: Users
    },
  ];

  const renderTabContent = () => {
    if (!session) {
      return (
        <div className="mt-6 text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không có phiên kiểm kê</h3>
          <p className="text-gray-500">Vui lòng tải lại trang để xem thông tin.</p>
        </div>
      );
    }

    switch (activeTab) {
      case "committees":
        return <InventoryCommitteeManager />;

      case "groups":
        return (
          <div className="mt-6">
            <InventorySubCommitteeManager />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 py-2 px-1 text-sm font-medium whitespace-nowrap flex items-center space-x-2 ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      
      {renderTabContent()}
    </div>
  );
}
