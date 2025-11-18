// store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, LoginResponse, LoginCredentials } from "../src/types/auth";
import baseUrl from "../src/lib/constant";
import api from "../src/api/api";
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
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });

        try {
          // Replace this with your actual API call
          const response = await fetch(`${baseUrl}auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
          });

          const data: LoginResponse = await response.json();

          if (response.ok) {
            set({
              user: data.data.user,
              token: data.data.token,
              isAuthenticated: true,
              isLoading: false,
            });
            localStorage.setItem("token", data.data.token);
          } else {
            throw new Error(data.message || "Login failed");
          }
          return data?.data?.user;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "An error occurred",
            isLoading: false,
          });
        }
      },

      logout: async () => {
        try {
          const id = useAuthStore.getState().user?._id!;
          await api.handleLogout(id);
          useCompanyStore.getState().resetCompanies();
          useStockCategory.getState().resetSrockCategories();
          useStockGroup.getState().resetStockGroup();
          useUOMStore.getState().resetUnits();
          useGodownStore.getState().resetGodown();
          useUserManagementStore.getState().resetUserManagement();

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
            newDeviceLogin: false,
          });
          window.location.href = "/login";

          localStorage.clear();
        } catch (error) {
          console.error("Logout failed:", error);
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
            newDeviceLogin: false,
          });
          useCompanyStore.getState().resetCompanies();
          useStockCategory.getState().resetSrockCategories();
          useStockGroup.getState().resetStockGroup();
          useUOMStore.getState().resetUnits();
          useGodownStore.getState().resetGodown();
          useUserManagementStore.getState().resetUserManagement();
          localStorage.clear();
          window.location.href = "/login";
        }
      },
      setNewDeviceLogin: (value: boolean) => {
        set({ newDeviceLogin: value });
      },

      updateUser: (user: User) => {
        set({ user });
      },
    }),

    {
      name: "auth-storage", // name for the localStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        newDeviceLogin: state.newDeviceLogin,
      }),
    }
  )
);
