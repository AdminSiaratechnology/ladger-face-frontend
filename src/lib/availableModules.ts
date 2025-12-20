// src/config/menuItems.ts

import {
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  UserPlus,
  Truck,
  HatGlasses,
  CreditCard,
  Package,
  Warehouse,
  Layers,
  FolderOpen,
  Ruler,
  ShoppingCart,
  RefreshCcwDot
} from "lucide-react";
import type { LucideIcon } from "lucide-react";



export interface BaseMenuItem {
  label: string;
  roles: string[];
  icon: LucideIcon;
  module?: string;
  subModule?: string;
}

export interface LinkMenuItem extends BaseMenuItem {
  type: "link";
  path: string;
}

export interface AccordionSubItem extends Omit<LinkMenuItem, "type"> {
  type?: "link"; // subItems are always links but optional to define
}

export interface AccordionMenuItem extends BaseMenuItem {
  type: "accordion";
  id: string;
  subItems: AccordionSubItem[];
}

export type MenuItem = LinkMenuItem | AccordionMenuItem;



export const fullMenuItems: MenuItem[] = [
  {
    path: "/",
    icon: LayoutDashboard,
    label: "Dashboard",
    roles: ["admin", "agent", "salesman", "client"],
    type: "link",
  },
  {
    id: "company",
    icon: Building2,
    label: "Company Management",
    roles: ["admin", "client"],
    type: "accordion",
    subItems: [
      {
        path: "/company",
        icon: Building2,
        label: "Company",
        roles: ["admin", "agent", "client", "salesman"],
        module: "CompanyManagement",
        subModule: "Company",
      },
      {
        path: "/bill-template",
        icon: FileText,
        label: "Bill Template",
        roles: ["admin", "client"],
        module: "CompanyManagement",
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
    icon: Users,
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
        icon: CreditCard,
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
    roles: ["admin", "agent", "salesman", "client"],
    type: "link",
    module: "Coupon",
    subModule: "Coupon",
  },

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
      {
        path: "/pos-report",
        icon: Package,
        label: "POS Report",
        roles: ["admin", "agent"],
        module: "Report",
        subModule: "posReport",
      },
    ],
  },

  {
    path: "/auditlog",
    icon: FileText,
    label: "Auditlog",
    roles: ["admin", "client"],
    type: "link",
    module: "Settings",
    subModule: "Auditlog",
  },

  {
    path: "/restore",
    icon: RefreshCcwDot,
    label: "Restore",
    roles: ["admin", "client"],
    type: "link",
    module: "Settings",
    subModule: "Restore",
  },
];

export const limitedMenuItems: MenuItem[] = [
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
];

export const availableModules = {
    BusinessManagement: {
      CustomerRegistration: { create: false, read: false, update: false, delete: false, extra: [] },
      Vendor: { create: false, read: false, update: false, delete: false, extra: [] },
      Agent: { create: false, read: false, update: false, delete: false, extra: [] },
      Ledger: { create: false, read: false, update: false, delete: false, extra: [] },
    },
    // UserManagement: {
    //   User: { create: false, read: false, update: false, delete: false, extra: [] },
    // },
    InventoryManagement: {
      Godown: { create: false, read: false, update: false, delete: false, extra: [] },
      StockGroup: { create: false, read: false, update: false, delete: false, extra: [] },
      StockCategory: { create: false, read: false, update: false, delete: false, extra: [] },
      Product: { create: false, read: false, update: false, delete: false, extra: [] },
      Unit: { create: false, read: false, update: false, delete: false, extra: [] },
      Order: { create: false, read: false, update: false, delete: false, extra: [] },
      Payment: { create: false, read: false, update: false, delete: false, extra: [] },
    },
    Pricing: {
      PriceList: { create: false, read: false, update: false, delete: false, extra: [] },
      Discount: { create: false, read: false, update: false, delete: false, extra: [] },
    },
    Reports: {
      OrderReport: { create: false, read: false, update: false, delete: false, extra: [] },
      PaymentReport: { create: false, read: false, update: false, delete: false, extra: [] },
      CustomerReport: { create: false, read: false, update: false, delete: false, extra: [] },
      ProductReport: { create: false, read: false, update: false, delete: false, extra: [] },
      POSReport: { create: false, read: false, update: false, delete: false, extra: [] },
    },
    Order: {
      Orders: { create: false, read: false, update: false, delete: false, extra: [] },
      POS: { create: false, read: false, update: false, delete: false, extra: [] },
    },
  };
