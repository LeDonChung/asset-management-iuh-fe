"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

import {
  LayoutDashboard,
  Package,
  Menu,
  X,
  LogOut,
  Asterisk,
  Package2,
  Building,
} from "lucide-react";

// Helper: Navigation by role
const getNavigationByRole = (userRole: string) => {
  const baseNavigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      roles: ["SUPER_ADMIN", "ADMIN"],
    },
    {
      name: "Dashboard",
      href: "/staff",
      icon: LayoutDashboard,
      roles: ["STAFF"],
    },
    {
      name: "Tài sản",
      href: "/asset",
      icon: Package2,
      roles: ["SUPER_ADMIN", "ADMIN"],
    },
    {
      name: "Đơn vị",
      href: "/unit",
      icon: Building,
      roles: ["SUPER_ADMIN", "ADMIN"],
    },
  ];
  return baseNavigation.filter((item) => item.roles.includes(userRole));
};

// Helper: Greeting
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return {
      text: "Chào buổi sáng",
      icon: (
        <svg
          className="w-8 h-8 text-orange-400 animate-pulse"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        </svg>
      ),
    };
  } else if (hour >= 12 && hour < 13) {
    return {
      text: "Chào buổi trưa",
      icon: (
        <svg
          className="w-8 h-8 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        </svg>
      ),
    };
  } else if (hour >= 13 && hour < 18) {
    return {
      text: "Chào buổi chiều",
      icon: (
        <svg
          className="w-8 h-8 text-amber-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            fillRule="evenodd"
            d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
            clipRule="evenodd"
          />
        </svg>
      ),
    };
  } else {
    return {
      text: "Chào buổi tối",
      icon: (
        <svg
          className="w-8 h-8 text-indigo-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            fillRule="evenodd"
            d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
            clipRule="evenodd"
          />
        </svg>
      ),
    };
  }
};

