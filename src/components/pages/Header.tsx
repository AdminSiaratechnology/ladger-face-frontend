import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  Menu,
  Search,
  Sun,
  Moon,
  X,
  LogOut,
  Building,
  ChevronDown,
  User,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useAuthStore } from "../../../store/authStore";
import { useCompanyStore } from "../../../store/companyStore";
import { useAuditLogStore } from "../../../store/auditLogStore";
import { useUOMStore } from "../../../store/uomStore";
import { useStockCategory } from "../../../store/stockCategoryStore";
import { useStockGroup } from "../../../store/stockGroupStore";
import { useGodownStore } from "../../../store/godownStore";
import { useUserManagementStore } from "../../../store/userManagementStore";

import CompanySelectorModal from "../customComponents/CompanySelectorModal";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useVendorStore } from "../../../store/vendorStore";
import { useAgentStore } from "../../../store/agentStore";
import DeviceLogoutModal from "../DeviceLogoutModal";
interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { defaultSelected, companies, resetCompanies } = useCompanyStore();
  const { resetStore } = useAuditLogStore();
  const { resetSrockCategories, fetchStockCategory } = useStockCategory();
  const { resetStockGroup, fetchStockGroup } = useStockGroup();
  const { resetUnits, fetchUnits } = useUOMStore();
  const { resetGodown, fetchGodowns } = useGodownStore();
  const { resetUserManagement, fetchUsers } = useUserManagementStore();
  const { fetchVendors } = useVendorStore();
  const { fetchAgents } = useAgentStore();
  const [showCompanyPopup, setShowCompanyPopup] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  // Ref for the logout dropdown container
  const logoutDropdownRef = useRef<HTMLDivElement>(null);

  const company = defaultSelected;
  const notifications = [
    {
      id: 1,
      title: "New order from customer",
      time: "5 min ago",
      unread: true,
    },
    {
      id: 2,
      title: "Low stock alert for Product A",
      time: "10 min ago",
      unread: true,
    },
    { id: 3, title: "Payment received", time: "1 hour ago", unread: false },
    {
      id: 4,
      title: "Sync completed with Tally",
      time: "2 hours ago",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;
  const setDefaultCompany = useCompanyStore((state) => state.setDefaultCompany);
  const handleSelect = (company) => {
    setDefaultCompany(company);
    setShowCompanyPopup(false);
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        logoutDropdownRef.current &&
        !logoutDropdownRef.current.contains(event.target as Node)
      ) {
        setShowLogout(false);
      }
    };

    // Add event listener when dropdown is open
    if (showLogout) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLogout]);

  // Escape key handler
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showLogout) {
        setShowLogout(false);
      }
    };

    if (showLogout) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showLogout]);
  const fetchOtherAsync = async () => {
    const companyId = defaultSelected?._id;
    if (!companyId) return;
    try {
      await Promise.all([
        fetchStockCategory(1, 10, companyId),
        fetchStockGroup(1, 10, companyId),
        fetchUnits(1, 10, companyId),
        fetchGodowns(1, 10, companyId),
        fetchUsers(1, 10, companyId),
        fetchVendors(1, 10, companyId),
        fetchAgents(1, 10, companyId),
      ]);
    } catch (error) {
      console.error("Error fetching stock data:", error);
    }
  };
  useEffect(() => {
    fetchOtherAsync();
  }, [defaultSelected]);
  // const handleLogout = () => {
  //   setShowLogout(false);
  //   logout();
  //   resetCompanies();
  //   resetUnits();
  //   resetStockGroup();
  //   resetSrockCategories(), resetGodown();
  //   resetStore();
  //   resetUserManagement();
  //   localStorage.clear();
  // };

  const handleLogout = async() => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }
  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 px-3 sm:px-4 py-1">
        <div className="flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="md:hidden p-1.5"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </Button>

            {/* Company Info */}
            {defaultSelected && (
              <div
                className="hidden sm:flex items-center gap-2 cursor-pointer bg-gradient-to-br from-teal-50 to-emerald-50 px-2 py-1.5 rounded-md transition-all duration-200 group"
                onClick={() => {
                  setShowCompanyPopup(true);
                }}
              >
                <div className="flex flex-col min-w-0">
                  <span className="flex items-center font-semibold text-sm text-teal-800 truncate max-w-[250px] group-hover:text-teal-900 transition-colors">
                    {company?.namePrint || "No Company"}
                    {/* Solid triangle using Tailwind */}
                    <span className="ml-2 w-1 h-1 border-t-[8px] border-t-teal-600 border-x-[6px] border-x-transparent inline-block"></span>{" "}
                  </span>
                  <span
                    className="text-[10px] text-teal-600 font-mono hover:text-teal-700 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (company?.code) {
                        navigator.clipboard
                          .writeText(company.code)
                          .then(() =>
                            toast.success("Company ID copied to clipboard")
                          )
                          .catch(() =>
                            toast.error("Failed to copy Company ID")
                          );
                      }
                    }}
                    title="Click to copy Company ID"
                  >
                    {company?.code ? `ID: ${company.code}` : "No ID"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Mobile search toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="sm:hidden p-1.5"
              aria-label="Search"
            >
              {isSearchOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDark(!isDark)}
              className="hidden xs:inline-flex p-1.5"
              aria-label={
                isDark ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative p-1.5"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-0.5 -right-0.5 w-3 h-3 p-0 flex items-center justify-center text-[10px] bg-red-500">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 max-w-[90vw]">
                <DropdownMenuLabel className="py-2 text-sm">
                  Notifications
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="p-2">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-xs ${
                            notification.unread ? "font-medium" : ""
                          }`}
                        >
                          {notification.title}
                        </p>
                        {notification.unread && (
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full ml-1.5" />
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {notification.time}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center py-1.5">
                  <span className="text-xs text-blue-600">
                    View all notifications
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* System status - hidden on very small screens */}
            <div className="hidden xs:flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600">System Online</span>
            </div>

            {/* Profile Dropdown with click outside */}
            <div className="relative" ref={logoutDropdownRef}>
              <div
                className="flex items-center gap-3 bg-white px-1 py-1 rounded-lg border border-gray-200 cursor-pointer hover:border-teal-300 transition-all duration-200 group"
                onClick={() => setShowLogout((prev) => !prev)}
              >
                {/* Avatar */}
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                  <span className="font-semibold text-sm text-white">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>

                {/* Text */}
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {user?.name}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">
                    {user?.role}
                  </span>
                </div>

                {/* Chevron */}
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    showLogout ? "rotate-180" : ""
                  }`}
                />
              </div>

              {/* Dropdown */}
              {showLogout && (
                <div className="absolute top-full right-0 mt-1 w-full z-50">
                  <div className="bg-white flex flex-col rounded-md shadow-lg border border-gray-200 py-1 animate-in fade-in-0 zoom-in-95">
                    <Link
                      to="/profile"
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-blue-700 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile search panel */}
        {isSearchOpen && (
          <div className="sm:hidden mt-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <Input
                type="text"
                placeholder="Search..."
                className="pl-8 h-8 w-full text-sm"
                autoFocus
              />
            </div>
          </div>
        )}
      </header>
      <DeviceLogoutModal/>
      {companies && (
        <CompanySelectorModal
          open={showCompanyPopup}
          companies={companies}
          isLogin={false}
          defaultSelected={defaultSelected}
          onSelect={handleSelect}
          onClose={() => setShowCompanyPopup(false)}
          onConfirmNavigate={() => {
            setShowCompanyPopup(false);
          }}
        />
      )}
    </>
  );
}
