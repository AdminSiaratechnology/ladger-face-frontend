// import React, { useState } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { Login } from './components/pages/Login';
// import { AdminDashboard } from './components/pages/AdminDashboard';
// import UserManagement from './components/pages/UserManagement';
// import { InventoryManagement } from './components/pages/InventoryManagement';
// import  OrderManagement  from './components/pages/OrderManagement';
// import  Order  from './components/pages/OrderPage';
// import { PriceListManagement } from './components/pages/PriceListManagement';
// import { LocationTracking } from './components/pages/LocationTracking';
// import { Settings } from './components/pages/Settings';
// import { Sidebar } from './components/Sidebar';
// import { Header } from './components/pages/Header';
// import Company from './components/pages/Company';
// import { Toaster } from 'sonner';
// import "./index.css";
// import VendorRegistration from './components/pages/VendorRegistration';
// import CustomerRegistration from './components/pages/CustomerRegistration';
// import Agent from './components/pages/Agent';
// import Ladger from './components/pages/Ladger';
// import Product from './components/pages/Product';
// import Godown from './components/pages/Godown';
// import StockCategory from './components/pages/StockCategory';
// import StockGroup from './components/pages/StockGroup';
// import UOM from './components/pages/UOM';
// import PriceList from "./components/pages/PriceListPage";
// import { useAuthStore } from '../store/authStore';
// import { checkPermission } from './lib/utils';

import React, { useState, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";
import "./index.css";
import { useAuthStore } from "../store/authStore";
import { checkPermission } from "./lib/utils";
import ProductSelection from "./components/pages/ProductSelection";
import CheckoutPage from "./components/pages/CheckoutPage";
import AuditLogs from "./components/pages/AuditLogs";
import RestoreDeletedPage from "./components/pages/RestoreDeletedPage";
import { useCompanyStore } from "../store/companyStore";
import ProfilePage from "./components/pages/ProfilePage";

const Login = React.lazy(() => import("./components/pages/Login"));
const AdminDashboard = React.lazy(
  () => import("./components/pages/AdminDashboard")
);
const UserManagement = React.lazy(
  () => import("./components/pages/UserManagement")
);
const InventoryManagement = React.lazy(
  () => import("./components/pages/InventoryManagement")
);
const OrderManagement = React.lazy(
  () => import("./components/pages/OrderManagement")
);
const Order = React.lazy(() => import("./components/pages/OrderPage"));
const PriceListManagement = React.lazy(
  () => import("./components/pages/PriceListManagement")
);
const LocationTracking = React.lazy(
  () => import("./components/pages/LocationTracking")
);
const Settings = React.lazy(() => import("./components/pages/Settings"));
const Sidebar = React.lazy(() => import("./components/Sidebar"));
const Header = React.lazy(() => import("./components/pages/Header"));
const Company = React.lazy(() => import("./components/pages/Company"));
const VendorRegistration = React.lazy(
  () => import("./components/pages/VendorRegistration")
);
const CustomerRegistration = React.lazy(
  () => import("./components/pages/CustomerRegistration")
);
const Agent = React.lazy(() => import("./components/pages/Agent"));
const Ladger = React.lazy(() => import("./components/pages/Ladger"));
const Product = React.lazy(() => import("./components/pages/Product"));
const Godown = React.lazy(() => import("./components/pages/Godown"));
const StockCategory = React.lazy(
  () => import("./components/pages/StockCategory")
);
const StockGroup = React.lazy(() => import("./components/pages/StockGroup"));
const UOM = React.lazy(() => import("./components/pages/UOM"));
const PriceList = React.lazy(() => import("./components/pages/PriceListPage"));
const UserSelection = React.lazy(
  () => import("./components/pages/UserSelection")
);

// Unauthorized Access Component
function UnauthorizedAccess() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <div className="text-6xl text-red-500 mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-4">
          You are not authorized to access this page.
        </p>
        <p className="text-sm text-gray-500">
          Please contact your administrator if you believe this is an error.
        </p>
      </div>
    </div>
  );
}

