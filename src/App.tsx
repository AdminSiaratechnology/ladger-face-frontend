import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";
import "./index.css";

import { useAuthStore } from "../store/authStore";
import { useCompanyStore } from "../store/companyStore";
import { checkPermission } from "./lib/utils";

// 🔹 Normal imports (no lazy loading)
import Login from "./components/pages/Login";
import AdminDashboard from "./components/pages/AdminDashboard";
import UserManagement from "./components/pages/UserManagement";
// import UserManagement from "./components/user-management/UserManagement";
import InventoryManagement from "./components/pages/InventoryManagement";
import OrderManagement from "./components/pages/OrderManagement";
import Order from "./components/pages/OrderPage";
import PriceListManagement from "./components/pages/PriceListManagement";
import LocationTracking from "./components/pages/LocationTracking";
import Settings from "./components/pages/Settings";
import Sidebar from "./components/Sidebar";
import Header from "./components/pages/Header";
import Company from "./components/pages/Company";
import VendorRegistration from "./components/pages/VendorRegistration";
import CustomerRegistration from "./components/pages/CustomerRegistration";
import Agent from "./components/pages/Agent";
import Ladger from "./components/pages/Ladger";
import Product from "./components/pages/Product";
import Godown from "./components/pages/Godown";
import StockCategory from "./components/pages/StockCategory";
import StockGroup from "./components/pages/StockGroup";
import UOM from "./components/pages/UOM";
import PriceList from "./components/pages/PriceListPage";
import UserSelection from "./components/pages/UserSelection";
import ProductSelection from "./components/pages/ProductSelection";
import CheckoutPage from "./components/pages/CheckoutPage";
import AuditLogs from "./components/pages/AuditLogs";
import RestoreDeletedPage from "./components/pages/RestoreDeletedPage";
import ProfilePage from "./components/pages/ProfilePage";
import CustomerGroupManagement from "./components/pages/CustomerGroupManagement";
import OrderReport from "./components/pages/OrderReportPage";
import PaymentReport from "./components/pages/PaymentReportPage";
import CustomerWiseReportPage from "./components/pages/CustomerWiseReportPage";
import ProductWiseReport from "./components/pages/ProductWiseReportPage";
import TemplateManagement from "./components/pages/TemplateManagement";
import POS from "./components/pages/POS"
import DemoExpired from "./components/pages/DemoExpired";


import Coupon from './components/pages/Coupon'
import PosReport from "./components/pages/PosReport";
import CreatePriceListPage from "./components/pages/CreatePriceListEditor";


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

// Protected Route
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

    if (user?.isDemo === true && user?.demoExpiry) {
    const today = new Date();
    const expiryDate = new Date(user.demoExpiry);

    if (expiryDate < today) {
      return <Navigate to="/demo-expired" replace />;
    }
  }
  if (module && subModule) {
    const permissionTypes = ["read", "create", "update", "delete"];
    const hasPermission = checkPermission({
      user,
      companyId: defaultSelected?._id,
      module,
      subModule,
      type: permissionTypes.join(" | "),
    });
    console.log(hasPermission);
    if (!hasPermission) {
      return <UnauthorizedAccess />;
    }
  }

  return <>{children}</>;
}

// App Layout
function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-indigo-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 px-3 py-0">
          {children}
        </main>
      </div>
    </div>
  );
}

// Main App
export default function App() {
  return (
    <Router>
      <div className="min-h-screen w-screen">
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Dashboard */}
          <Route
            path="/"
            element={
              <ProtectedRoute
                allowedRoles={["admin", "agent", "salesman", "client"]}
              >
                <AppLayout>
                  <AdminDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* User Management */}
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={["admin", "client"]}>
                <AppLayout>
                  <UserManagement />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ProfilePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Company */}
          <Route
            path="/company"
            element={
              <ProtectedRoute allowedRoles={["admin", "client"]}>
                <AppLayout>
                  <Company />
                </AppLayout>
              </ProtectedRoute>
            }
          />
             <Route
            path="/coupon"
            element={
              <ProtectedRoute allowedRoles={["admin", "client"]}>
                <AppLayout>
                  <Coupon />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Inventory */}
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

          {/* Orders */}
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
            path="/pos"
            element={
              <ProtectedRoute module="Order" subModule="Orders">
                <AppLayout>
                  <POS />
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
            path="/price-list"
            element={
              <ProtectedRoute module="InventoryManagement" subModule="Pricelist">
                <AppLayout>
                  <PriceListManagement />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
  path="/price-list/create"
  element={
    <ProtectedRoute module="InventoryManagement" subModule="Pricelist">
      <AppLayout>
        <CreatePriceListPage />
      </AppLayout>
    </ProtectedRoute>
  }
/>

          <Route
            path="/bill-template"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TemplateManagement />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          {/* Other Admin Routes */}
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
          <Route
            path="/customer-registration"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CustomerRegistration />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer-group-management"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CustomerGroupManagement />
                </AppLayout>
              </ProtectedRoute>
            }
          />
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
          <Route
            path="/stock-category"
            element={
              <ProtectedRoute
                module="InventoryManagement"
                subModule="StockCategory"
              >
                <AppLayout>
                  <StockCategory />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock-group"
            element={
              <ProtectedRoute
                module="InventoryManagement"
                subModule="StockGroup"
              >
                <AppLayout>
                  <StockGroup />
                </AppLayout>
              </ProtectedRoute>
            }
          />
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
            path="/order-report"
            element={
              <ProtectedRoute module="Report" subModule="orderReport">
                <AppLayout>
                  <OrderReport />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/product-report"
            element={
              <ProtectedRoute module="Report" subModule="productReport">
                <AppLayout>
                  <ProductWiseReport />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-report"
            element={
              <ProtectedRoute module="Report" subModule="paymentReport">
                <AppLayout>
                  <PaymentReport />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer-report"
            element={
              <ProtectedRoute module="Report" subModule="customerReport">
                <AppLayout>
                  <CustomerWiseReportPage />
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
          <Route path="/pos-report" element={
            <AppLayout> <PosReport /></AppLayout>
            } />

          <Route path="/demo-expired" element={<DemoExpired />} />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
