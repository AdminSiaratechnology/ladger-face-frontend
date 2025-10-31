// Updated godownStore with pagination support
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../src/api/api"; // Assuming same api import

// Types
export interface Godown {
  _id: string;
  code: string;
  name: string;
  parent: string;
  address: string;
  state: string;
  city: string;
  country: string;
  isPrimary: boolean;
  status: "active" | "inactive" | "maintenance";
  capacity: string;
  manager: string;
  contactNumber: string;
  createdAt: string;
  company: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface GodownStore {
  godowns: Godown[];
  pagination: Pagination;
  loading: boolean;
  error: string | null;
  fetchGodowns: (
    page?: number,
    limit?: number,
    companyId?: number | string
  ) => Promise<void>;
  addGodown: (godownData: Godown) => Promise<void>;
  updateGodown: (godownId: string, godownData: Godown) => Promise<void>;
  deleteGodown: (godownId: string) => Promise<void>;
  filterGodowns: (
    searchTerm: string,
    statusFilter: "all" | "active" | "inactive" | "maintenance",
    sortBy: "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc",
    companyId?: number | string,
    page?: number,
    limit?: number
  ) => Promise<Godown[]>;
  initialLoading: () => void;
  resetGodown: () => Promise<void>
}

// Zustand store with persistence
export const useGodownStore = create<GodownStore>()(
  persist(
    (set, get) => ({
      godowns: [],
      loading: true,
      error: null,
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },

      fetchGodowns: async (page = 1, limit = 10, companyId) => {
        console.log("Fetching godowns page:", page, "limit:", limit);

        try {
          set({ loading: true, error: null });

          const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });
          const id = companyId?.toLocaleString();
          const res = await api.getGodowns(
            { companyId: id },
            {
              queryParams: queryParams.toString(),
            }
          );

          console.log("Fetched godowns response:", res?.data);

          set({
            godowns: res?.data?.records || [],
            pagination: res?.data?.pagination || {
              total: 0,
              page,
              limit,
              totalPages: 0,
            },
            loading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: error.response?.data?.message || "Failed to fetch godowns",
          });
        }
      },

      addGodown: async (godownData) => {
        console.log("Creating new godown:", godownData);
        try {
          set({ loading: true, error: null });

          const res = await api.addGodowns(godownData);
          console.log("Created godown response:", res);

          const newGodown: Godown = res.data;

          set({
            godowns: [...get().godowns, newGodown],
            loading: false,
            error: null,
          });
        } catch (error: any) {
          console.log("Error creating godown:", error);
          set({
            loading: false,
            error: error.response?.data?.message || "Failed to create godown",
          });
        }
      },

      updateGodown: async (godownId, godownData) => {
        console.log("Updating godown:", godownId, godownData);
        try {
          set({ loading: true, error: null });

          const res = await api.updateGodown({
            id: godownId,
            godown: godownData,
          });
          console.log("Updated godown response:", res);

          const updatedGodown: Godown = res.data;

          set({
            godowns: get().godowns.map((g) =>
              g._id === godownId ? updatedGodown : g
            ),
            loading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: error.response?.data?.message || "Failed to update godown",
          });
        }
      },

      deleteGodown: async (godownId) => {
        console.log("Deleting godown:", godownId);
        try {
          set({ loading: true, error: null });

          await api.deleteGodown(godownId);
          console.log("Deleted godown successfully");

          set({
            godowns: get().godowns.filter((g) => g._id !== godownId),
            loading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            loading: false,
            error: error.response?.data?.message || "Failed to delete godown",
          });
        }
      },

      filterGodowns: async (
        searchTerm,
        statusFilter,
        sortBy,
        page = 1,
        limit = 10,
        companyId
      ) => {
        try {
          set({ loading: true, error: null });

          const queryParams = new URLSearchParams({
            search: searchTerm,
            status: statusFilter !== "all" ? statusFilter : "",
            sortBy: sortBy.includes("name") ? "name" : "createdAt",
            sortOrder: sortBy.includes("Desc") ? "desc" : "asc",
            page: page.toString(),
            limit: limit.toString(),
          });

          const res = await api.getGodowns(
            { companyId },
            {
              queryParams: queryParams.toString(),
            }
          );

          console.log("Database search response for godowns:", res);

          set({
            godowns: res?.data?.records || [],
            pagination: res?.data?.pagination || {
              total: 0,
              page,
              limit,
              totalPages: 0,
            },
            loading: false,
            error: null,
          });

          return res?.data?.records || [];
        } catch (error: any) {
          set({
            loading: false,
            error: error.response?.data?.message || "Failed to search godowns",
          });
          return [];
        }
      },
      initialLoading: () => set({ loading: true }),
      resetGodown: () => {
        set({
          godowns: [],
          loading: false,
          error: null,
          pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
          },
        });
      },
    }),
    {
      name: "godown-storage",
      getStorage: () => localStorage,
      partialize: (state) => ({
        godowns: state.godowns,
      }),
    }
  )
);
