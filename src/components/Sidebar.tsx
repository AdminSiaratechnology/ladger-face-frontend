import React, { useState, useEffect } from "react";
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
  X,
  ChevronLeft,
  ChevronRight,
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

interface SubMenuItem {
  path: string;
  icon: React.ElementType;
  label: string;
  roles: string[];
  module?: string;
  subModule?: string;
}

// Utility function to check permissions
// function checkPermission(user: any, module: string, subModule: string) {
//   if (user.allPermissions) return true;
//   if (!user.access || user.access.length === 0) return false;

//   for (const accessItem of user.access) {
//     const modules = accessItem.modules;
//     console.log(modules);
//     console.log(modules[module])
//     console.log(modules[module][subModule])
//     if (modules && modules[module] && modules[module][subModule]) {
//       return modules[module][subModule].read === true;
//     }
//   }
//   return false;
// }

// function hasMenuAccess(user: any, item: MenuItem | SubMenuItem) {
//   console.log(user.access, "user.access");
//   console.log(item, "item")
//   if ('type' in item && item.type === "accordion") {
//   return true;
// }
//   if (item.module && item.subModule)
//     return checkPermission(user, item.module, item.subModule);
//   if (item.roles && user?.role)
//     return item.roles.includes(user.role.toLowerCase());
//   return false;
// }
// ✅ Updated checkPermission
function checkPermission(user: any, companyId: string, module: string, subModule: string) {
  if (!user) return false;
  if (user.allPermissions) return true;
  if (!user.access || user.access.length === 0) return false;

  // Find access entry for selected company
  const companyAccess = user.access.find(
    (accessItem: any) => accessItem?.company?._id === companyId
  );
  if (!companyAccess || !companyAccess.modules) return false;

  const modules = companyAccess.modules;
  const hasModule = modules[module];
  const hasSubModule = hasModule?.[subModule];
  //  return !!hasSubModule?.read;
const { create, read, update, delete: del } = hasSubModule;
  return !!(create || read || update || del);
}

