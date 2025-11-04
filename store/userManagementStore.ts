// Updated useUserManagementStore with pagination and filter support
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../src/api/api";
import { toast } from "sonner";

// Types
interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
interface CachedPageData {
  users: any[];
  pagination: Pagination;
}
interface useUserManagementStore {
  users: any[];
  usersByPage: Record<string, CachedPageData>;
  pagination: Pagination;
  loading: boolean;
  error: string | null | boolean;
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
      usersByPage: {},
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
      loading: true,
      error: null,

      fetchUsers: async (page = 1, limit = 10) => {
        set({ loading: true });
        try {
          console.log("Fetching users...");
          const cacheKey = `fetch-${page}-${limit}`;
          const cached = get().usersByPage[cacheKey];
          if (cached) {
            console.log("Using cached data for users page:", cacheKey);
            set({
              users: cached.users,
              pagination: cached.pagination,
              loading: false,
            });
            return;
          }
          const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });
          const response = await api.fetchUsers({
            queryParams: queryParams.toString(),
          }); // Adjust api call if needed
          set({
            usersByPage: { ...get().usersByPage, [cacheKey]: {
              users: response.data?.users || [],
              pagination: response.data?.pagination,
            }},
            users: response.data?.users || [],
            pagination: response.data?.pagination,
            loading: false,
          });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },

      addUser: async (user) => {
        try {
          set({ loading: true });
          const response = await api.createUser(user);
          console.log("User created response:", response);

          // Update persisted state with new user
          set((state) => ({
            users: [...state.users, response?.data],
            usersByPage: {},
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

          console.log(updatedUser, "updated user data");

          let hii = get().users.map((u) => {
            console.log(u._id, id, "u._id === id");
            return u._id === id ? updatedUser : "jj";
          });
          console.log(hii, "hiiiiiiii");

          set({
            users: get().users.map((u) => (u._id === id ? updatedUser : u)),
            usersByPage: {},
            loading: false,
          });
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
          console.log(response, "deleteresomnse");
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
        const cacheKey = `filter-${searchTerm}-${roleFilter}-${statusFilter}-${sortBy}-${page}-${limit}-${companyId}`;
        const cached = get().usersByPage[cacheKey];
        if (cached) {
          console.log("Using cached data for filterUsers:", cacheKey);
          set({
            users: cached.users,
            pagination: cached.pagination,
            loading: false,
          });
          return cached.users;
        }
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
            usersByPage: { ...get().usersByPage, [cacheKey]: {
              users: response.data?.users || [],
              pagination: response.data?.pagination,
            }},
            users: response.data?.users || [],
            pagination: response.data?.pagination,
            loading: false,
          });
          console.log(response.data.users, ".data?.data?.users");

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
