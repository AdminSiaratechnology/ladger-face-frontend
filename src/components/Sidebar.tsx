import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  MapPin,
  Settings,
  Shield,
  LogOut,
  Building2,
  UserPlus,
  Truck,
  HatGlasses,
  Warehouse,
  FolderOpen,
  Layers,
  Ruler,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCcwDot,
  CreditCard,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { useAuthStore } from "../../store/authStore";
import { useCompanyStore } from "../../store/companyStore";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

interface SubMenuItem {
  path: string;
  icon: React.ElementType;
  label: string;
  roles: string[];
  module?: string;
  subModule?: string;
}

interface MenuItem {
  path?: string;
  id?: string;
  icon: React.ElementType;
  label: string;
  roles: string[];
  module?: string;
  subModule?: string;
  type: "link" | "accordion";
  subItems?: SubMenuItem[];
}

// ✅ Utility function to check permissions (Unchanged, retained for context)
function checkPermission(
  user: any,
  companyId: string,
  module: string,
  subModule: string,
  defaultSelected: any
) {
  if (!user) return false;

  if (!user.access || user.access.length === 0) return false;

  // Find access entry for selected company
  const companyAccess = user.access.find(
    (accessItem: any) => accessItem?.company?._id === companyId
  );
  if (!companyAccess || !companyAccess.modules) return false;

  const modules = companyAccess.modules;
  const hasModule = modules?.[module];
  const hasSubModule = hasModule?.[subModule];

  if (
    module == "BusinessManagement" &&
    subModule == "Agent" &&
    !defaultSelected?.maintainAgent
  ) {
    return false;
  }
  
  if (user.allPermissions)
    return {
      create: true,
      read: true,
      update: true,
      delete: true,
      extra: [],
    };

  // If submodule exists → return its permissions
  if (hasSubModule) {
    return {
      create: !!hasSubModule.create,
      read: !!hasSubModule.read,
      update: !!hasSubModule.update,
      delete: !!hasSubModule.delete,
      extra: hasSubModule.extra || [],
    };
  }

  // Else return default full permissions (assuming no entry means full access for simplicity)
  return {
    create: true,
    read: true,
    update: true,
    delete: true,
    extra: [],
  };
}