// ✅ Updated hasMenuAccess
function hasMenuAccess(user: any, companyId: string, item: MenuItem | SubMenuItem) {
  if (!user) return false;

  // Accordions always visible (filtered subItems will decide visibility)
  if ("type" in item && item.type === "accordion") return true;

  // Module-based permissions
  if (item.module && item.subModule) {
    return checkPermission(user, companyId, item.module, item.subModule);
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
  const [collapsed, setCollapsed] = useState(false); // 🔹 New: collapse state
  const {companies,defaultSelected} = useCompanyStore();
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
  }, [location.pathname]);

  // Check if company exists
 useEffect(() => {
  const checkCompanyExists = () => {
    try {
      const hasCompanies =
        Array.isArray(companies) && companies.length > 0;
      const hasDefaultSelected = Boolean(defaultSelected?._id);

      if (hasCompanies || hasDefaultSelected) {
        setHasCompany(true);
      } else {
        setHasCompany(false);
      }
    } catch (error) {
      console.error("Error reading companies:", error);
      setHasCompany(false);
    }
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

  // Menu data
  const fullMenuItems: MenuItem[] = [
    {
      path: "/",
      icon: LayoutDashboard,
      label: "Dashboard",
      roles: ["admin", "agent", "salesman"],
      type: "link",
    },
    {
      path: "/company",
      icon: LayoutDashboard,
      label: "Company",
      roles: ["admin", "agent"],
      type: "link",
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
      icon: Building2,
      label: "Business Partners",
      roles: ["admin", "agent", "salesman"],
      type: "accordion",
      subItems: [
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
          roles: ["admin", "agent"],
          module: "BusinessManagement",
          subModule: "Vendor",
        },
        {
          path: "/agent",
          icon: HatGlasses,
          label: "Agent",
          roles: ["admin", "agent"],
          module: "BusinessManagement",
          subModule: "Agent",
        },
        {
          path: "/ladger-registration",
          icon: HatGlasses,
          label: "Ladger",
          roles: ["admin", "agent"],
          module: "BusinessManagement",
          subModule: "Ledger",
        },
      ],
    },
    {
      id: "inventory-management",
      icon: Package,
      label: "Inventory Management",
      roles: ["admin", "agent", "salesman"],
      type: "accordion",
      subItems: [
        {
          path: "/godown",
          icon: Warehouse,
          label: "Godown",
          roles: ["admin", "agent"],
          module: "InventoryManagement",
          subModule: "Godown",
        },
        {
          path: "/stock-group",
          icon: Layers,
          label: "Stock Group",
          roles: ["admin", "agent"],
          module: "InventoryManagement",
          subModule: "StockGroup",
        },
        {
          path: "/stock-category",
          icon: FolderOpen,
          label: "Stock Category",
          roles: ["admin", "agent"],
          module: "InventoryManagement",  
          subModule: "StockCategory",
        },
        { path: "/uom", icon: Ruler, label: "UOM", roles: ["admin", "agent"], module: "InventoryManagement", subModule: "Unit" },
        {
          path: "/product",
          icon: Package,
          label: "Product",
          roles: ["admin", "agent"],
          module: "InventoryManagement",
          subModule: "Product",
        },
        {
          path: "/price-list",
          icon: DollarSign,
          label: "Price Lists",
          roles: ["admin"],
          module: "Pricing",
          subModule: "PriceList",
        },
      ],
    },
    {
      path: "/orders",
      icon: ShoppingCart,
      label: "Orders",
      roles: ["admin", "agent", "salesman"],
      type: "link",
      module: "Order",
      subModule: "Orders",
    },
    {
      path: "/tracking",
      icon: MapPin,
      label: "Location Tracking",
      roles: ["admin"],
      type: "link",
    },
    {
      path: "/settings",
      icon: Settings,
      label: "Settings",
      roles: ["admin"],
      type: "link",
    },
    {
      path: "/auditlog",
      icon: Settings,
      label: "Auditlog",
      roles: ["admin"],
      type: "link",
    },
    {
      path: "/restore",
      icon: Settings,
      label: "Restore",
      roles: ["admin"],
      type: "link",
    },
  ];

  const limitedMenuItems: MenuItem[] = [
    {
      path: "/",
      icon: LayoutDashboard,
      label: "Dashboard",
      roles: ["admin", "agent", "salesman"],
      type: "link",
    },
    {
      path: "/company",
      icon: LayoutDashboard,
      label: "Company",
      roles: ["admin", "agent"],
      type: "link",
    },
    {
      path: "/users",
      icon: Users,
      label: "User Management",
      roles: ["admin"],
      type: "link",
    },
    {
      path: "/settings",
      icon: Settings,
      label: "Settings",
      roles: ["admin"],
      type: "link",
    },
  ];

  const menuItems = hasCompany ? fullMenuItems : limitedMenuItems;
console.log(menuItems)
 const companyId = defaultSelected?._id;

const filteredMenuItems = menuItems
  .filter((item) => user && hasMenuAccess(user, companyId, item))
  .map((item) => {
    if (item.type === "accordion" && item.subItems) {
      const filteredSubItems = item.subItems.filter((sub) =>
        hasMenuAccess(user, companyId, sub)
      );
      return { ...item, subItems: filteredSubItems };
    }
    return item;
  })
  .filter((item) =>
    item.type === "accordion" ? item.subItems?.length > 0 : true
  );


  const handleLinkClick = () => {
    if (window.innerWidth < 768 && onClose) onClose();
  };

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
      {!collapsed && <span className="text-sm font-light">{label}</span>}
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
              {!collapsed && (
                <span className="text-sm font-light">
                  {accordionItem.label}
                </span>
              )}
            </div>
          </AccordionTrigger>
          {!collapsed && (
            <AccordionContent className="pb-0">
              {accordionItem.subItems.map((subItem) => {
                const SubIcon = subItem.icon;
                return (
                  <Link
                    key={subItem.path}
                    to={subItem.path}
                    onClick={handleLinkClick}
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
        className={`
        fixed md:relative top-0 left-0 h-full z-50
        ${collapsed ? "w-20" : "w-56"}
        bg-gradient-to-b from-teal-900 to-teal-950 text-white flex flex-col shadow-2xl
        transform transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        {/* Header with collapse/close */}
        <div className="p-3 border-b border-teal-800/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-teal-400 shrink-0" />
            {!collapsed && (
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

          {/* Desktop collapse */}
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

        {!hasCompany && (
          <div className="px-4 py-3 bg-amber-900/30 border-b border-teal-800/50">
            <p className="text-xs text-amber-300 flex items-center">
              <span className="mr-2">⚠️</span>
              {!collapsed &&
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
              No menu items available based on your permissions.
            </div>
          )}
        </nav>
      </div>
    </>
  );
}
