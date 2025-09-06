"use client";

import React, { useState } from "react";
import {
  Users,
  Building2,
  FileText
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InventorySession } from "@/types/asset";
import { InventoryProcess } from "./InventoryProcess";
import InventoryCommitteeManager from "./InventoryCommitteeManager";
import InventorySubCommitteeManagerNew from "./InventorySubCommitteeManagerNew";
import InventoryAssignmentManager from "./InventoryAssignmentManager";

interface InventorySessionTabsProps {
  session: InventorySession;
}

export default function InventorySessionTabs({ session }: InventorySessionTabsProps) {
  const [activeTab, setActiveTab] = useState("committees");

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
    switch (activeTab) {
      case "progress":
        return (
          <InventoryProcess />
        );

      case "committees":
        return <InventoryCommitteeManager session={session} />;

      case "groups":
        return session.committees ? (
          <div className="mt-6">
            <InventorySubCommitteeManagerNew committee={session.committees} />
          </div>
        ) : (
          <div className="mt-6 text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tiểu ban & Nhóm</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Vui lòng tạo Ban kiểm kê trước khi thiết lập Tiểu ban & Nhóm kiểm kê.
            </p>
          </div>
        );
        
      case "assignments":
        return (
          <div className="mt-6">
            <InventoryAssignmentManager session={session} />
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
