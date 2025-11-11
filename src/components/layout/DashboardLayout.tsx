"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ChangePasswordModalNew from "@/components/modal/ChangePasswordModalNew";
import PersonalInfoModalNew from "@/components/modal/PersonalInfoModalNew";
import toast from "react-hot-toast";

import {
  LayoutDashboard,
  Package,
  Menu,
  X,
  LogOut,
  Package2,
  Building,
  ChevronDown,
  ChevronRight,
  BarChart3,
  ClipboardList,
  Trash2,
  User,
  AlertTriangle,
  PanelLeftClose,
} from "lucide-react";
import { permission } from "process";
import { PermissionConstants } from "@/hooks/usePermissions";

// Header Component - Combined Sidebar Header and Topbar
const Header = React.memo(function Header({ 
  type = "sidebar",
  isMobile = false, 
  onClose,
  onShowPersonalInfo,
  onShowChangePassword,
  isDesktopSidebarOpen,
  isCollapsed
}: { 
  type?: "sidebar" | "topbar";
  isMobile?: boolean; 
  onClose?: () => void;
  onShowPersonalInfo?: () => void;
  onShowChangePassword?: () => void;
  isDesktopSidebarOpen?: boolean;
  isCollapsed?: boolean;
}) {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (type === "sidebar") {
    return (
      <div className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between pl-6 pr-6'} h-22 border-b border-gray-200 bg-white`}>
        {!isCollapsed && (
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center">
              <img src={'./logo_iuh.png'} alt="IUH Logo" className="w-full h-full object-contain"/>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900">
                Quản lý tài sản
              </span>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <img src={'./logo_iuh.png'} alt="IUH Logo" className="w-full h-full object-contain"/>
          </div>
        )}
        <div className="flex items-center space-x-2">
          {/* Close button for mobile */}
          {isMobile && onClose && (
            <button
              className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Topbar
  return (
    <div className="relative z-10 flex-shrink-0 flex h-22 bg-white border-b border-gray-200">
      <button
        className="px-4 border-gray-200 text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden hover:bg-gray-50 hover:text-gray-600 transition-all"
        onClick={() => {
          const event = new CustomEvent("openMobileSidebar");
          window.dispatchEvent(event);
        }}
      >
        <Menu className="h-5 w-5" />
      </button>
      
      <div className="flex-1 px-6 flex items-center justify-between">
        
        {/* University name in center */}
        <div className="flex-1 flex justify-center">
          <div className="text-center">
            <h1 className="text-xl font-bold text-blue-800 leading-tight">
              ĐẠI HỌC CÔNG NGHIỆP THÀNH PHỐ HỒ CHÍ MINH
            </h1>
            <p className="text-sm font-semibold text-red-600 mt-1">
              KHOA CÔNG NGHỆ THÔNG TIN
            </p>
          </div>
        </div>
        
        <div className="relative hidden md:block" ref={menuRef}>
          <button
            className="flex items-center rounded-lg px-2 py-1.5 hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors"
            onClick={() => setIsMenuOpen((v) => !v)}
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold mr-2">
              {user?.fullName?.charAt(0)}
            </div>
            <div className="hidden sm:flex flex-col items-start mr-1">
              <span className="text-sm font-medium text-gray-900 leading-4">{user?.fullName}</span>
            </div>
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none">
              <div className="h-px bg-gray-100" />
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                onClick={() => { setIsMenuOpen(false); onShowPersonalInfo?.(); }}
              >
                Thông tin cá nhân
              </button>
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                onClick={() => { setIsMenuOpen(false); onShowChangePassword?.(); }}
              >
                Đổi mật khẩu
              </button>
              <div className="h-px bg-gray-100" />
              <button
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                onClick={() => { setIsMenuOpen(false); logout(); }}
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// Helper: Navigation by permissions
const getNavigationByPermissions = (userPermissions: string[], userRoles: string[]) => {
  const baseNavigation = [
    // Dashboard cho tất cả authenticated users
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      permissions: [],
    },
    // Quản lý tài sản
    {
      name: "Tài sản",
      href: "/asset",
      icon: Package2,
      permissions: [PermissionConstants.PERM_VIEW_ASSET],
      children: [
        {
          name: "Bàn giao",
          href: "/asset/transaction",
          permissions: [PermissionConstants.PERM_VIEW_TRANSACTION],
        },
        {
          name: "Di chuyển",
          href: "/asset/move",
          permissions: [PermissionConstants.PERM_VIEW_MOVEMENT],
        },
        {
          name: "Kho",
          href: "/asset/warehouse",
          permissions: [PermissionConstants.PERM_VIEW_ASSET],
        },
        {
          name: "Sổ tài sản",
          href: "/asset/asset-book",
          permissions: [PermissionConstants.PERM_VIEW_ASSET],
        }
      ],
    },
    // Kiểm kê
    {
      name: "Kiểm kê",
      href: "/inventory",
      icon: ClipboardList,
      permissions: [PermissionConstants.PERM_VIEW_INVENTORY],
      children: [
        {
          name: "Kỳ kiểm kê",
          href: "/inventory",
          permissions: [PermissionConstants.PERM_VIEW_INVENTORY],
        },
        {
          name: "Thực hiện kiểm kê",
          href: "/inventory/perform",
          permissions: [PermissionConstants.PERM_PERFORM_INVENTORY],
        }
      ]
    },
    // Thanh lý tài sản
    {
      name: "Thanh lý",
      href: "/liquidation",
      icon: Trash2,
      permissions: [PermissionConstants.PERM_VIEW_LIQUIDATION],
    }, // Quản lý cảnh báo
    {
      name: "Cảnh báo",
      href: "/alert",
      icon: AlertTriangle,
      permissions: [PermissionConstants.PERM_VIEW_ALERT]
    },
    // Quản lý đơn vị
    {
      name: "Đơn vị",
      href: "/unit",
      icon: Building,
      permissions: [PermissionConstants.PERM_VIEW_UNIT]
    },
    // User
    {
      name: "Người dùng",
      href: "/user",
      icon: User,
      permissions: [PermissionConstants.PERM_VIEW_USER]
    },
    // Role
    {
      name: "Vai trò",
      href: "/role",
      icon: BarChart3,
      permissions: [PermissionConstants.PERM_VIEW_ROLE]
    }
  ];

  // Filter navigation dựa trên permissions
  return baseNavigation.filter((item) => {
    if (item.permissions?.length === 0) return true; 
    return item.permissions?.some(permission => userPermissions.includes(permission));
  }).map(item => ({
    ...item,
    children: item.children?.filter(child => {
      if (!child.permissions || child.permissions.length === 0) return true;
      return child.permissions?.some(permission => userPermissions.includes(permission));
    })
  }));
};

// Mobile Sidebar User Section with full menu
export const MobileSidebarUserSection = React.memo(function MobileSidebarUserSection({
  onShowPersonalInfo,
  onShowChangePassword,
  handleLogout,
}: {
  onShowPersonalInfo: () => void;
  onShowChangePassword: () => void;
  handleLogout: () => void;
}) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* User info header */}
      <div className="p-4 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-sm font-semibold text-white">
              {user.fullName.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
            <p className="text-xs text-gray-500">{user.roles?.[0] || 'No Role'}</p>
          </div>
        </div>
      </div>
      
      {/* Menu options */}
      <div className="py-2">
        <button
          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
          onClick={onShowPersonalInfo}
        >
          <User className="h-4 w-4 text-gray-400" />
          <span>Thông tin cá nhân</span>
        </button>
        <button
          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
          onClick={onShowChangePassword}
        >
          <LayoutDashboard className="h-4 w-4 text-gray-400" />
          <span>Đổi mật khẩu</span>
        </button>
        <button
          className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 text-red-400" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
});

// Desktop Sidebar User Section (simplified)
export const SidebarUserSection = React.memo(function SidebarUserSection({
  handleLogout,
}: {
  handleLogout: () => void;
}) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="border-t border-gray-200 p-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-xs font-semibold text-white">
              {user.fullName.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
            <p className="text-xs text-gray-500">{user.roles?.[0] || 'No Role'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Đăng xuất"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

// Sidebar Navigation
interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permissions: string[];
  children?: {
    name: string;
    href: string;
    permissions?: string[];
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}
export const SidebarNavigation = React.memo(function SidebarNavigation({
  navigation,
  pathname,
  handleNavigation,
  isMobile,
  setIsMobileSidebarOpen,
  userPermissions,
  isCollapsed,
}: {
  navigation: NavigationItem[];
  pathname: string;
  handleNavigation: () => void;
  isMobile?: boolean;
  setIsMobileSidebarOpen?: (v: boolean) => void;
  userPermissions: string[];
  isCollapsed?: boolean;
}) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number; itemName: string } | null>(null);
  const popoverRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const buttonRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

  // Helper function to determine if a child item is active
  const isChildItemActive = useCallback((childHref: string, currentPath: string) => {
    // Exact match
    if (currentPath === childHref) return true;
    
    // Special case for "/asset" - only active when exactly "/asset"
    if (childHref === "/asset") {
      return currentPath === "/asset";
    }
    
    // Special case for "/inventory" - only active when exactly "/inventory"
    if (childHref === "/inventory") {
      return currentPath === "/inventory";
    }

    if (childHref === "/liquidation") {
      return currentPath === "/liquidation";
    }
    
    // For other paths, check if current path starts with child href + "/"
    return currentPath.startsWith(childHref + "/");
  }, []);

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

  const toggleExpanded = useCallback((itemName: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  }, []);

  // Handle click outside popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openPopover) {
        const ref = popoverRefs.current[openPopover];
        if (ref && !ref.contains(event.target as Node)) {
          setOpenPopover(null);
        }
      }
    };

    if (openPopover) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openPopover]);

  // Auto-expand parent if child is active
  useEffect(() => {
    navigation.forEach(item => {
      if (item.children) {
        const filteredChildren = item.children.filter(child => 
          !child.permissions || child.permissions.length === 0 || 
          child.permissions.some(permission => userPermissions.includes(permission))
        );
        const hasActiveChild = filteredChildren.some(child => 
          isChildItemActive(child.href, pathname)
        );
        if (hasActiveChild && !expandedItems[item.name]) {
          setExpandedItems(prev => ({
            ...prev,
            [item.name]: true
          }));
        }
      }
    });
  }, [pathname, navigation, expandedItems, isChildItemActive, userPermissions]);

  return (
    <nav className={`flex-1 py-6 space-y-1 border-r border-gray-200 ${isCollapsed ? 'px-2' : 'px-4'}`} style={{ position: 'relative' }}>
      {navigation.map((item) => {
        const isExpanded = expandedItems[item.name];
        const isActive = pathname === item.href || (pathname.startsWith(item.href + "/") && item.href !== "/");
        const filteredChildren = item.children?.filter(child => 
          !child.permissions || child.permissions.length === 0 || 
          child.permissions.some(permission => userPermissions.includes(permission))
        );
        const hasActiveChild = filteredChildren?.some(child => 
          isChildItemActive(child.href, pathname)
        );

        if (isCollapsed) {
          // Collapsed mode: only show icons
          return (
            <div key={item.name} className="relative flex justify-center">
              {item.children && filteredChildren && filteredChildren.length > 0 ? (
                <>
                  <button
                    ref={(el) => {
                      if (el) {
                        buttonRefs.current[item.name] = el;
                      }
                    }}
                    className={`group w-10 h-10 flex items-center justify-center rounded-lg transition-colors relative ${
                      isActive || hasActiveChild
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    } ${openPopover === item.name ? "bg-blue-50" : ""}`}
                    onClick={(e) => {
                      const button = e.currentTarget;
                      const rect = button.getBoundingClientRect();
                      if (openPopover === item.name) {
                        setOpenPopover(null);
                        setPopoverPosition(null);
                      } else {
                        setOpenPopover(item.name);
                        setPopoverPosition({
                          top: rect.top,
                          left: rect.right + 8,
                          itemName: item.name
                        });
                      }
                    }}
                    title={item.name}
                  >
                    <item.icon
                      className={`h-5 w-5 ${
                        isActive || hasActiveChild || openPopover === item.name
                          ? "text-blue-600"
                          : "text-gray-400 group-hover:text-gray-500"
                      }`}
                    />
                  </button>
                </>
              ) : (
                <Link
                  href={item.href}
                  className={`group w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  onClick={handleNavClick(isMobile, setIsMobileSidebarOpen)}
                  title={item.name}
                >
                  <item.icon
                    className={`h-5 w-5 ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  />
                </Link>
              )}
            </div>
          );
        }

        return (
          <div key={item.name}>
            {/* Parent menu item */}
            {item.children ? (
              <button
                className={`group w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive || hasActiveChild
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={() => toggleExpanded(item.name)}
              >
                <div className="flex items-center">
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive || hasActiveChild
                        ? "text-blue-600"
                        : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </button>
            ) : (
              <Link
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
            )}

            {/* Child menu items */}
            {filteredChildren && isExpanded && filteredChildren.length > 0 && (
              <div className="ml-6 mt-1 space-y-1">
                {filteredChildren.map((child) => {
                    const isChildActive = isChildItemActive(child.href, pathname);
                    return (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isChildActive
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                        onClick={handleNavClick(isMobile, setIsMobileSidebarOpen)}
                      >
                        <span>{child.name}</span>
                      </Link>
                    );
                  })}
              </div>
            )}
          </div>
        );
      })}
      {/* Popover Portal */}
      {typeof window !== 'undefined' && openPopover && popoverPosition && popoverPosition.itemName === openPopover && (() => {
        const item = navigation.find(n => n.name === openPopover);
        if (!item || !item.children) return null;
        const filteredChildren = item.children.filter(child => 
          !child.permissions || child.permissions.length === 0 || 
          child.permissions.some(permission => userPermissions.includes(permission))
        );
        
        return createPortal(
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-[45]" 
              onClick={() => {
                setOpenPopover(null);
                setPopoverPosition(null);
              }}
            />
            {/* Popover */}
            <div
              ref={(el) => {
                if (el) {
                  popoverRefs.current[openPopover] = el;
                }
              }}
              className="fixed z-[60] w-56 rounded-md border border-gray-200 bg-white shadow-2xl"
              style={{ 
                top: `${popoverPosition.top}px`,
                left: `${popoverPosition.left}px`,
                animation: 'fadeIn 0.15s ease-out',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Popover items */}
              <div className="py-1 rounded-b-md">
                {filteredChildren.map((child) => {
                  const isChildActive = isChildItemActive(child.href, pathname);
                  return (
                    <Link
                      key={child.name}
                      href={child.href}
                      className={`block px-4 py-2.5 text-sm transition-colors ${
                        isChildActive
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenPopover(null);
                        setPopoverPosition(null);
                        handleNavClick(isMobile, setIsMobileSidebarOpen)();
                      }}
                    >
                      {child.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </>,
          document.body
        );
      })()}
    </nav>
  );
});

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(() => {
    // Check localStorage for saved sidebar state, default to true
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('desktop-sidebar-open');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Check localStorage for collapsed state, default to false
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('desktop-sidebar-collapsed');
      return saved !== null ? JSON.parse(saved) : false;
    }
    return false;
  });
  const [isNavigating, setIsNavigating] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Use real auth context
  const { user, isLoading, isAuthenticated, getUserPermissions, logout } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, isLoading, router]);

  // Memoize navigation to avoid re-creating on every render
  const userPermissions = getUserPermissions();
  const userRoles = user?.roles || [];
  const navigation = useMemo(
    () => getNavigationByPermissions(userPermissions, userRoles),
    [userPermissions, userRoles]
  );

  // Memoize handleNavigation to avoid re-creating function
  const handleNavigation = useCallback(() => {
    if (!isNavigating) {
      setIsNavigating(true);
      setTimeout(() => setIsNavigating(false), 500);
    }
  }, [isNavigating]);

  // Modal handlers
  const handleChangePassword = async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    setIsLoadingAction(true);
    try {
      // TODO: Implement API call to change password
      console.log('Changing password:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Mật khẩu đã được cập nhật thành công!');
      setShowChangePasswordModal(false);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật mật khẩu. Vui lòng thử lại.');
      console.error('Change password error:', error);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleUpdatePersonalInfo = async (data: { fullName: string; email: string; phone: string; dateOfBirth: string }) => {
    setIsLoadingAction(true);
    try {
      // TODO: Implement API call to update personal info
      console.log('Updating personal info:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Thông tin cá nhân đã được cập nhật thành công!');
      setShowPersonalInfoModal(false);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.');
      console.error('Update personal info error:', error);
    } finally {
      setIsLoadingAction(false);
    }
  };

  // Toggle desktop sidebar handler
  const handleToggleDesktopSidebar = useCallback(() => {
    if (!isDesktopSidebarOpen) {
      // If closed, open it (expanded)
      setIsDesktopSidebarOpen(true);
      setIsCollapsed(false);
      localStorage.setItem('desktop-sidebar-open', JSON.stringify(true));
      localStorage.setItem('desktop-sidebar-collapsed', JSON.stringify(false));
    } else if (isCollapsed) {
      // If collapsed, expand it
      setIsCollapsed(false);
      localStorage.setItem('desktop-sidebar-collapsed', JSON.stringify(false));
    } else {
      // If expanded, collapse it
      setIsCollapsed(true);
      localStorage.setItem('desktop-sidebar-collapsed', JSON.stringify(true));
    }
  }, [isDesktopSidebarOpen, isCollapsed]);

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
    
    // Listen for toggleDesktopSidebar event
    window.addEventListener("toggleDesktopSidebar", handleToggleDesktopSidebar);
    
    return () => {
      window.removeEventListener("openMobileSidebar", openSidebar);
      window.removeEventListener("toggleDesktopSidebar", handleToggleDesktopSidebar);
    };
  }, [pathname, handleToggleDesktopSidebar]);

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

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
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
          className={`fixed inset-y-0 left-0 flex flex-col w-80 bg-white border-r border-gray-200 shadow-lg z-40 transform transition-all duration-300 ease-in-out md:hidden ${
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Mobile Sidebar header */}
          <Header type="sidebar" isMobile onClose={() => setIsMobileSidebarOpen(false)} isDesktopSidebarOpen={isDesktopSidebarOpen} />
          {/* Mobile Navigation & user section */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <Suspense fallback={<div className="p-4 text-gray-400">Đang tải menu...</div>}>
              <SidebarNavigation
                navigation={navigation}
                pathname={pathname}
                handleNavigation={handleNavigation}
                isMobile
                setIsMobileSidebarOpen={setIsMobileSidebarOpen}
                userPermissions={userPermissions}
              />
            </Suspense>
            
            {/* User menu at bottom for mobile */}
            <div className="mt-auto">
              <MobileSidebarUserSection
                onShowPersonalInfo={() => {
                  setShowPersonalInfoModal(true);
                  setIsMobileSidebarOpen(false);
                }}
                onShowChangePassword={() => {
                  setShowChangePasswordModal(true);
                  setIsMobileSidebarOpen(false);
                }}
                handleLogout={() => {
                  logout();
                  setIsMobileSidebarOpen(false);
                }}
              />
            </div>
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className={`hidden md:flex md:flex-shrink-0 sidebar-transition ${
          isDesktopSidebarOpen ? (isCollapsed ? 'w-20' : 'w-80') : 'w-20'
        }`}>
          <div className={`flex flex-col overflow-hidden sidebar-transition ${
            isDesktopSidebarOpen ? (isCollapsed ? 'w-20' : 'w-80') : 'w-20'
          }`}>
            <div className={`flex flex-col flex-grow  border-gray-200 bg-white overflow-y-auto sidebar-content-transition ${
              'opacity-100'
            }`} style={{ position: 'relative' }}>
              {/* Desktop Header */}
              <Header 
                type="sidebar" 
                isDesktopSidebarOpen={isDesktopSidebarOpen} 
                isCollapsed={isCollapsed || !isDesktopSidebarOpen}
              />
              {/* Navigation */}
              <SidebarNavigation
                navigation={navigation}
                pathname={pathname}
                handleNavigation={handleNavigation}
                userPermissions={userPermissions}
                isCollapsed={isCollapsed || !isDesktopSidebarOpen}
              />
              
              {/* Date display and toggle button at bottom */}
              <div className="mt-auto border-t border-gray-200 bg-white">
                {!isCollapsed && isDesktopSidebarOpen && (
                  <div className="px-6 py-4 text-center">
                    <div className="text-sm text-gray-600 font-medium">
                      {new Date().toLocaleDateString("vi-VN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>

                )}
                {/* Toggle button */}
                <div className={`px-4 py-3 border-t border-gray-200  ${isCollapsed || !isDesktopSidebarOpen ? 'flex justify-center' : ''}`}>
                  <button
                    className={`w-full flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors ${
                      isCollapsed || !isDesktopSidebarOpen ? 'w-10 h-10' : 'px-3 py-2'
                    }`}
                    onClick={() => {
                      const event = new CustomEvent("toggleDesktopSidebar");
                      window.dispatchEvent(event);
                    }}
                    title={isDesktopSidebarOpen && !isCollapsed ? "Thu gọn sidebar" : isCollapsed || !isDesktopSidebarOpen ? "Mở rộng sidebar" : "Mở sidebar"}
                  >
                    {isCollapsed || !isDesktopSidebarOpen ? (
                      <Menu className="h-5 w-5" />
                    ) : (
                      <>
                        <PanelLeftClose className="h-5 w-5 mr-2" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          {/* Top bar */}
          <Header 
            type="topbar"
            onShowPersonalInfo={() => setShowPersonalInfoModal(true)}
            onShowChangePassword={() => setShowChangePasswordModal(true)}
            isDesktopSidebarOpen={isDesktopSidebarOpen}
            isCollapsed={isCollapsed}
          />
          {/* Page content */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-8">
              <div className="px-4 sm:px-6 md:px-8">
                <div className="content-loading">{children}</div>
              </div>
            </div>
          </main>
        </div>

        {/* Modals */}
        <ChangePasswordModalNew
          isOpen={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
          onSubmit={handleChangePassword}
          loading={isLoadingAction}
        />

        <PersonalInfoModalNew
          isOpen={showPersonalInfoModal}
          onClose={() => setShowPersonalInfoModal(false)}
          onSubmit={handleUpdatePersonalInfo}
          initialData={{
            fullName: user?.fullName || "",
            email: user?.email || "",
            phone: user?.phoneNumber || "",
            dateOfBirth: user?.birthDate || ""
          }}
          loading={isLoadingAction}
        />
      </div>
    );
  }
}
