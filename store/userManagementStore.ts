// Updated useUserManagementStore with pagination and filter support
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../src/api/api";
import { toast } from "sonner";
import { useAuthStore } from "./authStore";

// Types
interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface useUserManagementStore {
  users: any[];
  pagination: Pagination;
  loading: boolean;
  error: string | null | boolean;
  counts: any;
  fetchUsers: (
    page?: number,
    limit?: number,
    companyId?: number | string
  ) => Promise<void>;
  addUser: (user: any) => Promise<any>;
  editUser: (id: string, user: any) => Promise<any>;
  deleteUser: (id: string) => Promise<void>;
  filterUsers: (
    searchTerm: string,
    roleFilter: "all" | string,
    statusFilter: "all" | "active" | "inactive",
    sortBy: "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc",
    companyId?: number | string,
    page?: number,
    limit?: number
  ) => Promise<any[]>;
  initialLoading: () => void;
  resetUserManagement: () => Promise<void>;
}

// Zustand store with persist
export const useUserManagementStore = create<useUserManagementStore>()(
  persist(
    (set, get) => ({
      users: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
      loading: true,
      error: null,
      counts: null,

      fetchUsers: async (page = 1, limit = 10) => {
        set({ loading: true });
        try {
          const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });
          const response = await api.fetchUsers({
            queryParams: queryParams.toString(),
          }); // Adjust api call if needed
          set({
            users: response.data?.users || [],
            pagination: response.data?.pagination,
            loading: false,
            counts: response.data?.counts,
          });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },

      addUser: async (user) => {
        try {
          set({ loading: true });
          const response = await api.createUser(user);

          // Update persisted state with new user
          set((state) => ({
            users: [...state.users, response?.data],
            loading: false,
          }));

          return response;
        } catch (error: any) {
          console.error("Error creating user:", error);
          set({ loading: false });
          toast.error("User add failed");
          return error;
        }
      },
      editUser: async (id, userData) => {
        set({ loading: true });

        try {
          const response = await api.updateUser(id, userData);
          const updatedUser = response.data;

          let hii = get().users.map((u) => {
            return u._id === id ? updatedUser : "jj";
          });

          set({
            users: get().users.map((u) => (u._id === id ? updatedUser : u)),
            loading: false,
          });

          useAuthStore.getState().updateUserIfAuthUser(updatedUser);

          return response;

          // toast.success("User updated successfully");
        } catch (error: any) {
          set({ error: error.message, loading: false });
          toast.error("User update failed");
        }
      },

      deleteUser: async (id) => {
        set({ loading: true });
        try {
          const response = await api.deleteUserStatus(id);
        } catch (error: any) {
          set({ loading: false, error: error.message });
        }
      },

      filterUsers: async (
        searchTerm: string,
        roleFilter: "all" | string,
        statusFilter: "all" | "active" | "inactive",
        sortBy: "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc",
        page = 1,
        limit = 10,
        companyId: string
      ) => {
        set({ loading: true });
        try {
          const queryParams = new URLSearchParams({
            search: searchTerm,
            role: roleFilter !== "all" ? roleFilter : "",
            status: statusFilter !== "all" ? statusFilter : "",
            sortBy: sortBy.includes("name") ? "name" : "createdAt",
            sortOrder: sortBy.includes("Desc") ? "desc" : "asc",
            page: page.toString(),
            limit: limit.toString(),
            companyId: companyId?.toLocaleString(),
          });

          const response = await api.fetchUsers({
            queryParams: queryParams.toString(),
          }); // Adjust api call
          set({
            users: response.data?.users || [],
            pagination: response.data?.pagination,
            counts: response.data?.counts,
            loading: false,
          });

          return response.data?.users || [];
        } catch (error: any) {
          set({ error: error.message, loading: false });

          return [];
        }
      },
      initialLoading: () => set({ loading: true }),
      resetUserManagement: () => {
        set({
          users: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
          },
          counts: null,
          loading: false,
          error: null,
        });
      },
    }),
    {
      name: "user-management-storage", // unique key in localStorage
    }
  )
);