// Sidebar User Section
export const SidebarUserSection = React.memo(function SidebarUserSection({
  handleLogout,
}: {
  handleLogout: () => void;
}) {
  // Mock user data - thay thế bằng real data từ context/state management
  const mockUser = {
    name: "Lê Đôn Chủng",
    role: "ADMIN"
  };

  return (
    <div className="border-t border-gray-200 p-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-xs font-semibold text-white">
              {mockUser.name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{mockUser.name}</p>
            <p className="text-xs text-gray-500">{mockUser.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Đăng xuất"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});

// Sidebar Navigation
interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}
export const SidebarNavigation = React.memo(function SidebarNavigation({
  navigation,
  pathname,
  handleNavigation,
  isMobile,
  setIsMobileSidebarOpen,
}: {
  navigation: NavigationItem[];
  pathname: string;
  handleNavigation: () => void;
  isMobile?: boolean;
  setIsMobileSidebarOpen?: (v: boolean) => void;
}) {
  const handleNavClick = useCallback(
    (
      isMobile: boolean | undefined,
      setIsMobileSidebarOpen: ((v: boolean) => void) | undefined
    ) => {
      return () => {
        if (isMobile && setIsMobileSidebarOpen) setIsMobileSidebarOpen(false);
        handleNavigation();
      };
    },
    [handleNavigation]
  );
  return (
    <nav className="flex-1 px-4 py-6 space-y-1">
      {navigation.map((item) => {
        // Highlight if pathname matches or starts with item.href (and next char is / or end)
        const isActive =
          pathname === item.href ||
          (pathname.startsWith(item.href + "/") && item.href !== "/");
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              isActive
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            onClick={handleNavClick(isMobile, setIsMobileSidebarOpen)}
          >
            <item.icon
              className={`mr-3 h-5 w-5 ${
                isActive
                  ? "text-blue-600"
                  : "text-gray-400 group-hover:text-gray-500"
              }`}
            />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
});

// Topbar
function Topbar() {
  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200">
      <button
        className="px-4 border-r border-gray-200 text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden hover:bg-gray-50 hover:text-gray-600 transition-all"
        onClick={() => {
          const event = new CustomEvent("openMobileSidebar");
          window.dispatchEvent(event);
        }}
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex-1 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            <span>
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex flex-col text-right">
            <h1 className="text-lg font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent text-right">
              {getGreeting().text}
            </h1>
            <p className="text-xs text-gray-500 font-normal mt-0.5 text-right">
              Chúc bạn có một ngày tuyệt vời!
            </p>
          </div>
          <div className="relative p-2 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-sm border border-blue-100/50 transition-all duration-300 hover:shadow-md hover:scale-105">
            <div className="flex-shrink-0">{getGreeting().icon}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Mock user data - thay thế bằng real auth context
  const mockUser = {
    name: "Lê Đôn Chủng",
    role: "ADMIN"
  };
  const user = mockUser;
  const isLoading = false;

  // Memoize navigation to avoid re-creating on every render
  const navigation = useMemo(
    () => (user ? getNavigationByRole(user.role) : []),
    [user?.role]
  );

  // Memoize handleNavigation to avoid re-creating function
  const handleNavigation = useCallback(() => {
    if (!isNavigating) {
      setIsNavigating(true);
      setTimeout(() => setIsNavigating(false), 500);
    }
  }, [isNavigating]);

  const handleLogout = async () => {
    // Mock logout - thay thế bằng real logout function
    console.log("Logging out...");
    router.push("/login");
  };

  useEffect(() => {
    setIsNavigating(false);
    const contentDiv = document.querySelector(".content-loading");
    if (contentDiv) {
      setTimeout(() => {
        contentDiv.classList.add("content-loaded");
      }, 500);
    }
    // Listen for openMobileSidebar event
    const openSidebar = () => setIsMobileSidebarOpen(true);
    window.addEventListener("openMobileSidebar", openSidebar);
    return () => window.removeEventListener("openMobileSidebar", openSidebar);
  }, [user, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang xác thực tài khoản...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="h-screen flex overflow-hidden bg-gray-50 text-gray-900">
        {/* Loading progress bar - Disabled */}
        {isNavigating && (
          <div className="fixed top-0 left-0 z-50 w-full">
            <div className="h-1 bg-blue-600 animate-pulse">
              <div className="h-full bg-blue-700 animate-progress-bar"></div>
            </div>
          </div>
        )}

        {/* Mobile sidebar backdrop */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 flex z-40 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" />
          </div>
        )}

        {/* Mobile sidebar */}
        <div
          className={`fixed inset-y-0 left-0 flex flex-col w-64 bg-white border-r border-gray-200 shadow-lg z-40 transform transition-all duration-300 ease-in-out md:hidden ${
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Mobile Sidebar header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-semibold text-gray-900">
                  Asset Manager
                </span>
                <p className="text-xs text-gray-500 font-medium">
                  IUH Asset Management
                </p>
              </div>
            </div>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {/* Mobile Navigation & user section */}
          <Suspense fallback={<div className="p-4 text-gray-400">Đang tải menu...</div>}>
            <SidebarNavigation
              navigation={navigation}
              pathname={pathname}
              handleNavigation={handleNavigation}
              isMobile
              setIsMobileSidebarOpen={setIsMobileSidebarOpen}
            />
            <SidebarUserSection handleLogout={handleLogout} />
          </Suspense>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col flex-grow border-r border-gray-200 bg-white overflow-y-auto">
              {/* Desktop Header */}
              <div className="flex items-center flex-shrink-0 px-6 py-5 bg-white border-b border-gray-200">
                <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-semibold text-gray-900">
                    Asset Manager
                  </span>
                  <p className="text-xs text-gray-500 font-medium">
                    IUH Asset Management
                  </p>
                </div>
              </div>
              {/* Navigation */}
              <SidebarNavigation
                navigation={navigation}
                pathname={pathname}
                handleNavigation={handleNavigation}
              />
              {/* Desktop user section */}
              <SidebarUserSection handleLogout={handleLogout} />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          {/* Top bar */}
          <Topbar />
          {/* Page content */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <div className="content-loading">{children}</div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
