// store/authStore.ts_
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, LoginResponse, LoginCredentials } from "../src/types/auth";
import baseUrl from "../src/lib/constant";
import api from "../src/api/api";

// Import all stores that need reset on logout_
import { useCompanyStore } from "../store/companyStore";
import { useStockCategory } from "../store/stockCategoryStore";
import { useStockGroup } from "../store/stockgroupStore";
import { useUOMStore } from "../store/uomStore";
import { useGodownStore } from "../store/godownStore";
import { useUserManagementStore } from "../store/userManagementStore";

interface AuthState {
user: User | null;
token: string | null;
isAuthenticated: boolean;
isLoading: boolean;
error: string | null;
newDeviceLogin?: boolean;

setNewDeviceLogin: (value: boolean) => void;
login: (credentials: LoginCredentials) => Promise<User | undefined>;
logout: () => Promise<void>;
updateUser: (user: User) => void;
}


const performFullLogoutCleanup = () => {
useCompanyStore.getState().resetCompanies();
useStockCategory.getState().resetSrockCategories();
useStockGroup.getState().resetStockGroup();
useUOMStore.getState().resetUnits();
useGodownStore.getState().resetGodown();
useUserManagementStore.getState().resetUserManagement();


localStorage.clear();
sessionStorage.clear();

window.location.href = "/login";
};

export const useAuthStore = create<AuthState>()(
persist(
(set, get) => ({
user: null,
token: null,
isAuthenticated: false,
isLoading: false,
error: null,
newDeviceLogin: false,

login: async (credentials: LoginCredentials) => {
set({ isLoading: true, error: null });

try {
const response = await fetch(`${baseUrl}auth/login`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(credentials),
});

const data: LoginResponse = await response.json();

if (!response.ok) {
throw new Error(data.message || "Login failed");
}

const user = data.data.user;
const token = data.data.token;

set({
user,
token,
isAuthenticated: true,
isLoading: false,
error: null,
});

localStorage.setItem("token", token);
return user;
} catch (error: any) {
const message = error instanceof Error ? error.message : "Network error";
set({ error: message, isLoading: false });
console.error("Login error:", error);
return undefined;
}
},

logout: async () => {
const { user } = get();

try {
if (user?._id) {
await api.handleLogout(user._id);
}
} catch (error) {
console.error("Backend logout failed (continuing locally):", error);
}

performFullLogoutCleanup();

set({
user: null,
token: null,
isAuthenticated: false,
error: null,
newDeviceLogin: false,
});
},

setNewDeviceLogin: (value: boolean) => {
set({ newDeviceLogin: value });
},

updateUser: (user: User) => {
set({ user });
},
}),
{
name: "auth-storage",
partialize: (state) => ({
user: state.user,
token: state.token,
isAuthenticated: state.isAuthenticated,
newDeviceLogin: state.newDeviceLogin,
}),
}
)
);