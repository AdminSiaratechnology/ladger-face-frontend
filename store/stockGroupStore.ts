// Updated useStockGroup store with pagination support
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import api from "../src/api/api";
import { toast } from "sonner";

export interface StockGroup {
  _id: string;
  clientId?: string;
  companyId?: string;
  name: string;
  description: string;
  status: string;
  stockGroupId?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface StockGroupStore {
  stockGroups: StockGroup[];
  pagination: Pagination;
  loading: boolean;
  error: boolean;
  errormessage: null | string;
  counts: any;
  fetchStockGroup: (
    page?: number,
    limit?: number,
    companyId?: number | string
  ) => Promise<void>;
  addStockGroup: (stockGroupData: StockGroup) => Promise<void>;
  updateStockGroup: (
    stockGroupId: string,
    stockGrroupData: StockGroup
  ) => Promise<void>;
  deleteStockGroup: (stockGroupId: string) => Promise<void>;
  filterStockGroups: (
    searchTerm: string,
    statusFilter: "all" | "active" | "inactive",
    sortBy: "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc",
    companyId?: number | string,
    page?: number,
    limit?: number
  ) => Promise<StockGroup[]>;
  initialLoading: () => void;
  resetStockGroup: () => Promise<void>;
}

// zustand store with persistence

export const useStockGroup = create<StockGroupStore>()(
  persist(
    (set, get) => ({
      stockGroups: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
      loading: true,
      error: false,
      errormessage: null,
      counts: null,
      fetchStockGroup: async (page = 1, limit = 10, companyId) => {
        set({ loading: true });
        try {
          const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });
          const id = companyId?.toLocaleString();
          const result = await api.getStockGroup(
            { companyId: id },
            { queryParams: queryParams.toString() }
          ); // Adjust if needed
          if (result?.statusCode == 200) {
            set({
              loading: false,
              stockGroups: result.data.stockGroups,
              pagination: result.data.pagination,
              counts: result.data.counts,
            });
          }
        } catch (error) {
          set({ loading: false, error: true, errormessage: error.message });
        }
      },
      addStockGroup: async (stockGroupData) => {
        set({ loading: true });
        try {
          const result = await api.createSockGroup(stockGroupData);
          const newStockGroup: StockGroup = result.data;

          set({
            stockGroups: [...get().stockGroups, newStockGroup],
            loading: false,
            error: false,
          });
          toast.success("Stock Group added successfully");
        } catch (error) {
          set({ loading: false, error: true, errormessage: error.message });
          toast.error(error.message || "Failed to add Stock Group");
        }
      },
      updateStockGroup: async (stockGroupId, stockGroupData) => {

        set({ loading: true });
        try {
          const res = await api.updateStockGroup({
            stockGroupId: stockGroupId,
            stockGroupData: stockGroupData,
          });
          const updatedStockGroup: StockGroup = res.data;

          set({
            stockGroups: get().stockGroups.map((stock) =>
              stock._id === stockGroupId ? updatedStockGroup : stock
            ),
            loading: false,
            error: false,
          });
          toast.success("Stock Group updated successfully");
        } catch (error) {
          set({ loading: false, error: true, errormessage: error.message });
          toast.error(error.message || "Failed to update Stock Group");
        }
      },
      deleteStockGroup: async (stockGroupId: string) => {
        try {
          set({ loading: true, error: null });

          const res = await api.deleteStockGroup(stockGroupId);

          set({
            stockGroups: get().stockGroups.filter(
              (stock) => stock._id !== stockGroupId
            ),
            loading: false,
            error: false,
          });
          toast.success("Stock Group deleted successfully");
        } catch (error) {
          set({
            loading: false,
            error: true,
            errormessage:
              error.response?.data?.message || "Failed to delete stockGroup",
          });
          toast.error(
            error?.response?.data?.message || "Failed to delete stockGroup"
          );
        }
      },
      filterStockGroups: async (
        searchTerm: string,
        statusFilter: "all" | "active" | "inactive",
        sortBy: "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc",
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

          const res = await api.getStockGroup(
            { companyId },
            { queryParams: queryParams.toString() }
          ); // Adjust api call

          set({
            stockGroups: res.data.stockGroups,
            pagination: res?.data?.pagination,
            results: res?.data?.counts,
            loading: false,
            error: null,
          });

          return res.data.stockGroups;
        } catch (error: any) {
          set({
            loading: false,
            error: true,
            errormessage:
              error.response?.data?.message || "Failed to search stockGroups",
          });
          return [];
        }
      },
      initialLoading: () => set({ loading: true }),
      resetStockGroup: () => {
        set({
          stockGroups: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
          },
          counts: null,
          loading: false,
          error: false,
          errormessage: null,
        });
      },
    }),
    {
      name: "stockgroup-storage",
      // getStorage: () => localStorage,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        stockGroups: state.stockGroups,
        counts: state.counts,
      }),
    }
  )
);
