import React, { useState,  createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/pages/Login';
import { AdminDashboard } from './components/pages/AdminDashboard';
import UserManagement  from './components/pages/UserManagement';
import { InventoryManagement } from './components/pages/InventoryManagement';
import { OrderManagement } from './components/pages/OrderManagement';
import { PriceListManagement } from './components/pages/PriceListManagement';
import { LocationTracking } from './components/pages/LocationTracking';
import { Settings } from './components/pages/Settings';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/pages/Header';
import Company from './components/pages/Company';
import { Toaster } from './components/ui/sonner';
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
import { useAuthStore } from '../store/authStore';
import PriceList from "./components/pages/PriceListPage"





export interface User {
  id: number;
  email: string;
  role: 'admin' | 'agent' | 'customer' | 'salesman';
  name: string;
  isActive?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function AuthProvider({ children }: { children: React.ReactNode }) {
    const { login, isLoading:loading ,user,logout} = useAuthStore()


  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  console.log("User Role:", user, "Allowed Roles:", allowedRoles);

  

  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);


 

  return (
    <div className="flex h-screen bg-indigo-50">
      <Sidebar isOpen={sidebarOpen} onClose={()=>setSidebarOpen(false)}/>
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
    <AuthProvider>
      <Router>
        <div className="min-h-screen w-screen">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute allowedRoles={['admin', 'agent', 'salesman']}>
                <AppLayout>
                  <AdminDashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout>
                  <UserManagement />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/company" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout>
                  <Company />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute allowedRoles={['admin', 'agent']}>
                <AppLayout>
                  <InventoryManagement />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute allowedRoles={['admin', 'agent', 'salesman']}>
                <AppLayout>
                  <OrderManagement />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/pricing" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout>
                  <PriceListManagement />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/tracking" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout>
                  <LocationTracking />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout>
                  <Settings />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/vendor-registration" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout>
                  <VendorRegistration />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/customer-registration" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout>
                  <CustomerRegistration />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/ladger-registration" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout>
                  <Ladger />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/product" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout>
                  <Product />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/godown" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout>
                  <Godown />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/stock-category" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout>
                  <StockCategory />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/stock-group" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout>
                  <StockGroup />
                </AppLayout>
              </ProtectedRoute>
            } />
             <Route path="/price-list" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout>
                  <PriceList />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/UOM" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout>
                  <UOM />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/agent" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout>
                  <Agent />
                </AppLayout>
              </ProtectedRoute>
            } />
            {/* Catch-all route for undefined paths */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}