// ✅ Utility function to check if menu item should be visible (Unchanged, retained for context)
function hasMenuAccess(
  user: any,
  companyId: string,
  item: MenuItem | SubMenuItem,
  defaultSelected: any
) {
  if (!user) return false;

  if (
    item?.module == "BusinessManagement" &&
    item?.subModule == "Agent" &&
    !defaultSelected?.maintainAgent
  ) {
    return false;
  }
   if (
    item?.module == "InventoryManagement" &&
    item?.subModule == "Godown" &&
    !defaultSelected?.maintainGodown
  ) {
    return false;
  }
  
  if (user.allPermissions) return true;

  // Accordions always visible (filtered subItems will decide visibility)
  if ("type" in item && item.type === "accordion") return true;

  // Module-based permissions
  if (item.module && item.subModule) {
    const permissions = checkPermission(
      user,
      companyId,
      item.module,
      item.subModule,
      defaultSelected
    );
    // Menu item is visible if read permission is true
    return permissions.read === true;
  }

  // Role-based fallback
  if (item.roles && user.role) {
    return item.roles.includes(user.role.toLowerCase());
  }

  return false;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [hasCompany, setHasCompany] = useState(false);
  const [openAccordionId, setOpenAccordionId] = useState<string | undefined>(
    undefined
  );
  
  // 🔹 CORE STATE CHANGES 🔹
  const [collapsed, setCollapsed] = useState(false); // Manually set collapse state (from Chevron click)
  const [isHovered, setIsHovered] = useState(false); // Temporary hover state

  const { companies, defaultSelected } = useCompanyStore();
  const companyId = defaultSelected?._id;

  // Menu Data (Unchanged)
  const fullMenuItems: MenuItem[] = useMemo(() => [
    {
      path: "/",
      icon: LayoutDashboard,
      label: "Dashboard",
      roles: ["admin", "agent", "salesman"],
      type: "link",
    },
    {
      id: "company",
      icon: Building2, // Changed icon from LayoutDashboard to Building2 for clarity
      label: "Company",
      roles: ["admin", "agent", "client", "salesman"],
      type: "accordion",
      subItems: [
        {
          path: "/company",
          icon: Building2,
          label: "Company Management",
          roles: ["admin", "agent", "client", "salesman"],
          module: "BusinessManagement",
          subModule: "Company",
        },
        {
          path: "/bill-template",
          icon: FileText,
          label: "Bill Template",
          roles: ["admin", "client"],
          module: "Billing",
          subModule: "BillTemplate",
        },
      ],
    },
    {
      path: "/users",
      icon: Users,
      label: "User Management",
      roles: ["admin"],
      type: "link",
      module: "UserManagement",
      subModule: "User",
    },
    {
      id: "business-partners",
      icon: Users, // Changed icon from Building2 to Users
      label: "Business Partners",
      roles: ["admin", "agent", "salesman", "client"],
      type: "accordion",
      subItems: [
        {
          path: "/customer-group-management",
          icon: UserPlus,
          label: "Customer Group",
          roles: ["admin", "agent"],
          module: "BusinessManagement",
          subModule: "CustomerGroup",
        },
        {
          path: "/customer-registration",
          icon: UserPlus,
          label: "Customer Registration",
          roles: ["admin", "agent"],
          module: "BusinessManagement",
          subModule: "CustomerRegistration",
        },
        {
          path: "/vendor-registration",
          icon: Truck,
          label: "Vendor Registration",
          roles: ["admin", "agent", "client"],
          module: "BusinessManagement",
          subModule: "Vendor",
        },
        {
          path: "/agent",
          icon: HatGlasses,
          label: "Agent",
          roles: ["admin", "agent", "client"],
          module: "BusinessManagement",
          subModule: "Agent",
        },
        {
          path: "/ladger-registration",
          icon: CreditCard, // Changed icon for clarity
          label: "Ledger",
          roles: ["admin", "agent", "client"],
          module: "BusinessManagement",
          subModule: "Ledger",
        },
      ],
    },
    {
      id: "inventory-management",
      icon: Package,
      label: "Inventory Management",
      roles: ["admin", "agent", "salesman", "client"],
      type: "accordion",
      subItems: [
        {
          path: "/godown",
          icon: Warehouse,
          label: "Godown",
          roles: ["admin", "agent", "salesman", "client"],
          module: "InventoryManagement",
          subModule: "Godown",
        },
        {
          path: "/stock-group",
          icon: Layers,
          label: "Stock Group",
          roles: ["admin", "agent", "salesman", "client"],
          module: "InventoryManagement",
          subModule: "StockGroup",
        },
        {
          path: "/stock-category",
          icon: FolderOpen,
          label: "Stock Category",
          roles: ["admin", "agent", "client"],
          module: "InventoryManagement",
          subModule: "StockCategory",
        },
        {
          path: "/uom",
          icon: Ruler,
          label: "UOM",
          roles: ["admin", "agent", "client"],
          module: "InventoryManagement",
          subModule: "Unit",
        },
        {
          path: "/product",
          icon: Package,
          label: "Product",
          roles: ["admin", "agent", "client"],
          module: "InventoryManagement",
          subModule: "Product",
        },
      ],
    },
    {
      id: "Order",
      icon: ShoppingCart,
      label: "Order Management",
      roles: ["admin", "agent", "client", "salesman"],
      type: "accordion",
      subItems: [
        {
          path: "/orders",
          icon: LayoutDashboard,
          label: "Custom Order",
          roles: ["admin", "agent", "client", "salesman"],
        },
        {
          path: "/POS",
          icon: FileText,
          label: "POS ",
          roles: ["admin", "client"],
        },
      ],
    },
        {
      path: "/Coupon",
      icon: ShoppingCart,
      label: "Coupon",
      roles: ["admin", "agent", "salesman","client"],
      type: "link",
      module: "Coupon",
      subModule: "Coupon",
    },
    
    // {
    //   path: "/tracking",
    //   icon: MapPin,
    //   label: "Location Tracking",
    //   roles: ["admin","client"],
    //   type: "link",
    // },
    // {
    //   path: "/settings",
    //   icon: Settings,
    //   label: "Settings",
    //   roles: ["admin","client"],
    //   type: "link",
    // },
    {
      id: "Report",
      icon: FileText,
      label: "Reports",
      roles: ["admin", "agent", "salesman", "client"],
      type: "accordion",
      subItems: [
        {
          path: "/order-report",
          icon: ShoppingCart,
          label: "Order Report",
          roles: ["admin", "agent"],
          module: "Report",
          subModule: "orderReport",
        },
        {
          path: "/payment-report",
          icon: CreditCard,
          label: "Payment Report",
          roles: ["admin", "agent"],
          module: "Report",
          subModule: "paymentReport",
        },
        {
          path: "/customer-report",
          icon: Users,
          label: "Customer Report",
          roles: ["admin", "agent"],
          module: "Report",
          subModule: "customerReport",
        },
        {
          path: "/product-report",
          icon: Package,
          label: "Product Report",
          roles: ["admin", "agent"],
          module: "Report",
          subModule: "productReport",
        },
      ],
    },
    {
      path: "/auditlog",
      icon: FileText,
      label: "Auditlog",
      roles: ["admin", "client"],
      type: "link",
      module: "Settings", // Assuming these non-CRUD links have a module
      subModule: "Auditlog",
    },
    {
      path: "/restore",
      icon: RefreshCcwDot,
      label: "Restore",
      roles: ["admin", "client"],
      type: "link",
      module: "Settings", // Assuming these non-CRUD links have a module
      subModule: "Restore",
    },
    {
        path: "/profile-settings",
        icon: Settings,
        label: "Settings",
        roles: ["admin", "client", "agent", "salesman"],
        type: "link",
        module: "Settings",
        subModule: "General",
      },
  ], []);

  const limitedMenuItems: MenuItem[] = useMemo(() => [
    {
      path: "/",
      icon: LayoutDashboard,
      label: "Dashboard",
      roles: ["admin", "agent", "salesman", "client"],
      type: "link",
    },
    {
      path: "/company",
      icon: Building2,
      label: "Company",
      roles: ["admin", "agent", "client"],
      type: "link",
      module: "BusinessManagement",
      subModule: "Company",
    },
    {
      path: "/users",
      icon: Users,
      label: "User Management",
      roles: ["admin", "client"],
      type: "link",
      module: "UserManagement",
      subModule: "User",
    },
  ], []);

  const menuItems = hasCompany ? fullMenuItems : limitedMenuItems;

  // Memoize filtered items to avoid re-calculating on every render
  const filteredMenuItems = useMemo(() => {
    return menuItems
      .filter(
        (item) =>
          (user && hasMenuAccess(user, companyId, item, defaultSelected)) ||
          item.label === "Dashboard"
      )
      .map((item) => {
        if (item.type === "accordion" && item.subItems) {
          const filteredSubItems = item.subItems.filter((sub) =>
            hasMenuAccess(user, companyId, sub, defaultSelected)
          );
          return { ...item, subItems: filteredSubItems };
        }
        return item;
      })
      .filter((item) =>
        item.type === "accordion" ? item.subItems?.length > 0 : true
      );
  }, [menuItems, user, companyId, defaultSelected]);


  // Detect active accordion on route change
  useEffect(() => {
    const activeAccordion = filteredMenuItems.find(
      (item) =>
        item.type === "accordion" &&
        item.subItems &&
        item.subItems.some((sub) => location.pathname === sub.path)
    );
    if (activeAccordion) setOpenAccordionId(activeAccordion.id);
    else setOpenAccordionId(undefined);
  }, [location.pathname, filteredMenuItems]); // Depend on filteredMenuItems to ensure data is stable

  // Check if company exists (Unchanged, retained for context)
  useEffect(() => {
    const checkCompanyExists = () => {
      const hasCompanies = Array.isArray(companies) && companies.length > 0;
      const hasDefaultSelected = Boolean(defaultSelected?._id);

      setHasCompany(hasCompanies || hasDefaultSelected);
    };

    checkCompanyExists();

    const handleStorageChange = () => checkCompanyExists();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("companiesUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("companiesUpdated", handleStorageChange);
    };
  }, [companies, defaultSelected]);


  // 🔹 CORE FUNCTIONALITY: Click to Collapse 🔹
  const handleLinkClick = useCallback(() => {
    // 1. Collapse the sidebar visually
    if (window.innerWidth >= 768) {
        setCollapsed(true);
    }
    // 2. Close the mobile view if needed
    if (window.innerWidth < 768 && onClose) {
        onClose();
    }
  }, [onClose]);

  // 🔹 Calculated Sidebar State 🔹
  // The sidebar is considered expanded if it's not manually collapsed OR if the mouse is hovering over it.
  const isSidebarOpen = !collapsed || isHovered;


  const SimpleLinkComponent = ({
    to,
    icon: Icon,
    label,
  }: {
    to: string;
    icon: React.ElementType;
    label: string;
  }) => (
    <Link
      to={to}
      onClick={handleLinkClick}
      className={`flex items-center space-x-2 px-4 py-2 transition-colors duration-200 ${
        location.pathname === to
          ? "bg-teal-600 text-white"
          : "text-teal-100 hover:bg-teal-700/80 hover:text-white"
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {isSidebarOpen && <span className="text-sm font-light">{label}</span>}
    </Link>
  );

  const SimpleAccordionComponent = ({
    accordionItem,
  }: {
    accordionItem: MenuItem;
  }) => {
    if (!accordionItem.subItems || accordionItem.type !== "accordion")
      return null;
    const Icon = accordionItem.icon;
    const isActive = openAccordionId === accordionItem.id;

    return (
      <Accordion
        type="single"
        collapsible
        className="w-full"
        value={isActive ? accordionItem.id : undefined}
        onValueChange={(value) => setOpenAccordionId(value)}
      >
        <AccordionItem value={accordionItem.id!} className="border-none">
          {/* Use isSidebarOpen here to conditionally render the content of the trigger */}
          <AccordionTrigger
            className={`flex items-center space-x-2 rounded-none px-4 pr-2 py-2 transition-colors duration-200 hover:no-underline
            ${
              isActive
                ? "bg-teal-600 text-white"
                : "text-teal-100 hover:bg-teal-700/80 hover:text-white"
            }`}
          >
            <div className="flex items-center space-x-2 flex-1">
              <Icon className="w-4 h-4 shrink-0" />
              {isSidebarOpen && (
                <span className="text-sm font-light">
                  {accordionItem.label}
                </span>
              )}
            </div>
          </AccordionTrigger>
          {/* Only render content if the sidebar is expanded (either manually or by hover) */}
          {isSidebarOpen && (
            <AccordionContent className="pb-0">
              {accordionItem.subItems.map((subItem) => {
                const SubIcon = subItem.icon;
                return (
                  <Link
                    key={subItem.path}
                    to={subItem.path}
                    onClick={handleLinkClick} // Click collapses the bar
                    className={`flex items-center space-x-2 px-8 pr-2 py-1 transition-colors duration-200 ${
                      location.pathname === subItem.path
                        ? "bg-teal-700 text-white"
                        : "text-teal-100 hover:bg-teal-800/80 hover:text-white"
                    }`}
                  >
                    <SubIcon className="w-3 h-3 shrink-0" />
                    <span className="text-xs font-light">{subItem.label}</span>
                  </Link>
                );
              })}
            </AccordionContent>
          )}
        </AccordionItem>
      </Accordion>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        // 🔹 HOVER LOGIC ADDED HERE 🔹
        onMouseEnter={() => window.innerWidth >= 768 && setIsHovered(true)}
        onMouseLeave={() => window.innerWidth >= 768 && setIsHovered(false)}
        className={`
        fixed md:relative top-0 left-0 h-full z-50
        ${isSidebarOpen ? "w-56" : "w-20"}
        bg-gradient-to-b from-teal-900 to-teal-950 text-white flex flex-col shadow-2xl
        transform transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        {/* Header with collapse/close */}
        <div className="p-3 border-b border-teal-800/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-teal-400 shrink-0" />
            {isSidebarOpen && (
              <div className="overflow-hidden transition-all duration-300">
                <h1 className="font-bold text-lg leading-tight">BMS</h1>
                <p className="text-xs text-teal-300">
                  Business Management System
                </p>
              </div>
            )}
          </div>

          {/* Mobile close */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="md:hidden p-1 text-teal-300 hover:bg-teal-800/50 rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Desktop collapse button (Only visible when not hovered OR when the sidebar is explicitly closed) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={`
            hidden md:flex absolute top-3 -right-4
            bg-teal-800 text-white rounded-full shadow-md
            hover:bg-teal-700 transition-all duration-300 cursor-pointer
          `}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Warning if no company selected */}
        {!hasCompany && (
          <div className="px-4 py-3 bg-amber-900/30 border-b border-teal-800/50">
            <p className="text-xs text-amber-300 flex items-center">
              <span className="mr-2">⚠️</span>
              {isSidebarOpen &&
                "Please add company details to access all features"}
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-teal-600 scrollbar-track-teal-900 scrollbar-thumb-rounded-full">
          {filteredMenuItems.length > 0 ? (
            filteredMenuItems.map((item) => (
              <div key={item.path || item.id}>
                {item.type === "link" ? (
                  <SimpleLinkComponent
                    to={item.path!}
                    icon={item.icon}
                    label={item.label}
                  />
                ) : (
                  <SimpleAccordionComponent accordionItem={item} />
                )}
              </div>
            ))
          ) : (
            <div className="px-6 py-4 text-teal-300 text-sm">
              {isSidebarOpen ? "No menu items available based on your permissions." : <Settings className="w-5 h-5"/>}
            </div>
          )}
        </nav>
        
      
      </div>
    </>
  );
}