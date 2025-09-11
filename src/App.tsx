import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/pages/Login';
import { AdminDashboard } from './components/pages/AdminDashboard';
import { UserManagement } from './components/pages/UserManagement';
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
import axios from 'axios';



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
    const { login, isLoading:loading ,user,logout} = useAuthStore()
  // const [user, setUser] = useState<User | null>(null);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   // Check for existing session
  //   const savedUser = localStorage.getItem('user');
  //   if (savedUser) {
  //     setUser(JSON.parse(savedUser));
  //   }
  //   setLoading(false);
  // }, []);

  // const login = async (email: string, password: string): Promise<boolean> => {
  //   setLoading(true);
    
  //   // Mock authentication
  //   const foundUser = Object.values(mockUsers).find(u => u.email === email);
    
  //   if (foundUser && password === 'password123') {
  //     setUser(foundUser);
  //     localStorage.setItem('user', JSON.stringify(foundUser));
  //     setLoading(false);
  //     return true;
  //   }
    
  //   setLoading(false);
  //   return false;
  // };

  // const logout = () => {
  //   setUser(null);
  //   localStorage.removeItem('user');
  // };

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

  // if (allowedRoles && !allowedRoles.includes(user.role)) {
  //   return <div className="flex items-center justify-center min-h-screen">Access Denied</div>;
  // }

  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGJmZDQyMWM2MjFlZTJkOGFiYTI3YjYiLCJleHAiOjE3NTgxMDE0MjN9.ooy5Ck7GcZuTkhBQWsFUyfxk2dUOAchaG-1Ghf0AYXc";

        const res = await axios.get("http://192.168.1.7:8000/account/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Profile data:", res.data);

        setProfile(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);

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