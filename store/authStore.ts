// store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, LoginResponse, LoginCredentials } from "../src/types/auth";
import baseUrl from "../src/lib/constant";
import { useCompanyStore } from "./companyStore";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
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

      logout: () => {
        // ✅ Clear auth store
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });

        // ✅ Clear all other Zustand storages
        localStorage.removeItem("auth-storage");
        localStorage.removeItem("company-storage");
        localStorage.removeItem("stockCategory-storage");
        localStorage.removeItem("stockgroup-storage");
        localStorage.removeItem("uom-storage");
        localStorage.removeItem("godown-storage");
        localStorage.removeItem("user-management-storage");
        localStorage.removeItem("vendor-storage");
        localStorage.removeItem("agent-storage");
        localStorage.removeItem("ledger-storage");
        localStorage.removeItem("customer-storage");
        localStorage.removeItem("product-storage");
        localStorage.removeItem("route-storage");
        localStorage.removeItem("order-storage");
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
      }),
    }
  )
);