function ProtectedRoute({
  children,
  module,
  subModule,
  allowedRoles,
}: {
  children: React.ReactNode;
  module?: string;
  subModule?: string;
  allowedRoles?: string[];
}) {
  const { user, isLoading } = useAuthStore();
  const { defaultSelected } = useCompanyStore();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If specific module and subModule are provided, check permissions
  if (module && subModule) {
    const permissionTypes = ["read", "create", "update", "delete"];

    const hasPermission = checkPermission({
      user,
      companyId: defaultSelected?._id,
      module,
      subModule,
      type: permissionTypes.join(" | "),
    });
    if (!hasPermission) {
      return <UnauthorizedAccess />;
    }
  }

  // Fallback to role-based access if no module/subModule specified
  // if (allowedRoles && !allowedRoles.includes((user.role).toLocaleUpperCase())) {
  //   console.log(user.role,allowedRoles)
  //   return <UnauthorizedAccess />;
  // }

  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-indigo-50">
      {/* <Suspense fallback={<div>Loading Sidebar...</div>}> */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* </Suspense> */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* <Suspense fallback={<div>Loading Header...</div>}> */}
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        {/* </Suspense> */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 px-3 py-0">
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen w-screen">
        <Toaster position="top-right" richColors />
        <Routes>
          <Route
            path="/login"
            element={
              // <Suspense fallback={<div>Loading...</div>}>
              <Login />
              // </Suspense>
            }
          />

          {/* Dashboard - accessible to all authenticated users */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={["admin", "agent", "salesman"]}>
                <AppLayout>
                  <AdminDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* User Management - admin only */}
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout>
                  <UserManagement />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
              <AppLayout>
                <ProfilePage />{" "}
              </AppLayout>
              </ProtectedRoute>
            }
          />
          {/* Company - admin only */}
          <Route
            path="/company"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout>
                  <Company />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Inventory Management */}
          <Route
            path="/inventory"
            element={
              <ProtectedRoute module="InventoryManagement" subModule="Godown">
                <AppLayout>
                  <InventoryManagement />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Order Management */}
          <Route
            path="/order-report"
            element={
              <ProtectedRoute module="Order" subModule="Orders">
                <AppLayout>
                  <OrderManagement />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          {/* Order Management */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute module="Order" subModule="Orders">
                <AppLayout>
                  <OrderManagement />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute module="Order" subModule="Orders">
                <AppLayout>
                  <CheckoutPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/select-user"
            element={
              <ProtectedRoute module="Order" subModule="Orders">
                <AppLayout>
                  <UserSelection />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/select-products"
            element={
              <ProtectedRoute module="Order" subModule="Orders">
                <AppLayout>
                  <ProductSelection />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          {/* Pricing */}
          <Route
            path="/pricing"
            element={
              <ProtectedRoute module="Pricing" subModule="PriceList">
                <AppLayout>
                  <PriceListManagement />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Location Tracking - admin only */}
          <Route
            path="/tracking"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout>
                  <LocationTracking />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Settings - admin only */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout>
                  <Settings />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Vendor Registration */}
          <Route
            path="/vendor-registration"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <VendorRegistration />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Customer Registration */}
          <Route
            path="/customer-registration"
            element={
              <ProtectedRoute
              >
                <AppLayout>
                  <CustomerRegistration />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Ledger Registration - admin only (no specific permission in your data) */}
          <Route
            path="/ladger-registration"
            element={
              <ProtectedRoute module="BusinessManagement" subModule="Ledger">
                <AppLayout>
                  <Ladger />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Product - admin only (no specific permission in your data) */}
          <Route
            path="/product"
            element={
              <ProtectedRoute module="InventoryManagement" subModule="Product">
                <AppLayout>
                  <Product />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Godown */}
          <Route
            path="/godown"
            element={
              <ProtectedRoute module="InventoryManagement" subModule="Godown">
                <AppLayout>
                  <Godown />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Stock Category - admin only (no specific permission in your data) */}
          <Route
            path="/stock-category"
            element={
              <ProtectedRoute module="InventoryManagement" subModule="StockCategory">
                <AppLayout>
                  <StockCategory />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Stock Group - admin only (no specific permission in your data) */}
          <Route
            path="/stock-group"
            element={
              <ProtectedRoute module="InventoryManagement" subModule="StockGroup">
                <AppLayout>
                  <StockGroup />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Price List */}
          <Route
            path="/price-list"
            element={
              <ProtectedRoute module="Pricing" subModule="PriceList">
                <AppLayout>
                  <PriceList />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* UOM - admin only (no specific permission in your data) */}
          <Route
            path="/UOM"
            element={
              <ProtectedRoute module="InventoryManagement" subModule="Unit">
                <AppLayout>
                  <UOM />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Agent - admin only (no specific permission in your data) */}
          <Route
            path="/agent"
            element={
              <ProtectedRoute module="BusinessManagement" subModule="Agent">
                <AppLayout>
                  <Agent />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/auditlog"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout>
                  <AuditLogs />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/restore"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout>
                  <RestoreDeletedPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
