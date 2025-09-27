import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/pages/Login';
import { AdminDashboard } from './components/pages/AdminDashboard';
import UserManagement from './components/pages/UserManagement';
import { InventoryManagement } from './components/pages/InventoryManagement';
import { OrderManagement } from './components/pages/OrderManagement';
import { PriceListManagement } from './components/pages/PriceListManagement';
import { LocationTracking } from './components/pages/LocationTracking';
import { Settings } from './components/pages/Settings';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/pages/Header';
import Company from './components/pages/Company';
import { Toaster } from 'sonner';
import "./index.css";
import VendorRegistration from './components/pages/VendorRegistration';
import CustomerRegistration from './components/pages/CustomerRegistration';
import Agent from './components/pages/Agent';
import Ladger from './components/pages/Ladger';
import Product from './components/pages/Product';
import Godown from './components/pages/Godown';
import StockCategory from './components/pages/StockCategory';
import StockGroup from './components/pages/StockGroup';
import UOM from './components/pages/UOM';
import PriceList from "./components/pages/PriceListPage";
import { useAuthStore } from '../store/authStore';
import { checkPermission } from './lib/utils';

// Utility function to check permissions
// function checkPermission(user, module, subModule) {
//   // If user has all permissions, allow access
//   if (user.allPermissions) {
//     return true;
//   }

//   // Check if user has access array and it's not empty
//   if (!user.access || user.access.length === 0) {
//     return false;
//   }

//   // Check permissions in the access array
//   for (const accessItem of user.access) {
//     const modules = accessItem.modules;
    
//     if (modules && modules[module] && modules[module][subModule]) {
//       return modules[module][subModule].read === true;
//     }
//   }

//   return false;
// }

// Unauthorized Access Component
function UnauthorizedAccess() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <div className="text-6xl text-red-500 mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-4">You are not authorized to access this page.</p>
        <p className="text-sm text-gray-500">Please contact your administrator if you believe this is an error.</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, module, subModule, allowedRoles }: { 
  children: React.ReactNode; 
  module?: string;
  subModule?: string;
  allowedRoles?: string[] 
}) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If specific module and subModule are provided, check permissions
  if (module && subModule) {
    const hasPermission = checkPermission({user, module, subModule,type:"read"});
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
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
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
          <Route path="/login" element={<Login />} />
          
          {/* Dashboard - accessible to all authenticated users */}
          <Route path="/" element={
            <ProtectedRoute allowedRoles={['admin', 'agent', 'salesman']}>
              <AppLayout>
                <AdminDashboard />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          {/* User Management - admin only */}
          <Route path="/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout>
                <UserManagement />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          {/* Company - admin only */}
          <Route path="/company" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout>
                <Company />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          {/* Inventory Management */}
          <Route path="/inventory" element={
            <ProtectedRoute module="InventoryManagement" subModule="Godown">
              <AppLayout>
                <InventoryManagement />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          {/* Order Management */}
          <Route path="/orders" element={
            <ProtectedRoute module="InventoryManagement" subModule="Order">
              <AppLayout>
                <OrderManagement />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          {/* Pricing */}
          <Route path="/pricing" element={
            <ProtectedRoute module="Pricing" subModule="PriceList">
              <AppLayout>
                <PriceListManagement />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          {/* Location Tracking - admin only */}
          <Route path="/tracking" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout>
                <LocationTracking />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          {/* Settings - admin only */}
          <Route path="/settings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout>
                <Settings />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          {/* Vendor Registration */}
          <Route path="/vendor-registration" element={
            <ProtectedRoute module="BusinessManagement" subModule="Vendor">
              <AppLayout>
                <VendorRegistration />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          {/* Customer Registration */}
          <Route path="/customer-registration" element={
            <ProtectedRoute module="BusinessManagement" subModule="CustomerRegistration">
              <AppLayout>
                <CustomerRegistration />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          {/* Ledger Registration - admin only (no specific permission in your data) */}
          <Route path="/ladger-registration" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout>
                <Ladger />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          {/* Product - admin only (no specific permission in your data) */}
          <Route path="/product" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout>
                <Product />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          {/* Godown */}
          <Route path="/godown" element={
            <ProtectedRoute module="InventoryManagement" subModule="Godown">
              <AppLayout>
                <Godown />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          {/* Stock Category - admin only (no specific permission in your data) */}
          <Route path="/stock-category" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout>
                <StockCategory />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          {/* Stock Group - admin only (no specific permission in your data) */}
          <Route path="/stock-group" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout>
                <StockGroup />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          {/* Price List */}
          <Route path="/price-list" element={
            <ProtectedRoute module="Pricing" subModule="PriceList">
              <AppLayout>
                <PriceList />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          {/* UOM - admin only (no specific permission in your data) */}
          <Route path="/UOM" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout>
                <UOM />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          {/* Agent - admin only (no specific permission in your data) */}
          <Route path="/agent" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout>
                <Agent />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}