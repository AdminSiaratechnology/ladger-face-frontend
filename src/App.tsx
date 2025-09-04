import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { UserManagement } from './components/UserManagement';
import { InventoryManagement } from './components/InventoryManagement';
import { OrderManagement } from './components/OrderManagement';
import { PriceListManagement } from './components/PriceListManagement';
import { LocationTracking } from './components/LocationTracking';
import { Settings } from './components/Settings';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import Company from './components/Company';
import { Toaster } from './components/ui/sonner';
  import "./index.css";
import VendorRegistration from './components/VendorRegistration';
import CustomerRegistration from './components/CustomerRegistration';
import Agent from './components/Agent';
import Product from './components/Product';
import Godown from './components/Godown';
import StockCategory from './components/StockCategory';
import StockGroup from './components/StockGroup';
import UOM from './components/UOM';


// Mock user data
const mockUsers = {
  admin: { id: 1, email: 'admin@company.com', role: 'admin', name: 'John Admin' },
  agent: { id: 2, email: 'agent@company.com', role: 'agent', name: 'Jane Agent' },
  customer: { id: 3, email: 'customer@company.com', role: 'customer', name: 'Bob Customer' },
  salesman: { id: 4, email: 'salesman@company.com', role: 'salesman', name: 'Alice Salesman' }
};

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    // Mock authentication
    const foundUser = Object.values(mockUsers).find(u => u.email === email);
    
    if (foundUser && password === 'password123') {
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

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

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div className="flex items-center justify-center min-h-screen">Access Denied</div>;
  }

  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-indigo-50">
      <Sidebar isOpen={sidebarOpen} />
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
      {/* <Toaster /> */}
    </AuthProvider>
  );
}